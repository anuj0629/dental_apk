import { supabase } from '../config/supabase.js';
import { analyzeDentalXray } from '../services/aiModel.service.js';
import { getResultDetails } from '../services/result.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HttpError } from '../utils/httpError.js';

export const createAnalysis = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new HttpError(400, 'X-ray image is required');
  }

  const { patient_id, patient_name, age, gender, problem_description, reporting_date } = req.body;

  if (!patient_name || !age || !gender || !reporting_date) {
    throw new HttpError(400, 'Patient name, age, gender, and reporting date are required');
  }

  let patient;

  if (patient_id) {
    let patientQuery = supabase.from('patients').select('*').eq('patient_id', patient_id);

    if (req.user.role !== 'admin') {
      patientQuery = patientQuery.eq('user_id', req.user.user_id);
    }

    const { data: existingPatient, error: existingPatientError } = await patientQuery.single();

    if (existingPatientError || !existingPatient) {
      throw new HttpError(404, 'Selected patient not found');
    }

    patient = existingPatient;
  } else {
    const { data: createdPatient, error: patientError } = await supabase
      .from('patients')
      .insert({
        user_id: req.user.user_id,
        patient_name,
        age: Number(age),
        gender,
        problem_description: '',
        reporting_date
      })
      .select('*')
      .single();

    if (patientError) {
      throw new HttpError(400, 'Unable to create patient record', patientError.message);
    }

    patient = createdPatient;
  }

  const imagePath = `/uploads/originals/${req.file.filename}`;
  const { data: upload, error: uploadError } = await supabase
    .from('uploads')
    .insert({
      patient_id: patient.patient_id,
      uploaded_by: req.user.user_id,
      image_path: imagePath,
      file_name: req.file.originalname
    })
    .select('*')
    .single();

  if (uploadError) {
    throw new HttpError(400, 'Unable to save upload record', uploadError.message);
  }

  const aiResult = await analyzeDentalXray({ file: req.file });

  await supabase.from('results').update({ is_latest: false }).eq('upload_id', upload.upload_id);

  const { data: result, error: resultError } = await supabase
    .from('results')
    .insert({
      upload_id: upload.upload_id,
      output_image_path: aiResult.output_image_path,
      total_caries: aiResult.total_caries,
      total_periapical: aiResult.total_periapical,
      overall_status: aiResult.overall_status,
      is_latest: true
    })
    .select('*')
    .single();

  if (resultError) {
    throw new HttpError(400, 'Unable to save result record', resultError.message);
  }

  const detectionsPayload = aiResult.detections.map((detection) => ({
    result_id: result.result_id,
    disease_type: detection.disease_type,
    count: detection.count
  }));

  const boxesPayload = aiResult.boundingBoxes.map((box) => ({
    result_id: result.result_id,
    ...box
  }));

  const [{ error: detectionError }, { error: boxError }] = await Promise.all([
    supabase.from('detections').insert(detectionsPayload),
    supabase.from('bounding_boxes').insert(boxesPayload)
  ]);

  if (detectionError || boxError) {
    throw new HttpError(400, 'Unable to save detection details', detectionError?.message || boxError?.message);
  }

  res.status(201).json(await getResultDetails(result.result_id, req.user));
});

export const getResult = asyncHandler(async (req, res) => {
  res.json(await getResultDetails(req.params.id, req.user));
});

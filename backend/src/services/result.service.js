import { supabase } from '../config/supabase.js';
import { HttpError, notFound } from '../utils/httpError.js';
import { loadFusionTuning } from './fusionConfig.service.js';

function unwrapSingle({ data, error }, message) {
  if (error) {
    throw new HttpError(500, message, error.message);
  }

  if (!data) {
    throw notFound(message);
  }

  return data;
}

export async function getResultDetails(resultId, currentUser) {
  const result = unwrapSingle(
    await supabase.from('results').select('*').eq('result_id', resultId).single(),
    'Result not found'
  );

  const upload = unwrapSingle(
    await supabase.from('uploads').select('*').eq('upload_id', result.upload_id).single(),
    'Upload not found'
  );

  if (currentUser.role !== 'admin' && upload.uploaded_by !== currentUser.user_id) {
    throw new HttpError(403, 'You do not have access to this result');
  }

  const patient = unwrapSingle(
    await supabase.from('patients').select('*').eq('patient_id', upload.patient_id).single(),
    'Patient not found'
  );

  const [{ data: detections, error: detectionsError }, { data: boundingBoxes, error: boxesError }] =
    await Promise.all([
      supabase.from('detections').select('*').eq('result_id', resultId).order('disease_type'),
      supabase.from('bounding_boxes').select('*').eq('result_id', resultId).order('confidence_score', { ascending: false })
    ]);

  if (detectionsError || boxesError) {
    throw new HttpError(500, 'Unable to load result details', detectionsError?.message || boxesError?.message);
  }

  const fusion_tuning = await loadFusionTuning();

  return {
    result,
    upload,
    patient,
    detections,
    bounding_boxes: boundingBoxes,
    fusion_tuning
  };
}

export async function buildHistoryRecords(currentUser, userId = null) {
  let uploadsQuery = supabase.from('uploads').select('*').order('upload_time', { ascending: false });

  if (currentUser.role !== 'admin') {
    uploadsQuery = uploadsQuery.eq('uploaded_by', currentUser.user_id);
  } else if (userId) {
    uploadsQuery = uploadsQuery.eq('uploaded_by', userId);
  }

  const { data: uploads, error } = await uploadsQuery;

  if (error) {
    throw new HttpError(500, 'Unable to load history records', error.message);
  }

  const records = await Promise.all(
    uploads.map(async (upload) => {
      const [{ data: patient }, { data: result }] = await Promise.all([
        supabase.from('patients').select('*').eq('patient_id', upload.patient_id).single(),
        supabase.from('results').select('*').eq('upload_id', upload.upload_id).eq('is_latest', true).maybeSingle()
      ]);

      return {
        upload_id: upload.upload_id,
        result_id: result?.result_id,
        patient_id: upload.patient_id,
        patient_name: patient?.patient_name || 'Unknown patient',
        upload_date: upload.upload_time,
        disease_counts: {
          caries: result?.total_caries || 0,
          periapical: result?.total_periapical || 0
        },
        status: result?.overall_status || 'Pending',
        image_path: upload.image_path
      };
    })
  );

  return records;
}

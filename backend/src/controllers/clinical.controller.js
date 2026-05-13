import { supabase } from '../config/supabase.js';
import { getResultDetails } from '../services/result.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HttpError } from '../utils/httpError.js';

export const getPatients = asyncHandler(async (req, res) => {
  let query = supabase.from('patients').select('*').order('created_at', { ascending: false });

  if (req.user.role !== 'admin') {
    query = query.eq('user_id', req.user.user_id);
  }

  const { data, error } = await query;

  if (error) {
    throw new HttpError(500, 'Unable to load patients', error.message);
  }

  res.json({ patients: data });
});

export const getPatientById = asyncHandler(async (req, res) => {
  let query = supabase.from('patients').select('*').eq('patient_id', req.params.id);

  if (req.user.role !== 'admin') {
    query = query.eq('user_id', req.user.user_id);
  }

  const { data, error } = await query.single();

  if (error || !data) {
    throw new HttpError(404, 'Patient not found');
  }

  res.json({ patient: data });
});

export const deletePatient = asyncHandler(async (req, res) => {
  let query = supabase.from('patients').select('*').eq('patient_id', req.params.id);

  if (req.user.role !== 'admin') {
    query = query.eq('user_id', req.user.user_id);
  }

  const { data: patient, error: patientError } = await query.single();

  if (patientError || !patient) {
    throw new HttpError(404, 'Patient not found');
  }

  const { error } = await supabase.from('patients').delete().eq('patient_id', patient.patient_id);

  if (error) {
    throw new HttpError(400, 'Unable to delete patient', error.message);
  }

  res.json({ message: 'Patient deleted successfully' });
});

export const getDetections = asyncHandler(async (req, res) => {
  let query = supabase.from('detections').select('*').order('disease_type');

  if (req.query.result_id) {
    await getResultDetails(req.query.result_id, req.user);
    query = query.eq('result_id', req.query.result_id);
  } else if (req.user.role !== 'admin') {
    throw new HttpError(403, 'A result_id is required for this resource');
  }

  const { data, error } = await query;

  if (error) {
    throw new HttpError(500, 'Unable to load detections', error.message);
  }

  res.json({ detections: data });
});

export const getBoundingBoxes = asyncHandler(async (req, res) => {
  let query = supabase.from('bounding_boxes').select('*').order('confidence_score', { ascending: false });

  if (req.query.result_id) {
    await getResultDetails(req.query.result_id, req.user);
    query = query.eq('result_id', req.query.result_id);
  } else if (req.user.role !== 'admin') {
    throw new HttpError(403, 'A result_id is required for this resource');
  }

  const { data, error } = await query;

  if (error) {
    throw new HttpError(500, 'Unable to load bounding boxes', error.message);
  }

  res.json({ bounding_boxes: data });
});

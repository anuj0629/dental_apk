import { buildHistoryRecords } from '../services/result.service.js';
import { supabase } from '../config/supabase.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HttpError } from '../utils/httpError.js';

export const getHistory = asyncHandler(async (req, res) => {
  res.json({ records: await buildHistoryRecords(req.user) });
});

export const deleteHistoryRecord = asyncHandler(async (req, res) => {
  let query = supabase.from('uploads').select('*').eq('upload_id', req.params.uploadId);

  if (req.user.role !== 'admin') {
    query = query.eq('uploaded_by', req.user.user_id);
  }

  const { data: upload, error: uploadError } = await query.single();

  if (uploadError || !upload) {
    throw new HttpError(404, 'Analysis record not found');
  }

  const { error } = await supabase.from('uploads').delete().eq('upload_id', upload.upload_id);

  if (error) {
    throw new HttpError(400, 'Unable to delete analysis record', error.message);
  }

  res.json({ message: 'Analysis record deleted successfully' });
});

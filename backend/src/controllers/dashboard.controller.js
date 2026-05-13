import { supabase } from '../config/supabase.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HttpError } from '../utils/httpError.js';

async function countRows(table, filter = null) {
  let query = supabase.from(table).select('*', { count: 'exact', head: true });

  if (filter) {
    query = query.eq(filter.column, filter.value);
  }

  const { count, error } = await query;

  if (error) {
    throw new HttpError(500, `Unable to count ${table}`, error.message);
  }

  return count || 0;
}

export const getAdminStats = asyncHandler(async (req, res) => {
  const [totalUsers, totalPatients, totalUploads, totalDetections] = await Promise.all([
    countRows('users'),
    countRows('patients'),
    countRows('uploads'),
    countRows('bounding_boxes')
  ]);

  res.json({ totalUsers, totalPatients, totalUploads, totalDetections });
});

export const getUserStats = asyncHandler(async (req, res) => {
  const [totalPatients, totalAnalyses] = await Promise.all([
    countRows('patients', { column: 'user_id', value: req.user.user_id }),
    countRows('uploads', { column: 'uploaded_by', value: req.user.user_id })
  ]);

  const { data: recentUploads, error } = await supabase
    .from('uploads')
    .select('*')
    .eq('uploaded_by', req.user.user_id)
    .order('upload_time', { ascending: false })
    .limit(5);

  if (error) {
    throw new HttpError(500, 'Unable to load recent uploads', error.message);
  }

  res.json({ totalPatients, totalAnalyses, recentUploads });
});

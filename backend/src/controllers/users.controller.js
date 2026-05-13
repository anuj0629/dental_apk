import { supabase } from '../config/supabase.js';
import { hashPassword } from '../services/password.service.js';
import { buildHistoryRecords } from '../services/result.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HttpError } from '../utils/httpError.js';

function safeUser(user) {
  const { password, ...rest } = user;
  return rest;
}

export const listUsers = asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('users')
    .select('user_id,name,email,role,created_at')
    .order('created_at', { ascending: false });

  if (error) {
    throw new HttpError(500, 'Unable to load users', error.message);
  }

  res.json({ users: data });
});

export const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !['admin', 'user'].includes(role)) {
    throw new HttpError(400, 'Name, email, password, and role are required');
  }

  const { data, error } = await supabase
    .from('users')
    .insert({
      name,
      email: email.toLowerCase(),
      password: await hashPassword(password),
      role
    })
    .select('*')
    .single();

  if (error) {
    throw new HttpError(400, 'Unable to create user', error.message);
  }

  res.status(201).json({ user: safeUser(data) });
});

export const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, email, role, password } = req.body;
  const updates = {};

  if (name) updates.name = name;
  if (email) updates.email = email.toLowerCase();
  if (role) {
    if (!['admin', 'user'].includes(role)) {
      throw new HttpError(400, 'Role must be admin or user');
    }
    updates.role = role;
  }
  if (password) updates.password = await hashPassword(password);

  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('user_id', id)
    .select('*')
    .single();

  if (error) {
    throw new HttpError(400, 'Unable to update user', error.message);
  }

  res.json({ user: safeUser(data) });
});

export const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (id === req.user.user_id) {
    throw new HttpError(400, 'Admins cannot delete their own account');
  }

  const { error } = await supabase.from('users').delete().eq('user_id', id);

  if (error) {
    throw new HttpError(400, 'Unable to delete user', error.message);
  }

  res.status(204).send();
});

export const getUserDetail = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { data: user, error } = await supabase
    .from('users')
    .select('user_id,name,email,role,created_at')
    .eq('user_id', id)
    .single();

  if (error || !user) {
    throw new HttpError(404, 'User not found');
  }

  const [{ count: totalUploads }, { count: totalPatients }, records] = await Promise.all([
    supabase.from('uploads').select('*', { count: 'exact', head: true }).eq('uploaded_by', id),
    supabase.from('patients').select('*', { count: 'exact', head: true }).eq('user_id', id),
    buildHistoryRecords(req.user, id)
  ]);

  res.json({
    user,
    totals: {
      uploads: totalUploads || 0,
      patients: totalPatients || 0
    },
    records
  });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { name, password } = req.body;
  const updates = {};

  if (name) updates.name = name;
  if (password) updates.password = await hashPassword(password);

  if (Object.keys(updates).length === 0) {
    throw new HttpError(400, 'Nothing to update');
  }

  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('user_id', req.user.user_id)
    .select('*')
    .single();

  if (error) {
    throw new HttpError(400, 'Unable to update profile', error.message);
  }

  res.json({ user: safeUser(data) });
});

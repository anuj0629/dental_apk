import { supabase } from '../config/supabase.js';
import { createToken } from '../services/token.service.js';
import { verifyPassword } from '../services/password.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HttpError } from '../utils/httpError.js';

export const login = asyncHandler(async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password || !['admin', 'user'].includes(role)) {
    throw new HttpError(400, 'Email, password, and role are required');
  }

  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email.toLowerCase())
    .eq('role', role)
    .single();

  if (error || !user) {
    throw new HttpError(401, 'Invalid email, password, or role');
  }

  const isValid = await verifyPassword(password, user.password);

  if (!isValid) {
    throw new HttpError(401, 'Invalid email, password, or role');
  }

  const safeUser = {
    user_id: user.user_id,
    name: user.name,
    email: user.email,
    role: user.role,
    created_at: user.created_at
  };

  res.json({
    token: createToken(safeUser),
    user: safeUser
  });
});

export const getMe = asyncHandler(async (req, res) => {
  const { data: user, error } = await supabase
    .from('users')
    .select('user_id,name,email,role,created_at')
    .eq('user_id', req.user.user_id)
    .single();

  if (error || !user) {
    throw new HttpError(404, 'User not found');
  }

  res.json({ user });
});

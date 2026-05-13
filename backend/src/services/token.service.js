import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export function createToken(user) {
  return jwt.sign(
    {
      user_id: user.user_id,
      email: user.email,
      name: user.name,
      role: user.role
    },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );
}

import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { HttpError } from '../utils/httpError.js';

export function requireAuth(req, res, next) {
  const header = req.headers.authorization;

  if (!header?.startsWith('Bearer ')) {
    return next(new HttpError(401, 'Authentication token is required'));
  }

  try {
    const token = header.slice('Bearer '.length);
    req.user = jwt.verify(token, env.jwtSecret);
    return next();
  } catch {
    return next(new HttpError(401, 'Invalid or expired authentication token'));
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new HttpError(403, 'You do not have permission to access this resource'));
    }

    return next();
  };
}

import { Router } from 'express';
import {
  createUser,
  deleteUser,
  getUserDetail,
  listUsers,
  updateProfile,
  updateUser
} from '../controllers/users.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

export const usersRouter = Router();

usersRouter.use(requireAuth);
usersRouter.patch('/profile', updateProfile);
usersRouter.use(requireRole('admin'));
usersRouter.get('/', listUsers);
usersRouter.post('/', createUser);
usersRouter.get('/:id', getUserDetail);
usersRouter.patch('/:id', updateUser);
usersRouter.delete('/:id', deleteUser);

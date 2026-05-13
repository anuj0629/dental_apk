import { Router } from 'express';
import { getAdminStats, getUserStats } from '../controllers/dashboard.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

export const dashboardRouter = Router();

dashboardRouter.get('/admin', requireAuth, requireRole('admin'), getAdminStats);
dashboardRouter.get('/user', requireAuth, requireRole('user', 'admin'), getUserStats);

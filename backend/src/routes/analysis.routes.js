import { Router } from 'express';
import { createAnalysis, getResult } from '../controllers/analysis.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { uploadImage } from '../middleware/upload.js';

export const analysisRouter = Router();

analysisRouter.use(requireAuth);
analysisRouter.post('/', requireRole('user', 'admin'), uploadImage.single('image'), createAnalysis);
analysisRouter.get('/results/:id', getResult);

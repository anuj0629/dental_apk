import { Router } from 'express';
import { deletePatient, getBoundingBoxes, getDetections, getPatientById, getPatients } from '../controllers/clinical.controller.js';
import { requireAuth } from '../middleware/auth.js';

export const clinicalRouter = Router();

clinicalRouter.use(requireAuth);
clinicalRouter.get('/patients', getPatients);
clinicalRouter.get('/patients/:id', getPatientById);
clinicalRouter.delete('/patients/:id', deletePatient);
clinicalRouter.get('/detections', getDetections);
clinicalRouter.get('/bounding-boxes', getBoundingBoxes);

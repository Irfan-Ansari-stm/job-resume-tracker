import { Router } from 'express';
import { analyticsController } from '../controllers/analytics.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/overview', analyticsController.getOverview);
router.get('/applications', analyticsController.getApplications);
router.get('/resumes', analyticsController.getResumes);
router.get('/conversion', analyticsController.getConversion);

export default router;

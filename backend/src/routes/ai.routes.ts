import { Router } from 'express';
import { aiController } from '../controllers/ai.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.post('/customize-resume', aiController.customizeResume);
router.post('/analyze-job', aiController.analyzeJob);
router.post('/interview-prep', aiController.interviewPrep);
router.get('/usage', aiController.getUsage);
router.get('/credits', aiController.getCredits);

export default router;

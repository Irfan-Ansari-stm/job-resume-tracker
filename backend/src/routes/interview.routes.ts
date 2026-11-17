import { Router } from 'express';
import { interviewController } from '../controllers/interview.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

router.get('/', interviewController.list);
router.post('/', interviewController.create);
router.get('/:id', interviewController.getById);
router.put('/:id', interviewController.update);
router.delete('/:id', interviewController.delete);

export default router;

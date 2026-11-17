import { Router } from 'express';
import { applicationController } from '../controllers/application.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', applicationController.list);
router.post('/', applicationController.create);
router.get('/:id', applicationController.getById);
router.put('/:id', applicationController.update);
router.delete('/:id', applicationController.delete);
router.post('/:id/status', applicationController.updateStatus);
router.post('/:id/submit-resume', applicationController.submitResume);
router.post('/:id/notes', applicationController.addNote);

export default router;

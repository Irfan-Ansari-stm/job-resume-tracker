import { Router } from 'express';
import { jobController } from '../controllers/job.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

router.get('/', jobController.list);
router.post('/', jobController.create);
router.get('/:id', jobController.getById);
router.put('/:id', jobController.update);
router.delete('/:id', jobController.delete);
router.post('/:id/convert', jobController.convertToApplication);
router.post('/:id/apply', jobController.convertToApplication);

export default router;

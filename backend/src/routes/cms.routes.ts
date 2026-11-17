import { Router } from 'express';
import { cmsController } from '../controllers/cms.controller.js';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/rbac.js';

const router = Router();

// Publicly readable CMS routes
router.get('/', cmsController.getAll);
router.get('/:key', cmsController.getSection);

// Admin writable CMS routes
router.put('/:key', authenticate, requireAdmin, cmsController.updateSection);

export default router;

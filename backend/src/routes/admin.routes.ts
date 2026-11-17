import { Router } from 'express';
import { adminController } from '../controllers/admin.controller.js';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin, requireSuperAdmin } from '../middleware/rbac.js';

const router = Router();

router.use(authenticate);
router.use(requireAdmin);

router.get('/dashboard', adminController.getDashboard);
router.get('/users', adminController.getUsers);
router.put('/users/:id/status', adminController.updateUserStatus);
router.put('/users/:id/role', requireSuperAdmin, adminController.updateUserRole);

router.get('/ai/logs', adminController.getAiLogs);
router.get('/ai/prompts', adminController.getAiPrompts);
router.put('/ai/prompts/:id', adminController.updateAiPrompt);

router.get('/settings', adminController.getSettings);
router.put('/settings/:key', adminController.updateSetting);

router.get('/templates', adminController.getTemplates);
router.put('/templates/:id', adminController.updateTemplate);

router.get('/audit-logs', adminController.getAuditLogs);

export default router;

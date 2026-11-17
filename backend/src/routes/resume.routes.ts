import { Router } from 'express';
import multer from 'multer';
import { resumeController } from '../controllers/resume.controller.js';
import { authenticate } from '../middleware/auth.js';

const upload = multer({
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

const router = Router();

router.use(authenticate);

router.get('/', resumeController.list);
router.post('/upload', upload.single('file'), resumeController.upload);
router.post('/', resumeController.create);
router.get('/versions/all', resumeController.getAllUserVersions);
router.get('/versions/compare', resumeController.compareVersions);
router.get('/:id', resumeController.getById);
router.get('/:id/file', resumeController.getOriginalFile);
router.get('/:id/download', resumeController.downloadOriginalFile);
router.put('/:id', resumeController.update);
router.delete('/:id', resumeController.delete);

// Resume versions
router.get('/:id/versions', resumeController.getVersions);
router.post('/:id/versions', resumeController.createVersion);
router.get('/:id/versions/:versionId', resumeController.getVersionById);
router.put('/:id/versions/:versionId', resumeController.updateVersion);
router.post('/:id/versions/:versionId/restore', resumeController.restoreVersion);

export default router;

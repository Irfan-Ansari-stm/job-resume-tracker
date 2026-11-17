import { Router } from 'express';
import multer from 'multer';
import { documentController } from '../controllers/document.controller.js';
import { authenticate } from '../middleware/auth.js';

const upload = multer({
  limits: { fileSize: 15 * 1024 * 1024 },
});

const router = Router();
router.use(authenticate);

router.get('/', documentController.list);
router.post('/upload', upload.single('file'), documentController.upload);
router.get('/:id/download', documentController.download);
router.get('/:id/file', documentController.getFile);
router.delete('/:id', documentController.delete);

export default router;

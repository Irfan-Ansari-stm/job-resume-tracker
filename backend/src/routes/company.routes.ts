import { Router } from 'express';
import { companyController } from '../controllers/company.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

router.get('/', companyController.list);
router.post('/', companyController.create);
router.get('/:id', companyController.getById);
router.put('/:id', companyController.update);
router.delete('/:id', companyController.delete);

export default router;

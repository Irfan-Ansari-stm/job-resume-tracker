import { Router } from 'express';
import { subscriptionController } from '../controllers/subscription.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/plans', subscriptionController.getPlans);
router.use(authenticate);
router.get('/current', subscriptionController.getCurrent);
router.post('/checkout', subscriptionController.checkout);
router.get('/payments', subscriptionController.getPayments);

export default router;

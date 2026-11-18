import { Router } from 'express';
import { supportController } from '../controllers/support.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/tickets', supportController.getTickets);
router.post('/tickets', supportController.createTicket);
router.get('/tickets/:id', supportController.getTicketById);

export default router;

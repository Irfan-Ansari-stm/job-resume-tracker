import { Router } from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import resumeRoutes from './resume.routes.js';
import aiRoutes from './ai.routes.js';
import applicationRoutes from './application.routes.js';
import companyRoutes from './company.routes.js';
import jobRoutes from './job.routes.js';
import interviewRoutes from './interview.routes.js';
import documentRoutes from './document.routes.js';
import subscriptionRoutes from './subscription.routes.js';
import notificationRoutes from './notification.routes.js';
import adminRoutes from './admin.routes.js';
import cmsRoutes from './cms.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/resumes', resumeRoutes);
router.use('/ai', aiRoutes);
router.use('/applications', applicationRoutes);
router.use('/companies', companyRoutes);
router.use('/jobs', jobRoutes);
router.use('/interviews', interviewRoutes);
router.use('/documents', documentRoutes);
router.use('/subscriptions', subscriptionRoutes);
router.use('/notifications', notificationRoutes);
router.use('/admin', adminRoutes);
router.use('/cms', cmsRoutes);

export default router;

import { Router } from 'express';
import { adminController } from '../controllers/admin.controller.js';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin, requireSuperAdmin } from '../middleware/rbac.js';

const router = Router();

// All admin routes require valid authentication and at least administrative privileges
router.use(authenticate);
router.use(requireAdmin);

// ==========================================
// 1. DASHBOARD & SYSTEM HEALTH
// ==========================================
router.get('/dashboard', adminController.getDashboard);
router.get('/health-telemetry', adminController.getSystemHealth);

// ==========================================
// 2. USER MANAGEMENT
// ==========================================
router.get('/users', adminController.getUsers);
router.post('/users', adminController.createUser);
router.get('/users/:id', adminController.getUserDetails);
router.put('/users/:id', adminController.updateUser);
router.put('/users/:id/status', adminController.updateUserStatus);
router.put('/users/:id/role', requireSuperAdmin, adminController.updateUserRole);
router.put('/users/:id/delete', requireSuperAdmin, adminController.deleteUser);
router.put('/users/:id/restore', requireSuperAdmin, adminController.restoreUser);
router.post('/users/:id/reset-credits', adminController.resetUserCredits);
router.post('/users/:id/revoke-sessions', adminController.revokeUserSessions);
router.post('/users/:id/subscription', adminController.updateUserSubscription);
router.post('/users/:id/cancel-subscription', adminController.cancelUserSubscription);

// ==========================================
// 3. ADMIN ASSISTED ACCESS ("ACT-AS-USER")
// ==========================================
router.post('/assisted-access/start', adminController.startAssistedAccess);
router.post('/assisted-access/end', adminController.endAssistedAccess);
router.get('/assisted-access/sessions', adminController.getAssistedSessions);

// ==========================================
// 4. RESUMES & TEMPLATES
// ==========================================
router.get('/resumes', adminController.getResumes);
router.post('/resumes', adminController.createResume);
router.get('/resumes/:id', adminController.getResume);
router.put('/resumes/:id', adminController.updateResume);
router.delete('/resumes/:id', adminController.deleteResume);
router.put('/resumes/:id/restore', adminController.restoreResume);

router.get('/templates', adminController.getTemplates);
router.put('/templates/:id', adminController.updateTemplate);

// ==========================================
// 5. JOB APPLICATIONS
// ==========================================
router.get('/applications', adminController.getApplications);
router.post('/applications', adminController.createApplication);
router.get('/applications/:id', adminController.getApplication);
router.put('/applications/:id', adminController.updateApplication);
router.delete('/applications/:id', adminController.deleteApplication);

// ==========================================
// 6. COMPANIES & JOBS
// ==========================================
router.get('/companies', adminController.getCompanies);
router.post('/companies', adminController.createCompany);
router.put('/companies/:id', adminController.updateCompany);
router.delete('/companies/:id', adminController.deleteCompany);

router.get('/jobs', adminController.getJobs);
router.post('/jobs', adminController.createJob);
router.put('/jobs/:id', adminController.updateJob);
router.delete('/jobs/:id', adminController.deleteJob);

// ==========================================
// 7. RESUME VERSION TRACKING
// ==========================================
router.get('/versions', adminController.getVersions);
router.delete('/versions/:id', adminController.deleteVersion);

// ==========================================
// 8. SUBSCRIPTIONS & BILLING
// ==========================================
router.get('/subscriptions', adminController.getSubscriptions);
router.get('/plans', adminController.getPlans);
router.post('/plans', requireSuperAdmin, adminController.createPlan);
router.put('/plans/:id', requireSuperAdmin, adminController.updatePlan);
router.get('/payments', adminController.getPayments);

// ==========================================
// 9. ROLES & PERMISSION MATRIX
// ==========================================
router.get('/roles', adminController.getRoles);
router.post('/roles', requireSuperAdmin, adminController.createRole);
router.put('/roles/:id', requireSuperAdmin, adminController.updateRole);
router.delete('/roles/:id', requireSuperAdmin, adminController.deleteRole);

router.get('/permissions', adminController.getPermissions);
router.get('/roles/:id/permissions', adminController.getRolePermissions);
router.post('/roles/:id/permissions', requireSuperAdmin, adminController.updateRolePermissions);

router.get('/staff', adminController.getStaff);

// ==========================================
// 10. COMMUNICATION & SUPPORT
// ==========================================
router.get('/announcements', adminController.getAnnouncements);
router.post('/announcements', adminController.createAnnouncement);
router.put('/announcements/:id', adminController.updateAnnouncement);
router.delete('/announcements/:id', adminController.deleteAnnouncement);

router.post('/notifications/broadcast', adminController.broadcastNotification);

router.get('/tickets', adminController.getSupportTickets);
router.put('/tickets/:id', adminController.respondToTicket);

// ==========================================
// 11. SECURITY & AUDIT
// ==========================================
router.get('/sessions', adminController.getSessions);
router.delete('/sessions/:id', adminController.revokeSession);

router.get('/ip-rules', adminController.getIpRules);
router.post('/ip-rules', requireSuperAdmin, adminController.createIpRule);
router.delete('/ip-rules/:id', requireSuperAdmin, adminController.deleteIpRule);

router.get('/audit-logs', adminController.getAuditLogs);

// ==========================================
// 12. REPORTS & EXPORTS
// ==========================================
router.get('/reports', adminController.getReports);
router.get('/reports/export', adminController.exportReport);

// ==========================================
// 13. AI LOGS & PROMPTS
// ==========================================
router.get('/ai/logs', adminController.getAiLogs);
router.get('/ai/prompts', adminController.getAiPrompts);
router.put('/ai/prompts/:id', adminController.updateAiPrompt);

// ==========================================
// 14. PLATFORM SETTINGS
// ==========================================
router.get('/settings', adminController.getSettings);
router.put('/settings/:key', requireSuperAdmin, adminController.updateSetting);

export default router;

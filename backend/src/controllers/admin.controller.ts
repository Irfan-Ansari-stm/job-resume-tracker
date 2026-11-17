import { Request, Response } from 'express';
import { adminRepository } from '../repositories/admin.repository.js';
import { storageService } from '../storage/storage.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

export class AdminController {
  // ==========================================
  // DASHBOARD & OVERVIEW
  // ==========================================
  async getDashboard(req: Request, res: Response) {
    try {
      const stats = await adminRepository.getDashboardStats();
      sendSuccess(res, stats, 'Dashboard statistics retrieved');
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }

  // ==========================================
  // USER MANAGEMENT
  // ==========================================
  async getUsers(req: Request, res: Response) {
    try {
      const { role, status, search, page, limit } = req.query;
      const pageNum = parseInt((page as string) || '1', 10);
      const limitNum = parseInt((limit as string) || '50', 10);
      const offset = (pageNum - 1) * limitNum;

      const result = await adminRepository.getAllUsers({
        role: role as string,
        status: status as string,
        search: search as string,
        limit: limitNum,
        offset,
      });

      sendSuccess(res, result.users, 'Users retrieved', 200, {
        total: result.total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(result.total / limitNum),
      });
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }

  async getUserDetails(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const userDetails = await adminRepository.getUserDetails(id);
      if (!userDetails) {
        sendError(res, 'User not found', 404);
        return;
      }
      sendSuccess(res, userDetails, 'User profile and details loaded');
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }

  async createUser(req: Request, res: Response) {
    try {
      const { email, password, firstName, lastName, phone, role, targetRole, location, isEmailVerified } = req.body;
      if (!email || !password || !firstName || !lastName) {
        sendError(res, 'Missing required user registration fields (email, password, firstName, lastName)', 400);
        return;
      }

      const user = await adminRepository.createUser({
        email,
        password,
        firstName,
        lastName,
        phone,
        role: role || 'user',
        targetRole,
        location,
        isEmailVerified: isEmailVerified ?? true,
      });

      await adminRepository.logAudit(
        req.user!.id,
        'CREATE_USER',
        'users',
        user.id,
        { email: user.email, role: user.role },
        req.ip
      );

      sendSuccess(res, user, 'User created successfully', 201);
    } catch (err: any) {
      if (err.code === '23505') {
        sendError(res, 'A user with this email address already exists', 409);
        return;
      }
      sendError(res, err.message, 500);
    }
  }

  async updateUser(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const { firstName, lastName, phone, role, isEmailVerified, targetRole, location, bio } = req.body;

      const user = await adminRepository.updateUser(id, {
        firstName,
        lastName,
        phone,
        role,
        isEmailVerified,
        targetRole,
        location,
        bio,
      });

      if (!user) {
        sendError(res, 'User not found', 404);
        return;
      }

      await adminRepository.logAudit(
        req.user!.id,
        'UPDATE_USER',
        'users',
        user.id,
        { email: user.email, changes: req.body },
        req.ip
      );

      sendSuccess(res, user, 'User details updated successfully');
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }

  async updateUserStatus(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const { isSuspended } = req.body;
      const user = await adminRepository.updateUserStatus(id, Boolean(isSuspended));
      if (!user) {
        sendError(res, 'User not found', 404);
        return;
      }

      await adminRepository.logAudit(
        req.user!.id,
        isSuspended ? 'SUSPEND_USER' : 'RESTORE_USER_ACCESS',
        'users',
        user.id,
        { email: user.email, isSuspended },
        req.ip
      );

      sendSuccess(res, user, `User account ${isSuspended ? 'suspended' : 'activated'}`);
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }

  async updateUserRole(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const { role } = req.body;
      const allowedRoles = ['super_admin', 'admin', 'support_admin', 'resume_manager', 'analyst', 'user'];
      if (!allowedRoles.includes(role)) {
        sendError(res, `Invalid role. Allowed roles: ${allowedRoles.join(', ')}`, 400);
        return;
      }

      const user = await adminRepository.updateUserRole(id, role);
      if (!user) {
        sendError(res, 'User not found', 404);
        return;
      }

      await adminRepository.logAudit(
        req.user!.id,
        'UPDATE_USER_ROLE',
        'users',
        user.id,
        { email: user.email, newRole: role },
        req.ip
      );

      sendSuccess(res, user, `User role changed to ${role}`);
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }

  async deleteUser(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const deleted = await adminRepository.softDeleteUser(id);
      if (!deleted) {
        sendError(res, 'User not found', 404);
        return;
      }

      await adminRepository.logAudit(
        req.user!.id,
        'SOFT_DELETE_USER',
        'users',
        id,
        { email: deleted.email },
        req.ip
      );

      sendSuccess(res, deleted, 'User moved to deleted accounts (safe soft-delete)');
    } catch (err: any) {
      sendError(res, err.message, 400);
    }
  }

  async restoreUser(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const restored = await adminRepository.restoreUser(id);
      if (!restored) {
        sendError(res, 'User not found', 404);
        return;
      }

      await adminRepository.logAudit(
        req.user!.id,
        'RESTORE_USER',
        'users',
        id,
        { email: restored.email },
        req.ip
      );

      sendSuccess(res, restored, 'User restored to active directory');
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }

  async resetUserCredits(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const { credits } = req.body;
      const creditNum = parseInt(credits || '50', 10);

      const updated = await adminRepository.resetUserCredits(id, creditNum);
      await adminRepository.logAudit(
        req.user!.id,
        'RESET_AI_CREDITS',
        'user_ai_credits',
        id,
        { newCredits: creditNum },
        req.ip
      );

      sendSuccess(res, updated, `AI credits reset to ${creditNum}`);
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }

  async revokeUserSessions(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const { sessionId } = req.body;
      await adminRepository.revokeUserSessions(id, sessionId);

      await adminRepository.logAudit(
        req.user!.id,
        'REVOKE_USER_SESSIONS',
        'user_sessions',
        id,
        { sessionId: sessionId || 'ALL' },
        req.ip
      );

      sendSuccess(res, null, sessionId ? 'Session terminated' : 'All user active sessions terminated');
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }

  // ==========================================
  // ADMIN ASSISTED USER ACCESS ("ACT-AS-USER")
  // ==========================================
  async startAssistedAccess(req: Request, res: Response) {
    try {
      const { targetUserId, reason } = req.body;
      if (!targetUserId || !reason) {
        sendError(res, 'Target user ID and a documented justification reason are required', 400);
        return;
      }

      const result = await adminRepository.startAssistedSession(
        req.user!.id,
        targetUserId,
        reason,
        req.ip
      );

      await adminRepository.logAudit(
        req.user!.id,
        'START_ASSISTED_ACCESS',
        'assisted_access_sessions',
        result.session.id,
        {
          targetUserId,
          targetEmail: result.targetUser.email,
          reason,
        },
        req.ip
      );

      sendSuccess(res, result, 'Assisted access session initialized. You may now enter the candidate workspace.');
    } catch (err: any) {
      sendError(res, err.message, 400);
    }
  }

  async endAssistedAccess(req: Request, res: Response) {
    try {
      const { sessionId } = req.body;
      if (!sessionId) {
        sendError(res, 'Session ID is required to end assisted access', 400);
        return;
      }

      const session = await adminRepository.endAssistedSession(sessionId);
      if (!session) {
        sendError(res, 'Assisted access session not found', 404);
        return;
      }

      await adminRepository.logAudit(
        req.user!.id,
        'END_ASSISTED_ACCESS',
        'assisted_access_sessions',
        session.id,
        { targetUserId: session.target_user_id },
        req.ip
      );

      sendSuccess(res, session, 'Assisted access session closed safely.');
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }

  async getAssistedSessions(req: Request, res: Response) {
    try {
      const { targetUserId } = req.query;
      const sessions = await adminRepository.getAssistedSessions({
        targetUserId: targetUserId as string,
      });
      sendSuccess(res, sessions, 'Assisted access sessions history retrieved');
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }

  // ==========================================
  // RESUME MANAGEMENT (ADMIN FULL CRUD)
  // ==========================================
  async getResumes(req: Request, res: Response) {
    try {
      const { search, category, userId, page, limit } = req.query;
      const pageNum = parseInt((page as string) || '1', 10);
      const limitNum = parseInt((limit as string) || '50', 10);
      const offset = (pageNum - 1) * limitNum;

      const result = await adminRepository.getAllResumes({
        search: search as string,
        category: category as string,
        userId: userId as string,
        limit: limitNum,
        offset,
      });

      sendSuccess(res, result.resumes, 'Resumes retrieved', 200, {
        total: result.total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(result.total / limitNum),
      });
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }

  async getResume(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const details = await adminRepository.getResumeById(id);
      if (!details) {
        sendError(res, 'Resume not found', 404);
        return;
      }
      sendSuccess(res, details, 'Resume details retrieved');
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }

  async getResumeFile(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const details = await adminRepository.getResumeById(id);
      if (!details || !details.resume?.original_file_path) {
        sendError(res, 'Original document file not found for this resume', 404);
        return;
      }

      const realPath = storageService.getFilePath(details.resume.original_file_path);
      const filename = details.resume.original_filename || `${details.resume.title || 'resume'}.pdf`;

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(filename)}"`);
      res.sendFile(realPath);
    } catch (err: any) {
      sendError(res, err.message || 'File not found', 404);
    }
  }

  async downloadResumeFile(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const details = await adminRepository.getResumeById(id);
      if (!details || !details.resume?.original_file_path) {
        sendError(res, 'Original document file not found for this resume', 404);
        return;
      }

      const realPath = storageService.getFilePath(details.resume.original_file_path);
      const filename = details.resume.original_filename || `${details.resume.title || 'resume'}.pdf`;

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
      res.sendFile(realPath);
    } catch (err: any) {
      sendError(res, err.message || 'File not found', 404);
    }
  }

  async createResume(req: Request, res: Response) {
    try {
      const { userId, title, summary, targetRole, category, parsedData, formattingSettings } = req.body;
      if (!userId || !title) {
        sendError(res, 'Target userId and resume title are required', 400);
        return;
      }

      const resume = await adminRepository.createResumeForUser({
        userId,
        title,
        summary,
        targetRole,
        category,
        parsedData,
        formattingSettings,
      });

      await adminRepository.logAudit(
        req.user!.id,
        'ADMIN_CREATE_RESUME',
        'resumes',
        resume.id,
        { userId, title },
        req.ip
      );

      sendSuccess(res, resume, 'Resume created on behalf of user', 201);
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }

  async updateResume(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const updated = await adminRepository.updateResume(id, req.body);
      if (!updated) {
        sendError(res, 'Resume not found', 404);
        return;
      }

      await adminRepository.logAudit(
        req.user!.id,
        'ADMIN_UPDATE_RESUME',
        'resumes',
        id,
        { changes: req.body },
        req.ip
      );

      sendSuccess(res, updated, 'Resume updated successfully');
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }

  async deleteResume(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const deleted = await adminRepository.softDeleteResume(id);
      if (!deleted) {
        sendError(res, 'Resume not found', 404);
        return;
      }

      await adminRepository.logAudit(
        req.user!.id,
        'ADMIN_DELETE_RESUME',
        'resumes',
        id,
        { title: deleted.title },
        req.ip
      );

      sendSuccess(res, deleted, 'Resume moved to trash');
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }

  async restoreResume(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const restored = await adminRepository.restoreResume(id);
      if (!restored) {
        sendError(res, 'Resume not found', 404);
        return;
      }

      await adminRepository.logAudit(
        req.user!.id,
        'ADMIN_RESTORE_RESUME',
        'resumes',
        id,
        { title: restored.title },
        req.ip
      );

      sendSuccess(res, restored, 'Resume restored');
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }

  // ==========================================
  // JOB APPLICATION MANAGEMENT (ADMIN FULL CRUD)
  // ==========================================
  async getApplications(req: Request, res: Response) {
    try {
      const { status, search, userId, page, limit } = req.query;
      const pageNum = parseInt((page as string) || '1', 10);
      const limitNum = parseInt((limit as string) || '50', 10);
      const offset = (pageNum - 1) * limitNum;

      const result = await adminRepository.getAllApplications({
        status: status as string,
        search: search as string,
        userId: userId as string,
        limit: limitNum,
        offset,
      });

      sendSuccess(res, result.applications, 'Applications retrieved', 200, {
        total: result.total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(result.total / limitNum),
      });
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }

  async getApplication(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const app = await adminRepository.getApplicationById(id);
      if (!app) {
        sendError(res, 'Application not found', 404);
        return;
      }
      sendSuccess(res, app, 'Application details retrieved');
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }

  async createApplication(req: Request, res: Response) {
    try {
      const { userId, companyName, jobTitle, jobUrl, location, salaryMin, salaryMax, status, appliedDate, notes } = req.body;
      if (!userId || !companyName || !jobTitle) {
        sendError(res, 'Target userId, companyName, and jobTitle are required', 400);
        return;
      }

      const application = await adminRepository.createApplicationForUser({
        userId,
        companyName,
        jobTitle,
        jobUrl,
        location,
        salaryMin,
        salaryMax,
        status,
        appliedDate,
        notes,
      });

      await adminRepository.logAudit(
        req.user!.id,
        'ADMIN_CREATE_APPLICATION',
        'job_applications',
        application.id,
        { userId, companyName, jobTitle },
        req.ip
      );

      sendSuccess(res, application, 'Application created successfully on behalf of candidate', 201);
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }

  async updateApplication(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const updated = await adminRepository.updateApplication(id, req.body);
      if (!updated) {
        sendError(res, 'Application not found', 404);
        return;
      }

      await adminRepository.logAudit(
        req.user!.id,
        'ADMIN_UPDATE_APPLICATION',
        'job_applications',
        id,
        { changes: req.body },
        req.ip
      );

      sendSuccess(res, updated, 'Application updated successfully');
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }

  async deleteApplication(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const deleted = await adminRepository.softDeleteApplication(id);
      if (!deleted) {
        sendError(res, 'Application not found', 404);
        return;
      }

      await adminRepository.logAudit(
        req.user!.id,
        'ADMIN_DELETE_APPLICATION',
        'job_applications',
        id,
        {},
        req.ip
      );

      sendSuccess(res, deleted, 'Application archived/deleted');
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }

  // ==========================================
  // COMPANIES & JOBS (ADMIN FULL CRUD)
  // ==========================================
  async getCompanies(req: Request, res: Response) {
    try {
      const { search, page, limit } = req.query;
      const pageNum = parseInt((page as string) || '1', 10);
      const limitNum = parseInt((limit as string) || '50', 10);
      const offset = (pageNum - 1) * limitNum;

      const result = await adminRepository.getAllCompanies({
        search: search as string,
        limit: limitNum,
        offset,
      });

      sendSuccess(res, result.companies, 'Companies retrieved', 200, {
        total: result.total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(result.total / limitNum),
      });
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }

  async createCompany(req: Request, res: Response) {
    try {
      const { name, website, industry, location, description } = req.body;
      if (!name) {
        sendError(res, 'Company name is required', 400);
        return;
      }

      const comp = await adminRepository.createCompany({
        userId: req.user!.id,
        name,
        website,
        industry,
        location,
        description,
      });

      await adminRepository.logAudit(req.user!.id, 'CREATE_COMPANY', 'companies', comp.id, { name }, req.ip);
      sendSuccess(res, comp, 'Company added', 201);
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }

  async updateCompany(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const updated = await adminRepository.updateCompany(id, req.body);
      if (!updated) {
        sendError(res, 'Company not found', 404);
        return;
      }

      await adminRepository.logAudit(req.user!.id, 'UPDATE_COMPANY', 'companies', id, req.body, req.ip);
      sendSuccess(res, updated, 'Company updated');
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }

  async deleteCompany(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const deleted = await adminRepository.deleteCompany(id);
      if (!deleted) {
        sendError(res, 'Company not found', 404);
        return;
      }

      await adminRepository.logAudit(req.user!.id, 'DELETE_COMPANY', 'companies', id, {}, req.ip);
      sendSuccess(res, deleted, 'Company removed');
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }

  async getJobs(req: Request, res: Response) {
    try {
      const { search, page, limit } = req.query;
      const pageNum = parseInt((page as string) || '1', 10);
      const limitNum = parseInt((limit as string) || '50', 10);
      const offset = (pageNum - 1) * limitNum;

      const result = await adminRepository.getAllJobs({
        search: search as string,
        limit: limitNum,
        offset,
      });

      sendSuccess(res, result.jobs, 'Jobs retrieved', 200, {
        total: result.total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(result.total / limitNum),
      });
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }

  async createJob(req: Request, res: Response) {
    try {
      const { companyId, title, jobUrl, url, location, employmentType, salaryMin, salaryMax, description, requirements } = req.body;
      if (!title) {
        sendError(res, 'Job title is required', 400);
        return;
      }

      const job = await adminRepository.createJob({
        userId: req.user!.id,
        companyId,
        title,
        jobUrl: jobUrl || url,
        location,
        employmentType,
        salaryMin,
        salaryMax,
        description,
        requirements,
      });

      await adminRepository.logAudit(req.user!.id, 'CREATE_JOB', 'jobs', job.id, { title }, req.ip);
      sendSuccess(res, job, 'Job position created', 201);
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }

  async updateJob(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const updated = await adminRepository.updateJob(id, req.body);
      if (!updated) {
        sendError(res, 'Job not found', 404);
        return;
      }

      await adminRepository.logAudit(req.user!.id, 'UPDATE_JOB', 'jobs', id, req.body, req.ip);
      sendSuccess(res, updated, 'Job updated');
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }

  async deleteJob(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const deleted = await adminRepository.deleteJob(id);
      if (!deleted) {
        sendError(res, 'Job not found', 404);
        return;
      }

      await adminRepository.logAudit(req.user!.id, 'DELETE_JOB', 'jobs', id, {}, req.ip);
      sendSuccess(res, deleted, 'Job position removed');
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }

  // ==========================================
  // RESUME VERSION TRACKING
  // ==========================================
  async getVersions(req: Request, res: Response) {
    try {
      const { search, status, page, limit } = req.query;
      const pageNum = parseInt((page as string) || '1', 10);
      const limitNum = parseInt((limit as string) || '50', 10);
      const offset = (pageNum - 1) * limitNum;

      const result = await adminRepository.getAllVersions({
        search: search as string,
        status: status as string,
        limit: limitNum,
        offset,
      });

      sendSuccess(res, result.versions, 'Resume versions retrieved', 200, {
        total: result.total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(result.total / limitNum),
      });
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }

  async deleteVersion(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const deleted = await adminRepository.deleteVersion(id);
      if (!deleted) {
        sendError(res, 'Version not found', 404);
        return;
      }

      await adminRepository.logAudit(req.user!.id, 'DELETE_RESUME_VERSION', 'resume_versions', id, {}, req.ip);
      sendSuccess(res, deleted, 'Resume version removed');
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }

  // ==========================================
  // SUBSCRIPTION & BILLING
  // ==========================================
  async getSubscriptions(req: Request, res: Response) {
    try {
      const { status, planId, page, limit } = req.query;
      const pageNum = parseInt((page as string) || '1', 10);
      const limitNum = parseInt((limit as string) || '50', 10);
      const offset = (pageNum - 1) * limitNum;

      const result = await adminRepository.getAllSubscriptions({
        status: status as string,
        planId: planId as string,
        limit: limitNum,
        offset,
      });

      sendSuccess(res, result.subscriptions, 'Subscriptions retrieved', 200, {
        total: result.total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(result.total / limitNum),
      });
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }

  async getPlans(req: Request, res: Response) {
    try {
      const plans = await adminRepository.getAllPlans();
      sendSuccess(res, plans, 'Plans retrieved');
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }

  async createPlan(req: Request, res: Response) {
    try {
      const { name, slug, description, priceMonthly, priceYearly, features, limits, isActive } = req.body;
      if (!name || !slug) {
        sendError(res, 'Plan name and unique slug are required', 400);
        return;
      }

      const plan = await adminRepository.createPlan({
        name,
        slug,
        description: description || '',
        priceMonthly: parseFloat(priceMonthly || '0'),
        priceYearly: parseFloat(priceYearly || '0'),
        features: features || [],
        limits: limits || {},
        isActive,
      });

      await adminRepository.logAudit(req.user!.id, 'CREATE_PLAN', 'subscription_plans', plan.id, { name, slug }, req.ip);
      sendSuccess(res, plan, 'Subscription plan created', 201);
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }

  async updatePlan(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const updated = await adminRepository.updatePlan(id, req.body);
      if (!updated) {
        sendError(res, 'Plan not found', 404);
        return;
      }

      await adminRepository.logAudit(req.user!.id, 'UPDATE_PLAN', 'subscription_plans', id, req.body, req.ip);
      sendSuccess(res, updated, 'Subscription plan updated');
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }

  async updateUserSubscription(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const { planId, status } = req.body;
      if (!planId) {
        sendError(res, 'Plan ID is required', 400);
        return;
      }

      const sub = await adminRepository.updateUserSubscription(id, planId, status || 'active');
      await adminRepository.logAudit(
        req.user!.id,
        'ADMIN_CHANGE_USER_PLAN',
        'user_subscriptions',
        sub.id,
        { userId: id, planId },
        req.ip
      );

      sendSuccess(res, sub, 'User subscription modified');
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }

  async cancelUserSubscription(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const sub = await adminRepository.cancelUserSubscription(id);
      await adminRepository.logAudit(
        req.user!.id,
        'ADMIN_CANCEL_USER_PLAN',
        'user_subscriptions',
        id,
        {},
        req.ip
      );
      sendSuccess(res, sub, 'User subscription cancelled');
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }

  async getPayments(req: Request, res: Response) {
    try {
      const { status, page, limit } = req.query;
      const pageNum = parseInt((page as string) || '1', 10);
      const limitNum = parseInt((limit as string) || '50', 10);
      const offset = (pageNum - 1) * limitNum;

      const result = await adminRepository.getAllPayments({
        status: status as string,
        limit: limitNum,
        offset,
      });

      sendSuccess(res, result.payments, 'Payments retrieved', 200, {
        total: result.total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(result.total / limitNum),
      });
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }

  // ==========================================
  // ROLES & RBAC
  // ==========================================
  async getRoles(req: Request, res: Response) {
    try {
      const roles = await adminRepository.getAllRoles();
      sendSuccess(res, roles, 'Roles retrieved');
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }

  async createRole(req: Request, res: Response) {
    try {
      const { name, displayName, description } = req.body;
      if (!name || !displayName) {
        sendError(res, 'Role code name and display name are required', 400);
        return;
      }

      const role = await adminRepository.createRole({ name, displayName, description: description || '' });
      await adminRepository.logAudit(req.user!.id, 'CREATE_ROLE', 'roles', role.id, { name }, req.ip);
      sendSuccess(res, role, 'Role created', 201);
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }

  async updateRole(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const updated = await adminRepository.updateRole(id, req.body);
      if (!updated) {
        sendError(res, 'Role not found', 404);
        return;
      }

      await adminRepository.logAudit(req.user!.id, 'UPDATE_ROLE', 'roles', id, req.body, req.ip);
      sendSuccess(res, updated, 'Role updated');
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }

  async deleteRole(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const deleted = await adminRepository.deleteRole(id);
      if (!deleted) {
        sendError(res, 'Role not found', 404);
        return;
      }

      await adminRepository.logAudit(req.user!.id, 'DELETE_ROLE', 'roles', id, {}, req.ip);
      sendSuccess(res, deleted, 'Role removed');
    } catch (err: any) {
      sendError(res, err.message, 400);
    }
  }

  async getPermissions(req: Request, res: Response) {
    try {
      const permissions = await adminRepository.getAllPermissions();
      sendSuccess(res, permissions, 'Permissions retrieved');
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }

  async getRolePermissions(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const permissions = await adminRepository.getRolePermissions(id);
      sendSuccess(res, permissions, 'Role permissions retrieved');
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }

  async updateRolePermissions(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const { permissionIds } = req.body;
      if (!Array.isArray(permissionIds)) {
        sendError(res, 'permissionIds array is required', 400);
        return;
      }

      const updated = await adminRepository.updateRolePermissions(id, permissionIds);
      await adminRepository.logAudit(
        req.user!.id,
        'UPDATE_ROLE_PERMISSIONS',
        'role_permissions',
        id,
        { permissionCount: permissionIds.length },
        req.ip
      );

      sendSuccess(res, updated, 'Role permissions matrix updated');
    } catch (err: any) {
      sendError(res, err.message, 400);
    }
  }

  async getStaff(req: Request, res: Response) {
    try {
      const staff = await adminRepository.getAdminStaff();
      sendSuccess(res, staff, 'Administrative staff retrieved');
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }

  // ==========================================
  // COMMUNICATION & SUPPORT
  // ==========================================
  async getAnnouncements(req: Request, res: Response) {
    try {
      const list = await adminRepository.getAllAnnouncements();
      sendSuccess(res, list, 'System announcements retrieved');
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }

  async createAnnouncement(req: Request, res: Response) {
    try {
      const { title, message, priority, targetAudience, expiresAt } = req.body;
      if (!title || !message) {
        sendError(res, 'Title and message are required', 400);
        return;
      }

      const announcement = await adminRepository.createAnnouncement({
        title,
        message,
        priority,
        targetAudience,
        createdBy: req.user!.id,
        expiresAt,
      });

      await adminRepository.logAudit(
        req.user!.id,
        'CREATE_SYSTEM_ANNOUNCEMENT',
        'system_announcements',
        announcement.id,
        { title },
        req.ip
      );

      sendSuccess(res, announcement, 'Announcement published', 201);
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }

  async updateAnnouncement(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const updated = await adminRepository.updateAnnouncement(id, req.body);
      if (!updated) {
        sendError(res, 'Announcement not found', 404);
        return;
      }

      sendSuccess(res, updated, 'Announcement updated');
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }

  async deleteAnnouncement(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const deleted = await adminRepository.deleteAnnouncement(id);
      if (!deleted) {
        sendError(res, 'Announcement not found', 404);
        return;
      }

      sendSuccess(res, deleted, 'Announcement deleted');
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }

  async broadcastNotification(req: Request, res: Response) {
    try {
      const { title, message, type, link, targetAudience } = req.body;
      if (!title || !message) {
        sendError(res, 'Title and message are required', 400);
        return;
      }

      const result = await adminRepository.broadcastNotification({
        title,
        message,
        type,
        link,
        targetAudience,
      });

      await adminRepository.logAudit(
        req.user!.id,
        'BROADCAST_NOTIFICATION',
        'notifications',
        undefined,
        { title, deliveredCount: result.deliveredCount },
        req.ip
      );

      sendSuccess(res, result, `Notification successfully delivered to ${result.deliveredCount} candidate accounts`);
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }

  async getSupportTickets(req: Request, res: Response) {
    try {
      const { status, priority, page, limit } = req.query;
      const pageNum = parseInt((page as string) || '1', 10);
      const limitNum = parseInt((limit as string) || '50', 10);
      const offset = (pageNum - 1) * limitNum;

      const result = await adminRepository.getAllSupportTickets({
        status: status as string,
        priority: priority as string,
        limit: limitNum,
        offset,
      });

      sendSuccess(res, result.tickets, 'Support tickets retrieved', 200, {
        total: result.total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(result.total / limitNum),
      });
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }

  async respondToTicket(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const { adminResponse, status } = req.body;
      if (!adminResponse) {
        sendError(res, 'Response content is required', 400);
        return;
      }

      const ticket = await adminRepository.respondToTicket(id, adminResponse, status || 'resolved');
      if (!ticket) {
        sendError(res, 'Ticket not found', 404);
        return;
      }

      await adminRepository.logAudit(
        req.user!.id,
        'RESPOND_SUPPORT_TICKET',
        'support_tickets',
        id,
        { status: ticket.status },
        req.ip
      );

      sendSuccess(res, ticket, 'Ticket updated and candidate notified');
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }

  // ==========================================
  // SECURITY & AUDIT
  // ==========================================
  async getSessions(req: Request, res: Response) {
    try {
      const sessions = await adminRepository.getAllSessions();
      sendSuccess(res, sessions, 'Active sessions retrieved');
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }

  async revokeSession(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const revoked = await adminRepository.revokeSession(id);
      if (!revoked) {
        sendError(res, 'Session not found', 404);
        return;
      }

      await adminRepository.logAudit(req.user!.id, 'REVOKE_SESSION', 'user_sessions', id, {}, req.ip);
      sendSuccess(res, revoked, 'Session revoked');
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }

  async getIpRules(req: Request, res: Response) {
    try {
      const rules = await adminRepository.getAllIpRules();
      sendSuccess(res, rules, 'IP access rules retrieved');
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }

  async createIpRule(req: Request, res: Response) {
    try {
      const { ipAddress, ruleType, description } = req.body;
      if (!ipAddress || !ruleType) {
        sendError(res, 'IP address and ruleType (allow/block) are required', 400);
        return;
      }

      const rule = await adminRepository.createIpRule({
        ipAddress,
        ruleType,
        description,
        createdBy: req.user!.id,
      });

      await adminRepository.logAudit(req.user!.id, 'CREATE_IP_RULE', 'ip_access_rules', rule.id, { ipAddress, ruleType }, req.ip);
      sendSuccess(res, rule, 'IP access rule saved', 201);
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }

  async deleteIpRule(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const deleted = await adminRepository.deleteIpRule(id);
      if (!deleted) {
        sendError(res, 'IP rule not found', 404);
        return;
      }

      await adminRepository.logAudit(req.user!.id, 'DELETE_IP_RULE', 'ip_access_rules', id, {}, req.ip);
      sendSuccess(res, deleted, 'IP rule deleted');
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }

  // ==========================================
  // REPORTS & EXPORTS
  // ==========================================
  async getReports(req: Request, res: Response) {
    try {
      const [growth, resumes, ai, funnel, revenue] = await Promise.all([
        adminRepository.getUserGrowthReport(),
        adminRepository.getResumeStatsReport(),
        adminRepository.getAiPerformanceReport(),
        adminRepository.getApplicationFunnelReport(),
        adminRepository.getRevenueReport(),
      ]);

      sendSuccess(res, {
        userGrowth: growth,
        resumeStats: resumes,
        aiPerformance: ai,
        applicationFunnel: funnel,
        revenueTrend: revenue,
      }, 'Reports data synthesized');
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }

  async exportReport(req: Request, res: Response) {
    try {
      const { type } = req.query; // 'users' | 'applications' | 'revenue'
      let data: any[] = [];
      let filename = 'platform_report.json';

      if (type === 'users') {
        const u = await adminRepository.getAllUsers({ limit: 1000 });
        data = u.users;
        filename = `users_export_${Date.now()}.json`;
      } else if (type === 'applications') {
        const a = await adminRepository.getAllApplications({ limit: 1000 });
        data = a.applications;
        filename = `applications_export_${Date.now()}.json`;
      } else if (type === 'revenue') {
        const p = await adminRepository.getAllPayments({ limit: 1000 });
        data = p.payments;
        filename = `revenue_export_${Date.now()}.json`;
      } else {
        data = [await adminRepository.getDashboardStats()];
        filename = `overview_export_${Date.now()}.json`;
      }

      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(data, null, 2));
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }

  // ==========================================
  // SYSTEM MANAGEMENT & TELEMETRY
  // ==========================================
  async getSystemHealth(req: Request, res: Response) {
    try {
      const health = await adminRepository.getSystemHealth();
      sendSuccess(res, health, 'System telemetry verified');
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }

  // ==========================================
  // EXISTING ADMIN HANDLERS
  // ==========================================
  async getAiLogs(req: Request, res: Response) {
    try {
      const logs = await adminRepository.getAiLogs();
      sendSuccess(res, logs);
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }

  async getAiPrompts(req: Request, res: Response) {
    try {
      const prompts = await adminRepository.getAiPrompts();
      sendSuccess(res, prompts);
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }

  async updateAiPrompt(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const { systemPrompt, userPromptTemplate, currentVersion } = req.body;
      const updated = await adminRepository.updateAiPrompt(id, {
        systemPrompt,
        userPromptTemplate,
        currentVersion: currentVersion || 'v1.1',
      });
      if (!updated) {
        sendError(res, 'Prompt template not found', 404);
        return;
      }

      await adminRepository.logAudit(
        req.user!.id,
        'UPDATE_AI_PROMPT',
        'ai_prompt_templates',
        updated.id,
        { code: updated.code, version: updated.current_version },
        req.ip
      );

      sendSuccess(res, updated, 'Prompt template updated');
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }

  async getSettings(req: Request, res: Response) {
    try {
      const settings = await adminRepository.getPlatformSettings();
      sendSuccess(res, settings);
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }

  async updateSetting(req: Request, res: Response) {
    try {
      const key = req.params.key as string;
      const { value } = req.body;
      const setting = await adminRepository.updatePlatformSetting(key, value, req.user!.id);

      await adminRepository.logAudit(
        req.user!.id,
        'UPDATE_PLATFORM_SETTING',
        'platform_settings',
        key,
        { value },
        req.ip
      );

      sendSuccess(res, setting, 'Setting updated');
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }

  async getTemplates(req: Request, res: Response) {
    try {
      const templates = await adminRepository.getResumeTemplates();
      sendSuccess(res, templates);
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }

  async updateTemplate(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const { isPremium, isActive } = req.body;
      const updated = await adminRepository.updateResumeTemplate(
        id,
        Boolean(isPremium),
        Boolean(isActive)
      );
      sendSuccess(res, updated, 'Template updated');
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }

  async getAuditLogs(req: Request, res: Response) {
    try {
      const logs = await adminRepository.getAuditLogs();
      sendSuccess(res, logs);
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }
}

export const adminController = new AdminController();

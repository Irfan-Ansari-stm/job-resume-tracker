import { Request, Response } from 'express';
import { adminRepository } from '../repositories/admin.repository.js';
import { sendSuccess, sendError } from '../utils/response.js';

export class AdminController {
  async getDashboard(req: Request, res: Response) {
    const stats = await adminRepository.getDashboardStats();
    sendSuccess(res, stats);
  }

  async getUsers(req: Request, res: Response) {
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
  }

  async updateUserStatus(req: Request, res: Response) {
    const id = req.params.id as string;
    const { isSuspended } = req.body;
    const user = await adminRepository.updateUserStatus(id, Boolean(isSuspended));
    if (!user) {
      sendError(res, 'User not found', 404);
      return;
    }

    await adminRepository.logAudit(
      req.user!.id,
      isSuspended ? 'SUSPEND_USER' : 'ACTIVATE_USER',
      'users',
      user.id,
      { email: user.email },
      req.ip
    );

    sendSuccess(res, user, `User account ${isSuspended ? 'suspended' : 'activated'}`);
  }

  async updateUserRole(req: Request, res: Response) {
    const id = req.params.id as string;
    const { role } = req.body;
    if (!['super_admin', 'admin', 'user'].includes(role)) {
      sendError(res, 'Invalid role specification', 400);
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
  }

  async getAiLogs(req: Request, res: Response) {
    const logs = await adminRepository.getAiLogs();
    sendSuccess(res, logs);
  }

  async getAiPrompts(req: Request, res: Response) {
    const prompts = await adminRepository.getAiPrompts();
    sendSuccess(res, prompts);
  }

  async updateAiPrompt(req: Request, res: Response) {
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
  }

  async getSettings(req: Request, res: Response) {
    const settings = await adminRepository.getPlatformSettings();
    sendSuccess(res, settings);
  }

  async updateSetting(req: Request, res: Response) {
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
  }

  async getTemplates(req: Request, res: Response) {
    const templates = await adminRepository.getResumeTemplates();
    sendSuccess(res, templates);
  }

  async updateTemplate(req: Request, res: Response) {
    const id = req.params.id as string;
    const { isPremium, isActive } = req.body;
    const updated = await adminRepository.updateResumeTemplate(
      id,
      Boolean(isPremium),
      Boolean(isActive)
    );
    sendSuccess(res, updated, 'Template updated');
  }

  async getAuditLogs(req: Request, res: Response) {
    const logs = await adminRepository.getAuditLogs();
    sendSuccess(res, logs);
  }
}

export const adminController = new AdminController();

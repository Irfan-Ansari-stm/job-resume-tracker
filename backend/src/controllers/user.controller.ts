import { Request, Response } from 'express';
import { userRepository } from '../repositories/user.repository.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { db } from '../config/db.js';
import { sendSuccess, sendError } from '../utils/response.js';

export class UserController {
  async getProfile(req: Request, res: Response) {
    const profile = await userRepository.getProfile(req.user!.id);
    sendSuccess(res, profile);
  }

  async updateProfile(req: Request, res: Response) {
    const updated = await userRepository.updateProfile(req.user!.id, req.body);
    sendSuccess(res, updated, 'Profile updated successfully');
  }

  async getPreferences(req: Request, res: Response) {
    const prefs = await userRepository.getPreferences(req.user!.id);
    sendSuccess(res, prefs);
  }

  async updatePreferences(req: Request, res: Response) {
    const updated = await userRepository.updatePreferences(req.user!.id, req.body);
    sendSuccess(res, updated, 'Preferences updated successfully');
  }

  async changePassword(req: Request, res: Response) {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword || newPassword.length < 6) {
      sendError(res, 'New password must be at least 6 characters', 400);
      return;
    }

    const user = await userRepository.findByEmail(req.user!.email);
    const valid = await comparePassword(currentPassword, user.password_hash);
    if (!valid) {
      sendError(res, 'Current password is incorrect', 400);
      return;
    }

    const newHash = await hashPassword(newPassword);
    await db.query(`UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2`, [newHash, req.user!.id]);

    sendSuccess(res, null, 'Password updated successfully');
  }

  async getLoginHistory(req: Request, res: Response) {
    const history = await userRepository.getLoginHistory(req.user!.id);
    sendSuccess(res, history);
  }
}

export const userController = new UserController();

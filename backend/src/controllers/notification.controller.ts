import { Request, Response } from 'express';
import { notificationRepository } from '../repositories/notification.repository.js';
import { sendSuccess, sendError } from '../utils/response.js';

export class NotificationController {
  async list(req: Request, res: Response) {
    const list = await notificationRepository.findAll(req.user!.id);
    sendSuccess(res, list);
  }

  async markAsRead(req: Request, res: Response) {
    const id = req.params.id as string;
    const updated = await notificationRepository.markAsRead(id, req.user!.id);
    if (!updated) {
      sendError(res, 'Notification not found', 404);
      return;
    }
    sendSuccess(res, updated, 'Marked as read');
  }

  async markAllAsRead(req: Request, res: Response) {
    await notificationRepository.markAllAsRead(req.user!.id);
    sendSuccess(res, null, 'All notifications marked as read');
  }
}

export const notificationController = new NotificationController();

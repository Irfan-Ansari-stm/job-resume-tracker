import { Request, Response } from 'express';
import { analyticsRepository } from '../repositories/analytics.repository.js';
import { sendSuccess, sendError } from '../utils/response.js';

export class AnalyticsController {
  async getOverview(req: Request, res: Response) {
    try {
      const days = req.query.days ? parseInt(req.query.days as string, 10) : undefined;
      const data = await analyticsRepository.getOverview(req.user!.id, days);
      sendSuccess(res, data);
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }

  async getApplications(req: Request, res: Response) {
    try {
      const data = await analyticsRepository.getApplicationAnalytics(req.user!.id);
      sendSuccess(res, data);
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }

  async getResumes(req: Request, res: Response) {
    try {
      const data = await analyticsRepository.getResumeAnalytics(req.user!.id);
      sendSuccess(res, data);
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }

  async getConversion(req: Request, res: Response) {
    try {
      const data = await analyticsRepository.getConversionAnalytics(req.user!.id);
      sendSuccess(res, data);
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }
}

export const analyticsController = new AnalyticsController();

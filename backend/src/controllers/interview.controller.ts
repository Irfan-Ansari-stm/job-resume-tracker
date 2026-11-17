import { Request, Response } from 'express';
import { interviewRepository } from '../repositories/interview.repository.js';
import { sendSuccess, sendError } from '../utils/response.js';

export class InterviewController {
  async list(req: Request, res: Response) {
    const interviews = await interviewRepository.findAll(req.user!.id);
    sendSuccess(res, interviews);
  }

  async getById(req: Request, res: Response) {
    const id = req.params.id as string;
    const interview = await interviewRepository.findById(id, req.user!.id);
    if (!interview) {
      sendError(res, 'Interview not found', 404);
      return;
    }
    sendSuccess(res, interview);
  }

  async create(req: Request, res: Response) {
    const {
      companyName, jobTitle, interviewType, interviewRound,
      scheduledAt, durationMinutes, locationOrUrl, interviewerName,
      interviewerEmail, preparationNotes, applicationId, aiPrepInsights
    } = req.body;

    if (!companyName || !jobTitle || !scheduledAt || !interviewType) {
      sendError(res, 'Company, job title, interview type, and scheduled time are required', 400);
      return;
    }

    const interview = await interviewRepository.create({
      userId: req.user!.id,
      applicationId,
      companyName,
      jobTitle,
      interviewType,
      interviewRound,
      scheduledAt,
      durationMinutes,
      locationOrUrl,
      interviewerName,
      interviewerEmail,
      preparationNotes,
      aiPrepInsights,
    });

    sendSuccess(res, interview, 'Interview scheduled successfully', 201);
  }

  async update(req: Request, res: Response) {
    const id = req.params.id as string;
    const updated = await interviewRepository.update(id, req.user!.id, req.body);
    if (!updated) {
      sendError(res, 'Interview not found', 404);
      return;
    }
    sendSuccess(res, updated, 'Interview updated successfully');
  }

  async delete(req: Request, res: Response) {
    const id = req.params.id as string;
    const success = await interviewRepository.delete(id, req.user!.id);
    if (!success) {
      sendError(res, 'Interview not found', 404);
      return;
    }
    sendSuccess(res, null, 'Interview deleted successfully');
  }
}

export const interviewController = new InterviewController();

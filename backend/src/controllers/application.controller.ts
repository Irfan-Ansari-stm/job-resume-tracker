import { Request, Response } from 'express';
import { applicationRepository } from '../repositories/application.repository.js';
import { resumeVersionRepository } from '../repositories/resume-version.repository.js';
import { sendSuccess, sendError } from '../utils/response.js';

export class ApplicationController {
  async list(req: Request, res: Response) {
    const { status, companyId, search } = req.query;
    const applications = await applicationRepository.findAll(req.user!.id, {
      status: status as string,
      companyId: companyId as string,
      search: search as string,
    });
    sendSuccess(res, applications);
  }

  async getById(req: Request, res: Response) {
    const id = req.params.id as string;
    const app = await applicationRepository.findById(id, req.user!.id);
    if (!app) {
      sendError(res, 'Job application not found', 404);
      return;
    }
    const history = await applicationRepository.getHistory(id, req.user!.id);
    const notes = await applicationRepository.getNotes(id, req.user!.id);

    sendSuccess(res, { ...app, history, notes });
  }

  async create(req: Request, res: Response) {
    try {
      const {
        companyName, jobTitle, companyId, jobId, resumeVersionId,
        jobUrl, jobDescription, location, employmentType, salaryRange,
        status, priority, deadline, followUpDate, contactPerson, contactEmail, notes
      } = req.body;

      if (!companyName || !jobTitle) {
        sendError(res, 'Company name and job title are required', 400);
        return;
      }

      const application = await applicationRepository.create({
        userId: req.user!.id,
        companyName,
        jobTitle,
        companyId,
        jobId,
        resumeVersionId,
        jobUrl,
        jobDescription,
        location,
        employmentType,
        salaryRange,
        status,
        priority,
        deadline,
        followUpDate,
        contactPerson,
        contactEmail,
        notes,
      });

      sendSuccess(res, application, 'Application created successfully', 201);
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }

  async update(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const updated = await applicationRepository.update(id, req.user!.id, req.body);
      if (!updated) {
        sendError(res, 'Application not found', 404);
        return;
      }
      sendSuccess(res, updated, 'Application updated successfully');
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }

  async delete(req: Request, res: Response) {
    const id = req.params.id as string;
    const success = await applicationRepository.delete(id, req.user!.id);
    if (!success) {
      sendError(res, 'Application not found', 404);
      return;
    }
    sendSuccess(res, null, 'Application deleted successfully');
  }

  async updateStatus(req: Request, res: Response) {
    const id = req.params.id as string;
    const { status, notes } = req.body;
    if (!status) {
      sendError(res, 'Status is required', 400);
      return;
    }

    const updated = await applicationRepository.update(id, req.user!.id, {
      status,
      status_notes: notes,
    });

    sendSuccess(res, updated, 'Status updated');
  }

  async submitResume(req: Request, res: Response) {
    const id = req.params.id as string;
    const { resumeVersionId } = req.body;
    if (!resumeVersionId) {
      sendError(res, 'Resume version ID is required', 400);
      return;
    }

    const ver = await resumeVersionRepository.findById(resumeVersionId, req.user!.id);
    if (!ver) {
      sendError(res, 'Resume version not found', 404);
      return;
    }

    const updated = await applicationRepository.update(id, req.user!.id, {
      resume_version_id: resumeVersionId,
      status: 'applied',
      status_notes: `Submitted resume version: ${ver.version_label} (v${ver.version_number})`,
    });

    sendSuccess(res, updated, 'Resume linked and application marked as Applied');
  }

  async addNote(req: Request, res: Response) {
    const id = req.params.id as string;
    const { content } = req.body;
    if (!content) {
      sendError(res, 'Note content is required', 400);
      return;
    }
    const note = await applicationRepository.addNote(id, req.user!.id, content);
    sendSuccess(res, note, 'Note added');
  }
}

export const applicationController = new ApplicationController();

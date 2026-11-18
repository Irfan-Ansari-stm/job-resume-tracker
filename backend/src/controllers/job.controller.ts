import { Request, Response } from 'express';
import { jobRepository } from '../repositories/job.repository.js';
import { applicationRepository } from '../repositories/application.repository.js';
import { sendSuccess, sendError } from '../utils/response.js';

export class JobController {
  async list(req: Request, res: Response) {
    const jobs = await jobRepository.findAll(req.user!.id);
    sendSuccess(res, jobs);
  }

  async getById(req: Request, res: Response) {
    const id = req.params.id as string;
    const job = await jobRepository.findById(id, req.user!.id);
    if (!job) {
      sendError(res, 'Job not found', 404);
      return;
    }
    sendSuccess(res, job);
  }

  async create(req: Request, res: Response) {
    const {
      companyName, title, companyId, jobUrl, location, employmentType,
      experienceLevel, salaryMin, salaryMax, currency, rawDescription,
      requiredSkills, preferredSkills, responsibilities, qualifications, atsKeywords, deadline
    } = req.body;

    if (!title || !rawDescription) {
      sendError(res, 'Job title and description are required', 400);
      return;
    }

    const job = await jobRepository.create({
      userId: req.user!.id,
      companyName: companyName || 'Target Company',
      title,
      companyId,
      jobUrl,
      location,
      employmentType,
      experienceLevel,
      salaryMin,
      salaryMax,
      currency,
      rawDescription,
      requiredSkills,
      preferredSkills,
      responsibilities,
      qualifications,
      atsKeywords,
      deadline,
    });

    sendSuccess(res, job, 'Job saved successfully', 201);
  }

  async update(req: Request, res: Response) {
    const id = req.params.id as string;
    const updated = await jobRepository.update(id, req.user!.id, req.body);
    if (!updated) {
      sendError(res, 'Job not found', 404);
      return;
    }
    sendSuccess(res, updated, 'Job updated successfully');
  }

  async delete(req: Request, res: Response) {
    const id = req.params.id as string;
    const success = await jobRepository.delete(id, req.user!.id);
    if (!success) {
      sendError(res, 'Job not found', 404);
      return;
    }
    sendSuccess(res, null, 'Job deleted successfully');
  }

  async convertToApplication(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const job = await jobRepository.findById(id, req.user!.id);
      if (!job) {
        sendError(res, 'Job not found', 404);
        return;
      }

      const application = await applicationRepository.create({
        userId: req.user!.id,
        companyId: job.company_id,
        jobId: job.id,
        companyName: job.company_name,
        jobTitle: job.title,
        jobUrl: job.job_url,
        jobDescription: job.raw_description,
        location: job.location,
        employmentType: job.employment_type,
        status: req.body.status || 'applied',
        resumeVersionId: req.body.resumeVersionId,
        notes: req.body.notes || 'Converted from saved job posting.',
      });

      sendSuccess(res, application, 'Saved job converted to application successfully', 201);
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }
}

export const jobController = new JobController();

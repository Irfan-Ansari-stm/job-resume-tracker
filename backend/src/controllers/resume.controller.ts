import { Request, Response } from 'express';
import { resumeRepository } from '../repositories/resume.repository.js';
import { resumeVersionRepository } from '../repositories/resume-version.repository.js';
import { storageService } from '../storage/storage.service.js';
import { resumeParserService } from '../ai/resume-parser.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

export class ResumeController {
  async list(req: Request, res: Response) {
    const includeArchived = req.query.archived === 'true';
    const resumes = await resumeRepository.findByUserId(req.user!.id, includeArchived);
    sendSuccess(res, resumes);
  }

  async getById(req: Request, res: Response) {
    const id = req.params.id as string;
    const resume = await resumeRepository.findById(id, req.user!.id);
    if (!resume) {
      sendError(res, 'Resume not found', 404);
      return;
    }
    sendSuccess(res, resume);
  }

  async create(req: Request, res: Response) {
    try {
      const { title, summary, targetRole, category, isPrimary, parsedData, formattingSettings } = req.body;
      if (!title) {
        sendError(res, 'Resume title is required', 400);
        return;
      }

      const resume = await resumeRepository.create({
        userId: req.user!.id,
        title,
        summary,
        targetRole,
        category,
        isPrimary,
        parsedData: parsedData || {},
        formattingSettings,
      });

      sendSuccess(res, resume, 'Resume created successfully', 201);
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }

  async upload(req: Request, res: Response) {
    try {
      if (!req.file) {
        sendError(res, 'No resume document uploaded', 400);
        return;
      }

      const saved = await storageService.saveFile(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype
      );

      // Parse document text and extract structured fields
      let parsedData = {};
      try {
        const text = await resumeParserService.extractTextFromFile(saved.filePath, saved.mimeType);
        parsedData = resumeParserService.parseTextToStructuredResume(text, req.file.originalname);
      } catch (parseErr: any) {
        console.warn('Document parsing warning:', parseErr.message);
      }

      const title = req.body.title || req.file.originalname.replace(/\.[^/.]+$/, '');
      const resume = await resumeRepository.create({
        userId: req.user!.id,
        title,
        category: req.body.category || 'General',
        isPrimary: req.body.isPrimary === 'true',
        originalFilePath: saved.filePath,
        originalFilename: saved.originalFilename,
        parsedData,
      });

      sendSuccess(res, resume, 'Resume uploaded and processed successfully', 201);
    } catch (err: any) {
      sendError(res, err.message || 'Failed to upload resume', 500);
    }
  }

  async update(req: Request, res: Response) {
    const id = req.params.id as string;
    const updated = await resumeRepository.update(id, req.user!.id, req.body);
    if (!updated) {
      sendError(res, 'Resume not found or update failed', 404);
      return;
    }
    sendSuccess(res, updated, 'Resume updated successfully');
  }

  async delete(req: Request, res: Response) {
    const id = req.params.id as string;
    const success = await resumeRepository.delete(id, req.user!.id);
    if (!success) {
      sendError(res, 'Resume not found', 404);
      return;
    }
    sendSuccess(res, null, 'Resume deleted successfully');
  }

  // Version management endpoints
  async getVersions(req: Request, res: Response) {
    const id = req.params.id as string;
    const versions = await resumeVersionRepository.findByResumeId(id, req.user!.id);
    sendSuccess(res, versions);
  }

  async getAllUserVersions(req: Request, res: Response) {
    const versions = await resumeVersionRepository.findAllByUserId(req.user!.id);
    sendSuccess(res, versions);
  }

  async getVersionById(req: Request, res: Response) {
    const versionId = req.params.versionId as string;
    const version = await resumeVersionRepository.findById(versionId, req.user!.id);
    if (!version) {
      sendError(res, 'Resume version not found', 404);
      return;
    }
    sendSuccess(res, version);
  }

  async createVersion(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const version = await resumeVersionRepository.create({
        resumeId: id,
        userId: req.user!.id,
        parentVersionId: req.body.parentVersionId,
        companyName: req.body.companyName,
        jobTitle: req.body.jobTitle,
        versionLabel: req.body.versionLabel,
        customizationInstructions: req.body.customizationInstructions,
        aiModelUsed: req.body.aiModelUsed,
        contentSnapshot: req.body.contentSnapshot,
        changeSummary: req.body.changeSummary,
        matchScore: req.body.matchScore,
        matchedKeywords: req.body.matchedKeywords,
        missingKeywords: req.body.missingKeywords,
        skillsGapReport: req.body.skillsGapReport,
        status: req.body.status || 'draft',
      });
      sendSuccess(res, version, 'New resume version created', 201);
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }

  async updateVersion(req: Request, res: Response) {
    try {
      const versionId = req.params.versionId as string;
      const updated = await resumeVersionRepository.update(versionId, req.user!.id, req.body);
      sendSuccess(res, updated, 'Version updated successfully');
    } catch (err: any) {
      sendError(res, err.message, 400);
    }
  }

  async restoreVersion(req: Request, res: Response) {
    try {
      const versionId = req.params.versionId as string;
      const restored = await resumeVersionRepository.restoreAsNewVersion(versionId, req.user!.id);
      sendSuccess(res, restored, 'Version restored as a new active version', 201);
    } catch (err: any) {
      sendError(res, err.message, 400);
    }
  }

  async compareVersions(req: Request, res: Response) {
    const { v1, v2 } = req.query;
    if (!v1 || !v2) {
      sendError(res, 'Both v1 and v2 query parameters are required', 400);
      return;
    }

    const version1 = await resumeVersionRepository.findById(v1 as string, req.user!.id);
    const version2 = await resumeVersionRepository.findById(v2 as string, req.user!.id);

    if (!version1 || !version2) {
      sendError(res, 'One or both versions could not be found', 404);
      return;
    }

    sendSuccess(res, {
      v1: version1,
      v2: version2,
      comparison: {
        v1_score: version1.match_score,
        v2_score: version2.match_score,
        v1_company: version1.company_name,
        v2_company: version2.company_name,
        v1_title: version1.job_title,
        v2_title: version2.job_title,
      },
    });
  }
}

export const resumeController = new ResumeController();

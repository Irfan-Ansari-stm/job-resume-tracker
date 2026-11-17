import { Request, Response } from 'express';
import { cmsRepository } from '../repositories/cms.repository.js';
import { sendSuccess, sendError } from '../utils/response.js';

export class CmsController {
  async getSection(req: Request, res: Response) {
    const key = req.params.key as string;
    const section = await cmsRepository.getSection(key);
    if (!section) {
      sendError(res, 'Content section not found', 404);
      return;
    }
    sendSuccess(res, section);
  }

  async getAll(req: Request, res: Response) {
    const all = await cmsRepository.getAllSections();
    sendSuccess(res, all);
  }

  async updateSection(req: Request, res: Response) {
    const key = req.params.key as string;
    const { title, subtitle, content } = req.body;
    const section = await cmsRepository.upsertSection(
      key,
      title || '',
      subtitle || '',
      content || {}
    );
    sendSuccess(res, section, 'CMS section updated successfully');
  }
}

export const cmsController = new CmsController();

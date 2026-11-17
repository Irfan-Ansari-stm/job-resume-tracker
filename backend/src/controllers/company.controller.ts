import { Request, Response } from 'express';
import { companyRepository } from '../repositories/company.repository.js';
import { sendSuccess, sendError } from '../utils/response.js';

export class CompanyController {
  async list(req: Request, res: Response) {
    const companies = await companyRepository.findAll(req.user!.id);
    sendSuccess(res, companies);
  }

  async getById(req: Request, res: Response) {
    const id = req.params.id as string;
    const company = await companyRepository.findById(id, req.user!.id);
    if (!company) {
      sendError(res, 'Company not found', 404);
      return;
    }
    sendSuccess(res, company);
  }

  async create(req: Request, res: Response) {
    const { name, website, careersUrl, industry, companySize, location, description, notes } = req.body;
    if (!name) {
      sendError(res, 'Company name is required', 400);
      return;
    }

    const company = await companyRepository.create({
      userId: req.user!.id,
      name,
      website,
      careersUrl,
      industry,
      companySize,
      location,
      description,
      notes,
    });
    sendSuccess(res, company, 'Company saved successfully', 201);
  }

  async update(req: Request, res: Response) {
    const id = req.params.id as string;
    const updated = await companyRepository.update(id, req.user!.id, req.body);
    if (!updated) {
      sendError(res, 'Company not found', 404);
      return;
    }
    sendSuccess(res, updated, 'Company updated successfully');
  }

  async delete(req: Request, res: Response) {
    const id = req.params.id as string;
    const success = await companyRepository.delete(id, req.user!.id);
    if (!success) {
      sendError(res, 'Company not found', 404);
      return;
    }
    sendSuccess(res, null, 'Company deleted successfully');
  }
}

export const companyController = new CompanyController();

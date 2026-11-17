import { Request, Response } from 'express';
import { documentRepository } from '../repositories/document.repository.js';
import { storageService } from '../storage/storage.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

export class DocumentController {
  async list(req: Request, res: Response) {
    const { category } = req.query;
    const docs = await documentRepository.findAll(req.user!.id, category as string);
    sendSuccess(res, docs);
  }

  async upload(req: Request, res: Response) {
    try {
      if (!req.file) {
        sendError(res, 'No document file uploaded', 400);
        return;
      }

      const saved = await storageService.saveFile(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype
      );

      const title = req.body.title || req.file.originalname;
      const category = req.body.category || 'other';

      const doc = await documentRepository.create({
        userId: req.user!.id,
        title,
        originalFilename: saved.originalFilename,
        filePath: saved.filePath,
        fileSizeBytes: saved.fileSizeBytes,
        mimeType: saved.mimeType,
        category,
        companyId: req.body.companyId,
        applicationId: req.body.applicationId,
      });

      sendSuccess(res, doc, 'Document uploaded successfully', 201);
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }

  async download(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const doc = await documentRepository.findById(id, req.user!.id);
      if (!doc) {
        sendError(res, 'Document not found', 404);
        return;
      }

      const realPath = storageService.getFilePath(doc.file_path);
      res.setHeader('Content-Type', doc.mime_type || 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(doc.original_filename)}"`);
      res.sendFile(realPath);
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }

  async delete(req: Request, res: Response) {
    const id = req.params.id as string;
    const doc = await documentRepository.delete(id, req.user!.id);
    if (!doc) {
      sendError(res, 'Document not found', 404);
      return;
    }
    await storageService.deleteFile(doc.file_path);
    sendSuccess(res, null, 'Document deleted successfully');
  }
}

export const documentController = new DocumentController();

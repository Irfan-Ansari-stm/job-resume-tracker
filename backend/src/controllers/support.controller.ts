import { Request, Response } from 'express';
import { supportRepository } from '../repositories/support.repository.js';
import { sendSuccess, sendError } from '../utils/response.js';

export class SupportController {
  async getTickets(req: Request, res: Response) {
    try {
      const tickets = await supportRepository.findByUserId(req.user!.id);
      sendSuccess(res, tickets);
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }

  async createTicket(req: Request, res: Response) {
    try {
      const { subject, message, category, priority } = req.body;
      if (!subject || !message) {
        sendError(res, 'Subject and message are required', 400);
        return;
      }

      const ticket = await supportRepository.create({
        userId: req.user!.id,
        subject,
        message,
        category,
        priority,
      });

      sendSuccess(res, ticket, 'Support ticket created successfully', 201);
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }

  async getTicketById(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const ticket = await supportRepository.findById(id, req.user!.id);
      if (!ticket) {
        sendError(res, 'Ticket not found', 404);
        return;
      }
      sendSuccess(res, ticket);
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }
}

export const supportController = new SupportController();

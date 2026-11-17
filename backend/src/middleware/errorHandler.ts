import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { sendError } from '../utils/response.js';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Unhandled API Error:', {
    method: req.method,
    path: req.path,
    error: err?.message || err,
    stack: process.env.NODE_ENV === 'development' ? err?.stack : undefined,
  });

  if (err instanceof ZodError) {
    sendError(res, 'Validation error', 400, err.errors);
    return;
  }

  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  sendError(res, message, statusCode, process.env.NODE_ENV === 'development' ? err.stack : undefined);
};

import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response.js';

export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 'Authentication required', 401);
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      sendError(res, 'Permission denied: Insufficient privileges', 403);
      return;
    }

    next();
  };
};

export const requireSuperAdmin = requireRole(['super_admin']);
export const requireAdmin = requireRole(['super_admin', 'admin']);

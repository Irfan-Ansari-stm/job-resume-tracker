import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../utils/jwt.js';
import { db } from '../config/db.js';
import { sendError } from '../utils/response.js';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: 'super_admin' | 'admin' | 'user';
  first_name: string;
  last_name: string;
  is_active: boolean;
  is_suspended: boolean;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      sendError(res, 'Authentication token missing or invalid format', 401);
      return;
    }

    const token = authHeader.split(' ')[1];
    let payload: TokenPayload;
    try {
      payload = verifyToken(token);
    } catch (err) {
      sendError(res, 'Authentication token expired or invalid', 401);
      return;
    }

    // Query active user from PostgreSQL using parameterized raw SQL
    const userRes = await db.query(
      `SELECT id, email, role, first_name, last_name, is_active, is_suspended 
       FROM users 
       WHERE id = $1`,
      [payload.userId]
    );

    if (userRes.rows.length === 0) {
      sendError(res, 'User account not found', 401);
      return;
    }

    const user = userRes.rows[0];
    if (!user.is_active || user.is_suspended) {
      sendError(res, 'User account is deactivated or suspended', 403);
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication middleware error:', error);
    sendError(res, 'Authentication failed', 500);
  }
};

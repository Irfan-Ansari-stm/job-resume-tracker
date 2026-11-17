import { Request, Response } from 'express';
import { z } from 'zod';
import { userRepository } from '../repositories/user.repository.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { signToken } from '../utils/jwt.js';
import { sendSuccess, sendError } from '../utils/response.js';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const data = registerSchema.parse(req.body);
      const existing = await userRepository.findByEmail(data.email);
      if (existing) {
        sendError(res, 'An account with this email address already exists.', 400);
        return;
      }

      const passwordHash = await hashPassword(data.password);
      const user = await userRepository.create({
        email: data.email,
        password_hash: passwordHash,
        first_name: data.firstName,
        last_name: data.lastName,
        phone: data.phone,
        role: 'user',
      });

      const token = signToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      sendSuccess(res, { user, token }, 'Registration successful', 201);
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        sendError(res, 'Validation failed', 400, err.errors);
      } else {
        sendError(res, err.message || 'Registration failed', 500);
      }
    }
  }

  async login(req: Request, res: Response) {
    const ip = req.ip || req.socket.remoteAddress;
    const ua = req.headers['user-agent'];
    try {
      const { email, password } = loginSchema.parse(req.body);
      const user = await userRepository.findByEmail(email);

      if (!user) {
        await userRepository.logLogin(null, email, 'failed', ip, ua, 'Invalid credentials');
        sendError(res, 'Invalid email or password.', 401);
        return;
      }

      if (!user.is_active || user.is_suspended) {
        await userRepository.logLogin(user.id, email, 'failed', ip, ua, 'Account suspended');
        sendError(res, 'Your account is suspended. Please contact platform support.', 403);
        return;
      }

      const isValid = await comparePassword(password, user.password_hash);
      if (!isValid) {
        await userRepository.logLogin(user.id, email, 'failed', ip, ua, 'Invalid password');
        sendError(res, 'Invalid email or password.', 401);
        return;
      }

      await userRepository.logLogin(user.id, email, 'success', ip, ua);

      const token = signToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      const safeUser = {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone,
        role: user.role,
        is_email_verified: user.is_email_verified,
        created_at: user.created_at,
      };

      sendSuccess(res, { user: safeUser, token }, 'Login successful');
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        sendError(res, 'Validation failed', 400, err.errors);
      } else {
        sendError(res, err.message || 'Login failed', 500);
      }
    }
  }

  async me(req: Request, res: Response) {
    if (!req.user) {
      sendError(res, 'Unauthorized', 401);
      return;
    }

    const user = await userRepository.findById(req.user.id);
    const profile = await userRepository.getProfile(req.user.id);
    const preferences = await userRepository.getPreferences(req.user.id);

    sendSuccess(res, { user, profile, preferences }, 'User retrieved');
  }

  async logout(req: Request, res: Response) {
    sendSuccess(res, null, 'Logged out successfully');
  }
}

export const authController = new AuthController();

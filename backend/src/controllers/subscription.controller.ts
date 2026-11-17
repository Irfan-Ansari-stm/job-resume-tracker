import { Request, Response } from 'express';
import { subscriptionRepository } from '../repositories/subscription.repository.js';
import { sendSuccess, sendError } from '../utils/response.js';

export class SubscriptionController {
  async getPlans(req: Request, res: Response) {
    const plans = await subscriptionRepository.getPlans();
    sendSuccess(res, plans);
  }

  async getCurrent(req: Request, res: Response) {
    const current = await subscriptionRepository.getCurrentSubscription(req.user!.id);
    const credits = await subscriptionRepository.getAiCredits(req.user!.id);
    sendSuccess(res, { subscription: current, credits });
  }

  async checkout(req: Request, res: Response) {
    try {
      const { planSlug, billingInterval } = req.body;
      if (!planSlug) {
        sendError(res, 'Plan slug is required', 400);
        return;
      }

      const subscription = await subscriptionRepository.checkoutPlan(
        req.user!.id,
        planSlug,
        billingInterval || 'monthly'
      );

      sendSuccess(res, subscription, 'Subscription upgraded successfully');
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }

  async getPayments(req: Request, res: Response) {
    const payments = await subscriptionRepository.getPayments(req.user!.id);
    sendSuccess(res, payments);
  }
}

export const subscriptionController = new SubscriptionController();

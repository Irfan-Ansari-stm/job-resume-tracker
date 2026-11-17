import { db } from '../config/db.js';

export class SubscriptionRepository {
  async getPlans() {
    const res = await db.query(
      `SELECT * FROM subscription_plans WHERE is_active = true ORDER BY price_monthly ASC`
    );
    return res.rows;
  }

  async getCurrentSubscription(userId: string) {
    const res = await db.query(
      `SELECT s.*, p.name AS plan_name, p.slug AS plan_slug, p.price_monthly, p.price_yearly,
              p.features, p.ai_credits_monthly, p.resume_version_limit, p.application_tracking_limit
       FROM user_subscriptions s
       JOIN subscription_plans p ON p.id = s.plan_id
       WHERE s.user_id = $1 AND s.status = 'active'
       ORDER BY s.created_at DESC
       LIMIT 1`,
      [userId]
    );
    return res.rows[0] || null;
  }

  async getAiCredits(userId: string) {
    const res = await db.query(
      `SELECT total_credits, used_credits, (total_credits - used_credits) AS remaining_credits
       FROM user_ai_credits WHERE user_id = $1`,
      [userId]
    );

    if (res.rows.length === 0) {
      const init = await db.query(
        `INSERT INTO user_ai_credits (user_id, total_credits, used_credits)
         VALUES ($1, 15, 0)
         RETURNING total_credits, used_credits, (total_credits - used_credits) AS remaining_credits`,
        [userId]
      );
      return init.rows[0];
    }
    return res.rows[0];
  }

  async getPayments(userId: string) {
    const res = await db.query(
      `SELECT p.*, sp.name AS plan_name
       FROM payments p
       LEFT JOIN subscription_plans sp ON sp.id = p.plan_id
       WHERE p.user_id = $1
       ORDER BY p.created_at DESC`,
      [userId]
    );
    return res.rows;
  }

  async checkoutPlan(userId: string, planSlug: string, billingInterval: 'monthly' | 'yearly') {
    return await db.transaction(async (client) => {
      const planRes = await client.query(
        `SELECT * FROM subscription_plans WHERE slug = $1`,
        [planSlug]
      );
      if (planRes.rows.length === 0) {
        throw new Error('Subscription plan not found');
      }
      const plan = planRes.rows[0];
      const amount = billingInterval === 'yearly' ? plan.price_yearly : plan.price_monthly;

      // Deactivate previous active subscriptions
      await client.query(
        `UPDATE user_subscriptions SET status = 'cancelled' WHERE user_id = $1 AND status = 'active'`,
        [userId]
      );

      // Create new subscription
      const subRes = await client.query(
        `INSERT INTO user_subscriptions (
          user_id, plan_id, status, billing_interval, current_period_start, current_period_end
        ) VALUES (
          $1, $2, 'active', $3, NOW(), NOW() + $4::INTERVAL
        ) RETURNING *`,
        [userId, plan.id, billingInterval, billingInterval === 'yearly' ? '365 days' : '30 days']
      );

      // Add AI credits according to plan
      await client.query(
        `UPDATE user_ai_credits 
         SET total_credits = total_credits + $1, updated_at = NOW() 
         WHERE user_id = $2`,
        [plan.ai_credits_monthly, userId]
      );

      // Record invoice payment
      const invoiceNumber = `INV-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;
      await client.query(
        `INSERT INTO payments (
          user_id, plan_id, amount, currency, status, provider, invoice_number
        ) VALUES ($1, $2, $3, $4, 'completed', 'stripe', $5)`,
        [userId, plan.id, amount, plan.currency || 'USD', invoiceNumber]
      );

      return subRes.rows[0];
    });
  }
}

export const subscriptionRepository = new SubscriptionRepository();

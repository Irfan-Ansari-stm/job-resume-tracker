import { db } from '../config/db.js';

export interface LogAiUsageParams {
  userId: string;
  operationType: string;
  model: string;
  promptVersion?: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  creditsDeducted?: number;
  durationMs: number;
  status: 'success' | 'failed';
  errorMessage?: string;
  metadata?: Record<string, any>;
}

export class TokenTrackerService {
  /**
   * Log AI operation and update user credit balance using raw SQL transaction
   */
  async logUsage(params: LogAiUsageParams): Promise<void> {
    const credits = params.creditsDeducted ?? 1;

    try {
      await db.transaction(async (client) => {
        // Insert audit log
        await client.query(
          `INSERT INTO ai_usage_logs (
            user_id, operation_type, model, prompt_version, 
            input_tokens, output_tokens, total_tokens, credits_deducted, 
            duration_ms, status, error_message, metadata
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
          [
            params.userId,
            params.operationType,
            params.model,
            params.promptVersion || 'v1.0',
            params.inputTokens,
            params.outputTokens,
            params.totalTokens,
            credits,
            params.durationMs,
            params.status,
            params.errorMessage || null,
            JSON.stringify(params.metadata || {}),
          ]
        );

        // Deduct AI credits for user
        if (params.status === 'success' && credits > 0) {
          await client.query(
            `UPDATE user_ai_credits 
             SET used_credits = used_credits + $1, updated_at = NOW() 
             WHERE user_id = $2`,
            [credits, params.userId]
          );
        }
      });
    } catch (err) {
      console.error('Failed to log AI usage:', err);
    }
  }

  /**
   * Check if user has sufficient credits
   */
  async checkCredits(userId: string, required: number = 1): Promise<boolean> {
    const res = await db.query(
      `SELECT total_credits, used_credits FROM user_ai_credits WHERE user_id = $1`,
      [userId]
    );

    if (res.rows.length === 0) {
      // Initialize default credits if not exist
      await db.query(
        `INSERT INTO user_ai_credits (user_id, total_credits, used_credits) 
         VALUES ($1, 15, 0) ON CONFLICT DO NOTHING`,
        [userId]
      );
      return true;
    }

    const { total_credits, used_credits } = res.rows[0];
    return (total_credits - used_credits) >= required;
  }
}

export const tokenTrackerService = new TokenTrackerService();

import { db } from '../config/db.js';

export interface CreateUserData {
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role?: string;
}

export class UserRepository {
  async findByEmail(email: string) {
    const res = await db.query(
      `SELECT * FROM users WHERE LOWER(email) = LOWER($1)`,
      [email]
    );
    return res.rows[0] || null;
  }

  async findById(id: string) {
    const res = await db.query(
      `SELECT id, email, first_name, last_name, phone, role, is_email_verified, 
              is_active, is_suspended, two_factor_enabled, last_login_at, created_at, updated_at
       FROM users WHERE id = $1`,
      [id]
    );
    return res.rows[0] || null;
  }

  async create(data: CreateUserData) {
    return await db.transaction(async (client) => {
      const userRes = await client.query(
        `INSERT INTO users (email, password_hash, first_name, last_name, phone, role, is_email_verified)
         VALUES (LOWER($1), $2, $3, $4, $5, COALESCE($6, 'user'), true)
         RETURNING id, email, first_name, last_name, role, is_active, created_at`,
        [data.email, data.password_hash, data.first_name, data.last_name, data.phone || null, data.role || 'user']
      );
      const user = userRes.rows[0];

      // Create default profile
      await client.query(
        `INSERT INTO user_profiles (user_id) VALUES ($1) ON CONFLICT DO NOTHING`,
        [user.id]
      );

      // Create default preferences
      await client.query(
        `INSERT INTO user_preferences (user_id) VALUES ($1) ON CONFLICT DO NOTHING`,
        [user.id]
      );

      // Initialize AI credits
      await client.query(
        `INSERT INTO user_ai_credits (user_id, total_credits, used_credits) 
         VALUES ($1, 15, 0) ON CONFLICT DO NOTHING`,
        [user.id]
      );

      return user;
    });
  }

  async updateProfile(userId: string, data: any) {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    const allowed = [
      'headline', 'bio', 'avatar_url', 'location', 'website_url', 
      'linkedin_url', 'github_url', 'target_role', 'target_industry', 
      'years_of_experience', 'current_salary', 'expected_salary', 'currency'
    ];

    for (const key of allowed) {
      if (data[key] !== undefined) {
        fields.push(`${key} = $${idx}`);
        values.push(data[key]);
        idx++;
      }
    }

    if (fields.length === 0) return null;

    values.push(userId);
    const query = `
      UPDATE user_profiles 
      SET ${fields.join(', ')}, updated_at = NOW() 
      WHERE user_id = $${idx} 
      RETURNING *
    `;

    const res = await db.query(query, values);
    return res.rows[0] || null;
  }

  async getProfile(userId: string) {
    const res = await db.query(
      `SELECT p.*, u.email, u.first_name, u.last_name, u.phone, u.role
       FROM user_profiles p
       JOIN users u ON u.id = p.user_id
       WHERE p.user_id = $1`,
      [userId]
    );
    return res.rows[0] || null;
  }

  async getPreferences(userId: string) {
    const res = await db.query(
      `SELECT * FROM user_preferences WHERE user_id = $1`,
      [userId]
    );
    return res.rows[0] || null;
  }

  async updatePreferences(userId: string, data: any) {
    const res = await db.query(
      `UPDATE user_preferences 
       SET theme = COALESCE($2, theme),
           email_notifications = COALESCE($3, email_notifications),
           application_reminders = COALESCE($4, application_reminders),
           interview_reminders = COALESCE($5, interview_reminders),
           weekly_digest = COALESCE($6, weekly_digest),
           ai_suggestions = COALESCE($7, ai_suggestions),
           updated_at = NOW()
       WHERE user_id = $1
       RETURNING *`,
      [
        userId,
        data.theme,
        data.email_notifications,
        data.application_reminders,
        data.interview_reminders,
        data.weekly_digest,
        data.ai_suggestions,
      ]
    );
    return res.rows[0] || null;
  }

  async logLogin(userId: string | null, email: string, status: string, ip?: string, userAgent?: string, reason?: string) {
    await db.query(
      `INSERT INTO user_login_history (user_id, email, status, failure_reason, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [userId, email, status, reason || null, ip || null, userAgent || null]
    );
    if (userId && status === 'success') {
      await db.query(`UPDATE users SET last_login_at = NOW() WHERE id = $1`, [userId]);
    }
  }

  async getLoginHistory(userId: string, limit: number = 20) {
    const res = await db.query(
      `SELECT * FROM user_login_history WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2`,
      [userId, limit]
    );
    return res.rows;
  }
}

export const userRepository = new UserRepository();

import { db } from '../config/db.js';

export class AdminRepository {
  async getDashboardStats() {
    const userStats = await db.query(`
      SELECT 
        COUNT(*) AS total_users,
        COUNT(CASE WHEN is_active = true THEN 1 END) AS active_users,
        COUNT(CASE WHEN is_suspended = true THEN 1 END) AS suspended_users,
        COUNT(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 END) AS new_users_30d
      FROM users
    `);

    const resumeStats = await db.query(`
      SELECT 
        COUNT(*) AS total_resumes,
        (SELECT COUNT(*) FROM resume_versions) AS total_versions,
        (SELECT COUNT(*) FROM resume_versions WHERE status = 'submitted') AS submitted_versions
      FROM resumes
    `);

    const appStats = await db.query(`
      SELECT 
        COUNT(*) AS total_applications,
        COUNT(CASE WHEN status = 'applied' THEN 1 END) AS applied_count,
        COUNT(CASE WHEN status IN ('interview_scheduled', 'interviewing') THEN 1 END) AS interview_count,
        COUNT(CASE WHEN status = 'offer_received' THEN 1 END) AS offer_count,
        COUNT(CASE WHEN status = 'rejected' THEN 1 END) AS rejected_count
      FROM job_applications
    `);

    const aiStats = await db.query(`
      SELECT 
        COUNT(*) AS total_operations,
        COALESCE(SUM(total_tokens), 0) AS total_tokens,
        COALESCE(SUM(duration_ms), 0) / GREATEST(COUNT(*), 1) AS avg_duration_ms
      FROM ai_usage_logs
    `);

    const revenueStats = await db.query(`
      SELECT 
        COALESCE(SUM(amount), 0) AS total_revenue,
        COUNT(*) AS total_transactions
      FROM payments
      WHERE status = 'completed'
    `);

    return {
      users: userStats.rows[0],
      resumes: resumeStats.rows[0],
      applications: appStats.rows[0],
      ai: aiStats.rows[0],
      revenue: revenueStats.rows[0],
    };
  }

  async getAllUsers(options?: { role?: string; status?: string; search?: string; limit?: number; offset?: number }) {
    const conditions: string[] = ['1=1'];
    const params: any[] = [];
    let idx = 1;

    if (options?.role && options.role !== 'all') {
      conditions.push(`u.role = $${idx}`);
      params.push(options.role);
      idx++;
    }

    if (options?.status === 'active') {
      conditions.push(`u.is_active = true AND u.is_suspended = false`);
    } else if (options?.status === 'suspended') {
      conditions.push(`u.is_suspended = true`);
    }

    if (options?.search) {
      conditions.push(`(u.email ILIKE $${idx} OR u.first_name ILIKE $${idx} OR u.last_name ILIKE $${idx})`);
      params.push(`%${options.search}%`);
      idx++;
    }

    const limit = options?.limit || 50;
    const offset = options?.offset || 0;

    const countRes = await db.query(`SELECT COUNT(*) FROM users u WHERE ${conditions.join(' AND ')}`, params);
    const total = parseInt(countRes.rows[0].count, 10);

    params.push(limit, offset);
    const query = `
      SELECT u.id, u.email, u.first_name, u.last_name, u.phone, u.role, 
             u.is_email_verified, u.is_active, u.is_suspended, u.last_login_at, u.created_at,
             p.target_role, p.location,
             (SELECT COUNT(*) FROM resumes r WHERE r.user_id = u.id) AS resumes_count,
             (SELECT COUNT(*) FROM job_applications a WHERE a.user_id = u.id) AS applications_count,
             (SELECT p.name FROM user_subscriptions s JOIN subscription_plans p ON p.id = s.plan_id WHERE s.user_id = u.id AND s.status = 'active' LIMIT 1) AS current_plan
      FROM users u
      LEFT JOIN user_profiles p ON p.user_id = u.id
      WHERE ${conditions.join(' AND ')}
      ORDER BY u.created_at DESC
      LIMIT $${idx} OFFSET $${idx + 1}
    `;

    const res = await db.query(query, params);
    return { users: res.rows, total };
  }

  async updateUserStatus(userId: string, isSuspended: boolean) {
    const res = await db.query(
      `UPDATE users SET is_suspended = $2, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [userId, isSuspended]
    );
    return res.rows[0] || null;
  }

  async updateUserRole(userId: string, role: string) {
    const res = await db.query(
      `UPDATE users SET role = $2, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [userId, role]
    );
    return res.rows[0] || null;
  }

  async getAiLogs(limit: number = 50) {
    const res = await db.query(
      `SELECT l.*, u.email AS user_email 
       FROM ai_usage_logs l
       JOIN users u ON u.id = l.user_id
       ORDER BY l.created_at DESC
       LIMIT $1`,
      [limit]
    );
    return res.rows;
  }

  async getAiPrompts() {
    const res = await db.query(
      `SELECT * FROM ai_prompt_templates ORDER BY name ASC`
    );
    return res.rows;
  }

  async updateAiPrompt(id: string, data: { systemPrompt: string; userPromptTemplate: string; currentVersion: string }) {
    const res = await db.query(
      `UPDATE ai_prompt_templates 
       SET system_prompt = $2, user_prompt_template = $3, current_version = $4, updated_at = NOW()
       WHERE id = $1 RETURNING *`,
      [id, data.systemPrompt, data.userPromptTemplate, data.currentVersion]
    );
    return res.rows[0] || null;
  }

  async getAuditLogs(limit: number = 50) {
    const res = await db.query(
      `SELECT a.*, u.email AS user_email
       FROM audit_logs a
       LEFT JOIN users u ON u.id = a.user_id
       ORDER BY a.created_at DESC
       LIMIT $1`,
      [limit]
    );
    return res.rows;
  }

  async logAudit(userId: string | null, action: string, entityType: string, entityId?: string, details?: any, ip?: string) {
    await db.query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [userId, action, entityType, entityId || null, JSON.stringify(details || {}), ip || null]
    );
  }

  async getPlatformSettings() {
    const res = await db.query(`SELECT * FROM platform_settings ORDER BY key ASC`);
    return res.rows;
  }

  async updatePlatformSetting(key: string, value: any, userId?: string) {
    const res = await db.query(
      `INSERT INTO platform_settings (key, value, updated_by, updated_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (key) DO UPDATE 
       SET value = EXCLUDED.value, updated_by = EXCLUDED.updated_by, updated_at = NOW()
       RETURNING *`,
      [key, JSON.stringify(value), userId || null]
    );
    return res.rows[0];
  }

  async getResumeTemplates() {
    const res = await db.query(`SELECT * FROM resume_templates ORDER BY name ASC`);
    return res.rows;
  }

  async updateResumeTemplate(id: string, isPremium: boolean, isActive: boolean) {
    const res = await db.query(
      `UPDATE resume_templates SET is_premium = $2, is_active = $3, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id, isPremium, isActive]
    );
    return res.rows[0] || null;
  }
}

export const adminRepository = new AdminRepository();

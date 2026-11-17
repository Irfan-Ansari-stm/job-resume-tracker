import bcrypt from 'bcryptjs';
import { db } from '../config/db.js';

export class AdminRepository {
  // ==========================================
  // DASHBOARD & ANALYTICS
  // ==========================================
  async getDashboardStats() {
    const userStats = await db.query(`
      SELECT 
        COUNT(*) AS total_users,
        COUNT(CASE WHEN is_active = true AND (is_deleted = false OR is_deleted IS NULL) THEN 1 END) AS active_users,
        COUNT(CASE WHEN is_suspended = true THEN 1 END) AS suspended_users,
        COUNT(CASE WHEN is_deleted = true THEN 1 END) AS deleted_users,
        COUNT(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 END) AS new_users_30d
      FROM users
    `);

    const resumeStats = await db.query(`
      SELECT 
        COUNT(*) AS total_resumes,
        (SELECT COUNT(*) FROM resume_versions) AS total_versions,
        (SELECT COUNT(*) FROM resume_versions WHERE status = 'submitted') AS submitted_versions,
        (SELECT COUNT(*) FROM resume_templates WHERE is_active = true) AS active_templates
      FROM resumes
      WHERE is_deleted = false OR is_deleted IS NULL
    `);

    const appStats = await db.query(`
      SELECT 
        COUNT(*) AS total_applications,
        COUNT(CASE WHEN status = 'applied' THEN 1 END) AS applied_count,
        COUNT(CASE WHEN status IN ('interview_scheduled', 'interviewing') THEN 1 END) AS interview_count,
        COUNT(CASE WHEN status = 'offer_received' THEN 1 END) AS offer_count,
        COUNT(CASE WHEN status = 'rejected' THEN 1 END) AS rejected_count,
        COUNT(CASE WHEN status = 'shortlisted' THEN 1 END) AS shortlisted_count
      FROM job_applications
      WHERE is_deleted = false OR is_deleted IS NULL
    `);

    const aiStats = await db.query(`
      SELECT 
        COUNT(*) AS total_operations,
        COALESCE(SUM(total_tokens), 0) AS total_tokens,
        ROUND(COALESCE(AVG(duration_ms), 0)) AS avg_duration_ms,
        COUNT(CASE WHEN created_at >= NOW() - INTERVAL '24 hours' THEN 1 END) AS operations_24h
      FROM ai_usage_logs
    `);

    const revenueStats = await db.query(`
      SELECT 
        COALESCE(SUM(amount), 0) AS total_revenue,
        COUNT(*) AS total_transactions,
        (SELECT COUNT(*) FROM user_subscriptions WHERE status = 'active') AS active_subscriptions
      FROM payments
      WHERE status = 'completed'
    `);

    // Fetch recent 7-day user registrations for mini-chart
    const userTrend = await db.query(`
      SELECT TO_CHAR(created_at, 'YYYY-MM-DD') AS date, COUNT(*) AS count
      FROM users
      WHERE created_at >= NOW() - INTERVAL '7 days'
      GROUP BY TO_CHAR(created_at, 'YYYY-MM-DD')
      ORDER BY date ASC
    `);

    // Fetch recent 7-day AI requests
    const aiTrend = await db.query(`
      SELECT TO_CHAR(created_at, 'YYYY-MM-DD') AS date, COUNT(*) AS count, COALESCE(SUM(total_tokens), 0) AS tokens
      FROM ai_usage_logs
      WHERE created_at >= NOW() - INTERVAL '7 days'
      GROUP BY TO_CHAR(created_at, 'YYYY-MM-DD')
      ORDER BY date ASC
    `);

    return {
      users: userStats.rows[0],
      resumes: resumeStats.rows[0],
      applications: appStats.rows[0],
      ai: aiStats.rows[0],
      revenue: revenueStats.rows[0],
      userTrend: userTrend.rows,
      aiTrend: aiTrend.rows,
    };
  }

  // ==========================================
  // USER MANAGEMENT
  // ==========================================
  async getAllUsers(options?: {
    role?: string;
    status?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }) {
    const conditions: string[] = ['1=1'];
    const params: any[] = [];
    let idx = 1;

    if (options?.role && options.role !== 'all') {
      conditions.push(`u.role = $${idx}`);
      params.push(options.role);
      idx++;
    }

    if (options?.status === 'active') {
      conditions.push(`u.is_active = true AND u.is_suspended = false AND (u.is_deleted = false OR u.is_deleted IS NULL)`);
    } else if (options?.status === 'suspended') {
      conditions.push(`u.is_suspended = true AND (u.is_deleted = false OR u.is_deleted IS NULL)`);
    } else if (options?.status === 'deleted') {
      conditions.push(`u.is_deleted = true`);
    } else if (options?.status === 'unverified') {
      conditions.push(`u.is_email_verified = false AND (u.is_deleted = false OR u.is_deleted IS NULL)`);
    } else {
      conditions.push(`(u.is_deleted = false OR u.is_deleted IS NULL)`);
    }

    if (options?.search) {
      conditions.push(`(u.email ILIKE $${idx} OR u.first_name ILIKE $${idx} OR u.last_name ILIKE $${idx})`);
      params.push(`%${options.search}%`);
      idx++;
    }

    const limit = options?.limit || 50;
    const offset = options?.offset || 0;

    const countRes = await db.query(
      `SELECT COUNT(*) FROM users u WHERE ${conditions.join(' AND ')}`,
      params
    );
    const total = parseInt(countRes.rows[0].count, 10);

    params.push(limit, offset);
    const query = `
      SELECT u.id, u.email, u.first_name, u.last_name, u.phone, u.role, 
             u.is_email_verified, u.is_active, u.is_suspended, u.is_deleted, u.last_login_at, u.created_at,
             p.target_role, p.location,
             (SELECT COUNT(*) FROM resumes r WHERE r.user_id = u.id AND (r.is_deleted = false OR r.is_deleted IS NULL)) AS resumes_count,
             (SELECT COUNT(*) FROM job_applications a WHERE a.user_id = u.id AND (a.is_deleted = false OR a.is_deleted IS NULL)) AS applications_count,
             (SELECT (total_credits - used_credits) FROM user_ai_credits c WHERE c.user_id = u.id LIMIT 1) AS ai_credits,
             (SELECT sp.name FROM user_subscriptions s JOIN subscription_plans sp ON sp.id = s.plan_id WHERE s.user_id = u.id AND s.status = 'active' LIMIT 1) AS current_plan
      FROM users u
      LEFT JOIN user_profiles p ON p.user_id = u.id
      WHERE ${conditions.join(' AND ')}
      ORDER BY u.created_at DESC
      LIMIT $${idx} OFFSET $${idx + 1}
    `;

    const res = await db.query(query, params);
    return { users: res.rows, total };
  }

  async getUserDetails(userId: string) {
    // 1. Basic user record and profile
    const userRes = await db.query(
      `SELECT u.id, u.email, u.first_name, u.last_name, u.phone, u.role,
              u.is_email_verified, u.is_active, u.is_suspended, u.is_deleted, u.deleted_at,
              u.two_factor_enabled, u.last_login_at, u.created_at, u.updated_at,
              p.headline, p.target_role, p.years_of_experience, p.location, p.bio, p.linkedin_url, p.github_url
       FROM users u
       LEFT JOIN user_profiles p ON p.user_id = u.id
       WHERE u.id = $1`,
      [userId]
    );

    if (userRes.rows.length === 0) return null;
    const user = userRes.rows[0];

    // 2. Subscription and credits
    const subRes = await db.query(
      `SELECT s.*, p.name AS plan_name, p.slug AS plan_slug, p.price_monthly, p.features
       FROM user_subscriptions s
       JOIN subscription_plans p ON p.id = s.plan_id
       WHERE s.user_id = $1
       ORDER BY s.created_at DESC LIMIT 1`,
      [userId]
    );

    const creditsRes = await db.query(
      `SELECT total_credits, used_credits, (total_credits - used_credits) AS credits_remaining
       FROM user_ai_credits
       WHERE user_id = $1`,
      [userId]
    );

    // 3. Resumes with version count
    const resumesRes = await db.query(
      `SELECT r.*,
              (SELECT COUNT(*) FROM resume_versions v WHERE v.resume_id = r.id) AS versions_count
       FROM resumes r
       WHERE r.user_id = $1
       ORDER BY r.created_at DESC`,
      [userId]
    );

    // 4. Job Applications
    const appsRes = await db.query(
      `SELECT a.*, c.name AS company_name
       FROM job_applications a
       LEFT JOIN companies c ON c.id = a.company_id
       WHERE a.user_id = $1
       ORDER BY a.created_at DESC`,
      [userId]
    );

    // 5. Recent AI Usage Logs
    const aiLogsRes = await db.query(
      `SELECT * FROM ai_usage_logs
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 10`,
      [userId]
    );

    // 6. Active Sessions
    const sessionsRes = await db.query(
      `SELECT id, ip_address, user_agent, is_revoked, expires_at, last_activity_at, created_at
       FROM user_sessions
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 10`,
      [userId]
    );

    // 7. Login History
    const loginHistoryRes = await db.query(
      `SELECT * FROM user_login_history
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 10`,
      [userId]
    );

    // 8. Assisted Access Sessions
    const assistedRes = await db.query(
      `SELECT s.*, a.email AS admin_email, a.first_name AS admin_first_name, a.last_name AS admin_last_name
       FROM assisted_access_sessions s
       JOIN users a ON a.id = s.admin_id
       WHERE s.target_user_id = $1
       ORDER BY s.started_at DESC`,
      [userId]
    );

    return {
      user,
      subscription: subRes.rows[0] || null,
      credits: creditsRes.rows[0] || { credits_remaining: 0, credits_used: 0 },
      resumes: resumesRes.rows,
      applications: appsRes.rows,
      aiLogs: aiLogsRes.rows,
      sessions: sessionsRes.rows,
      loginHistory: loginHistoryRes.rows,
      assistedSessions: assistedRes.rows,
    };
  }

  async createUser(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role: string;
    targetRole?: string;
    location?: string;
    isEmailVerified?: boolean;
  }) {
    const passwordHash = await bcrypt.hash(data.password, 10);
    const userRes = await db.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, phone, role, is_email_verified, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, true)
       RETURNING id, email, first_name, last_name, phone, role, is_email_verified, is_active, created_at`,
      [
        data.email.toLowerCase(),
        passwordHash,
        data.firstName,
        data.lastName,
        data.phone || null,
        data.role || 'user',
        Boolean(data.isEmailVerified),
      ]
    );

    const user = userRes.rows[0];

    // Create profile
    await db.query(
      `INSERT INTO user_profiles (user_id, target_role, location)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id) DO NOTHING`,
      [user.id, data.targetRole || null, data.location || null]
    );

    // Create initial AI credits
    const initialCredits = data.role === 'super_admin' ? 1000 : data.role === 'admin' ? 250 : 25;
    await db.query(
      `INSERT INTO user_ai_credits (user_id, total_credits, used_credits)
       VALUES ($1, $2, 0)
       ON CONFLICT (user_id) DO NOTHING`,
      [user.id, initialCredits]
    );

    return user;
  }

  async updateUser(userId: string, data: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    role?: string;
    isEmailVerified?: boolean;
    targetRole?: string;
    location?: string;
    bio?: string;
  }) {
    const userRes = await db.query(
      `UPDATE users 
       SET first_name = COALESCE($2, first_name),
           last_name = COALESCE($3, last_name),
           phone = COALESCE($4, phone),
           role = COALESCE($5, role),
           is_email_verified = COALESCE($6, is_email_verified),
           updated_at = NOW()
       WHERE id = $1
       RETURNING id, email, first_name, last_name, phone, role, is_email_verified, is_active, is_suspended, updated_at`,
      [userId, data.firstName, data.lastName, data.phone, data.role, data.isEmailVerified]
    );

    if (userRes.rows.length === 0) return null;

    if (data.targetRole !== undefined || data.location !== undefined || data.bio !== undefined) {
      await db.query(
        `INSERT INTO user_profiles (user_id, target_role, location, bio, updated_at)
         VALUES ($1, $2, $3, $4, NOW())
         ON CONFLICT (user_id) DO UPDATE SET
           target_role = COALESCE(EXCLUDED.target_role, user_profiles.target_role),
           location = COALESCE(EXCLUDED.location, user_profiles.location),
           bio = COALESCE(EXCLUDED.bio, user_profiles.bio),
           updated_at = NOW()`,
        [userId, data.targetRole || null, data.location || null, data.bio || null]
      );
    }

    return userRes.rows[0];
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

  async softDeleteUser(userId: string) {
    // Check if this is the only active super admin
    const checkRes = await db.query(
      `SELECT COUNT(*) FROM users WHERE role = 'super_admin' AND is_deleted = false AND id != $1`,
      [userId]
    );
    const superAdminsLeft = parseInt(checkRes.rows[0].count, 10);
    const targetUser = await db.query(`SELECT role FROM users WHERE id = $1`, [userId]);
    
    if (targetUser.rows[0]?.role === 'super_admin' && superAdminsLeft === 0) {
      throw new Error('Cannot delete the sole active Super Administrator.');
    }

    const res = await db.query(
      `UPDATE users 
       SET is_deleted = true, deleted_at = NOW(), is_active = false, updated_at = NOW() 
       WHERE id = $1 RETURNING id, email, is_deleted, deleted_at`,
      [userId]
    );
    return res.rows[0] || null;
  }

  async restoreUser(userId: string) {
    const res = await db.query(
      `UPDATE users 
       SET is_deleted = false, deleted_at = NULL, is_active = true, updated_at = NOW() 
       WHERE id = $1 RETURNING id, email, is_deleted, is_active`,
      [userId]
    );
    return res.rows[0] || null;
  }

  async resetUserCredits(userId: string, credits: number) {
    const res = await db.query(
      `INSERT INTO user_ai_credits (user_id, total_credits, used_credits, updated_at)
       VALUES ($1, $2, 0, NOW())
       ON CONFLICT (user_id) DO UPDATE SET
         total_credits = EXCLUDED.total_credits,
         used_credits = 0,
         updated_at = NOW()
       RETURNING *`,
      [userId, credits]
    );
    return res.rows[0];
  }

  async revokeUserSessions(userId: string, sessionId?: string) {
    if (sessionId) {
      await db.query(`DELETE FROM user_sessions WHERE id = $1 AND user_id = $2`, [sessionId, userId]);
    } else {
      await db.query(`DELETE FROM user_sessions WHERE user_id = $1`, [userId]);
    }
  }

  // ==========================================
  // ADMIN ASSISTED USER ACCESS ("ACT-AS-USER")
  // ==========================================
  async startAssistedSession(adminId: string, targetUserId: string, reason: string, ip?: string) {
    // 1. Fetch target user
    const targetRes = await db.query(
      `SELECT id, email, first_name, last_name, role FROM users WHERE id = $1`,
      [targetUserId]
    );
    if (targetRes.rows.length === 0) {
      throw new Error('Target user not found');
    }
    const targetUser = targetRes.rows[0];

    // 2. Terminate any existing active assisted sessions by this admin
    await db.query(
      `UPDATE assisted_access_sessions SET is_active = false, ended_at = NOW() WHERE admin_id = $1 AND is_active = true`,
      [adminId]
    );

    // 3. Create new session
    const sessionRes = await db.query(
      `INSERT INTO assisted_access_sessions (admin_id, target_user_id, reason, ip_address, is_active)
       VALUES ($1, $2, $3, $4, true)
       RETURNING *`,
      [adminId, targetUserId, reason, ip || null]
    );

    return {
      session: sessionRes.rows[0],
      targetUser,
    };
  }

  async endAssistedSession(sessionId: string) {
    const res = await db.query(
      `UPDATE assisted_access_sessions 
       SET is_active = false, ended_at = NOW() 
       WHERE id = $1 RETURNING *`,
      [sessionId]
    );
    return res.rows[0] || null;
  }

  async getAssistedSessions(options?: { adminId?: string; targetUserId?: string; limit?: number }) {
    const conditions: string[] = ['1=1'];
    const params: any[] = [];
    let idx = 1;

    if (options?.adminId) {
      conditions.push(`s.admin_id = $${idx}`);
      params.push(options.adminId);
      idx++;
    }

    if (options?.targetUserId) {
      conditions.push(`s.target_user_id = $${idx}`);
      params.push(options.targetUserId);
      idx++;
    }

    const limit = options?.limit || 50;
    params.push(limit);

    const query = `
      SELECT s.*, 
             a.email AS admin_email, a.first_name AS admin_first_name, a.last_name AS admin_last_name,
             u.email AS target_email, u.first_name AS target_first_name, u.last_name AS target_last_name
      FROM assisted_access_sessions s
      JOIN users a ON a.id = s.admin_id
      JOIN users u ON u.id = s.target_user_id
      WHERE ${conditions.join(' AND ')}
      ORDER BY s.started_at DESC
      LIMIT $${idx}
    `;

    const res = await db.query(query, params);
    return res.rows;
  }

  // ==========================================
  // RESUME MANAGEMENT (ADMIN FULL CRUD)
  // ==========================================
  async getAllResumes(options?: {
    search?: string;
    category?: string;
    userId?: string;
    limit?: number;
    offset?: number;
  }) {
    const conditions: string[] = ['(r.is_deleted = false OR r.is_deleted IS NULL)'];
    const params: any[] = [];
    let idx = 1;

    if (options?.category && options.category !== 'all') {
      conditions.push(`r.category = $${idx}`);
      params.push(options.category);
      idx++;
    }

    if (options?.userId) {
      conditions.push(`r.user_id = $${idx}`);
      params.push(options.userId);
      idx++;
    }

    if (options?.search) {
      conditions.push(`(r.title ILIKE $${idx} OR r.target_role ILIKE $${idx} OR u.email ILIKE $${idx} OR u.first_name ILIKE $${idx} OR u.last_name ILIKE $${idx})`);
      params.push(`%${options.search}%`);
      idx++;
    }

    const limit = options?.limit || 50;
    const offset = options?.offset || 0;

    const countRes = await db.query(
      `SELECT COUNT(*) FROM resumes r JOIN users u ON u.id = r.user_id WHERE ${conditions.join(' AND ')}`,
      params
    );
    const total = parseInt(countRes.rows[0].count, 10);

    params.push(limit, offset);
    const query = `
      SELECT r.*, 
             u.email AS user_email, u.first_name AS user_first_name, u.last_name AS user_last_name,
             (SELECT COUNT(*) FROM resume_versions v WHERE v.resume_id = r.id) AS versions_count
      FROM resumes r
      JOIN users u ON u.id = r.user_id
      WHERE ${conditions.join(' AND ')}
      ORDER BY r.updated_at DESC
      LIMIT $${idx} OFFSET $${idx + 1}
    `;

    const res = await db.query(query, params);
    return { resumes: res.rows, total };
  }

  async getResumeById(id: string) {
    const resumeRes = await db.query(
      `SELECT r.*, u.email AS user_email, u.first_name AS user_first_name, u.last_name AS user_last_name
       FROM resumes r
       JOIN users u ON u.id = r.user_id
       WHERE r.id = $1`,
      [id]
    );
    if (resumeRes.rows.length === 0) return null;

    const versionsRes = await db.query(
      `SELECT v.*, j.title AS job_title, c.name AS company_name
       FROM resume_versions v
       LEFT JOIN jobs j ON j.id = v.job_id
       LEFT JOIN companies c ON c.id = j.company_id
       WHERE v.resume_id = $1
       ORDER BY v.version_number DESC`,
      [id]
    );

    return {
      resume: resumeRes.rows[0],
      versions: versionsRes.rows,
    };
  }

  async createResumeForUser(data: {
    userId: string;
    title: string;
    summary?: string;
    targetRole?: string;
    category?: string;
    parsedData?: any;
    formattingSettings?: any;
  }) {
    const res = await db.query(
      `INSERT INTO resumes (user_id, title, summary, target_role, category, parsed_data, formatting_settings)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        data.userId,
        data.title,
        data.summary || '',
        data.targetRole || '',
        data.category || 'General',
        JSON.stringify(data.parsedData || {}),
        JSON.stringify(data.formattingSettings || { font: 'Inter', margins: 'normal', colorScheme: 'slate' }),
      ]
    );
    return res.rows[0];
  }

  async updateResume(id: string, data: {
    title?: string;
    summary?: string;
    targetRole?: string;
    category?: string;
    isPrimary?: boolean;
    isArchived?: boolean;
    parsedData?: any;
    formattingSettings?: any;
  }) {
    const res = await db.query(
      `UPDATE resumes
       SET title = COALESCE($2, title),
           summary = COALESCE($3, summary),
           target_role = COALESCE($4, target_role),
           category = COALESCE($5, category),
           is_primary = COALESCE($6, is_primary),
           is_archived = COALESCE($7, is_archived),
           parsed_data = COALESCE($8, parsed_data),
           formatting_settings = COALESCE($9, formatting_settings),
           updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [
        id,
        data.title,
        data.summary,
        data.targetRole,
        data.category,
        data.isPrimary,
        data.isArchived,
        data.parsedData ? JSON.stringify(data.parsedData) : null,
        data.formattingSettings ? JSON.stringify(data.formattingSettings) : null,
      ]
    );
    return res.rows[0] || null;
  }

  async softDeleteResume(id: string) {
    const res = await db.query(
      `UPDATE resumes SET is_deleted = true, deleted_at = NOW(), updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id]
    );
    return res.rows[0] || null;
  }

  async restoreResume(id: string) {
    const res = await db.query(
      `UPDATE resumes SET is_deleted = false, deleted_at = NULL, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id]
    );
    return res.rows[0] || null;
  }

  // ==========================================
  // JOB APPLICATION MANAGEMENT (ADMIN FULL CRUD)
  // ==========================================
  async getAllApplications(options?: {
    status?: string;
    search?: string;
    userId?: string;
    limit?: number;
    offset?: number;
  }) {
    const conditions: string[] = ['(a.is_deleted = false OR a.is_deleted IS NULL)'];
    const params: any[] = [];
    let idx = 1;

    if (options?.status && options.status !== 'all') {
      conditions.push(`a.status = $${idx}`);
      params.push(options.status);
      idx++;
    }

    if (options?.userId) {
      conditions.push(`a.user_id = $${idx}`);
      params.push(options.userId);
      idx++;
    }

    if (options?.search) {
      conditions.push(`(c.name ILIKE $${idx} OR j.title ILIKE $${idx} OR u.email ILIKE $${idx} OR u.first_name ILIKE $${idx} OR u.last_name ILIKE $${idx})`);
      params.push(`%${options.search}%`);
      idx++;
    }

    const limit = options?.limit || 50;
    const offset = options?.offset || 0;

    const countRes = await db.query(
      `SELECT COUNT(*) FROM job_applications a
       JOIN users u ON u.id = a.user_id
       LEFT JOIN companies c ON c.id = a.company_id
       LEFT JOIN jobs j ON j.id = a.job_id
       WHERE ${conditions.join(' AND ')}`,
      params
    );
    const total = parseInt(countRes.rows[0].count, 10);

    params.push(limit, offset);
    const query = `
      SELECT a.*,
             c.name AS company_name, c.website AS company_website, c.logo_url AS company_logo,
             j.title AS job_title, j.location AS job_location,
             u.email AS user_email, u.first_name AS user_first_name, u.last_name AS user_last_name,
             r.title AS resume_title,
             (SELECT COUNT(*) FROM interviews i WHERE i.application_id = a.id) AS interview_count
      FROM job_applications a
      JOIN users u ON u.id = a.user_id
      LEFT JOIN companies c ON c.id = a.company_id
      LEFT JOIN jobs j ON j.id = a.job_id
      LEFT JOIN resumes r ON r.id = a.resume_id
      WHERE ${conditions.join(' AND ')}
      ORDER BY a.updated_at DESC
      LIMIT $${idx} OFFSET $${idx + 1}
    `;

    const res = await db.query(query, params);
    return { applications: res.rows, total };
  }

  async getApplicationById(id: string) {
    const appRes = await db.query(
      `SELECT a.*,
              c.name AS company_name, c.website AS company_website,
              j.title AS job_title, j.raw_description AS job_description, j.location AS job_location,
              u.email AS user_email, u.first_name AS user_first_name, u.last_name AS user_last_name,
              r.title AS resume_title
       FROM job_applications a
       JOIN users u ON u.id = a.user_id
       LEFT JOIN companies c ON c.id = a.company_id
       LEFT JOIN jobs j ON j.id = a.job_id
       LEFT JOIN resumes r ON r.id = a.resume_id
       WHERE a.id = $1`,
      [id]
    );

    if (appRes.rows.length === 0) return null;

    const historyRes = await db.query(
      `SELECT * FROM application_status_history WHERE application_id = $1 ORDER BY created_at DESC`,
      [id]
    );

    const notesRes = await db.query(
      `SELECT * FROM application_notes WHERE application_id = $1 ORDER BY created_at DESC`,
      [id]
    );

    const interviewsRes = await db.query(
      `SELECT * FROM interviews WHERE application_id = $1 ORDER BY scheduled_at ASC`,
      [id]
    );

    return {
      application: appRes.rows[0],
      statusHistory: historyRes.rows,
      notes: notesRes.rows,
      interviews: interviewsRes.rows,
    };
  }

  async createApplicationForUser(data: {
    userId: string;
    companyName: string;
    jobTitle: string;
    jobUrl?: string;
    location?: string;
    salaryMin?: number;
    salaryMax?: number;
    status?: string;
    appliedDate?: string;
    notes?: string;
  }) {
    // 1. Find or create company
    let companyId: string | null = null;
    const compRes = await db.query(
      `INSERT INTO companies (user_id, name, location)
       VALUES ($1, $2, $3)
       ON CONFLICT DO NOTHING
       RETURNING id`,
      [data.userId, data.companyName, data.location || null]
    );

    if (compRes.rows.length > 0) {
      companyId = compRes.rows[0].id;
    } else {
      const existingComp = await db.query(
        `SELECT id FROM companies WHERE user_id = $1 AND name ILIKE $2 LIMIT 1`,
        [data.userId, data.companyName]
      );
      companyId = existingComp.rows[0]?.id || null;
    }

    // 2. Create job record
    const jobRes = await db.query(
      `INSERT INTO jobs (user_id, company_id, company_name, title, job_url, location, salary_min, salary_max, raw_description)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id`,
      [
        data.userId,
        companyId,
        data.companyName,
        data.jobTitle,
        data.jobUrl || null,
        data.location || null,
        data.salaryMin || null,
        data.salaryMax || null,
        data.notes || data.jobTitle,
      ]
    );
    const jobId = jobRes.rows[0].id;

    // 3. Create application
    const salaryRangeStr = data.salaryMin ? (data.salaryMax ? `$${data.salaryMin} - $${data.salaryMax}` : `$${data.salaryMin}+`) : null;
    const appRes = await db.query(
      `INSERT INTO job_applications (user_id, company_id, job_id, company_name, job_title, job_url, location, status, application_date, salary_range, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        data.userId,
        companyId,
        jobId,
        data.companyName,
        data.jobTitle,
        data.jobUrl || null,
        data.location || null,
        data.status || 'applied',
        data.appliedDate || new Date(),
        salaryRangeStr,
        data.notes || null,
      ]
    );
    const application = appRes.rows[0];

    // 4. Log initial status history
    await db.query(
      `INSERT INTO application_status_history (application_id, user_id, from_status, to_status, notes)
       VALUES ($1, $2, NULL, $3, 'Created via Admin Control Center')`,
      [application.id, data.userId, data.status || 'applied']
    );

    if (data.notes) {
      await db.query(
        `INSERT INTO application_notes (application_id, user_id, content) VALUES ($1, $2, $3)`,
        [application.id, data.userId, data.notes]
      );
    }

    return application;
  }

  async updateApplication(id: string, data: {
    status?: string;
    salaryRange?: string;
    notes?: string;
    priority?: string;
  }) {
    const current = await db.query(`SELECT status, user_id FROM job_applications WHERE id = $1`, [id]);
    if (current.rows.length === 0) return null;

    const oldStatus = current.rows[0].status;
    const userId = current.rows[0].user_id;

    const res = await db.query(
      `UPDATE job_applications
       SET status = COALESCE($2, status),
           salary_range = COALESCE($3, salary_range),
           notes = COALESCE($4, notes),
           priority = COALESCE($5, priority),
           updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id, data.status, data.salaryRange, data.notes, data.priority]
    );

    if (data.status && data.status !== oldStatus) {
      await db.query(
        `INSERT INTO application_status_history (application_id, user_id, from_status, to_status, notes)
         VALUES ($1, $2, $3, $4, 'Status updated via Super Admin Control Center')`,
        [id, userId, oldStatus, data.status]
      );
    }

    return res.rows[0];
  }

  async softDeleteApplication(id: string) {
    const res = await db.query(
      `UPDATE job_applications SET is_deleted = true, deleted_at = NOW(), updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id]
    );
    return res.rows[0] || null;
  }

  // ==========================================
  // COMPANIES & JOBS (ADMIN FULL CRUD)
  // ==========================================
  async getAllCompanies(options?: { search?: string; limit?: number; offset?: number }) {
    const conditions: string[] = ['1=1'];
    const params: any[] = [];
    let idx = 1;

    if (options?.search) {
      conditions.push(`(c.name ILIKE $${idx} OR c.industry ILIKE $${idx} OR c.location ILIKE $${idx})`);
      params.push(`%${options.search}%`);
      idx++;
    }

    const limit = options?.limit || 50;
    const offset = options?.offset || 0;

    const countRes = await db.query(`SELECT COUNT(*) FROM companies c WHERE ${conditions.join(' AND ')}`, params);
    const total = parseInt(countRes.rows[0].count, 10);

    params.push(limit, offset);
    const query = `
      SELECT c.*, 
             u.email AS created_by_email,
             (SELECT COUNT(*) FROM jobs j WHERE j.company_id = c.id) AS jobs_count,
             (SELECT COUNT(*) FROM job_applications a WHERE a.company_id = c.id) AS applications_count
      FROM companies c
      LEFT JOIN users u ON u.id = c.user_id
      WHERE ${conditions.join(' AND ')}
      ORDER BY c.created_at DESC
      LIMIT $${idx} OFFSET $${idx + 1}
    `;

    const res = await db.query(query, params);
    return { companies: res.rows, total };
  }

  async createCompany(data: {
    userId: string;
    name: string;
    website?: string;
    industry?: string;
    location?: string;
    description?: string;
  }) {
    const res = await db.query(
      `INSERT INTO companies (user_id, name, website, industry, location, description)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [data.userId, data.name, data.website || null, data.industry || null, data.location || null, data.description || null]
    );
    return res.rows[0];
  }

  async updateCompany(id: string, data: {
    name?: string;
    website?: string;
    industry?: string;
    location?: string;
    description?: string;
  }) {
    const res = await db.query(
      `UPDATE companies
       SET name = COALESCE($2, name),
           website = COALESCE($3, website),
           industry = COALESCE($4, industry),
           location = COALESCE($5, location),
           description = COALESCE($6, description),
           updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id, data.name, data.website, data.industry, data.location, data.description]
    );
    return res.rows[0] || null;
  }

  async deleteCompany(id: string) {
    const res = await db.query(`DELETE FROM companies WHERE id = $1 RETURNING *`, [id]);
    return res.rows[0] || null;
  }

  async getAllJobs(options?: { search?: string; limit?: number; offset?: number }) {
    const conditions: string[] = ['1=1'];
    const params: any[] = [];
    let idx = 1;

    if (options?.search) {
      conditions.push(`(j.title ILIKE $${idx} OR c.name ILIKE $${idx} OR j.location ILIKE $${idx})`);
      params.push(`%${options.search}%`);
      idx++;
    }

    const limit = options?.limit || 50;
    const offset = options?.offset || 0;

    const countRes = await db.query(
      `SELECT COUNT(*) FROM jobs j LEFT JOIN companies c ON c.id = j.company_id WHERE ${conditions.join(' AND ')}`,
      params
    );
    const total = parseInt(countRes.rows[0].count, 10);

    params.push(limit, offset);
    const query = `
      SELECT j.*, c.name AS company_name, c.website AS company_website,
             u.email AS user_email,
             (SELECT COUNT(*) FROM job_applications a WHERE a.job_id = j.id) AS applications_count
      FROM jobs j
      LEFT JOIN companies c ON c.id = j.company_id
      LEFT JOIN users u ON u.id = j.user_id
      WHERE ${conditions.join(' AND ')}
      ORDER BY j.created_at DESC
      LIMIT $${idx} OFFSET $${idx + 1}
    `;

    const res = await db.query(query, params);
    return { jobs: res.rows, total };
  }

  async createJob(data: {
    userId: string;
    companyId?: string;
    companyName?: string;
    title: string;
    jobUrl?: string;
    location?: string;
    employmentType?: string;
    salaryMin?: number;
    salaryMax?: number;
    description?: string;
    requirements?: any;
  }) {
    let companyName = data.companyName || 'Confidential';
    if (!data.companyName && data.companyId) {
      const compRes = await db.query(`SELECT name FROM companies WHERE id = $1`, [data.companyId]);
      if (compRes.rows[0]?.name) companyName = compRes.rows[0].name;
    }

    const res = await db.query(
      `INSERT INTO jobs (user_id, company_id, company_name, title, job_url, location, employment_type, salary_min, salary_max, raw_description, required_skills)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        data.userId,
        data.companyId || null,
        companyName,
        data.title,
        data.jobUrl || null,
        data.location || null,
        data.employmentType || 'full_time',
        data.salaryMin || null,
        data.salaryMax || null,
        data.description || data.title,
        JSON.stringify(data.requirements || []),
      ]
    );
    return res.rows[0];
  }

  async updateJob(id: string, data: {
    title?: string;
    location?: string;
    employmentType?: string;
    salaryMin?: number;
    salaryMax?: number;
    description?: string;
    status?: string;
  }) {
    const res = await db.query(
      `UPDATE jobs
       SET title = COALESCE($2, title),
           location = COALESCE($3, location),
           employment_type = COALESCE($4, employment_type),
           salary_min = COALESCE($5, salary_min),
           salary_max = COALESCE($6, salary_max),
           raw_description = COALESCE($7, raw_description),
           status = COALESCE($8, status),
           updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id, data.title, data.location, data.employmentType, data.salaryMin, data.salaryMax, data.description, data.status]
    );
    return res.rows[0] || null;
  }

  async deleteJob(id: string) {
    const res = await db.query(`DELETE FROM jobs WHERE id = $1 RETURNING *`, [id]);
    return res.rows[0] || null;
  }

  // ==========================================
  // RESUME VERSION TRACKING
  // ==========================================
  async getAllVersions(options?: { search?: string; status?: string; limit?: number; offset?: number }) {
    const conditions: string[] = ['1=1'];
    const params: any[] = [];
    let idx = 1;

    if (options?.status && options.status !== 'all') {
      conditions.push(`v.status = $${idx}`);
      params.push(options.status);
      idx++;
    }

    if (options?.search) {
      conditions.push(`(r.title ILIKE $${idx} OR u.email ILIKE $${idx} OR c.name ILIKE $${idx} OR j.title ILIKE $${idx})`);
      params.push(`%${options.search}%`);
      idx++;
    }

    const limit = options?.limit || 50;
    const offset = options?.offset || 0;

    const countRes = await db.query(
      `SELECT COUNT(*) FROM resume_versions v
       JOIN resumes r ON r.id = v.resume_id
       JOIN users u ON u.id = v.user_id
       LEFT JOIN jobs j ON j.id = v.job_id
       LEFT JOIN companies c ON c.id = j.company_id
       WHERE ${conditions.join(' AND ')}`,
      params
    );
    const total = parseInt(countRes.rows[0].count, 10);

    params.push(limit, offset);
    const query = `
      SELECT v.*,
             r.title AS parent_resume_title,
             u.email AS user_email, u.first_name AS user_first_name, u.last_name AS user_last_name,
             j.title AS target_job_title, c.name AS target_company_name
      FROM resume_versions v
      JOIN resumes r ON r.id = v.resume_id
      JOIN users u ON u.id = v.user_id
      LEFT JOIN jobs j ON j.id = v.job_id
      LEFT JOIN companies c ON c.id = j.company_id
      WHERE ${conditions.join(' AND ')}
      ORDER BY v.created_at DESC
      LIMIT $${idx} OFFSET $${idx + 1}
    `;

    const res = await db.query(query, params);
    return { versions: res.rows, total };
  }

  async deleteVersion(id: string) {
    const res = await db.query(`DELETE FROM resume_versions WHERE id = $1 RETURNING *`, [id]);
    return res.rows[0] || null;
  }

  // ==========================================
  // SUBSCRIPTION & BILLING MANAGEMENT
  // ==========================================
  async getAllSubscriptions(options?: { status?: string; planId?: string; limit?: number; offset?: number }) {
    const conditions: string[] = ['1=1'];
    const params: any[] = [];
    let idx = 1;

    if (options?.status && options.status !== 'all') {
      conditions.push(`s.status = $${idx}`);
      params.push(options.status);
      idx++;
    }

    if (options?.planId) {
      conditions.push(`s.plan_id = $${idx}`);
      params.push(options.planId);
      idx++;
    }

    const limit = options?.limit || 50;
    const offset = options?.offset || 0;

    const countRes = await db.query(
      `SELECT COUNT(*) FROM user_subscriptions s JOIN users u ON u.id = s.user_id WHERE ${conditions.join(' AND ')}`,
      params
    );
    const total = parseInt(countRes.rows[0].count, 10);

    params.push(limit, offset);
    const query = `
      SELECT s.*,
             p.name AS plan_name, p.slug AS plan_slug, p.price_monthly, p.price_yearly,
             u.email AS user_email, u.first_name AS user_first_name, u.last_name AS user_last_name
      FROM user_subscriptions s
      JOIN subscription_plans p ON p.id = s.plan_id
      JOIN users u ON u.id = s.user_id
      WHERE ${conditions.join(' AND ')}
      ORDER BY s.created_at DESC
      LIMIT $${idx} OFFSET $${idx + 1}
    `;

    const res = await db.query(query, params);
    return { subscriptions: res.rows, total };
  }

  async getAllPlans() {
    const res = await db.query(`SELECT * FROM subscription_plans ORDER BY price_monthly ASC`);
    return res.rows;
  }

  async createPlan(data: {
    name: string;
    slug: string;
    description: string;
    priceMonthly: number;
    priceYearly: number;
    features: any;
    limits: any;
    isActive?: boolean;
  }) {
    const res = await db.query(
      `INSERT INTO subscription_plans (name, slug, description, price_monthly, price_yearly, features, limits, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        data.name,
        data.slug.toLowerCase().replace(/\s+/g, '-'),
        data.description,
        data.priceMonthly,
        data.priceYearly,
        JSON.stringify(data.features || []),
        JSON.stringify(data.limits || {}),
        data.isActive !== undefined ? data.isActive : true,
      ]
    );
    return res.rows[0];
  }

  async updatePlan(id: string, data: {
    name?: string;
    description?: string;
    priceMonthly?: number;
    priceYearly?: number;
    features?: any;
    limits?: any;
    isActive?: boolean;
  }) {
    const res = await db.query(
      `UPDATE subscription_plans
       SET name = COALESCE($2, name),
           description = COALESCE($3, description),
           price_monthly = COALESCE($4, price_monthly),
           price_yearly = COALESCE($5, price_yearly),
           features = COALESCE($6, features),
           limits = COALESCE($7, limits),
           is_active = COALESCE($8, is_active),
           updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [
        id,
        data.name,
        data.description,
        data.priceMonthly,
        data.priceYearly,
        data.features ? JSON.stringify(data.features) : null,
        data.limits ? JSON.stringify(data.limits) : null,
        data.isActive,
      ]
    );
    return res.rows[0] || null;
  }

  async updateUserSubscription(userId: string, planId: string, status: string = 'active') {
    // Check if subscription exists
    const existing = await db.query(`SELECT id FROM user_subscriptions WHERE user_id = $1 LIMIT 1`, [userId]);
    if (existing.rows.length > 0) {
      const res = await db.query(
        `UPDATE user_subscriptions
         SET plan_id = $2, status = $3, current_period_end = NOW() + INTERVAL '30 days', updated_at = NOW()
         WHERE user_id = $1
         RETURNING *`,
        [userId, planId, status]
      );
      return res.rows[0];
    } else {
      const res = await db.query(
        `INSERT INTO user_subscriptions (user_id, plan_id, status, current_period_start, current_period_end)
         VALUES ($1, $2, $3, NOW(), NOW() + INTERVAL '30 days')
         RETURNING *`,
        [userId, planId, status]
      );
      return res.rows[0];
    }
  }

  async cancelUserSubscription(userId: string) {
    const res = await db.query(
      `UPDATE user_subscriptions 
       SET status = 'canceled', cancel_at_period_end = true, updated_at = NOW() 
       WHERE user_id = $1 RETURNING *`,
      [userId]
    );
    return res.rows[0] || null;
  }

  async getAllPayments(options?: { status?: string; limit?: number; offset?: number }) {
    const conditions: string[] = ['1=1'];
    const params: any[] = [];
    let idx = 1;

    if (options?.status && options.status !== 'all') {
      conditions.push(`p.status = $${idx}`);
      params.push(options.status);
      idx++;
    }

    const limit = options?.limit || 50;
    const offset = options?.offset || 0;

    const countRes = await db.query(`SELECT COUNT(*) FROM payments p WHERE ${conditions.join(' AND ')}`, params);
    const total = parseInt(countRes.rows[0].count, 10);

    params.push(limit, offset);
    const query = `
      SELECT p.*, u.email AS user_email, u.first_name AS user_first_name, u.last_name AS user_last_name
      FROM payments p
      JOIN users u ON u.id = p.user_id
      WHERE ${conditions.join(' AND ')}
      ORDER BY p.created_at DESC
      LIMIT $${idx} OFFSET $${idx + 1}
    `;

    const res = await db.query(query, params);
    return { payments: res.rows, total };
  }

  // ==========================================
  // ROLES & PERMISSION MATRIX (GRANULAR RBAC)
  // ==========================================
  async getAllRoles() {
    const res = await db.query(`
      SELECT r.*,
             (SELECT COUNT(*) FROM user_roles ur WHERE ur.role_id = r.id) AS users_count,
             (SELECT COUNT(*) FROM role_permissions rp WHERE rp.role_id = r.id) AS permissions_count
      FROM roles r
      ORDER BY r.is_system DESC, r.name ASC
    `);
    return res.rows;
  }

  async createRole(data: { name: string; displayName: string; description: string }) {
    const res = await db.query(
      `INSERT INTO roles (name, display_name, description, is_system)
       VALUES ($1, $2, $3, false)
       RETURNING *`,
      [data.name.toLowerCase().replace(/\s+/g, '_'), data.displayName, data.description]
    );
    return res.rows[0];
  }

  async updateRole(id: string, data: { displayName?: string; description?: string }) {
    const res = await db.query(
      `UPDATE roles
       SET display_name = COALESCE($2, display_name),
           description = COALESCE($3, description),
           updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id, data.displayName, data.description]
    );
    return res.rows[0] || null;
  }

  async deleteRole(id: string) {
    const role = await db.query(`SELECT is_system FROM roles WHERE id = $1`, [id]);
    if (role.rows[0]?.is_system) {
      throw new Error('System roles cannot be deleted.');
    }
    const res = await db.query(`DELETE FROM roles WHERE id = $1 RETURNING *`, [id]);
    return res.rows[0] || null;
  }

  async getAllPermissions() {
    const res = await db.query(`SELECT * FROM permissions ORDER BY module ASC, code ASC`);
    return res.rows;
  }

  async getRolePermissions(roleId: string) {
    const res = await db.query(
      `SELECT p.id, p.code, p.module, p.description
       FROM permissions p
       JOIN role_permissions rp ON rp.permission_id = p.id
       WHERE rp.role_id = $1`,
      [roleId]
    );
    return res.rows;
  }

  async updateRolePermissions(roleId: string, permissionIds: string[]) {
    // Cannot alter super_admin permission set
    const roleCheck = await db.query(`SELECT name FROM roles WHERE id = $1`, [roleId]);
    if (roleCheck.rows[0]?.name === 'super_admin') {
      throw new Error('Super Admin role must retain all permissions unconditionally.');
    }

    await db.query(`DELETE FROM role_permissions WHERE role_id = $1`, [roleId]);
    if (permissionIds.length > 0) {
      const values = permissionIds.map((_, i) => `($1, $${i + 2})`).join(', ');
      await db.query(
        `INSERT INTO role_permissions (role_id, permission_id) VALUES ${values} ON CONFLICT DO NOTHING`,
        [roleId, ...permissionIds]
      );
    }
    return this.getRolePermissions(roleId);
  }

  async getAdminStaff() {
    const res = await db.query(`
      SELECT u.id, u.email, u.first_name, u.last_name, u.role, u.is_active, u.is_suspended, u.last_login_at, u.created_at,
             r.id AS role_id, r.name AS role_name, r.display_name AS role_display_name
      FROM users u
      LEFT JOIN user_roles ur ON ur.user_id = u.id
      LEFT JOIN roles r ON r.id = ur.role_id
      WHERE u.role IN ('super_admin', 'admin', 'support_admin', 'resume_manager', 'analyst')
      ORDER BY u.created_at ASC
    `);
    return res.rows;
  }

  // ==========================================
  // COMMUNICATION & SUPPORT TICKETS
  // ==========================================
  async getAllAnnouncements() {
    const res = await db.query(`
      SELECT a.*, u.email AS created_by_email, u.first_name AS created_by_first_name
      FROM system_announcements a
      LEFT JOIN users u ON u.id = a.created_by
      ORDER BY a.created_at DESC
    `);
    return res.rows;
  }

  async createAnnouncement(data: {
    title: string;
    message: string;
    priority?: string;
    targetAudience?: string;
    createdBy?: string;
    expiresAt?: string;
  }) {
    const res = await db.query(
      `INSERT INTO system_announcements (title, message, priority, target_audience, created_by, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        data.title,
        data.message,
        data.priority || 'normal',
        data.targetAudience || 'all',
        data.createdBy || null,
        data.expiresAt || null,
      ]
    );
    return res.rows[0];
  }

  async updateAnnouncement(id: string, data: {
    title?: string;
    message?: string;
    priority?: string;
    targetAudience?: string;
    isActive?: boolean;
  }) {
    const res = await db.query(
      `UPDATE system_announcements
       SET title = COALESCE($2, title),
           message = COALESCE($3, message),
           priority = COALESCE($4, priority),
           target_audience = COALESCE($5, target_audience),
           is_active = COALESCE($6, is_active),
           updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id, data.title, data.message, data.priority, data.targetAudience, data.isActive]
    );
    return res.rows[0] || null;
  }

  async deleteAnnouncement(id: string) {
    const res = await db.query(`DELETE FROM system_announcements WHERE id = $1 RETURNING *`, [id]);
    return res.rows[0] || null;
  }

  async broadcastNotification(data: {
    title: string;
    message: string;
    type?: string;
    link?: string;
    targetAudience?: string;
  }) {
    let targetQuery = `SELECT id FROM users WHERE is_active = true AND (is_deleted = false OR is_deleted IS NULL)`;
    if (data.targetAudience === 'admins') {
      targetQuery += ` AND role IN ('super_admin', 'admin', 'support_admin')`;
    }

    const usersRes = await db.query(targetQuery);
    const userIds: string[] = usersRes.rows.map((r: any) => r.id);

    if (userIds.length > 0) {
      for (const uid of userIds) {
        await db.query(
          `INSERT INTO notifications (user_id, title, message, type, link)
           VALUES ($1, $2, $3, $4, $5)`,
          [uid, data.title, data.message, data.type || 'system', data.link || null]
        );
      }
    }

    return { deliveredCount: userIds.length };
  }

  async getAllSupportTickets(options?: { status?: string; priority?: string; limit?: number; offset?: number }) {
    const conditions: string[] = ['1=1'];
    const params: any[] = [];
    let idx = 1;

    if (options?.status && options.status !== 'all') {
      conditions.push(`t.status = $${idx}`);
      params.push(options.status);
      idx++;
    }

    if (options?.priority && options.priority !== 'all') {
      conditions.push(`t.priority = $${idx}`);
      params.push(options.priority);
      idx++;
    }

    const limit = options?.limit || 50;
    const offset = options?.offset || 0;

    const countRes = await db.query(`SELECT COUNT(*) FROM support_tickets t WHERE ${conditions.join(' AND ')}`, params);
    const total = parseInt(countRes.rows[0].count, 10);

    params.push(limit, offset);
    const query = `
      SELECT t.*, u.email AS user_email, u.first_name AS user_first_name, u.last_name AS user_last_name
      FROM support_tickets t
      JOIN users u ON u.id = t.user_id
      WHERE ${conditions.join(' AND ')}
      ORDER BY 
        CASE t.priority 
          WHEN 'urgent' THEN 1 
          WHEN 'high' THEN 2 
          WHEN 'medium' THEN 3 
          ELSE 4 
        END,
        t.created_at DESC
      LIMIT $${idx} OFFSET $${idx + 1}
    `;

    const res = await db.query(query, params);
    return { tickets: res.rows, total };
  }

  async respondToTicket(id: string, adminResponse: string, status: string = 'resolved') {
    const res = await db.query(
      `UPDATE support_tickets
       SET admin_response = $2, status = $3, updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id, adminResponse, status]
    );

    if (res.rows.length > 0) {
      const ticket = res.rows[0];
      // Notify the ticket owner
      await db.query(
        `INSERT INTO notifications (user_id, title, message, type)
         VALUES ($1, 'Support Ticket Update', $2, 'info')`,
        [ticket.user_id, `Your ticket "${ticket.subject}" has received an administrative response: ${adminResponse}`]
      );
    }

    return res.rows[0] || null;
  }

  // ==========================================
  // SECURITY & AUDIT
  // ==========================================
  async getAllSessions(limit: number = 50) {
    const res = await db.query(
      `SELECT s.*, u.email AS user_email, u.first_name AS user_first_name, u.last_name AS user_last_name, u.role AS user_role
       FROM user_sessions s
       JOIN users u ON u.id = s.user_id
       ORDER BY s.last_activity_at DESC
       LIMIT $1`,
      [limit]
    );
    return res.rows;
  }

  async revokeSession(sessionId: string) {
    const res = await db.query(`DELETE FROM user_sessions WHERE id = $1 RETURNING *`, [sessionId]);
    return res.rows[0] || null;
  }

  async getAllIpRules() {
    const res = await db.query(`
      SELECT r.*, u.email AS created_by_email
      FROM ip_access_rules r
      LEFT JOIN users u ON u.id = r.created_by
      ORDER BY r.created_at DESC
    `);
    return res.rows;
  }

  async createIpRule(data: { ipAddress: string; ruleType: 'allow' | 'block'; description?: string; createdBy?: string }) {
    const res = await db.query(
      `INSERT INTO ip_access_rules (ip_address, rule_type, description, created_by)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [data.ipAddress, data.ruleType, data.description || null, data.createdBy || null]
    );
    return res.rows[0];
  }

  async deleteIpRule(id: string) {
    const res = await db.query(`DELETE FROM ip_access_rules WHERE id = $1 RETURNING *`, [id]);
    return res.rows[0] || null;
  }

  // ==========================================
  // REPORTS & EXPORTS
  // ==========================================
  async getUserGrowthReport() {
    const res = await db.query(`
      SELECT 
        TO_CHAR(created_at, 'YYYY-MM') AS month,
        COUNT(*) AS registrations,
        COUNT(CASE WHEN role = 'super_admin' OR role = 'admin' THEN 1 END) AS admin_users,
        COUNT(CASE WHEN is_active = true THEN 1 END) AS active_users
      FROM users
      GROUP BY TO_CHAR(created_at, 'YYYY-MM')
      ORDER BY month DESC
      LIMIT 12
    `);
    return res.rows;
  }

  async getResumeStatsReport() {
    const res = await db.query(`
      SELECT 
        category,
        COUNT(*) AS total_resumes,
        COUNT(CASE WHEN is_primary = true THEN 1 END) AS primary_resumes,
        (SELECT COUNT(*) FROM resume_versions v WHERE v.resume_id = r.id) AS total_versions
      FROM resumes r
      WHERE is_deleted = false OR is_deleted IS NULL
      GROUP BY category, r.id
      ORDER BY total_resumes DESC
    `);
    return res.rows;
  }

  async getAiPerformanceReport() {
    const res = await db.query(`
      SELECT 
        operation_type,
        model,
        COUNT(*) AS total_requests,
        COALESCE(SUM(total_tokens), 0) AS total_tokens,
        ROUND(COALESCE(AVG(duration_ms), 0)) AS avg_latency_ms
      FROM ai_usage_logs
      GROUP BY operation_type, model
      ORDER BY total_requests DESC
    `);
    return res.rows;
  }

  async getApplicationFunnelReport() {
    const res = await db.query(`
      SELECT 
        status,
        COUNT(*) AS count,
        ROUND(COUNT(*)::numeric / NULLIF((SELECT COUNT(*) FROM job_applications), 0) * 100, 1) AS percentage
      FROM job_applications
      GROUP BY status
      ORDER BY count DESC
    `);
    return res.rows;
  }

  async getRevenueReport() {
    const res = await db.query(`
      SELECT 
        TO_CHAR(created_at, 'YYYY-MM') AS month,
        COUNT(*) AS transaction_count,
        COALESCE(SUM(amount), 0) AS revenue
      FROM payments
      WHERE status = 'completed'
      GROUP BY TO_CHAR(created_at, 'YYYY-MM')
      ORDER BY month DESC
      LIMIT 12
    `);
    return res.rows;
  }

  // ==========================================
  // SYSTEM HEALTH & TELEMETRY
  // ==========================================
  async getSystemHealth() {
    const uptimeSeconds = process.uptime();
    const memory = process.memoryUsage();

    // Query PostgreSQL health
    const dbRes = await db.query(`
      SELECT 
        current_database() AS database_name,
        version() AS postgres_version,
        (SELECT count(*) FROM pg_stat_activity) AS active_connections,
        pg_size_pretty(pg_database_size(current_database())) AS database_size
    `);

    // Table counts
    const tableCounts = await db.query(`
      SELECT 
        (SELECT count(*) FROM users) AS users_count,
        (SELECT count(*) FROM resumes) AS resumes_count,
        (SELECT count(*) FROM job_applications) AS applications_count,
        (SELECT count(*) FROM ai_usage_logs) AS ai_logs_count,
        (SELECT count(*) FROM audit_logs) AS audit_logs_count,
        (SELECT count(*) FROM user_sessions) AS sessions_count
    `);

    return {
      status: 'healthy',
      nodeVersion: process.version,
      uptimeSeconds: Math.floor(uptimeSeconds),
      memoryUsageMB: {
        rss: Math.round(memory.rss / 1024 / 1024),
        heapTotal: Math.round(memory.heapTotal / 1024 / 1024),
        heapUsed: Math.round(memory.heapUsed / 1024 / 1024),
      },
      database: dbRes.rows[0],
      tableCounts: tableCounts.rows[0],
      timestamp: new Date().toISOString(),
    };
  }

  // ==========================================
  // EXISTING METHODS (AI PROMPTS, SETTINGS, TEMPLATES, AUDIT)
  // ==========================================
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

  async getAuditLogs(limit: number = 100) {
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

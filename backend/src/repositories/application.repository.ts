import { db } from '../config/db.js';
import { resumeVersionRepository } from './resume-version.repository.js';

export class ApplicationRepository {
  async findAll(userId: string, filters?: { status?: string; companyId?: string; search?: string }) {
    const conditions: string[] = ['a.user_id = $1'];
    const params: any[] = [userId];
    let idx = 2;

    if (filters?.status && filters.status !== 'all') {
      conditions.push(`a.status = $${idx}`);
      params.push(filters.status);
      idx++;
    }

    if (filters?.companyId) {
      conditions.push(`a.company_id = $${idx}`);
      params.push(filters.companyId);
      idx++;
    }

    if (filters?.search) {
      conditions.push(`(a.company_name ILIKE $${idx} OR a.job_title ILIKE $${idx})`);
      params.push(`%${filters.search}%`);
      idx++;
    }

    const query = `
      SELECT a.*, 
             c.logo_url AS company_logo,
             v.version_number AS resume_version_number,
             v.version_label AS resume_version_label,
             COUNT(i.id) AS interviews_count
      FROM job_applications a
      LEFT JOIN companies c ON c.id = a.company_id
      LEFT JOIN resume_versions v ON v.id = a.resume_version_id
      LEFT JOIN interviews i ON i.application_id = a.id
      WHERE ${conditions.join(' AND ')}
      GROUP BY a.id, c.logo_url, v.version_number, v.version_label
      ORDER BY a.updated_at DESC
    `;

    const res = await db.query(query, params);
    return res.rows;
  }

  async findById(id: string, userId: string) {
    const query = `
      SELECT a.*, 
             c.logo_url AS company_logo,
             c.website AS company_website,
             v.version_number AS resume_version_number,
             v.version_label AS resume_version_label,
             v.content_snapshot AS linked_version_content
      FROM job_applications a
      LEFT JOIN companies c ON c.id = a.company_id
      LEFT JOIN resume_versions v ON v.id = a.resume_version_id
      WHERE a.id = $1 AND a.user_id = $2
    `;
    const res = await db.query(query, [id, userId]);
    return res.rows[0] || null;
  }

  async create(data: {
    userId: string;
    companyName: string;
    jobTitle: string;
    companyId?: string;
    jobId?: string;
    resumeVersionId?: string;
    jobUrl?: string;
    jobDescription?: string;
    location?: string;
    employmentType?: string;
    salaryRange?: string;
    status?: string;
    priority?: string;
    deadline?: string;
    followUpDate?: string;
    contactPerson?: string;
    contactEmail?: string;
    notes?: string;
  }) {
    return await db.transaction(async (client) => {
      // If company doesn't exist for user, link or create company record
      let compId = data.companyId;
      if (!compId && data.companyName) {
        const compRes = await client.query(
          `SELECT id FROM companies WHERE user_id = $1 AND LOWER(name) = LOWER($2)`,
          [data.userId, data.companyName]
        );
        if (compRes.rows.length > 0) {
          compId = compRes.rows[0].id;
        } else {
          const newComp = await client.query(
            `INSERT INTO companies (user_id, name) VALUES ($1, $2) RETURNING id`,
            [data.userId, data.companyName]
          );
          compId = newComp.rows[0].id;
        }
      }

      // Check if status is applied
      let submittedAt = null;
      let snapshot = null;
      if (data.status === 'applied' && data.resumeVersionId) {
        submittedAt = new Date().toISOString();
        const ver = await resumeVersionRepository.findById(data.resumeVersionId, data.userId);
        if (ver) {
          snapshot = ver.content_snapshot;
          await resumeVersionRepository.lockVersion(data.resumeVersionId, data.userId);
        }
      }

      const res = await client.query(
        `INSERT INTO job_applications (
          user_id, company_id, job_id, resume_version_id, company_name, job_title,
          job_url, job_description, location, employment_type, salary_range,
          status, priority, application_date, submitted_at, submitted_resume_snapshot,
          deadline, follow_up_date, contact_person, contact_email, notes
        ) VALUES (
          $1, $2, $3, $4, $5, $6,
          $7, $8, $9, $10, $11,
          COALESCE($12, 'draft'), COALESCE($13, 'medium'), 
          CASE WHEN $12 = 'applied' THEN NOW() ELSE NULL END,
          $14, $15, $16, $17, $18, $19, $20
        ) RETURNING *`,
        [
          data.userId,
          compId || null,
          data.jobId || null,
          data.resumeVersionId || null,
          data.companyName,
          data.jobTitle,
          data.jobUrl || null,
          data.jobDescription || null,
          data.location || null,
          data.employmentType || 'full_time',
          data.salaryRange || null,
          data.status || 'draft',
          data.priority || 'medium',
          submittedAt,
          snapshot ? JSON.stringify(snapshot) : null,
          data.deadline || null,
          data.followUpDate || null,
          data.contactPerson || null,
          data.contactEmail || null,
          data.notes || null,
        ]
      );

      const app = res.rows[0];

      // Log initial status
      await client.query(
        `INSERT INTO application_status_history (application_id, user_id, from_status, to_status, notes)
         VALUES ($1, $2, NULL, $3, 'Application created')`,
        [app.id, data.userId, app.status]
      );

      return app;
    });
  }

  async update(id: string, userId: string, data: any) {
    const existing = await this.findById(id, userId);
    if (!existing) return null;

    return await db.transaction(async (client) => {
      // Check if status is transitioning to 'applied' or updating resume version
      let submittedAt = existing.submitted_at;
      let snapshot = existing.submitted_resume_snapshot;

      if (data.status === 'applied' && existing.status !== 'applied') {
        submittedAt = new Date().toISOString();
        const vId = data.resume_version_id || existing.resume_version_id;
        if (vId) {
          const ver = await resumeVersionRepository.findById(vId, userId);
          if (ver) {
            snapshot = ver.content_snapshot;
            await resumeVersionRepository.lockVersion(vId, userId);
          }
        }
      }

      const fields: string[] = [];
      const values: any[] = [];
      let idx = 1;

      const allowed = [
        'company_name', 'job_title', 'job_url', 'job_description', 'location',
        'employment_type', 'salary_range', 'status', 'priority', 'deadline',
        'follow_up_date', 'contact_person', 'contact_email', 'notes',
        'resume_version_id', 'company_id'
      ];

      for (const key of allowed) {
        if (data[key] !== undefined) {
          fields.push(`${key} = $${idx}`);
          values.push(data[key]);
          idx++;
        }
      }

      if (submittedAt !== existing.submitted_at) {
        fields.push(`submitted_at = $${idx}`);
        values.push(submittedAt);
        idx++;
      }

      if (snapshot !== existing.submitted_resume_snapshot) {
        fields.push(`submitted_resume_snapshot = $${idx}`);
        values.push(JSON.stringify(snapshot));
        idx++;
      }

      if (fields.length > 0) {
        values.push(id, userId);
        const query = `
          UPDATE job_applications 
          SET ${fields.join(', ')}, updated_at = NOW() 
          WHERE id = $${idx} AND user_id = $${idx + 1}
          RETURNING *
        `;
        const updateRes = await client.query(query, values);

        // Record status change history if changed
        if (data.status && data.status !== existing.status) {
          await client.query(
            `INSERT INTO application_status_history (application_id, user_id, from_status, to_status, notes)
             VALUES ($1, $2, $3, $4, $5)`,
            [id, userId, existing.status, data.status, data.status_notes || `Status updated to ${data.status}`]
          );
        }

        return updateRes.rows[0];
      }

      return existing;
    });
  }

  async delete(id: string, userId: string) {
    const res = await db.query(
      `DELETE FROM job_applications WHERE id = $1 AND user_id = $2 RETURNING id`,
      [id, userId]
    );
    return res.rowCount && res.rowCount > 0;
  }

  async getHistory(id: string, userId: string) {
    const res = await db.query(
      `SELECT * FROM application_status_history 
       WHERE application_id = $1 AND user_id = $2 
       ORDER BY changed_at DESC`,
      [id, userId]
    );
    return res.rows;
  }

  async addNote(id: string, userId: string, content: string) {
    const res = await db.query(
      `INSERT INTO application_notes (application_id, user_id, content)
       VALUES ($1, $2, $3) RETURNING *`,
      [id, userId, content]
    );
    return res.rows[0];
  }

  async getNotes(id: string, userId: string) {
    const res = await db.query(
      `SELECT * FROM application_notes WHERE application_id = $1 AND user_id = $2 ORDER BY created_at DESC`,
      [id, userId]
    );
    return res.rows;
  }
}

export const applicationRepository = new ApplicationRepository();

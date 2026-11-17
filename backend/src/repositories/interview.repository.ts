import { db } from '../config/db.js';

export class InterviewRepository {
  async findAll(userId: string) {
    const res = await db.query(
      `SELECT i.*, a.job_url, a.salary_range
       FROM interviews i
       LEFT JOIN job_applications a ON a.id = i.application_id
       WHERE i.user_id = $1
       ORDER BY i.scheduled_at ASC`,
      [userId]
    );
    return res.rows;
  }

  async findById(id: string, userId: string) {
    const res = await db.query(
      `SELECT i.*, a.job_url, a.salary_range, a.job_description
       FROM interviews i
       LEFT JOIN job_applications a ON a.id = i.application_id
       WHERE i.id = $1 AND i.user_id = $2`,
      [id, userId]
    );
    return res.rows[0] || null;
  }

  async create(data: {
    userId: string;
    applicationId?: string;
    companyName: string;
    jobTitle: string;
    interviewType: string;
    interviewRound?: string;
    scheduledAt: string;
    durationMinutes?: number;
    locationOrUrl?: string;
    interviewerName?: string;
    interviewerEmail?: string;
    preparationNotes?: string;
    aiPrepInsights?: any;
  }) {
    const res = await db.query(
      `INSERT INTO interviews (
        user_id, application_id, company_name, job_title, interview_type,
        interview_round, scheduled_at, duration_minutes, location_or_url,
        interviewer_name, interviewer_email, preparation_notes, ai_prep_insights
      ) VALUES (
        $1, $2, $3, $4, $5,
        COALESCE($6, 'Round 1'), $7, COALESCE($8, 45), $9,
        $10, $11, $12, $13
      ) RETURNING *`,
      [
        data.userId,
        data.applicationId || null,
        data.companyName,
        data.jobTitle,
        data.interviewType,
        data.interviewRound || 'Round 1',
        data.scheduledAt,
        data.durationMinutes || 45,
        data.locationOrUrl || null,
        data.interviewerName || null,
        data.interviewerEmail || null,
        data.preparationNotes || null,
        JSON.stringify(data.aiPrepInsights || {}),
      ]
    );
    return res.rows[0];
  }

  async update(id: string, userId: string, data: any) {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    const allowed = [
      'company_name', 'job_title', 'interview_type', 'interview_round',
      'scheduled_at', 'duration_minutes', 'location_or_url', 'interviewer_name',
      'interviewer_email', 'preparation_notes', 'questions_asked', 'feedback',
      'result', 'follow_up_sent', 'ai_prep_insights'
    ];

    for (const key of allowed) {
      if (data[key] !== undefined) {
        fields.push(`${key} = $${idx}`);
        values.push(typeof data[key] === 'object' && data[key] !== null ? JSON.stringify(data[key]) : data[key]);
        idx++;
      }
    }

    if (fields.length === 0) return null;

    values.push(id, userId);
    const query = `
      UPDATE interviews 
      SET ${fields.join(', ')}, updated_at = NOW() 
      WHERE id = $${idx} AND user_id = $${idx + 1}
      RETURNING *
    `;
    const res = await db.query(query, values);
    return res.rows[0] || null;
  }

  async delete(id: string, userId: string) {
    const res = await db.query(
      `DELETE FROM interviews WHERE id = $1 AND user_id = $2 RETURNING id`,
      [id, userId]
    );
    return res.rowCount && res.rowCount > 0;
  }
}

export const interviewRepository = new InterviewRepository();

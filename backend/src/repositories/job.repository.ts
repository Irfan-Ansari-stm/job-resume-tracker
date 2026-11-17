import { db } from '../config/db.js';

export class JobRepository {
  async findAll(userId: string) {
    const res = await db.query(
      `SELECT j.*, c.logo_url AS company_logo
       FROM jobs j
       LEFT JOIN companies c ON c.id = j.company_id
       WHERE j.user_id = $1
       ORDER BY j.is_favorite DESC, j.created_at DESC`,
      [userId]
    );
    return res.rows;
  }

  async findById(id: string, userId: string) {
    const res = await db.query(
      `SELECT j.*, c.logo_url AS company_logo
       FROM jobs j
       LEFT JOIN companies c ON c.id = j.company_id
       WHERE j.id = $1 AND j.user_id = $2`,
      [id, userId]
    );
    return res.rows[0] || null;
  }

  async create(data: {
    userId: string;
    companyName: string;
    title: string;
    companyId?: string;
    jobUrl?: string;
    location?: string;
    employmentType?: string;
    experienceLevel?: string;
    salaryMin?: number;
    salaryMax?: number;
    currency?: string;
    rawDescription: string;
    requiredSkills?: string[];
    preferredSkills?: string[];
    responsibilities?: string[];
    qualifications?: string[];
    atsKeywords?: string[];
    deadline?: string;
  }) {
    const res = await db.query(
      `INSERT INTO jobs (
        user_id, company_id, company_name, title, job_url, location,
        employment_type, experience_level, salary_min, salary_max, currency,
        raw_description, required_skills, preferred_skills, responsibilities,
        qualifications, ats_keywords, deadline
      ) VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, $8, $9, $10, COALESCE($11, 'USD'),
        $12, $13, $14, $15,
        $16, $17, $18
      ) RETURNING *`,
      [
        data.userId,
        data.companyId || null,
        data.companyName,
        data.title,
        data.jobUrl || null,
        data.location || null,
        data.employmentType || 'full_time',
        data.experienceLevel || 'mid',
        data.salaryMin || null,
        data.salaryMax || null,
        data.currency || 'USD',
        data.rawDescription,
        JSON.stringify(data.requiredSkills || []),
        JSON.stringify(data.preferredSkills || []),
        JSON.stringify(data.responsibilities || []),
        JSON.stringify(data.qualifications || []),
        JSON.stringify(data.atsKeywords || []),
        data.deadline || null,
      ]
    );
    return res.rows[0];
  }

  async update(id: string, userId: string, data: any) {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    const allowed = [
      'title', 'company_name', 'job_url', 'location', 'employment_type',
      'experience_level', 'salary_min', 'salary_max', 'currency', 'raw_description',
      'required_skills', 'preferred_skills', 'responsibilities', 'qualifications',
      'ats_keywords', 'deadline', 'is_favorite', 'status'
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
      UPDATE jobs 
      SET ${fields.join(', ')}, updated_at = NOW() 
      WHERE id = $${idx} AND user_id = $${idx + 1}
      RETURNING *
    `;
    const res = await db.query(query, values);
    return res.rows[0] || null;
  }

  async delete(id: string, userId: string) {
    const res = await db.query(
      `DELETE FROM jobs WHERE id = $1 AND user_id = $2 RETURNING id`,
      [id, userId]
    );
    return res.rowCount && res.rowCount > 0;
  }
}

export const jobRepository = new JobRepository();

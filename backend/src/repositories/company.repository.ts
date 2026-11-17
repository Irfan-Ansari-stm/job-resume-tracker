import { db } from '../config/db.js';

export class CompanyRepository {
  async findAll(userId: string) {
    const res = await db.query(
      `SELECT c.*, 
              COUNT(a.id) AS applications_count
       FROM companies c
       LEFT JOIN job_applications a ON a.company_id = c.id
       WHERE c.user_id = $1
       GROUP BY c.id
       ORDER BY c.is_favorite DESC, c.name ASC`,
      [userId]
    );
    return res.rows;
  }

  async findById(id: string, userId: string) {
    const res = await db.query(
      `SELECT c.*, 
              COUNT(a.id) AS applications_count
       FROM companies c
       LEFT JOIN job_applications a ON a.company_id = c.id
       WHERE c.id = $1 AND c.user_id = $2
       GROUP BY c.id`,
      [id, userId]
    );
    return res.rows[0] || null;
  }

  async create(data: {
    userId: string;
    name: string;
    website?: string;
    careersUrl?: string;
    industry?: string;
    companySize?: string;
    location?: string;
    description?: string;
    notes?: string;
  }) {
    const res = await db.query(
      `INSERT INTO companies (
        user_id, name, website, careers_url, industry, 
        company_size, location, description, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [
        data.userId,
        data.name,
        data.website || null,
        data.careersUrl || null,
        data.industry || null,
        data.companySize || null,
        data.location || null,
        data.description || null,
        data.notes || null,
      ]
    );
    return res.rows[0];
  }

  async update(id: string, userId: string, data: any) {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    const allowed = ['name', 'website', 'careers_url', 'industry', 'company_size', 'location', 'description', 'notes', 'is_favorite'];
    for (const key of allowed) {
      if (data[key] !== undefined) {
        fields.push(`${key} = $${idx}`);
        values.push(data[key]);
        idx++;
      }
    }

    if (fields.length === 0) return null;

    values.push(id, userId);
    const query = `
      UPDATE companies 
      SET ${fields.join(', ')}, updated_at = NOW() 
      WHERE id = $${idx} AND user_id = $${idx + 1}
      RETURNING *
    `;
    const res = await db.query(query, values);
    return res.rows[0] || null;
  }

  async delete(id: string, userId: string) {
    const res = await db.query(
      `DELETE FROM companies WHERE id = $1 AND user_id = $2 RETURNING id`,
      [id, userId]
    );
    return res.rowCount && res.rowCount > 0;
  }
}

export const companyRepository = new CompanyRepository();

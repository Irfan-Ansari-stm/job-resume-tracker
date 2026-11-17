import { db } from '../config/db.js';

export class ResumeRepository {
  async findByUserId(userId: string, includeArchived: boolean = false) {
    const archiveCondition = includeArchived ? '' : 'AND r.is_archived = false';
    const query = `
      SELECT r.*, 
             COUNT(v.id) AS versions_count
      FROM resumes r
      LEFT JOIN resume_versions v ON v.resume_id = r.id
      WHERE r.user_id = $1 ${archiveCondition}
      GROUP BY r.id
      ORDER BY r.is_primary DESC, r.updated_at DESC
    `;
    const res = await db.query(query, [userId]);
    return res.rows;
  }

  async findById(id: string, userId: string) {
    const res = await db.query(
      `SELECT r.*, COUNT(v.id) AS versions_count
       FROM resumes r
       LEFT JOIN resume_versions v ON v.resume_id = r.id
       WHERE r.id = $1 AND r.user_id = $2
       GROUP BY r.id`,
      [id, userId]
    );
    return res.rows[0] || null;
  }

  async create(data: {
    userId: string;
    title: string;
    summary?: string;
    targetRole?: string;
    category?: string;
    isPrimary?: boolean;
    originalFilePath?: string;
    originalFilename?: string;
    parsedData?: any;
    formattingSettings?: any;
  }) {
    return await db.transaction(async (client) => {
      if (data.isPrimary) {
        await client.query(`UPDATE resumes SET is_primary = false WHERE user_id = $1`, [data.userId]);
      }

      const res = await client.query(
        `INSERT INTO resumes (
          user_id, title, summary, target_role, category, is_primary,
          original_file_path, original_filename, parsed_data, formatting_settings
        ) VALUES ($1, $2, $3, $4, COALESCE($5, 'General'), COALESCE($6, false), $7, $8, $9, $10)
        RETURNING *`,
        [
          data.userId,
          data.title,
          data.summary || null,
          data.targetRole || null,
          data.category || 'General',
          data.isPrimary || false,
          data.originalFilePath || null,
          data.originalFilename || null,
          JSON.stringify(data.parsedData || {}),
          JSON.stringify(data.formattingSettings || { font: 'Inter', fontSize: 'medium', margins: 'normal', colorScheme: 'slate' }),
        ]
      );

      const resume = res.rows[0];

      // Automatically create Version 1 (Root baseline version)
      await client.query(
        `INSERT INTO resume_versions (
          resume_id, user_id, version_number, version_label, 
          content_snapshot, change_summary, status
        ) VALUES ($1, $2, 1, 'Initial Baseline Version', $3, 'Original uploaded resume profile snapshot', 'final')`,
        [resume.id, data.userId, JSON.stringify(data.parsedData || {})]
      );

      return resume;
    });
  }

  async update(id: string, userId: string, data: any) {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    const allowed = ['title', 'summary', 'target_role', 'category', 'is_primary', 'parsed_data', 'formatting_settings', 'is_archived'];

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
      UPDATE resumes 
      SET ${fields.join(', ')}, updated_at = NOW() 
      WHERE id = $${idx} AND user_id = $${idx + 1}
      RETURNING *
    `;

    const res = await db.query(query, values);
    return res.rows[0] || null;
  }

  async delete(id: string, userId: string) {
    const res = await db.query(
      `DELETE FROM resumes WHERE id = $1 AND user_id = $2 RETURNING id`,
      [id, userId]
    );
    return res.rowCount && res.rowCount > 0;
  }
}

export const resumeRepository = new ResumeRepository();

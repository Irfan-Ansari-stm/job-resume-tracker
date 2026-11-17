import { db } from '../config/db.js';

export class DocumentRepository {
  async findAll(userId: string, category?: string) {
    const conditions = ['d.user_id = $1'];
    const params: any[] = [userId];

    if (category && category !== 'all') {
      conditions.push('d.category = $2');
      params.push(category);
    }

    const res = await db.query(
      `SELECT d.*, c.name AS company_name, a.job_title AS application_title
       FROM documents d
       LEFT JOIN companies c ON c.id = d.company_id
       LEFT JOIN job_applications a ON a.id = d.application_id
       WHERE ${conditions.join(' AND ')}
       ORDER BY d.created_at DESC`,
      params
    );
    return res.rows;
  }

  async findById(id: string, userId: string) {
    const res = await db.query(
      `SELECT * FROM documents WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );
    return res.rows[0] || null;
  }

  async create(data: {
    userId: string;
    title: string;
    originalFilename: string;
    filePath: string;
    fileSizeBytes: number;
    mimeType: string;
    category: string;
    companyId?: string;
    applicationId?: string;
  }) {
    const res = await db.query(
      `INSERT INTO documents (
        user_id, title, original_filename, file_path, file_size_bytes,
        mime_type, category, company_id, application_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [
        data.userId,
        data.title,
        data.originalFilename,
        data.filePath,
        data.fileSizeBytes,
        data.mimeType,
        data.category,
        data.companyId || null,
        data.applicationId || null,
      ]
    );
    return res.rows[0];
  }

  async delete(id: string, userId: string) {
    const res = await db.query(
      `DELETE FROM documents WHERE id = $1 AND user_id = $2 RETURNING *`,
      [id, userId]
    );
    return res.rows[0] || null;
  }
}

export const documentRepository = new DocumentRepository();

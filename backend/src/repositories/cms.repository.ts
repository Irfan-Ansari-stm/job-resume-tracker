import { db } from '../config/db.js';

export class CmsRepository {
  async getSection(sectionKey: string) {
    const res = await db.query(
      `SELECT * FROM cms_content WHERE section_key = $1`,
      [sectionKey]
    );
    return res.rows[0] || null;
  }

  async getAllSections() {
    const res = await db.query(`SELECT * FROM cms_content ORDER BY section_key ASC`);
    return res.rows;
  }

  async upsertSection(sectionKey: string, title: string, subtitle: string, content: any) {
    const res = await db.query(
      `INSERT INTO cms_content (section_key, title, subtitle, content, updated_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (section_key) DO UPDATE 
       SET title = EXCLUDED.title, subtitle = EXCLUDED.subtitle, content = EXCLUDED.content, updated_at = NOW()
       RETURNING *`,
      [sectionKey, title, subtitle, JSON.stringify(content)]
    );
    return res.rows[0];
  }
}

export const cmsRepository = new CmsRepository();

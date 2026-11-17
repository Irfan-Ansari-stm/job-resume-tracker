import { db } from '../config/db.js';

export interface CreateResumeVersionData {
  resumeId: string;
  userId: string;
  parentVersionId?: string;
  companyName?: string;
  jobTitle?: string;
  versionLabel?: string;
  customizationInstructions?: string;
  aiModelUsed?: string;
  contentSnapshot: any;
  changeSummary?: string;
  matchScore?: number;
  matchedKeywords?: string[];
  missingKeywords?: string[];
  skillsGapReport?: any[];
  status?: string;
  isImmutable?: boolean;
}

export class ResumeVersionRepository {
  async findByResumeId(resumeId: string, userId: string) {
    const res = await db.query(
      `SELECT v.*, r.title AS resume_title 
       FROM resume_versions v
       JOIN resumes r ON r.id = v.resume_id
       WHERE v.resume_id = $1 AND v.user_id = $2
       ORDER BY v.version_number DESC, v.created_at DESC`,
      [resumeId, userId]
    );
    return res.rows;
  }

  async findAllByUserId(userId: string) {
    const res = await db.query(
      `SELECT v.*, r.title AS resume_title 
       FROM resume_versions v
       JOIN resumes r ON r.id = v.resume_id
       WHERE v.user_id = $1
       ORDER BY v.created_at DESC`,
      [userId]
    );
    return res.rows;
  }

  async findById(versionId: string, userId: string) {
    const res = await db.query(
      `SELECT v.*, r.title AS resume_title 
       FROM resume_versions v
       JOIN resumes r ON r.id = v.resume_id
       WHERE v.id = $1 AND v.user_id = $2`,
      [versionId, userId]
    );
    return res.rows[0] || null;
  }

  async getNextVersionNumber(resumeId: string): Promise<number> {
    const res = await db.query(
      `SELECT COALESCE(MAX(version_number), 0) + 1 AS next_ver 
       FROM resume_versions 
       WHERE resume_id = $1`,
      [resumeId]
    );
    return parseInt(res.rows[0].next_ver, 10);
  }

  async create(data: CreateResumeVersionData) {
    const nextVer = await this.getNextVersionNumber(data.resumeId);

    const res = await db.query(
      `INSERT INTO resume_versions (
        resume_id, user_id, parent_version_id, company_name, job_title,
        version_number, version_label, customization_instructions, ai_model_used,
        content_snapshot, change_summary, match_score, matched_keywords,
        missing_keywords, skills_gap_report, status, is_immutable
      ) VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9,
        $10, $11, $12, $13,
        $14, $15, COALESCE($16, 'draft'), COALESCE($17, false)
      ) RETURNING *`,
      [
        data.resumeId,
        data.userId,
        data.parentVersionId || null,
        data.companyName || null,
        data.jobTitle || null,
        nextVer,
        data.versionLabel || `Version ${nextVer}${data.companyName ? ` - ${data.companyName}` : ''}`,
        data.customizationInstructions || null,
        data.aiModelUsed || 'gpt-4o-mini',
        JSON.stringify(data.contentSnapshot),
        data.changeSummary || null,
        data.matchScore || 0,
        JSON.stringify(data.matchedKeywords || []),
        JSON.stringify(data.missingKeywords || []),
        JSON.stringify(data.skillsGapReport || []),
        data.status || 'draft',
        data.isImmutable || false,
      ]
    );

    return res.rows[0];
  }

  async update(id: string, userId: string, data: any) {
    // Check immutability rule
    const existing = await this.findById(id, userId);
    if (!existing) return null;
    if (existing.is_immutable) {
      throw new Error('This resume version is submitted and locked. Submitted versions cannot be modified.');
    }

    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    const allowed = ['version_label', 'notes', 'status', 'content_snapshot'];

    for (const key of allowed) {
      if (data[key] !== undefined) {
        fields.push(`${key} = $${idx}`);
        values.push(typeof data[key] === 'object' && data[key] !== null ? JSON.stringify(data[key]) : data[key]);
        idx++;
      }
    }

    if (fields.length === 0) return existing;

    values.push(id, userId);
    const query = `
      UPDATE resume_versions 
      SET ${fields.join(', ')}, updated_at = NOW() 
      WHERE id = $${idx} AND user_id = $${idx + 1}
      RETURNING *
    `;

    const res = await db.query(query, values);
    return res.rows[0] || null;
  }

  async restoreAsNewVersion(versionId: string, userId: string) {
    const target = await this.findById(versionId, userId);
    if (!target) {
      throw new Error('Target version not found');
    }

    return await this.create({
      resumeId: target.resume_id,
      userId,
      parentVersionId: target.id,
      companyName: target.company_name,
      jobTitle: target.job_title,
      versionLabel: `Restored from v${target.version_number} (${target.version_label})`,
      contentSnapshot: target.content_snapshot,
      changeSummary: `Restored snapshot from historical version ${target.version_number}`,
      matchScore: target.match_score,
      matchedKeywords: target.matched_keywords,
      missingKeywords: target.missing_keywords,
      status: 'draft',
      isImmutable: false,
    });
  }

  async lockVersion(versionId: string, userId: string) {
    const res = await db.query(
      `UPDATE resume_versions 
       SET is_immutable = true, status = 'submitted', updated_at = NOW() 
       WHERE id = $1 AND user_id = $2 
       RETURNING *`,
      [versionId, userId]
    );
    return res.rows[0] || null;
  }
}

export const resumeVersionRepository = new ResumeVersionRepository();

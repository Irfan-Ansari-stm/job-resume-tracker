import { db } from '../config/db.js';

export class AnalyticsRepository {
  async getOverview(userId: string, days?: number) {
    const timeFilter = days ? `AND created_at >= NOW() - INTERVAL '${days} days'` : '';

    const [resumesRes, versionsRes, appsRes, activeAppsRes, interviewsRes, offersRes, creditsRes] = await Promise.all([
      db.query(`SELECT COUNT(*) FROM resumes WHERE user_id = $1 AND is_archived = false`, [userId]),
      db.query(`SELECT COUNT(*) FROM resume_versions WHERE user_id = $1 ${timeFilter}`, [userId]),
      db.query(`SELECT COUNT(*) FROM job_applications WHERE user_id = $1 ${timeFilter}`, [userId]),
      db.query(
        `SELECT COUNT(*) FROM job_applications 
         WHERE user_id = $1 AND status NOT IN ('rejected', 'withdrawn', 'archived') ${timeFilter}`,
        [userId]
      ),
      db.query(
        `SELECT COUNT(*) FROM interviews 
         WHERE user_id = $1 AND scheduled_at >= NOW()`,
        [userId]
      ),
      db.query(
        `SELECT COUNT(*) FROM job_applications 
         WHERE user_id = $1 AND status = 'offer_received' ${timeFilter}`,
        [userId]
      ),
      db.query(
        `SELECT total_credits, used_credits, (total_credits - used_credits) AS remaining_credits 
         FROM user_ai_credits WHERE user_id = $1`,
        [userId]
      ),
    ]);

    return {
      totalResumes: parseInt(resumesRes.rows[0]?.count || '0', 10),
      totalVersions: parseInt(versionsRes.rows[0]?.count || '0', 10),
      totalApplications: parseInt(appsRes.rows[0]?.count || '0', 10),
      activeApplications: parseInt(activeAppsRes.rows[0]?.count || '0', 10),
      upcomingInterviews: parseInt(interviewsRes.rows[0]?.count || '0', 10),
      offersReceived: parseInt(offersRes.rows[0]?.count || '0', 10),
      credits: creditsRes.rows[0] || { total_credits: 25, used_credits: 0, remaining_credits: 25 },
    };
  }

  async getApplicationAnalytics(userId: string) {
    const [statusRes, monthlyRes, companyRes] = await Promise.all([
      db.query(
        `SELECT status, COUNT(*) AS count 
         FROM job_applications 
         WHERE user_id = $1 
         GROUP BY status`,
        [userId]
      ),
      db.query(
        `SELECT TO_CHAR(created_at, 'Mon') AS month, 
                DATE_TRUNC('month', created_at) AS month_date,
                COUNT(*) AS count 
         FROM job_applications 
         WHERE user_id = $1 
         GROUP BY month, month_date 
         ORDER BY month_date ASC 
         LIMIT 6`,
        [userId]
      ),
      db.query(
        `SELECT company_name, COUNT(*) AS count,
                COUNT(CASE WHEN status = 'offer_received' THEN 1 END) AS offers,
                COUNT(CASE WHEN status IN ('interview_scheduled', 'interviewing') THEN 1 END) AS interviews
         FROM job_applications 
         WHERE user_id = $1 
         GROUP BY company_name 
         ORDER BY count DESC 
         LIMIT 8`,
        [userId]
      ),
    ]);

    return {
      byStatus: statusRes.rows,
      byMonth: monthlyRes.rows,
      byCompany: companyRes.rows,
    };
  }

  async getResumeAnalytics(userId: string) {
    const [scoreRes, distRes] = await Promise.all([
      db.query(
        `SELECT AVG(match_score)::int AS avg_score, 
                MAX(match_score) AS max_score, 
                MIN(match_score) AS min_score,
                COUNT(*) AS total_versions 
         FROM resume_versions 
         WHERE user_id = $1 AND match_score > 0`,
        [userId]
      ),
      db.query(
        `SELECT 
           COUNT(CASE WHEN match_score >= 90 THEN 1 END) AS excellent_90_plus,
           COUNT(CASE WHEN match_score >= 80 AND match_score < 90 THEN 1 END) AS good_80_89,
           COUNT(CASE WHEN match_score >= 70 AND match_score < 80 THEN 1 END) AS average_70_79,
           COUNT(CASE WHEN match_score < 70 THEN 1 END) AS needs_work_below_70
         FROM resume_versions 
         WHERE user_id = $1 AND match_score > 0`,
        [userId]
      ),
    ]);

    return {
      scores: scoreRes.rows[0] || { avg_score: 0, total_versions: 0 },
      distribution: distRes.rows[0] || {},
    };
  }

  async getConversionAnalytics(userId: string) {
    const res = await db.query(
      `SELECT 
         COUNT(*) AS total_applied,
         COUNT(CASE WHEN status IN ('interview_scheduled', 'interviewing', 'offer_received') THEN 1 END) AS total_interviews,
         COUNT(CASE WHEN status = 'offer_received' THEN 1 END) AS total_offers,
         COUNT(CASE WHEN status = 'rejected' THEN 1 END) AS total_rejected
       FROM job_applications 
       WHERE user_id = $1 AND status != 'saved'`,
      [userId]
    );

    const row = res.rows[0] || { total_applied: '0', total_interviews: '0', total_offers: '0', total_rejected: '0' };
    const applied = parseInt(row.total_applied, 10);
    const interviews = parseInt(row.total_interviews, 10);
    const offers = parseInt(row.total_offers, 10);
    const rejected = parseInt(row.total_rejected, 10);

    return {
      totalApplied: applied,
      totalInterviews: interviews,
      totalOffers: offers,
      totalRejected: rejected,
      interviewRate: applied > 0 ? Math.round((interviews / applied) * 100) : 0,
      offerRate: interviews > 0 ? Math.round((offers / interviews) * 100) : 0,
      rejectionRate: applied > 0 ? Math.round((rejected / applied) * 100) : 0,
    };
  }
}

export const analyticsRepository = new AnalyticsRepository();

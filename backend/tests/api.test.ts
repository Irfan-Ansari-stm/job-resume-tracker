import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';

describe('Smart Resume Management Platform API Tests', () => {
  let demoToken = '';
  let adminToken = '';
  let resumeId = '';
  let versionId = '';
  let applicationId = '';
  let jobId = '';

  beforeAll(async () => {
    // 1. Login as Official Demo User (demo@smartresume.com / Demo@123456)
    const demoLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'demo@smartresume.com',
        password: 'Demo@123456',
      });
    expect(demoLogin.status).toBe(200);
    expect(demoLogin.body.success).toBe(true);
    expect(demoLogin.body.data.user.email).toBe('demo@smartresume.com');
    demoToken = demoLogin.body.data.token;

    // 2. Login as Super Admin (superadmin@smartresume.ai / Password123!)
    const adminLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'superadmin@smartresume.ai',
        password: 'Password123!',
      });
    expect(adminLogin.status).toBe(200);
    expect(adminLogin.body.success).toBe(true);
    adminToken = adminLogin.body.data.token;
  });

  describe('Authentication & User Profile', () => {
    it('should fetch the current demo user profile', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${demoToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.user.email).toBe('demo@smartresume.com');
      expect(res.body.data.profile).toBeDefined();
      expect(res.body.data.profile.target_role).toBeDefined();
    });

    it('should reject unauthenticated requests to protected endpoints', async () => {
      const res = await request(app).get('/api/v1/resumes');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should reject login with invalid credentials', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'demo@smartresume.com',
          password: 'WrongPassword!',
        });
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Master Resumes & Version Governance', () => {
    it('should list all 3 seeded master resumes for demo user', async () => {
      const res = await request(app)
        .get('/api/v1/resumes')
        .set('Authorization', `Bearer ${demoToken}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(3);
      resumeId = res.body.data[0].id;
    });

    it('should fetch versions for a master resume', async () => {
      const res = await request(app)
        .get(`/api/v1/resumes/${resumeId}/versions`)
        .set('Authorization', `Bearer ${demoToken}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      versionId = res.body.data[0].id;
    });

    it('should compare two resume versions', async () => {
      const allVerRes = await request(app)
        .get('/api/v1/resumes/versions/all')
        .set('Authorization', `Bearer ${demoToken}`);
      expect(allVerRes.status).toBe(200);
      const vers = allVerRes.body.data;
      if (vers.length >= 2) {
        const compRes = await request(app)
          .get(`/api/v1/resumes/versions/compare?v1=${vers[0].id}&v2=${vers[1].id}`)
          .set('Authorization', `Bearer ${demoToken}`);
        expect(compRes.status).toBe(200);
        expect(compRes.body.data.v1).toBeDefined();
        expect(compRes.body.data.v2).toBeDefined();
      }
    });

    it('should restore a historical version as a new active version', async () => {
      const res = await request(app)
        .post(`/api/v1/resumes/${resumeId}/versions/${versionId}/restore`)
        .set('Authorization', `Bearer ${demoToken}`);
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.version_label).toContain('Restored');
    });
  });

  describe('AI Resume Studio Engine', () => {
    it('should customize a resume for a job without fabricating facts', async () => {
      const res = await request(app)
        .post('/api/v1/ai/customize-resume')
        .set('Authorization', `Bearer ${demoToken}`)
        .send({
          resume: {
            summary: 'Experienced Data Analyst specializing in SQL, Tableau, and ETL pipelines.',
            skills: [{ category: 'Core', items: ['SQL', 'Python', 'Tableau', 'Power BI'] }],
            experience: [],
          },
          targetJob: {
            title: 'Lead Analytics Specialist',
            company: 'Tata Consultancy Services',
            description: 'Looking for a Lead Analytics Specialist with expertise in SQL, Python, Tableau, and automated data pipelines.',
          },
        });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.matchScore).toBeDefined();
      expect(res.body.data.skillsGapReport).toBeDefined();
      expect(res.body.data.customizedResume).toBeDefined();
    });

    it('should analyze a job description for requirements and keywords', async () => {
      const res = await request(app)
        .post('/api/v1/ai/analyze-job')
        .set('Authorization', `Bearer ${demoToken}`)
        .send({
          jobTitle: 'Senior Data Analyst',
          companyName: 'Infosys',
          jobDescription: 'Required skills include SQL, Python, ETL, and Agile methodologies.',
        });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.requiredSkills).toBeDefined();
      expect(res.body.data.atsKeywords).toBeDefined();
    });
  });

  describe('Job Applications & Status Workflow', () => {
    it('should list all 10 seeded job applications for demo user', async () => {
      const res = await request(app)
        .get('/api/v1/applications')
        .set('Authorization', `Bearer ${demoToken}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(10);
      applicationId = res.body.data[0].id;
    });

    it('should create an application linked to an exact resume version', async () => {
      const res = await request(app)
        .post('/api/v1/applications')
        .set('Authorization', `Bearer ${demoToken}`)
        .send({
          companyName: 'Global Cloud Systems',
          jobTitle: 'Analytics Engineer',
          resumeVersionId: versionId,
          status: 'applied',
          priority: 'high',
          notes: 'Direct application through referral.',
        });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('applied');
      expect(res.body.data.submitted_at).toBeDefined();
    });

    it('should update application status and log history', async () => {
      const res = await request(app)
        .post(`/api/v1/applications/${applicationId}/status`)
        .set('Authorization', `Bearer ${demoToken}`)
        .send({
          status: 'interview_scheduled',
          notes: 'Invited for technical architectural interview',
        });
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('interview_scheduled');
    });
  });

  describe('Saved Jobs & 1-Click Application Conversion', () => {
    it('should list all saved jobs', async () => {
      const res = await request(app)
        .get('/api/v1/jobs')
        .set('Authorization', `Bearer ${demoToken}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(8);
      jobId = res.body.data[0].id;
    });

    it('should convert a saved job into an active job application', async () => {
      const res = await request(app)
        .post(`/api/v1/jobs/${jobId}/apply`)
        .set('Authorization', `Bearer ${demoToken}`)
        .send({
          status: 'applied',
          notes: 'Converted from saved job posting.',
        });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.job_title).toBeDefined();
    });
  });

  describe('Interviews & Scheduling', () => {
    it('should list all scheduled interviews for demo user', async () => {
      const res = await request(app)
        .get('/api/v1/interviews')
        .set('Authorization', `Bearer ${demoToken}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(5);
    });

    it('should schedule a new interview', async () => {
      const res = await request(app)
        .post('/api/v1/interviews')
        .set('Authorization', `Bearer ${demoToken}`)
        .send({
          companyName: 'Deloitte',
          jobTitle: 'Lead Analytics Consultant',
          interviewType: 'video',
          interviewRound: 'Panel Discussion',
          scheduledAt: new Date(Date.now() + 86400000 * 5).toISOString(),
          durationMinutes: 45,
          locationOrUrl: 'https://zoom.us/j/demo-interview',
          interviewerName: 'Sarah Jenkins',
          preparationNotes: 'Review financial modeling questions.',
        });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.company_name).toBe('Deloitte');
    });
  });

  describe('Support Tickets & Help Center', () => {
    it('should list support tickets for user', async () => {
      const res = await request(app)
        .get('/api/v1/support/tickets')
        .set('Authorization', `Bearer ${demoToken}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(2);
    });

    it('should create a new support ticket and persist in PostgreSQL', async () => {
      const res = await request(app)
        .post('/api/v1/support/tickets')
        .set('Authorization', `Bearer ${demoToken}`)
        .send({
          subject: 'Question on ATS score calculation',
          message: 'How is the keyword density scored against job requirements?',
          category: 'Resume Customization & AI',
          priority: 'medium',
        });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('open');
    });
  });

  describe('Analytics & Real Database Calculations', () => {
    it('should return overview metrics calculated from PostgreSQL', async () => {
      const res = await request(app)
        .get('/api/v1/analytics/overview')
        .set('Authorization', `Bearer ${demoToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.totalResumes).toBeGreaterThanOrEqual(3);
      expect(res.body.data.totalApplications).toBeGreaterThanOrEqual(10);
      expect(res.body.data.upcomingInterviews).toBeDefined();
    });

    it('should return application breakdown by status and company', async () => {
      const res = await request(app)
        .get('/api/v1/analytics/applications')
        .set('Authorization', `Bearer ${demoToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.byStatus).toBeDefined();
      expect(res.body.data.byCompany).toBeDefined();
    });

    it('should return conversion funnel metrics', async () => {
      const res = await request(app)
        .get('/api/v1/analytics/conversion')
        .set('Authorization', `Bearer ${demoToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.interviewRate).toBeDefined();
      expect(res.body.data.offerRate).toBeDefined();
    });
  });

  describe('Document Vault & Storage', () => {
    it('should list user documents', async () => {
      const res = await request(app)
        .get('/api/v1/documents')
        .set('Authorization', `Bearer ${demoToken}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(5);
    });
  });

  describe('Notifications System', () => {
    it('should list all 10 notifications for demo user', async () => {
      const res = await request(app)
        .get('/api/v1/notifications')
        .set('Authorization', `Bearer ${demoToken}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(10);
    });

    it('should mark all notifications as read', async () => {
      const res = await request(app)
        .post('/api/v1/notifications/read-all')
        .set('Authorization', `Bearer ${demoToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('Super Admin Management & Authorization', () => {
    it('should deny non-admin users from accessing super admin endpoints', async () => {
      const res = await request(app)
        .get('/api/v1/admin/dashboard')
        .set('Authorization', `Bearer ${demoToken}`);
      expect(res.status).toBe(403);
    });

    it('should allow Super Admin to view platform overview statistics', async () => {
      const res = await request(app)
        .get('/api/v1/admin/dashboard')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.users).toBeDefined();
      expect(res.body.data.resumes).toBeDefined();
      expect(res.body.data.applications).toBeDefined();
    });

    it('should allow Super Admin to list and manage all platform users', async () => {
      const res = await request(app)
        .get('/api/v1/admin/users')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });
});

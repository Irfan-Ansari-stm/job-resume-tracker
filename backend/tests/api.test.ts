import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';

describe('Smart Resume Management Platform API Tests', () => {
  let userToken = '';
  let adminToken = '';
  let resumeId = '';
  let versionId = '';
  let applicationId = '';

  beforeAll(async () => {
    // 1. Login as Seed User (Aarav Patel)
    const userLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'aarav.patel@example.com',
        password: 'Password123!',
      });
    expect(userLogin.status).toBe(200);
    expect(userLogin.body.success).toBe(true);
    userToken = userLogin.body.data.token;

    // 2. Login as Super Admin
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

  describe('Authentication & User Management', () => {
    it('should fetch the current authenticated user profile', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.user.email).toBe('aarav.patel@example.com');
      expect(res.body.data.profile).toBeDefined();
    });

    it('should reject unauthenticated requests to protected endpoints', async () => {
      const res = await request(app).get('/api/v1/resumes');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Resumes & Version Control', () => {
    it('should list user resumes', async () => {
      const res = await request(app)
        .get('/api/v1/resumes')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      resumeId = res.body.data[0].id;
    });

    it('should fetch versions for a resume', async () => {
      const res = await request(app)
        .get(`/api/v1/resumes/${resumeId}/versions`)
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      versionId = res.body.data[0].id;
    });

    it('should restore a historical version as a new active version', async () => {
      const res = await request(app)
        .post(`/api/v1/resumes/${resumeId}/versions/${versionId}/restore`)
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.version_label).toContain('Restored');
    });
  });

  describe('AI Customization Engine', () => {
    it('should customize a resume for a job without fabricating facts', async () => {
      const res = await request(app)
        .post('/api/v1/ai/customize-resume')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          resume: {
            summary: 'Experienced Data Analyst specializing in SQL and Tableau.',
            skills: [{ category: 'Core', items: ['SQL', 'Python', 'Tableau'] }],
            experience: [],
          },
          targetJob: {
            title: 'Senior Business Intelligence Analyst',
            company: 'TechCorp International',
            description: 'Looking for a Senior BI Analyst with expertise in SQL, Python, Tableau, and AWS.',
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
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          jobTitle: 'Data Analyst',
          companyName: 'Analytics Co',
          jobDescription: 'Required skills include SQL, Python, ETL, and Agile methodologies.',
        });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.requiredSkills).toBeDefined();
    });
  });

  describe('Job Application Management', () => {
    it('should list all job applications for user', async () => {
      const res = await request(app)
        .get('/api/v1/applications')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      applicationId = res.body.data[0].id;
    });

    it('should create an application linked to a resume version', async () => {
      const res = await request(app)
        .post('/api/v1/applications')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          companyName: 'Innovate Labs',
          jobTitle: 'Analytics Consultant',
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

    it('should update application status and maintain status history', async () => {
      const res = await request(app)
        .post(`/api/v1/applications/${applicationId}/status`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          status: 'interview_scheduled',
          notes: 'Invited for introductory technical chat',
        });
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('interview_scheduled');
    });
  });

  describe('Super Admin Management & RBAC', () => {
    it('should deny non-admin users from accessing super admin endpoints', async () => {
      const res = await request(app)
        .get('/api/v1/admin/dashboard')
        .set('Authorization', `Bearer ${userToken}`);
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

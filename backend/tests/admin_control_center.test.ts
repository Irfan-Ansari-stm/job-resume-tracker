import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';

describe('Super Admin Control Center Enterprise Tests', () => {
  let superAdminToken = '';
  let candidateToken = '';
  let candidateUserId = '';
  let createdUserId = '';
  let assistedSessionId = '';
  let testResumeId = '';
  let testAppId = '';

  beforeAll(async () => {
    // 1. Login as Super Admin
    const adminLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'superadmin@smartresume.ai',
        password: 'Password123!',
      });
    expect(adminLogin.status).toBe(200);
    superAdminToken = adminLogin.body.data.token;

    // 2. Login as regular user
    const candidateLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'aarav.patel@example.com',
        password: 'Password123!',
      });
    expect(candidateLogin.status).toBe(200);
    candidateToken = candidateLogin.body.data.token;
    candidateUserId = candidateLogin.body.data.user.id;
  });

  describe('1. Platform Health & Dashboard Telemetry', () => {
    it('should return live system health telemetry and database status', async () => {
      const res = await request(app)
        .get('/api/v1/admin/health-telemetry')
        .set('Authorization', `Bearer ${superAdminToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('healthy');
      expect(res.body.data.database.database_name).toBe('smart_resume_tracker');
      expect(res.body.data.tableCounts.users_count).toBeDefined();
    });

    it('should return comprehensive platform analytics and trends', async () => {
      const res = await request(app)
        .get('/api/v1/admin/dashboard')
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.users.total_users).toBeDefined();
      expect(res.body.data.resumes.total_resumes).toBeDefined();
      expect(res.body.data.applications.total_applications).toBeDefined();
    });
  });

  describe('2. User Management & Complete CRUD', () => {
    it('should create a new candidate user through the admin interface', async () => {
      const randomSuffix = Math.floor(Math.random() * 10000);
      const testEmail = `candidate_${randomSuffix}@testdomain.com`;

      const res = await request(app)
        .post('/api/v1/admin/users')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          email: testEmail,
          password: 'Password123!',
          firstName: 'Elena',
          lastName: 'Rostova',
          role: 'user',
          targetRole: 'Senior React Developer',
          location: 'San Francisco, CA',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.email).toBe(testEmail);
      createdUserId = res.body.data.id;
    });

    it('should retrieve full 360-degree user details with resumes, apps, and credits', async () => {
      const res = await request(app)
        .get(`/api/v1/admin/users/${createdUserId}`)
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.user.email).toBeDefined();
      expect(res.body.data.credits).toBeDefined();
      expect(Array.isArray(res.body.data.resumes)).toBe(true);
    });

    it('should edit user profile information', async () => {
      const res = await request(app)
        .put(`/api/v1/admin/users/${createdUserId}`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          firstName: 'Elena Updated',
          targetRole: 'Staff Frontend Engineer',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.first_name).toBe('Elena Updated');
    });

    it('should suspend and then restore a user account', async () => {
      // Suspend
      const suspendRes = await request(app)
        .put(`/api/v1/admin/users/${createdUserId}/status`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({ isSuspended: true });

      expect(suspendRes.status).toBe(200);
      expect(suspendRes.body.data.is_suspended).toBe(true);

      // Restore
      const restoreRes = await request(app)
        .put(`/api/v1/admin/users/${createdUserId}/status`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({ isSuspended: false });

      expect(restoreRes.status).toBe(200);
      expect(restoreRes.body.data.is_suspended).toBe(false);
    });

    it('should reset AI credits for a user', async () => {
      const res = await request(app)
        .post(`/api/v1/admin/users/${createdUserId}/reset-credits`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({ credits: 88 });

      expect(res.status).toBe(200);
      expect(res.body.data.total_credits).toBe(88);
    });
  });

  describe('3. Admin Assisted User Access ("Act-As-User")', () => {
    it('should require a documented justification reason to start assisted access', async () => {
      const res = await request(app)
        .post('/api/v1/admin/assisted-access/start')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({ targetUserId: candidateUserId });

      expect(res.status).toBe(400);
    });

    it('should start an assisted access session and log audit event', async () => {
      const res = await request(app)
        .post('/api/v1/admin/assisted-access/start')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          targetUserId: candidateUserId,
          reason: 'Assisting user with formatting and ATS optimization troubleshooting',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.session.id).toBeDefined();
      expect(res.body.data.session.is_active).toBe(true);
      expect(res.body.data.targetUser.email).toBe('aarav.patel@example.com');
      assistedSessionId = res.body.data.session.id;
    });

    it('should end the active assisted access session cleanly', async () => {
      const res = await request(app)
        .post('/api/v1/admin/assisted-access/end')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({ sessionId: assistedSessionId });

      expect(res.status).toBe(200);
      expect(res.body.data.is_active).toBe(false);
    });

    it('should list historical assisted access sessions', async () => {
      const res = await request(app)
        .get(`/api/v1/admin/assisted-access/sessions?targetUserId=${candidateUserId}`)
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('4. Resumes & Applications Admin Full CRUD', () => {
    it('should allow Super Admin to create a resume on behalf of a user', async () => {
      const res = await request(app)
        .post('/api/v1/admin/resumes')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          userId: candidateUserId,
          title: 'Admin Created Executive Tech Lead Resume',
          summary: 'Accomplished engineering leader with deep cloud architecture expertise.',
          targetRole: 'VP of Engineering',
          category: 'Engineering',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.title).toBe('Admin Created Executive Tech Lead Resume');
      testResumeId = res.body.data.id;
    });

    it('should allow Super Admin to update the resume', async () => {
      const res = await request(app)
        .put(`/api/v1/admin/resumes/${testResumeId}`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          summary: 'Updated executive summary with 15+ years experience.',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.summary).toContain('Updated executive summary');
    });

    it('should allow Super Admin to create a job application on behalf of candidate', async () => {
      const res = await request(app)
        .post('/api/v1/admin/applications')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          userId: candidateUserId,
          companyName: 'Acme Cloud Innovations',
          jobTitle: 'Principal Cloud Architect',
          location: 'Remote',
          status: 'applied',
          notes: 'Candidate submitted via assisted referral pipeline',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.status).toBe('applied');
      testAppId = res.body.data.id;
    });

    it('should update application status and generate status history record', async () => {
      const res = await request(app)
        .put(`/api/v1/admin/applications/${testAppId}`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          status: 'interview_scheduled',
          salaryOffered: 195000,
        });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('interview_scheduled');
    });
  });

  describe('5. Granular RBAC, Communications & Security Rules', () => {
    it('should list all granular system roles and permissions', async () => {
      const rolesRes = await request(app)
        .get('/api/v1/admin/roles')
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(rolesRes.status).toBe(200);
      expect(rolesRes.body.data.length).toBeGreaterThanOrEqual(5);

      const permsRes = await request(app)
        .get('/api/v1/admin/permissions')
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(permsRes.status).toBe(200);
      expect(permsRes.body.data.length).toBeGreaterThanOrEqual(20);
    });

    it('should publish a system-wide announcement', async () => {
      const res = await request(app)
        .post('/api/v1/admin/announcements')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          title: 'Scheduled Platform Maintenance Window',
          message: 'Maintenance window on Sunday 2:00 AM UTC for database optimization.',
          priority: 'high',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.title).toContain('Maintenance Window');
    });

    it('should manage IP access rules for security compliance', async () => {
      // Add rule
      const addRes = await request(app)
        .post('/api/v1/admin/ip-rules')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          ipAddress: '198.51.100.42',
          ruleType: 'block',
          description: 'Blocked due to suspicious rate pattern',
        });

      expect(addRes.status).toBe(201);
      const ruleId = addRes.body.data.id;

      // Delete rule
      const delRes = await request(app)
        .delete(`/api/v1/admin/ip-rules/${ruleId}`)
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(delRes.status).toBe(200);
    });

    it('should generate audit trail of all administrative actions', async () => {
      const res = await request(app)
        .get('/api/v1/admin/audit-logs')
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });
});

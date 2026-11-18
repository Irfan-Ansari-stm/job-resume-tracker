import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';

describe('SmartResume E2E Full User Journey Tests (20-Step Complete Candidate Lifecycle)', () => {
  let token = '';
  let resumeId = '';
  let versionId = '';
  let companyId = '';
  let savedJobId = '';
  let applicationId = '';
  let interviewId = '';
  let documentId = '';
  let notificationId = '';
  let ticketId = '';

  beforeAll(async () => {
    // 1. Login with Official Demo Credentials
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'demo@smartresume.com',
        password: 'Demo@123456',
      });
    expect(loginRes.status).toBe(200);
    expect(loginRes.body.success).toBe(true);
    expect(loginRes.body.data.user.email).toBe('demo@smartresume.com');
    token = loginRes.body.data.token;
  });

  it('Step 1: Open dashboard and verify database-driven aggregated metrics', async () => {
    const res = await request(app)
      .get('/api/v1/analytics/overview')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalResumes).toBeGreaterThanOrEqual(3);
    expect(res.body.data.totalApplications).toBeGreaterThanOrEqual(10);
    expect(res.body.data.activeApplications).toBeGreaterThanOrEqual(1);
    expect(res.body.data.upcomingInterviews).toBeGreaterThanOrEqual(1);
    expect(res.body.data.offersReceived).toBeGreaterThanOrEqual(1);
  });

  it('Step 2: View existing master resumes list', async () => {
    const res = await request(app)
      .get('/api/v1/resumes')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(3);
    resumeId = res.body.data[0].id;
  });

  it('Step 3: Upload and parse a new resume document', async () => {
    const fakePdfBuffer = Buffer.from('%PDF-1.4 sample resume content for testing purposes');
    const res = await request(app)
      .post('/api/v1/resumes/upload')
      .set('Authorization', `Bearer ${token}`)
      .attach('file', fakePdfBuffer, 'candidate_portfolio_cv.pdf')
      .field('title', 'E2E Test Uploaded Resume')
      .field('category', 'Engineering');

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBeDefined();
    expect(res.body.data.original_filename).toBe('candidate_portfolio_cv.pdf');
  });

  it('Step 4: AI Resume Studio - Customize resume for target job posting', async () => {
    const res = await request(app)
      .post('/api/v1/ai/customize-resume')
      .set('Authorization', `Bearer ${token}`)
      .send({
        resume: {
          summary: 'Accomplished Data Analyst with expertise in SQL, Tableau, and automated reporting.',
          skills: [{ category: 'Core', items: ['SQL', 'Python', 'Tableau', 'Power BI'] }],
          experience: [],
        },
        targetJob: {
          title: 'Senior BI Architect',
          company: 'Tata Consultancy Services',
          description: 'Seeking Senior BI Architect with strong SQL, Tableau, PostgreSQL, and ETL experience.',
        },
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.matchScore).toBeGreaterThanOrEqual(50);
    expect(Array.isArray(res.body.data.matchedKeywords)).toBe(true);
    expect(res.body.data.skillsGapReport).toBeDefined();
    expect(res.body.data.customizedResume).toBeDefined();
  });

  it('Step 5: Save AI-tailored resume version with match score snapshot', async () => {
    const res = await request(app)
      .post(`/api/v1/resumes/${resumeId}/versions`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        companyName: 'Tata Consultancy Services',
        jobTitle: 'Senior BI Architect',
        versionLabel: 'Senior BI Architect – TCS Tailored Version',
        changeSummary: 'Tailored executive summary and highlighted PostgreSQL data pipelines',
        matchScore: 92,
        matchedKeywords: ['SQL', 'Tableau', 'PostgreSQL', 'ETL'],
        missingKeywords: ['Snowflake'],
        skillsGapReport: 'Strong overall alignment with 92% ATS coverage.',
        contentSnapshot: {
          summary: 'Tailored summary for TCS...',
          skills: ['SQL', 'Tableau', 'PostgreSQL', 'ETL'],
        },
        status: 'final',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBeDefined();
    versionId = res.body.data.id;
  });

  it('Step 6: Compare versions and inspect keyword delta', async () => {
    const allVerRes = await request(app)
      .get(`/api/v1/resumes/${resumeId}/versions`)
      .set('Authorization', `Bearer ${token}`);
    expect(allVerRes.status).toBe(200);
    expect(allVerRes.body.data.length).toBeGreaterThanOrEqual(2);

    const v1 = allVerRes.body.data[0].id;
    const v2 = allVerRes.body.data[1].id;

    const compRes = await request(app)
      .get(`/api/v1/resumes/versions/compare?v1=${v1}&v2=${v2}`)
      .set('Authorization', `Bearer ${token}`);
    expect(compRes.status).toBe(200);
    expect(compRes.body.data.v1).toBeDefined();
    expect(compRes.body.data.v2).toBeDefined();
    expect(compRes.body.data.comparison).toBeDefined();
  });

  it('Step 7: Add a target company to company tracker', async () => {
    const res = await request(app)
      .post('/api/v1/companies')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Amazon Web Services',
        industry: 'Cloud Infrastructure & Enterprise Tech',
        location: 'Seattle, WA / Remote',
        website: 'https://aws.amazon.com',
        description: 'Global cloud infrastructure provider.',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Amazon Web Services');
    companyId = res.body.data.id;
  });

  it('Step 8: Save a target job requirement and parse ATS keywords', async () => {
    const res = await request(app)
      .post('/api/v1/jobs')
      .set('Authorization', `Bearer ${token}`)
      .send({
        companyId,
        companyName: 'Amazon Web Services',
        title: 'Senior Solutions Architect',
        rawDescription: 'Requires 5+ years experience in distributed systems, SQL, AWS, Docker, and Kubernetes.',
        location: 'Remote',
        employmentType: 'full_time',
        salaryRange: '$160,000 - $190,000',
        jobUrl: 'https://amazon.jobs/en/jobs/aws-sa',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBeDefined();
    savedJobId = res.body.data.id;
  });

  it('Step 9: Analyze job requirements with deterministic AI analyzer', async () => {
    const res = await request(app)
      .post('/api/v1/ai/analyze-job')
      .set('Authorization', `Bearer ${token}`)
      .send({
        jobTitle: 'Senior Solutions Architect',
        companyName: 'Amazon Web Services',
        jobDescription: 'Required: Distributed systems, SQL, AWS, Docker, and Kubernetes.',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.requiredSkills).toBeDefined();
    expect(res.body.data.atsKeywords).toBeDefined();
  });

  it('Step 10: Convert saved job into active job application', async () => {
    const res = await request(app)
      .post(`/api/v1/jobs/${savedJobId}/apply`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        resumeVersionId: versionId,
        status: 'applied',
        notes: 'Converted from saved AWS role.',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.job_title).toBe('Senior Solutions Architect');
    applicationId = res.body.data.id;
  });

  it('Step 11: Update application status and view status audit history', async () => {
    const res = await request(app)
      .post(`/api/v1/applications/${applicationId}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        status: 'shortlisted',
        notes: 'Recruiter phone screening passed with positive feedback.',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('shortlisted');
  });

  it('Step 12: Schedule an interview for the application', async () => {
    const res = await request(app)
      .post('/api/v1/interviews')
      .set('Authorization', `Bearer ${token}`)
      .send({
        applicationId,
        companyName: 'Amazon Web Services',
        jobTitle: 'Senior Solutions Architect',
        interviewType: 'technical',
        interviewRound: 'System Design Deep Dive',
        scheduledAt: new Date(Date.now() + 86400000 * 3).toISOString(),
        durationMinutes: 60,
        locationOrUrl: 'https://chime.aws/demo-round',
        interviewerName: 'Marcus Vance',
        preparationNotes: 'Review distributed database consensus and multi-region replication.',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.company_name).toBe('Amazon Web Services');
    interviewId = res.body.data.id;
  });

  it('Step 13: Generate STAR-framework interview preparation talking points', async () => {
    const res = await request(app)
      .post('/api/v1/ai/interview-prep')
      .set('Authorization', `Bearer ${token}`)
      .send({
        jobTitle: 'Senior Solutions Architect',
        companyName: 'Amazon Web Services',
        candidateSummary: 'Senior Software Engineer with 5+ years experience building distributed data systems.',
        jobDescription: 'System design, high-availability architecture, and cloud migrations.',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.suggestedQuestions)).toBe(true);
    expect(Array.isArray(res.body.data.keyTalkingPoints)).toBe(true);
  });

  it('Step 14: View conversion funnel and career velocity analytics', async () => {
    const res = await request(app)
      .get('/api/v1/analytics/conversion')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalApplied).toBeGreaterThanOrEqual(10);
    expect(res.body.data.interviewRate).toBeDefined();
    expect(res.body.data.offerRate).toBeDefined();
  });

  it('Step 15: View company application distribution in analytics', async () => {
    const res = await request(app)
      .get('/api/v1/analytics/applications')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.byCompany).toBeDefined();
    expect(Array.isArray(res.body.data.byCompany)).toBe(true);
  });

  it('Step 16: Document Vault - Upload verification credential', async () => {
    const fakeDocBuffer = Buffer.from('Certified Solutions Architect Associate Certificate');
    const res = await request(app)
      .post('/api/v1/documents/upload')
      .set('Authorization', `Bearer ${token}`)
      .attach('file', fakeDocBuffer, 'aws_solutions_architect_certificate.pdf')
      .field('title', 'AWS Solutions Architect Certification')
      .field('category', 'Certificates');

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('AWS Solutions Architect Certification');
    documentId = res.body.data.id;
  });

  it('Step 17: Document Vault - Stream and download document', async () => {
    const res = await request(app)
      .get(`/api/v1/documents/${documentId}/file`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('pdf');
  });

  it('Step 18: Notification Center - List and acknowledge notifications', async () => {
    const res = await request(app)
      .get('/api/v1/notifications')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    notificationId = res.body.data[0].id;

    const readRes = await request(app)
      .put(`/api/v1/notifications/${notificationId}/read`)
      .set('Authorization', `Bearer ${token}`);
    expect(readRes.status).toBe(200);
    expect(readRes.body.success).toBe(true);
  });

  it('Step 19: Plan & Billing - View subscription tier and available plans', async () => {
    const res = await request(app)
      .get('/api/v1/subscriptions/current')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.subscription).toBeDefined();
    expect(res.body.data.credits).toBeDefined();
  });

  it('Step 20: Support Center - Open support inquiry ticket', async () => {
    const res = await request(app)
      .post('/api/v1/support/tickets')
      .set('Authorization', `Bearer ${token}`)
      .send({
        subject: 'Inquiry regarding STAR interview preparation export',
        message: 'Can I export the generated interview questions directly to PDF?',
        category: 'Interviews & Prep',
        priority: 'low',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBeDefined();
    ticketId = res.body.data.id;

    // Verify it appears in user's ticket list
    const listRes = await request(app)
      .get('/api/v1/support/tickets')
      .set('Authorization', `Bearer ${token}`);
    expect(listRes.status).toBe(200);
    expect(listRes.body.data.some((t: any) => t.id === ticketId)).toBe(true);
  });
});

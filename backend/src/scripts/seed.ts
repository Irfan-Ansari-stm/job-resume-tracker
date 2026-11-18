import bcrypt from 'bcryptjs';
import { db } from '../config/db.js';

export async function runSeed() {
  console.log('🌱 Starting idempotent database seeding...');

  const demoPasswordHash = await bcrypt.hash('Demo@123456', 10);
  const adminPasswordHash = await bcrypt.hash('Password123!', 10);

  await db.transaction(async (client) => {
    // Update constraint to ensure all extended statuses are supported
    await client.query(`
      ALTER TABLE job_applications DROP CONSTRAINT IF EXISTS job_applications_status_check;
      ALTER TABLE job_applications ADD CONSTRAINT job_applications_status_check CHECK (
          status IN (
              'draft', 'saved', 'interested', 'applied', 'under_review', 
              'shortlisted', 'assessment', 'interview_scheduled', 
              'interviewing', 'offer_received', 'rejected', 'withdrawn', 'archived'
          )
      );

      ALTER TABLE interviews DROP CONSTRAINT IF EXISTS interviews_interview_type_check;
      ALTER TABLE interviews ADD CONSTRAINT interviews_interview_type_check CHECK (
          interview_type IN ('phone', 'video', 'technical', 'hr', 'behavioral', 'in_person', 'final', 'final_round')
      );
    `);

    // ==========================================
    // 1. SEED SUBSCRIPTION PLANS
    // ==========================================
    console.log('Seeding subscription plans...');
    const plans = [
      {
        name: 'Free Starter',
        slug: 'free',
        description: 'Essential tools for launching your job search journey.',
        priceMonthly: 0,
        priceYearly: 0,
        aiCredits: 15,
        uploadLimit: 2,
        versionLimit: 5,
        appLimit: 20,
        ats: false,
        docx: false,
        priority: false,
        features: [
          '2 Resume Uploads',
          '5 Customized Versions',
          '20 Application Tracking slots',
          '15 AI Credits / month',
          'Standard ATS Keyword Detection',
          'Standard PDF Exports'
        ]
      },
      {
        name: 'Pro Career Accelerator',
        slug: 'pro',
        description: 'Advanced AI customization, deep keyword matching, and unlimited versions.',
        priceMonthly: 19.00,
        priceYearly: 190.00,
        aiCredits: 100,
        uploadLimit: 10,
        versionLimit: 100,
        appLimit: 200,
        ats: true,
        docx: true,
        priority: true,
        features: [
          '10 Resume Uploads',
          '100 Customized Versions',
          '200 Application Tracking slots',
          '100 AI Credits / month',
          'Deep ATS Score & Skills Gap Analysis',
          'PDF & DOCX Exports',
          'AI Interview Preparation Studio',
          'Application Deadline Reminders'
        ]
      },
      {
        name: 'Executive & Power Search',
        slug: 'premium',
        description: 'Maximum AI power, priority generation, and executive career analytics.',
        priceMonthly: 39.00,
        priceYearly: 390.00,
        aiCredits: 350,
        uploadLimit: 50,
        versionLimit: 500,
        appLimit: 1000,
        ats: true,
        docx: true,
        priority: true,
        features: [
          'Unlimited Resumes & Versions',
          '1,000 Active Applications Tracking',
          '350 AI Credits / month',
          'Executive Level Tailoring',
          'Instant Priority AI Queue',
          'Dedicated Support & Analytics Reports',
          'Full Version Comparison & Reversion'
        ]
      }
    ];

    const planIds: Record<string, string> = {};
    for (const p of plans) {
      const res = await client.query(
        `INSERT INTO subscription_plans (
          name, slug, description, price_monthly, price_yearly, 
          ai_credits_monthly, resume_upload_limit, resume_version_limit, 
          application_tracking_limit, has_ats_analysis, has_export_docx, 
          has_priority_support, features, is_active
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, true)
        ON CONFLICT (slug) DO UPDATE 
        SET name = EXCLUDED.name, description = EXCLUDED.description, 
            price_monthly = EXCLUDED.price_monthly, price_yearly = EXCLUDED.price_yearly,
            features = EXCLUDED.features
        RETURNING id, slug`,
        [
          p.name, p.slug, p.description, p.priceMonthly, p.priceYearly,
          p.aiCredits, p.uploadLimit, p.versionLimit, p.appLimit,
          p.ats, p.docx, p.priority, JSON.stringify(p.features)
        ]
      );
      planIds[p.slug] = res.rows[0].id;
    }

    // ==========================================
    // 2. SEED RESUME TEMPLATES
    // ==========================================
    console.log('Seeding resume design templates...');
    const templates = [
      {
        name: 'Modern Executive ATS',
        slug: 'modern-executive',
        description: 'Clean single-column layout optimized for modern corporate ATS parsers (Taleo, Workday, Greenhouse).',
        category: 'Executive',
        thumbnailUrl: '/templates/modern-executive.png',
        config: { font: 'Inter', fontSize: '10pt', margins: '0.75in', colorScheme: 'slate', columns: 1 },
        isPremium: false,
      },
      {
        name: 'Silicon Valley Tech Minimalist',
        slug: 'tech-minimalist',
        description: 'High-density tech layout highlighting open-source projects, core tech stacks, and quantified impact.',
        category: 'Engineering',
        thumbnailUrl: '/templates/tech-minimalist.png',
        config: { font: 'JetBrains Mono, Inter', fontSize: '9.5pt', margins: '0.5in', colorScheme: 'indigo', columns: 1 },
        isPremium: false,
      },
      {
        name: 'Harvard Classic Academic',
        slug: 'harvard-classic',
        description: 'Traditional serif typography preferred by management consulting firms, finance, and academic roles.',
        category: 'Consulting',
        thumbnailUrl: '/templates/harvard-classic.png',
        config: { font: 'Merriweather, Georgia', fontSize: '10pt', margins: '1.0in', colorScheme: 'neutral', columns: 1 },
        isPremium: true,
      },
      {
        name: 'Product Design & Leadership',
        slug: 'product-lead',
        description: 'Two-column visual architecture with distinct sidebar for skills, tools, and design credentials.',
        category: 'Product',
        thumbnailUrl: '/templates/product-lead.png',
        config: { font: 'Plus Jakarta Sans', fontSize: '10pt', margins: '0.6in', colorScheme: 'purple', columns: 2 },
        isPremium: true,
      }
    ];

    for (const t of templates) {
      await client.query(
        `INSERT INTO resume_templates (name, slug, description, category, preview_image_url, layout_config, is_premium, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, true)
         ON CONFLICT (slug) DO UPDATE 
         SET name = EXCLUDED.name, description = EXCLUDED.description, layout_config = EXCLUDED.layout_config`,
        [t.name, t.slug, t.description, t.category, t.thumbnailUrl, JSON.stringify(t.config), t.isPremium]
      );
    }

    // ==========================================
    // 3. SEED AI PROMPT TEMPLATES
    // ==========================================
    console.log('Seeding AI Prompt Templates...');
    const prompts = [
      {
        code: 'resume_customization',
        name: 'Strict Integrity Customizer',
        description: 'Tailors resumes strictly using candidate facts without hallucinating qualifications.',
        systemPrompt: 'You are an Elite Career Architect and ATS Optimization Specialist. You must NEVER hallucinate or invent companies, jobs, or degrees. Tailor candidate verified history to match target job keywords.',
        userPromptTemplate: 'Target Job: {{jobTitle}} at {{companyName}}.\nJob Description: {{jobDescription}}\nResume: {{resumeContent}}',
      },
      {
        code: 'ats_analysis',
        name: 'Deterministic ATS Keyword Matcher',
        description: 'Extracts core skills, qualifications, and ATS keywords from job postings.',
        systemPrompt: 'You are an ATS Parser and Job Specification Specialist. Extract required technical skills, soft skills, responsibilities, and keyword density.',
        userPromptTemplate: 'Job Posting: {{jobDescription}}',
      },
      {
        code: 'interview_prep',
        name: 'Interview Preparation Generator',
        description: 'Generates role-specific interview talking points and sample questions based on candidate background.',
        systemPrompt: 'You are an Executive Career Coach. Prepare the candidate with realistic STAR-framework talking points without fabricating facts.',
        userPromptTemplate: 'Role: {{jobTitle}} at {{companyName}}.\nCandidate Profile: {{candidateSummary}}',
      }
    ];

    for (const pr of prompts) {
      await client.query(
        `INSERT INTO ai_prompt_templates (name, code, description, system_prompt, user_prompt_template, current_version)
         VALUES ($1, $2, $3, $4, $5, 'v1.0')
         ON CONFLICT (code) DO UPDATE 
         SET system_prompt = EXCLUDED.system_prompt, user_prompt_template = EXCLUDED.user_prompt_template`,
        [pr.name, pr.code, pr.description, pr.systemPrompt, pr.userPromptTemplate]
      );
    }

    // ==========================================
    // 4. SEED USERS (DEMO USER & ADMINS)
    // ==========================================
    console.log('Seeding users and profiles...');
    const usersData = [
      {
        email: 'demo@smartresume.com',
        role: 'user',
        passwordHash: demoPasswordHash,
        firstName: 'Alex',
        lastName: 'Morgan',
        phone: '+1-555-0199',
        headline: 'Lead Analytics Specialist & Full-Stack Data Engineer',
        bio: 'Driven professional specializing in data analytics, cloud data pipelines, and scalable software solutions with 5+ years of experience.',
        targetRole: 'Senior Data Analyst / Software Engineer',
        targetIndustry: 'Technology & Enterprise Consulting',
        yearsExp: 5.5,
        location: 'San Francisco, CA / Remote',
        plan: 'pro',
        initialCredits: 100,
        usedCredits: 25,
      },
      {
        email: 'superadmin@smartresume.ai',
        role: 'super_admin',
        passwordHash: adminPasswordHash,
        firstName: 'Alexander',
        lastName: 'Vance',
        phone: '+1-555-0100',
        headline: 'Platform Owner & Super Administrator',
        bio: 'Oversees platform governance, AI integrations, subscription economics, and system security.',
        targetRole: 'Super Administrator',
        targetIndustry: 'SaaS Platform Infrastructure',
        yearsExp: 10.0,
        location: 'Global Headquarters',
        plan: 'premium',
        initialCredits: 1000,
        usedCredits: 0,
      },
      {
        email: 'admin@smartresume.ai',
        role: 'admin',
        passwordHash: adminPasswordHash,
        firstName: 'Sarah',
        lastName: 'Jenkins',
        phone: '+1-555-0101',
        headline: 'Lead Platform Moderator & Content Specialist',
        bio: 'Manages user verifications, template moderation, and platform prompt engineering.',
        targetRole: 'Platform Administrator',
        targetIndustry: 'Enterprise Governance',
        yearsExp: 7.0,
        location: 'San Francisco, CA',
        plan: 'pro',
        initialCredits: 500,
        usedCredits: 10,
      },
      {
        email: 'aarav.patel@example.com',
        role: 'user',
        passwordHash: adminPasswordHash,
        firstName: 'Aarav',
        lastName: 'Patel',
        phone: '+91-98765-43210',
        headline: 'Senior Data Analyst | SQL, Python, Tableau & Power BI',
        bio: 'Passionate data analyst turning complex datasets into strategic insights.',
        targetRole: 'Lead Data Analyst',
        targetIndustry: 'Information Technology',
        yearsExp: 5.5,
        location: 'Bengaluru, India',
        plan: 'pro',
        initialCredits: 100,
        usedCredits: 15,
      }
    ];

    const userIds: Record<string, string> = {};
    for (const u of usersData) {
      const existingUser = await client.query(`SELECT id FROM users WHERE email = $1`, [u.email]);
      let uId: string;

      if (existingUser.rows.length > 0) {
        uId = existingUser.rows[0].id;
        await client.query(
          `UPDATE users SET password_hash = $2, role = $3, first_name = $4, last_name = $5, phone = $6, is_active = true WHERE id = $1`,
          [uId, u.passwordHash, u.role, u.firstName, u.lastName, u.phone]
        );
      } else {
        const newU = await client.query(
          `INSERT INTO users (email, password_hash, first_name, last_name, phone, role, is_email_verified, is_active)
           VALUES ($1, $2, $3, $4, $5, $6, true, true)
           RETURNING id`,
          [u.email, u.passwordHash, u.firstName, u.lastName, u.phone, u.role]
        );
        uId = newU.rows[0].id;
      }
      userIds[u.email] = uId;

      // Update Profile
      await client.query(
        `INSERT INTO user_profiles (user_id, headline, bio, target_role, target_industry, years_of_experience, location)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (user_id) DO UPDATE 
         SET headline = EXCLUDED.headline, bio = EXCLUDED.bio, target_role = EXCLUDED.target_role, 
             years_of_experience = EXCLUDED.years_of_experience, location = EXCLUDED.location`,
        [uId, u.headline, u.bio, u.targetRole || null, u.targetIndustry || null, u.yearsExp || 0, u.location || null]
      );

      // Preferences
      await client.query(
        `INSERT INTO user_preferences (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING`,
        [uId]
      );

      // Credits (Mathematical consistency: initialCredits, usedCredits, remaining)
      await client.query(
        `INSERT INTO user_ai_credits (user_id, total_credits, used_credits)
         VALUES ($1, $2, $3)
         ON CONFLICT (user_id) DO UPDATE SET total_credits = EXCLUDED.total_credits, used_credits = EXCLUDED.used_credits`,
        [uId, u.initialCredits, u.usedCredits]
      );

      // Subscription
      const pId = planIds[u.plan] || planIds['free'];
      await client.query(
        `INSERT INTO user_subscriptions (user_id, plan_id, status, billing_interval, current_period_start, current_period_end)
         VALUES ($1, $2, 'active', 'monthly', NOW() - INTERVAL '10 days', NOW() + INTERVAL '20 days')
         ON CONFLICT DO NOTHING`,
        [uId, pId]
      );
    }


  async function seedUserPortfolio(
    client: any,
    targetUserId: string,
    targetEmail: string,
    targetName: string,
    proPlanId: string,
    isSuperAdmin: boolean = false
  ) {
    const invoicePrefix = isSuperAdmin ? 'INV-2026-ADMIN' : 'INV-2026-DEMO';
    console.log(`Configuring realistic portfolio data for ${targetEmail} (${targetName})...`);
    await client.query(`DELETE FROM audit_logs WHERE user_id = $1`, [targetUserId]);
    await client.query(`DELETE FROM notifications WHERE user_id = $1`, [targetUserId]);
    await client.query(`DELETE FROM support_tickets WHERE user_id = $1`, [targetUserId]);
    await client.query(`DELETE FROM documents WHERE user_id = $1`, [targetUserId]);
    await client.query(`DELETE FROM interviews WHERE user_id = $1`, [targetUserId]);
    await client.query(`DELETE FROM job_applications WHERE user_id = $1`, [targetUserId]);
    await client.query(`DELETE FROM jobs WHERE user_id = $1`, [targetUserId]);
    await client.query(`DELETE FROM resume_versions WHERE user_id = $1`, [targetUserId]);
    
    await client.query(`DELETE FROM audit_logs WHERE user_id = $1`, [targetUserId]);
    await client.query(`DELETE FROM notifications WHERE user_id = $1`, [targetUserId]);
    await client.query(`DELETE FROM support_tickets WHERE user_id = $1`, [targetUserId]);
    await client.query(`DELETE FROM documents WHERE user_id = $1`, [targetUserId]);
    await client.query(`DELETE FROM interviews WHERE user_id = $1`, [targetUserId]);
    await client.query(`DELETE FROM job_applications WHERE user_id = $1`, [targetUserId]);
    await client.query(`DELETE FROM jobs WHERE user_id = $1`, [targetUserId]);
    await client.query(`DELETE FROM resume_versions WHERE user_id = $1`, [targetUserId]);
    if (isSuperAdmin) {
      await client.query("DELETE FROM resumes WHERE user_id = $1 AND title != 'gff' AND (original_filename IS NULL OR original_filename != 'careerIrfanAnsari.pdf')", [targetUserId]);
    } else {
      await client.query(`DELETE FROM resumes WHERE user_id = $1`, [targetUserId]);
    }
    await client.query(`DELETE FROM companies WHERE user_id = $1`, [targetUserId]);

    // ==========================================
    // 5. SEED COMPANIES (10 RECORDS)
    // ==========================================
    console.log('Seeding 10 target companies...');
    const companies = [
      { name: 'Tata Consultancy Services', industry: 'IT Services & Consulting', location: 'Mumbai / Bengaluru', website: 'https://www.tcs.com' },
      { name: 'Infosys', industry: 'Information Technology', location: 'Bengaluru / Pune', website: 'https://www.infosys.com' },
      { name: 'Accenture', industry: 'Management Consulting & IT', location: 'Bengaluru / Gurugram', website: 'https://www.accenture.com' },
      { name: 'Wipro', industry: 'Technology Services', location: 'Bengaluru / Hyderabad', website: 'https://www.wipro.com' },
      { name: 'Capgemini', industry: 'Digital Transformation & Tech', location: 'Mumbai / Pune', website: 'https://www.capgemini.com' },
      { name: 'Cognizant', industry: 'Information Technology Services', location: 'Chennai / Bengaluru', website: 'https://www.cognizant.com' },
      { name: 'HCLTech', industry: 'Global Technology Enterprise', location: 'Noida / Chennai', website: 'https://www.hcltech.com' },
      { name: 'Deloitte', industry: 'Audit, Consulting & Advisory', location: 'Hyderabad / Mumbai', website: 'https://www.deloitte.com' },
      { name: 'IBM', industry: 'Cloud & Cognitive Computing', location: 'Bengaluru / New York', website: 'https://www.ibm.com' },
      { name: 'Tech Mahindra', industry: 'Digital & Network Transformation', location: 'Pune / Hyderabad', website: 'https://www.techmahindra.com' },
    ];

    const companyMap: Record<string, string> = {};
    for (const c of companies) {
      const cRes = await client.query(
        `INSERT INTO companies (user_id, name, industry, location, website, is_favorite)
         VALUES ($1, $2, $3, $4, $5, true)
         RETURNING id, name`,
        [targetUserId, c.name, c.industry, c.location, c.website]
      );
      companyMap[c.name] = cRes.rows[0].id;
    }

    // ==========================================
    // 6. SEED SAVED JOBS (8 RECORDS)
    // ==========================================
    console.log('Seeding 8 saved jobs...');
    const savedJobsData = [
      {
        company: 'Deloitte',
        title: 'Lead Analytics Consultant',
        location: 'Hyderabad, India (Hybrid)',
        employmentType: 'full_time',
        salaryRange: '$110,000 - $130,000',
        url: 'https://careers.deloitte.com/job/lead-analytics-consultant',
        desc: 'Seeking a Lead Analytics Consultant to lead client analytical engagements, develop executive Power BI and Tableau dashboards, and optimize enterprise SQL data warehouses.',
        skills: ['SQL', 'Tableau', 'Power BI', 'ETL', 'Stakeholder Management', 'Data Modeling']
      },
      {
        company: 'IBM',
        title: 'Senior Python & Cloud Data Engineer',
        location: 'Bengaluru, India / Remote',
        employmentType: 'full_time',
        salaryRange: '$120,000 - $145,000',
        url: 'https://ibm.com/careers/data-engineer-cloud',
        desc: 'Drive scalable data pipelines with Python, PostgreSQL, Apache Kafka, and IBM Cloud. Responsible for data reliability, schema governance, and distributed query performance.',
        skills: ['Python', 'PostgreSQL', 'Docker', 'Apache Kafka', 'CI/CD', 'Data Pipelines']
      },
      {
        company: 'Capgemini',
        title: 'Business Intelligence Architect',
        location: 'Mumbai, India',
        employmentType: 'full_time',
        salaryRange: '$95,000 - $115,000',
        url: 'https://capgemini.com/jobs/bi-architect',
        desc: 'Architect enterprise business intelligence solutions, data lake integrations, and automated reporting systems across multinational retail accounts.',
        skills: ['Business Intelligence', 'Data Architecture', 'SQL', 'Looker', 'Python']
      },
      {
        company: 'Cognizant',
        title: 'Full-Stack Software Engineer',
        location: 'Chennai, India',
        employmentType: 'full_time',
        salaryRange: '$100,000 - $125,000',
        url: 'https://careers.cognizant.com/job/full-stack-engineer',
        desc: 'Design and deliver modern web applications using TypeScript, Next.js, Express.js, and PostgreSQL. Focus on clean architectures, high availability, and API performance.',
        skills: ['TypeScript', 'Next.js', 'Node.js', 'Express.js', 'PostgreSQL', 'REST APIs']
      },
      {
        company: 'Tata Consultancy Services',
        title: 'Senior Quantitative Analyst',
        location: 'Mumbai, India',
        employmentType: 'full_time',
        salaryRange: '$90,000 - $110,000',
        url: 'https://tcs.com/careers/quant-analyst',
        desc: 'Analyze complex financial datasets, build predictive risk models in Python, and automate portfolio performance reporting.',
        skills: ['Python', 'Statistical Modeling', 'SQL', 'Risk Analysis', 'Excel Advanced']
      },
      {
        company: 'Infosys',
        title: 'Data Platform Architect',
        location: 'Bengaluru, India',
        employmentType: 'full_time',
        salaryRange: '$130,000 - $155,000',
        url: 'https://infosys.com/careers/platform-architect',
        desc: 'Lead the migration of legacy monolithic data stores to high-throughput PostgreSQL and cloud data warehouses.',
        skills: ['Data Architecture', 'PostgreSQL', 'Cloud Infrastructure', 'ETL', 'System Design']
      },
      {
        company: 'Accenture',
        title: 'Senior Strategy & Analytics Consultant',
        location: 'Gurugram, India',
        employmentType: 'full_time',
        salaryRange: '$115,000 - $135,000',
        url: 'https://accenture.com/careers/strategy-analytics',
        desc: 'Collaborate with C-suite stakeholders to turn business hypotheses into measurable analytical KPIs and dashboard solutions.',
        skills: ['Strategy Consulting', 'Tableau', 'SQL', 'Executive Storytelling', 'Agile']
      },
      {
        company: 'Tech Mahindra',
        title: 'Backend Node.js & Database Specialist',
        location: 'Pune, India',
        employmentType: 'full_time',
        salaryRange: '$90,000 - $110,000',
        url: 'https://techmahindra.com/jobs/backend-specialist',
        desc: 'Build resilient backend microservices with Node.js, Express, Redis, and native PostgreSQL. Implement zero-ORM raw SQL queries with sub-50ms latencies.',
        skills: ['Node.js', 'Express', 'PostgreSQL', 'Raw SQL', 'Redis', 'Docker']
      }
    ];

    const jobMap: Record<string, string> = {};
    for (const j of savedJobsData) {
      const jRes = await client.query(
        `INSERT INTO jobs (
          user_id, company_id, company_name, title, raw_description, 
          required_skills, ats_keywords, location, employment_type, job_url
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING id`,
        [
          targetUserId, companyMap[j.company], j.company, j.title, j.desc,
          JSON.stringify(j.skills), JSON.stringify(j.skills), j.location, j.employmentType, j.url
        ]
      );
      jobMap[j.company] = jRes.rows[0].id;
    }

    // ==========================================
    // 7. SEED 3 MASTER RESUMES
    // ==========================================
    console.log('Seeding 3 master resumes...');

    // Master Resume 1: Career Profile – Analytics
    const analyticsResumeData = {
      contactInfo: {
        fullName: 'Alex Morgan',
        email: 'demo@smartresume.com',
        phone: '+1 (555) 019-9234',
        location: 'San Francisco, CA',
        linkedin: 'https://linkedin.com/in/alexmorgan-analytics',
        github: 'https://github.com/alexmorgan-data',
      },
      summary: 'Results-driven Senior Data Analyst and Business Intelligence Specialist with 5+ years of experience engineering automated ETL pipelines, optimizing complex SQL queries across 10M+ transaction datasets, and delivering executive Tableau/Power BI visualizations that reduced reporting latency by 45%.',
      skills: [
        { category: 'Data Analysis & BI', items: ['SQL', 'PostgreSQL', 'Tableau', 'Power BI', 'Looker', 'Excel Advanced', 'DAX'] },
        { category: 'Data Engineering & Scripting', items: ['Python', 'Pandas', 'NumPy', 'ETL Pipelines', 'Airflow', 'Data Modeling'] },
        { category: 'Methodologies & Cloud', items: ['A/B Testing', 'Statistical Inference', 'Agile / Scrum', 'AWS Redshift', 'Docker'] }
      ],
      experience: [
        {
          id: 'exp-1',
          jobTitle: 'Senior Data Analyst',
          company: 'FinTech Growth Partners',
          location: 'San Francisco, CA',
          startDate: '2022-04',
          endDate: 'Present',
          isCurrent: true,
          bulletPoints: [
            'Architected 20+ automated Tableau and Power BI executive dashboards reducing monthly financial reporting cycle from 5 days to 3 hours.',
            'Optimized relational PostgreSQL queries across 12M+ records, improving API query response times by 48%.',
            'Collaborated with product and engineering teams to identify cost optimization initiatives resulting in $420K annual operational savings.'
          ]
        },
        {
          id: 'exp-2',
          jobTitle: 'Business Intelligence Analyst',
          company: 'Vanguard Retail Analytics',
          location: 'Austin, TX',
          startDate: '2019-07',
          endDate: '2022-03',
          isCurrent: false,
          bulletPoints: [
            'Engineered automated Python ETL scripts ingesting point-of-sale data from 500+ retail stores daily.',
            'Built predictive customer churn segmentation models that contributed to an 18% improvement in quarterly customer retention.',
            'Defined and monitored core corporate KPIs and automated anomaly notification alerts.'
          ]
        }
      ],
      education: [
        {
          id: 'edu-1',
          degree: 'Bachelor of Science in Information Systems & Analytics',
          institution: 'University of California, Berkeley',
          location: 'Berkeley, CA',
          graduationDate: '2019',
          gpa: '3.85 / 4.0'
        }
      ],
      projects: [
        {
          id: 'proj-1',
          title: 'Automated Financial Anomaly Detection Engine',
          technologies: ['Python', 'SQL', 'PostgreSQL', 'Tableau'],
          description: 'Constructed an automated monitoring engine detecting anomalous credit card transactions in near real-time with automated dashboard reporting.'
        }
      ],
      certifications: [
        { id: 'cert-1', name: 'Tableau Certified Data Analyst', issuer: 'Tableau', date: '2023' },
        { id: 'cert-2', name: 'AWS Certified Cloud Practitioner', issuer: 'Amazon Web Services', date: '2022' }
      ]
    };

    const res1 = await client.query(
      `INSERT INTO resumes (
        user_id, title, summary, target_role, category, is_primary, parsed_data,
        original_file_path, original_filename
      ) VALUES ($1, $2, $3, $4, 'Analytics', true, $5, $6, $7)
      RETURNING id`,
      [
        targetUserId,
        'Career Profile – Analytics',
        analyticsResumeData.summary,
        'Lead Data Analyst / BI Specialist',
        JSON.stringify(analyticsResumeData),
        'D:\\0. project\\1. projects\\9. resume tracker\\backend\\uploads\\866152f1-be1c-4152-bba0-1a323686d839.pdf',
        'careerIrfanAnsari.pdf'
      ]
    );
    const resumeAnalyticsId = res1.rows[0].id;

    // Master Resume 2: Software Engineering Resume
    const seResumeData = {
      contactInfo: {
        fullName: 'Alex Morgan',
        email: 'demo@smartresume.com',
        phone: '+1 (555) 019-9234',
        location: 'San Francisco, CA',
        linkedin: 'https://linkedin.com/in/alexmorgan-dev',
        github: 'https://github.com/alexmorgan-swe',
      },
      summary: 'Full-Stack Software Engineer with 5+ years of experience designing scalable microservices, low-latency REST APIs, and responsive web applications using TypeScript, Next.js, Node.js, and native PostgreSQL with raw SQL optimizations.',
      skills: [
        { category: 'Frontend', items: ['TypeScript', 'React.js', 'Next.js App Router', 'Tailwind CSS', 'Redux / TanStack'] },
        { category: 'Backend & Systems', items: ['Node.js', 'Express.js', 'PostgreSQL', 'Raw SQL', 'Redis', 'BullMQ', 'REST APIs'] },
        { category: 'DevOps & Tooling', items: ['Docker', 'Git / GitHub Actions', 'CI/CD Pipelines', 'AWS ECS', 'Linux'] }
      ],
      experience: [
        {
          id: 'se-exp-1',
          jobTitle: 'Full-Stack Software Engineer',
          company: 'CloudScale Microservices Inc',
          location: 'San Francisco, CA',
          startDate: '2021-08',
          endDate: 'Present',
          isCurrent: true,
          bulletPoints: [
            'Architected and deployed high-throughput Node.js microservices handling 25,000+ RPM with sub-40ms response times.',
            'Migrated ORM database layer to native node-postgres parameterized raw SQL, eliminating N+1 bottlenecks and reducing server memory by 35%.',
            'Implemented secure JWT authentication with refresh token rotation and Redis rate-limiting middleware.'
          ]
        }
      ],
      education: [
        {
          id: 'se-edu-1',
          degree: 'Bachelor of Science in Computer Science',
          institution: 'University of California, Berkeley',
          location: 'Berkeley, CA',
          graduationDate: '2019',
          gpa: '3.85 / 4.0'
        }
      ],
      projects: [
        {
          id: 'se-proj-1',
          title: 'Distributed Job Scheduler & Queue Monitor',
          technologies: ['TypeScript', 'Node.js', 'Redis', 'PostgreSQL'],
          description: 'Built a multi-tenant queue orchestration engine with automatic retry strategies, failure alerts, and real-time dashboard telemetry.'
        }
      ],
      certifications: [
        { id: 'se-cert-1', name: 'AWS Certified Solutions Architect – Associate', issuer: 'Amazon Web Services', date: '2023' }
      ]
    };

    const res2 = await client.query(
      `INSERT INTO resumes (
        user_id, title, summary, target_role, category, is_primary, parsed_data
      ) VALUES ($1, $2, $3, $4, 'Engineering', false, $5)
      RETURNING id`,
      [
        targetUserId,
        'Software Engineering Resume',
        seResumeData.summary,
        'Senior Full-Stack Engineer',
        JSON.stringify(seResumeData)
      ]
    );
    const resumeSoftwareId = res2.rows[0].id;

    // Master Resume 3: General Professional Resume
    const generalResumeData = {
      contactInfo: {
        fullName: 'Alex Morgan',
        email: 'demo@smartresume.com',
        phone: '+1 (555) 019-9234',
        location: 'San Francisco, CA',
        linkedin: 'https://linkedin.com/in/alexmorgan',
      },
      summary: 'Versatile Technical Professional with a proven track record bridging business strategy, data analytics, and software engineering to drive measurable enterprise productivity and platform scalability.',
      skills: [
        { category: 'Core Competencies', items: ['Project Management', 'Agile / Scrum', 'Business Strategy', 'Stakeholder Communication'] },
        { category: 'Technical Foundation', items: ['SQL', 'Python', 'Web Architecture', 'Data Analysis', 'Process Automation'] }
      ],
      experience: [
        {
          id: 'gen-exp-1',
          jobTitle: 'Technical Operations & Strategy Lead',
          company: 'Nexus Strategic Solutions',
          location: 'San Francisco, CA',
          startDate: '2020-01',
          endDate: 'Present',
          isCurrent: true,
          bulletPoints: [
            'Guided cross-functional teams of 12 engineers and product designers in delivering enterprise SaaS products on schedule.',
            'Standardized operational reporting metrics, driving a 22% improvement in release velocity.'
          ]
        }
      ],
      education: [
        {
          id: 'gen-edu-1',
          degree: 'Bachelor of Science in Information Systems',
          institution: 'University of California, Berkeley',
          location: 'Berkeley, CA',
          graduationDate: '2019',
          gpa: '3.85 / 4.0'
        }
      ],
      projects: [],
      certifications: [
        { id: 'gen-cert-1', name: 'Certified Scrum Master (CSM)', issuer: 'Scrum Alliance', date: '2021' }
      ]
    };

    const res3 = await client.query(
      `INSERT INTO resumes (
        user_id, title, summary, target_role, category, is_primary, parsed_data
      ) VALUES ($1, $2, $3, $4, 'General', false, $5)
      RETURNING id`,
      [
        targetUserId,
        'General Professional Resume',
        generalResumeData.summary,
        'Technical Program / Operations Lead',
        JSON.stringify(generalResumeData)
      ]
    );
    const resumeGeneralId = res3.rows[0].id;

    // ==========================================
    // 8. SEED 5 RESUME VERSIONS
    // ==========================================
    console.log('Seeding 5 resume versions...');

    // Version 1: Initial Baseline Version
    const v1Res = await client.query(
      `INSERT INTO resume_versions (
        resume_id, user_id, version_number, version_label, 
        content_snapshot, change_summary, match_score, status, is_immutable, created_at
      ) VALUES ($1, $2, 1, 'Initial Baseline Version', $3, 'Initial uploaded master resume snapshot', 78, 'final', false, NOW() - INTERVAL '30 days')
      RETURNING id`,
      [resumeAnalyticsId, targetUserId, JSON.stringify(analyticsResumeData)]
    );
    const v1Id = v1Res.rows[0].id;

    // Version 2: Senior Data Analyst – TCS
    const tcsSnapshot = JSON.parse(JSON.stringify(analyticsResumeData));
    tcsSnapshot.summary = 'Targeted Senior Data Analyst for Tata Consultancy Services: Results-oriented analytics specialist with 5+ years driving high-impact data modeling, SQL query optimization, and executive Tableau reporting across large enterprise deployments.';
    const v2Res = await client.query(
      `INSERT INTO resume_versions (
        resume_id, user_id, parent_version_id, company_name, job_title,
        version_number, version_label, customization_instructions, ai_model_used,
        content_snapshot, change_summary, match_score, matched_keywords, missing_keywords,
        status, is_immutable, created_at
      ) VALUES (
        $1, $2, $3, 'Tata Consultancy Services', 'Senior Data Analyst',
        2, 'Senior Data Analyst – TCS', 'Emphasize SQL optimization, automated pipelines, and enterprise Tableau dashboards.', 'gpt-4o-mini',
        $4, 'Tailored professional summary for TCS, emphasized PostgreSQL query tuning, highlighted 20+ automated executive dashboards.',
        94, $5, $6, 'submitted', true, NOW() - INTERVAL '20 days'
      ) RETURNING id`,
      [
        resumeAnalyticsId, targetUserId, v1Id,
        JSON.stringify(tcsSnapshot),
        JSON.stringify(['SQL', 'Python', 'Tableau', 'Power BI', 'Data Modeling', 'ETL Pipelines']),
        JSON.stringify(['Snowflake'])
      ]
    );
    const v2Id = v2Res.rows[0].id;

    // Version 3: Data Analyst – Infosys
    const infosysSnapshot = JSON.parse(JSON.stringify(analyticsResumeData));
    infosysSnapshot.summary = 'Targeted Lead Analytics Specialist for Infosys: Experienced analytics leader adept in financial data modeling, automated ETL delivery, and client stakeholder presentations.';
    const v3Res = await client.query(
      `INSERT INTO resume_versions (
        resume_id, user_id, parent_version_id, company_name, job_title,
        version_number, version_label, customization_instructions, ai_model_used,
        content_snapshot, change_summary, match_score, matched_keywords, missing_keywords,
        status, is_immutable, created_at
      ) VALUES (
        $1, $2, $3, 'Infosys', 'Data Analyst',
        3, 'Data Analyst – Infosys', 'Highlight stakeholder collaboration and financial analytics experience.', 'gpt-4o-mini',
        $4, 'Refocused career achievements on client relationship management and data governance.',
        89, $5, $6, 'submitted', true, NOW() - INTERVAL '15 days'
      ) RETURNING id`,
      [
        resumeAnalyticsId, targetUserId, v1Id,
        JSON.stringify(infosysSnapshot),
        JSON.stringify(['SQL', 'Python', 'Financial Analytics', 'Dashboard Design', 'Data Governance']),
        JSON.stringify(['Apache Spark'])
      ]
    );
    const v3Id = v3Res.rows[0].id;

    // Version 4: Business Analyst – Accenture
    const accentureSnapshot = JSON.parse(JSON.stringify(analyticsResumeData));
    accentureSnapshot.summary = 'Applied Intelligence and Business Analyst for Accenture: Specialized in translating complex business requirements into scalable cloud analytical pipelines and C-suite KPI intelligence.';
    const v4Res = await client.query(
      `INSERT INTO resume_versions (
        resume_id, user_id, parent_version_id, company_name, job_title,
        version_number, version_label, customization_instructions, ai_model_used,
        content_snapshot, change_summary, match_score, matched_keywords, missing_keywords,
        status, is_immutable, created_at
      ) VALUES (
        $1, $2, $3, 'Accenture', 'Business Analyst',
        4, 'Business Analyst – Accenture', 'Focus on strategic business insights, requirements gathering, and cloud BI reporting.', 'gpt-4o-mini',
        $4, 'Optimized summary for enterprise consulting engagements and cross-functional leadership.',
        91, $5, $6, 'submitted', true, NOW() - INTERVAL '10 days'
      ) RETURNING id`,
      [
        resumeAnalyticsId, targetUserId, v1Id,
        JSON.stringify(accentureSnapshot),
        JSON.stringify(['Strategy Consulting', 'SQL', 'Tableau', 'Executive Storytelling', 'Agile']),
        JSON.stringify(['SAP'])
      ]
    );
    const v4Id = v4Res.rows[0].id;

    // Version 5: Python Developer – Wipro
    const wiproSnapshot = JSON.parse(JSON.stringify(seResumeData));
    wiproSnapshot.summary = 'Targeted Python Developer and Backend Specialist for Wipro: Experienced in engineering resilient data pipelines, asynchronous services, and PostgreSQL database performance optimizations.';
    const v5Res = await client.query(
      `INSERT INTO resume_versions (
        resume_id, user_id, parent_version_id, company_name, job_title,
        version_number, version_label, customization_instructions, ai_model_used,
        content_snapshot, change_summary, match_score, matched_keywords, missing_keywords,
        status, is_immutable, created_at
      ) VALUES (
        $1, $2, $3, 'Wipro', 'Python Developer',
        2, 'Python Developer – Wipro', 'Highlight Python microservices, distributed caching, and raw SQL execution.', 'gpt-4o-mini',
        $4, 'Enhanced Python backend achievements, added Kafka message broker bullet points, prioritized PostgreSQL performance tuning.',
        93, $5, $6, 'submitted', true, NOW() - INTERVAL '5 days'
      ) RETURNING id`,
      [
        resumeSoftwareId, targetUserId, null,
        JSON.stringify(wiproSnapshot),
        JSON.stringify(['Python', 'PostgreSQL', 'Docker', 'REST APIs', 'Data Pipelines']),
        JSON.stringify(['Kubernetes'])
      ]
    );
    const v5Id = v5Res.rows[0].id;

    // ==========================================
    // 9. SEED 10 JOB APPLICATIONS
    // ==========================================
    console.log('Seeding 10 realistic job applications across target companies...');
    const applicationsData = [
      {
        company: 'Tata Consultancy Services',
        jobTitle: 'Senior Data Analyst',
        versionId: v2Id,
        snapshot: tcsSnapshot,
        status: 'applied',
        priority: 'high',
        salary: '$115,000 - $130,000',
        location: 'Mumbai, India / Remote',
        daysAgo: 18,
        url: 'https://www.tcs.com/careers/senior-data-analyst',
        notes: 'Applied via TCS official career portal. Resume version 2 attached.'
      },
      {
        company: 'Infosys',
        jobTitle: 'Lead Analytics Specialist',
        versionId: v3Id,
        snapshot: infosysSnapshot,
        status: 'interview_scheduled',
        priority: 'high',
        salary: '$120,000 - $140,000',
        location: 'Bengaluru, India (Hybrid)',
        daysAgo: 14,
        url: 'https://www.infosys.com/careers/lead-analytics',
        notes: 'Round 1 screening cleared with hiring manager. Scheduled for Technical Deep Dive.'
      },
      {
        company: 'Accenture',
        jobTitle: 'Applied Intelligence Analyst',
        versionId: v4Id,
        snapshot: accentureSnapshot,
        status: 'under_review',
        priority: 'medium',
        salary: '$110,000 - $128,000',
        location: 'Gurugram, India',
        daysAgo: 9,
        url: 'https://www.accenture.com/careers/analytics-analyst',
        notes: 'Candidate profile currently under review with client account leadership.'
      },
      {
        company: 'Wipro',
        jobTitle: 'Data & Insights Consultant',
        versionId: v5Id,
        snapshot: wiproSnapshot,
        status: 'offer_received',
        priority: 'high',
        salary: '$135,000',
        location: 'Bengaluru, India',
        daysAgo: 24,
        url: 'https://www.wipro.com/careers/data-consultant',
        notes: 'Formal offer received. Base $135k + performance bonus. Reviewing contract.'
      },
      {
        company: 'Capgemini',
        jobTitle: 'Senior BI Architect',
        versionId: v1Id,
        snapshot: analyticsResumeData,
        status: 'shortlisted',
        priority: 'high',
        salary: '$125,000 - $145,000',
        location: 'Mumbai, India',
        daysAgo: 12,
        url: 'https://www.capgemini.com/careers/bi-architect',
        notes: 'Shortlisted by the engineering talent acquisition committee.'
      },
      {
        company: 'Cognizant',
        jobTitle: 'Full-Stack Data Solutions Engineer',
        versionId: v5Id,
        snapshot: wiproSnapshot,
        status: 'interviewing',
        priority: 'medium',
        salary: '$118,000 - $132,000',
        location: 'Chennai, India',
        daysAgo: 16,
        url: 'https://www.cognizant.com/careers/solutions-engineer',
        notes: 'Completed technical coding round. Video architectural interview scheduled.'
      },
      {
        company: 'HCLTech',
        jobTitle: 'Enterprise Business Analyst',
        versionId: v4Id,
        snapshot: accentureSnapshot,
        status: 'rejected',
        priority: 'low',
        salary: '$105,000',
        location: 'Noida, India',
        daysAgo: 28,
        url: 'https://www.hcltech.com/careers/business-analyst',
        notes: 'Role closed due to internal corporate restructuring.'
      },
      {
        company: 'Deloitte',
        jobTitle: 'Lead Analytics Consultant',
        versionId: v2Id,
        snapshot: tcsSnapshot,
        status: 'interested',
        priority: 'high',
        salary: '$125,000 - $140,000',
        location: 'Hyderabad, India (Hybrid)',
        daysAgo: 4,
        url: 'https://www.deloitte.com/careers/lead-consultant',
        notes: 'Direct outreach from Deloitte Talent Partner on LinkedIn.'
      },
      {
        company: 'IBM',
        jobTitle: 'Cloud Data Engineer',
        versionId: v5Id,
        snapshot: wiproSnapshot,
        status: 'saved',
        priority: 'medium',
        salary: '$120,000 - $140,000',
        location: 'Bengaluru, India / Remote',
        daysAgo: 2,
        url: 'https://www.ibm.com/careers/cloud-data-engineer',
        notes: 'Target position saved for customization via AI Studio.'
      },
      {
        company: 'Tech Mahindra',
        jobTitle: 'Backend Systems Developer',
        versionId: v5Id,
        snapshot: wiproSnapshot,
        status: 'withdrawn',
        priority: 'low',
        salary: '$100,000 - $115,000',
        location: 'Pune, India',
        daysAgo: 22,
        url: 'https://www.techmahindra.com/careers/backend-dev',
        notes: 'Withdrawn after receiving higher compensation offer.'
      }
    ];

    const appIds: Record<string, string> = {};
    for (const a of applicationsData) {
      const appRes = await client.query(
        `INSERT INTO job_applications (
          user_id, company_id, job_id, resume_version_id, company_name, job_title,
          job_url, location, employment_type, salary_range, status, priority,
          application_date, submitted_at, submitted_resume_snapshot, notes, created_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, 'full_time', $9, $10, $11,
          NOW() - INTERVAL '${a.daysAgo} days', NOW() - INTERVAL '${a.daysAgo} days',
          $12, $13, NOW() - INTERVAL '${a.daysAgo} days'
        ) RETURNING id`,
        [
          targetUserId,
          companyMap[a.company],
          jobMap[a.company] || null,
          a.versionId,
          a.company,
          a.jobTitle,
          a.url,
          a.location,
          a.salary,
          a.status,
          a.priority,
          JSON.stringify(a.snapshot),
          a.notes
        ]
      );
      appIds[a.company] = appRes.rows[0].id;
    }

    // ==========================================
    // 10. SEED 5 INTERVIEWS
    // ==========================================
    console.log('Seeding 5 realistic interviews with diverse rounds & prep notes...');
    const interviewsData = [
      {
        company: 'Infosys',
        appId: appIds['Infosys'],
        title: 'Lead Analytics Specialist',
        type: 'technical',
        round: 'Upcoming Technical Deep Dive',
        offsetDays: 3,
        duration: 60,
        interviewer: 'Ramesh Sundaram (Principal Architect)',
        email: 'ramesh.s@infosys.example.com',
        url: 'https://teams.microsoft.com/l/meetup-join/infosys-tech-interview',
        notes: 'Walk through PostgreSQL indexing strategies, ETL pipeline idempotency, and financial analytics dashboard design.',
        prep: {
          keyStrengths: ['PostgreSQL query indexing (48% improvement)', 'Tableau certified analytics credentials', '$420K cost reduction impact'],
          sampleQuestions: [
            'How do you manage partition pruning and indexing on tables exceeding 10M rows?',
            'Describe your approach to reconciling contradictory stakeholder metrics.'
          ]
        }
      },
      {
        company: 'Tata Consultancy Services',
        appId: appIds['Tata Consultancy Services'],
        title: 'Senior Data Analyst',
        type: 'hr',
        round: 'HR Screening & Cultural Alignment',
        offsetDays: 6,
        duration: 30,
        interviewer: 'Priya Nambiar (Senior Talent Lead)',
        email: 'priya.n@tcs.example.com',
        url: 'https://meet.google.com/tcs-hr-alex-morgan',
        notes: 'Review career progression, notice period availability, and hybrid working preferences.',
        prep: {
          keyStrengths: ['5+ years cross-functional collaboration', 'Mentoring junior data analysts', 'Consistent high performance ratings'],
          sampleQuestions: ['Why TCS for this stage of your career?', 'How do you prioritize competing deadlines across high-stakes projects?']
        }
      },
      {
        company: 'Cognizant',
        appId: appIds['Cognizant'],
        title: 'Full-Stack Data Solutions Engineer',
        type: 'video',
        round: 'Video Architecture & System Design',
        offsetDays: 8,
        duration: 75,
        interviewer: 'Marcus Vance (VP of Engineering)',
        email: 'marcus.v@cognizant.example.com',
        url: 'https://zoom.us/j/cognizant-system-design',
        notes: 'Whiteboarding session covering REST API latency tuning, Redis caching layers, and database scaling.',
        prep: {
          keyStrengths: ['Native PostgreSQL raw SQL expertise', 'Sub-40ms latency microservices', 'Dockerized CI/CD automated deployments'],
          sampleQuestions: ['Design a distributed rate limiter for high-traffic public API endpoints.', 'Explain trade-offs between Redis cache-aside vs write-through.']
        }
      },
      {
        company: 'Wipro',
        appId: appIds['Wipro'],
        title: 'Data & Insights Consultant',
        type: 'technical',
        round: 'Completed Technical Panel Interview',
        offsetDays: -5,
        duration: 60,
        interviewer: 'Anand Kulkarni (Director of Applied Data)',
        email: 'anand.k@wipro.example.com',
        url: 'https://wipro.webex.com/meet/anand.k',
        notes: 'Completed successfully with exceptional ratings on Python pipelines and business acumen. Led directly to formal offer.',
        prep: {
          keyStrengths: ['Demonstrated deep expertise in Pandas, SQL, and executive presentation skills'],
          sampleQuestions: ['Evaluated live Python coding and SQL aggregation scenario.']
        }
      },
      {
        company: 'Deloitte',
        appId: appIds['Deloitte'],
        title: 'Lead Analytics Consultant',
        type: 'final',
        round: 'Final Partner Interview',
        offsetDays: 12,
        duration: 45,
        interviewer: 'David Chen (Managing Partner, Analytics Advisory)',
        email: 'david.chen@deloitte.example.com',
        url: 'https://deloitte.zoom.us/j/partner-interview-alex',
        notes: 'Executive alignment interview discussing leadership philosophy, enterprise client consulting, and strategic account growth.',
        prep: {
          keyStrengths: ['Executive presence', 'Proven ROI on client BI engagements ($420K saved)', 'Deep consulting domain knowledge'],
          sampleQuestions: ['How do you advise enterprise clients when their legacy data hygiene is severely compromised?']
        }
      }
    ];

    for (const iv of interviewsData) {
      await client.query(
        `INSERT INTO interviews (
          user_id, application_id, company_name, job_title, interview_type,
          interview_round, scheduled_at, duration_minutes, location_or_url,
          interviewer_name, interviewer_email, preparation_notes, ai_prep_insights, created_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, NOW() + INTERVAL '${iv.offsetDays} days',
          $7, $8, $9, $10, $11, $12, NOW() - INTERVAL '5 days'
        )`,
        [
          targetUserId,
          iv.appId,
          iv.company,
          iv.title,
          iv.type,
          iv.round,
          iv.duration,
          iv.url,
          iv.interviewer,
          iv.email,
          iv.notes,
          JSON.stringify(iv.prep)
        ]
      );
    }

    // ==========================================
    // 11. SEED DOCUMENTS (DOCUMENT VAULT)
    // ==========================================
    console.log('Seeding Document Vault records...');
    const documentsData = [
      {
        title: 'Alex_Morgan_Master_Analytics_2026.pdf',
        filename: 'Alex_Morgan_Master_Analytics_2026.pdf',
        category: 'resume',
        path: 'uploads/demo-analytics-master.pdf',
        size: 438501,
        mime: 'application/pdf'
      },
      {
        title: 'Tableau_Certified_Data_Analyst_Credential.pdf',
        filename: 'Tableau_Certified_Data_Analyst.pdf',
        category: 'certificate',
        path: 'uploads/demo-tableau-cert.pdf',
        size: 215420,
        mime: 'application/pdf'
      },
      {
        title: 'AWS_Cloud_Practitioner_Official_Certificate.pdf',
        filename: 'AWS_Cloud_Practitioner_Official.pdf',
        category: 'certificate',
        path: 'uploads/demo-aws-cert.pdf',
        size: 198300,
        mime: 'application/pdf'
      },
      {
        title: 'Enterprise_Cover_Letter_Senior_Analyst.docx',
        filename: 'Enterprise_Cover_Letter_Senior_Analyst.docx',
        category: 'cover_letter',
        path: 'uploads/demo-cover-letter.docx',
        size: 45200,
        mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      },
      {
        title: 'University_Transcript_UC_Berkeley_Honors.pdf',
        filename: 'UC_Berkeley_Official_Transcript.pdf',
        category: 'other',
        path: 'uploads/demo-transcript.pdf',
        size: 612800,
        mime: 'application/pdf'
      }
    ];

    for (const doc of documentsData) {
      await client.query(
        `INSERT INTO documents (
          user_id, title, original_filename, file_path, file_size_bytes, mime_type, category
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [targetUserId, doc.title, doc.filename, doc.path, doc.size, doc.mime, doc.category]
      );
    }

    // ==========================================
    // 12. SEED 10 REALISTIC NOTIFICATIONS
    // ==========================================
    console.log('Seeding 10 notifications for demo user...');
    const notificationsData = [
      { title: 'Upcoming Interview: Infosys Technical Round', message: 'Your Round 2 Technical Deep Dive is scheduled in 3 days with Principal Architect Ramesh Sundaram.', type: 'reminder', link: '/dashboard/interviews', isRead: false },
      { title: 'Formal Offer Received: Wipro', message: 'Congratulations! Wipro has extended a formal offer for Data & Insights Consultant ($135,000).', type: 'success', link: '/dashboard/applications', isRead: false },
      { title: 'AI Customization Completed: TCS', message: 'Your tailored resume for TCS Senior Data Analyst is ready with a 94% ATS alignment score.', type: 'success', link: '/dashboard/versions', isRead: false },
      { title: 'Application Shortlisted: Capgemini', message: 'Capgemini Talent Acquisition has moved your application for Senior BI Architect to Shortlisted.', type: 'info', link: '/dashboard/applications', isRead: false },
      { title: 'HR Screening Scheduled: TCS', message: 'Your HR culture alignment conversation with Priya Nambiar is confirmed for next Tuesday.', type: 'reminder', link: '/dashboard/interviews', isRead: false },
      { title: 'Interview Talking Points Generated', message: 'AI Interview Studio generated STAR-framework prep talking points for your upcoming Cognizant architectural interview.', type: 'info', link: '/dashboard/interviews', isRead: true },
      { title: 'Application Submitted: Accenture', message: 'Your application for Applied Intelligence Analyst has been submitted and locked with resume version 4.', type: 'info', link: '/dashboard/applications', isRead: true },
      { title: 'AI Monthly Credits Renewed', message: 'Your Pro Career plan monthly allocation of 100 AI credits has been successfully refreshed.', type: 'system', link: '/dashboard/billing', isRead: true },
      { title: 'Application Status Update: HCLTech', message: 'HCLTech has closed the Enterprise Business Analyst position due to team restructuring.', type: 'warning', link: '/dashboard/applications', isRead: true },
      { title: 'Profile Strength: 100% Complete', message: 'Your candidate profile, work experience history, and master resumes are fully verified and ATS-ready.', type: 'success', link: '/dashboard/profile', isRead: true }
    ];

    for (const n of notificationsData) {
      await client.query(
        `INSERT INTO notifications (user_id, title, message, type, link, is_read, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW() - INTERVAL '3 days')`,
        [targetUserId, n.title, n.message, n.type, n.link, n.isRead]
      );
    }

    // ==========================================
    // 13. SEED SUPPORT TICKETS
    // ==========================================
    console.log('Seeding sample support tickets...');
    const supportTicketsData = [
      {
        subject: 'PDF Table Parsing formatting in two-column resume',
        message: 'When uploading my two-column design resume, will the deterministic parser properly group the skills sidebar separately from work experience?',
        category: 'Document Parsing',
        priority: 'medium',
        status: 'resolved',
        adminResponse: 'Yes! The deterministic parser identifies multi-column boundaries and maps skills directly into category-based competencies without mixing bullet points.'
      },
      {
        subject: 'Inquiry regarding DOCX export styling customization',
        message: 'Can I customize font size and margins when exporting my locked resume versions into Word DOCX format?',
        category: 'Resume Customization & AI',
        priority: 'low',
        status: 'open',
        adminResponse: null
      }
    ];

    for (const st of supportTicketsData) {
      await client.query(
        `INSERT INTO support_tickets (user_id, subject, message, category, priority, status, admin_response, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW() - INTERVAL '2 days')`,
        [targetUserId, st.subject, st.message, st.category, st.priority, st.status, st.adminResponse]
      );
    }

    // ==========================================
    // 14. SEED BILLING TRANSACTIONS & AUDIT LOGS
    // ==========================================
    console.log('Seeding billing history and audit trail...');
    await client.query(
      `INSERT INTO payments (user_id, plan_id, amount, currency, status, receipt_url, invoice_number, created_at)
       VALUES 
       ($1, $2, 19.00, 'USD', 'completed', '/invoices/inv_demo_2026_01.pdf', $3, NOW() - INTERVAL '10 days'),
       ($1, $2, 19.00, 'USD', 'completed', '/invoices/inv_demo_2025_12.pdf', $4, NOW() - INTERVAL '40 days')
       ON CONFLICT (invoice_number) DO NOTHING`,
      [targetUserId, proPlanId, `${invoicePrefix}-001`, `${invoicePrefix}-012`]
    );

    await client.query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details)
       VALUES 
       ($1, 'RESUME_CUSTOMIZATION_CREATED', 'resume_versions', $2, '{"company": "TCS", "score": 94}'),
       ($1, 'RESUME_CUSTOMIZATION_CREATED', 'resume_versions', $3, '{"company": "Infosys", "score": 89}'),
       ($1, 'APPLICATION_SUBMITTED', 'job_applications', $4, '{"company": "TCS", "version": 2}'),
       ($1, 'APPLICATION_SUBMITTED', 'job_applications', $5, '{"company": "Infosys", "version": 3}')`,
      [targetUserId, v2Id, v3Id, appIds['Tata Consultancy Services'], appIds['Infosys']]
    );

  }

  const proPlanId = planIds['pro'] || planIds['free'];
  await seedUserPortfolio(client, userIds['demo@smartresume.com'], 'demo@smartresume.com', 'Alex Morgan', proPlanId, false);
  await seedUserPortfolio(client, userIds['superadmin@smartresume.ai'], 'superadmin@smartresume.ai', 'Alexander Vance', proPlanId, true);
  });

  console.log('✅ Master database seeding finished successfully for demo@smartresume.com and all platform users!');
}

// Auto-run if executed directly
if (process.argv[1]?.includes('seed')) {
  runSeed()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Seed execution error:', err);
      process.exit(1);
    });
}

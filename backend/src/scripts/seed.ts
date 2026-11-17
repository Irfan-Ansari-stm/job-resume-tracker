import bcrypt from 'bcryptjs';
import { db } from '../config/db.js';

export async function runSeed() {
  console.log('🌱 Starting idempotent database seeding...');

  const passwordHash = await bcrypt.hash('Password123!', 10);

  await db.transaction(async (client) => {
    // 1. SEED SUBSCRIPTION PLANS
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

    // 2. SEED RESUME TEMPLATES
    console.log('Seeding resume templates...');
    const templates = [
      {
        name: 'Modern Tech',
        slug: 'modern-tech',
        description: 'Clean two-column layout optimized for software engineers and technology professionals.',
        category: 'Technology',
        isPremium: false,
      },
      {
        name: 'Executive Suite',
        slug: 'executive-suite',
        description: 'Sophisticated single-column format with strong visual hierarchy for leadership and management.',
        category: 'Executive',
        isPremium: true,
      },
      {
        name: 'Creative Edge',
        slug: 'creative-edge',
        description: 'Distinctive typography and accent sections tailored for designers and creative specialists.',
        category: 'Creative',
        isPremium: false,
      },
      {
        name: 'Minimalist Clean',
        slug: 'minimalist-clean',
        description: 'Stripped-down, elegant layout emphasizing bullet impact and clarity.',
        category: 'Minimalist',
        isPremium: false,
      },
      {
        name: 'ATS Standard Compliance',
        slug: 'ats-standard',
        description: 'Strict machine-readable linear layout designed to maximize applicant tracking system scores.',
        category: 'Standard',
        isPremium: false,
      }
    ];

    for (const t of templates) {
      await client.query(
        `INSERT INTO resume_templates (name, slug, description, category, is_premium, is_active)
         VALUES ($1, $2, $3, $4, $5, true)
         ON CONFLICT (slug) DO UPDATE 
         SET name = EXCLUDED.name, description = EXCLUDED.description, category = EXCLUDED.category`,
        [t.name, t.slug, t.description, t.category, t.isPremium]
      );
    }

    // 3. SEED AI PROMPT TEMPLATES
    console.log('Seeding AI prompt templates...');
    const prompts = [
      {
        code: 'resume_customization',
        name: 'Resume Customization Engine',
        description: 'Tailors resumes strictly using candidate facts for target roles.',
        systemPrompt: 'You are an Executive Resume Strategist. NEVER fabricate qualifications, companies, degrees, or skills. Highlight relevant real candidate experiences and identify missing requirements in the skills gap report.',
        userPromptTemplate: 'Target Job: {{jobTitle}} at {{companyName}}.\nJob Requirements: {{jobDescription}}.\nCandidate Resume: {{resumeJson}}.\nInstructions: {{instructions}}',
      },
      {
        code: 'job_analysis',
        name: 'Job Description Analyzer',
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

    // 4. SEED USERS & PERSONAS
    console.log('Seeding users and profiles...');
    const usersData = [
      {
        email: 'superadmin@smartresume.ai',
        role: 'super_admin',
        firstName: 'Alexander',
        lastName: 'Vance',
        phone: '+1-555-0100',
        headline: 'Platform Owner & Super Administrator',
        bio: 'Oversees platform governance, AI integrations, subscription economics, and system security.',
        plan: 'premium',
        credits: 1000,
      },
      {
        email: 'admin@smartresume.ai',
        role: 'admin',
        firstName: 'Sarah',
        lastName: 'Jenkins',
        phone: '+1-555-0101',
        headline: 'Lead Platform Moderator & Content Specialist',
        bio: 'Manages user verifications, template moderation, and platform prompt engineering.',
        plan: 'pro',
        credits: 500,
      },
      {
        email: 'aarav.patel@example.com',
        role: 'user',
        firstName: 'Aarav',
        lastName: 'Patel',
        phone: '+91-98765-43210',
        headline: 'Senior Data Analyst | SQL, Python, Tableau & Power BI',
        bio: 'Passionate data analyst with 5+ years of experience turning complex datasets into strategic insights.',
        targetRole: 'Lead Data Analyst',
        targetIndustry: 'Information Technology & Financial Services',
        yearsExp: 5.5,
        plan: 'pro',
        credits: 85,
      },
      {
        email: 'priya.sharma@example.com',
        role: 'user',
        firstName: 'Priya',
        lastName: 'Sharma',
        phone: '+91-98765-43211',
        headline: 'Business Analyst | Agile, BRD/FRD, Process Optimization',
        bio: 'Bridge between business stakeholders and technical development teams with 4 years of consulting experience.',
        targetRole: 'Senior Business Analyst',
        targetIndustry: 'Enterprise Consulting',
        yearsExp: 4.0,
        plan: 'pro',
        credits: 60,
      },
      {
        email: 'rohan.verma@example.com',
        role: 'user',
        firstName: 'Rohan',
        lastName: 'Verma',
        phone: '+91-98765-43212',
        headline: 'Full-Stack Software Engineer | TypeScript, React, Node.js, PostgreSQL',
        bio: 'Passionate builder specializing in modern distributed systems, cloud architectures, and scalable APIs.',
        targetRole: 'Senior Software Engineer',
        targetIndustry: 'SaaS & Cloud Platforms',
        yearsExp: 4.5,
        plan: 'pro',
        credits: 75,
      },
      {
        email: 'ananya.iyer@example.com',
        role: 'user',
        firstName: 'Ananya',
        lastName: 'Iyer',
        phone: '+91-98765-43213',
        headline: 'Lead UI/UX Designer | Design Systems, Figma, User Research',
        bio: 'Creating human-centered digital experiences and design systems used by millions of global users.',
        targetRole: 'Senior Product Designer',
        targetIndustry: 'Consumer Tech & SaaS',
        yearsExp: 3.5,
        plan: 'free',
        credits: 15,
      },
      {
        email: 'vikram.singh@example.com',
        role: 'user',
        firstName: 'Vikram',
        lastName: 'Singh',
        phone: '+91-98765-43214',
        headline: 'Aspiring Software Engineer | Recent Computer Science Graduate',
        bio: 'Driven recent graduate with honors in CS, strong algorithmic problem solving, and hands-on internship experience.',
        targetRole: 'Junior Software Engineer',
        targetIndustry: 'Technology',
        yearsExp: 0.8,
        plan: 'free',
        credits: 12,
      }
    ];

    const userIds: Record<string, string> = {};
    for (const u of usersData) {
      const existingUser = await client.query(`SELECT id FROM users WHERE email = $1`, [u.email]);
      let uId: string;

      if (existingUser.rows.length > 0) {
        uId = existingUser.rows[0].id;
        await client.query(
          `UPDATE users SET password_hash = $2, role = $3, first_name = $4, last_name = $5, phone = $6 WHERE id = $1`,
          [uId, passwordHash, u.role, u.firstName, u.lastName, u.phone]
        );
      } else {
        const newU = await client.query(
          `INSERT INTO users (email, password_hash, first_name, last_name, phone, role, is_email_verified, is_active)
           VALUES ($1, $2, $3, $4, $5, $6, true, true)
           RETURNING id`,
          [u.email, passwordHash, u.firstName, u.lastName, u.phone, u.role]
        );
        uId = newU.rows[0].id;
      }
      userIds[u.email] = uId;

      // Update Profile
      await client.query(
        `INSERT INTO user_profiles (user_id, headline, bio, target_role, target_industry, years_of_experience)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (user_id) DO UPDATE 
         SET headline = EXCLUDED.headline, bio = EXCLUDED.bio, target_role = EXCLUDED.target_role, 
             years_of_experience = EXCLUDED.years_of_experience`,
        [uId, u.headline, u.bio, u.targetRole || null, u.targetIndustry || null, u.yearsExp || 0]
      );

      // Preferences
      await client.query(
        `INSERT INTO user_preferences (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING`,
        [uId]
      );

      // Credits
      await client.query(
        `INSERT INTO user_ai_credits (user_id, total_credits, used_credits)
         VALUES ($1, $2, 0)
         ON CONFLICT (user_id) DO UPDATE SET total_credits = EXCLUDED.total_credits`,
        [uId, u.credits]
      );

      // Subscription
      const pId = planIds[u.plan] || planIds['free'];
      await client.query(
        `INSERT INTO user_subscriptions (user_id, plan_id, status, billing_interval)
         VALUES ($1, $2, 'active', 'monthly')
         ON CONFLICT DO NOTHING`,
        [uId, pId]
      );
    }

    // 5. SEED COMPANIES FOR DATA ANALYST (AARAV PATEL)
    console.log('Seeding companies, jobs, resumes, versions, and applications for Aarav Patel...');
    const aaravId = userIds['aarav.patel@example.com'];

    const companies = [
      { name: 'TCS', industry: 'IT Services & Consulting', location: 'Bengaluru / Mumbai', website: 'https://www.tcs.com' },
      { name: 'Infosys', industry: 'Information Technology', location: 'Bengaluru / Pune', website: 'https://www.infosys.com' },
      { name: 'Wipro', industry: 'Technology Services', location: 'Bengaluru / Hyderabad', website: 'https://www.wipro.com' },
      { name: 'Accenture', industry: 'Management Consulting & IT', location: 'Gurugram / Bengaluru', website: 'https://www.accenture.com' },
      { name: 'HCLTech', industry: 'Next-Gen Global Technology', location: 'Noida / Chennai', website: 'https://www.hcltech.com' },
      { name: 'Capgemini', industry: 'Digital Transformation & Tech', location: 'Mumbai / Hyderabad', website: 'https://www.capgemini.com' },
    ];

    const companyMap: Record<string, string> = {};
    for (const c of companies) {
      const cRes = await client.query(
        `INSERT INTO companies (user_id, name, industry, location, website, is_favorite)
         VALUES ($1, $2, $3, $4, $5, true)
         RETURNING id`,
        [aaravId, c.name, c.industry, c.location, c.website]
      );
      companyMap[c.name] = cRes.rows[0].id;
    }

    // 6. SEED JOBS FOR AARAV
    const jobsData = [
      {
        company: 'TCS',
        title: 'Senior Data Analyst',
        rawDesc: 'Seeking a Senior Data Analyst with expertise in SQL, Python, Tableau, and automated data pipelines. Must have experience optimizing relational databases and presenting executive dashboards.',
        skills: ['SQL', 'Python', 'Tableau', 'Power BI', 'Data Modeling', 'ETL'],
      },
      {
        company: 'Infosys',
        title: 'Lead Analytics Specialist',
        rawDesc: 'Lead business intelligence and analytics reporting for tier-1 banking clients. Requires advanced SQL querying, Python automation, and stakeholder management skills.',
        skills: ['SQL', 'Python', 'Financial Analytics', 'Dashboard Design', 'Agile'],
      },
      {
        company: 'Wipro',
        title: 'Data & Insights Consultant',
        rawDesc: 'Responsible for end-to-end data analytics, machine learning model interpretation, and automated visualization across global enterprise projects.',
        skills: ['Python', 'SQL', 'Tableau', 'Pandas', 'Stakeholder Communication'],
      },
      {
        company: 'Accenture',
        title: 'Applied Intelligence Analyst',
        rawDesc: 'Drive analytics transformation with cloud data warehouses (PostgreSQL, Snowflake) and advanced data visualization.',
        skills: ['SQL', 'PostgreSQL', 'Python', 'Cloud Analytics', 'Data Governance'],
      },
    ];

    const jobMap: Record<string, string> = {};
    for (const j of jobsData) {
      const jRes = await client.query(
        `INSERT INTO jobs (
          user_id, company_id, company_name, title, raw_description, 
          required_skills, ats_keywords, location, employment_type
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'Bengaluru, India (Hybrid)', 'full_time')
        RETURNING id`,
        [
          aaravId, companyMap[j.company], j.company, j.title, j.rawDesc,
          JSON.stringify(j.skills), JSON.stringify(j.skills)
        ]
      );
      jobMap[j.company] = jRes.rows[0].id;
    }

    // 7. SEED ROOT RESUME FOR AARAV PATEL
    const aaravCanonicalResume = {
      contactInfo: {
        fullName: 'Aarav Patel',
        email: 'aarav.patel@example.com',
        phone: '+91 98765 43210',
        location: 'Bengaluru, Karnataka, India',
        linkedin: 'https://linkedin.com/in/aarav-patel-data',
        github: 'https://github.com/aaravpatel-analytics',
      },
      summary: 'Data Analyst with 5+ years of experience delivering actionable business intelligence, architecting automated ETL pipelines, and optimizing complex SQL queries across retail and enterprise finance sectors.',
      skills: [
        { category: 'Data Analysis & BI', items: ['SQL', 'PostgreSQL', 'Tableau', 'Power BI', 'Excel Advanced', 'Looker'] },
        { category: 'Programming & Tools', items: ['Python', 'Pandas', 'NumPy', 'Git', 'Jira', 'Docker'] },
        { category: 'Techniques & Concepts', items: ['Data Modeling', 'ETL Pipelines', 'Statistical Analysis', 'A/B Testing', 'Agile'] },
      ],
      experience: [
        {
          id: 'exp-1',
          jobTitle: 'Senior Data Analyst',
          company: 'FinTech Solutions Global',
          location: 'Bengaluru, India',
          startDate: '2022-03',
          endDate: 'Present',
          isCurrent: true,
          bulletPoints: [
            'Architected 15+ automated Tableau and Power BI executive dashboards reducing monthly financial reporting cycle from 5 days to 4 hours.',
            'Optimized relational PostgreSQL and SQL queries across 10M+ transaction records, improving query execution time by 42%.',
            'Collaborated with cross-functional product and engineering teams to identify cost optimization initiatives resulting in $340K annual savings.'
          ]
        },
        {
          id: 'exp-2',
          jobTitle: 'Data Analyst',
          company: 'RetailPulse Analytics',
          location: 'Pune, India',
          startDate: '2019-06',
          endDate: '2022-02',
          isCurrent: false,
          bulletPoints: [
            'Developed Python ETL pipelines leveraging Pandas and SQL to ingest and clean point-of-sale data from 450+ retail storefronts.',
            'Conducted customer cohort segmentation and churn prediction models contributing to an 18% improvement in customer retention.',
            'Maintained rigorous data governance standards and automated daily anomaly alerts.'
          ]
        }
      ],
      education: [
        {
          id: 'edu-1',
          degree: 'Bachelor of Technology',
          field: 'Information Technology',
          institution: 'National Institute of Technology Karnataka',
          location: 'Surathkal, India',
          graduationDate: '2019',
          gpa: '8.7/10.0'
        }
      ],
      projects: [
        {
          id: 'proj-1',
          title: 'Automated Sales Forecasting Pipeline',
          technologies: ['Python', 'SQL', 'Tableau', 'Pandas'],
          description: 'Built a predictive forecasting pipeline using historical sales data and automated daily dashboard updates.'
        }
      ],
      certifications: [
        { id: 'cert-1', name: 'Tableau Certified Data Analyst', issuer: 'Tableau', date: '2023' },
        { id: 'cert-2', name: 'AWS Certified Cloud Practitioner', issuer: 'Amazon Web Services', date: '2022' }
      ]
    };

    const resumeRes = await client.query(
      `INSERT INTO resumes (
        user_id, title, summary, target_role, category, is_primary, parsed_data
      ) VALUES ($1, $2, $3, $4, 'Analytics', true, $5)
      RETURNING id`,
      [
        aaravId,
        'Aarav Patel - Master Data Analyst Resume',
        aaravCanonicalResume.summary,
        'Senior Data Analyst',
        JSON.stringify(aaravCanonicalResume)
      ]
    );
    const resumeId = resumeRes.rows[0].id;

    // 8. SEED RESUME VERSIONS (TCS, Infosys, Accenture, Wipro)
    // Version 1: Baseline
    const v1Res = await client.query(
      `INSERT INTO resume_versions (
        resume_id, user_id, version_number, version_label, 
        content_snapshot, change_summary, match_score, status, is_immutable
      ) VALUES ($1, $2, 1, 'Master Baseline Version', $3, 'Initial uploaded master resume snapshot', 75, 'final', false)
      RETURNING id`,
      [resumeId, aaravId, JSON.stringify(aaravCanonicalResume)]
    );
    const v1Id = v1Res.rows[0].id;

    // Version 2: Customized for TCS - Data Analyst
    const tcsSnapshot = JSON.parse(JSON.stringify(aaravCanonicalResume));
    tcsSnapshot.summary = 'Targeted Senior Data Analyst for Tata Consultancy Services: Results-oriented analytics specialist with 5+ years driving high-impact data modeling, SQL query optimization, and executive Tableau reporting across large enterprise deployments.';
    const v2Res = await client.query(
      `INSERT INTO resume_versions (
        resume_id, user_id, parent_version_id, company_name, job_title,
        version_number, version_label, customization_instructions, ai_model_used,
        content_snapshot, change_summary, match_score, matched_keywords, missing_keywords,
        status, is_immutable
      ) VALUES (
        $1, $2, $3, 'TCS', 'Senior Data Analyst',
        2, 'TCS - Senior Data Analyst (v2)', 'Emphasize SQL optimization, automated pipelines, and enterprise Tableau dashboards.', 'gpt-4o-mini',
        $4, 'Tailored professional summary for TCS, emphasized PostgreSQL query tuning, highlighted 15+ automated executive dashboards.',
        92, $5, $6, 'submitted', true
      ) RETURNING id`,
      [
        resumeId, aaravId, v1Id,
        JSON.stringify(tcsSnapshot),
        JSON.stringify(['SQL', 'Python', 'Tableau', 'Power BI', 'Data Modeling', 'ETL']),
        JSON.stringify(['Snowflake'])
      ]
    );
    const v2Id = v2Res.rows[0].id;

    // Version 3: Customized for Infosys - Lead Analytics Specialist
    const infosysSnapshot = JSON.parse(JSON.stringify(aaravCanonicalResume));
    infosysSnapshot.summary = 'Targeted Lead Analytics Specialist for Infosys: Experienced analytics leader adept in financial data modeling, automated ETL delivery, and client stakeholder presentations.';
    const v3Res = await client.query(
      `INSERT INTO resume_versions (
        resume_id, user_id, parent_version_id, company_name, job_title,
        version_number, version_label, customization_instructions, ai_model_used,
        content_snapshot, change_summary, match_score, matched_keywords, missing_keywords,
        status, is_immutable
      ) VALUES (
        $1, $2, $3, 'Infosys', 'Lead Analytics Specialist',
        3, 'Infosys - Lead Analytics Specialist (v3)', 'Highlight stakeholder collaboration and financial analytics experience.', 'gpt-4o-mini',
        $4, 'Refocused career achievements on client relationship management and data governance.',
        88, $5, $6, 'submitted', true
      ) RETURNING id`,
      [
        resumeId, aaravId, v1Id,
        JSON.stringify(infosysSnapshot),
        JSON.stringify(['SQL', 'Python', 'Financial Analytics', 'Dashboard Design']),
        JSON.stringify(['Spark'])
      ]
    );
    const v3Id = v3Res.rows[0].id;

    // 9. SEED JOB APPLICATIONS WITH IMMUTABLE LINKED VERSIONS
    console.log('Seeding job applications linked to resume versions...');

    // Application 1: TCS (Applied) -> Linked to v2 (LOCKED SNAPSHOT)
    const app1Res = await client.query(
      `INSERT INTO job_applications (
        user_id, company_id, job_id, resume_version_id, company_name, job_title,
        location, employment_type, salary_range, status, priority, application_date,
        submitted_at, submitted_resume_snapshot, deadline, notes
      ) VALUES (
        $1, $2, $3, $4, 'TCS', 'Senior Data Analyst',
        'Bengaluru, India', 'full_time', '₹18,00,000 - ₹24,00,000',
        'applied', 'high', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days',
        $5, NOW() + INTERVAL '10 days', 'Application submitted via TCS careers portal. Linked to resume version 2.'
      ) RETURNING id`,
      [aaravId, companyMap['TCS'], jobMap['TCS'], v2Id, JSON.stringify(tcsSnapshot)]
    );

    // Application 2: Infosys (Interview Scheduled) -> Linked to v3
    const app2Res = await client.query(
      `INSERT INTO job_applications (
        user_id, company_id, job_id, resume_version_id, company_name, job_title,
        location, employment_type, salary_range, status, priority, application_date,
        submitted_at, submitted_resume_snapshot, follow_up_date, notes
      ) VALUES (
        $1, $2, $3, $4, 'Infosys', 'Lead Analytics Specialist',
        'Bengaluru, India', 'full_time', '₹20,00,000 - ₹26,00,000',
        'interview_scheduled', 'high', NOW() - INTERVAL '12 days', NOW() - INTERVAL '12 days',
        $5, NOW() + INTERVAL '2 days', 'Technical screening cleared. Scheduled for round 2 architecture review.'
      ) RETURNING id`,
      [aaravId, companyMap['Infosys'], jobMap['Infosys'], v3Id, JSON.stringify(infosysSnapshot)]
    );

    // Application 3: Wipro (Offer Received)
    await client.query(
      `INSERT INTO job_applications (
        user_id, company_id, company_name, job_title, location, employment_type,
        salary_range, status, priority, application_date, notes
      ) VALUES (
        $1, $2, 'Wipro', 'Data & Insights Consultant', 'Bengaluru, India', 'full_time',
        '₹22,00,000', 'offer_received', 'high', NOW() - INTERVAL '25 days',
        'Formal offer received. Reviewing compensation package.'
      )`,
      [aaravId, companyMap['Wipro']]
    );

    // Application 4: Accenture (Assessment)
    await client.query(
      `INSERT INTO job_applications (
        user_id, company_id, company_name, job_title, location, employment_type,
        salary_range, status, priority, application_date, notes
      ) VALUES (
        $1, $2, 'Accenture', 'Applied Intelligence Analyst', 'Gurugram, India', 'full_time',
        '₹19,00,000 - ₹23,00,000', 'assessment', 'medium', NOW() - INTERVAL '8 days',
        'Online SQL and algorithmic assessment due on Friday.'
      )`,
      [aaravId, companyMap['Accenture']]
    );

    // Application 5: HCLTech (Rejected)
    await client.query(
      `INSERT INTO job_applications (
        user_id, company_id, company_name, job_title, location, employment_type,
        salary_range, status, priority, application_date, notes
      ) VALUES (
        $1, $2, 'HCLTech', 'Business Analyst', 'Noida, India', 'full_time',
        '₹16,00,000', 'rejected', 'low', NOW() - INTERVAL '30 days',
        'Role was put on hold for internal reorganization.'
      )`,
      [aaravId, companyMap['HCLTech']]
    );

    // 10. SEED INTERVIEW FOR INFOSYS
    console.log('Seeding interview and preparation...');
    const interviewRes = await client.query(
      `INSERT INTO interviews (
        user_id, application_id, company_name, job_title, interview_type,
        interview_round, scheduled_at, duration_minutes, location_or_url,
        interviewer_name, interviewer_email, preparation_notes,
        ai_prep_insights
      ) VALUES (
        $1, $2, 'Infosys', 'Lead Analytics Specialist', 'video',
        'Round 2: Technical Deep Dive', NOW() + INTERVAL '2 days' + INTERVAL '3 hours',
        60, 'https://teams.microsoft.com/l/meetup-join/infosys-tech-interview',
        'Ramesh Sundaram (Principal Architect)', 'ramesh.s@infosys.example.com',
        'Prepare detailed architectural walk-through of the FinTech PostgreSQL optimization project and Tableau server deployment.',
        $3
      ) RETURNING id`,
      [
        aaravId,
        app2Res.rows[0].id,
        JSON.stringify({
          keyStrengthsToHighlight: [
            'PostgreSQL query indexing and 42% query execution improvement',
            'Cross-functional leadership with $340K cost reduction',
            'Tableau Certified Data Analyst credentials'
          ],
          anticipatedQuestions: [
            'How do you handle indexing strategies on high-write relational tables?',
            'Describe an instance where a stakeholder pushed back on your data findings and how you resolved it.'
          ]
        })
      ]
    );

    // 11. SEED NOTIFICATIONS & AUDIT LOGS
    console.log('Seeding notifications & audit logs...');
    await client.query(
      `INSERT INTO notifications (user_id, title, message, type, link)
       VALUES 
       ($1, 'Interview Scheduled: Infosys', 'Your Round 2 Technical Deep Dive is scheduled for Thursday at 2:00 PM.', 'reminder', '/dashboard/interviews'),
       ($1, 'AI Resume Tailored: TCS', 'Your resume version for TCS Senior Data Analyst is ready with a 92% match score.', 'success', '/dashboard/resumes'),
       ($1, 'Upcoming Deadline: Accenture Assessment', 'Complete your SQL technical assessment before Friday 6:00 PM.', 'warning', '/dashboard/applications')`,
      [aaravId]
    );

    await client.query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details)
       VALUES 
       ($1, 'RESUME_CUSTOMIZATION_CREATED', 'resume_versions', $2, '{"company": "TCS", "score": 92}'),
       ($1, 'APPLICATION_SUBMITTED', 'job_applications', $3, '{"company": "TCS", "version": 2}')`,
      [aaravId, v2Id, app1Res.rows[0].id]
    );

    // 12. SEED CMS CONTENT
    console.log('Seeding CMS Content for Marketing Pages...');
    const cmsSections = [
      {
        key: 'homepage_hero',
        title: 'One Resume. Multiple Opportunities. Every Application Organized.',
        subtitle: 'Customize your resume for every job with AI, preserve every version, and manage your entire job application journey in one intelligent workspace.',
        content: {
          badgeText: 'Smart AI Resume Management Platform',
          ctaPrimaryText: 'Get Started Free',
          ctaSecondaryText: 'Explore Features',
          stat1: '95% ATS Pass Rate',
          stat2: '3.4x Interview Conversion',
          stat3: '100% Immutable Version Snapshots'
        }
      },
      {
        key: 'features',
        title: 'Built for High-Performing Professionals',
        subtitle: 'Powerful tools engineered to accelerate your job hunt without sacrificing career integrity.',
        content: {
          list: [
            { title: 'Deterministic Resume Parsing', desc: 'Accurately parses PDF, DOCX, and text documents into structured data.' },
            { title: 'Strict Integrity Customization', desc: 'Never hallucinates credentials. Tailors real candidate facts for maximum ATS alignment.' },
            { title: 'Immutable Version Snapshots', desc: 'Every application remembers the exact resume version submitted. Never lose track of what you sent.' },
            { title: 'Full-Cycle Job Tracker', desc: 'Kanban boards, interview schedules, reminders, and company relationship tracking in one unified hub.' }
          ]
        }
      }
    ];

    for (const sec of cmsSections) {
      await client.query(
        `INSERT INTO cms_content (section_key, title, subtitle, content)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (section_key) DO UPDATE 
         SET title = EXCLUDED.title, subtitle = EXCLUDED.subtitle, content = EXCLUDED.content`,
        [sec.key, sec.title, sec.subtitle, JSON.stringify(sec.content)]
      );
    }
  });

  console.log('✅ Database seeding finished successfully!');
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

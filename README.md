# SmartResume AI — AI-Powered Smart Resume Management Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js 15](https://img.shields.io/badge/Next.js-15-black?style=flat&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-Backend-green?style=flat&logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Raw_SQL_(No_ORM)-blue?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![AI-Powered](https://img.shields.io/badge/AI-OpenAI_GPT--4o_Engine-purple?style=flat&logo=openai&logoColor=white)](https://openai.com/)
[![Vitest](https://img.shields.io/badge/Vitest-66_Tests_Passing-brightgreen?style=flat&logo=vitest&logoColor=white)](https://vitest.dev/)

> **"One Resume. Multiple Opportunities. Every Application Organized."**  
> A complete, production-ready full-stack SaaS platform designed for high-performing job seekers and platform owners.

---

## 🌟 Architectural Highlights

- **Pure PostgreSQL with Parameterized Raw SQL**: Strictly **NO ORM** (No Prisma, TypeORM, Drizzle, or Sequelize). Direct connection pooling via native `pg` (`node-postgres`) ensuring maximum query performance, explicit schema control, and atomic transactions.
- **Ethical AI Integrity Core**: Never hallucinates credentials, fake employment history, or fabricated degrees. Customizes genuine candidate experience for target roles, flags missing requirements as honest Skills Gap Reports, and delivers estimated ATS match scores.
- **Immutable Resume Version Snapshots**: When marking an application as *Applied*, the platform locks an immutable content snapshot of the submitted resume. You will always know verbatim what was sent to TCS, Infosys, or Google.
- **Three Fully Integrated Application Experiences**:
  1. **Public Marketing Website**: 18 polished pages (Hero with value prop, interactive demo, templates gallery, pricing tiers, FAQs, blog, legal docs).
  2. **Candidate Dashboard**: 14 responsive workspaces (Overview, Resumes, AI Studio, Version Management, Application Kanban, Companies, Saved Jobs, Interview Prep, Analytics, Document Vault, Notifications, Billing, Profile, Support).
  3. **Super Admin Control Center**: Complete platform governance (Overview KPIs, User Management & RBAC, AI Models & Prompt Editor, Templates, Global Applications, Plan Economics, System Settings, Audit Logs).

---

## 🚀 Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Lucide React, Recharts |
| **Backend** | Node.js, Express.js, TypeScript, RESTful API (`/api/v1`), Zod validation, JWT, Multer |
| **Database** | PostgreSQL 16+, Parameterized Raw SQL, Connection Pooling (`pg`), SQL Migrations & Seeds |
| **AI Integration** | OpenAI API (`gpt-4o-mini` / configurable provider) with intelligent deterministic fallback |
| **File Storage** | Local storage abstraction for development, S3-compatible cloud storage architecture for production |
| **Testing** | Vitest, Supertest, End-to-end multi-step lifecycle testing suites (66 automated tests passing) |
| **DevOps** | Docker, Docker Compose, Multi-stage builds, Production health checks |

---

## 🔑 Primary Credentials & Portals

### 1. Candidate Demo Account
- **Portal URL**: [http://localhost:3000/dashboard](http://localhost:3000/dashboard)
- **Email**: `demo@smartresume.com`
- **Password**: `Demo@123456`
- **Data Seeded**: 3 Master Resumes, 5 Tailored Versions, 10 Target Companies, 8 Saved Jobs, 10 Applications across stages, 5 Scheduled Interviews with STAR talking points, 5 Document Vault files, 10 Notifications, Support Tickets, and Billing history.

### 2. Super Administrator Account
- **Portal URL**: [http://localhost:3000/admin](http://localhost:3000/admin) (or switch via top-bar badge)
- **Candidate Workspace**: [http://localhost:3000/dashboard](http://localhost:3000/dashboard)
- **Email**: `superadmin@smartresume.ai`
- **Password**: `Password123!`
- **Authority**: Full CRUD across every platform user, master resumes, applications, AI prompts, telemetry, and audit trails.

---

## 📱 Complete Module Overview (All 14 Workspaces)

| # | Workspace Module | Route | Key Functionality |
|---|---|---|---|
| **1** | **Dashboard Overview** | `/dashboard` | Live database KPI cards (Resumes, Versions, Applications, Active, Interviews, Offers, Credits), dynamic velocity bar chart, recent applications table, and 7d/30d/90d/All filters. |
| **2** | **My Resumes** | `/dashboard/resumes` | Upload PDF/DOCX resumes, extract text into structured sections (Skills, Experience, Education, Projects, Certifications), manual profile creation, and inline PDF preview. |
| **3** | **AI Resume Studio** | `/dashboard/ai-studio` | 2-step customization engine: select source resume & job description -> calculate ATS alignment, generate keyword match delta, skills gap report, and export version. |
| **4** | **Resume Versions** | `/dashboard/versions` | Immutable content snapshots with version numbers, company tags, ATS scores, visual comparison tool, and 1-click restore. |
| **5** | **Job Applications** | `/dashboard/applications` | Kanban pipeline and list views with status lifecycle: Interested, Saved, Applied, Under Review, Shortlisted, Interviewing, Offer Received, Rejected, Withdrawn. |
| **6** | **Target Companies** | `/dashboard/companies` | Employer directory tracking recruiter contacts, office locations, industry classification, linked applications, and tailored versions. |
| **7** | **Saved Jobs & Requirements** | `/dashboard/jobs` | Save job postings, run automatic requirement extraction, and convert saved jobs to tracked applications with 1 click. |
| **8** | **Interviews & AI Prep** | `/dashboard/interviews` | Schedule rounds (Phone, Video, Technical, HR, Behavioral, Final), generate STAR-framework talking points, and review sample answers. |
| **9** | **Analytics & Insights** | `/dashboard/analytics` | Real PostgreSQL-computed funnel velocity: Interview Conversion Rate, Offer Conversion Rate, Average ATS Match Score, and company distributions. |
| **10** | **Document Vault** | `/dashboard/documents` | Secure private storage for resumes, cover letters, certifications, and portfolios with streaming preview and downloads. |
| **11** | **Notifications Center** | `/dashboard/notifications` | Database-backed alerts for application status updates, interview reminders, and credit updates. |
| **12** | **Plan & Billing** | `/dashboard/billing` | Subscription tiers (Free, Pro, Premium), AI credit wallet balance, monthly usage history, and downloadable invoices. |
| **13** | **Profile & Settings** | `/dashboard/profile` | Candidate contact details, professional headline, years of experience, password changes, and account preferences. |
| **14** | **Help & Support** | `/dashboard/help` & `/dashboard/support` | Interactive FAQ accordion, live support ticket logging, and ticket resolution history. |

---

## ⚡ Quick Start & Execution Commands

### 1. Environment Setup
Create your `.env` in `backend/`:
```env
PORT=5000
DATABASE_URL=postgresql://postgres@127.0.0.1:5432/smart_resume_tracker
JWT_SECRET=super-secret-jwt-key-for-development-change-in-prod-min32chars
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=super-secret-jwt-refresh-key-for-development-change-in-prod
JWT_REFRESH_EXPIRES_IN=30d
AI_PROVIDER=openai
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
STORAGE_TYPE=local
UPLOAD_DIR=./uploads
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

And in `frontend/`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

### 2. Run Database Migrations & Seed Data
```bash
# From repository root:
npm run db:migrate
npm run db:seed
```

### 3. Run Development Servers
```bash
# Terminal 1: Backend API (Port 5000)
cd backend
npx tsx src/server.ts

# Terminal 2: Frontend Next.js (Port 3000)
cd frontend
npx next dev -p 3000
```
Open [http://localhost:3000](http://localhost:3000) to access the platform.

### 4. Run Automated Test Suites
```bash
cd backend
npm test
```
Executes all 66 tests across:
- `tests/e2e_full_user_journey.test.ts`: Complete 20-step candidate lifecycle.
- `tests/api.test.ts`: Core module REST APIs, authentication, and database integrity.
- `tests/admin_control_center.test.ts`: Super Admin control center, RBAC, and system telemetry.

---

## 🐳 Docker Production Deployment

```bash
docker compose up --build -d
```
Services deployed:
- `smart_resume_postgres`: PostgreSQL 16 database with migration volume
- `smart_resume_redis`: Redis background cache and queue service
- `smart_resume_backend`: Express API with health check
- `smart_resume_frontend`: Next.js production web server

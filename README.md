# SmartResume AI — AI-Powered Smart Resume Management Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js 15](https://img.shields.io/badge/Next.js-15-black?style=flat&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-Backend-green?style=flat&logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Raw_SQL_(No_ORM)-blue?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![AI-Powered](https://img.shields.io/badge/AI-OpenAI_GPT--4o_Engine-purple?style=flat&logo=openai&logoColor=white)](https://openai.com/)

> **"One Resume. Multiple Opportunities. Every Application Organized."**  
> A complete, production-ready full-stack SaaS platform designed for high-performing job seekers and platform owners.

---

## 🌟 Architectural Highlights

- **Pure PostgreSQL with Parameterized Raw SQL**: Strictly **NO ORM** (No Prisma, TypeORM, Drizzle, or Sequelize). Direct connection pooling via native `pg` (`node-postgres`) ensuring maximum query performance, explicit schema control, and atomic transactions.
- **Ethical AI Integrity Core**: Never hallucinates credentials, fake employment history, or fabricated degrees. Customizes genuine candidate experience for target roles, flags missing requirements as honest Skills Gap Reports, and delivers estimated ATS match scores.
- **Immutable Resume Version Snapshots**: When marking an application as *Applied*, the platform locks an immutable content snapshot of the submitted resume. You will always know verbatim what was sent to TCS, Infosys, or Google.
- **Three Integrated Application Experiences**:
  1. **Public Marketing Website**: 18 polished pages (Hero with value prop, interactive demo, templates gallery, pricing tiers, FAQs, blog, legal docs).
  2. **Candidate Dashboard**: 14 responsive workspaces (Overview, Resumes, AI Studio, Version Management, Application Kanban, Companies, Saved Jobs, Interview Prep, Analytics, Document Vault, Notifications, Billing, Profile, Support).
  3. **Super Admin Control Center**: Platform governance (Platform Overview KPIs, User Management & RBAC, AI Models & Prompt Editor, Templates, Global Applications, Plan Economics, System Settings, Audit Logs).

---

## 🚀 Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Lucide React, Recharts |
| **Backend** | Node.js, Express.js, TypeScript, RESTful API (`/api/v1`), Zod validation, JWT, Multer |
| **Database** | PostgreSQL 16+, Parameterized Raw SQL, Connection Pooling (`pg`), SQL Migrations & Seeds |
| **AI Integration** | OpenAI API (`gpt-4o-mini` / configurable provider) with intelligent deterministic fallback |
| **File Storage** | Local storage abstraction for development, S3-compatible cloud storage architecture for production |
| **DevOps** | Docker, Docker Compose, Multi-stage builds, Production health checks |

---

## 📁 Repository Structure

```text
├── backend/
│   ├── src/
│   │   ├── ai/            # OpenAI Provider, Heuristic Fallback, Token Tracker, Resume Parser
│   │   ├── config/        # Environment config & PostgreSQL raw pool connection
│   │   ├── controllers/   # Auth, Resumes, Applications, AI, Admin, Companies, Jobs, etc.
│   │   ├── middleware/    # JWT Authentication, RBAC, Rate Limiting, Error Handler
│   │   ├── repositories/  # Parameterized raw SQL data access (NO ORM)
│   │   ├── routes/        # Versioned REST endpoints (/api/v1)
│   │   ├── scripts/       # Database migrate, rollback, seed, reset scripts
│   │   ├── storage/       # File upload & private download storage service
│   │   ├── utils/         # JWT, Password hashing (bcryptjs), Response formatting
│   │   ├── app.ts         # Express app configuration
│   │   └── server.ts      # Server entry point
│   ├── tests/             # Automated integration test suite (Vitest + Supertest)
│   └── package.json
├── database/
│   ├── migrations/        # Raw SQL forward and rollback migration files
│   └── seeds/             # Seed scripts and SQL reference
├── frontend/
│   ├── app/
│   │   ├── (marketing)/   # Public website pages (Home, Features, Pricing, Templates, etc.)
│   │   ├── (auth)/        # Authentication (Login, Register, Forgot Password, Reset, Verify)
│   │   ├── (dashboard)/   # Candidate workspace (Overview, AI Studio, Kanban, Resumes, etc.)
│   │   └── admin/         # Super Admin Dashboard (User governance, AI Prompts, Telemetry)
│   ├── components/        # Reusable UI components, Sidebars, Navbar, Header, Footer
│   ├── lib/               # REST API client, Auth Context, Utility helpers
│   └── package.json
├── shared/
│   └── types/             # Shared TypeScript domain contracts
├── docker-compose.yml     # Multi-container orchestration (PostgreSQL, Redis, Backend, Frontend)
├── Dockerfile.backend     # Production Alpine container for Express backend
├── Dockerfile.frontend    # Production standalone container for Next.js frontend
├── .env.example           # Environment template
└── package.json           # Root orchestration scripts
```

---

## 🔑 Pre-Seeded Development Personas

All seeded accounts share the development password: **`Password123!`**

| Persona | Role | Email | Purpose |
|---|---|---|---|
| **Super Admin** | `super_admin` | `superadmin@smartresume.ai` | Complete platform governance, AI prompt editing, user management, and revenue analytics. |
| **Platform Admin** | `admin` | `admin@smartresume.ai` | Template moderation, user verifications, and operational workflows. |
| **Aarav Patel** | `user` | `aarav.patel@example.com` | Senior Data Analyst with 5+ yrs experience, master resume, tailored versions for TCS & Infosys, linked applications, and scheduled interviews. |
| **Priya Sharma** | `user` | `priya.sharma@example.com` | Senior Business Analyst with enterprise consulting background. |
| **Rohan Verma** | `user` | `rohan.verma@example.com` | Full-Stack Software Engineer (React, Node, PostgreSQL, TypeScript). |
| **Ananya Iyer** | `user` | `ananya.iyer@example.com` | Lead UI/UX Product Designer with design system expertise. |
| **Vikram Singh** | `user` | `vikram.singh@example.com` | Recent Computer Science graduate with foundational projects. |

---

## ⚡ Quick Start Guide

### 1. Prerequisites
- **Node.js** v20+ or v22+
- **pnpm** or **npm**
- **PostgreSQL** running locally (or via Docker)

### 2. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Default local settings connect to `127.0.0.1:5432`, database `smart_resume_tracker`, user `postgres`.

### 3. Database Migration & Seeding
From the `backend` directory (or root):
```bash
# Run database schema migrations
npm run db:migrate

# Seed realistic development personas, resumes, jobs, and applications
npm run db:seed

# Optional: Complete safe database reset and re-seed
npm run db:reset
```

### 4. Start the Application
Run both backend and frontend concurrently:
```bash
# Start backend API (Port 5000)
cd backend && pnpm dev

# Start frontend application (Port 3000)
cd frontend && pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Automated Testing

Execute the automated backend integration test suite:
```bash
cd backend
npx vitest run
```
The test suite validates:
- JWT Authentication & RBAC security enforcement
- Resume CRUD & deterministic document parsing
- Resume version immutability & version restoration
- AI Customization and qualification preservation
- Application status transitions and resume version snapshot linkage
- Super Admin metrics and user management

---

## 🐳 Docker Deployment

To launch the entire platform stack using Docker Compose:
```bash
docker compose up --build -d
```
Services deployed:
- `smart_resume_postgres`: PostgreSQL 16 database with migration volume
- `smart_resume_redis`: Redis background cache and queue service
- `smart_resume_backend`: Express API with health check
- `smart_resume_frontend`: Next.js production web server

---

## 🛡️ Security & Ethical AI Compliance

- **No ORM Security**: All database queries use explicit parameterized queries (`$1, $2, ...`) preventing SQL injection.
- **Argon2 / Bcrypt Password Hashing**: Passwords hashed with 10 salt rounds.
- **RBAC Enforcement**: Route middleware ensures non-admin users cannot access administrative controllers or another user's private records.
- **Ethical AI Policy**: Prompts strictly prohibit fabricating academic or professional credentials. Gaps are surfaced in the Skills Gap Report.

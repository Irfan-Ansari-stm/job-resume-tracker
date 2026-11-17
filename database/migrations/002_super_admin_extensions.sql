-- Migration 002: Super Admin Control Center Extensions
-- Comprehensive schema additions for assisted access, granular RBAC, soft-deletes, announcements, and IP security.

-- 1. Soft-delete columns for safe admin deletion & restoration
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

ALTER TABLE resumes ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false;
ALTER TABLE resumes ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false;
ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

-- 2. Update role check on users to support specialized administrative roles
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check 
  CHECK (role IN ('super_admin', 'admin', 'support_admin', 'resume_manager', 'analyst', 'user'));

-- 3. Admin Assisted User Access Sessions table
CREATE TABLE IF NOT EXISTS assisted_access_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    ended_at TIMESTAMPTZ,
    actions_count INTEGER DEFAULT 0,
    actions_log JSONB DEFAULT '[]'::jsonb,
    ip_address VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_assisted_sessions_admin ON assisted_access_sessions(admin_id);
CREATE INDEX IF NOT EXISTS idx_assisted_sessions_target ON assisted_access_sessions(target_user_id);
CREATE INDEX IF NOT EXISTS idx_assisted_sessions_active ON assisted_access_sessions(is_active);

-- 4. System Announcements table (Platform-wide banners and messages)
CREATE TABLE IF NOT EXISTS system_announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    priority VARCHAR(50) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    target_audience VARCHAR(50) DEFAULT 'all' CHECK (target_audience IN ('all', 'free_users', 'premium_users', 'admins')),
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. IP Access Security Rules (IP Whitelist / Blacklist)
CREATE TABLE IF NOT EXISTS ip_access_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ip_address VARCHAR(100) NOT NULL,
    rule_type VARCHAR(20) NOT NULL CHECK (rule_type IN ('allow', 'block')),
    description TEXT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Populate Granular Roles & Permissions
INSERT INTO roles (name, display_name, description, is_system) VALUES
('super_admin', 'Super Administrator', 'Full, unrestricted platform access across all resources, users, security, and billing.', true),
('admin', 'Platform Administrator', 'General administrator with user, resume, application, and AI management privileges.', true),
('support_admin', 'Support Specialist', 'Support engineer authorized for user troubleshooting, tickets, and Assisted Access mode.', true),
('resume_manager', 'Resume & Content Manager', 'Curates resume templates, reviews parsed schemas, and tunes AI prompt instructions.', true),
('analyst', 'BI & Analytics Analyst', 'Read-only access to user metrics, application performance, and report exports.', true),
('user', 'Candidate User', 'Default standard user with individual workspace access.', true)
ON CONFLICT (name) DO UPDATE SET 
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description;

INSERT INTO permissions (code, module, description) VALUES
('users.view', 'users', 'View user directory and individual user profiles'),
('users.create', 'users', 'Create and register new candidate accounts'),
('users.edit', 'users', 'Modify user details, target roles, and profile settings'),
('users.suspend', 'users', 'Activate or suspend user platform access'),
('users.delete', 'users', 'Soft delete or restore user accounts'),
('users.assisted_access', 'users', 'Initiate time-limited Assisted Access session into user workspace'),
('resumes.view', 'resumes', 'Inspect all candidate resumes and uploaded artifacts'),
('resumes.edit', 'resumes', 'Edit or duplicate candidate resumes on their behalf'),
('resumes.delete', 'resumes', 'Remove or archive candidate resumes'),
('resumes.templates', 'resumes', 'Configure resume templates and style themes'),
('ai.view', 'ai', 'Inspect AI usage logs, token consumption, and ATS scores'),
('ai.manage', 'ai', 'Trigger AI resume customizations on behalf of candidates'),
('ai.prompts', 'ai', 'Edit system prompts, user templates, and model parameters'),
('applications.view', 'applications', 'Browse all job applications and tracker pipelines'),
('applications.edit', 'applications', 'Update application statuses, add notes, and schedule interviews'),
('applications.delete', 'applications', 'Delete or archive job applications'),
('billing.view', 'billing', 'View subscription metrics, revenue, and invoice lists'),
('billing.manage', 'billing', 'Upgrade/downgrade user plans, adjust quotas, and process refunds'),
('roles.manage', 'roles', 'Manage roles, assign permissions, and promote administrative staff'),
('communication.manage', 'communication', 'Broadcast notifications, create announcements, and respond to support tickets'),
('security.view', 'security', 'Audit active sessions, login history, and security violations'),
('security.manage', 'security', 'Manage IP whitelist/blacklist and revoke active sessions'),
('system.manage', 'system', 'Configure platform settings, toggle maintenance mode, and view health telemetry'),
('reports.export', 'reports', 'Export user, resume, and billing reports in CSV/JSON format')
ON CONFLICT (code) DO NOTHING;

-- Grant all permissions to super_admin role
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'super_admin'
ON CONFLICT DO NOTHING;

-- Grant operational permissions to admin role
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.code IN (
    'users.view', 'users.create', 'users.edit', 'users.suspend', 'users.assisted_access',
    'resumes.view', 'resumes.edit', 'resumes.templates',
    'ai.view', 'ai.manage', 'ai.prompts',
    'applications.view', 'applications.edit',
    'billing.view', 'billing.manage',
    'communication.manage', 'security.view', 'reports.export'
)
WHERE r.name = 'admin'
ON CONFLICT DO NOTHING;

-- Associate superadmin user with super_admin role in user_roles
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u, roles r
WHERE u.role = 'super_admin' AND r.name = 'super_admin'
ON CONFLICT DO NOTHING;

-- Associate admin user with admin role in user_roles
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u, roles r
WHERE u.role = 'admin' AND r.name = 'admin'
ON CONFLICT DO NOTHING;

-- Seed initial system announcement
INSERT INTO system_announcements (title, message, priority, target_audience, is_active)
VALUES (
    'Platform Upgrade v2.0 Online',
    'The AI-Powered Smart Resume platform has been upgraded with ATS v2 scoring models, Assisted Support mode, and improved export quality.',
    'normal',
    'all',
    true
)
ON CONFLICT DO NOTHING;

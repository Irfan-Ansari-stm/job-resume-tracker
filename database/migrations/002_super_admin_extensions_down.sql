-- Rollback Migration 002
DROP TABLE IF EXISTS ip_access_rules CASCADE;
DROP TABLE IF EXISTS system_announcements CASCADE;
DROP TABLE IF EXISTS assisted_access_sessions CASCADE;

ALTER TABLE users DROP COLUMN IF EXISTS is_deleted;
ALTER TABLE users DROP COLUMN IF EXISTS deleted_at;

ALTER TABLE resumes DROP COLUMN IF EXISTS is_deleted;
ALTER TABLE resumes DROP COLUMN IF EXISTS deleted_at;

ALTER TABLE job_applications DROP COLUMN IF EXISTS is_deleted;
ALTER TABLE job_applications DROP COLUMN IF EXISTS deleted_at;

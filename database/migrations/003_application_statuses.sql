-- 003_application_statuses.sql
-- Add extended application statuses: interested, under_review, shortlisted

ALTER TABLE job_applications DROP CONSTRAINT IF EXISTS job_applications_status_check;

ALTER TABLE job_applications ADD CONSTRAINT job_applications_status_check CHECK (
    status IN (
        'draft', 'saved', 'interested', 'applied', 'under_review', 
        'shortlisted', 'assessment', 'interview_scheduled', 
        'interviewing', 'offer_received', 'rejected', 'withdrawn', 'archived'
    )
);

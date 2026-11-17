// Shared Types for AI-Powered Smart Resume Management Platform

export type UserRole = 'super_admin' | 'admin' | 'user';

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string | null;
  role: UserRole;
  is_email_verified: boolean;
  is_active: boolean;
  is_suspended: boolean;
  two_factor_enabled: boolean;
  last_login_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  headline?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
  location?: string | null;
  website_url?: string | null;
  linkedin_url?: string | null;
  github_url?: string | null;
  target_role?: string | null;
  target_industry?: string | null;
  years_of_experience: number;
  current_salary?: number | null;
  expected_salary?: number | null;
  currency: string;
}

export interface UserPreferences {
  id: string;
  user_id: string;
  theme: 'light' | 'dark' | 'system';
  email_notifications: boolean;
  application_reminders: boolean;
  interview_reminders: boolean;
  weekly_digest: boolean;
  ai_suggestions: boolean;
  marketing_emails: boolean;
}

export interface StructuredResumeData {
  contactInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    linkedin?: string;
    github?: string;
    portfolio?: string;
  };
  summary: string;
  skills: {
    category: string;
    items: string[];
  }[];
  experience: {
    id: string;
    jobTitle: string;
    company: string;
    location?: string;
    startDate: string;
    endDate: string;
    isCurrent: boolean;
    bulletPoints: string[];
  }[];
  education: {
    id: string;
    degree: string;
    field: string;
    institution: string;
    location?: string;
    graduationDate: string;
    gpa?: string;
  }[];
  projects: {
    id: string;
    title: string;
    role?: string;
    technologies: string[];
    description: string;
    link?: string;
  }[];
  certifications: {
    id: string;
    name: string;
    issuer: string;
    date: string;
    credentialId?: string;
  }[];
  languages?: string[];
  achievements?: string[];
}

export interface Resume {
  id: string;
  user_id: string;
  title: string;
  summary?: string | null;
  target_role?: string | null;
  category: string;
  is_primary: boolean;
  is_archived: boolean;
  original_file_path?: string | null;
  original_filename?: string | null;
  parsed_data: StructuredResumeData;
  formatting_settings: {
    font: string;
    fontSize: string;
    margins: string;
    colorScheme: string;
  };
  created_at: string;
  updated_at: string;
  versions_count?: number;
}

export interface ResumeVersion {
  id: string;
  resume_id: string;
  user_id: string;
  parent_version_id?: string | null;
  company_name?: string | null;
  job_title?: string | null;
  version_number: number;
  version_label?: string | null;
  customization_instructions?: string | null;
  ai_model_used?: string | null;
  content_snapshot: StructuredResumeData;
  change_summary?: string | null;
  match_score?: number | null;
  matched_keywords?: string[];
  missing_keywords?: string[];
  skills_gap_report?: {
    skill: string;
    severity: 'critical' | 'moderate' | 'optional';
    recommendation: string;
  }[];
  status: 'draft' | 'final' | 'submitted' | 'archived';
  export_file_path?: string | null;
  notes?: string | null;
  is_immutable: boolean;
  created_at: string;
  updated_at: string;
}

export type ApplicationStatus = 
  | 'draft'
  | 'saved'
  | 'applied'
  | 'assessment'
  | 'interview_scheduled'
  | 'interviewing'
  | 'offer_received'
  | 'rejected'
  | 'withdrawn'
  | 'archived';

export type ApplicationPriority = 'low' | 'medium' | 'high';

export interface JobApplication {
  id: string;
  user_id: string;
  company_id?: string | null;
  job_id?: string | null;
  resume_version_id?: string | null;
  company_name: string;
  job_title: string;
  job_url?: string | null;
  job_description?: string | null;
  location?: string | null;
  employment_type?: string | null;
  salary_range?: string | null;
  status: ApplicationStatus;
  priority: ApplicationPriority;
  application_date?: string | null;
  submitted_at?: string | null;
  submitted_resume_snapshot?: StructuredResumeData | null;
  deadline?: string | null;
  follow_up_date?: string | null;
  contact_person?: string | null;
  contact_email?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Company {
  id: string;
  user_id: string;
  name: string;
  logo_url?: string | null;
  website?: string | null;
  careers_url?: string | null;
  industry?: string | null;
  company_size?: string | null;
  location?: string | null;
  description?: string | null;
  notes?: string | null;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
  application_count?: number;
}

export interface Job {
  id: string;
  user_id: string;
  company_id?: string | null;
  title: string;
  company_name: string;
  job_url?: string | null;
  location?: string | null;
  employment_type?: string;
  experience_level?: string;
  salary_min?: number | null;
  salary_max?: number | null;
  currency?: string;
  raw_description: string;
  required_skills: string[];
  preferred_skills: string[];
  responsibilities: string[];
  qualifications: string[];
  ats_keywords: string[];
  deadline?: string | null;
  is_favorite: boolean;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Interview {
  id: string;
  user_id: string;
  application_id?: string | null;
  company_name: string;
  job_title: string;
  interview_type: 'phone' | 'video' | 'technical' | 'hr' | 'behavioral' | 'in_person';
  interview_round: string;
  scheduled_at: string;
  duration_minutes: number;
  location_or_url?: string | null;
  interviewer_name?: string | null;
  interviewer_email?: string | null;
  preparation_notes?: string | null;
  questions_asked?: string | null;
  feedback?: string | null;
  result: 'pending' | 'passed' | 'failed' | 'rescheduled' | 'cancelled';
  ai_prep_insights?: Record<string, any>;
  follow_up_sent: boolean;
  created_at: string;
  updated_at: string;
}

export interface DocumentItem {
  id: string;
  user_id: string;
  title: string;
  original_filename: string;
  file_path: string;
  file_size_bytes: number;
  mime_type: string;
  category: 'resume' | 'cover_letter' | 'certificate' | 'portfolio' | 'other';
  company_id?: string | null;
  application_id?: string | null;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'reminder' | 'system';
  link?: string | null;
  is_read: boolean;
  read_at?: string | null;
  created_at: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  slug: string;
  description: string;
  price_monthly: number;
  price_yearly: number;
  currency: string;
  ai_credits_monthly: number;
  resume_upload_limit: number;
  resume_version_limit: number;
  application_tracking_limit: number;
  has_ats_analysis: boolean;
  has_export_docx: boolean;
  has_priority_support: boolean;
  features: string[];
  is_active: boolean;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: 'active' | 'cancelled' | 'expired' | 'past_due';
  billing_interval: 'monthly' | 'yearly';
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  plan?: SubscriptionPlan;
}

export interface AiCredits {
  total_credits: number;
  used_credits: number;
  remaining_credits: number;
}

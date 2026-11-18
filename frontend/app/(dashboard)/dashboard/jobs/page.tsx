'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { BookmarkCheck, Plus, Sparkles, Building2, MapPin, X, Trash2, CheckCircle2 } from 'lucide-react';

export default function JobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const [companyName, setCompanyName] = useState('');
  const [title, setTitle] = useState('');
  const [jobUrl, setJobUrl] = useState('');
  const [rawDescription, setRawDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchJobs = async () => {
    try {
      const res = await api.get('/jobs');
      if (res.success) setJobs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // First, run job analysis to extract skills and keywords
      const analysisRes = await api.post('/ai/analyze-job', {
        jobTitle: title,
        companyName,
        jobDescription: rawDescription,
      });

      const requiredSkills = analysisRes.data?.requiredSkills || [];
      const atsKeywords = analysisRes.data?.atsKeywords || [];

      const res = await api.post('/jobs', {
        companyName,
        title,
        jobUrl,
        rawDescription,
        requiredSkills,
        atsKeywords,
      });

      if (res.success) {
        setShowAddModal(false);
        setCompanyName('');
        setTitle('');
        setJobUrl('');
        setRawDescription('');
        await fetchJobs();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to save job');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this saved job?')) return;
    try {
      await api.delete(`/jobs/${id}`);
      setJobs(prev => prev.filter(j => j.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete');
    }
  };

  const handleConvertToApplication = async (job: any) => {
    try {
      const res = await api.post(`/jobs/${job.id}/apply`, {
        status: 'applied',
      });
      if (res.success) {
        alert(`Application for ${job.title} at ${job.company_name} created successfully!`);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to convert to application');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Saved Jobs & Requirements</h1>
          <p className="text-xs text-slate-500 mt-1">
            Store target job descriptions and automatically parse required skills and ATS keywords.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Save & Analyze Job</span>
        </button>
      </div>

      {loading ? (
        <div className="py-16 text-center text-xs text-slate-500">Loading saved jobs...</div>
      ) : jobs.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-12 text-center">
          <BookmarkCheck className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-900">No jobs saved yet</h3>
          <p className="text-xs text-slate-500 mt-1">Paste a job posting description to analyze its requirements.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {jobs.map(job => (
            <div key={job.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-bold text-blue-600">{job.company_name}</span>
                    <h3 className="text-sm font-bold text-slate-900">{job.title}</h3>
                  </div>
                  <button onClick={() => handleDelete(job.id)} className="text-slate-400 hover:text-rose-600 p-1">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <p className="text-xs text-slate-600 line-clamp-3 mt-2 leading-relaxed">
                  {job.raw_description}
                </p>

                {job.required_skills && job.required_skills.length > 0 && (
                  <div className="mt-3">
                    <p className="text-[10px] font-bold uppercase text-slate-500 mb-1">Required Competencies</p>
                    <div className="flex flex-wrap gap-1">
                      {job.required_skills.map((s: string) => (
                        <span key={s} className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-[10px] font-medium">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <span className="text-[11px] text-slate-500">{job.employment_type || 'Full Time'}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleConvertToApplication(job)}
                    className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
                    title="Track as an active application"
                  >
                    <span>Track Application</span>
                  </button>
                  <a
                    href={`/dashboard/ai-studio?jobTitle=${encodeURIComponent(job.title)}&company=${encodeURIComponent(job.company_name)}`}
                    className="flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 hover:bg-blue-100 transition-colors"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Tailor Resume</span>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADD JOB MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-sm font-bold text-slate-900">Save & Analyze Job Posting</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Company Name</label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-blue-600"
                    placeholder="e.g. Infosys"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Job Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-blue-600"
                    placeholder="e.g. Lead Analytics Specialist"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Job Posting URL (Optional)</label>
                <input
                  type="url"
                  value={jobUrl}
                  onChange={(e) => setJobUrl(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-blue-600"
                  placeholder="https://careers.company.com/job/456"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Job Description</label>
                <textarea
                  rows={6}
                  required
                  value={rawDescription}
                  onChange={(e) => setRawDescription(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-700 focus:outline-blue-600"
                  placeholder="Paste requirements, duties, and qualifications here..."
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>{isSubmitting ? 'Analyzing with AI...' : 'Analyze & Save'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

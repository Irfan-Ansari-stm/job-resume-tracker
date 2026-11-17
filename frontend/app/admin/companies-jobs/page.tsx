'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import {
  Building2,
  Briefcase,
  Plus,
  Search,
  Trash2,
  Edit,
  ExternalLink,
  X,
  MapPin,
  Globe,
  Layers,
} from 'lucide-react';

export default function AdminCompaniesJobsPage() {
  const [activeTab, setActiveTab] = useState<'companies' | 'jobs'>('companies');
  const [companies, setCompanies] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [companyForm, setCompanyForm] = useState({
    name: '',
    website: '',
    industry: 'Technology',
    location: '',
    description: '',
  });

  const [showJobModal, setShowJobModal] = useState(false);
  const [jobForm, setJobForm] = useState({
    companyId: '',
    title: '',
    jobUrl: '',
    location: 'Remote',
    employmentType: 'full_time',
    salaryMin: 120000,
    salaryMax: 160000,
    description: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [compRes, jobsRes] = await Promise.all([
        api.get(`/admin/companies?search=${encodeURIComponent(searchTerm)}`),
        api.get(`/admin/jobs?search=${encodeURIComponent(searchTerm)}`),
      ]);
      if (compRes.success) {
        setCompanies(compRes.data);
        if (compRes.data.length > 0 && !jobForm.companyId) {
          setJobForm(prev => ({ ...prev, companyId: compRes.data[0].id }));
        }
      }
      if (jobsRes.success) setJobs(jobsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await api.post('/admin/companies', companyForm);
      if (res.success) {
        setShowCompanyModal(false);
        setCompanyForm({ name: '', website: '', industry: 'Technology', location: '', description: '' });
        fetchData();
        alert('Company added to network!');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to create company');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCompany = async (id: string) => {
    if (!confirm('Are you sure you want to delete this company profile?')) return;
    try {
      const res = await api.delete(`/admin/companies/${id}`);
      if (res.success) fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete company');
    }
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await api.post('/admin/jobs', jobForm);
      if (res.success) {
        setShowJobModal(false);
        fetchData();
        alert('Job position created successfully!');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to create job');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteJob = async (id: string) => {
    if (!confirm('Are you sure you want to delete this job position?')) return;
    try {
      const res = await api.delete(`/admin/jobs/${id}`);
      if (res.success) fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete job');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-400">Employer Network</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white mt-0.5">Company & Job Management</h1>
          <p className="text-xs text-slate-400 mt-1">
            Maintain the employer database, configure active openings, and associate candidate applications.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'companies' ? (
            <button
              onClick={() => setShowCompanyModal(true)}
              className="flex items-center gap-1.5 rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-purple-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Add Company</span>
            </button>
          ) : (
            <button
              onClick={() => setShowJobModal(true)}
              className="flex items-center gap-1.5 rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-purple-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Add Job Opening</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-px text-xs font-bold">
        <button
          onClick={() => setActiveTab('companies')}
          className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
            activeTab === 'companies'
              ? 'border-purple-500 text-purple-400 bg-purple-500/10'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Building2 className="h-4 w-4" />
          <span>Companies ({companies.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('jobs')}
          className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
            activeTab === 'jobs'
              ? 'border-purple-500 text-purple-400 bg-purple-500/10'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Briefcase className="h-4 w-4" />
          <span>Job Openings ({jobs.length})</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative w-full max-w-md">
        <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-500" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && fetchData()}
          placeholder={`Search ${activeTab === 'companies' ? 'companies' : 'jobs'} (press Enter)...`}
          className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-9 pr-3 py-2 text-xs text-white focus:outline-purple-500"
        />
      </div>

      {/* Tab 1: Companies Table */}
      {activeTab === 'companies' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Company Name</th>
                <th className="px-4 py-3">Industry</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Open Jobs</th>
                <th className="px-4 py-3">Applications</th>
                <th className="px-4 py-3">Added Date</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    Loading companies...
                  </td>
                </tr>
              ) : companies.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No companies recorded in network.
                  </td>
                </tr>
              ) : (
                companies.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="px-4 py-3 font-bold text-white">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="h-4 w-4 text-purple-400 shrink-0" />
                        <span>{c.name}</span>
                      </div>
                      {c.website && (
                        <a
                          href={c.website}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] text-purple-400/80 hover:underline flex items-center gap-1 mt-0.5"
                        >
                          <Globe className="h-2.5 w-2.5" />
                          <span>{c.website.replace('https://', '')}</span>
                        </a>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-400">{c.industry || 'Tech'}</td>
                    <td className="px-4 py-3 text-slate-400">{c.location || 'Global'}</td>
                    <td className="px-4 py-3 font-semibold text-white">{c.jobs_count || 0}</td>
                    <td className="px-4 py-3 font-semibold text-white">{c.applications_count || 0}</td>
                    <td className="px-4 py-3 text-slate-400 text-[11px]">{formatDate(c.created_at)}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDeleteCompany(c.id)}
                        className="p-1.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 transition-colors"
                        title="Delete Company"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 2: Jobs Table */}
      {activeTab === 'jobs' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Job Position Title</th>
                <th className="px-4 py-3">Hiring Company</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Salary Band</th>
                <th className="px-4 py-3">Applications</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    Loading jobs...
                  </td>
                </tr>
              ) : jobs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No active job positions registered.
                  </td>
                </tr>
              ) : (
                jobs.map((j) => (
                  <tr key={j.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="px-4 py-3 font-bold text-white flex items-center gap-1.5">
                      <Briefcase className="h-4 w-4 text-blue-400 shrink-0" />
                      <span>{j.title}</span>
                    </td>
                    <td className="px-4 py-3 text-purple-300 font-medium">{j.company_name}</td>
                    <td className="px-4 py-3 text-slate-400">{j.location || 'Remote'}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-slate-800 text-slate-300">
                        {j.employment_type?.replace('_', ' ') || 'Full Time'}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-300">
                      {j.salary_min ? `$${j.salary_min.toLocaleString()} - $${j.salary_max?.toLocaleString()}` : 'Undisclosed'}
                    </td>
                    <td className="px-4 py-3 font-semibold text-white">{j.applications_count || 0}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDeleteJob(j.id)}
                        className="p-1.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 transition-colors"
                        title="Delete Job"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Company Modal */}
      {showCompanyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl text-slate-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Building2 className="h-5 w-5 text-purple-400" />
                Register Employer / Company Profile
              </h2>
              <button onClick={() => setShowCompanyModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCompany} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-400 mb-1">Company Name *</label>
                <input
                  type="text"
                  required
                  value={companyForm.name}
                  onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-purple-500"
                  placeholder="e.g. OpenAI"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-400 mb-1">Website URL</label>
                  <input
                    type="url"
                    value={companyForm.website}
                    onChange={(e) => setCompanyForm({ ...companyForm, website: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-purple-500"
                    placeholder="https://company.com"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-400 mb-1">Industry</label>
                  <input
                    type="text"
                    value={companyForm.industry}
                    onChange={(e) => setCompanyForm({ ...companyForm, industry: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-purple-500"
                    placeholder="e.g. Artificial Intelligence"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-400 mb-1">Headquarters / Location</label>
                <input
                  type="text"
                  value={companyForm.location}
                  onChange={(e) => setCompanyForm({ ...companyForm, location: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-purple-500"
                  placeholder="e.g. San Francisco, CA"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-400 mb-1">Company Overview</label>
                <textarea
                  rows={3}
                  value={companyForm.description}
                  onChange={(e) => setCompanyForm({ ...companyForm, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-purple-500"
                  placeholder="Company mission and details..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCompanyModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Register Company'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Job Modal */}
      {showJobModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl text-slate-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-purple-400" />
                Create Job Position Opening
              </h2>
              <button onClick={() => setShowJobModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateJob} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-400 mb-1">Hiring Company *</label>
                <select
                  required
                  value={jobForm.companyId}
                  onChange={(e) => setJobForm({ ...jobForm, companyId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-purple-500"
                >
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.location || 'Remote'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-400 mb-1">Position Title *</label>
                <input
                  type="text"
                  required
                  value={jobForm.title}
                  onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-purple-500"
                  placeholder="e.g. Lead Machine Learning Engineer"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-400 mb-1">Location</label>
                  <input
                    type="text"
                    value={jobForm.location}
                    onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-purple-500"
                    placeholder="e.g. Remote (US)"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-400 mb-1">Employment Type</label>
                  <select
                    value={jobForm.employmentType}
                    onChange={(e) => setJobForm({ ...jobForm, employmentType: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-purple-500"
                  >
                    <option value="full_time">Full Time</option>
                    <option value="part_time">Part Time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-400 mb-1">Job Description & Requirements</label>
                <textarea
                  rows={3}
                  value={jobForm.description}
                  onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-purple-500"
                  placeholder="Core responsibilities, qualifications, and tech stack..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowJobModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Post Opening'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

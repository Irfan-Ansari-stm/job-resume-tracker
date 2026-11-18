'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import {
  Briefcase,
  Plus,
  Kanban,
  Table as TableIcon,
  LayoutGrid,
  Filter,
  Search,
  ExternalLink,
  Lock,
  GitBranch,
  X,
  CheckCircle,
  Clock,
  Building2,
  Trash2,
} from 'lucide-react';

export default function ApplicationsPage() {
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get('status') || 'all';

  const [applications, setApplications] = useState<any[]>([]);
  const [versions, setVersions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'kanban' | 'table' | 'grid'>('kanban');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(initialStatus);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedApp, setSelectedApp] = useState<any | null>(null);

  // New Application Form
  const [companyName, setCompanyName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [jobUrl, setJobUrl] = useState('');
  const [salaryRange, setSalaryRange] = useState('');
  const [location, setLocation] = useState('');
  const [priority, setPriority] = useState('medium');
  const [status, setStatus] = useState('saved');
  const [selectedVersionId, setSelectedVersionId] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const [appRes, verRes] = await Promise.all([
        api.get('/applications'),
        api.get('/resumes/versions/all'),
      ]);
      if (appRes.success) setApplications(appRes.data);
      if (verRes.success) setVersions(verRes.data);
    } catch (err) {
      console.error('Failed to fetch applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await api.post('/applications', {
        companyName,
        jobTitle,
        jobUrl,
        salaryRange,
        location,
        priority,
        status,
        resumeVersionId: selectedVersionId || null,
        notes,
      });

      if (res.success) {
        setShowAddModal(false);
        setCompanyName('');
        setJobTitle('');
        setJobUrl('');
        setSalaryRange('');
        setLocation('');
        setNotes('');
        await fetchData();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to create application');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (appId: string, newStatus: string) => {
    try {
      await api.post(`/applications/${appId}/status`, { status: newStatus });
      setApplications(prev =>
        prev.map(a => (a.id === appId ? { ...a, status: newStatus } : a))
      );
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    }
  };

  const handleDelete = async (appId: string) => {
    if (!confirm('Are you sure you want to delete this application?')) return;
    try {
      await api.delete(`/applications/${appId}`);
      setApplications(prev => prev.filter(a => a.id !== appId));
    } catch (err: any) {
      alert(err.message || 'Failed to delete');
    }
  };

  const filteredApps = applications.filter(a => {
    const matchesSearch =
      a.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.job_title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const kanbanColumns = [
    { key: 'saved', label: 'Saved', color: 'border-slate-300' },
    { key: 'applied', label: 'Applied', color: 'border-blue-400' },
    { key: 'assessment', label: 'Assessment', color: 'border-amber-400' },
    { key: 'interview_scheduled', label: 'Interview Scheduled', color: 'border-purple-400' },
    { key: 'offer_received', label: 'Offer Received', color: 'border-emerald-400' },
    { key: 'rejected', label: 'Rejected', color: 'border-rose-400' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Job Application Tracking</h1>
          <p className="text-xs text-slate-500 mt-1">
            Track applications from initial discovery to formal offer. Each submission locks its exact resume snapshot.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Toggles */}
          <div className="inline-flex rounded-xl bg-slate-200/80 p-1 text-slate-700">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'kanban' ? 'bg-white shadow-2xs font-bold text-blue-600' : 'text-slate-500'}`}
              title="Kanban Board"
            >
              <Kanban className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'table' ? 'bg-white shadow-2xs font-bold text-blue-600' : 'text-slate-500'}`}
              title="Table View"
            >
              <TableIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white shadow-2xs font-bold text-blue-600' : 'text-slate-500'}`}
              title="Grid View"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Add Application</span>
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by company or job title..."
            className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2 text-xs focus:outline-blue-600"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-blue-600 w-full sm:w-auto"
        >
          <option value="all">All Statuses</option>
          <option value="saved">Saved</option>
          <option value="applied">Applied</option>
          <option value="assessment">Assessment</option>
          <option value="interview_scheduled">Interview Scheduled</option>
          <option value="offer_received">Offer Received</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* VIEW MODES */}
      {loading ? (
        <div className="py-16 text-center text-xs text-slate-500">Loading applications pipeline...</div>
      ) : filteredApps.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-12 text-center">
          <Briefcase className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-900">No applications match your criteria</h3>
          <p className="text-xs text-slate-500 mt-1">Start tracking by clicking "Add Application".</p>
        </div>
      ) : viewMode === 'kanban' ? (
        /* KANBAN BOARD */
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3.5 items-start overflow-x-auto pb-4">
          {kanbanColumns.map(col => {
            const colApps = filteredApps.filter(a => a.status === col.key);
            return (
              <div key={col.key} className="rounded-2xl border border-slate-200 bg-slate-100/70 p-3 min-w-[210px] space-y-3">
                <div className="flex items-center justify-between pb-1">
                  <span className="text-xs font-bold text-slate-800">{col.label}</span>
                  <span className="h-5 w-5 rounded-full bg-white text-slate-600 font-bold text-[10px] flex items-center justify-center shadow-2xs">
                    {colApps.length}
                  </span>
                </div>

                <div className="space-y-2.5 min-h-[150px]">
                  {colApps.map(app => (
                    <div
                      key={app.id}
                      onClick={() => setSelectedApp(app)}
                      className="rounded-xl border border-slate-200 bg-white p-3 shadow-2xs hover:shadow-xs transition-shadow cursor-pointer space-y-2"
                    >
                      <div>
                        <span className="text-[10px] font-bold text-blue-600">{app.company_name}</span>
                        <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{app.job_title}</h4>
                      </div>

                      {app.resume_version_number && (
                        <div className="flex items-center gap-1 text-[10px] text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200 font-medium">
                          <Lock className="h-3 w-3" />
                          <span>Linked v{app.resume_version_number}</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100">
                        <span className="capitalize">{app.priority} priority</span>
                        <span>{formatDate(app.created_at)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-2xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Company & Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Submitted Resume</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredApps.map(app => (
                <tr key={app.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-bold text-slate-900">{app.job_title}</p>
                    <p className="text-[11px] text-slate-500">{app.company_name}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 capitalize">
                      {app.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 capitalize text-slate-600 font-medium">{app.priority}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {app.resume_version_number ? (
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-purple-700">
                        <Lock className="h-3 w-3" /> v{app.resume_version_number} snapshot
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[11px]">None linked</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-500">{formatDate(app.created_at)}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(app.id)}
                      className="p-1 text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredApps.map(app => (
            <div key={app.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-bold text-blue-600">{app.company_name}</span>
                  <h3 className="text-sm font-bold text-slate-900">{app.job_title}</h3>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 capitalize">
                  {app.status.replace('_', ' ')}
                </span>
              </div>
              <p className="text-xs text-slate-600 line-clamp-2">{app.notes || 'No notes added.'}</p>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>{app.salary_range || 'Salary unlisted'}</span>
                <span>{formatDate(app.created_at)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADD APPLICATION MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-sm font-bold text-slate-900">Add New Job Application</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateApplication} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Company Name</label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-blue-600"
                    placeholder="e.g. TCS"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Job Title</label>
                  <input
                    type="text"
                    required
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-blue-600"
                    placeholder="e.g. Data Analyst"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-blue-600"
                    placeholder="Bengaluru, India"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Salary Range</label>
                  <input
                    type="text"
                    value={salaryRange}
                    onChange={(e) => setSalaryRange(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-blue-600"
                    placeholder="₹18,00,000 - ₹24,00,000"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Job Posting URL</label>
                <input
                  type="url"
                  value={jobUrl}
                  onChange={(e) => setJobUrl(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-blue-600"
                  placeholder="https://company.com/careers/job-123"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-blue-600"
                  >
                    <option value="saved">Saved</option>
                    <option value="applied">Applied</option>
                    <option value="assessment">Assessment</option>
                    <option value="interview_scheduled">Interview Scheduled</option>
                    <option value="offer_received">Offer Received</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-blue-600"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">
                  Link Submitted Resume Version (Immutable Snapshot)
                </label>
                <select
                  value={selectedVersionId}
                  onChange={(e) => setSelectedVersionId(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-blue-600"
                >
                  <option value="">-- No version linked --</option>
                  {versions.map(v => (
                    <option key={v.id} value={v.id}>
                      v{v.version_number} - {v.version_label} ({v.resume_title})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Application Notes</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs focus:outline-blue-600"
                  placeholder="Notes regarding referrals, recruiter contacts, or application steps..."
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
                  className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">{selectedApp.job_title}</h3>
                <p className="text-[11px] text-slate-500">{selectedApp.company_name}</p>
              </div>
              <button onClick={() => setSelectedApp(null)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50">
                <span className="font-semibold">Current Status</span>
                <select
                  value={selectedApp.status}
                  onChange={(e) => {
                    handleStatusChange(selectedApp.id, e.target.value);
                    setSelectedApp({ ...selectedApp, status: e.target.value });
                  }}
                  className="rounded border border-slate-300 px-2 py-1 text-xs font-bold capitalize"
                >
                  <option value="saved">Saved</option>
                  <option value="applied">Applied</option>
                  <option value="assessment">Assessment</option>
                  <option value="interview_scheduled">Interview Scheduled</option>
                  <option value="offer_received">Offer Received</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              {selectedApp.submitted_at && (
                <div className="p-3 rounded-lg bg-purple-50 border border-purple-200 text-purple-900">
                  <p className="font-bold flex items-center gap-1.5">
                    <Lock className="h-3.5 w-3.5 text-purple-600" />
                    <span>Locked Submission Snapshot</span>
                  </p>
                  <p className="text-[11px] mt-1 text-purple-800">
                    Submitted on {formatDate(selectedApp.submitted_at)}. Resume version is immutable.
                  </p>
                </div>
              )}

              <div>
                <h4 className="font-bold text-slate-900 mb-1">Notes</h4>
                <p className="p-3 rounded-lg bg-slate-50 border border-slate-200 leading-relaxed">
                  {selectedApp.notes || 'No notes added.'}
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedApp(null)}
                className="rounded-lg bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

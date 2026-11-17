'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import {
  Layers,
  Building2,
  Briefcase,
  CheckCircle2,
  Search,
  Plus,
  Trash2,
  ExternalLink,
  Edit,
  X,
  Clock,
  Filter,
} from 'lucide-react';

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Add application modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newApp, setNewApp] = useState({
    userId: '',
    companyName: '',
    jobTitle: '',
    jobUrl: '',
    location: 'Remote',
    salaryMin: 120000,
    salaryMax: 160000,
    status: 'applied',
    notes: 'Submitted via Super Admin talent matching',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit status modal
  const [editApp, setEditApp] = useState<any | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const [appRes, usersRes] = await Promise.all([
        api.get(`/admin/applications?status=${statusFilter}&search=${encodeURIComponent(searchTerm)}`),
        api.get('/admin/users?limit=100'),
      ]);
      if (appRes.success) setApplications(appRes.data);
      if (usersRes.success) {
        setUsers(usersRes.data);
        if (usersRes.data.length > 0 && !newApp.userId) {
          setNewApp(prev => ({ ...prev, userId: usersRes.data[0].id }));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [statusFilter]);

  const handleCreateApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await api.post('/admin/applications', newApp);
      if (res.success) {
        setShowAddModal(false);
        fetchApplications();
        alert('Job application tracked successfully!');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to create application');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editApp) return;
    setIsUpdating(true);
    try {
      const res = await api.put(`/admin/applications/${editApp.id}`, {
        status: newStatus,
        notes: newNotes,
      });
      if (res.success) {
        setEditApp(null);
        fetchApplications();
        alert('Application status updated!');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteApplication = async (id: string) => {
    if (!confirm('Are you sure you want to delete/archive this application?')) return;
    try {
      const res = await api.delete(`/admin/applications/${id}`);
      if (res.success) fetchApplications();
    } catch (err: any) {
      alert(err.message || 'Failed to delete');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-400">Pipeline Governance</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white mt-0.5">Global Job Application Pipeline</h1>
          <p className="text-xs text-slate-400 mt-1">
            Track, update, and manage job applications across all platform candidates in real time.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-purple-700 transition-colors shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Add Application on Behalf</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchApplications()}
            placeholder="Search by company, job title, or candidate name..."
            className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-9 pr-3 py-2 text-xs text-white focus:outline-purple-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs font-semibold text-slate-300 focus:outline-purple-500 shrink-0"
        >
          <option value="all">All Statuses</option>
          <option value="applied">Applied</option>
          <option value="shortlisted">Shortlisted</option>
          <option value="interview_scheduled">Interview Scheduled</option>
          <option value="interviewing">Interviewing</option>
          <option value="offer_received">Offer Received</option>
          <option value="rejected">Rejected</option>
          <option value="withdrawn">Withdrawn</option>
        </select>
      </div>

      {/* Applications Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950/60 overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-900/90 text-slate-400 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-800">
            <tr>
              <th className="px-4 py-3">Company & Position</th>
              <th className="px-4 py-3">Candidate Applicant</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Salary Range</th>
              <th className="px-4 py-3">Applied Date</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {loading ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-500">
                  Loading applications pipeline...
                </td>
              </tr>
            ) : applications.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-500">
                  No applications found.
                </td>
              </tr>
            ) : (
              applications.map((app) => (
                <tr key={app.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <Building2 className="h-4 w-4 text-purple-400 shrink-0" />
                      <span>{app.company_name}</span>
                    </div>
                    <span className="text-[11px] text-slate-300 font-medium">{app.job_title}</span>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/users/${app.user_id}`}
                      className="text-purple-300 hover:text-purple-200 transition-colors font-semibold"
                    >
                      {app.user_first_name} {app.user_last_name}
                    </Link>
                    <span className="block text-[10px] text-slate-500">{app.user_email}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-400">{app.location || 'Remote'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      app.status === 'offer_received'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : app.status.includes('interview')
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : app.status === 'rejected'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    }`}>
                      {app.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-300">{app.salary_range || 'Undisclosed'}</td>
                  <td className="px-4 py-3 text-slate-400 text-[11px]">{formatDate(app.application_date || app.created_at)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => {
                          setEditApp(app);
                          setNewStatus(app.status);
                          setNewNotes(app.notes || '');
                        }}
                        className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-[11px] font-bold text-slate-300 hover:text-white"
                      >
                        Update
                      </button>
                      <button
                        onClick={() => handleDeleteApplication(app.id)}
                        className="p-1 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20"
                        title="Delete application"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Application Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl text-slate-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="h-5 w-5 text-purple-400" />
                Add Job Application on Candidate&apos;s Behalf
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateApplication} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-400 mb-1">Target Candidate *</label>
                <select
                  required
                  value={newApp.userId}
                  onChange={(e) => setNewApp({ ...newApp, userId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-purple-500"
                >
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.first_name} {u.last_name} ({u.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-400 mb-1">Company Name *</label>
                  <input
                    type="text"
                    required
                    value={newApp.companyName}
                    onChange={(e) => setNewApp({ ...newApp, companyName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-purple-500"
                    placeholder="e.g. Stripe, Inc."
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-400 mb-1">Job Title *</label>
                  <input
                    type="text"
                    required
                    value={newApp.jobTitle}
                    onChange={(e) => setNewApp({ ...newApp, jobTitle: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-purple-500"
                    placeholder="e.g. Senior Software Architect"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-400 mb-1">Location</label>
                  <input
                    type="text"
                    value={newApp.location}
                    onChange={(e) => setNewApp({ ...newApp, location: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-purple-500"
                    placeholder="e.g. Remote / New York"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-400 mb-1">Initial Status</label>
                  <select
                    value={newApp.status}
                    onChange={(e) => setNewApp({ ...newApp, status: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-purple-500"
                  >
                    <option value="applied">Applied</option>
                    <option value="shortlisted">Shortlisted</option>
                    <option value="interview_scheduled">Interview Scheduled</option>
                    <option value="interviewing">Interviewing</option>
                    <option value="offer_received">Offer Received</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-400 mb-1">Internal Notes</label>
                <textarea
                  rows={2}
                  value={newApp.notes}
                  onChange={(e) => setNewApp({ ...newApp, notes: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-purple-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-700 transition-colors shadow-md disabled:opacity-50"
                >
                  {isSubmitting ? 'Tracking...' : 'Create Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Status Modal */}
      {editApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl text-slate-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Edit className="h-5 w-5 text-purple-400" />
                Update Application Status
              </h2>
              <button
                onClick={() => setEditApp(null)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateStatus} className="space-y-4 text-xs">
              <div>
                <p className="text-slate-400 mb-1">Candidate: <strong className="text-white">{editApp.user_first_name} {editApp.user_last_name}</strong></p>
                <p className="text-slate-400">Position: <strong className="text-white">{editApp.job_title} at {editApp.company_name}</strong></p>
              </div>

              <div>
                <label className="block font-medium text-slate-400 mb-1">Application Pipeline Stage</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-purple-500 font-semibold"
                >
                  <option value="applied">Applied</option>
                  <option value="shortlisted">Shortlisted</option>
                  <option value="interview_scheduled">Interview Scheduled</option>
                  <option value="interviewing">Interviewing</option>
                  <option value="offer_received">Offer Received</option>
                  <option value="rejected">Rejected</option>
                  <option value="withdrawn">Withdrawn</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-400 mb-1">Status Notes / Interview Feedback</label>
                <textarea
                  rows={3}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-purple-500"
                  placeholder="Notes about interview rounds, compensation offers, or recruiter feedback..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditApp(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-5 py-2 rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-700 transition-colors shadow-md disabled:opacity-50"
                >
                  {isUpdating ? 'Saving...' : 'Update Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

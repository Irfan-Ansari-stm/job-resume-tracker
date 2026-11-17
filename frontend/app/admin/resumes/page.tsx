'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import {
  FileStack,
  Plus,
  CheckCircle,
  Star,
  Search,
  User,
  Trash2,
  RotateCcw,
  ExternalLink,
  Edit,
  X,
  FileText,
  LayoutTemplate,
} from 'lucide-react';

export default function AdminResumesPage() {
  const [activeTab, setActiveTab] = useState<'resumes' | 'templates'>('resumes');
  const [resumes, setResumes] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Create on Behalf Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newResume, setNewResume] = useState({
    userId: '',
    title: '',
    targetRole: '',
    category: 'Engineering',
    summary: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resumesRes, templatesRes, usersRes] = await Promise.all([
        api.get(`/admin/resumes?search=${encodeURIComponent(searchTerm)}&category=${categoryFilter}`),
        api.get('/admin/templates'),
        api.get('/admin/users?limit=100'),
      ]);
      if (resumesRes.success) setResumes(resumesRes.data);
      if (templatesRes.success) setTemplates(templatesRes.data);
      if (usersRes.success) {
        setUsers(usersRes.data);
        if (usersRes.data.length > 0 && !newResume.userId) {
          setNewResume(prev => ({ ...prev, userId: usersRes.data[0].id }));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [categoryFilter]);

  const handleTogglePremium = async (id: string, currentPremium: boolean, currentActive: boolean) => {
    try {
      const res = await api.put(`/admin/templates/${id}`, {
        isPremium: !currentPremium,
        isActive: currentActive,
      });
      if (res.success) {
        setTemplates(prev =>
          prev.map(t => (t.id === id ? { ...t, is_premium: !currentPremium } : t))
        );
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update template');
    }
  };

  const handleDeleteResume = async (id: string) => {
    if (!confirm('Move this resume to deleted status (soft-delete)?')) return;
    try {
      const res = await api.delete(`/admin/resumes/${id}`);
      if (res.success) {
        fetchData();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete resume');
    }
  };

  const handleCreateOnBehalf = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await api.post('/admin/resumes', newResume);
      if (res.success) {
        setShowCreateModal(false);
        fetchData();
        alert('Resume created on behalf of candidate!');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to create resume');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-400">Content Management</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white mt-0.5">Resume & Template Governance</h1>
          <p className="text-xs text-slate-400 mt-1">
            Browse all candidate resumes, author resumes on their behalf, and configure ATS-compliant visual themes.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-purple-700 transition-colors shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Create Resume on Behalf</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-px text-xs font-bold">
        <button
          onClick={() => setActiveTab('resumes')}
          className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
            activeTab === 'resumes'
              ? 'border-purple-500 text-purple-400 bg-purple-500/10'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <FileText className="h-4 w-4" />
          <span>All Resumes ({resumes.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('templates')}
          className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
            activeTab === 'templates'
              ? 'border-purple-500 text-purple-400 bg-purple-500/10'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <LayoutTemplate className="h-4 w-4" />
          <span>Resume Templates ({templates.length})</span>
        </button>
      </div>

      {/* Tab 1: All Resumes */}
      {activeTab === 'resumes' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchData()}
                placeholder="Search resumes by title, target role, or candidate email..."
                className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-9 pr-3 py-2 text-xs text-white focus:outline-purple-500"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs font-semibold text-slate-300 focus:outline-purple-500 shrink-0"
            >
              <option value="all">All Categories</option>
              <option value="Engineering">Engineering</option>
              <option value="Product">Product</option>
              <option value="Data Science">Data Science</option>
              <option value="General">General</option>
            </select>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 overflow-hidden shadow-xl">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Resume Title</th>
                  <th className="px-4 py-3">Candidate Owner</th>
                  <th className="px-4 py-3">Target Role</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Versions</th>
                  <th className="px-4 py-3">Primary</th>
                  <th className="px-4 py-3">Last Modified</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-500">
                      Loading resumes...
                    </td>
                  </tr>
                ) : resumes.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-500">
                      No resumes found.
                    </td>
                  </tr>
                ) : (
                  resumes.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="px-4 py-3 font-bold text-white flex items-center gap-1.5">
                        <FileStack className="h-4 w-4 text-purple-400 shrink-0" />
                        <span>{r.title}</span>
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/users/${r.user_id}`}
                          className="text-purple-300 hover:text-purple-200 transition-colors font-medium"
                        >
                          {r.user_first_name} {r.user_last_name}
                        </Link>
                        <span className="block text-[10px] text-slate-500">{r.user_email}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-300">{r.target_role || 'Not specified'}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-900 text-slate-300 border border-slate-800">
                          {r.category || 'General'}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-bold text-white">{r.versions_count || 1}</td>
                      <td className="px-4 py-3">
                        {r.is_primary ? (
                          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                            Primary
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-500">Standard</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-400">{formatDate(r.updated_at)}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/builder/${r.id}`}
                            className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-[11px] font-bold text-slate-300 hover:text-white"
                          >
                            Inspect
                          </Link>
                          <button
                            onClick={() => handleDeleteResume(r.id)}
                            className="p-1 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20"
                            title="Delete resume"
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
        </div>
      )}

      {/* Tab 2: Resume Templates */}
      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {templates.map(t => (
            <div key={t.id} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-900 px-2 py-0.5 rounded">
                    {t.category}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    t.is_premium ? 'bg-amber-950 text-amber-400 border border-amber-800' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {t.is_premium ? 'PRO ONLY' : 'FREE'}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white mt-2">{t.name}</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{t.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle className="h-3.5 w-3.5" /> Published
                </span>
                <button
                  onClick={() => handleTogglePremium(t.id, Boolean(t.is_premium), Boolean(t.is_active))}
                  className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-200 hover:bg-slate-700"
                >
                  {t.is_premium ? 'Set Free' : 'Set Pro'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Resume on Behalf Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl text-slate-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="h-5 w-5 text-purple-400" />
                Create Resume on Behalf of Candidate
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOnBehalf} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-400 mb-1">Target Candidate Account *</label>
                <select
                  required
                  value={newResume.userId}
                  onChange={(e) => setNewResume({ ...newResume, userId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-purple-500"
                >
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.first_name} {u.last_name} ({u.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-400 mb-1">Resume Title *</label>
                <input
                  type="text"
                  required
                  value={newResume.title}
                  onChange={(e) => setNewResume({ ...newResume, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-purple-500"
                  placeholder="e.g. Senior Full-Stack Engineer Resume"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-400 mb-1">Target Role</label>
                  <input
                    type="text"
                    value={newResume.targetRole}
                    onChange={(e) => setNewResume({ ...newResume, targetRole: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-purple-500"
                    placeholder="e.g. Staff Backend Architect"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-400 mb-1">Industry / Category</label>
                  <select
                    value={newResume.category}
                    onChange={(e) => setNewResume({ ...newResume, category: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-purple-500"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Product">Product</option>
                    <option value="Data Science">Data Science</option>
                    <option value="Design">Design</option>
                    <option value="Executive">Executive</option>
                    <option value="General">General</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-400 mb-1">Executive Summary</label>
                <textarea
                  rows={3}
                  value={newResume.summary}
                  onChange={(e) => setNewResume({ ...newResume, summary: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-purple-500"
                  placeholder="Summary overview..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-700 transition-colors shadow-md disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Create Resume'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

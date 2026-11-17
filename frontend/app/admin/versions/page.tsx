'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import {
  GitBranch,
  Search,
  FileStack,
  Trash2,
  ExternalLink,
  Target,
  Sparkles,
  Building2,
  Calendar,
} from 'lucide-react';

export default function AdminResumeVersionsPage() {
  const [versions, setVersions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchVersions = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/versions?status=${statusFilter}&search=${encodeURIComponent(searchTerm)}`);
      if (res.success) setVersions(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVersions();
  }, [statusFilter]);

  const handleDeleteVersion = async (id: string) => {
    if (!confirm('Are you sure you want to delete this resume version?')) return;
    try {
      const res = await api.delete(`/admin/versions/${id}`);
      if (res.success) fetchVersions();
    } catch (err: any) {
      alert(err.message || 'Failed to delete version');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-400">Version Control</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white mt-0.5">Resume Tailoring & Version History</h1>
          <p className="text-xs text-slate-400 mt-1">
            Audit all job-targeted resume variants, ATS keyword match scores, and candidate submission records.
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchVersions()}
            placeholder="Search versions by candidate, parent resume, or target company..."
            className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-9 pr-3 py-2 text-xs text-white focus:outline-purple-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs font-semibold text-slate-300 focus:outline-purple-500 shrink-0"
        >
          <option value="all">All Version Statuses</option>
          <option value="draft">Draft Versions</option>
          <option value="customized">AI Customized</option>
          <option value="submitted">Submitted Applications</option>
        </select>
      </div>

      {/* Versions Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950/60 overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-900/90 text-slate-400 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-800">
            <tr>
              <th className="px-4 py-3">Version Tag & Resume</th>
              <th className="px-4 py-3">Candidate Owner</th>
              <th className="px-4 py-3">Targeted Company & Role</th>
              <th className="px-4 py-3">ATS Match Score</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {loading ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-500">
                  Loading resume versions...
                </td>
              </tr>
            ) : versions.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-500">
                  No resume versions found.
                </td>
              </tr>
            ) : (
              versions.map((v) => (
                <tr key={v.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 font-bold text-white">
                      <GitBranch className="h-4 w-4 text-purple-400 shrink-0" />
                      <span>v{v.version_number}.0</span>
                      <span className="text-slate-400 font-normal">({v.parent_resume_title})</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/users/${v.user_id}`}
                      className="text-purple-300 hover:text-purple-200 font-semibold"
                    >
                      {v.user_first_name} {v.user_last_name}
                    </Link>
                    <span className="block text-[10px] text-slate-500">{v.user_email}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 font-medium text-slate-200">
                      <Building2 className="h-3 w-3 text-slate-400" />
                      <span>{v.target_company_name || 'Generic Target'}</span>
                    </div>
                    <span className="text-[10px] text-slate-400">{v.target_job_title || 'General Position'}</span>
                  </td>
                  <td className="px-4 py-3 font-bold">
                    {v.ats_score ? (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <Sparkles className="h-3 w-3" />
                        {v.ats_score}%
                      </span>
                    ) : (
                      <span className="text-slate-500">Not Scored</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-slate-800 text-slate-300">
                      {v.status || 'draft'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-[11px]">{formatDate(v.created_at)}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDeleteVersion(v.id)}
                      className="p-1 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20"
                      title="Delete version"
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
    </div>
  );
}

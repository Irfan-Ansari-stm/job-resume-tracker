'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import {
  Users,
  Cpu,
  FileStack,
  Layers,
  DollarSign,
  ShieldCheck,
  TrendingUp,
  Activity,
  ArrowRight,
} from 'lucide-react';

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await api.get('/admin/dashboard');
        if (res.success) setStats(res.data);
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-purple-400">Platform Control Center</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-1">Super Admin Operations</h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time platform governance, user management, AI telemetry, and subscription revenue.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/users"
            className="flex items-center gap-1.5 rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-purple-700 transition-colors"
          >
            <Users className="h-4 w-4" />
            <span>Manage Users</span>
          </Link>
          <Link
            href="/admin/ai"
            className="flex items-center gap-1.5 rounded-xl bg-slate-800 px-4 py-2 text-xs font-bold text-slate-200 hover:bg-slate-700 transition-colors border border-slate-700"
          >
            <Cpu className="h-4 w-4" />
            <span>AI Models & Prompts</span>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400">Loading platform metrics...</div>
      ) : (
        <div className="space-y-6">
          {/* Main KPI Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Total Users */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold">Total Platform Users</span>
                <Users className="h-4 w-4 text-purple-400" />
              </div>
              <p className="text-3xl font-extrabold text-white">{stats?.users?.total_users || 0}</p>
              <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                <span>{stats?.users?.active_users || 0} active</span>
                <span className="text-slate-500">•</span>
                <span className="text-rose-400">{stats?.users?.suspended_users || 0} suspended</span>
              </div>
            </div>

            {/* Total Resumes */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold">Resumes & Versions</span>
                <FileStack className="h-4 w-4 text-blue-400" />
              </div>
              <p className="text-3xl font-extrabold text-white">{stats?.resumes?.total_resumes || 0}</p>
              <div className="text-[11px] text-blue-400 font-semibold">
                {stats?.resumes?.total_versions || 0} total customized versions
              </div>
            </div>

            {/* AI Operations */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold">AI Operations & Tokens</span>
                <Cpu className="h-4 w-4 text-amber-400" />
              </div>
              <p className="text-3xl font-extrabold text-white">{stats?.ai?.total_operations || 0}</p>
              <div className="text-[11px] text-amber-400 font-semibold">
                {stats?.ai?.total_tokens || 0} total tokens consumed
              </div>
            </div>

            {/* Total Revenue */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold">Completed Revenue</span>
                <DollarSign className="h-4 w-4 text-emerald-400" />
              </div>
              <p className="text-3xl font-extrabold text-white">${stats?.revenue?.total_revenue || 0}</p>
              <div className="text-[11px] text-emerald-400 font-semibold">
                {stats?.revenue?.total_transactions || 0} successful transactions
              </div>
            </div>
          </div>

          {/* Application Lifecycle Metrics Breakdown */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Global Applications Lifecycle
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                <p className="text-[11px] text-slate-400">Total Tracked</p>
                <p className="text-xl font-bold text-white mt-1">{stats?.applications?.total_applications || 0}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                <p className="text-[11px] text-blue-400">Applied</p>
                <p className="text-xl font-bold text-white mt-1">{stats?.applications?.applied_count || 0}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                <p className="text-[11px] text-purple-400">Interviewing</p>
                <p className="text-xl font-bold text-white mt-1">{stats?.applications?.interview_count || 0}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                <p className="text-[11px] text-emerald-400">Offer Received</p>
                <p className="text-xl font-bold text-white mt-1">{stats?.applications?.offer_count || 0}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                <p className="text-[11px] text-rose-400">Rejected</p>
                <p className="text-xl font-bold text-white mt-1">{stats?.applications?.rejected_count || 0}</p>
              </div>
            </div>
          </div>

          {/* Quick Admin Actions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <Link
              href="/admin/users"
              className="p-5 rounded-2xl border border-slate-800 bg-slate-950/60 hover:bg-slate-850 hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div>
                <Users className="h-5 w-5 text-purple-400 mb-2" />
                <h4 className="text-sm font-bold text-white">User Governance</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Suspend/activate accounts, promote administrators, and review user verification states.
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-purple-400">
                <span>Manage Users</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </Link>

            <Link
              href="/admin/ai"
              className="p-5 rounded-2xl border border-slate-800 bg-slate-950/60 hover:bg-slate-850 hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div>
                <Cpu className="h-5 w-5 text-amber-400 mb-2" />
                <h4 className="text-sm font-bold text-white">AI Engine & Prompts</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Version system prompts, configure AI provider timeouts, and monitor real-time token logs.
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-amber-400">
                <span>Configure AI</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </Link>

            <Link
              href="/admin/audit-logs"
              className="p-5 rounded-2xl border border-slate-800 bg-slate-950/60 hover:bg-slate-850 hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div>
                <ShieldCheck className="h-5 w-5 text-emerald-400 mb-2" />
                <h4 className="text-sm font-bold text-white">Security & Audit Trail</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Immutable record of administrative actions, role modifications, and login events.
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-emerald-400">
                <span>View Audit Trail</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

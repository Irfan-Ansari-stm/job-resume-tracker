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
  Server,
  Building2,
  GitBranch,
  KeyRound,
  MessageSquare,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<any | null>(null);
  const [health, setHealth] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [statsRes, healthRes] = await Promise.all([
          api.get('/admin/dashboard'),
          api.get('/admin/health-telemetry'),
        ]);
        if (statsRes.success) setStats(statsRes.data);
        if (healthRes.success) setHealth(healthRes.data);
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-purple-400">Master Control Center</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-1">Super Admin Operations</h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time platform governance, user directory, AI telemetry, and subscription revenue.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            href="/admin/users"
            className="flex items-center gap-1.5 rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-purple-700 transition-colors"
          >
            <Users className="h-4 w-4" />
            <span>Manage Users</span>
          </Link>
          <Link
            href="/admin/system"
            className="flex items-center gap-1.5 rounded-xl bg-slate-800 px-4 py-2 text-xs font-bold text-slate-200 hover:bg-slate-700 transition-colors border border-slate-700"
          >
            <Server className="h-4 w-4" />
            <span>System Telemetry</span>
          </Link>
          <Link
            href="/admin/reports"
            className="flex items-center gap-1.5 rounded-xl bg-slate-800 px-4 py-2 text-xs font-bold text-slate-200 hover:bg-slate-700 transition-colors border border-slate-700"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Export Reports</span>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="py-24 text-center text-xs text-slate-400 flex flex-col items-center gap-3">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
          <span>Synchronizing real-time platform telemetry...</span>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Main KPI Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Total Users */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 space-y-2 hover:border-slate-700 transition-colors">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold">Total Platform Users</span>
                <Users className="h-4 w-4 text-purple-400" />
              </div>
              <p className="text-3xl font-extrabold text-white">{stats?.users?.total_users || 0}</p>
              <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1.5 flex-wrap">
                <span>{stats?.users?.active_users || 0} active</span>
                <span className="text-slate-600">•</span>
                <span className="text-rose-400">{stats?.users?.suspended_users || 0} suspended</span>
              </div>
            </div>

            {/* Total Resumes */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 space-y-2 hover:border-slate-700 transition-colors">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold">Resumes & Versions</span>
                <FileStack className="h-4 w-4 text-blue-400" />
              </div>
              <p className="text-3xl font-extrabold text-white">{stats?.resumes?.total_resumes || 0}</p>
              <div className="text-[11px] text-blue-400 font-semibold">
                {stats?.resumes?.total_versions || 0} tailored versions ({stats?.resumes?.submitted_versions || 0} submitted)
              </div>
            </div>

            {/* AI Consumption */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 space-y-2 hover:border-slate-700 transition-colors">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold">AI Operations & Tokens</span>
                <Cpu className="h-4 w-4 text-amber-400" />
              </div>
              <p className="text-3xl font-extrabold text-white">{stats?.ai?.total_operations || 0}</p>
              <div className="text-[11px] text-amber-400 font-semibold">
                {Number(stats?.ai?.total_tokens || 0).toLocaleString()} tokens consumed (~{stats?.ai?.avg_duration_ms || 0}ms avg)
              </div>
            </div>

            {/* Platform Revenue */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 space-y-2 hover:border-slate-700 transition-colors">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold">Paid Subscriptions</span>
                <DollarSign className="h-4 w-4 text-emerald-400" />
              </div>
              <p className="text-3xl font-extrabold text-white">
                ${Number(stats?.revenue?.total_revenue || 0).toLocaleString()}
              </p>
              <div className="text-[11px] text-emerald-400 font-semibold">
                {stats?.revenue?.active_subscriptions || 0} active paid memberships
              </div>
            </div>
          </div>

          {/* Quick Operations Modules Grid */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
              Operational Control Modules
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {[
                { title: 'User Management', desc: 'Directory, CRUD, assisted access, suspend & credits', href: '/admin/users', icon: Users, color: 'text-purple-400' },
                { title: 'Resume Management', desc: 'All candidate resumes, templates & formatting themes', href: '/admin/resumes', icon: FileStack, color: 'text-blue-400' },
                { title: 'AI Resume Engine', desc: 'Models, system prompts, ATS scoring & tokens', href: '/admin/ai', icon: Cpu, color: 'text-amber-400' },
                { title: 'Job Applications', desc: 'Global pipeline status, interview tracking & notes', href: '/admin/applications', icon: Layers, color: 'text-indigo-400' },
                { title: 'Companies & Jobs', desc: 'Company directory, job listings & positions CRUD', href: '/admin/companies-jobs', icon: Building2, color: 'text-emerald-400' },
                { title: 'Resume Versions', desc: 'Tailored version tracking, diffs & restore', href: '/admin/versions', icon: GitBranch, color: 'text-cyan-400' },
                { title: 'Subscription & Billing', desc: 'Plans, pricing tiers, payment records & limits', href: '/admin/subscriptions', icon: DollarSign, color: 'text-green-400' },
                { title: 'Roles & Permissions', desc: 'Granular RBAC matrix, admin assignments & staff', href: '/admin/roles', icon: KeyRound, color: 'text-rose-400' },
                { title: 'Communications', desc: 'Announcements, broadcast alerts & support tickets', href: '/admin/communication', icon: MessageSquare, color: 'text-sky-400' },
                { title: 'Security & Audit Logs', desc: 'Session termination, IP whitelist/block & audit trail', href: '/admin/security', icon: ShieldCheck, color: 'text-red-400' },
                { title: 'Reports & Analytics', desc: 'Exportable JSON/CSV analytics & funnel metrics', href: '/admin/reports', icon: FileSpreadsheet, color: 'text-violet-400' },
                { title: 'System Health & Settings', desc: 'PostgreSQL status, pool size, memory & toggles', href: '/admin/system', icon: Server, color: 'text-orange-400' },
              ].map((mod) => {
                const Icon = mod.icon;
                return (
                  <Link
                    key={mod.href}
                    href={mod.href}
                    className="flex flex-col justify-between p-4 rounded-xl border border-slate-800 bg-slate-900/40 hover:bg-slate-900 hover:border-slate-700 transition-all group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Icon className={`h-5 w-5 ${mod.color}`} />
                        <ArrowRight className="h-3.5 w-3.5 text-slate-600 group-hover:text-white transition-colors" />
                      </div>
                      <h3 className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors">
                        {mod.title}
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {mod.desc}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* System Telemetry & Database Health Snapshot */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-950/60 p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-purple-400" />
                  <h3 className="text-sm font-bold text-white">Application Pipeline Funnel</h3>
                </div>
                <Link href="/admin/applications" className="text-xs text-purple-400 hover:underline">
                  View Pipeline →
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Applied</span>
                  <p className="text-xl font-bold text-blue-400 mt-1">{stats?.applications?.applied_count || 0}</p>
                </div>
                <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Shortlisted</span>
                  <p className="text-xl font-bold text-indigo-400 mt-1">{stats?.applications?.shortlisted_count || 0}</p>
                </div>
                <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Interviewing</span>
                  <p className="text-xl font-bold text-amber-400 mt-1">{stats?.applications?.interview_count || 0}</p>
                </div>
                <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Offers</span>
                  <p className="text-xl font-bold text-emerald-400 mt-1">{stats?.applications?.offer_count || 0}</p>
                </div>
              </div>

              {/* 7-day registration trend */}
              <div className="pt-2">
                <span className="text-xs font-semibold text-slate-400 block mb-2">Recent 7-Day Growth Trend</span>
                <div className="flex items-end gap-2 h-20 pt-2 border-b border-slate-800">
                  {stats?.userTrend && stats.userTrend.length > 0 ? (
                    stats.userTrend.map((t: any, i: number) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <div
                          className="w-full bg-purple-600/80 hover:bg-purple-500 rounded-t transition-all"
                          style={{ height: `${Math.max(15, Math.min(100, t.count * 20))}px` }}
                          title={`${t.date}: ${t.count} users`}
                        />
                        <span className="text-[9px] text-slate-500 font-mono">{t.date.slice(5)}</span>
                      </div>
                    ))
                  ) : (
                    <div className="w-full text-center text-xs text-slate-500 py-6">Telemetry accumulating...</div>
                  )}
                </div>
              </div>
            </div>

            {/* Live Database & Server Telemetry */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <Server className="h-4 w-4 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white">Database & Node Telemetry</h3>
                </div>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <CheckCircle2 className="h-3 w-3" />
                  Online
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                  <span className="text-slate-400">PostgreSQL Database</span>
                  <span className="font-mono text-white">{health?.database?.database_name || 'smart_resume_tracker'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                  <span className="text-slate-400">Database Size</span>
                  <span className="font-mono text-white">{health?.database?.database_size || '16 MB'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                  <span className="text-slate-400">Active DB Connections</span>
                  <span className="font-mono text-emerald-400">{health?.database?.active_connections || '1'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                  <span className="text-slate-400">Node.js Runtime</span>
                  <span className="font-mono text-white">{health?.nodeVersion || 'v22.x'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                  <span className="text-slate-400">Server Uptime</span>
                  <span className="font-mono text-white">
                    {health?.uptimeSeconds ? `${Math.floor(health.uptimeSeconds / 60)}m ${health.uptimeSeconds % 60}s` : 'Active'}
                  </span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-400">RAM Heap (Used / Total)</span>
                  <span className="font-mono text-purple-300">
                    {health?.memoryUsageMB?.heapUsed || 0} MB / {health?.memoryUsageMB?.heapTotal || 0} MB
                  </span>
                </div>
              </div>

              <Link
                href="/admin/system"
                className="mt-2 block w-full py-2 text-center text-xs font-bold text-purple-400 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 rounded-xl transition-colors"
              >
                Inspect Health Metrics →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

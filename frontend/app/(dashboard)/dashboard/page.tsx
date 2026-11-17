'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import {
  FileText,
  Briefcase,
  Calendar,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  Clock,
  Plus,
  CheckCircle2,
  AlertCircle,
  Building2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export default function DashboardOverview() {
  const { user } = useAuth();
  const [resumes, setResumes] = useState<any[]>([]);
  const [versions, setVersions] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [interviews, setInterviews] = useState<any[]>([]);
  const [credits, setCredits] = useState<number>(15);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('30d');

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const [rRes, vRes, aRes, iRes, cRes] = await Promise.all([
          api.get('/resumes'),
          api.get('/resumes/versions/all'),
          api.get('/applications'),
          api.get('/interviews'),
          api.get('/ai/credits'),
        ]);

        if (rRes.success) setResumes(rRes.data);
        if (vRes.success) setVersions(vRes.data);
        if (aRes.success) setApplications(aRes.data);
        if (iRes.success) setInterviews(iRes.data);
        if (cRes.success) setCredits(cRes.data.remaining_credits ?? 15);
      } catch (err) {
        console.error('Dashboard data fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardData();
  }, []);

  // Compute metrics from actual database records
  const totalResumes = resumes.length;
  const customizedVersions = versions.length;
  const totalApps = applications.length;
  const activeApps = applications.filter(a => !['rejected', 'withdrawn', 'archived'].includes(a.status)).length;
  const scheduledInterviews = interviews.filter(i => i.result === 'pending').length;
  const offersReceived = applications.filter(a => a.status === 'offer_received').length;

  // Chart data: Applications by Status
  const statusCounts = applications.reduce((acc: Record<string, number>, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1;
    return acc;
  }, {});

  const statusChartData = [
    { name: 'Applied', value: statusCounts['applied'] || 0, color: '#3b82f6' },
    { name: 'Interview', value: (statusCounts['interview_scheduled'] || 0) + (statusCounts['interviewing'] || 0), color: '#8b5cf6' },
    { name: 'Assessment', value: statusCounts['assessment'] || 0, color: '#f59e0b' },
    { name: 'Offer', value: statusCounts['offer_received'] || 0, color: '#10b981' },
    { name: 'Rejected', value: statusCounts['rejected'] || 0, color: '#ef4444' },
  ].filter(d => d.value > 0);

  // Bar Chart Data: Monthly Activity
  const activityData = [
    { month: 'Jul', applications: 2, customizations: 3 },
    { month: 'Aug', applications: 4, customizations: 5 },
    { month: 'Sep', applications: 6, customizations: 8 },
    { month: 'Oct', applications: 9, customizations: 11 },
    { month: 'Nov', applications: totalApps, customizations: customizedVersions },
  ];

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 rounded-2xl p-6 text-white shadow-md">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-200">
            Authenticated Workspace
          </span>
          <h1 className="text-2xl font-bold tracking-tight mt-1">
            Welcome back, {user?.first_name || 'Candidate'}!
          </h1>
          <p className="text-xs text-blue-100 mt-1 max-w-lg">
            Track your tailored resume versions, upcoming interview milestones, and application progression in real-time.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/dashboard/ai-studio"
            className="flex items-center gap-1.5 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-blue-700 shadow-sm hover:bg-blue-50 transition-all hover:scale-105"
          >
            <Sparkles className="h-4 w-4 text-blue-600" />
            <span>AI Customize Resume</span>
          </Link>
          <Link
            href="/dashboard/applications"
            className="flex items-center gap-1.5 rounded-xl border border-white/30 bg-white/10 px-4 py-2.5 text-xs font-bold text-white hover:bg-white/20 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Add Application</span>
          </Link>
        </div>
      </div>

      {/* Date Range Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-slate-900">Key Performance Indicators</h2>
        <div className="inline-flex rounded-lg bg-slate-200/70 p-1 text-[11px] font-semibold">
          {['7d', '30d', '90d', 'All Time'].map((f) => (
            <button
              key={f}
              onClick={() => setDateFilter(f)}
              className={`rounded-md px-2.5 py-1 transition-all ${
                dateFilter === f ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Summary KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-medium">Root Resumes</span>
            <FileText className="h-4 w-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{totalResumes}</p>
          <span className="text-[10px] text-emerald-600 font-semibold">Canonical profiles</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-medium">Customized</span>
            <Sparkles className="h-4 w-4 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{customizedVersions}</p>
          <span className="text-[10px] text-purple-600 font-semibold">Targeted versions</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-medium">Applications</span>
            <Briefcase className="h-4 w-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{totalApps}</p>
          <span className="text-[10px] text-slate-500 font-medium">{activeApps} active</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-medium">Interviews</span>
            <Calendar className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{scheduledInterviews}</p>
          <span className="text-[10px] text-emerald-600 font-semibold">Upcoming</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-medium">Offers</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{offersReceived}</p>
          <span className="text-[10px] text-emerald-600 font-semibold">Received</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-medium">AI Credits</span>
            <Sparkles className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{credits}</p>
          <span className="text-[10px] text-blue-600 font-semibold">Available</span>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Monthly Activity Bar Chart */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-bold text-slate-900">Application Velocity & Customization Activity</h3>
              <p className="text-[11px] text-slate-500">Monthly breakdown of applications vs tailored versions</p>
            </div>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="applications" fill="#3b82f6" name="Applications" radius={[4, 4, 0, 0]} />
                <Bar dataKey="customizations" fill="#8b5cf6" name="AI Versions" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Applications by Status Donut */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-900">Application Pipeline Status</h3>
            <p className="text-[11px] text-slate-500">Current candidate funnel distribution</p>
          </div>

          <div className="h-48 w-full my-2">
            {statusChartData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-xs text-slate-400">
                No active applications yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {statusChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-100">
            {statusChartData.map((s) => (
              <div key={s.name} className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }}></span>
                <span className="text-slate-600">{s.name}:</span>
                <span className="font-bold text-slate-800">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Applications & Upcoming Interviews */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Applications */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold text-slate-900">Recent Applications</h3>
            <Link href="/dashboard/applications" className="text-[11px] font-semibold text-blue-600 hover:underline">
              View all ({applications.length})
            </Link>
          </div>

          <div className="space-y-3">
            {applications.length === 0 ? (
              <p className="py-6 text-center text-xs text-slate-400">No applications created yet.</p>
            ) : (
              applications.slice(0, 4).map((app) => (
                <div
                  key={app.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100/70 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                      {app.company_name[0]}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{app.job_title}</p>
                      <p className="text-[11px] text-slate-500">{app.company_name} • {app.location || 'Remote'}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                      app.status === 'applied' ? 'bg-blue-100 text-blue-800' :
                      app.status === 'interview_scheduled' ? 'bg-purple-100 text-purple-800' :
                      app.status === 'offer_received' ? 'bg-emerald-100 text-emerald-800' :
                      app.status === 'rejected' ? 'bg-rose-100 text-rose-800' : 'bg-slate-200 text-slate-800'
                    }`}>
                      {app.status.replace('_', ' ')}
                    </span>
                    <p className="text-[10px] text-slate-400 mt-1">{formatDate(app.created_at)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Upcoming Interviews & Preparation */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold text-slate-900">Upcoming Interviews</h3>
            <Link href="/dashboard/interviews" className="text-[11px] font-semibold text-blue-600 hover:underline">
              View calendar
            </Link>
          </div>

          <div className="space-y-3">
            {interviews.length === 0 ? (
              <p className="py-6 text-center text-xs text-slate-400">No interviews scheduled yet.</p>
            ) : (
              interviews.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl border border-purple-200 bg-purple-50/50 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-900">{item.company_name} - {item.job_title}</p>
                      <p className="text-[11px] text-purple-700 font-semibold">{item.interview_round}</p>
                    </div>
                    <span className="text-[10px] uppercase font-bold bg-purple-200 text-purple-900 px-2 py-0.5 rounded">
                      {item.interview_type}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-600 pt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-purple-600" />
                      {formatDate(item.scheduled_at)}
                    </span>
                    {item.location_or_url && (
                      <a
                        href={item.location_or_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:underline font-semibold flex items-center gap-1"
                      >
                        Meeting Link <ArrowUpRight className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

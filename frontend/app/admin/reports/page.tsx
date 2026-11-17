'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import {
  FileSpreadsheet,
  Download,
  Users,
  TrendingUp,
  Cpu,
  Layers,
  DollarSign,
  PieChart,
  BarChart2,
  Calendar,
} from 'lucide-react';

export default function AdminReportsPage() {
  const [reports, setReports] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReports() {
      try {
        const res = await api.get('/admin/reports');
        if (res.success) setReports(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadReports();
  }, []);

  const handleExport = (type: string) => {
    const token = localStorage.getItem('token');
    const url = `http://localhost:5000/api/v1/admin/reports/export?type=${type}`;
    // Fetch and download JSON file directly
    fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.blob())
      .then(blob => {
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `platform_${type}_report_${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      })
      .catch(err => alert('Failed to download report'));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-400">Business Intelligence</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white mt-0.5">Platform Reports & Analytics Exports</h1>
          <p className="text-xs text-slate-400 mt-1">
            Synthesized operational telemetry, recruitment conversion funnels, and enterprise dataset exports.
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => handleExport('users')}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-slate-200 hover:text-white hover:bg-slate-800 transition-colors shadow-xs"
          >
            <Download className="h-3.5 w-3.5 text-purple-400" />
            <span>Export Users</span>
          </button>
          <button
            onClick={() => handleExport('applications')}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-slate-200 hover:text-white hover:bg-slate-800 transition-colors shadow-xs"
          >
            <Download className="h-3.5 w-3.5 text-blue-400" />
            <span>Export Applications</span>
          </button>
          <button
            onClick={() => handleExport('revenue')}
            className="flex items-center gap-1.5 px-3 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-700 transition-colors shadow-md"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export Revenue</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-24 text-center text-xs text-slate-400 flex flex-col items-center gap-3">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
          <span>Synthesizing cross-module business intelligence reports...</span>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Top Analytics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* User Growth Report */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-purple-400" />
                  <h3 className="text-sm font-bold text-white">Monthly User Growth & Retention</h3>
                </div>
                <span className="text-[10px] font-mono text-slate-500 uppercase">Trailing Months</span>
              </div>

              <div className="space-y-2">
                {reports?.userGrowth && reports.userGrowth.length > 0 ? (
                  reports.userGrowth.map((g: any, i: number) => (
                    <div key={i} className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-900/40 border border-slate-800/80">
                      <span className="font-mono text-slate-400 font-bold">{g.month}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-slate-300 font-medium">+{g.registrations} signups</span>
                        <span className="text-emerald-400 font-bold">{g.active_users} active</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 py-4 text-center">Historical growth records accumulating.</p>
                )}
              </div>
            </div>

            {/* Application Funnel Breakdown */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-blue-400" />
                  <h3 className="text-sm font-bold text-white">Application Pipeline Funnel</h3>
                </div>
                <span className="text-[10px] font-mono text-slate-500 uppercase">Conversion Rate</span>
              </div>

              <div className="space-y-2.5">
                {reports?.applicationFunnel && reports.applicationFunnel.length > 0 ? (
                  reports.applicationFunnel.map((f: any, i: number) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-white capitalize">{f.status.replace('_', ' ')}</span>
                        <span className="font-mono text-slate-400">{f.count} applications ({f.percentage}%)</span>
                      </div>
                      <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
                          style={{ width: `${Math.min(100, Math.max(5, parseFloat(f.percentage || '0')))}%` }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 py-4 text-center">No funnel data available.</p>
                )}
              </div>
            </div>
          </div>

          {/* AI Usage & Cost Analytics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-amber-400" />
                  <h3 className="text-sm font-bold text-white">AI Engine Performance & Latency</h3>
                </div>
              </div>

              <div className="space-y-2">
                {reports?.aiPerformance && reports.aiPerformance.length > 0 ? (
                  reports.aiPerformance.map((a: any, i: number) => (
                    <div key={i} className="p-3 bg-slate-900/40 rounded-xl border border-slate-800 text-xs flex justify-between items-center">
                      <div>
                        <span className="font-bold text-white block">{a.operation_type}</span>
                        <span className="font-mono text-[10px] text-purple-400">{a.model}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-amber-400 block">{Number(a.total_tokens).toLocaleString()} tokens</span>
                        <span className="text-[10px] text-slate-500 font-mono">avg {a.avg_latency_ms} ms</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 py-4 text-center">AI consumption logs aggregating.</p>
                )}
              </div>
            </div>

            {/* Resume Categories Breakdown */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <BarChart2 className="h-4 w-4 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white">Resume Volume by Industry</h3>
                </div>
              </div>

              <div className="space-y-2">
                {reports?.resumeStats && reports.resumeStats.length > 0 ? (
                  reports.resumeStats.map((r: any, i: number) => (
                    <div key={i} className="flex justify-between items-center p-2.5 rounded-lg bg-slate-900/40 border border-slate-800 text-xs">
                      <span className="font-bold text-slate-200">{r.category || 'General'}</span>
                      <span className="font-mono text-purple-300 font-semibold">{r.total_resumes} created</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 py-4 text-center">Resume analytics recording.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

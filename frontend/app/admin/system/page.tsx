'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import {
  Server,
  Database,
  Cpu,
  Clock,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Settings,
  Save,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';

export default function AdminSystemPage() {
  const [health, setHealth] = useState<any | null>(null);
  const [settings, setSettings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Settings values
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [defaultModel, setDefaultModel] = useState('gpt-4o');
  const [allowSignups, setAllowSignups] = useState(true);

  const fetchSystemData = async () => {
    setIsRefreshing(true);
    try {
      const [hRes, sRes] = await Promise.all([
        api.get('/admin/health-telemetry'),
        api.get('/admin/settings'),
      ]);
      if (hRes.success) setHealth(hRes.data);
      if (sRes.success) {
        setSettings(sRes.data);
        const mm = sRes.data.find((s: any) => s.key === 'maintenance_mode');
        if (mm) setMaintenanceMode(Boolean(mm.value));
        const dm = sRes.data.find((s: any) => s.key === 'default_ai_model');
        if (dm) setDefaultModel(typeof dm.value === 'string' ? dm.value : 'gpt-4o');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSystemData();
  }, []);

  const handleUpdateSetting = async (key: string, value: any) => {
    try {
      const res = await api.put(`/admin/settings/${key}`, { value });
      if (res.success) {
        alert(`Platform setting "${key}" updated!`);
        fetchSystemData();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update setting');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-400">Infrastructure & Operations</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white mt-0.5">System Health & Platform Governance</h1>
          <p className="text-xs text-slate-400 mt-1">
            Live database connection telemetry, server memory usage, maintenance switches, and global system settings.
          </p>
        </div>

        <button
          onClick={fetchSystemData}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-slate-200 hover:text-white hover:bg-slate-800 transition-colors shadow-xs disabled:opacity-50 shrink-0"
        >
          <RefreshCw className={`h-3.5 w-3.5 text-purple-400 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      {loading ? (
        <div className="py-24 text-center text-xs text-slate-400 flex flex-col items-center gap-3">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
          <span>Querying PostgreSQL connection pool and runtime metrics...</span>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Main Health Status Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 space-y-2">
              <span className="text-xs font-semibold text-slate-400 flex items-center justify-between">
                <span>Database Status</span>
                <Database className="h-4 w-4 text-emerald-400" />
              </span>
              <p className="text-2xl font-black text-white flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Connected</span>
              </p>
              <p className="text-[11px] font-mono text-emerald-400">
                {health?.database?.database_name || 'smart_resume_tracker'} ({health?.database?.database_size || '16 MB'})
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 space-y-2">
              <span className="text-xs font-semibold text-slate-400 flex items-center justify-between">
                <span>Active DB Connections</span>
                <Activity className="h-4 w-4 text-purple-400" />
              </span>
              <p className="text-2xl font-black text-white font-mono">
                {health?.database?.active_connections || '1'}
              </p>
              <p className="text-[11px] text-slate-400">Node-Postgres Connection Pool</p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 space-y-2">
              <span className="text-xs font-semibold text-slate-400 flex items-center justify-between">
                <span>Memory Allocation</span>
                <Cpu className="h-4 w-4 text-amber-400" />
              </span>
              <p className="text-2xl font-black text-white font-mono">
                {health?.memoryUsageMB?.heapUsed || 0} MB
              </p>
              <p className="text-[11px] font-mono text-slate-400">
                Total Heap: {health?.memoryUsageMB?.heapTotal || 0} MB
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 space-y-2">
              <span className="text-xs font-semibold text-slate-400 flex items-center justify-between">
                <span>Server Uptime</span>
                <Clock className="h-4 w-4 text-blue-400" />
              </span>
              <p className="text-2xl font-black text-white font-mono">
                {health?.uptimeSeconds ? `${Math.floor(health.uptimeSeconds / 60)}m ${health.uptimeSeconds % 60}s` : 'Active'}
              </p>
              <p className="text-[11px] text-slate-400 font-mono">Node.js {health?.nodeVersion || 'v22'}</p>
            </div>
          </div>

          {/* Database Table Counts */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Database className="h-4 w-4 text-purple-400" />
              <span>PostgreSQL Production Schema Volume</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-center">
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-500">Users Table</span>
                <p className="text-lg font-bold text-white mt-1">{health?.tableCounts?.users_count || 0}</p>
              </div>
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-500">Resumes Table</span>
                <p className="text-lg font-bold text-blue-400 mt-1">{health?.tableCounts?.resumes_count || 0}</p>
              </div>
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-500">Applications</span>
                <p className="text-lg font-bold text-indigo-400 mt-1">{health?.tableCounts?.applications_count || 0}</p>
              </div>
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-500">AI Logs</span>
                <p className="text-lg font-bold text-amber-400 mt-1">{health?.tableCounts?.ai_logs_count || 0}</p>
              </div>
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-500">Audit Logs</span>
                <p className="text-lg font-bold text-purple-400 mt-1">{health?.tableCounts?.audit_logs_count || 0}</p>
              </div>
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-500">User Sessions</span>
                <p className="text-lg font-bold text-emerald-400 mt-1">{health?.tableCounts?.sessions_count || 0}</p>
              </div>
            </div>
          </div>

          {/* Platform Settings Manager */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6 space-y-5 shadow-xl text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-purple-400" />
                <h3 className="text-sm font-bold text-white">Platform Configuration & Feature Flags</h3>
              </div>
            </div>

            <div className="space-y-4 max-w-2xl">
              {/* Maintenance Mode Toggle */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900/50 border border-slate-800">
                <div>
                  <span className="font-bold text-white block">Platform Maintenance Mode</span>
                  <span className="text-slate-400 block text-[11px] mt-0.5">
                    When enabled, non-admin candidate traffic is gated with a 503 maintenance message.
                  </span>
                </div>
                <button
                  onClick={() => {
                    const next = !maintenanceMode;
                    setMaintenanceMode(next);
                    handleUpdateSetting('maintenance_mode', next);
                  }}
                  className={`px-4 py-1.5 rounded-xl font-bold text-xs transition-colors border ${
                    maintenanceMode
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
                  }`}
                >
                  {maintenanceMode ? 'Enabled' : 'Disabled'}
                </button>
              </div>

              {/* Default AI Model Selector */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900/50 border border-slate-800">
                <div>
                  <span className="font-bold text-white block">Default AI Provider Engine</span>
                  <span className="text-slate-400 block text-[11px] mt-0.5">
                    Specifies the production LLM engine routed for resume customization & ATS keywords.
                  </span>
                </div>
                <select
                  value={defaultModel}
                  onChange={(e) => {
                    setDefaultModel(e.target.value);
                    handleUpdateSetting('default_ai_model', e.target.value);
                  }}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-purple-500 font-mono"
                >
                  <option value="gpt-4o">gpt-4o (Primary)</option>
                  <option value="gpt-4o-mini">gpt-4o-mini (Cost Optimized)</option>
                  <option value="claude-3-5-sonnet">claude-3-5-sonnet</option>
                  <option value="gemini-1.5-pro">gemini-1.5-pro</option>
                </select>
              </div>

              {/* Allow Registration Toggle */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900/50 border border-slate-800">
                <div>
                  <span className="font-bold text-white block">Allow Candidate Self-Registration</span>
                  <span className="text-slate-400 block text-[11px] mt-0.5">
                    Permits visitors to sign up on the public registration portal.
                  </span>
                </div>
                <button
                  onClick={() => {
                    const next = !allowSignups;
                    setAllowSignups(next);
                    handleUpdateSetting('allow_candidate_registration', next);
                  }}
                  className={`px-4 py-1.5 rounded-xl font-bold text-xs transition-colors border ${
                    allowSignups
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  {allowSignups ? 'Open' : 'Restricted'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

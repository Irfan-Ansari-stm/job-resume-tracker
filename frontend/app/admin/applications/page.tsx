'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Layers, Building2, Briefcase, CheckCircle2 } from 'lucide-react';

export default function AdminApplicationsPage() {
  const [stats, setStats] = useState<any | null>(null);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await api.get('/admin/dashboard');
        if (res.success) setStats(res.data);
      } catch (err) {
        console.error(err);
      }
    }
    loadStats();
  }, []);

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-xl font-bold tracking-tight text-white">Global Job Applications & Enterprise Analytics</h1>
        <p className="text-xs text-slate-400 mt-1">
          High-level oversight of candidate application volume, status conversions, and employer engagement.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-950/60">
          <p className="text-xs text-slate-400">Total Applications</p>
          <p className="text-2xl font-black text-white mt-1">{stats?.applications?.total_applications || 0}</p>
        </div>
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-950/60">
          <p className="text-xs text-blue-400">Applied Status</p>
          <p className="text-2xl font-black text-white mt-1">{stats?.applications?.applied_count || 0}</p>
        </div>
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-950/60">
          <p className="text-xs text-purple-400">Interviews Active</p>
          <p className="text-2xl font-black text-white mt-1">{stats?.applications?.interview_count || 0}</p>
        </div>
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-950/60">
          <p className="text-xs text-emerald-400">Offers Converted</p>
          <p className="text-2xl font-black text-white mt-1">{stats?.applications?.offer_count || 0}</p>
        </div>
      </div>

      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-950/60 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Top Employers in Network</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {['Tata Consultancy Services (TCS)', 'Infosys Limited', 'Wipro Enterprise', 'Accenture Strategy', 'HCLTech', 'Capgemini'].map(c => (
            <div key={c} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
              <span className="font-bold text-white block">{c}</span>
              <span className="text-[11px] text-emerald-400 font-semibold mt-1 inline-block">Active Hiring Track</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

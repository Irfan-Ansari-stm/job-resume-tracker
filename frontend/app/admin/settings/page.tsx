'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Settings, Shield, Server, Database, CheckCircle2 } from 'lucide-react';

export default function AdminSettingsPage() {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [provider, setProvider] = useState('openai');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-xl font-bold tracking-tight text-white">System Settings & Platform Health</h1>
        <p className="text-xs text-slate-400 mt-1">
          Configure global system parameters, database connection pooling, and AI provider routing.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white">Maintenance Mode</h3>
            <p className="text-xs text-slate-400 mt-0.5">Restrict access to Super Administrators during updates</p>
          </div>
          <button
            onClick={() => setMaintenanceMode(!maintenanceMode)}
            className={`w-12 h-6 rounded-full transition-colors relative ${maintenanceMode ? 'bg-rose-600' : 'bg-slate-800'}`}
          >
            <span className={`h-4 w-4 rounded-full bg-white absolute top-1 transition-transform ${maintenanceMode ? 'right-1' : 'left-1'}`} />
          </button>
        </div>

        <div className="space-y-3">
          <label className="text-xs font-bold text-white block">Default AI Provider Engine</label>
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-200 focus:outline-purple-500"
          >
            <option value="openai">OpenAI (GPT-4o Mini / Enterprise)</option>
            <option value="fallback">Deterministic Rule-Based Engine (Fallback)</option>
          </select>
        </div>

        <div className="pt-2 flex items-center justify-between">
          {saved && (
            <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4" /> Platform settings updated!
            </span>
          )}
          <span />
          <button
            onClick={handleSave}
            className="rounded-xl bg-purple-600 px-5 py-2 text-xs font-bold text-white hover:bg-purple-700 transition-colors"
          >
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
}

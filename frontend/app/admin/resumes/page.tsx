'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { FileStack, Plus, CheckCircle, Star } from 'lucide-react';

export default function AdminResumesPage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTemplates = async () => {
    try {
      const res = await api.get('/admin/templates');
      if (res.success) setTemplates(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

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
      alert(err.message || 'Failed to update');
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-xl font-bold tracking-tight text-white">Resume Templates Governance</h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage ATS-compliant resume templates, category groupings, and Pro tier gating.
        </p>
      </div>

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
    </div>
  );
}

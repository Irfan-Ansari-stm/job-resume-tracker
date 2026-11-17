'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { CreditCard, DollarSign, CheckCircle } from 'lucide-react';

export default function AdminSubscriptionsPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPlans = async () => {
    try {
      const res = await api.get('/subscriptions/plans');
      if (res.success) setPlans(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-xl font-bold tracking-tight text-white">SaaS Plans & Pricing Economics</h1>
        <p className="text-xs text-slate-400 mt-1">
          Review subscription pricing models, AI credit allocations, and version caps.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {plans.map(p => (
          <div key={p.slug} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">{p.name}</h3>
              <span className="font-mono text-xs font-bold bg-slate-900 text-purple-400 px-2 py-0.5 rounded">
                ${p.price_monthly}/mo
              </span>
            </div>
            <p className="text-xs text-slate-400">{p.description}</p>

            <div className="space-y-2 text-xs text-slate-300 border-t border-slate-800 pt-3">
              <p>• AI Monthly Quota: <strong>{p.ai_credits_monthly} credits</strong></p>
              <p>• Max Resumes: <strong>{p.resume_upload_limit} uploads</strong></p>
              <p>• Max Versions: <strong>{p.resume_version_limit} versions</strong></p>
              <p>• Max Active Apps: <strong>{p.application_tracking_limit} tracking slots</strong></p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

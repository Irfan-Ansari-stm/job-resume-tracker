'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { CreditCard, Sparkles, Check, ArrowUpRight, Receipt, CheckCircle2 } from 'lucide-react';

export default function BillingPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [currentSub, setCurrentSub] = useState<any | null>(null);
  const [credits, setCredits] = useState<any | null>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUpgrading, setIsUpgrading] = useState(false);

  const fetchBilling = async () => {
    try {
      const [plansRes, curRes, payRes] = await Promise.all([
        api.get('/subscriptions/plans'),
        api.get('/subscriptions/current'),
        api.get('/subscriptions/payments'),
      ]);
      if (plansRes.success) setPlans(plansRes.data);
      if (curRes.success) {
        setCurrentSub(curRes.data.subscription);
        setCredits(curRes.data.credits);
      }
      if (payRes.success) setPayments(payRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBilling();
  }, []);

  const handleCheckout = async (slug: string) => {
    if (!confirm(`Switch subscription to ${slug.toUpperCase()} plan?`)) return;
    setIsUpgrading(true);
    try {
      const res = await api.post('/subscriptions/checkout', {
        planSlug: slug,
        billingInterval: 'monthly',
      });
      if (res.success) {
        alert('Plan updated successfully!');
        await fetchBilling();
      }
    } catch (err: any) {
      alert(err.message || 'Checkout failed');
    } finally {
      setIsUpgrading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Subscription & Billing Management</h1>
        <p className="text-xs text-slate-500 mt-1">
          Review your current tier, AI credit allowances, and payment transaction receipts.
        </p>
      </div>

      {/* Current Plan & Credits Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Active Subscription</span>
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-2.5 py-0.5 rounded-full capitalize">
              {currentSub?.status || 'Active'}
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <h2 className="text-2xl font-black text-slate-900">{currentSub?.plan_name || 'Free Starter'}</h2>
            <span className="text-xs text-slate-500">(${currentSub?.price_monthly || 0}/month)</span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Includes up to <strong>{currentSub?.resume_version_limit || 5}</strong> resume versions,{' '}
            <strong>{currentSub?.application_tracking_limit || 20}</strong> application tracking slots, and priority parsing.
          </p>

          <div className="pt-2 flex items-center gap-2 text-xs text-slate-500">
            <span>Period renewal date: <strong>{formatDate(currentSub?.current_period_end)}</strong></span>
          </div>
        </div>

        {/* AI Credits Overview */}
        <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-blue-900 font-bold text-xs mb-3">
              <Sparkles className="h-4 w-4 text-blue-600" />
              <span>AI Credit Balance</span>
            </div>
            <p className="text-4xl font-black text-blue-700">{credits?.remaining_credits ?? 15}</p>
            <p className="text-xs text-blue-900/80 mt-1">
              Used {credits?.used_credits ?? 0} of {credits?.total_credits ?? 15} total credits
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-blue-200/80 text-[11px] text-blue-800">
            Each AI resume customization costs 1 credit.
          </div>
        </div>
      </div>

      {/* Available Plans Selector */}
      <div>
        <h3 className="text-sm font-bold text-slate-900 mb-4">Available SaaS Plans</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {plans.map(p => {
            const isCurrent = currentSub?.plan_slug === p.slug;
            return (
              <div
                key={p.slug}
                className={`rounded-2xl border p-6 bg-white shadow-2xs flex flex-col justify-between ${
                  isCurrent ? 'border-blue-600 ring-2 ring-blue-600/30' : 'border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-bold text-slate-900">{p.name}</h4>
                    {isCurrent && (
                      <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 min-h-[32px]">{p.description}</p>
                  <p className="text-2xl font-black text-slate-900 mt-4">${p.price_monthly}<span className="text-xs font-normal text-slate-500">/mo</span></p>

                  <ul className="mt-4 space-y-2 border-t border-slate-100 pt-4 text-xs text-slate-600">
                    <li className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      <span>{p.ai_credits_monthly} AI Credits / month</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      <span>{p.resume_version_limit} Tailored Versions</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      <span>{p.application_tracking_limit} Active Applications</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-6 pt-2">
                  <button
                    disabled={isCurrent || isUpgrading}
                    onClick={() => handleCheckout(p.slug)}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all ${
                      isCurrent
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                    }`}
                  >
                    {isCurrent ? 'Active Plan' : `Switch to ${p.name}`}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Invoice History */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs space-y-4">
        <h3 className="text-xs font-bold text-slate-900">Billing & Invoice History</h3>
        {payments.length === 0 ? (
          <p className="text-xs text-slate-400 py-4">No billing transactions recorded.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] font-bold uppercase text-slate-400 border-b border-slate-100 pb-2">
                <tr>
                  <th className="py-2">Invoice #</th>
                  <th className="py-2">Date</th>
                  <th className="py-2">Amount</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map(pay => (
                  <tr key={pay.id}>
                    <td className="py-2.5 font-mono text-slate-800">{pay.invoice_number || 'INV-001'}</td>
                    <td className="py-2.5 text-slate-500">{formatDate(pay.created_at)}</td>
                    <td className="py-2.5 font-bold text-slate-900">${pay.amount}</td>
                    <td className="py-2.5">
                      <span className="bg-emerald-100 text-emerald-800 font-semibold text-[10px] px-2 py-0.5 rounded capitalize">
                        {pay.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

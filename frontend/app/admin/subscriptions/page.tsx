'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import {
  CreditCard,
  DollarSign,
  CheckCircle,
  Plus,
  Edit,
  X,
  Search,
  Check,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

export default function AdminSubscriptionsPage() {
  const [activeTab, setActiveTab] = useState<'plans' | 'subscriptions' | 'payments'>('plans');
  const [plans, setPlans] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Plan modal
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [planForm, setPlanForm] = useState({
    name: '',
    slug: '',
    description: '',
    priceMonthly: 19,
    priceYearly: 190,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // User subscription upgrade modal
  const [selectedSub, setSelectedSub] = useState<any | null>(null);
  const [newPlanId, setNewPlanId] = useState('');
  const [isChangingPlan, setIsChangingPlan] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [plansRes, subsRes, payRes] = await Promise.all([
        api.get('/admin/plans'),
        api.get('/admin/subscriptions'),
        api.get('/admin/payments'),
      ]);
      if (plansRes.success) setPlans(plansRes.data);
      if (subsRes.success) setSubscriptions(subsRes.data);
      if (payRes.success) setPayments(payRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingPlanId) {
        const res = await api.put(`/admin/plans/${editingPlanId}`, planForm);
        if (res.success) {
          setShowPlanModal(false);
          fetchData();
          alert('Subscription plan updated!');
        }
      } else {
        const res = await api.post('/admin/plans', planForm);
        if (res.success) {
          setShowPlanModal(false);
          fetchData();
          alert('New subscription plan launched!');
        }
      }
    } catch (err: any) {
      alert(err.message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangeUserPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSub || !newPlanId) return;
    setIsChangingPlan(true);
    try {
      const res = await api.post(`/admin/users/${selectedSub.user_id}/subscription`, {
        planId: newPlanId,
      });
      if (res.success) {
        setSelectedSub(null);
        fetchData();
        alert('User membership tier updated!');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update user plan');
    } finally {
      setIsChangingPlan(false);
    }
  };

  const handleCancelUserSubscription = async (userId: string) => {
    if (!confirm('Cancel this candidate membership subscription?')) return;
    try {
      const res = await api.post(`/admin/users/${userId}/cancel-subscription`, {});
      if (res.success) fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to cancel subscription');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-400">Monetization & Billing</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white mt-0.5">Subscription Plans & Revenue Operations</h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure pricing tiers, manage candidate subscriptions, and view payment transaction logs.
          </p>
        </div>

        {activeTab === 'plans' && (
          <button
            onClick={() => {
              setEditingPlanId(null);
              setPlanForm({ name: '', slug: '', description: '', priceMonthly: 19, priceYearly: 190 });
              setShowPlanModal(true);
            }}
            className="flex items-center gap-1.5 rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-purple-700 transition-colors shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>Create New Plan</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-px text-xs font-bold">
        <button
          onClick={() => setActiveTab('plans')}
          className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
            activeTab === 'plans'
              ? 'border-purple-500 text-purple-400 bg-purple-500/10'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <CreditCard className="h-4 w-4" />
          <span>Subscription Plans ({plans.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('subscriptions')}
          className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
            activeTab === 'subscriptions'
              ? 'border-purple-500 text-purple-400 bg-purple-500/10'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <CheckCircle className="h-4 w-4" />
          <span>Active Subscriptions ({subscriptions.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
            activeTab === 'payments'
              ? 'border-purple-500 text-purple-400 bg-purple-500/10'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <DollarSign className="h-4 w-4" />
          <span>Payment Transactions ({payments.length})</span>
        </button>
      </div>

      {/* Tab 1: Plans */}
      {activeTab === 'plans' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {plans.map((p) => (
            <div
              key={p.id}
              className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6 space-y-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white">{p.name}</h3>
                  <span className="font-mono text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded">
                    ${p.price_monthly}/mo
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">{p.description}</p>
                <div className="text-[11px] text-slate-300 mt-3 font-mono space-y-1">
                  <p>• Yearly: ${p.price_yearly}/yr</p>
                  <p>• Slug: {p.slug}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  onClick={() => {
                    setEditingPlanId(p.id);
                    setPlanForm({
                      name: p.name,
                      slug: p.slug,
                      description: p.description,
                      priceMonthly: p.price_monthly,
                      priceYearly: p.price_yearly,
                    });
                    setShowPlanModal(true);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Edit Plan
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Subscriptions Table */}
      {activeTab === 'subscriptions' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Candidate / User</th>
                <th className="px-4 py-3">Plan Tier</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Monthly Rate</th>
                <th className="px-4 py-3">Current Period End</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    Loading subscriptions...
                  </td>
                </tr>
              ) : subscriptions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    No active user subscriptions found.
                  </td>
                </tr>
              ) : (
                subscriptions.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/users/${s.user_id}`}
                        className="text-white hover:text-purple-400 font-bold transition-colors"
                      >
                        {s.user_first_name} {s.user_last_name}
                      </Link>
                      <span className="block text-[10px] text-slate-500">{s.user_email}</span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-purple-300">{s.plan_name}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        s.status === 'active'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono">${s.price_monthly}/mo</td>
                    <td className="px-4 py-3 text-slate-400 text-[11px]">{formatDate(s.current_period_end)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedSub(s);
                            setNewPlanId(s.plan_id);
                          }}
                          className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-[11px] font-bold text-slate-300 hover:text-white"
                        >
                          Modify Plan
                        </button>
                        {s.status === 'active' && (
                          <button
                            onClick={() => handleCancelUserSubscription(s.user_id)}
                            className="px-2 py-1 rounded bg-rose-500/10 border border-rose-500/20 text-[11px] font-bold text-rose-400 hover:bg-rose-500/20"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 3: Payments Table */}
      {activeTab === 'payments' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Transaction ID</th>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Currency</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Payment Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    Loading payments...
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    No payment records recorded.
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="px-4 py-3 font-mono text-slate-400">{p.id.slice(0, 12)}...</td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-white">{p.user_first_name} {p.user_last_name}</span>
                      <span className="block text-[10px] text-slate-500">{p.user_email}</span>
                    </td>
                    <td className="px-4 py-3 font-bold text-emerald-400 font-mono">${p.amount}</td>
                    <td className="px-4 py-3 font-mono text-slate-400">{p.currency || 'USD'}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-[11px]">{formatDate(p.created_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Plan Modal */}
      {showPlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl text-slate-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-purple-400" />
                {editingPlanId ? 'Edit Subscription Plan' : 'Create Subscription Plan'}
              </h2>
              <button onClick={() => setShowPlanModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSavePlan} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-400 mb-1">Plan Display Name *</label>
                <input
                  type="text"
                  required
                  value={planForm.name}
                  onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-purple-500"
                  placeholder="e.g. Pro Candidate Tier"
                />
              </div>

              {!editingPlanId && (
                <div>
                  <label className="block font-medium text-slate-400 mb-1">Unique Slug *</label>
                  <input
                    type="text"
                    required
                    value={planForm.slug}
                    onChange={(e) => setPlanForm({ ...planForm, slug: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-purple-500"
                    placeholder="pro-tier"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-400 mb-1">Price Monthly ($) *</label>
                  <input
                    type="number"
                    required
                    value={planForm.priceMonthly}
                    onChange={(e) => setPlanForm({ ...planForm, priceMonthly: parseFloat(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-purple-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-400 mb-1">Price Yearly ($)</label>
                  <input
                    type="number"
                    value={planForm.priceYearly}
                    onChange={(e) => setPlanForm({ ...planForm, priceYearly: parseFloat(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-400 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={planForm.description}
                  onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-purple-500"
                  placeholder="Plan features and quota details..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowPlanModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modify User Plan Modal */}
      {selectedSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl text-slate-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-purple-400" />
                Change User Subscription Tier
              </h2>
              <button onClick={() => setSelectedSub(null)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleChangeUserPlan} className="space-y-4 text-xs">
              <p className="text-slate-400">
                Target User: <strong className="text-white">{selectedSub.user_first_name} {selectedSub.user_last_name}</strong> ({selectedSub.user_email})
              </p>

              <div>
                <label className="block font-medium text-slate-400 mb-1">Select New Membership Plan</label>
                <select
                  value={newPlanId}
                  onChange={(e) => setNewPlanId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-purple-500 font-semibold"
                >
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} - ${p.price_monthly}/mo
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedSub(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isChangingPlan}
                  className="px-5 py-2 rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                  {isChangingPlan ? 'Updating...' : 'Confirm Tier Change'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

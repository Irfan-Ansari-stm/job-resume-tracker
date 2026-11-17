'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import {
  ShieldCheck,
  ShieldAlert,
  History,
  KeyRound,
  Trash2,
  Plus,
  X,
  Search,
  Lock,
  Globe,
  Clock,
  AlertTriangle,
} from 'lucide-react';

export default function AdminSecurityPage() {
  const [activeTab, setActiveTab] = useState<'sessions' | 'ip' | 'audit'>('sessions');
  const [sessions, setSessions] = useState<any[]>([]);
  const [ipRules, setIpRules] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New IP rule modal
  const [showIpModal, setShowIpModal] = useState(false);
  const [ipForm, setIpForm] = useState({ ipAddress: '', ruleType: 'block', description: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sessRes, ipRes, auditRes] = await Promise.all([
        api.get('/admin/sessions'),
        api.get('/admin/ip-rules'),
        api.get('/admin/audit-logs'),
      ]);
      if (sessRes.success) setSessions(sessRes.data);
      if (ipRes.success) setIpRules(ipRes.data);
      if (auditRes.success) setAuditLogs(auditRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const handleRevokeSession = async (id: string) => {
    if (!confirm('Immediately terminate this active session? The user will be logged out.')) return;
    try {
      const res = await api.delete(`/admin/sessions/${id}`);
      if (res.success) {
        setSessions(prev => prev.filter(s => s.id !== id));
      }
    } catch (err: any) {
      alert(err.message || 'Failed to revoke session');
    }
  };

  const handleCreateIpRule = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await api.post('/admin/ip-rules', ipForm);
      if (res.success) {
        setShowIpModal(false);
        setIpForm({ ipAddress: '', ruleType: 'block', description: '' });
        fetchData();
        alert('IP security rule activated!');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to save rule');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteIpRule = async (id: string) => {
    if (!confirm('Remove this IP firewall rule?')) return;
    try {
      const res = await api.delete(`/admin/ip-rules/${id}`);
      if (res.success) fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete rule');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-400">Security & Compliance</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white mt-0.5">Security, Sessions & Audit Logs</h1>
          <p className="text-xs text-slate-400 mt-1">
            Audit user authentication sessions, enforce IP whitelist/blacklists, and inspect administrative audit logs.
          </p>
        </div>

        {activeTab === 'ip' && (
          <button
            onClick={() => setShowIpModal(true)}
            className="flex items-center gap-1.5 rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-purple-700 transition-colors shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>Add IP Rule</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-px text-xs font-bold">
        <button
          onClick={() => setActiveTab('sessions')}
          className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
            activeTab === 'sessions'
              ? 'border-purple-500 text-purple-400 bg-purple-500/10'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Lock className="h-4 w-4" />
          <span>Active User Sessions ({sessions.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('ip')}
          className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
            activeTab === 'ip'
              ? 'border-purple-500 text-purple-400 bg-purple-500/10'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Globe className="h-4 w-4" />
          <span>IP Firewall Rules ({ipRules.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
            activeTab === 'audit'
              ? 'border-purple-500 text-purple-400 bg-purple-500/10'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <History className="h-4 w-4" />
          <span>Administrative Audit Trail ({auditLogs.length})</span>
        </button>
      </div>

      {/* Tab 1: Active Sessions Table */}
      {activeTab === 'sessions' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">User / Account</th>
                <th className="px-4 py-3">IP Address</th>
                <th className="px-4 py-3">Client Device / User-Agent</th>
                <th className="px-4 py-3">Session Created</th>
                <th className="px-4 py-3">Expires At</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    Loading active sessions...
                  </td>
                </tr>
              ) : sessions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    No active sessions found.
                  </td>
                </tr>
              ) : (
                sessions.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/users/${s.user_id}`}
                        className="font-bold text-white hover:text-purple-400 transition-colors"
                      >
                        {s.user_first_name} {s.user_last_name}
                      </Link>
                      <span className="block text-[10px] text-slate-500">{s.user_email}</span>
                    </td>
                    <td className="px-4 py-3 font-mono text-purple-300">{s.ip_address || '127.0.0.1'}</td>
                    <td className="px-4 py-3 text-slate-400 max-w-xs truncate">{s.user_agent || 'Desktop Browser'}</td>
                    <td className="px-4 py-3 text-slate-400 text-[11px]">{formatDate(s.created_at)}</td>
                    <td className="px-4 py-3 text-slate-400 text-[11px]">{formatDate(s.expires_at)}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleRevokeSession(s.id)}
                        className="px-2.5 py-1 rounded bg-rose-500/10 border border-rose-500/20 text-[11px] font-bold text-rose-400 hover:bg-rose-500/20 transition-colors"
                      >
                        Revoke
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 2: IP Rules */}
      {activeTab === 'ip' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">IP Address / CIDR</th>
                <th className="px-4 py-3">Rule Type</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Created By</th>
                <th className="px-4 py-3">Created Date</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    Loading IP rules...
                  </td>
                </tr>
              ) : ipRules.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    No custom IP access rules configured. All IPs filtered by standard rate limiting.
                  </td>
                </tr>
              ) : (
                ipRules.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-white">{r.ip_address}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        r.rule_type === 'allow'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}>
                        {r.rule_type === 'allow' ? 'Whitelisted (Allow)' : 'Blocked (Deny)'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-300">{r.description || 'N/A'}</td>
                    <td className="px-4 py-3 text-slate-400">{r.created_by_email || 'Super Admin'}</td>
                    <td className="px-4 py-3 text-slate-400 text-[11px]">{formatDate(r.created_at)}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDeleteIpRule(r.id)}
                        className="p-1 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20"
                        title="Delete rule"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 3: Audit Trail */}
      {activeTab === 'audit' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Administrator</th>
                <th className="px-4 py-3">Action Performed</th>
                <th className="px-4 py-3">Target Entity</th>
                <th className="px-4 py-3">IP Address</th>
                <th className="px-4 py-3">Context Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="px-4 py-3 text-slate-400 text-[11px] whitespace-nowrap">
                    {formatDate(log.created_at)}
                  </td>
                  <td className="px-4 py-3 font-semibold text-white">
                    {log.user_email || 'System Daemon'}
                  </td>
                  <td className="px-4 py-3 font-mono font-bold text-purple-400">
                    {log.action}
                  </td>
                  <td className="px-4 py-3 text-slate-300">
                    {log.entity_type} {log.entity_id ? `(#${log.entity_id.slice(0, 8)})` : ''}
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-400">
                    {log.ip_address || '127.0.0.1'}
                  </td>
                  <td className="px-4 py-3 font-mono text-[10px] text-slate-400 max-w-xs truncate">
                    {JSON.stringify(log.details)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add IP Rule Modal */}
      {showIpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl text-slate-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Globe className="h-5 w-5 text-purple-400" />
                Configure IP Firewall Rule
              </h2>
              <button onClick={() => setShowIpModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateIpRule} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-400 mb-1">IP Address or Range *</label>
                <input
                  type="text"
                  required
                  value={ipForm.ipAddress}
                  onChange={(e) => setIpForm({ ...ipForm, ipAddress: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-purple-500 font-mono"
                  placeholder="e.g. 192.168.1.100 or 10.0.0.0/24"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-400 mb-1">Policy Action</label>
                <select
                  value={ipForm.ruleType}
                  onChange={(e) => setIpForm({ ...ipForm, ruleType: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-purple-500"
                >
                  <option value="block">Block (Blacklist - Deny traffic)</option>
                  <option value="allow">Allow (Whitelist - Bypass restrictions)</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-400 mb-1">Rule Justification</label>
                <textarea
                  rows={3}
                  value={ipForm.description}
                  onChange={(e) => setIpForm({ ...ipForm, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-purple-500"
                  placeholder="Reason for blocking or whitelisting..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowIpModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Apply Firewall Rule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

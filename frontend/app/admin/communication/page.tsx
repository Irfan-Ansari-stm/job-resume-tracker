'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import {
  MessageSquare,
  Bell,
  Megaphone,
  LifeBuoy,
  Plus,
  Trash2,
  Edit,
  X,
  Send,
  CheckCircle,
  Clock,
  AlertCircle,
} from 'lucide-react';

export default function AdminCommunicationPage() {
  const [activeTab, setActiveTab] = useState<'announcements' | 'broadcast' | 'tickets'>('announcements');
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New announcement modal
  const [showAnnounceModal, setShowAnnounceModal] = useState(false);
  const [announceForm, setAnnounceForm] = useState({
    title: '',
    message: '',
    priority: 'normal',
    targetAudience: 'all',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Broadcast modal state
  const [broadcastForm, setBroadcastForm] = useState({
    title: '',
    message: '',
    type: 'system',
    targetAudience: 'all',
  });
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  // Respond ticket modal
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [adminResponse, setAdminResponse] = useState('');
  const [ticketStatus, setTicketStatus] = useState('resolved');
  const [isResponding, setIsResponding] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [annRes, tickRes] = await Promise.all([
        api.get('/admin/announcements'),
        api.get('/admin/tickets'),
      ]);
      if (annRes.success) setAnnouncements(annRes.data);
      if (tickRes.success) setTickets(tickRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await api.post('/admin/announcements', announceForm);
      if (res.success) {
        setShowAnnounceModal(false);
        setAnnounceForm({ title: '', message: '', priority: 'normal', targetAudience: 'all' });
        fetchData();
        alert('Announcement published platform-wide!');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to publish announcement');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!confirm('Delete this system announcement?')) return;
    try {
      const res = await api.delete(`/admin/announcements/${id}`);
      if (res.success) fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete');
    }
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsBroadcasting(true);
    try {
      const res = await api.post('/admin/notifications/broadcast', broadcastForm);
      if (res.success) {
        alert(res.message || 'Broadcast successfully sent!');
        setBroadcastForm({ title: '', message: '', type: 'system', targetAudience: 'all' });
      }
    } catch (err: any) {
      alert(err.message || 'Failed to send broadcast');
    } finally {
      setIsBroadcasting(false);
    }
  };

  const handleRespondTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;
    setIsResponding(true);
    try {
      const res = await api.put(`/admin/tickets/${selectedTicket.id}`, {
        adminResponse,
        status: ticketStatus,
      });
      if (res.success) {
        setSelectedTicket(null);
        setAdminResponse('');
        fetchData();
        alert('Support response sent to candidate!');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to submit response');
    } finally {
      setIsResponding(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-400">Platform Communications</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white mt-0.5">Announcements & Support Governance</h1>
          <p className="text-xs text-slate-400 mt-1">
            Publish system-wide notifications, broadcast urgent alerts, and resolve candidate support inquiries.
          </p>
        </div>

        {activeTab === 'announcements' && (
          <button
            onClick={() => setShowAnnounceModal(true)}
            className="flex items-center gap-1.5 rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-purple-700 transition-colors shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>Publish Announcement</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-px text-xs font-bold">
        <button
          onClick={() => setActiveTab('announcements')}
          className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
            activeTab === 'announcements'
              ? 'border-purple-500 text-purple-400 bg-purple-500/10'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Megaphone className="h-4 w-4" />
          <span>Announcements ({announcements.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('broadcast')}
          className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
            activeTab === 'broadcast'
              ? 'border-purple-500 text-purple-400 bg-purple-500/10'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Bell className="h-4 w-4" />
          <span>Broadcast Notification</span>
        </button>
        <button
          onClick={() => setActiveTab('tickets')}
          className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
            activeTab === 'tickets'
              ? 'border-purple-500 text-purple-400 bg-purple-500/10'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <LifeBuoy className="h-4 w-4" />
          <span>Support Inquiries ({tickets.length})</span>
        </button>
      </div>

      {/* Tab 1: System Announcements */}
      {activeTab === 'announcements' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {announcements.map((a) => (
            <div
              key={a.id}
              className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 space-y-3 flex flex-col justify-between shadow-xl"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    a.priority === 'urgent' || a.priority === 'high'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  }`}>
                    {a.priority} Priority
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Target: {a.target_audience}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white mt-2">{a.title}</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{a.message}</p>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-500">{formatDate(a.created_at)}</span>
                <button
                  onClick={() => handleDeleteAnnouncement(a.id)}
                  className="p-1 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 transition-colors"
                  title="Delete Announcement"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Broadcast Notifications Form */}
      {activeTab === 'broadcast' && (
        <div className="max-w-xl rounded-2xl border border-slate-800 bg-slate-950/60 p-6 space-y-4 shadow-xl">
          <div>
            <h2 className="text-base font-bold text-white">Broadcast Global Notification</h2>
            <p className="text-xs text-slate-400 mt-1">
              Dispatches real-time bell notifications into candidate user dashboards and notification centres.
            </p>
          </div>

          <form onSubmit={handleSendBroadcast} className="space-y-4 text-xs">
            <div>
              <label className="block font-medium text-slate-400 mb-1">Target Audience</label>
              <select
                value={broadcastForm.targetAudience}
                onChange={(e) => setBroadcastForm({ ...broadcastForm, targetAudience: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-purple-500"
              >
                <option value="all">All Registered Candidates & Staff</option>
                <option value="admins">Administrators & Staff Only</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-400 mb-1">Notification Title *</label>
              <input
                type="text"
                required
                value={broadcastForm.title}
                onChange={(e) => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-purple-500"
                placeholder="e.g. ATS Optimization v2.0 Released"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-400 mb-1">Notification Message *</label>
              <textarea
                rows={4}
                required
                value={broadcastForm.message}
                onChange={(e) => setBroadcastForm({ ...broadcastForm, message: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-purple-500"
                placeholder="Message body displayed to candidate..."
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isBroadcasting}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-700 transition-colors shadow-md disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                <span>{isBroadcasting ? 'Delivering...' : 'Send Broadcast Notification'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 3: Support Inquiries */}
      {activeTab === 'tickets' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Candidate</th>
                <th className="px-4 py-3">Subject</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Submitted</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    Loading support tickets...
                  </td>
                </tr>
              ) : tickets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    No open support tickets.
                  </td>
                </tr>
              ) : (
                tickets.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-bold text-white block">{t.user_first_name} {t.user_last_name}</span>
                      <span className="text-[10px] text-slate-500">{t.user_email}</span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-200">{t.subject}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        t.priority === 'urgent'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : t.priority === 'high'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-slate-800 text-slate-300'
                      }`}>
                        {t.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        t.status === 'resolved' || t.status === 'closed'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      }`}>
                        {t.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-[11px]">{formatDate(t.created_at)}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => {
                          setSelectedTicket(t);
                          setAdminResponse(t.admin_response || '');
                          setTicketStatus(t.status || 'resolved');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white"
                      >
                        Respond
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Publish Announcement Modal */}
      {showAnnounceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl text-slate-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Megaphone className="h-5 w-5 text-purple-400" />
                Publish System Announcement
              </h2>
              <button onClick={() => setShowAnnounceModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAnnouncement} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-400 mb-1">Announcement Title *</label>
                <input
                  type="text"
                  required
                  value={announceForm.title}
                  onChange={(e) => setAnnounceForm({ ...announceForm, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-purple-500"
                  placeholder="e.g. Infrastructure Maintenance Notice"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-400 mb-1">Urgency Priority</label>
                  <select
                    value={announceForm.priority}
                    onChange={(e) => setAnnounceForm({ ...announceForm, priority: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-purple-500"
                  >
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-400 mb-1">Target Audience</label>
                  <select
                    value={announceForm.targetAudience}
                    onChange={(e) => setAnnounceForm({ ...announceForm, targetAudience: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-purple-500"
                  >
                    <option value="all">All Platform Users</option>
                    <option value="admins">Admins Only</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-400 mb-1">Announcement Message *</label>
                <textarea
                  rows={4}
                  required
                  value={announceForm.message}
                  onChange={(e) => setAnnounceForm({ ...announceForm, message: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-purple-500"
                  placeholder="Detailed announcement content..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAnnounceModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-700 transition-colors shadow-md disabled:opacity-50"
                >
                  {isSubmitting ? 'Publishing...' : 'Publish Announcement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ticket Response Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl text-slate-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <LifeBuoy className="h-5 w-5 text-purple-400" />
                Resolve Support Ticket
              </h2>
              <button onClick={() => setSelectedTicket(null)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleRespondTicket} className="space-y-4 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <p className="font-semibold text-white mb-1">{selectedTicket.subject}</p>
                <p className="text-slate-400 leading-relaxed">{selectedTicket.message}</p>
                <span className="block text-[10px] text-slate-500 mt-2">
                  From: {selectedTicket.user_first_name} {selectedTicket.user_last_name} ({selectedTicket.user_email})
                </span>
              </div>

              <div>
                <label className="block font-medium text-slate-400 mb-1">Administrative Response *</label>
                <textarea
                  rows={4}
                  required
                  value={adminResponse}
                  onChange={(e) => setAdminResponse(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-purple-500"
                  placeholder="Provide resolution or instructions for the candidate..."
                />
              </div>

              <div>
                <label className="block font-medium text-slate-400 mb-1">Update Ticket Status</label>
                <select
                  value={ticketStatus}
                  onChange={(e) => setTicketStatus(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-purple-500"
                >
                  <option value="resolved">Resolved</option>
                  <option value="in_progress">In Progress</option>
                  <option value="closed">Closed</option>
                  <option value="open">Keep Open</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedTicket(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isResponding}
                  className="px-5 py-2 rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-700 transition-colors shadow-md disabled:opacity-50"
                >
                  {isResponding ? 'Delivering...' : 'Send Resolution'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

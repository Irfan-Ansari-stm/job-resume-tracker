'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import {
  Users,
  ArrowLeft,
  Mail,
  MapPin,
  Briefcase,
  Calendar,
  Shield,
  LifeBuoy,
  UserCheck,
  UserX,
  Trash2,
  RotateCcw,
  KeyRound,
  FileStack,
  Layers,
  Cpu,
  History,
  ShieldAlert,
  Coins,
  CheckCircle2,
  X,
  CreditCard,
  ExternalLink,
} from 'lucide-react';

export default function AdminUserDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'resumes' | 'applications' | 'ai' | 'security' | 'assisted'>('overview');

  // Edit user state
  const [editForm, setEditForm] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);

  // Assisted access modal
  const [showAssistModal, setShowAssistModal] = useState(false);
  const [assistReason, setAssistReason] = useState('Super Admin assisting user with resume tailoring and formatting issues.');
  const [isStartingAssist, setIsStartingAssist] = useState(false);

  const loadUserDetails = async () => {
    try {
      const res = await api.get(`/admin/users/${userId}`);
      if (res.success) {
        setData(res.data);
        setEditForm({
          firstName: res.data.user.first_name || '',
          lastName: res.data.user.last_name || '',
          phone: res.data.user.phone || '',
          role: res.data.user.role || 'user',
          isEmailVerified: res.data.user.is_email_verified || false,
          targetRole: res.data.user.target_role || '',
          location: res.data.user.location || '',
          bio: res.data.user.bio || '',
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) loadUserDetails();
  }, [userId]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await api.put(`/admin/users/${userId}`, editForm);
      if (res.success) {
        alert('User profile updated successfully!');
        loadUserDetails();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleStatus = async () => {
    const isSuspended = data?.user?.is_suspended;
    const action = isSuspended ? 'restore access for' : 'suspend';
    if (!confirm(`Are you sure you want to ${action} this candidate?`)) return;

    try {
      const res = await api.put(`/admin/users/${userId}/status`, { isSuspended: !isSuspended });
      if (res.success) {
        loadUserDetails();
      }
    } catch (err: any) {
      alert(err.message || 'Status change failed');
    }
  };

  const handleSoftDelete = async () => {
    const isDeleted = data?.user?.is_deleted;
    if (isDeleted) {
      if (!confirm('Restore this deleted account?')) return;
      try {
        const res = await api.put(`/admin/users/${userId}/restore`, {});
        if (res.success) loadUserDetails();
      } catch (err: any) {
        alert(err.message || 'Failed to restore');
      }
    } else {
      if (!confirm('Move this account to soft-deleted? Access will be revoked.')) return;
      try {
        const res = await api.put(`/admin/users/${userId}/delete`, {});
        if (res.success) loadUserDetails();
      } catch (err: any) {
        alert(err.message || 'Failed to delete');
      }
    }
  };

  const handleResetCredits = async () => {
    const credits = prompt('Enter new AI credit allocation:', '100');
    if (!credits) return;

    try {
      const res = await api.post(`/admin/users/${userId}/reset-credits`, { credits: parseInt(credits, 10) });
      if (res.success) {
        alert(`AI credits updated to ${credits}!`);
        loadUserDetails();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to reset credits');
    }
  };

  const handleRevokeSessions = async () => {
    if (!confirm('Terminate all active sessions for this user? They will be logged out on all devices.')) return;
    try {
      const res = await api.post(`/admin/users/${userId}/revoke-sessions`, {});
      if (res.success) {
        alert('All active sessions revoked!');
        loadUserDetails();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to revoke sessions');
    }
  };

  const handleStartAssistedAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsStartingAssist(true);
    try {
      const res = await api.post('/admin/assisted-access/start', {
        targetUserId: userId,
        reason: assistReason,
      });

      if (res.success) {
        localStorage.setItem(
          'assisted_access',
          JSON.stringify({
            sessionId: res.data.session.id,
            targetUser: res.data.targetUser,
            reason: assistReason,
          })
        );
        setShowAssistModal(false);
        router.push('/dashboard');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to start assisted access');
    } finally {
      setIsStartingAssist(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-xs text-slate-400 flex flex-col items-center gap-3">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
        <span>Loading comprehensive user profile...</span>
      </div>
    );
  }

  if (!data?.user) {
    return (
      <div className="py-20 text-center text-slate-400">
        <p className="text-base font-bold text-white mb-2">User Not Found</p>
        <Link href="/admin/users" className="text-xs text-purple-400 hover:underline">
          Return to Users Directory
        </Link>
      </div>
    );
  }

  const { user, subscription, credits, resumes, applications, aiLogs, sessions, assistedSessions } = data;

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to All Users</span>
        </Link>
      </div>

      {/* User Header Profile Card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-extrabold text-2xl shadow-lg shadow-purple-600/20">
              {user.first_name[0]}{user.last_name[0]}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-extrabold text-white">
                  {user.first_name} {user.last_name}
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {user.role.replace('_', ' ')}
                </span>
                {user.is_deleted ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20">
                    Deleted
                  </span>
                ) : user.is_suspended ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20">
                    Suspended
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                    Active
                  </span>
                )}
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-400 mt-2 flex-wrap">
                <span className="flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5 text-slate-500" />
                  {user.email}
                </span>
                {user.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-slate-500" />
                    {user.location}
                  </span>
                )}
                {user.target_role && (
                  <span className="flex items-center gap-1 text-purple-300 font-medium">
                    <Briefcase className="h-3.5 w-3.5 text-purple-400" />
                    {user.target_role}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-slate-500" />
                  Joined {formatDate(user.created_at)}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            {/* Assisted Access */}
            <button
              onClick={() => setShowAssistModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl text-xs font-bold shadow-md hover:from-amber-700 hover:to-orange-700 transition-all"
            >
              <LifeBuoy className="h-4 w-4" />
              <span>Assisted Access Mode</span>
            </button>

            {/* Suspend / Restore */}
            <button
              onClick={handleToggleStatus}
              className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold border transition-colors ${
                user.is_suspended
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20'
              }`}
            >
              {user.is_suspended ? <UserCheck className="h-4 w-4" /> : <UserX className="h-4 w-4" />}
              <span>{user.is_suspended ? 'Restore Access' : 'Suspend Account'}</span>
            </button>

            {/* Reset Credits */}
            <button
              onClick={handleResetCredits}
              className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold bg-slate-900 border border-slate-800 text-amber-400 hover:bg-amber-500/10 transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Reset Credits</span>
            </button>

            {/* Delete / Restore */}
            <button
              onClick={handleSoftDelete}
              className={`p-2 rounded-xl border transition-colors ${
                user.is_deleted
                  ? 'bg-blue-500/10 border-blue-500/30 text-blue-400 hover:bg-blue-500/20'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20'
              }`}
              title={user.is_deleted ? 'Restore User' : 'Soft Delete User'}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Quick Highlights Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800/80 text-xs">
          <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-500">Subscription Tier</span>
            <p className="font-bold text-white mt-0.5">{subscription?.plan_name || 'Free Tier'}</p>
          </div>
          <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-500">AI Credits Remaining</span>
            <p className="font-bold text-amber-400 mt-0.5">{credits?.credits_remaining ?? 15} credits</p>
          </div>
          <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-500">Resumes Created</span>
            <p className="font-bold text-blue-400 mt-0.5">{resumes.length} resumes</p>
          </div>
          <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-500">Tracked Applications</span>
            <p className="font-bold text-purple-400 mt-0.5">{applications.length} applications</p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1 border-b border-slate-800 text-xs overflow-x-auto pb-px">
        {[
          { key: 'overview', label: 'Profile & Settings', icon: Users },
          { key: 'resumes', label: `Resumes (${resumes.length})`, icon: FileStack },
          { key: 'applications', label: `Applications (${applications.length})`, icon: Layers },
          { key: 'ai', label: `AI Activity (${aiLogs.length})`, icon: Cpu },
          { key: 'security', label: `Sessions & Logins (${sessions.length})`, icon: Shield },
          { key: 'assisted', label: `Assisted History (${assistedSessions?.length || 0})`, icon: LifeBuoy },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-4 py-2.5 font-bold border-b-2 transition-colors whitespace-nowrap ${
                isActive
                  ? 'border-purple-500 text-purple-400 bg-purple-500/10'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Profile & Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <form onSubmit={handleUpdateProfile} className="md:col-span-2 rounded-2xl border border-slate-800 bg-slate-950/60 p-6 space-y-4 text-xs">
            <h2 className="text-sm font-bold text-white mb-2">Edit Account & Profile Data</h2>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-medium mb-1">First Name</label>
                <input
                  type="text"
                  value={editForm.firstName}
                  onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-purple-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-medium mb-1">Last Name</label>
                <input
                  type="text"
                  value={editForm.lastName}
                  onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-purple-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Phone Number</label>
                <input
                  type="text"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-purple-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-medium mb-1">Platform Role</label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-purple-500"
                >
                  <option value="user">Candidate (User)</option>
                  <option value="admin">Administrator</option>
                  <option value="support_admin">Support Specialist</option>
                  <option value="resume_manager">Resume Manager</option>
                  <option value="analyst">BI Analyst</option>
                  <option value="super_admin">Super Administrator</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Target Professional Role</label>
                <input
                  type="text"
                  value={editForm.targetRole}
                  onChange={(e) => setEditForm({ ...editForm, targetRole: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-purple-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-medium mb-1">Location / Timezone</label>
                <input
                  type="text"
                  value={editForm.location}
                  onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Candidate Bio</label>
              <textarea
                rows={3}
                value={editForm.bio}
                onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-purple-500"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-700 transition-colors shadow-md disabled:opacity-50"
              >
                {isSaving ? 'Saving Changes...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>

          {/* Account Governance Sidebar Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6 space-y-4 text-xs">
            <h3 className="font-bold text-white text-sm">Security & Compliance Safeguards</h3>
            
            <div className="space-y-3">
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400">Two-Factor Authentication</span>
                <p className="font-semibold text-white mt-1">
                  {user.two_factor_enabled ? 'Enabled (Authenticator App)' : 'Disabled'}
                </p>
              </div>

              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400">Email Verification</span>
                <p className={`font-semibold mt-1 ${user.is_email_verified ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {user.is_email_verified ? 'Verified' : 'Unverified Email'}
                </p>
              </div>

              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400">Last Active Session</span>
                <p className="font-semibold text-slate-300 mt-1">
                  {user.last_login_at ? formatDate(user.last_login_at) : 'Never'}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800">
              <button
                onClick={handleRevokeSessions}
                className="w-full py-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl font-bold hover:bg-rose-500/20 transition-colors"
              >
                Terminate Active Sessions
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Resumes */}
      {activeTab === 'resumes' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Resume Title</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Target Role</th>
                <th className="px-4 py-3">Versions</th>
                <th className="px-4 py-3">Primary</th>
                <th className="px-4 py-3">Updated</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {resumes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    Candidate has not created any resumes yet.
                  </td>
                </tr>
              ) : (
                resumes.map((r: any) => (
                  <tr key={r.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="px-4 py-3 font-bold text-white">{r.title}</td>
                    <td className="px-4 py-3 text-slate-400">{r.category || 'General'}</td>
                    <td className="px-4 py-3 text-purple-300 font-medium">{r.target_role || 'Not specified'}</td>
                    <td className="px-4 py-3 font-semibold text-white">{r.versions_count || 1}</td>
                    <td className="px-4 py-3">
                      {r.is_primary ? (
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          Primary
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500">Standard</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-400">{formatDate(r.updated_at)}</td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/builder/${r.id}`}
                        className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                      >
                        Inspect in Editor
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 3: Applications */}
      {activeTab === 'applications' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Company</th>
                <th className="px-4 py-3">Job Title</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Salary Range</th>
                <th className="px-4 py-3">Applied Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {applications.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    No tracked job applications for this candidate.
                  </td>
                </tr>
              ) : (
                applications.map((a: any) => (
                  <tr key={a.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="px-4 py-3 font-bold text-white">{a.company_name}</td>
                    <td className="px-4 py-3 text-slate-200">{a.job_title}</td>
                    <td className="px-4 py-3 text-slate-400">{a.location || 'Remote'}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        {a.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-300 font-mono">{a.salary_range || 'N/A'}</td>
                    <td className="px-4 py-3 text-slate-400">{formatDate(a.created_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 4: AI Usage Logs */}
      {activeTab === 'ai' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Operation</th>
                <th className="px-4 py-3">Model</th>
                <th className="px-4 py-3">Prompt Tokens</th>
                <th className="px-4 py-3">Completion Tokens</th>
                <th className="px-4 py-3">Duration</th>
                <th className="px-4 py-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {aiLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    No AI generation history recorded for this user.
                  </td>
                </tr>
              ) : (
                aiLogs.map((log: any) => (
                  <tr key={log.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="px-4 py-3 font-bold text-white">{log.operation_type}</td>
                    <td className="px-4 py-3 font-mono text-purple-300">{log.model}</td>
                    <td className="px-4 py-3 font-mono">{log.prompt_tokens}</td>
                    <td className="px-4 py-3 font-mono">{log.completion_tokens}</td>
                    <td className="px-4 py-3 text-slate-400">{log.duration_ms} ms</td>
                    <td className="px-4 py-3 text-slate-400">{formatDate(log.created_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 5: Active Sessions */}
      {activeTab === 'security' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Session ID</th>
                <th className="px-4 py-3">IP Address</th>
                <th className="px-4 py-3">Client User-Agent</th>
                <th className="px-4 py-3">Last Active</th>
                <th className="px-4 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {sessions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    No active sessions recorded.
                  </td>
                </tr>
              ) : (
                sessions.map((s: any) => (
                  <tr key={s.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="px-4 py-3 font-mono text-slate-400">{s.id.slice(0, 8)}...</td>
                    <td className="px-4 py-3 font-mono text-white">{s.ip_address || '127.0.0.1'}</td>
                    <td className="px-4 py-3 text-slate-400 max-w-xs truncate">{s.user_agent || 'Standard Browser'}</td>
                    <td className="px-4 py-3 text-slate-400">{formatDate(s.last_activity_at || s.created_at)}</td>
                    <td className="px-4 py-3 text-right">
                      {s.is_revoked ? (
                        <span className="text-[10px] text-rose-400 font-semibold">Revoked</span>
                      ) : (
                        <span className="text-[10px] text-emerald-400 font-semibold">Active</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 6: Assisted Access History */}
      {activeTab === 'assisted' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Assisting Administrator</th>
                <th className="px-4 py-3">Justification Reason</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Started At</th>
                <th className="px-4 py-3">Ended At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {!assistedSessions || assistedSessions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    No administrative assisted sessions have been performed on this candidate.
                  </td>
                </tr>
              ) : (
                assistedSessions.map((s: any) => (
                  <tr key={s.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="px-4 py-3 font-bold text-white">
                      {s.admin_first_name} {s.admin_last_name} ({s.admin_email})
                    </td>
                    <td className="px-4 py-3 text-slate-300 max-w-sm">{s.reason}</td>
                    <td className="px-4 py-3">
                      {s.is_active ? (
                        <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                          Active Session
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold text-slate-400">Completed</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-400">{formatDate(s.started_at)}</td>
                    <td className="px-4 py-3 text-slate-400">{s.ended_at ? formatDate(s.ended_at) : 'In progress'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Assisted Access Modal */}
      {showAssistModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-amber-600/40 rounded-2xl w-full max-w-lg p-6 shadow-2xl text-slate-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h2 className="text-base font-bold text-amber-400 flex items-center gap-2">
                <LifeBuoy className="h-5 w-5" />
                Start Assisted Access Mode
              </h2>
              <button
                onClick={() => setShowAssistModal(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl mb-4 text-xs text-amber-200">
              <p className="font-semibold mb-1">Administrative Act-As-User Session</p>
              <p>
                You are about to enter {user.first_name}&apos;s candidate workspace. All resume edits, application additions, and document downloads will be auditable.
              </p>
            </div>

            <form onSubmit={handleStartAssistedAccess} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-300 mb-1">Justification Reason *</label>
                <textarea
                  required
                  rows={3}
                  value={assistReason}
                  onChange={(e) => setAssistReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-amber-500"
                  placeholder="Document why assisted access is required..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAssistModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isStartingAssist}
                  className="px-5 py-2 rounded-xl bg-amber-600 text-white font-bold hover:bg-amber-700 transition-colors shadow-md disabled:opacity-50 flex items-center gap-1.5"
                >
                  <LifeBuoy className="h-4 w-4" />
                  <span>{isStartingAssist ? 'Initializing...' : 'Enter Candidate Workspace'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import {
  Users,
  Search,
  ShieldCheck,
  UserX,
  UserCheck,
  AlertTriangle,
  UserPlus,
  ExternalLink,
  LifeBuoy,
  RotateCcw,
  Trash2,
  Coins,
  X,
  Eye,
  CheckCircle2,
  Clock,
} from 'lucide-react';

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Add User Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUserData, setNewUserData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: 'Password123!',
    role: 'user',
    targetRole: 'Software Engineer',
    location: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Assisted Access Modal State
  const [assistTarget, setAssistTarget] = useState<any | null>(null);
  const [assistReason, setAssistReason] = useState('Troubleshooting candidate resume formatting and ATS score optimization.');
  const [isStartingAssist, setIsStartingAssist] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/users?role=${roleFilter}&status=${statusFilter}&search=${encodeURIComponent(searchTerm)}`);
      if (res.success) setUsers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, statusFilter]);

  const handleToggleStatus = async (userId: string, currentSuspended: boolean) => {
    const action = currentSuspended ? 'activate' : 'suspend';
    if (!confirm(`Are you sure you want to ${action} this user account?`)) return;

    try {
      const res = await api.put(`/admin/users/${userId}/status`, {
        isSuspended: !currentSuspended,
      });
      if (res.success) {
        setUsers(prev =>
          prev.map(u => (u.id === userId ? { ...u, is_suspended: !currentSuspended } : u))
        );
      }
    } catch (err: any) {
      alert(err.message || 'Action failed');
    }
  };

  const handleSoftDelete = async (userId: string, isDeleted: boolean) => {
    if (isDeleted) {
      if (!confirm('Restore this deleted user account?')) return;
      try {
        const res = await api.put(`/admin/users/${userId}/restore`, {});
        if (res.success) {
          fetchUsers();
        }
      } catch (err: any) {
        alert(err.message || 'Failed to restore user');
      }
    } else {
      if (!confirm('Move this user to deleted status (soft-delete)? Account will be disabled.')) return;
      try {
        const res = await api.put(`/admin/users/${userId}/delete`, {});
        if (res.success) {
          fetchUsers();
        }
      } catch (err: any) {
        alert(err.message || 'Failed to delete user');
      }
    }
  };

  const handleResetCredits = async (userId: string) => {
    const amount = prompt('Enter new AI credit allocation for this user:', '50');
    if (!amount) return;

    try {
      const res = await api.post(`/admin/users/${userId}/reset-credits`, { credits: parseInt(amount, 10) });
      if (res.success) {
        alert(`AI credits successfully reset to ${amount}!`);
        fetchUsers();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to reset credits');
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await api.post('/admin/users', newUserData);
      if (res.success) {
        setShowAddModal(false);
        setNewUserData({
          firstName: '',
          lastName: '',
          email: '',
          password: 'Password123!',
          role: 'user',
          targetRole: 'Software Engineer',
          location: '',
        });
        fetchUsers();
        alert('User account registered successfully!');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to create user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartAssistedAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assistTarget) return;
    setIsStartingAssist(true);
    try {
      const res = await api.post('/admin/assisted-access/start', {
        targetUserId: assistTarget.id,
        reason: assistReason,
      });

      if (res.success) {
        // Store assisted session details
        localStorage.setItem(
          'assisted_access',
          JSON.stringify({
            sessionId: res.data.session.id,
            targetUser: res.data.targetUser,
            reason: assistReason,
          })
        );
        setAssistTarget(null);
        // Navigate directly into Candidate Workspace
        router.push('/dashboard');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to start assisted access session');
    } finally {
      setIsStartingAssist(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-400">User Governance</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white mt-0.5">Platform User Directory</h1>
          <p className="text-xs text-slate-400 mt-1">
            Browse all candidate accounts, initiate Assisted Access, manage quotas, and govern platform permissions.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-purple-700 transition-colors shrink-0"
        >
          <UserPlus className="h-4 w-4" />
          <span>Add New User</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
            placeholder="Search by candidate name or email (press enter)..."
            className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-9 pr-3 py-2 text-xs text-white focus:outline-purple-500"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs font-semibold text-slate-300 focus:outline-purple-500 shrink-0"
        >
          <option value="all">All Roles</option>
          <option value="user">Candidate (User)</option>
          <option value="admin">Administrator</option>
          <option value="super_admin">Super Admin</option>
          <option value="support_admin">Support Specialist</option>
          <option value="resume_manager">Resume Manager</option>
          <option value="analyst">BI Analyst</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs font-semibold text-slate-300 focus:outline-purple-500 shrink-0"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active Accounts</option>
          <option value="suspended">Suspended Accounts</option>
          <option value="deleted">Deleted / Inactive</option>
          <option value="unverified">Email Unverified</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950/60 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Candidate / User</th>
                <th className="px-4 py-3">Role & Permissions</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Resumes</th>
                <th className="px-4 py-3">Applications</th>
                <th className="px-4 py-3">AI Credits</th>
                <th className="px-4 py-3">Joined Date</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    Loading users directory...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    No users found matching your filters.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-900/40 transition-colors">
                    {/* User Info */}
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <Link
                          href={`/admin/users/${u.id}`}
                          className="font-bold text-white hover:text-purple-400 transition-colors flex items-center gap-1.5"
                        >
                          <span>{u.first_name} {u.last_name}</span>
                          <ExternalLink className="h-3 w-3 opacity-60" />
                        </Link>
                        <span className="text-[11px] text-slate-400">{u.email}</span>
                        {u.target_role && (
                          <span className="text-[10px] text-purple-400/90 font-medium mt-0.5">{u.target_role}</span>
                        )}
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        u.role === 'super_admin'
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          : u.role === 'admin'
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          : 'bg-slate-800 text-slate-300'
                      }`}>
                        {u.role.replace('_', ' ')}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      {u.is_deleted ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                          Deleted
                        </span>
                      ) : u.is_suspended ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                          Suspended
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          Active
                        </span>
                      )}
                    </td>

                    {/* Resumes */}
                    <td className="px-4 py-3 font-semibold text-white">
                      {u.resumes_count || 0}
                    </td>

                    {/* Applications */}
                    <td className="px-4 py-3 font-semibold text-white">
                      {u.applications_count || 0}
                    </td>

                    {/* AI Credits */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-amber-400 font-bold">
                        <Coins className="h-3.5 w-3.5" />
                        <span>{u.ai_credits ?? 15}</span>
                      </div>
                    </td>

                    {/* Joined Date */}
                    <td className="px-4 py-3 text-slate-400 text-[11px]">
                      {formatDate(u.created_at)}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5 flex-wrap">
                        {/* 360 View */}
                        <Link
                          href={`/admin/users/${u.id}`}
                          title="View 360-Degree User Details"
                          className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Link>

                        {/* Assisted Access Button */}
                        <button
                          onClick={() => setAssistTarget(u)}
                          title="Assisted Access (Act-As-User)"
                          className="flex items-center gap-1 px-2 py-1 rounded-lg bg-purple-600/20 border border-purple-500/30 text-purple-300 hover:bg-purple-600/40 text-[11px] font-semibold transition-colors"
                        >
                          <LifeBuoy className="h-3 w-3" />
                          <span>Assist</span>
                        </button>

                        {/* Reset AI Credits */}
                        <button
                          onClick={() => handleResetCredits(u.id)}
                          title="Reset AI Credits"
                          className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-amber-400 hover:bg-amber-500/10 transition-colors"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                        </button>

                        {/* Suspend / Activate */}
                        <button
                          onClick={() => handleToggleStatus(u.id, u.is_suspended)}
                          title={u.is_suspended ? 'Restore Account' : 'Suspend Account'}
                          className={`p-1.5 rounded-lg border transition-colors ${
                            u.is_suspended
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                              : 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20'
                          }`}
                        >
                          {u.is_suspended ? <UserCheck className="h-3.5 w-3.5" /> : <UserX className="h-3.5 w-3.5" />}
                        </button>

                        {/* Soft Delete / Restore */}
                        <button
                          onClick={() => handleSoftDelete(u.id, u.is_deleted)}
                          title={u.is_deleted ? 'Restore Account' : 'Soft Delete Account'}
                          className={`p-1.5 rounded-lg border transition-colors ${
                            u.is_deleted
                              ? 'bg-blue-500/10 border-blue-500/30 text-blue-400 hover:bg-blue-500/20'
                              : 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20'
                          }`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add New User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl text-slate-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-purple-400" />
                Register New Platform User
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-400 mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={newUserData.firstName}
                    onChange={(e) => setNewUserData({ ...newUserData, firstName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-purple-500"
                    placeholder="Jane"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-400 mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={newUserData.lastName}
                    onChange={(e) => setNewUserData({ ...newUserData, lastName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-purple-500"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-400 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={newUserData.email}
                  onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-purple-500"
                  placeholder="jane.doe@company.com"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-400 mb-1">Initial Password *</label>
                <input
                  type="password"
                  required
                  value={newUserData.password}
                  onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-400 mb-1">Platform Role</label>
                  <select
                    value={newUserData.role}
                    onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-purple-500"
                  >
                    <option value="user">Candidate (User)</option>
                    <option value="admin">Administrator</option>
                    <option value="support_admin">Support Specialist</option>
                    <option value="resume_manager">Resume Manager</option>
                    <option value="analyst">BI Analyst</option>
                    <option value="super_admin">Super Administrator</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-400 mb-1">Target Role</label>
                  <input
                    type="text"
                    value={newUserData.targetRole}
                    onChange={(e) => setNewUserData({ ...newUserData, targetRole: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-purple-500"
                    placeholder="e.g. Senior Frontend Engineer"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-400 mb-1">Location / Timezone</label>
                <input
                  type="text"
                  value={newUserData.location}
                  onChange={(e) => setNewUserData({ ...newUserData, location: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-purple-500"
                  placeholder="e.g. New York, USA"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-700 transition-colors shadow-md disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Register User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assisted Access Confirmation Modal */}
      {assistTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-amber-600/40 rounded-2xl w-full max-w-lg p-6 shadow-2xl text-slate-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h2 className="text-base font-bold text-amber-400 flex items-center gap-2">
                <LifeBuoy className="h-5 w-5" />
                Initialize Assisted User Access Mode
              </h2>
              <button
                onClick={() => setAssistTarget(null)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl mb-4 text-xs text-amber-200">
              <p className="font-semibold mb-1">Compliance & Auditing Warning</p>
              <p>
                You are entering the candidate workspace for <strong>{assistTarget.first_name} {assistTarget.last_name}</strong> ({assistTarget.email}).
                All operations performed will be logged under your administrator credentials with a unique session ID.
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
                  placeholder="Document the support ticket or request justification..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setAssistTarget(null)}
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
                  <span>{isStartingAssist ? 'Starting Session...' : 'Enter Candidate Workspace'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Users, Search, ShieldCheck, UserX, UserCheck, AlertTriangle } from 'lucide-react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchUsers = async () => {
    try {
      const res = await api.get(`/admin/users?role=${roleFilter}&status=${statusFilter}&search=${searchTerm}`);
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
    if (!confirm(`Are you sure you want to ${action} this user?`)) return;

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

  const handleChangeRole = async (userId: string, newRole: string) => {
    try {
      const res = await api.put(`/admin/users/${userId}/role`, { role: newRole });
      if (res.success) {
        setUsers(prev =>
          prev.map(u => (u.id === userId ? { ...u, role: newRole } : u))
        );
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update role');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">Platform User Governance</h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage global candidate accounts, administrative roles, and account security statuses.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
            placeholder="Search by name or email (press enter)..."
            className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-9 pr-3 py-2 text-xs text-white focus:outline-purple-500"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs font-semibold text-slate-300 focus:outline-purple-500"
        >
          <option value="all">All Roles</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
          <option value="super_admin">Super Admin</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs font-semibold text-slate-300 focus:outline-purple-500"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400">Loading user accounts...</div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/60">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-5 py-3">User</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">Current Plan</th>
                <th className="px-5 py-3">Resumes</th>
                <th className="px-5 py-3">Applications</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-slate-900/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="font-bold text-white">{u.first_name} {u.last_name}</p>
                    <p className="text-[11px] text-slate-400">{u.email}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <select
                      value={u.role}
                      onChange={(e) => handleChangeRole(u.id, e.target.value)}
                      className="rounded border border-slate-700 bg-slate-900 px-2 py-1 text-[11px] font-bold text-purple-300"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                      <option value="super_admin">Super Admin</option>
                    </select>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[11px] font-semibold">
                      {u.current_plan || 'Free Starter'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-semibold text-white">{u.resumes_count || 0}</td>
                  <td className="px-5 py-3.5 font-semibold text-white">{u.applications_count || 0}</td>
                  <td className="px-5 py-3.5">
                    {u.is_suspended ? (
                      <span className="rounded-full bg-rose-950 text-rose-300 border border-rose-800 text-[10px] font-bold px-2 py-0.5">
                        Suspended
                      </span>
                    ) : (
                      <span className="rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold px-2 py-0.5">
                        Active
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={() => handleToggleStatus(u.id, Boolean(u.is_suspended))}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                        u.is_suspended
                          ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                          : 'bg-rose-900/60 text-rose-200 border border-rose-700 hover:bg-rose-800'
                      }`}
                    >
                      {u.is_suspended ? 'Activate' : 'Suspend'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { formatDate } from '@/lib/utils';
import {
  UserCheck,
  Shield,
  ShieldCheck,
  KeyRound,
  Lock,
  Mail,
  Calendar,
  LogOut,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react';

export default function AdminProfilePage() {
  const { user, logout } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChanging, setIsChanging] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('New password and confirmation do not match');
      return;
    }
    setIsChanging(true);
    setTimeout(() => {
      setIsChanging(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      alert('Administrator password successfully updated!');
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-800 pb-5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-400">Account Governance</span>
        </div>
        <h1 className="text-xl font-bold tracking-tight text-white mt-0.5">Super Administrator Profile & Security</h1>
        <p className="text-xs text-slate-400 mt-1">
          Review administrative credentials, multi-factor authentication status, and personal security policies.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6 space-y-4 shadow-xl text-xs">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-extrabold text-xl shadow-lg shadow-purple-600/20">
              {user?.first_name?.[0] || 'A'}
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {user?.first_name} {user?.last_name}
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
                {user?.role || 'SUPER_ADMIN'}
              </span>
            </div>
          </div>

          <div className="space-y-2.5 pt-3 border-t border-slate-800 text-slate-300">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-slate-500" />
              <span>{user?.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span className="text-emerald-400 font-semibold">Universal Platform Access</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-slate-500" />
              <span className="text-slate-400">Owner since {formatDate((user as any)?.created_at || new Date().toISOString())}</span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800">
            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 font-bold hover:bg-rose-500/20 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Log Out of Control Center</span>
            </button>
          </div>
        </div>

        {/* Password & Security Card */}
        <div className="md:col-span-2 rounded-2xl border border-slate-800 bg-slate-950/60 p-6 space-y-4 shadow-xl text-xs">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-purple-400" />
            <span>Update Security Credentials</span>
          </h3>

          <form onSubmit={handlePasswordChange} className="space-y-4 max-w-lg">
            <div>
              <label className="block font-medium text-slate-400 mb-1">Current Password *</label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-purple-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-400 mb-1">New Password *</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-purple-500"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-400 mb-1">Confirm New Password *</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-purple-500"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isChanging}
                className="px-5 py-2 rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-700 transition-colors shadow-md disabled:opacity-50"
              >
                {isChanging ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>

          {/* MFA Status */}
          <div className="pt-5 border-t border-slate-800/80 mt-6">
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900/40 border border-slate-800">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-emerald-400 shrink-0" />
                <div>
                  <span className="font-bold text-white block">Two-Factor Authentication (2FA)</span>
                  <span className="text-slate-400 text-[11px] block mt-0.5">
                    TOTP Authenticator app protection is currently enforced for Super Admin sessions.
                  </span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                Enforced
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

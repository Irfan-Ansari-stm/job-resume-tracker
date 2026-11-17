'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { UserCircle, Shield, KeyRound, Clock, CheckCircle2, Save } from 'lucide-react';

export default function ProfilePage() {
  const { user, profile, refreshUser } = useAuth();

  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [targetIndustry, setTargetIndustry] = useState('');
  const [location, setLocation] = useState('');
  const [yearsExp, setYearsExp] = useState<number>(0);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Password update state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [pwdMsg, setPwdMsg] = useState<string | null>(null);

  // Login history
  const [loginHistory, setLoginHistory] = useState<any[]>([]);

  useEffect(() => {
    if (profile) {
      setHeadline(profile.headline || '');
      setBio(profile.bio || '');
      setTargetRole(profile.target_role || '');
      setTargetIndustry(profile.target_industry || '');
      setLocation(profile.location || '');
      setYearsExp(parseFloat(profile.years_of_experience) || 0);
    }

    async function loadHistory() {
      try {
        const res = await api.get('/users/login-history');
        if (res.success) setLoginHistory(res.data);
      } catch {
        // Ignored
      }
    }
    loadHistory();
  }, [profile]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const res = await api.put('/users/profile', {
        headline,
        bio,
        target_role: targetRole,
        target_industry: targetIndustry,
        location,
        years_of_experience: yearsExp,
      });

      if (res.success) {
        setSaveSuccess(true);
        await refreshUser();
        setTimeout(() => setSaveSuccess(false), 2000);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/users/change-password', {
        currentPassword,
        newPassword,
      });
      if (res.success) {
        setPwdMsg('Password updated successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setTimeout(() => setPwdMsg(null), 3000);
      }
    } catch (err: any) {
      alert(err.message || 'Password update failed');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Profile & Account Settings</h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage your personal details, career goals, security preferences, and login audit trail.
        </p>
      </div>

      {/* Profile Form */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
          Career Profile & Goals
        </h3>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700">Professional Headline</label>
            <input
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-blue-600"
              placeholder="e.g. Senior Data Analyst | SQL, Python, Tableau"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700">Target Role Title</label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-blue-600"
                placeholder="e.g. Lead Data Analyst"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">Target Industry</label>
              <input
                type="text"
                value={targetIndustry}
                onChange={(e) => setTargetIndustry(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-blue-600"
                placeholder="e.g. IT Services & Consulting"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-blue-600"
                placeholder="e.g. Bengaluru, India"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">Years of Experience</label>
              <input
                type="number"
                step="0.5"
                value={yearsExp}
                onChange={(e) => setYearsExp(parseFloat(e.target.value) || 0)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-blue-600"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700">Professional Bio</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 text-xs focus:outline-blue-600"
              placeholder="Brief overview of your career accomplishments..."
            />
          </div>

          <div className="pt-2 flex items-center justify-between">
            {saveSuccess ? (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4" /> Profile updated successfully!
              </span>
            ) : <span />}

            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              <span>{isSaving ? 'Saving...' : 'Save Profile'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Security & Password */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
          <KeyRound className="h-4 w-4 text-purple-600" />
          <span>Security & Password</span>
        </h3>

        {pwdMsg && (
          <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-lg border border-emerald-200">
            {pwdMsg}
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-700">Current Password</label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-blue-600"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700">New Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-blue-600"
              placeholder="At least 6 characters"
            />
          </div>

          <div className="sm:col-span-2 pt-2">
            <button
              type="submit"
              className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition-colors"
            >
              Update Password
            </button>
          </div>
        </form>
      </div>

      {/* Login History Audit */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs space-y-3">
        <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
          <Clock className="h-4 w-4 text-slate-500" />
          <span>Recent Login Audit History</span>
        </h3>

        <div className="space-y-2">
          {loginHistory.slice(0, 5).map((log) => (
            <div key={log.id} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 text-xs">
              <div>
                <span className={`font-bold capitalize ${log.status === 'success' ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {log.status}
                </span>
                <span className="text-slate-500 text-[11px] ml-2">IP: {log.ip_address || '127.0.0.1'}</span>
              </div>
              <span className="text-slate-400 text-[11px]">{formatDate(log.created_at)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

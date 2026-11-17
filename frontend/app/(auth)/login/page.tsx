'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Sparkles, ArrowRight, ShieldCheck, AlertCircle, UserCheck } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('aarav.patel@example.com');
  const [password, setPassword] = useState('Password123!');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await login(email, password);
      if (res?.user?.role === 'super_admin' || res?.user?.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Password123!');
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-slate-900 text-center">Sign in to your account</h2>
      <p className="mt-1 text-xs text-slate-500 text-center">
        Access your AI resume versions and application pipeline
      </p>

      {error && (
        <div className="mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700">Email Address</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-blue-600"
            placeholder="name@example.com"
          />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-slate-700">Password</label>
            <Link href="/forgot-password" className="text-[11px] font-semibold text-blue-600 hover:underline">
              Forgot password?
            </Link>
          </div>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-blue-600"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {loading ? 'Authenticating...' : 'Sign In'}
        </button>
      </form>

      {/* Fast Demo Credentials Picker */}
      <div className="mt-6 pt-5 border-t border-slate-200">
        <p className="text-[11px] font-bold text-slate-700 mb-2 flex items-center gap-1.5">
          <UserCheck className="h-3.5 w-3.5 text-blue-600" />
          <span>Quick 1-Click Demo Profiles (Seeded):</span>
        </p>
        <div className="grid grid-cols-2 gap-1.5 text-[11px]">
          <button
            type="button"
            onClick={() => handleQuickLogin('superadmin@smartresume.ai')}
            className="p-1.5 text-left rounded bg-purple-50 text-purple-800 border border-purple-200 hover:bg-purple-100 font-medium truncate"
          >
            👑 Super Admin
          </button>
          <button
            type="button"
            onClick={() => handleQuickLogin('aarav.patel@example.com')}
            className="p-1.5 text-left rounded bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100 font-medium truncate"
          >
            📊 Data Analyst (Aarav)
          </button>
          <button
            type="button"
            onClick={() => handleQuickLogin('rohan.verma@example.com')}
            className="p-1.5 text-left rounded bg-slate-100 text-slate-800 border border-slate-200 hover:bg-slate-200 font-medium truncate"
          >
            💻 Software Dev (Rohan)
          </button>
          <button
            type="button"
            onClick={() => handleQuickLogin('vikram.singh@example.com')}
            className="p-1.5 text-left rounded bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 font-medium truncate"
          >
            🎓 Fresh Grad (Vikram)
          </button>
        </div>
      </div>

      <div className="mt-6 text-center text-xs text-slate-500">
        Don't have an account?{' '}
        <Link href="/register" className="font-semibold text-blue-600 hover:underline">
          Create account
        </Link>
      </div>
    </div>
  );
}

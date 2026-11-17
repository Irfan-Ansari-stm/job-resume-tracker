'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-slate-900 text-center">Reset Password</h2>
      <p className="mt-1 text-xs text-slate-500 text-center">
        Enter your account email to receive a password recovery link
      </p>

      {sent ? (
        <div className="py-6 text-center space-y-3">
          <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
          <p className="text-xs text-slate-700">
            If an account exists for <strong>{email}</strong>, a password reset link has been dispatched.
          </p>
          <div className="pt-2">
            <Link href="/login" className="text-xs font-semibold text-blue-600 hover:underline">
              Return to Login
            </Link>
          </div>
        </div>
      ) : (
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

          <button
            type="submit"
            className="w-full flex items-center justify-center rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-700 transition-colors"
          >
            Send Reset Instructions
          </button>

          <div className="text-center pt-2">
            <Link href="/login" className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-blue-600">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Login
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}

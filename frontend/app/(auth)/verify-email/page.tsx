import React from 'react';
import Link from 'next/link';
import { MailCheck } from 'lucide-react';

export default function VerifyEmailPage() {
  return (
    <div className="py-4 text-center space-y-4">
      <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
        <MailCheck className="h-6 w-6" />
      </div>
      <h2 className="text-xl font-bold text-slate-900">Email Verified</h2>
      <p className="text-xs text-slate-600 max-w-xs mx-auto leading-relaxed">
        Your email address has been verified. You now have full access to AI resume studio, versioning, and application tracking.
      </p>
      <div className="pt-2">
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-700 transition-colors"
        >
          Enter Dashboard
        </Link>
      </div>
    </div>
  );
}

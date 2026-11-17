import React from 'react';

export default function TermsPage() {
  return (
    <div className="py-16 bg-white min-h-screen">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-6">Terms and Conditions</h1>
        <div className="prose prose-slate text-xs leading-relaxed space-y-4 text-slate-600">
          <p>Last updated: November 2026</p>
          <p>
            Welcome to SmartResume.ai. By accessing or using our website, user dashboard, or AI services, you agree to comply with and be bound by these Terms and Conditions.
          </p>
          <h2 className="text-sm font-bold text-slate-900 pt-4">1. Ethical AI Use & Candidate Truthfulness</h2>
          <p>
            SmartResume.ai is designed to assist candidates in tailoring genuine qualifications. You agree to provide factual and accurate employment and educational information. We explicitly disclaim and prohibit using our platform to generate fraudulent academic or employment credentials.
          </p>
          <h2 className="text-sm font-bold text-slate-900 pt-4">2. ATS Matching Disclaimer</h2>
          <p>
            Match scores and ATS compatibility ratings provided by SmartResume are algorithmic estimates based on keyword frequency and industry criteria. They do not constitute a guarantee of interview invitations or employment offers from external employers.
          </p>
          <h2 className="text-sm font-bold text-slate-900 pt-4">3. Subscriptions and Payments</h2>
          <p>
            Paid subscriptions (Pro and Premium) renew automatically on a monthly or annual basis unless cancelled prior to the renewal date. All transactions are processed through encrypted payment gateways.
          </p>
        </div>
      </div>
    </div>
  );
}

import React from 'react';

export default function PrivacyPage() {
  return (
    <div className="py-16 bg-white min-h-screen">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-6">Privacy Policy</h1>
        <div className="prose prose-slate text-xs leading-relaxed space-y-4 text-slate-600">
          <p>Last updated: November 2026</p>
          <p>
            At SmartResume.ai, we recognize that resumes contain highly confidential and sensitive personal information. This Privacy Policy details how we collect, protect, process, and respect your data.
          </p>
          <h2 className="text-sm font-bold text-slate-900 pt-4">1. Data Ownership & Private Storage</h2>
          <p>
            You own 100% of your resumes, profile documents, and personal information. All uploaded documents are held in encrypted, private cloud storage and accessed strictly through signed, time-limited authorizations. Users cannot access any other user's resumes or documents.
          </p>
          <h2 className="text-sm font-bold text-slate-900 pt-4">2. AI Processing Transparency</h2>
          <p>
            We process resume content through enterprise AI endpoints strictly for the purpose of customization, keyword matching, and document formatting requested by you. We do not use your private resume content to train public AI foundation models.
          </p>
          <h2 className="text-sm font-bold text-slate-900 pt-4">3. Data Deletion & Export</h2>
          <p>
            You have the right to request the complete deletion of your account, resumes, and version history at any time through your Profile & Account settings.
          </p>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { HelpCircle, Send, CheckCircle2, BookOpen, MessageSquare } from 'lucide-react';

export default function HelpPage() {
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('Resume Tailoring');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Help Center & Support</h1>
        <p className="text-xs text-slate-500 mt-1">
          Access platform documentation, user guides, or submit a support ticket to our technical specialists.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-2">
          <BookOpen className="h-5 w-5 text-blue-600" />
          <h3 className="text-xs font-bold text-slate-900">User Guides</h3>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Detailed walkthroughs on deterministic document parsing, prompt tuning, and version locking.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-2">
          <MessageSquare className="h-5 w-5 text-purple-600" />
          <h3 className="text-xs font-bold text-slate-900">Interview Coach FAQ</h3>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Tips on using AI STAR talking points to structure behavioral interview answers effectively.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-2">
          <HelpCircle className="h-5 w-5 text-emerald-600" />
          <h3 className="text-xs font-bold text-slate-900">ATS Accuracy</h3>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Understanding keyword density algorithms and skills gap reports without qualification fabrication.
          </p>
        </div>
      </div>

      {/* Support Ticket Submission */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
          Submit Support Ticket
        </h3>

        {submitted ? (
          <div className="py-8 text-center space-y-2">
            <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
            <h4 className="text-sm font-bold text-slate-900">Support Ticket Created</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Ticket #SR-{Math.floor(Math.random() * 80000 + 10000)} has been logged. Our support team will reply via your account email.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700">Subject</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-blue-600"
                  placeholder="e.g. Question regarding PDF parsing layout"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-blue-600"
                >
                  <option value="Resume Tailoring">Resume Customization & AI</option>
                  <option value="Document Parsing">Document Upload & Parsing</option>
                  <option value="Billing">Billing & Subscription</option>
                  <option value="Account">Account Security</option>
                  <option value="Feedback">Feedback / Feature Request</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Describe the Issue or Inquiry</label>
              <textarea
                rows={4}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-700 focus:outline-blue-600"
                placeholder="Include details about any unexpected behavior or question..."
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-700 transition-colors"
              >
                <Send className="h-4 w-4" />
                <span>Submit Ticket</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

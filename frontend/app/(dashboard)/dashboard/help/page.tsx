'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import {
  HelpCircle,
  Send,
  CheckCircle2,
  BookOpen,
  MessageSquare,
  Clock,
  AlertCircle,
  Tag,
  ChevronDown,
  ChevronUp,
  Plus,
  RefreshCw,
} from 'lucide-react';

export default function HelpPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewTicketForm, setShowNewTicketForm] = useState(false);

  // New ticket state
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('Resume Customization & AI');
  const [priority, setPriority] = useState('medium');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Active FAQ accordion state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const fetchTickets = async () => {
    try {
      const res = await api.get('/support/tickets');
      if (res.success) {
        setTickets(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch support tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !message) return;

    setIsSubmitting(true);
    setSubmitSuccess(false);

    try {
      const res = await api.post('/support/tickets', {
        subject,
        message,
        category,
        priority,
      });

      if (res.success) {
        setSubmitSuccess(true);
        setSubject('');
        setMessage('');
        setShowNewTicketForm(false);
        await fetchTickets();
        setTimeout(() => setSubmitSuccess(false), 4000);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to submit ticket');
    } finally {
      setIsSubmitting(false);
    }
  };

  const faqs = [
    {
      q: 'How does the AI Resume Customizer preserve my factual career history?',
      a: 'Our AI engine uses strict prompt constraints and structured verification. It tailors how your genuine skills, projects, and work achievements align with a target job description without fabricating unearned credentials, degrees, or imaginary employers.'
    },
    {
      q: 'What is an Immutable Resume Version Snapshot?',
      a: 'Whenever you tailor a resume or submit an application, SmartResume creates a permanently locked snapshot of that exact document state. Even if you edit your master resume later, your submitted version remains intact exactly as sent to the employer.'
    },
    {
      q: 'What file types can I upload to the Document Vault and Resume Parser?',
      a: 'We support PDF, DOCX, DOC, and plain text (.txt) documents up to 15MB. All files are encrypted and stored securely with private signed download links.'
    },
    {
      q: 'How do AI Credits work across subscription tiers?',
      a: 'Every AI customization or deep keyword analysis uses credits from your monthly wallet balance. Free plans include 15 credits/month, Pro plans include 100 credits/month, and Executive plans include 350 credits/month.'
    }
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Help Center & Support</h1>
          <p className="text-xs text-slate-500 mt-1">
            Access platform documentation, frequently asked questions, or log a ticket directly with our technical engineering team.
          </p>
        </div>
        <button
          onClick={() => setShowNewTicketForm(!showNewTicketForm)}
          className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>{showNewTicketForm ? 'Close Form' : 'Create Ticket'}</span>
        </button>
      </div>

      {submitSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>Support ticket successfully submitted! Our support team will review and reply within 24 hours.</span>
        </div>
      )}

      {/* Resource Highlights */}
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

      {/* Support Ticket Submission Form */}
      {showNewTicketForm && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Log a Support Ticket</h3>
              <p className="text-xs text-slate-500">Every ticket is recorded in the PostgreSQL database and auditable.</p>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
              Priority Routing
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-slate-700">Subject *</label>
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
                  <option value="Resume Customization & AI">Resume Customization & AI</option>
                  <option value="Document Parsing">Document Upload & Parsing</option>
                  <option value="Billing">Billing & Subscription</option>
                  <option value="Account">Account Security</option>
                  <option value="Feedback">Feedback / Feature Request</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Detailed Message *</label>
              <textarea
                rows={4}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-700 focus:outline-blue-600"
                placeholder="Include details about any unexpected behavior or question..."
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowNewTicketForm(false)}
                className="rounded-lg px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                <span>{isSubmitting ? 'Submitting...' : 'Submit Ticket'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Ticket History Section */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-slate-900">Your Support Ticket History</h3>
          <span className="text-xs text-slate-500 font-semibold">{tickets.length} total tickets</span>
        </div>

        {loading ? (
          <div className="py-8 text-center text-xs text-slate-400">Loading tickets...</div>
        ) : tickets.length === 0 ? (
          <div className="py-8 text-center space-y-2">
            <CheckCircle2 className="h-8 w-8 text-slate-300 mx-auto" />
            <p className="text-xs text-slate-500">You currently have no support tickets logged.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tickets.map((t) => (
              <div
                key={t.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 block mb-0.5">#{t.id.slice(0, 8)}</span>
                    <h4 className="text-xs font-bold text-slate-900">{t.subject}</h4>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                    t.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' :
                    t.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {t.status.replace('_', ' ')}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{t.message}</p>

                {t.admin_response && (
                  <div className="mt-2 p-3 rounded-lg bg-blue-50/80 border border-blue-200 text-xs text-blue-900 space-y-1">
                    <p className="font-bold flex items-center gap-1 text-[11px] text-blue-700">
                      <span>Official Support Response:</span>
                    </p>
                    <p className="leading-relaxed">{t.admin_response}</p>
                  </div>
                )}

                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-200/60">
                  <span className="flex items-center gap-1">
                    <Tag className="h-3 w-3" /> {t.category}
                  </span>
                  <span>Logged {formatDate(t.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Frequently Asked Questions Accordion */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
          Frequently Asked Questions
        </h3>

        <div className="space-y-2">
          {faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-xl border border-slate-200 overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-3.5 text-left text-xs font-bold text-slate-800 hover:bg-slate-50 transition-colors"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4 text-slate-400 shrink-0" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-3.5 pb-3.5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/40">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

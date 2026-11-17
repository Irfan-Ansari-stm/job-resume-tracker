'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import {
  CalendarDays,
  Plus,
  Clock,
  Sparkles,
  ExternalLink,
  CheckCircle,
  Video,
  Phone,
  UserCheck,
  Building2,
  X,
  Trash2,
} from 'lucide-react';

export default function InterviewsPage() {
  const [interviews, setInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState<any | null>(null);

  // New Interview Form
  const [companyName, setCompanyName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [interviewType, setInterviewType] = useState('video');
  const [interviewRound, setInterviewRound] = useState('Round 1: Screening');
  const [scheduledAt, setScheduledAt] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [locationOrUrl, setLocationOrUrl] = useState('');
  const [interviewerName, setInterviewerName] = useState('');
  const [preparationNotes, setPreparationNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchInterviews = async () => {
    try {
      const res = await api.get('/interviews');
      if (res.success) setInterviews(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await api.post('/interviews', {
        companyName,
        jobTitle,
        interviewType,
        interviewRound,
        scheduledAt,
        durationMinutes,
        locationOrUrl,
        interviewerName,
        preparationNotes,
      });

      if (res.success) {
        setShowAddModal(false);
        setCompanyName('');
        setJobTitle('');
        setLocationOrUrl('');
        setPreparationNotes('');
        await fetchInterviews();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to schedule interview');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this interview record?')) return;
    try {
      await api.delete(`/interviews/${id}`);
      setInterviews(prev => prev.filter(i => i.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Interview Management & AI Prep</h1>
          <p className="text-xs text-slate-500 mt-1">
            Track interview rounds, meeting links, and generate AI-powered STAR behavioral talking points.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Schedule Interview</span>
        </button>
      </div>

      {loading ? (
        <div className="py-16 text-center text-xs text-slate-500">Loading interview schedule...</div>
      ) : interviews.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-12 text-center">
          <CalendarDays className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-900">No interviews scheduled yet</h3>
          <p className="text-xs text-slate-500 mt-1">When an employer invites you for a round, schedule it here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {interviews.map(item => (
            <div
              key={item.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs hover:shadow-xs transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
                    {item.company_name}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900">{item.job_title}</h3>
                  <span className="text-[10px] font-bold uppercase bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
                    {item.interview_round}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
                  <span className="flex items-center gap-1 font-semibold text-slate-800">
                    <Clock className="h-3.5 w-3.5 text-purple-600" />
                    {formatDate(item.scheduled_at)} ({item.duration_minutes || 45} mins)
                  </span>
                  {item.interviewer_name && (
                    <span className="text-slate-500">
                      Interviewer: <strong>{item.interviewer_name}</strong>
                    </span>
                  )}
                </div>

                {item.preparation_notes && (
                  <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200 mt-2">
                    {item.preparation_notes}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                {item.location_or_url && (
                  <a
                    href={item.location_or_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700 transition-colors shadow-2xs"
                  >
                    <span>Join Meeting</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
                <button
                  onClick={() => setSelectedInterview(item)}
                  className="flex items-center gap-1 rounded-lg border border-purple-200 bg-purple-50 px-3 py-1.5 text-xs font-bold text-purple-700 hover:bg-purple-100 transition-colors"
                >
                  <Sparkles className="h-3.5 w-3.5 text-purple-600" />
                  <span>AI Prep Coach</span>
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SCHEDULE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-sm font-bold text-slate-900">Schedule Interview Milestone</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Company</label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-blue-600"
                    placeholder="e.g. Infosys"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Job Title</label>
                  <input
                    type="text"
                    required
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-blue-600"
                    placeholder="e.g. Lead Analytics Specialist"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Interview Type</label>
                  <select
                    value={interviewType}
                    onChange={(e) => setInterviewType(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-blue-600"
                  >
                    <option value="video">Video (Teams / Zoom / Meet)</option>
                    <option value="phone">Phone Screening</option>
                    <option value="technical">Technical Coding / System Design</option>
                    <option value="behavioral">Behavioral / Leadership</option>
                    <option value="hr">HR Round</option>
                    <option value="in_person">In-Person Onsite</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Round Label</label>
                  <input
                    type="text"
                    value={interviewRound}
                    onChange={(e) => setInterviewRound(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-blue-600"
                    placeholder="Round 2: Technical Deep Dive"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Date & Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-blue-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Duration (Minutes)</label>
                  <input
                    type="number"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(parseInt(e.target.value, 10))}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Meeting URL / Location</label>
                <input
                  type="url"
                  value={locationOrUrl}
                  onChange={(e) => setLocationOrUrl(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-blue-600"
                  placeholder="https://meet.google.com/xyz-abc"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Interviewer Name / Title</label>
                <input
                  type="text"
                  value={interviewerName}
                  onChange={(e) => setInterviewerName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-blue-600"
                  placeholder="Ramesh Sundaram (Principal Architect)"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Preparation Focus Notes</label>
                <textarea
                  rows={2}
                  value={preparationNotes}
                  onChange={(e) => setPreparationNotes(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs focus:outline-blue-600"
                  placeholder="Key topics to review before the call..."
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Interview'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI PREP COACH MODAL */}
      {selectedInterview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-purple-600">AI Preparation Coach</span>
                <h3 className="text-sm font-bold text-slate-900">
                  {selectedInterview.company_name} - {selectedInterview.job_title}
                </h3>
              </div>
              <button onClick={() => setSelectedInterview(null)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-700">
              <div className="p-4 rounded-xl bg-purple-50 border border-purple-200">
                <h4 className="font-bold text-purple-900 mb-2">Key Strengths to Highlight (STAR Method)</h4>
                <ul className="space-y-1.5 text-[11px] text-purple-800">
                  <li>• Reference your PostgreSQL query tuning and 42% query execution speedup.</li>
                  <li>• Emphasize cross-functional leadership on Tableau executive dashboards.</li>
                  <li>• Frame past project challenges with measurable financial outcomes ($340K cost savings).</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                <h4 className="font-bold text-blue-900 mb-2">Anticipated Technical & Behavioral Questions</h4>
                <div className="space-y-2 text-[11px] text-slate-800">
                  <div>
                    <p className="font-semibold text-slate-900">Q: "How do you handle ambiguous requirements when building dashboards for senior stakeholders?"</p>
                    <p className="text-slate-600 mt-0.5">Talking Point: Outline your rapid prototyping cycle and weekly alignment check-ins.</p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Q: "Walk us through an index optimization on a multi-million row table."</p>
                    <p className="text-slate-600 mt-0.5">Talking Point: Explain EXPLAIN ANALYZE, composite indexes, and query refactoring.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedInterview(null)}
                className="rounded-lg bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200"
              >
                Close Coach
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

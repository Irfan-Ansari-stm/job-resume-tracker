import React from 'react';
import Link from 'next/link';
import { Sparkles, GitBranch, ShieldCheck, CheckCircle2, Layers, Cpu, Database, Bell, ArrowRight } from 'lucide-react';

export default function FeaturesPage() {
  const featureList = [
    {
      icon: Cpu,
      title: 'Deterministic Document Parser',
      desc: 'Parses PDF, DOCX, and text resumes into structured JSON with zero information loss. Automatically categorizes experience, skills, and education.',
    },
    {
      icon: Sparkles,
      title: 'Ethical AI Customization',
      desc: 'Never hallucinates credentials or invents employment history. Customizes your genuine career facts to match the exact keywords and ATS profile of target jobs.',
    },
    {
      icon: GitBranch,
      title: 'Immutable Version Management',
      desc: 'Branch multiple tailored resume versions from your root profile. Every application preserves the exact snapshot submitted so you always know what you sent.',
    },
    {
      icon: Layers,
      title: 'Application Tracking Kanban',
      desc: 'Move applications through Draft, Applied, Assessment, Interview Scheduled, and Offer Received with full status change history.',
    },
    {
      icon: Database,
      title: 'Company Relationship Tracker',
      desc: 'Organize target companies, contacts, recruiter correspondence, and job application histories without duplicate records.',
    },
    {
      icon: Bell,
      title: 'Interview & Deadline Reminders',
      desc: 'Never miss an assessment deadline or interview round. Generate AI-powered STAR behavioral talking points based on your real experience.',
    },
  ];

  return (
    <div className="py-16 md:py-24 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h1 className="text-xs font-bold uppercase tracking-widest text-blue-600">Enterprise Capabilities</h1>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Engineered for Serious Career Progression
          </p>
          <p className="mt-3 text-sm text-slate-600">
            A comprehensive suite of tools built with native PostgreSQL performance, raw SQL precision, and ethical AI architecture.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featureList.map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={i} className="rounded-2xl border border-slate-200 p-6 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all">
                <div className="h-10 w-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">{f.title}</h3>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-16 text-center">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-xs font-bold text-white shadow-md hover:bg-blue-700 transition-colors"
          >
            <span>Start Using These Features Free</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

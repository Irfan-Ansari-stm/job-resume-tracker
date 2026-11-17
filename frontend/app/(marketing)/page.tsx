'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  GitBranch,
  Layers,
  FileText,
  Upload,
  Cpu,
  TrendingUp,
  Building,
  Target,
  Search,
} from 'lucide-react';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'before' | 'after'>('after');
  const [demoCompany, setDemoCompany] = useState('Tata Consultancy Services (TCS)');
  const [demoRole, setDemoRole] = useState('Senior Data Analyst');

  return (
    <div className="flex flex-col">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32 bg-gradient-to-b from-blue-50/50 via-white to-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            {/* Pill */}
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1.5 text-xs font-semibold text-blue-700 shadow-2xs mb-6">
              <Sparkles className="h-4 w-4 text-blue-600 animate-spin" />
              <span>Next-Gen Ethical AI Resume & Application Platform</span>
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl md:text-6xl leading-[1.15]">
              One Resume. Multiple Opportunities.{' '}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Every Application Organized.
              </span>
            </h1>

            <p className="mt-6 text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
              Customize your resume for every job with AI, preserve every version, and manage your entire job application journey in one intelligent workspace.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register"
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-blue-500/25 hover:bg-blue-700 transition-all hover:scale-[1.02]"
              >
                <span>Get Started Free</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/builder"
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-7 py-3.5 text-base font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition-colors"
              >
                <span>Try Live Demo</span>
              </Link>
            </div>

            {/* Micro value props */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>Zero qualification fabrication</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>Immutable version snapshots</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>Real-time ATS keyword matching</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. INTERACTIVE DEMO: AI RESUME CUSTOMIZATION WORKFLOW */}
      <section className="py-16 md:py-24 bg-slate-50 border-y border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-widest text-blue-600">The Core Engine</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              See How Ethical AI Customization Works
            </p>
            <p className="mt-3 text-sm text-slate-600">
              We never fabricate degrees or employment history. We highlight your genuine achievements to match the exact ATS requirements of target roles.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Step 1 & 2: Inputs */}
            <div className="lg:col-span-5 space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4 text-sm font-bold text-slate-900">
                  <Upload className="h-4 w-4 text-blue-600" />
                  <span>Step 1: Upload Candidate Resume</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <p className="font-semibold text-slate-800">Aarav Patel (Senior Data Analyst)</p>
                  <p className="text-slate-500 mt-1">5+ yrs experience • SQL, Python, Tableau, PostgreSQL, ETL</p>
                </div>

                <div className="flex items-center gap-2 mt-6 mb-4 text-sm font-bold text-slate-900">
                  <Target className="h-4 w-4 text-blue-600" />
                  <span>Step 2: Target Job Posting</span>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600">Company</label>
                    <input
                      type="text"
                      value={demoCompany}
                      onChange={(e) => setDemoCompany(e.target.value)}
                      className="w-full mt-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium focus:outline-blue-600"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600">Job Title</label>
                    <input
                      type="text"
                      value={demoRole}
                      onChange={(e) => setDemoRole(e.target.value)}
                      className="w-full mt-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium focus:outline-blue-600"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600">Job Requirements Snippet</label>
                    <textarea
                      readOnly
                      rows={3}
                      className="w-full mt-1 rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-600 focus:outline-none"
                      value="Seeking Senior Data Analyst to optimize complex SQL queries on relational databases, architect automated Tableau reporting pipelines, and drive executive decision metrics."
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3: Interactive Result Comparison */}
            <div className="lg:col-span-7">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">AI Tailored Output</span>
                    <span className="rounded-full bg-emerald-50 text-emerald-700 font-semibold px-2.5 py-0.5 text-xs border border-emerald-200">
                      92% Estimated ATS Match
                    </span>
                  </div>
                  <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1 text-xs font-medium">
                    <button
                      onClick={() => setActiveTab('before')}
                      className={`px-3 py-1 rounded-md transition-colors ${activeTab === 'before' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500'}`}
                    >
                      Original
                    </button>
                    <button
                      onClick={() => setActiveTab('after')}
                      className={`px-3 py-1 rounded-md transition-colors ${activeTab === 'after' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-500'}`}
                    >
                      AI Customization
                    </button>
                  </div>
                </div>

                {activeTab === 'before' ? (
                  <div className="space-y-4">
                    <div className="p-3 rounded-lg bg-slate-50 text-xs">
                      <p className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">Generic Master Summary</p>
                      <p className="mt-1 text-slate-700">
                        "Data Analyst with 5+ years of experience delivering actionable business intelligence, architecting automated ETL pipelines, and optimizing complex SQL queries across retail and enterprise finance sectors."
                      </p>
                    </div>
                    <div className="text-xs text-slate-500">
                      Contains general background without specific role targeting for {demoCompany}.
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200/80 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-blue-800 uppercase tracking-wider text-[10px]">Targeted Professional Summary</span>
                        <span className="text-[10px] bg-blue-200 text-blue-800 font-bold px-1.5 py-0.5 rounded">Tailored for {demoCompany}</span>
                      </div>
                      <p className="mt-1 text-slate-800 font-medium leading-relaxed">
                        "Targeted Senior Data Analyst for {demoCompany}: Results-oriented analytics specialist with 5+ years driving high-impact data modeling, SQL query optimization, and executive Tableau reporting across large enterprise deployments."
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                        <p className="font-semibold text-emerald-800 text-[11px] mb-1">Matched ATS Keywords</p>
                        <div className="flex flex-wrap gap-1">
                          {['SQL Tuning', 'Tableau', 'Data Modeling', 'ETL Pipelines', 'Executive Reporting'].map(k => (
                            <span key={k} className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded text-[10px] font-medium">✓ {k}</span>
                          ))}
                        </div>
                      </div>
                      <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
                        <p className="font-semibold text-amber-800 text-[11px] mb-1">Honest Skills Gap Report</p>
                        <p className="text-[10px] text-amber-900 leading-tight">
                          Posting mentions <em>Snowflake</em>. Candidate does not list this tool. We flagged this gap instead of fabricating it.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CORE VALUE HIGHLIGHTS */}
      <section className="py-16 md:py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-blue-600">End-to-End SaaS Platform</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Everything Needed to Land Your Dream Role
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-xs hover:shadow-md transition-shadow">
              <div className="h-10 w-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
                <GitBranch className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Immutable Version Management</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                Every application locks the exact submitted resume snapshot. You will always know verbatim what you sent to TCS, Infosys, or Accenture.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-xs hover:shadow-md transition-shadow">
              <div className="h-10 w-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-4">
                <Layers className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Full-Cycle Application Kanban</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                Track status transitions from Draft to Applied, Assessment, Interview Scheduled, and Offer Received with detailed history logs.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-xs hover:shadow-md transition-shadow">
              <div className="h-10 w-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-4">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Super Admin Platform Control</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                Platform owners possess complete authority over AI models, prompt versioning, subscription tiers, security audits, and user governance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CALL TO ACTION BANNER */}
      <section className="py-16 bg-gradient-to-tr from-blue-700 to-indigo-800 text-white text-center">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold sm:text-4xl">
            Ready to Take Control of Your Career?
          </h2>
          <p className="mt-4 text-base text-blue-100 max-w-xl mx-auto">
            Join thousands of professionals tailoring resumes honestly, tracking versions reliably, and converting applications into offers.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link
              href="/register"
              className="rounded-xl bg-white px-8 py-3.5 text-sm font-bold text-blue-700 shadow-md hover:bg-blue-50 transition-all hover:scale-105"
            >
              Create Free Account
            </Link>
            <Link
              href="/pricing"
              className="rounded-xl border border-blue-400 bg-blue-600/30 px-8 py-3.5 text-sm font-bold text-white hover:bg-blue-600/50 transition-colors"
            >
              View Pricing Plans
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';

export default function BuilderPage() {
  const [targetCompany, setTargetCompany] = useState('Google');
  const [targetRole, setTargetRole] = useState('Senior Software Engineer');
  const [jobDescription, setJobDescription] = useState(
    'Looking for a Senior Software Engineer with strong background in distributed systems, TypeScript, Node.js, and cloud architectures. Experience with high-throughput microservices and relational databases preferred.'
  );

  const [isProcessing, setIsProcessing] = useState(false);
  const [hasResult, setHasResult] = useState(false);

  const handleSimulate = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setHasResult(true);
    }, 800);
  };

  return (
    <div className="py-12 md:py-20 bg-slate-50 min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 mb-3">
            <Sparkles className="h-3.5 w-3.5 text-blue-600" />
            <span>Interactive AI Resume Playground</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
            Test Drive the AI Resume Customizer
          </h1>
          <p className="mt-3 text-sm text-slate-600">
            Experiment with job description targeting. See how our algorithm extracts requirements, matches skills, and identifies honest gaps without fabricating experience.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start max-w-5xl mx-auto">
          {/* Target Job Input Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              1. Enter Job Parameters
            </h2>

            <div>
              <label className="text-xs font-semibold text-slate-700">Target Company</label>
              <input
                type="text"
                value={targetCompany}
                onChange={(e) => setTargetCompany(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium focus:outline-blue-600"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Target Role Title</label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium focus:outline-blue-600"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Job Description / Requirements</label>
              <textarea
                rows={5}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-700 focus:outline-blue-600"
              />
            </div>

            <button
              onClick={handleSimulate}
              disabled={isProcessing}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-xs font-bold text-white shadow-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Analyzing & Tailoring...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Run Customization Analysis</span>
                </>
              )}
            </button>
          </div>

          {/* AI Tailored Output Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h2 className="text-sm font-bold text-slate-900">2. AI Customization Result</h2>
              {hasResult && (
                <span className="rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2 py-0.5">
                  94% Match Score
                </span>
              )}
            </div>

            {!hasResult ? (
              <div className="py-16 text-center text-slate-400">
                <Sparkles className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                <p className="text-xs font-medium">Click "Run Customization Analysis" to preview the tailored resume.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-slate-800">
                  <p className="font-bold text-blue-900 mb-1">Targeted Professional Summary</p>
                  <p className="leading-relaxed">
                    "Targeted {targetRole} for {targetCompany}: Senior Software Engineer with proven success building scalable distributed systems, event-driven Node.js architectures, and performant TypeScript APIs. Committed to engineering excellence and resilient cloud infrastructures."
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                    <p className="font-bold text-emerald-900 mb-1">Matched ATS Keywords</p>
                    <ul className="space-y-1 text-[11px] text-emerald-800">
                      <li>✓ Distributed Systems</li>
                      <li>✓ TypeScript & Node.js</li>
                      <li>✓ Cloud Architecture</li>
                      <li>✓ Microservices</li>
                    </ul>
                  </div>

                  <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
                    <p className="font-bold text-amber-900 mb-1">Identified Skills Gap</p>
                    <p className="text-[11px] text-amber-800">
                      Posting mentions <em>Kubernetes orchestrations</em>. Not found in sample candidate history. Marked for interview preparation.
                    </p>
                  </div>
                </div>

                <div className="pt-2 text-center">
                  <Link
                    href="/register"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition-colors"
                  >
                    <span>Save to My Resumes & Apply</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

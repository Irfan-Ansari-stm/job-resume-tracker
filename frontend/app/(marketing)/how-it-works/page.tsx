import React from 'react';
import Link from 'next/link';
import { Upload, Search, Sparkles, CheckCircle, ArrowRight } from 'lucide-react';

export default function HowItWorksPage() {
  const steps = [
    {
      number: '01',
      title: 'Upload Your Canonical Resume',
      desc: 'Upload your current resume in PDF, DOCX, or TXT format. Our deterministic document extraction parser extracts your work history, skills, and projects without losing critical facts.',
    },
    {
      number: '02',
      title: 'Enter Target Job Details',
      desc: 'Paste the target job description from company career portals like TCS, Infosys, or Google. Our AI identifies required technical skills, ATS keywords, and soft competencies.',
    },
    {
      number: '03',
      title: 'Generate Tailored Resume & Skills Gap Report',
      desc: 'Our engine tailors your professional summary and highlights your relevant achievements. Missing requirements are highlighted in a skills gap report instead of being fabricated.',
    },
    {
      number: '04',
      title: 'Lock Immutable Version & Track Application',
      desc: 'Save the tailored resume as an immutable version snapshot linked to the job application. Track interview stages, schedule follow-ups, and land the offer.',
    },
  ];

  return (
    <div className="py-16 md:py-24 bg-slate-50 min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h1 className="text-xs font-bold uppercase tracking-widest text-blue-600">The Workflow</h1>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            How SmartResume Works in 4 Steps
          </p>
          <p className="mt-3 text-sm text-slate-600">
            A proven methodology designed to maximize your application interview rate with complete career integrity.
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {steps.map((s, idx) => (
            <div key={s.number} className="flex flex-col sm:flex-row items-start gap-6 p-6 rounded-2xl border border-slate-200 bg-white shadow-xs">
              <span className="text-3xl font-black text-blue-600/30 sm:text-4xl shrink-0">
                {s.number}
              </span>
              <div>
                <h3 className="text-base font-bold text-slate-900">{s.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-xs font-bold text-white shadow-md hover:bg-blue-700 transition-colors"
          >
            <span>Try the 4-Step Workflow Now</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

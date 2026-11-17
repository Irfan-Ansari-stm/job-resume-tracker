'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

export default function FaqPage() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Does SmartResume AI invent qualifications or degrees?',
      a: 'Absolutely not. We adhere to a strict ethical AI policy. We never invent companies, job titles, years of experience, certifications, or degrees. Our AI only highlights and aligns your genuine, documented experience to the job requirements, and explicitly lists missing qualifications in a Skills Gap Report.',
    },
    {
      q: 'What is an "Immutable Version Snapshot"?',
      a: 'When you submit a resume for a job application and mark it as Applied, SmartResume creates a permanently locked snapshot of that resume version. Even if you edit your master resume or customize versions for other companies in the future, that submitted application will always reflect exactly what was sent.',
    },
    {
      q: 'What formats can I upload and download?',
      a: 'You can upload resumes in PDF, DOCX, and TXT formats. You can download your customized versions in formatted PDF and Microsoft Word (DOCX) formats.',
    },
    {
      q: 'How does the ATS match score work?',
      a: 'Our algorithm performs multi-point keyword matching against the job description requirements, factoring in technical skills, methodology terms, and responsibility alignment. It provides an estimated compatibility score to help you identify optimization opportunities.',
    },
    {
      q: 'Can I cancel or upgrade my subscription plan anytime?',
      a: 'Yes, you can upgrade, downgrade, or cancel your subscription plan at any time through your User Dashboard Billing tab with zero hidden fees.',
    },
  ];

  return (
    <div className="py-16 md:py-24 bg-slate-50 min-h-screen">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-xs font-bold uppercase tracking-widest text-blue-600">Frequently Asked Questions</h1>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Everything You Need to Know
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div key={idx} className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
                <button
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-5 text-left text-sm font-bold text-slate-900 hover:bg-slate-50 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100">
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

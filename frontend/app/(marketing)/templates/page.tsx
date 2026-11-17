'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { FileText, Eye, CheckCircle2, Sparkles } from 'lucide-react';

export default function TemplatesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const templates = [
    {
      id: 'modern-tech',
      name: 'Modern Tech Pro',
      category: 'Technology',
      description: 'Streamlined two-column design optimized for Software Developers, Cloud Architects, and Data Scientists.',
      isPremium: false,
      color: 'from-blue-500 to-indigo-600',
    },
    {
      id: 'executive-suite',
      name: 'Executive Suite',
      category: 'Leadership',
      description: 'Sophisticated single-column format tailored for Directors, VPs, and Engineering Managers.',
      isPremium: true,
      color: 'from-purple-600 to-slate-800',
    },
    {
      id: 'creative-edge',
      name: 'Creative Edge',
      category: 'Design',
      description: 'Polished typography and portfolio highlights designed specifically for UI/UX Designers.',
      isPremium: false,
      color: 'from-emerald-500 to-teal-700',
    },
    {
      id: 'minimalist-clean',
      name: 'Minimalist Clean',
      category: 'General',
      description: 'Distraction-free classic layout with maximum legibility and clear bullet hierarchy.',
      isPremium: false,
      color: 'from-slate-600 to-slate-900',
    },
    {
      id: 'ats-standard',
      name: 'ATS Standard Compliance',
      category: 'Enterprise',
      description: 'Strict machine-readable linear layout engineered to maximize automated ATS parsing accuracy.',
      isPremium: false,
      color: 'from-blue-600 to-cyan-600',
    },
  ];

  const categories = ['All', 'Technology', 'Leadership', 'Design', 'General', 'Enterprise'];
  const filtered = selectedCategory === 'All' ? templates : templates.filter(t => t.category === selectedCategory);

  return (
    <div className="py-16 bg-slate-50 min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h1 className="text-xs font-bold uppercase tracking-widest text-blue-600">Resume Templates</h1>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Professionally Crafted & ATS-Optimized
          </p>
          <p className="mt-3 text-sm text-slate-600">
            Every template is tested across major corporate applicant tracking systems to ensure parsing fidelity.
          </p>

          {/* Categories */}
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {categories.map(c => (
              <button
                key={c}
                onClick={() => setSelectedCategory(c)}
                className={`rounded-full px-3.5 py-1 text-xs font-semibold transition-all ${
                  selectedCategory === c ? 'bg-blue-600 text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Template Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {filtered.map(t => (
            <div key={t.id} className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              {/* Preview Banner */}
              <div className={`h-40 bg-gradient-to-tr ${t.color} p-6 flex flex-col justify-between text-white relative`}>
                <div className="flex justify-between items-start">
                  <span className="text-[10px] uppercase font-bold tracking-wider bg-black/20 backdrop-blur-xs px-2 py-0.5 rounded">
                    {t.category}
                  </span>
                  {t.isPremium && (
                    <span className="bg-amber-400 text-amber-950 font-bold text-[10px] px-2 py-0.5 rounded-full">
                      PRO
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-bold">{t.name}</h3>
                </div>
              </div>

              {/* Body */}
              <div className="p-5 flex flex-col justify-between min-h-[140px]">
                <p className="text-xs text-slate-600 leading-relaxed">{t.description}</p>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> 100% ATS Safe
                  </span>
                  <Link
                    href={`/register?template=${t.id}`}
                    className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-100 transition-colors"
                  >
                    Use Template
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

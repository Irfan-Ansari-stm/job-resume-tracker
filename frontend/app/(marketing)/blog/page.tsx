import React from 'react';
import Link from 'next/link';
import { Calendar, ArrowRight, User } from 'lucide-react';

export default function BlogPage() {
  const articles = [
    {
      title: 'Why Fabricating Resume Qualifications with AI Will Get You Blacklisted in 2026',
      excerpt: 'How modern automated corporate ATS verification detects generated hallucinations and why ethical alignment is your greatest competitive edge.',
      date: 'Nov 12, 2026',
      author: 'Career Intelligence Lab',
      category: 'ATS Technology',
    },
    {
      title: 'The Multi-Version Resume Strategy: How Top Engineers Land Interviews at TCS, Google, and Infosys',
      excerpt: 'Why sending the exact same generic resume to 50 companies fails, and how targeting specific domains triples your callback rate.',
      date: 'Nov 05, 2026',
      author: 'Alexander Vance',
      category: 'Job Search Strategy',
    },
    {
      title: 'Mastering the Behavioral Interview with the STAR Method & Authentic AI Prep',
      excerpt: 'Step-by-step guidance on structuring your real past experiences into compelling interview answers that impress hiring managers.',
      date: 'Oct 28, 2026',
      author: 'Sarah Jenkins',
      category: 'Interview Prep',
    },
  ];

  return (
    <div className="py-16 md:py-24 bg-white min-h-screen">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h1 className="text-xs font-bold uppercase tracking-widest text-blue-600">Insights & Resources</h1>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Career Strategy & ATS Intelligence
          </p>
        </div>

        <div className="space-y-8">
          {articles.map((art, idx) => (
            <div key={idx} className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-sm transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-500 mb-2">
                  <span className="text-blue-600 uppercase tracking-wider">{art.category}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {art.date}</span>
                </div>
                <h2 className="text-lg font-bold text-slate-900 hover:text-blue-600 cursor-pointer transition-colors">
                  {art.title}
                </h2>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed">{art.excerpt}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-slate-500 font-medium">
                  <User className="h-3.5 w-3.5" /> {art.author}
                </span>
                <span className="text-blue-600 font-bold flex items-center gap-1 hover:underline cursor-pointer">
                  Read Article <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

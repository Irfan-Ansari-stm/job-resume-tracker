import React from 'react';
import { Sparkles, ShieldCheck, Heart, Award } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="py-16 md:py-24 bg-white min-h-screen">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-xs font-bold uppercase tracking-widest text-blue-600">Our Mission</h1>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Empowering Candidates with Truthful AI
          </p>
        </div>

        <div className="prose prose-slate max-w-none text-sm leading-relaxed text-slate-600 space-y-6">
          <p>
            SmartResume was founded on a simple, uncompromising principle: <strong>job seekers deserve AI tools that enhance their authentic strengths without fabricating qualifications</strong>.
          </p>
          <p>
            In a job market saturated with generic AI generators that invent degrees, hallucinate company names, or flood recruiters with untruthful resumes, we took a stand for career integrity. Every line customized by SmartResume is anchored in the candidate's real, verified career history.
          </p>

          <div className="my-10 grid grid-cols-1 sm:grid-cols-3 gap-6 not-prose">
            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 text-center">
              <ShieldCheck className="h-6 w-6 text-emerald-600 mx-auto mb-2" />
              <h3 className="font-bold text-slate-900 text-sm">Strict Truthfulness</h3>
              <p className="text-[11px] text-slate-500 mt-1">Zero fabricated credentials. We highlight real transferable skills.</p>
            </div>
            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 text-center">
              <Sparkles className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <h3 className="font-bold text-slate-900 text-sm">Deterministic Speed</h3>
              <p className="text-[11px] text-slate-500 mt-1">Engineered with native PostgreSQL raw SQL and ultra-low latency.</p>
            </div>
            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 text-center">
              <Award className="h-6 w-6 text-purple-600 mx-auto mb-2" />
              <h3 className="font-bold text-slate-900 text-sm">Version Immutability</h3>
              <p className="text-[11px] text-slate-500 mt-1">Submitted resumes are locked snapshots. You will never forget what you sent.</p>
            </div>
          </div>

          <p>
            Whether you are a fresh graduate entering the workforce or a seasoned executive transitioning to your next leadership post, SmartResume organizes your entire journey under one roof.
          </p>
        </div>
      </div>
    </div>
  );
}

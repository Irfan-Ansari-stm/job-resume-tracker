'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Check, Sparkles, HelpCircle } from 'lucide-react';

export default function PricingPage() {
  const [interval, setInterval] = useState<'monthly' | 'yearly'>('monthly');

  const plans = [
    {
      name: 'Free Starter',
      slug: 'free',
      description: 'Ideal for job seekers beginning their career journey.',
      priceMonthly: 0,
      priceYearly: 0,
      badge: null,
      features: [
        '2 Master Resume Uploads',
        '5 Customized Resume Versions',
        '20 Active Application Tracking Slots',
        '15 AI Credits / month',
        'Deterministic Document Parsing',
        'Standard PDF Resume Downloads',
        'Basic Interview Preparation Notes',
      ],
      buttonText: 'Get Started Free',
      href: '/register',
      highlighted: false,
    },
    {
      name: 'Pro Career Accelerator',
      slug: 'pro',
      description: 'Our most popular plan for active candidates applying to top companies.',
      priceMonthly: 19,
      priceYearly: 190,
      badge: 'Most Popular',
      features: [
        '10 Master Resume Uploads',
        '100 Customized Resume Versions',
        '200 Application Tracking Slots',
        '100 AI Credits / month',
        'Deep ATS Keyword Scoring',
        'Honest Skills Gap Detection',
        'DOCX & PDF Resume Exports',
        'Interactive AI Interview Preparation Studio',
        'Application Deadline & Follow-up Reminders',
        'Priority Customer Support',
      ],
      buttonText: 'Start Pro Accelerator',
      href: '/register?plan=pro',
      highlighted: true,
    },
    {
      name: 'Executive & Power Search',
      slug: 'premium',
      description: 'For senior leaders and high-volume career transitions requiring maximum AI capability.',
      priceMonthly: 39,
      priceYearly: 390,
      badge: 'Best Value',
      features: [
        'Unlimited Resumes & Versions',
        '1,000 Active Applications Tracking',
        '350 AI Credits / month',
        'Executive Level Persona Alignment',
        'Instant Priority AI Customization Queue',
        'Advanced Career Velocity Analytics',
        'Dedicated 1-on-1 Onboarding Support',
        'Full Historical Version Diff & Rollback',
      ],
      buttonText: 'Get Executive Power',
      href: '/register?plan=premium',
      highlighted: false,
    },
  ];

  return (
    <div className="py-16 md:py-24 bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-xs font-bold uppercase tracking-widest text-blue-600">Transparent Pricing</h1>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Invest in Your Next Career Move
          </p>
          <p className="mt-4 text-base text-slate-600">
            Choose the plan that fits your job search velocity. Upgrade or cancel anytime.
          </p>

          {/* Monthly / Yearly Toggle */}
          <div className="mt-8 inline-flex items-center rounded-xl bg-slate-200/80 p-1 text-xs font-semibold">
            <button
              onClick={() => setInterval('monthly')}
              className={`rounded-lg px-4 py-2 transition-all ${interval === 'monthly' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setInterval('yearly')}
              className={`flex items-center gap-1.5 rounded-lg px-4 py-2 transition-all ${interval === 'yearly' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600'}`}
            >
              <span>Yearly (Save 20%)</span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
          {plans.map((p) => {
            const price = interval === 'yearly' ? p.priceYearly : p.priceMonthly;
            return (
              <div
                key={p.slug}
                className={`flex flex-col justify-between rounded-3xl border bg-white p-8 shadow-sm transition-all ${
                  p.highlighted
                    ? 'border-blue-600 ring-2 ring-blue-600 shadow-lg shadow-blue-500/10'
                    : 'border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-slate-900">{p.name}</h2>
                    {p.badge && (
                      <span className="rounded-full bg-blue-100 text-blue-700 px-2.5 py-0.5 text-[11px] font-bold">
                        {p.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 min-h-[36px]">{p.description}</p>

                  <div className="mt-6 flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-slate-900">${price}</span>
                    <span className="text-xs font-semibold text-slate-500">
                      {p.priceMonthly === 0 ? '' : interval === 'yearly' ? '/year' : '/month'}
                    </span>
                  </div>

                  <ul className="mt-8 space-y-3 border-t border-slate-100 pt-6">
                    {p.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                        <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 pt-4">
                  <Link
                    href={p.href}
                    className={`block w-full text-center rounded-xl py-3 text-xs font-bold transition-all ${
                      p.highlighted
                        ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/25'
                        : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {p.buttonText}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

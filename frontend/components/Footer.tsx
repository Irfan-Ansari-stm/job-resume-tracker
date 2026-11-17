import React from 'react';
import Link from 'next/link';
import { Sparkles, Shield, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-900 text-slate-400">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand Col */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-500 text-white shadow-md">
                <Sparkles className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">SmartResume<span className="text-blue-400">.ai</span></span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
              One Resume. Multiple Opportunities. Every Application Organized. Never lose track of what you submitted, tailor resumes with ethical AI, and manage your entire career trajectory.
            </p>
            <div className="mt-6 flex items-center gap-2 text-xs text-slate-500">
              <Shield className="h-4 w-4 text-emerald-400" />
              <span>SOC2 Compliant Architecture • 100% Privacy-Preserved</span>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">Product</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><Link href="/features" className="hover:text-white transition-colors">Features Overview</Link></li>
              <li><Link href="/builder" className="hover:text-white transition-colors">AI Resume Builder</Link></li>
              <li><Link href="/templates" className="hover:text-white transition-colors">Resume Templates</Link></li>
              <li><Link href="/how-it-works" className="hover:text-white transition-colors">How It Works</Link></li>
              <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing & Plans</Link></li>
            </ul>
          </div>

          {/* Platform & Resources */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">Resources</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><Link href="/blog" className="hover:text-white transition-colors">Career Blog</Link></li>
              <li><Link href="/faq" className="hover:text-white transition-colors">FAQ & Guides</Link></li>
              <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact Support</Link></li>
              <li><Link href="/dashboard" className="hover:text-white transition-colors">Job Seeker Portal</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">Legal & Trust</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="/refund" className="hover:text-white transition-colors">Refund Policy</Link></li>
              <li><span className="text-xs text-slate-500">No Qualification Fabrication Guarantee</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} SmartResume.ai. All rights reserved. Enterprise-grade AI platform.</p>
          <p className="flex items-center gap-1">
            Engineered with <Heart className="h-3.5 w-3.5 text-rose-500" /> for ambitious career builders worldwide.
          </p>
        </div>
      </div>
    </footer>
  );
}

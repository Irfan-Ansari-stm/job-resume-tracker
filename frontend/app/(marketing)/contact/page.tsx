'use client';

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="py-16 md:py-24 bg-slate-50 min-h-screen">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h1 className="text-xs font-bold uppercase tracking-widest text-blue-600">Get in Touch</h1>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            We'd Love to Hear From You
          </p>
          <p className="mt-3 text-sm text-slate-600">
            Have questions about enterprise plans, API integrations, or resume intelligence? Our team is here to assist.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Info Card */}
          <div className="md:col-span-5 rounded-2xl bg-blue-600 text-white p-8 shadow-md">
            <h2 className="text-xl font-bold">Contact Information</h2>
            <p className="mt-2 text-xs text-blue-100 leading-relaxed">
              Reach out to our customer success and platform engineering team directly.
            </p>

            <div className="mt-8 space-y-5 text-xs text-blue-50">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 shrink-0 text-blue-200" />
                <span>support@smartresume.ai</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 shrink-0 text-blue-200" />
                <span>+1 (800) 555-RESUME</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 shrink-0 text-blue-200" />
                <span>San Francisco, CA & Bengaluru, India</span>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="md:col-span-7 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            {submitted ? (
              <div className="py-12 text-center">
                <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-900">Message Received!</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Thank you for reaching out. A platform representative will respond to {email} within 24 business hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700">Full Name</label>
                    <input
                      required
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-blue-600"
                      placeholder="Jane Doe"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700">Email Address</label>
                    <input
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-blue-600"
                      placeholder="jane@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700">Subject</label>
                  <input
                    required
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-blue-600"
                    placeholder="Inquiry about Pro Plan"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700">Message</label>
                  <textarea
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-700 focus:outline-blue-600"
                    placeholder="How can we help your job search workflow?"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-xs font-bold text-white shadow-md hover:bg-blue-700 transition-colors"
                >
                  <Send className="h-4 w-4" />
                  <span>Send Message</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

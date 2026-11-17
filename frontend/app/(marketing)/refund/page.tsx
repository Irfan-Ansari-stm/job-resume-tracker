import React from 'react';

export default function RefundPage() {
  return (
    <div className="py-16 bg-white min-h-screen">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-6">Refund Policy</h1>
        <div className="prose prose-slate text-xs leading-relaxed space-y-4 text-slate-600">
          <p>Last updated: November 2026</p>
          <p>
            We strive to provide an outstanding experience with SmartResume.ai. If you are not satisfied with your subscription, this policy outlines your refund eligibility.
          </p>
          <h2 className="text-sm font-bold text-slate-900 pt-4">1. 14-Day Satisfaction Guarantee</h2>
          <p>
            If you subscribe to our Pro or Premium plan and are dissatisfied for any reason, you may request a full refund within 14 calendar days of your initial purchase by contacting support@smartresume.ai.
          </p>
          <h2 className="text-sm font-bold text-slate-900 pt-4">2. Cancellation Policy</h2>
          <p>
            You can cancel your subscription at any time via your dashboard billing page. Upon cancellation, your plan will remain active until the end of the current billing cycle, with no subsequent charges.
          </p>
        </div>
      </div>
    </div>
  );
}

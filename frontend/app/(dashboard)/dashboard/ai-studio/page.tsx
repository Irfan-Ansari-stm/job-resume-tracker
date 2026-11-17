'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Save,
  Building2,
  Target,
  FileText,
  Sliders,
  Check,
  Copy,
  Download,
} from 'lucide-react';

export default function AiStudioPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialResumeId = searchParams.get('resumeId');

  const [resumes, setResumes] = useState<any[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string>(initialResumeId || '');
  const [targetCompany, setTargetCompany] = useState('Tata Consultancy Services (TCS)');
  const [targetRole, setTargetRole] = useState('Senior Data Analyst');
  const [jobDescription, setJobDescription] = useState(
    'Seeking a Senior Data Analyst with expertise in SQL, Python, Tableau, and automated data pipelines. Must have experience optimizing relational databases and presenting executive dashboards.'
  );
  const [customInstructions, setCustomInstructions] = useState('');

  // AI Workflow State
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [aiResult, setAiResult] = useState<any | null>(null);

  // Editable summary in Review Step
  const [editedSummary, setEditedSummary] = useState<string>('');
  const [isSavingVersion, setIsSavingVersion] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  useEffect(() => {
    async function fetchResumes() {
      try {
        const res = await api.get('/resumes');
        if (res.success && res.data.length > 0) {
          setResumes(res.data);
          if (!selectedResumeId) {
            setSelectedResumeId(res.data[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to fetch resumes:', err);
      }
    }
    fetchResumes();
  }, [selectedResumeId]);

  const handleRunCustomization = async () => {
    const activeResume = resumes.find(r => r.id === selectedResumeId);
    if (!activeResume) {
      alert('Please select an active resume first.');
      return;
    }

    setIsProcessing(true);
    setSavedSuccess(false);

    try {
      const res = await api.post('/ai/customize-resume', {
        resume: activeResume.parsed_data || { summary: activeResume.summary },
        targetJob: {
          title: targetRole,
          company: targetCompany,
          description: jobDescription,
        },
        customInstructions,
      });

      if (res.success && res.data) {
        setAiResult(res.data);
        setEditedSummary(res.data.customizedResume?.summary || '');
        setCurrentStep(2); // Move to review step
      }
    } catch (err: any) {
      alert(err.message || 'AI Customization failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveAsVersion = async () => {
    if (!aiResult || !selectedResumeId) return;

    setIsSavingVersion(true);
    try {
      const versionLabel = `${targetCompany} - ${targetRole}`;
      const updatedSnapshot = {
        ...(aiResult.customizedResume || {}),
        summary: editedSummary,
      };

      const res = await api.post(`/resumes/${selectedResumeId}/versions`, {
        companyName: targetCompany,
        jobTitle: targetRole,
        versionLabel,
        customizationInstructions: customInstructions,
        contentSnapshot: updatedSnapshot,
        changeSummary: aiResult.changeSummary,
        matchScore: aiResult.matchScore || 85,
        matchedKeywords: aiResult.matchedKeywords || [],
        missingKeywords: aiResult.missingKeywords || [],
        skillsGapReport: aiResult.skillsGapReport || [],
        status: 'draft',
      });

      if (res.success) {
        setSavedSuccess(true);
        setTimeout(() => {
          router.push('/dashboard/versions');
        }, 1200);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to save version');
    } finally {
      setIsSavingVersion(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-600" />
          <h1 className="text-xl font-bold tracking-tight text-slate-900">AI Resume Studio</h1>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Tailor your resume for specific job descriptions with ATS alignment while preserving 100% career truthfulness.
        </p>
      </div>

      {/* Stepper Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 text-xs font-semibold">
        <button
          onClick={() => setCurrentStep(1)}
          className={`flex items-center gap-2 rounded-lg px-3 py-1.5 transition-colors ${
            currentStep === 1 ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>Step 1: Target Parameters</span>
        </button>
        <button
          onClick={() => aiResult && setCurrentStep(2)}
          disabled={!aiResult}
          className={`flex items-center gap-2 rounded-lg px-3 py-1.5 transition-colors ${
            currentStep === 2
              ? 'bg-blue-600 text-white shadow-xs'
              : aiResult
              ? 'text-slate-600 hover:bg-slate-100'
              : 'text-slate-300 cursor-not-allowed'
          }`}
        >
          <span>Step 2: AI Review & Save Version</span>
        </button>
      </div>

      {currentStep === 1 ? (
        /* STEP 1: FORM INPUTS */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-6 space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              1. Select Source Resume
            </h2>

            <div>
              <label className="text-xs font-semibold text-slate-700">Choose Master Resume</label>
              <select
                value={selectedResumeId}
                onChange={(e) => setSelectedResumeId(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium focus:outline-blue-600"
              >
                {resumes.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.title} ({r.category || 'General'})
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                2. Target Job Details
              </h2>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Company Name</label>
                  <input
                    type="text"
                    required
                    value={targetCompany}
                    onChange={(e) => setTargetCompany(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-blue-600"
                    placeholder="e.g. Infosys, TCS, Google"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700">Target Job Title</label>
                  <input
                    type="text"
                    required
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-blue-600"
                    placeholder="e.g. Senior Data Analyst"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700">Job Description / Requirements</label>
                  <textarea
                    rows={6}
                    required
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-700 focus:outline-blue-600"
                    placeholder="Paste the target job description or requirements here..."
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700">Optional Instructions for AI</label>
                  <input
                    type="text"
                    value={customInstructions}
                    onChange={(e) => setCustomInstructions(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-blue-600"
                    placeholder="e.g. Emphasize SQL query optimization and Tableau dashboards"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleRunCustomization}
                disabled={isProcessing || !targetCompany || !targetRole || !jobDescription}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-xs font-bold text-white shadow-md hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Analyzing & Tailoring Resume with AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Generate AI Customization</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Info Card */}
          <div className="lg:col-span-6 space-y-4">
            <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-6 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
                <CheckCircle2 className="h-4 w-4 text-blue-600" />
                <span>Our Unbreakable AI Integrity Promise</span>
              </div>
              <ul className="space-y-2 text-xs text-blue-800 leading-relaxed">
                <li>• <strong>No Hallucinations:</strong> The engine will never invent employment dates, companies, degrees, or certifications.</li>
                <li>• <strong>Transparent Gap Identification:</strong> If the posting asks for tools you haven't listed, we highlight them in the Skills Gap Report instead of inventing skills.</li>
                <li>• <strong>ATS-Centric Rephrasing:</strong> Re-orders and highlights your genuine achievements using the terminology employers look for.</li>
              </ul>
            </div>
          </div>
        </div>
      ) : (
        /* STEP 2: REVIEW & SAVE AS IMMUTABLE VERSION */
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-blue-600 tracking-wider">AI Tailored Version</span>
                <h2 className="text-lg font-bold text-slate-900">{targetRole} at {targetCompany}</h2>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-xs text-slate-500">Estimated Match</span>
                  <p className="text-lg font-extrabold text-emerald-600">{aiResult.matchScore || 85}%</p>
                </div>
              </div>
            </div>

            {/* Change Summary */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <p className="font-bold text-slate-800 mb-1">AI Change Summary</p>
              <p className="text-slate-600 leading-relaxed">{aiResult.changeSummary}</p>
            </div>

            {/* Editable Summary */}
            <div>
              <label className="text-xs font-bold text-slate-900 block mb-1">
                Customized Professional Summary (Editable)
              </label>
              <textarea
                rows={4}
                value={editedSummary}
                onChange={(e) => setEditedSummary(e.target.value)}
                className="w-full rounded-xl border border-blue-300 bg-blue-50/30 p-3 text-xs text-slate-800 font-medium focus:outline-blue-600"
              />
            </div>

            {/* Matched Keywords & Honest Skills Gap */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
                <h3 className="font-bold text-emerald-900 mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Matched ATS Keywords ({aiResult.matchedKeywords?.length || 0})</span>
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {(aiResult.matchedKeywords || []).map((k: string) => (
                    <span key={k} className="bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded text-[11px] font-semibold">
                      ✓ {k}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs">
                <h3 className="font-bold text-amber-900 mb-2 flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <span>Honest Skills Gap Report ({aiResult.skillsGapReport?.length || 0})</span>
                </h3>
                <div className="space-y-1.5">
                  {(aiResult.skillsGapReport || []).map((gap: any, i: number) => (
                    <div key={i} className="text-[11px] text-amber-900 leading-tight">
                      <strong>{gap.skill || gap}</strong>: {gap.recommendation || 'Requirement in job description. Highlight transferable skills in interview.'}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Save Buttons */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => setCurrentStep(1)}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                ← Back to Parameters
              </button>

              <div className="flex items-center gap-2">
                {savedSuccess && (
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4" /> Saved! Redirecting...
                  </span>
                )}
                <button
                  onClick={handleSaveAsVersion}
                  disabled={isSavingVersion || savedSuccess}
                  className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  <span>{isSavingVersion ? 'Saving Version...' : 'Save as New Version'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

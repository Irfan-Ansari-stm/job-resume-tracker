'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import {
  GitBranch,
  Lock,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Eye,
  CheckCircle2,
  Columns,
  X,
  FileText,
} from 'lucide-react';

export default function VersionsPage() {
  const [versions, setVersions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Compare Modal State
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [compareV1, setCompareV1] = useState<string>('');
  const [compareV2, setCompareV2] = useState<string>('');
  const [comparisonResult, setComparisonResult] = useState<any | null>(null);

  // Preview Version Modal
  const [previewVersion, setPreviewVersion] = useState<any | null>(null);

  const fetchVersions = async () => {
    try {
      const res = await api.get('/resumes/versions/all');
      if (res.success) {
        setVersions(res.data);
        if (res.data.length >= 2) {
          setCompareV1(res.data[0].id);
          setCompareV2(res.data[1].id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch versions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVersions();
  }, []);

  const handleRestore = async (version: any) => {
    if (!confirm(`Restore Version ${version.version_number} (${version.version_label}) as a new active draft version?`)) return;

    try {
      const res = await api.post(`/resumes/${version.resume_id}/versions/${version.id}/restore`);
      if (res.success) {
        alert('Version successfully restored as a new version!');
        await fetchVersions();
      }
    } catch (err: any) {
      alert(err.message || 'Restore failed');
    }
  };

  const handleCompare = async () => {
    if (!compareV1 || !compareV2) return;
    try {
      const res = await api.get(`/resumes/versions/compare?v1=${compareV1}&v2=${compareV2}`);
      if (res.success) {
        setComparisonResult(res.data);
        setShowCompareModal(true);
      }
    } catch (err: any) {
      alert(err.message || 'Comparison failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-purple-600" />
            <h1 className="text-xl font-bold tracking-tight text-slate-900">Resume Version Management</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Browse complete version history. Submitted versions are permanently locked snapshots.
          </p>
        </div>

        {versions.length >= 2 && (
          <button
            onClick={handleCompare}
            className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <Columns className="h-4 w-4 text-purple-600" />
            <span>Compare Versions</span>
          </button>
        )}
      </div>

      {/* Versions List */}
      {loading ? (
        <div className="py-16 text-center text-xs text-slate-500">Loading version snapshots...</div>
      ) : versions.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-12 text-center">
          <GitBranch className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-900">No tailored versions created yet</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Use AI Resume Studio to customize your master resume for specific companies.
          </p>
          <Link
            href="/dashboard/ai-studio"
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm"
          >
            <Sparkles className="h-4 w-4" /> Go to AI Studio
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {versions.map((ver) => (
            <div
              key={ver.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs hover:shadow-xs transition-shadow flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded">
                    v{ver.version_number}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 truncate">{ver.version_label}</h3>

                  {ver.is_immutable ? (
                    <span className="flex items-center gap-1 rounded-full bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5">
                      <Lock className="h-3 w-3" /> Locked Snapshot
                    </span>
                  ) : (
                    <span className="rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 border border-blue-200">
                      Draft Version
                    </span>
                  )}

                  {ver.match_score && (
                    <span className="rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 border border-emerald-200">
                      {ver.match_score}% Match
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 line-clamp-2">
                  {ver.change_summary || ver.content_snapshot?.summary || 'Tailored resume snapshot.'}
                </p>

                <div className="flex items-center gap-3 text-[11px] text-slate-400">
                  <span>Parent: {ver.resume_title}</span>
                  <span>•</span>
                  <span>Created {formatDate(ver.created_at)}</span>
                  {ver.company_name && (
                    <>
                      <span>•</span>
                      <span className="font-semibold text-slate-600">{ver.company_name}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setPreviewVersion(ver)}
                  className="flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>Preview</span>
                </button>
                <button
                  onClick={() => handleRestore(ver)}
                  className="flex items-center gap-1 rounded-lg border border-purple-200 bg-purple-50 px-3 py-1.5 text-xs font-semibold text-purple-700 hover:bg-purple-100 transition-colors"
                  title="Restore this historical version as a new active version"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Restore</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* COMPARE MODAL */}
      {showCompareModal && comparisonResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-4xl max-h-[85vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-sm font-bold text-slate-900">Side-by-Side Version Comparison</h3>
              <button onClick={() => setShowCompareModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6 text-xs">
              {/* Version 1 */}
              <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/30 space-y-3">
                <div className="border-b border-blue-200 pb-2">
                  <span className="font-bold text-blue-900 text-sm">Version {comparisonResult.v1.version_number}</span>
                  <p className="text-[11px] text-slate-500">{comparisonResult.v1.version_label}</p>
                  <span className="text-emerald-700 font-bold text-xs">Score: {comparisonResult.v1.match_score}%</span>
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">Summary</h4>
                  <p className="mt-1 text-slate-700 leading-relaxed">
                    {comparisonResult.v1.content_snapshot?.summary}
                  </p>
                </div>
              </div>

              {/* Version 2 */}
              <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/30 space-y-3">
                <div className="border-b border-purple-200 pb-2">
                  <span className="font-bold text-purple-900 text-sm">Version {comparisonResult.v2.version_number}</span>
                  <p className="text-[11px] text-slate-500">{comparisonResult.v2.version_label}</p>
                  <span className="text-emerald-700 font-bold text-xs">Score: {comparisonResult.v2.match_score}%</span>
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">Summary</h4>
                  <p className="mt-1 text-slate-700 leading-relaxed">
                    {comparisonResult.v2.content_snapshot?.summary}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowCompareModal(false)}
                className="rounded-lg bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200"
              >
                Close Comparison
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PREVIEW MODAL */}
      {previewVersion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">{previewVersion.version_label}</h3>
                <p className="text-[11px] text-slate-500">v{previewVersion.version_number} • {previewVersion.status}</p>
              </div>
              <button onClick={() => setPreviewVersion(null)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-700">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <h4 className="font-bold text-slate-900 mb-1">Snapshot Professional Summary</h4>
                <p className="leading-relaxed">{previewVersion.content_snapshot?.summary}</p>
              </div>

              {previewVersion.matched_keywords && previewVersion.matched_keywords.length > 0 && (
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">Matched Keywords</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {previewVersion.matched_keywords.map((k: string) => (
                      <span key={k} className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded text-[11px]">
                        ✓ {k}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setPreviewVersion(null)}
                className="rounded-lg bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

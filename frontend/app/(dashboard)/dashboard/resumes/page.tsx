'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import {
  FileText,
  Upload,
  Plus,
  Sparkles,
  GitBranch,
  Trash2,
  CheckCircle,
  Eye,
  FileCheck,
  X,
  RefreshCw,
} from 'lucide-react';

export default function ResumesPage() {
  const [resumes, setResumes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Upload Form State
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCategory, setUploadCategory] = useState('General');
  const [isUploading, setIsUploading] = useState(false);

  // Manual Create Form State
  const [newTitle, setNewTitle] = useState('');
  const [newTargetRole, setNewTargetRole] = useState('');
  const [newSummary, setNewSummary] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Preview Modal
  const [selectedResume, setSelectedResume] = useState<any | null>(null);

  const fetchResumes = async () => {
    try {
      const res = await api.get('/resumes');
      if (res.success) {
        setResumes(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch resumes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', uploadFile);
    formData.append('title', uploadTitle || uploadFile.name.replace(/\.[^/.]+$/, ''));
    formData.append('category', uploadCategory);

    try {
      const res = await api.post('/resumes/upload', formData);
      if (res.success) {
        setShowUploadModal(false);
        setUploadFile(null);
        setUploadTitle('');
        await fetchResumes();
      }
    } catch (err: any) {
      alert(err.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      const res = await api.post('/resumes', {
        title: newTitle,
        targetRole: newTargetRole,
        summary: newSummary,
        category: 'General',
        parsedData: {
          contactInfo: { fullName: 'Candidate', email: '', phone: '', location: '' },
          summary: newSummary,
          skills: [{ category: 'Core Skills', items: [] }],
          experience: [],
          education: [],
          projects: [],
          certifications: [],
        },
      });

      if (res.success) {
        setShowCreateModal(false);
        setNewTitle('');
        setNewTargetRole('');
        setNewSummary('');
        await fetchResumes();
      }
    } catch (err: any) {
      alert(err.message || 'Create failed');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this master resume and its versions?')) return;
    try {
      await api.delete(`/resumes/${id}`);
      setResumes(prev => prev.filter(r => r.id !== id));
    } catch (err: any) {
      alert(err.message || 'Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">My Resumes</h1>
          <p className="text-xs text-slate-500">
            Manage your master resumes, extracted career data, and tailored version snapshots.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition-colors"
          >
            <Upload className="h-4 w-4" />
            <span>Upload Document</span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Create Profile</span>
          </button>
        </div>
      </div>

      {/* Resumes Grid */}
      {loading ? (
        <div className="py-16 text-center text-xs text-slate-500">Loading resumes...</div>
      ) : resumes.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-12 text-center">
          <FileText className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-900">No resumes uploaded yet</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Upload your existing PDF or Word resume to automatically parse your career facts and begin AI customization.
          </p>
          <button
            onClick={() => setShowUploadModal(true)}
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm"
          >
            <Upload className="h-4 w-4" /> Upload Resume
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {resumes.map((r) => (
            <div
              key={r.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <h2 className="text-xs font-bold text-slate-900 line-clamp-1">{r.title}</h2>
                      <span className="text-[10px] text-slate-500">{r.category || 'General'}</span>
                    </div>
                  </div>
                  {r.is_primary && (
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-bold px-2 py-0.5 rounded-full">
                      Primary
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 line-clamp-3 mt-3 leading-relaxed">
                  {r.summary || 'Master resume profile containing verified candidate career history.'}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <GitBranch className="h-3.5 w-3.5 text-purple-600" />
                    <strong>{r.versions_count || 1}</strong> versions
                  </span>
                  <span>Updated {formatDate(r.updated_at)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => setSelectedResume(r)}
                  className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-blue-600"
                >
                  <Eye className="h-3.5 w-3.5" /> View
                </button>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/dashboard/ai-studio?resumeId=${r.id}`}
                    className="flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 hover:bg-blue-100 transition-colors"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Customize</span>
                  </Link>
                  <button
                    onClick={() => handleDelete(r.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md"
                    title="Delete resume"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* UPLOAD MODAL */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-sm font-bold text-slate-900">Upload & Parse Resume</h3>
              <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700">Select File (PDF, DOCX, TXT)</label>
                <input
                  type="file"
                  required
                  accept=".pdf,.docx,.doc,.txt"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      setUploadFile(f);
                      if (!uploadTitle) setUploadTitle(f.name.replace(/\.[^/.]+$/, ''));
                    }
                  }}
                  className="mt-1 block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Resume Title</label>
                <input
                  type="text"
                  required
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-blue-600"
                  placeholder="e.g. Master Data Analyst 2026"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Category</label>
                <select
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-blue-600"
                >
                  <option value="General">General</option>
                  <option value="Analytics">Analytics & Data</option>
                  <option value="Engineering">Software Engineering</option>
                  <option value="Design">Product & UI/UX</option>
                  <option value="Management">Management & Consulting</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
                >
                  {isUploading ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      <span>Parsing Document...</span>
                    </>
                  ) : (
                    <span>Upload & Parse</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE MANUAL PROFILE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-sm font-bold text-slate-900">Create New Resume Profile</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700">Resume Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-blue-600"
                  placeholder="e.g. Lead Full-Stack Architect"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Target Role</label>
                <input
                  type="text"
                  value={newTargetRole}
                  onChange={(e) => setNewTargetRole(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-blue-600"
                  placeholder="e.g. Senior Software Engineer"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Summary</label>
                <textarea
                  rows={3}
                  value={newSummary}
                  onChange={(e) => setNewSummary(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-700 focus:outline-blue-600"
                  placeholder="Executive summary of candidate capabilities..."
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
                >
                  {isCreating ? 'Creating...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW RESUME MODAL */}
      {selectedResume && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">{selectedResume.title}</h3>
                <p className="text-[11px] text-slate-500">{selectedResume.target_role || 'General'}</p>
              </div>
              <button onClick={() => setSelectedResume(null)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-700">
              <div>
                <h4 className="font-bold text-slate-900 mb-1">Professional Summary</h4>
                <p className="p-3 rounded-lg bg-slate-50 border border-slate-200 leading-relaxed">
                  {selectedResume.summary || 'No summary provided.'}
                </p>
              </div>

              {selectedResume.parsed_data?.skills && (
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">Extracted Competencies</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedResume.parsed_data.skills.map((c: any, i: number) => (
                      <React.Fragment key={i}>
                        {c.items?.map((item: string) => (
                          <span key={item} className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[11px] font-medium border border-blue-200">
                            {item}
                          </span>
                        ))}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedResume(null)}
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

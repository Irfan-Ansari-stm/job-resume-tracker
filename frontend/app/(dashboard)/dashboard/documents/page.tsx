'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import {
  FolderLock,
  Upload,
  Download,
  Trash2,
  FileText,
  Eye,
  ExternalLink,
  X,
  RefreshCw,
} from 'lucide-react';

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Upload Form State
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('resume');
  const [isUploading, setIsUploading] = useState(false);

  // Preview Modal State
  const [selectedDoc, setSelectedDoc] = useState<any | null>(null);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  const fetchDocs = async () => {
    try {
      const res = await api.get('/documents');
      if (res.success) setDocuments(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  // Handle document blob streaming for preview
  useEffect(() => {
    if (!selectedDoc) {
      if (pdfBlobUrl) URL.revokeObjectURL(pdfBlobUrl);
      setPdfBlobUrl(null);
      setPdfError(null);
      return;
    }

    setLoadingPdf(true);
    setPdfError(null);

    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

    fetch(`${apiUrl}/documents/${selectedDoc.id}/file`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load document (${res.status})`);
        return res.blob();
      })
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        setPdfBlobUrl(url);
      })
      .catch((err) => {
        console.error('Error streaming document:', err);
        setPdfError(err.message || 'Could not stream document inline.');
      })
      .finally(() => {
        setLoadingPdf(false);
      });

    return () => {
      if (pdfBlobUrl) URL.revokeObjectURL(pdfBlobUrl);
    };
  }, [selectedDoc]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', uploadFile);
    formData.append('title', title || uploadFile.name);
    formData.append('category', category);

    try {
      const res = await api.post('/documents/upload', formData);
      if (res.success) {
        setShowUploadModal(false);
        setUploadFile(null);
        setTitle('');
        await fetchDocs();
      }
    } catch (err: any) {
      alert(err.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this document?')) return;
    try {
      await api.delete(`/documents/${id}`);
      setDocuments((prev) => prev.filter((d) => d.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete');
    }
  };

  const getDirectDocUrl = (docId: string) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : '';
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
    return `${apiUrl}/documents/${docId}/file?token=${encodeURIComponent(token || '')}`;
  };

  const getDownloadDocUrl = (docId: string) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : '';
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
    return `${apiUrl}/documents/${docId}/download?token=${encodeURIComponent(token || '')}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Document Vault & Attachments</h1>
          <p className="text-xs text-slate-500 mt-1">
            Secure, encrypted private storage for resumes, cover letters, certificates, and portfolio assets.
          </p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition-colors"
        >
          <Upload className="h-4 w-4" />
          <span>Upload Document</span>
        </button>
      </div>

      {loading ? (
        <div className="py-16 text-center text-xs text-slate-500">Loading documents...</div>
      ) : documents.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-12 text-center">
          <FolderLock className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-900">Document vault is empty</h3>
          <p className="text-xs text-slate-500 mt-1">Upload certificates, cover letters, or portfolio files.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-3 flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 line-clamp-1">{doc.title}</h3>
                    <span className="text-[10px] uppercase font-bold text-slate-400">{doc.category}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(doc.id)}
                  className="text-slate-400 hover:text-rose-600 p-1 rounded-md"
                  title="Delete document"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>{formatDate(doc.created_at)}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedDoc(doc)}
                    className="flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-800"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>Preview</span>
                  </button>
                  <a
                    href={getDownloadDocUrl(doc.id)}
                    download
                    className="flex items-center gap-1 font-semibold text-slate-600 hover:text-slate-900"
                    title="Download document"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </a>
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
              <h3 className="text-sm font-bold text-slate-900">Upload to Document Vault</h3>
              <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700">Select File</label>
                <input
                  type="file"
                  required
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      setUploadFile(f);
                      if (!title) setTitle(f.name);
                    }
                  }}
                  className="mt-1 block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Document Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-blue-600"
                  placeholder="AWS Cloud Practitioner Certificate"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-blue-600"
                >
                  <option value="resume">Resume Document</option>
                  <option value="cover_letter">Cover Letter</option>
                  <option value="certificate">Certification / Degree</option>
                  <option value="portfolio">Portfolio Asset</option>
                  <option value="other">Other Attachment</option>
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
                  className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
                >
                  {isUploading ? 'Uploading...' : 'Save Document'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DOCUMENT PREVIEW MODAL */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-3 sm:p-6 backdrop-blur-xs">
          <div className="w-full max-w-5xl max-h-[92vh] flex flex-col rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
            {/* Modal Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/50 gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">{selectedDoc.title}</h3>
                  <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                    {selectedDoc.category}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Uploaded {formatDate(selectedDoc.created_at)}
                  {selectedDoc.original_filename && ` \u2022 ${selectedDoc.original_filename}`}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={getDownloadDocUrl(selectedDoc.id)}
                  download
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 shadow-2xs transition-colors"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download</span>
                </a>
                <a
                  href={getDirectDocUrl(selectedDoc.id)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 shadow-2xs transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>Open in Tab</span>
                </a>
                <button
                  onClick={() => setSelectedDoc(null)}
                  className="rounded-xl p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30 flex flex-col items-center justify-center">
              {loadingPdf ? (
                <div className="py-24 flex flex-col items-center justify-center gap-3 text-slate-500">
                  <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
                  <p className="text-xs font-semibold">Streaming document preview...</p>
                </div>
              ) : pdfError ? (
                <div className="p-8 text-center max-w-md bg-white rounded-2xl border border-rose-200 shadow-sm">
                  <FileText className="h-10 w-10 text-rose-400 mx-auto mb-2" />
                  <h4 className="text-sm font-bold text-slate-800">Preview Notice</h4>
                  <p className="text-xs text-slate-500 mt-1 mb-4">{pdfError}</p>
                  <a
                    href={getDirectDocUrl(selectedDoc.id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-sm hover:bg-blue-700"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>Open Directly in Browser</span>
                  </a>
                </div>
              ) : pdfBlobUrl ? (
                <div className="w-full rounded-xl overflow-hidden border border-slate-200 bg-white shadow-sm">
                  <iframe
                    src={pdfBlobUrl}
                    className="w-full h-[68vh] rounded-xl"
                    title={selectedDoc.title}
                  />
                </div>
              ) : (
                <div className="py-16 text-center text-xs text-slate-500">
                  Unable to render preview.
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end border-t border-slate-100 px-6 py-3 bg-white">
              <button
                onClick={() => setSelectedDoc(null)}
                className="rounded-lg bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
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

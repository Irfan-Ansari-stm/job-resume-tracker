'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Building2, Plus, Globe, MapPin, Briefcase, Star, Trash2, X } from 'lucide-react';

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const [name, setName] = useState('');
  const [industry, setIndustry] = useState('');
  const [location, setLocation] = useState('');
  const [website, setWebsite] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCompanies = async () => {
    try {
      const res = await api.get('/companies');
      if (res.success) setCompanies(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await api.post('/companies', {
        name,
        industry,
        location,
        website,
        notes,
      });
      if (res.success) {
        setShowAddModal(false);
        setName('');
        setIndustry('');
        setLocation('');
        setWebsite('');
        setNotes('');
        await fetchCompanies();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to save company');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this company?')) return;
    try {
      await api.delete(`/companies/${id}`);
      setCompanies(prev => prev.filter(c => c.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Target Companies</h1>
          <p className="text-xs text-slate-500 mt-1">
            Organize target employers, recruiter contacts, company notes, and application relationships.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Add Company</span>
        </button>
      </div>

      {loading ? (
        <div className="py-16 text-center text-xs text-slate-500">Loading companies...</div>
      ) : companies.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-12 text-center">
          <Building2 className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-900">No companies saved yet</h3>
          <p className="text-xs text-slate-500 mt-1">Add companies you are targeting in your job hunt.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {companies.map(c => (
            <div key={c.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-sm">
                      {c.name[0]}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{c.name}</h3>
                      <p className="text-[11px] text-slate-500">{c.industry || 'Technology'}</p>
                    </div>
                  </div>
                  <button onClick={() => handleDelete(c.id)} className="text-slate-400 hover:text-rose-600 p-1">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-4 space-y-1.5 text-xs text-slate-600">
                  {c.location && (
                    <div className="flex items-center gap-2 text-[11px]">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                      <span>{c.location}</span>
                    </div>
                  )}
                  {c.website && (
                    <div className="flex items-center gap-2 text-[11px]">
                      <Globe className="h-3.5 w-3.5 text-slate-400" />
                      <a href={c.website} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                        {c.website.replace('https://', '')}
                      </a>
                    </div>
                  )}
                </div>

                {c.notes && (
                  <p className="mt-3 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    {c.notes}
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1 font-semibold text-slate-700">
                  <Briefcase className="h-3.5 w-3.5 text-indigo-600" />
                  {c.applications_count || 0} applications
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADD MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-sm font-bold text-slate-900">Add Target Company</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-700">Company Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-blue-600"
                  placeholder="e.g. Capgemini"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700">Industry</label>
                <input
                  type="text"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-blue-600"
                  placeholder="e.g. IT Services & Consulting"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-blue-600"
                  placeholder="e.g. Mumbai, India"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700">Website</label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-blue-600"
                  placeholder="https://company.com"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700">Notes</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs focus:outline-blue-600"
                  placeholder="Recruiter referrals or company research..."
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Company'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

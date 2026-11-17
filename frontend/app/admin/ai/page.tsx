'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Cpu, FileCode, CheckCircle, Save, Clock, AlertCircle } from 'lucide-react';

export default function AdminAiPage() {
  const [prompts, setPrompts] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPrompt, setEditingPrompt] = useState<any | null>(null);
  const [sysPrompt, setSysPrompt] = useState('');
  const [usrPrompt, setUsrPrompt] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const fetchAiData = async () => {
    try {
      const [promptRes, logRes] = await Promise.all([
        api.get('/admin/ai/prompts'),
        api.get('/admin/ai/logs'),
      ]);
      if (promptRes.success) setPrompts(promptRes.data);
      if (logRes.success) setLogs(logRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAiData();
  }, []);

  const handleEdit = (p: any) => {
    setEditingPrompt(p);
    setSysPrompt(p.system_prompt);
    setUsrPrompt(p.user_prompt_template);
  };

  const handleSavePrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPrompt) return;
    setIsSaving(true);

    try {
      const res = await api.put(`/admin/ai/prompts/${editingPrompt.id}`, {
        systemPrompt: sysPrompt,
        userPromptTemplate: usrPrompt,
        currentVersion: 'v1.1',
      });
      if (res.success) {
        alert('Prompt template updated!');
        setEditingPrompt(null);
        await fetchAiData();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update prompt');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-xl font-bold tracking-tight text-white">AI Engine & Prompt Architecture</h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage system prompts, version history, model routing, and live token usage audit logs.
        </p>
      </div>

      {/* Prompts Manager */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <FileCode className="h-4 w-4 text-purple-400" />
          <span>Active System Prompts ({prompts.length})</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {prompts.map(p => (
            <div key={p.id} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold text-purple-400 uppercase">{p.code}</span>
                  <span className="text-[10px] text-slate-500 font-mono">{p.current_version}</span>
                </div>
                <h3 className="text-sm font-bold text-white mt-1">{p.name}</h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">{p.description}</p>
              </div>

              <div className="pt-2 border-t border-slate-800 flex justify-end">
                <button
                  onClick={() => handleEdit(p)}
                  className="rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-purple-700 transition-colors"
                >
                  Edit Prompt
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Prompt Modal / Drawer */}
      {editingPrompt && (
        <div className="rounded-2xl border border-purple-500/40 bg-slate-950 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-white">Edit Prompt: {editingPrompt.name}</h3>
            <button onClick={() => setEditingPrompt(null)} className="text-xs text-slate-400 hover:text-white">
              Cancel
            </button>
          </div>

          <form onSubmit={handleSavePrompt} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300">System Prompt</label>
              <textarea
                rows={4}
                value={sysPrompt}
                onChange={(e) => setSysPrompt(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-900 p-3 text-xs text-slate-200 font-mono focus:outline-purple-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300">User Prompt Template</label>
              <textarea
                rows={3}
                value={usrPrompt}
                onChange={(e) => setUsrPrompt(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-900 p-3 text-xs text-slate-200 font-mono focus:outline-purple-500"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingPrompt(null)}
                className="rounded-lg px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-1.5 rounded-lg bg-purple-600 px-4 py-2 text-xs font-bold text-white hover:bg-purple-700 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                <span>{isSaving ? 'Saving...' : 'Deploy Version'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Live AI Execution Logs */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <Clock className="h-4 w-4 text-purple-400" />
          <span>Real-Time AI Telemetry & Token Logs</span>
        </h3>

        {logs.length === 0 ? (
          <p className="text-xs text-slate-500 py-4">No AI execution logs recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-4 py-2.5">User</th>
                  <th className="px-4 py-2.5">Operation</th>
                  <th className="px-4 py-2.5">Model</th>
                  <th className="px-4 py-2.5">Tokens (Total)</th>
                  <th className="px-4 py-2.5">Duration</th>
                  <th className="px-4 py-2.5">Status</th>
                  <th className="px-4 py-2.5">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {logs.slice(0, 10).map(l => (
                  <tr key={l.id} className="hover:bg-slate-900/50">
                    <td className="px-4 py-2.5 text-slate-300 font-mono text-[11px]">{l.user_email}</td>
                    <td className="px-4 py-2.5 font-semibold text-white">{l.operation_type}</td>
                    <td className="px-4 py-2.5 text-slate-400 font-mono text-[11px]">{l.model}</td>
                    <td className="px-4 py-2.5 font-bold text-purple-300">{l.total_tokens}</td>
                    <td className="px-4 py-2.5 text-slate-400">{l.duration_ms}ms</td>
                    <td className="px-4 py-2.5">
                      <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold">
                        {l.status}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-slate-500 text-[11px]">{formatDate(l.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

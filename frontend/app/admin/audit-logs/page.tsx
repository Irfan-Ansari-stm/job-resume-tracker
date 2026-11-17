'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { History, Shield, AlertTriangle } from 'lucide-react';

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      const res = await api.get('/admin/audit-logs');
      if (res.success) setLogs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-xl font-bold tracking-tight text-white">Security & Administrative Audit Logs</h1>
        <p className="text-xs text-slate-400 mt-1">
          Immutable event log of administrative actions, role assignments, and security-relevant operations.
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400">Loading audit trail...</div>
      ) : logs.length === 0 ? (
        <div className="p-8 text-center text-xs text-slate-500 rounded-2xl border border-slate-800 bg-slate-950/60">
          No audit logs recorded yet.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/60">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-5 py-3">Timestamp</th>
                <th className="px-5 py-3">Action</th>
                <th className="px-5 py-3">Entity Type</th>
                <th className="px-5 py-3">Authorized Admin</th>
                <th className="px-5 py-3">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {logs.map(log => (
                <tr key={log.id} className="hover:bg-slate-900/50">
                  <td className="px-5 py-3 text-slate-400 text-[11px]">{formatDate(log.created_at)}</td>
                  <td className="px-5 py-3 font-mono font-bold text-purple-300 text-[11px]">{log.action}</td>
                  <td className="px-5 py-3 text-slate-300 font-semibold">{log.entity_type}</td>
                  <td className="px-5 py-3 text-slate-400 text-[11px]">{log.user_email || 'System'}</td>
                  <td className="px-5 py-3 text-slate-500 font-mono text-[11px]">{log.ip_address || '127.0.0.1'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

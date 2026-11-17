'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import {
  KeyRound,
  Shield,
  Plus,
  Check,
  X,
  Users,
  ShieldCheck,
  AlertCircle,
  Save,
  Lock,
} from 'lucide-react';

export default function AdminRolesPage() {
  const [activeTab, setActiveTab] = useState<'matrix' | 'staff'>('matrix');
  const [roles, setRoles] = useState<any[]>([]);
  const [permissions, setPermissions] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [selectedRole, setSelectedRole] = useState<any | null>(null);
  const [rolePermIds, setRolePermIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Create role modal
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [roleForm, setRoleForm] = useState({ name: '', displayName: '', description: '' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [rolesRes, permsRes, staffRes] = await Promise.all([
        api.get('/admin/roles'),
        api.get('/admin/permissions'),
        api.get('/admin/staff'),
      ]);

      if (rolesRes.success) {
        setRoles(rolesRes.data);
        if (rolesRes.data.length > 0 && !selectedRole) {
          setSelectedRole(rolesRes.data[1] || rolesRes.data[0]);
        }
      }
      if (permsRes.success) setPermissions(permsRes.data);
      if (staffRes.success) setStaff(staffRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Fetch permissions for selected role
  useEffect(() => {
    if (!selectedRole) return;
    async function loadRolePerms() {
      try {
        const res = await api.get(`/admin/roles/${selectedRole.id}/permissions`);
        if (res.success) {
          setRolePermIds(res.data.map((p: any) => p.id));
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadRolePerms();
  }, [selectedRole]);

  const togglePermission = (permId: string) => {
    if (selectedRole?.name === 'super_admin') {
      alert('Super Administrator retains all system permissions unconditionally.');
      return;
    }
    setRolePermIds(prev =>
      prev.includes(permId) ? prev.filter(id => id !== permId) : [...prev, permId]
    );
  };

  const handleSavePermissions = async () => {
    if (!selectedRole) return;
    setIsSaving(true);
    try {
      const res = await api.post(`/admin/roles/${selectedRole.id}/permissions`, {
        permissionIds: rolePermIds,
      });
      if (res.success) {
        alert('Permission matrix successfully updated!');
        fetchData();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update permissions');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/admin/roles', roleForm);
      if (res.success) {
        setShowRoleModal(false);
        setRoleForm({ name: '', displayName: '', description: '' });
        fetchData();
        alert('Role created!');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to create role');
    }
  };

  // Group permissions by module
  const permissionsByModule = permissions.reduce((acc: any, p: any) => {
    acc[p.module] = acc[p.module] || [];
    acc[p.module].push(p);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-400">Security Governance</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white mt-0.5">Granular Roles & Permission Matrix</h1>
          <p className="text-xs text-slate-400 mt-1">
            Assign least-privilege module authorizations, configure specialized admin staff roles, and audit access rights.
          </p>
        </div>

        <button
          onClick={() => setShowRoleModal(true)}
          className="flex items-center gap-1.5 rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-purple-700 transition-colors shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Create Custom Role</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-px text-xs font-bold">
        <button
          onClick={() => setActiveTab('matrix')}
          className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
            activeTab === 'matrix'
              ? 'border-purple-500 text-purple-400 bg-purple-500/10'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <KeyRound className="h-4 w-4" />
          <span>Role Permission Matrix</span>
        </button>
        <button
          onClick={() => setActiveTab('staff')}
          className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
            activeTab === 'staff'
              ? 'border-purple-500 text-purple-400 bg-purple-500/10'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Administrative Staff ({staff.length})</span>
        </button>
      </div>

      {/* Tab 1: Permission Matrix */}
      {activeTab === 'matrix' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Roles Selector Sidebar */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
              Select Role
            </h3>
            <div className="space-y-1">
              {roles.map((r) => {
                const isSelected = selectedRole?.id === r.id;
                return (
                  <button
                    key={r.id}
                    onClick={() => setSelectedRole(r)}
                    className={`w-full text-left p-3 rounded-xl border transition-all text-xs ${
                      isSelected
                        ? 'bg-purple-600/20 border-purple-500/40 text-white font-bold shadow-md'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold">{r.display_name}</span>
                      {r.is_system && (
                        <span className="text-[9px] uppercase font-bold text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded">
                          System
                        </span>
                      )}
                    </div>
                    <span className="block text-[11px] text-slate-400 font-mono mt-0.5 font-normal">{r.name}</span>
                    <span className="block text-[10px] text-purple-400/80 mt-1">
                      {r.permissions_count || 0} permissions assigned
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Permissions Matrix Grid */}
          <div className="md:col-span-3 rounded-2xl border border-slate-800 bg-slate-950/60 p-6 space-y-6 shadow-xl">
            {selectedRole && (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-bold text-white">{selectedRole.display_name}</h2>
                      <span className="font-mono text-xs text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                        {selectedRole.name}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{selectedRole.description}</p>
                  </div>

                  {selectedRole.name !== 'super_admin' && (
                    <button
                      onClick={handleSavePermissions}
                      disabled={isSaving}
                      className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-700 transition-colors shadow-md disabled:opacity-50 shrink-0"
                    >
                      <Save className="h-4 w-4" />
                      <span>{isSaving ? 'Saving...' : 'Save Matrix'}</span>
                    </button>
                  )}
                </div>

                {selectedRole.name === 'super_admin' ? (
                  <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl text-xs text-purple-200 flex items-center gap-3">
                    <Lock className="h-5 w-5 text-purple-400 shrink-0" />
                    <span>
                      Super Administrator possesses universal platform privileges across all database tables, user sessions, security filters, and billing economics.
                    </span>
                  </div>
                ) : null}

                {/* Modules Grid */}
                <div className="space-y-5">
                  {Object.keys(permissionsByModule).map((moduleName) => (
                    <div key={moduleName} className="space-y-2">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 border-b border-slate-800/80 pb-1">
                        {moduleName} Module
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {permissionsByModule[moduleName].map((p: any) => {
                          const isChecked = selectedRole.name === 'super_admin' || rolePermIds.includes(p.id);
                          return (
                            <label
                              key={p.id}
                              onClick={() => togglePermission(p.id)}
                              className={`flex items-start gap-2.5 p-2.5 rounded-xl border transition-colors cursor-pointer text-xs ${
                                isChecked
                                  ? 'bg-purple-600/10 border-purple-500/30 text-white'
                                  : 'bg-slate-900/30 border-slate-800 text-slate-400 hover:bg-slate-900'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {}}
                                disabled={selectedRole.name === 'super_admin'}
                                className="mt-0.5 rounded text-purple-600 focus:ring-0"
                              />
                              <div className="min-w-0">
                                <span className="font-bold text-xs block text-slate-200">{p.code}</span>
                                <span className="text-[11px] text-slate-400 block line-clamp-1">{p.description}</span>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Administrative Staff Table */}
      {activeTab === 'staff' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Administrator</th>
                <th className="px-4 py-3">Role Code</th>
                <th className="px-4 py-3">Assigned Role</th>
                <th className="px-4 py-3">Account Status</th>
                <th className="px-4 py-3">Last Active</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {staff.map((s) => (
                <tr key={s.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-bold text-white block">{s.first_name} {s.last_name}</span>
                    <span className="text-[11px] text-slate-400">{s.email}</span>
                  </td>
                  <td className="px-4 py-3 font-mono text-purple-300">{s.role}</td>
                  <td className="px-4 py-3 font-semibold text-white">{s.role_display_name || s.role}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                      Active
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-400">{s.last_login_at ? formatDate(s.last_login_at) : 'Never'}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/users/${s.id}`}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white"
                    >
                      Manage Staff
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Role Modal */}
      {showRoleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl text-slate-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-purple-400" />
                Define New Custom Role
              </h2>
              <button onClick={() => setShowRoleModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRole} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-400 mb-1">Display Name *</label>
                <input
                  type="text"
                  required
                  value={roleForm.displayName}
                  onChange={(e) => setRoleForm({ ...roleForm, displayName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-purple-500"
                  placeholder="e.g. Compliance Auditor"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-400 mb-1">Role Code Name *</label>
                <input
                  type="text"
                  required
                  value={roleForm.name}
                  onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-purple-500 font-mono"
                  placeholder="compliance_auditor"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-400 mb-1">Role Description</label>
                <textarea
                  rows={3}
                  value={roleForm.description}
                  onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-purple-500"
                  placeholder="Responsibilities and access scope..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowRoleModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-700 transition-colors"
                >
                  Create Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

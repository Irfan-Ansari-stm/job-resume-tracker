'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import {
  ShieldAlert,
  BarChart4,
  Users,
  FileStack,
  Cpu,
  Layers,
  Building2,
  GitBranch,
  CreditCard,
  KeyRound,
  MessageSquare,
  ShieldCheck,
  FileSpreadsheet,
  Server,
  UserCheck,
  ArrowLeft,
  LogOut,
} from 'lucide-react';

export default function AdminSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navigationGroups = [
    {
      group: 'Core Operations',
      items: [
        { name: 'Dashboard Overview', href: '/admin', icon: BarChart4 },
        { name: 'User Management', href: '/admin/users', icon: Users },
        { name: 'Resume Management', href: '/admin/resumes', icon: FileStack },
        { name: 'AI Resume Engine', href: '/admin/ai', icon: Cpu },
        { name: 'Job Applications', href: '/admin/applications', icon: Layers },
        { name: 'Companies & Jobs', href: '/admin/companies-jobs', icon: Building2 },
        { name: 'Resume Version Tracking', href: '/admin/versions', icon: GitBranch },
      ],
    },
    {
      group: 'Monetization & Access',
      items: [
        { name: 'Subscription & Billing', href: '/admin/subscriptions', icon: CreditCard },
        { name: 'Roles & Permissions', href: '/admin/roles', icon: KeyRound },
        { name: 'Communications & Support', href: '/admin/communication', icon: MessageSquare },
      ],
    },
    {
      group: 'Security & Infrastructure',
      items: [
        { name: 'Security & Audit Logs', href: '/admin/security', icon: ShieldCheck },
        { name: 'Reports & Analytics', href: '/admin/reports', icon: FileSpreadsheet },
        { name: 'System Management', href: '/admin/system', icon: Server },
        { name: 'Super Admin Profile', href: '/admin/profile', icon: UserCheck },
      ],
    },
  ];

  return (
    <aside className="flex flex-col h-screen bg-slate-950 border-r border-slate-800 w-64 select-none text-slate-300 shrink-0">
      {/* Brand Header */}
      <div className="h-16 flex items-center gap-2.5 px-5 border-b border-slate-800/80 shrink-0">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-600 text-white shadow-md shadow-purple-600/30">
          <ShieldAlert className="h-5 w-5" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-bold tracking-tight text-white truncate">Super Admin</span>
          <span className="text-[10px] font-semibold text-purple-400 uppercase tracking-wider">Control Center</span>
        </div>
      </div>

      {/* Return to Candidate Workspace */}
      <div className="px-3 pt-3 shrink-0">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5 text-slate-400" />
          <span>Candidate Workspace</span>
        </Link>
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
        {navigationGroups.map((group) => (
          <div key={group.group} className="space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 pb-1">
              {group.group}
            </div>
            {group.items.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-purple-600/20 text-purple-300 font-semibold border border-purple-500/30'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                  }`}
                >
                  <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-purple-400' : 'text-slate-500'}`} />
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* Admin Footer */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-900/50 shrink-0">
        <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs">
          <div className="min-w-0 flex-1 pr-2">
            <p className="font-semibold text-white truncate">{user?.first_name || 'Super Admin'}</p>
            <p className="text-[10px] text-purple-400 font-medium truncate uppercase">{user?.role || 'SUPER_ADMIN'}</p>
          </div>
          <button
            onClick={logout}
            title="Log out"
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}

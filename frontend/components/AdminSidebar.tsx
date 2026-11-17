'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import {
  ShieldAlert,
  BarChart4,
  Users,
  Cpu,
  FileStack,
  Layers,
  CreditCard,
  Settings,
  History,
  ArrowLeft,
  LogOut,
} from 'lucide-react';

export default function AdminSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const adminNav = [
    { name: 'Platform Overview', href: '/admin', icon: BarChart4 },
    { name: 'User Management', href: '/admin/users', icon: Users },
    { name: 'AI Models & Prompts', href: '/admin/ai', icon: Cpu },
    { name: 'Resumes & Templates', href: '/admin/resumes', icon: FileStack },
    { name: 'Global Applications', href: '/admin/applications', icon: Layers },
    { name: 'Plans & Pricing', href: '/admin/subscriptions', icon: CreditCard },
    { name: 'System Settings', href: '/admin/settings', icon: Settings },
    { name: 'Audit & Security Logs', href: '/admin/audit-logs', icon: History },
  ];

  return (
    <aside className="flex flex-col h-full bg-slate-950 border-r border-slate-800 w-64 select-none text-slate-300">
      {/* Brand Header */}
      <div className="h-16 flex items-center gap-2.5 px-6 border-b border-slate-800/80">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-600 text-white shadow-md shadow-purple-600/30">
          <ShieldAlert className="h-5 w-5" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold tracking-tight text-white">Super Admin</span>
          <span className="text-[10px] font-semibold text-purple-400 uppercase tracking-wider">Control Center</span>
        </div>
      </div>

      {/* Return to User Workspace */}
      <div className="px-3 pt-3">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5 text-slate-400" />
          <span>Candidate Workspace</span>
        </Link>
      </div>

      {/* Nav Items */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 pb-1">
          Platform Administration
        </div>

        {adminNav.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-purple-600/20 text-purple-300 font-semibold border border-purple-500/30'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? 'text-purple-400' : 'text-slate-500'}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>

      {/* Admin Footer */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-900/50">
        <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs">
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-white truncate">{user?.first_name} (Super Admin)</p>
            <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
          </div>
          <button
            onClick={logout}
            title="Log out"
            className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}

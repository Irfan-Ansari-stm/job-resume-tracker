'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import {
  LayoutDashboard,
  FileText,
  Sparkles,
  GitBranch,
  Briefcase,
  Building2,
  BookmarkCheck,
  CalendarDays,
  BarChart3,
  FolderLock,
  Bell,
  CreditCard,
  UserCircle,
  HelpCircle,
  LogOut,
  ShieldCheck,
} from 'lucide-react';

interface SidebarProps {
  onItemClick?: () => void;
}

export default function DashboardSidebar({ onItemClick }: SidebarProps) {
  const pathname = usePathname();
  const { user, isAdmin, logout } = useAuth();

  const navigationItems = [
    { name: 'Dashboard Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'My Resumes', href: '/dashboard/resumes', icon: FileText },
    { name: 'AI Resume Studio', href: '/dashboard/ai-studio', icon: Sparkles, badge: 'AI' },
    { name: 'Resume Versions', href: '/dashboard/versions', icon: GitBranch },
    { name: 'Job Applications', href: '/dashboard/applications', icon: Briefcase },
    { name: 'Companies', href: '/dashboard/companies', icon: Building2 },
    { name: 'Saved Jobs', href: '/dashboard/jobs', icon: BookmarkCheck },
    { name: 'Interviews & Prep', href: '/dashboard/interviews', icon: CalendarDays },
    { name: 'Analytics & Insights', href: '/dashboard/analytics', icon: BarChart3 },
    { name: 'Document Vault', href: '/dashboard/documents', icon: FolderLock },
    { name: 'Notifications', href: '/dashboard/notifications', icon: Bell },
    { name: 'Plan & Billing', href: '/dashboard/billing', icon: CreditCard },
    { name: 'Profile & Account', href: '/dashboard/profile', icon: UserCircle },
    { name: 'Help & Support', href: '/dashboard/help', icon: HelpCircle },
  ];

  return (
    <aside className="flex flex-col h-full bg-white border-r border-slate-200 w-64 select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center gap-2.5 px-6 border-b border-slate-200">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20">
          <Sparkles className="h-4 w-4" />
        </div>
        <Link href="/dashboard" className="flex flex-col">
          <span className="text-base font-bold tracking-tight text-slate-900">SmartResume</span>
          <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider">Candidate Portal</span>
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {isAdmin && (
          <div className="mb-3 px-2">
            <Link
              href="/admin"
              className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors border border-purple-200"
            >
              <ShieldCheck className="h-4 w-4 text-purple-600" />
              <span>Switch to Admin Center</span>
            </Link>
          </div>
        )}

        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 pb-1">
          Workspace
        </div>

        {navigationItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onItemClick}
              className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-blue-50 text-blue-700 font-semibold shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`h-4 w-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-[9px] font-bold text-white px-1.5 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* User Info & Logout Footer */}
      <div className="p-3 border-t border-slate-200 bg-slate-50/70">
        <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200/80 shadow-2xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs shrink-0">
              {user?.first_name?.[0] || 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-800 truncate">
                {user ? `${user.first_name} ${user.last_name}` : 'Job Seeker'}
              </p>
              <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            title="Log out"
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}

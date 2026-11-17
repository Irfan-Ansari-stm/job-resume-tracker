'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import {
  Menu,
  Bell,
  Sparkles,
  Search,
  ExternalLink,
  CheckCircle,
} from 'lucide-react';

interface HeaderProps {
  onMobileMenuToggle: () => void;
}

export default function DashboardHeader({ onMobileMenuToggle }: HeaderProps) {
  const { user } = useAuth();
  const [credits, setCredits] = useState<number>(15);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const credRes = await api.get('/ai/credits');
        if (credRes.success && credRes.data) {
          setCredits(credRes.data.remaining_credits ?? 15);
        }

        const notifRes = await api.get('/notifications');
        if (notifRes.success && notifRes.data) {
          setNotifications(notifRes.data);
        }
      } catch {
        // Fallback gracefully
      }
    }
    loadData();
  }, []);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const markAllRead = async () => {
    try {
      await api.post('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch {
      // Ignored
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 sm:px-6 lg:px-8 backdrop-blur-md">
      {/* Left Area: Mobile hamburger & title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMobileMenuToggle}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
          aria-label="Open Sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
          <span>SaaS Platform</span>
          <span>/</span>
          <span className="font-semibold text-slate-800">Job Seeker Workspace</span>
        </div>
      </div>

      {/* Right Area: Credits Pill, Notifications, Quick Actions */}
      <div className="flex items-center gap-3">
        {/* AI Credits Pill */}
        <Link
          href="/dashboard/billing"
          className="flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50/80 px-3 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition-colors"
          title="Click to view subscription and AI credits"
        >
          <Sparkles className="h-3.5 w-3.5 text-blue-600 animate-pulse" />
          <span>{credits} AI Credits</span>
        </Link>

        {/* Public Website Preview Link */}
        <Link
          href="/"
          target="_blank"
          className="hidden md:flex items-center gap-1 text-xs text-slate-500 hover:text-blue-600 transition-colors"
        >
          <span>Marketing Site</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 transition-colors"
            title="Notifications"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-200 bg-white p-3 shadow-xl z-50">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
                <span className="text-xs font-bold text-slate-800">Notifications ({unreadCount})</span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-[11px] font-medium text-blue-600 hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {notifications.length === 0 ? (
                  <p className="py-4 text-center text-xs text-slate-400">No notifications yet.</p>
                ) : (
                  notifications.slice(0, 5).map((n) => (
                    <div
                      key={n.id}
                      className={`p-2 rounded-lg text-xs transition-colors ${
                        n.is_read ? 'bg-slate-50 text-slate-600' : 'bg-blue-50/70 text-slate-800 font-medium'
                      }`}
                    >
                      <div className="font-semibold text-slate-900">{n.title}</div>
                      <div className="text-[11px] text-slate-600 mt-0.5">{n.message}</div>
                    </div>
                  ))
                )}
              </div>
              <div className="border-t border-slate-100 pt-2 mt-2 text-center">
                <Link
                  href="/dashboard/notifications"
                  onClick={() => setShowNotifications(false)}
                  className="text-xs font-semibold text-blue-600 hover:underline"
                >
                  View all notifications
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

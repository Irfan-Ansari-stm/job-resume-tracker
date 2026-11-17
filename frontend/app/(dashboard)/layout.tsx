'use client';

import React, { useState, useEffect } from 'react';
import DashboardSidebar from '@/components/DashboardSidebar';
import DashboardHeader from '@/components/DashboardHeader';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { ShieldAlert, ArrowRight, X } from 'lucide-react';

interface AssistedAccessData {
  sessionId: string;
  targetUser: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
  };
  reason: string;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [assistedAccess, setAssistedAccess] = useState<AssistedAccessData | null>(null);
  const [isEndingAssisted, setIsEndingAssisted] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('assisted_access');
      if (stored) {
        setAssistedAccess(JSON.parse(stored));
      }
    } catch {
      // ignore parsing error
    }
  }, []);

  const handleExitAssistedMode = async () => {
    if (!assistedAccess) return;
    setIsEndingAssisted(true);
    try {
      await api.post('/admin/assisted-access/end', { sessionId: assistedAccess.sessionId });
    } catch (err) {
      console.error('Error ending assisted session', err);
    } finally {
      localStorage.removeItem('assisted_access');
      const targetId = assistedAccess.targetUser.id;
      setAssistedAccess(null);
      setIsEndingAssisted(false);
      router.push(`/admin/users/${targetId}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <span className="text-xs font-semibold text-slate-500">Loading your workspace...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 flex-col">
      {/* Persistent Assisted Access Banner */}
      {assistedAccess && (
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white px-4 py-2 text-xs shadow-md z-50 flex items-center justify-between border-b border-amber-800">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/20 text-white font-bold animate-pulse">
              <ShieldAlert className="h-4 w-4" />
            </span>
            <div className="truncate">
              <strong className="uppercase tracking-wider mr-1 text-[11px] font-extrabold bg-black/20 px-1.5 py-0.5 rounded">
                Assisted Access Mode
              </strong>
              <span>
                You are currently assisting <strong>{assistedAccess.targetUser.first_name} {assistedAccess.targetUser.last_name}</strong> ({assistedAccess.targetUser.email}).
                Actions are logged under session <code className="bg-black/25 px-1 py-0.5 rounded font-mono text-[10px]">{assistedAccess.sessionId.slice(0, 8)}...</code>
              </span>
            </div>
          </div>
          <button
            onClick={handleExitAssistedMode}
            disabled={isEndingAssisted}
            className="shrink-0 flex items-center gap-1.5 px-3 py-1 bg-white text-amber-900 rounded-md font-bold text-xs hover:bg-amber-50 active:scale-95 transition-all shadow-xs"
          >
            <span>{isEndingAssisted ? 'Exiting...' : 'Exit Assisted Mode'}</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden lg:flex lg:shrink-0">
          <DashboardSidebar />
        </div>

        {/* Mobile Sidebar Overlay */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <div
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <div className="relative flex w-full max-w-xs flex-1 flex-col bg-white">
              <DashboardSidebar onItemClick={() => setMobileSidebarOpen(false)} />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex flex-1 flex-col overflow-y-auto">
          <DashboardHeader onMobileMenuToggle={() => setMobileSidebarOpen(true)} />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

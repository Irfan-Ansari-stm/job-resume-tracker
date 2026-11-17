import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';

export const metadata: Metadata = {
  title: 'SmartResume AI | One Resume. Multiple Opportunities. Every Application Organized.',
  description: 'AI-Powered Smart Resume Management Platform. Customize your resume for every job without hallucinating qualifications, track versions, and manage your job applications.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

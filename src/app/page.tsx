'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Scale } from 'lucide-react';

export default function RootPage() {
  const router = useRouter();
  const { profile, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!profile) {
      router.replace('/login');
    } else if (profile.role === 'client') {
      router.replace('/portal/dashboard');
    } else {
      router.replace('/dashboard');
    }
  }, [profile, loading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#f5f4f0' }}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg">
          <Scale className="w-6 h-6 text-white" />
        </div>
        <div className="w-5 h-5 border-2 border-amber-300 border-t-amber-600 rounded-full animate-spin" />
        <p className="text-xs text-stone-400">Loading Legal Eagle…</p>
      </div>
    </div>
  );
}

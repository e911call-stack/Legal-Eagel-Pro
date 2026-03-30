'use client';

import { Scale, Wifi, RefreshCw } from 'lucide-react';

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6"
      style={{ background: '#f5f4f0', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      <div className="text-center max-w-sm">
        {/* Logo */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center mx-auto mb-6 shadow-lg">
          <Scale className="w-8 h-8 text-white" />
        </div>

        {/* Offline icon */}
        <div className="w-12 h-12 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center mx-auto mb-4">
          <Wifi className="w-5 h-5 text-stone-400" />
        </div>

        <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          className="text-2xl font-semibold text-stone-900 mb-2">
          You're offline
        </h1>
        <p className="text-stone-500 text-sm leading-relaxed mb-6">
          Legal Eagle needs an internet connection to load new case data. Your recently viewed cases may still be available.
        </p>

        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold transition-colors shadow-sm">
          <RefreshCw className="w-4 h-4" />
          Try again
        </button>

        <p className="text-xs text-stone-400 mt-8">
          Legal Eagle — Legal Accountability Platform
        </p>
      </div>
    </div>
  );
}

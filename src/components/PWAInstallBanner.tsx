'use client';

import { useState, useEffect } from 'react';
import { Download, X, Scale } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
  prompt(): Promise<void>;
}

export function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [shown, setShown] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if already dismissed this session
    if (sessionStorage.getItem('pwa_dismissed')) return;

    // Check if already installed (display mode = standalone)
    if (window.matchMedia('(display-mode: standalone)').matches) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show banner after a short delay so it doesn't compete with page load
      setTimeout(() => setShown(true), 3000);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  async function handleInstall() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setShown(false);
    setDeferredPrompt(null);
  }

  function handleDismiss() {
    setShown(false);
    setDismissed(true);
    sessionStorage.setItem('pwa_dismissed', '1');
  }

  if (!shown || dismissed) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 lg:left-auto lg:right-5 lg:w-80 z-50 animate-slide-up">
      <div className="bg-white border border-stone-200 rounded-2xl shadow-xl p-4">
        <button onClick={handleDismiss}
          className="absolute top-3 right-3 text-stone-400 hover:text-stone-600 transition-colors">
          <X className="w-4 h-4" />
        </button>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center flex-shrink-0 shadow-sm">
            <Scale className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0 pr-4">
            <p className="text-sm font-bold text-stone-800 mb-0.5">Install Legal Eagle</p>
            <p className="text-xs text-stone-400 leading-relaxed">
              Add to your home screen for faster access and offline case viewing.
            </p>
          </div>
        </div>
        <div className="flex gap-2 mt-3">
          <button onClick={handleDismiss}
            className="flex-1 py-2 rounded-xl border border-stone-200 text-xs text-stone-500 font-medium hover:bg-stone-50 transition-colors">
            Not now
          </button>
          <button onClick={handleInstall}
            className="flex-1 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm">
            <Download className="w-3.5 h-3.5" /> Install
          </button>
        </div>
      </div>
    </div>
  );
}

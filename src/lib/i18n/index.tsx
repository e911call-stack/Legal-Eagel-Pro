'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import en from './locales/en';
import es from './locales/es';
import zh from './locales/zh';
import ar from './locales/ar';
import hi from './locales/hi';
import type { Translations } from './locales/en';

export type Locale = 'en' | 'es' | 'zh' | 'ar' | 'hi';

export const LOCALES: {
  code: Locale; label: string; native: string; dir: 'ltr' | 'rtl'; flag: string;
}[] = [
  { code: 'en', label: 'English', native: 'English',  dir: 'ltr', flag: '🇺🇸' },
  { code: 'es', label: 'Spanish', native: 'Español',  dir: 'ltr', flag: '🇪🇸' },
  { code: 'zh', label: 'Chinese', native: '中文',      dir: 'ltr', flag: '🇨🇳' },
  { code: 'ar', label: 'Arabic',  native: 'العربية',   dir: 'rtl', flag: '🇸🇦' },
  { code: 'hi', label: 'Hindi',   native: 'हिन्दी',   dir: 'ltr', flag: '🇮🇳' },
];

const TRANSLATIONS: Record<Locale, Translations> = { en, es, zh, ar, hi };

interface I18nContextValue {
  locale: Locale;
  t: Translations;
  setLocale: (locale: Locale) => void;
  dir: 'ltr' | 'rtl';
}

const I18nContext = createContext<I18nContextValue>({
  locale: 'en', t: en, setLocale: () => {}, dir: 'ltr',
});

// ─── Provider ─────────────────────────────────────────────────────────────────
export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');
  // Debounce timer ref so we don't hammer the API on rapid switches
  const persistTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load saved locale from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('le_locale') as Locale | null;
      if (saved && LOCALES.find(l => l.code === saved)) setLocaleState(saved);
    } catch {}
  }, []);

  // Apply dir + lang attrs to <html> on every locale change
  useEffect(() => {
    const info = LOCALES.find(l => l.code === locale)!;
    document.documentElement.setAttribute('lang', locale);
    document.documentElement.setAttribute('dir', info.dir);
  }, [locale]);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);

    // 1. Always persist to localStorage immediately (works without DB)
    try { localStorage.setItem('le_locale', newLocale); } catch {}

    // 2. Debounce DB write — fire 800 ms after the last change
    if (persistTimer.current) clearTimeout(persistTimer.current);
    persistTimer.current = setTimeout(async () => {
      try {
        await fetch('/api/profile', {
          method:  'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ language: newLocale }),
        });
      } catch {
        // Silently ignore network errors — localStorage is the fallback
      }
    }, 800);
  }, []);

  const dir = LOCALES.find(l => l.code === locale)?.dir ?? 'ltr';

  return (
    <I18nContext.Provider value={{ locale, t: TRANSLATIONS[locale], setLocale, dir }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}

// ─── Language Switcher ─────────────────────────────────────────────────────────
export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale } = useI18n();
  const [open, setOpen]     = useState(false);
  const [dropPos, setDropPos] = useState({ top: 0, left: 0, width: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const current = LOCALES.find(l => l.code === locale)!;
  const DROPDOWN_H = 5 * 36 + 32;

  function handleOpen() {
    if (!open && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - r.bottom;
      const openUp = spaceBelow < DROPDOWN_H + 8;
      setDropPos({
        top:   openUp ? r.top - DROPDOWN_H - 4 : r.bottom + 4,
        left:  r.left,
        width: Math.max(r.width, 164),
      });
    }
    setOpen(p => !p);
  }

  function pick(code: Locale) {
    setLocale(code);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [open]);

  return (
    <>
      <button ref={btnRef} onClick={handleOpen}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-white/10 bg-white/5 text-xs text-slate-300 hover:bg-white/10 hover:text-white transition-all duration-200 font-medium w-full">
        <span className="text-base leading-none">{current.flag}</span>
        {!compact && <span className="flex-1 text-left truncate">{current.native}</span>}
        <span className="text-slate-500 text-[10px] transition-transform duration-200"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>▾</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0" style={{ zIndex: 9998 }} onClick={() => setOpen(false)} />
          <div style={{ position: 'fixed', top: dropPos.top, left: dropPos.left, minWidth: dropPos.width, zIndex: 9999 }}
            className="bg-white border border-stone-200 rounded-xl shadow-2xl overflow-hidden">
            <div className="px-3 pt-2 pb-1 border-b border-stone-100">
              <span className="text-[9px] text-stone-400 font-semibold uppercase tracking-widest">Language</span>
            </div>
            {LOCALES.map(l => (
              <button key={l.code} onClick={() => pick(l.code)}
                className={`w-full text-left px-3 py-2.5 text-xs flex items-center gap-2.5 transition-colors duration-150 ${
                  l.code === locale
                    ? 'bg-amber-50 text-amber-700 font-semibold'
                    : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                }`}>
                <span className="text-base leading-none w-5 text-center">{l.flag}</span>
                <span className="flex-1">{l.native}</span>
                <span className="text-stone-400 text-[10px] font-medium">{l.label}</span>
                {l.dir === 'rtl' && (
                  <span className="text-[8px] text-amber-600 border border-amber-300 bg-amber-50 px-1 py-0.5 rounded font-bold">RTL</span>
                )}
                {l.code === locale && <span className="text-amber-500 text-[10px]">✓</span>}
              </button>
            ))}
          </div>
        </>
      )}
    </>
  );
}

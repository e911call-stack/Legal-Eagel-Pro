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

// ─── Context ──────────────────────────────────────────────────
interface I18nContextValue {
  locale: Locale;
  t: Translations;
  setLocale: (locale: Locale) => void;
  dir: 'ltr' | 'rtl';
}

const I18nContext = createContext<I18nContextValue>({
  locale: 'en',
  t: en,
  setLocale: () => {},
  dir: 'ltr',
});

// ─── Provider ─────────────────────────────────────────────────
export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('le_locale') as Locale | null;
      if (saved && LOCALES.find(l => l.code === saved)) setLocaleState(saved);
    } catch {}
  }, []);

  useEffect(() => {
    const info = LOCALES.find(l => l.code === locale)!;
    document.documentElement.setAttribute('lang', locale);
    document.documentElement.setAttribute('dir', info.dir);
  }, [locale]);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    try { localStorage.setItem('le_locale', newLocale); } catch {}
  }, []);

  const dir = LOCALES.find(l => l.code === locale)?.dir ?? 'ltr';

  return (
    <I18nContext.Provider value={{ locale, t: TRANSLATIONS[locale], setLocale, dir }}>
      {children}
    </I18nContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────
export function useI18n() {
  return useContext(I18nContext);
}

// ─── Language Switcher ─────────────────────────────────────────
// Uses position:fixed + getBoundingClientRect so the dropdown
// escapes any parent with overflow:hidden (e.g. the sidebar).
export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale } = useI18n();
  const [open, setOpen] = useState(false);
  // Coordinates for the fixed-position dropdown
  const [dropPos, setDropPos] = useState({ top: 0, left: 0, width: 0, openUp: false });
  const btnRef = useRef<HTMLButtonElement>(null);
  const current = LOCALES.find(l => l.code === locale)!;

  // Dropdown height estimate: 5 options × 36px each + 8px padding
  const DROPDOWN_H = 5 * 36 + 8;

  function handleOpen() {
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const openUp = spaceBelow < DROPDOWN_H + 8;
      setDropPos({
        top:    openUp ? rect.top - DROPDOWN_H - 4 : rect.bottom + 4,
        left:   rect.left,
        width:  Math.max(rect.width, 160),
        openUp,
      });
    }
    setOpen(prev => !prev);
  }

  function pick(code: Locale) {
    setLocale(code);
    setOpen(false);
  }

  // Close on scroll / resize so position doesn't go stale
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
      <button
        ref={btnRef}
        onClick={handleOpen}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-white/10 bg-white/5 text-xs text-slate-300 hover:bg-white/10 hover:text-white transition-all duration-200 font-medium w-full"
        style={{ minWidth: 0 }}
      >
        <span className="text-base leading-none">{current.flag}</span>
        {!compact && (
          <span className="flex-1 text-left truncate">{current.native}</span>
        )}
        <span
          className="text-slate-500 transition-transform duration-200 text-[10px]"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          ▾
        </span>
      </button>

      {open && (
        <>
          {/* Backdrop — catches outside clicks */}
          <div
            className="fixed inset-0"
            style={{ zIndex: 9998 }}
            onClick={() => setOpen(false)}
          />

          {/* Dropdown — fixed to viewport, escapes sidebar overflow */}
          <div
            style={{
              position: 'fixed',
              top:      dropPos.top,
              left:     dropPos.left,
              minWidth: dropPos.width,
              zIndex:   9999,
            }}
            className="bg-white border border-stone-200 rounded-xl shadow-2xl overflow-hidden"
          >
            {/* Header label */}
            <div className="px-3 pt-2 pb-1 border-b border-stone-100">
              <span className="text-[9px] text-stone-400 font-semibold uppercase tracking-widest">
                Language
              </span>
            </div>

            {LOCALES.map(l => (
              <button
                key={l.code}
                onClick={() => pick(l.code)}
                className={`
                  w-full text-left px-3 py-2.5 text-xs flex items-center gap-2.5
                  transition-colors duration-150
                  ${l.code === locale
                    ? 'bg-amber-50 text-amber-700 font-semibold'
                    : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'}
                `}
              >
                <span className="text-base leading-none w-5 text-center">{l.flag}</span>
                <span className="flex-1">{l.native}</span>
                <span className="text-stone-400 text-[10px] font-medium">{l.label}</span>
                {l.dir === 'rtl' && (
                  <span className="text-[8px] text-amber-600 border border-amber-300 bg-amber-50 px-1 py-0.5 rounded font-bold">
                    RTL
                  </span>
                )}
                {l.code === locale && (
                  <span className="text-amber-500 text-[10px]">✓</span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </>
  );
}

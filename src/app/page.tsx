'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Shield, ArrowRight, CheckCircle, Menu, X, Sun, Moon, Globe,
  ChevronDown, AlertTriangle, Bell, DollarSign,
  XCircle, Star, Plus, Minus
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { landing, type LandingLocale, type LandingT } from '@/lib/landing/translations';

// ─── Auth check ───────────────────────────────────────────────────────────────
function useIsLoggedIn() {
  const [role, setRole] = useState<string | null>(null);
  useEffect(() => {
    const match = document.cookie.match(/(?:^|;\s*)le_demo_role=([^;]+)/);
    setRole(match ? match[1] : null);
  }, []);
  return role;
}

// ─── Dark mode (defaults to dark) ────────────────────────────────────────────
function useDarkMode() {
  const [dark, setDark] = useState(true);
  useEffect(() => {
    const stored = localStorage.getItem('le_theme');
    setDark(stored ? stored === 'dark' : true);
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('le_theme', dark ? 'dark' : 'light');
  }, [dark]);
  return [dark, setDark] as const;
}

// ─── Intersection observer ────────────────────────────────────────────────────
function useInView(threshold = 0.12) {
  const ref = useRef<Element>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setInView(true); },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView] as const;
}

function Reveal({ children, delay = 0, className = '' }: {
  children: React.ReactNode; delay?: number; className?: string;
}) {
  const [ref, inView] = useInView();
  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} className={className} style={{
      opacity: inView ? 1 : 0,
      transform: inView ? 'translateY(0)' : 'translateY(28px)',
      transition: `opacity 0.65s ease ${delay}s, transform 0.65s ease ${delay}s`,
    }}>
      {children}
    </div>
  );
}

// ─── Counter ──────────────────────────────────────────────────────────────────
function Counter({ to }: { to: string }) {
  const [val, setVal] = useState('0');
  const [ref, inView] = useInView();
  useEffect(() => {
    if (!inView) return;
    const n = parseFloat(to.replace(/[^0-9.]/g, ''));
    const isInt = Number.isInteger(n);
    const suffix = to.replace(/[0-9.,]/g, '');
    let cur = 0;
    const inc = n / (1400 / 16);
    const t = setInterval(() => {
      cur = Math.min(cur + inc, n);
      setVal((isInt ? Math.round(cur) : cur.toFixed(1)) + suffix);
      if (cur >= n) clearInterval(t);
    }, 16);
    return () => clearInterval(t);
  }, [inView, to]);
  return <span ref={ref as React.RefObject<HTMLSpanElement>}>{val}</span>;
}

const LANG_LIST: { code: LandingLocale; flag: string }[] = [
  { code: 'en', flag: '🇺🇸' },
  { code: 'ar', flag: '🇸🇦' },
  { code: 'es', flag: '🇪🇸' },
  { code: 'zh', flag: '🇨🇳' },
  { code: 'hi', flag: '🇮🇳' },
];

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const router = useRouter();
  const [dark, setDark] = useDarkMode();
  const [locale, setLocale] = useState<LandingLocale>('en');
  const [mobileMenu, setMenu] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const demoRole = useIsLoggedIn();
  const t: LandingT = landing[locale];
  const isRTL = t.dir === 'rtl';

  useEffect(() => {
    if (demoRole) {
      router.replace(demoRole === 'client' ? '/portal/dashboard' : '/dashboard');
    }
  }, [demoRole, router]);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 48);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  // ── Styles ──────────────────────────────────────────────────────────────────
  const pageBg    = dark ? 'bg-slate-950'  : 'bg-slate-50';
  const cardBg    = dark ? 'bg-slate-900'  : 'bg-white';
  const cardBdr   = dark ? 'border-slate-800' : 'border-slate-200';
  const textPri   = dark ? 'text-white'       : 'text-slate-900';
  const textSec   = dark ? 'text-slate-400'   : 'text-slate-600';
  const textMut   = dark ? 'text-slate-500'   : 'text-slate-400';
  const altBg     = dark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200';
  const navBg     = scrolled
    ? (dark ? 'bg-slate-950/96 border-slate-800' : 'bg-white/96 border-slate-200')
    : 'bg-transparent border-transparent';

  const redBtn  = 'inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-black text-sm tracking-wide shadow-xl shadow-red-600/30 transition-all duration-200 hover:scale-105 active:scale-100';
  const ghostBtn = `inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl border-2 ${dark ? 'border-slate-700 text-slate-300 hover:border-red-500 hover:text-red-400' : 'border-slate-300 text-slate-600 hover:border-red-600 hover:text-red-600'} font-bold text-sm tracking-wide transition-all duration-200`;

  return (
    <div className={`min-h-screen ${pageBg}`} dir={isRTL ? 'rtl' : 'ltr'}
      style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>

      {/* ── ALERT BANNER ── */}
      <div className="bg-red-600 text-white text-center py-2.5 px-4 relative z-50">
        <p className="text-xs sm:text-sm font-bold tracking-wide"
          dangerouslySetInnerHTML={{ __html: t.alert + ' ' }}
        />
      </div>

      {/* ── NAVBAR ── */}
      <header className={`fixed top-9 inset-x-0 z-40 border-b backdrop-blur-md transition-all duration-300 ${navBg}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center shadow-lg shadow-red-600/30">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className={`text-lg font-black ${textPri} tracking-tight`}>
              Legal<span className="text-red-500">Eagle</span>
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-7">
            {[
              { label: t.nav.howItWorks, href: '#how'      },
              { label: t.nav.warnings,   href: '#warnings' },
              { label: t.nav.pricing,    href: '#pricing'  },
              { label: t.nav.faq,        href: '#faq'      },
            ].map(item => (
              <a key={item.href} href={item.href}
                className={`text-sm font-semibold ${textSec} hover:text-red-500 transition-colors`}>
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {/* Language picker */}
            <div className="relative hidden sm:block">
              <button onClick={() => setLangOpen(!langOpen)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border ${cardBdr} text-xs ${textSec} hover:text-red-500 transition-all`}>
                <Globe className="w-3.5 h-3.5" />
                <span>{LANG_LIST.find(l => l.code === locale)?.flag}</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${langOpen ? 'rotate-180' : ''}`} />
              </button>
              {langOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setLangOpen(false)} />
                  <div className={`absolute ${isRTL ? 'left-0' : 'right-0'} top-full mt-1 w-36 ${cardBg} border ${cardBdr} rounded-xl shadow-2xl overflow-hidden z-50`}>
                    {LANG_LIST.map(l => (
                      <button key={l.code} onClick={() => { setLocale(l.code); setLangOpen(false); }}
                        className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2 transition-colors ${
                          l.code === locale
                            ? 'bg-red-50 text-red-700 font-bold dark:bg-red-900/20 dark:text-red-400'
                            : `${textSec} hover:bg-slate-50 dark:hover:bg-slate-800`
                        }`}>
                        <span>{l.flag}</span>
                        <span>{landing[l.code].nav.signIn === 'Sign In' ? 'English' :
                          l.code === 'ar' ? 'العربية' :
                          l.code === 'es' ? 'Español' :
                          l.code === 'zh' ? '中文' : 'हिन्दी'}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Dark mode */}
            <button onClick={() => setDark(!dark)}
              className={`p-2 rounded-lg border ${cardBdr} ${textSec} hover:text-red-500 transition-all`}>
              {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <Link href="/login"
              className={`hidden sm:block text-sm font-semibold ${textSec} hover:text-red-500 transition-colors px-3 py-1.5`}>
              {t.nav.signIn}
            </Link>
            <Link href="/onboarding"
              className={`${redBtn} text-xs py-2 px-4 hidden sm:flex !shadow-md`}>
              {t.nav.protect}
            </Link>

            <button className={`lg:hidden p-2 ${textSec}`} onClick={() => setMenu(!mobileMenu)}>
              {mobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileMenu && (
          <div className={`lg:hidden border-t ${cardBdr} ${cardBg} px-4 py-4 space-y-3`}>
            {[
              { label: t.nav.howItWorks, href: '#how'      },
              { label: t.nav.warnings,   href: '#warnings' },
              { label: t.nav.pricing,    href: '#pricing'  },
              { label: t.nav.faq,        href: '#faq'      },
            ].map(item => (
              <a key={item.href} href={item.href} onClick={() => setMenu(false)}
                className={`block text-sm font-semibold ${textSec} py-1.5`}>
                {item.label}
              </a>
            ))}
            {/* Mobile language picker */}
            <div className="flex gap-2 pt-1 flex-wrap">
              {LANG_LIST.map(l => (
                <button key={l.code} onClick={() => { setLocale(l.code); setMenu(false); }}
                  className={`text-xl transition-all ${l.code === locale ? 'scale-125 opacity-100' : 'opacity-40'}`}>
                  {l.flag}
                </button>
              ))}
            </div>
            <div className="flex gap-2 pt-1">
              <Link href="/login" onClick={() => setMenu(false)}
                className={`flex-1 text-center py-2.5 border ${cardBdr} rounded-xl text-sm font-semibold ${textSec}`}>
                {t.nav.signIn}
              </Link>
              <Link href="/onboarding" onClick={() => setMenu(false)}
                className="flex-1 text-center py-2.5 bg-red-600 text-white rounded-xl text-sm font-black">
                {t.nav.protect}
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ── HERO ── */}
      <section className="relative pt-44 pb-20 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] opacity-25"
            style={{ background: 'radial-gradient(ellipse, #dc2626 0%, transparent 70%)', filter: 'blur(80px)' }} />
          <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: 'linear-gradient(#888 1px,transparent 1px),linear-gradient(90deg,#888 1px,transparent 1px)', backgroundSize: '48px 48px' }} />
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10 text-center">
          <div style={{ animation: 'fadeIn 0.5s ease' }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/25 text-red-400 text-xs font-black mb-8 tracking-widest uppercase">
            <AlertTriangle className="w-3.5 h-3.5" />
            {t.hero.badge}
          </div>

          <h1 style={{ animation: 'slideUp 0.6s ease 0.1s both' }}
            className={`text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black ${textPri} leading-[1.05] mb-4 tracking-tight`}>
            {t.hero.headline}<br />
            <span className={`font-normal text-[0.7em] ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
              {t.hero.headlineSub}
            </span>
          </h1>

          <p style={{ animation: 'slideUp 0.6s ease 0.2s both' }}
            className={`text-lg sm:text-xl ${textSec} leading-relaxed mb-10 max-w-2xl mx-auto`}
            dangerouslySetInnerHTML={{ __html: t.hero.sub }} />

          <div style={{ animation: 'slideUp 0.6s ease 0.3s both' }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link href="/onboarding" className={redBtn}>
              {t.hero.cta1} <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/login" className={ghostBtn}>
              {t.hero.cta2} →
            </Link>
          </div>

          <p style={{ animation: 'slideUp 0.6s ease 0.38s both' }}
            className={`text-xs ${textMut} font-medium mb-7`}>
            {t.hero.trustLine}
          </p>

          {/* Social proof */}
          <div style={{ animation: 'slideUp 0.6s ease 0.45s both' }}
            className="flex items-center justify-center gap-4 flex-wrap">
            <div className="flex -space-x-2">
              {['JH','MR','AL','KP','SC','DB'].map((i, idx) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-900 flex items-center justify-center text-[9px] font-black text-white"
                  style={{ background: ['#dc2626','#b91c1c','#991b1b','#7f1d1d','#dc2626','#b91c1c'][idx], zIndex: 6 - idx }}>
                  {i}
                </div>
              ))}
            </div>
            <div className={`text-sm ${textSec} text-center sm:text-left`}>
              <div className="flex items-center gap-1 justify-center sm:justify-start mb-0.5">
                {[0,1,2,3,4].map(i => <Star key={i} className="w-3.5 h-3.5 text-red-500 fill-red-500" />)}
                <span className={`ml-1 font-bold ${textPri}`}>4.9</span>
              </div>
              <span dangerouslySetInnerHTML={{ __html: t.hero.socialProof }} />
            </div>
          </div>
        </div>
      </section>

      {/* ── JAMES STORY ── */}
      <section className={`py-16 border-y ${altBg}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <Reveal>
            <div className={`rounded-2xl border-l-4 border-red-600 ${dark ? 'bg-slate-900' : 'bg-white'} p-8 shadow-xl`}>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-red-600/10 border border-red-600/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-xl">📋</span>
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-red-500 mb-2">
                    {t.james.eyebrow}
                  </p>
                  <h2 className={`text-xl sm:text-2xl font-black ${textPri} mb-4 leading-tight`}
                    dangerouslySetInnerHTML={{ __html: t.james.headline.replace('<red>', '<span class="text-red-500">').replace('</red>', '</span>') }} />
                  <p className={`${textSec} text-sm leading-relaxed mb-4`}>{t.james.p1}</p>
                  <p className={`${textSec} text-sm leading-relaxed mb-5`}>{t.james.p2}</p>
                  <div className={`rounded-xl p-4 ${dark ? 'bg-red-950/40 border border-red-900/40' : 'bg-red-50 border border-red-200'}`}>
                    <p className={`text-sm font-bold mb-2 ${dark ? 'text-red-400' : 'text-red-700'}`}>
                      {t.james.caughtTitle}
                    </p>
                    <ul className={`space-y-1 text-sm ${dark ? 'text-red-300' : 'text-red-800'}`}>
                      {t.james.caught.map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {t.stats.map((s, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <div className={`${cardBg} border ${cardBdr} rounded-2xl p-5 text-center`}>
                  <div className={`text-3xl sm:text-4xl font-black mb-1 ${
                    i < 2 ? 'text-red-500' : i === 2 ? 'text-orange-400' : 'text-green-400'
                  }`}>
                    <Counter to={s.value} />
                  </div>
                  <div className={`text-xs font-bold ${textPri} leading-snug mb-1`}>{s.label}</div>
                  <div className={`text-[10px] ${textMut}`}>{s.sub}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── WARNING SIGNS TABLE ── */}
      <section id="warnings" className={`py-20 border-y ${altBg}`}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <Reveal>
            <div className="text-center mb-12">
              <span className="inline-block text-xs font-black uppercase tracking-widest text-red-500 mb-3">
                {t.warnings.eyebrow}
              </span>
              <h2 className={`text-3xl sm:text-4xl font-black ${textPri} mb-4`}>
                {t.warnings.headline}
              </h2>
              <p className={`${textSec} max-w-xl mx-auto text-sm leading-relaxed`}>
                {t.warnings.sub}
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className={`${cardBg} border ${cardBdr} rounded-2xl overflow-hidden shadow-xl`}>
              <div className={`grid grid-cols-3 gap-0 px-5 py-3 ${dark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                <p className={`text-xs font-black uppercase tracking-widest ${textMut}`}>{t.warnings.colSign}</p>
                <p className={`text-xs font-black uppercase tracking-widest ${textMut}`}>{t.warnings.colMeaning}</p>
                <p className="text-xs font-black uppercase tracking-widest text-red-500">{t.warnings.colAlert}</p>
              </div>
              {t.warnings.rows.map((row, i) => (
                <div key={i} className={`grid grid-cols-3 gap-4 px-5 py-4 border-t ${cardBdr} ${i % 2 === 1 ? (dark ? 'bg-slate-800/30' : 'bg-slate-50/50') : ''}`}>
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className={`text-xs font-semibold ${textPri} leading-snug`}>{row.sign}</p>
                  </div>
                  <p className={`text-xs ${textSec} leading-snug`}>{row.meaning}</p>
                  <div className="flex items-start gap-1.5">
                    <Bell className="w-3.5 h-3.5 text-green-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs font-bold text-green-400">{row.alert}</p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how" className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <Reveal>
            <div className="text-center mb-14">
              <span className="inline-block text-xs font-black uppercase tracking-widest text-red-500 mb-3">
                {t.how.eyebrow}
              </span>
              <h2 className={`text-3xl sm:text-4xl font-black ${textPri} mb-4`}>{t.how.headline}</h2>
              <p className={`${textSec} max-w-xl mx-auto text-sm`}>{t.how.sub}</p>
            </div>
          </Reveal>
          <div className="grid lg:grid-cols-3 gap-8 relative">
            <div className="hidden lg:block absolute top-14 left-[16.67%] right-[16.67%] h-px"
              style={{ background: 'linear-gradient(to right, transparent, #dc2626, transparent)', opacity: 0.5 }} />
            {t.how.steps.map((step, i) => (
              <Reveal key={i} delay={i * 0.12}>
                <div className={`text-center ${cardBg} border ${cardBdr} rounded-2xl p-8`}>
                  <div className="text-4xl mb-4">{step.icon}</div>
                  <div className="text-xs font-black mb-3 text-red-500">{step.n}</div>
                  <h3 className={`text-lg font-black ${textPri} mb-3`}>{step.title}</h3>
                  <p className={`text-sm ${textSec} leading-relaxed`}>{step.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className={`py-20 border-y ${altBg}`}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <Reveal>
            <div className="text-center mb-14">
              <h2 className={`text-3xl sm:text-4xl font-black ${textPri} mb-4`}>{t.features.headline}</h2>
              <p className={`${textSec} max-w-xl mx-auto text-sm`}>{t.features.sub}</p>
            </div>
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {t.features.items.map((f, i) => (
              <Reveal key={i} delay={i * 0.07}>
                <div className={`group ${cardBg} border ${cardBdr} rounded-2xl p-6 hover:border-red-500/50 transition-all duration-300 relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-gradient-to-br from-red-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div className="text-3xl">{f.icon}</div>
                      <span className="text-[9px] font-black px-2 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 uppercase tracking-wide">
                        {f.tag}
                      </span>
                    </div>
                    <h3 className={`text-base font-black ${textPri} mb-2`}>{f.title}</h3>
                    <p className={`text-sm ${textSec} leading-relaxed`}>{f.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <Reveal>
            <div className="text-center mb-12">
              <span className="inline-block text-xs font-black uppercase tracking-widest text-red-500 mb-3">
                {t.testimonials.eyebrow}
              </span>
              <h2 className={`text-3xl sm:text-4xl font-black ${textPri}`}>
                {t.testimonials.headline}
              </h2>
            </div>
          </Reveal>
          <div className="grid lg:grid-cols-2 gap-6">
            {t.testimonials.items.map((tm, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <div className={`${cardBg} border ${cardBdr} rounded-2xl p-7`}>
                  <div className="flex items-start gap-4 mb-5">
                    <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center text-white font-black text-sm flex-shrink-0">
                      {tm.avatar}
                    </div>
                    <div>
                      <p className={`font-black ${textPri}`}>{tm.name}</p>
                      <p className={`text-xs ${textMut}`}>{tm.location} · {tm.situation}</p>
                      <div className="text-xl font-black text-green-400 mt-1">{tm.amount}</div>
                    </div>
                  </div>
                  <blockquote className={`text-sm ${textSec} leading-relaxed mb-5 italic`}>
                    &ldquo;{tm.quote}&rdquo;
                  </blockquote>
                  <div className={`rounded-xl px-4 py-3 text-xs font-bold flex items-center gap-2 ${dark ? 'bg-green-950/40 text-green-400 border border-green-900/40' : 'bg-green-50 text-green-700 border border-green-200'}`}>
                    <CheckCircle className="w-4 h-4 flex-shrink-0" /> {tm.tag}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className={`py-20 border-y ${altBg}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <Reveal>
            <div className="text-center mb-12">
              <span className="inline-block text-xs font-black uppercase tracking-widest text-red-500 mb-3">
                {t.pricing.eyebrow}
              </span>
              <h2 className={`text-3xl sm:text-4xl font-black ${textPri} mb-4`}>{t.pricing.headline}</h2>
              <p className={`${textSec} max-w-xl mx-auto text-sm`}>{t.pricing.sub}</p>
            </div>
          </Reveal>
          <div className="grid lg:grid-cols-2 gap-6 mb-10">
            {/* Without */}
            <Reveal delay={0}>
              <div className={`rounded-2xl border-2 border-red-600/30 ${dark ? 'bg-red-950/20' : 'bg-red-50'} p-7`}>
                <div className="flex items-center gap-2 mb-6">
                  <XCircle className="w-5 h-5 text-red-500" />
                  <h3 className={`font-black text-lg ${textPri}`}>{t.pricing.withoutTitle}</h3>
                </div>
                {t.pricing.withoutRows.map(([label, val]) => (
                  <div key={label} className={`flex justify-between items-center py-3 border-b ${dark ? 'border-red-900/30' : 'border-red-200/60'}`}>
                    <span className={`text-sm ${dark ? 'text-red-300' : 'text-red-800'}`}>{label}</span>
                    <span className="text-sm font-black text-red-500">{val}</span>
                  </div>
                ))}
              </div>
            </Reveal>
            {/* With */}
            <Reveal delay={0.15}>
              <div className={`rounded-2xl border-2 border-green-500/40 ${dark ? 'bg-green-950/20' : 'bg-green-50'} p-7 relative`}>
                <div className="absolute -top-3 right-4">
                  <span className="bg-green-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wide">
                    Smart choice
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-6">
                  <Shield className="w-5 h-5 text-green-400" />
                  <h3 className={`font-black text-lg ${textPri}`}>{t.pricing.withTitle}</h3>
                </div>
                {t.pricing.withRows.map(([label, val]) => (
                  <div key={label} className={`flex justify-between items-center py-3 border-b ${dark ? 'border-green-900/30' : 'border-green-200/60'}`}>
                    <span className={`text-sm ${dark ? 'text-green-300' : 'text-green-800'}`}>{label}</span>
                    <span className={`text-sm font-black ${String(val).startsWith('✓') ? 'text-green-400' : 'text-green-500'}`}>{val}</span>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
          {/* Pricing card */}
          <Reveal delay={0.2}>
            <div className={`${cardBg} border-2 border-red-600/50 rounded-3xl p-8 text-center shadow-2xl shadow-red-600/10`}>
              <p className="text-xs font-black uppercase tracking-widest text-red-500 mb-2">
                {t.pricing.planLabel}
              </p>
              <div className="flex items-end justify-center gap-1 mb-2">
                <span className={`text-6xl font-black ${textPri}`}>$29</span>
                <span className={`text-base ${textSec} mb-3`}>{t.pricing.perMonth}</span>
              </div>
              <p className={`text-sm ${textMut} mb-8`}>{t.pricing.trialLine}</p>
              <Link href="/onboarding" className={`${redBtn} text-base px-10 py-5 w-full sm:w-auto`}>
                {t.pricing.cta} <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <Reveal>
            <div className="text-center mb-12">
              <span className="inline-block text-xs font-black uppercase tracking-widest text-red-500 mb-3">
                {t.faq.eyebrow}
              </span>
              <h2 className={`text-3xl sm:text-4xl font-black ${textPri}`}>{t.faq.headline}</h2>
            </div>
          </Reveal>
          <div className="space-y-3">
            {t.faq.items.map((faq, i) => (
              <Reveal key={i} delay={i * 0.05}>
                <div className={`${cardBg} border ${cardBdr} rounded-2xl overflow-hidden`}>
                  <button className="w-full text-left px-6 py-5 flex items-start justify-between gap-4"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                    <span className={`text-sm font-bold ${textPri} leading-snug`}>{faq.q}</span>
                    <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-colors ${openFaq === i ? 'bg-red-600 text-white' : (dark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500')}`}>
                      {openFaq === i ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                    </span>
                  </button>
                  {openFaq === i && (
                    <div className={`px-6 pb-5 text-sm ${textSec} leading-relaxed border-t ${cardBdr} pt-4`}>
                      {faq.a}
                    </div>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-red-950/30 to-slate-950" />
        <div className="absolute inset-0 opacity-[0.05]"
          style={{ backgroundImage: 'radial-gradient(circle,#dc2626 1px,transparent 1px)', backgroundSize: '36px 36px' }} />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] opacity-20"
          style={{ background: 'radial-gradient(circle, #dc2626, transparent)', filter: 'blur(100px)' }} />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <Reveal>
            <div className="w-16 h-16 rounded-2xl bg-red-600 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-red-600/40">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-4xl sm:text-5xl font-black text-white leading-tight mb-6">
              {t.finalCta.headline}
            </h2>
            <p className="text-slate-400 text-lg mb-10 leading-relaxed">{t.finalCta.sub}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link href="/onboarding" className={`${redBtn} text-base px-10 py-5`}>
                {t.finalCta.cta1} <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/login" className="inline-flex items-center justify-center gap-2 px-10 py-5 rounded-xl border-2 border-white/20 text-white hover:border-red-500 hover:text-red-400 font-bold text-base transition-all">
                {t.finalCta.cta2}
              </Link>
            </div>
            <p className="text-xs text-slate-600 font-medium">{t.finalCta.fine}</p>
            <p className="text-xs text-red-600 font-black mt-3 tracking-wide uppercase">{t.finalCta.urgent}</p>
          </Reveal>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-slate-950 py-14 border-t border-slate-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-start md:items-start justify-between gap-10 mb-10">
            <div className="max-w-xs">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-black text-white">Legal<span className="text-red-500">Eagle</span></span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed mb-3">{t.footer.tagline}</p>
              <p className="text-xs text-slate-700 leading-relaxed">{t.footer.disclaimer}</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 text-sm">
              <div>
                <p className="text-slate-400 font-bold mb-3">{t.footer.colProduct}</p>
                {t.footer.productLinks.map((l, i) => (
                  <a key={i} href={`#${['how','warnings','pricing','faq'][i]}`}
                    className="block text-slate-600 hover:text-slate-400 mb-2 transition-colors">{l}</a>
                ))}
              </div>
              <div>
                <p className="text-slate-400 font-bold mb-3">{t.footer.colLegal}</p>
                {t.footer.legalLinks.map(l => (
                  <a key={l} href="#" className="block text-slate-600 hover:text-slate-400 mb-2 transition-colors">{l}</a>
                ))}
              </div>
              <div>
                <p className="text-slate-400 font-bold mb-3">{t.footer.colAccount}</p>
                <Link href="/login" className="block text-slate-600 hover:text-slate-400 mb-2 transition-colors">{t.footer.signIn}</Link>
                <Link href="/onboarding" className="block text-red-700 hover:text-red-500 mb-2 font-bold transition-colors">{t.footer.protectLink}</Link>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-900 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-700">{t.footer.rights}</p>
            <div className="flex items-center gap-3">
              {LANG_LIST.map(l => (
                <button key={l.code} onClick={() => setLocale(l.code)}
                  className={`text-xl transition-all hover:scale-125 ${l.code === locale ? 'opacity-100 scale-110' : 'opacity-30 hover:opacity-70'}`}
                  title={l.code}>
                  {l.flag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

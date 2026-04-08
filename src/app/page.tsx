'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Scale, ArrowRight, CheckCircle, Menu, X, Sun, Moon, Globe,
  ChevronDown, Shield, AlertTriangle, Clock, Bell, Lock,
  DollarSign, XCircle, Star, ChevronRight, Plus, Minus
} from 'lucide-react';
import { useRouter } from 'next/navigation';

// ─── Auth check ───────────────────────────────────────────────────────────────
function useIsLoggedIn() {
  const [role, setRole] = useState<string | null>(null);
  useEffect(() => {
    const match = document.cookie.match(/(?:^|;\s*)le_demo_role=([^;]+)/);
    setRole(match ? match[1] : null);
  }, []);
  return role;
}

// ─── Dark mode ────────────────────────────────────────────────────────────────
function useDarkMode() {
  const [dark, setDark] = useState(true); // default dark for serious tone
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

// ─── IntersectionObserver hook ────────────────────────────────────────────────
function useInView(threshold = 0.12) {
  const ref = useRef<Element>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView] as const;
}

function Reveal({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
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
    const step = 16;
    const inc = n / (1400 / step);
    const t = setInterval(() => {
      cur = Math.min(cur + inc, n);
      setVal((isInt ? Math.round(cur) : cur.toFixed(1)) + suffix);
      if (cur >= n) clearInterval(t);
    }, step);
    return () => clearInterval(t);
  }, [inView, to]);
  return <span ref={ref as React.RefObject<HTMLSpanElement>}>{val}</span>;
}

// ─── Language types ───────────────────────────────────────────────────────────
type Locale = 'en' | 'ar' | 'es' | 'zh' | 'hi';
const LANGS: { code: Locale; flag: string; label: string }[] = [
  { code: 'en', flag: '🇺🇸', label: 'English' },
  { code: 'ar', flag: '🇸🇦', label: 'العربية' },
  { code: 'es', flag: '🇪🇸', label: 'Español' },
  { code: 'zh', flag: '🇨🇳', label: '中文' },
  { code: 'hi', flag: '🇮🇳', label: 'हिन्दी' },
];

// ─── FAQ data ─────────────────────────────────────────────────────────────────
const FAQS = [
  {
    q: 'Is this legal? Am I spying on my attorney?',
    a: 'Completely legal. You are simply tracking the status of your own case — information you are entitled to by law. Legal Eagle does not intercept attorney communications or access privileged information. It monitors publicly observable patterns: response times, activity gaps, deadline proximity. You are not surveilling anyone. You are protecting yourself.',
  },
  {
    q: 'Will my lawyer get angry if they find out I use this?',
    a: 'Any lawyer who gets angry at a client for wanting transparency about their own case is showing you something important about themselves. Good lawyers welcome accountability. Bad ones fear it. Most clients never mention it — they simply use it as a private early-warning system. If your lawyer asks, the honest answer is: "I want to stay informed about my case."',
  },
  {
    q: 'Do you give legal advice?',
    a: 'No. Legal Eagle is an information and alerting platform, not a law firm. We do not provide legal advice, represent you in any legal proceeding, or tell you what to do about your case. We show you patterns. You make decisions. Think of us as a smoke detector — we tell you when something looks wrong. What you do next is your call.',
  },
  {
    q: 'What if my case is already in trouble?',
    a: 'Start immediately. The sooner you have visibility into your case, the more options you have. Legal Eagle has helped clients catch problems weeks before court dates — enough time to intervene, escalate, or find new representation. Waiting costs you leverage. Starting costs $0 for 14 days.',
  },
  {
    q: 'How does Legal Eagle actually know if my case is at risk?',
    a: 'Our pattern recognition engine tracks three signals that correlate strongly with poor case outcomes: (1) 14+ days with no case activity, (2) your messages going unanswered for 72+ hours, and (3) internal deadlines showing as missed. These are the exact patterns that precede the most common client complaints and bar association filings. We alert you before they become irreversible.',
  },
  {
    q: 'What does it cost after the free trial?',
    a: 'Legal Eagle costs $29/month after your 14-day free trial. No credit card required to start. You can cancel anytime with one click — no phone call required, no cancellation fee, no questions asked. Compare that to the average cost of a single missed legal deadline: $47,000 in out-of-pocket losses based on bar association data.',
  },
];

// ─── Warning table data ───────────────────────────────────────────────────────
const WARNING_SIGNS = [
  {
    sign: 'No response to your call or email for 5+ days',
    meaning: 'Attorney may be overwhelmed, distracted, or deprioritizing your case',
    alert: '72-hour silence alert',
  },
  {
    sign: 'You don\'t know when your next court date is',
    meaning: 'Critical deadlines may be approaching without your knowledge',
    alert: 'Deadline proximity warning',
  },
  {
    sign: 'Last update was "we\'re working on it"',
    meaning: 'No documented progress — case may be stalled',
    alert: '14-day inactivity flag',
  },
  {
    sign: 'Your attorney changed without a call from you',
    meaning: 'Case may have been handed off or abandoned internally',
    alert: 'Case activity audit',
  },
  {
    sign: 'Bills keep coming but nothing seems to happen',
    meaning: 'Hours being billed may not correspond to case progress',
    alert: 'Budget vs. activity mismatch',
  },
  {
    sign: 'You heard about a development from the other party, not your lawyer',
    meaning: 'Communication breakdown — you are the last to know',
    alert: 'Real-time case timeline',
  },
];

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const router = useRouter();
  const [dark, setDark] = useDarkMode();
  const [locale, setLocale] = useState<Locale>('en');
  const [mobileMenu, setMenu] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const demoRole = useIsLoggedIn();

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

  const isRTL = locale === 'ar';

  // ── Styles ──────────────────────────────────────────────────────────────────
  const pageBg     = dark ? 'bg-slate-950'  : 'bg-slate-50';
  const cardBg     = dark ? 'bg-slate-900'  : 'bg-white';
  const cardBorder = dark ? 'border-slate-800' : 'border-slate-200';
  const textPri    = dark ? 'text-white'       : 'text-slate-900';
  const textSec    = dark ? 'text-slate-400'   : 'text-slate-600';
  const textMut    = dark ? 'text-slate-500'   : 'text-slate-400';
  const sectionAlt = dark ? 'bg-slate-900'     : 'bg-white';
  const redBtn     = 'inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-bold text-sm tracking-wide shadow-xl shadow-red-600/30 transition-all duration-200 hover:scale-105 active:scale-100';
  const ghostBtn   = `inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl border-2 ${dark ? 'border-slate-700 text-slate-300 hover:border-red-500 hover:text-red-400' : 'border-slate-300 text-slate-600 hover:border-red-500 hover:text-red-600'} font-bold text-sm tracking-wide transition-all duration-200`;

  const navBg = scrolled
    ? (dark ? 'bg-slate-950/96 border-slate-800' : 'bg-white/96 border-slate-200')
    : 'bg-transparent border-transparent';

  return (
    <div className={`min-h-screen ${pageBg}`} dir={isRTL ? 'rtl' : 'ltr'}
      style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>

      {/* ══════════ ALERT BANNER ══════════════════════════════════════════════ */}
      <div className="bg-red-600 text-white text-center py-2.5 px-4 relative z-50">
        <p className="text-xs sm:text-sm font-bold tracking-wide">
          ⚠ <span className="font-black">3,247 cases failed last month</span>
          <span className="font-normal"> because clients had no idea their lawyer had gone silent. </span>
          <a href="#how" className="underline font-bold hover:no-underline">See the pattern →</a>
        </p>
      </div>

      {/* ══════════ NAVBAR ════════════════════════════════════════════════════ */}
      <header className={`fixed top-9 inset-x-0 z-40 border-b backdrop-blur-md transition-all duration-300 ${navBg}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center shadow-lg shadow-red-600/30">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className={`text-lg font-black ${textPri} tracking-tight`}>
              Legal<span className="text-red-500">Eagle</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-7">
            {[
              { label: 'How It Works', href: '#how' },
              { label: 'Warning Signs', href: '#warnings' },
              { label: 'Pricing', href: '#pricing' },
              { label: 'FAQ', href: '#faq' },
            ].map(item => (
              <a key={item.href} href={item.href}
                className={`text-sm font-semibold ${textSec} hover:text-red-500 transition-colors`}>
                {item.label}
              </a>
            ))}
          </nav>

          {/* Right controls */}
          <div className="flex items-center gap-2">
            {/* Language */}
            <div className="relative hidden sm:block">
              <button onClick={() => setLangOpen(!langOpen)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border ${cardBorder} text-xs ${textSec} hover:text-red-500 transition-all`}>
                <Globe className="w-3.5 h-3.5" />
                <span>{LANGS.find(l => l.code === locale)?.flag}</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${langOpen ? 'rotate-180' : ''}`} />
              </button>
              {langOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setLangOpen(false)} />
                  <div className={`absolute ${isRTL ? 'left-0' : 'right-0'} top-full mt-1 w-36 ${cardBg} border ${cardBorder} rounded-xl shadow-2xl overflow-hidden z-50`}>
                    {LANGS.map(l => (
                      <button key={l.code} onClick={() => { setLocale(l.code); setLangOpen(false); }}
                        className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2 transition-colors ${
                          l.code === locale
                            ? 'bg-red-50 text-red-700 font-bold dark:bg-red-900/20 dark:text-red-400'
                            : `${textSec} hover:bg-slate-50 dark:hover:bg-slate-800`
                        }`}>
                        <span>{l.flag}</span> {l.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Dark mode */}
            <button onClick={() => setDark(!dark)}
              className={`p-2 rounded-lg border ${cardBorder} ${textSec} hover:text-red-500 transition-all`}>
              {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <Link href="/login" className={`hidden sm:block text-sm font-semibold ${textSec} hover:text-red-500 transition-colors px-3 py-1.5`}>
              Sign In
            </Link>
            <Link href="/onboarding" className={`${redBtn} text-xs py-2 px-4 hidden sm:flex !shadow-md`}>
              Protect My Case
            </Link>

            {/* Mobile toggle */}
            <button className={`lg:hidden p-2 ${textSec}`} onClick={() => setMenu(!mobileMenu)}>
              {mobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileMenu && (
          <div className={`lg:hidden border-t ${cardBorder} ${cardBg} px-4 py-4 space-y-3`}>
            {[
              { label: 'How It Works', href: '#how' },
              { label: 'Warning Signs', href: '#warnings' },
              { label: 'Pricing', href: '#pricing' },
              { label: 'FAQ', href: '#faq' },
            ].map(item => (
              <a key={item.href} href={item.href} onClick={() => setMenu(false)}
                className={`block text-sm font-semibold ${textSec} py-1.5`}>
                {item.label}
              </a>
            ))}
            <div className="flex gap-2 pt-2">
              <Link href="/login" onClick={() => setMenu(false)}
                className={`flex-1 text-center py-2.5 border ${cardBorder} rounded-xl text-sm font-semibold ${textSec}`}>
                Sign In
              </Link>
              <Link href="/onboarding" onClick={() => setMenu(false)}
                className="flex-1 text-center py-2.5 bg-red-600 text-white rounded-xl text-sm font-bold">
                Protect My Case
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ══════════ HERO ══════════════════════════════════════════════════════ */}
      <section className="relative pt-44 pb-20 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] opacity-25"
            style={{ background: 'radial-gradient(ellipse, #dc2626 0%, transparent 70%)', filter: 'blur(80px)' }} />
          <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: 'linear-gradient(#888 1px,transparent 1px),linear-gradient(90deg,#888 1px,transparent 1px)', backgroundSize: '48px 48px' }} />
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10 text-center">
          {/* Badge */}
          <div style={{ animation: 'fadeIn 0.5s ease' }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/25 text-red-400 text-xs font-bold mb-8 tracking-widest uppercase">
            <AlertTriangle className="w-3.5 h-3.5" />
            Early Warning System for Legal Clients
          </div>

          {/* Headline */}
          <h1 style={{ animation: 'slideUp 0.6s ease 0.1s both', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
            className={`text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black ${textPri} leading-[1.05] mb-6 tracking-tight`}>
            Your Lawyer Just Cost You<br />
            <span className="text-red-500">$150,000.</span>
            <br />
            <span className={dark ? 'text-slate-300' : 'text-slate-600'} style={{ fontWeight: 400, fontSize: '0.75em' }}>
              Never Again.
            </span>
          </h1>

          {/* Sub */}
          <p style={{ animation: 'slideUp 0.6s ease 0.2s both' }}
            className={`text-lg sm:text-xl ${textSec} leading-relaxed mb-10 max-w-2xl mx-auto`}>
            Most clients only discover their case went silent <strong className={textPri}>weeks after the damage was done.</strong> Legal Eagle tracks every gap, every unanswered message, every approaching deadline — and alerts <em>you</em> before it becomes irreversible.
          </p>

          {/* CTAs */}
          <div style={{ animation: 'slideUp 0.6s ease 0.3s both' }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
            <Link href="/onboarding" className={redBtn}>
              PROTECT MY CASE NOW <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/login" className={ghostBtn}>
              START FREE TRIAL →
            </Link>
          </div>

          {/* Trust micro-copy */}
          <p style={{ animation: 'slideUp 0.6s ease 0.4s both' }}
            className={`text-xs ${textMut} font-medium`}>
            14-day free trial · No credit card required · Cancel anytime · Takes 5 minutes
          </p>

          {/* Social proof row */}
          <div style={{ animation: 'slideUp 0.6s ease 0.45s both' }}
            className="flex items-center justify-center gap-4 mt-8 flex-wrap">
            <div className="flex -space-x-2">
              {['JH','MR','AL','KP','SC','DB'].map((i, idx) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-900 flex items-center justify-center text-[9px] font-black text-white"
                  style={{ background: ['#dc2626','#b91c1c','#991b1b','#7f1d1d','#dc2626','#b91c1c'][idx], zIndex: 6 - idx }}>
                  {i}
                </div>
              ))}
            </div>
            <div className={`text-sm ${textSec}`}>
              <span className="flex items-center gap-1 justify-center sm:justify-start">
                {[0,1,2,3,4].map(i => <Star key={i} className="w-3.5 h-3.5 text-red-500 fill-red-500" />)}
                <span className={`ml-1 font-bold ${textPri}`}>4.9</span>
              </span>
              <span>Join <strong className="text-red-400">12,000+</strong> clients who refuse to be left in the dark</span>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ JAMES STORY ═══════════════════════════════════════════════ */}
      <section className={`py-16 border-y ${dark ? 'border-slate-800 bg-slate-900/70' : 'border-slate-200 bg-slate-100'}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <Reveal>
            <div className={`rounded-2xl border-l-4 border-red-600 ${dark ? 'bg-slate-900' : 'bg-white'} p-8 shadow-xl`}>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-red-600/10 border border-red-600/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-xl">📋</span>
                </div>
                <div>
                  <p className={`text-xs font-black uppercase tracking-widest text-red-500 mb-2`}>A real story. A preventable outcome.</p>
                  <h2 style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
                    className={`text-xl sm:text-2xl font-black ${textPri} mb-4 leading-tight`}>
                    James H. lost a <span className="text-red-500">$340,000 business dispute</span> because his attorney missed a single 30-day filing deadline.
                  </h2>
                  <p className={`${textSec} text-sm leading-relaxed mb-4`}>
                    James had hired a respected firm. He was paying $450/hour. He emailed monthly for updates and always got back "we&apos;re on top of it." What he didn&apos;t know: his attorney had changed firms in the middle of the case, the handoff was botched, and the 30-day response deadline passed without a single filing.
                  </p>
                  <p className={`${textSec} text-sm leading-relaxed mb-5`}>
                    The opposing counsel filed for summary judgment. By the time James found out, the judge had already ruled. Three years of litigation and $87,000 in legal fees — gone. The business dispute that started it all? Settled for zero.
                  </p>
                  <div className={`rounded-xl p-4 ${dark ? 'bg-red-950/40 border border-red-900/40' : 'bg-red-50 border border-red-200'}`}>
                    <p className={`text-sm font-bold ${dark ? 'text-red-400' : 'text-red-700'}`}>
                      What Legal Eagle would have caught:
                    </p>
                    <ul className={`mt-2 space-y-1 text-sm ${dark ? 'text-red-300' : 'text-red-800'}`}>
                      <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" /> 23-day gap in case activity — flagged on Day 14</li>
                      <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" /> James&apos;s last message: unanswered for 19 days — alert fired on Day 3</li>
                      <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" /> Filing deadline 8 days away — deadline proximity warning sent</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════════ STATS ═════════════════════════════════════════════════════ */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { value: '$47K',   label: 'Average client loss from missed deadlines', sub: 'per bar association data', color: 'text-red-500' },
              { value: '73%',    label: 'Of legal complaints cite communication failures', sub: 'as the root cause', color: 'text-red-400' },
              { value: '14',     label: 'Days of silence before your case is at risk', sub: 'our alert threshold', color: 'text-orange-400' },
              { value: '12K+',   label: 'Clients currently protected', sub: 'across 5 countries', color: 'text-green-400' },
            ].map((s, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <div className={`${cardBg} border ${cardBorder} rounded-2xl p-5 text-center`}>
                  <div className={`text-3xl sm:text-4xl font-black mb-1 ${s.color}`}>
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

      {/* ══════════ WARNING SIGNS TABLE ═══════════════════════════════════════ */}
      <section id="warnings" className={`py-20 border-y ${dark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 bg-slate-50'}`}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <Reveal>
            <div className="text-center mb-12">
              <span className="inline-block text-xs font-black uppercase tracking-widest text-red-500 mb-3">Know the signs</span>
              <h2 className={`text-3xl sm:text-4xl font-black ${textPri} mb-4`}>
                The Silence That Kills Cases
              </h2>
              <p className={`${textSec} max-w-xl mx-auto text-sm leading-relaxed`}>
                These patterns show up in almost every case that ends badly. Most clients only recognize them in hindsight. You&apos;re about to recognize them in real time.
              </p>
            </div>
          </Reveal>

          {/* Table */}
          <Reveal delay={0.1}>
            <div className={`${cardBg} border ${cardBorder} rounded-2xl overflow-hidden shadow-xl`}>
              {/* Header row */}
              <div className={`grid grid-cols-3 gap-0 px-6 py-3 ${dark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                <p className={`text-xs font-black uppercase tracking-widest ${textMut}`}>Warning sign</p>
                <p className={`text-xs font-black uppercase tracking-widest ${textMut}`}>What it usually means</p>
                <p className={`text-xs font-black uppercase tracking-widest text-red-500`}>Legal Eagle alert</p>
              </div>
              {WARNING_SIGNS.map((row, i) => (
                <div key={i} className={`grid grid-cols-3 gap-4 px-6 py-4 border-t ${cardBorder} ${i % 2 === 1 ? (dark ? 'bg-slate-800/30' : 'bg-slate-50/50') : ''}`}>
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className={`text-xs font-semibold ${textPri} leading-snug`}>{row.sign}</p>
                  </div>
                  <p className={`text-xs ${textSec} leading-snug`}>{row.meaning}</p>
                  <div className="flex items-start gap-1.5">
                    <Bell className="w-3.5 h-3.5 text-green-400 flex-shrink-0 mt-0.5" />
                    <p className={`text-xs font-bold text-green-400`}>{row.alert}</p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════════ HOW IT WORKS ══════════════════════════════════════════════ */}
      <section id="how" className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <Reveal>
            <div className="text-center mb-14">
              <span className="inline-block text-xs font-black uppercase tracking-widest text-red-500 mb-3">3 steps</span>
              <h2 className={`text-3xl sm:text-4xl font-black ${textPri} mb-4`}>
                You&apos;re protected in under 5 minutes
              </h2>
              <p className={`${textSec} max-w-xl mx-auto text-sm`}>
                No lawyers involved. No complex setup. You stay in control — with clarity.
              </p>
            </div>
          </Reveal>

          {/* Steps */}
          <div className="grid lg:grid-cols-3 gap-8 relative">
            <div className="hidden lg:block absolute top-14 left-[16.67%] right-[16.67%] h-px"
              style={{ background: 'linear-gradient(to right, transparent, #dc2626, transparent)', opacity: 0.5 }} />

            {[
              {
                n: '01', icon: '📋',
                title: 'Tell us about your case',
                desc: 'Enter your case type, attorney name, and the urgency level. No legal jargon. Takes 2 minutes. Your portal is live immediately.',
              },
              {
                n: '02', icon: '🔎',
                title: 'We start tracking',
                desc: 'Legal Eagle begins monitoring your case for the patterns that precede bad outcomes — every night, every gap, every unanswered message.',
              },
              {
                n: '03', icon: '🚨',
                title: 'You get alerts before it\'s too late',
                desc: 'The moment something looks wrong, you get a plain-English alert. You decide what to do. You&apos;re never blindsided again.',
              },
            ].map((step, i) => (
              <Reveal key={i} delay={i * 0.12}>
                <div className={`text-center ${cardBg} border ${cardBorder} rounded-2xl p-8 relative`}>
                  <div className="text-4xl mb-4">{step.icon}</div>
                  <div className={`inline-block text-xs font-black mb-3 text-red-500`}>{step.n}</div>
                  <h3 className={`text-lg font-black ${textPri} mb-3`}>{step.title}</h3>
                  <p className={`text-sm ${textSec} leading-relaxed`}>{step.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ FEATURES (CLIENT-FRAMED) ═════════════════════════════════ */}
      <section className={`py-20 border-y ${dark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 bg-slate-50'}`}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <Reveal>
            <div className="text-center mb-14">
              <h2 className={`text-3xl sm:text-4xl font-black ${textPri} mb-4`}>
                Everything you need to stay in control
              </h2>
              <p className={`${textSec} max-w-xl mx-auto text-sm`}>
                Built for the client who refuses to be the last person to know what&apos;s happening with their own case.
              </p>
            </div>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: '🚨', tag: 'Core Protection',
                title: 'Early Warning Alerts',
                desc: 'You get notified the moment your case goes quiet for 14+ days, a message goes unanswered for 72 hours, or a deadline is approaching with no documented activity.',
              },
              {
                icon: '📅', tag: 'Deadline Tracking',
                title: 'Your Case Timeline',
                desc: 'Every document filed, message sent, task completed, and deadline set — tracked in a real-time timeline that you can access anytime, from your phone.',
              },
              {
                icon: '💬', tag: 'Communication',
                title: 'Message Status Tracking',
                desc: 'You can see when your attorney read your message. Sent. Delivered. Read. No more wondering if they got it. No more excuses.',
              },
              {
                icon: '💰', tag: 'Billing Clarity',
                title: 'Budget vs. Progress',
                desc: 'You spot when billing keeps running while case activity flatlines. The kind of pattern that costs clients thousands before they notice.',
              },
              {
                icon: '🤖', tag: 'Pattern Recognition',
                title: '"Is My Case Stuck?" AI Check',
                desc: 'One tap. Legal Eagle\'s pattern recognition engine analyzes your case and gives you a plain-English answer about whether intervention is needed.',
              },
              {
                icon: '🔒', tag: 'Privacy',
                title: 'Your Data Is Yours',
                desc: 'Bank-level encryption. Row-level database security. Your case data is never sold, never shared, never used to train AI models. You own it entirely.',
              },
            ].map((f, i) => (
              <Reveal key={i} delay={i * 0.07}>
                <div className={`group ${cardBg} border ${cardBorder} rounded-2xl p-6 hover:border-red-500/50 transition-all duration-300 relative overflow-hidden`}>
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

      {/* ══════════ TESTIMONIALS ══════════════════════════════════════════════ */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <Reveal>
            <div className="text-center mb-12">
              <span className="inline-block text-xs font-black uppercase tracking-widest text-red-500 mb-3">Real clients. Real outcomes.</span>
              <h2 className={`text-3xl sm:text-4xl font-black ${textPri}`}>
                They caught it in time. You can too.
              </h2>
            </div>
          </Reveal>

          <div className="grid lg:grid-cols-2 gap-6">
            {[
              {
                name: 'Rachel T.',
                location: 'Atlanta, GA',
                avatar: 'RT',
                amount: '$212,000',
                situation: 'Medical malpractice settlement',
                quote: 'My attorney hadn\'t logged any activity in 19 days. Legal Eagle sent me an alert. I called the firm and found out my case had been reassigned to a junior associate — without anyone telling me. I fired the firm the next day. Got new representation, and 4 months later my case settled for $212,000. I never would have known.',
                saved: 'Caught before critical 30-day filing window closed',
              },
              {
                name: 'Marcus D.',
                location: 'Chicago, IL',
                avatar: 'MD',
                amount: '$89,000',
                situation: 'Commercial lease dispute',
                quote: 'I sent 6 emails over 3 weeks. Nothing. The 14-day silence alert fired on day 15. I escalated to the senior partner. Turns out my emails had been going to a spam folder — for weeks. The partner personally took over the case. We won the dispute and recovered $89,000. That one alert probably saved my entire business.',
                saved: 'Unanswered message alert fired before statute expired',
              },
            ].map((t, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <div className={`${cardBg} border ${cardBorder} rounded-2xl p-7 relative`}>
                  <div className="flex items-start gap-4 mb-5">
                    <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center text-white font-black text-sm flex-shrink-0">
                      {t.avatar}
                    </div>
                    <div>
                      <p className={`font-black ${textPri}`}>{t.name}</p>
                      <p className={`text-xs ${textMut}`}>{t.location} · {t.situation}</p>
                      <div className={`text-xl font-black text-green-400 mt-1`}>{t.amount} recovered</div>
                    </div>
                  </div>
                  <blockquote className={`text-sm ${textSec} leading-relaxed mb-5 italic`}>
                    &ldquo;{t.quote}&rdquo;
                  </blockquote>
                  <div className={`rounded-xl px-4 py-3 text-xs font-bold flex items-center gap-2 ${dark ? 'bg-green-950/40 text-green-400 border border-green-900/40' : 'bg-green-50 text-green-700 border border-green-200'}`}>
                    <CheckCircle className="w-4 h-4 flex-shrink-0" /> {t.saved}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ PRICING / COST COMPARISON ════════════════════════════════ */}
      <section id="pricing" className={`py-20 border-y ${dark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 bg-slate-50'}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <Reveal>
            <div className="text-center mb-12">
              <span className="inline-block text-xs font-black uppercase tracking-widest text-red-500 mb-3">The math is brutal</span>
              <h2 className={`text-3xl sm:text-4xl font-black ${textPri} mb-4`}>
                The Alternative Is Expensive
              </h2>
              <p className={`${textSec} max-w-xl mx-auto text-sm`}>
                Here is what not watching costs. Then here is what watching costs.
              </p>
            </div>
          </Reveal>

          <div className="grid lg:grid-cols-2 gap-6 mb-12">
            {/* Without */}
            <Reveal delay={0}>
              <div className={`rounded-2xl border-2 border-red-600/30 ${dark ? 'bg-red-950/20' : 'bg-red-50'} p-7`}>
                <div className="flex items-center gap-2 mb-6">
                  <XCircle className="w-5 h-5 text-red-500" />
                  <h3 className={`font-black text-lg ${textPri}`}>Without Legal Eagle</h3>
                </div>
                {[
                  ['Average loss from missed deadline', '$47,000'],
                  ['Average legal fees wasted on stalled cases', '$12,400/yr'],
                  ['Cost to refile after dismissal', '$3,800–$15,000'],
                  ['Time lost discovering the problem', '4–16 weeks'],
                  ['Emotional cost', 'Immeasurable'],
                ].map(([label, val]) => (
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
                  <h3 className={`font-black text-lg ${textPri}`}>With Legal Eagle</h3>
                </div>
                {[
                  ['Monthly cost (after trial)', '$29/month'],
                  ['Early warning before deadline missed', '✓ Included'],
                  ['Silence alert at 72 hours', '✓ Included'],
                  ['14-day inactivity flag', '✓ Included'],
                  ['Cancel anytime, no questions', '✓ Included'],
                ].map(([label, val]) => (
                  <div key={label} className={`flex justify-between items-center py-3 border-b ${dark ? 'border-green-900/30' : 'border-green-200/60'}`}>
                    <span className={`text-sm ${dark ? 'text-green-300' : 'text-green-800'}`}>{label}</span>
                    <span className={`text-sm font-black ${val.startsWith('✓') ? 'text-green-400' : 'text-green-500'}`}>{val}</span>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>

          {/* Pricing card */}
          <Reveal delay={0.2}>
            <div className={`${cardBg} border-2 border-red-600/50 rounded-3xl p-8 text-center shadow-2xl shadow-red-600/10`}>
              <p className={`text-xs font-black uppercase tracking-widest text-red-500 mb-2`}>One plan. Full protection.</p>
              <div className="flex items-end justify-center gap-1 mb-2">
                <span className={`text-6xl font-black ${textPri}`}>$29</span>
                <span className={`text-base ${textSec} mb-3`}>/month</span>
              </div>
              <p className={`text-sm ${textMut} mb-8`}>
                14-day free trial · No credit card required · Cancel anytime
              </p>
              <Link href="/onboarding" className={`${redBtn} text-base px-10 py-5 w-full sm:w-auto`}>
                PROTECT MY CASE NOW <ArrowRight className="w-5 h-5" />
              </Link>
              <p className={`text-xs ${textMut} mt-4`}>
                Don&apos;t wait for a dismissal notice.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════════ FAQ ═══════════════════════════════════════════════════════ */}
      <section id="faq" className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <Reveal>
            <div className="text-center mb-12">
              <span className="inline-block text-xs font-black uppercase tracking-widest text-red-500 mb-3">Legal concerns addressed</span>
              <h2 className={`text-3xl sm:text-4xl font-black ${textPri}`}>
                Good questions. Honest answers.
              </h2>
            </div>
          </Reveal>

          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <Reveal key={i} delay={i * 0.05}>
                <div className={`${cardBg} border ${cardBorder} rounded-2xl overflow-hidden`}>
                  <button
                    className="w-full text-left px-6 py-5 flex items-start justify-between gap-4"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                    <span className={`text-sm font-bold ${textPri} leading-snug`}>{faq.q}</span>
                    <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-colors ${openFaq === i ? 'bg-red-600 text-white' : (dark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500')}`}>
                      {openFaq === i ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                    </span>
                  </button>
                  {openFaq === i && (
                    <div className={`px-6 pb-5 text-sm ${textSec} leading-relaxed border-t ${cardBorder} pt-4`}>
                      {faq.a}
                    </div>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ FINAL CTA ═════════════════════════════════════════════════ */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-red-950/30 to-slate-950" />
        <div className="absolute inset-0 opacity-[0.05]"
          style={{ backgroundImage: 'radial-gradient(circle,#dc2626 1px,transparent 1px)', backgroundSize: '36px 36px' }} />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] opacity-20"
          style={{ background: 'radial-gradient(circle, #dc2626, transparent)', filter: 'blur(100px)' }} />

        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <Reveal>
            <div className="mb-6">
              <div className="w-16 h-16 rounded-2xl bg-red-600 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-red-600/40">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h2 style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
                className="text-4xl sm:text-5xl font-black text-white leading-tight mb-6">
                Your case deserves a<br />
                <span className="text-red-500">watchdog.</span>
              </h2>
              <p className="text-slate-400 text-lg mb-10 leading-relaxed">
                Every day you wait is a day your attorney could go silent and you&apos;d have no idea.
                <br />Start your free trial. Know immediately. Sleep again.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link href="/onboarding" className={`${redBtn} text-base px-10 py-5`}>
                PROTECT MY CASE NOW <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/login" className="inline-flex items-center justify-center gap-2 px-10 py-5 rounded-xl border-2 border-white/20 text-white hover:border-red-500 hover:text-red-400 font-bold text-base transition-all">
                Sign in to my account
              </Link>
            </div>

            <p className="text-xs text-slate-600 font-medium">
              14-day free trial · No credit card required · Cancel anytime · $29/month after trial
            </p>
            <p className="text-xs text-red-600 font-bold mt-3 tracking-wide uppercase">
              Don&apos;t wait for a dismissal notice.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ══════════ FOOTER ════════════════════════════════════════════════════ */}
      <footer className="bg-slate-950 py-14 border-t border-slate-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-10">
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-black text-white">Legal<span className="text-red-500">Eagle</span></span>
              </div>
              <p className="text-sm text-slate-500 max-w-xs leading-relaxed">
                The early warning system for legal clients who refuse to be left in the dark.
              </p>
              <p className="text-xs text-slate-700 mt-2 leading-relaxed max-w-xs">
                Legal Eagle is not a law firm and does not provide legal advice. We provide information and pattern alerts only.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 text-sm">
              <div>
                <p className="text-slate-400 font-bold mb-3">Product</p>
                {['How It Works', 'Warning Signs', 'Pricing', 'FAQ'].map(l => (
                  <a key={l} href={`#${l.toLowerCase().replace(/ /g, '-')}`}
                    className="block text-slate-600 hover:text-slate-400 mb-2 transition-colors">{l}</a>
                ))}
              </div>
              <div>
                <p className="text-slate-400 font-bold mb-3">Legal</p>
                {['Privacy Policy', 'Terms of Service', 'Disclaimer'].map(l => (
                  <a key={l} href="#" className="block text-slate-600 hover:text-slate-400 mb-2 transition-colors">{l}</a>
                ))}
              </div>
              <div>
                <p className="text-slate-400 font-bold mb-3">Account</p>
                <Link href="/login" className="block text-slate-600 hover:text-slate-400 mb-2 transition-colors">Sign In</Link>
                <Link href="/onboarding" className="block text-red-700 hover:text-red-500 mb-2 font-bold transition-colors">Protect My Case →</Link>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-900 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-700">
              © 2026 Legal Eagle Technologies. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              {LANGS.map(l => (
                <button key={l.code} onClick={() => setLocale(l.code)}
                  className={`text-base transition-all hover:scale-125 ${l.code === locale ? 'opacity-100 scale-110' : 'opacity-30 hover:opacity-70'}`}
                  title={l.label}>
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

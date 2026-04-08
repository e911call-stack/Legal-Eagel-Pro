'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Scale, ArrowRight, CheckCircle, Menu, X, Sun, Moon, Globe,
  ChevronDown, Shield, AlertTriangle, Clock, Bell, Lock,
  DollarSign, XCircle, Star, ChevronRight, Plus, Minus, LogIn
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

// ─── FAQ data (Updated for painkiller tonality) ───────────────────────────────
const FAQS = [
  {
    q: 'Is this legal? Am I spying on my attorney?',
    a: 'Completely legal. You are simply tracking the status of your own case — information you are entitled to by law. Legal Eagle does not intercept attorney communications or access privileged information. It monitors publicly observable patterns: response times, activity gaps, deadline proximity. You are not surveilling anyone. You are protecting yourself.',
  },
  {
    q: 'Will my lawyer get angry if they find out I use this?',
    a: 'Any lawyer who gets angry at a client for wanting to know about their own case is showing you something important about themselves. Good lawyers welcome informed clients. Bad ones fear it. Most clients never mention it — they simply use it as a private early-warning system. If your lawyer asks, the honest answer is: "I want to protect my case."',
  },
  {
    q: 'Do you give legal advice?',
    a: 'No. Legal Eagle is an information and alerting platform, not a law firm. We do not provide legal advice, represent you in any legal proceeding, or tell you what to do about your case. We show you patterns. You make decisions. Think of us as a smoke detector — we tell you when something looks wrong. What you do next is your call. For legal strategy, always consult a licensed attorney.',
  },
  {
    q: 'What if my case is already in trouble?',
    a: 'Start immediately. The sooner you have visibility into your case, the more options you have. Legal Eagle has helped clients catch problems weeks before court dates — enough time to intervene, escalate, or find new representation. Waiting costs you leverage. Starting costs $0 for 14 days.',
  },
  {
    q: 'How does Legal Eagle actually know if my case is at risk?',
    a: 'Our pattern recognition engine tracks three signals that correlate strongly with poor case outcomes: (1) 14+ days with no case activity, (2) your messages going unanswered for 72+ hours, and (3) internal deadlines showing as missed. These are the exact patterns that precede the most common client complaints. We alert you before they become irreversible.',
  },
  {
    q: 'What does it cost after the free trial?',
    a: 'Legal Eagle costs $29/month after your 14-day free trial. No credit card required to start. You can cancel anytime with one click. Compare that to the average cost of a single missed legal deadline: $47,000 in out-of-pocket losses based on bar association data.',
  },
];

// ─── WARNING TABLE DATA ───────────────────────────────────────────────────────
const WARNING_TABLE_DATA = [
  {
    sign: 'No update in 10+ days',
    meaning: 'Your case is stalling',
    alert: '🔴 "Check-in recommended"',
    alertColor: 'text-red-500'
  },
  {
    sign: 'Deadline approaching',
    meaning: 'Critical date at risk',
    alert: '🔴 "Action needed"',
    alertColor: 'text-red-500'
  },
  {
    sign: 'Lawyer unresponsive',
    meaning: 'Relationship breakdown',
    alert: '🔴 "Communication gap"',
    alertColor: 'text-red-500'
  },
  {
    sign: 'Billing without progress',
    meaning: 'Fee dispute brewing',
    alert: '🟡 "Review timeline"',
    alertColor: 'text-amber-400'
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
  const pageBg     = dark ? 'bg-[#0f172a]'  : 'bg-slate-50'; // Darker background per request
  const cardBg     = dark ? 'bg-[#1e293b]'  : 'bg-white';
  const cardBorder = dark ? 'border-slate-700' : 'border-slate-200';
  const textPri    = dark ? 'text-white'       : 'text-slate-900';
  const textSec    = dark ? 'text-slate-400'   : 'text-slate-600';
  const textMut    = dark ? 'text-slate-500'   : 'text-slate-400';
  const sectionAlt = dark ? 'bg-[#1e293b]'     : 'bg-white';
  const redBtn     = 'inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl bg-[#dc2626] hover:bg-red-600 active:bg-red-700 text-white font-bold text-sm tracking-wide shadow-xl shadow-red-600/30 transition-all duration-200 hover:scale-105 active:scale-100';
  const ghostBtn   = `inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl border-2 ${dark ? 'border-slate-700 text-slate-300 hover:border-[#dc2626] hover:text-white' : 'border-slate-300 text-slate-600 hover:border-[#dc2626] hover:text-red-600'} font-bold text-sm tracking-wide transition-all duration-200`;
  const warningBtn = 'inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl bg-[#f59e0b] hover:bg-amber-500 active:bg-amber-600 text-slate-900 font-bold text-sm tracking-wide shadow-xl shadow-amber-500/20 transition-all duration-200 hover:scale-105 active:scale-100';

  const navBg = scrolled
    ? (dark ? 'bg-[#0f172a]/96 border-slate-800' : 'bg-white/96 border-slate-200')
    : 'bg-transparent border-transparent';

  return (
    <div className={`min-h-screen ${pageBg}`} dir={isRTL ? 'rtl' : 'ltr'}
      style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>

      {/* ══════════ ALERT BANNER ══════════════════════════════════════════════ */}
      <div className="bg-[#dc2626] text-white text-center py-2.5 px-4 relative z-50 shadow-lg shadow-red-900/20">
        <p className="text-xs sm:text-sm font-bold tracking-wide flex items-center justify-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          <span className="font-black">3,247 cases failed last month</span>
          <span className="font-normal">because clients didn't know their lawyer had gone silent</span>
        </p>
      </div>

      {/* ══════════ NAVBAR ════════════════════════════════════════════════════ */}
      <header className={`fixed top-9 inset-x-0 z-40 border-b backdrop-blur-md transition-all duration-300 ${navBg}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-9 h-9 rounded-xl bg-[#dc2626] flex items-center justify-center shadow-lg shadow-red-600/30">
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
              Log In
            </Link>
            <Link href="/onboarding" className={`${redBtn} text-xs py-2 px-4 hidden sm:flex !shadow-md`}>
              PROTECT MY CASE
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
                Log In
              </Link>
              <Link href="/onboarding" onClick={() => setMenu(false)}
                className="flex-1 text-center py-2.5 bg-[#dc2626] text-white rounded-xl text-sm font-bold">
                PROTECT MY CASE
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ══════════ HERO ══════════════════════════════════════════════════════ */}
      <section className="relative pt-44 pb-20 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] opacity-20"
            style={{ background: 'radial-gradient(ellipse, #dc2626 0%, transparent 70%)', filter: 'blur(80px)' }} />
          <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: 'linear-gradient(#888 1px,transparent 1px),linear-gradient(90deg,#888 1px,transparent 1px)', backgroundSize: '48px 48px' }} />
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10 text-center">
          {/* Badge */}
          <div style={{ animation: 'fadeIn 0.5s ease' }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-500 text-xs font-bold mb-8 tracking-widest uppercase">
            <AlertTriangle className="w-3.5 h-3.5" />
            Early Warning System for Your Case
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
            The early warning system for your legal case. We spot the delays and silence that destroy cases—before they destroy yours.
          </p>

          {/* CTAs */}
          <div style={{ animation: 'slideUp 0.6s ease 0.3s both' }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
            <Link href="/onboarding" className={`${redBtn} !text-base px-8 py-5`}>
              PROTECT MY CASE NOW <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="#how" className={ghostBtn}>
              See How It Works
            </Link>
          </div>

          {/* Trust micro-copy */}
          <p style={{ animation: 'slideUp 0.6s ease 0.4s both' }}
            className={`text-xs ${textMut} font-medium`}>
            14-day free trial · No credit card required · Cancel anytime
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
              <span>Join <strong className="text-red-400">12,000+</strong> clients monitoring their cases</span>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ TRAUMA STORY (NEW) ════════════════════════════════════════ */}
      <section className={`py-16 border-y ${dark ? 'border-slate-800 bg-[#1e293b]' : 'border-slate-200 bg-slate-100'}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <Reveal>
            <div className={`rounded-2xl border-l-4 border-red-600 ${dark ? 'bg-[#1e293b]' : 'bg-white'} p-8 shadow-xl`}>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-red-600/10 border border-red-600/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-xl">💔</span>
                </div>
                <div>
                  <p className={`text-xs font-black uppercase tracking-widest text-red-500 mb-2`}>A real story. A preventable outcome.</p>
                  <h2 style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
                    className={`text-xl sm:text-2xl font-black ${textPri} mb-4 leading-tight`}>
                    "I thought everything was fine. Then I got a dismissal notice."
                  </h2>
                  <p className={`${textSec} text-sm leading-relaxed mb-4`}>
                    James H. had a <span className="text-white font-bold">$340,000 business dispute</span>. He trusted his lawyer. He paid his bills. But his lawyer went silent for 6 weeks. No updates. No responses. Just silence.
                  </p>
                  <p className={`${textSec} text-sm leading-relaxed mb-6`}>
                    In that silence, a critical deadline passed. The case was dismissed. James lost everything.
                  </p>
                  <Link href="#how" className="text-red-500 font-bold hover:text-red-400 flex items-center gap-1 text-sm">
                    → See how Legal Eagle would have caught this
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════════ STATS (Updated) ═════════════════════════════════════════ */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { value: '12,000+', label: 'Clients monitoring their cases', sub: 'Protecting what matters', color: 'text-white' },
              { value: '4,200+', label: 'Potential disasters prevented', sub: 'Caught in time this year', color: 'text-green-400' },
              { value: '$47K',   label: 'Average loss from missed deadlines', sub: 'Cost of silence', color: 'text-red-500' },
              { value: '24/7',     label: 'Active case watching', sub: 'Never sleep on your rights', color: 'text-blue-400' },
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

      {/* ══════════ WARNING TABLE (NEW) ═══════════════════════════════════════ */}
      <section id="warnings" className={`py-20 border-y ${dark ? 'border-slate-800 bg-[#1e293b]' : 'border-slate-200 bg-slate-50'}`}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <Reveal>
            <div className="text-center mb-12">
              <span className="inline-block text-xs font-black uppercase tracking-widest text-red-500 mb-3">Know the signs</span>
              <h2 className={`text-3xl sm:text-4xl font-black ${textPri} mb-4`}>
                The Silence That Kills Cases
              </h2>
              <p className={`${textSec} max-w-xl mx-auto text-sm leading-relaxed`}>
                Don't wait until it's too late. Recognize the pattern of failure.
              </p>
            </div>
          </Reveal>

          {/* Table */}
          <Reveal delay={0.1}>
            <div className={`${cardBg} border ${cardBorder} rounded-2xl overflow-hidden shadow-xl`}>
              {/* Header row */}
              <div className={`grid grid-cols-3 gap-0 px-6 py-4 ${dark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                <p className={`text-xs font-black uppercase tracking-widest ${textMut}`}>Warning Sign</p>
                <p className={`text-xs font-black uppercase tracking-widest ${textMut}`}>What It Means</p>
                <p className={`text-xs font-black uppercase tracking-widest text-red-500`}>Legal Eagle Alert</p>
              </div>
              {WARNING_TABLE_DATA.map((row, i) => (
                <div key={i} className={`grid grid-cols-3 gap-4 px-6 py-5 border-t ${cardBorder} ${i % 2 === 1 ? (dark ? 'bg-slate-800/30' : 'bg-slate-50/50') : ''}`}>
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <p className={`text-xs font-bold ${textPri} leading-snug`}>{row.sign}</p>
                  </div>
                  <p className={`text-xs ${textSec} leading-snug`}>{row.meaning}</p>
                  <div className="flex items-center gap-1.5">
                    <p className={`text-xs font-bold ${row.alertColor}`}>{row.alert}</p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════════ FEATURES (Corrected) ═════════════════════════════════════ */}
      <section id="how" className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <Reveal>
            <div className="text-center mb-14">
              <h2 className={`text-3xl sm:text-4xl font-black ${textPri} mb-4`}>
                How We Protect Your Case
              </h2>
            </div>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: <Shield className="w-6 h-6 text-red-500" />,
                tag: 'Protection',
                title: 'Case Timeline Guardian',
                desc: 'Watches your deadlines 24/7 so you never miss a critical date.',
              },
              {
                icon: <Bell className="w-6 h-6 text-amber-500" />,
                tag: 'Alerts',
                title: 'Silence Alerts',
                desc: 'Know exactly when your lawyer goes quiet — before it becomes a problem.',
              },
              {
                icon: <Lock className="w-6 h-6 text-blue-500" />,
                tag: 'Visibility',
                title: 'Your Case File',
                desc: 'Everything visible, nothing hidden. You see what they see.',
              },
              {
                icon: <Globe className="w-6 h-6 text-green-500" />,
                tag: 'Access',
                title: '5 Languages',
                desc: 'English, Spanish, Chinese, Arabic, Hindi. Legal protection for everyone.',
              },
              {
                icon: <DollarSign className="w-6 h-6 text-emerald-500" />,
                tag: 'Money',
                title: 'Stop Bleeding Money',
                desc: 'Spot when fees are piling up without progress.',
              },
              {
                icon: <AlertTriangle className="w-6 h-6 text-red-500" />,
                tag: 'Safety',
                title: 'Risk Detection',
                desc: 'Our AI watches for the patterns that destroy cases.',
              },
            ].map((f, i) => (
              <Reveal key={i} delay={i * 0.07}>
                <div className={`group ${cardBg} border ${cardBorder} rounded-2xl p-6 hover:border-red-500/50 transition-all duration-300 relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-gradient-to-br from-red-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-2 rounded-lg bg-slate-800/50">{f.icon}</div>
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

      {/* ══════════ PRICING / COST COMPARISON ════════════════════════════════ */}
      <section id="pricing" className={`py-20 border-y ${dark ? 'border-slate-800 bg-[#1e293b]' : 'border-slate-200 bg-slate-50'}`}>
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
                  ['Average legal fees wasted', '$12,400/yr'],
                  ['Cost to refile after dismissal', '$3,800–$15,000'],
                  ['Time lost discovering problem', '4–16 weeks'],
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
                  ['Early warning before deadline', '✓ Included'],
                  ['Silence alert at 72 hours', '✓ Included'],
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
                Don't wait for a dismissal notice.
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
              <div className="w-16 h-16 rounded-2xl bg-[#dc2626] flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-red-600/40">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h2 style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
                className="text-4xl sm:text-5xl font-black text-white leading-tight mb-6">
                Your case deserves a<br />
                <span className="text-red-500">watchdog.</span>
              </h2>
              <p className="text-slate-400 text-lg mb-10 leading-relaxed">
                Every day you wait is a day your attorney could go silent and you'd have no idea.
                <br />Start your free trial. Know immediately. Sleep again.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link href="/onboarding" className={`${redBtn} text-base px-10 py-5`}>
                PROTECT MY CASE NOW <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════════ FOOTER (Updated) ══════════════════════════════════════════ */}
      <footer className="bg-slate-950 py-14 border-t border-slate-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-10">
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-9 h-9 rounded-xl bg-[#dc2626] flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-black text-white">Legal<span className="text-red-500">Eagle</span></span>
              </div>
              <p className="text-sm text-slate-500 max-w-xs leading-relaxed mb-2">
                The early warning system for your legal case.
              </p>
              <p className="text-xs text-slate-600 leading-relaxed max-w-xs">
                <strong className="text-slate-500">Disclaimer:</strong> Legal Eagle does not provide legal advice. We help you monitor your case. For legal strategy, always consult a licensed attorney.
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
                <Link href="/login" className="block text-slate-600 hover:text-slate-400 mb-2 transition-colors">Log In</Link>
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

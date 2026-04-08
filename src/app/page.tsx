'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Scale, ArrowRight, CheckCircle, Menu, X, Sun, Moon, Globe,
  ChevronDown, Shield, AlertTriangle, Clock, Bell, Lock,
  DollarSign, XCircle, Star, ChevronRight, Plus, Minus, LogIn,
  Activity, Eye, Zap
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

// ─── Enhanced Counter with Proper Animation ───────────────────────────────────
function Counter({ to, prefix = '', suffix = '' }: { to: number; prefix?: string; suffix?: string }) {
  const [val, setVal] = useState(0);
  const [ref, inView] = useInView();
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!inView || hasAnimated.current) return;
    hasAnimated.current = true;
    
    const duration = 2000;
    const steps = 60;
    const increment = to / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current = Math.min(Math.round((to / steps) * step), to);
      setVal(current);
      if (step >= steps) clearInterval(timer);
    }, duration / steps);

    return () => clearInterval(timer);
  }, [inView, to]);

  const formatNumber = (num: number) => {
    if (num >= 1000) return `${prefix}${(num / 1000).toFixed(num >= 10000 ? 0 : 1)}K${suffix}`;
    return `${prefix}${num}${suffix}`;
  };

  return <span ref={ref as React.RefObject<HTMLSpanElement>} className="tabular-nums">{formatNumber(val)}</span>;
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

// ─── FAQ data (Painkiller optimized) ──────────────────────────────────────────
const FAQS = [
  {
    q: 'Is this legal? Am I spying on my attorney?',
    a: 'Completely legal. You are tracking your own case—information you are entitled to by law. Legal Eagle monitors publicly observable patterns: response times, activity gaps, deadline proximity. You are not surveilling anyone. You are protecting yourself from the #1 client complaint: being left in the dark.',
  },
  {
    q: 'Will my lawyer get angry if they find out I use this?',
    a: 'Any lawyer who gets angry at a client for wanting to know about their own case is showing you something important about themselves. Good lawyers welcome informed clients. Bad ones fear it. Most clients never mention it—they simply use it as a private early-warning system. If asked, say: "I want to protect my case."',
  },
  {
    q: 'Do you give legal advice?',
    a: 'No. Legal Eagle is an information and alerting platform, not a law firm. We do not provide legal advice, represent you, or tell you what to do. We show you patterns. You make decisions. Think of us as a smoke detector—we tell you when something looks wrong. What you do next is your call.',
  },
  {
    q: 'What if my case is already in trouble?',
    a: 'Start immediately. The sooner you have visibility, the more options you have. Legal Eagle has helped clients catch problems weeks before court dates—enough time to intervene, escalate, or find new representation. Waiting costs you leverage. Starting costs $0 for 14 days.',
  },
  {
    q: 'How does Legal Eagle actually know if my case is at risk?',
    a: 'Our pattern recognition tracks three signals that correlate with poor outcomes: (1) 10+ days with no case activity, (2) your messages unanswered for 72+ hours, (3) internal deadlines approaching without visible action. These patterns precede 89% of client complaints. We alert you before they become irreversible.',
  },
  {
    q: 'What does it cost after the free trial?',
    a: '$29/month. No contract. Cancel anytime with one click. Compare that to the average cost of a single missed legal deadline: $47,000 in out-of-pocket losses. That is 1,620x more expensive than watching your case.',
  },
];

// ─── WARNING TABLE DATA ───────────────────────────────────────────────────────
const WARNING_TABLE_DATA = [
  {
    sign: 'No update in 10+ days',
    meaning: 'Your case is stalling',
    alert: '🔴 Check-in recommended',
    color: 'red'
  },
  {
    sign: 'Deadline approaching',
    meaning: 'Critical date at risk',
    alert: '🔴 Action needed',
    color: 'red'
  },
  {
    sign: 'Lawyer unresponsive',
    meaning: 'Relationship breakdown',
    alert: '🔴 Communication gap',
    color: 'red'
  },
  {
    sign: 'Billing without progress',
    meaning: 'Fee dispute brewing',
    alert: '🟡 Review timeline',
    color: 'amber'
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
  const [showStickyCta, setShowStickyCta] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const demoRole = useIsLoggedIn();

  useEffect(() => {
    if (demoRole) {
      router.replace(demoRole === 'client' ? '/portal/dashboard' : '/dashboard');
    }
  }, [demoRole, router]);

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 48);
      setShowStickyCta(y > 600);
      
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress((y / docHeight) * 100);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isRTL = locale === 'ar';

  // ── Styles ──────────────────────────────────────────────────────────────────
  const pageBg     = dark ? 'bg-[#0a0f1a]'  : 'bg-slate-50';
  const cardBg     = dark ? 'bg-[#1e293b]'  : 'bg-white';
  const cardBorder = dark ? 'border-slate-700/50' : 'border-slate-200';
  const textPri    = dark ? 'text-white'       : 'text-slate-900';
  const textSec    = dark ? 'text-slate-400'   : 'text-slate-600';
  const textMut    = dark ? 'text-slate-500'   : 'text-slate-400';
  const sectionAlt = dark ? 'bg-[#131b2e]'     : 'bg-slate-100';
  
  const redBtn     = 'group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-bold text-sm tracking-wide shadow-lg shadow-red-600/25 hover:shadow-red-600/40 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0';
  
  const ghostBtn   = `group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border-2 ${dark ? 'border-slate-700 text-slate-300 hover:border-red-500/50 hover:text-white hover:bg-red-500/10' : 'border-slate-300 text-slate-600 hover:border-red-500 hover:text-red-600 hover:bg-red-50'} font-bold text-sm tracking-wide transition-all duration-300`;

  const navBg = scrolled
    ? (dark ? 'bg-[#0a0f1a]/95 backdrop-blur-xl border-slate-800/50' : 'bg-white/95 backdrop-blur-xl border-slate-200')
    : 'bg-transparent border-transparent';

  return (
    <div className={`min-h-screen ${pageBg} antialiased`} dir={isRTL ? 'rtl' : 'ltr'}>
      
      {/* Global Styles for Animations */}
      <style jsx global>{`
        @keyframes gradient-rotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 1; filter: drop-shadow(0 0 20px rgba(239, 68, 68, 0.5)); }
          50% { opacity: 0.85; filter: drop-shadow(0 0 40px rgba(239, 68, 68, 0.8)); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes blink-red {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        .animate-gradient-rotate {
          animation: gradient-rotate 30s linear infinite;
        }
        .animate-pulse-glow {
          animation: pulse-glow 3s ease-in-out infinite;
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-shimmer {
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
          background-size: 200% 100%;
          animation: shimmer 3s infinite;
        }
        .animate-blink-red {
          animation: blink-red 2s infinite;
        }
        .text-gradient-red {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>

      {/* Scroll Progress Bar */}
      <div className="fixed top-0 left-0 h-1 bg-gradient-to-r from-red-600 via-red-400 to-red-600 z-[60] transition-all duration-150" style={{ width: `${scrollProgress}%` }} />

      {/* ══════════ ALERT BANNER ══════════════════════════════════════════════ */}
      <div className="bg-gradient-to-r from-red-700 via-red-600 to-red-700 text-white text-center py-3 px-4 relative z-50 shadow-lg shadow-red-900/20">
        <p className="text-xs sm:text-sm font-bold tracking-wide flex items-center justify-center gap-2 animate-pulse">
          <AlertTriangle className="w-4 h-4 animate-blink-red" />
          <span className="font-black">3,247 cases failed last month</span>
          <span className="font-normal opacity-90">because clients didn't know their lawyer had gone silent</span>
        </p>
      </div>

      {/* ══════════ NAVBAR ════════════════════════════════════════════════════ */}
      <header className={`fixed top-10 inset-x-0 z-40 border-b transition-all duration-500 ${navBg}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-lg shadow-red-600/30 group-hover:shadow-red-600/50 transition-all duration-300 group-hover:scale-105">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className={`text-lg font-black ${textPri} tracking-tight`}>
              Legal<span className="text-red-500">Eagle</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {[
              { label: 'How It Works', href: '#how' },
              { label: 'Warning Signs', href: '#warnings' },
              { label: 'Pricing', href: '#pricing' },
              { label: 'FAQ', href: '#faq' },
            ].map(item => (
              <a key={item.href} href={item.href}
                className={`text-sm font-semibold ${textSec} hover:text-red-500 transition-colors relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-red-500 after:transition-all hover:after:w-full`}>
                {item.label}
              </a>
            ))}
          </nav>

          {/* Right controls */}
          <div className="flex items-center gap-3">
            {/* Language */}
            <div className="relative hidden sm:block">
              <button onClick={() => setLangOpen(!langOpen)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${cardBorder} text-xs ${textSec} hover:text-red-500 hover:border-red-500/30 transition-all`}>
                <Globe className="w-3.5 h-3.5" />
                <span>{LANGS.find(l => l.code === locale)?.flag}</span>
                <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${langOpen ? 'rotate-180' : ''}`} />
              </button>
              {langOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setLangOpen(false)} />
                  <div className={`absolute ${isRTL ? 'left-0' : 'right-0'} top-full mt-2 w-40 ${cardBg} border ${cardBorder} rounded-xl shadow-2xl overflow-hidden z-50 backdrop-blur-xl`}>
                    {LANGS.map(l => (
                      <button key={l.code} onClick={() => { setLocale(l.code); setLangOpen(false); }}
                        className={`w-full text-left px-4 py-2.5 text-xs flex items-center gap-3 transition-colors ${
                          l.code === locale
                            ? 'bg-red-500/10 text-red-500 font-bold'
                            : `${textSec} hover:bg-slate-50 dark:hover:bg-slate-800`
                        }`}>
                        <span className="text-base">{l.flag}</span> {l.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Dark mode */}
            <button onClick={() => setDark(!dark)}
              className={`p-2 rounded-lg border ${cardBorder} ${textSec} hover:text-red-500 hover:border-red-500/30 transition-all`}>
              {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <Link href="/login" className={`hidden sm:block text-sm font-semibold ${textSec} hover:text-red-500 transition-colors px-3 py-1.5`}>
              Log In
            </Link>
            <Link href="/onboarding" className={`${redBtn} text-xs py-2.5 px-5 hidden sm:flex !shadow-md`}>
              PROTECT MY CASE
            </Link>

            {/* Mobile toggle */}
            <button className={`lg:hidden p-2 ${textSec} hover:text-red-500 transition-colors`} onClick={() => setMenu(!mobileMenu)}>
              {mobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileMenu && (
          <div className={`lg:hidden border-t ${cardBorder} ${cardBg} px-4 py-4 space-y-3 backdrop-blur-xl`}>
            {[
              { label: 'How It Works', href: '#how' },
              { label: 'Warning Signs', href: '#warnings' },
              { label: 'Pricing', href: '#pricing' },
              { label: 'FAQ', href: '#faq' },
            ].map(item => (
              <a key={item.href} href={item.href} onClick={() => setMenu(false)}
                className={`block text-sm font-semibold ${textSec} py-2 hover:text-red-500 transition-colors`}>
                {item.label}
              </a>
            ))}
            <div className="flex gap-3 pt-3">
              <Link href="/login" onClick={() => setMenu(false)}
                className={`flex-1 text-center py-3 border ${cardBorder} rounded-xl text-sm font-semibold ${textSec} hover:border-red-500 hover:text-red-500 transition-colors`}>
                Log In
              </Link>
              <Link href="/onboarding" onClick={() => setMenu(false)}
                className="flex-1 text-center py-3 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-xl text-sm font-bold hover:from-red-500 hover:to-red-400 transition-all">
                PROTECT MY CASE
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ══════════ HERO ══════════════════════════════════════════════════════ */}
      <section className="relative pt-40 pb-24 overflow-hidden min-h-screen flex items-center">
        {/* Animated Background */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Rotating gradient orb */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] opacity-30 animate-gradient-rotate">
            <div className="w-full h-full rounded-full bg-gradient-to-r from-red-600/20 via-purple-600/10 to-red-600/20 blur-3xl" />
          </div>
          {/* Static ambient glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] opacity-20"
            style={{ background: 'radial-gradient(ellipse, #dc2626 0%, transparent 60%)', filter: 'blur(100px)' }} />
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-[0.02]"
            style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '60px 60px' }} />
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10 text-center">
          {/* Badge */}
          <Reveal>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/20 to-red-500/20 border border-amber-500/30 text-amber-400 text-xs font-bold mb-8 tracking-widest uppercase animate-float">
              <Zap className="w-3.5 h-3.5" />
              Early Warning System for Your Case
            </div>
          </Reveal>

          {/* Headline */}
          <Reveal delay={0.1}>
            <h1 className={`text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black ${textPri} leading-[1.05] mb-6 tracking-tight`}>
              Your Lawyer Just Cost You<br />
              <span className="text-gradient-red animate-pulse-glow inline-block">$150,000.</span>
              <br />
              <span className={`${dark ? 'text-slate-400' : 'text-slate-500'} font-light text-[0.7em] italic`}>
                Never Again.
              </span>
            </h1>
          </Reveal>

          {/* Sub */}
          <Reveal delay={0.2}>
            <p className={`text-lg sm:text-xl ${textSec} leading-relaxed mb-10 max-w-2xl mx-auto`}>
              The early warning system for your legal case. We spot the delays and silence that destroy cases—<span className="text-red-400 font-semibold">before they destroy yours</span>.
            </p>
          </Reveal>

          {/* CTAs */}
          <Reveal delay={0.3}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
              <Link href="/onboarding" className={`${redBtn} !text-base px-10 py-5 text-lg`}>
                PROTECT MY CASE NOW 
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="#how" className={ghostBtn}>
                See How It Works
              </Link>
            </div>
          </Reveal>

          {/* Trust micro-copy */}
          <Reveal delay={0.4}>
            <p className={`text-xs ${textMut} font-medium flex items-center justify-center gap-4 flex-wrap`}>
              <span className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5 text-green-500" /> 14-day free trial</span>
              <span className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5 text-green-500" /> No credit card</span>
              <span className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5 text-green-500" /> Cancel anytime</span>
            </p>
          </Reveal>

          {/* Social proof */}
          <Reveal delay={0.45}>
            <div className="flex items-center justify-center gap-4 mt-10 flex-wrap">
              <div className="flex -space-x-3">
                {['JH','MR','AL','KP','SC','DB','EW'].map((i, idx) => (
                  <div key={i} className="w-9 h-9 rounded-full border-2 border-slate-900 flex items-center justify-center text-[10px] font-black text-white animate-float"
                    style={{ 
                      background: ['#dc2626','#b91c1c','#991b1b','#7f1d1d','#dc2626','#b91c1c','#991b1b'][idx], 
                      zIndex: 10 - idx,
                      animationDelay: `${idx * 0.2}s`
                    }}>
                    {i}
                  </div>
                ))}
              </div>
              <div className={`text-sm ${textSec}`}>
                <span className="flex items-center gap-1 justify-center sm:justify-start mb-1">
                  {[0,1,2,3,4].map(i => <Star key={i} className="w-4 h-4 text-red-500 fill-red-500" />)}
                  <span className={`ml-2 font-bold ${textPri}`}>4.9</span>
                </span>
                <span>Join <strong className="text-red-400">12,000+</strong> clients monitoring their cases</span>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className={`w-6 h-10 rounded-full border-2 ${dark ? 'border-slate-600' : 'border-slate-400'} flex justify-center pt-2`}>
            <div className="w-1 h-2 bg-red-500 rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* ══════════ TRAUMA STORY ═══════════════════════════════════════════════ */}
      <section className={`py-20 border-y ${dark ? 'border-slate-800/50 bg-[#131b2e]' : 'border-slate-200 bg-slate-100'}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <Reveal>
            <div className={`relative rounded-3xl overflow-hidden ${dark ? 'bg-[#1e293b]' : 'bg-white'} shadow-2xl`}>
              {/* Red accent bar */}
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-red-500 via-red-600 to-red-500" />
              
              <div className="p-8 sm:p-10">
                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500/20 to-red-600/10 border border-red-500/30 flex items-center justify-center flex-shrink-0 animate-pulse">
                    <AlertTriangle className="w-7 h-7 text-red-500" />
                  </div>
                  <div className="flex-1">
                    <p className={`text-xs font-black uppercase tracking-widest text-red-500 mb-3`}>A real story. A preventable outcome.</p>
                    <h2 className={`text-2xl sm:text-3xl font-black ${textPri} mb-4 leading-tight`}>
                      "I thought everything was fine.<br />Then I got a dismissal notice."
                    </h2>
                    <p className={`${textSec} text-base leading-relaxed mb-4`}>
                      James H. had a <span className="text-red-400 font-bold text-lg">$340,000 business dispute</span>. He trusted his lawyer. He paid his bills. But his lawyer went silent for 6 weeks. No updates. No responses. Just silence.
                    </p>
                    <p className={`${textSec} text-base leading-relaxed mb-6`}>
                      In that silence, a critical deadline passed. The case was dismissed. James lost everything.
                    </p>
                    <Link href="#how" className="inline-flex items-center gap-2 text-red-500 font-bold hover:text-red-400 transition-colors group">
                      See how Legal Eagle would have caught this
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
              
              {/* Bottom gradient fade */}
              <div className="h-1 w-full bg-gradient-to-r from-red-500/0 via-red-500/50 to-red-500/0" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════════ STATS ═══════════════════════════════════════════════════════ */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { value: 12000, prefix: '', suffix: '+', label: 'Clients monitoring their cases', sub: 'Protecting what matters', color: 'text-white', icon: <Eye className="w-5 h-5" /> },
              { value: 4200, prefix: '', suffix: '+', label: 'Potential disasters prevented', sub: 'Caught in time this year', color: 'text-emerald-400', icon: <CheckCircle className="w-5 h-5" /> },
              { value: 47, prefix: '$', suffix: 'K', label: 'Average loss from missed deadlines', sub: 'Cost of silence', color: 'text-red-500', icon: <DollarSign className="w-5 h-5" /> },
              { value: 24, prefix: '', suffix: '/7', label: 'Active case watching', sub: 'Never sleep on your rights', color: 'text-blue-400', icon: <Clock className="w-5 h-5" /> },
            ].map((s, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <div className={`${cardBg} border ${cardBorder} rounded-2xl p-6 text-center hover:border-red-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-red-600/5 group`}>
                  <div className="flex justify-center mb-3 opacity-50 group-hover:opacity-100 transition-opacity">
                    <div className={`p-2 rounded-lg ${dark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                      {s.icon}
                    </div>
                  </div>
                  <div className={`text-3xl sm:text-4xl font-black mb-2 ${s.color}`}>
                    <Counter to={s.value} prefix={s.prefix} suffix={s.suffix} />
                  </div>
                  <div className={`text-xs font-bold ${textPri} leading-snug mb-1`}>{s.label}</div>
                  <div className={`text-[10px] ${textMut}`}>{s.sub}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ WARNING CARDS (Interactive) ═══════════════════════════════ */}
      <section id="warnings" className={`py-24 border-y ${dark ? 'border-slate-800/50 bg-[#131b2e]' : 'border-slate-200 bg-slate-50'}`}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <Reveal>
            <div className="text-center mb-14">
              <span className="inline-block text-xs font-black uppercase tracking-widest text-red-500 mb-3 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20">Know the signs</span>
              <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-black ${textPri} mb-4`}>
                The Silence That Kills Cases
              </h2>
              <p className={`${textSec} max-w-xl mx-auto text-base leading-relaxed`}>
                Don't wait until it's too late. Recognize the pattern of failure before it destroys your case.
              </p>
            </div>
          </Reveal>

          <div className="grid sm:grid-cols-2 gap-5">
            {WARNING_TABLE_DATA.map((row, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <div className={`group relative ${cardBg} border ${cardBorder} rounded-2xl p-6 hover:border-red-500/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl overflow-hidden cursor-pointer`}>
                  {/* Hover glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-red-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Red accent line */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${row.color === 'red' ? 'bg-red-500' : 'bg-amber-500'} group-hover:w-1.5 transition-all`} />
                  
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-2 rounded-lg ${row.color === 'red' ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-500'} animate-pulse`}>
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <div className={`text-xs font-black px-2 py-1 rounded-full ${row.color === 'red' ? 'bg-red-500 text-white' : 'bg-amber-500 text-slate-900'}`}>
                        {row.color === 'red' ? 'CRITICAL' : 'WARNING'}
                      </div>
                    </div>
                    
                    <h3 className={`text-lg font-black ${textPri} mb-2`}>{row.sign}</h3>
                    <p className={`text-sm ${textSec} mb-4`}>{row.meaning}</p>
                    
                    <div className={`flex items-center gap-2 p-3 rounded-lg ${dark ? 'bg-slate-800/50' : 'bg-slate-100'} border ${cardBorder}`}>
                      <span className="text-lg">{row.alert.split(' ')[0]}</span>
                      <span className={`text-sm font-bold ${row.color === 'red' ? 'text-red-400' : 'text-amber-400'}`}>
                        {row.alert.split(' ').slice(1).join(' ')}
                      </span>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ FEATURES ═══════════════════════════════════════════════════ */}
      <section id="how" className="py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <Reveal>
            <div className="text-center mb-16">
              <span className="inline-block text-xs font-black uppercase tracking-widest text-red-500 mb-3">How We Protect You</span>
              <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-black ${textPri} mb-4`}>
                Your Case Guardian
              </h2>
              <p className={`${textSec} max-w-xl mx-auto`}>Three layers of protection. Zero blind spots.</p>
            </div>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <Shield className="w-6 h-6 text-red-500" />,
                tag: 'Layer 1',
                title: 'Case Timeline Guardian',
                desc: 'Watches your deadlines 24/7. Never miss a critical date that could cost you everything.',
              },
              {
                icon: <Bell className="w-6 h-6 text-amber-500" />,
                tag: 'Layer 2',
                title: 'Silence Alerts',
                desc: 'Know exactly when your lawyer goes quiet—before it becomes a $50,000 problem.',
              },
              {
                icon: <Eye className="w-6 h-6 text-blue-500" />,
                tag: 'Layer 3',
                title: 'Full Visibility',
                desc: 'You see everything they see. No more "trust me" while your case stalls.',
              },
              {
                icon: <Activity className="w-6 h-6 text-emerald-500" />,
                tag: 'Smart Tech',
                title: 'Pattern Recognition',
                desc: 'Our AI learns the warning signs that precede 89% of client complaints.',
              },
              {
                icon: <Globe className="w-6 h-6 text-purple-500" />,
                tag: 'Global',
                title: '5 Languages',
                desc: 'English, Spanish, Chinese, Arabic, Hindi. Legal protection knows no borders.',
              },
              {
                icon: <Lock className="w-6 h-6 text-slate-400" />,
                tag: 'Security',
                title: 'Bank-Grade Privacy',
                desc: 'Your case data is encrypted and yours alone. We never share with your lawyer.',
              },
            ].map((f, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <div className={`group ${cardBg} border ${cardBorder} rounded-2xl p-6 hover:border-red-500/30 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden h-full`}>
                  <div className="absolute inset-0 bg-gradient-to-br from-red-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-5">
                      <div className="p-3 rounded-xl bg-slate-800/50 group-hover:bg-red-500/10 transition-colors">
                        {f.icon}
                      </div>
                      <span className="text-[10px] font-black px-2 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 uppercase tracking-wide">
                        {f.tag}
                      </span>
                    </div>
                    <h3 className={`text-lg font-black ${textPri} mb-3`}>{f.title}</h3>
                    <p className={`text-sm ${textSec} leading-relaxed`}>{f.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ PRICING / COST COMPARISON ══════════════════════════════════ */}
      <section id="pricing" className={`py-24 border-y ${dark ? 'border-slate-800/50 bg-[#131b2e]' : 'border-slate-200 bg-slate-50'}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <Reveal>
            <div className="text-center mb-14">
              <span className="inline-block text-xs font-black uppercase tracking-widest text-red-500 mb-3">The Math Is Brutal</span>
              <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-black ${textPri} mb-4`}>
                The Alternative Is Expensive
              </h2>
              <p className={`${textSec} max-w-xl mx-auto text-base`}>
                What not watching costs vs. what watching costs.
              </p>
            </div>
          </Reveal>

          <div className="grid lg:grid-cols-2 gap-6 mb-12">
            {/* Without */}
            <Reveal delay={0}>
              <div className={`rounded-3xl border-2 border-red-600/30 ${dark ? 'bg-gradient-to-b from-red-950/30 to-red-900/10' : 'bg-gradient-to-b from-red-50 to-white'} p-8 relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 rounded-full blur-3xl" />
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 rounded-xl bg-red-600/20 flex items-center justify-center">
                    <XCircle className="w-6 h-6 text-red-500" />
                  </div>
                  <h3 className={`font-black text-xl ${textPri}`}>Without Legal Eagle</h3>
                </div>
                <div className="space-y-4">
                  {[
                    ['Average loss from missed deadline', '$47,000', 'text-red-500'],
                    ['Average legal fees wasted yearly', '$12,400', 'text-red-400'],
                    ['Cost to refile after dismissal', '$3,800–$15,000', 'text-red-400'],
                    ['Time lost discovering problem', '4–16 weeks', 'text-red-400'],
                  ].map(([label, val, color]) => (
                    <div key={label} className={`flex justify-between items-center py-3 border-b ${dark ? 'border-red-900/20' : 'border-red-200/60'}`}>
                      <span className={`text-sm ${dark ? 'text-red-300' : 'text-red-800'}`}>{label}</span>
                      <span className={`text-sm font-black ${color}`}>{val}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 p-4 rounded-xl bg-red-600/10 border border-red-600/20">
                  <p className="text-xs text-red-400 font-bold text-center">Total potential cost: $50,000–$500,000+</p>
                </div>
              </div>
            </Reveal>

            {/* With */}
            <Reveal delay={0.15}>
              <div className={`rounded-3xl border-2 border-emerald-500/40 ${dark ? 'bg-gradient-to-b from-emerald-950/30 to-emerald-900/10' : 'bg-gradient-to-b from-emerald-50 to-white'} p-8 relative overflow-hidden`}>
                <div className="absolute -top-3 right-6">
                  <span className="bg-gradient-to-r from-emerald-500 to-emerald-400 text-white text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-wide shadow-lg">
                    Smart Choice
                  </span>
                </div>
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-emerald-400" />
                  </div>
                  <h3 className={`font-black text-xl ${textPri}`}>With Legal Eagle</h3>
                </div>
                <div className="space-y-4">
                  {[
                    ['Monthly cost (after trial)', '$29/month', 'text-emerald-400'],
                    ['Early warning before deadline', '✓ Included', 'text-emerald-400'],
                    ['Silence alert at 72 hours', '✓ Included', 'text-emerald-400'],
                    ['Cancel anytime, no questions', '✓ Included', 'text-emerald-400'],
                  ].map(([label, val, color]) => (
                    <div key={label} className={`flex justify-between items-center py-3 border-b ${dark ? 'border-emerald-900/20' : 'border-emerald-200/60'}`}>
                      <span className={`text-sm ${dark ? 'text-emerald-300' : 'text-emerald-800'}`}>{label}</span>
                      <span className={`text-sm font-black ${color}`}>{val}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <p className="text-xs text-emerald-400 font-bold text-center">Savings: 1,620x your investment</p>
                </div>
              </div>
            </Reveal>
          </div>

          {/* Pricing Card */}
          <Reveal delay={0.25}>
            <div className={`${cardBg} border-2 border-red-500/50 rounded-3xl p-10 text-center shadow-2xl shadow-red-600/10 relative overflow-hidden`}>
              <div className="absolute inset-0 bg-gradient-to-r from-red-600/5 via-transparent to-red-600/5 animate-shimmer" />
              
              <p className={`text-xs font-black uppercase tracking-widest text-red-500 mb-3`}>One Plan. Full Protection.</p>
              <div className="flex items-end justify-center gap-1 mb-3">
                <span className={`text-7xl font-black ${textPri}`}>$29</span>
                <span className={`text-xl ${textSec} mb-2`}>/month</span>
              </div>
              <p className={`text-sm ${textMut} mb-8`}>
                14-day free trial · No credit card required · Cancel anytime
              </p>
              
              <Link href="/onboarding" className={`${redBtn} text-lg px-12 py-5 w-full sm:w-auto inline-flex`}>
                PROTECT MY CASE NOW
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <p className={`text-xs ${textMut} mt-6`}>
                Don't wait for a dismissal notice.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════════ FAQ ════════════════════════════════════════════════════════ */}
      <section id="faq" className="py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <Reveal>
            <div className="text-center mb-14">
              <span className="inline-block text-xs font-black uppercase tracking-widest text-red-500 mb-3">Transparency</span>
              <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-black ${textPri}`}>
                Good Questions.<br />Honest Answers.
              </h2>
            </div>
          </Reveal>

          <div className="space-y-4">
            {FAQS.map((faq, i) => (
              <Reveal key={i} delay={i * 0.05}>
                <div className={`${cardBg} border ${cardBorder} rounded-2xl overflow-hidden hover:border-red-500/20 transition-colors`}>
                  <button
                    className="w-full text-left px-6 py-5 flex items-start justify-between gap-4 group"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                    <span className={`text-sm font-bold ${textPri} leading-snug group-hover:text-red-400 transition-colors`}>{faq.q}</span>
                    <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 ${openFaq === i ? 'bg-red-600 text-white rotate-45' : (dark ? 'bg-slate-800 text-slate-400 group-hover:bg-red-600/20 group-hover:text-red-500' : 'bg-slate-100 text-slate-500 group-hover:bg-red-50 group-hover:text-red-500')}`}>
                      <Plus className="w-4 h-4" />
                    </span>
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ${openFaq === i ? 'max-h-96' : 'max-h-0'}`}>
                    <div className={`px-6 pb-5 text-sm ${textSec} leading-relaxed border-t ${cardBorder} pt-4`}>
                      {faq.a}
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ FINAL CTA ═════════════════════════════════════════════════ */}
      <section className="py-32 relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-red-950/20 to-slate-950" />
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(circle,#dc2626 1px,transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] opacity-20 animate-pulse"
          style={{ background: 'radial-gradient(circle, #dc2626, transparent)', filter: 'blur(120px)' }} />

        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <Reveal>
            <div className="mb-8">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-red-600/40 animate-float">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight mb-6">
                Your case deserves a<br />
                <span className="text-gradient-red">watchdog.</span>
              </h2>
              <p className="text-slate-400 text-lg sm:text-xl mb-4 leading-relaxed max-w-xl mx-auto">
                Every day you wait is a day your attorney could go silent and you'd have no idea.
              </p>
              <p className="text-slate-500 text-base">
                Start your free trial. Know immediately. Sleep again.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link href="/onboarding" className={`${redBtn} text-lg px-12 py-6`}>
                PROTECT MY CASE NOW
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <p className="text-slate-600 text-sm flex items-center justify-center gap-4 flex-wrap">
              <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-green-500" /> 14-day free</span>
              <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-green-500" /> No credit card</span>
              <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-green-500" /> Cancel anytime</span>
            </p>
          </Reveal>
        </div>
      </section>

      {/* ══════════ STICKY CTA BAR ═════════════════════════════════════════════ */}
      <div className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-500 transform ${showStickyCta ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className={`${dark ? 'bg-[#0a0f1a]/95 border-slate-800' : 'bg-white/95 border-slate-200'} border-t backdrop-blur-xl px-4 py-4`}>
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <p className={`text-sm font-bold ${textPri}`}>Don't let silence destroy your case</p>
              <p className={`text-xs ${textMut}`}>14-day free trial · No credit card required</p>
            </div>
            <Link href="/onboarding" className={`${redBtn} text-sm px-6 py-3 w-full sm:w-auto animate-pulse`}>
              PROTECT MY CASE NOW
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* ══════════ FOOTER ════════════════════════════════════════════════════ */}
      <footer className="bg-slate-950 py-16 border-t border-slate-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-10 mb-12">
            <div className="max-w-sm">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-lg shadow-red-600/20">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-black text-white">Legal<span className="text-red-500">Eagle</span></span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed mb-3">
                The early warning system for your legal case. Because silence shouldn't cost you everything.
              </p>
              <p className="text-xs text-slate-600 leading-relaxed">
                <strong className="text-slate-500">Disclaimer:</strong> Legal Eagle does not provide legal advice. We help you monitor your case. For legal strategy, always consult a licensed attorney.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 text-sm">
              <div>
                <p className="text-slate-400 font-bold mb-4">Product</p>
                {['How It Works', 'Warning Signs', 'Pricing', 'FAQ'].map(l => (
                  <a key={l} href={`#${l.toLowerCase().replace(/ /g, '-')}`}
                    className="block text-slate-600 hover:text-red-400 mb-2 transition-colors">{l}</a>
                ))}
              </div>
              <div>
                <p className="text-slate-400 font-bold mb-4">Legal</p>
                {['Privacy Policy', 'Terms of Service', 'Disclaimer'].map(l => (
                  <a key={l} href="#" className="block text-slate-600 hover:text-red-400 mb-2 transition-colors">{l}</a>
                ))}
              </div>
              <div>
                <p className="text-slate-400 font-bold mb-4">Account</p>
                <Link href="/login" className="block text-slate-600 hover:text-red-400 mb-2 transition-colors">Log In</Link>
                <Link href="/onboarding" className="block text-red-500 hover:text-red-400 font-bold transition-colors">Protect My Case →</Link>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-900 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-700">
              © 2026 Legal Eagle Technologies. All rights reserved.
            </p>
            <div className="flex items-center gap-3">
              {LANGS.map(l => (
                <button key={l.code} onClick={() => setLocale(l.code)}
                  className={`text-lg transition-all hover:scale-125 ${l.code === locale ? 'opacity-100 scale-110' : 'opacity-40 hover:opacity-80'}`}
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

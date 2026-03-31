'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Scale, ArrowRight, CheckCircle, Menu, X, Moon, Sun, Globe,
  ChevronDown, Sparkles, Shield, Clock, MessageSquare, DollarSign,
  Zap, Star, ArrowUpRight, Play
} from 'lucide-react';
import { landing, type LandingLocale, type LandingT } from '@/lib/landing/translations';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

// ─── Dark mode hook ────────────────────────────────────────────────────────────
function useDarkMode() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const stored = localStorage.getItem('le_theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDark(stored ? stored === 'dark' : prefersDark);
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('le_theme', dark ? 'dark' : 'light');
  }, [dark]);
  return [dark, setDark] as const;
}

// ─── Intersection Observer hook ───────────────────────────────────────────────
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
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

// ─── Animated counter ─────────────────────────────────────────────────────────
function Counter({ to, suffix = '' }: { to: string; suffix?: string }) {
  const [displayed, setDisplayed] = useState('0');
  const [ref, inView] = useInView();
  useEffect(() => {
    if (!inView) return;
    const numeric = parseFloat(to.replace(/[^0-9.]/g, ''));
    const isInt = Number.isInteger(numeric);
    let start = 0;
    const duration = 1400;
    const step = 16;
    const increment = numeric / (duration / step);
    const timer = setInterval(() => {
      start = Math.min(start + increment, numeric);
      setDisplayed((isInt ? Math.round(start) : start.toFixed(1)) + (to.includes('%') ? '%' : to.includes('×') ? '×' : ''));
      if (start >= numeric) clearInterval(timer);
    }, step);
    return () => clearInterval(timer);
  }, [inView, to]);
  return <span ref={ref as any}>{displayed}{suffix}</span>;
}

// ─── App mockup illustration ───────────────────────────────────────────────────
function AppMockup({ dark }: { dark: boolean }) {
  const bg   = dark ? '#1e293b' : '#ffffff';
  const sbg  = dark ? '#0f172a' : '#0f172a';
  const card = dark ? '#334155' : '#f8f7f4';
  const text = dark ? '#e2e8f0' : '#1a1714';
  const muted= dark ? '#94a3b8' : '#9c9890';
  const gold = '#d4a017';
  const red  = '#ef4444';
  const grn  = '#22c55e';
  const amb  = '#f59e0b';

  return (
    <svg viewBox="0 0 520 380" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto drop-shadow-2xl">
      <defs>
        <linearGradient id="cardGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={dark ? '#1e293b' : '#ffffff'} />
          <stop offset="100%" stopColor={dark ? '#0f172a' : '#f5f4f0'} />
        </linearGradient>
        <filter id="shadow" x="-10%" y="-10%" width="120%" height="130%">
          <feDropShadow dx="0" dy="8" stdDeviation="16" floodColor="#000" floodOpacity={dark ? '0.5' : '0.15'} />
        </filter>
        <clipPath id="appClip"><rect rx="16" width="520" height="380" /></clipPath>
      </defs>

      {/* Main window */}
      <g filter="url(#shadow)" clipPath="url(#appClip)">
        <rect width="520" height="380" rx="16" fill={bg} />

        {/* Sidebar */}
        <rect width="120" height="380" fill={sbg} />
        {/* Logo */}
        <rect x="12" y="14" width="24" height="24" rx="6" fill={gold} />
        <text x="24" y="30" textAnchor="middle" fontSize="12" fill="white" fontWeight="700">⚖</text>
        <text x="44" y="23" fontSize="9" fill="white" fontWeight="600">Legal</text>
        <text x="44" y="33" fontSize="9" fill="white" fontWeight="600">Eagle</text>

        {/* Nav items */}
        {[
          { y: 65,  label: '⊞ Dashboard', active: true  },
          { y: 87,  label: '📁 Cases',    active: false, badge: '24' },
          { y: 109, label: '📄 Docs',     active: false },
          { y: 131, label: '✉ Messages',  active: false, badge: '7' },
          { y: 153, label: '$ Billing',   active: false },
          { y: 175, label: '⚠ Alerts',   active: false, badge: '3' },
        ].map(item => (
          <g key={item.y}>
            {item.active && <rect x="6" y={item.y - 10} width="108" height="20" rx="6" fill="rgba(212,160,23,0.18)" />}
            {item.active && <rect x="114" y={item.y - 10} width="2" height="20" fill={gold} />}
            <text x="16" y={item.y + 3} fontSize="8" fill={item.active ? gold : '#64748b'} fontWeight={item.active ? '600' : '400'}>
              {item.label}
            </text>
            {item.badge && (
              <g>
                <rect x="92" y={item.y - 7} width="18" height="12" rx="6" fill="rgba(212,160,23,0.2)" />
                <text x="101" y={item.y + 2} textAnchor="middle" fontSize="7" fill={gold} fontWeight="700">{item.badge}</text>
              </g>
            )}
          </g>
        ))}

        {/* User row at bottom */}
        <circle cx="22" cy="355" r="10" fill="rgba(212,160,23,0.3)" />
        <text x="22" y="359" textAnchor="middle" fontSize="8" fill={gold} fontWeight="700">SC</text>
        <text x="40" y="352" fontSize="7" fill="white" fontWeight="500">Sarah Chen</text>
        <text x="40" y="362" fontSize="6" fill="#475569">Attorney</text>

        {/* Main content area */}
        <rect x="120" y="0" width="400" height="380" fill={bg} />

        {/* Topbar */}
        <rect x="120" y="0" width="400" height="36" fill={dark ? '#1e293b' : '#ffffff'} />
        <rect x="120" y="35" width="400" height="1" fill={dark ? '#334155' : '#e8e5df'} />
        <rect x="134" y="10" width="140" height="16" rx="8" fill={dark ? '#334155' : '#f0ede7'} />
        <text x="150" y="21" fontSize="8" fill={muted}>🔍 Search cases…</text>
        <circle cx="478" cy="18" r="9" fill={dark ? '#374151' : '#f0ede7'} />
        <text x="478" y="22" textAnchor="middle" fontSize="8">🔔</text>
        <circle cx="500" cy="18" r="8" fill="rgba(212,160,23,0.3)" />
        <text x="500" y="22" textAnchor="middle" fontSize="7" fill={gold} fontWeight="700">SC</text>

        {/* Dashboard greeting */}
        <text x="134" y="58" fontSize="13" fill={text} fontWeight="700" fontFamily="Georgia, serif">Good morning, Sarah</text>
        <text x="134" y="71" fontSize="8" fill={muted}>3 high-risk cases · 7 unread messages today</text>

        {/* Stat cards row */}
        {[
          { x: 134, label: 'Active Cases', val: '18', color: '#3b82f6' },
          { x: 226, label: 'High Risk',    val: '3',  color: red },
          { x: 318, label: 'Unread Msgs',  val: '7',  color: '#7c3aed' },
          { x: 410, label: 'Pending',      val: '12', color: amb },
        ].map(s => (
          <g key={s.x}>
            <rect x={s.x} y="80" width="80" height="52" rx="10" fill={card} stroke={dark ? '#475569' : '#e8e5df'} strokeWidth="0.5" />
            <text x={s.x + 10} y="101" fontSize="16" fill={s.color} fontWeight="800">{s.val}</text>
            <text x={s.x + 10} y="116" fontSize="7" fill={muted}>{s.label}</text>
          </g>
        ))}

        {/* AI Alert banner */}
        <rect x="134" y="142" width="356" height="30" rx="8" fill="rgba(239,68,68,0.1)" stroke="rgba(239,68,68,0.25)" strokeWidth="0.5" />
        <text x="148" y="153" fontSize="8" fill={red}>⚠</text>
        <text x="160" y="153" fontSize="8" fill={dark ? '#fca5a5' : '#991b1b'} fontWeight="700">AI Alert:</text>
        <text x="204" y="153" fontSize="8" fill={dark ? '#fca5a5' : '#991b1b'}> Novak Divorce — no activity in 21 days · High Risk</text>
        <rect x="448" y="146" width="36" height="16" rx="6" fill={red} />
        <text x="466" y="157" textAnchor="middle" fontSize="7" fill="white" fontWeight="600">Resolve</text>

        {/* Cases mini-table */}
        <text x="134" y="190" fontSize="9" fill={text} fontWeight="700">Active Cases</text>
        {[
          { y: 203, name: 'Harrison v. Meridian Corp.',  status: 'In Court',   risk: 78, riskCol: red, statusCol: amb },
          { y: 221, name: 'Al-Rashid Family Trust',       status: 'Open',       risk: 22, riskCol: grn, statusCol: '#3b82f6' },
          { y: 239, name: 'Rodriguez Immigration',        status: 'Pre-Filing', risk: 55, riskCol: amb, statusCol: '#7c3aed' },
        ].map(row => (
          <g key={row.y}>
            <rect x="134" y={row.y - 9} width="356" height="16" rx="4" fill={dark ? '#1e293b' : '#fafaf8'} stroke={dark ? '#334155' : '#f0ede7'} strokeWidth="0.5" />
            <circle cx="146" cy={row.y} r="4" fill={row.riskCol} />
            <text x="156" y={row.y + 3} fontSize="7.5" fill={text} fontWeight="500">{row.name}</text>
            <rect x="368" y={row.y - 6} width="46" height="12" rx="4" fill={`${row.statusCol}22`} stroke={row.statusCol} strokeWidth="0.5" />
            <text x="391" y={row.y + 2} textAnchor="middle" fontSize="6" fill={row.statusCol} fontWeight="600">{row.status}</text>
            <text x="466" y={row.y + 3} textAnchor="middle" fontSize="8" fill={row.riskCol} fontWeight="800">{row.risk}</text>
          </g>
        ))}

        {/* Risk bars at bottom */}
        <text x="134" y="273" fontSize="9" fill={text} fontWeight="700">Portfolio Health</text>
        {[
          { y: 283, label: 'Low Risk',  pct: 62, col: grn },
          { y: 300, label: 'Med Risk',  pct: 25, col: amb },
          { y: 317, label: 'High Risk', pct: 13, col: red },
        ].map(b => (
          <g key={b.y}>
            <text x="134" y={b.y + 8} fontSize="7" fill={muted}>{b.label}</text>
            <rect x="200" y={b.y} width="250" height="10" rx="5" fill={dark ? '#334155' : '#e8e5df'} />
            <rect x="200" y={b.y} width={250 * b.pct / 100} height="10" rx="5" fill={b.col} />
            <text x="460" y={b.y + 8} fontSize="7" fill={b.col} fontWeight="700">{b.pct}%</text>
          </g>
        ))}

        {/* Bottom sparkle AI badge */}
        <rect x="134" y="340" width="140" height="24" rx="8" fill={`${gold}22`} stroke={`${gold}44`} strokeWidth="0.5" />
        <text x="148" y="355" fontSize="8" fill={gold}>✦</text>
        <text x="162" y="355" fontSize="8" fill={gold} fontWeight="600">AI Engine: 0 issues in 14 days</text>
      </g>

      {/* Floating alert card */}
      <g transform="translate(350, 10)">
        <rect width="158" height="64" rx="12" fill={dark ? '#1e293b' : 'white'} stroke={dark ? '#ef4444' : '#fecaca'} strokeWidth="1" filter="url(#shadow)" />
        <rect x="0" y="0" width="158" height="3" rx="12" fill={red} />
        <text x="12" y="22" fontSize="9" fill={red} fontWeight="700">⚠ High Risk Alert</text>
        <text x="12" y="35" fontSize="7.5" fill={dark ? '#94a3b8' : '#5c5850'}>Novak Divorce — Day 21</text>
        <text x="12" y="47" fontSize="7" fill={dark ? '#64748b' : '#9c9890'}>No activity · Client not notified</text>
        <rect x="12" y="52" width="50" height="8" rx="4" fill={red} />
        <text x="37" y="59" textAnchor="middle" fontSize="5.5" fill="white" fontWeight="600">View Case</text>
      </g>

      {/* Floating stats card */}
      <g transform="translate(4, 250)">
        <rect width="110" height="55" rx="10" fill={dark ? '#1e293b' : 'white'} stroke={dark ? '#334155' : '#e8e5df'} strokeWidth="0.5" filter="url(#shadow)" />
        <rect x="8" y="10" width="20" height="20" rx="6" fill="rgba(34,197,94,0.15)" />
        <text x="18" y="25" textAnchor="middle" fontSize="11">✓</text>
        <text x="36" y="21" fontSize="9" fill={grn} fontWeight="700">All clear</text>
        <text x="36" y="31" fontSize="7" fill={muted}>Rodriguez case</text>
        <text x="8" y="47" fontSize="7" fill={muted}>Updated 2 min ago</text>
      </g>
    </svg>
  );
}

// ─── Client Portal mockup ─────────────────────────────────────────────────────
function ClientMockup({ dark }: { dark: boolean }) {
  const bg   = dark ? '#1e293b' : '#ffffff';
  const sbg  = dark ? '#0f172a' : '#0f172a';
  const card = dark ? '#334155' : '#f8f7f4';
  const text = dark ? '#e2e8f0' : '#1a1714';
  const muted= dark ? '#94a3b8' : '#9c9890';
  const blue = '#3b82f6';
  const amb  = '#f59e0b';

  return (
    <svg viewBox="0 0 340 260" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto drop-shadow-xl">
      <defs>
        <filter id="shadow2" x="-10%" y="-10%" width="130%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="10" floodColor="#000" floodOpacity={dark ? '0.4' : '0.12'} />
        </filter>
        <clipPath id="clip2"><rect rx="14" width="340" height="260" /></clipPath>
      </defs>
      <g filter="url(#shadow2)" clipPath="url(#clip2)">
        <rect width="340" height="260" rx="14" fill={bg} />
        <rect width="96" height="260" fill={sbg} />

        {/* Logo */}
        <rect x="10" y="12" width="20" height="20" rx="5" fill="#3b82f6" />
        <text x="20" y="26" textAnchor="middle" fontSize="10" fill="white">⚖</text>
        <text x="36" y="19" fontSize="7" fill="white" fontWeight="600">Legal</text>
        <text x="36" y="28" fontSize="6" fill="#64748b">Client Portal</text>

        {/* Client badge */}
        <rect x="6" y="40" width="84" height="30" rx="7" fill="rgba(59,130,246,0.1)" stroke="rgba(59,130,246,0.2)" strokeWidth="0.5" />
        <circle cx="18" cy="55" r="7" fill="rgba(59,130,246,0.25)" />
        <text x="18" y="59" textAnchor="middle" fontSize="6" fill={blue} fontWeight="700">JH</text>
        <text x="30" y="52" fontSize="6.5" fill="white" fontWeight="500">James H.</text>
        <text x="30" y="62" fontSize="5.5" fill="#64748b">Client Account</text>

        {[
          { y: 84,  label: '⊞ My Cases', active: true },
          { y: 100, label: '📄 Documents', active: false },
          { y: 116, label: '✉ Messages',  active: false, badge: '1' },
          { y: 132, label: '$ Billing',   active: false },
        ].map(item => (
          <g key={item.y}>
            {item.active && <rect x="4" y={item.y - 8} width="88" height="16" rx="5" fill="rgba(59,130,246,0.12)" />}
            {item.active && <rect x="92" y={item.y - 8} width="2" height="16" fill={blue} />}
            <text x="14" y={item.y + 3} fontSize="7" fill={item.active ? '#93c5fd' : '#64748b'} fontWeight={item.active ? '600' : '400'}>
              {item.label}
            </text>
            {item.badge && (
              <g>
                <rect x="74" y={item.y - 5} width="14" height="10" rx="5" fill="rgba(59,130,246,0.2)" />
                <text x="81" y={item.y + 2} textAnchor="middle" fontSize="6" fill="#93c5fd" fontWeight="700">{item.badge}</text>
              </g>
            )}
          </g>
        ))}

        {/* Portal badge in topbar */}
        <rect x="96" y="0" width="244" height="30" fill={dark ? '#1e293b' : '#ffffff'} />
        <rect x="96" y="29" width="244" height="1" fill={dark ? '#334155' : '#e8e5df'} />
        <rect x="108" y="8" width="76" height="14" rx="7" fill={`${blue}22`} stroke={`${blue}44`} strokeWidth="0.5" />
        <circle cx="120" cy="15" r="3" fill={blue} />
        <text x="127" y="19" fontSize="6.5" fill={blue} fontWeight="700">Client Portal</text>

        {/* Main content */}
        <text x="108" y="50" fontSize="11" fill={text} fontWeight="700" fontFamily="Georgia, serif">Hello, James</text>
        <text x="108" y="62" fontSize="7" fill={muted}>Your active legal cases</text>

        {/* Alert */}
        <rect x="108" y="70" width="220" height="22" rx="7" fill={`${amb}18`} stroke={`${amb}44`} strokeWidth="0.5" />
        <text x="118" y="84" fontSize="7" fill={amb}>⚠ Your attorney has been alerted about your case update.</text>

        {/* Case card */}
        <rect x="108" y="100" width="220" height="100" rx="10" fill={card} stroke={dark ? '#475569' : '#e8e5df'} strokeWidth="0.5" />
        <rect x="108" y="100" width="220" height="2" rx="10" fill={amb} />
        <text x="118" y="116" fontSize="7" fill={dark ? '#fbbf24' : '#92400e'} fontWeight="600">In Court  ·  High risk</text>
        <text x="118" y="129" fontSize="9.5" fill={text} fontWeight="700" fontFamily="Georgia, serif">Harrison v. Meridian</text>
        <text x="118" y="140" fontSize="6.5" fill={muted}>Civil Litigation · Sarah Chen</text>

        {/* Health bar */}
        <text x="118" y="155" fontSize="6.5" fill={muted}>Case Health</text>
        <rect x="118" y="158" width="140" height="6" rx="3" fill={dark ? '#475569' : '#e8e5df'} />
        <rect x="118" y="158" width="30" height="6" rx="3" fill="#ef4444" />
        <text x="265" y="163" fontSize="6" fill="#ef4444" fontWeight="700">🔴 Review needed</text>

        {/* Actions */}
        <rect x="118" y="172" width="88" height="18" rx="6" fill={`${amb}20`} stroke={`${amb}60`} strokeWidth="0.5" />
        <text x="162" y="184" textAnchor="middle" fontSize="6.5" fill={amb} fontWeight="600">✦ Is my case stuck?</text>
        <rect x="212" y="172" width="70" height="18" rx="6" fill={dark ? '#334155' : '#f0ede7'} stroke={dark ? '#475569' : '#e8e5df'} strokeWidth="0.5" />
        <text x="247" y="184" textAnchor="middle" fontSize="6.5" fill={muted} fontWeight="500">✉ Message</text>

        {/* Billing mini */}
        <rect x="108" y="210" width="220" height="40" rx="8" fill={card} stroke={dark ? '#475569' : '#e8e5df'} strokeWidth="0.5" />
        <text x="118" y="225" fontSize="7.5" fill={text} fontWeight="700" fontFamily="Georgia, serif">Billing Summary</text>
        <text x="118" y="238" fontSize="7" fill={muted}>$9,750 of $15,000 cap</text>
        <rect x="118" y="242" width="140" height="5" rx="2.5" fill={dark ? '#475569' : '#e8e5df'} />
        <rect x="118" y="242" width="91" height="5" rx="2.5" fill={amb} />
        <text x="270" y="247" fontSize="6" fill={amb} fontWeight="600">65%</text>
      </g>
    </svg>
  );
}

// ─── Main Landing Page ─────────────────────────────────────────────────────────
export default function LandingPage() {
  const [dark, setDark]       = useDarkMode();
  const [locale, setLocale]   = useState<LandingLocale>('en');
  const [mobileMenu, setMenu] = useState(false);
  const [langOpen, setLangO]  = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();
  const { profile, loading } = useAuth();

  // Redirect logged-in users to their portal immediately
  useEffect(() => {
    if (!loading && profile) {
      router.replace(profile.role === 'client' ? '/portal/dashboard' : '/dashboard');
    }
  }, [profile, loading, router]);

  const t: LandingT = landing[locale];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const LANGS: { code: LandingLocale; flag: string; label: string }[] = [
    { code: 'en', flag: '🇺🇸', label: 'English'  },
    { code: 'ar', flag: '🇸🇦', label: 'العربية'  },
    { code: 'es', flag: '🇪🇸', label: 'Español'  },
    { code: 'zh', flag: '🇨🇳', label: '中文'      },
    { code: 'hi', flag: '🇮🇳', label: 'हिन्दी'  },
  ];

  const isRTL = locale === 'ar';
  const dest  = profile?.role === 'client' ? '/portal/dashboard' : profile ? '/dashboard' : '/login';

  // ── Scroll-reveal wrapper ────────────────────────────────────────────────────
  function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
    const [ref, inView] = useInView();
    return (
      <div ref={ref} style={{
        opacity:    inView ? 1 : 0,
        transform:  inView ? 'translateY(0)' : 'translateY(32px)',
        transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
      }}>
        {children}
      </div>
    );
  }

  const bgPage    = dark ? 'bg-gray-950'  : 'bg-stone-50';
  const bgCard    = dark ? 'bg-gray-900'  : 'bg-white';
  const bgSection = dark ? 'bg-gray-900'  : 'bg-white';
  const border    = dark ? 'border-gray-800' : 'border-stone-200';
  const textPrimary   = dark ? 'text-white'     : 'text-stone-900';
  const textSecondary = dark ? 'text-gray-400'  : 'text-stone-500';
  const textMuted     = dark ? 'text-gray-500'  : 'text-stone-400';

  const navBg = scrolled
    ? (dark ? 'bg-gray-950/95 border-gray-800' : 'bg-white/95 border-stone-200')
    : 'bg-transparent border-transparent';

  return (
    <div className={`min-h-screen ${bgPage} ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}
      style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>

      {/* ── Navbar ── */}
      <header className={`fixed top-0 inset-x-0 z-50 border-b backdrop-blur-md transition-all duration-300 ${navBg}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-md">
              <Scale className="w-5 h-5 text-white" />
            </div>
            <span className={`text-xl font-semibold ${textPrimary} tracking-wide hidden sm:block`}
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>Legal Eagle</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-7">
            {[
              { label: t.nav.features,    href: '#features'   },
              { label: t.nav.howItWorks,  href: '#how'        },
              { label: t.nav.product,     href: '#portals'    },
            ].map(item => (
              <a key={item.href} href={item.href}
                className={`text-sm font-medium ${textSecondary} hover:text-amber-500 transition-colors`}>
                {item.label}
              </a>
            ))}
          </nav>

          {/* Right controls */}
          <div className="flex items-center gap-2">
            {/* Language picker */}
            <div className="relative hidden sm:block">
              <button onClick={() => setLangO(!langOpen)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${border} text-xs ${textSecondary} hover:${textPrimary} transition-all`}>
                <Globe className="w-3.5 h-3.5" />
                <span>{LANGS.find(l => l.code === locale)?.flag}</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${langOpen ? 'rotate-180' : ''}`} />
              </button>
              {langOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setLangO(false)} />
                  <div className={`absolute ${isRTL ? 'left-0' : 'right-0'} top-full mt-1 w-40 ${bgCard} border ${border} rounded-xl shadow-xl overflow-hidden z-50`}>
                    {LANGS.map(l => (
                      <button key={l.code} onClick={() => { setLocale(l.code); setLangO(false); }}
                        className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2 transition-colors ${
                          l.code === locale
                            ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 font-semibold'
                            : `${textSecondary} hover:bg-stone-50 dark:hover:bg-gray-800`
                        }`}>
                        <span className="text-sm">{l.flag}</span> {l.label}
                        {l.code === locale && <span className="ml-auto text-amber-500">✓</span>}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Dark mode */}
            <button onClick={() => setDark(!dark)}
              className={`p-2 rounded-lg border ${border} ${textSecondary} hover:text-amber-500 transition-all`}>
              {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Auth buttons */}
            <Link href="/login"
              className={`hidden sm:block text-sm font-medium ${textSecondary} hover:text-amber-500 transition-colors px-3 py-1.5`}>
              {t.nav.login}
            </Link>
            <Link href="/onboarding"
              className="btn-primary text-sm py-2 px-4 hidden sm:flex shadow-md">
              {t.nav.getStarted} <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            {/* Mobile menu toggle */}
            <button className={`lg:hidden p-2 ${textSecondary}`} onClick={() => setMenu(!mobileMenu)}>
              {mobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenu && (
          <div className={`lg:hidden border-t ${border} ${bgCard} px-4 py-4 space-y-3`}>
            {[
              { label: t.nav.features, href: '#features' },
              { label: t.nav.howItWorks, href: '#how' },
            ].map(item => (
              <a key={item.href} href={item.href} onClick={() => setMenu(false)}
                className={`block text-sm font-medium ${textSecondary} hover:text-amber-500 py-1.5 transition-colors`}>
                {item.label}
              </a>
            ))}
            <div className="flex gap-2 pt-2">
              <Link href="/login" onClick={() => setMenu(false)}
                className={`flex-1 text-center py-2 border ${border} rounded-xl text-sm font-medium ${textSecondary}`}>
                {t.nav.login}
              </Link>
              <Link href="/onboarding" onClick={() => setMenu(false)}
                className="flex-1 text-center py-2 bg-amber-600 text-white rounded-xl text-sm font-semibold">
                {t.nav.getStarted}
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ══════════════════ HERO ══════════════════ */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 pointer-events-none">
          <div className={`absolute top-0 ${isRTL ? 'left-0' : 'right-0'} w-[600px] h-[600px] rounded-full opacity-20`}
            style={{ background: 'radial-gradient(circle, #d4a017, transparent)', filter: 'blur(80px)' }} />
          <div className={`absolute bottom-20 ${isRTL ? 'right-0' : 'left-0'} w-96 h-96 rounded-full opacity-10`}
            style={{ background: 'radial-gradient(circle, #3b82f6, transparent)', filter: 'blur(60px)' }} />
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-[0.025]"
            style={{ backgroundImage: 'linear-gradient(#888 1px,transparent 1px),linear-gradient(90deg,#888 1px,transparent 1px)', backgroundSize: '50px 50px' }} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Copy */}
            <div>
              {/* Badge */}
              <div style={{ opacity: 1, animation: 'fadeIn 0.5s ease' }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-semibold mb-6">
                <Sparkles className="w-3.5 h-3.5" />
                {t.hero.badge}
              </div>

              {/* Headline */}
              <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", animation: 'slideUp 0.6s ease 0.1s both' }}
                className={`text-5xl sm:text-6xl lg:text-7xl font-light leading-none mb-3 ${textPrimary}`}>
                {t.hero.headline1}<br />
                <em className="font-semibold not-italic text-amber-500">{t.hero.headline2}</em>
              </h1>

              <p style={{ animation: 'slideUp 0.6s ease 0.2s both' }}
                className={`text-lg ${textSecondary} leading-relaxed mb-8 max-w-lg`}>
                {t.hero.sub}
              </p>

              {/* CTAs */}
              <div style={{ animation: 'slideUp 0.6s ease 0.3s both' }}
                className="flex flex-wrap gap-3 mb-8">
                <Link href="/onboarding"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm shadow-lg shadow-amber-600/25 transition-all duration-200 hover:scale-105 active:scale-100">
                  {t.hero.cta1} <ArrowRight className="w-4 h-4" />
                </Link>
                <a href="#how"
                  className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 ${border} ${textSecondary} hover:border-amber-500 hover:text-amber-500 font-semibold text-sm transition-all duration-200`}>
                  <Play className="w-4 h-4" /> {t.hero.cta2}
                </a>
              </div>

              {/* Trust bar */}
              <div style={{ animation: 'slideUp 0.6s ease 0.4s both' }}
                className="flex items-center gap-4 flex-wrap">
                <div className="flex -space-x-2">
                  {['SC', 'JH', 'MR', 'AL', 'KP'].map((i, idx) => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-stone-50 dark:border-gray-900 flex items-center justify-center text-[9px] font-bold"
                      style={{ background: ['#d4a017','#3b82f6','#7c3aed','#22c55e','#ef4444'][idx], color: 'white', zIndex: 5 - idx }}>
                      {i}
                    </div>
                  ))}
                </div>
                <div className={`text-xs ${textSecondary}`}>
                  <span className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span className="ml-1 font-semibold">5.0</span>
                  </span>
                  <span>{t.hero.trustedBy} <strong className={textPrimary}>{t.hero.countries}</strong></span>
                </div>
              </div>
            </div>

            {/* Right: App mockup */}
            <div style={{ animation: 'slideUp 0.7s ease 0.15s both' }} className="relative">
              <div className="relative rounded-2xl overflow-hidden">
                <AppMockup dark={dark} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════ STATS BAR ══════════════════ */}
      <section className={`border-y ${border} ${bgSection}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {t.stats.map((s, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <div className="text-center">
                  <div className={`text-4xl font-bold text-amber-500 mb-1`}
                    style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
                    <Counter to={s.value} />
                  </div>
                  <div className={`text-sm ${textSecondary} font-medium`}>{s.label}</div>
                  {'sub' in s && <div className={`text-xs ${textMuted} mt-0.5`}>{(s as any).sub}</div>}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ FEATURES ══════════════════ */}
      <section id="features" className={`py-24 ${bgPage}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="text-center mb-16">
              <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                className={`text-4xl sm:text-5xl font-semibold ${textPrimary} mb-4`}>
                {t.features.title}
              </h2>
              <p className={`text-lg ${textSecondary} max-w-2xl mx-auto`}>{t.features.sub}</p>
            </div>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {t.features.items.map((f, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <div className={`group ${bgCard} border ${border} rounded-2xl p-6 hover:border-amber-400 hover:shadow-xl transition-all duration-300 relative overflow-hidden`}>
                  {/* Hover glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div className="text-3xl">{f.icon}</div>
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">
                        {f.tag}
                      </span>
                    </div>
                    <h3 className={`text-lg font-bold ${textPrimary} mb-2`}
                      style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
                      {f.title}
                    </h3>
                    <p className={`text-sm ${textSecondary} leading-relaxed`}>{f.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ HOW IT WORKS ══════════════════ */}
      <section id="how" className={`py-24 ${bgSection} border-y ${border}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="text-center mb-16">
              <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                className={`text-4xl sm:text-5xl font-semibold ${textPrimary} mb-4`}>
                {t.how.title}
              </h2>
            </div>
          </Reveal>

          <div className="grid lg:grid-cols-3 gap-8 relative">
            {/* Connector line (desktop) */}
            <div className="hidden lg:block absolute top-16 left-[16.67%] right-[16.67%] h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-40" />

            {t.how.steps.map((step, i) => (
              <Reveal key={i} delay={i * 0.15}>
                <div className="relative text-center">
                  {/* Step number */}
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500/10 border-2 border-amber-400 mb-5 relative">
                    <span className="text-amber-500 font-bold text-xl" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
                      {step.n}
                    </span>
                    {/* Pulse */}
                    <span className="absolute inset-0 rounded-2xl animate-ping bg-amber-400 opacity-20" />
                  </div>
                  <h3 className={`text-xl font-bold ${textPrimary} mb-3`}
                    style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
                    {step.title}
                  </h3>
                  <p className={`text-sm ${textSecondary} leading-relaxed`}>{step.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ DUAL PORTAL ══════════════════ */}
      <section id="portals" className={`py-24 ${bgPage}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="text-center mb-14">
              <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                className={`text-4xl sm:text-5xl font-semibold ${textPrimary} mb-4`}>
                {t.portal.title}
              </h2>
              <p className={`text-lg ${textSecondary} max-w-xl mx-auto`}>{t.portal.sub}</p>
            </div>
          </Reveal>

          <div className="grid lg:grid-cols-2 gap-10 items-start">
            {/* Lawyer portal */}
            <Reveal delay={0}>
              <div>
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 text-amber-600 text-xs font-semibold mb-4`}>
                  <Zap className="w-3 h-3" /> {t.portal.lawyer.label}
                </div>
                <h3 className={`text-2xl font-semibold ${textPrimary} mb-2`}
                  style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
                  {t.portal.lawyer.desc}
                </h3>
                <div className="space-y-2 mb-6">
                  {['AI negligence alerts', 'Full case timelines', 'Task management', 'Team collaboration', 'Billing & time entries'].map(f => (
                    <div key={f} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                      <span className={`text-sm ${textSecondary}`}>{f}</span>
                    </div>
                  ))}
                </div>
                <AppMockup dark={dark} />
              </div>
            </Reveal>

            {/* Client portal */}
            <Reveal delay={0.15}>
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-400/30 bg-blue-400/10 text-blue-600 text-xs font-semibold mb-4">
                  <Shield className="w-3 h-3" /> {t.portal.client.label}
                </div>
                <h3 className={`text-2xl font-semibold ${textPrimary} mb-2`}
                  style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
                  {t.portal.client.desc}
                </h3>
                <div className="space-y-2 mb-6">
                  {['Case timeline & status', 'Shared documents only', 'Direct attorney messaging', 'Budget transparency', '"Is my case stuck?" AI check'].map(f => (
                    <div key={f} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0" />
                      <span className={`text-sm ${textSecondary}`}>{f}</span>
                    </div>
                  ))}
                </div>
                <ClientMockup dark={dark} />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ══════════════════ CTA ══════════════════ */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950" />
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'radial-gradient(circle,#d4a017 1px,transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #d4a017, transparent)', filter: 'blur(80px)' }} />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <Reveal>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-semibold mb-8">
              <Sparkles className="w-3.5 h-3.5" /> 14-day free trial · No card required
            </div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
              className="text-5xl sm:text-6xl font-light text-white leading-tight mb-6">
              {t.cta.title}<br />
              <em className="font-semibold not-italic text-amber-500">Legal Eagle.</em>
            </h2>
            <p className="text-lg text-gray-400 mb-10 max-w-xl mx-auto">{t.cta.sub}</p>
            <div className="flex flex-wrap items-center justify-center gap-4 mb-6">
              <Link href="/onboarding"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-white font-bold text-base shadow-2xl shadow-amber-500/30 transition-all duration-200 hover:scale-105 active:scale-100">
                {t.cta.btn1} <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/login"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl border-2 border-white/20 text-white hover:border-amber-400 hover:text-amber-400 font-semibold text-base transition-all duration-200">
                {t.cta.btn2} <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
            <p className="text-xs text-gray-500 font-medium">{t.cta.fine}</p>
          </Reveal>
        </div>
      </section>

      {/* ══════════════════ FOOTER ══════════════════ */}
      <footer className={`${dark ? 'bg-gray-950' : 'bg-gray-950'} py-14`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-10">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                  <Scale className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-semibold text-white"
                  style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>Legal Eagle</span>
              </div>
              <p className="text-sm text-gray-500 max-w-xs">{t.footer.tagline}</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 text-sm">
              <div>
                <p className="text-gray-400 font-semibold mb-3">Product</p>
                {['Features', 'How It Works', 'Pricing', 'Changelog'].map(l => (
                  <a key={l} href="#" className="block text-gray-600 hover:text-gray-400 mb-2 transition-colors">{l}</a>
                ))}
              </div>
              <div>
                <p className="text-gray-400 font-semibold mb-3">Legal</p>
                {['Privacy Policy', 'Terms of Service', 'Security'].map(l => (
                  <a key={l} href="#" className="block text-gray-600 hover:text-gray-400 mb-2 transition-colors">{l}</a>
                ))}
              </div>
              <div>
                <p className="text-gray-400 font-semibold mb-3">Company</p>
                {['About', 'Blog', 'Careers'].map(l => (
                  <a key={l} href="#" className="block text-gray-600 hover:text-gray-400 mb-2 transition-colors">{l}</a>
                ))}
              </div>
            </div>
          </div>

          <div className={`border-t border-gray-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4`}>
            <p className="text-xs text-gray-600">{t.footer.rights}</p>
            <div className="flex items-center gap-4">
              {LANGS.map(l => (
                <button key={l.code} onClick={() => setLocale(l.code)}
                  className={`text-base transition-all hover:scale-125 ${l.code === locale ? 'opacity-100 scale-110' : 'opacity-40 hover:opacity-80'}`}
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

'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Scale, Mail, Lock, ArrowRight, Eye, EyeOff, Sparkles, CheckCircle, AlertCircle, User } from 'lucide-react';
import { useI18n, LanguageSwitcher } from '@/lib/i18n';
import { useToast } from '@/components/Toast';
import { useAuth } from '@/lib/auth-context';

function LoginPageInner() {
  const router = useRouter();
  const { t }  = useI18n();
  const { signIn, signInWithMagicLink, resetPassword } = useAuth();
  const { toast } = useToast();

  const searchParams   = useSearchParams();
  const fromOnboarding = searchParams.get('from') === 'onboarding';
  const onboardingType = searchParams.get('type') as 'individual' | 'lawfirm' | null;
  const prefillName    = searchParams.get('name') ?? '';
  const prefillEmail   = searchParams.get('email') ?? '';

  const [email, setEmail]         = useState(prefillEmail);
  const [name,  setName]          = useState(prefillName);
  const [password, setPassword]   = useState('');
  const [showPass, setShowPass]   = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [authMode,  setAuthMode]  = useState<'signin' | 'signup'>('signin');
  const [inputMode, setInputMode] = useState<'login' | 'magic'>('login');
  const [magicSent, setMagicSent] = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent,  setForgotSent]  = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

  useEffect(() => {
    if (fromOnboarding) setAuthMode('signup');
    try {
      const raw = sessionStorage.getItem('le_onboarding');
      if (raw) {
        const saved = JSON.parse(raw);
        if (!prefillEmail && saved.email) setEmail(saved.email);
        if (!prefillName  && saved.fullName) setName(saved.fullName);
      }
    } catch {}
  }, [fromOnboarding, prefillEmail, prefillName]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    // Signup path
    if (authMode === 'signup') {
      // For demo mode — treat signup as signIn with the provided email
      const { error: err } = await signIn(email, password || 'demo1234');
      if (err) {
        // Try as magic link if no Supabase
        const { error: err2 } = await signInWithMagicLink(email);
        if (err2) { setError(t.auth.errorInvalidCredentials); setSubmitting(false); return; }
        if (email.endsWith('@demo.com')) {
          router.push(email.includes('client') ? '/portal/dashboard' : '/dashboard');
        } else {
          setMagicSent(true); setSubmitting(false);
        }
        return;
      }
      // Fire welcome email (best-effort, don't block navigation)
      fetch('/api/auth/send-welcome', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          name:        name || email.split('@')[0],
          accountType: email.includes('client') ? 'individual' : 'lawfirm',
        }),
      }).catch(() => {}); // swallow errors — email is best-effort
      router.push(email.includes('client') ? '/portal/dashboard' : '/dashboard');
      return;
    }

    // Sign in path
    if (inputMode === 'magic') {
      const { error: err } = await signInWithMagicLink(email);
      setSubmitting(false);
      if (err) { setError(err); return; }
      if (email.endsWith('@demo.com')) {
        router.push(email.includes('client') ? '/portal/dashboard' : '/dashboard');
      } else {
        setMagicSent(true);
      }
      return;
    }

    const { error: err } = await signIn(email, password);
    if (err) { setError(t.auth.errorInvalidCredentials); setSubmitting(false); return; }
    router.push(email.includes('client') ? '/portal/dashboard' : '/dashboard');
  }


  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    setForgotLoading(true);
    setError(null);
    const { error: err } = await resetPassword(forgotEmail.trim());
    setForgotLoading(false);
    if (err) { setError(err); return; }
    setForgotSent(true);
    toast('Check your email for a password reset link', 'success');
  }

  function quickLogin(role: 'lawyer' | 'client' | 'admin') {
    const map = { lawyer: 'lawyer@demo.com', client: 'client@demo.com', admin: 'admin@demo.com' };
    setEmail(map[role]);
    setPassword('demo1234');
    setInputMode('login');
    setError(null);
  }

  // ── Magic link sent screen ─────────────────────────────────────────────────
  if (magicSent) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#f5f4f0' }}>
        <div className="bg-white border border-stone-200 rounded-2xl p-8 w-full max-w-md text-center shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto mb-4">
            <Mail className="w-6 h-6 text-amber-600" />
          </div>
          <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            className="text-2xl font-semibold text-stone-900 mb-2">{t.auth.checkInbox}</h2>
          <p className="text-stone-500 text-sm mb-1">{t.auth.checkInboxDesc}</p>
          <p className="font-semibold text-stone-800 text-sm mb-4">{email}</p>
          <p className="text-stone-400 text-xs mb-6">{t.auth.checkInboxSub}</p>
          <button onClick={() => { setMagicSent(false); setSubmitting(false); }}
            className="text-xs text-amber-600 hover:text-amber-700 font-semibold transition-colors">
            {t.auth.useDifferentEmail}
          </button>
        </div>
      </div>
    );
  }

  // ── Main login ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex" style={{ background: '#f5f4f0' }}>

      {/* Form panel */}
      <div className="w-full lg:w-[48%] flex items-center justify-center p-6 lg:p-12 bg-white">
        <div className="w-full max-w-md animate-fade-in">

          {/* Logo row + language switcher (always visible) */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                <Scale className="w-4 h-4 text-white" />
              </div>
              <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                className="text-xl font-semibold text-stone-900 lg:hidden">Legal Eagle</span>
            </div>
            <div className="relative" style={{ zIndex: 9999 }}>
              <LanguageSwitcher />
            </div>
          </div>

          <div className="mb-7">
            <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
              className="text-3xl font-semibold text-stone-900 mb-1">{t.auth.welcomeBack}</h2>
            <p className="text-stone-500 text-sm">{t.auth.signInSubtitle}</p>
          </div>

          {/* Password / Magic link toggle */}
          <div className="flex bg-stone-100 rounded-xl p-1 mb-5 border border-stone-200">
            {(['login', 'magic'] as const).map(m => (
              <button key={m} type="button"
                onClick={() => { setInputMode(m); setError(null); }}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-1.5 ${
                  inputMode === m
                    ? 'bg-white shadow-sm text-stone-800 border border-stone-200'
                    : 'text-stone-500 hover:text-stone-700'
                }`}>
                {m === 'magic' && <Sparkles className="w-3.5 h-3.5" />}
                {m === 'login' ? t.auth.password : t.auth.magicLink}
              </button>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl p-3 mb-4 animate-slide-up">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-red-700 font-medium">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name field — only shown for signup */}
            {authMode === 'signup' && (
              <div>
                <label className="block text-xs text-stone-500 mb-1.5 font-semibold uppercase tracking-wide">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input type="text" value={name} onChange={e => setName(e.target.value)}
                    placeholder="Your full name"
                    className="input-field pl-9" required autoComplete="name" />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs text-stone-500 mb-1.5 font-semibold uppercase tracking-wide">
                {t.auth.emailLabel}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder={t.auth.emailPlaceholder}
                  className="input-field pl-9" required autoComplete="email" />
              </div>
            </div>

            {(authMode === 'signup' || (authMode === 'signin' && inputMode === 'login')) && (
              <div>
                <label className="block text-xs text-stone-500 mb-1.5 font-semibold uppercase tracking-wide">
                  {t.auth.passwordLabel}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password} onChange={e => setPassword(e.target.value)}
                    placeholder={t.auth.passwordPlaceholder}
                    className="input-field pl-9 pr-9"
                    autoComplete="current-password" />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <div className="mt-1.5 text-right">
                  <button type="button"
                    onClick={() => { setForgotMode(true); setForgotSent(false); setError(null); }}
                    className="text-xs text-amber-600 hover:text-amber-700 font-medium transition-colors">
                    {t.auth.forgotPassword}
                  </button>
                </div>
              </div>
            )}

            <button type="submit" disabled={submitting}
              className="w-full btn-primary py-2.5 justify-center mt-1 disabled:opacity-70">
              {submitting
                ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    <span>{authMode === 'signup' ? 'Creating account…' : inputMode === 'magic' ? t.auth.sendingLink : t.auth.signingIn}</span></>
                : <><span>{authMode === 'signup' ? 'Create account' : inputMode === 'magic' ? t.auth.sendMagicLink : t.auth.signIn}</span>
                    <ArrowRight className="w-4 h-4" /></>
              }
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-stone-200" />
            <span className="text-stone-400 text-xs font-medium">{t.auth.orDivider}</span>
            <div className="flex-1 h-px bg-stone-200" />
          </div>

          {/* Demo access */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
            <p className="text-amber-700 text-xs font-bold mb-1">{t.auth.demoAccess}</p>
            <p className="text-stone-500 text-xs mb-3">{t.auth.demoDesc}</p>
            <div className="grid grid-cols-3 gap-2">
              {([
                { role: 'lawyer' as const, emoji: '⚖', label: t.auth.lawyer, hint: t.auth.demoHints.lawyer },
                { role: 'client' as const, emoji: '👤', label: t.auth.client, hint: t.auth.demoHints.client },
                { role: 'admin'  as const, emoji: '🏢', label: t.auth.admin,  hint: t.auth.demoHints.admin  },
              ]).map(item => (
                <button key={item.role} type="button"
                  onClick={() => quickLogin(item.role)}
                  className="flex flex-col items-center py-2.5 px-2 rounded-xl bg-white border border-amber-200 hover:border-amber-400 hover:bg-amber-50 transition-all duration-200 shadow-sm group">
                  <span className="text-base mb-0.5">{item.emoji}</span>
                  <span className="text-[11px] text-stone-700 font-semibold group-hover:text-amber-700 transition-colors">{item.label}</span>
                  <span className="text-[9px] text-stone-400 mt-0.5 text-center leading-tight">{item.hint}</span>
                </button>
              ))}
            </div>
          </div>

          <p className="text-stone-400 text-xs text-center mt-5">
            {t.auth.newFirm}{' '}
            <Link href="/onboarding" className="text-amber-600 hover:text-amber-700 font-semibold transition-colors">
              {t.auth.requestAccess}
            </Link>
          </p>
        </div>
      </div>

      {/* Brand panel */}
      <div className="hidden lg:flex lg:w-[52%] relative flex-col justify-between p-12 overflow-hidden"
        style={{ background: 'linear-gradient(145deg,#0f172a 0%,#1e2a3e 60%,#0f172a 100%)' }}>
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'radial-gradient(circle,#d4a017 1px,transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="absolute top-1/3 -left-16 w-80 h-80 rounded-full opacity-[0.12]"
          style={{ background: 'radial-gradient(circle,#d4a017,transparent)', filter: 'blur(60px)' }} />

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg">
            <Scale className="w-5 h-5 text-white" />
          </div>
          <div>
            <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
              className="text-2xl font-semibold text-white tracking-wide">Legal Eagle</span>
            <div className="text-[9px] text-slate-500 tracking-widest uppercase">{t.brand.tagline}</div>
          </div>
        </div>

        <div className="relative z-10">
          <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            className="text-5xl font-light text-white leading-tight mb-6">
            {t.brand.motto.split(',')[0]},<br />
            <span className="italic font-semibold" style={{ color: '#d4a017' }}>
              {t.brand.motto.split(',').slice(1).join(',').trim()}
            </span>
          </h1>
          <p className="text-slate-400 text-base leading-relaxed mb-10 max-w-md">
            AI-powered legal case transparency between lawyers and clients.
          </p>
          <div className="space-y-3.5">
            {t.auth.features.map((f, i) => (
              <div key={i} className="flex items-start gap-3">
                <CheckCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <p className="text-slate-400 text-sm">{f}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-slate-600 text-xs">
          Legal Eagle Technologies {new Date().getFullYear()} ©
        </p>
      </div>
    </div>
  );
}

// ── Suspense wrapper required by Next.js 14 for useSearchParams ───────────────
export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#f5f4f0' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">⚖</span>
          </div>
          <div className="w-4 h-4 border-2 border-amber-300 border-t-amber-600 rounded-full animate-spin" />
        </div>
      </div>
    }>
      <LoginPageInner />
    </Suspense>
  );
}

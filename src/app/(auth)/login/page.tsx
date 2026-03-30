'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Scale, Mail, Lock, ArrowRight, Eye, EyeOff, Sparkles, CheckCircle, AlertCircle } from 'lucide-react';
import { useI18n, LanguageSwitcher } from '@/lib/i18n';
import { useAuth } from '@/lib/auth-context';

export default function LoginPage() {
  const router = useRouter();
  const { t } = useI18n();
  const { signIn, signInWithMagicLink, isClient } = useAuth();

  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [showPassword, setShowPass]   = useState(false);
  const [loading, setLoading]         = useState(false);
  const [mode, setMode]               = useState<'login' | 'magic'>('login');
  const [magicSent, setMagicSent]     = useState(false);
  const [error, setError]             = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (mode === 'magic') {
      const { error: err } = await signInWithMagicLink(email);
      if (err) { setError(err); setLoading(false); return; }
      setMagicSent(true);
      setLoading(false);
      return;
    }

    const { error: err } = await signIn(email, password);
    if (err) { setError(err); setLoading(false); return; }

    // Role-based redirect handled by AuthProvider + middleware
    // In demo mode, check profile role immediately
    setLoading(false);
    router.push(email.includes('client') ? '/portal/dashboard' : '/dashboard');
  }

  function quickLogin(role: 'lawyer' | 'client' | 'admin') {
    const emails: Record<string, string> = {
      lawyer: 'lawyer@demo.com',
      client: 'client@demo.com',
      admin:  'admin@demo.com',
    };
    setEmail(emails[role]);
    setPassword('demo1234');
    setMode('login');
  }

  if (magicSent) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#f5f4f0' }}>
        <div className="bg-white border border-stone-200 rounded-2xl p-8 w-full max-w-md text-center shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto mb-4">
            <Mail className="w-6 h-6 text-amber-600" />
          </div>
          <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            className="text-2xl font-semibold text-stone-900 mb-2">Check your inbox</h2>
          <p className="text-stone-500 text-sm mb-6">
            We sent a magic link to <strong className="text-stone-800">{email}</strong>.
            Click the link in the email to sign in.
          </p>
          <button onClick={() => { setMagicSent(false); setLoading(false); }}
            className="text-xs text-amber-600 hover:text-amber-700 font-semibold transition-colors">
            ← Use a different email
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#f5f4f0' }}>
      {/* ── Left panel ── */}
      <div className="hidden lg:flex lg:w-[52%] relative flex-col justify-between p-12 overflow-hidden"
        style={{ background: 'linear-gradient(145deg,#0f172a 0%,#1e2a3e 60%,#0f172a 100%)' }}>
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'radial-gradient(circle,#d4a017 1px,transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="absolute top-1/3 -left-16 w-80 h-80 rounded-full opacity-[0.12]"
          style={{ background: 'radial-gradient(circle,#d4a017,transparent)', filter: 'blur(60px)' }} />

        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg">
              <Scale className="w-5 h-5 text-white" />
            </div>
            <div>
              <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                className="text-2xl font-semibold text-white tracking-wide">Legal Eagle</span>
              <div className="text-[9px] text-slate-500 tracking-widest uppercase">{t.brand.tagline}</div>
            </div>
          </div>
          <LanguageSwitcher />
        </div>

        <div className="relative z-10">
          <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            className="text-5xl font-light text-white leading-tight mb-6">
            {t.brand.motto.split(',')[0]},<br />
            <span className="italic font-semibold" style={{ color: '#d4a017' }}>
              {t.brand.motto.split(',')[1]?.trim()}
            </span>
          </h1>
          <p className="text-slate-400 text-base leading-relaxed mb-10 max-w-md">
            AI-powered legal case transparency between lawyers and clients. Real-time tracking, negligence detection, and secure communication.
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
          © {new Date().getFullYear()} Legal Eagle Technologies
        </p>
      </div>

      {/* ── Right panel — form ── */}
      <div className="w-full lg:w-[48%] flex items-center justify-center p-6 lg:p-12 bg-white">
        <div className="w-full max-w-md animate-fade-in">
          {/* Mobile header */}
          <div className="lg:hidden flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                <Scale className="w-4 h-4 text-white" />
              </div>
              <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                className="text-xl font-semibold text-stone-900">Legal Eagle</span>
            </div>
            <LanguageSwitcher />
          </div>

          <div className="mb-8">
            <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
              className="text-3xl font-semibold text-stone-900 mb-1">{t.auth.welcomeBack}</h2>
            <p className="text-stone-500 text-sm">{t.auth.signInSubtitle}</p>
          </div>

          {/* Mode toggle */}
          <div className="flex bg-stone-100 rounded-xl p-1 mb-6 border border-stone-200">
            {(['login', 'magic'] as const).map(m => (
              <button key={m} onClick={() => { setMode(m); setError(null); }}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-1.5 ${
                  mode === m
                    ? 'bg-white shadow-sm text-stone-800 border border-stone-200'
                    : 'text-stone-500 hover:text-stone-700'
                }`}>
                {m === 'magic' && <Sparkles className="w-3.5 h-3.5" />}
                {m === 'login' ? t.auth.password : t.auth.magicLink}
              </button>
            ))}
          </div>

          {/* Error banner */}
          {error && (
            <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-red-700 font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-stone-500 mb-1.5 font-semibold uppercase tracking-wide">
                {t.auth.emailLabel}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder={t.auth.emailPlaceholder} className="input-field pl-9" required />
              </div>
            </div>

            {mode === 'login' && (
              <div>
                <label className="block text-xs text-stone-500 mb-1.5 font-semibold uppercase tracking-wide">
                  {t.auth.passwordLabel}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input type={showPassword ? 'text' : 'password'}
                    value={password} onChange={e => setPassword(e.target.value)}
                    placeholder={t.auth.passwordPlaceholder} className="input-field pl-9 pr-9" />
                  <button type="button" onClick={() => setShowPass(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <div className="mt-1.5 text-right">
                  <a href="#" className="text-xs text-amber-600 hover:text-amber-700 font-medium transition-colors">
                    {t.auth.forgotPassword}
                  </a>
                </div>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full btn-primary py-2.5 justify-center mt-1 disabled:opacity-60">
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {mode === 'magic' ? t.auth.sendingLink : t.auth.signingIn}</>
              ) : (
                <>{mode === 'magic' ? t.auth.sendMagicLink : t.auth.signIn}
                  <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-stone-200" />
            <span className="text-stone-400 text-xs">or</span>
            <div className="flex-1 h-px bg-stone-200" />
          </div>

          {/* Demo access */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
            <p className="text-amber-700 text-xs font-bold mb-1">{t.auth.demoAccess}</p>
            <p className="text-stone-500 text-xs mb-3">{t.auth.demoDesc}</p>
            <div className="grid grid-cols-3 gap-2">
              {([
                { label: `⚖ ${t.auth.lawyer}`, role: 'lawyer' as const, hint: 'Full dashboard' },
                { label: `👤 ${t.auth.client}`, role: 'client' as const, hint: 'Client portal' },
                { label: `🏢 ${t.auth.admin}`,  role: 'admin'  as const, hint: 'All firm data' },
              ]).map(item => (
                <button key={item.role} onClick={() => quickLogin(item.role)}
                  className="flex flex-col items-center py-2.5 px-2 rounded-xl bg-white border border-amber-200 hover:border-amber-400 hover:bg-amber-50 transition-all duration-200 shadow-sm group">
                  <span className="text-xs text-stone-700 font-semibold group-hover:text-amber-700 transition-colors">{item.label}</span>
                  <span className="text-[9px] text-stone-400 mt-0.5">{item.hint}</span>
                </button>
              ))}
            </div>
            <p className="text-[10px] text-stone-400 text-center mt-3">
              Click a role to pre-fill credentials, then press Sign in
            </p>
          </div>

          <p className="text-stone-400 text-xs text-center mt-6">
            {t.auth.newFirm}{' '}
            <Link href="/onboarding" className="text-amber-600 hover:text-amber-700 font-semibold transition-colors">
              {t.auth.requestAccess}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

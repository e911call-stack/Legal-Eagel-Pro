'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Shield, Mail, Lock, ArrowRight, Eye, EyeOff, Sparkles, 
  CheckCircle, AlertCircle, User, Loader2, AlertTriangle, 
  Clock, Activity 
} from 'lucide-react';

// ─── Safe imports with fallbacks ─────────────────────────────────────────────
let useToast: () => { toast: (msg: string, type?: string) => void };
let useAuth: () => { 
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signInWithMagicLink: (email: string) => Promise<{ error?: string }>;
  resetPassword: (email: string) => Promise<{ error?: string }>;
};

// Fallback implementations if imports fail
try {
  const toastMod = require('@/components/Toast');
  useToast = toastMod.useToast;
} catch {
  useToast = () => ({ toast: (msg: string) => console.log('Toast:', msg) });
}

try {
  const authMod = require('@/lib/auth-context');
  useAuth = authMod.useAuth;
} catch {
  useAuth = () => ({
    signIn: async () => ({ error: 'Auth not configured' }),
    signInWithMagicLink: async () => ({ error: 'Auth not configured' }),
    resetPassword: async () => ({ error: 'Auth not configured' }),
  });
}

// ─── Simple translations (fallback if lib fails) ─────────────────────────────
const defaultTranslations = {
  en: {
    login: {
      checkCase: 'Check On Your Case',
      holdThem: 'Hold them accountable',
      namePh: 'Your name',
      emailLabel: 'Email',
      emailPh: 'you@example.com',
      passLabel: 'Password',
      passPh: '••••••••',
      signIn: 'Sign In',
      creating: 'Creating...',
      sending: 'Sending...',
      signing: 'Signing in...',
      sendLink: 'Send Magic Link',
      magicSent: 'Check your email',
      magicSentSub: 'We sent a secure login link to',
      useDifferent: 'Use different email',
      forgotPass: 'Forgot password?',
      resetSent: 'Reset email sent',
      resetLabel: 'Enter your email to receive a reset link',
      sendReset: 'Send Reset Link',
      backToSignIn: 'Back to sign in',
      newHere: 'New here?',
      startTrial: 'Start free trial →',
      panel: {
        eyebrow: 'Live Monitoring',
        stat: '1,847 cases at risk this week',
        quote: '"I caught my lawyer\'s silence before it cost me everything. Legal Eagle flagged 3 weeks of no activity."',
        quoteBy: '— Sarah M., recovered $180K settlement',
        watching: 'We watch for:',
        watchList: ['⚠️ No updates in 10+ days', '⏰ Deadlines approaching', '💬 Unanswered messages'],
        tagline: 'Your case. Your money. Your right to know.',
      }
    }
  }
};

type LandingLocale = 'en' | 'ar' | 'es' | 'zh' | 'hi';

function useLandingLocale(): LandingLocale {
  const [locale, setLocale] = useState<LandingLocale>('en');
  useEffect(() => {
    try {
      const stored = localStorage.getItem('le_landing_locale') as LandingLocale | null;
      if (stored && ['en', 'ar', 'es', 'zh', 'hi'].includes(stored)) {
        setLocale(stored);
      }
    } catch {}
  }, []);
  return locale;
}

// ─── MAIN LOGIN COMPONENT ────────────────────────────────────────────────────
function LoginPageInner() {
  const router = useRouter();
  const locale = useLandingLocale();
  
  // Safe translation loading
  const [t, setT] = useState(defaultTranslations.en.login);
  useEffect(() => {
    try {
      // Try to load from lib if available
      const landing = require('@/lib/landing/translations');
      if (landing?.landing?.[locale]) {
        setT(landing.landing[locale].login);
      }
    } catch {
      // Keep default
    }
  }, [locale]);

  const { signIn, signInWithMagicLink, resetPassword } = useAuth();
  const { toast } = useToast();

  const searchParams = useSearchParams();
  const fromOnboarding = searchParams.get('from') === 'onboarding';
  const prefillName = searchParams.get('name') ?? '';
  const prefillEmail = searchParams.get('email') ?? '';

  const [email, setEmail] = useState(prefillEmail);
  const [name, setName] = useState(prefillName);
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>(fromOnboarding ? 'signup' : 'signin');
  const [inputMode, setInputMode] = useState<'password' | 'magic'>('password');
  const [magicSent, setMagicSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

  // Dark mode state (fixed missing variable)
  const [dark, setDark] = useState(true);
  useEffect(() => {
    try {
      const stored = localStorage.getItem('le_theme');
      setDark(stored ? stored === 'dark' : true);
    } catch {
      setDark(true);
    }
  }, []);

  useEffect(() => {
    if (fromOnboarding) setAuthMode('signup');
    try {
      const raw = sessionStorage.getItem('le_onboarding');
      if (raw) {
        const saved = JSON.parse(raw);
        if (!prefillEmail && saved.email) setEmail(saved.email);
        if (!prefillName && saved.fullName) setName(saved.fullName);
      }
    } catch {}
  }, [fromOnboarding, prefillEmail, prefillName]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      if (authMode === 'signup') {
        const { error: err } = await signIn(email, password || 'demo1234');
        if (err) {
          const { error: err2 } = await signInWithMagicLink(email);
          if (err2) {
            setError('Unable to create account. Please try again.');
            setSubmitting(false);
            return;
          }
          if (email.endsWith('@demo.com')) {
            router.push(email.includes('client') ? '/portal/dashboard' : '/dashboard');
          } else {
            setMagicSent(true);
            setSubmitting(false);
          }
          return;
        }
        // Welcome email (fire and forget)
        fetch('/api/auth/send-welcome', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            name: name || email.split('@')[0], 
            accountType: 'individual' 
          }),
        }).catch(() => {});
        router.push(email.includes('client') ? '/portal/dashboard' : '/dashboard');
        return;
      }

      if (inputMode === 'magic') {
        const { error: err } = await signInWithMagicLink(email);
        setSubmitting(false);
        if (err) {
          setError(err);
          return;
        }
        if (email.endsWith('@demo.com')) {
          router.push(email.includes('client') ? '/portal/dashboard' : '/dashboard');
        } else {
          setMagicSent(true);
        }
        return;
      }

      const { error: err } = await signIn(email, password);
      if (err) {
        setError('Incorrect email or password. Try again.');
        setSubmitting(false);
        return;
      }
      router.push(email.includes('client') ? '/portal/dashboard' : '/dashboard');
    } catch (e) {
      setError('Something went wrong. Please try again.');
      setSubmitting(false);
    }
  }

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    setForgotLoading(true);
    setError(null);
    try {
      const { error: err } = await resetPassword(forgotEmail.trim());
      setForgotLoading(false);
      if (err) {
        setError(err);
        return;
      }
      setForgotSent(true);
      toast(t.resetSent, 'success');
    } catch {
      setForgotLoading(false);
      setError('Failed to send reset email');
    }
  }

  const inputCls = 'w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-400/20 transition-all duration-200';

  // ── Magic link sent state ─────────────────────────────────────────────────
  if (magicSent) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-950">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 w-full max-w-md text-center shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-red-600/10 border border-red-600/20 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Mail className="w-6 h-6 text-red-500" />
          </div>
          <h2 className="text-2xl font-black text-white mb-2">{t.magicSent}</h2>
          <p className="text-slate-400 text-sm mb-1">{t.magicSentSub}</p>
          <p className="font-bold text-white text-sm mb-6">{email}</p>
          <button 
            onClick={() => { setMagicSent(false); setSubmitting(false); }}
            className="text-xs text-red-500 hover:text-red-400 font-bold transition-colors"
          >
            {t.useDifferent}
          </button>
        </div>
      </div>
    );
  }

  // ── Main login ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex bg-slate-950">
      {/* ── LEFT: Form ── */}
      <div className="w-full lg:w-[48%] flex items-center justify-center p-6 lg:p-12 bg-[#0f172a]">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 mb-10 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-lg shadow-red-600/30 group-hover:shadow-red-600/50 transition-all">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-black text-white tracking-tight">
              Legal<span className="text-red-500">Eagle</span>
            </span>
          </Link>

          {/* Heading */}
          <div className="mb-7">
            <h1 className="text-3xl font-black text-white mb-1">{t.checkCase}</h1>
            <p className="text-slate-500 text-sm font-semibold">{t.holdThem}</p>
          </div>

          {/* Onboarding welcome banner */}
          {fromOnboarding && (
            <div className="rounded-xl p-3.5 mb-5 flex items-start gap-2.5 bg-red-950/40 border border-red-900/40 animate-pulse">
              <span className="text-lg flex-shrink-0">🛡️</span>
              <div>
                <p className="text-xs font-black text-red-400 mb-0.5">
                  {name ? `Welcome, ${name.split(' ')[0]}!` : 'Almost there!'}
                </p>
                <p className="text-xs text-slate-400">
                  Your details are filled in. {authMode === 'signup' 
                    ? 'Set a password to protect your case.' 
                    : 'Sign in to access your case portal.'}
                </p>
              </div>
            </div>
          )}

          {/* Sign in / Create tabs */}
          <div className="flex bg-slate-800 rounded-xl p-1 mb-5 border border-slate-700">
            {(['signin', 'signup'] as const).map(m => (
              <button 
                key={m} 
                type="button"
                onClick={() => { setAuthMode(m); setError(null); }}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-bold transition-all duration-200 ${
                  authMode === m
                    ? 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {m === 'signin' ? t.signIn : 'Create Account'}
              </button>
            ))}
          </div>

          {/* Input mode for sign in */}
          {authMode === 'signin' && (
            <div className="flex gap-2 mb-4">
              {(['password', 'magic'] as const).map(m => (
                <button 
                  key={m} 
                  type="button"
                  onClick={() => { setInputMode(m); setError(null); }}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all border ${
                    inputMode === m
                      ? 'bg-slate-700 text-white border-slate-600'
                      : 'text-slate-500 border-slate-800 hover:text-slate-400'
                  }`}
                >
                  {m === 'magic' && <Sparkles className="w-3 h-3 inline mr-1" />}
                  {m === 'password' ? 'Password' : 'Magic link'}
                </button>
              ))}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2.5 bg-red-950/60 border border-red-800 rounded-xl p-3 mb-4 animate-pulse">
              <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-red-300 font-medium">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {authMode === 'signup' && (
              <div>
                <label className="block text-xs text-slate-500 mb-1.5 font-black uppercase tracking-wide">
                  Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input 
                    type="text" 
                    value={name} 
                    onChange={e => setName(e.target.value)}
                    placeholder={t.namePh} 
                    className={`${inputCls} pl-9`} 
                    autoComplete="name" 
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs text-slate-500 mb-1.5 font-black uppercase tracking-wide">
                {t.emailLabel}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input 
                  type="email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)}
                  placeholder={t.emailPh} 
                  className={`${inputCls} pl-9`} 
                  required 
                  autoComplete="email" 
                />
              </div>
            </div>

            {(authMode === 'signup' || (authMode === 'signin' && inputMode === 'password')) && (
              <div>
                <label className="block text-xs text-slate-500 mb-1.5 font-black uppercase tracking-wide">
                  {t.passLabel}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input 
                    type={showPass ? 'text' : 'password'} 
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder={t.passPh} 
                    className={`${inputCls} pl-9 pr-9`} 
                    autoComplete="current-password" 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {authMode === 'signin' && (
                  <div className="mt-1.5 text-right">
                    <button 
                      type="button"
                      onClick={() => { setForgotMode(true); setForgotSent(false); setError(null); }}
                      className="text-xs text-red-500 hover:text-red-400 font-bold transition-colors"
                    >
                      {t.forgotPass}
                    </button>
                  </div>
                )}
              </div>
            )}

            <button 
              type="submit" 
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 disabled:opacity-60 text-white font-black py-3 rounded-xl transition-all shadow-lg shadow-red-600/25 mt-1"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{authMode === 'signup' ? t.creating : inputMode === 'magic' ? t.sending : t.signing}</span>
                </>
              ) : (
                <>
                  <span>{authMode === 'signup' ? 'Create My Account' : inputMode === 'magic' ? t.sendLink : t.signIn}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* New here */}
          <p className="text-slate-600 text-xs text-center mt-5">
            {t.newHere}{' '}
            <Link href="/onboarding" className="text-red-500 hover:text-red-400 font-black transition-colors">
              {t.startTrial}
            </Link>
          </p>

          {/* Forgot password overlay */}
          {forgotMode && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
                {forgotSent ? (
                  <div className="text-center py-4">
                    <div className="w-12 h-12 rounded-2xl bg-green-900/40 border border-green-800 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-6 h-6 text-green-400" />
                    </div>
                    <h3 className="text-lg font-black text-white mb-2">{t.resetSent}</h3>
                    <p className="text-xs text-slate-500 mb-5">
                      Check <strong className="text-white">{forgotEmail}</strong>
                    </p>
                    <button 
                      onClick={() => { setForgotMode(false); setForgotSent(false); setForgotEmail(''); }}
                      className="text-xs text-red-500 hover:text-red-400 font-bold"
                    >
                      {t.backToSignIn}
                    </button>
                  </div>
                ) : (
                  <>
                    <h3 className="text-lg font-black text-white mb-1">Reset your password</h3>
                    <p className="text-sm text-slate-500 mb-5">{t.resetLabel}</p>
                    {error && <div className="text-xs text-red-400 mb-3 font-medium">{error}</div>}
                    <form onSubmit={handleForgotPassword} className="space-y-3">
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input 
                          type="email" 
                          value={forgotEmail} 
                          onChange={e => setForgotEmail(e.target.value)}
                          placeholder={t.emailPh} 
                          className={`${inputCls} pl-9`} 
                          required 
                          autoFocus 
                        />
                      </div>
                      <button 
                        type="submit" 
                        disabled={forgotLoading || !forgotEmail.trim()}
                        className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 disabled:opacity-60 text-white font-black py-2.5 rounded-xl transition-all text-sm"
                      >
                        {forgotLoading ? (
                          <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</>
                        ) : (
                          t.sendReset
                        )}
                      </button>
                      <button 
                        type="button" 
                        onClick={() => { setForgotMode(false); setError(null); }}
                        className="w-full text-center text-xs text-slate-600 hover:text-slate-400 mt-1 transition-colors"
                      >
                        {t.backToSignIn}
                      </button>
                    </form>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── RIGHT: Social proof panel ── */}
      <div 
        className="hidden lg:flex lg:w-[52%] relative flex-col justify-between p-12 overflow-hidden"
        style={{ background: 'linear-gradient(145deg, #0f172a 0%, #1a0a0a 60%, #0f172a 100%)' }}
      >
        {/* Background effects */}
        <div className="absolute inset-0 opacity-[0.05]"
          style={{ 
            backgroundImage: 'radial-gradient(circle,#dc2626 1px,transparent 1px)', 
            backgroundSize: '40px 40px' 
          }} 
        />
        <div className="absolute top-1/3 -left-16 w-80 h-80 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle,#dc2626,transparent)', filter: 'blur(60px)' }} 
        />

        {/* Top: Stat */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-900/30 border border-red-800/40 text-red-400 text-xs font-black uppercase tracking-widest mb-6">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse inline-block" />
            {t.panel.eyebrow}
          </div>
          <div className="text-4xl font-black text-white mb-1">🔴</div>
          <div className="text-2xl font-black text-white leading-tight mb-1">{t.panel.stat}</div>
          <p className="text-sm text-slate-500">Legal Eagle is actively monitoring patterns right now.</p>
        </div>

        {/* Middle: Quote + watchlist */}
        <div className="relative z-10 space-y-6">
          {/* Testimonial */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 hover:border-red-500/20 transition-colors">
            <blockquote className="text-base text-slate-300 leading-relaxed mb-3 italic">
              {t.panel.quote}
            </blockquote>
            <p className="text-xs text-slate-500 font-bold">{t.panel.quoteBy}</p>
          </div>

          {/* Watch list */}
          <div>
            <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">
              {t.panel.watching}
            </p>
            <div className="space-y-2.5">
              {t.panel.watchList.map((item, i) => (
                <div 
                  key={i} 
                  className={`flex items-center gap-3 text-sm font-semibold rounded-xl px-4 py-3 transition-all hover:translate-x-1 ${
                    dark
                      ? 'bg-slate-800/60 text-slate-300 border border-slate-700/50 hover:border-red-500/30'
                      : 'bg-slate-100 text-slate-700 border border-slate-200 hover:border-red-300'
                  }`}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom: tagline */}
        <div className="relative z-10">
          <p className="text-slate-400 text-base font-black leading-snug">
            {t.panel.tagline}
          </p>
          <p className="text-slate-700 text-xs mt-2">
            Legal Eagle does not provide legal advice. We help you monitor your case.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── EXPORT WITH SUSPENSE WRAPPER ────────────────────────────────────────────
export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center animate-pulse">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div className="w-4 h-4 border-2 border-red-800 border-t-red-500 rounded-full animate-spin" />
        </div>
      </div>
    }>
      <LoginPageInner />
    </Suspense>
  );
}

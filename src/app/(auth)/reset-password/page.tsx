'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { Scale, Eye, EyeOff, CheckCircle, Loader2, ShieldCheck } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { useI18n } from '@/lib/i18n';

// ─── Password strength indicator ─────────────────────────────────────────────
function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: '8+ characters',   pass: password.length >= 8     },
    { label: 'Uppercase',       pass: /[A-Z]/.test(password)   },
    { label: 'Lowercase',       pass: /[a-z]/.test(password)   },
    { label: 'Number',          pass: /\d/.test(password)       },
    { label: 'Special char',    pass: /[^A-Za-z0-9]/.test(password) },
  ];
  const score = checks.filter(c => c.pass).length;
  const label = score <= 1 ? 'Weak' : score <= 3 ? 'Fair' : score === 4 ? 'Good' : 'Strong';
  const color = score <= 1 ? 'bg-red-500' : score <= 3 ? 'bg-amber-500' : score === 4 ? 'bg-blue-500' : 'bg-green-500';
  const textColor = score <= 1 ? 'text-red-600' : score <= 3 ? 'text-amber-600' : score === 4 ? 'text-blue-600' : 'text-green-600';

  if (!password) return null;

  return (
    <div className="mt-2 space-y-2">
      {/* Bar */}
      <div className="flex gap-1">
        {[1,2,3,4,5].map(i => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= score ? color : 'bg-stone-200'}`} />
        ))}
        <span className={`text-[10px] font-bold ml-1.5 ${textColor}`}>{label}</span>
      </div>
      {/* Checklist */}
      <div className="grid grid-cols-2 gap-1">
        {checks.map(c => (
          <div key={c.label} className={`flex items-center gap-1.5 text-[10px] font-medium transition-colors ${c.pass ? 'text-green-600' : 'text-stone-400'}`}>
            <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0 ${c.pass ? 'bg-green-500' : 'bg-stone-200'}`}>
              {c.pass && <CheckCircle className="w-2.5 h-2.5 text-white" />}
            </div>
            {c.label}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Inner page (needs to be wrapped in Suspense) ─────────────────────────────
function ResetPasswordInner() {
  const router   = useRouter();
  const supabase = createClient();
  const [password,  setPassword]  = useState('');
  const [confirm,   setConfirm]   = useState('');
  const [showPw,    setShowPw]    = useState(false);
  const [showCf,    setShowCf]    = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState<string | null>(null);
  const [success,   setSuccess]   = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [checking,  setChecking]  = useState(true);

  // ── Verify the user has an active session from the reset link ─────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setHasSession(!!session);
      setChecking(false);
    });
  }, []);

  const isStrong     = password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /\d/.test(password);
  const passwordsMatch = password === confirm && confirm.length > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!isStrong) {
      setError('Password must be at least 8 characters with uppercase, lowercase, and a number.');
      return;
    }
    if (!passwordsMatch) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    // Redirect to dashboard after 2.5 seconds
    setTimeout(() => router.replace('/dashboard'), 2500);
  }

  const inputCls = 'w-full bg-white border border-stone-200 rounded-xl px-3 py-2.5 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all duration-200 pr-10';

  // Checking session
  if (checking) {
    return (
      <div className="flex flex-col items-center gap-3 py-12">
        <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
        <p className="text-sm text-stone-400">Verifying your reset link…</p>
      </div>
    );
  }

  // Invalid or expired link
  if (!hasSession) {
    return (
      <div className="text-center py-8">
        <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🔗</span>
        </div>
        <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          className="text-xl font-semibold text-stone-900 mb-2">Link expired or invalid</h2>
        <p className="text-sm text-stone-500 mb-6 leading-relaxed">
          Password reset links are single-use and expire after 1 hour.
          Please request a new one.
        </p>
        <button onClick={() => router.push('/login')}
          className="btn-primary mx-auto">
          Back to Sign In
        </button>
      </div>
    );
  }

  // Success
  if (success) {
    return (
      <div className="text-center py-8">
        <div className="w-14 h-14 rounded-2xl bg-green-50 border border-green-200 flex items-center justify-center mx-auto mb-4">
          <ShieldCheck className="w-7 h-7 text-green-600" />
        </div>
        <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          className="text-xl font-semibold text-stone-900 mb-2">Password updated</h2>
        <p className="text-sm text-stone-500 mb-1">Your password has been changed successfully.</p>
        <p className="text-xs text-stone-400">Redirecting you to your dashboard…</p>
        <div className="mt-4 w-8 h-8 border-2 border-amber-300 border-t-amber-600 rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  // Main form
  return (
    <>
      <div className="text-center mb-6">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto mb-4">
          <ShieldCheck className="w-6 h-6 text-amber-600" />
        </div>
        <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          className="text-2xl font-semibold text-stone-900 mb-1">Choose a new password</h1>
        <p className="text-sm text-stone-500">Make it strong — this protects your clients' legal information.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-700 font-medium">
            {error}
          </div>
        )}

        {/* New password */}
        <div>
          <label className="block text-xs text-stone-500 mb-1.5 font-semibold uppercase tracking-wide">
            New Password
          </label>
          <div className="relative">
            <input
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter new password"
              className={inputCls}
              autoComplete="new-password"
              required
            />
            <button type="button" onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors">
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <PasswordStrength password={password} />
        </div>

        {/* Confirm password */}
        <div>
          <label className="block text-xs text-stone-500 mb-1.5 font-semibold uppercase tracking-wide">
            Confirm New Password
          </label>
          <div className="relative">
            <input
              type={showCf ? 'text' : 'password'}
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder="Confirm new password"
              className={`${inputCls} ${
                confirm.length > 0
                  ? passwordsMatch ? 'border-green-400 focus:border-green-400' : 'border-red-300 focus:border-red-400'
                  : ''
              }`}
              autoComplete="new-password"
              required
            />
            <button type="button" onClick={() => setShowCf(!showCf)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors">
              {showCf ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {confirm.length > 0 && (
            <p className={`text-[10px] mt-1.5 font-medium ${passwordsMatch ? 'text-green-600' : 'text-red-500'}`}>
              {passwordsMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
            </p>
          )}
        </div>

        <button type="submit"
          disabled={loading || !isStrong || !passwordsMatch}
          className="btn-primary w-full justify-center mt-2 disabled:opacity-60 disabled:cursor-not-allowed">
          {loading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Updating password…</>
          ) : (
            <><ShieldCheck className="w-4 h-4" /> Set new password</>
          )}
        </button>
      </form>
    </>
  );
}

// ─── Page (with Suspense for useSearchParams compliance) ─────────────────────
export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6" style={{ background: '#f5f4f0' }}>
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #d4a017, transparent)', filter: 'blur(80px)' }} />
      </div>
      <div className="w-full max-w-md relative z-10">
        {/* Brand header */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-md">
            <Scale className="w-4 h-4 text-white" />
          </div>
          <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            className="text-2xl font-semibold text-stone-900 tracking-wide">Legal Eagle</span>
        </div>

        {/* Card */}
        <div className="bg-white border border-stone-200 rounded-2xl shadow-sm p-6 sm:p-8">
          <Suspense fallback={
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
            </div>
          }>
            <ResetPasswordInner />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

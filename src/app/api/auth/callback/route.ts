import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ─── GET /api/auth/callback ───────────────────────────────────────────────────
// Handles two flows:
//   1. Magic link / OAuth sign-in   → ?code=...&next=/dashboard
//   2. Password reset callback      → ?code=...&next=/reset-password
//      After exchange, the user has a valid session and lands on /reset-password
//      where they enter their new password.
// ─────────────────────────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (!code) {
    console.error('[auth/callback] No code param received');
    return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
  }

  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL  ?? '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
    {
      cookies: {
        get(name: string)                                  { return cookieStore.get(name)?.value; },
        set(name: string, value: string, options: Record<string, unknown>) {
          try { cookieStore.set({ name, value, ...options }); } catch {}
        },
        remove(name: string, options: Record<string, unknown>) {
          try { cookieStore.set({ name, value: '', ...options }); } catch {}
        },
      },
    }
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error('[auth/callback] Code exchange failed:', error.message);
    return NextResponse.redirect(
      `${origin}/login?error=auth_callback_failed&message=${encodeURIComponent(error.message)}`
    );
  }

  // ── Password reset flow ───────────────────────────────────────────────────
  // If next=/reset-password, redirect directly there.
  // The user now has an authenticated session, so /reset-password can call
  // supabase.auth.updateUser({ password: newPassword }) directly.
  if (next.startsWith('/reset-password')) {
    return NextResponse.redirect(`${origin}${next}`);
  }

  // ── Standard login flow ───────────────────────────────────────────────────
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.redirect(`${origin}/login?error=session_missing`);
  }

  // Fetch role to determine correct portal
  const { data: profile } = await supabase
    .from('users')
    .select('role, name, created_at')
    .eq('id', session.user.id)
    .single();

  const role = profile?.role ?? 'client';

  // ── Send welcome email for brand-new users (created in last 60 seconds) ──
  // This catches users who sign up via magic link (OTP flow)
  if (profile?.created_at) {
    const createdAt = new Date(profile.created_at).getTime();
    const isNewUser = Date.now() - createdAt < 60_000; // within last 60 seconds
    if (isNewUser && session.user.email) {
      // Fire-and-forget — don't await so it doesn't delay the redirect
      fetch(`${origin}/api/auth/send-welcome`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          name:        profile.name ?? session.user.email.split('@')[0],
          accountType: role === 'client' ? 'individual' : 'lawfirm',
        }),
      }).catch(() => {});
    }
  }

  const redirectPath = role === 'client' ? '/portal/dashboard' : (next === '/dashboard' ? next : '/dashboard');

  return NextResponse.redirect(`${origin}${redirectPath}`);
}

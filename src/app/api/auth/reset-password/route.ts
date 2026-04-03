import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendPasswordReset } from '@/lib/email';

// ─── POST /api/auth/reset-password ───────────────────────────────────────────
// Body: { email }
//
// Strategy (recommended for Resend integration):
//
// Option A — Supabase native (simplest):
//   Call supabase.auth.resetPasswordForEmail(email, { redirectTo }).
//   Supabase sends its own email. Then separately call sendPasswordReset()
//   with our branded email. The user gets 2 emails — not ideal.
//
// Option B — Custom (recommended, implemented here):
//   1. Call supabase.auth.admin.generateLink({ type: 'recovery', email })
//      using SERVICE_ROLE key — gets us the reset URL without sending Supabase's email.
//   2. Send our own branded email via Resend with that URL.
//   Supabase must have "Custom SMTP" or "Email disabled" in Auth settings.
//
// Option C — Fallback (when no SERVICE_ROLE key in env):
//   Call supabase.auth.resetPasswordForEmail() as normal, just log that
//   Supabase will send its default email.
//
// See SUPABASE_SETUP.md for SMTP configuration instructions.
// ─────────────────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body  = await request.json();
    const email = (body.email ?? '').trim().toLowerCase();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'A valid email address is required' }, { status: 400 });
    }

    const appUrl       = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
    const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey   = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const anonKey      = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const redirectTo   = `${appUrl}/api/auth/callback?next=/reset-password`;

    // ── Demo mode (no Supabase configured) ───────────────────────────────────
    const isDemo = !supabaseUrl || supabaseUrl === 'https://placeholder.supabase.co';
    if (isDemo) {
      // Simulate sending a reset email — log for demo purposes
      await sendPasswordReset({
        to:       email,
        name:     email.split('@')[0],
        resetUrl: `${appUrl}/reset-password?token=demo-token`,
      });
      // Always return success — don't reveal if email exists
      return NextResponse.json({ ok: true, demo: true });
    }

    // ── Option B: Admin link generation (requires SERVICE_ROLE key) ───────────
    if (serviceKey) {
      const adminSupabase = createClient(supabaseUrl!, serviceKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });

      const { data, error } = await adminSupabase.auth.admin.generateLink({
        type:       'recovery',
        email,
        options: { redirectTo },
      });

      if (error) {
        console.error('[reset-password] Admin generateLink error:', error);
        // Fall through to Option C on admin error
      } else if (data?.properties?.action_link) {
        // Fetch user name from our users table for the personalised email
        const { data: userData } = await adminSupabase
          .from('users')
          .select('name')
          .eq('email', email)
          .single();

        await sendPasswordReset({
          to:        email,
          name:      userData?.name ?? email.split('@')[0],
          resetUrl:  data.properties.action_link,
          expiresIn: '1 hour',
          ipAddress: request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? undefined,
        });

        // Always return success — never confirm if email exists (security)
        return NextResponse.json({ ok: true });
      }
    }

    // ── Option C: Fallback — standard Supabase reset (sends Supabase email) ──
    // Supabase will send its built-in email. We also send ours.
    // Configure Supabase "Custom SMTP" (see SUPABASE_SETUP.md) to use only ours.
    const { createClient: createBrowserClient } = await import('@supabase/supabase-js');
    const supabase = createBrowserClient(supabaseUrl!, anonKey!);

    await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    // Note: this always returns success even if email doesn't exist

    return NextResponse.json({ ok: true });

  } catch (err) {
    console.error('[reset-password] Unexpected error:', err);
    // Always return success to avoid user enumeration
    return NextResponse.json({ ok: true });
  }
}

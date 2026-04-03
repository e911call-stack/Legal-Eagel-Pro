import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { sendWelcomeEmail } from '@/lib/email';

// ─── POST /api/auth/send-welcome ──────────────────────────────────────────────
// Call this immediately after successful signup on the client side.
// Body: { name, accountType, firmName? }
//
// The route fetches the email from the current session so the client
// never needs to pass it (avoids email spoofing).
// ─────────────────────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, accountType, firmName } = body;

    if (!name || !accountType) {
      return NextResponse.json({ error: 'name and accountType are required' }, { status: 400 });
    }

    if (!['individual', 'lawfirm'].includes(accountType)) {
      return NextResponse.json({ error: 'accountType must be individual or lawfirm' }, { status: 400 });
    }

    // ── Get session to verify auth + obtain real email ────────────────────────
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL  ?? '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
      {
        cookies: {
          get:    (n) => cookieStore.get(n)?.value,
          set:    (n, v, o) => { try { cookieStore.set({ name: n, value: v, ...o }); } catch {} },
          remove: (n, o)    => { try { cookieStore.set({ name: n, value: '', ...o }); } catch {} },
        },
      }
    );

    const { data: { session } } = await supabase.auth.getSession();

    // ── Demo mode — log but don't require a real session ─────────────────────
    const isDemo = !session && (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://placeholder.supabase.co'
    );

    const email = session?.user?.email ?? (isDemo ? `demo-${Date.now()}@demo.com` : null);

    if (!email) {
      return NextResponse.json({ error: 'Unauthorized — no active session' }, { status: 401 });
    }

    // ── Send welcome email ────────────────────────────────────────────────────
    const result = await sendWelcomeEmail({
      to:          email,
      name,
      accountType: accountType as 'individual' | 'lawfirm',
      firmName,
      loginUrl:    `${process.env.NEXT_PUBLIC_APP_URL}/login`,
    });

    if (!result.success && !result.demo) {
      console.error('[send-welcome] Email failed:', result.error);
      // Don't surface email errors to the user — signup succeeded, email is best-effort
    }

    return NextResponse.json({
      ok:   true,
      sent: result.success,
      demo: result.demo ?? false,
      id:   result.id,
    });

  } catch (err) {
    console.error('[send-welcome] Error:', err);
    // Always return 200 — a welcome email failure should never block the user
    return NextResponse.json({ ok: true, sent: false, error: String(err) });
  }
}

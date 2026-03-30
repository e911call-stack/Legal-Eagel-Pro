import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

function serverClient() {
  const cookieStore = cookies();
  return createServerClient(
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
}

const VALID_LANGUAGES = ['en', 'es', 'zh', 'ar', 'hi'] as const;

// ─── PATCH /api/profile ────────────────────────────────────────────────────────
// Accepted fields: language, name, bar_number (extensible)
export async function PATCH(request: NextRequest) {
  try {
    const body    = await request.json();
    const allowed = ['language', 'name', 'bar_number'] as const;

    // Strip any fields not in the allow-list
    const updates: Partial<Record<typeof allowed[number], string>> = {};
    for (const key of allowed) {
      if (body[key] !== undefined) updates[key] = body[key];
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid fields provided' }, { status: 400 });
    }

    // Validate language value
    if (updates.language && !VALID_LANGUAGES.includes(updates.language as typeof VALID_LANGUAGES[number])) {
      return NextResponse.json({ error: `language must be one of: ${VALID_LANGUAGES.join(', ')}` }, { status: 400 });
    }

    const supabase = serverClient();
    const { data: { session } } = await supabase.auth.getSession();

    // Demo mode — acknowledge without writing
    if (!session) {
      return NextResponse.json({ ok: true, updated: updates, demo: true });
    }

    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', session.user.id)
      .select('id, name, email, role, firm_id, language')
      .single();

    if (error) {
      console.error('PATCH /api/profile error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, profile: data });

  } catch (err) {
    console.error('PATCH /api/profile threw:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ─── GET /api/profile — re-fetch current user's profile ───────────────────────
export async function GET() {
  try {
    const supabase = serverClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, role, firm_id, language')
      .eq('id', session.user.id)
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ profile: data });

  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// ─── Helper: server supabase client ───────────────────────────────────────────
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

// ─── POST /api/cases — create a new case ──────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title, practice_area, client_name, client_email,
      billing_model, budget, firm_id, lawyer_id, jurisdiction,
    } = body;

    // ── Validate required fields ──
    if (!title || !practice_area || !firm_id) {
      return NextResponse.json({ error: 'title, practice_area and firm_id are required' }, { status: 400 });
    }

    const supabase = serverClient();

    // ── Verify session ────────────────────────────────────────────────────────
    const { data: { session } } = await supabase.auth.getSession();

    // Demo mode: no real session — still run the insert if env allows it,
    // otherwise return a mock success so the UI works in demo.
    const isDemo = !session && (
      process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://placeholder.supabase.co' ||
      !process.env.NEXT_PUBLIC_SUPABASE_URL
    );

    if (isDemo) {
      // Return a mock case so the UI can update immediately
      const mockId = `case-demo-${Date.now()}`;
      return NextResponse.json({
        case: {
          id: mockId, title, practice_area, firm_id,
          status: 'open', risk_score: 0, risk_category: 'none',
          billing_model: billing_model ?? 'hourly',
          budget: budget ? budget * 100 : null,
          jurisdiction: jurisdiction ?? 'US',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        event: { id: `event-demo-${Date.now()}`, type: 'case_created' },
        demo: true,
      });
    }

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ── 1. Insert the case ────────────────────────────────────────────────────
    const { data: newCase, error: caseError } = await supabase
      .from('cases')
      .insert({
        title:         title.trim(),
        practice_area: practice_area.trim(),
        firm_id,
        status:        'open',
        risk_score:    0,
        risk_category: 'none',
        billing_model: billing_model ?? 'hourly',
        budget:        budget ? Math.round(Number(budget) * 100) : null, // store as cents
      })
      .select()
      .single();

    if (caseError) {
      console.error('Case insert error:', caseError);
      return NextResponse.json({ error: caseError.message }, { status: 500 });
    }

    // ── 2. Auto-generate the initial intake CaseEvent ─────────────────────────
    const { data: intakeEvent, error: eventError } = await supabase
      .from('case_events')
      .insert({
        case_id:  newCase.id,
        actor_id: session.user.id,
        type:     'case_created',
        metadata: {
          title, practice_area,
          billing_model: billing_model ?? 'hourly',
          jurisdiction:  jurisdiction ?? 'US',
        },
      })
      .select()
      .single();

    if (eventError) {
      // Case was created — log event failure but don't fail the whole request
      console.warn('Intake event insert error:', eventError);
    }

    // ── 3. Link client if email provided ──────────────────────────────────────
    if (client_email) {
      // Find or create the client user
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', client_email)
        .single();

      if (existingUser) {
        await supabase.from('case_clients').insert({
          case_id: newCase.id,
          user_id: existingUser.id,
        });
      }
      // If user doesn't exist yet, skip silently — can be linked later
    }

    // ── 4. Link the creating lawyer ────────────────────────────────────────────
    if (lawyer_id) {
      await supabase.from('case_lawyers').insert({
        case_id: newCase.id,
        user_id: lawyer_id,
      });
    } else {
      // Default to the session user
      await supabase.from('case_lawyers').insert({
        case_id: newCase.id,
        user_id: session.user.id,
      });
    }

    return NextResponse.json({
      case:  newCase,
      event: intakeEvent ?? null,
    }, { status: 201 });

  } catch (err) {
    console.error('POST /api/cases error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ─── GET /api/cases — list cases for the current user's firm ──────────────────
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const firm_id          = searchParams.get('firm_id');
    const status           = searchParams.get('status');
    const practice_area    = searchParams.get('practice_area');
    const jurisdiction     = searchParams.get('jurisdiction');

    const supabase = serverClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let query = supabase
      .from('cases')
      .select(`
        id, title, practice_area, status, risk_score, risk_category,
        budget, billing_model, created_at, updated_at, firm_id,
        case_clients ( user_id, users ( name ) ),
        case_lawyers ( user_id, users ( name ) )
      `)
      .order('updated_at', { ascending: false });

    if (firm_id)        query = query.eq('firm_id', firm_id);
    if (status && status !== 'all')             query = query.eq('status', status);
    if (practice_area && practice_area !== 'all') query = query.eq('practice_area', practice_area);

    const { data, error } = await query;

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ cases: data ?? [] });
  } catch (err) {
    console.error('GET /api/cases error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

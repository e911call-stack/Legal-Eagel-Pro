import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// ─── Vercel Cron: GET /api/cron/engine ───────────────────────────────────────
// Schedule: "0 0 * * *" (midnight UTC daily) — set in vercel.json
//
// Vercel calls this route with the Authorization header:
//   Authorization: Bearer <CRON_SECRET>
//
// Add CRON_SECRET to your Vercel env vars (any random string).
// ─────────────────────────────────────────────────────────────────────────────

export const dynamic = 'force-dynamic'; // never cache

export async function GET(request: NextRequest) {

  // ── Auth: only Vercel Cron (or you manually hitting it) ───────────────────
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey   = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Demo / missing config — return early gracefully
  if (!supabaseUrl || !serviceKey ||
      supabaseUrl === 'https://placeholder.supabase.co') {
    return NextResponse.json({
      ok:      true,
      message: 'Demo mode — Supabase not configured, engine skipped.',
      ran_at:  new Date().toISOString(),
    });
  }

  // Use SERVICE ROLE key so we can read all firms without RLS restrictions
  const supabase = createClient(supabaseUrl, serviceKey);

  const results: { firm_id: string; alerts_generated: number; error?: string }[] = [];
  let totalAlerts = 0;

  try {
    // ── 1. Fetch all firm IDs ─────────────────────────────────────────────────
    const { data: firms, error: firmsError } = await supabase
      .from('firms')
      .select('id, name');

    if (firmsError) {
      return NextResponse.json({ error: firmsError.message }, { status: 500 });
    }

    if (!firms || firms.length === 0) {
      return NextResponse.json({
        ok:      true,
        message: 'No firms found.',
        ran_at:  new Date().toISOString(),
      });
    }

    // ── 2. Run negligence engine for every firm ───────────────────────────────
    for (const firm of firms) {
      try {
        const { data, error } = await supabase.rpc('run_negligence_engine', {
          p_firm_id: firm.id,
        });

        const alertsCount = typeof data === 'number' ? data : 0;
        totalAlerts += alertsCount;
        results.push({ firm_id: firm.id, alerts_generated: alertsCount });

        if (error) {
          console.error(`Engine error for firm ${firm.id}:`, error);
          results[results.length - 1].error = error.message;
        }

      } catch (firmErr) {
        console.error(`Engine threw for firm ${firm.id}:`, firmErr);
        results.push({
          firm_id:           firm.id,
          alerts_generated:  0,
          error:             String(firmErr),
        });
      }
    }

    // ── 3. Log the run ────────────────────────────────────────────────────────
    console.log(
      `[cron/engine] Ran at ${new Date().toISOString()} | ` +
      `${firms.length} firm(s) | ${totalAlerts} alert(s) generated`
    );

    return NextResponse.json({
      ok:               true,
      ran_at:           new Date().toISOString(),
      firms_processed:  firms.length,
      total_alerts:     totalAlerts,
      results,
    });

  } catch (err) {
    console.error('[cron/engine] Fatal error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

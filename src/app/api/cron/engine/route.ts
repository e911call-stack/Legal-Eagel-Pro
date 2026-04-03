import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendAIAlertDigest, type AIAlertDigestData } from '@/lib/email';

// ─── GET /api/cron/engine — Daily Negligence Sweep ───────────────────────────
// Schedule: "0 0 * * *" (midnight UTC) — configured in vercel.json
// Vercel sends: Authorization: Bearer <CRON_SECRET>
// ─────────────────────────────────────────────────────────────────────────────
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {

  // ── Auth ──────────────────────────────────────────────────────────────────
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Demo / missing config — return gracefully
  if (!supabaseUrl || !serviceKey ||
      supabaseUrl === 'https://placeholder.supabase.co') {
    return NextResponse.json({
      ok:      true,
      message: 'Demo mode — Supabase not configured, engine skipped.',
      ran_at:  new Date().toISOString(),
    });
  }

  // Use SERVICE ROLE key — bypasses RLS so we can read all firms
  const supabase = createClient(supabaseUrl, serviceKey);

  type FirmResult = {
    firm_id: string;
    firm_name: string;
    alerts_generated: number;
    emails_sent: number;
    error?: string;
  };

  const results: FirmResult[] = [];
  let totalAlerts = 0;
  let totalEmails = 0;

  try {
    // ── 1. Fetch all firms ──────────────────────────────────────────────────
    const { data: firms, error: firmsError } = await supabase
      .from('firms')
      .select('id, name');

    if (firmsError) {
      return NextResponse.json({ error: firmsError.message }, { status: 500 });
    }
    if (!firms?.length) {
      return NextResponse.json({ ok: true, message: 'No firms found.', ran_at: new Date().toISOString() });
    }

    // ── 2. Process each firm ────────────────────────────────────────────────
    for (const firm of firms) {
      try {
        // 2a. Run negligence engine SQL function
        const { data: alertCount, error: engineError } = await supabase.rpc(
          'run_negligence_engine', { p_firm_id: firm.id }
        );

        if (engineError) {
          console.error(`[cron] Engine error for firm ${firm.id}:`, engineError);
          results.push({ firm_id: firm.id, firm_name: firm.name, alerts_generated: 0, emails_sent: 0, error: engineError.message });
          continue;
        }

        const alertsGenerated = typeof alertCount === 'number' ? alertCount : 0;
        totalAlerts += alertsGenerated;

        // 2b. Fetch newly-unresolved HIGH/MEDIUM alerts for digest email
        const { data: freshAlerts } = await supabase
          .from('ai_alerts')
          .select(`
            id, type, risk_level, description, case_id,
            cases ( id, title, risk_score, case_clients ( users ( name, email ) ) )
          `)
          .eq('resolved', false)
          // Only alerts created in the last 25 hours (engine runs at midnight,
          // so this catches today's + any from yesterday that weren't digested)
          .gte('created_at', new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString())
          .in('risk_level', ['high', 'medium'])
          .order('risk_level', { ascending: false }) // high first
          .limit(20);

        if (!freshAlerts?.length) {
          results.push({ firm_id: firm.id, firm_name: firm.name, alerts_generated: alertsGenerated, emails_sent: 0 });
          continue;
        }

        // 2c. Fetch firm_admin users to send digest to
        const { data: admins } = await supabase
          .from('users')
          .select('id, name, email')
          .eq('firm_id', firm.id)
          .in('role', ['firm_admin', 'lawyer']);

        if (!admins?.length) {
          results.push({ firm_id: firm.id, firm_name: firm.name, alerts_generated: alertsGenerated, emails_sent: 0 });
          continue;
        }

        // 2d. Build the digest payload
        const digestAlerts: AIAlertDigestData['alerts'] = freshAlerts.map(a => {
          // Safely extract case data from the join
          const caseData = a.cases as unknown as {
            id: string; title: string; risk_score: number;
            case_clients: Array<{ users: { name: string; email: string } }>;
          } | null;
          const clientName = caseData?.case_clients?.[0]?.users?.name ?? 'Unknown client';

          return {
            id:          caseData?.id ?? a.case_id,
            title:       caseData?.title ?? 'Unknown case',
            risk_score:  caseData?.risk_score ?? 0,
            risk_level:  a.risk_level as 'low' | 'medium' | 'high',
            alert_type:  a.type as AIAlertDigestData['alerts'][number]['alert_type'],
            description: a.description,
            client_name: clientName,
          };
        });

        // 2e. Send one digest per firm admin/lawyer (not per case)
        // Group by firm — all attorneys get the same digest
        const primaryAdmin = admins.find(u => u) ?? admins[0]; // send to all

        let firmEmailsSent = 0;
        for (const admin of admins) {
          const result = await sendAIAlertDigest({
            to:       admin.email,
            name:     admin.name,
            firmName: firm.name,
            alerts:   digestAlerts,
            date:     new Date().toLocaleDateString('en-US', {
              weekday: 'long', month: 'long', day: 'numeric',
            }),
          });
          if (result.success) firmEmailsSent++;
        }

        totalEmails += firmEmailsSent;
        results.push({
          firm_id:           firm.id,
          firm_name:         firm.name,
          alerts_generated:  alertsGenerated,
          emails_sent:       firmEmailsSent,
        });

      } catch (firmErr) {
        console.error(`[cron] Threw for firm ${firm.id}:`, firmErr);
        results.push({
          firm_id:          firm.id,
          firm_name:        firm.name,
          alerts_generated: 0,
          emails_sent:      0,
          error:            String(firmErr),
        });
      }
    }

    console.log(
      `[cron/engine] ${new Date().toISOString()} | ` +
      `${firms.length} firm(s) | ${totalAlerts} alert(s) | ${totalEmails} email(s) sent`
    );

    return NextResponse.json({
      ok:              true,
      ran_at:          new Date().toISOString(),
      firms_processed: firms.length,
      total_alerts:    totalAlerts,
      total_emails:    totalEmails,
      results,
    });

  } catch (err) {
    console.error('[cron/engine] Fatal:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

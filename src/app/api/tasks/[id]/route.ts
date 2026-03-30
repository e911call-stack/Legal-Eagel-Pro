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

// ─── PATCH /api/tasks/[id] ────────────────────────────────────────────────────
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: taskId } = params;
    const body           = await request.json();
    const { status, case_id } = body;

    const VALID_STATUSES = ['not_started', 'in_progress', 'done'];
    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: `status must be one of: ${VALID_STATUSES.join(', ')}` }, { status: 400 });
    }

    const supabase = serverClient();
    const { data: { session } } = await supabase.auth.getSession();

    // Demo mode — return success immediately so UI updates work
    const isDemo = !session && (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://placeholder.supabase.co'
    );

    if (isDemo) {
      return NextResponse.json({
        task:  { id: taskId, status },
        event: { id: `event-demo-${Date.now()}`, type: 'task_updated' },
        demo:  true,
      });
    }

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ── 1. Fetch current task (need old status for the event log) ─────────────
    const { data: oldTask, error: fetchError } = await supabase
      .from('tasks')
      .select('id, title, status, case_id')
      .eq('id', taskId)
      .single();

    if (fetchError || !oldTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const oldStatus = oldTask.status;
    if (oldStatus === status) {
      // No change — return current task without a DB write
      return NextResponse.json({ task: oldTask });
    }

    // ── 2. UPDATE tasks.status ────────────────────────────────────────────────
    const { data: updatedTask, error: updateError } = await supabase
      .from('tasks')
      .update({ status })
      .eq('id', taskId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // ── 3. Update case.updated_at so negligence engine sees activity ──────────
    const effectiveCaseId = case_id ?? oldTask.case_id;
    await supabase
      .from('cases')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', effectiveCaseId);

    // ── 4. Emit a case_events row ─────────────────────────────────────────────
    const { data: event } = await supabase
      .from('case_events')
      .insert({
        case_id:  effectiveCaseId,
        actor_id: session.user.id,
        type:     'task_updated',
        metadata: {
          task_id:    taskId,
          task:       oldTask.title,
          old_status: oldStatus,
          new_status: status,
        },
      })
      .select()
      .single();

    return NextResponse.json({ task: updatedTask, event: event ?? null });

  } catch (err) {
    console.error('PATCH /api/tasks/[id] error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

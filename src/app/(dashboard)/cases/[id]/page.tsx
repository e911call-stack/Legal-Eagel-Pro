'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import {
  ArrowLeft, Sparkles, Clock, CheckSquare, FileText, MessageSquare,
  AlertTriangle, Calendar, Plus, Check, Upload, Loader2
} from 'lucide-react';
import Link from 'next/link';
import { mockCases, mockTasks, mockEvents, mockDocuments, mockMessages } from '@/lib/mock-data';
import { cn, riskColor, statusColor, formatStatus, formatDate, timeAgo, riskDot } from '@/lib/utils';
import { useI18n } from '@/lib/i18n';
import type { TaskStatus } from '@/types';

const TABS = ['Timeline', 'Tasks', 'Deadlines', 'Documents', 'Messages'] as const;
type Tab = typeof TABS[number];

export default function CasePage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useI18n();
  const [tab, setTab] = useState<Tab>('Timeline');
  const [analyzing, setAnalyzing] = useState(false);
  const [report, setReport] = useState<string | null>(null);

  const caseData = mockCases.find(c => c.id === id) ?? mockCases[0];

  // ── Local task state — starts from mock, gets updated on DB write ─────────
  const [localTasks, setLocalTasks] = useState(
    mockTasks.filter(tk => tk.case_id === caseData.id)
  );
  const [updatingTask, setUpdatingTask] = useState<string | null>(null);
  const [taskError, setTaskError]       = useState<string | null>(null);

  const tasks = localTasks;
  const events    = mockEvents.filter(e => e.case_id === caseData.id);
  const docs      = mockDocuments.filter(d => d.case_id === caseData.id);
  const msgs      = mockMessages.filter(m => m.case_id === caseData.id);
  const riskLevel = caseData.risk_score >= 70 ? 'high' : caseData.risk_score >= 40 ? 'medium' : 'low';

  async function analyzeCase() {
    setAnalyzing(true);
    await new Promise(r => setTimeout(r, 2200));
    setReport(`Risk Score: ${caseData.risk_score}/100 · ${formatStatus(caseData.risk_category)} detected. The AI engine identified an issue requiring immediate review. Recommendation: Schedule a review session with the assigned attorney within 48 hours.`);
    setAnalyzing(false);
  }


  // ── Update task status → PATCH /api/tasks/[id] ───────────────────────────
  async function updateTaskStatus(taskId: string, newStatus: TaskStatus) {
    setUpdatingTask(taskId);
    setTaskError(null);

    // Optimistic update — flip the UI immediately
    setLocalTasks(prev =>
      prev.map(tk => tk.id === taskId ? { ...tk, status: newStatus } : tk)
    );

    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ status: newStatus, case_id: caseData.id }),
      });

      if (!res.ok) {
        const data = await res.json();
        // Roll back on error
        setLocalTasks(prev =>
          prev.map(tk => {
            if (tk.id !== taskId) return tk;
            const original = mockTasks.find(m => m.id === taskId);
            return original ? { ...tk, status: original.status } : tk;
          })
        );
        setTaskError(data.error ?? 'Failed to update task');
      }
    } catch {
      setTaskError('Network error — changes may not have saved');
    } finally {
      setUpdatingTask(null);
    }
  }

  const eventIcons: Record<string, React.ReactNode> = {
    case_created:       <div className="w-6 h-6 rounded-full bg-green-100 border border-green-200 flex items-center justify-center text-[10px] text-green-600">✓</div>,
    document_uploaded:  <div className="w-6 h-6 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center"><FileText className="w-3 h-3 text-blue-600" /></div>,
    message_sent:       <div className="w-6 h-6 rounded-full bg-violet-100 border border-violet-200 flex items-center justify-center"><MessageSquare className="w-3 h-3 text-violet-600" /></div>,
    task_updated:       <div className="w-6 h-6 rounded-full bg-amber-100 border border-amber-200 flex items-center justify-center"><CheckSquare className="w-3 h-3 text-amber-600" /></div>,
    ai_alert_generated: <div className="w-6 h-6 rounded-full bg-red-100 border border-red-200 flex items-center justify-center"><AlertTriangle className="w-3 h-3 text-red-600" /></div>,
    deadline_updated:   <div className="w-6 h-6 rounded-full bg-orange-100 border border-orange-200 flex items-center justify-center"><Calendar className="w-3 h-3 text-orange-600" /></div>,
  };

  const eventDesc: Record<string, (m?: Record<string, unknown>) => string> = {
    case_created:       () => 'Case created and intake event generated',
    document_uploaded:  m  => `Document uploaded: ${m?.file_name ?? 'file'}`,
    message_sent:       m  => `Message: "${String(m?.preview ?? '').slice(0, 60)}…"`,
    task_updated:       m  => `Task "${m?.task}" marked as ${formatStatus(String(m?.new_status ?? ''))}`,
    ai_alert_generated: m  => `AI Alert — ${formatStatus(String(m?.alert_type ?? ''))} · risk: ${m?.risk_level}`,
    deadline_updated:   () => 'Deadline updated',
  };

  return (
    <div className="animate-fade-in" style={{ background: '#f5f4f0', minHeight: '100%' }}>
      {/* Page header */}
      <div className="px-5 lg:px-7 pt-5 pb-0">
        <Link href="/cases"
          className="inline-flex items-center gap-1.5 text-stone-500 hover:text-stone-800 text-sm mb-4 transition-colors font-medium">
          <ArrowLeft className="w-4 h-4" /> {t.caseDetail.backToCases}
        </Link>

        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-5">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span className={cn('badge', statusColor(caseData.status))}>{formatStatus(caseData.status)}</span>
              <span className={cn('badge', riskColor(riskLevel))}>
                <div className={cn('w-1.5 h-1.5 rounded-full', riskDot(riskLevel))} />
                {riskLevel} risk · {caseData.risk_score}/100
              </span>
              <span className="text-xs text-stone-400 font-medium">{caseData.practice_area}</span>
            </div>
            <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
              className="text-2xl lg:text-3xl font-semibold text-stone-900 mb-2">
              {caseData.title}
            </h1>
            <div className="flex flex-wrap gap-4 text-xs text-stone-400">
              <span>{t.caseDetail.backToCases.includes('Back') ? 'Client' : t.cases.client}: <span className="text-stone-600 font-medium">{caseData.client_name}</span></span>
              <span>Attorney: <span className="text-stone-600 font-medium">{caseData.lawyer_name}</span></span>
              <span>Last activity: <span className="text-stone-500">{timeAgo(caseData.last_activity!)}</span></span>
            </div>
          </div>
          <button onClick={analyzeCase} disabled={analyzing}
            className={cn('flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all duration-300 flex-shrink-0 shadow-sm',
              analyzing
                ? 'bg-amber-50 border-amber-300 text-amber-700 cursor-not-allowed'
                : 'bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100 hover:border-amber-400'
            )}>
            {analyzing
              ? <><div className="w-3.5 h-3.5 border-2 border-amber-400/40 border-t-amber-600 rounded-full animate-spin" />{t.caseDetail.analyzing}</>
              : <><Sparkles className="w-3.5 h-3.5" />{t.caseDetail.checkHealth}</>
            }
          </button>
        </div>
      </div>

      {/* AI Report */}
      {report && (
        <div className="mx-5 lg:mx-7 bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-4 animate-slide-up shadow-sm">
          <div className="flex items-start gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs font-bold text-amber-700">{t.caseDetail.aiReport}</p>
          </div>
          {report.split('\n\n').map((para, i) => (
            <p key={i} className="text-xs text-stone-700 mb-1 last:mb-0">{para}</p>
          ))}
          <button onClick={() => setReport(null)} className="text-stone-400 text-xs hover:text-stone-600 mt-1">
            {t.caseDetail.dismiss}
          </button>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 px-5 lg:px-7 mb-0">
        {[
          { label: 'Risk Score', value: `${caseData.risk_score}/100`, color: riskLevel === 'high' ? 'text-red-600' : riskLevel === 'medium' ? 'text-amber-600' : 'text-green-600' },
          { label: t.caseDetail.tasks, value: tasks.filter(tk => tk.status !== 'done').length, color: 'text-blue-600' },
          { label: t.caseDetail.documents, value: docs.length, color: 'text-violet-600' },
          { label: t.caseDetail.messages, value: msgs.length, color: 'text-amber-600' },
        ].map(item => (
          <div key={item.label} className="bg-white border border-stone-200 rounded-xl p-4 text-center shadow-sm">
            <div className={cn('text-2xl font-bold', item.color)}>{item.value}</div>
            <div className="text-xs text-stone-400 mt-0.5">{item.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-stone-200 px-5 lg:px-7 mt-5 bg-white">
        {TABS.map(tabItem => (
          <button key={tabItem} onClick={() => setTab(tabItem)}
            className={cn(
              'px-4 py-3 text-xs font-semibold border-b-2 transition-all duration-200 uppercase tracking-wider',
              tab === tabItem
                ? 'border-amber-500 text-amber-700'
                : 'border-transparent text-stone-400 hover:text-stone-700'
            )}>
            {tabItem}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="p-5 lg:p-7 animate-fade-in" key={tab}>

        {tab === 'Timeline' && (
          <div className="space-y-0 max-w-2xl">
            {events.map((ev, i) => (
              <div key={ev.id} className="flex gap-4 pb-5 last:pb-0">
                <div className="flex flex-col items-center gap-1">
                  {eventIcons[ev.type] ?? <div className="w-6 h-6 rounded-full bg-stone-100 border border-stone-200" />}
                  {i < events.length - 1 && <div className="w-px flex-1 bg-stone-200 min-h-[20px]" />}
                </div>
                <div className="flex-1 pt-0.5">
                  <p className="text-sm text-stone-800 font-medium">{eventDesc[ev.type]?.(ev.metadata as Record<string, unknown>)}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-stone-400">{ev.actor_name}</span>
                    <span className="text-stone-300">·</span>
                    <span className="text-xs text-stone-400">{timeAgo(ev.created_at)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'Tasks' && (
          <div className="space-y-2 max-w-2xl">
            {/* Task error toast */}
            {taskError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-700 font-medium flex items-center justify-between">
                {taskError}
                <button onClick={() => setTaskError(null)} className="text-red-400 hover:text-red-600 ml-2">✕</button>
              </div>
            )}
            {tasks.map(task => (
              <div key={task.id} className="bg-white border border-stone-200 rounded-xl flex items-start gap-3 p-4 shadow-sm">
                {/* Status checkbox — click to toggle done */}
                <button
                  onClick={() => updateTaskStatus(
                    task.id,
                    task.status === 'done' ? 'in_progress' : 'done'
                  )}
                  className={cn('w-5 h-5 rounded flex items-center justify-center mt-0.5 flex-shrink-0 border-2 transition-all duration-200',
                    task.status === 'done'
                      ? 'bg-green-500 border-green-500 hover:bg-green-600'
                      : 'border-stone-300 hover:border-amber-400'
                  )}>
                  {updatingTask === task.id
                    ? <Loader2 className="w-3 h-3 text-white animate-spin" />
                    : task.status === 'done' && <Check className="w-3 h-3 text-white" />
                  }
                </button>

                <div className="flex-1">
                  <p className={cn('text-sm font-semibold', task.status === 'done' ? 'text-stone-400 line-through' : 'text-stone-800')}>
                    {task.title}
                  </p>
                  {task.description && <p className="text-xs text-stone-400 mt-0.5">{task.description}</p>}
                  <div className="flex items-center gap-2 mt-1.5">
                    <Clock className="w-3 h-3 text-stone-400" />
                    <span className="text-xs text-stone-400">Due {formatDate(task.due_date)}</span>
                    <span className="text-stone-300">·</span>
                    <span className="text-xs text-stone-400">{task.assignee_name}</span>
                  </div>
                </div>

                {/* Status select — wired to DB */}
                <div className="relative">
                  <select
                    value={task.status}
                    disabled={updatingTask === task.id}
                    onChange={e => updateTaskStatus(task.id, e.target.value as TaskStatus)}
                    className={cn(
                      'text-xs border rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:border-amber-400 cursor-pointer transition-all duration-200',
                      updatingTask === task.id
                        ? 'border-amber-300 text-amber-600 opacity-60 cursor-not-allowed'
                        : 'border-stone-200 text-stone-600 hover:border-stone-300'
                    )}>
                    <option value="not_started">{t.shared.status.not_started}</option>
                    <option value="in_progress">{t.shared.status.in_progress}</option>
                    <option value="done">{t.shared.status.done}</option>
                  </select>
                  {updatingTask === task.id && (
                    <Loader2 className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-amber-500 animate-spin pointer-events-none" />
                  )}
                </div>
              </div>
            ))}
            <button className="w-full py-3 rounded-xl border-2 border-dashed border-stone-200 text-xs text-stone-400 hover:text-stone-600 hover:border-stone-300 flex items-center justify-center gap-2 transition-colors">
              <Plus className="w-3.5 h-3.5" /> {t.caseDetail.addTask}
            </button>
          </div>
        )}

        {tab === 'Documents' && (
          <div className="space-y-2 max-w-2xl">
            <button className="w-full py-3 rounded-xl border-2 border-dashed border-amber-300 text-xs text-amber-600 hover:text-amber-700 hover:bg-amber-50 flex items-center justify-center gap-2 transition-colors mb-4">
              <Upload className="w-3.5 h-3.5" /> {t.caseDetail.uploadDocument}
            </button>
            {docs.map(doc => (
              <div key={doc.id} className="bg-white border border-stone-200 rounded-xl flex items-center gap-3 p-4 shadow-sm">
                <div className="w-8 h-10 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-stone-800 truncate">{doc.file_name}</p>
                  <div className="flex items-center gap-2 text-xs text-stone-400 mt-0.5">
                    <span>{formatStatus(doc.doc_type)}</span>
                    <span>·</span>
                    <span>{doc.uploaded_by_name}</span>
                    <span>·</span>
                    <span>{timeAgo(doc.uploaded_at)}</span>
                  </div>
                </div>
                {doc.is_public_to_client
                  ? <span className="text-[10px] text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full font-semibold">{t.caseDetail.clientVisible}</span>
                  : <span className="text-[10px] text-stone-500 bg-stone-100 border border-stone-200 px-2 py-0.5 rounded-full font-semibold">{t.caseDetail.internalOnly}</span>
                }
              </div>
            ))}
          </div>
        )}

        {tab === 'Messages' && (
          <div className="space-y-3 max-w-2xl">
            {msgs.map(msg => (
              <div key={msg.id} className={cn(
                'bg-white border rounded-2xl p-4 shadow-sm',
                msg.is_internal_note ? 'border-amber-200 bg-amber-50' : 'border-stone-200'
              )}>
                <div className="flex items-start justify-between gap-3 mb-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-amber-100 border border-amber-200 flex items-center justify-center text-[10px] text-amber-700 font-bold flex-shrink-0">
                      {msg.sender_name?.[0]}
                    </div>
                    <span className="text-xs font-semibold text-stone-800">{msg.sender_name}</span>
                    {msg.is_internal_note && (
                      <span className="text-[10px] text-amber-700 bg-amber-100 border border-amber-200 px-1.5 py-0.5 rounded font-semibold">Internal</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-semibold border',
                      msg.status === 'seen'
                        ? 'text-green-700 bg-green-50 border-green-200'
                        : 'text-stone-500 bg-stone-100 border-stone-200')}>
                      {msg.status === 'seen' ? '✓ Seen' : 'Sent'}
                    </span>
                    <span className="text-xs text-stone-400">{timeAgo(msg.created_at)}</span>
                  </div>
                </div>
                <p className="text-sm text-stone-700 leading-relaxed">{msg.content}</p>
              </div>
            ))}
            {/* Compose */}
            <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-sm">
              <textarea rows={3} placeholder="Write a message…"
                className="input-field resize-none mb-3" />
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs text-stone-500 cursor-pointer font-medium">
                  <input type="checkbox" className="rounded accent-amber-500" />
                  {t.caseDetail.internalNote}
                </label>
                <button className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5" /> {t.caseDetail.send}
                </button>
              </div>
            </div>
          </div>
        )}

        {tab === 'Deadlines' && (
          <div className="space-y-3 max-w-2xl">
            {[
              { type: 'Court Filing', date: '2024-04-15', note: 'File motion to compel by April 10 for processing.', overdue: false },
              { type: 'Internal Review', date: '2024-03-26', note: 'Attorney review of deposition transcripts.', overdue: true },
              { type: 'Discovery Response', date: '2024-04-22', note: null, overdue: false },
            ].map((d, i) => (
              <div key={i} className={cn('bg-white border rounded-2xl p-4 flex items-start gap-4 shadow-sm',
                d.overdue ? 'border-red-200 bg-red-50' : 'border-stone-200')}>
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                  d.overdue ? 'bg-red-100' : 'bg-amber-100')}>
                  <Calendar className={cn('w-5 h-5', d.overdue ? 'text-red-600' : 'text-amber-600')} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-semibold text-stone-800">{d.type}</p>
                    {d.overdue && (
                      <span className="text-[10px] text-red-700 bg-red-100 border border-red-200 px-1.5 py-0.5 rounded-full font-semibold">
                        {t.caseDetail.overdue}
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-mono text-stone-600">{d.date}</p>
                  {d.note && <p className="text-xs text-stone-400 mt-1">{d.note}</p>}
                </div>
              </div>
            ))}
            <button className="w-full py-3 rounded-xl border-2 border-dashed border-stone-200 text-xs text-stone-400 hover:text-stone-600 hover:border-stone-300 flex items-center justify-center gap-2 transition-colors">
              <Plus className="w-3.5 h-3.5" /> {t.caseDetail.addDeadline}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

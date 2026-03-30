'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Sparkles, Clock, FileText, MessageSquare, Calendar } from 'lucide-react';
import { mockCases, mockEvents } from '@/lib/mock-data';
import { cn, riskColor, statusColor, formatStatus, timeAgo, riskDot } from '@/lib/utils';

const CLIENT_CASE_IDS = ['case-1', 'case-3'];

export default function ClientCasePage() {
  const { id } = useParams<{ id: string }>();
  const [analyzing, setAnalyzing] = useState(false);
  const [report, setReport]       = useState<string | null>(null);

  const caseData = mockCases.find(c => c.id === id && CLIENT_CASE_IDS.includes(c.id)) ?? mockCases[0];
  const events   = mockEvents.filter(e => e.case_id === caseData.id);
  const riskLevel = caseData.risk_score >= 70 ? 'high' : caseData.risk_score >= 40 ? 'medium' : 'low';

  async function checkHealth() {
    setAnalyzing(true);
    await new Promise(r => setTimeout(r, 2000));
    const msgs: Record<string, string> = {
      high:   `No major activity has been recorded in the last 14 days on your case. There may be an upcoming deadline. We have notified your attorney and recommend you reach out directly.`,
      medium: `Your case is progressing, though there is a message that has not been replied to in over 72 hours. Your attorney has been prompted to respond.`,
      low:    `Your case is healthy and progressing on schedule. Your attorney has been active and all known deadlines are current.`,
    };
    setReport(msgs[riskLevel]);
    setAnalyzing(false);
  }

  // Only show client-visible events (no internal notes or firm-only events)
  const clientEvents = events.filter(e => e.type !== 'ai_alert_generated');

  const eventIcons: Record<string, React.ReactNode> = {
    case_created:      <div className="w-6 h-6 rounded-full bg-green-100 border border-green-200 flex items-center justify-center text-[10px] text-green-700">✓</div>,
    document_uploaded: <div className="w-6 h-6 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center"><FileText className="w-3 h-3 text-blue-600" /></div>,
    message_sent:      <div className="w-6 h-6 rounded-full bg-violet-100 border border-violet-200 flex items-center justify-center"><MessageSquare className="w-3 h-3 text-violet-600" /></div>,
    task_updated:      <div className="w-6 h-6 rounded-full bg-amber-100 border border-amber-200 flex items-center justify-center"><Calendar className="w-3 h-3 text-amber-600" /></div>,
    deadline_updated:  <div className="w-6 h-6 rounded-full bg-orange-100 border border-orange-200 flex items-center justify-center"><Clock className="w-3 h-3 text-orange-600" /></div>,
  };

  const eventLabel: Record<string, string> = {
    case_created:      'Your case was opened',
    document_uploaded: 'A document was shared with you',
    message_sent:      'A message was sent',
    task_updated:      'Your attorney updated a task',
    deadline_updated:  'A deadline was updated',
  };

  return (
    <div className="p-5 lg:p-7 animate-fade-in">
      <Link href="/portal/dashboard"
        className="inline-flex items-center gap-1.5 text-stone-500 hover:text-stone-800 text-sm mb-4 transition-colors font-medium">
        <ArrowLeft className="w-4 h-4" /> Back to My Cases
      </Link>

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-5">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <span className={cn('badge', statusColor(caseData.status))}>{formatStatus(caseData.status)}</span>
            <span className={cn('badge', riskColor(riskLevel))}>
              <div className={cn('w-1.5 h-1.5 rounded-full', riskDot(riskLevel))} />
              {riskLevel === 'low' ? 'On track' : riskLevel === 'medium' ? 'Needs attention' : 'Review needed'}
            </span>
          </div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            className="text-2xl lg:text-3xl font-semibold text-stone-900 mb-1">{caseData.title}</h1>
          <p className="text-xs text-stone-400">
            {caseData.practice_area} · Your attorney: <span className="text-stone-600 font-medium">{caseData.lawyer_name}</span>
            · Last update: <span className="text-stone-500">{timeAgo(caseData.last_activity!)}</span>
          </p>
        </div>
        <button onClick={checkHealth} disabled={analyzing}
          className={cn('flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border-2 flex-shrink-0 transition-all duration-300',
            analyzing ? 'bg-amber-50 border-amber-300 text-amber-700 cursor-not-allowed' : 'bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100')}>
          {analyzing
            ? <><div className="w-3.5 h-3.5 border-2 border-amber-400/30 border-t-amber-600 rounded-full animate-spin" /> Checking…</>
            : <><Sparkles className="w-3.5 h-3.5" /> Is my case stuck?</>
          }
        </button>
      </div>

      {/* AI report */}
      {report && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-5 animate-slide-up">
          <div className="flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs font-bold text-amber-700 mb-1">Case Health Report</p>
              <p className="text-sm text-stone-700 leading-relaxed">{report}</p>
            </div>
            <button onClick={() => setReport(null)} className="text-stone-400 hover:text-stone-600 text-xs">✕</button>
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Link href={`/portal/messages?case=${caseData.id}`}
          className="bg-white border border-stone-200 rounded-2xl p-4 hover:border-amber-300 transition-colors text-center shadow-sm group">
          <MessageSquare className="w-5 h-5 text-violet-600 mx-auto mb-2" />
          <p className="text-sm font-semibold text-stone-800 group-hover:text-amber-700 transition-colors">Message Attorney</p>
          <p className="text-xs text-stone-400 mt-0.5">Ask a question</p>
        </Link>
        <Link href={`/portal/documents?case=${caseData.id}`}
          className="bg-white border border-stone-200 rounded-2xl p-4 hover:border-amber-300 transition-colors text-center shadow-sm group">
          <FileText className="w-5 h-5 text-blue-600 mx-auto mb-2" />
          <p className="text-sm font-semibold text-stone-800 group-hover:text-amber-700 transition-colors">View Documents</p>
          <p className="text-xs text-stone-400 mt-0.5">Filings & contracts</p>
        </Link>
      </div>

      {/* Timeline — client visible events only */}
      <div className="bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-stone-100">
          <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            className="text-lg font-semibold text-stone-900">Case Timeline</h2>
          <p className="text-xs text-stone-400 mt-0.5">A record of activity on your case</p>
        </div>
        <div className="p-5 space-y-0">
          {clientEvents.map((ev, i) => (
            <div key={ev.id} className="flex gap-4 pb-5 last:pb-0">
              <div className="flex flex-col items-center gap-1">
                {eventIcons[ev.type] ?? <div className="w-6 h-6 rounded-full bg-stone-100 border border-stone-200" />}
                {i < clientEvents.length - 1 && <div className="w-px flex-1 bg-stone-200 min-h-[20px]" />}
              </div>
              <div className="flex-1 pt-0.5">
                <p className="text-sm font-medium text-stone-800">
                  {eventLabel[ev.type] ?? ev.type.replace(/_/g, ' ')}
                </p>
                <p className="text-xs text-stone-400 mt-0.5">{timeAgo(ev.created_at)}</p>
              </div>
            </div>
          ))}
          {clientEvents.length === 0 && (
            <p className="text-sm text-stone-400 py-4 text-center">No activity recorded yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

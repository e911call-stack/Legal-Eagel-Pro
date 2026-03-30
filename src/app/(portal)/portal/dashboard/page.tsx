'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Sparkles, ChevronRight, Clock, AlertTriangle, CheckCircle, ArrowUpRight } from 'lucide-react';
import { mockCases, mockAlerts } from '@/lib/mock-data';
import { cn, riskDot, riskColor, statusColor, formatStatus, timeAgo } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';

// In production this would filter by case_clients.user_id = auth.uid()
// For demo: show cases where client_name matches the logged-in user's name
const CLIENT_CASE_IDS = ['case-1', 'case-3']; // Harrison + Rodriguez (demo)

export default function ClientDashboardPage() {
  const { profile } = useAuth();
  const [analyzing, setAnalyzing] = useState<string | null>(null);
  const [reports, setReports]     = useState<Record<string, string>>({});

  // Filter to only this client's cases
  const myCases = mockCases.filter(c => CLIENT_CASE_IDS.includes(c.id));
  const myAlerts = mockAlerts.filter(a => CLIENT_CASE_IDS.includes(a.case_id) && !a.resolved);

  async function checkHealth(caseId: string) {
    setAnalyzing(caseId);
    await new Promise(r => setTimeout(r, 2000));
    const c = myCases.find(x => x.id === caseId);
    const riskLevel = (c?.risk_score ?? 0) >= 70 ? 'high' : (c?.risk_score ?? 0) >= 40 ? 'medium' : 'low';

    const messages: Record<string, string> = {
      high:   `Your case has a high activity concern (score ${c?.risk_score}/100). No meaningful update has been recorded in over 14 days, and there may be an upcoming deadline. We recommend contacting your attorney immediately.`,
      medium: `Your case has a moderate concern (score ${c?.risk_score}/100). A message you sent may not have been replied to yet. Your attorney has been notified.`,
      low:    `Your case is progressing well (score ${c?.risk_score}/100). Your attorney has been active and all deadlines are on track.`,
    };

    setReports(prev => ({ ...prev, [caseId]: messages[riskLevel] }));
    setAnalyzing(null);
  }

  const firstName = profile?.name?.split(' ')[0] ?? 'there';

  return (
    <div className="p-5 lg:p-7 animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          className="text-2xl lg:text-3xl font-semibold text-stone-900">
          Hello, {firstName}
        </h1>
        <p className="text-stone-500 text-sm mt-1">
          Here are your active legal cases. You can check the status, review documents, and message your attorney.
        </p>
      </div>

      {/* Alerts for this client */}
      {myAlerts.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-5">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-amber-700 mb-1">Case Update</p>
              <p className="text-xs text-stone-700">
                Your attorney has been alerted about an update on your case. Use the "Check Case Health" button below for details.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Cases */}
      <div className="space-y-4">
        {myCases.map((c, i) => {
          const riskLevel = c.risk_score >= 70 ? 'high' : c.risk_score >= 40 ? 'medium' : 'low';
          const daysSince = Math.floor((Date.now() - new Date(c.last_activity!).getTime()) / 86400000);

          return (
            <div key={c.id} className="bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden animate-slide-up"
              style={{ animationDelay: `${i * 0.08}s` }}>

              {/* Case header */}
              <div className="p-5 border-b border-stone-100">
                <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={cn('badge', statusColor(c.status))}>{formatStatus(c.status)}</span>
                    <span className={cn('badge', riskColor(riskLevel))}>
                      <div className={cn('w-1.5 h-1.5 rounded-full', riskDot(riskLevel))} />
                      {riskLevel} risk
                    </span>
                  </div>
                  <Link href={`/portal/cases/${c.id}`}
                    className="text-xs text-amber-600 hover:text-amber-700 font-semibold flex items-center gap-1 transition-colors">
                    View case <ArrowUpRight className="w-3 h-3" />
                  </Link>
                </div>
                <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                  className="text-xl font-semibold text-stone-900 mb-1">{c.title}</h2>
                <p className="text-xs text-stone-400">{c.practice_area} · Attorney: <span className="font-medium text-stone-600">{c.lawyer_name}</span></p>
              </div>

              {/* Activity + Risk */}
              <div className="px-5 py-4 grid grid-cols-2 gap-4 border-b border-stone-100">
                <div>
                  <div className="text-[10px] text-stone-400 font-semibold uppercase tracking-wide mb-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Last Activity
                  </div>
                  <div className="text-sm font-semibold text-stone-800">{timeAgo(c.last_activity!)}</div>
                  <div className="text-xs text-stone-400 mt-0.5">
                    {daysSince === 0 ? 'Updated today' : `${daysSince} day${daysSince !== 1 ? 's' : ''} ago`}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-stone-400 font-semibold uppercase tracking-wide mb-1">Case Health</div>
                  <div className="h-2 bg-stone-100 rounded-full overflow-hidden mb-1">
                    <div className={cn('h-full rounded-full',
                      riskLevel === 'high' ? 'bg-red-500' : riskLevel === 'medium' ? 'bg-amber-500' : 'bg-green-500')}
                      style={{ width: `${100 - c.risk_score}%` }} />
                  </div>
                  <div className="text-xs text-stone-500">
                    {riskLevel === 'low' ? '✓ On track' : riskLevel === 'medium' ? '⚠ Needs attention' : '🔴 Review needed'}
                  </div>
                </div>
              </div>

              {/* AI report (if triggered) */}
              {reports[c.id] && (
                <div className="px-5 py-3 bg-amber-50 border-b border-amber-100">
                  <div className="flex items-start gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-stone-700 leading-relaxed">{reports[c.id]}</p>
                    <button onClick={() => setReports(p => { const n = { ...p }; delete n[c.id]; return n; })}
                      className="text-stone-400 hover:text-stone-600 text-xs ml-1 flex-shrink-0">✕</button>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="px-5 py-3 flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => checkHealth(c.id)}
                  disabled={analyzing === c.id}
                  className={cn(
                    'flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border-2 transition-all duration-200',
                    analyzing === c.id
                      ? 'bg-amber-50 border-amber-300 text-amber-700 cursor-not-allowed'
                      : 'bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100 hover:border-amber-400'
                  )}>
                  {analyzing === c.id
                    ? <><div className="w-3 h-3 border-2 border-amber-400/30 border-t-amber-600 rounded-full animate-spin" /> Checking…</>
                    : <><Sparkles className="w-3 h-3" /> Is my case stuck?</>
                  }
                </button>
                <Link href={`/portal/messages?case=${c.id}`}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border-2 border-stone-200 text-stone-600 hover:border-stone-300 hover:text-stone-800 transition-all duration-200">
                  Message Attorney
                </Link>
                <Link href={`/portal/documents?case=${c.id}`}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border-2 border-stone-200 text-stone-600 hover:border-stone-300 hover:text-stone-800 transition-all duration-200">
                  View Documents
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {myCases.length === 0 && (
        <div className="text-center py-20">
          <CheckCircle className="w-10 h-10 text-stone-300 mx-auto mb-3" />
          <p className="text-stone-500 text-sm">No active cases. Your attorney will create one when your engagement begins.</p>
        </div>
      )}
    </div>
  );
}

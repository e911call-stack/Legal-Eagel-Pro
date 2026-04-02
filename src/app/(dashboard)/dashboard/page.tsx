'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import Link from 'next/link';
import {
  TrendingUp, AlertTriangle, MessageSquare, CheckSquare,
  Briefcase, ChevronRight, Clock, ArrowUpRight, Sparkles, RefreshCw
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { mockStats, mockCases, mockAlerts, mockTasks } from '@/lib/mock-data';
import { cn, riskDot, statusColor, formatStatus, timeAgo, riskColor } from '@/lib/utils';
import { useI18n } from '@/lib/i18n';
import { useAuth } from '@/lib/auth-context';
import { useDashboardStats, useCases, useAlerts } from '@/hooks/useData';
import { StatCardsSkeleton, CaseCardSkeleton, AlertItemSkeleton } from '@/components/Skeletons';
import { useToast } from '@/components/Toast';

const activityData = [
  { day: 'Mon', cases: 3, alerts: 1 }, { day: 'Tue', cases: 5, alerts: 2 },
  { day: 'Wed', cases: 2, alerts: 0 }, { day: 'Thu', cases: 7, alerts: 3 },
  { day: 'Fri', cases: 4, alerts: 1 }, { day: 'Sat', cases: 1, alerts: 0 },
  { day: 'Sun', cases: 6, alerts: 2 },
];

export default function DashboardPage() {
  const { t }       = useI18n();
  const { profile } = useAuth();
  const { success, error: toastError } = useToast();
  const [checkingHealth, setCheckingHealth] = useState(false);
  const [healthResult, setHealthResult]     = useState<string | null>(null);

  // ── Real data fetching (falls back to mock in demo) ───────────────────────
  const { data: stats, loading: statsLoading } = useDashboardStats({
    firmId:       profile?.firm_id ?? undefined,
    fallbackData: mockStats,
  });

  const { data: cases, loading: casesLoading } = useCases({
    firmId:       profile?.firm_id ?? undefined,
    fallbackData: mockCases,
  });

  const { data: alerts, loading: alertsLoading } = useAlerts({
    resolved:     false,
    fallbackData: mockAlerts,
  });

  const recentCases  = (cases ?? []).slice(0, 4);
  const recentAlerts = (alerts ?? []).slice(0, 3);

  // ── AI health check ───────────────────────────────────────────────────────
  async function runHealthCheck() {
    if (!cases?.length) { toastError('No active cases to analyze'); return; }
    setCheckingHealth(true);
    setHealthResult(null);
    try {
      const topRiskCase = [...(cases ?? [])].sort((a, b) => b.risk_score - a.risk_score)[0];
      const res = await fetch('/api/ai/analyze', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          caseData: {
            title:                topRiskCase?.title ?? 'Portfolio',
            practice_area:        topRiskCase?.practice_area ?? '',
            status:               topRiskCase?.status ?? 'open',
            days_inactive:        0,
            unanswered_messages:  stats?.pending_messages ?? 0,
            overdue_deadlines:    0,
            open_tasks:           stats?.pending_tasks ?? 0,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setHealthResult(data.summary ?? data.recommendation ?? 'Analysis complete.');
      success('AI analysis complete');
    } catch (err) {
      toastError('Health check failed — please try again');
      setHealthResult(null);
    } finally {
      setCheckingHealth(false);
    }
  }

  const STATS = [
    { label: t.dashboard.activeCases,    key: 'active_cases',     icon: Briefcase,     iconBg: 'bg-blue-100',   iconColor: 'text-blue-600',   border: 'border-blue-100'  },
    { label: t.dashboard.highRiskCases,  key: 'high_risk_cases',  icon: AlertTriangle, iconBg: 'bg-red-100',    iconColor: 'text-red-600',    border: 'border-red-100'   },
    { label: t.dashboard.unreadMessages, key: 'pending_messages', icon: MessageSquare, iconBg: 'bg-violet-100', iconColor: 'text-violet-600', border: 'border-violet-100'},
    { label: t.dashboard.pendingTasks,   key: 'pending_tasks',    icon: CheckSquare,   iconBg: 'bg-amber-100',  iconColor: 'text-amber-600',  border: 'border-amber-100' },
  ];

  return (
    <div className="p-5 lg:p-7 animate-fade-in">

      {/* ── Header ── */}
      <div className="mb-6">
        <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          className="text-2xl lg:text-3xl font-semibold text-stone-900">
          {t.dashboard.greeting}, {profile?.name?.split(' ')[0] ?? 'Counsellor'}
        </h1>
        <p className="text-stone-400 text-sm mt-0.5">
          {statsLoading
            ? 'Loading your dashboard…'
            : `${stats?.high_risk_cases ?? 0} high-risk ${stats?.high_risk_cases === 1 ? 'case' : 'cases'} · ${stats?.pending_messages ?? 0} unread ${stats?.pending_messages === 1 ? 'message' : 'messages'}`
          }
        </p>
      </div>

      {/* ── Stat Cards ── */}
      {statsLoading ? (
        <StatCardsSkeleton count={4} />
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {STATS.map((s, i) => {
            const value = stats?.[s.key as keyof typeof stats] ?? 0;
            return (
              <div key={s.label}
                className={cn('bg-white border rounded-2xl p-4 shadow-sm animate-slide-up', s.border)}
                style={{ animationDelay: `${i * 0.05}s` }}>
                <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center mb-3', s.iconBg)}>
                  <s.icon className={cn('w-4.5 h-4.5', s.iconColor)} />
                </div>
                <div className="text-2xl font-bold text-stone-900 tabular-nums">{value}</div>
                <div className="text-xs text-stone-400 mt-0.5 font-medium">{s.label}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── AI Health Check ── */}
      <div className="bg-gradient-to-br from-stone-900 to-stone-800 rounded-2xl p-5 mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #d4a017, transparent)', filter: 'blur(30px)' }} />
        <div className="relative z-10 flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">AI Negligence Engine</span>
            </div>
            <p className="text-sm text-stone-300 leading-relaxed">
              {healthResult ?? 'Run an immediate AI analysis across your most at-risk cases. The engine checks for inactivity, unanswered messages, and missed deadlines.'}
            </p>
          </div>
          <button onClick={runHealthCheck} disabled={checkingHealth}
            className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-white text-sm font-semibold transition-all shadow-lg shadow-amber-500/25">
            {checkingHealth ? (
              <><RefreshCw className="w-4 h-4 animate-spin" /> Analyzing…</>
            ) : (
              <><Sparkles className="w-4 h-4" /> Run Analysis</>
            )}
          </button>
        </div>
      </div>

      {/* ── Main grid: Cases + Alerts ── */}
      <div className="grid lg:grid-cols-3 gap-5">

        {/* Cases (2/3 width) */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
              className="text-lg font-semibold text-stone-900">{t.dashboard.recentCases}</h2>
            <Link href="/cases" className="text-xs text-amber-600 hover:text-amber-700 font-semibold flex items-center gap-1">
              All cases <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {casesLoading ? (
            <div className="space-y-3">
              {[0,1,2,3].map(i => <CaseCardSkeleton key={i} />)}
            </div>
          ) : recentCases.length === 0 ? (
            <div className="bg-white border border-dashed border-stone-200 rounded-2xl p-10 text-center">
              <div className="text-4xl mb-3">⚖️</div>
              <p className="text-sm font-semibold text-stone-600">No cases yet</p>
              <p className="text-xs text-stone-400 mt-1 mb-4">Create your first case to start monitoring</p>
              <Link href="/cases" className="btn-primary text-xs py-2 px-4">
                <span>+ Create case</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentCases.map((c, i) => {
                const lvl = c.risk_score >= 70 ? 'high' : c.risk_score >= 40 ? 'medium' : 'low';
                return (
                  <Link key={c.id} href={`/cases/${c.id}`}
                    className="bg-white border border-stone-200 rounded-2xl p-4 flex items-center gap-4 hover:border-amber-300 hover:shadow-sm transition-all group shadow-sm animate-slide-up"
                    style={{ animationDelay: `${i * 0.06}s` }}>
                    <div className="relative flex-shrink-0">
                      <div className={cn('w-2.5 h-2.5 rounded-full', riskDot(lvl))} />
                      {lvl === 'high' && <div className={cn('absolute inset-0 rounded-full animate-ping opacity-50', riskDot('high'))} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-stone-800 group-hover:text-amber-700 transition-colors truncate">
                        {c.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-stone-400">{c.practice_area}</span>
                        <span className="text-stone-300">·</span>
                        <span className="text-xs text-stone-400">{c.client_name ?? '—'}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={cn('badge', statusColor(c.status))}>{formatStatus(c.status)}</span>
                      <span className={cn('text-xs font-bold tabular-nums',
                        lvl === 'high' ? 'text-red-600' : lvl === 'medium' ? 'text-amber-600' : 'text-green-600')}>
                        {c.risk_score}
                      </span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-stone-300 group-hover:text-amber-500 transition-colors" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Alerts (1/3 width) */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
              className="text-lg font-semibold text-stone-900">{t.dashboard.aiAlerts}</h2>
            <Link href="/alerts" className="text-xs text-amber-600 hover:text-amber-700 font-semibold flex items-center gap-1">
              All <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {alertsLoading ? (
            <div className="space-y-3">
              {[0,1,2].map(i => <AlertItemSkeleton key={i} />)}
            </div>
          ) : recentAlerts.length === 0 ? (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
              <div className="text-3xl mb-2">✓</div>
              <p className="text-sm font-semibold text-green-800">All clear</p>
              <p className="text-xs text-green-700 mt-1">No active AI alerts</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentAlerts.map((alert, i) => (
                <div key={alert.id}
                  className="bg-white border border-stone-200 rounded-2xl p-4 shadow-sm animate-slide-up"
                  style={{ animationDelay: `${i * 0.07}s` }}>
                  <div className="flex items-start gap-2 mb-2">
                    <span className={cn('text-lg flex-shrink-0',
                      alert.risk_level === 'high' ? '🔴' : alert.risk_level === 'medium' ? '🟡' : '🟢')}>
                      {alert.risk_level === 'high' ? '🔴' : alert.risk_level === 'medium' ? '🟡' : '🟢'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-stone-800 leading-snug truncate">{alert.case_title}</p>
                      <p className="text-[10px] text-stone-500 capitalize mt-0.5">{alert.type?.replace('_', ' ')}</p>
                    </div>
                  </div>
                  <p className="text-xs text-stone-500 leading-relaxed line-clamp-2 mb-3">{alert.description}</p>
                  <Link href="/alerts"
                    className="text-[10px] text-amber-600 hover:text-amber-700 font-semibold transition-colors">
                    Resolve →
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Activity Chart ── */}
      <div className="mt-6 bg-white border border-stone-200 rounded-2xl p-5 shadow-sm">
        <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          className="text-base font-semibold text-stone-900 mb-4">Weekly Activity</h2>
        <ResponsiveContainer width="100%" height={120}>
          <AreaChart data={activityData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="caseGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#d4a017" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#d4a017" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="alertGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#9c9890' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#9c9890' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e8e5df', fontSize: 11 }} />
            <Area type="monotone" dataKey="cases"  name="Case events" stroke="#d4a017" fill="url(#caseGrad)"  strokeWidth={2} dot={false} />
            <Area type="monotone" dataKey="alerts" name="AI alerts"   stroke="#ef4444" fill="url(#alertGrad)" strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

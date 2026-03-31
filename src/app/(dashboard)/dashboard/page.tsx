'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import Link from 'next/link';
import {
  TrendingUp, AlertTriangle, MessageSquare, CheckSquare,
  Briefcase, ChevronRight, Clock, ArrowUpRight, Sparkles, Activity
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { mockStats, mockCases, mockAlerts, mockTasks } from '@/lib/mock-data';
import { cn, riskDot, statusColor, formatStatus, timeAgo, riskColor } from '@/lib/utils';
import { useI18n } from '@/lib/i18n';

const activityData = [
  { day: 'Mon', cases: 3, alerts: 1 }, { day: 'Tue', cases: 5, alerts: 2 },
  { day: 'Wed', cases: 2, alerts: 0 }, { day: 'Thu', cases: 7, alerts: 3 },
  { day: 'Fri', cases: 4, alerts: 1 }, { day: 'Sat', cases: 1, alerts: 0 },
  { day: 'Sun', cases: 6, alerts: 2 },
];

export default function DashboardPage() {
  const { t } = useI18n();
  const [checkingHealth, setCheckingHealth] = useState(false);
  const [healthResult, setHealthResult] = useState<string | null>(null);

  async function runHealthCheck() {
    setCheckingHealth(true);
    await new Promise(r => setTimeout(r, 2000));
    setHealthResult('AI analysis complete. 3 high-risk cases flagged. 1 missed deadline detected. 2 unanswered client messages require immediate attention.');
    setCheckingHealth(false);
  }

  const STATS = [
    { label: t.dashboard.activeCases,    value: 18, icon: Briefcase,     iconBg: 'bg-blue-100',   iconColor: 'text-blue-600',   border: 'border-blue-100' },
    { label: t.dashboard.highRiskCases,  value: 3,  icon: AlertTriangle, iconBg: 'bg-red-100',    iconColor: 'text-red-600',    border: 'border-red-100'  },
    { label: t.dashboard.unreadMessages, value: 7,  icon: MessageSquare, iconBg: 'bg-violet-100', iconColor: 'text-violet-600', border: 'border-violet-100' },
    { label: t.dashboard.pendingTasks,   value: 12, icon: CheckSquare,   iconBg: 'bg-amber-100',  iconColor: 'text-amber-600',  border: 'border-amber-100' },
  ];

  const activeCases   = mockCases.slice(0, 5);
  const recentAlerts  = mockAlerts.filter(a => !a.resolved).slice(0, 3);

  return (
    <div className="p-5 lg:p-7 space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 style={{fontFamily:"'Cormorant Garamond',Georgia,serif"}} className="text-2xl lg:text-3xl font-semibold text-stone-900">
            {t.dashboard.greeting}, Sarah
          </h1>
          <p className="text-stone-500 text-sm mt-0.5">
            You have <span className="text-red-600 font-semibold">3 high-risk cases</span> and{' '}
            <span className="text-violet-600 font-semibold">7 unread messages</span> today.
          </p>
        </div>
        <button onClick={runHealthCheck} disabled={checkingHealth}
          className={cn('flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all duration-300',
            checkingHealth
              ? 'bg-amber-50 border-amber-300 text-amber-700 cursor-not-allowed'
              : 'bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100 shadow-sm'
          )}>
          {checkingHealth ? (
            <><div className="w-3.5 h-3.5 border-2 border-amber-400/40 border-t-amber-600 rounded-full animate-spin" />{t.dashboard.analyzing}</>
          ) : (
            <><Sparkles className="w-3.5 h-3.5" />{t.dashboard.runHealthCheck}</>
          )}
        </button>
      </div>

      {/* AI health result */}
      {healthResult && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3 animate-slide-up shadow-sm">
          <Sparkles className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-xs font-semibold text-amber-700 mb-1">AI Negligence Detection Engine</p>
            <p className="text-sm text-stone-700">{healthResult}</p>
          </div>
          <button onClick={() => setHealthResult(null)} className="text-stone-400 hover:text-stone-600 text-xs">✕</button>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {STATS.map((stat, i) => (
          <div key={stat.label}
            className={cn('card p-4 flex items-start gap-3 animate-slide-up border', stat.border)}
            style={{ animationDelay: `${i * 0.05}s` }}>
            <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0', stat.iconBg)}>
              <stat.icon className={cn('w-4.5 h-4.5', stat.iconColor)} />
            </div>
            <div>
              <div className="text-2xl font-bold text-stone-900 leading-none">{stat.value}</div>
              <div className="text-xs text-stone-500 mt-0.5">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Cases table */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
            <h2 style={{fontFamily:"'Cormorant Garamond',Georgia,serif"}} className="text-lg font-semibold text-stone-900">
              {t.dashboard.activeCases}
            </h2>
            <Link href="/cases" className="text-xs text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1">
              {t.dashboard.viewAll} <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-stone-100">
            {activeCases.map((c, i) => {
              const lvl = c.risk_score >= 70 ? 'high' : c.risk_score >= 40 ? 'medium' : 'low';
              return (
                <Link key={c.id} href={`/cases/${c.id}`}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-stone-50 transition-colors group"
                  style={{ animationDelay: `${i * 0.05}s` }}>
                  <div className="relative flex-shrink-0">
                    <div className={cn('w-2 h-2 rounded-full', riskDot(lvl))} />
                    {lvl === 'high' && <div className={cn('absolute inset-0 rounded-full animate-ping opacity-60', riskDot('high'))} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-stone-800 truncate group-hover:text-amber-700 transition-colors">{c.title}</div>
                    <div className="text-xs text-stone-400 mt-0.5">{c.client_name} · {c.practice_area}</div>
                  </div>
                  <span className={cn('badge text-[10px] hidden sm:inline-flex', statusColor(c.status))}>
                    {formatStatus(c.status)}
                  </span>
                  <div className={cn('text-sm font-bold flex-shrink-0',
                    lvl === 'high' ? 'text-red-600' : lvl === 'medium' ? 'text-amber-600' : 'text-green-600')}>
                    {c.risk_score}
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-stone-300 group-hover:text-amber-500 transition-colors flex-shrink-0" />
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* AI Alerts */}
          <div className="card border-red-100">
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="w-3 h-3 text-red-600" />
                </div>
                <h3 className="text-sm font-semibold text-stone-800">{t.dashboard.aiAlerts}</h3>
              </div>
              <Link href="/alerts" className="text-xs text-red-600 hover:text-red-700 font-medium flex items-center gap-0.5">
                3 {t.dashboard.active} <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="divide-y divide-stone-100">
              {recentAlerts.map(alert => (
                <div key={alert.id} className="px-4 py-3">
                  <div className="flex items-start gap-2 mb-1">
                    <span className={cn('badge text-[10px] mt-0.5', riskColor(alert.risk_level))}>{alert.risk_level}</span>
                    <p className="text-xs font-semibold text-stone-700 flex-1">{alert.case_title}</p>
                  </div>
                  <p className="text-[11px] text-stone-400 line-clamp-2">{alert.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Portfolio health */}
          <div className="card p-4">
            <h3 className="text-sm font-semibold text-stone-800 mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-amber-600" /> {t.dashboard.portfolioHealth}
            </h3>
            <div className="space-y-3">
              {[
                { label: t.dashboard.lowRisk,    value: 55, color: 'bg-green-500',  count: 13 },
                { label: t.dashboard.mediumRisk, value: 30, color: 'bg-amber-500', count: 8 },
                { label: t.dashboard.highRisk,   value: 15, color: 'bg-red-500',   count: 3 },
              ].map(item => (
                <div key={item.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-stone-500">{item.label}</span>
                    <span className="text-stone-700 font-semibold">{item.count} {t.dashboard.cases}</span>
                  </div>
                  <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                    <div className={cn('h-full rounded-full transition-all duration-700', item.color)}
                      style={{ width: `${item.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Activity chart */}
      <div className="card">
        <div className="px-5 py-4 border-b border-stone-100">
          <h2 style={{fontFamily:"'Cormorant Garamond',Georgia,serif"}} className="text-base font-semibold text-stone-900">
            {t.dashboard.weeklyActivity}
          </h2>
          <p className="text-xs text-stone-400 mt-0.5">{t.dashboard.weeklyActivitySub}</p>
        </div>
        <div className="p-4 h-44">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={activityData} margin={{ top:5, right:5, bottom:0, left:-20 }}>
              <defs>
                <linearGradient id="cG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#d4a017" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#d4a017" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="aG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{fontSize:11,fill:'#9c9890'}} axisLine={false} tickLine={false} />
              <YAxis tick={{fontSize:10,fill:'#9c9890'}} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{background:'#fff',border:'1px solid #e8e5df',borderRadius:'10px',fontSize:'12px',color:'#1a1714'}} />
              <Area type="monotone" dataKey="cases"  name={t.dashboard.actions} stroke="#d4a017" strokeWidth={2} fill="url(#cG)" />
              <Area type="monotone" dataKey="alerts" name={t.dashboard.alerts}  stroke="#ef4444" strokeWidth={2} fill="url(#aG)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

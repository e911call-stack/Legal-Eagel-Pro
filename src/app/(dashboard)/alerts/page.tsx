'use client';

import { useState } from 'react';
import { AlertTriangle, CheckCircle, Sparkles, Clock, MessageSquare, Calendar, RefreshCw, ChevronRight, Shield } from 'lucide-react';
import Link from 'next/link';
import { mockAlerts } from '@/lib/mock-data';
import { cn, riskColor, timeAgo } from '@/lib/utils';
import type { AIAlert } from '@/types';
import { useI18n } from '@/lib/i18n';

export default function AlertsPage() {
  const { t } = useI18n();
  const [alerts, setAlerts] = useState(mockAlerts);
  const [running, setRunning]   = useState(false);
  const [filter, setFilter]     = useState<'all' | 'active' | 'resolved'>('active');
  const [lastRun, setLastRun]   = useState('2 hours ago');

  async function runEngine() {
    setRunning(true);
    await new Promise(r => setTimeout(r, 2800));
    setLastRun(t.shared.justNow);
    setRunning(false);
  }

  function resolve(id: string) {
    setAlerts(prev => prev.map(a =>
      a.id === id ? { ...a, resolved: true, resolved_at: new Date().toISOString(), resolved_by: 'Sarah Chen' } : a
    ));
  }

  const filtered = alerts.filter(a =>
    filter === 'all' ? true : filter === 'active' ? !a.resolved : a.resolved
  );

  const activeCount   = alerts.filter(a => !a.resolved).length;
  const resolvedCount = alerts.filter(a =>  a.resolved).length;
  const highCount     = alerts.filter(a => !a.resolved && a.risk_level === 'high').length;

  const TYPE_ICONS: Record<AIAlert['type'], React.ReactNode> = {
    inactivity:         <Clock className="w-4 h-4" />,
    unanswered_message: <MessageSquare className="w-4 h-4" />,
    missed_deadline:    <Calendar className="w-4 h-4" />,
  };

  const TYPE_COLORS: Record<AIAlert['type'], string> = {
    inactivity:         'text-amber-600 bg-amber-100',
    unanswered_message: 'text-violet-600 bg-violet-100',
    missed_deadline:    'text-red-600 bg-red-100',
  };

  const STRIPE_COLORS: Record<string, string> = {
    high:   'bg-gradient-to-r from-red-500 to-red-400',
    medium: 'bg-gradient-to-r from-amber-500 to-amber-400',
    low:    'bg-gradient-to-r from-green-500 to-green-400',
  };

  return (
    <div className="p-5 lg:p-7 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            className="text-2xl lg:text-3xl font-semibold text-stone-900">
            {t.alertsPage.title}
          </h1>
          <p className="text-stone-400 text-sm mt-0.5">
            {t.alertsPage.subtitle(lastRun).replace(lastRun, '')}
            <span className="text-amber-600 font-semibold">{lastRun}</span>
          </p>
        </div>
        <button onClick={runEngine} disabled={running}
          className={cn('flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all duration-300 shadow-sm',
            running
              ? 'bg-amber-50 border-amber-300 text-amber-700 cursor-not-allowed'
              : 'bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100 hover:border-amber-400'
          )}>
          {running
            ? <><div className="w-3.5 h-3.5 border-2 border-amber-400/40 border-t-amber-600 rounded-full animate-spin" />{t.alertsPage.running}</>
            : <><RefreshCw className="w-3.5 h-3.5" />{t.alertsPage.runEngine}</>
          }
        </button>
      </div>

      {/* Engine hero */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-amber-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-amber-800 mb-1">{t.alertsPage.engineTitle}</h3>
            <p className="text-xs text-stone-600 leading-relaxed">{t.alertsPage.engineDesc}</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 mt-4">
          {[
            { label: t.alertsPage.activeAlerts, value: activeCount,   color: 'text-red-600' },
            { label: t.alertsPage.highRisk,     value: highCount,     color: 'text-red-600' },
            { label: t.alertsPage.resolved,     value: resolvedCount, color: 'text-green-600' },
          ].map(s => (
            <div key={s.label} className="bg-white border border-amber-200 rounded-xl p-3 text-center shadow-sm">
              <div className={cn('text-xl font-bold', s.color)}>{s.value}</div>
              <div className="text-[10px] text-stone-400 mt-0.5 font-medium">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-5 bg-white border border-stone-200 rounded-xl p-1 w-fit shadow-sm">
        {(['all', 'active', 'resolved'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={cn(
              'px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 capitalize',
              filter === f ? 'bg-amber-500 text-white shadow-sm' : 'text-stone-500 hover:text-stone-700'
            )}>
            {f === 'all' ? t.alertsPage.all : f === 'active' ? t.alertsPage.active : t.alertsPage.resolvedTab}
            <span className={cn('ml-1.5', filter === f ? 'text-amber-200' : 'text-stone-400')}>
              {f === 'all' ? alerts.length : f === 'active' ? activeCount : resolvedCount}
            </span>
          </button>
        ))}
      </div>

      {/* Alert cards */}
      <div className="space-y-3">
        {filtered.map((alert, i) => (
          <div key={alert.id}
            className={cn('bg-white border rounded-2xl overflow-hidden shadow-sm transition-all duration-200 animate-slide-up',
              alert.resolved ? 'border-stone-200 opacity-60' :
              alert.risk_level === 'high' ? 'border-red-200' :
              alert.risk_level === 'medium' ? 'border-amber-200' : 'border-stone-200'
            )}
            style={{ animationDelay: `${i * 0.05}s` }}>
            {/* Stripe */}
            {!alert.resolved && (
              <div className={cn('h-1', STRIPE_COLORS[alert.risk_level])} />
            )}

            <div className="p-4">
              <div className="flex items-start gap-3">
                <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0',
                  alert.resolved ? 'bg-green-100' : TYPE_COLORS[alert.type].split(' ')[1])}>
                  {alert.resolved
                    ? <CheckCircle className="w-4 h-4 text-green-600" />
                    : <span className={TYPE_COLORS[alert.type].split(' ')[0]}>{TYPE_ICONS[alert.type]}</span>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap mb-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={cn('badge', riskColor(alert.risk_level))}>
                        {t.alertsPage.types[alert.type]}
                      </span>
                      {!alert.resolved && (
                        <span className={cn('badge', riskColor(alert.risk_level))}>{alert.risk_level}</span>
                      )}
                      {alert.resolved && (
                        <span className="badge text-green-700 bg-green-50 border-green-200">Resolved</span>
                      )}
                    </div>
                    <span className="text-xs text-stone-400 flex-shrink-0">{timeAgo(alert.created_at)}</span>
                  </div>
                  <Link href={`/cases/${alert.case_id}`}
                    className="text-sm font-bold text-stone-800 hover:text-amber-700 transition-colors flex items-center gap-1 mb-1.5">
                    {alert.case_title} <ChevronRight className="w-3 h-3" />
                  </Link>
                  <p className="text-xs text-stone-500 leading-relaxed">{alert.description}</p>
                  {alert.resolved && alert.resolved_by && (
                    <p className="text-[11px] text-green-600 mt-1.5 font-medium">
                      ✓ Resolved by {alert.resolved_by} · {alert.resolved_at ? timeAgo(alert.resolved_at) : ''}
                    </p>
                  )}
                </div>
              </div>

              {!alert.resolved && (
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-stone-100">
                  <Link href={`/cases/${alert.case_id}`}
                    className="flex-1 py-1.5 rounded-xl bg-stone-50 hover:bg-stone-100 text-xs text-stone-600 hover:text-stone-800 transition-colors text-center border border-stone-200 font-medium">
                    {t.alertsPage.viewCase}
                  </Link>
                  <button onClick={() => resolve(alert.id)}
                    className="flex-1 py-1.5 rounded-xl bg-green-50 hover:bg-green-100 text-xs text-green-700 transition-colors flex items-center justify-center gap-1.5 border border-green-200 font-semibold">
                    <CheckCircle className="w-3 h-3" /> {t.alertsPage.markResolved}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20">
          <div className="w-14 h-14 rounded-2xl bg-green-50 border border-green-200 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-6 h-6 text-green-600" />
          </div>
          <p className="text-stone-800 font-semibold mb-1">{t.alertsPage.allClear}</p>
          <p className="text-stone-400 text-sm">{t.alertsPage.allClearSub}</p>
        </div>
      )}
    </div>
  );
}

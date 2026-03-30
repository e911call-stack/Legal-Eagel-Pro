'use client';

import { useState } from 'react';
import { Receipt, Plus, Clock, DollarSign, TrendingUp, CheckCircle, Circle } from 'lucide-react';
import { mockTimeEntries, mockCases } from '@/lib/mock-data';
import { cn, formatCurrency, formatMinutes, timeAgo } from '@/lib/utils';
import { useI18n } from '@/lib/i18n';

export default function BillingPage() {
  const { t } = useI18n();
  const [showAdd, setShowAdd]   = useState(false);
  const [filter, setFilter]     = useState<'all' | 'billed' | 'unbilled'>('all');

  const BILLING_SUMMARY = [
    { label: t.billingPage.totalBilled,    value: formatCurrency(4280000), icon: DollarSign,  iconBg: 'bg-amber-100',  iconColor: 'text-amber-600',  valColor: 'text-amber-700'  },
    { label: t.billingPage.hoursLogged,    value: '142h',                  icon: Clock,        iconBg: 'bg-blue-100',   iconColor: 'text-blue-600',   valColor: 'text-blue-700'   },
    { label: t.billingPage.unbilledHours,  value: '28h',                   icon: TrendingUp,   iconBg: 'bg-orange-100', iconColor: 'text-orange-600', valColor: 'text-orange-700' },
    { label: t.billingPage.invoicesPending,value: '3',                     icon: Receipt,      iconBg: 'bg-violet-100', iconColor: 'text-violet-600', valColor: 'text-violet-700' },
  ];

  const entries = filter === 'billed'   ? mockTimeEntries.filter(e => e.is_billed)
                : filter === 'unbilled' ? mockTimeEntries.filter(e => !e.is_billed)
                : mockTimeEntries;

  return (
    <div className="p-5 lg:p-7 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            className="text-2xl lg:text-3xl font-semibold text-stone-900">{t.billingPage.title}</h1>
          <p className="text-stone-400 text-sm mt-0.5">{t.billingPage.subtitle}</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> {t.billingPage.addEntry}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {BILLING_SUMMARY.map((s, i) => (
          <div key={s.label}
            className="bg-white border border-stone-200 rounded-2xl p-4 shadow-sm animate-slide-up"
            style={{ animationDelay: `${i * 0.05}s` }}>
            <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center mb-3', s.iconBg)}>
              <s.icon className={cn('w-4.5 h-4.5', s.iconColor)} />
            </div>
            <div className={cn('text-xl font-bold', s.valColor)}>{s.value}</div>
            <div className="text-xs text-stone-400 mt-0.5 font-medium">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Budget overview */}
      <div className="bg-white border border-stone-200 rounded-2xl p-5 mb-5 shadow-sm">
        <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          className="text-base font-semibold text-stone-900 mb-4">{t.billingPage.budgetOverview}</h2>
        <div className="space-y-4">
          {mockCases.filter(c => c.budget).map(c => {
            const spent = c.billing_model === 'hourly' ? Math.floor(c.budget! * 0.65) : Math.floor(c.budget! * 0.72);
            const pct   = Math.round((spent / c.budget!) * 100);
            const barColor = pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-500' : 'bg-green-500';
            return (
              <div key={c.id}>
                <div className="flex justify-between items-center mb-1.5">
                  <div>
                    <span className="text-sm text-stone-800 font-semibold">{c.title}</span>
                    <span className="text-xs text-stone-400 ml-2">{c.billing_model === 'hourly' ? t.cases.hourly : t.cases.flatFee}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-stone-900 font-bold">{formatCurrency(spent)}</span>
                    <span className="text-xs text-stone-400"> / {formatCurrency(c.budget!)}</span>
                  </div>
                </div>
                <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                  <div className={cn('h-full rounded-full transition-all duration-700', barColor)}
                    style={{ width: `${pct}%` }} />
                </div>
                <div className="flex justify-between text-[10px] mt-1">
                  <span className="text-stone-400">{pct}% {t.billingPage.used}</span>
                  <span className="text-stone-400">{formatCurrency(c.budget! - spent)} {t.billingPage.remaining}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Time Entries */}
      <div className="bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
          <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            className="text-base font-semibold text-stone-900">{t.billingPage.timeEntries}</h2>
          <div className="flex gap-1 bg-stone-50 border border-stone-200 rounded-lg p-0.5">
            {(['all', 'billed', 'unbilled'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={cn('px-3 py-1 rounded-md text-xs font-semibold transition-all duration-200 capitalize',
                  filter === f ? 'bg-white shadow-sm text-stone-800 border border-stone-200' : 'text-stone-400 hover:text-stone-600')}>
                {f === 'all' ? t.billingPage.all : f === 'billed' ? t.billingPage.billed : t.billingPage.unbilled}
              </button>
            ))}
          </div>
        </div>
        <div className="divide-y divide-stone-100">
          {entries.map((entry, i) => (
            <div key={entry.id}
              className="px-5 py-4 flex items-start gap-4 hover:bg-stone-50 transition-colors animate-slide-up"
              style={{ animationDelay: `${i * 0.05}s` }}>
              <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5',
                entry.is_billed ? 'bg-green-100' : 'bg-amber-100')}>
                {entry.is_billed
                  ? <CheckCircle className="w-4 h-4 text-green-600" />
                  : <Circle className="w-4 h-4 text-amber-600" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-stone-800">{entry.description}</p>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className="text-xs text-stone-400">{entry.case_title}</span>
                  <span className="text-stone-300">·</span>
                  <span className="text-xs text-stone-400">{entry.lawyer_name}</span>
                  <span className="text-stone-300">·</span>
                  <span className="text-xs text-stone-400">{timeAgo(entry.started_at)}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                <div className="flex items-center gap-1.5 text-sm font-bold text-stone-800">
                  <Clock className="w-3.5 h-3.5 text-stone-400" />
                  {formatMinutes(entry.duration_minutes)}
                </div>
                <span className={cn('text-[10px] px-2 py-0.5 rounded-full border font-semibold',
                  entry.is_billed
                    ? 'text-green-700 bg-green-50 border-green-200'
                    : 'text-amber-700 bg-amber-50 border-amber-200')}>
                  {entry.is_billed ? t.billingPage.billedLabel : t.billingPage.unbilledLabel}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Entry Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-2xl p-6 w-full max-w-md shadow-2xl animate-slide-up">
            <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
              className="text-xl font-semibold text-stone-900 mb-4">{t.billingPage.addEntry}</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-stone-500 mb-1.5 font-semibold uppercase tracking-wide">{t.cases.title}</label>
                <select className="input-field">
                  {mockCases.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-stone-500 mb-1.5 font-semibold uppercase tracking-wide">Start Time</label>
                  <input type="datetime-local" className="input-field" />
                </div>
                <div>
                  <label className="block text-xs text-stone-500 mb-1.5 font-semibold uppercase tracking-wide">End Time</label>
                  <input type="datetime-local" className="input-field" />
                </div>
              </div>
              <div>
                <label className="block text-xs text-stone-500 mb-1.5 font-semibold uppercase tracking-wide">Description</label>
                <textarea rows={3} className="input-field resize-none" placeholder="Describe the work performed…" />
              </div>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded accent-amber-500" />
                <span className="text-sm text-stone-600 font-medium">Mark as billed</span>
              </label>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowAdd(false)} className="btn-ghost flex-1 justify-center">{t.cases.cancel}</button>
              <button onClick={() => setShowAdd(false)} className="btn-primary flex-1 justify-center">Save Entry</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

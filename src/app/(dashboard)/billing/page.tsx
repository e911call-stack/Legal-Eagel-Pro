'use client';

import { useState } from 'react';
import {
  Receipt, Plus, Clock, DollarSign, TrendingUp,
  CheckCircle, Circle, Loader2, Tag, BarChart3
} from 'lucide-react';
import { mockTimeEntries, mockCases } from '@/lib/mock-data';
import { cn, formatCurrency, formatMinutes, timeAgo } from '@/lib/utils';
import { useI18n } from '@/lib/i18n';

// ─── Mock flat-fee case data (mirrors flat_fee_cases table) ───────────────────
const FLAT_FEE_DATA: Record<string, { total_fee_cents: number; already_billed_cents: number }> = {
  'case-2': { total_fee_cents: 800000,  already_billed_cents: 576000  }, // Al-Rashid Family Trust
  'case-3': { total_fee_cents: 350000,  already_billed_cents: 175000  }, // Rodriguez Immigration
};

const BILLING_SUMMARY = [
  { key: 'totalBilled',     icon: DollarSign,  iconBg: 'bg-amber-100',  iconColor: 'text-amber-600',  valColor: 'text-amber-700',  value: formatCurrency(4280000) },
  { key: 'hoursLogged',     icon: Clock,        iconBg: 'bg-blue-100',   iconColor: 'text-blue-600',   valColor: 'text-blue-700',   value: '142h' },
  { key: 'unbilledHours',   icon: TrendingUp,   iconBg: 'bg-orange-100', iconColor: 'text-orange-600', valColor: 'text-orange-700', value: '28h'  },
  { key: 'invoicesPending', icon: Receipt,      iconBg: 'bg-violet-100', iconColor: 'text-violet-600', valColor: 'text-violet-700', value: '3'    },
];

type BillingTab = 'overview' | 'hourly' | 'flat-fee';

export default function BillingPage() {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<BillingTab>('overview');
  const [showAdd,   setShowAdd]   = useState(false);
  const [filter,    setFilter]    = useState<'all' | 'billed' | 'unbilled'>('all');

  // Cases split by billing model
  const hourlyCases  = mockCases.filter(c => c.billing_model === 'hourly'   && c.budget);
  const flatFeeCases = mockCases.filter(c => c.billing_model === 'flat_fee' && c.budget);

  const entries = filter === 'billed'   ? mockTimeEntries.filter(e => e.is_billed)
                : filter === 'unbilled' ? mockTimeEntries.filter(e => !e.is_billed)
                : mockTimeEntries;

  // ── Flat-fee logic ──────────────────────────────────────────────────────────
  const totalFlatFee    = flatFeeCases.reduce((s, c) => s + (FLAT_FEE_DATA[c.id]?.total_fee_cents    ?? 0), 0);
  const totalFlatBilled = flatFeeCases.reduce((s, c) => s + (FLAT_FEE_DATA[c.id]?.already_billed_cents ?? 0), 0);

  const inputCls = 'w-full bg-white border border-stone-200 rounded-xl px-3 py-2.5 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all duration-200';

  return (
    <div className="p-5 lg:p-7 animate-fade-in">

      {/* ── Header ── */}
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

      {/* ── Summary stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {BILLING_SUMMARY.map((s, i) => (
          <div key={s.key}
            className="bg-white border border-stone-200 rounded-2xl p-4 shadow-sm animate-slide-up"
            style={{ animationDelay: `${i * 0.05}s` }}>
            <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center mb-3', s.iconBg)}>
              <s.icon className={cn('w-4.5 h-4.5', s.iconColor)} />
            </div>
            <div className={cn('text-xl font-bold', s.valColor)}>{s.value}</div>
            <div className="text-xs text-stone-400 mt-0.5 font-medium">
              {t.billingPage[s.key as keyof typeof t.billingPage] as string}
            </div>
          </div>
        ))}
      </div>

      {/* ── Billing model tabs ── */}
      <div className="flex gap-1 bg-white border border-stone-200 rounded-xl p-1 w-fit mb-6 shadow-sm">
        {([
          { key: 'overview' as BillingTab, icon: BarChart3, label: 'Overview' },
          { key: 'hourly'   as BillingTab, icon: Clock,     label: 'Hourly Cases' },
          { key: 'flat-fee' as BillingTab, icon: Tag,       label: 'Flat-Fee Cases' },
        ]).map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200',
              activeTab === tab.key
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-stone-500 hover:text-stone-700'
            )}>
            <tab.icon className="w-3.5 h-3.5" /> {tab.label}
          </button>
        ))}
      </div>

      {/* ══════════════════ OVERVIEW TAB ══════════════════ */}
      {activeTab === 'overview' && (
        <div className="space-y-5">
          <div className="bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-stone-100">
              <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                className="text-base font-semibold text-stone-900">{t.billingPage.budgetOverview}</h2>
            </div>
            <div className="divide-y divide-stone-50">
              {mockCases.filter(c => c.budget).map(c => {
                const isFlat = c.billing_model === 'flat_fee';
                const flatData = FLAT_FEE_DATA[c.id];
                const spent = isFlat
                  ? (flatData?.already_billed_cents ?? Math.floor(c.budget! * 0.72))
                  : Math.floor(c.budget! * 0.65);
                const pct = Math.round((spent / c.budget!) * 100);
                const barColor = pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-500' : 'bg-green-500';

                return (
                  <div key={c.id} className="px-5 py-4">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-stone-800">{c.title}</span>
                        <span className={cn(
                          'text-[9px] font-bold px-1.5 py-0.5 rounded-full border',
                          isFlat
                            ? 'text-violet-700 bg-violet-50 border-violet-200'
                            : 'text-blue-700 bg-blue-50 border-blue-200'
                        )}>
                          {isFlat ? 'FLAT FEE' : 'HOURLY'}
                        </span>
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
                    <div className="flex justify-between text-[10px] mt-1.5">
                      <span className="text-stone-400">{pct}% {t.billingPage.used}</span>
                      <span className={cn('font-semibold', pct >= 90 ? 'text-red-600' : pct >= 70 ? 'text-amber-600' : 'text-green-600')}>
                        {formatCurrency(c.budget! - spent)} {t.billingPage.remaining}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════ HOURLY TAB ══════════════════ */}
      {activeTab === 'hourly' && (
        <div className="space-y-5">
          {/* Per-case budget bars */}
          <div className="bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
              <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                className="text-base font-semibold text-stone-900">Hourly Cases — Budget Tracking</h2>
              <span className="text-xs text-stone-400">{hourlyCases.length} cases</span>
            </div>
            <div className="divide-y divide-stone-50">
              {hourlyCases.map(c => {
                const spent = Math.floor(c.budget! * 0.65);
                const pct   = Math.round((spent / c.budget!) * 100);
                const caseEntries = mockTimeEntries.filter(e => e.case_id === c.id);
                const totalMin = caseEntries.reduce((s, e) => s + e.duration_minutes, 0);
                return (
                  <div key={c.id} className="px-5 py-4">
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <span className="text-sm font-semibold text-stone-800">{c.title}</span>
                        <div className="text-xs text-stone-400 mt-0.5">
                          {formatMinutes(totalMin)} logged · {caseEntries.filter(e => e.is_billed).length}/{caseEntries.length} entries billed
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-stone-900">{formatCurrency(spent)}</div>
                        <div className="text-xs text-stone-400">of {formatCurrency(c.budget!)}</div>
                      </div>
                    </div>
                    <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                      <div className={cn('h-full rounded-full', pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-500' : 'bg-green-500')}
                        style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Time entries */}
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
              {entries
                .filter(e => hourlyCases.some(c => c.id === e.case_id))
                .map((entry, i) => (
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
              {entries.filter(e => hourlyCases.some(c => c.id === e.case_id)).length === 0 && (
                <div className="text-center py-10 text-stone-400 text-sm">No time entries for hourly cases.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════ FLAT-FEE TAB ══════════════════ */}
      {activeTab === 'flat-fee' && (
        <div className="space-y-4">
          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-violet-50 border border-violet-200 rounded-2xl p-4 text-center">
              <div className="text-xl font-bold text-violet-700">{flatFeeCases.length}</div>
              <div className="text-xs text-stone-400 mt-0.5">Flat-Fee Cases</div>
            </div>
            <div className="bg-white border border-stone-200 rounded-2xl p-4 text-center shadow-sm">
              <div className="text-xl font-bold text-stone-800">{formatCurrency(totalFlatFee)}</div>
              <div className="text-xs text-stone-400 mt-0.5">Total Contracted</div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
              <div className="text-xl font-bold text-green-700">{formatCurrency(totalFlatBilled)}</div>
              <div className="text-xs text-stone-400 mt-0.5">Total Recognised</div>
            </div>
          </div>

          {/* Per flat-fee case cards */}
          {flatFeeCases.map((c, i) => {
            const data   = FLAT_FEE_DATA[c.id];
            const total  = data?.total_fee_cents    ?? c.budget ?? 0;
            const billed = data?.already_billed_cents ?? Math.floor(total * 0.5);
            const pct    = Math.round((billed / total) * 100);
            const remaining = total - billed;

            return (
              <div key={c.id}
                className="bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden animate-slide-up"
                style={{ animationDelay: `${i * 0.08}s` }}>
                {/* Header stripe */}
                <div className="h-1 bg-gradient-to-r from-violet-500 to-violet-400" />

                <div className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="badge text-[9px] text-violet-700 bg-violet-50 border-violet-200 font-bold">FLAT FEE</span>
                        <span className="text-xs text-stone-400">{c.practice_area}</span>
                      </div>
                      <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                        className="text-lg font-semibold text-stone-900">{c.title}</h3>
                      <p className="text-xs text-stone-400 mt-0.5">Client: {c.client_name} · Attorney: {c.lawyer_name}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-2xl font-bold text-stone-900">{formatCurrency(billed)}</div>
                      <div className="text-xs text-stone-400">of {formatCurrency(total)} total</div>
                    </div>
                  </div>

                  {/* Revenue recognition bar */}
                  <div className="mb-1">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-stone-500 font-medium">Revenue recognised</span>
                      <span className="font-bold text-stone-700">{pct}%</span>
                    </div>
                    <div className="h-3 bg-stone-100 rounded-full overflow-hidden relative">
                      <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-violet-400 transition-all duration-700"
                        style={{ width: `${pct}%` }} />
                    </div>
                  </div>

                  {/* Metrics row */}
                  <div className="grid grid-cols-3 gap-3 mt-4">
                    <div className="bg-stone-50 rounded-xl p-3 text-center border border-stone-100">
                      <div className="text-sm font-bold text-violet-700">{formatCurrency(billed)}</div>
                      <div className="text-[9px] text-stone-400 mt-0.5 font-medium uppercase tracking-wide">Billed</div>
                    </div>
                    <div className="bg-stone-50 rounded-xl p-3 text-center border border-stone-100">
                      <div className="text-sm font-bold text-green-700">{formatCurrency(remaining)}</div>
                      <div className="text-[9px] text-stone-400 mt-0.5 font-medium uppercase tracking-wide">Remaining</div>
                    </div>
                    <div className="bg-stone-50 rounded-xl p-3 text-center border border-stone-100">
                      <div className="text-sm font-bold text-stone-800">{formatCurrency(total)}</div>
                      <div className="text-[9px] text-stone-400 mt-0.5 font-medium uppercase tracking-wide">Contract</div>
                    </div>
                  </div>

                  {/* Update recognised amount */}
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-stone-100">
                    <span className="text-xs text-stone-500 font-medium flex-shrink-0">Update recognised:</span>
                    <input type="range" min="0" max={total} step={total / 10}
                      defaultValue={billed}
                      className="flex-1 accent-violet-500 cursor-pointer h-1.5"
                      title="Drag to update recognised amount" />
                    <button className="text-xs text-violet-600 hover:text-violet-700 font-semibold whitespace-nowrap transition-colors">
                      Save
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {flatFeeCases.length === 0 && (
            <div className="text-center py-16 text-stone-400 text-sm">
              No flat-fee cases found. Create a new case with the "Flat Fee" billing model.
            </div>
          )}
        </div>
      )}

      {/* ── Add Time Entry Modal ── */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-2xl p-6 w-full max-w-md shadow-2xl animate-slide-up">
            <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
              className="text-xl font-semibold text-stone-900 mb-4">{t.billingPage.addEntry}</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-stone-500 mb-1.5 font-semibold uppercase tracking-wide">Case</label>
                <select className={inputCls}>
                  {mockCases.filter(c => c.billing_model === 'hourly').map(c =>
                    <option key={c.id} value={c.id}>{c.title}</option>
                  )}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-stone-500 mb-1.5 font-semibold uppercase tracking-wide">Start</label>
                  <input type="datetime-local" className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs text-stone-500 mb-1.5 font-semibold uppercase tracking-wide">End</label>
                  <input type="datetime-local" className={inputCls} />
                </div>
              </div>
              <div>
                <label className="block text-xs text-stone-500 mb-1.5 font-semibold uppercase tracking-wide">Description</label>
                <textarea rows={3} className={inputCls + ' resize-none'} placeholder="Describe the work…" />
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

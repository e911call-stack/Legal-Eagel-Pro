'use client';

import { DollarSign, Clock, Info } from 'lucide-react';
import { mockCases, mockTimeEntries } from '@/lib/mock-data';
import { cn, formatCurrency } from '@/lib/utils';

const CLIENT_CASE_IDS = ['case-1', 'case-3'];

export default function ClientBillingPage() {
  const myCases = mockCases.filter(c => CLIENT_CASE_IDS.includes(c.id) && c.budget);

  const totalBudget  = myCases.reduce((s, c) => s + (c.budget ?? 0), 0);
  const totalSpent   = myCases.reduce((s, c) => s + Math.floor((c.budget ?? 0) * (c.billing_model === 'hourly' ? 0.65 : 0.72)), 0);
  const totalPercent = Math.round((totalSpent / totalBudget) * 100);

  return (
    <div className="p-5 lg:p-7 animate-fade-in">
      <div className="mb-6">
        <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          className="text-2xl lg:text-3xl font-semibold text-stone-900">Billing Overview</h1>
        <p className="text-stone-400 text-sm mt-0.5">
          Your billing summary across all active cases
        </p>
      </div>

      {/* Transparency notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-5 flex items-start gap-3">
        <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-stone-600">
          This is a transparency view of your billing. For detailed invoices or billing questions, please contact your attorney directly.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-sm">
          <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center mb-3">
            <DollarSign className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl font-bold text-amber-700">{formatCurrency(totalSpent)}</div>
          <div className="text-xs text-stone-400 mt-0.5">Total billed to date</div>
        </div>
        <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-sm">
          <div className="w-8 h-8 rounded-xl bg-stone-100 flex items-center justify-center mb-3">
            <Clock className="w-4 h-4 text-stone-600" />
          </div>
          <div className="text-xl font-bold text-stone-700">{formatCurrency(totalBudget - totalSpent)}</div>
          <div className="text-xs text-stone-400 mt-0.5">Remaining budget</div>
        </div>
      </div>

      {/* Per-case breakdown */}
      <div className="space-y-4">
        {myCases.map(c => {
          const spent   = Math.floor((c.budget ?? 0) * (c.billing_model === 'hourly' ? 0.65 : 0.72));
          const pct     = Math.round((spent / (c.budget ?? 1)) * 100);
          const barColor = pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-500' : 'bg-green-500';

          // Client-visible time entries for this case (billed ones only)
          const entries = mockTimeEntries.filter(e => e.case_id === c.id && e.is_billed);

          return (
            <div key={c.id} className="bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-5 border-b border-stone-100">
                <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                  className="text-lg font-semibold text-stone-900 mb-3">{c.title}</h3>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-stone-700 font-semibold">{formatCurrency(spent)}</span>
                  <span className="text-sm text-stone-400">of <span className="font-semibold text-stone-600">{formatCurrency(c.budget!)}</span> cap</span>
                </div>
                <div className="h-3 bg-stone-100 rounded-full overflow-hidden">
                  <div className={cn('h-full rounded-full transition-all duration-700', barColor)}
                    style={{ width: `${pct}%` }} />
                </div>
                <div className="flex justify-between text-[10px] mt-1.5">
                  <span className="text-stone-400 font-medium">{pct}% used</span>
                  <span className={cn('font-semibold', pct >= 90 ? 'text-red-600' : pct >= 70 ? 'text-amber-600' : 'text-green-600')}>
                    {formatCurrency(c.budget! - spent)} remaining
                  </span>
                </div>
                <div className="mt-2 text-xs text-stone-400">
                  Billing model: <span className="font-medium text-stone-600">
                    {c.billing_model === 'hourly' ? 'Hourly rate' : 'Flat fee'}
                  </span>
                </div>
              </div>

              {/* Itemized entries */}
              {entries.length > 0 && (
                <div className="divide-y divide-stone-50">
                  <div className="px-5 py-2 bg-stone-50">
                    <p className="text-[10px] text-stone-500 font-semibold uppercase tracking-wide">Billed Activity</p>
                  </div>
                  {entries.map(entry => (
                    <div key={entry.id} className="px-5 py-3 flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-stone-700 truncate">{entry.description}</p>
                        <p className="text-[10px] text-stone-400 mt-0.5">{entry.lawyer_name}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs font-bold text-stone-800">
                          {Math.floor(entry.duration_minutes / 60)}h {entry.duration_minutes % 60}m
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

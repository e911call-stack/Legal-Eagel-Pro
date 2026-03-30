'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Search, ArrowUpRight } from 'lucide-react';
import { mockCases } from '@/lib/mock-data';
import { cn, riskDot, riskColor, statusColor, formatStatus, timeAgo } from '@/lib/utils';
import { useI18n } from '@/lib/i18n';

export default function CasesPage() {
  const { t } = useI18n();
  const [search, setSearch]         = useState('');
  const [statusFilter, setStatus]   = useState('all');
  const [riskFilter, setRisk]       = useState('all');
  const [showNewCase, setNewCase]   = useState(false);

  const STATUS_FILTERS = [
    { label: t.cases.allCases,   value: 'all' },
    { label: t.shared.status.open,        value: 'open' },
    { label: t.shared.status.pre_filing,  value: 'pre_filing' },
    { label: t.shared.status.in_court,    value: 'in_court' },
    { label: t.shared.status.closed,      value: 'closed' },
  ];

  const filtered = mockCases.filter(c => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.client_name?.toLowerCase().includes(search.toLowerCase()) ||
      c.practice_area.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchRisk =
      riskFilter === 'all' ||
      (riskFilter === 'high'   && c.risk_score >= 70) ||
      (riskFilter === 'medium' && c.risk_score >= 40 && c.risk_score < 70) ||
      (riskFilter === 'low'    && c.risk_score < 40);
    return matchSearch && matchStatus && matchRisk;
  });

  return (
    <div className="p-5 lg:p-7 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            className="text-2xl lg:text-3xl font-semibold text-stone-900">
            {t.cases.title}
          </h1>
          <p className="text-stone-400 text-sm mt-0.5">
            {t.cases.subtitle(mockCases.length, mockCases.filter(c => c.status !== 'closed').length)}
          </p>
        </div>
        <button onClick={() => setNewCase(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> {t.cases.newCase}
        </button>
      </div>

      {/* Search + filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder={t.cases.searchPlaceholder} className="input-field pl-9" />
        </div>
        <div className="flex gap-2">
          <select value={statusFilter} onChange={e => setStatus(e.target.value)}
            className="input-field w-auto cursor-pointer">
            {STATUS_FILTERS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
          </select>
          <select value={riskFilter} onChange={e => setRisk(e.target.value)}
            className="input-field w-auto cursor-pointer">
            <option value="all">{t.cases.allRisk}</option>
            <option value="high">{t.cases.highRisk}</option>
            <option value="medium">{t.cases.mediumRisk}</option>
            <option value="low">{t.cases.lowRisk}</option>
          </select>
        </div>
      </div>

      {/* Status pills */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {STATUS_FILTERS.map(f => (
          <button key={f.value} onClick={() => setStatus(f.value)}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-semibold border-2 whitespace-nowrap transition-all duration-200',
              statusFilter === f.value
                ? 'bg-amber-50 border-amber-400 text-amber-700'
                : 'border-stone-200 text-stone-500 hover:border-stone-300 hover:text-stone-700 bg-white'
            )}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Cases grid */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((c, i) => {
          const lvl = c.risk_score >= 70 ? 'high' : c.risk_score >= 40 ? 'medium' : 'low';
          return (
            <Link key={c.id} href={`/cases/${c.id}`}
              className="bg-white border border-stone-200 rounded-2xl p-5 hover:border-amber-300 hover:shadow-md transition-all duration-200 group flex flex-col shadow-sm animate-slide-up"
              style={{ animationDelay: `${i * 0.04}s` }}>
              {/* Header row */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <div className={cn('w-2.5 h-2.5 rounded-full', riskDot(lvl))} />
                    {lvl === 'high' && (
                      <div className={cn('absolute inset-0 rounded-full animate-ping opacity-50', riskDot('high'))} />
                    )}
                  </div>
                  <span className={cn('badge', riskColor(lvl))}>{lvl} risk</span>
                </div>
                <span className={cn('badge', statusColor(c.status))}>{formatStatus(c.status)}</span>
              </div>

              {/* Title */}
              <h3 className="text-sm font-bold text-stone-800 group-hover:text-amber-700 transition-colors leading-snug mb-1">
                {c.title}
              </h3>
              <p className="text-xs text-stone-400 mb-4">{c.practice_area}</p>

              {/* Meta */}
              <div className="space-y-1.5 mb-4 flex-1">
                <div className="flex justify-between text-xs">
                  <span className="text-stone-400">{t.cases.client}</span>
                  <span className="text-stone-600 font-medium">{c.client_name}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-stone-400">{t.cases.attorney}</span>
                  <span className="text-stone-600 font-medium">{c.lawyer_name}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-stone-400">{t.cases.lastActivity}</span>
                  <span className="text-stone-500">{timeAgo(c.last_activity!)}</span>
                </div>
              </div>

              {/* Risk bar */}
              <div>
                <div className="flex justify-between text-[10px] mb-1">
                  <span className="text-stone-400 font-medium">{t.cases.riskScore}</span>
                  <span className={cn('font-bold',
                    lvl === 'high' ? 'text-red-600' : lvl === 'medium' ? 'text-amber-600' : 'text-green-600')}>
                    {c.risk_score}/100
                  </span>
                </div>
                <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                  <div className={cn('h-full rounded-full transition-all duration-700',
                    lvl === 'high' ? 'bg-red-500' : lvl === 'medium' ? 'bg-amber-500' : 'bg-green-500')}
                    style={{ width: `${c.risk_score}%` }} />
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-end">
                <span className="text-xs text-amber-600 group-hover:text-amber-700 flex items-center gap-1 font-semibold transition-colors">
                  {t.cases.viewCase} <ArrowUpRight className="w-3 h-3" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20">
          <p className="text-stone-400 text-sm">No cases match your filters.</p>
        </div>
      )}

      {/* New Case Modal */}
      {showNewCase && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-2xl p-6 w-full max-w-md shadow-2xl animate-slide-up">
            <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
              className="text-xl font-semibold text-stone-900 mb-4">{t.cases.createCase}</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-stone-500 mb-1.5 font-semibold uppercase tracking-wide">{t.cases.caseTitle} *</label>
                <input className="input-field" placeholder={t.cases.caseTitlePlaceholder} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-stone-500 mb-1.5 font-semibold uppercase tracking-wide">{t.cases.clientName}</label>
                  <input className="input-field" placeholder="Full name" />
                </div>
                <div>
                  <label className="block text-xs text-stone-500 mb-1.5 font-semibold uppercase tracking-wide">{t.cases.clientEmail}</label>
                  <input className="input-field" placeholder="client@email.com" type="email" />
                </div>
              </div>
              <div>
                <label className="block text-xs text-stone-500 mb-1.5 font-semibold uppercase tracking-wide">{t.cases.practiceArea}</label>
                <select className="input-field">
                  {['Civil Litigation','Family Law','Immigration','Estate Planning','Criminal Defense','IP & Technology','Real Estate','Corporate'].map(a => (
                    <option key={a}>{a}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-stone-500 mb-1.5 font-semibold uppercase tracking-wide">{t.cases.billingModel}</label>
                  <select className="input-field">
                    <option value="hourly">{t.cases.hourly}</option>
                    <option value="flat_fee">{t.cases.flatFee}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-stone-500 mb-1.5 font-semibold uppercase tracking-wide">{t.cases.budget}</label>
                  <input className="input-field" placeholder="10000" type="number" />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setNewCase(false)} className="btn-ghost flex-1 justify-center">{t.cases.cancel}</button>
              <button onClick={() => setNewCase(false)} className="btn-primary flex-1 justify-center">{t.cases.create}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

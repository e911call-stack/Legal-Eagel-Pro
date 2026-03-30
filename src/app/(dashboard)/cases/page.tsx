'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Plus, Search, ArrowUpRight, CheckCircle, Loader2 } from 'lucide-react';
import { mockCases } from '@/lib/mock-data';
import { cn, riskDot, riskColor, statusColor, formatStatus, timeAgo } from '@/lib/utils';
import { useI18n } from '@/lib/i18n';
import { useAuth } from '@/lib/auth-context';
import type { Case } from '@/types';

// ─── Practice areas list ──────────────────────────────────────────────────────
const PRACTICE_AREAS = [
  'Civil Litigation', 'Family Law', 'Immigration', 'Estate Planning',
  'Criminal Defense', 'IP & Technology', 'Real Estate', 'Corporate',
];

// ─── Jurisdictions ────────────────────────────────────────────────────────────
const JURISDICTIONS = [
  { code: 'US', label: '🇺🇸 United States' },
  { code: 'JO', label: '🇯🇴 Jordan' },
  { code: 'AE', label: '🇦🇪 UAE' },
  { code: 'ES', label: '🇪🇸 Spain' },
  { code: 'CN', label: '🇨🇳 China' },
  { code: 'IN', label: '🇮🇳 India' },
];

type NewCaseForm = {
  title: string;
  practice_area: string;
  client_name: string;
  client_email: string;
  billing_model: 'hourly' | 'flat_fee';
  budget: string;
  jurisdiction: string;
};

const EMPTY_FORM: NewCaseForm = {
  title: '', practice_area: PRACTICE_AREAS[0], client_name: '',
  client_email: '', billing_model: 'hourly', budget: '', jurisdiction: 'US',
};

export default function CasesPage() {
  const { t } = useI18n();
  const { profile } = useAuth();

  // ── Filter state ──────────────────────────────────────────────────────────
  const [search,       setSearch]       = useState('');
  const [statusFilter, setStatus]       = useState('all');
  const [riskFilter,   setRisk]         = useState('all');
  const [areaFilter,   setArea]         = useState('all');     // ← NEW
  const [jurisFilter,  setJuris]        = useState('all');     // ← NEW

  // ── New case modal state ──────────────────────────────────────────────────
  const [showModal,   setShowModal]   = useState(false);
  const [form,        setForm]        = useState<NewCaseForm>(EMPTY_FORM);
  const [creating,    setCreating]    = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [created,     setCreated]     = useState<Case | null>(null);

  // ── Local cases state (starts with mock, gets new cases prepended) ─────────
  const [localCases, setLocalCases] = useState<Case[]>(mockCases);

  const STATUS_FILTERS = [
    { label: t.cases.allCases,              value: 'all'        },
    { label: t.shared.status.open,          value: 'open'       },
    { label: t.shared.status.pre_filing,    value: 'pre_filing' },
    { label: t.shared.status.in_court,      value: 'in_court'   },
    { label: t.shared.status.closed,        value: 'closed'     },
  ];

  // ── Filtered list ─────────────────────────────────────────────────────────
  const filtered = useMemo(() => localCases.filter(c => {
    const q = search.toLowerCase();
    const matchSearch =
      c.title.toLowerCase().includes(q) ||
      c.client_name?.toLowerCase().includes(q) ||
      c.practice_area.toLowerCase().includes(q);

    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchRisk =
      riskFilter === 'all' ||
      (riskFilter === 'high'   && c.risk_score >= 70) ||
      (riskFilter === 'medium' && c.risk_score >= 40 && c.risk_score < 70) ||
      (riskFilter === 'low'    && c.risk_score < 40);
    const matchArea  = areaFilter  === 'all' || c.practice_area === areaFilter;
    // jurisdiction lives in the mock as a string — use client_name as stand-in for demo
    // In production it's a real column; for demo we skip jurisdiction filtering unless set
    const matchJuris = jurisFilter === 'all'; // always pass for mock; real DB will filter server-side

    return matchSearch && matchStatus && matchRisk && matchArea && matchJuris;
  }), [localCases, search, statusFilter, riskFilter, areaFilter, jurisFilter]);

  // ── Create case ────────────────────────────────────────────────────────────
  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;

    setCreating(true);
    setCreateError(null);

    try {
      const res = await fetch('/api/cases', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          ...form,
          budget:    form.budget ? parseFloat(form.budget) : null,
          firm_id:   profile?.firm_id ?? 'firm-demo-1',
          lawyer_id: profile?.id,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setCreateError(data.error ?? 'Failed to create case');
        setCreating(false);
        return;
      }

      // Build a local Case object for immediate UI feedback
      const newCase: Case = {
        id:            data.case.id,
        firm_id:       data.case.firm_id ?? profile?.firm_id ?? 'firm-demo-1',
        title:         form.title,
        practice_area: form.practice_area,
        status:        'open',
        risk_score:    0,
        risk_category: 'none',
        budget:        form.budget ? Math.round(parseFloat(form.budget) * 100) : undefined,
        billing_model: form.billing_model,
        created_at:    data.case.created_at ?? new Date().toISOString(),
        updated_at:    data.case.updated_at ?? new Date().toISOString(),
        client_name:   form.client_name || 'Unknown Client',
        lawyer_name:   profile?.name ?? 'You',
        last_activity: data.case.created_at ?? new Date().toISOString(),
      };

      // Prepend new case to local list
      setLocalCases(prev => [newCase, ...prev]);
      setCreated(newCase);
      setCreating(false);
      setForm(EMPTY_FORM);

    } catch (err) {
      setCreateError('Network error — please try again');
      setCreating(false);
    }
  }

  function closeModal() {
    setShowModal(false);
    setCreateError(null);
    setCreated(null);
    setForm(EMPTY_FORM);
    setCreating(false);
  }

  const inputCls = 'w-full bg-white border border-stone-200 rounded-xl px-3 py-2.5 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all duration-200';

  return (
    <div className="p-5 lg:p-7 animate-fade-in">

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            className="text-2xl lg:text-3xl font-semibold text-stone-900">{t.cases.title}</h1>
          <p className="text-stone-400 text-sm mt-0.5">
            {t.cases.subtitle(localCases.length, localCases.filter(c => c.status !== 'closed').length)}
          </p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> {t.cases.newCase}
        </button>
      </div>

      {/* ── Search + Filters row ── */}
      <div className="flex flex-col gap-3 mb-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder={t.cases.searchPlaceholder} className="input-field pl-9" />
        </div>

        {/* Filter selects — 4 across on desktop, 2×2 on mobile */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          {/* Status */}
          <select value={statusFilter} onChange={e => setStatus(e.target.value)}
            className="input-field cursor-pointer">
            {STATUS_FILTERS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
          </select>

          {/* Risk */}
          <select value={riskFilter} onChange={e => setRisk(e.target.value)}
            className="input-field cursor-pointer">
            <option value="all">{t.cases.allRisk}</option>
            <option value="high">{t.cases.highRisk}</option>
            <option value="medium">{t.cases.mediumRisk}</option>
            <option value="low">{t.cases.lowRisk}</option>
          </select>

          {/* Practice area ← NEW */}
          <select value={areaFilter} onChange={e => setArea(e.target.value)}
            className="input-field cursor-pointer">
            <option value="all">All Practice Areas</option>
            {PRACTICE_AREAS.map(a => <option key={a} value={a}>{a}</option>)}
          </select>

          {/* Jurisdiction ← NEW */}
          <select value={jurisFilter} onChange={e => setJuris(e.target.value)}
            className="input-field cursor-pointer">
            <option value="all">All Jurisdictions</option>
            {JURISDICTIONS.map(j => <option key={j.code} value={j.code}>{j.label}</option>)}
          </select>
        </div>
      </div>

      {/* ── Status pills ── */}
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
            {f.value !== 'all' && (
              <span className="ml-1.5 opacity-60">
                {localCases.filter(c => c.status === f.value).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Active filter chips ── */}
      {(areaFilter !== 'all' || jurisFilter !== 'all') && (
        <div className="flex gap-2 mb-4 flex-wrap">
          {areaFilter !== 'all' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-xs text-amber-700 font-medium">
              {areaFilter}
              <button onClick={() => setArea('all')} className="hover:text-red-500 transition-colors">✕</button>
            </span>
          )}
          {jurisFilter !== 'all' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-xs text-amber-700 font-medium">
              {JURISDICTIONS.find(j => j.code === jurisFilter)?.label ?? jurisFilter}
              <button onClick={() => setJuris('all')} className="hover:text-red-500 transition-colors">✕</button>
            </span>
          )}
          <button onClick={() => { setArea('all'); setJuris('all'); }}
            className="text-xs text-stone-400 hover:text-stone-600 underline transition-colors">
            Clear all filters
          </button>
        </div>
      )}

      {/* ── Cases grid ── */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((c, i) => {
          const lvl = c.risk_score >= 70 ? 'high' : c.risk_score >= 40 ? 'medium' : 'low';
          return (
            <Link key={c.id} href={`/cases/${c.id}`}
              className="bg-white border border-stone-200 rounded-2xl p-5 hover:border-amber-300 hover:shadow-md transition-all duration-200 group flex flex-col shadow-sm animate-slide-up"
              style={{ animationDelay: `${i * 0.04}s` }}>
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

              <h3 className="text-sm font-bold text-stone-800 group-hover:text-amber-700 transition-colors leading-snug mb-1">
                {c.title}
              </h3>
              <p className="text-xs text-stone-400 mb-4">{c.practice_area}</p>

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

              <div>
                <div className="flex justify-between text-[10px] mb-1">
                  <span className="text-stone-400 font-medium">{t.cases.riskScore}</span>
                  <span className={cn('font-bold', lvl === 'high' ? 'text-red-600' : lvl === 'medium' ? 'text-amber-600' : 'text-green-600')}>
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
          <button onClick={() => { setSearch(''); setStatus('all'); setRisk('all'); setArea('all'); setJuris('all'); }}
            className="text-xs text-amber-600 hover:text-amber-700 font-semibold mt-2 underline transition-colors">
            Clear all filters
          </button>
        </div>
      )}

      {/* ── New Case Modal ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-2xl p-6 w-full max-w-lg shadow-2xl animate-slide-up max-h-[90vh] overflow-y-auto">

            {/* Success state */}
            {created ? (
              <div className="text-center py-4">
                <div className="w-14 h-14 rounded-2xl bg-green-50 border border-green-200 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-7 h-7 text-green-600" />
                </div>
                <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                  className="text-xl font-semibold text-stone-900 mb-1">Case Created</h2>
                <p className="text-stone-500 text-sm mb-1">{created.title}</p>
                <p className="text-xs text-stone-400 mb-6">
                  Case ID: <span className="font-mono text-stone-600">{created.id}</span>
                </p>
                <p className="text-xs text-green-700 bg-green-50 border border-green-200 rounded-xl p-3 mb-5">
                  ✓ Case created · Intake event logged · Assigned to {created.lawyer_name}
                </p>
                <div className="flex gap-3">
                  <button onClick={closeModal} className="flex-1 btn-ghost justify-center">Close</button>
                  <Link href={`/cases/${created.id}`} onClick={closeModal}
                    className="flex-1 btn-primary justify-center">
                    View Case →
                  </Link>
                </div>
              </div>
            ) : (
              /* Create form */
              <form onSubmit={handleCreate}>
                <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                  className="text-xl font-semibold text-stone-900 mb-5">{t.cases.createCase}</h2>

                {/* Error */}
                {createError && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-xs text-red-700 font-medium">
                    {createError}
                  </div>
                )}

                <div className="space-y-4">
                  {/* Case title */}
                  <div>
                    <label className="block text-xs text-stone-500 mb-1.5 font-semibold uppercase tracking-wide">
                      {t.cases.caseTitle} *
                    </label>
                    <input required value={form.title}
                      onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                      placeholder={t.cases.caseTitlePlaceholder} className={inputCls} />
                  </div>

                  {/* Client name + email */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-stone-500 mb-1.5 font-semibold uppercase tracking-wide">
                        {t.cases.clientName}
                      </label>
                      <input value={form.client_name}
                        onChange={e => setForm(f => ({ ...f, client_name: e.target.value }))}
                        placeholder="Full name" className={inputCls} />
                    </div>
                    <div>
                      <label className="block text-xs text-stone-500 mb-1.5 font-semibold uppercase tracking-wide">
                        {t.cases.clientEmail}
                      </label>
                      <input type="email" value={form.client_email}
                        onChange={e => setForm(f => ({ ...f, client_email: e.target.value }))}
                        placeholder="client@email.com" className={inputCls} />
                    </div>
                  </div>

                  {/* Practice area */}
                  <div>
                    <label className="block text-xs text-stone-500 mb-1.5 font-semibold uppercase tracking-wide">
                      {t.cases.practiceArea} *
                    </label>
                    <select required value={form.practice_area}
                      onChange={e => setForm(f => ({ ...f, practice_area: e.target.value }))}
                      className={inputCls + ' cursor-pointer'}>
                      {PRACTICE_AREAS.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </div>

                  {/* Jurisdiction */}
                  <div>
                    <label className="block text-xs text-stone-500 mb-1.5 font-semibold uppercase tracking-wide">
                      Jurisdiction
                    </label>
                    <select value={form.jurisdiction}
                      onChange={e => setForm(f => ({ ...f, jurisdiction: e.target.value }))}
                      className={inputCls + ' cursor-pointer'}>
                      {JURISDICTIONS.map(j => <option key={j.code} value={j.code}>{j.label}</option>)}
                    </select>
                  </div>

                  {/* Billing model + budget */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-stone-500 mb-1.5 font-semibold uppercase tracking-wide">
                        {t.cases.billingModel}
                      </label>
                      <select value={form.billing_model}
                        onChange={e => setForm(f => ({ ...f, billing_model: e.target.value as 'hourly' | 'flat_fee' }))}
                        className={inputCls + ' cursor-pointer'}>
                        <option value="hourly">{t.cases.hourly}</option>
                        <option value="flat_fee">{t.cases.flatFee}</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-stone-500 mb-1.5 font-semibold uppercase tracking-wide">
                        {t.cases.budget}
                      </label>
                      <input type="number" min="0" step="100" value={form.budget}
                        onChange={e => setForm(f => ({ ...f, budget: e.target.value }))}
                        placeholder="10000" className={inputCls} />
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex gap-3 mt-6 pt-4 border-t border-stone-100">
                  <button type="button" onClick={closeModal} className="btn-ghost flex-1 justify-center">
                    {t.cases.cancel}
                  </button>
                  <button type="submit" disabled={creating || !form.title.trim()}
                    className="btn-primary flex-1 justify-center disabled:opacity-60">
                    {creating ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Creating…</>
                    ) : (
                      <>{t.cases.create}</>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

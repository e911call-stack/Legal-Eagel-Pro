'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Scale, ChevronRight, ChevronLeft, Check, Building2, Users,
  MapPin, Sparkles, ArrowRight, User, Briefcase, Shield, AlertCircle
} from 'lucide-react';
import { useI18n, LanguageSwitcher } from '@/lib/i18n';

// ─── Data saved to sessionStorage so login page can pre-fill it ───────────────
export const ONBOARDING_KEY = 'le_onboarding';

type AccountType = 'individual' | 'lawfirm';

type OnboardingData = {
  accountType: AccountType;
  // Individual fields
  fullName: string;
  email: string;
  phone: string;
  caseType: string;
  urgency: string;
  // Law firm fields
  firmName: string;
  firmSize: string;
  practiceAreas: string[];
  jurisdiction: string;
  // Shared
  language: string;
  aiAlerts: boolean;
};

const EMPTY: OnboardingData = {
  accountType: 'individual',
  fullName: '', email: '', phone: '', caseType: '', urgency: '',
  firmName: '', firmSize: '', practiceAreas: [], jurisdiction: 'US',
  language: 'en', aiAlerts: true,
};

const CASE_TYPES = [
  { value: 'civil',       label: 'Civil Dispute',        emoji: '⚖️' },
  { value: 'family',      label: 'Family Law',           emoji: '👨‍👩‍👧' },
  { value: 'immigration', label: 'Immigration',          emoji: '🌍' },
  { value: 'criminal',    label: 'Criminal Defense',     emoji: '🛡️' },
  { value: 'property',    label: 'Property / Real Estate', emoji: '🏠' },
  { value: 'employment',  label: 'Employment',           emoji: '💼' },
  { value: 'estate',      label: 'Estate / Wills',       emoji: '📜' },
  { value: 'other',       label: 'Other',                emoji: '📋' },
];

const PRACTICE_AREAS = [
  'Civil Litigation', 'Family Law', 'Immigration', 'Estate Planning',
  'Criminal Defense', 'IP & Technology', 'Real Estate', 'Corporate',
];

const JURISDICTIONS = [
  { code: 'US', label: '🇺🇸 United States' },
  { code: 'JO', label: '🇯🇴 Jordan' },
  { code: 'AE', label: '🇦🇪 UAE' },
  { code: 'ES', label: '🇪🇸 Spain' },
  { code: 'CN', label: '🇨🇳 China' },
  { code: 'IN', label: '🇮🇳 India' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [step, setStep] = useState(0); // 0 = type selector
  const [data, setData] = useState<OnboardingData>(EMPTY);

  const isIndividual = data.accountType === 'individual';

  // Steps vary by account type
  const INDIVIDUAL_STEPS = ['Your Details', 'Case Type', 'Preferences', 'Review'];
  const FIRM_STEPS       = ['Firm Info', 'Team & Areas', 'Jurisdiction', 'Preferences', 'Review'];
  const STEPS = isIndividual ? INDIVIDUAL_STEPS : FIRM_STEPS;
  const totalSteps = STEPS.length;

  // Individual: steps 1-4,  Firm: steps 1-5
  // step 0 is the type chooser (not counted in progress)

  function next() {
    if (step < totalSteps) {
      setStep(s => s + 1);
    } else {
      // Save to sessionStorage so login can pre-fill
      try {
        sessionStorage.setItem(ONBOARDING_KEY, JSON.stringify(data));
      } catch {}
      // Route to login with type hint
      router.push(`/login?from=onboarding&type=${data.accountType}&name=${encodeURIComponent(data.fullName)}&email=${encodeURIComponent(data.email)}`);
    }
  }

  function back() {
    if (step === 1) setStep(0); // back to type chooser
    else setStep(s => s - 1);
  }

  function chooseType(type: AccountType) {
    setData(d => ({ ...d, accountType: type }));
    setStep(1);
  }

  function toggleArea(area: string) {
    setData(d => ({
      ...d,
      practiceAreas: d.practiceAreas.includes(area)
        ? d.practiceAreas.filter(a => a !== area)
        : [...d.practiceAreas, area],
    }));
  }

  const inputCls = 'w-full bg-white border border-stone-200 rounded-xl px-3 py-2.5 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all duration-200';

  const canProceed = (() => {
    if (step === 0) return false;
    if (isIndividual) {
      if (step === 1) return data.fullName.trim().length > 1 && data.email.includes('@');
      if (step === 2) return !!data.caseType;
    } else {
      if (step === 1) return data.firmName.trim().length > 1;
      if (step === 2) return data.practiceAreas.length > 0;
    }
    return true;
  })();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6" style={{ background: '#f5f4f0' }}>
      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #d4a017, transparent)', filter: 'blur(80px)' }} />
        <div className="absolute bottom-0 -left-20 w-80 h-80 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #1e40af, transparent)', filter: 'blur(60px)' }} />
      </div>

      <div className="w-full max-w-2xl relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-md">
              <Scale className="w-4 h-4 text-white" />
            </div>
            <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
              className="text-2xl font-semibold text-stone-900 tracking-wide">Legal Eagle</span>
          </div>
          <LanguageSwitcher />
        </div>

        {/* ── STEP 0: Account type chooser ── */}
        {step === 0 && (
          <div className="animate-fade-in">
            <div className="text-center mb-8">
              <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                className="text-3xl sm:text-4xl font-semibold text-stone-900 mb-3">
                Who are you here for?
              </h1>
              <p className="text-stone-500 text-sm max-w-md mx-auto">
                Legal Eagle serves both individuals seeking accountability and law firms committed to transparency.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              {/* Individual */}
              <button onClick={() => chooseType('individual')}
                className="group bg-white border-2 border-stone-200 hover:border-blue-400 hover:shadow-lg rounded-2xl p-6 text-left transition-all duration-200 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                  className="text-xl font-semibold text-stone-900 mb-2 group-hover:text-blue-700 transition-colors">
                  I'm an Individual
                </h3>
                <p className="text-sm text-stone-500 leading-relaxed mb-4">
                  I have or expect a legal case and want visibility into how my attorney is handling it.
                </p>
                <ul className="space-y-1.5">
                  {[
                    'Track your case in real time',
                    '"Is my case stuck?" AI check',
                    'View shared documents securely',
                    'Message your attorney directly',
                  ].map(f => (
                    <li key={f} className="flex items-center gap-2 text-xs text-stone-500">
                      <Check className="w-3 h-3 text-blue-500 flex-shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <div className="mt-5 flex items-center gap-1.5 text-blue-600 text-sm font-semibold group-hover:gap-3 transition-all duration-200">
                  Get started <ArrowRight className="w-4 h-4" />
                </div>
              </button>

              {/* Law firm */}
              <button onClick={() => chooseType('lawfirm')}
                className="group bg-white border-2 border-stone-200 hover:border-amber-400 hover:shadow-lg rounded-2xl p-6 text-left transition-all duration-200 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-amber-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mb-4 group-hover:bg-amber-100 transition-colors">
                  <Building2 className="w-6 h-6 text-amber-600" />
                </div>
                <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                  className="text-xl font-semibold text-stone-900 mb-2 group-hover:text-amber-700 transition-colors">
                  I'm a Law Firm
                </h3>
                <p className="text-sm text-stone-500 leading-relaxed mb-4">
                  I want to offer my clients full transparency and use AI to prevent negligence before it happens.
                </p>
                <ul className="space-y-1.5">
                  {[
                    'AI Negligence Detection Engine',
                    'Role-based client portals',
                    'Billing & time tracking',
                    'Risk score dashboards',
                  ].map(f => (
                    <li key={f} className="flex items-center gap-2 text-xs text-stone-500">
                      <Check className="w-3 h-3 text-amber-500 flex-shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <div className="mt-5 flex items-center gap-1.5 text-amber-600 text-sm font-semibold group-hover:gap-3 transition-all duration-200">
                  Set up firm <ArrowRight className="w-4 h-4" />
                </div>
              </button>
            </div>

            {/* Mission statement */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-blue-800 mb-0.5">Our mission</p>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Legal Eagle exists primarily to protect individuals' legal rights. We believe every client deserves full visibility into their case — not just a status email once a month. Legal negligence causes people to lose cases, rights, and livelihoods. We're here to change that.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── STEPS 1+ ── */}
        {step >= 1 && (
          <div className="animate-fade-in">
            {/* Progress stepper */}
            <div className="flex items-center mb-8">
              {STEPS.map((label, i) => {
                const stepNum = i + 1;
                const isDone    = step > stepNum;
                const isCurrent = step === stepNum;
                const accentColor = isIndividual ? 'border-blue-500 text-blue-600' : 'border-amber-500 text-amber-600';
                const doneColor   = isIndividual ? 'bg-blue-500 border-blue-500' : 'bg-amber-500 border-amber-500';
                return (
                  <div key={label} className="flex items-center flex-1">
                    <div className="flex flex-col items-center gap-1 flex-shrink-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 text-xs font-bold transition-all duration-300 ${
                        isDone    ? `${doneColor} text-white`
                        : isCurrent ? `bg-white ${accentColor} shadow-sm`
                        : 'bg-white border-stone-200 text-stone-400'
                      }`}>
                        {isDone ? <Check className="w-3.5 h-3.5" /> : stepNum}
                      </div>
                      <span className={`text-[9px] font-medium hidden sm:block ${isCurrent || isDone ? 'text-stone-600' : 'text-stone-400'}`}>
                        {label}
                      </span>
                    </div>
                    {i < STEPS.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-1.5 transition-colors duration-300 ${
                        isDone
                          ? (isIndividual ? 'bg-blue-400' : 'bg-amber-400')
                          : 'bg-stone-200'
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Card */}
            <div className="bg-white border border-stone-200 rounded-2xl shadow-sm p-6 sm:p-8">

              {/* ═══ INDIVIDUAL STEPS ════════════════════════════════════════ */}
              {isIndividual && step === 1 && (
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center">
                      <User className="w-3.5 h-3.5 text-blue-600" />
                    </div>
                    <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                      className="text-xl font-semibold text-stone-900">Your Details</h2>
                  </div>
                  <p className="text-stone-400 text-xs mb-5 ml-9">These will pre-fill your account — no need to re-enter later.</p>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs text-stone-500 mb-1.5 font-semibold uppercase tracking-wide">Full Name *</label>
                      <input value={data.fullName} onChange={e => setData(d => ({ ...d, fullName: e.target.value }))}
                        placeholder="Your full legal name" className={inputCls} required />
                    </div>
                    <div>
                      <label className="block text-xs text-stone-500 mb-1.5 font-semibold uppercase tracking-wide">Email Address *</label>
                      <input type="email" value={data.email} onChange={e => setData(d => ({ ...d, email: e.target.value }))}
                        placeholder="you@email.com" className={inputCls} required />
                      <p className="text-[10px] text-stone-400 mt-1">You'll use this to sign in. Your email stays private.</p>
                    </div>
                    <div>
                      <label className="block text-xs text-stone-500 mb-1.5 font-semibold uppercase tracking-wide">Phone (optional)</label>
                      <input type="tel" value={data.phone} onChange={e => setData(d => ({ ...d, phone: e.target.value }))}
                        placeholder="+1 555 000 0000" className={inputCls} />
                    </div>
                  </div>
                  {/* Why we ask */}
                  <div className="mt-5 bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-start gap-2">
                    <Shield className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-stone-600">
                      <strong className="text-blue-700">Your privacy matters.</strong> We never sell or share your data. Your name and email are only used to identify your account and communicate case updates.
                    </p>
                  </div>
                </div>
              )}

              {isIndividual && step === 2 && (
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center">
                      <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                    </div>
                    <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                      className="text-xl font-semibold text-stone-900">What type of legal matter?</h2>
                  </div>
                  <p className="text-stone-400 text-xs mb-5 ml-9">This helps us connect you with the right attorney and set up your monitoring.</p>
                  <div className="grid grid-cols-2 gap-2.5 mb-5">
                    {CASE_TYPES.map(ct => (
                      <button key={ct.value} type="button"
                        onClick={() => setData(d => ({ ...d, caseType: ct.value }))}
                        className={`flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all duration-200 ${
                          data.caseType === ct.value
                            ? 'border-blue-400 bg-blue-50 text-blue-700'
                            : 'border-stone-200 text-stone-600 hover:border-stone-300 hover:bg-stone-50'
                        }`}>
                        <span className="text-lg flex-shrink-0">{ct.emoji}</span>
                        <span className="text-sm font-semibold">{ct.label}</span>
                        {data.caseType === ct.value && <Check className="w-3.5 h-3.5 ml-auto flex-shrink-0 text-blue-500" />}
                      </button>
                    ))}
                  </div>
                  <div>
                    <label className="block text-xs text-stone-500 mb-2 font-semibold uppercase tracking-wide">How urgent is your situation?</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { value: 'immediate', label: '🚨 Immediate', sub: 'Within days' },
                        { value: 'soon',      label: '⏰ Soon',      sub: 'Within weeks' },
                        { value: 'planning',  label: '📅 Planning',  sub: 'Not urgent yet' },
                      ].map(u => (
                        <button key={u.value} type="button"
                          onClick={() => setData(d => ({ ...d, urgency: u.value }))}
                          className={`p-3 rounded-xl border-2 text-center transition-all duration-200 ${
                            data.urgency === u.value
                              ? 'border-blue-400 bg-blue-50'
                              : 'border-stone-200 hover:border-stone-300'
                          }`}>
                          <div className={`text-sm font-semibold ${data.urgency === u.value ? 'text-blue-700' : 'text-stone-700'}`}>{u.label}</div>
                          <div className="text-[10px] text-stone-400 mt-0.5">{u.sub}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {isIndividual && step === 3 && (
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center">
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    </div>
                    <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                      className="text-xl font-semibold text-stone-900">Your Preferences</h2>
                  </div>
                  <p className="text-stone-400 text-xs mb-5 ml-9">Control how Legal Eagle communicates with you.</p>
                  <div className="space-y-3">
                    {[
                      { key: 'aiAlerts', label: 'AI Case Health Alerts', desc: 'Get notified if your attorney hasn\'t updated your case in 14+ days or hasn\'t replied to your messages in 72+ hours.' },
                    ].map(opt => (
                      <div key={opt.key} className="flex items-start justify-between p-4 rounded-xl border border-stone-200 bg-stone-50">
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-stone-800">{opt.label}</p>
                          <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">{opt.desc}</p>
                        </div>
                        <button type="button"
                          onClick={() => setData(d => ({ ...d, aiAlerts: !d.aiAlerts }))}
                          className={`mt-0.5 w-10 h-5 rounded-full transition-all duration-300 relative flex-shrink-0 ml-4 ${data.aiAlerts ? 'bg-blue-500' : 'bg-stone-300'}`}>
                          <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-300 ${data.aiAlerts ? 'left-5' : 'left-0.5'}`} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4">
                    <label className="block text-xs text-stone-500 mb-2 font-semibold uppercase tracking-wide">Interface Language</label>
                    <div className="grid grid-cols-5 gap-2">
                      {[
                        { code: 'en', label: '🇺🇸 EN' },
                        { code: 'es', label: '🇪🇸 ES' },
                        { code: 'zh', label: '🇨🇳 中文' },
                        { code: 'ar', label: '🇸🇦 عربي' },
                        { code: 'hi', label: '🇮🇳 हिं' },
                      ].map(l => (
                        <button key={l.code} type="button"
                          onClick={() => setData(d => ({ ...d, language: l.code }))}
                          className={`py-2 rounded-xl border-2 text-xs font-semibold transition-all duration-200 ${
                            data.language === l.code ? 'border-blue-400 bg-blue-50 text-blue-700' : 'border-stone-200 text-stone-500 hover:border-stone-300'
                          }`}>
                          {l.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {isIndividual && step === 4 && (
                <div>
                  <div className="flex items-center gap-2 mb-5">
                    <div className="w-7 h-7 rounded-lg bg-green-50 border border-green-200 flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 text-green-600" />
                    </div>
                    <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                      className="text-xl font-semibold text-stone-900">Everything looks good</h2>
                  </div>
                  <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 mb-4 space-y-2">
                    {[
                      { label: 'Name',       value: data.fullName },
                      { label: 'Email',      value: data.email },
                      { label: 'Case type',  value: CASE_TYPES.find(c => c.value === data.caseType)?.label ?? '—' },
                      { label: 'AI alerts',  value: data.aiAlerts ? 'Enabled' : 'Disabled' },
                    ].map(row => (
                      <div key={row.label} className="flex justify-between items-center text-sm py-1 border-b border-stone-100 last:border-0">
                        <span className="text-stone-500 text-xs font-semibold uppercase tracking-wide">{row.label}</span>
                        <span className="text-stone-800 font-medium">{row.value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5">
                    <p className="text-xs font-bold text-blue-800 mb-1">✓ What happens next</p>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      Clicking <strong>"Create my account"</strong> takes you to a sign-up form with your details already filled in. You'll set a password and gain immediate access to your client portal.
                    </p>
                  </div>
                </div>
              )}

              {/* ═══ LAW FIRM STEPS ══════════════════════════════════════════ */}
              {!isIndividual && step === 1 && (
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center">
                      <Building2 className="w-3.5 h-3.5 text-amber-600" />
                    </div>
                    <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                      className="text-xl font-semibold text-stone-900">Firm Information</h2>
                  </div>
                  <p className="text-stone-400 text-xs mb-5 ml-9">Tell us about your law firm to get started.</p>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs text-stone-500 mb-1.5 font-semibold uppercase tracking-wide">Firm Name *</label>
                      <input value={data.firmName} onChange={e => setData(d => ({ ...d, firmName: e.target.value }))}
                        placeholder="e.g. Chen & Associates Law Group" className={inputCls} />
                    </div>
                    <div>
                      <label className="block text-xs text-stone-500 mb-1.5 font-semibold uppercase tracking-wide">Your Name *</label>
                      <input value={data.fullName} onChange={e => setData(d => ({ ...d, fullName: e.target.value }))}
                        placeholder="Your full name" className={inputCls} />
                    </div>
                    <div>
                      <label className="block text-xs text-stone-500 mb-1.5 font-semibold uppercase tracking-wide">Email Address *</label>
                      <input type="email" value={data.email} onChange={e => setData(d => ({ ...d, email: e.target.value }))}
                        placeholder="you@firm.com" className={inputCls} />
                    </div>
                  </div>
                </div>
              )}

              {!isIndividual && step === 2 && (
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center">
                      <Users className="w-3.5 h-3.5 text-amber-600" />
                    </div>
                    <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                      className="text-xl font-semibold text-stone-900">Team & Practice Areas</h2>
                  </div>
                  <p className="text-stone-400 text-xs mb-5 ml-9">Help us customize Legal Eagle for your firm.</p>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs text-stone-500 mb-2 font-semibold uppercase tracking-wide">Number of Attorneys</label>
                      <div className="grid grid-cols-4 gap-2">
                        {['1', '2–5', '6–10', '10+'].map(size => (
                          <button key={size} type="button" onClick={() => setData(d => ({ ...d, firmSize: size }))}
                            className={`py-3 rounded-xl border-2 text-sm font-semibold transition-all duration-200 ${
                              data.firmSize === size ? 'border-amber-400 bg-amber-50 text-amber-700' : 'border-stone-200 text-stone-500 hover:border-stone-300'
                            }`}>
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-stone-500 mb-2 font-semibold uppercase tracking-wide">Practice Areas *</label>
                      <div className="grid grid-cols-2 gap-2">
                        {PRACTICE_AREAS.map(area => (
                          <button key={area} type="button" onClick={() => toggleArea(area)}
                            className={`flex items-center gap-2 p-3 rounded-xl border-2 text-sm text-left font-medium transition-all duration-200 ${
                              data.practiceAreas.includes(area)
                                ? 'border-amber-400 bg-amber-50 text-amber-700'
                                : 'border-stone-200 text-stone-600 hover:border-stone-300'
                            }`}>
                            {data.practiceAreas.includes(area) && <Check className="w-3.5 h-3.5 flex-shrink-0" />}
                            <span className={data.practiceAreas.includes(area) ? '' : 'ml-5'}>{area}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {!isIndividual && step === 3 && (
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center">
                      <MapPin className="w-3.5 h-3.5 text-amber-600" />
                    </div>
                    <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                      className="text-xl font-semibold text-stone-900">Jurisdiction</h2>
                  </div>
                  <p className="text-stone-400 text-xs mb-5 ml-9">The AI engine uses this to apply the correct legal standards.</p>
                  <div className="grid grid-cols-2 gap-2">
                    {JURISDICTIONS.map(j => (
                      <button key={j.code} type="button" onClick={() => setData(d => ({ ...d, jurisdiction: j.code }))}
                        className={`p-3.5 rounded-xl border-2 text-left transition-all duration-200 ${
                          data.jurisdiction === j.code ? 'border-amber-400 bg-amber-50' : 'border-stone-200 hover:border-stone-300'
                        }`}>
                        <div className={`text-sm font-semibold ${data.jurisdiction === j.code ? 'text-amber-700' : 'text-stone-700'}`}>{j.label}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {!isIndividual && step === 4 && (
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    </div>
                    <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                      className="text-xl font-semibold text-stone-900">AI & Preferences</h2>
                  </div>
                  <p className="text-stone-400 text-xs mb-5 ml-9">Configure the Negligence Detection Engine.</p>
                  <div className="space-y-3 mb-4">
                    {[
                      { key: 'aiAlerts', label: 'AI Alert Notifications', desc: 'Get notified when the engine flags a case for inactivity, missed deadlines, or unanswered client messages.' },
                    ].map(opt => (
                      <div key={opt.key} className="flex items-start justify-between p-4 rounded-xl border border-stone-200 bg-stone-50">
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-stone-800">{opt.label}</p>
                          <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">{opt.desc}</p>
                        </div>
                        <button type="button" onClick={() => setData(d => ({ ...d, aiAlerts: !d.aiAlerts }))}
                          className={`mt-0.5 w-10 h-5 rounded-full transition-all duration-300 relative flex-shrink-0 ml-4 ${data.aiAlerts ? 'bg-amber-500' : 'bg-stone-300'}`}>
                          <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-300 ${data.aiAlerts ? 'left-5' : 'left-0.5'}`} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!isIndividual && step === 5 && (
                <div>
                  <div className="flex items-center gap-2 mb-5">
                    <div className="w-7 h-7 rounded-lg bg-green-50 border border-green-200 flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 text-green-600" />
                    </div>
                    <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                      className="text-xl font-semibold text-stone-900">Firm setup complete</h2>
                  </div>
                  <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 mb-4 space-y-2">
                    {[
                      { label: 'Firm',          value: data.firmName },
                      { label: 'Name',          value: data.fullName },
                      { label: 'Email',         value: data.email },
                      { label: 'Practice areas', value: data.practiceAreas.slice(0, 3).join(', ') + (data.practiceAreas.length > 3 ? `…` : '') },
                      { label: 'Jurisdiction',  value: JURISDICTIONS.find(j => j.code === data.jurisdiction)?.label ?? data.jurisdiction },
                    ].map(row => (
                      <div key={row.label} className="flex justify-between items-center text-sm py-1 border-b border-stone-100 last:border-0">
                        <span className="text-stone-500 text-xs font-semibold uppercase tracking-wide">{row.label}</span>
                        <span className="text-stone-800 font-medium text-right max-w-[200px] truncate">{row.value || '—'}</span>
                      </div>
                    ))}
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5">
                    <p className="text-xs font-bold text-amber-800 mb-1">✓ What happens next</p>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      Clicking <strong>"Create my account"</strong> takes you to a sign-up form with your details pre-filled. You'll set a password and can immediately start adding cases and inviting clients.
                    </p>
                  </div>
                </div>
              )}

              {/* ── Navigation ── */}
              <div className="flex items-center justify-between mt-7 pt-5 border-t border-stone-100">
                <button type="button" onClick={back}
                  className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-800 transition-colors font-medium">
                  <ChevronLeft className="w-4 h-4" />
                  {step === 1 ? 'Change type' : 'Back'}
                </button>

                {/* Dot progress */}
                <div className="flex gap-1.5">
                  {STEPS.map((_, i) => (
                    <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${
                      i + 1 === step
                        ? (isIndividual ? 'w-5 bg-blue-500' : 'w-5 bg-amber-500')
                        : i + 1 < step
                        ? (isIndividual ? 'w-1.5 bg-blue-300' : 'w-1.5 bg-amber-300')
                        : 'w-1.5 bg-stone-200'
                    }`} />
                  ))}
                </div>

                <button type="button" onClick={next}
                  disabled={!canProceed && step < totalSteps}
                  className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    step === totalSteps
                      ? (isIndividual ? 'bg-blue-600 hover:bg-blue-700' : 'bg-amber-600 hover:bg-amber-700') + ' text-white shadow-sm'
                      : canProceed
                      ? (isIndividual ? 'bg-blue-600 hover:bg-blue-700' : 'bg-amber-600 hover:bg-amber-700') + ' text-white shadow-sm'
                      : 'bg-stone-100 text-stone-400 cursor-not-allowed'
                  }`}>
                  {step === totalSteps
                    ? <><ArrowRight className="w-4 h-4" /> Create my account</>
                    : <>Next <ChevronRight className="w-4 h-4" /></>
                  }
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

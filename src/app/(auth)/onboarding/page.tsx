'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Scale, ChevronRight, ChevronLeft, Check, Building2, Users, MapPin, Globe, Sparkles, ArrowRight } from 'lucide-react';
import { useI18n, LanguageSwitcher } from '@/lib/i18n';

export default function OnboardingPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    firmName: '', address: '', city: '', state: '',
    jurisdiction: 'US', teamSize: '',
    practiceAreas: [] as string[],
    language: 'en', aiAlerts: true, dailyDigest: true,
  });

  const STEPS = t.onboarding.steps.map((label, i) => ({
    id: i + 1, label,
    icon: [Building2, Users, MapPin, Globe, Sparkles][i],
  }));

  const PRACTICE_AREAS = [
    'Civil Litigation', 'Family Law', 'Immigration', 'Estate Planning',
    'Criminal Defense', 'IP & Technology', 'Real Estate', 'Corporate',
  ];

  function toggle(area: string) {
    setData(d => ({
      ...d,
      practiceAreas: d.practiceAreas.includes(area)
        ? d.practiceAreas.filter(a => a !== area)
        : [...d.practiceAreas, area],
    }));
  }

  function next() { if (step < 5) setStep(s => s + 1); else router.push('/dashboard'); }
  function back() { if (step > 1) setStep(s => s - 1); }

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#f5f4f0' }}>
      {/* Subtle background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #d4a017, transparent)', filter: 'blur(80px)' }} />
        <div className="absolute bottom-0 -left-20 w-80 h-80 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #1e40af, transparent)', filter: 'blur(60px)' }} />
      </div>

      <div className="w-full max-w-2xl relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-md">
              <Scale className="w-4 h-4 text-white" />
            </div>
            <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
              className="text-2xl font-semibold text-stone-900 tracking-wide">
              Legal Eagle
            </span>
          </div>
          <LanguageSwitcher />
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-between mb-8 px-2">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center">
              <div className="flex flex-col items-center gap-1.5">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 border-2 ${
                  step > s.id
                    ? 'bg-amber-500 border-amber-500 text-white'
                    : step === s.id
                    ? 'bg-white border-amber-500 text-amber-600 shadow-sm'
                    : 'bg-white border-stone-200 text-stone-400'
                }`}>
                  {step > s.id ? <Check className="w-4 h-4" /> : <s.icon className="w-4 h-4" />}
                </div>
                <span className={`text-[10px] hidden sm:block font-medium ${step >= s.id ? 'text-stone-600' : 'text-stone-400'}`}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`h-0.5 mx-1 w-10 sm:w-16 transition-colors duration-300 ${step > s.id ? 'bg-amber-400' : 'bg-stone-200'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="bg-white border border-stone-200 rounded-2xl shadow-sm p-8">
          {step === 1 && (
            <div className="animate-fade-in">
              <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                className="text-2xl font-semibold text-stone-900 mb-1">{t.onboarding.firmInfo}</h2>
              <p className="text-stone-500 text-sm mb-6">{t.onboarding.firmInfoSub}</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-stone-500 mb-1.5 font-semibold uppercase tracking-wide">{t.onboarding.firmName} *</label>
                  <input className="input-field" placeholder={t.onboarding.firmNamePlaceholder} value={data.firmName}
                    onChange={e => setData(d => ({ ...d, firmName: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs text-stone-500 mb-1.5 font-semibold uppercase tracking-wide">{t.onboarding.streetAddress}</label>
                  <input className="input-field" placeholder="123 Legal Street, Suite 400" value={data.address}
                    onChange={e => setData(d => ({ ...d, address: e.target.value }))} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-stone-500 mb-1.5 font-semibold uppercase tracking-wide">{t.onboarding.city}</label>
                    <input className="input-field" placeholder="New York" value={data.city}
                      onChange={e => setData(d => ({ ...d, city: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-xs text-stone-500 mb-1.5 font-semibold uppercase tracking-wide">{t.onboarding.state}</label>
                    <input className="input-field" placeholder="NY" value={data.state}
                      onChange={e => setData(d => ({ ...d, state: e.target.value }))} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-fade-in">
              <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                className="text-2xl font-semibold text-stone-900 mb-1">{t.onboarding.teamSetup}</h2>
              <p className="text-stone-500 text-sm mb-6">{t.onboarding.teamSetupSub}</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-stone-500 mb-3 font-semibold uppercase tracking-wide">{t.onboarding.numberOfAttorneys}</label>
                  <div className="grid grid-cols-4 gap-2">
                    {['1', '2–5', '6–10', '10+'].map(size => (
                      <button key={size} onClick={() => setData(d => ({ ...d, teamSize: size }))}
                        className={`py-3 rounded-xl border-2 text-sm font-semibold transition-all duration-200 ${
                          data.teamSize === size
                            ? 'border-amber-400 bg-amber-50 text-amber-700'
                            : 'border-stone-200 text-stone-500 hover:border-stone-300 hover:text-stone-700'
                        }`}>
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-stone-500 mb-3 font-semibold uppercase tracking-wide">{t.onboarding.practiceAreas}</label>
                  <div className="grid grid-cols-2 gap-2">
                    {PRACTICE_AREAS.map(area => (
                      <button key={area} onClick={() => toggle(area)}
                        className={`py-2.5 px-3 rounded-xl border-2 text-sm text-left transition-all duration-200 flex items-center gap-2 font-medium ${
                          data.practiceAreas.includes(area)
                            ? 'border-amber-400 bg-amber-50 text-amber-700'
                            : 'border-stone-200 text-stone-500 hover:border-stone-300'
                        }`}>
                        {data.practiceAreas.includes(area) && <Check className="w-3 h-3 flex-shrink-0" />}
                        <span className={data.practiceAreas.includes(area) ? '' : 'ml-4'}>{area}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-fade-in">
              <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                className="text-2xl font-semibold text-stone-900 mb-1">{t.onboarding.jurisdiction}</h2>
              <p className="text-stone-500 text-sm mb-6">{t.onboarding.jurisdictionSub}</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { code: 'US', label: '🇺🇸 United States', desc: 'ABA Rules of Professional Conduct' },
                  { code: 'JO', label: '🇯🇴 Jordan', desc: 'Jordanian Bar Association Rules' },
                  { code: 'AE', label: '🇦🇪 UAE', desc: 'UAEBA Standards' },
                  { code: 'ES', label: '🇪🇸 Spain', desc: 'CGAE Rules' },
                  { code: 'CN', label: '🇨🇳 China', desc: 'All-China Lawyers Association' },
                  { code: 'IN', label: '🇮🇳 India', desc: 'Bar Council of India Rules' },
                ].map(j => (
                  <button key={j.code} onClick={() => setData(d => ({ ...d, jurisdiction: j.code }))}
                    className={`p-3 rounded-xl border-2 text-left transition-all duration-200 ${
                      data.jurisdiction === j.code
                        ? 'border-amber-400 bg-amber-50'
                        : 'border-stone-200 hover:border-stone-300'
                    }`}>
                    <div className={`text-sm font-semibold mb-0.5 ${data.jurisdiction === j.code ? 'text-amber-700' : 'text-stone-700'}`}>{j.label}</div>
                    <div className="text-xs text-stone-400">{j.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="animate-fade-in">
              <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                className="text-2xl font-semibold text-stone-900 mb-1">{t.onboarding.preferences}</h2>
              <p className="text-stone-500 text-sm mb-6">{t.onboarding.preferencesSub}</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-stone-500 mb-3 font-semibold uppercase tracking-wide">{t.onboarding.interfaceLanguage}</label>
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                    {[
                      { code: 'en', label: '🇺🇸 EN' },
                      { code: 'es', label: '🇪🇸 ES' },
                      { code: 'zh', label: '🇨🇳 中文' },
                      { code: 'ar', label: '🇸🇦 عربي' },
                      { code: 'hi', label: '🇮🇳 हिंदी' },
                    ].map(l => (
                      <button key={l.code} onClick={() => setData(d => ({ ...d, language: l.code }))}
                        className={`py-2.5 rounded-xl border-2 text-sm font-semibold transition-all duration-200 ${
                          data.language === l.code
                            ? 'border-amber-400 bg-amber-50 text-amber-700'
                            : 'border-stone-200 text-stone-500 hover:border-stone-300'
                        }`}>
                        {l.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  {[
                    { key: 'aiAlerts', label: t.onboarding.aiAlerts, desc: t.onboarding.aiAlertsSub },
                    { key: 'dailyDigest', label: t.onboarding.dailyDigest, desc: t.onboarding.dailyDigestSub },
                  ].map(opt => (
                    <div key={opt.key} className="flex items-start justify-between p-4 rounded-xl border border-stone-200 bg-stone-50">
                      <div>
                        <p className="text-sm font-semibold text-stone-800">{opt.label}</p>
                        <p className="text-xs text-stone-500 mt-0.5">{opt.desc}</p>
                      </div>
                      <button
                        onClick={() => setData(d => ({ ...d, [opt.key]: !d[opt.key as 'aiAlerts' | 'dailyDigest'] }))}
                        className={`mt-0.5 w-10 h-5 rounded-full transition-all duration-300 relative flex-shrink-0 ml-4 ${
                          data[opt.key as 'aiAlerts' | 'dailyDigest'] ? 'bg-amber-500' : 'bg-stone-300'
                        }`}
                      >
                        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-300 ${
                          data[opt.key as 'aiAlerts' | 'dailyDigest'] ? 'left-5' : 'left-0.5'
                        }`} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="animate-fade-in text-center">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 border-2 border-amber-200 flex items-center justify-center mx-auto mb-5">
                <Sparkles className="w-7 h-7 text-amber-600" />
              </div>
              <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                className="text-2xl font-semibold text-stone-900 mb-2">{t.onboarding.aiSetup}</h2>
              <p className="text-stone-500 text-sm mb-8 max-w-md mx-auto">{t.onboarding.aiSetupDesc}</p>
              <div className="grid grid-cols-1 gap-3 text-left mb-8">
                {[
                  { icon: '⏰', title: 'Inactivity Detection', desc: 'No meaningful activity in 14+ days → Medium risk flag' },
                  { icon: '💬', title: 'Unanswered Messages', desc: 'Client messages unanswered 72+ hours → Alert generated' },
                  { icon: '📅', title: 'Missed Deadlines', desc: 'Internal review dates passed without completion → High risk' },
                ].map(item => (
                  <div key={item.title} className="flex gap-3 p-3.5 rounded-xl bg-amber-50 border border-amber-200">
                    <span className="text-xl flex-shrink-0">{item.icon}</span>
                    <div>
                      <p className="text-sm font-semibold text-stone-800">{item.title}</p>
                      <p className="text-xs text-stone-500">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                <p className="text-xs text-green-700 font-medium">{t.onboarding.setupComplete}</p>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-stone-100">
            <button onClick={back} disabled={step === 1}
              className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed font-medium">
              <ChevronLeft className="w-4 h-4" /> {t.onboarding.back}
            </button>
            <div className="flex gap-1.5">
              {STEPS.map(s => (
                <div key={s.id} className={`h-1.5 rounded-full transition-all duration-300 ${
                  s.id === step ? 'w-5 bg-amber-500' : s.id < step ? 'w-1.5 bg-amber-300' : 'w-1.5 bg-stone-200'
                }`} />
              ))}
            </div>
            <button onClick={next} className="btn-primary flex items-center gap-1.5">
              {step === 5 ? (
                <><ArrowRight className="w-4 h-4" /> {t.onboarding.enterPlatform}</>
              ) : (
                <>{t.onboarding.next} <ChevronRight className="w-4 h-4" /></>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

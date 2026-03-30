'use client';

import { useState } from 'react';
import { User, Shield, Bell, Palette, Key, Save, ChevronRight } from 'lucide-react';
import { mockUser } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18n';

export default function SettingsPage() {
  const { t } = useI18n();
  const [tab, setTab]     = useState(0);
  const [saved, setSaved] = useState(false);

  const TABS = [
    { label: t.settingsPage.tabs[0], icon: User    },
    { label: t.settingsPage.tabs[1], icon: Shield  },
    { label: t.settingsPage.tabs[2], icon: Bell    },
    { label: t.settingsPage.tabs[3], icon: Palette },
    { label: t.settingsPage.tabs[4], icon: Key     },
  ];

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  const NOTIFS = [
    { label: 'AI Alert Notifications',    desc: 'Get notified when the Negligence Detection Engine flags a case', on: true  },
    { label: 'Client Messages',            desc: 'Email and in-app notifications for new client messages',           on: true  },
    { label: 'Deadline Reminders',         desc: '48-hour and 24-hour reminders for upcoming deadlines',             on: true  },
    { label: 'Daily Case Digest',          desc: 'Morning summary of active case statuses and pending tasks',        on: false },
    { label: 'Billing Updates',            desc: 'Notify when time entries are billed or budget thresholds reached', on: true  },
    { label: 'System Updates',             desc: 'Platform maintenance and feature release announcements',           on: false },
  ];

  const INTEGRATIONS = [
    { name: 'Supabase',           status: 'Connected',     color: 'text-green-600' },
    { name: 'Anthropic Claude AI', status: 'Connected',    color: 'text-green-600' },
    { name: 'Folderit DMS',       status: 'Not connected', color: 'text-stone-400' },
    { name: 'QuickBooks Online',  status: 'Not connected', color: 'text-stone-400' },
  ];

  return (
    <div className="p-5 lg:p-7 animate-fade-in">
      <div className="mb-6">
        <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          className="text-2xl lg:text-3xl font-semibold text-stone-900">{t.settingsPage.title}</h1>
        <p className="text-stone-400 text-sm mt-0.5">{t.settingsPage.subtitle}</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar tabs */}
        <div className="lg:w-48 flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 flex-shrink-0">
          {TABS.map((tabItem, idx) => (
            <button key={tabItem.label} onClick={() => setTab(idx)}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 whitespace-nowrap',
                tab === idx
                  ? 'bg-amber-50 text-amber-700 border-2 border-amber-200'
                  : 'text-stone-500 hover:text-stone-800 hover:bg-stone-100 border-2 border-transparent'
              )}>
              <tabItem.icon className="w-4 h-4 flex-shrink-0" /> {tabItem.label}
            </button>
          ))}
        </div>

        {/* Content panel */}
        <div className="flex-1 min-w-0">
          <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">

            {tab === 0 && (
              <div className="animate-fade-in space-y-5">
                <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                  className="text-lg font-semibold text-stone-900">{t.settingsPage.profileInfo}</h2>
                {/* Avatar */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-200 to-amber-400 border-2 border-amber-300 flex items-center justify-center text-2xl font-bold text-amber-800"
                    style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
                    {mockUser.name[0]}
                  </div>
                  <div>
                    <button className="text-sm text-amber-600 hover:text-amber-700 font-semibold transition-colors">{t.settingsPage.changePhoto}</button>
                    <p className="text-xs text-stone-400 mt-0.5">{t.settingsPage.photoHint}</p>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { label: t.settingsPage.fullName,    value: mockUser.name,  type: 'text'  },
                    { label: t.settingsPage.emailAddress, value: mockUser.email, type: 'email' },
                    { label: t.settingsPage.role,         value: 'Senior Attorney', type: 'text' },
                    { label: t.settingsPage.barNumber,    value: '',            placeholder: 'e.g. NY-12345', type: 'text' },
                  ].map(f => (
                    <div key={f.label}>
                      <label className="block text-xs text-stone-500 mb-1.5 font-semibold uppercase tracking-wide">{f.label}</label>
                      <input className="input-field" type={f.type} defaultValue={f.value}
                        placeholder={(f as { placeholder?: string }).placeholder ?? ''} />
                    </div>
                  ))}
                  <div className="sm:col-span-2">
                    <label className="block text-xs text-stone-500 mb-1.5 font-semibold uppercase tracking-wide">{t.settingsPage.firm}</label>
                    <input className="input-field" defaultValue="Chen & Associates Law Group" />
                  </div>
                </div>
              </div>
            )}

            {tab === 1 && (
              <div className="animate-fade-in space-y-5">
                <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                  className="text-lg font-semibold text-stone-900">{t.settingsPage.securitySettings}</h2>
                <div className="space-y-4">
                  {[t.settingsPage.currentPassword, t.settingsPage.newPassword, t.settingsPage.confirmPassword].map(label => (
                    <div key={label}>
                      <label className="block text-xs text-stone-500 mb-1.5 font-semibold uppercase tracking-wide">{label}</label>
                      <input type="password" className="input-field" placeholder="••••••••" />
                    </div>
                  ))}
                </div>
                <div className="border-t border-stone-100 pt-4">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-stone-50 border border-stone-200">
                    <div>
                      <p className="text-sm font-semibold text-stone-800">{t.settingsPage.twoFactor}</p>
                      <p className="text-xs text-stone-400 mt-0.5">{t.settingsPage.twoFactorSub}</p>
                    </div>
                    <div className="w-10 h-5 rounded-full bg-green-500 relative cursor-pointer">
                      <div className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-white shadow" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {tab === 2 && (
              <div className="animate-fade-in space-y-4">
                <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                  className="text-lg font-semibold text-stone-900">{t.settingsPage.notificationPrefs}</h2>
                {NOTIFS.map(item => (
                  <div key={item.label} className="flex items-start justify-between p-4 rounded-xl border border-stone-200 bg-stone-50">
                    <div>
                      <p className="text-sm font-semibold text-stone-800">{item.label}</p>
                      <p className="text-xs text-stone-400 mt-0.5">{item.desc}</p>
                    </div>
                    <div className={cn('mt-0.5 w-10 h-5 rounded-full relative cursor-pointer transition-all duration-300 flex-shrink-0 ml-4',
                      item.on ? 'bg-amber-500' : 'bg-stone-300')}>
                      <div className={cn('absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-300',
                        item.on ? 'left-5' : 'left-0.5')} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tab === 3 && (
              <div className="animate-fade-in space-y-5">
                <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                  className="text-lg font-semibold text-stone-900">{t.settingsPage.appearancePrefs}</h2>
                <div>
                  <label className="block text-xs text-stone-500 mb-3 font-semibold uppercase tracking-wide">{t.settingsPage.interfaceLanguage}</label>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {[
                      { code: 'en', label: '🇺🇸 EN' },
                      { code: 'es', label: '🇪🇸 ES' },
                      { code: 'zh', label: '🇨🇳 中文' },
                      { code: 'ar', label: '🇸🇦 عربي' },
                      { code: 'hi', label: '🇮🇳 हिंदी' },
                    ].map(l => (
                      <button key={l.code}
                        className={cn('py-2.5 rounded-xl border-2 text-sm font-semibold transition-all duration-200',
                          l.code === 'en'
                            ? 'border-amber-400 bg-amber-50 text-amber-700'
                            : 'border-stone-200 text-stone-500 hover:border-stone-300')}>
                        {l.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-stone-500 mb-3 font-semibold uppercase tracking-wide">{t.settingsPage.themeLabel}</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button className="py-3 rounded-xl border-2 border-amber-400 bg-amber-50 text-sm font-semibold text-amber-700">
                      {t.settingsPage.lightTheme}
                    </button>
                    <button className="py-3 rounded-xl border-2 border-stone-200 text-sm font-semibold text-stone-500 hover:border-stone-300">
                      {t.settingsPage.darkTheme}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {tab === 4 && (
              <div className="animate-fade-in space-y-5">
                <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                  className="text-lg font-semibold text-stone-900">{t.settingsPage.apiIntegrations}</h2>
                <div className="bg-stone-50 border border-stone-200 rounded-xl p-4">
                  <label className="block text-xs text-stone-500 mb-2 font-semibold uppercase tracking-wide">{t.settingsPage.apiKey}</label>
                  <div className="flex gap-2">
                    <input className="input-field font-mono text-xs" defaultValue="le_sk_••••••••••••••••••••••••••••••••" readOnly />
                    <button className="px-3 py-2 rounded-xl bg-white border border-stone-200 text-xs text-stone-600 hover:bg-stone-50 font-medium whitespace-nowrap">{t.settingsPage.reveal}</button>
                    <button className="px-3 py-2 rounded-xl bg-white border border-stone-200 text-xs text-stone-600 hover:bg-stone-50 font-medium whitespace-nowrap">{t.settingsPage.rotate}</button>
                  </div>
                  <p className="text-xs text-stone-400 mt-2">Keep your API key secure. Do not commit it to public repositories.</p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-stone-800">{t.settingsPage.connectedIntegrations}</h3>
                  {INTEGRATIONS.map(int => (
                    <div key={int.name} className="flex items-center justify-between p-3 rounded-xl border border-stone-200 bg-stone-50 hover:bg-white transition-colors">
                      <span className="text-sm font-medium text-stone-700">{int.name}</span>
                      <div className="flex items-center gap-2">
                        <span className={cn('text-xs font-semibold', int.color)}>{int.status}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 pt-5 border-t border-stone-100 flex justify-end">
              <button onClick={handleSave}
                className={cn('btn-primary flex items-center gap-2 transition-all duration-300',
                  saved ? 'bg-green-600 hover:bg-green-600' : '')}>
                <Save className="w-4 h-4" />
                {saved ? t.settingsPage.saved : t.settingsPage.saveChanges}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

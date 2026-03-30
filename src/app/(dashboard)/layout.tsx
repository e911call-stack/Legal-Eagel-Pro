'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, FolderOpen, FileText, MessageSquare,
  Receipt, AlertTriangle, Settings, LogOut, Bell, Search,
  Menu, X, User, Scale, Shield
} from 'lucide-react';
import { mockUser } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import { useI18n, LanguageSwitcher } from '@/lib/i18n';
import { useAuth } from '@/lib/auth-context';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname   = usePathname();
  const router     = useRouter();
  const { t }      = useI18n();
  const { profile, isClient, signOut, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Redirect clients who somehow land here
  useEffect(() => {
    if (!loading && isClient) router.replace('/portal/dashboard');
  }, [isClient, loading, router]);

  const NAV_ITEMS = [
    { href: '/dashboard', icon: LayoutDashboard, label: t.nav.dashboard },
    { href: '/cases',     icon: FolderOpen,       label: t.nav.cases,     badge: 24 },
    { href: '/documents', icon: FileText,          label: t.nav.documents },
    { href: '/messages',  icon: MessageSquare,     label: t.nav.messages,  badge: 7 },
    { href: '/billing',   icon: Receipt,           label: t.nav.billing },
    { href: '/alerts',    icon: AlertTriangle,     label: t.nav.alerts,    badge: 3, badgeDanger: true },
  ];

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  const displayUser = profile ?? mockUser;
  const roleLabel = profile?.role === 'firm_admin' ? 'Firm Admin' : 'Attorney';

  async function handleSignOut() {
    await signOut();
    router.push('/login');
  }

  function SidebarContent() {
    return (
      <div className="flex flex-col h-full bg-[#0f172a]" style={{ overflow: 'visible' }}>
        {/* Logo */}
        <div className="px-5 py-5 border-b border-white/[0.07] flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center flex-shrink-0">
            <Scale className="w-4 h-4 text-white" />
          </div>
          <div>
            <div style={{ fontFamily: "'Cormorant Garamond',Georgia,serif" }}
              className="text-[17px] font-semibold text-white leading-none tracking-wide">
              Legal Eagle
            </div>
            <div className="text-[9px] text-slate-500 tracking-widest uppercase mt-0.5">{t.brand.tagline}</div>
          </div>
        </div>

        {/* Role badge */}
        <div className="px-4 py-2 border-b border-white/[0.05]">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-1 rounded-full">
            <Shield className="w-2.5 h-2.5" /> {roleLabel}
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-4 overflow-y-auto space-y-0.5">
          <div className="text-[9px] text-slate-600 uppercase tracking-widest px-3 mb-2 font-semibold">
            {t.nav.navigation}
          </div>
          {NAV_ITEMS.map(item => (
            <Link key={item.href} href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={cn('sidebar-nav-item', isActive(item.href) && 'nav-active')}>
              <item.icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span className={cn('text-[9px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center',
                  item.badgeDanger
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30')}>
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
          <div className="border-t border-white/[0.06] my-3" />
          <div className="text-[9px] text-slate-600 uppercase tracking-widest px-3 mb-2 font-semibold">{t.nav.system}</div>
          <Link href="/settings" onClick={() => setSidebarOpen(false)} className="sidebar-nav-item">
            <Settings className="w-4 h-4" /> {t.nav.settings}
          </Link>
        </nav>

        {/* Bottom: lang + user */}
        <div className="px-3 py-3 border-t border-white/[0.07] space-y-2"
          style={{ overflow: 'visible', position: 'relative', zIndex: 1 }}>
          <div className="px-1">
            <LanguageSwitcher />
          </div>
          <div className="flex items-center gap-2.5 px-2 py-2 rounded-xl hover:bg-white/5 transition-colors">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400/30 to-amber-600/20 border border-amber-500/30 flex items-center justify-center flex-shrink-0 text-xs font-bold text-amber-400">
              {displayUser.name?.[0] ?? 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-white truncate">{displayUser.name}</div>
              <div className="text-[10px] text-slate-500 truncate">{displayUser.email}</div>
            </div>
            <button onClick={handleSignOut}
              className="text-slate-600 hover:text-red-400 transition-colors p-1" title={t.nav.logout}>
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center" style={{ background: '#f5f4f0' }}>
        <div className="flex items-center gap-3 text-stone-500">
          <div className="w-5 h-5 border-2 border-amber-300 border-t-amber-600 rounded-full animate-spin" />
          <span className="text-sm">Loading…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#f5f4f0' }}>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-56 xl:w-60 flex-col flex-shrink-0 shadow-xl"
        style={{ overflow: 'visible' }}>
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-64 h-full shadow-2xl" style={{ overflow: 'visible' }}>
            <button onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white z-10">
              <X className="w-5 h-5" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-14 bg-white border-b border-stone-200 flex items-center justify-between px-4 lg:px-6 flex-shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <button className="lg:hidden text-stone-500 hover:text-stone-800" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-5 h-5" />
            </button>
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" />
              <input type="text" placeholder={t.shared.search}
                className="pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-700 placeholder-stone-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 w-64 xl:w-80 transition-all" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="relative p-2 rounded-lg text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition-all">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-200 to-amber-400 border border-amber-300 flex items-center justify-center text-xs font-bold text-amber-800">
              {displayUser.name?.[0] ?? 'U'}
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto" style={{ background: '#f5f4f0' }}>
          {children}
        </main>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, FolderOpen, FileText, MessageSquare, DollarSign, LogOut, Bell, Menu, X, Scale, User, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useI18n, LanguageSwitcher } from '@/lib/i18n';
import { useAuth } from '@/lib/auth-context';

const CLIENT_NAV = [
  { href: '/portal/dashboard', icon: LayoutDashboard, label: 'My Cases' },
  { href: '/portal/documents', icon: FileText,         label: 'Documents' },
  { href: '/portal/messages',  icon: MessageSquare,    label: 'Messages',   badge: 1 },
  { href: '/portal/billing',   icon: DollarSign,       label: 'Billing' },
];

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router   = useRouter();
  const { t }    = useI18n();
  const { profile, isLawyer, isAdmin, signOut, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Redirect non-clients away from this portal
  useEffect(() => {
    if (!loading && (isLawyer || isAdmin)) router.replace('/dashboard');
  }, [isLawyer, isAdmin, loading, router]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  async function handleSignOut() {
    await signOut();
    router.push('/login');
  }

  function SidebarContent() {
    return (
      <div className="flex flex-col h-full bg-[#0f172a]" style={{ overflow: 'visible' }}>
        {/* Logo */}
        <div className="px-5 py-5 border-b border-white/[0.07]">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center flex-shrink-0">
              <Scale className="w-4 h-4 text-white" />
            </div>
            <div>
              <div style={{ fontFamily: "'Cormorant Garamond',Georgia,serif" }}
                className="text-[17px] font-semibold text-white leading-none tracking-wide">Legal Eagle</div>
              <div className="text-[9px] text-slate-500 tracking-widest uppercase mt-0.5">Client Portal</div>
            </div>
          </div>
          {/* Client badge */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-2.5">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 rounded-full bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-[10px] font-bold text-blue-300">
                {profile?.name?.[0] ?? 'C'}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-white truncate">{profile?.name ?? 'Client'}</div>
                <div className="text-[9px] text-slate-500">Client Account</div>
              </div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-4 space-y-0.5">
          <div className="text-[9px] text-slate-600 uppercase tracking-widest px-3 mb-2 font-semibold">My Legal Files</div>
          {CLIENT_NAV.map(item => (
            <Link key={item.href} href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={cn('sidebar-nav-item', isActive(item.href) && 'nav-active')}>
              <item.icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  {item.badge}
                </span>
              )}
            </Link>
          ))}

          <div className="border-t border-white/[0.06] my-3" />
          <div className="text-[9px] text-slate-600 uppercase tracking-widest px-3 mb-2 font-semibold">Support</div>
          <div className="sidebar-nav-item cursor-pointer">
            <HelpCircle className="w-4 h-4 flex-shrink-0" /> Help & FAQ
          </div>
        </nav>

        {/* Bottom */}
        <div className="px-3 py-3 border-t border-white/[0.07] space-y-2"
          style={{ overflow: 'visible', position: 'relative', zIndex: 1 }}>
          <div className="px-1"><LanguageSwitcher /></div>
          <div className="flex items-center gap-2.5 px-2 py-2 rounded-xl hover:bg-white/5 transition-colors">
            <div className="w-7 h-7 rounded-full bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-[10px] font-bold text-blue-300 flex-shrink-0">
              {profile?.name?.[0] ?? 'C'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-white truncate">{profile?.name ?? 'Client'}</div>
              <div className="text-[10px] text-slate-500 truncate">{profile?.email}</div>
            </div>
            <button onClick={handleSignOut} className="text-slate-600 hover:text-red-400 transition-colors p-1" title="Sign out">
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
          <div className="w-5 h-5 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin" />
          <span className="text-sm">Loading your portal…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#f5f4f0' }}>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-56 xl:w-60 flex-col flex-shrink-0 shadow-xl" style={{ overflow: 'visible' }}>
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
            <div className="hidden sm:flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-xl px-3 py-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              <span className="text-xs text-blue-700 font-semibold">Client Portal</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="relative p-2 rounded-lg text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition-all">
              <Bell className="w-4 h-4" />
            </button>
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-200 to-blue-400 border border-blue-300 flex items-center justify-center text-xs font-bold text-blue-800">
              {profile?.name?.[0] ?? 'C'}
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

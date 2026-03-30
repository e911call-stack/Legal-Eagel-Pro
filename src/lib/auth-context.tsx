'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase';
import type { Session, User } from '@supabase/supabase-js';

export type UserRole = 'client' | 'lawyer' | 'firm_admin';

export interface AuthProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  firm_id: string | null;
  language: 'en' | 'ar' | 'es' | 'zh' | 'hi';
}

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  profile: AuthProfile | null;
  role: UserRole;
  isClient: boolean;
  isLawyer: boolean;
  isAdmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signInWithMagicLink: (email: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  session: null, user: null, profile: null,
  role: 'client', isClient: true, isLawyer: false, isAdmin: false,
  loading: true,
  signIn: async () => ({ error: null }),
  signInWithMagicLink: async () => ({ error: null }),
  signOut: async () => {},
});

// ─── Demo profiles ────────────────────────────────────────────────────────────
const DEMO_PROFILES: Record<string, AuthProfile> = {
  'lawyer@demo.com': { id: 'demo-lawyer-1', email: 'lawyer@demo.com', name: 'Sarah Chen',     role: 'lawyer',     firm_id: 'firm-demo-1', language: 'en' },
  'client@demo.com': { id: 'demo-client-1', email: 'client@demo.com', name: 'James Harrison', role: 'client',     firm_id: null,          language: 'en' },
  'admin@demo.com':  { id: 'demo-admin-1',  email: 'admin@demo.com',  name: 'Admin User',     role: 'firm_admin', firm_id: 'firm-demo-1', language: 'en' },
};

function getDemoProfile(email: string): AuthProfile | null {
  if (DEMO_PROFILES[email]) return DEMO_PROFILES[email];
  if (email.endsWith('@demo.com')) return { ...DEMO_PROFILES['lawyer@demo.com'], email, name: email.split('@')[0] };
  return null;
}

// ─── Cookie helpers (client-side) ─────────────────────────────────────────────
// The middleware reads this cookie to recognise demo sessions without Supabase.
const DEMO_COOKIE = 'le_demo_role';

function setDemoCookie(role: UserRole) {
  // Max-age 8 hours; SameSite=Lax so it works on navigation
  document.cookie = `${DEMO_COOKIE}=${role}; path=/; max-age=28800; SameSite=Lax`;
}

function clearDemoCookie() {
  document.cookie = `${DEMO_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}

// ─── Has real Supabase? ────────────────────────────────────────────────────────
const HAS_SUPABASE =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co';

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession]         = useState<Session | null>(null);
  const [user, setUser]               = useState<User | null>(null);
  const [profile, setProfile]         = useState<AuthProfile | null>(null);
  const [demoProfile, setDemoProfile] = useState<AuthProfile | null>(null);
  const [loading, setLoading]         = useState(true);
  const supabase = createClient();

  // ── On mount: check for an existing demo cookie (page refresh) ──────────────
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${DEMO_COOKIE}=([^;]+)`));
    if (match) {
      const role = match[1] as UserRole;
      // Re-hydrate a sensible profile from the cookie role
      const fallback = Object.values(DEMO_PROFILES).find(p => p.role === role) ?? DEMO_PROFILES['lawyer@demo.com'];
      setDemoProfile(fallback);
      setProfile(fallback);
    }
    setLoading(false);
  }, []);

  // ── Real Supabase session listener ──────────────────────────────────────────
  useEffect(() => {
    if (!HAS_SUPABASE) { setLoading(false); return; }

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (!s) { setLoading(false); return; }
      supabase.from('users').select('id, name, email, role, firm_id, language')
        .eq('id', s.user.id).single()
        .then(({ data }) => { if (data) setProfile(data as AuthProfile); setLoading(false); });
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (!s) { setProfile(null); setLoading(false); return; }
      const { data } = await supabase.from('users').select('id, name, email, role, firm_id, language')
        .eq('id', s.user.id).single();
      if (data) setProfile(data as AuthProfile);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  // ── signIn ───────────────────────────────────────────────────────────────────
  const signIn = useCallback(async (email: string, password: string) => {
    // Demo emails ALWAYS bypass Supabase
    const demo = getDemoProfile(email);
    if (demo) {
      setDemoCookie(demo.role);    // ← lets middleware pass the request
      setDemoProfile(demo);
      setProfile(demo);
      setLoading(false);
      return { error: null };
    }

    if (!HAS_SUPABASE) {
      return { error: 'No Supabase configured. Use a @demo.com email to try the demo.' };
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  }, [supabase]);

  // ── signInWithMagicLink ──────────────────────────────────────────────────────
  const signInWithMagicLink = useCallback(async (email: string) => {
    const demo = getDemoProfile(email);
    if (demo) {
      setDemoCookie(demo.role);
      setDemoProfile(demo);
      setProfile(demo);
      setLoading(false);
      return { error: null };
    }

    if (!HAS_SUPABASE) {
      return { error: 'No Supabase configured. Use a @demo.com email to try the demo.' };
    }

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/api/auth/callback` },
    });
    return { error: error?.message ?? null };
  }, [supabase]);

  // ── signOut ──────────────────────────────────────────────────────────────────
  const signOut = useCallback(async () => {
    clearDemoCookie();
    setDemoProfile(null);
    setProfile(null);
    if (HAS_SUPABASE) await supabase.auth.signOut();
  }, [supabase]);

  const activeProfile = demoProfile ?? profile;
  const role = activeProfile?.role ?? 'client';

  return (
    <AuthContext.Provider value={{
      session, user, profile: activeProfile, role,
      isClient: role === 'client',
      isLawyer: role === 'lawyer',
      isAdmin:  role === 'firm_admin',
      loading:  false, // never block the UI — middleware handles auth
      signIn, signInWithMagicLink, signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

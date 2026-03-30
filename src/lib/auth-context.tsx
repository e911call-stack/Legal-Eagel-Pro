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

// ─── Demo profiles — always available regardless of env ────────────────────
// Any email ending in @demo.com bypasses Supabase entirely.
const DEMO_PROFILES: Record<string, AuthProfile> = {
  'lawyer@demo.com': {
    id: 'demo-lawyer-1', email: 'lawyer@demo.com',
    name: 'Sarah Chen', role: 'lawyer',
    firm_id: 'firm-demo-1', language: 'en',
  },
  'client@demo.com': {
    id: 'demo-client-1', email: 'client@demo.com',
    name: 'James Harrison', role: 'client',
    firm_id: null, language: 'en',
  },
  'admin@demo.com': {
    id: 'demo-admin-1', email: 'admin@demo.com',
    name: 'Admin User', role: 'firm_admin',
    firm_id: 'firm-demo-1', language: 'en',
  },
};

/** Returns a demo profile if the email is a known demo address, null otherwise. */
function getDemoProfile(email: string): AuthProfile | null {
  if (DEMO_PROFILES[email]) return DEMO_PROFILES[email];
  // Also match any @demo.com email → lawyer by default
  if (email.endsWith('@demo.com')) {
    return { ...DEMO_PROFILES['lawyer@demo.com'], email, name: email.split('@')[0] };
  }
  return null;
}

const HAS_SUPABASE =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession]       = useState<Session | null>(null);
  const [user, setUser]             = useState<User | null>(null);
  const [profile, setProfile]       = useState<AuthProfile | null>(null);
  const [demoProfile, setDemoProfile] = useState<AuthProfile | null>(null);
  const [loading, setLoading]       = useState(true);
  const supabase = createClient();

  const loadProfile = useCallback(async (userId: string, userEmail?: string) => {
    if (!HAS_SUPABASE) { setLoading(false); return; }

    const { data } = await supabase
      .from('users')
      .select('id, name, email, role, firm_id, language')
      .eq('id', userId)
      .single();

    if (data) setProfile(data as AuthProfile);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    if (!HAS_SUPABASE) { setLoading(false); return; }

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) loadProfile(s.user.id, s.user.email ?? undefined);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, s) => {
        setSession(s);
        setUser(s?.user ?? null);
        if (s?.user) await loadProfile(s.user.id, s.user.email ?? undefined);
        else { setProfile(null); setLoading(false); }
      }
    );

    return () => subscription.unsubscribe();
  }, [loadProfile, supabase]);

  // ── signIn ─────────────────────────────────────────────────────────────────
  const signIn = useCallback(async (email: string, password: string) => {
    // ALWAYS check demo profiles first — works even if Supabase IS configured
    const demo = getDemoProfile(email);
    if (demo) {
      setDemoProfile(demo);
      setProfile(demo);
      setLoading(false);
      return { error: null };
    }

    if (!HAS_SUPABASE) {
      return { error: 'No Supabase configured. Use a @demo.com email to try the demo.' };
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return { error: null };
  }, [supabase]);

  // ── signInWithMagicLink ────────────────────────────────────────────────────
  const signInWithMagicLink = useCallback(async (email: string) => {
    const demo = getDemoProfile(email);
    if (demo) {
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

  // ── signOut ────────────────────────────────────────────────────────────────
  const signOut = useCallback(async () => {
    setDemoProfile(null);
    setProfile(null);
    if (HAS_SUPABASE) await supabase.auth.signOut();
  }, [supabase]);

  const activeProfile = demoProfile ?? profile;
  const role = activeProfile?.role ?? 'client';

  return (
    <AuthContext.Provider value={{
      session, user,
      profile: activeProfile,
      role,
      isClient:  role === 'client',
      isLawyer:  role === 'lawyer',
      isAdmin:   role === 'firm_admin',
      loading:   !HAS_SUPABASE ? false : loading,
      signIn, signInWithMagicLink, signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

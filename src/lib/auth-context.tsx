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

// ─── Demo fallback profiles (used when Supabase isn't configured) ──────────
const DEMO_PROFILES: Record<string, AuthProfile> = {
  'lawyer@demo.com': {
    id: 'demo-lawyer-1',
    email: 'lawyer@demo.com',
    name: 'Sarah Chen',
    role: 'lawyer',
    firm_id: 'firm-demo-1',
    language: 'en',
  },
  'client@demo.com': {
    id: 'demo-client-1',
    email: 'client@demo.com',
    name: 'James Harrison',
    role: 'client',
    firm_id: null,
    language: 'en',
  },
  'admin@demo.com': {
    id: 'demo-admin-1',
    email: 'admin@demo.com',
    name: 'Admin User',
    role: 'firm_admin',
    firm_id: 'firm-demo-1',
    language: 'en',
  },
};

const IS_DEMO = !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://placeholder.supabase.co';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession]   = useState<Session | null>(null);
  const [user, setUser]         = useState<User | null>(null);
  const [profile, setProfile]   = useState<AuthProfile | null>(null);
  const [loading, setLoading]   = useState(true);
  const supabase = createClient();

  const loadProfile = useCallback(async (userId: string, userEmail?: string) => {
    // Demo mode — derive profile from email
    if (IS_DEMO && userEmail && DEMO_PROFILES[userEmail]) {
      setProfile(DEMO_PROFILES[userEmail]);
      return;
    }

    const { data } = await supabase
      .from('users')
      .select('id, name, email, role, firm_id, language')
      .eq('id', userId)
      .single();

    if (data) setProfile(data as AuthProfile);
  }, [supabase]);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) loadProfile(s.user.id, s.user.email);
      else setLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, s) => {
        setSession(s);
        setUser(s?.user ?? null);
        if (s?.user) await loadProfile(s.user.id, s.user.email);
        else setProfile(null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [loadProfile, supabase]);

  // ── DEMO MODE sign-in ──────────────────────────────────────
  const [demoProfile, setDemoProfile] = useState<AuthProfile | null>(null);

  const signIn = useCallback(async (email: string, password: string) => {
    if (IS_DEMO) {
      const demo = DEMO_PROFILES[email] ??
        // Any unknown email in demo → lawyer role
        { ...DEMO_PROFILES['lawyer@demo.com'], email, name: email.split('@')[0] };
      setDemoProfile(demo);
      setProfile(demo);
      setLoading(false);
      return { error: null };
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  }, [supabase]);

  const signInWithMagicLink = useCallback(async (email: string) => {
    if (IS_DEMO) {
      const demo = DEMO_PROFILES[email] ?? DEMO_PROFILES['lawyer@demo.com'];
      setDemoProfile(demo);
      setProfile(demo);
      setLoading(false);
      return { error: null };
    }

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    return { error: error?.message ?? null };
  }, [supabase]);

  const signOut = useCallback(async () => {
    setDemoProfile(null);
    setProfile(null);
    if (!IS_DEMO) await supabase.auth.signOut();
  }, [supabase]);

  // Use demoProfile OR real profile
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
      loading:   IS_DEMO ? false : loading,
      signIn, signInWithMagicLink, signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

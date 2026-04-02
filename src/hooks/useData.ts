'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase';
import type { Case, AIAlert, DashboardStats } from '@/types';

// ─── Generic async state shape ────────────────────────────────────────────────
export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

// ─── Demo-mode guard ──────────────────────────────────────────────────────────
// When Supabase isn't configured (no real URL), fall back to mock data silently.
const IS_DEMO =
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://placeholder.supabase.co';

// ─── useCases ─────────────────────────────────────────────────────────────────
export interface UseCasesOptions {
  firmId?: string;
  status?: string;
  practiceArea?: string;
  riskLevel?: string;
  searchQuery?: string;
  /** Fall back to these when Supabase isn't configured */
  fallbackData?: Case[];
}

export function useCases(opts: UseCasesOptions = {}): AsyncState<Case[]> {
  const [data, setData]     = useState<Case[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState<string | null>(null);
  const abortRef            = useRef<AbortController | null>(null);
  const supabase = createClient();

  const fetch = useCallback(async () => {
    // Demo mode — use fallback immediately
    if (IS_DEMO) {
      setData(opts.fallbackData ?? []);
      setLoading(false);
      return;
    }

    // Cancel any in-flight request
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('cases')
        .select(`
          id, title, practice_area, status, risk_score, risk_category,
          budget, billing_model, created_at, updated_at, firm_id,
          case_clients (
            user_id,
            users ( name )
          ),
          case_lawyers (
            user_id,
            users ( name )
          )
        `)
        .order('updated_at', { ascending: false });

      if (opts.firmId)       query = query.eq('firm_id', opts.firmId);
      if (opts.status && opts.status !== 'all') query = query.eq('status', opts.status);
      if (opts.practiceArea && opts.practiceArea !== 'all') query = query.eq('practice_area', opts.practiceArea);

      const { data: rows, error: dbError } = await query;

      if (dbError) throw new Error(dbError.message);

      // Flatten joined relations into flat Case objects the UI expects
      const cases: Case[] = (rows ?? []).map(r => {
        const clientName = r.case_clients?.[0]?.users?.name ?? null;
        const lawyerName = r.case_lawyers?.[0]?.users?.name ?? null;
        return {
          ...r,
          client_name: clientName,
          lawyer_name: lawyerName,
          last_activity: r.updated_at,
        } as unknown as Case;
      });

      // Client-side risk filter (DB doesn't store risk_level as a column)
      let filtered = cases;
      if (opts.riskLevel && opts.riskLevel !== 'all') {
        filtered = cases.filter(c => {
          const level =
            c.risk_score >= 70 ? 'high' :
            c.risk_score >= 40 ? 'medium' : 'low';
          return level === opts.riskLevel;
        });
      }

      // Client-side search
      if (opts.searchQuery?.trim()) {
        const q = opts.searchQuery.toLowerCase();
        filtered = filtered.filter(c =>
          c.title.toLowerCase().includes(q) ||
          (c.client_name?.toLowerCase().includes(q)) ||
          c.practice_area.toLowerCase().includes(q)
        );
      }

      setData(filtered);
    } catch (err: unknown) {
      if ((err as Error).name === 'AbortError') return;
      setError((err as Error).message ?? 'Failed to load cases');
      // On error, fall back to provided mock data if any
      if (opts.fallbackData) setData(opts.fallbackData);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opts.firmId, opts.status, opts.practiceArea, opts.riskLevel, opts.searchQuery]);

  useEffect(() => { fetch(); }, [fetch]);
  useEffect(() => () => { abortRef.current?.abort(); }, []);

  return { data, loading, error, refetch: fetch };
}

// ─── useDashboardStats ────────────────────────────────────────────────────────
export interface UseDashboardStatsOptions {
  firmId?: string;
  fallbackData?: DashboardStats;
}

export function useDashboardStats(opts: UseDashboardStatsOptions = {}): AsyncState<DashboardStats> {
  const [data, setData]       = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const supabase = createClient();

  const fetch = useCallback(async () => {
    if (IS_DEMO) {
      setData(opts.fallbackData ?? null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // Run 3 parallel queries
      const [casesRes, msgsRes, tasksRes] = await Promise.all([
        supabase
          .from('cases')
          .select('id, status, risk_score')
          .eq('firm_id', opts.firmId ?? ''),
        supabase
          .from('messages')
          .select('id, status')
          .eq('status', 'sent'),
        supabase
          .from('tasks')
          .select('id, status, case_id')
          .neq('status', 'done'),
      ]);

      const cases = casesRes.data ?? [];
      const stats: DashboardStats = {
        total_cases:    cases.length,
        active_cases:   cases.filter(c => c.status !== 'closed').length,
        high_risk_cases:cases.filter(c => c.risk_score >= 70).length,
        pending_messages: msgsRes.data?.length ?? 0,
        pending_tasks:  tasksRes.data?.length ?? 0,
        alerts_today:   0, // fetched separately in useAlerts
      };
      setData(stats);
    } catch (err: unknown) {
      setError((err as Error).message);
      if (opts.fallbackData) setData(opts.fallbackData);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opts.firmId]);

  useEffect(() => { fetch(); }, [fetch]);
  return { data, loading, error, refetch: fetch };
}

// ─── useAlerts ────────────────────────────────────────────────────────────────
export interface UseAlertsOptions {
  firmId?: string;
  resolved?: boolean;
  fallbackData?: AIAlert[];
}

export function useAlerts(opts: UseAlertsOptions = {}): AsyncState<AIAlert[]> {
  const [data, setData]       = useState<AIAlert[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const supabase = createClient();

  const fetch = useCallback(async () => {
    if (IS_DEMO) {
      setData(opts.fallbackData ?? []);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('ai_alerts')
        .select(`
          id, type, risk_level, description, resolved, resolved_by, resolved_at, created_at, case_id,
          cases ( title )
        `)
        .order('created_at', { ascending: false });

      if (typeof opts.resolved === 'boolean') {
        query = query.eq('resolved', opts.resolved);
      }

      const { data: rows, error: dbError } = await query;
      if (dbError) throw new Error(dbError.message);

      const alerts: AIAlert[] = (rows ?? []).map(r => ({
        ...r,
        case_title: (r.cases as unknown as { title: string } | null)?.title ?? '',
      }) as unknown as AIAlert);

      setData(alerts);
    } catch (err: unknown) {
      setError((err as Error).message);
      if (opts.fallbackData) setData(opts.fallbackData);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opts.firmId, opts.resolved]);

  useEffect(() => { fetch(); }, [fetch]);
  return { data, loading, error, refetch: fetch };
}

// ─── useCase (single case detail) ─────────────────────────────────────────────
export function useCase(caseId: string, fallbackData?: Case): AsyncState<Case> {
  const [data, setData]       = useState<Case | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const supabase = createClient();

  const fetch = useCallback(async () => {
    if (IS_DEMO) {
      setData(fallbackData ?? null);
      setLoading(false);
      return;
    }
    if (!caseId) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    try {
      const { data: row, error: dbError } = await supabase
        .from('cases')
        .select(`
          id, title, practice_area, status, risk_score, risk_category,
          budget, billing_model, created_at, updated_at, firm_id,
          case_clients ( user_id, users ( name, email ) ),
          case_lawyers ( user_id, users ( name, email ) )
        `)
        .eq('id', caseId)
        .single();

      if (dbError) throw new Error(dbError.message);

      setData({
        ...row,
        client_name: (row.case_clients as unknown as Array<{ users: { name: string } }>)?.[0]?.users?.name ?? null,
        lawyer_name: (row.case_lawyers as unknown as Array<{ users: { name: string } }>)?.[0]?.users?.name ?? null,
        last_activity: row.updated_at,
      } as unknown as Case);
    } catch (err: unknown) {
      setError((err as Error).message);
      if (fallbackData) setData(fallbackData);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseId]);

  useEffect(() => { fetch(); }, [fetch]);
  return { data, loading, error, refetch: fetch };
}

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatDistanceToNow, format } from 'date-fns';
import type { RiskLevel, CaseStatus, TaskStatus } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string) {
  return format(new Date(date), 'MMM d, yyyy');
}

export function formatDateTime(date: string) {
  return format(new Date(date), 'MMM d, yyyy · h:mm a');
}

export function timeAgo(date: string) {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

// ─── Light-mode color helpers ────────────────────────────────
export function riskColor(level: RiskLevel | string) {
  switch (level) {
    case 'high':   return 'text-red-700 bg-red-50 border-red-200';
    case 'medium': return 'text-amber-700 bg-amber-50 border-amber-200';
    case 'low':    return 'text-green-700 bg-green-50 border-green-200';
    default:       return 'text-stone-500 bg-stone-100 border-stone-200';
  }
}

export function riskDot(level: RiskLevel | string) {
  switch (level) {
    case 'high':   return 'bg-red-500';
    case 'medium': return 'bg-amber-500';
    case 'low':    return 'bg-green-500';
    default:       return 'bg-stone-400';
  }
}

export function statusColor(status: CaseStatus | string) {
  switch (status) {
    case 'open':       return 'text-blue-700 bg-blue-50 border-blue-200';
    case 'pre_filing': return 'text-violet-700 bg-violet-50 border-violet-200';
    case 'in_court':   return 'text-amber-700 bg-amber-50 border-amber-200';
    case 'closed':     return 'text-stone-500 bg-stone-100 border-stone-200';
    default:           return 'text-stone-500 bg-stone-100 border-stone-200';
  }
}

export function taskStatusColor(status: TaskStatus | string) {
  switch (status) {
    case 'done':        return 'text-green-700 bg-green-50';
    case 'in_progress': return 'text-blue-700 bg-blue-50';
    default:            return 'text-stone-500 bg-stone-100';
  }
}

export function formatStatus(status: string) {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function formatCurrency(cents: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
}

export function formatMinutes(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

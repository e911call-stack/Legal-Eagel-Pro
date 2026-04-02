'use client';

import { cn } from '@/lib/utils';

// ─── Base pulse block ─────────────────────────────────────────────────────────
function Pulse({ className }: { className?: string }) {
  return (
    <div className={cn('animate-pulse rounded-lg bg-stone-200', className)} />
  );
}

// ─── Case card skeleton ───────────────────────────────────────────────────────
export function CaseCardSkeleton() {
  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm">
      {/* Top row: risk dot + status badge */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-stone-200 animate-pulse" />
          <Pulse className="h-5 w-16" />
        </div>
        <Pulse className="h-5 w-14" />
      </div>
      {/* Title */}
      <Pulse className="h-4 w-3/4 mb-1.5" />
      <Pulse className="h-3 w-1/3 mb-4" />
      {/* Meta rows */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between">
          <Pulse className="h-3 w-12" />
          <Pulse className="h-3 w-24" />
        </div>
        <div className="flex justify-between">
          <Pulse className="h-3 w-14" />
          <Pulse className="h-3 w-20" />
        </div>
        <div className="flex justify-between">
          <Pulse className="h-3 w-16" />
          <Pulse className="h-3 w-16" />
        </div>
      </div>
      {/* Risk bar */}
      <div className="mb-1.5">
        <div className="flex justify-between mb-1">
          <Pulse className="h-2.5 w-14" />
          <Pulse className="h-2.5 w-10" />
        </div>
        <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
          <Pulse className="h-full w-1/3 rounded-full" />
        </div>
      </div>
      {/* Footer */}
      <div className="mt-3 pt-3 border-t border-stone-100 flex justify-end">
        <Pulse className="h-3 w-20" />
      </div>
    </div>
  );
}

// ─── Cases grid skeleton ──────────────────────────────────────────────────────
export function CasesGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <CaseCardSkeleton key={i} />
      ))}
    </div>
  );
}

// ─── Dashboard stat card skeleton ────────────────────────────────────────────
export function StatCardSkeleton() {
  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-sm">
      <Pulse className="w-9 h-9 rounded-xl mb-3" />
      <Pulse className="h-7 w-16 mb-1.5" />
      <Pulse className="h-3 w-24" />
    </div>
  );
}

export function StatCardsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <StatCardSkeleton key={i} />
      ))}
    </div>
  );
}

// ─── Alert item skeleton ──────────────────────────────────────────────────────
export function AlertItemSkeleton() {
  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <Pulse className="w-9 h-9 rounded-xl flex-shrink-0" />
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <Pulse className="h-4 w-1/3" />
            <Pulse className="h-5 w-14" />
          </div>
          <Pulse className="h-3 w-full mb-1.5" />
          <Pulse className="h-3 w-3/4 mb-3" />
          <div className="flex items-center justify-between">
            <Pulse className="h-3 w-20" />
            <Pulse className="h-7 w-20 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function AlertListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <AlertItemSkeleton key={i} />
      ))}
    </div>
  );
}

// ─── Table row skeleton ───────────────────────────────────────────────────────
export function TableRowSkeleton({ cols = 4 }: { cols?: number }) {
  return (
    <tr className="border-b border-stone-100">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-5 py-4">
          <Pulse className={cn('h-3', i === 0 ? 'w-36' : i === cols - 1 ? 'w-16' : 'w-24')} />
        </td>
      ))}
    </tr>
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <tbody>
      {Array.from({ length: rows }).map((_, i) => (
        <TableRowSkeleton key={i} cols={cols} />
      ))}
    </tbody>
  );
}

// ─── Message bubble skeleton ──────────────────────────────────────────────────
export function MessageSkeleton({ align = 'left' }: { align?: 'left' | 'right' }) {
  const isRight = align === 'right';
  return (
    <div className={cn('flex gap-3', isRight && 'flex-row-reverse')}>
      <Pulse className="w-8 h-8 rounded-full flex-shrink-0" />
      <div className={cn('space-y-1.5', isRight && 'items-end flex flex-col')}>
        <Pulse className={cn('h-3 w-20', isRight && 'self-end')} />
        <Pulse className={cn('h-12 rounded-2xl', isRight ? 'w-48 rounded-tr-sm' : 'w-56 rounded-tl-sm')} />
      </div>
    </div>
  );
}

// ─── Case detail skeleton (full page) ────────────────────────────────────────
export function CaseDetailSkeleton() {
  return (
    <div className="p-5 lg:p-7">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <Pulse className="w-8 h-8 rounded-xl" />
        <div className="flex-1">
          <Pulse className="h-6 w-64 mb-1.5" />
          <Pulse className="h-3 w-40" />
        </div>
        <Pulse className="h-9 w-32 rounded-xl" />
      </div>
      {/* Risk banner */}
      <Pulse className="h-14 w-full rounded-2xl mb-5" />
      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {[0,1,2,3].map(i => <Pulse key={i} className="h-16 rounded-2xl" />)}
      </div>
      {/* Tabs */}
      <div className="flex gap-1 mb-5">
        {[0,1,2,3,4].map(i => <Pulse key={i} className="h-9 w-24 rounded-xl" />)}
      </div>
      {/* Content */}
      <div className="space-y-3">
        {[0,1,2,3].map(i => <Pulse key={i} className={cn('h-16 rounded-xl', i === 1 && 'w-5/6')} />)}
      </div>
    </div>
  );
}

// ─── Generic page skeleton ────────────────────────────────────────────────────
export function PageSkeleton() {
  return (
    <div className="p-5 lg:p-7 animate-pulse">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Pulse className="h-7 w-40 mb-2" />
          <Pulse className="h-3 w-24" />
        </div>
        <Pulse className="h-9 w-28 rounded-xl" />
      </div>
      <StatCardsSkeleton />
      <div className="mt-6">
        <CasesGridSkeleton count={6} />
      </div>
    </div>
  );
}

// ─── Inline error state ───────────────────────────────────────────────────────
export function InlineError({
  message,
  onRetry,
  className,
}: {
  message: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 text-center', className)}>
      <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center mb-4">
        <span className="text-2xl">⚠️</span>
      </div>
      <p className="text-sm font-semibold text-stone-700 mb-1">Something went wrong</p>
      <p className="text-xs text-stone-400 max-w-xs mb-4 leading-relaxed">{message}</p>
      {onRetry && (
        <button onClick={onRetry}
          className="text-xs text-amber-600 hover:text-amber-700 font-semibold border border-amber-200 hover:border-amber-400 rounded-xl px-4 py-2 transition-all">
          Try again
        </button>
      )}
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
export function EmptyState({
  icon = '📁',
  title,
  description,
  action,
}: {
  icon?: string;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="text-5xl mb-4">{icon}</div>
      <p className="text-base font-semibold text-stone-700 mb-1">{title}</p>
      {description && (
        <p className="text-sm text-stone-400 max-w-xs leading-relaxed mb-5">{description}</p>
      )}
      {action && (
        <button onClick={action.onClick}
          className="text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl px-5 py-2.5 transition-all shadow-sm">
          {action.label}
        </button>
      )}
    </div>
  );
}

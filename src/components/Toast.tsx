'use client';

import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────
export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
  duration?: number;
  action?: { label: string; onClick: () => void };
}

type ToastContextValue = {
  toasts: Toast[];
  toast: (message: string, variant?: ToastVariant, opts?: Partial<Toast>) => void;
  success: (message: string, opts?: Partial<Toast>) => void;
  error: (message: string, opts?: Partial<Toast>) => void;
  warning: (message: string, opts?: Partial<Toast>) => void;
  info: (message: string, opts?: Partial<Toast>) => void;
  dismiss: (id: string) => void;
};

const ToastContext = createContext<ToastContextValue>({
  toasts: [],
  toast:   () => {},
  success: () => {},
  error:   () => {},
  warning: () => {},
  info:    () => {},
  dismiss: () => {},
});

// ─── Provider ─────────────────────────────────────────────────────────────────
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
    const timer = timersRef.current.get(id);
    if (timer) { clearTimeout(timer); timersRef.current.delete(id); }
  }, []);

  const toast = useCallback((
    message: string,
    variant: ToastVariant = 'info',
    opts: Partial<Toast> = {}
  ) => {
    const id       = Math.random().toString(36).slice(2);
    const duration = opts.duration ?? (variant === 'error' ? 6000 : 4000);

    setToasts(prev => [...prev.slice(-4), { id, message, variant, duration, ...opts }]);

    if (duration > 0) {
      const timer = setTimeout(() => dismiss(id), duration);
      timersRef.current.set(id, timer);
    }
  }, [dismiss]);

  const success = useCallback((m: string, o?: Partial<Toast>) => toast(m, 'success', o), [toast]);
  const error   = useCallback((m: string, o?: Partial<Toast>) => toast(m, 'error', o), [toast]);
  const warning = useCallback((m: string, o?: Partial<Toast>) => toast(m, 'warning', o), [toast]);
  const info    = useCallback((m: string, o?: Partial<Toast>) => toast(m, 'info', o), [toast]);

  // Cleanup timers on unmount
  useEffect(() => {
    const timers = timersRef.current;
    return () => { timers.forEach(t => clearTimeout(t)); };
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, toast, success, error, warning, info, dismiss }}>
      {children}
      <ToastContainer toasts={toasts} dismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

// ─── Icon map ─────────────────────────────────────────────────────────────────
const ICONS: Record<ToastVariant, React.ElementType> = {
  success: CheckCircle,
  error:   AlertCircle,
  warning: AlertTriangle,
  info:    Info,
};

const STYLES: Record<ToastVariant, { container: string; icon: string; bar: string }> = {
  success: { container: 'bg-white border-green-200',  icon: 'text-green-600', bar: 'bg-green-500' },
  error:   { container: 'bg-white border-red-200',    icon: 'text-red-600',   bar: 'bg-red-500'   },
  warning: { container: 'bg-white border-amber-200',  icon: 'text-amber-600', bar: 'bg-amber-500' },
  info:    { container: 'bg-white border-blue-200',   icon: 'text-blue-600',  bar: 'bg-blue-500'  },
};

// ─── Individual toast ─────────────────────────────────────────────────────────
function ToastItem({ toast, dismiss }: { toast: Toast; dismiss: (id: string) => void }) {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(100);
  const Icon = ICONS[toast.variant];
  const s    = STYLES[toast.variant];

  // Enter animation
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  // Progress bar
  useEffect(() => {
    if (!toast.duration || toast.duration <= 0) return;
    const interval = 50;
    const decrement = (interval / toast.duration) * 100;
    const timer = setInterval(() => {
      setProgress(p => {
        if (p <= 0) { clearInterval(timer); return 0; }
        return p - decrement;
      });
    }, interval);
    return () => clearInterval(timer);
  }, [toast.duration]);

  return (
    <div
      role="alert"
      aria-live="polite"
      style={{ transform: visible ? 'translateX(0)' : 'translateX(120%)', opacity: visible ? 1 : 0, transition: 'all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
      className={cn(
        'relative w-80 rounded-2xl border shadow-xl overflow-hidden',
        s.container
      )}
    >
      {/* Progress bar */}
      {toast.duration && toast.duration > 0 && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-stone-100">
          <div
            className={cn('h-full transition-all', s.bar)}
            style={{ width: `${progress}%`, transition: 'width 50ms linear' }}
          />
        </div>
      )}

      <div className="flex items-start gap-3 p-4 pt-5">
        <Icon className={cn('w-5 h-5 flex-shrink-0 mt-0.5', s.icon)} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-stone-800 leading-snug">{toast.message}</p>
          {toast.action && (
            <button
              onClick={() => { toast.action!.onClick(); dismiss(toast.id); }}
              className={cn('text-xs font-semibold mt-1.5 transition-opacity hover:opacity-80', s.icon)}
            >
              {toast.action.label} →
            </button>
          )}
        </div>
        <button
          onClick={() => dismiss(toast.id)}
          className="flex-shrink-0 text-stone-400 hover:text-stone-600 transition-colors -mt-0.5 -mr-0.5 p-0.5 rounded-lg hover:bg-stone-100"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ─── Container ────────────────────────────────────────────────────────────────
function ToastContainer({ toasts, dismiss }: { toasts: Toast[]; dismiss: (id: string) => void }) {
  if (toasts.length === 0) return null;

  return (
    <div
      aria-label="Notifications"
      className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 items-end"
      style={{ pointerEvents: 'none' }}
    >
      {toasts.map(t => (
        <div key={t.id} style={{ pointerEvents: 'auto' }}>
          <ToastItem toast={t} dismiss={dismiss} />
        </div>
      ))}
    </div>
  );
}

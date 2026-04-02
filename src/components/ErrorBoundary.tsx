'use client';

import React from 'react';
import { Scale, RefreshCw } from 'lucide-react';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, info: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info);
    this.props.onError?.(error, info);
    // In production: send to Sentry / logging service here
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center mb-5 shadow-lg">
            <Scale className="w-8 h-8 text-white" />
          </div>

          <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            className="text-2xl font-semibold text-stone-900 mb-2">
            Something went wrong
          </h2>
          <p className="text-sm text-stone-500 max-w-sm leading-relaxed mb-6">
            An unexpected error occurred in this section. Your data is safe — this is a display error only.
          </p>

          {process.env.NODE_ENV === 'development' && this.state.error && (
            <div className="w-full max-w-lg text-left mb-6">
              <details className="bg-red-50 border border-red-200 rounded-xl p-4 text-xs font-mono text-red-800">
                <summary className="font-bold cursor-pointer mb-2">Error details (dev only)</summary>
                <pre className="whitespace-pre-wrap overflow-auto max-h-40">
                  {this.state.error.message}
                  {'\n\n'}
                  {this.state.error.stack}
                </pre>
              </details>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={this.handleReset}
              className="flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-semibold transition-all shadow-sm"
            >
              <RefreshCw className="w-4 h-4" />
              Try again
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 border border-stone-200 text-stone-600 hover:bg-stone-50 rounded-xl text-sm font-semibold transition-all"
            >
              Reload page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// ─── Convenience wrapper for functional components ────────────────────────────
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ReactNode
) {
  return function WrappedComponent(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}

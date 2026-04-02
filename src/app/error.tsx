'use client';

import { useEffect } from 'react';
import { Scale, RefreshCw, ArrowLeft } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to monitoring service in production
    console.error('[Global Error]', error);
  }, [error]);

  return (
    <html>
      <body style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", background: '#f5f4f0', margin: 0 }}>
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div style={{ textAlign: 'center', maxWidth: '400px' }}>
            <div style={{ width: 64, height: 64, borderRadius: 16, background: 'linear-gradient(135deg, #fbbf24, #d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <Scale style={{ width: 32, height: 32, color: 'white' }} />
            </div>
            <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 28, fontWeight: 600, color: '#1a1714', marginBottom: 8 }}>
              Unexpected Error
            </h1>
            <p style={{ fontSize: 14, color: '#9c9890', lineHeight: 1.6, marginBottom: 24 }}>
              Legal Eagle encountered an unexpected error. Your data is safe. Please try refreshing or returning to the dashboard.
            </p>
            {process.env.NODE_ENV === 'development' && error.message && (
              <pre style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: 12, fontSize: 11, color: '#991b1b', textAlign: 'left', marginBottom: 24, overflowX: 'auto', whiteSpace: 'pre-wrap' }}>
                {error.message}
              </pre>
            )}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button onClick={() => reset()}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: '#d97706', color: 'white', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                <RefreshCw style={{ width: 16, height: 16 }} /> Try again
              </button>
              <a href="/dashboard"
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: 'white', color: '#5c5850', border: '1px solid #e8e5df', borderRadius: 12, fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
                <ArrowLeft style={{ width: 16, height: 16 }} /> Dashboard
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}

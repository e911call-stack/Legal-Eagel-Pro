import Link from 'next/link';
import { Scale } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#f5f4f0', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center mx-auto mb-6 shadow-lg">
          <Scale className="w-8 h-8 text-white" />
        </div>
        <div className="text-8xl font-bold text-stone-200 mb-2" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
          404
        </div>
        <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          className="text-2xl font-semibold text-stone-900 mb-2">Page not found</h1>
        <p className="text-sm text-stone-500 leading-relaxed mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/dashboard" className="btn-primary">Go to Dashboard</Link>
          <Link href="/" className="btn-ghost">Home</Link>
        </div>
      </div>
    </div>
  );
}

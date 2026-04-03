import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ─── Routes that NEVER require authentication ──────────────────────────────────
// The root '/' is the landing page — always public.
const PUBLIC_ROUTES = ['/', '/login', '/onboarding', '/auth/callback', '/reset-password'];

// ─── Routes that are public prefixes (match startsWith) ───────────────────────
const PUBLIC_PREFIXES = ['/offline'];

const DEMO_COOKIE = 'le_demo_role';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Always pass through: public routes, static files, API ─────────────────
  if (
    PUBLIC_ROUTES.includes(pathname) ||
    PUBLIC_PREFIXES.some(p => pathname.startsWith(p)) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/api/ai') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // ── Demo mode fast-path ────────────────────────────────────────────────────
  const demoRole = request.cookies.get(DEMO_COOKIE)?.value;
  if (demoRole) {
    if (demoRole === 'client' && !pathname.startsWith('/portal')) {
      return NextResponse.redirect(new URL('/portal/dashboard', request.url));
    }
    if (demoRole !== 'client' && pathname.startsWith('/portal')) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // ── Real Supabase session check ────────────────────────────────────────────
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL  ?? 'https://placeholder.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder-key',
    {
      cookies: {
        get(name)         { return request.cookies.get(name)?.value; },
        set(name, value, options) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({ request });
          response.cookies.set({ name, value, ...options });
        },
        remove(name, options) {
          request.cookies.set({ name, value: '', ...options });
          response = NextResponse.next({ request });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    // No session → send to login, preserve the intended destination
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── Role-based routing for authenticated Supabase users ───────────────────
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', session.user.id)
    .single();

  const role = profile?.role ?? 'client';

  if (role === 'client' && !pathname.startsWith('/portal')) {
    return NextResponse.redirect(new URL('/portal/dashboard', request.url));
  }
  if (role !== 'client' && pathname.startsWith('/portal')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public).*)'],
};

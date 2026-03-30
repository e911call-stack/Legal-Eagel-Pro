import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ─── Routes that never require auth ───────────────────────────
const PUBLIC_ROUTES = ['/login', '/onboarding', '/auth/callback'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow public routes and static files
  if (
    PUBLIC_ROUTES.some(r => pathname.startsWith(r)) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL  ?? 'https://placeholder.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder-key',
    {
      cookies: {
        get(name) { return request.cookies.get(name)?.value; },
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

  // Refresh session — keeps it alive on navigation
  const { data: { session } } = await supabase.auth.getSession();

  // ── Not logged in → redirect to login ─────────────────────
  if (!session) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── Role-based route protection ────────────────────────────
  // Fetch role from users table
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', session.user.id)
    .single();

  const role = profile?.role ?? 'client';

  // Clients trying to access lawyer/admin routes → redirect to client portal
  if (role === 'client' && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/portal/dashboard', request.url));
  }
  if (role === 'client' && !pathname.startsWith('/portal')) {
    return NextResponse.redirect(new URL('/portal/dashboard', request.url));
  }

  // Lawyers/admins trying to access client portal → redirect to firm dashboard
  if (role !== 'client' && pathname.startsWith('/portal')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth/token';
import { logger } from '@/lib/logger';

const PUBLIC_PATHS = ['/', '/login', '/signup', '/forgot-password', '/api/auth/login', '/api/auth/signup', '/api/health', '/_next', '/favicon.ico'];

function isPublic(path: string): boolean {
  return PUBLIC_PATHS.some(p => path === p || path.startsWith(`${p}/`) || path.startsWith('/_next/'));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (isPublic(pathname)) return NextResponse.next();

  const token = request.cookies.get('session')?.value;
  if (!token) {
    return pathname.startsWith('/api/') ? NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) : NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const payload = await verifyToken(token);
    const headers = new Headers(request.headers);
    headers.set('x-user-id', payload.sub);
    headers.set('x-user-role', payload.role || 'user');

    if ((pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) && payload.role !== 'admin') {
      return pathname.startsWith('/api/') ? NextResponse.json({ error: 'Forbidden' }, { status: 403 }) : NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next({ request: { headers } });
  } catch {
    logger.warn({ path: pathname }, 'Invalid token');
    const res = pathname.startsWith('/api/') ? NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) : NextResponse.redirect(new URL('/login', request.url));
    res.cookies.delete('session');
    return res;
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.).*)'],
};

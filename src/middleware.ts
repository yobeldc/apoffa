/**
 * Middleware: Global intercept layer for all incoming requests.
 * Handles: Auth session refresh, route protection, and rewrite logic.
 *
 * AP OFFA Architecture:
 * - Public routes: accessible without auth (login, signup, home, public API)
 * - Protected routes: require authentication
 * - Admin routes: require admin role
 * - API routes: CORS handling + rate limiting headers
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { env } from '@/lib/env'

// ── Route Definitions ───────────────────────────────────────────────

const PUBLIC_ROUTES = [
  '/login',
  '/signup',
  '/auth/callback',
  '/error',
  '/',
]

const PUBLIC_API_ROUTES = [
  '/api/webhook',
]

const ADMIN_ROUTE_PREFIX = '/admin'
const API_ROUTE_PREFIX = '/api'

// Static assets and Next.js internals
const STATIC_PATHS = [
  '/_next',
  '/favicon.ico',
  '/images',
  '/fonts',
]

// ── Helper Functions ────────────────────────────────────────────────

function isPublicRoute(pathname: string): boolean {
  // Check exact public routes
  if (PUBLIC_ROUTES.some(route => pathname === route || pathname.startsWith(`${route}/`))) {
    return true
  }
  // Check public API routes
  if (PUBLIC_API_ROUTES.some(route => pathname.startsWith(route))) {
    return true
  }
  // Check static paths
  if (STATIC_PATHS.some(prefix => pathname.startsWith(prefix))) {
    return true
  }
  return false
}

function isAdminRoute(pathname: string): boolean {
  return pathname.startsWith(ADMIN_ROUTE_PREFIX)
}

function isApiRoute(pathname: string): boolean {
  return pathname.startsWith(API_ROUTE_PREFIX)
}

// ── Middleware ──────────────────────────────────────────────────────

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 1. Always update auth session first (refresh JWT if needed)
  const response = await updateSession(request)

  // 2. Skip middleware for static assets
  if (STATIC_PATHS.some(prefix => pathname.startsWith(prefix))) {
    return response
  }

  // 3. Get auth session from Supabase
  const authCookie = request.cookies.get('sb-access-token')
  const isAuthenticated = !!authCookie

  // 4. Route Protection Logic
  if (!isPublicRoute(pathname)) {
    // Redirect unauthenticated users to login
    if (!isAuthenticated) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Admin route protection
    if (isAdminRoute(pathname)) {
      // Check admin role from session (lightweight check)
      // Full RBAC is handled at the page/component level
      const roleCookie = request.cookies.get('user-role')
      if (roleCookie?.value !== 'admin') {
        return NextResponse.redirect(new URL('/unauthorized', request.url))
      }
    }
  }

  // 5. API route enhancements
  if (isApiRoute(pathname)) {
    // Add security headers
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-XSS-Protection', '1; mode=block')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

    // CORS for API routes
    response.headers.set('Access-Control-Allow-Origin', env.APP_URL || '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  }

  return response
}

// ── Matcher Config ──────────────────────────────────────────────────

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images/ (image directory)
     * - fonts/ (font directory)
     */
    '/((?!_next/static|_next/image|favicon.ico|images/|fonts/).*)',
  ],
}

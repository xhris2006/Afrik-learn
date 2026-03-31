// src/middleware.ts
// Next.js edge middleware — redirects unauthenticated users

import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

// Protected route prefixes
const PROTECTED = ['/dashboard', '/library', '/past-papers', '/community', '/announcements', '/premium', '/profile', '/admin']
const AUTH_ROUTES = ['/login', '/register', '/forgot-password']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('afriklearn_token')?.value

  const isProtected = PROTECTED.some((p) => pathname.startsWith(p))
  const isAuthRoute = AUTH_ROUTES.some((p) => pathname.startsWith(p))

  if (isProtected) {
    if (!token) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }

    const payload = await verifyToken(token)
    if (!payload) {
      const res = NextResponse.redirect(new URL('/login', request.url))
      res.cookies.delete('afriklearn_token')
      return res
    }

    // Admin-only routes
    if (pathname.startsWith('/admin') && payload.role !== 'ADMIN' && payload.role !== 'MODERATOR') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  // Redirect authenticated users away from auth pages
  if (isAuthRoute && token) {
    const payload = await verifyToken(token)
    if (payload) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/library/:path*',
    '/past-papers/:path*',
    '/community/:path*',
    '/announcements/:path*',
    '/premium/:path*',
    '/profile/:path*',
    '/admin/:path*',
    '/login',
    '/register',
    '/forgot-password',
  ],
}

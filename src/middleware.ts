import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

const PROTECTED = ['/dashboard', '/library', '/past-papers', '/community', '/announcements', '/premium', '/profile', '/admin']
const AUTH_ROUTES = ['/login', '/register', '/forgot-password']

function getPostAuthRoute(role?: string) {
  return role === 'ADMIN' || role === 'MODERATOR' ? '/admin' : '/dashboard'
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('afriklearn_token')?.value

  const isProtected = PROTECTED.some((prefix) => pathname.startsWith(prefix))
  const isAuthRoute = AUTH_ROUTES.some((prefix) => pathname.startsWith(prefix))

  if (isProtected) {
    if (!token) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }

    const payload = await verifyToken(token)
    if (!payload) {
      const response = NextResponse.redirect(new URL('/login', request.url))
      response.cookies.delete('afriklearn_token')
      return response
    }

    if (pathname.startsWith('/admin') && payload.role !== 'ADMIN' && payload.role !== 'MODERATOR') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  if (isAuthRoute && token) {
    const payload = await verifyToken(token)
    if (payload) {
      return NextResponse.redirect(new URL(getPostAuthRoute(payload.role), request.url))
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

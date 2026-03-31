// src/lib/auth.ts
// JWT creation, verification, and cookie helpers

import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-dev-secret-change-me'
)

export interface JWTPayload {
  userId: string
  email: string
  role: string
  iat?: number
  exp?: number
}

// ── Sign a JWT ────────────────────────────────────────────────
export async function signToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(process.env.JWT_EXPIRES_IN || '7d')
    .sign(JWT_SECRET)
}

// ── Verify a JWT ──────────────────────────────────────────────
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as unknown as JWTPayload
  } catch {
    return null
  }
}

// ── Get current user from request cookies ─────────────────────
export async function getCurrentUser(request?: NextRequest) {
  let token: string | undefined

  if (request) {
    token = request.cookies.get('afriklearn_token')?.value
  } else {
    const cookieStore = cookies()
    token = cookieStore.get('afriklearn_token')?.value
  }

  if (!token) return null

  const payload = await verifyToken(token)
  if (!payload) return null

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      avatar: true,
      university: true,
      faculty: true,
      level: true,
      isPremium: true,
      premiumUntil: true,
      isActive: true,
    },
  })

  if (!user || !user.isActive) return null
  return user
}

// ── Set auth cookie ───────────────────────────────────────────
export function getAuthCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  }
}

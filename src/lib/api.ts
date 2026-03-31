// src/lib/api.ts
// Standardized API response helpers

import { NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { Prisma } from '@prisma/client'

// ── Success response ──────────────────────────────────────────
export function success<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status })
}

// ── Error response ────────────────────────────────────────────
export function error(message: string, status = 400, details?: unknown) {
  return NextResponse.json({ success: false, error: message, details }, { status })
}

// ── Handle Zod validation errors ─────────────────────────────
export function validationError(err: ZodError) {
  const messages = err.errors.map((e) => `${e.path.join('.')}: ${e.message}`)
  return error('Validation failed', 422, messages)
}

// ── Unauthorized ─────────────────────────────────────────────
export function unauthorized(message = 'Unauthorized') {
  return error(message, 401)
}

// ── Forbidden ────────────────────────────────────────────────
export function forbidden(message = 'Forbidden') {
  return error(message, 403)
}

// ── Not found ────────────────────────────────────────────────
export function notFound(message = 'Not found') {
  return error(message, 404)
}

// ── Server error ──────────────────────────────────────────────
export function serverError(err?: unknown) {
  console.error('[Server Error]', err)

  if (err instanceof Prisma.PrismaClientInitializationError) {
    return error(
      'Database connection failed. Check DATABASE_URL and restart the server.',
      500
    )
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2021') {
      return error(
        'Database tables are missing. Run npm run db:push, then npm run db:seed.',
        500
      )
    }

    if (err.code === 'P2002') {
      return error('A record with this value already exists.', 409)
    }
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    return error('Database query failed. Check that your Prisma schema is up to date.', 500)
  }

  if (err instanceof Error && /environment variable.*DATABASE_URL/i.test(err.message)) {
    return error(
      'DATABASE_URL is missing. Add it to .env.local and restart the server.',
      500
    )
  }

  return error('Internal server error', 500)
}

// ── Paginate helper ───────────────────────────────────────────
export function paginate(page = 1, limit = 20) {
  const take = Math.min(limit, 100)
  const skip = (Math.max(page, 1) - 1) * take
  return { take, skip }
}

export function paginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
) {
  return {
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    },
  }
}

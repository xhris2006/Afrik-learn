// src/lib/api.ts
// Standardized API response helpers

import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

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

// src/app/api/users/route.ts
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { success, unauthorized, forbidden, serverError, paginate, paginatedResponse } from '@/lib/api'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return unauthorized()
    if (user.role !== 'ADMIN') return forbidden()

    const { searchParams } = new URL(request.url)
    const page = Number(searchParams.get('page') || 1)
    const limit = Number(searchParams.get('limit') || 20)
    const search = searchParams.get('search') || ''
    const { take, skip } = paginate(page, limit)

    const where = search
      ? { OR: [{ name: { contains: search, mode: 'insensitive' as const } }, { email: { contains: search, mode: 'insensitive' as const } }] }
      : {}

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where, take, skip,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, email: true, name: true, role: true, avatar: true,
          university: true, isPremium: true, isActive: true, createdAt: true,
          _count: { select: { documents: true } },
        },
      }),
      prisma.user.count({ where }),
    ])

    return success(paginatedResponse(users, total, page, limit))
  } catch (err) {
    return serverError(err)
  }
}

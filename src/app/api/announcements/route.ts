// src/app/api/announcements/route.ts
import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { success, unauthorized, forbidden, serverError, validationError, paginate, paginatedResponse } from '@/lib/api'

const createSchema = z.object({
  title: z.string().min(3),
  content: z.string().min(10),
  category: z.enum(['HOUSING', 'INTERNSHIP', 'JOB', 'SCHOLARSHIP', 'EVENT', 'GENERAL', 'EXAM']),
  school: z.string().optional(),
  imageUrl: z.string().url().optional(),
  externalUrl: z.string().url().optional(),
  isPinned: z.boolean().default(false),
  expiresAt: z.string().datetime().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number(searchParams.get('page') || 1)
    const limit = Number(searchParams.get('limit') || 20)
    const category = searchParams.get('category') || ''
    const { take, skip } = paginate(page, limit)

    const where: Record<string, unknown> = {
      isActive: true,
      OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }],
      ...(category && { category }),
    }

    const [items, total] = await Promise.all([
      prisma.announcement.findMany({
        where, take, skip,
        orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
      }),
      prisma.announcement.count({ where }),
    ])

    return success(paginatedResponse(items, total, page, limit))
  } catch (err) {
    return serverError(err)
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return unauthorized()
    if (user.role !== 'ADMIN' && user.role !== 'MODERATOR') return forbidden()

    const body = await request.json()
    const parsed = createSchema.safeParse(body)
    if (!parsed.success) return validationError(parsed.error)

    const item = await prisma.announcement.create({ data: parsed.data as any })
    return success(item, 201)
  } catch (err) {
    return serverError(err)
  }
}

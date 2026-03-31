// src/app/api/documents/[id]/rate/route.ts
import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { success, unauthorized, notFound, serverError, validationError } from '@/lib/api'

const rateSchema = z.object({ score: z.number().int().min(1).max(5) })

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user) return unauthorized()

    const body = await request.json()
    const parsed = rateSchema.safeParse(body)
    if (!parsed.success) return validationError(parsed.error)

    const doc = await prisma.document.findUnique({ where: { id: params.id } })
    if (!doc) return notFound()

    const rating = await prisma.rating.upsert({
      where: { documentId_userId: { documentId: params.id, userId: user.id } },
      update: { score: parsed.data.score },
      create: { documentId: params.id, userId: user.id, score: parsed.data.score },
    })

    // Recalculate avg
    const all = await prisma.rating.findMany({ where: { documentId: params.id }, select: { score: true } })
    const avg = Math.round((all.reduce((a, r) => a + r.score, 0) / all.length) * 10) / 10

    return success({ rating, avgRating: avg, totalRatings: all.length })
  } catch (err) {
    return serverError(err)
  }
}

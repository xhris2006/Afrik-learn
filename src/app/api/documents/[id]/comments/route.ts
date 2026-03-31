// src/app/api/documents/[id]/comments/route.ts
import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { success, unauthorized, notFound, serverError, validationError } from '@/lib/api'

const commentSchema = z.object({
  content: z.string().min(1).max(1000),
  parentId: z.string().optional(),
})

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const comments = await prisma.comment.findMany({
      where: { documentId: params.id, parentId: null },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
        replies: {
          include: { user: { select: { id: true, name: true, avatar: true } } },
          orderBy: { createdAt: 'asc' },
        },
      },
    })
    return success(comments)
  } catch (err) {
    return serverError(err)
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user) return unauthorized()

    const doc = await prisma.document.findUnique({ where: { id: params.id } })
    if (!doc) return notFound()

    const body = await request.json()
    const parsed = commentSchema.safeParse(body)
    if (!parsed.success) return validationError(parsed.error)

    const comment = await prisma.comment.create({
      data: { content: parsed.data.content, documentId: params.id, userId: user.id, parentId: parsed.data.parentId },
      include: { user: { select: { id: true, name: true, avatar: true } } },
    })

    // Notify document owner
    if (doc.uploadedById !== user.id) {
      await prisma.notification.create({
        data: {
          userId: doc.uploadedById,
          title: 'New comment on your document',
          message: `${user.name} commented: "${parsed.data.content.slice(0, 60)}..."`,
          type: 'NEW_COMMENT',
          link: `/library/${doc.id}`,
        },
      })
    }

    return success(comment, 201)
  } catch (err) {
    return serverError(err)
  }
}

// src/app/api/documents/[id]/route.ts
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { success, error, unauthorized, forbidden, notFound, serverError } from '@/lib/api'

// ── GET /api/documents/:id ────────────────────────────────────
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    const doc = await prisma.document.findUnique({
      where: { id: params.id },
      include: {
        uploadedBy: { select: { id: true, name: true, avatar: true, university: true } },
        ratings: { select: { score: true, userId: true } },
        comments: {
          where: { parentId: null },
          orderBy: { createdAt: 'desc' },
          take: 20,
          include: {
            user: { select: { id: true, name: true, avatar: true } },
            replies: {
              include: { user: { select: { id: true, name: true, avatar: true } } },
            },
          },
        },
        _count: { select: { comments: true, ratings: true } },
      },
    })

    if (!doc) return notFound('Document not found')
    if (!doc.isApproved && (!user || (user.role !== 'ADMIN' && user.role !== 'MODERATOR'))) {
      return notFound('Document not found')
    }

    // Block premium content for non-premium users
    if (doc.isPremium && (!user || (!user.isPremium && user.role !== 'ADMIN'))) {
      return error('This document requires a Premium subscription', 402)
    }

    // Increment view count
    await prisma.document.update({ where: { id: params.id }, data: { viewCount: { increment: 1 } } })

    const avgRating = doc.ratings.length
      ? Math.round((doc.ratings.reduce((a, r) => a + r.score, 0) / doc.ratings.length) * 10) / 10
      : 0

    const userRating = user ? doc.ratings.find((r) => r.userId === user.id)?.score ?? null : null

    return success({ ...doc, avgRating, userRating })
  } catch (err) {
    return serverError(err)
  }
}

// ── PATCH /api/documents/:id — update ────────────────────────
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user) return unauthorized()

    const doc = await prisma.document.findUnique({ where: { id: params.id } })
    if (!doc) return notFound()

    const isOwner = doc.uploadedById === user.id
    const isAdmin = user.role === 'ADMIN' || user.role === 'MODERATOR'
    if (!isOwner && !isAdmin) return forbidden()

    const body = await request.json()
    // Admins can approve, owners can edit content
    const allowedFields = isAdmin
      ? ['title', 'description', 'isApproved', 'isPremium', 'tags', 'subject', 'level', 'school', 'faculty', 'category']
      : ['title', 'description', 'tags']

    const updateData: Record<string, unknown> = {}
    for (const key of allowedFields) {
      if (key in body) updateData[key] = body[key]
    }

    const updated = await prisma.document.update({
      where: { id: params.id },
      data: updateData,
      include: { uploadedBy: { select: { id: true, name: true, avatar: true } } },
    })

    // Notify uploader of approval/rejection
    if ('isApproved' in body && doc.uploadedById !== user.id) {
      await prisma.notification.create({
        data: {
          userId: doc.uploadedById,
          title: body.isApproved ? 'Document approved ✅' : 'Document rejected ❌',
          message: `Your document "${doc.title}" has been ${body.isApproved ? 'approved' : 'rejected'}.`,
          type: body.isApproved ? 'DOCUMENT_APPROVED' : 'DOCUMENT_REJECTED',
          link: `/library/${doc.id}`,
        },
      })
    }

    return success(updated)
  } catch (err) {
    return serverError(err)
  }
}

// ── DELETE /api/documents/:id ─────────────────────────────────
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user) return unauthorized()

    const doc = await prisma.document.findUnique({ where: { id: params.id } })
    if (!doc) return notFound()

    const isOwner = doc.uploadedById === user.id
    const isAdmin = user.role === 'ADMIN' || user.role === 'MODERATOR'
    if (!isOwner && !isAdmin) return forbidden()

    await prisma.document.delete({ where: { id: params.id } })
    return success({ message: 'Document deleted' })
  } catch (err) {
    return serverError(err)
  }
}

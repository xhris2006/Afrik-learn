// src/app/api/documents/route.ts
import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { success, error, unauthorized, forbidden, serverError, paginate, paginatedResponse, validationError } from '@/lib/api'

const createSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  fileUrl: z.string().url(),
  fileType: z.enum(['PDF', 'DOC', 'DOCX', 'PPT', 'PPTX', 'IMAGE', 'OTHER']),
  fileSize: z.number().int().positive(),
  category: z.enum(['COURSE_MATERIAL', 'PAST_PAPER', 'SOLUTION', 'NOTES', 'THESIS', 'PROJECT', 'TUTORIAL']),
  school: z.string().min(2),
  faculty: z.string().optional(),
  level: z.string().min(1),
  subject: z.string().min(2),
  year: z.number().int().optional(),
  hasSolution: z.boolean().default(false),
  solutionUrl: z.string().url().optional(),
  isPremium: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
})

// ── GET /api/documents — list with filters ────────────────────
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number(searchParams.get('page') || 1)
    const limit = Number(searchParams.get('limit') || 20)
    const search = searchParams.get('search') || ''
    const school = searchParams.get('school') || ''
    const level = searchParams.get('level') || ''
    const subject = searchParams.get('subject') || ''
    const category = searchParams.get('category') || ''
    const isPremium = searchParams.get('isPremium')
    const approved = searchParams.get('approved') // admin only

    const user = await getCurrentUser()
    const { take, skip } = paginate(page, limit)

    const where: Record<string, unknown> = {
      isApproved: approved === 'false' ? false : true, // default approved only
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { subject: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { tags: { has: search } },
        ],
      }),
      ...(school && { school: { contains: school, mode: 'insensitive' } }),
      ...(level && { level }),
      ...(subject && { subject: { contains: subject, mode: 'insensitive' } }),
      ...(category && { category }),
      ...(isPremium !== null && isPremium !== '' && { isPremium: isPremium === 'true' }),
    }

    // Non-admins can only see approved docs
    if (!user || (user.role !== 'ADMIN' && user.role !== 'MODERATOR')) {
      where.isApproved = true
    }

    const [documents, total] = await Promise.all([
      prisma.document.findMany({
        where,
        take,
        skip,
        orderBy: { createdAt: 'desc' },
        include: {
          uploadedBy: { select: { id: true, name: true, avatar: true } },
          ratings: { select: { score: true } },
          _count: { select: { comments: true } },
        },
      }),
      prisma.document.count({ where }),
    ])

    const enriched = documents.map((doc) => ({
      ...doc,
      avgRating: doc.ratings.length
        ? Math.round((doc.ratings.reduce((a, r) => a + r.score, 0) / doc.ratings.length) * 10) / 10
        : 0,
    }))

    return success(paginatedResponse(enriched, total, page, limit))
  } catch (err) {
    return serverError(err)
  }
}

// ── POST /api/documents — upload a document ───────────────────
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return unauthorized()

    const body = await request.json()
    const parsed = createSchema.safeParse(body)
    if (!parsed.success) return validationError(parsed.error)

    const data = parsed.data
    // Admins auto-approve, students need approval
    const isApproved = user.role === 'ADMIN' || user.role === 'MODERATOR'

    const doc = await prisma.document.create({
      data: { ...data, uploadedById: user.id, isApproved },
      include: {
        uploadedBy: { select: { id: true, name: true, avatar: true } },
      },
    })

    // Notify admins if student uploaded
    if (!isApproved) {
      const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } })
      await prisma.notification.createMany({
        data: admins.map((admin) => ({
          userId: admin.id,
          title: 'New document pending approval',
          message: `"${doc.title}" submitted by ${user.name}`,
          type: 'SYSTEM',
          link: `/admin/documents`,
        })),
      })
    }

    return success(doc, 201)
  } catch (err) {
    return serverError(err)
  }
}

// src/app/api/users/[id]/route.ts
import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { success, unauthorized, forbidden, notFound, serverError, validationError } from '@/lib/api'

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  university: z.string().optional(),
  faculty: z.string().optional(),
  level: z.string().optional(),
  bio: z.string().max(300).optional(),
  avatar: z.string().url().optional(),
  isActive: z.boolean().optional(),
  role: z.enum(['ADMIN', 'MODERATOR', 'STUDENT']).optional(),
  isPremium: z.boolean().optional(),
})

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user) return unauthorized()

    const isSelf = user.id === params.id
    const isAdmin = user.role === 'ADMIN'
    if (!isSelf && !isAdmin) return forbidden()

    const body = await request.json()
    const parsed = updateSchema.safeParse(body)
    if (!parsed.success) return validationError(parsed.error)

    const data: Record<string, unknown> = {}
    // Self can update profile fields; admin can change role/status
    if (isSelf) {
      const allowed = ['name', 'university', 'faculty', 'level', 'bio', 'avatar']
      for (const k of allowed) if (k in parsed.data) data[k] = (parsed.data as any)[k]
    }
    if (isAdmin) {
      if ('isActive' in parsed.data) data.isActive = parsed.data.isActive
      if ('role' in parsed.data) data.role = parsed.data.role
      if ('isPremium' in parsed.data) data.isPremium = parsed.data.isPremium
    }

    const updated = await prisma.user.update({
      where: { id: params.id },
      data,
      select: { id: true, email: true, name: true, role: true, avatar: true, university: true, faculty: true, level: true, isPremium: true, isActive: true },
    })

    return success(updated)
  } catch (err) {
    return serverError(err)
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'ADMIN') return forbidden()

    await prisma.user.update({ where: { id: params.id }, data: { isActive: false } })
    return success({ message: 'User deactivated' })
  } catch (err) {
    return serverError(err)
  }
}

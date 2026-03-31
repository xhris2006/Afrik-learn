// src/app/api/announcements/[id]/route.ts
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { success, unauthorized, forbidden, notFound, serverError } from '@/lib/api'

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user) return unauthorized()
    if (user.role !== 'ADMIN' && user.role !== 'MODERATOR') return forbidden()

    const ann = await prisma.announcement.findUnique({ where: { id: params.id } })
    if (!ann) return notFound()

    await prisma.announcement.delete({ where: { id: params.id } })
    return success({ message: 'Announcement deleted' })
  } catch (err) {
    return serverError(err)
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user) return unauthorized()
    if (user.role !== 'ADMIN' && user.role !== 'MODERATOR') return forbidden()

    const body = await request.json()
    const updated = await prisma.announcement.update({ where: { id: params.id }, data: body })
    return success(updated)
  } catch (err) {
    return serverError(err)
  }
}

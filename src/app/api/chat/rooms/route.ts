// src/app/api/chat/rooms/route.ts
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { success, unauthorized, serverError } from '@/lib/api'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) return unauthorized()

    const rooms = await prisma.chatRoom.findMany({
      where: { isPublic: true },
      orderBy: { createdAt: 'asc' },
      include: {
        _count: { select: { members: true, messages: true } },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          include: { sender: { select: { name: true } } },
        },
      },
    })
    return success(rooms)
  } catch (err) {
    return serverError(err)
  }
}

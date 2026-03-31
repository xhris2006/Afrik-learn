// src/app/api/chat/rooms/[id]/messages/route.ts
import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { success, unauthorized, serverError, validationError } from '@/lib/api'

const msgSchema = z.object({ content: z.string().min(1).max(2000) })

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user) return unauthorized()

    const { searchParams } = new URL(request.url)
    const cursor = searchParams.get('cursor')

    const messages = await prisma.message.findMany({
      where: { roomId: params.id },
      take: 50,
      ...(cursor && { cursor: { id: cursor }, skip: 1 }),
      orderBy: { createdAt: 'desc' },
      include: { sender: { select: { id: true, name: true, avatar: true } } },
    })

    return success(messages.reverse())
  } catch (err) {
    return serverError(err)
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user) return unauthorized()

    const body = await request.json()
    const parsed = msgSchema.safeParse(body)
    if (!parsed.success) return validationError(parsed.error)

    // Auto-join room
    await prisma.chatRoomMember.upsert({
      where: { roomId_userId: { roomId: params.id, userId: user.id } },
      update: {},
      create: { roomId: params.id, userId: user.id },
    })

    const message = await prisma.message.create({
      data: { content: parsed.data.content, roomId: params.id, senderId: user.id },
      include: { sender: { select: { id: true, name: true, avatar: true } } },
    })

    return success(message, 201)
  } catch (err) {
    return serverError(err)
  }
}

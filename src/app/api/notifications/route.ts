// src/app/api/notifications/route.ts
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { success, unauthorized, serverError } from '@/lib/api'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) return unauthorized()

    const notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 30,
    })

    const unreadCount = notifications.filter((n) => !n.isRead).length
    return success({ notifications, unreadCount })
  } catch (err) {
    return serverError(err)
  }
}

export async function PATCH() {
  try {
    const user = await getCurrentUser()
    if (!user) return unauthorized()

    await prisma.notification.updateMany({
      where: { userId: user.id, isRead: false },
      data: { isRead: true },
    })

    return success({ message: 'All marked as read' })
  } catch (err) {
    return serverError(err)
  }
}

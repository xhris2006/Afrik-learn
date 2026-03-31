// src/app/api/admin/stats/route.ts
// Returns platform-wide statistics for admin dashboard

import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { success, unauthorized, forbidden, serverError } from '@/lib/api'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) return unauthorized()
    if (user.role !== 'ADMIN' && user.role !== 'MODERATOR') return forbidden()

    const [
      totalUsers,
      premiumUsers,
      totalDocs,
      pendingDocs,
      totalDownloads,
      totalPayments,
    ] = await Promise.all([
      prisma.user.count({ where: { isActive: true } }),
      prisma.user.count({ where: { isPremium: true } }),
      prisma.document.count({ where: { isApproved: true } }),
      prisma.document.count({ where: { isApproved: false } }),
      prisma.document.aggregate({ _sum: { downloadCount: true } }),
      prisma.payment.aggregate({
        where: { status: 'SUCCESSFUL' },
        _sum: { amount: true },
        _count: true,
      }),
    ])

    return success({
      totalUsers,
      premiumUsers,
      totalDocs,
      pendingDocs,
      totalDownloads: totalDownloads._sum.downloadCount || 0,
      revenue: totalPayments._sum.amount || 0,
      totalPayments: totalPayments._count,
    })
  } catch (err) {
    return serverError(err)
  }
}

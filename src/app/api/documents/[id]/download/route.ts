// src/app/api/documents/[id]/download/route.ts
// Increments download count and returns the document URL

import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { success, unauthorized, notFound, error, serverError } from '@/lib/api'

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user) return unauthorized()

    const doc = await prisma.document.findUnique({ where: { id: params.id } })
    if (!doc || !doc.isApproved) return notFound('Document not found')

    // Check premium gate
    if (doc.isPremium && !user.isPremium && user.role !== 'ADMIN') {
      return error('Premium subscription required', 402)
    }

    // Increment download count
    await prisma.document.update({
      where: { id: params.id },
      data: { downloadCount: { increment: 1 } },
    })

    return success({ fileUrl: doc.fileUrl, title: doc.title })
  } catch (err) {
    return serverError(err)
  }
}

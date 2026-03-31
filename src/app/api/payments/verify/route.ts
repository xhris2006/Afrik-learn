// src/app/api/payments/verify/route.ts
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { verifyPayment, PREMIUM_PLANS, type PlanKey } from '@/lib/fapshi'
import { success, error, unauthorized, notFound, serverError } from '@/lib/api'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return unauthorized()

    const { searchParams } = new URL(request.url)
    const transId = searchParams.get('transId')
    if (!transId) return error('transId is required', 400)

    // Find our payment record
    const payment = await prisma.payment.findUnique({ where: { transactionId: transId } })
    if (!payment) return notFound('Payment not found')
    if (payment.userId !== user.id) return error('Unauthorized', 403)

    // Already processed
    if (payment.status === 'SUCCESSFUL') {
      return success({ status: 'SUCCESSFUL', isPremium: true })
    }

    // Verify with Fapshi
    const fapshiRes = await verifyPayment(transId)

    if (!fapshiRes.data) {
      return error(`Verification failed: ${fapshiRes.message}`, 502)
    }

    const fapshiStatus = fapshiRes.data.status
    const dbStatus = fapshiStatus === 'SUCCESSFUL' ? 'SUCCESSFUL'
      : fapshiStatus === 'FAILED' ? 'FAILED'
      : fapshiStatus === 'EXPIRED' ? 'CANCELLED'
      : 'PENDING'

    // Update payment record
    await prisma.payment.update({
      where: { transactionId: transId },
      data: { status: dbStatus as any },
    })

    // If successful, upgrade user to premium
    if (dbStatus === 'SUCCESSFUL') {
      const plan = payment.plan as PlanKey
      const durationDays = (PREMIUM_PLANS[plan] as any).durationDays
      const premiumUntil = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000)

      await prisma.user.update({
        where: { id: user.id },
        data: { isPremium: true, premiumUntil },
      })

      await prisma.notification.create({
        data: {
          userId: user.id,
          title: '🎉 Premium activated!',
          message: `Your ${PREMIUM_PLANS[plan].label} plan is now active. Enjoy full access!`,
          type: 'PAYMENT_SUCCESS',
          link: '/dashboard',
        },
      })

      return success({ status: 'SUCCESSFUL', isPremium: true, premiumUntil })
    }

    return success({ status: dbStatus, isPremium: false })
  } catch (err) {
    return serverError(err)
  }
}

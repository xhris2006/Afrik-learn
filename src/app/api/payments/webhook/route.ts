// src/app/api/payments/webhook/route.ts
// Fapshi webhook handler — called by Fapshi when a payment status changes

import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { PREMIUM_PLANS, type PlanKey } from '@/lib/fapshi'
import { success, error, serverError } from '@/lib/api'

export async function POST(request: NextRequest) {
  try {
    // Verify webhook authenticity via secret header
    const webhookSecret = request.headers.get('x-fapshi-webhook-secret')
    if (webhookSecret !== process.env.FAPSHI_WEBHOOK_SECRET) {
      return error('Unauthorized webhook', 401)
    }

    const body = await request.json()
    const { transId, status, amount } = body

    if (!transId || !status) return error('Missing required fields', 400)

    // Find the payment record
    const payment = await prisma.payment.findUnique({ where: { transactionId: transId } })
    if (!payment) return error('Payment not found', 404)

    const dbStatus =
      status === 'SUCCESSFUL' ? 'SUCCESSFUL'
      : status === 'FAILED' ? 'FAILED'
      : status === 'EXPIRED' ? 'CANCELLED'
      : 'PENDING'

    await prisma.payment.update({
      where: { transactionId: transId },
      data: { status: dbStatus as any },
    })

    // Activate premium on success
    if (dbStatus === 'SUCCESSFUL' && payment.status !== 'SUCCESSFUL') {
      const plan = payment.plan as PlanKey
      const durationDays = (PREMIUM_PLANS[plan] as any).durationDays
      const premiumUntil = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000)

      await prisma.user.update({
        where: { id: payment.userId },
        data: { isPremium: true, premiumUntil },
      })

      await prisma.notification.create({
        data: {
          userId: payment.userId,
          title: '🎉 Premium activated!',
          message: `Your ${PREMIUM_PLANS[plan].label} plan is now active. Enjoy full access!`,
          type: 'PAYMENT_SUCCESS',
          link: '/dashboard',
        },
      })
    }

    return success({ received: true })
  } catch (err) {
    return serverError(err)
  }
}

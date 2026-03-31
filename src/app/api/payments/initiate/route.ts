// src/app/api/payments/initiate/route.ts
import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { initiatePayment, PREMIUM_PLANS, type PlanKey } from '@/lib/fapshi'
import { success, error, unauthorized, serverError, validationError } from '@/lib/api'

const schema = z.object({
  plan: z.enum(['MONTHLY', 'SEMESTER', 'ANNUAL']),
})

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return unauthorized()

    const body = await request.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) return validationError(parsed.error)

    const { plan } = parsed.data
    const planConfig = PREMIUM_PLANS[plan as PlanKey]

    // Call Fapshi to create a payment link
    const fapshiRes = await initiatePayment({
      amount: planConfig.price,
      email: user.email,
      userId: user.id,
      plan,
      message: `AfrikLearn Premium — ${planConfig.label}`,
      redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/premium/success`,
    })

    if (!fapshiRes.payLink || !fapshiRes.transId) {
      return error(`Payment initiation failed: ${fapshiRes.message}`, 502)
    }

    // Store pending payment record
    await prisma.payment.create({
      data: {
        transactionId: fapshiRes.transId,
        amount: planConfig.price,
        currency: 'XAF',
        status: 'PENDING',
        plan: plan as any,
        userId: user.id,
        metadata: { planLabel: planConfig.label, durationDays: planConfig.durationDays },
      },
    })

    return success({ payLink: fapshiRes.payLink, transId: fapshiRes.transId })
  } catch (err) {
    return serverError(err)
  }
}

// src/lib/fapshi.ts
// Fapshi payment gateway integration
// Docs: https://fapshi.com/developer/docs

const FAPSHI_BASE_URL = process.env.NEXT_PUBLIC_FAPSHI_BASE_URL || 'https://live.fapshi.com'
const FAPSHI_API_USER = process.env.FAPSHI_API_USER!
const FAPSHI_API_KEY = process.env.FAPSHI_API_KEY!

// ── Request headers ───────────────────────────────────────────
function getHeaders() {
  return {
    'Content-Type': 'application/json',
    apiuser: FAPSHI_API_USER,
    apikey: FAPSHI_API_KEY,
  }
}

// ── Initiate a payment ────────────────────────────────────────
export interface InitiatePaymentParams {
  amount: number           // Amount in XAF
  email: string            // Payer's email
  userId: string           // Internal user ID (stored in metadata)
  plan: string             // 'MONTHLY' | 'SEMESTER' | 'ANNUAL'
  redirectUrl?: string     // Where to redirect after payment
  message?: string         // Payment description
}

export interface FapshiPaymentResponse {
  statusCode: number
  message: string
  payLink?: string         // URL to redirect user to for payment
  transId?: string         // Fapshi transaction ID
}

export async function initiatePayment(params: InitiatePaymentParams): Promise<FapshiPaymentResponse> {
  const { amount, email, userId, plan, redirectUrl, message } = params

  const body = {
    amount,
    email,
    userId,          // sent as external user reference
    redirectUrl: redirectUrl || `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/premium/success`,
    message: message || `AfrikLearn Premium — ${plan} Plan`,
  }

  const res = await fetch(`${FAPSHI_BASE_URL}/initiate-pay`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(body),
  })

  const data = await res.json()
  return data
}

// ── Verify a payment by transaction ID ───────────────────────
export interface FapshiVerifyResponse {
  statusCode: number
  message: string
  data?: {
    transId: string
    status: 'SUCCESSFUL' | 'PENDING' | 'FAILED' | 'EXPIRED'
    amount: number
    currency: string
    email: string
    userId: string
    medium: string
    name?: string
    createdAt: string
    updatedAt: string
  }
}

export async function verifyPayment(transId: string): Promise<FapshiVerifyResponse> {
  const res = await fetch(`${FAPSHI_BASE_URL}/payment-status/${transId}`, {
    method: 'GET',
    headers: getHeaders(),
  })

  const data = await res.json()
  return data
}

// ── Expire/cancel a payment ───────────────────────────────────
export async function expirePayment(transId: string) {
  const res = await fetch(`${FAPSHI_BASE_URL}/expire-pay`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ transId }),
  })
  return res.json()
}

// ── Premium plan pricing (in XAF) ────────────────────────────
export const PREMIUM_PLANS = {
  MONTHLY: {
    label: '1 Month',
    price: Number(process.env.NEXT_PUBLIC_PRICE_MONTHLY) || 2500,
    durationDays: 30,
    features: ['All course materials', 'Past papers', 'Solutions & corrections', 'Priority support'],
  },
  SEMESTER: {
    label: '6 Months',
    price: Number(process.env.NEXT_PUBLIC_PRICE_SEMESTER) || 12000,
    durationDays: 180,
    features: ['Everything in Monthly', '2 months free', 'Download offline', 'Study groups'],
    badge: 'Most Popular',
  },
  ANNUAL: {
    label: '1 Year',
    price: Number(process.env.NEXT_PUBLIC_PRICE_ANNUAL) || 20000,
    durationDays: 365,
    features: ['Everything in Semester', '4 months free', 'Premium chat', 'Internship alerts'],
    badge: 'Best Value',
  },
} as const

export type PlanKey = keyof typeof PREMIUM_PLANS

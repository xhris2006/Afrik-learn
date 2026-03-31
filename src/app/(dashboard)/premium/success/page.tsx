// src/app/(dashboard)/premium/success/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { CheckCircle, Crown, Loader2, XCircle } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import Link from 'next/link'

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { refreshUser } = useAuth()
  const [status, setStatus] = useState<'loading' | 'success' | 'pending' | 'failed'>('loading')

  useEffect(() => {
    const transId = searchParams.get('transId') || searchParams.get('transaction_id')
    if (!transId) { setStatus('failed'); return }

    fetch(`/api/payments/verify?transId=${transId}`)
      .then((r) => r.json())
      .then(async (d) => {
        if (d.success) {
          if (d.data.status === 'SUCCESSFUL') {
            await refreshUser()
            setStatus('success')
          } else if (d.data.status === 'PENDING') {
            setStatus('pending')
          } else {
            setStatus('failed')
          }
        } else {
          setStatus('failed')
        }
      })
      .catch(() => setStatus('failed'))
  }, [searchParams, refreshUser])

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <Loader2 className="animate-spin text-primary" size={36} />
        <p className="text-text-secondary font-medium">Verifying your payment...</p>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="max-w-md mx-auto text-center animate-fade-in py-12">
        <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-orange-400 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
          <Crown size={44} className="text-white" />
        </div>
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={28} className="text-success" />
        </div>
        <h1 className="text-3xl font-display font-bold text-text-primary mb-3">
          Welcome to Premium! 🎉
        </h1>
        <p className="text-text-secondary mb-8">
          Your subscription is now active. Enjoy unlimited access to all AfrikLearn content.
        </p>
        <Link href="/library" className="btn-primary inline-flex text-base px-8 py-3.5">
          Explore Premium Content →
        </Link>
      </div>
    )
  }

  if (status === 'pending') {
    return (
      <div className="max-w-md mx-auto text-center animate-fade-in py-12">
        <Loader2 className="animate-spin text-warning mx-auto mb-4" size={48} />
        <h1 className="text-2xl font-display font-bold text-text-primary mb-3">Payment Pending</h1>
        <p className="text-text-secondary mb-6">
          Your payment is being processed. This may take a few minutes. Please check back shortly.
        </p>
        <button onClick={() => router.refresh()} className="btn-secondary">
          Check again
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto text-center animate-fade-in py-12">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
        <XCircle size={32} className="text-danger" />
      </div>
      <h1 className="text-2xl font-display font-bold text-text-primary mb-3">Payment Failed</h1>
      <p className="text-text-secondary mb-6">
        Something went wrong with your payment. No charges have been made.
      </p>
      <Link href="/premium" className="btn-primary inline-flex">
        Try again
      </Link>
    </div>
  )
}

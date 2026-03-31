// src/app/(dashboard)/premium/page.tsx
'use client'

import { useState } from 'react'
import { Crown, Check, Loader2, Zap, Shield, BookOpen, Star, FileText } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { PREMIUM_PLANS, type PlanKey } from '@/lib/fapshi'
import { formatCurrency, formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

const PERKS = [
  { icon: BookOpen, text: 'Unlimited access to all course materials' },
  { icon: FileText, text: 'Download past papers with full solutions' },
  { icon: Star, text: 'Priority rating & review privileges' },
  { icon: Shield, text: 'Ad-free experience' },
  { icon: Zap, text: 'Early access to new features' },
]

export default function PremiumPage() {
  const { user, refreshUser } = useAuth()
  const [loading, setLoading] = useState<string | null>(null)

  const handleSubscribe = async (plan: PlanKey) => {
    setLoading(plan)
    try {
      const res = await fetch('/api/payments/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })
      const data = await res.json()
      if (data.success && data.data.payLink) {
        window.location.href = data.data.payLink
      } else {
        toast.error(data.error || 'Failed to initiate payment. Check Fapshi config.')
      }
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setLoading(null)
    }
  }

  if (user?.isPremium) {
    return (
      <div className="max-w-2xl mx-auto animate-fade-in">
        <div className="card p-8 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-400 rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-lg">
            <Crown size={36} className="text-white" />
          </div>
          <h1 className="text-2xl font-display font-bold text-text-primary mb-2">
            You&apos;re Premium! 🎉
          </h1>
          <p className="text-text-secondary mb-6">
            Enjoy full access to all AfrikLearn content until{' '}
            <span className="font-semibold text-primary">
              {user.premiumUntil ? formatDate(user.premiumUntil) : 'your plan expires'}
            </span>
          </p>

          <div className="grid grid-cols-1 gap-3 text-left mb-8">
            {PERKS.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-100 rounded-xl">
                <Icon size={16} className="text-amber-600 flex-shrink-0" />
                <span className="text-sm text-amber-800 font-medium">{text}</span>
              </div>
            ))}
          </div>

          <p className="text-sm text-text-muted">
            Need help? Contact{' '}
            <a href="mailto:support@afriklearn.com" className="text-primary font-medium hover:underline">
              support@afriklearn.com
            </a>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in space-y-8">
      {/* Hero */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 text-sm font-semibold px-4 py-2 rounded-full mb-5">
          <Crown size={15} /> AfrikLearn Premium
        </div>
        <h1 className="text-3xl font-display font-bold text-text-primary mb-3">
          Unlock Your Full Potential
        </h1>
        <p className="text-text-secondary max-w-md mx-auto">
          Get unlimited access to all course materials, past papers with solutions, and exclusive
          premium features — at African-friendly prices.
        </p>
      </div>

      {/* Perks */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {PERKS.map(({ icon: Icon, text }) => (
          <div key={text} className="card p-4 flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Icon size={15} className="text-primary" />
            </div>
            <p className="text-sm font-medium text-text-secondary">{text}</p>
          </div>
        ))}
      </div>

      {/* Plans */}
      <div>
        <h2 className="text-xl font-display font-bold text-text-primary text-center mb-6">
          Choose Your Plan
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(Object.entries(PREMIUM_PLANS) as [PlanKey, typeof PREMIUM_PLANS[PlanKey]][]).map(
            ([key, plan]) => {
              const isMost = 'badge' in plan && plan.badge === 'Most Popular'
              const isBest = 'badge' in plan && plan.badge === 'Best Value'
              const hasBadge = 'badge' in plan

              return (
                <div
                  key={key}
                  className={`card p-6 flex flex-col relative ${
                    isMost
                      ? 'border-2 border-primary ring-4 ring-primary/10 scale-[1.02]'
                      : isBest
                      ? 'border-2 border-amber-400'
                      : ''
                  }`}
                >
                  {hasBadge && (
                    <div
                      className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold text-white ${
                        isMost ? 'bg-primary' : 'bg-gradient-to-r from-amber-400 to-orange-400'
                      }`}
                    >
                      {(plan as any).badge}
                    </div>
                  )}

                  <div className="mb-5">
                    <h3 className="text-lg font-display font-bold text-text-primary mb-1">
                      {plan.label}
                    </h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-display font-extrabold text-primary">
                        {formatCurrency(plan.price)}
                      </span>
                      <span className="text-text-muted text-sm">XAF</span>
                    </div>
                    <p className="text-xs text-text-muted mt-1">
                      ≈{' '}
                      {key === 'MONTHLY'
                        ? '$4.20 USD'
                        : key === 'SEMESTER'
                        ? '$20 USD'
                        : '$33 USD'}
                    </p>
                  </div>

                  <ul className="space-y-2.5 flex-1 mb-6">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-text-secondary">
                        <Check size={15} className="text-success flex-shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleSubscribe(key)}
                    disabled={loading === key}
                    className={`w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                      isMost
                        ? 'btn-primary'
                        : 'btn-secondary'
                    }`}
                  >
                    {loading === key ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <>
                        <Crown size={15} /> Subscribe via Fapshi
                      </>
                    )}
                  </button>
                </div>
              )
            }
          )}
        </div>
      </div>

      {/* Payment info */}
      <div className="card p-5">
        <h3 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
          <Shield size={16} className="text-success" /> Secure Payment via Fapshi
        </h3>
        <p className="text-sm text-text-secondary leading-relaxed mb-3">
          Payments are processed securely through{' '}
          <span className="font-semibold text-primary">Fapshi</span>, a trusted African payment
          gateway. Pay with Mobile Money (MTN MoMo, Orange Money), bank cards, or other supported
          methods.
        </p>
        <div className="flex flex-wrap gap-2">
          {['MTN MoMo', 'Orange Money', 'Visa', 'Mastercard'].map((m) => (
            <span key={m} className="badge-gray text-xs">{m}</span>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="space-y-3">
        <h3 className="text-lg font-display font-bold text-text-primary">FAQ</h3>
        {[
          {
            q: 'Can I cancel anytime?',
            a: 'Yes. Your Premium access remains until the end of the billing period.',
          },
          {
            q: 'How do I pay with Mobile Money?',
            a: 'After clicking Subscribe, you will be redirected to Fapshi where you can pay via MTN MoMo or Orange Money.',
          },
          {
            q: 'Is my payment info safe?',
            a: 'All payments are processed by Fapshi. AfrikLearn never stores your payment details.',
          },
        ].map(({ q, a }) => (
          <div key={q} className="card p-4">
            <p className="font-semibold text-text-primary text-sm mb-1">{q}</p>
            <p className="text-text-secondary text-sm">{a}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

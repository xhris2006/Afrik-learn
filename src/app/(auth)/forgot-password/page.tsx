// src/app/(auth)/forgot-password/page.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    setError('')

    try {
      // In a real app, call your password reset endpoint
      // await fetch('/api/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) })
      await new Promise((r) => setTimeout(r, 1000)) // simulate delay
      setSent(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="animate-fade-in text-center">
        <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <CheckCircle className="text-success" size={30} />
        </div>
        <h2 className="text-2xl font-display font-bold text-text-primary mb-3">Check your email</h2>
        <p className="text-text-secondary mb-6">
          If an account exists for <strong>{email}</strong>, you&apos;ll receive a password reset link shortly.
        </p>
        <p className="text-text-muted text-sm mb-6">
          Didn&apos;t receive it? Check your spam folder or try again.
        </p>
        <Link href="/login" className="btn-primary inline-flex">
          <ArrowLeft size={16} /> Back to Sign In
        </Link>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <Link
        href="/login"
        className="flex items-center gap-2 text-text-muted hover:text-primary text-sm font-medium mb-8 transition-colors w-fit"
      >
        <ArrowLeft size={16} /> Back to Sign In
      </Link>

      <div className="mb-8">
        <h2 className="text-3xl font-display font-bold text-text-primary">Forgot password?</h2>
        <p className="text-text-secondary mt-2">
          Enter your email and we&apos;ll send you a reset link.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="input-label">Email address</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
            <input
              type="email"
              placeholder="you@university.cm"
              className="input pl-11"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        {error && (
          <p className="text-danger text-sm bg-red-50 border border-red-100 rounded-xl px-4 py-3">
            {error}
          </p>
        )}

        <button type="submit" disabled={loading || !email} className="btn-primary w-full py-3.5">
          {loading ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            'Send Reset Link'
          )}
        </button>
      </form>
    </div>
  )
}

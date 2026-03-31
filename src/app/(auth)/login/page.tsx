'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

const schema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const { login, isLoading } = useAuth()
  const [showPass, setShowPass] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = (data: FormData) => login(data)

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h2 className="text-3xl font-display font-bold text-text-primary">Welcome back</h2>
        <p className="text-text-secondary mt-2">Sign in to your AfrikLearn account</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="input-label">Email address</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
            <input
              {...register('email')}
              type="email"
              placeholder="you@university.cm"
              className="input pl-11"
              autoComplete="email"
            />
          </div>
          {errors.email && <p className="text-danger text-xs mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="input-label">Password</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
            <input
              {...register('password')}
              type={showPass ? 'text' : 'password'}
              placeholder="........"
              className="input pl-11 pr-11"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-primary transition-colors"
            >
              {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && <p className="text-danger text-xs mt-1">{errors.password.message}</p>}
        </div>

        <div className="flex justify-end">
          <Link href="/forgot-password" className="text-sm text-primary font-medium hover:underline">
            Forgot password?
          </Link>
        </div>

        <button type="submit" disabled={isLoading} className="btn-primary w-full py-3.5 text-base">
          {isLoading ? <Loader2 className="animate-spin" size={20} /> : <>Sign In <ArrowRight size={18} /></>}
        </button>
      </form>

      <p className="text-center text-text-secondary text-sm mt-6">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-primary font-semibold hover:underline">
          Sign up free
        </Link>
      </p>
    </div>
  )
}

// src/app/(auth)/register/page.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Mail, Lock, User, GraduationCap, ArrowRight, Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { CAMEROON_UNIVERSITIES, ACADEMIC_LEVELS } from '@/lib/utils'

const schema = z.object({
  name: z.string().min(2, 'Name too short'),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'At least 8 characters'),
  university: z.string().optional(),
  level: z.string().optional(),
})
type FormData = z.infer<typeof schema>

export default function RegisterPage() {
  const { register: signup, isLoading } = useAuth()
  const [showPass, setShowPass] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) })
  const onSubmit = (data: FormData) => signup(data)

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h2 className="text-3xl font-display font-bold text-text-primary">Create account 🎓</h2>
        <p className="text-text-secondary mt-2">Join thousands of African students</p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="input-label">Full name</label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
            <input {...register('name')} placeholder="Alina Nguetsop" className="input pl-11" />
          </div>
          {errors.name && <p className="text-danger text-xs mt-1">{errors.name.message}</p>}
        </div>
        <div>
          <label className="input-label">Email address</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
            <input {...register('email')} type="email" placeholder="you@university.cm" className="input pl-11" />
          </div>
          {errors.email && <p className="text-danger text-xs mt-1">{errors.email.message}</p>}
        </div>
        <div>
          <label className="input-label">Password</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
            <input {...register('password')} type={showPass ? 'text' : 'password'} placeholder="Min. 8 characters" className="input pl-11 pr-11" />
            <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-primary">
              {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && <p className="text-danger text-xs mt-1">{errors.password.message}</p>}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="input-label">University</label>
            <div className="relative">
              <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" size={16} />
              <select {...register('university')} className="input pl-9 appearance-none">
                <option value="">Select…</option>
                {CAMEROON_UNIVERSITIES.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="input-label">Level</label>
            <select {...register('level')} className="input appearance-none">
              <option value="">Select…</option>
              {ACADEMIC_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        </div>
        <button type="submit" disabled={isLoading} className="btn-primary w-full py-3.5 text-base mt-2">
          {isLoading ? <Loader2 className="animate-spin" size={20} /> : <>Create Account <ArrowRight size={18} /></>}
        </button>
      </form>
      <p className="text-center text-text-secondary text-sm mt-6">
        Already have an account?{" "}
        <Link href="/login" className="text-primary font-semibold hover:underline">Sign in</Link>
      </p>
    </div>
  )
}

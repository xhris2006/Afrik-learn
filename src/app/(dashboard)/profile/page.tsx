// src/app/(dashboard)/profile/page.tsx
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { User, Mail, GraduationCap, BookOpen, Crown, Save, Loader2, Camera, LogOut } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { getInitials, CAMEROON_UNIVERSITIES, ACADEMIC_LEVELS, formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'
import Link from 'next/link'

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  university: z.string().optional(),
  faculty: z.string().optional(),
  level: z.string().optional(),
  bio: z.string().max(300).optional(),
})
type FormData = z.infer<typeof schema>

export default function ProfilePage() {
  const { user, updateUser, logout } = useAuth()
  const [saving, setSaving] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { isDirty, errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user?.name || '',
      university: user?.university || '',
      faculty: user?.faculty || '',
      level: user?.level || '',
      bio: '',
    },
  })

  const onSubmit = async (data: FormData) => {
    if (!user) return
    setSaving(true)
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const result = await res.json()
      if (result.success) {
        updateUser(result.data)
        toast.success('Profile updated successfully!')
      } else {
        toast.error(result.error || 'Update failed')
      }
    } catch {
      toast.error('Network error')
    } finally {
      setSaving(false)
    }
  }

  if (!user) return null

  return (
    <div className="max-w-2xl mx-auto animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-text-primary">My Profile</h1>
        <p className="text-text-muted text-sm mt-1">Manage your account information</p>
      </div>

      {/* Avatar + premium status */}
      <div className="card p-6">
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="w-20 h-20 gradient-header rounded-2xl flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
              {user.avatar ? (
                <img src={user.avatar} alt="" className="w-full h-full object-cover" />
              ) : (
                getInitials(user.name)
              )}
            </div>
            <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-white border-2 border-border rounded-full flex items-center justify-center text-text-muted hover:text-primary transition-colors shadow-card">
              <Camera size={13} />
            </button>
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-display font-bold text-text-primary">{user.name}</h2>
            <p className="text-text-muted text-sm">{user.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className={`badge text-xs ${user.role === 'ADMIN' ? 'badge-red' : 'badge-blue'}`}>
                {user.role}
              </span>
              {user.isPremium ? (
                <span className="premium-badge">
                  <Crown size={10} /> Premium
                  {user.premiumUntil && ` · until ${formatDate(user.premiumUntil, 'MMM yyyy')}`}
                </span>
              ) : (
                <Link href="/premium" className="badge badge-gray hover:bg-amber-100 hover:text-amber-700 transition-colors cursor-pointer text-xs">
                  Free plan — Upgrade
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit form */}
      <div className="card p-6">
        <h3 className="font-semibold text-text-primary mb-5 flex items-center gap-2">
          <User size={17} /> Personal Information
        </h3>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="input-label">Full Name</label>
            <input {...register('name')} className="input" placeholder="Your full name" />
            {errors.name && <p className="text-danger text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="input-label">Email</label>
            <input value={user.email} disabled className="input bg-background text-text-muted cursor-not-allowed" />
            <p className="text-xs text-text-muted mt-1">Email cannot be changed</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="input-label">University</label>
              <select {...register('university')} className="input appearance-none">
                <option value="">Select university</option>
                {CAMEROON_UNIVERSITIES.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="input-label">Academic Level</label>
              <select {...register('level')} className="input appearance-none">
                <option value="">Select level</option>
                {ACADEMIC_LEVELS.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="input-label">Faculty / Department</label>
            <input {...register('faculty')} className="input" placeholder="e.g. Faculty of Science" />
          </div>

          <div>
            <label className="input-label">Bio</label>
            <textarea
              {...register('bio')}
              rows={3}
              className="input resize-none"
              placeholder="Tell other students about yourself..."
            />
            {errors.bio && <p className="text-danger text-xs mt-1">{errors.bio.message}</p>}
          </div>

          <button type="submit" disabled={saving || !isDirty} className="btn-primary">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Save Changes
          </button>
        </form>
      </div>

      {/* Danger zone */}
      <div className="card p-6 border border-red-100">
        <h3 className="font-semibold text-danger mb-3">Account Actions</h3>
        <p className="text-sm text-text-secondary mb-4">
          Signing out will end your current session.
        </p>
        <button onClick={logout} className="flex items-center gap-2 text-sm font-semibold text-danger hover:bg-red-50 px-4 py-2 rounded-xl transition-colors border border-red-200">
          <LogOut size={15} /> Sign Out
        </button>
      </div>
    </div>
  )
}

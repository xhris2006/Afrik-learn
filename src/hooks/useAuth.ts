'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store/auth'
import type { LoginCredentials, RegisterData, AuthUser } from '@/types'

function getPostAuthRoute(role?: string) {
  return role === 'ADMIN' || role === 'MODERATOR' ? '/admin' : '/dashboard'
}

export function useAuth() {
  const { user, isLoading, setUser, setLoading, logout: clearUser, updateUser } = useAuthStore()
  const router = useRouter()

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      setLoading(true)
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(credentials),
        })
        const data = await res.json()
        if (!res.ok || !data.success) {
          toast.error(data.error || 'Login failed')
          return false
        }

        setUser(data.data.user)
        toast.success(`Welcome back, ${data.data.user.name.split(' ')[0]}!`)
        router.push(getPostAuthRoute(data.data.user.role))
        return true
      } catch {
        toast.error('Network error. Please try again.')
        return false
      } finally {
        setLoading(false)
      }
    },
    [router, setUser, setLoading]
  )

  const register = useCallback(
    async (formData: RegisterData) => {
      setLoading(true)
      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })
        const result = await res.json()
        if (!res.ok || !result.success) {
          toast.error(result.error || 'Registration failed')
          return false
        }

        setUser(result.data.user)
        toast.success('Account created! Welcome to AfrikLearn')
        router.push(getPostAuthRoute(result.data.user.role))
        return true
      } catch {
        toast.error('Network error. Please try again.')
        return false
      } finally {
        setLoading(false)
      }
    },
    [router, setUser, setLoading]
  )

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch {
      // ignore network errors on logout
    }

    clearUser()
    router.push('/login')
    toast.success('Logged out successfully')
  }, [router, clearUser])

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me')
      const data = await res.json()
      if (data.success) {
        setUser(data.data)
      } else {
        clearUser()
      }
    } catch {
      // silent
    }
  }, [setUser, clearUser])

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN' || user?.role === 'MODERATOR',
    isPremium: user?.isPremium ?? false,
    login,
    register,
    logout,
    refreshUser,
    updateUser: (updates: Partial<AuthUser>) => updateUser(updates),
  }
}

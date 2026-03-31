// src/app/(dashboard)/admin/users/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { Search, UserCheck, UserX, Shield, Crown, Loader2, Users } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { getInitials, timeAgo } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function AdminUsersPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    if (user && user.role !== 'ADMIN') router.push('/dashboard')
  }, [user, router])

  const load = async () => {
    setLoading(true)
    const params = new URLSearchParams({ limit: '50', ...(search && { search }) })
    const res = await fetch(`/api/users?${params}`)
    const data = await res.json()
    if (data.success) {
      setUsers(data.data.data)
      setTotal(data.data.pagination.total)
    }
    setLoading(false)
  }

  useEffect(() => {
    const t = setTimeout(load, 300)
    return () => clearTimeout(t)
  }, [search])

  const toggleActive = async (id: string, current: boolean) => {
    setActionLoading(id)
    const res = await fetch(`/api/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !current }),
    })
    const data = await res.json()
    if (data.success) {
      toast.success(current ? 'User deactivated' : 'User activated')
      load()
    } else {
      toast.error(data.error || 'Action failed')
    }
    setActionLoading(null)
  }

  const togglePremium = async (id: string, current: boolean) => {
    setActionLoading(id + '-premium')
    const res = await fetch(`/api/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPremium: !current }),
    })
    const data = await res.json()
    if (data.success) {
      toast.success(current ? 'Premium removed' : 'Premium granted ✨')
      load()
    } else {
      toast.error(data.error || 'Action failed')
    }
    setActionLoading(null)
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary">Manage Users</h1>
          <p className="text-text-muted text-sm mt-0.5">{total} registered students</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="badge-blue">{total} users</div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" size={17} />
        <input
          type="text"
          placeholder="Search by name or email..."
          className="input pl-11"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total', value: total, icon: Users, color: 'bg-blue-50 text-blue-600' },
          { label: 'Premium', value: users.filter((u) => u.isPremium).length, icon: Crown, color: 'bg-amber-50 text-amber-600' },
          { label: 'Admins', value: users.filter((u) => u.role === 'ADMIN').length, icon: Shield, color: 'bg-red-50 text-red-600' },
        ].map((s) => (
          <div key={s.label} className="card p-4 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${s.color}`}>
              <s.icon size={17} />
            </div>
            <div>
              <p className="text-lg font-display font-bold text-text-primary">{s.value}</p>
              <p className="text-xs text-text-muted">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-background/50">
                {['User', 'University', 'Role', 'Status', 'Joined', 'Actions'].map((h) => (
                  <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-text-muted uppercase tracking-wide first:table-cell">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i} className="border-b border-border/50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="skeleton w-9 h-9 rounded-full" />
                        <div className="space-y-1.5">
                          <div className="skeleton h-3.5 w-32" />
                          <div className="skeleton h-3 w-40" />
                        </div>
                      </div>
                    </td>
                    {[...Array(4)].map((_, j) => (
                      <td key={j} className="py-3 px-4"><div className="skeleton h-3.5 w-24" /></td>
                    ))}
                    <td className="py-3 px-4"><div className="skeleton h-8 w-20 rounded-xl" /></td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-text-muted">
                    <Users className="mx-auto mb-2 text-border" size={32} />
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="border-b border-border/50 hover:bg-background/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 gradient-header rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 overflow-hidden">
                          {u.avatar ? (
                            <img src={u.avatar} alt="" className="w-full h-full object-cover" />
                          ) : (
                            getInitials(u.name)
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-text-primary">{u.name}</p>
                          <p className="text-xs text-text-muted">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-text-secondary text-xs">
                      {u.university || '—'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`badge text-[10px] ${u.role === 'ADMIN' ? 'badge-red' : u.role === 'MODERATOR' ? 'badge-purple' : 'badge-blue'}`}>
                        {u.role === 'ADMIN' && <Shield size={9} />} {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-col gap-1">
                        <span className={`badge text-[10px] ${u.isActive ? 'badge-green' : 'badge-red'}`}>
                          {u.isActive ? '● Active' : '● Inactive'}
                        </span>
                        {u.isPremium && (
                          <span className="premium-badge text-[9px] py-0.5">
                            <Crown size={8} /> PRO
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-text-muted text-xs">{timeAgo(u.createdAt)}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => toggleActive(u.id, u.isActive)}
                          disabled={actionLoading === u.id || u.id === user?.id}
                          title={u.isActive ? 'Deactivate user' : 'Activate user'}
                          className={`p-1.5 rounded-lg transition-colors ${u.isActive ? 'text-text-muted hover:text-danger hover:bg-red-50' : 'text-text-muted hover:text-success hover:bg-green-50'}`}
                        >
                          {actionLoading === u.id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : u.isActive ? (
                            <UserX size={14} />
                          ) : (
                            <UserCheck size={14} />
                          )}
                        </button>
                        <button
                          onClick={() => togglePremium(u.id, u.isPremium)}
                          disabled={actionLoading === u.id + '-premium'}
                          title={u.isPremium ? 'Remove premium' : 'Grant premium'}
                          className="p-1.5 rounded-lg text-text-muted hover:text-amber-600 hover:bg-amber-50 transition-colors"
                        >
                          {actionLoading === u.id + '-premium' ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Crown size={14} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

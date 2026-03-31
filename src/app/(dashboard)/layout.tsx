// src/app/(dashboard)/layout.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard, BookOpen, FileText, MessageSquare,
  User, Crown, Menu, X, Megaphone, ShieldCheck, LogOut,
  Bell, ChevronRight, GraduationCap,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { cn, getInitials } from '@/lib/utils'

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/library', label: 'Library', icon: BookOpen },
  { href: '/past-papers', label: 'Past Papers', icon: FileText },
  { href: '/community', label: 'Community', icon: MessageSquare },
  { href: '/announcements', label: 'Announcements', icon: Megaphone },
  { href: '/premium', label: 'Go Premium', icon: Crown, premium: true },
]

const ADMIN_NAV = [
  { href: '/admin/documents', label: 'Documents', icon: FileText },
  { href: '/admin/users', label: 'Users', icon: User },
  { href: '/admin/announcements', label: 'Announcements', icon: Megaphone },
]

const BOTTOM_NAV = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/library', label: 'Library', icon: BookOpen },
  { href: '/community', label: 'Chat', icon: MessageSquare },
  { href: '/announcements', label: 'News', icon: Megaphone },
  { href: '/profile', label: 'Profile', icon: User },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, isLoading, refreshUser } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notifCount, setNotifCount] = useState(0)

  useEffect(() => { refreshUser() }, [])

  useEffect(() => {
    if (!isLoading && !user) router.replace('/login')
  }, [user, isLoading, router])

  useEffect(() => {
    fetch('/api/notifications')
      .then(r => r.json())
      .then(d => { if (d.success) setNotifCount(d.data.unreadCount) })
      .catch(() => {})
  }, [])

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 gradient-header rounded-2xl flex items-center justify-center animate-pulse">
            <GraduationCap className="text-white" size={28} />
          </div>
          <p className="text-text-muted text-sm">Loading AfrikLearn…</p>
        </div>
      </div>
    )
  }

  const isAdmin = user.role === 'ADMIN' || user.role === 'MODERATOR'

  return (
    <div className="min-h-screen bg-background flex">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={cn(
        'fixed top-0 left-0 h-full w-64 bg-white z-40 flex flex-col shadow-xl',
        'transition-transform duration-300 ease-out lg:translate-x-0 lg:relative lg:shadow-none lg:border-r lg:border-border/60',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="p-5 flex items-center justify-between border-b border-border/60">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-9 h-9 gradient-header rounded-xl flex items-center justify-center shadow-button">
              <GraduationCap size={20} className="text-white" />
            </div>
            <span className="font-display font-bold text-lg text-primary">AfrikLearn</span>
          </Link>
          <button className="lg:hidden text-text-muted hover:text-primary" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          {NAV.map(({ href, label, icon: Icon, premium }) => (
            <Link key={href} href={href} onClick={() => setSidebarOpen(false)}
              className={cn('nav-item', pathname === href && 'active')}>
              {premium && !user.isPremium
                ? <span className="w-7 h-7 flex items-center justify-center bg-gradient-to-br from-amber-400 to-orange-400 rounded-lg text-white"><Crown size={15} /></span>
                : <Icon size={18} />}
              <span>{label}</span>
              {premium && !user.isPremium && (
                <span className="ml-auto text-[10px] font-bold bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded-md">PRO</span>
              )}
            </Link>
          ))}

          {isAdmin && (
            <>
              <div className="pt-4 pb-1 px-4">
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest flex items-center gap-1.5">
                  <ShieldCheck size={10} /> Admin Panel
                </p>
              </div>
              {ADMIN_NAV.map(({ href, label, icon: Icon }) => (
                <Link key={href} href={href} onClick={() => setSidebarOpen(false)}
                  className={cn('nav-item', pathname.startsWith(href) && 'active')}>
                  <Icon size={18} /> <span>{label}</span>
                </Link>
              ))}
            </>
          )}
        </nav>

        <div className="p-3 border-t border-border/60">
          <Link href="/profile" onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 transition-colors group">
            <div className="w-9 h-9 gradient-header rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-sm flex-shrink-0">
              {user.avatar
                ? <img src={user.avatar} alt={user.name} className="w-full h-full rounded-xl object-cover" />
                : getInitials(user.name)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-text-primary truncate">{user.name}</p>
              <p className="text-xs text-text-muted">{user.isPremium ? '✨ Premium' : user.role}</p>
            </div>
            <ChevronRight size={14} className="text-text-muted group-hover:text-primary" />
          </Link>
          <button onClick={logout}
            className="mt-1 flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-sm text-text-muted hover:text-danger hover:bg-red-50 transition-colors font-medium">
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-20 bg-white/85 backdrop-blur-md border-b border-border/60 px-4 lg:px-6 h-16 flex items-center gap-3">
          <button className="lg:hidden text-text-secondary hover:text-primary p-1.5 rounded-lg" onClick={() => setSidebarOpen(true)}>
            <Menu size={22} />
          </button>
          <div className="hidden lg:block flex-1">
            <h1 className="font-display font-semibold text-text-primary capitalize">
              {pathname.split('/').filter(Boolean).pop()?.replace(/-/g, ' ') || 'Dashboard'}
            </h1>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <Link href="/profile"
              className="relative p-2 rounded-xl text-text-muted hover:text-primary hover:bg-blue-50 transition-colors">
              <Bell size={20} />
              {notifCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 bg-danger rounded-full flex items-center justify-center text-[8px] text-white font-bold">
                  {notifCount > 9 ? '9+' : notifCount}
                </span>
              )}
            </Link>
            <Link href="/profile">
              <div className="w-9 h-9 gradient-header rounded-xl flex items-center justify-center text-white text-xs font-bold shadow-sm hover:opacity-90 transition-opacity">
                {user.avatar
                  ? <img src={user.avatar} alt={user.name} className="w-full h-full rounded-xl object-cover" />
                  : getInitials(user.name)}
              </div>
            </Link>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6 pb-24 lg:pb-6">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-border/60 flex lg:hidden z-20">
        {BOTTOM_NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link key={href} href={href}
              className={cn('bottom-nav-item flex-1', active && 'text-primary')}>
              <Icon size={active ? 22 : 20} strokeWidth={active ? 2.5 : 1.8} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

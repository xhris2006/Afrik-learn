// src/app/(dashboard)/dashboard/page.tsx
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { BookOpen, Download, Star, Users, ArrowRight, Crown, Bell, TrendingUp, FileText, Megaphone, Plus } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { DocumentCard } from '@/components/documents/DocumentCard'
import { UploadModal } from '@/components/documents/UploadModal'
import { formatDate, ANNOUNCEMENT_CATEGORIES, timeAgo } from '@/lib/utils'
import type { Document, Announcement } from '@/types'

export default function DashboardPage() {
  const { user } = useAuth()
  const [recentDocs, setRecentDocs] = useState<Document[]>([])
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [stats, setStats] = useState({ docs: 0, students: 0, downloads: 0 })
  const [loading, setLoading] = useState(true)
  const [uploadOpen, setUploadOpen] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch('/api/documents?limit=4').then(r => r.json()),
      fetch('/api/announcements?limit=3').then(r => r.json()),
    ]).then(([docsRes, annRes]) => {
      if (docsRes.success) {
        setRecentDocs(docsRes.data.data)
        setStats(s => ({ ...s, docs: docsRes.data.pagination.total }))
      }
      if (annRes.success) setAnnouncements(annRes.data.data)
    }).finally(() => setLoading(false))
  }, [])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Hero banner */}
      <div className="gradient-header rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute top-[-40px] right-[-40px] w-48 h-48 rounded-full bg-white/5" />
        <div className="absolute bottom-[-20px] right-[20%] w-32 h-32 rounded-full bg-white/5" />
        <div className="relative z-10">
          <p className="text-white/70 text-sm mb-1">{greeting} 👋</p>
          <h2 className="text-2xl font-display font-bold mb-1">{user?.name?.split(' ')[0]}</h2>
          {user?.university && (
            <p className="text-white/70 text-sm">{user.university}{user.level ? ` · ${user.level}` : ''}</p>
          )}
          {!user?.isPremium && (
            <Link href="/premium"
              className="inline-flex items-center gap-2 mt-4 bg-white/15 hover:bg-white/25 border border-white/20 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all">
              <Crown size={15} /> Unlock Premium <ArrowRight size={14} />
            </Link>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Documents', value: stats.docs.toLocaleString(), icon: FileText, color: 'text-primary bg-blue-50' },
          { label: 'Students', value: '12K+', icon: Users, color: 'text-green-600 bg-green-50' },
          { label: 'Downloads', value: '45K+', icon: Download, color: 'text-purple-600 bg-purple-50' },
          { label: 'Universities', value: '8', icon: BookOpen, color: 'text-orange-600 bg-orange-50' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
              <Icon size={20} />
            </div>
            <p className="text-2xl font-display font-bold text-text-primary">{value}</p>
            <p className="text-text-muted text-sm">{label}</p>
          </div>
        ))}
      </div>

      {/* Recent documents */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title flex items-center gap-2">
            <BookOpen size={20} className="text-primary" /> Recent Documents
          </h2>
          <div className="flex items-center gap-2">
            <button onClick={() => setUploadOpen(true)}
              className="btn-primary text-xs px-3 py-2">
              <Plus size={14} /> Upload
            </button>
            <Link href="/library" className="btn-secondary text-xs px-3 py-2">
              See all <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="card p-4 flex gap-3">
                <div className="w-12 h-12 skeleton rounded-xl flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-4 rounded w-3/4" />
                  <div className="skeleton h-3 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : recentDocs.length === 0 ? (
          <div className="card p-8 text-center">
            <FileText size={40} className="text-border mx-auto mb-3" />
            <p className="text-text-muted">No documents yet. Be the first to upload!</p>
            <button onClick={() => setUploadOpen(true)} className="btn-primary mt-4 mx-auto">
              <Plus size={16} /> Upload Document
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {recentDocs.map(doc => <DocumentCard key={doc.id} doc={doc} />)}
          </div>
        )}
      </div>

      {/* Announcements */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title flex items-center gap-2">
            <Megaphone size={20} className="text-primary" /> Latest Announcements
          </h2>
          <Link href="/announcements" className="btn-secondary text-xs px-3 py-2">
            See all <ArrowRight size={14} />
          </Link>
        </div>
        <div className="space-y-3">
          {loading ? (
            [1,2,3].map(i => <div key={i} className="card p-4 h-20 skeleton" />)
          ) : announcements.length === 0 ? (
            <div className="card p-6 text-center text-text-muted">No announcements</div>
          ) : (
            announcements.map(ann => {
              const cfg = ANNOUNCEMENT_CATEGORIES[ann.category]
              return (
                <div key={ann.id} className="card p-4 flex items-start gap-3">
                  {ann.isPinned && <span className="text-lg flex-shrink-0">📌</span>}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`badge text-xs ${cfg.color}`}>{cfg.emoji} {cfg.label}</span>
                      <span className="text-xs text-text-muted">{timeAgo(ann.createdAt)}</span>
                    </div>
                    <h4 className="font-semibold text-text-primary text-sm">{ann.title}</h4>
                    <p className="text-text-muted text-xs mt-0.5 line-clamp-2">{ann.content}</p>
                  </div>
                  {ann.externalUrl && (
                    <a href={ann.externalUrl} target="_blank" rel="noopener noreferrer"
                      className="text-primary hover:underline text-xs flex-shrink-0 flex items-center gap-1">
                      Open <ArrowRight size={10} />
                    </a>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>

      <UploadModal open={uploadOpen} onClose={() => setUploadOpen(false)} onSuccess={() => {
        fetch('/api/documents?limit=4').then(r => r.json()).then(d => {
          if (d.success) setRecentDocs(d.data.data)
        })
      }} />
    </div>
  )
}

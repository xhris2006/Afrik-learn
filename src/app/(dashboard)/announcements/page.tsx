// src/app/(dashboard)/announcements/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { Megaphone, ExternalLink, Pin, Search } from 'lucide-react'
import { ANNOUNCEMENT_CATEGORIES, timeAgo } from '@/lib/utils'
import type { Announcement, AnnouncementCategory } from '@/types'

const CATS = ['', 'HOUSING', 'INTERNSHIP', 'JOB', 'SCHOLARSHIP', 'EVENT', 'EXAM', 'GENERAL'] as const

export default function AnnouncementsPage() {
  const [items, setItems] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams({ limit: '30', ...(category && { category }) })
    fetch(`/api/announcements?${params}`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setItems(d.data.data) })
      .finally(() => setLoading(false))
  }, [category])

  const filtered = search
    ? items.filter(
        (a) =>
          a.title.toLowerCase().includes(search.toLowerCase()) ||
          a.content.toLowerCase().includes(search.toLowerCase())
      )
    : items

  const pinned = filtered.filter((a) => a.isPinned)
  const regular = filtered.filter((a) => !a.isPinned)

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="gradient-header rounded-2xl p-5 text-white">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Megaphone size={20} />
          </div>
          <div>
            <h1 className="text-xl font-display font-bold">Announcements</h1>
            <p className="text-white/70 text-sm">{items.length} active announcements</p>
          </div>
        </div>
        <p className="text-white/60 text-sm">
          Housing, internships, scholarships, and more — all in one place
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" size={17} />
        <input
          type="text"
          placeholder="Search announcements..."
          className="input pl-11"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Category pills */}
      <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
        {CATS.map((c) => {
          const cfg = c ? ANNOUNCEMENT_CATEGORIES[c as AnnouncementCategory] : null
          return (
            <button
              key={c || 'all'}
              onClick={() => setCategory(c)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 ${
                category === c
                  ? 'bg-primary text-white shadow-button'
                  : 'bg-white text-text-secondary border border-border hover:border-primary/30 hover:text-primary'
              }`}
            >
              {cfg ? cfg.emoji : '🌍'} {cfg ? cfg.label : 'All'}
            </button>
          )
        })}
      </div>

      {/* Pinned */}
      {pinned.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wider flex items-center gap-1.5 mb-3">
            <Pin size={12} /> Pinned
          </h2>
          <div className="space-y-3">
            {pinned.map((ann) => <AnnouncementCard key={ann.id} ann={ann} />)}
          </div>
        </section>
      )}

      {/* Regular */}
      <section>
        {pinned.length > 0 && (
          <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
            Recent
          </h2>
        )}
        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="card p-4 space-y-2">
                <div className="skeleton h-4 w-1/3" />
                <div className="skeleton h-5 w-3/4" />
                <div className="skeleton h-3 w-full" />
              </div>
            ))}
          </div>
        ) : regular.length === 0 ? (
          <div className="text-center py-16">
            <Megaphone className="mx-auto text-border mb-3" size={36} />
            <p className="text-text-muted font-medium">No announcements found</p>
            <p className="text-text-muted text-sm mt-1">Check back later for updates</p>
          </div>
        ) : (
          <div className="space-y-3">
            {regular.map((ann) => <AnnouncementCard key={ann.id} ann={ann} />)}
          </div>
        )}
      </section>
    </div>
  )
}

function AnnouncementCard({ ann }: { ann: Announcement }) {
  const cat = ANNOUNCEMENT_CATEGORIES[ann.category]
  return (
    <div className="card p-4 hover:shadow-card-hover transition-all duration-200">
      <div className="flex items-start gap-4">
        <div className="text-2xl flex-shrink-0 mt-0.5">{cat.emoji}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className={`badge text-[10px] ${cat.color}`}>{cat.label}</span>
            {ann.isPinned && (
              <span className="flex items-center gap-1 text-[10px] font-semibold text-primary">
                <Pin size={9} /> Pinned
              </span>
            )}
            {ann.school && <span className="badge-gray text-[10px]">{ann.school}</span>}
          </div>
          <h3 className="font-semibold text-text-primary leading-snug mb-2">{ann.title}</h3>
          <p className="text-sm text-text-secondary leading-relaxed line-clamp-3">{ann.content}</p>

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/60">
            <span className="text-xs text-text-muted">{timeAgo(ann.createdAt)}</span>
            {ann.externalUrl && (
              <a
                href={ann.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
              >
                Learn more <ExternalLink size={12} />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// src/app/(dashboard)/admin/announcements/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { Plus, Trash2, Pin, Loader2, Megaphone } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { ANNOUNCEMENT_CATEGORIES, timeAgo } from '@/lib/utils'
import toast from 'react-hot-toast'

const CATS = ['HOUSING', 'INTERNSHIP', 'JOB', 'SCHOLARSHIP', 'EVENT', 'EXAM', 'GENERAL'] as const

export default function AdminAnnouncementsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    title: '', content: '', category: 'GENERAL', school: '',
    externalUrl: '', isPinned: false,
  })

  useEffect(() => {
    if (user && user.role !== 'ADMIN' && user.role !== 'MODERATOR') router.push('/dashboard')
  }, [user, router])

  const load = async () => {
    setLoading(true)
    const res = await fetch('/api/announcements?limit=50')
    const data = await res.json()
    if (data.success) setItems(data.data.data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title || !form.content) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Announcement created!')
        setShowForm(false)
        setForm({ title: '', content: '', category: 'GENERAL', school: '', externalUrl: '', isPinned: false })
        load()
      } else {
        toast.error(data.error || 'Failed')
      }
    } catch {
      toast.error('Network error')
    } finally {
      setSubmitting(false)
    }
  }

  const deleteItem = async (id: string) => {
    if (!confirm('Delete this announcement?')) return
    const res = await fetch(`/api/announcements/${id}`, { method: 'DELETE' })
    const data = await res.json()
    if (data.success) { toast.success('Deleted'); load() }
    else toast.error('Failed to delete')
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary">Announcements</h1>
          <p className="text-text-muted text-sm mt-0.5">Manage student announcements</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          <Plus size={16} /> New Announcement
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="card p-6 animate-fade-in border border-primary/20">
          <h3 className="font-semibold text-text-primary mb-4">Create Announcement</h3>
          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="input-label">Title *</label>
                <input
                  required
                  className="input"
                  placeholder="e.g. Housing Available Near UY1"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                />
              </div>
              <div>
                <label className="input-label">Category *</label>
                <select
                  className="input appearance-none"
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                >
                  {CATS.map((c) => (
                    <option key={c} value={c}>
                      {ANNOUNCEMENT_CATEGORIES[c].emoji} {ANNOUNCEMENT_CATEGORIES[c].label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="input-label">School (optional)</label>
                <input
                  className="input"
                  placeholder="Leave blank for all schools"
                  value={form.school}
                  onChange={(e) => setForm((f) => ({ ...f, school: e.target.value }))}
                />
              </div>
              <div className="md:col-span-2">
                <label className="input-label">Content *</label>
                <textarea
                  required
                  rows={4}
                  className="input resize-none"
                  placeholder="Full announcement text..."
                  value={form.content}
                  onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                />
              </div>
              <div>
                <label className="input-label">External Link (optional)</label>
                <input
                  type="url"
                  className="input"
                  placeholder="https://..."
                  value={form.externalUrl}
                  onChange={(e) => setForm((f) => ({ ...f, externalUrl: e.target.value }))}
                />
              </div>
              <div className="flex items-center gap-3 pt-6">
                <input
                  type="checkbox"
                  id="isPinned"
                  checked={form.isPinned}
                  onChange={(e) => setForm((f) => ({ ...f, isPinned: e.target.checked }))}
                  className="w-4 h-4 accent-primary"
                />
                <label htmlFor="isPinned" className="text-sm font-medium text-text-secondary cursor-pointer">
                  📌 Pin this announcement
                </label>
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={submitting} className="btn-primary">
                {submitting ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                Create
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      <div className="space-y-3">
        {loading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="card p-4 space-y-2">
              <div className="skeleton h-4 w-1/3" />
              <div className="skeleton h-5 w-3/4" />
              <div className="skeleton h-3 w-full" />
            </div>
          ))
        ) : items.length === 0 ? (
          <div className="text-center py-16">
            <Megaphone className="mx-auto text-border mb-3" size={36} />
            <p className="text-text-muted">No announcements yet</p>
          </div>
        ) : (
          items.map((ann) => {
            const cat = ANNOUNCEMENT_CATEGORIES[ann.category as keyof typeof ANNOUNCEMENT_CATEGORIES]
            return (
              <div key={ann.id} className="card p-4">
                <div className="flex items-start gap-4">
                  <span className="text-2xl">{cat?.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`badge text-[10px] ${cat?.color}`}>{cat?.label}</span>
                      {ann.isPinned && <span className="badge-blue text-[10px] flex items-center gap-1"><Pin size={9} /> Pinned</span>}
                      {ann.school && <span className="badge-gray text-[10px]">{ann.school}</span>}
                    </div>
                    <h3 className="font-semibold text-text-primary">{ann.title}</h3>
                    <p className="text-sm text-text-muted mt-1 line-clamp-2">{ann.content}</p>
                    <p className="text-xs text-text-muted mt-2">{timeAgo(ann.createdAt)}</p>
                  </div>
                  <button
                    onClick={() => deleteItem(ann.id)}
                    className="p-1.5 rounded-lg text-text-muted hover:text-danger hover:bg-red-50 transition-colors flex-shrink-0"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

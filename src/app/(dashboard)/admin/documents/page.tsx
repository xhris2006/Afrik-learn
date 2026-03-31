// src/app/(dashboard)/admin/documents/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, Eye, Trash2, FileText, Loader2, Crown } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { CATEGORY_LABELS, timeAgo, formatFileSize } from '@/lib/utils'
import toast from 'react-hot-toast'
import Link from 'next/link'

type FilterTab = 'pending' | 'approved' | 'all'

export default function AdminDocumentsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [docs, setDocs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterTab>('pending')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [total, setTotal] = useState(0)

  // Redirect non-admins
  useEffect(() => {
    if (user && user.role !== 'ADMIN' && user.role !== 'MODERATOR') {
      router.push('/dashboard')
    }
  }, [user, router])

  const load = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ limit: '50' })
      if (filter === 'pending') params.set('approved', 'false')
      if (filter === 'approved') params.set('approved', 'true')

      const res = await fetch(`/api/documents?${params}`)
      const data = await res.json()
      if (data.success) {
        setDocs(data.data.data)
        setTotal(data.data.pagination.total)
      }
    } catch {
      toast.error('Failed to load documents')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [filter])

  const approve = async (id: string, approved: boolean) => {
    setActionLoading(id)
    try {
      const res = await fetch(`/api/documents/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isApproved: approved }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(approved ? '✅ Document approved' : '❌ Document rejected')
        load()
      } else {
        toast.error(data.error || 'Action failed')
      }
    } finally {
      setActionLoading(null)
    }
  }

  const deleteDoc = async (id: string) => {
    if (!confirm('Permanently delete this document?')) return
    setActionLoading(id + '-del')
    try {
      const res = await fetch(`/api/documents/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        toast.success('Document deleted')
        load()
      } else {
        toast.error(data.error || 'Delete failed')
      }
    } finally {
      setActionLoading(null)
    }
  }

  const TABS: { key: FilterTab; label: string }[] = [
    { key: 'pending', label: '⏳ Pending' },
    { key: 'approved', label: '✅ Approved' },
    { key: 'all', label: '📋 All' },
  ]

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary">Manage Documents</h1>
          <p className="text-text-muted text-sm mt-0.5">
            Review and approve submitted documents · {total} total
          </p>
        </div>
        <span className={`badge text-xs ${filter === 'pending' ? 'bg-amber-100 text-amber-700' : 'badge-blue'}`}>
          {docs.length} shown
        </span>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              filter === key
                ? 'bg-primary text-white shadow-button'
                : 'bg-white border border-border text-text-secondary hover:border-primary/30 hover:text-primary'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-background/60">
                {['Document', 'Category', 'School / Level', 'Uploader', 'Date', 'Status', 'Actions'].map((h) => (
                  <th
                    key={h}
                    className="text-left py-3 px-4 text-xs font-semibold text-text-muted uppercase tracking-wide"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i} className="border-b border-border/50">
                    <td className="py-3.5 px-4"><div className="skeleton h-4 w-44" /></td>
                    <td className="py-3.5 px-4"><div className="skeleton h-5 w-24 rounded-lg" /></td>
                    <td className="py-3.5 px-4"><div className="skeleton h-4 w-32" /></td>
                    <td className="py-3.5 px-4"><div className="skeleton h-4 w-28" /></td>
                    <td className="py-3.5 px-4"><div className="skeleton h-4 w-16" /></td>
                    <td className="py-3.5 px-4"><div className="skeleton h-5 w-20 rounded-lg" /></td>
                    <td className="py-3.5 px-4"><div className="skeleton h-8 w-24 rounded-xl" /></td>
                  </tr>
                ))
              ) : docs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-text-muted">
                    <FileText className="mx-auto mb-2 text-border" size={36} />
                    <p className="font-medium">No documents in this filter</p>
                  </td>
                </tr>
              ) : (
                docs.map((doc) => (
                  <tr
                    key={doc.id}
                    className="border-b border-border/50 hover:bg-background/50 transition-colors"
                  >
                    {/* Title */}
                    <td className="py-3.5 px-4 max-w-[220px]">
                      <div className="flex items-start gap-2">
                        <FileText size={14} className="text-text-muted mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-text-primary line-clamp-1 text-sm">
                            {doc.title}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] text-text-muted">{doc.fileType}</span>
                            {doc.isPremium && (
                              <span className="premium-badge text-[9px] py-0.5 px-1.5">
                                <Crown size={8} /> PRO
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4">
                      <span className="badge-purple text-[10px]">
                        {CATEGORY_LABELS[doc.category] || doc.category}
                      </span>
                    </td>

                    {/* School / Level */}
                    <td className="py-3.5 px-4 text-xs text-text-secondary">
                      <p className="font-medium line-clamp-1">{doc.school}</p>
                      <p className="text-text-muted">{doc.level} · {doc.subject}</p>
                    </td>

                    {/* Uploader */}
                    <td className="py-3.5 px-4 text-xs text-text-secondary">
                      {doc.uploadedBy?.name || '—'}
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-xs text-text-muted whitespace-nowrap">
                      {timeAgo(doc.createdAt)}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`badge text-[10px] ${
                          doc.isApproved
                            ? 'badge-green'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {doc.isApproved ? '✓ Approved' : '⏳ Pending'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1">
                        {/* View */}
                        <Link
                          href={`/library/${doc.id}`}
                          title="View document"
                          className="p-1.5 rounded-lg text-text-muted hover:text-primary hover:bg-blue-50 transition-colors"
                        >
                          <Eye size={14} />
                        </Link>

                        {/* Approve */}
                        {!doc.isApproved && (
                          <button
                            onClick={() => approve(doc.id, true)}
                            disabled={actionLoading === doc.id}
                            title="Approve"
                            className="p-1.5 rounded-lg text-text-muted hover:text-success hover:bg-green-50 transition-colors"
                          >
                            {actionLoading === doc.id ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <CheckCircle size={14} />
                            )}
                          </button>
                        )}

                        {/* Reject */}
                        {doc.isApproved && (
                          <button
                            onClick={() => approve(doc.id, false)}
                            disabled={actionLoading === doc.id}
                            title="Reject"
                            className="p-1.5 rounded-lg text-text-muted hover:text-warning hover:bg-amber-50 transition-colors"
                          >
                            <XCircle size={14} />
                          </button>
                        )}

                        {/* Delete */}
                        <button
                          onClick={() => deleteDoc(doc.id)}
                          disabled={actionLoading === doc.id + '-del'}
                          title="Delete permanently"
                          className="p-1.5 rounded-lg text-text-muted hover:text-danger hover:bg-red-50 transition-colors"
                        >
                          {actionLoading === doc.id + '-del' ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Trash2 size={14} />
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

// src/app/(dashboard)/library/[id]/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Download, Eye, Crown, Lock, ExternalLink,
  FileText, Calendar, Building, GraduationCap, Tag, Loader2
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { StarRating } from '@/components/documents/StarRating'
import { CommentSection } from '@/components/documents/CommentSection'
import { formatFileSize, timeAgo, CATEGORY_LABELS } from '@/lib/utils'
import toast from 'react-hot-toast'
import type { Document } from '@/types'

export default function DocumentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const router = useRouter()
  const [doc, setDoc] = useState<(Document & { avgRating: number; userRating: number | null }) | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [ratingLoading, setRatingLoading] = useState(false)

  useEffect(() => {
    fetch(`/api/documents/${id}`)
      .then(r => r.json())
      .then(d => {
        if (d.success) setDoc(d.data)
        else setError(d.error || 'Document not found')
      })
      .catch(() => setError('Failed to load document'))
      .finally(() => setLoading(false))
  }, [id])

  const handleRate = async (score: number) => {
    if (!user) { toast.error('Sign in to rate'); return }
    setRatingLoading(true)
    try {
      const res = await fetch(`/api/documents/${id}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score }),
      })
      const data = await res.json()
      if (data.success) {
        setDoc(prev => prev ? { ...prev, avgRating: data.data.avgRating, userRating: score } : prev)
        toast.success('Rating saved!')
      }
    } finally {
      setRatingLoading(false)
    }
  }

  const handleDownload = async () => {
    if (!doc) return
    if (doc.isPremium && !user?.isPremium && user?.role !== 'ADMIN') {
      toast.error('This is a premium document. Upgrade to download.')
      router.push('/premium')
      return
    }
    await fetch(`/api/documents/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: '{}' })
    window.open(doc.fileUrl, '_blank')
    toast.success('Download started!')
  }

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <Loader2 className="animate-spin text-primary" size={32} />
    </div>
  )

  if (error) return (
    <div className="max-w-lg mx-auto text-center py-16">
      <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <Lock size={28} className="text-danger" />
      </div>
      <h2 className="font-bold text-text-primary text-xl mb-2">{error}</h2>
      {error.includes('Premium') && (
        <Link href="/premium" className="btn-primary mt-4 inline-flex"><Crown size={16} /> Upgrade to Premium</Link>
      )}
      <Link href="/library" className="btn-secondary mt-3 inline-flex"><ArrowLeft size={16} /> Back to Library</Link>
    </div>
  )

  if (!doc) return null

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back */}
      <button onClick={() => router.back()} className="flex items-center gap-2 text-text-muted hover:text-primary text-sm transition-colors">
        <ArrowLeft size={16} /> Back
      </button>

      {/* Main card */}
      <div className="card p-6">
        {/* Header */}
        <div className="flex items-start gap-4 mb-6">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-sm flex-shrink-0 ${
            doc.fileType === 'PDF' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
          }`}>
            {doc.fileType}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-2 flex-wrap">
              <h1 className="text-xl font-display font-bold text-text-primary leading-snug flex-1">{doc.title}</h1>
              {doc.isPremium && (
                <span className="premium-badge flex-shrink-0"><Crown size={11} /> Premium</span>
              )}
            </div>
            {doc.description && <p className="text-text-secondary text-sm mt-2 leading-relaxed">{doc.description}</p>}

            {/* Meta */}
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="badge-blue flex items-center gap-1"><Building size={11} /> {doc.school}</span>
              <span className="badge-gray flex items-center gap-1"><GraduationCap size={11} /> {doc.level}</span>
              <span className="badge-gray">{doc.subject}</span>
              <span className="badge bg-purple-100 text-purple-700">{CATEGORY_LABELS[doc.category]}</span>
              {doc.year && <span className="badge-gray flex items-center gap-1"><Calendar size={11} /> {doc.year}</span>}
            </div>

            {doc.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {doc.tags.map(tag => (
                  <span key={tag} className="inline-flex items-center gap-1 text-xs text-text-muted bg-background px-2 py-0.5 rounded-lg">
                    <Tag size={10} /> {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-4 py-4 border-y border-border/60 text-sm text-text-muted">
          <span className="flex items-center gap-1.5"><Eye size={14} /> {doc.viewCount.toLocaleString()} views</span>
          <span className="flex items-center gap-1.5"><Download size={14} /> {doc.downloadCount.toLocaleString()} downloads</span>
          <span className="flex items-center gap-1.5 text-text-secondary">
            By <span className="font-medium text-text-primary">{doc.uploadedBy.name}</span>
          </span>
          <span className="ml-auto">{timeAgo(doc.createdAt)}</span>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-3 py-4 border-b border-border/60">
          <div>
            <p className="text-sm font-medium text-text-primary mb-1">
              {doc.userRating ? 'Your rating' : 'Rate this document'}
            </p>
            <StarRating value={doc.userRating ?? 0} onChange={handleRate} readonly={ratingLoading} size={22} />
          </div>
          <div className="ml-auto text-right">
            <p className="text-2xl font-display font-bold text-text-primary">{doc.avgRating.toFixed(1)}</p>
            <p className="text-xs text-text-muted">{doc._count?.ratings ?? 0} ratings</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 pt-4">
          <button onClick={handleDownload}
            className={`btn-primary flex-1 ${doc.isPremium && !user?.isPremium ? 'opacity-70' : ''}`}>
            {doc.isPremium && !user?.isPremium
              ? <><Lock size={16} /> Premium Required</>
              : <><Download size={16} /> Download ({formatFileSize(doc.fileSize)})</>}
          </button>
          {doc.hasSolution && doc.solutionUrl && (
            <a href={doc.solutionUrl} target="_blank" rel="noopener noreferrer"
              className={`btn-secondary flex-1 text-center ${doc.isPremium && !user?.isPremium ? 'opacity-50 pointer-events-none' : ''}`}>
              <ExternalLink size={16} /> View Solution
            </a>
          )}
        </div>

        {doc.isPremium && !user?.isPremium && (
          <div className="mt-3 bg-amber-50 border border-amber-100 rounded-xl p-4 flex items-start gap-3">
            <Crown size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-800">Premium document</p>
              <p className="text-xs text-amber-700 mt-0.5">Subscribe from 2,500 XAF/month to access this and all premium content.</p>
              <Link href="/premium" className="inline-flex items-center gap-1 mt-2 text-xs font-bold text-amber-700 hover:text-amber-900">
                Upgrade now <ArrowLeft size={10} className="rotate-180" />
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Uploaded by */}
      <div className="card p-4 flex items-center gap-3">
        <div className="w-10 h-10 gradient-header rounded-xl flex items-center justify-center text-white text-sm font-bold">
          {doc.uploadedBy.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="text-sm font-semibold text-text-primary">{doc.uploadedBy.name}</p>
          {doc.uploadedBy.university && <p className="text-xs text-text-muted">{doc.uploadedBy.university}</p>}
        </div>
        <FileText size={14} className="ml-auto text-text-muted" />
      </div>

      {/* Comments */}
      <div className="card p-6">
        <CommentSection documentId={id} />
      </div>
    </div>
  )
}

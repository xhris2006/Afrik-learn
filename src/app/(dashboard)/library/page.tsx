// src/app/(dashboard)/library/page.tsx
'use client'

import { useEffect, useState, useCallback } from 'react'
import { Search, Filter, X, Plus, SlidersHorizontal } from 'lucide-react'
import { DocumentCard } from '@/components/documents/DocumentCard'
import { UploadModal } from '@/components/documents/UploadModal'
import { CAMEROON_UNIVERSITIES, ACADEMIC_LEVELS, SUBJECTS, CATEGORY_LABELS } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import type { Document } from '@/types'

const CATEGORIES = Object.entries(CATEGORY_LABELS)

export default function LibraryPage() {
  const { user } = useAuth()
  const [docs, setDocs] = useState<Document[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [uploadOpen, setUploadOpen] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const [filters, setFilters] = useState({
    search: '', school: '', level: '', subject: '', category: '', isPremium: '',
  })

  const fetchDocs = useCallback(async (reset = false) => {
    setLoading(true)
    const p = reset ? 1 : page
    const params = new URLSearchParams({ page: String(p), limit: '12' })
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v) })

    const res = await fetch(`/api/documents?${params}`)
    const data = await res.json()
    if (data.success) {
      setDocs(reset ? data.data.data : prev => [...prev, ...data.data.data])
      setTotal(data.data.pagination.total)
      if (reset) setPage(2); else setPage(p + 1)
    }
    setLoading(false)
  }, [filters, page])

  useEffect(() => { fetchDocs(true) }, [filters])

  const setFilter = (k: string, v: string) => {
    setFilters(prev => ({ ...prev, [k]: v }))
    setPage(1)
  }

  const clearFilters = () => {
    setFilters({ search: '', school: '', level: '', subject: '', category: '', isPremium: '' })
  }

  const hasFilters = Object.values(filters).some(Boolean)

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title">Document Library</h1>
          <p className="text-text-muted text-sm">{total.toLocaleString()} documents available</p>
        </div>
        <button onClick={() => setUploadOpen(true)} className="btn-primary text-sm">
          <Plus size={16} /> Upload
        </button>
      </div>

      {/* Search bar */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
          <input
            value={filters.search}
            onChange={e => setFilter('search', e.target.value)}
            placeholder="Search by title, subject, tags…"
            className="input pl-11 w-full"
          />
          {filters.search && (
            <button onClick={() => setFilter('search', '')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-danger">
              <X size={16} />
            </button>
          )}
        </div>
        <button onClick={() => setFiltersOpen(!filtersOpen)}
          className={`btn-secondary gap-2 relative ${hasFilters ? 'border-primary text-primary' : ''}`}>
          <SlidersHorizontal size={16} /> Filters
          {hasFilters && <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-primary rounded-full text-white text-[9px] flex items-center justify-center font-bold">
            {Object.values(filters).filter(Boolean).length}
          </span>}
        </button>
      </div>

      {/* Filter panel */}
      {filtersOpen && (
        <div className="card p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 animate-fade-in">
          <div>
            <label className="input-label text-xs">University</label>
            <select value={filters.school} onChange={e => setFilter('school', e.target.value)} className="input text-sm py-2 appearance-none">
              <option value="">All universities</option>
              {CAMEROON_UNIVERSITIES.map(u => <option key={u} value={u}>{u.split(' ').slice(0, 3).join(' ')}</option>)}
            </select>
          </div>
          <div>
            <label className="input-label text-xs">Level</label>
            <select value={filters.level} onChange={e => setFilter('level', e.target.value)} className="input text-sm py-2 appearance-none">
              <option value="">All levels</option>
              {ACADEMIC_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="input-label text-xs">Subject</label>
            <select value={filters.subject} onChange={e => setFilter('subject', e.target.value)} className="input text-sm py-2 appearance-none">
              <option value="">All subjects</option>
              {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="input-label text-xs">Category</label>
            <select value={filters.category} onChange={e => setFilter('category', e.target.value)} className="input text-sm py-2 appearance-none">
              <option value="">All categories</option>
              {CATEGORIES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="input-label text-xs">Access</label>
            <select value={filters.isPremium} onChange={e => setFilter('isPremium', e.target.value)} className="input text-sm py-2 appearance-none">
              <option value="">All documents</option>
              <option value="false">Free only</option>
              <option value="true">Premium only</option>
            </select>
          </div>
          {hasFilters && (
            <div className="col-span-full flex justify-end">
              <button onClick={clearFilters} className="text-xs text-danger hover:underline flex items-center gap-1">
                <X size={12} /> Clear all filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* Category quick filters */}
      <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
        {[['', 'All'], ...CATEGORIES].map(([v, l]) => (
          <button key={v} onClick={() => setFilter('category', v)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filters.category === v ? 'bg-primary text-white shadow-button' : 'bg-white text-text-secondary hover:bg-blue-50 border border-border'
            }`}>
            {l}
          </button>
        ))}
      </div>

      {/* Documents grid */}
      {loading && docs.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card p-4 flex gap-3">
              <div className="w-12 h-12 skeleton rounded-xl flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-4 rounded w-3/4" />
                <div className="skeleton h-3 rounded w-1/2" />
                <div className="skeleton h-3 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : docs.length === 0 ? (
        <div className="card p-12 text-center">
          <Search size={40} className="text-border mx-auto mb-3" />
          <p className="text-text-primary font-semibold">No documents found</p>
          <p className="text-text-muted text-sm mt-1">Try adjusting your filters</p>
          {hasFilters && <button onClick={clearFilters} className="btn-secondary mt-4 mx-auto">Clear filters</button>}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {docs.map(doc => <DocumentCard key={doc.id} doc={doc} />)}
          </div>
          {docs.length < total && (
            <div className="flex justify-center pt-2">
              <button onClick={() => fetchDocs(false)} disabled={loading}
                className="btn-secondary">
                {loading ? 'Loading…' : `Load more (${total - docs.length} remaining)`}
              </button>
            </div>
          )}
        </>
      )}

      <UploadModal open={uploadOpen} onClose={() => setUploadOpen(false)} onSuccess={() => fetchDocs(true)} />
    </div>
  )
}

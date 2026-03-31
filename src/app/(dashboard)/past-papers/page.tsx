// src/app/(dashboard)/past-papers/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { Search, Filter, FileText, CheckCircle } from 'lucide-react'
import { DocumentCard } from '@/components/documents/DocumentCard'
import { CAMEROON_UNIVERSITIES, ACADEMIC_LEVELS, SUBJECTS } from '@/lib/utils'
import type { Document } from '@/types'

export default function PastPapersPage() {
  const [docs, setDocs] = useState<Document[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ search: '', school: '', level: '', subject: '', year: '' })

  const fetchPapers = async () => {
    setLoading(true)
    const params = new URLSearchParams({ category: 'PAST_PAPER', limit: '20' })
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v) })
    const res = await fetch(`/api/documents?${params}`)
    const data = await res.json()
    if (data.success) { setDocs(data.data.data); setTotal(data.data.pagination.total) }
    setLoading(false)
  }

  useEffect(() => { fetchPapers() }, [filters])

  const years = Array.from({ length: 10 }, (_, i) => String(new Date().getFullYear() - i))

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div>
        <h1 className="section-title flex items-center gap-2">
          <FileText className="text-primary" size={22} /> Past Exam Papers
        </h1>
        <p className="text-text-muted text-sm mt-1">{total} papers available</p>
      </div>

      {/* Filters */}
      <div className="card p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="col-span-full sm:col-span-2 lg:col-span-1 relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input value={filters.search} onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
            placeholder="Search papers…" className="input pl-9 text-sm py-2" />
        </div>
        <select value={filters.school} onChange={e => setFilters(f => ({ ...f, school: e.target.value }))} className="input text-sm py-2 appearance-none">
          <option value="">All universities</option>
          {CAMEROON_UNIVERSITIES.map(u => <option key={u} value={u}>{u.split(' ').slice(0, 3).join(' ')}</option>)}
        </select>
        <select value={filters.level} onChange={e => setFilters(f => ({ ...f, level: e.target.value }))} className="input text-sm py-2 appearance-none">
          <option value="">All levels</option>
          {ACADEMIC_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
        </select>
        <select value={filters.subject} onChange={e => setFilters(f => ({ ...f, subject: e.target.value }))} className="input text-sm py-2 appearance-none">
          <option value="">All subjects</option>
          {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={filters.year} onChange={e => setFilters(f => ({ ...f, year: e.target.value }))} className="input text-sm py-2 appearance-none">
          <option value="">All years</option>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {/* Solutions banner */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100 rounded-2xl p-4 flex items-center gap-3">
        <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <CheckCircle size={20} className="text-green-600" />
        </div>
        <div>
          <p className="font-semibold text-green-800 text-sm">Solutions & corrections available</p>
          <p className="text-green-700 text-xs mt-0.5">Papers marked with a ✓ include detailed corrections. Premium subscription required.</p>
        </div>
      </div>

      {/* Papers grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card p-4 flex gap-3">
              <div className="w-12 h-12 skeleton rounded-xl flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-4 rounded w-3/4" />
                <div className="skeleton h-3 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : docs.length === 0 ? (
        <div className="card p-12 text-center">
          <FileText size={40} className="text-border mx-auto mb-3" />
          <p className="text-text-primary font-semibold">No past papers found</p>
          <p className="text-text-muted text-sm mt-1">Adjust your filters or check back later.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {docs.map(doc => (
            <div key={doc.id} className="relative">
              {doc.hasSolution && (
                <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  <CheckCircle size={10} /> Solution
                </div>
              )}
              <DocumentCard doc={doc} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

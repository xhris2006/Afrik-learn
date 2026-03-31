// src/components/documents/DocumentCard.tsx
'use client'

import Link from 'next/link'
import { FileText, Download, Eye, Star, Lock, Crown, Calendar } from 'lucide-react'
import { cn, formatFileSize, timeAgo, CATEGORY_LABELS } from '@/lib/utils'
import type { Document } from '@/types'

interface Props {
  doc: Document
  compact?: boolean
}

const FILE_COLORS: Record<string, string> = {
  PDF: 'bg-red-100 text-red-600',
  DOC: 'bg-blue-100 text-blue-600',
  DOCX: 'bg-blue-100 text-blue-600',
  PPT: 'bg-orange-100 text-orange-600',
  PPTX: 'bg-orange-100 text-orange-600',
}

export function DocumentCard({ doc, compact = false }: Props) {
  const avg = doc.avgRating ?? 0
  const colorClass = FILE_COLORS[doc.fileType] ?? 'bg-gray-100 text-gray-600'

  return (
    <Link href={`/library/${doc.id}`}>
      <div className={cn('card-hover p-4', compact ? 'flex gap-3 items-start' : 'flex flex-col gap-3')}>
        {/* File type icon */}
        <div className={cn('rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0',
          colorClass, compact ? 'w-10 h-10' : 'w-12 h-12 text-sm')}>
          {doc.fileType}
        </div>

        <div className="flex-1 min-w-0">
          {/* Header row */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className={cn('font-semibold text-text-primary leading-snug line-clamp-2',
                compact ? 'text-sm' : 'text-base')}>
                {doc.title}
              </h3>
              {!compact && doc.description && (
                <p className="text-text-muted text-xs mt-1 line-clamp-2">{doc.description}</p>
              )}
            </div>
            {doc.isPremium && (
              <span className="premium-badge flex-shrink-0">
                <Crown size={10} /> PRO
              </span>
            )}
          </div>

          {/* Meta chips */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            <span className="badge-blue">{doc.school.split(' ').slice(-1)[0]}</span>
            <span className="badge-gray">{doc.level}</span>
            <span className="badge-gray">{doc.subject}</span>
            {doc.category === 'PAST_PAPER' && doc.year && (
              <span className="badge bg-purple-100 text-purple-700">
                <Calendar size={10} /> {doc.year}
              </span>
            )}
          </div>

          {/* Stats row */}
          {!compact && (
            <div className="flex items-center gap-3 mt-3 text-xs text-text-muted">
              <span className="flex items-center gap-1">
                <Eye size={12} /> {doc.viewCount.toLocaleString()}
              </span>
              <span className="flex items-center gap-1">
                <Download size={12} /> {doc.downloadCount.toLocaleString()}
              </span>
              {avg > 0 && (
                <span className="flex items-center gap-1 text-amber-500 font-medium">
                  <Star size={12} fill="currentColor" /> {avg.toFixed(1)}
                </span>
              )}
              <span className="ml-auto">{timeAgo(doc.createdAt)}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}

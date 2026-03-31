// src/components/documents/StarRating.tsx
'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  value: number
  onChange?: (score: number) => void
  readonly?: boolean
  size?: number
}

export function StarRating({ value, onChange, readonly = false, size = 20 }: Props) {
  const [hover, setHover] = useState(0)
  const display = hover || value

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => !readonly && setHover(star)}
          onMouseLeave={() => setHover(0)}
          className={cn('transition-all duration-100', !readonly && 'hover:scale-110 cursor-pointer', readonly && 'cursor-default')}
        >
          <Star
            size={size}
            className={star <= display ? 'text-amber-400' : 'text-border'}
            fill={star <= display ? 'currentColor' : 'none'}
          />
        </button>
      ))}
    </div>
  )
}

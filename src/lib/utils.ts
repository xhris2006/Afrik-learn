// src/lib/utils.ts
// Shared utility functions

import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { formatDistanceToNow, format } from 'date-fns'

// ── Tailwind class merging ─────────────────────────────────────
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ── Format file size ──────────────────────────────────────────
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
}

// ── Format currency (XAF) ─────────────────────────────────────
export function formatCurrency(amount: number, currency = 'XAF'): string {
  return new Intl.NumberFormat('fr-CM', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// ── Time ago ──────────────────────────────────────────────────
export function timeAgo(date: Date | string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

// ── Format date ───────────────────────────────────────────────
export function formatDate(date: Date | string, fmt = 'MMM d, yyyy'): string {
  return format(new Date(date), fmt)
}

// ── Get file type from extension ─────────────────────────────
export function getFileTypeFromName(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase()
  const types: Record<string, string> = {
    pdf: 'PDF', doc: 'DOC', docx: 'DOCX',
    ppt: 'PPT', pptx: 'PPTX',
    jpg: 'IMAGE', jpeg: 'IMAGE', png: 'IMAGE',
  }
  return types[ext || ''] || 'OTHER'
}

// ── Get avatar initials ───────────────────────────────────────
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

// ── Universities in Cameroon ──────────────────────────────────
export const CAMEROON_UNIVERSITIES = [
  'University of Yaoundé I',
  'University of Yaoundé II (Soa)',
  'University of Douala',
  'University of Buea',
  'University of Dschang',
  'University of Ngaoundéré',
  'University of Maroua',
  'University of Bamenda',
  'ENSP Yaoundé',
  'ESSEC Douala',
  'ICY Yaoundé',
  'Other',
]

// ── Academic levels ───────────────────────────────────────────
export const ACADEMIC_LEVELS = ['L1', 'L2', 'L3', 'M1', 'M2', 'PhD', 'HND1', 'HND2', 'BTS1', 'BTS2']

// ── Subjects ─────────────────────────────────────────────────
export const SUBJECTS = [
  'Mathematics', 'Physics', 'Chemistry', 'Biology',
  'Computer Science', 'Economics', 'Law', 'Medicine',
  'Engineering', 'Literature', 'History', 'Geography',
  'Accounting', 'Management', 'Statistics', 'Philosophy',
]

// ── Document category labels ──────────────────────────────────
export const CATEGORY_LABELS: Record<string, string> = {
  COURSE_MATERIAL: 'Course Material',
  PAST_PAPER: 'Past Paper',
  SOLUTION: 'Solution',
  NOTES: 'Notes',
  THESIS: 'Thesis',
  PROJECT: 'Project',
  TUTORIAL: 'Tutorial',
}

// ── Announcement category config ──────────────────────────────
export const ANNOUNCEMENT_CATEGORIES = {
  HOUSING: { label: 'Housing', color: 'bg-blue-100 text-blue-700', emoji: '🏠' },
  INTERNSHIP: { label: 'Internship', color: 'bg-green-100 text-green-700', emoji: '💼' },
  JOB: { label: 'Job', color: 'bg-purple-100 text-purple-700', emoji: '👔' },
  SCHOLARSHIP: { label: 'Scholarship', color: 'bg-yellow-100 text-yellow-700', emoji: '🎓' },
  EVENT: { label: 'Event', color: 'bg-pink-100 text-pink-700', emoji: '🎉' },
  GENERAL: { label: 'General', color: 'bg-gray-100 text-gray-700', emoji: '📢' },
  EXAM: { label: 'Exam', color: 'bg-red-100 text-red-700', emoji: '📝' },
} as const

// ── Truncate text ─────────────────────────────────────────────
export function truncate(text: string, maxLength = 80): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + '…'
}

// ── Average rating ────────────────────────────────────────────
export function averageRating(ratings: { score: number }[]): number {
  if (!ratings.length) return 0
  const sum = ratings.reduce((acc, r) => acc + r.score, 0)
  return Math.round((sum / ratings.length) * 10) / 10
}

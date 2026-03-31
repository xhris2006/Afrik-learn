// src/types/index.ts
// Shared TypeScript type definitions

export type Role = 'ADMIN' | 'MODERATOR' | 'STUDENT'
export type FileType = 'PDF' | 'DOC' | 'DOCX' | 'PPT' | 'PPTX' | 'IMAGE' | 'OTHER'
export type DocumentCategory = 'COURSE_MATERIAL' | 'PAST_PAPER' | 'SOLUTION' | 'NOTES' | 'THESIS' | 'PROJECT' | 'TUTORIAL'
export type AnnouncementCategory = 'HOUSING' | 'INTERNSHIP' | 'JOB' | 'SCHOLARSHIP' | 'EVENT' | 'GENERAL' | 'EXAM'
export type PaymentStatus = 'PENDING' | 'SUCCESSFUL' | 'FAILED' | 'CANCELLED'
export type PremiumPlan = 'MONTHLY' | 'SEMESTER' | 'ANNUAL'
export type RoomType = 'GENERAL' | 'SCHOOL' | 'FACULTY' | 'STUDY_GROUP'

// ── Auth ──────────────────────────────────────────────────────
export interface AuthUser {
  id: string
  email: string
  name: string
  role: Role
  avatar?: string | null
  university?: string | null
  faculty?: string | null
  level?: string | null
  isPremium: boolean
  premiumUntil?: Date | null
  isActive: boolean
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  name: string
  email: string
  password: string
  university?: string
  faculty?: string
  level?: string
}

// ── Documents ─────────────────────────────────────────────────
export interface Document {
  id: string
  title: string
  description?: string | null
  fileUrl: string
  fileType: FileType
  fileSize: number
  thumbnailUrl?: string | null
  category: DocumentCategory
  isPremium: boolean
  isApproved: boolean
  downloadCount: number
  viewCount: number
  school: string
  faculty?: string | null
  level: string
  subject: string
  year?: number | null
  hasSolution: boolean
  solutionUrl?: string | null
  tags: string[]
  createdAt: Date
  updatedAt: Date
  uploadedBy: Pick<AuthUser, 'id' | 'name' | 'avatar' | 'university'>
  ratings: { score: number }[]
  _count?: { comments: number; ratings: number }
  avgRating?: number
}

export interface DocumentFilters {
  search?: string
  school?: string
  level?: string
  subject?: string
  category?: DocumentCategory
  isPremium?: boolean
  page?: number
  limit?: number
}

// ── Comments ─────────────────────────────────────────────────
export interface Comment {
  id: string
  content: string
  createdAt: Date
  user: Pick<AuthUser, 'id' | 'name' | 'avatar'>
  replies?: Comment[]
  parentId?: string | null
}

// ── Chat ─────────────────────────────────────────────────────
export interface ChatRoom {
  id: string
  name: string
  description?: string | null
  roomType: RoomType
  school?: string | null
  isPublic: boolean
  _count?: { members: number; messages: number }
}

export interface ChatMessage {
  id: string
  content: string
  fileUrl?: string | null
  createdAt: Date
  sender: Pick<AuthUser, 'id' | 'name' | 'avatar'>
}

// ── Announcements ─────────────────────────────────────────────
export interface Announcement {
  id: string
  title: string
  content: string
  category: AnnouncementCategory
  school?: string | null
  imageUrl?: string | null
  externalUrl?: string | null
  isPinned: boolean
  isActive: boolean
  expiresAt?: Date | null
  createdAt: Date
}

// ── Payments ─────────────────────────────────────────────────
export interface Payment {
  id: string
  transactionId: string
  amount: number
  currency: string
  status: PaymentStatus
  plan: PremiumPlan
  createdAt: Date
}

// ── API responses ─────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  details?: unknown
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
    hasMore: boolean
  }
}

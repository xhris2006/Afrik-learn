// src/components/documents/UploadModal.tsx
'use client'

import { useState } from 'react'
import { X, Upload, Loader2, FileText, CheckCircle } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { CAMEROON_UNIVERSITIES, ACADEMIC_LEVELS, SUBJECTS } from '@/lib/utils'

const schema = z.object({
  title: z.string().min(3, 'Title too short'),
  description: z.string().optional(),
  fileUrl: z.string().url('Must be a valid URL'),
  fileType: z.enum(['PDF', 'DOC', 'DOCX', 'PPT', 'PPTX', 'IMAGE', 'OTHER']),
  fileSize: z.coerce.number().int().positive(),
  category: z.enum(['COURSE_MATERIAL', 'PAST_PAPER', 'SOLUTION', 'NOTES', 'THESIS', 'PROJECT', 'TUTORIAL']),
  school: z.string().min(2),
  level: z.string().min(1),
  subject: z.string().min(2),
  year: z.coerce.number().int().min(2000).max(2030).optional(),
  isPremium: z.boolean().default(false),
  tags: z.string().optional(),
})
type FormData = z.infer<typeof schema>

interface Props {
  open: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function UploadModal({ open, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { fileType: 'PDF', category: 'COURSE_MATERIAL', isPremium: false },
  })

  const category = watch('category')

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      const payload = {
        ...data,
        tags: data.tags ? data.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      }
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const result = await res.json()
      if (result.success) {
        setDone(true)
        setTimeout(() => {
          setDone(false); reset(); onSuccess?.(); onClose()
        }, 2000)
      } else {
        toast.error(result.error || 'Upload failed')
      }
    } catch {
      toast.error('Network error')
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fade-in">
        <div className="sticky top-0 bg-white border-b border-border/60 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 gradient-header rounded-xl flex items-center justify-center">
              <Upload size={18} className="text-white" />
            </div>
            <div>
              <h2 className="font-display font-bold text-text-primary">Upload Document</h2>
              <p className="text-xs text-text-muted">Share knowledge with students</p>
            </div>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-danger p-1.5 rounded-lg hover:bg-red-50 transition-colors">
            <X size={18} />
          </button>
        </div>

        {done ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle size={32} className="text-success" />
            </div>
            <div className="text-center">
              <p className="font-bold text-text-primary">Document submitted!</p>
              <p className="text-text-muted text-sm mt-1">It will be reviewed by our team shortly.</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
            <div>
              <label className="input-label">Title *</label>
              <input {...register('title')} placeholder="e.g. Calculus I — Lecture Notes" className="input" />
              {errors.title && <p className="text-danger text-xs mt-1">{errors.title.message}</p>}
            </div>

            <div>
              <label className="input-label">Description</label>
              <textarea {...register('description')} rows={2} placeholder="Brief description…" className="input resize-none" />
            </div>

            <div>
              <label className="input-label">File URL * <span className="text-text-muted font-normal">(Google Drive, Cloudinary, etc.)</span></label>
              <input {...register('fileUrl')} placeholder="https://drive.google.com/…" className="input" />
              {errors.fileUrl && <p className="text-danger text-xs mt-1">{errors.fileUrl.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="input-label">File type *</label>
                <select {...register('fileType')} className="input appearance-none">
                  {['PDF', 'DOC', 'DOCX', 'PPT', 'PPTX', 'IMAGE', 'OTHER'].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="input-label">File size (bytes) *</label>
                <input {...register('fileSize')} type="number" placeholder="1048576" className="input" />
                {errors.fileSize && <p className="text-danger text-xs mt-1">{errors.fileSize.message}</p>}
              </div>
            </div>

            <div>
              <label className="input-label">Category *</label>
              <select {...register('category')} className="input appearance-none">
                {[
                  ['COURSE_MATERIAL', 'Course Material'],
                  ['PAST_PAPER', 'Past Paper'],
                  ['SOLUTION', 'Solution / Correction'],
                  ['NOTES', 'Notes'],
                  ['THESIS', 'Thesis'],
                  ['PROJECT', 'Project'],
                  ['TUTORIAL', 'Tutorial'],
                ].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>

            <div>
              <label className="input-label">University *</label>
              <select {...register('school')} className="input appearance-none">
                <option value="">Select university…</option>
                {CAMEROON_UNIVERSITIES.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
              {errors.school && <p className="text-danger text-xs mt-1">{errors.school.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="input-label">Academic level *</label>
                <select {...register('level')} className="input appearance-none">
                  <option value="">Select…</option>
                  {ACADEMIC_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
                {errors.level && <p className="text-danger text-xs mt-1">{errors.level.message}</p>}
              </div>
              <div>
                <label className="input-label">Subject *</label>
                <select {...register('subject')} className="input appearance-none">
                  <option value="">Select…</option>
                  {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            {category === 'PAST_PAPER' && (
              <div>
                <label className="input-label">Exam year</label>
                <input {...register('year')} type="number" placeholder="2023" className="input" />
              </div>
            )}

            <div>
              <label className="input-label">Tags <span className="text-text-muted font-normal">(comma separated)</span></label>
              <input {...register('tags')} placeholder="algebra, calculus, L1" className="input" />
            </div>

            <div className="flex items-center gap-3 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
              <input {...register('isPremium')} type="checkbox" id="isPremium" className="w-4 h-4 accent-amber-500" />
              <label htmlFor="isPremium" className="text-sm font-medium text-amber-800 cursor-pointer">
                👑 Mark as Premium (subscribers only)
              </label>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
              <button type="submit" disabled={loading} className="btn-primary flex-1">
                {loading ? <Loader2 size={16} className="animate-spin" /> : <><Upload size={16} /> Submit</>}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

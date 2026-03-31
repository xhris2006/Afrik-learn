// src/app/api/upload/route.ts
// Handles file uploads — returns a Cloudinary URL for the uploaded file.
// In production, connect to Cloudinary (or Supabase Storage).

import { NextRequest } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { success, unauthorized, error, serverError } from '@/lib/api'

const MAX_SIZE = 50 * 1024 * 1024 // 50MB

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return unauthorized()

    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) return error('No file provided', 400)
    if (file.size > MAX_SIZE) return error('File too large. Maximum 50MB.', 413)

    // ── In production: upload to Cloudinary ──────────────────
    // const cloudinary = require('cloudinary').v2
    // cloudinary.config({ cloud_name, api_key, api_secret })
    // const buffer = Buffer.from(await file.arrayBuffer())
    // const result = await new Promise((resolve, reject) => {
    //   cloudinary.uploader.upload_stream(
    //     { resource_type: 'raw', folder: 'afriklearn/documents' },
    //     (err: any, result: any) => { if (err) reject(err); else resolve(result) }
    //   ).end(buffer)
    // })
    // return success({ url: result.secure_url, publicId: result.public_id })

    // ── Development: return a mock URL ──────────────────────
    // Replace this with real Cloudinary logic above in production
    const mockUrl = `/uploads/${Date.now()}-${file.name}`
    return success({
      url: mockUrl,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      message: 'In production, connect Cloudinary in this route.',
    })
  } catch (err) {
    return serverError(err)
  }
}

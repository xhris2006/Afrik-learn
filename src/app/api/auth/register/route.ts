// src/app/api/auth/register/route.ts
import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { signToken, getAuthCookieOptions } from '@/lib/auth'
import { success, error, validationError, serverError } from '@/lib/api'
import { cookies } from 'next/headers'

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  university: z.string().optional(),
  faculty: z.string().optional(),
  level: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = registerSchema.safeParse(body)
    if (!parsed.success) return validationError(parsed.error)

    const { name, email, password, university, faculty, level } = parsed.data
    const normalizedEmail = email.toLowerCase().trim()
    const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase().trim()
    const role = adminEmail && normalizedEmail === adminEmail ? 'ADMIN' : 'STUDENT'

    // Check existing user
    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } })
    if (existing) return error('An account with this email already exists', 409)

    // Hash password
    const hashed = await bcrypt.hash(password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        password: hashed,
        university,
        faculty,
        level,
        role,
      },
    })

    // Sign JWT
    const token = await signToken({ userId: user.id, email: user.email, role: user.role })
    cookies().set('afriklearn_token', token, getAuthCookieOptions())

    return success({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
        university: user.university,
        faculty: user.faculty,
        level: user.level,
        isPremium: user.isPremium,
        premiumUntil: user.premiumUntil,
        isActive: user.isActive,
      },
    }, 201)
  } catch (err) {
    return serverError(err)
  }
}

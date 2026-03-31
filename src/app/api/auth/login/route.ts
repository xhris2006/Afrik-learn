// src/app/api/auth/login/route.ts
import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { signToken, getAuthCookieOptions } from '@/lib/auth'
import { success, error, validationError, serverError } from '@/lib/api'
import { cookies } from 'next/headers'

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password too short'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = loginSchema.safeParse(body)
    if (!parsed.success) return validationError(parsed.error)

    const { email, password } = parsed.data

    // Find user
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
    if (!user) return error('Invalid email or password', 401)
    if (!user.isActive) return error('Account is deactivated. Contact support.', 403)

    // Verify password
    const valid = await bcrypt.compare(password, user.password)
    if (!valid) return error('Invalid email or password', 401)

    // Sign JWT
    const token = await signToken({ userId: user.id, email: user.email, role: user.role })

    // Set cookie
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
    })
  } catch (err) {
    return serverError(err)
  }
}

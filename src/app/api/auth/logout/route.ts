// src/app/api/auth/logout/route.ts
import { cookies } from 'next/headers'
import { success } from '@/lib/api'

export async function POST() {
  cookies().delete('afriklearn_token')
  return success({ message: 'Logged out successfully' })
}

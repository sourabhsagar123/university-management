'use server'

import { redirect } from 'next/navigation'
import prisma from '@/lib/db'
import { createSession, destroySession, getSession, verifyPassword } from '@/lib/auth'
import { loginSchema } from '@/lib/validations'
import type { SessionUser } from '@/lib/auth'

export async function login(formData: FormData): Promise<{ error: string } | void> {
  const rawData = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const parsed = loginSchema.safeParse(rawData)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || 'Invalid credentials format' }
  }

  const { email, password } = parsed.data

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return { error: 'Invalid email or password' }
    }

    const isValid = await verifyPassword(password, user.passwordHash)
    if (!isValid) {
      return { error: 'Invalid email or password' }
    }

    const sessionUser: SessionUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as SessionUser['role'],
    }

    await createSession(sessionUser)

    const redirectMap: Record<string, string> = {
      ADMIN: '/admin',
      FACULTY: '/faculty',
      STUDENT: '/student',
    }

    redirect(redirectMap[user.role] || '/login')
  } catch (error) {
    // Next.js redirect throws a special error, re-throw it
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      throw error
    }
    return { error: 'An unexpected error occurred. Please try again.' }
  }
}

export async function logout(): Promise<void> {
  await destroySession()
  redirect('/login')
}

export async function getAuthUser(): Promise<SessionUser | null> {
  return getSession()
}

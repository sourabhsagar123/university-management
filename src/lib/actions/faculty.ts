'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/db'
import { hashPassword } from '@/lib/auth'

export async function getFaculty(params: {
  search?: string
  departmentId?: string
  page?: number
  limit?: number
}) {
  try {
    const { search, departmentId, page = 1, limit = 10 } = params
    const where: any = { status: 'ACTIVE' }

    if (search) {
      where.OR = [
        { employeeId: { contains: search, mode: 'insensitive' } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
      ]
    }
    if (departmentId && departmentId !== 'all') where.departmentId = departmentId

    const [faculty, total] = await Promise.all([
      prisma.faculty.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true } },
          department: { select: { id: true, name: true, code: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.faculty.count({ where }),
    ])

    return { data: { faculty, total, totalPages: Math.ceil(total / limit) } }
  } catch (error) {
    return { error: 'Failed to fetch faculty' }
  }
}

export async function getFacultyById(id: string) {
  try {
    const faculty = await prisma.faculty.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        department: true,
        courseOfferings: {
          where: { status: 'ACTIVE' },
          include: {
            course: true,
            _count: { select: { enrollments: true } },
          },
        },
      },
    })
    if (!faculty) return { error: 'Faculty not found' }
    return { data: faculty }
  } catch (error) {
    return { error: 'Failed to fetch faculty' }
  }
}

export async function createFaculty(formData: FormData) {
  try {
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const phone = (formData.get('phone') as string) || null
    const password = formData.get('password') as string
    const employeeId = formData.get('employeeId') as string
    const departmentId = formData.get('departmentId') as string
    const designation = formData.get('designation') as string

    if (!name || !email || !password || !employeeId || !departmentId || !designation) {
      return { error: 'All required fields must be filled' }
    }

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) return { error: 'A user with this email already exists' }

    const existingEmp = await prisma.faculty.findUnique({ where: { employeeId } })
    if (existingEmp) return { error: 'This employee ID is already taken' }

    const passwordHash = await hashPassword(password)

    const faculty = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: { name, email, passwordHash, role: 'FACULTY' },
      })
      return tx.faculty.create({
        data: { userId: user.id, employeeId, departmentId, designation, phone },
        include: { user: { select: { name: true, email: true } }, department: true },
      })
    })

    revalidatePath('/admin/faculty')
    return { data: faculty }
  } catch (error) {
    return { error: 'Failed to create faculty' }
  }
}

export async function updateFaculty(id: string, formData: FormData) {
  try {
    const existing = await prisma.faculty.findUnique({
      where: { id },
      include: { user: true },
    })
    if (!existing) return { error: 'Faculty not found' }

    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const phone = (formData.get('phone') as string) || null
    const employeeId = formData.get('employeeId') as string
    const departmentId = formData.get('departmentId') as string
    const designation = formData.get('designation') as string

    if (email !== existing.user.email) {
      const emailExists = await prisma.user.findUnique({ where: { email } })
      if (emailExists) return { error: 'A user with this email already exists' }
    }

    if (employeeId !== existing.employeeId) {
      const empExists = await prisma.faculty.findUnique({ where: { employeeId } })
      if (empExists) return { error: 'This employee ID is already taken' }
    }

    await prisma.$transaction(async (tx) => {
      await tx.user.update({ where: { id: existing.userId }, data: { name, email } })
      await tx.faculty.update({ where: { id }, data: { employeeId, departmentId, designation, phone } })
    })

    revalidatePath('/admin/faculty')
    return { data: { success: true } }
  } catch (error) {
    return { error: 'Failed to update faculty' }
  }
}

export async function deleteFaculty(id: string) {
  try {
    const faculty = await prisma.faculty.findUnique({ where: { id }, select: { userId: true } })
    if (!faculty) return { error: 'Faculty not found' }

    await prisma.$transaction(async (tx) => {
      await tx.faculty.update({ where: { id }, data: { status: 'INACTIVE' } })
      await tx.user.update({ where: { id: faculty.userId }, data: { status: 'INACTIVE' } })
    })

    revalidatePath('/admin/faculty')
    return { data: { success: true } }
  } catch (error) {
    return { error: 'Failed to deactivate faculty' }
  }
}

export async function getFacultyCount() {
  return prisma.faculty.count({ where: { status: 'ACTIVE' } })
}

export async function getAllFaculty() {
  return prisma.faculty.findMany({
    where: { status: 'ACTIVE' },
    include: {
      user: { select: { name: true, email: true } },
      department: { select: { name: true, code: true } },
    },
    orderBy: { user: { name: 'asc' } },
  })
}

export async function getCurrentFacultyData() {
  const { getSession } = await import('@/lib/auth')
  const session = await getSession()
  if (!session) return { error: 'Not authenticated' }

  const faculty = await prisma.faculty.findUnique({
    where: { userId: session.id },
    include: {
      user: true,
      department: true,
      courseOfferings: {
        where: { status: 'ACTIVE' },
        include: {
          course: { include: { department: true } },
          _count: { select: { enrollments: { where: { status: 'ACTIVE' } } } },
        },
      },
    },
  })

  if (!faculty) return { error: 'Faculty profile not found' }
  return { data: faculty }
}

export async function getFacultyAssignedOfferings() {
  const { getSession } = await import('@/lib/auth')
  const session = await getSession()
  if (!session) return { error: 'Not authenticated' }

  const faculty = await prisma.faculty.findUnique({
    where: { userId: session.id },
    select: { id: true },
  })

  if (!faculty) return { error: 'Faculty not found' }

  const offerings = await prisma.courseOffering.findMany({
    where: { facultyId: faculty.id, status: 'ACTIVE' },
    include: {
      course: { include: { department: true } },
      _count: { select: { enrollments: { where: { status: 'ACTIVE' } } } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return { data: offerings }
}

export async function getFacultyStudents() {
  const { getSession } = await import('@/lib/auth')
  const session = await getSession()
  if (!session) return { error: 'Not authenticated' }

  const faculty = await prisma.faculty.findUnique({
    where: { userId: session.id },
    select: { id: true },
  })

  if (!faculty) return { error: 'Faculty not found' }

  const enrollments = await prisma.enrollment.findMany({
    where: {
      courseOffering: { facultyId: faculty.id, status: 'ACTIVE' },
      status: 'ACTIVE',
    },
    include: {
      student: { include: { user: true, department: true } },
      courseOffering: { include: { course: true } },
      result: true,
    },
    orderBy: { student: { user: { name: 'asc' } } },
  })

  return { data: enrollments }
}

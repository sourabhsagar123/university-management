'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/db'
import { hashPassword } from '@/lib/auth'

export async function getStudents(params: {
  search?: string
  departmentId?: string
  semester?: string
  page?: number
  limit?: number
}) {
  try {
    const { search, departmentId, semester, page = 1, limit = 10 } = params
    const where: any = { status: 'ACTIVE' }

    if (search) {
      where.OR = [
        { registrationNo: { contains: search, mode: 'insensitive' } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
      ]
    }
    if (departmentId && departmentId !== 'all') where.departmentId = departmentId
    if (semester && semester !== 'all') where.currentSemester = parseInt(semester)

    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true } },
          department: { select: { id: true, name: true, code: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.student.count({ where }),
    ])

    return { data: { students, total, totalPages: Math.ceil(total / limit) } }
  } catch (error) {
    console.error('Error fetching students:', error)
    return { error: 'Failed to fetch students' }
  }
}

export async function getStudentById(id: string) {
  try {
    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        department: true,
        enrollments: {
          where: { status: 'ACTIVE' },
          include: {
            courseOffering: {
              include: {
                course: true,
                faculty: { include: { user: { select: { name: true } } } },
              },
            },
            result: true,
          },
        },
      },
    })
    if (!student) return { error: 'Student not found' }
    return { data: student }
  } catch (error) {
    return { error: 'Failed to fetch student' }
  }
}

export async function createStudent(formData: FormData) {
  try {
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const phone = (formData.get('phone') as string) || null
    const password = formData.get('password') as string
    const registrationNo = formData.get('registrationNo') as string
    const departmentId = formData.get('departmentId') as string
    const programme = formData.get('programme') as string
    const currentSemester = parseInt(formData.get('currentSemester') as string)
    const admissionYear = parseInt(formData.get('admissionYear') as string)

    if (!name || !email || !password || !registrationNo || !departmentId || !programme) {
      return { error: 'All required fields must be filled' }
    }

    if (password.length < 6) return { error: 'Password must be at least 6 characters' }

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) return { error: 'A user with this email already exists' }

    const existingReg = await prisma.student.findUnique({ where: { registrationNo } })
    if (existingReg) return { error: 'This registration number is already taken' }

    const passwordHash = await hashPassword(password)

    const student = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: { name, email, passwordHash, role: 'STUDENT' },
      })
      return tx.student.create({
        data: {
          userId: user.id,
          registrationNo,
          departmentId,
          programme,
          currentSemester: currentSemester || 1,
          admissionYear: admissionYear || new Date().getFullYear(),
          phone,
        },
        include: { user: { select: { name: true, email: true } }, department: true },
      })
    })

    revalidatePath('/admin/students')
    return { data: student }
  } catch (error: any) {
    console.error('Create student error:', error)
    return { error: error?.message || 'Failed to create student' }
  }
}

export async function updateStudent(id: string, formData: FormData) {
  try {
    const existing = await prisma.student.findUnique({
      where: { id },
      include: { user: true },
    })
    if (!existing) return { error: 'Student not found' }

    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const phone = (formData.get('phone') as string) || null
    const registrationNo = formData.get('registrationNo') as string
    const departmentId = formData.get('departmentId') as string
    const programme = formData.get('programme') as string
    const currentSemester = parseInt(formData.get('currentSemester') as string)
    const admissionYear = parseInt(formData.get('admissionYear') as string)

    if (email !== existing.user.email) {
      const emailExists = await prisma.user.findUnique({ where: { email } })
      if (emailExists) return { error: 'A user with this email already exists' }
    }

    if (registrationNo !== existing.registrationNo) {
      const regExists = await prisma.student.findUnique({ where: { registrationNo } })
      if (regExists) return { error: 'This registration number is already taken' }
    }

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: existing.userId },
        data: { name, email },
      })
      await tx.student.update({
        where: { id },
        data: { registrationNo, departmentId, programme, currentSemester, admissionYear, phone },
      })
    })

    revalidatePath('/admin/students')
    revalidatePath(`/admin/students/${id}`)
    return { data: { success: true } }
  } catch (error) {
    return { error: 'Failed to update student' }
  }
}

export async function deleteStudent(id: string) {
  try {
    const student = await prisma.student.findUnique({ where: { id }, select: { userId: true } })
    if (!student) return { error: 'Student not found' }

    await prisma.$transaction(async (tx) => {
      await tx.student.update({ where: { id }, data: { status: 'INACTIVE' } })
      await tx.user.update({ where: { id: student.userId }, data: { status: 'INACTIVE' } })
    })

    revalidatePath('/admin/students')
    return { data: { success: true } }
  } catch (error) {
    return { error: 'Failed to delete student' }
  }
}

export async function getStudentCount() {
  return prisma.student.count({ where: { status: 'ACTIVE' } })
}

export async function getRecentStudents(limit = 5) {
  return prisma.student.findMany({
    where: { status: 'ACTIVE' },
    include: {
      user: { select: { name: true, email: true } },
      department: { select: { name: true, code: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })
}

export async function getAllStudents() {
  return prisma.student.findMany({
    where: { status: 'ACTIVE' },
    include: {
      user: { select: { name: true, email: true } },
      department: { select: { name: true, code: true } },
    },
    orderBy: { user: { name: 'asc' } },
  })
}

export async function getCurrentStudentData() {
  const { getSession } = await import('@/lib/auth')
  const session = await getSession()
  if (!session) return { error: 'Not authenticated' }

  const student = await prisma.student.findUnique({
    where: { userId: session.id },
    include: {
      user: true,
      department: true,
      enrollments: {
        where: { status: 'ACTIVE' },
        include: {
          courseOffering: {
            include: {
              course: { include: { department: true } },
              faculty: { include: { user: true } },
            },
          },
          result: true,
        },
      },
    },
  })

  if (!student) return { error: 'Student profile not found' }
  return { data: student }
}

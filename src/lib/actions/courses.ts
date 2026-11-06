'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/db'

export async function getCourses(params: {
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
        { code: { contains: search, mode: 'insensitive' } },
        { title: { contains: search, mode: 'insensitive' } },
      ]
    }
    if (departmentId && departmentId !== 'all') where.departmentId = departmentId
    if (semester && semester !== 'all') where.semester = parseInt(semester)

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        include: { department: { select: { id: true, name: true, code: true } } },
        orderBy: { code: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.course.count({ where }),
    ])

    return { data: { courses, total, totalPages: Math.ceil(total / limit) } }
  } catch (error) {
    return { error: 'Failed to fetch courses' }
  }
}

export async function getCourseById(id: string) {
  try {
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        department: true,
        offerings: {
          where: { status: 'ACTIVE' },
          include: {
            faculty: { include: { user: { select: { name: true } } } },
            _count: { select: { enrollments: true } },
          },
        },
      },
    })
    if (!course) return { error: 'Course not found' }
    return { data: course }
  } catch (error) {
    return { error: 'Failed to fetch course' }
  }
}

export async function createCourse(formData: FormData) {
  try {
    const code = (formData.get('code') as string)?.toUpperCase()
    const title = formData.get('title') as string
    const credits = parseInt(formData.get('credits') as string)
    const departmentId = formData.get('departmentId') as string
    const semester = parseInt(formData.get('semester') as string)
    const description = (formData.get('description') as string) || null

    if (!code || !title || !departmentId) return { error: 'All required fields must be filled' }

    const existing = await prisma.course.findUnique({ where: { code } })
    if (existing) return { error: 'A course with this code already exists' }

    const course = await prisma.course.create({
      data: { code, title, credits, departmentId, semester, description },
    })

    revalidatePath('/admin/courses')
    return { data: course }
  } catch (error) {
    return { error: 'Failed to create course' }
  }
}

export async function updateCourse(id: string, formData: FormData) {
  try {
    const existing = await prisma.course.findUnique({ where: { id } })
    if (!existing) return { error: 'Course not found' }

    const code = (formData.get('code') as string)?.toUpperCase()
    const title = formData.get('title') as string
    const credits = parseInt(formData.get('credits') as string)
    const departmentId = formData.get('departmentId') as string
    const semester = parseInt(formData.get('semester') as string)
    const description = (formData.get('description') as string) || null

    if (code !== existing.code) {
      const codeExists = await prisma.course.findUnique({ where: { code } })
      if (codeExists) return { error: 'A course with this code already exists' }
    }

    await prisma.course.update({ where: { id }, data: { code, title, credits, departmentId, semester, description } })

    revalidatePath('/admin/courses')
    return { data: { success: true } }
  } catch (error) {
    return { error: 'Failed to update course' }
  }
}

export async function deleteCourse(id: string) {
  try {
    await prisma.course.update({ where: { id }, data: { status: 'INACTIVE' } })
    revalidatePath('/admin/courses')
    return { data: { success: true } }
  } catch (error) {
    return { error: 'Failed to deactivate course' }
  }
}

export async function getCourseCount() {
  return prisma.course.count({ where: { status: 'ACTIVE' } })
}

export async function getAllCourses() {
  return prisma.course.findMany({
    where: { status: 'ACTIVE' },
    include: { department: { select: { name: true, code: true } } },
    orderBy: { code: 'asc' },
  })
}

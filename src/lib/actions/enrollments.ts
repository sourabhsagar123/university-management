'use server'

import prisma from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function getEnrollments(params: {
  search?: string
  courseOfferingId?: string
  studentId?: string
  page?: number
  limit?: number
}) {
  try {
    const { search, courseOfferingId, studentId, page = 1, limit = 10 } = params
    const where: any = { status: 'ACTIVE' }

    if (courseOfferingId) where.courseOfferingId = courseOfferingId
    if (studentId) where.studentId = studentId
    if (search) {
      where.OR = [
        { student: { user: { name: { contains: search, mode: 'insensitive' } } } },
        { student: { registrationNo: { contains: search, mode: 'insensitive' } } },
        { courseOffering: { course: { title: { contains: search, mode: 'insensitive' } } } },
        { courseOffering: { course: { code: { contains: search, mode: 'insensitive' } } } },
      ]
    }

    const [enrollments, total] = await Promise.all([
      prisma.enrollment.findMany({
        where,
        include: {
          student: { include: { user: true, department: true } },
          courseOffering: {
            include: {
              course: { include: { department: true } },
              faculty: { include: { user: true } },
            },
          },
          result: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.enrollment.count({ where }),
    ])

    return { data: { enrollments, total, totalPages: Math.ceil(total / limit) } }
  } catch (error) {
    return { error: 'Failed to fetch enrollments' }
  }
}

export async function createEnrollment(formData: FormData) {
  try {
    const studentId = formData.get('studentId') as string
    const courseOfferingId = formData.get('courseOfferingId') as string

    if (!studentId || !courseOfferingId) {
      return { error: 'Student and course offering are required' }
    }

    // Check for duplicate enrollment
    const existing = await prisma.enrollment.findFirst({
      where: { studentId, courseOfferingId },
    })

    if (existing) {
      return { error: 'Student is already enrolled in this course offering' }
    }

    // Check max students
    const offering = await prisma.courseOffering.findUnique({
      where: { id: courseOfferingId },
      include: { _count: { select: { enrollments: { where: { status: 'ACTIVE' } } } } },
    })

    if (!offering) return { error: 'Course offering not found' }

    if (offering._count.enrollments >= offering.maxStudents) {
      return { error: 'Course offering has reached maximum capacity' }
    }

    const enrollment = await prisma.enrollment.create({
      data: { studentId, courseOfferingId },
      include: {
        student: { include: { user: true } },
        courseOffering: { include: { course: true } },
      },
    })

    revalidatePath('/admin/enrollments')
    return { data: enrollment }
  } catch (error) {
    return { error: 'Failed to create enrollment' }
  }
}

export async function deleteEnrollment(id: string) {
  try {
    await prisma.enrollment.update({
      where: { id },
      data: { status: 'INACTIVE' },
    })
    revalidatePath('/admin/enrollments')
    return { data: { success: true } }
  } catch (error) {
    return { error: 'Failed to remove enrollment' }
  }
}

export async function getEnrollmentsByStudent(studentId: string) {
  try {
    const enrollments = await prisma.enrollment.findMany({
      where: { studentId, status: 'ACTIVE' },
      include: {
        courseOffering: {
          include: {
            course: { include: { department: true } },
            faculty: { include: { user: true } },
          },
        },
        result: true,
      },
      orderBy: { createdAt: 'desc' },
    })
    return { data: enrollments }
  } catch (error) {
    return { error: 'Failed to fetch enrollments' }
  }
}

export async function getEnrollmentsByOffering(courseOfferingId: string) {
  try {
    const enrollments = await prisma.enrollment.findMany({
      where: { courseOfferingId, status: 'ACTIVE' },
      include: {
        student: { include: { user: true, department: true } },
        result: true,
      },
      orderBy: { student: { user: { name: 'asc' } } },
    })
    return { data: enrollments }
  } catch (error) {
    return { error: 'Failed to fetch enrollments' }
  }
}

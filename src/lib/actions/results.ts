'use server'

import prisma from '@/lib/db'
import { resultSchema } from '@/lib/validations'
import { calculateGrade } from '@/lib/utils'
import { revalidatePath } from 'next/cache'

export async function getResults(params: {
  search?: string
  courseOfferingId?: string
  isPublished?: string
  page?: number
  limit?: number
}) {
  try {
    const { search, courseOfferingId, isPublished, page = 1, limit = 10 } = params
    const where: any = {}

    if (courseOfferingId) {
      where.enrollment = { courseOfferingId }
    }
    if (isPublished === 'true') where.isPublished = true
    if (isPublished === 'false') where.isPublished = false
    if (search) {
      where.enrollment = {
        ...where.enrollment,
        OR: [
          { student: { user: { name: { contains: search, mode: 'insensitive' } } } },
          { student: { registrationNo: { contains: search, mode: 'insensitive' } } },
        ],
      }
    }

    const [results, total] = await Promise.all([
      prisma.result.findMany({
        where,
        include: {
          enrollment: {
            include: {
              student: { include: { user: true, department: true } },
              courseOffering: {
                include: {
                  course: true,
                  faculty: { include: { user: true } },
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.result.count({ where }),
    ])

    return { data: { results, total, totalPages: Math.ceil(total / limit) } }
  } catch (error) {
    return { error: 'Failed to fetch results' }
  }
}

export async function saveResult(formData: FormData) {
  try {
    const enrollmentId = formData.get('enrollmentId') as string
    const internalMarks = parseFloat(formData.get('internalMarks') as string)
    const externalMarks = parseFloat(formData.get('externalMarks') as string)

    // Server-side validation
    if (isNaN(internalMarks) || internalMarks < 0 || internalMarks > 40) {
      return { error: 'Internal marks must be between 0 and 40' }
    }
    if (isNaN(externalMarks) || externalMarks < 0 || externalMarks > 60) {
      return { error: 'External marks must be between 0 and 60' }
    }

    const totalMarks = internalMarks + externalMarks
    const { grade, gradePoints } = calculateGrade(totalMarks)

    // Check if enrollment exists
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
    })

    if (!enrollment) return { error: 'Enrollment not found' }

    // Upsert result
    const result = await prisma.result.upsert({
      where: { enrollmentId },
      update: {
        internalMarks,
        externalMarks,
        totalMarks,
        grade,
        gradePoints,
      },
      create: {
        enrollmentId,
        internalMarks,
        externalMarks,
        totalMarks,
        grade,
        gradePoints,
      },
    })

    revalidatePath('/admin/examinations')
    revalidatePath('/admin/results')
    return { data: result }
  } catch (error) {
    return { error: 'Failed to save result' }
  }
}

export async function publishResults(courseOfferingId: string) {
  try {
    // Get all enrollment IDs for this offering
    const enrollments = await prisma.enrollment.findMany({
      where: { courseOfferingId, status: 'ACTIVE' },
      select: { id: true },
    })

    const enrollmentIds = enrollments.map(e => e.id)

    await prisma.result.updateMany({
      where: { enrollmentId: { in: enrollmentIds } },
      data: { isPublished: true },
    })

    revalidatePath('/admin/results')
    revalidatePath('/student/results')
    return { data: { success: true } }
  } catch (error) {
    return { error: 'Failed to publish results' }
  }
}

export async function unpublishResults(courseOfferingId: string) {
  try {
    const enrollments = await prisma.enrollment.findMany({
      where: { courseOfferingId, status: 'ACTIVE' },
      select: { id: true },
    })

    const enrollmentIds = enrollments.map(e => e.id)

    await prisma.result.updateMany({
      where: { enrollmentId: { in: enrollmentIds } },
      data: { isPublished: false },
    })

    revalidatePath('/admin/results')
    return { data: { success: true } }
  } catch (error) {
    return { error: 'Failed to unpublish results' }
  }
}

export async function getStudentResults(studentId: string, publishedOnly: boolean = false) {
  try {
    const where: any = {
      enrollment: { studentId, status: 'ACTIVE' },
    }
    if (publishedOnly) where.isPublished = true

    const results = await prisma.result.findMany({
      where,
      include: {
        enrollment: {
          include: {
            courseOffering: {
              include: {
                course: { include: { department: true } },
                faculty: { include: { user: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return { data: results }
  } catch (error) {
    return { error: 'Failed to fetch results' }
  }
}

export async function getResultsByOffering(courseOfferingId: string) {
  try {
    const enrollments = await prisma.enrollment.findMany({
      where: { courseOfferingId, status: 'ACTIVE' },
      include: {
        student: { include: { user: true } },
        result: true,
      },
      orderBy: { student: { user: { name: 'asc' } } },
    })
    return { data: enrollments }
  } catch (error) {
    return { error: 'Failed to fetch results' }
  }
}

'use server'

import prisma from '@/lib/db'
import { courseOfferingSchema } from '@/lib/validations'
import { revalidatePath } from 'next/cache'

export async function getOfferings(params: {
  search?: string
  courseId?: string
  facultyId?: string
  academicYear?: string
  page?: number
  limit?: number
}) {
  try {
    const { search, courseId, facultyId, academicYear, page = 1, limit = 10 } = params
    const where: any = { status: 'ACTIVE' }
    
    if (courseId) where.courseId = courseId
    if (facultyId) where.facultyId = facultyId
    if (academicYear) where.academicYear = parseInt(academicYear)
    if (search) {
      where.OR = [
        { course: { title: { contains: search, mode: 'insensitive' } } },
        { course: { code: { contains: search, mode: 'insensitive' } } },
        { faculty: { user: { name: { contains: search, mode: 'insensitive' } } } },
      ]
    }

    const [offerings, total] = await Promise.all([
      prisma.courseOffering.findMany({
        where,
        include: {
          course: { include: { department: true } },
          faculty: { include: { user: true } },
          _count: { select: { enrollments: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.courseOffering.count({ where }),
    ])

    return { data: { offerings, total, totalPages: Math.ceil(total / limit) } }
  } catch (error) {
    return { error: 'Failed to fetch offerings' }
  }
}

export async function getOfferingById(id: string) {
  try {
    const offering = await prisma.courseOffering.findUnique({
      where: { id },
      include: {
        course: { include: { department: true } },
        faculty: { include: { user: true } },
        enrollments: {
          include: {
            student: { include: { user: true, department: true } },
            result: true,
          },
        },
      },
    })
    if (!offering) return { error: 'Offering not found' }
    return { data: offering }
  } catch (error) {
    return { error: 'Failed to fetch offering' }
  }
}

export async function createOffering(formData: FormData) {
  try {
    const data = {
      courseId: formData.get('courseId') as string,
      facultyId: formData.get('facultyId') as string,
      academicYear: parseInt(formData.get('academicYear') as string),
      semester: parseInt(formData.get('semester') as string),
      section: (formData.get('section') as string) || 'A',
      maxStudents: parseInt(formData.get('maxStudents') as string) || 60,
    }

    const validated = courseOfferingSchema.parse(data)

    // Check for duplicate offering
    const existing = await prisma.courseOffering.findFirst({
      where: {
        courseId: validated.courseId,
        academicYear: validated.academicYear,
        semester: validated.semester,
        section: validated.section,
      },
    })

    if (existing) {
      return { error: 'An offering for this course, year, semester, and section already exists' }
    }

    const offering = await prisma.courseOffering.create({
      data: validated,
      include: { course: true, faculty: { include: { user: true } } },
    })

    revalidatePath('/admin/offerings')
    return { data: offering }
  } catch (error: any) {
    if (error.errors) return { error: error.errors[0]?.message || 'Validation failed' }
    return { error: 'Failed to create offering' }
  }
}

export async function updateOffering(id: string, formData: FormData) {
  try {
    const data = {
      courseId: formData.get('courseId') as string,
      facultyId: formData.get('facultyId') as string,
      academicYear: parseInt(formData.get('academicYear') as string),
      semester: parseInt(formData.get('semester') as string),
      section: (formData.get('section') as string) || 'A',
      maxStudents: parseInt(formData.get('maxStudents') as string) || 60,
    }

    const validated = courseOfferingSchema.parse(data)

    const offering = await prisma.courseOffering.update({
      where: { id },
      data: validated,
    })

    revalidatePath('/admin/offerings')
    return { data: offering }
  } catch (error: any) {
    if (error.errors) return { error: error.errors[0]?.message || 'Validation failed' }
    return { error: 'Failed to update offering' }
  }
}

export async function deleteOffering(id: string) {
  try {
    await prisma.courseOffering.update({
      where: { id },
      data: { status: 'INACTIVE' },
    })
    revalidatePath('/admin/offerings')
    return { data: { success: true } }
  } catch (error) {
    return { error: 'Failed to delete offering' }
  }
}

export async function getOfferingCount() {
  return prisma.courseOffering.count({ where: { status: 'ACTIVE' } })
}

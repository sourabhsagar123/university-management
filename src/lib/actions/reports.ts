'use server'

import prisma from '@/lib/db'

export async function getStudentsByDepartment(departmentId?: string) {
  try {
    const where: any = { status: 'ACTIVE' }
    if (departmentId) where.departmentId = departmentId

    const students = await prisma.student.findMany({
      where,
      include: {
        user: true,
        department: true,
      },
      orderBy: { user: { name: 'asc' } },
    })
    return { data: students }
  } catch (error) {
    return { error: 'Failed to fetch students' }
  }
}

export async function getFacultyByDepartment(departmentId?: string) {
  try {
    const where: any = { status: 'ACTIVE' }
    if (departmentId) where.departmentId = departmentId

    const faculty = await prisma.faculty.findMany({
      where,
      include: {
        user: true,
        department: true,
      },
      orderBy: { user: { name: 'asc' } },
    })
    return { data: faculty }
  } catch (error) {
    return { error: 'Failed to fetch faculty' }
  }
}

export async function getEnrollmentReport(courseOfferingId?: string) {
  try {
    const where: any = { status: 'ACTIVE' }
    if (courseOfferingId) where.courseOfferingId = courseOfferingId

    const enrollments = await prisma.enrollment.findMany({
      where,
      include: {
        student: { include: { user: true, department: true } },
        courseOffering: {
          include: {
            course: true,
            faculty: { include: { user: true } },
          },
        },
        result: true,
      },
      orderBy: { createdAt: 'desc' },
    })
    return { data: enrollments }
  } catch (error) {
    return { error: 'Failed to fetch enrollment report' }
  }
}

export async function getSemesterReport(semester?: number) {
  try {
    const where: any = { status: 'ACTIVE' }
    if (semester) where.currentSemester = semester

    const students = await prisma.student.findMany({
      where,
      include: {
        user: true,
        department: true,
        enrollments: {
          include: {
            courseOffering: { include: { course: true } },
            result: true,
          },
        },
      },
      orderBy: { user: { name: 'asc' } },
    })
    return { data: students }
  } catch (error) {
    return { error: 'Failed to fetch semester report' }
  }
}

export async function getResultReport(courseOfferingId?: string, departmentId?: string) {
  try {
    const where: any = {}
    
    if (courseOfferingId) {
      where.enrollment = { courseOfferingId, status: 'ACTIVE' }
    }
    if (departmentId) {
      where.enrollment = {
        ...where.enrollment,
        student: { departmentId },
      }
    }

    const results = await prisma.result.findMany({
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
      orderBy: { totalMarks: 'desc' },
    })
    return { data: results }
  } catch (error) {
    return { error: 'Failed to fetch result report' }
  }
}

export async function getDashboardStats() {
  try {
    const [studentCount, facultyCount, departmentCount, courseCount, recentStudents, departmentDistribution] = await Promise.all([
      prisma.student.count({ where: { status: 'ACTIVE' } }),
      prisma.faculty.count({ where: { status: 'ACTIVE' } }),
      prisma.department.count({ where: { status: 'ACTIVE' } }),
      prisma.course.count({ where: { status: 'ACTIVE' } }),
      prisma.student.findMany({
        where: { status: 'ACTIVE' },
        include: { user: true, department: true },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      prisma.department.findMany({
        where: { status: 'ACTIVE' },
        include: {
          _count: { select: { students: { where: { status: 'ACTIVE' } } } },
        },
      }),
    ])

    return {
      data: {
        studentCount,
        facultyCount,
        departmentCount,
        courseCount,
        recentStudents,
        departmentDistribution: departmentDistribution.map(d => ({
          name: d.name,
          students: d._count.students,
        })),
      },
    }
  } catch (error) {
    return { error: 'Failed to fetch dashboard stats' }
  }
}

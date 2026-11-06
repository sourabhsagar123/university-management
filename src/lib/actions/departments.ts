'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/db'

export async function getDepartments(params: {
  search?: string
  page?: number
  limit?: number
}) {
  try {
    const { search, page = 1, limit = 10 } = params
    const where: any = { status: 'ACTIVE' }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [departments, total] = await Promise.all([
      prisma.department.findMany({
        where,
        include: {
          _count: {
            select: {
              students: { where: { status: 'ACTIVE' } },
              faculty: { where: { status: 'ACTIVE' } },
              courses: { where: { status: 'ACTIVE' } },
            },
          },
        },
        orderBy: { name: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.department.count({ where }),
    ])

    return { data: { departments, total, totalPages: Math.ceil(total / limit) } }
  } catch (error) {
    return { error: 'Failed to fetch departments' }
  }
}

export async function getDepartmentById(id: string) {
  try {
    const department = await prisma.department.findUnique({
      where: { id },
      include: {
        students: {
          where: { status: 'ACTIVE' },
          include: { user: { select: { name: true, email: true } } },
          orderBy: { user: { name: 'asc' } },
        },
        faculty: {
          where: { status: 'ACTIVE' },
          include: { user: { select: { name: true, email: true } } },
          orderBy: { user: { name: 'asc' } },
        },
        courses: {
          where: { status: 'ACTIVE' },
          orderBy: { code: 'asc' },
        },
        _count: {
          select: {
            students: { where: { status: 'ACTIVE' } },
            faculty: { where: { status: 'ACTIVE' } },
            courses: { where: { status: 'ACTIVE' } },
          },
        },
      },
    })
    if (!department) return { error: 'Department not found' }
    return { data: department }
  } catch (error) {
    return { error: 'Failed to fetch department' }
  }
}

export async function createDepartment(formData: FormData) {
  try {
    const code = (formData.get('code') as string)?.toUpperCase()
    const name = formData.get('name') as string
    const description = (formData.get('description') as string) || null

    if (!code || !name) return { error: 'Code and name are required' }

    const existing = await prisma.department.findUnique({ where: { code } })
    if (existing) return { error: 'A department with this code already exists' }

    const department = await prisma.department.create({
      data: { code, name, description },
    })

    revalidatePath('/admin/departments')
    return { data: department }
  } catch (error) {
    return { error: 'Failed to create department' }
  }
}

export async function updateDepartment(id: string, formData: FormData) {
  try {
    const existing = await prisma.department.findUnique({ where: { id } })
    if (!existing) return { error: 'Department not found' }

    const code = (formData.get('code') as string)?.toUpperCase()
    const name = formData.get('name') as string
    const description = (formData.get('description') as string) || null

    if (code !== existing.code) {
      const codeExists = await prisma.department.findUnique({ where: { code } })
      if (codeExists) return { error: 'A department with this code already exists' }
    }

    await prisma.department.update({ where: { id }, data: { code, name, description } })

    revalidatePath('/admin/departments')
    return { data: { success: true } }
  } catch (error) {
    return { error: 'Failed to update department' }
  }
}

export async function deleteDepartment(id: string) {
  try {
    await prisma.department.update({ where: { id }, data: { status: 'INACTIVE' } })
    revalidatePath('/admin/departments')
    return { data: { success: true } }
  } catch (error) {
    return { error: 'Failed to deactivate department' }
  }
}

export async function getAllDepartments() {
  return prisma.department.findMany({
    where: { status: 'ACTIVE' },
    orderBy: { name: 'asc' },
  })
}

export async function getDepartmentCount() {
  return prisma.department.count({ where: { status: 'ACTIVE' } })
}

export async function getDepartmentDistribution() {
  const departments = await prisma.department.findMany({
    where: { status: 'ACTIVE' },
    include: {
      _count: { select: { students: { where: { status: 'ACTIVE' } } } },
    },
  })
  return departments.map((d) => ({ name: d.code, students: d._count.students }))
}

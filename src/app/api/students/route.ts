import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const departmentId = searchParams.get('departmentId')
    const semester = searchParams.get('semester')
    const search = searchParams.get('search')

    const where: any = { status: 'ACTIVE' }
    if (departmentId) where.departmentId = departmentId
    if (semester) where.currentSemester = parseInt(semester)
    if (search) {
      where.OR = [
        { registrationNo: { contains: search, mode: 'insensitive' } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
      ]
    }

    // Role-based filtering: Students can only view their own profile via API
    if (session.role === 'STUDENT') {
      where.userId = session.id
    }

    const students = await prisma.student.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        department: { select: { id: true, name: true, code: true } },
      },
      orderBy: { user: { name: 'asc' } },
    })

    return NextResponse.json({ data: students, count: students.length })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to fetch students' }, { status: 500 })
  }
}

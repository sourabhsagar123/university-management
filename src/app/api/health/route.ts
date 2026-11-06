import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET() {
  try {
    // Probe database connectivity
    await prisma.$queryRaw`SELECT 1`
    return NextResponse.json({
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString(),
      system: 'University Management System (UMS)',
      institution: 'Chandigarh University',
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'degraded',
        database: 'disconnected',
        error: error?.message || 'Database connection error',
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    )
  }
}

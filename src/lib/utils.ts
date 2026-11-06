import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function calculateGrade(totalMarks: number): { grade: string; gradePoints: number } {
  if (totalMarks >= 90) return { grade: 'O', gradePoints: 10 }
  if (totalMarks >= 80) return { grade: 'A+', gradePoints: 9 }
  if (totalMarks >= 70) return { grade: 'A', gradePoints: 8 }
  if (totalMarks >= 60) return { grade: 'B+', gradePoints: 7 }
  if (totalMarks >= 50) return { grade: 'B', gradePoints: 6 }
  if (totalMarks >= 40) return { grade: 'C', gradePoints: 5 }
  return { grade: 'F', gradePoints: 0 }
}

export function getGradeColor(grade: string): string {
  const colors: Record<string, string> = {
    'O': 'text-emerald-700 bg-emerald-50',
    'A+': 'text-green-700 bg-green-50',
    'A': 'text-blue-700 bg-blue-50',
    'B+': 'text-sky-700 bg-sky-50',
    'B': 'text-yellow-700 bg-yellow-50',
    'C': 'text-orange-700 bg-orange-50',
    'F': 'text-red-700 bg-red-50',
  }
  return colors[grade] || 'text-gray-700 bg-gray-50'
}

export function generateCSV(headers: string[], rows: string[][]): string {
  const headerRow = headers.join(',')
  const dataRows = rows.map(row => row.map(cell => `"${(cell || '').replace(/"/g, '""')}"`).join(','))
  return [headerRow, ...dataRows].join('\n')
}

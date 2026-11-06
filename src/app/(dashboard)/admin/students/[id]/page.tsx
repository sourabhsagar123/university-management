import Link from 'next/link'
import { ArrowLeft, Mail, Phone, Calendar, BookOpen } from 'lucide-react'
import { getStudentById } from '@/lib/actions/students'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { notFound } from 'next/navigation'

export default async function StudentProfilePage({ params }: { params: { id: string } }) {
  const result = await getStudentById(params.id)
  if (result.error || !result.data) notFound()
  const student = result.data

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/students" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-2">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Students
        </Link>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">{student.user.name}</h1>
          <Link href={`/admin/students/${student.id}/edit`}>
            <Button variant="outline">Edit Student</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle className="text-base">Student Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center mb-4">
              <div className="h-20 w-20 rounded-full bg-[#1e3a5f] flex items-center justify-center text-white text-2xl font-semibold">
                {student.user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
              </div>
            </div>
            <InfoRow label="Registration No" value={student.registrationNo} />
            <InfoRow label="Email" value={student.user.email} />
            <InfoRow label="Phone" value={student.phone || 'N/A'} />
            <InfoRow label="Department" value={student.department.name} />
            <InfoRow label="Programme" value={student.programme} />
            <InfoRow label="Semester" value={`Semester ${student.currentSemester}`} />
            <InfoRow label="Admission Year" value={String(student.admissionYear)} />
            <InfoRow label="Status" value={student.status} badge />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Enrolled Courses</CardTitle></CardHeader>
          <CardContent>
            {student.enrollments.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">No course enrollments found</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course</TableHead>
                    <TableHead>Faculty</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {student.enrollments.map((e: any) => (
                    <TableRow key={e.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{e.courseOffering.course.code}</p>
                          <p className="text-xs text-gray-500">{e.courseOffering.course.title}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{e.courseOffering.faculty.user.name}</TableCell>
                      <TableCell>
                        {e.result ? (
                          <Badge variant={e.result.grade === 'F' ? 'destructive' : 'secondary'}>
                            {e.result.grade} ({e.result.totalMarks})
                          </Badge>
                        ) : <span className="text-gray-400 text-sm">Pending</span>}
                      </TableCell>
                      <TableCell>
                        {e.result?.isPublished ? <Badge variant="success">Published</Badge> : <Badge variant="outline">Pending</Badge>}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function InfoRow({ label, value, badge }: { label: string; value: string; badge?: boolean }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      {badge ? <Badge variant="success">{value}</Badge> : <span className="font-medium text-gray-900">{value}</span>}
    </div>
  )
}


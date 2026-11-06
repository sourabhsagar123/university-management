import Link from 'next/link'
import { ArrowLeft, BookOpen, Users } from 'lucide-react'
import { getFacultyById } from '@/lib/actions/faculty'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { notFound } from 'next/navigation'

export default async function FacultyProfilePage({ params }: { params: { id: string } }) {
  const result = await getFacultyById(params.id)
  if (result.error || !result.data) notFound()
  const faculty = result.data

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/faculty" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-2">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Faculty
        </Link>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">{faculty.user.name}</h1>
          <Link href={`/admin/faculty/${faculty.id}/edit`}>
            <Button variant="outline">Edit Faculty</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Faculty Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center mb-4">
              <div className="h-20 w-20 rounded-full bg-[#1e3a5f] flex items-center justify-center text-white text-2xl font-semibold">
                {faculty.user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
              </div>
            </div>
            <InfoRow label="Employee ID" value={faculty.employeeId} />
            <InfoRow label="Email" value={faculty.user.email} />
            <InfoRow label="Phone" value={faculty.phone || 'N/A'} />
            <InfoRow label="Department" value={faculty.department.name} />
            <InfoRow label="Designation" value={faculty.designation} />
            <InfoRow label="Status" value={faculty.status} badge />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Assigned Course Offerings</CardTitle>
          </CardHeader>
          <CardContent>
            {faculty.courseOfferings.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">No course offerings currently assigned</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course Code</TableHead>
                    <TableHead>Course Title</TableHead>
                    <TableHead>Semester</TableHead>
                    <TableHead>Section</TableHead>
                    <TableHead>Enrolled Students</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {faculty.courseOfferings.map((offering: any) => (
                    <TableRow key={offering.id}>
                      <TableCell className="font-mono text-sm font-medium">{offering.course.code}</TableCell>
                      <TableCell>{offering.course.title}</TableCell>
                      <TableCell>Semester {offering.semester}</TableCell>
                      <TableCell><Badge variant="secondary">Section {offering.section}</Badge></TableCell>
                      <TableCell>{offering._count.enrollments} / {offering.maxStudents}</TableCell>
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


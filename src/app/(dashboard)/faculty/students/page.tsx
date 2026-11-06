import { getFacultyStudents } from '@/lib/actions/faculty'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

export default async function FacultyStudentsPage() {
  const result = await getFacultyStudents()
  const enrollments = result.data || []

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Enrolled Students</h1>
        <p className="text-sm text-gray-500 mt-1">
          {enrollments.length} total students enrolled across all your assigned courses
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Student Roster</CardTitle>
        </CardHeader>
        <CardContent>
          {enrollments.length === 0 ? (
            <p className="text-sm text-gray-500 py-8 text-center">No students currently enrolled in your courses</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Registration No</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Programme</TableHead>
                  <TableHead>Current Semester</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {enrollments.map((enr: any) => (
                  <TableRow key={enr.id}>
                    <TableCell className="font-mono text-sm font-medium">
                      {enr.student.registrationNo}
                    </TableCell>
                    <TableCell className="font-medium text-gray-900">
                      {enr.student.user.name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{enr.student.department.code}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-xs font-semibold mr-1 text-[#1e3a5f]">
                        {enr.courseOffering.course.code}
                      </span>
                      <span className="text-sm text-gray-700">
                        {enr.courseOffering.course.title}
                      </span>
                    </TableCell>
                    <TableCell>{enr.student.programme}</TableCell>
                    <TableCell>Semester {enr.student.currentSemester}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

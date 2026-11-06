import { getFacultyAssignedOfferings } from '@/lib/actions/faculty'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import prisma from '@/lib/db'
import { getGradeColor } from '@/lib/utils'

export default async function FacultyResultsPage() {
  const result = await getFacultyAssignedOfferings()
  const offerings = result.data || []
  const offeringIds = offerings.map((o: any) => o.id)

  const results = await prisma.result.findMany({
    where: {
      enrollment: {
        courseOfferingId: { in: offeringIds },
        status: 'ACTIVE',
      },
    },
    include: {
      enrollment: {
        include: {
          student: { include: { user: true, department: true } },
          courseOffering: { include: { course: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Student Results & Grades</h1>
        <p className="text-sm text-gray-500 mt-1">
          Review recorded examination marks across your assigned course offerings
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recorded Results ({results.length})</CardTitle>
          <CardDescription>
            Official grades will reflect in student portals once published by the administration
          </CardDescription>
        </CardHeader>
        <CardContent>
          {results.length === 0 ? (
            <p className="text-sm text-gray-500 py-8 text-center">No student marks recorded yet</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Registration No</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead className="text-center">Internal (40)</TableHead>
                  <TableHead className="text-center">External (60)</TableHead>
                  <TableHead className="text-center">Total (100)</TableHead>
                  <TableHead className="text-center">Grade</TableHead>
                  <TableHead className="text-right">Publication</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((res: any) => (
                  <TableRow key={res.id}>
                    <TableCell className="font-mono text-sm font-medium">
                      {res.enrollment.student.registrationNo}
                    </TableCell>
                    <TableCell className="font-medium text-gray-900">
                      {res.enrollment.student.user.name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-xs mr-1">
                        {res.enrollment.courseOffering.course.code}
                      </Badge>
                      <span className="text-sm text-gray-700">
                        {res.enrollment.courseOffering.course.title}
                      </span>
                    </TableCell>
                    <TableCell className="text-center font-mono">
                      {res.internalMarks ?? '—'}
                    </TableCell>
                    <TableCell className="text-center font-mono">
                      {res.externalMarks ?? '—'}
                    </TableCell>
                    <TableCell className="text-center font-semibold text-gray-900 font-mono">
                      {res.totalMarks ?? '—'}
                    </TableCell>
                    <TableCell className="text-center">
                      {res.grade ? (
                        <Badge className={getGradeColor(res.grade)}>{res.grade}</Badge>
                      ) : '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      {res.isPublished ? (
                        <Badge variant="success">Published</Badge>
                      ) : (
                        <Badge variant="warning">Draft / Pending</Badge>
                      )}
                    </TableCell>
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

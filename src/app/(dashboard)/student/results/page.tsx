import { getCurrentStudentData } from '@/lib/actions/students'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Printer, Award, CheckCircle2 } from 'lucide-react'
import { getGradeColor } from '@/lib/utils'

export default async function StudentResultsPage() {
  const result = await getCurrentStudentData()
  const student = result.data

  if (!student) {
    return <div className="p-8 text-center text-gray-500">Student not found</div>
  }

  // Strict privacy: Only show PUBLISHED results
  const publishedEnrollments = (student.enrollments || []).filter(
    (e: any) => e.result && e.result.isPublished
  )

  const totalCredits = publishedEnrollments.reduce((acc: number, curr: any) => acc + curr.courseOffering.course.credits, 0)
  const weightedPoints = publishedEnrollments.reduce(
    (acc: number, curr: any) => acc + (curr.result?.gradePoints ?? 0) * curr.courseOffering.course.credits,
    0
  )
  const gpa = totalCredits > 0 ? (weightedPoints / totalCredits).toFixed(2) : '0.00'

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 no-print">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Academic Examination Results</h1>
          <p className="text-sm text-gray-500 mt-1">
            Official published marks, grade points, and semester performance summary
          </p>
        </div>
        <Button variant="outline" onClick={() => {}} className="print-button" asChild>
          <a href="javascript:window.print()">
            <Printer className="h-4 w-4 mr-2" /> Print Grade Card
          </a>
        </Button>
      </div>

      {/* Official Grade Card / Transcript */}
      <Card className="shadow-sm border-gray-200">
        {/* Header visible in print */}
        <div className="p-6 border-b border-gray-200 bg-gray-50/50">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold tracking-wider text-gray-500 uppercase">
                Chandigarh University — Official Grade Sheet
              </p>
              <h2 className="text-xl font-bold text-gray-900 mt-1">{student.user.name}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-3 text-xs text-gray-600">
                <div>
                  <span className="text-gray-400 block">Registration No:</span>
                  <span className="font-mono font-medium text-gray-900">{student.registrationNo}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Department:</span>
                  <span className="font-medium text-gray-900">{student.department.name}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Programme:</span>
                  <span className="font-medium text-gray-900">{student.programme}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Current Semester:</span>
                  <span className="font-medium text-gray-900">Semester {student.currentSemester}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-gray-400 block">Calculated GPA</span>
              <span className="text-2xl font-bold text-[#1e3a5f]">{gpa}</span>
              <span className="text-xs text-gray-500 block">on 10.0 Scale</span>
            </div>
          </div>
        </div>

        <CardContent className="p-6">
          {publishedEnrollments.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              <Award className="h-10 w-10 mx-auto text-gray-300 mb-2" />
              <p className="text-base font-medium">No results published yet</p>
              <p className="text-xs mt-1">Official grades will appear here immediately once published by the academic office.</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course Code</TableHead>
                    <TableHead>Course Title</TableHead>
                    <TableHead className="text-center">Credits</TableHead>
                    <TableHead className="text-center">Internal (40)</TableHead>
                    <TableHead className="text-center">External (60)</TableHead>
                    <TableHead className="text-center">Total (100)</TableHead>
                    <TableHead className="text-center">Grade</TableHead>
                    <TableHead className="text-center">Grade Points</TableHead>
                    <TableHead className="text-right">Remarks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {publishedEnrollments.map((e: any) => {
                    const res = e.result
                    const isPass = res.grade !== 'F'
                    return (
                      <TableRow key={e.id}>
                        <TableCell className="font-mono text-xs font-semibold text-[#1e3a5f]">
                          {e.courseOffering.course.code}
                        </TableCell>
                        <TableCell className="font-medium text-gray-900">
                          {e.courseOffering.course.title}
                        </TableCell>
                        <TableCell className="text-center">
                          {e.courseOffering.course.credits}
                        </TableCell>
                        <TableCell className="text-center font-mono text-sm">
                          {res.internalMarks}
                        </TableCell>
                        <TableCell className="text-center font-mono text-sm">
                          {res.externalMarks}
                        </TableCell>
                        <TableCell className="text-center font-semibold font-mono text-sm text-gray-900">
                          {res.totalMarks}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className={getGradeColor(res.grade)}>
                            {res.grade}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center font-mono font-medium">
                          {res.gradePoints}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant={isPass ? 'success' : 'destructive'} className="text-[10px]">
                            {isPass ? 'PASS' : 'FAIL'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>

              {/* Grading Legend */}
              <div className="mt-8 pt-6 border-t border-gray-100 text-xs text-gray-500">
                <p className="font-semibold text-gray-700 mb-2">Grading Reference Scale:</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                  <div className="p-2 bg-gray-50 rounded text-center">
                    <span className="font-bold text-emerald-700 block">O (10)</span>
                    <span className="text-[10px] text-gray-500">≥ 90 Marks</span>
                  </div>
                  <div className="p-2 bg-gray-50 rounded text-center">
                    <span className="font-bold text-green-700 block">A+ (9)</span>
                    <span className="text-[10px] text-gray-500">80–89 Marks</span>
                  </div>
                  <div className="p-2 bg-gray-50 rounded text-center">
                    <span className="font-bold text-blue-700 block">A (8)</span>
                    <span className="text-[10px] text-gray-500">70–79 Marks</span>
                  </div>
                  <div className="p-2 bg-gray-50 rounded text-center">
                    <span className="font-bold text-sky-700 block">B+ (7)</span>
                    <span className="text-[10px] text-gray-500">60–69 Marks</span>
                  </div>
                  <div className="p-2 bg-gray-50 rounded text-center">
                    <span className="font-bold text-yellow-700 block">B (6)</span>
                    <span className="text-[10px] text-gray-500">50–59 Marks</span>
                  </div>
                  <div className="p-2 bg-gray-50 rounded text-center">
                    <span className="font-bold text-orange-700 block">C (5)</span>
                    <span className="text-[10px] text-gray-500">40–49 Marks</span>
                  </div>
                  <div className="p-2 bg-gray-50 rounded text-center">
                    <span className="font-bold text-red-700 block">F (0)</span>
                    <span className="text-[10px] text-gray-500">&lt; 40 Marks</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


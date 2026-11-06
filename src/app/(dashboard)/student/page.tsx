import Link from 'next/link'
import { BookOpen, Award, GraduationCap, ArrowRight, User } from 'lucide-react'
import { getCurrentStudentData } from '@/lib/actions/students'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getGradeColor } from '@/lib/utils'

export default async function StudentDashboard() {
  const result = await getCurrentStudentData()
  if (result.error || !result.data) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p className="text-lg font-medium">Student Profile Not Found</p>
        <p className="text-sm mt-1">Please ensure your account is registered as a student.</p>
      </div>
    )
  }

  const student = result.data
  const enrollments = student.enrollments || []
  // Only published results can be viewed by the student!
  const publishedResults = enrollments.filter((e: any) => e.result && e.result.isPublished)

  // Calculate Cumulative GPA / Average Grade Points from published results
  const totalPoints = publishedResults.reduce((acc: number, curr: any) => acc + (curr.result?.gradePoints ?? 0), 0)
  const cgpa = publishedResults.length > 0 ? (totalPoints / publishedResults.length).toFixed(2) : '—'

  return (
    <div>
      {/* Student Profile Banner */}
      <div className="bg-[#1e3a5f] rounded-xl text-white p-6 mb-6 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-xs uppercase tracking-wider text-white/70 font-semibold">Student Portal</span>
            <h1 className="text-2xl font-bold mt-1">Welcome, {student.user.name}</h1>
            <p className="text-sm text-white/80 mt-1">
              {student.programme} — Semester {student.currentSemester} | Department of {student.department.name}
            </p>
          </div>
          <div className="text-left sm:text-right">
            <span className="inline-block bg-white/10 px-3 py-1 rounded-full text-xs font-mono">
              Reg. No: {student.registrationNo}
            </span>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Enrolled Courses</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">{enrollments.length}</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <BookOpen className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Current Semester</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">Semester {student.currentSemester}</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <GraduationCap className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Published Results GPA</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">{cgpa} / 10</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
              <Award className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enrolled Courses */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base">My Registered Courses</CardTitle>
              <CardDescription>Courses enrolled in this semester</CardDescription>
            </div>
            <Link href="/student/courses">
              <Button variant="ghost" size="sm" className="text-xs">
                View All <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {enrollments.length === 0 ? (
              <p className="text-sm text-gray-500 py-6 text-center">No enrolled courses</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Course Title</TableHead>
                    <TableHead>Instructor</TableHead>
                    <TableHead>Sec</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {enrollments.map((e: any) => (
                    <TableRow key={e.id}>
                      <TableCell className="font-mono text-xs font-semibold text-[#1e3a5f]">
                        {e.courseOffering.course.code}
                      </TableCell>
                      <TableCell className="font-medium text-sm text-gray-900">
                        {e.courseOffering.course.title}
                      </TableCell>
                      <TableCell className="text-xs text-gray-600">
                        {e.courseOffering.faculty.user.name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          {e.courseOffering.section}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Academic Performance / Published Results */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base">Published Examination Results</CardTitle>
              <CardDescription>Official verified grades from examinations office</CardDescription>
            </div>
            <Link href="/student/results">
              <Button variant="ghost" size="sm" className="text-xs">
                View Results <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {publishedResults.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                <p className="text-sm font-medium">No results published yet</p>
                <p className="text-xs mt-1">Results will appear here once released by the examination branch.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course</TableHead>
                    <TableHead className="text-center">Total Marks</TableHead>
                    <TableHead className="text-center">Grade</TableHead>
                    <TableHead className="text-center">Points</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {publishedResults.map((e: any) => (
                    <TableRow key={e.id}>
                      <TableCell>
                        <span className="font-mono text-xs font-semibold text-[#1e3a5f] mr-1">
                          {e.courseOffering.course.code}
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {e.courseOffering.course.title}
                        </span>
                      </TableCell>
                      <TableCell className="text-center font-semibold font-mono text-sm">
                        {e.result.totalMarks} / 100
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className={getGradeColor(e.result.grade)}>
                          {e.result.grade}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center font-mono text-sm">
                        {e.result.gradePoints}
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

import Link from 'next/link'
import { BookOpen, Users, FileText, CheckCircle2, ArrowRight } from 'lucide-react'
import { getCurrentFacultyData } from '@/lib/actions/faculty'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default async function FacultyDashboard() {
  const result = await getCurrentFacultyData()
  if (result.error || !result.data) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p className="text-lg font-medium">Faculty Profile Not Found</p>
        <p className="text-sm mt-1">Please ensure your account is registered as a faculty member.</p>
      </div>
    )
  }

  const faculty = result.data
  const offerings = faculty.courseOfferings
  const totalStudents = offerings.reduce((acc: number, curr: any) => acc + (curr._count?.enrollments ?? 0), 0)

  return (
    <div>
      {/* Welcome Banner */}
      <div className="bg-[#1e3a5f] rounded-xl text-white p-6 mb-6 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-xs uppercase tracking-wider text-white/70 font-semibold">Faculty Portal</span>
            <h1 className="text-2xl font-bold mt-1">Welcome back, {faculty.user.name}</h1>
            <p className="text-sm text-white/80 mt-1">
              {faculty.designation} — Department of {faculty.department.name} ({faculty.department.code})
            </p>
          </div>
          <div className="text-right">
            <span className="inline-block bg-white/10 px-3 py-1 rounded-full text-xs font-mono">
              Employee ID: {faculty.employeeId}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Assigned Courses</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">{offerings.length}</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <BookOpen className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Enrolled Students</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">{totalStudents}</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Users className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Current Academic Year</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">2024</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assigned Offerings */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">My Course Offerings</CardTitle>
          <Link href="/faculty/marks">
            <Button size="sm">
              <FileText className="h-4 w-4 mr-2" /> Enter Marks
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {offerings.length === 0 ? (
            <p className="text-sm text-gray-500 py-6 text-center">No active courses assigned for this semester</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course Code</TableHead>
                  <TableHead>Course Title</TableHead>
                  <TableHead>Semester</TableHead>
                  <TableHead>Section</TableHead>
                  <TableHead>Enrolled Students</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {offerings.map((o: any) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-mono font-medium text-[#1e3a5f]">{o.course.code}</TableCell>
                    <TableCell className="font-medium text-gray-900">{o.course.title}</TableCell>
                    <TableCell>Semester {o.semester}</TableCell>
                    <TableCell><Badge variant="secondary">Sec {o.section}</Badge></TableCell>
                    <TableCell>
                      <span className="font-semibold text-gray-900">{o._count?.enrollments ?? 0}</span>
                      <span className="text-gray-500 text-xs"> / {o.maxStudents}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href="/faculty/marks">
                        <Button variant="outline" size="sm">
                          Enter Marks <ArrowRight className="h-3 w-3 ml-1" />
                        </Button>
                      </Link>
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

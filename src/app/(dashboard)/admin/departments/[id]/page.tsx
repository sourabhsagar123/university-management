import Link from 'next/link'
import { ArrowLeft, Users, GraduationCap, BookOpen } from 'lucide-react'
import { getDepartmentById } from '@/lib/actions/departments'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { notFound } from 'next/navigation'

export default async function DepartmentDetailPage({ params }: { params: { id: string } }) {
  const result = await getDepartmentById(params.id)
  if (result.error || !result.data) notFound()
  const dept = result.data

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/departments" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-2">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Departments
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold text-gray-900">{dept.name}</h1>
              <Badge variant="secondary" className="text-sm font-mono">{dept.code}</Badge>
            </div>
            {dept.description && <p className="text-sm text-gray-500 mt-1">{dept.description}</p>}
          </div>
          <Link href={`/admin/departments/${dept.id}/edit`}>
            <Button variant="outline">Edit Department</Button>
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase">Students Enrolled</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">{dept._count.students}</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <Users className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase">Faculty Members</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">{dept._count.faculty}</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <GraduationCap className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase">Courses Offered</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">{dept._count.courses}</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
              <BookOpen className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Students, Faculty, Courses */}
      <Card>
        <CardContent className="p-6">
          <Tabs defaultValue="students">
            <TabsList className="mb-4">
              <TabsTrigger value="students">Students ({dept.students.length})</TabsTrigger>
              <TabsTrigger value="faculty">Faculty ({dept.faculty.length})</TabsTrigger>
              <TabsTrigger value="courses">Courses ({dept.courses.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="students">
              {dept.students.length === 0 ? (
                <p className="text-sm text-gray-500 py-6 text-center">No students registered in this department</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Reg. No</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Semester</TableHead>
                      <TableHead>Programme</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dept.students.map((s: any) => (
                      <TableRow key={s.id}>
                        <TableCell className="font-mono text-sm">{s.registrationNo}</TableCell>
                        <TableCell className="font-medium">
                          <Link href={`/admin/students/${s.id}`} className="hover:underline text-[#1e3a5f]">
                            {s.user.name}
                          </Link>
                        </TableCell>
                        <TableCell className="text-gray-500">{s.user.email}</TableCell>
                        <TableCell>Sem {s.currentSemester}</TableCell>
                        <TableCell>{s.programme}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>

            <TabsContent value="faculty">
              {dept.faculty.length === 0 ? (
                <p className="text-sm text-gray-500 py-6 text-center">No faculty assigned to this department</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Emp. ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Designation</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dept.faculty.map((f: any) => (
                      <TableRow key={f.id}>
                        <TableCell className="font-mono text-sm">{f.employeeId}</TableCell>
                        <TableCell className="font-medium">
                          <Link href={`/admin/faculty/${f.id}`} className="hover:underline text-[#1e3a5f]">
                            {f.user.name}
                          </Link>
                        </TableCell>
                        <TableCell className="text-gray-500">{f.user.email}</TableCell>
                        <TableCell>{f.designation}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>

            <TabsContent value="courses">
              {dept.courses.length === 0 ? (
                <p className="text-sm text-gray-500 py-6 text-center">No courses offered by this department</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Course Code</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Credits</TableHead>
                      <TableHead>Semester</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dept.courses.map((c: any) => (
                      <TableRow key={c.id}>
                        <TableCell className="font-mono font-medium">{c.code}</TableCell>
                        <TableCell className="font-medium">{c.title}</TableCell>
                        <TableCell>{c.credits} Credits</TableCell>
                        <TableCell>Semester {c.semester}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}


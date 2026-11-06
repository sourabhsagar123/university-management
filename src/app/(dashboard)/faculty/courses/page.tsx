import Link from 'next/link'
import { BookOpen, Users, FileText } from 'lucide-react'
import { getFacultyAssignedOfferings } from '@/lib/actions/faculty'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default async function FacultyCoursesPage() {
  const result = await getFacultyAssignedOfferings()
  const offerings = result.data || []

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Assigned Courses</h1>
        <p className="text-sm text-gray-500 mt-1">
          Courses assigned to you for instruction and evaluation
        </p>
      </div>

      {offerings.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            <BookOpen className="h-10 w-10 mx-auto text-gray-300 mb-2" />
            <p className="text-lg font-medium">No courses currently assigned</p>
            <p className="text-sm mt-1">Contact your department head or administrator for course assignments</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {offerings.map((o: any) => (
            <Card key={o.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="border-b border-gray-100 pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <Badge variant="outline" className="font-mono text-xs">{o.course.code}</Badge>
                    <CardTitle className="text-lg mt-2 text-gray-900">{o.course.title}</CardTitle>
                    <CardDescription>{o.course.department.name}</CardDescription>
                  </div>
                  <Badge variant="secondary">Sec {o.section}</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <span className="text-xs text-gray-500 block">Semester</span>
                    <span className="font-medium text-gray-900">{o.semester}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block">Credits</span>
                    <span className="font-medium text-gray-900">{o.course.credits} Credits</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block">Enrolled</span>
                    <span className="font-medium text-gray-900">{o._count?.enrollments ?? 0} Students</span>
                  </div>
                </div>

                {o.course.description && (
                  <p className="text-xs text-gray-600 line-clamp-2 mt-2 pt-2 border-t border-gray-100">
                    {o.course.description}
                  </p>
                )}

                <div className="pt-2 flex justify-between items-center">
                  <Link href="/faculty/students">
                    <Button variant="outline" size="sm">
                      <Users className="h-3.5 w-3.5 mr-1" /> View Students
                    </Button>
                  </Link>
                  <Link href="/faculty/marks">
                    <Button size="sm">
                      <FileText className="h-3.5 w-3.5 mr-1" /> Enter Marks
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

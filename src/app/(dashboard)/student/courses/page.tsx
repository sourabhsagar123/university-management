import { getCurrentStudentData } from '@/lib/actions/students'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BookOpen, User, Calendar } from 'lucide-react'

export default async function StudentCoursesPage() {
  const result = await getCurrentStudentData()
  const student = result.data

  if (!student) {
    return <div className="p-8 text-center text-gray-500">Student not found</div>
  }

  const enrollments = student.enrollments || []

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">My Registered Courses</h1>
        <p className="text-sm text-gray-500 mt-1">
          Courses enrolled for your current academic curriculum
        </p>
      </div>

      {enrollments.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            <BookOpen className="h-10 w-10 mx-auto text-gray-300 mb-2" />
            <p className="text-lg font-medium">No registered courses found</p>
            <p className="text-sm mt-1">Please contact your academic advisor or administrator</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {enrollments.map((enr: any) => {
            const offering = enr.courseOffering
            const course = offering.course
            return (
              <Card key={enr.id} className="hover:shadow-sm transition-shadow">
                <CardHeader className="border-b border-gray-100 pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <Badge variant="outline" className="font-mono text-xs">{course.code}</Badge>
                      <CardTitle className="text-lg mt-2 text-gray-900">{course.title}</CardTitle>
                      <CardDescription>{course.department.name}</CardDescription>
                    </div>
                    <Badge variant="secondary">Section {offering.section}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 space-y-3">
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <span className="text-xs text-gray-500 block">Credits</span>
                      <span className="font-medium text-gray-900">{course.credits} Credits</span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 block">Semester</span>
                      <span className="font-medium text-gray-900">Sem {offering.semester}</span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 block">Academic Year</span>
                      <span className="font-medium text-gray-900">{offering.academicYear}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-100 flex items-center gap-2 text-sm text-gray-700">
                    <User className="h-4 w-4 text-gray-400" />
                    <span>Instructor: <strong className="font-medium">{offering.faculty.user.name}</strong></span>
                  </div>

                  {course.description && (
                    <p className="text-xs text-gray-500 pt-1 line-clamp-2">
                      {course.description}
                    </p>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}


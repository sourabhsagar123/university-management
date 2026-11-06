import { getCurrentStudentData } from '@/lib/actions/students'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { User, Mail, Phone, Building2, Calendar, Award, ShieldCheck } from 'lucide-react'

export default async function StudentProfilePage() {
  const result = await getCurrentStudentData()
  const student = result.data

  if (!student) {
    return <div className="p-8 text-center text-gray-500">Student profile not found</div>
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Student Profile</h1>
        <p className="text-sm text-gray-500 mt-1">
          Personal identification and official university enrollment records
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="md:col-span-1">
          <CardHeader className="text-center pb-2">
            <div className="h-20 w-20 rounded-full bg-[#1e3a5f] text-white flex items-center justify-center text-2xl font-bold mx-auto mb-3">
              {student.user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
            </div>
            <CardTitle className="text-lg text-gray-900">{student.user.name}</CardTitle>
            <CardDescription className="font-mono text-xs text-[#1e3a5f]">
              {student.registrationNo}
            </CardDescription>
            <div className="pt-2">
              <Badge variant="success">Active Student</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-4 border-t border-gray-100 space-y-3 text-sm">
            <div className="flex items-center gap-3 text-gray-600">
              <Mail className="h-4 w-4 text-gray-400 shrink-0" />
              <span className="truncate">{student.user.email}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-600">
              <Phone className="h-4 w-4 text-gray-400 shrink-0" />
              <span>{student.phone || 'Not provided'}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-600">
              <Building2 className="h-4 w-4 text-gray-400 shrink-0" />
              <span>{student.department.name}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-600">
              <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
              <span className="text-xs text-emerald-700 font-medium">Verified Academic Record</span>
            </div>
          </CardContent>
        </Card>

        {/* Academic Details */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Enrollment Particulars</CardTitle>
            <CardDescription>Academic program details and curriculum tracking</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50/50 rounded-lg border border-gray-100">
                <span className="text-xs text-gray-500 uppercase block font-medium">Programme</span>
                <span className="text-base font-semibold text-gray-900 mt-1 block">{student.programme}</span>
              </div>
              <div className="p-4 bg-gray-50/50 rounded-lg border border-gray-100">
                <span className="text-xs text-gray-500 uppercase block font-medium">Department</span>
                <span className="text-base font-semibold text-gray-900 mt-1 block">{student.department.name} ({student.department.code})</span>
              </div>
              <div className="p-4 bg-gray-50/50 rounded-lg border border-gray-100">
                <span className="text-xs text-gray-500 uppercase block font-medium">Current Semester</span>
                <span className="text-base font-semibold text-gray-900 mt-1 block">Semester {student.currentSemester}</span>
              </div>
              <div className="p-4 bg-gray-50/50 rounded-lg border border-gray-100">
                <span className="text-xs text-gray-500 uppercase block font-medium">Admission Year</span>
                <span className="text-base font-semibold text-gray-900 mt-1 block">{student.admissionYear}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Registered Courses Summary</h3>
              <p className="text-xs text-gray-500 mb-4">
                Total active courses enrolled this term: <strong>{student.enrollments?.length ?? 0}</strong>
              </p>
              <div className="flex flex-wrap gap-2">
                {student.enrollments?.map((e: any) => (
                  <Badge key={e.id} variant="secondary" className="px-3 py-1">
                    {e.courseOffering.course.code} — {e.courseOffering.course.title}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

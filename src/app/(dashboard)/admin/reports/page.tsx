'use client'

import { useState, useEffect } from 'react'
import { Download, FileSpreadsheet, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { getAllDepartments } from '@/lib/actions/departments'
import { getOfferings } from '@/lib/actions/offerings'
import {
  getStudentsByDepartment,
  getFacultyByDepartment,
  getEnrollmentReport,
  getSemesterReport,
  getResultReport,
} from '@/lib/actions/reports'
import { generateCSV, formatDate } from '@/lib/utils'

export default function ReportsPage() {
  const [departments, setDepartments] = useState<any[]>([])
  const [offerings, setOfferings] = useState<any[]>([])

  // Student Report State
  const [studentDeptId, setStudentDeptId] = useState<string>('')
  const [studentData, setStudentData] = useState<any[]>([])

  // Faculty Report State
  const [facultyDeptId, setFacultyDeptId] = useState<string>('')
  const [facultyData, setFacultyData] = useState<any[]>([])

  // Enrollment Report State
  const [enrollmentOfferingId, setEnrollmentOfferingId] = useState<string>('')
  const [enrollmentData, setEnrollmentData] = useState<any[]>([])

  // Semester Report State
  const [selectedSemester, setSelectedSemester] = useState<string>('3')
  const [semesterData, setSemesterData] = useState<any[]>([])

  // Result Report State
  const [resultOfferingId, setResultOfferingId] = useState<string>('')
  const [resultData, setResultData] = useState<any[]>([])

  useEffect(() => {
    getAllDepartments().then(setDepartments)
    getOfferings({ limit: 100 }).then((res) => {
      if (res.data) setOfferings(res.data.offerings)
    })
  }, [])

  // Fetch reports on tab/filter change
  useEffect(() => {
    getStudentsByDepartment(studentDeptId || undefined).then((res) => {
      if (res.data) setStudentData(res.data)
    })
  }, [studentDeptId])

  useEffect(() => {
    getFacultyByDepartment(facultyDeptId || undefined).then((res) => {
      if (res.data) setFacultyData(res.data)
    })
  }, [facultyDeptId])

  useEffect(() => {
    getEnrollmentReport(enrollmentOfferingId || undefined).then((res) => {
      if (res.data) setEnrollmentData(res.data)
    })
  }, [enrollmentOfferingId])

  useEffect(() => {
    getSemesterReport(parseInt(selectedSemester)).then((res) => {
      if (res.data) setSemesterData(res.data)
    })
  }, [selectedSemester])

  useEffect(() => {
    getResultReport(resultOfferingId || undefined).then((res) => {
      if (res.data) setResultData(res.data)
    })
  }, [resultOfferingId])

  // CSV Downloader Helper
  const downloadCSV = (filename: string, headers: string[], rows: string[][]) => {
    const csvContent = generateCSV(headers, rows)
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Export handlers
  const exportStudents = () => {
    const headers = ['Registration No', 'Name', 'Email', 'Department', 'Programme', 'Semester', 'Admission Year']
    const rows = studentData.map((s) => [
      s.registrationNo,
      s.user.name,
      s.user.email,
      s.department.name,
      s.programme,
      String(s.currentSemester),
      String(s.admissionYear),
    ])
    downloadCSV('Students_Report', headers, rows)
  }

  const exportFaculty = () => {
    const headers = ['Employee ID', 'Name', 'Email', 'Department', 'Designation', 'Phone']
    const rows = facultyData.map((f) => [
      f.employeeId,
      f.user.name,
      f.user.email,
      f.department.name,
      f.designation,
      f.phone || '',
    ])
    downloadCSV('Faculty_Report', headers, rows)
  }

  const exportEnrollments = () => {
    const headers = ['Reg No', 'Student Name', 'Course Code', 'Course Title', 'Section', 'Semester', 'Faculty', 'Date']
    const rows = enrollmentData.map((e) => [
      e.student.registrationNo,
      e.student.user.name,
      e.courseOffering.course.code,
      e.courseOffering.course.title,
      e.courseOffering.section,
      String(e.courseOffering.semester),
      e.courseOffering.faculty.user.name,
      formatDate(e.enrollmentDate),
    ])
    downloadCSV('Enrollment_Report', headers, rows)
  }

  const exportSemester = () => {
    const headers = ['Reg No', 'Student Name', 'Department', 'Semester', 'Enrolled Courses Count']
    const rows = semesterData.map((s) => [
      s.registrationNo,
      s.user.name,
      s.department.code,
      String(s.currentSemester),
      String(s.enrollments?.length ?? 0),
    ])
    downloadCSV(`Semester_${selectedSemester}_Report`, headers, rows)
  }

  const exportResults = () => {
    const headers = ['Reg No', 'Student Name', 'Course Code', 'Course Title', 'Internal', 'External', 'Total', 'Grade', 'Grade Points', 'Published']
    const rows = resultData.map((r) => [
      r.enrollment.student.registrationNo,
      r.enrollment.student.user.name,
      r.enrollment.courseOffering.course.code,
      r.enrollment.courseOffering.course.title,
      String(r.internalMarks ?? 0),
      String(r.externalMarks ?? 0),
      String(r.totalMarks ?? 0),
      r.grade || '',
      String(r.gradePoints ?? 0),
      r.isPublished ? 'Yes' : 'No',
    ])
    downloadCSV('Examination_Results_Report', headers, rows)
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Academic Reports & Analytics</h1>
        <p className="text-sm text-gray-500 mt-1">
          Export departmental data, enrollments, and examination metrics in CSV format
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <Tabs defaultValue="students">
            <TabsList className="mb-6 grid grid-cols-2 md:grid-cols-5 h-auto">
              <TabsTrigger value="students">Students</TabsTrigger>
              <TabsTrigger value="faculty">Faculty</TabsTrigger>
              <TabsTrigger value="enrollments">Enrollments</TabsTrigger>
              <TabsTrigger value="semester">Semester-wise</TabsTrigger>
              <TabsTrigger value="results">Exam Results</TabsTrigger>
            </TabsList>

            {/* TAB 1: Students Report */}
            <TabsContent value="students">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <div className="w-full sm:w-64">
                  <select
                    value={studentDeptId}
                    onChange={(e) => setStudentDeptId(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1 text-sm shadow-sm"
                  >
                    <option value="">All Departments</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <Button variant="outline" onClick={exportStudents} disabled={studentData.length === 0}>
                  <Download className="h-4 w-4 mr-2" /> Export to CSV ({studentData.length})
                </Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reg. No</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Programme</TableHead>
                    <TableHead>Semester</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {studentData.slice(0, 10).map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-mono text-sm">{s.registrationNo}</TableCell>
                      <TableCell className="font-medium">{s.user.name}</TableCell>
                      <TableCell><Badge variant="secondary">{s.department.code}</Badge></TableCell>
                      <TableCell>{s.programme}</TableCell>
                      <TableCell>Sem {s.currentSemester}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {studentData.length > 10 && (
                <p className="text-xs text-gray-500 mt-2 text-center">Showing first 10 of {studentData.length} records. Download CSV for full dataset.</p>
              )}
            </TabsContent>

            {/* TAB 2: Faculty Report */}
            <TabsContent value="faculty">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <div className="w-full sm:w-64">
                  <select
                    value={facultyDeptId}
                    onChange={(e) => setFacultyDeptId(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1 text-sm shadow-sm"
                  >
                    <option value="">All Departments</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <Button variant="outline" onClick={exportFaculty} disabled={facultyData.length === 0}>
                  <Download className="h-4 w-4 mr-2" /> Export to CSV ({facultyData.length})
                </Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Emp. ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Designation</TableHead>
                    <TableHead>Email</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {facultyData.map((f) => (
                    <TableRow key={f.id}>
                      <TableCell className="font-mono text-sm">{f.employeeId}</TableCell>
                      <TableCell className="font-medium">{f.user.name}</TableCell>
                      <TableCell><Badge variant="secondary">{f.department.code}</Badge></TableCell>
                      <TableCell>{f.designation}</TableCell>
                      <TableCell className="text-gray-500 text-sm">{f.user.email}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            {/* TAB 3: Enrollments Report */}
            <TabsContent value="enrollments">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <div className="w-full sm:w-80">
                  <select
                    value={enrollmentOfferingId}
                    onChange={(e) => setEnrollmentOfferingId(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1 text-sm shadow-sm"
                  >
                    <option value="">All Course Offerings</option>
                    {offerings.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.course.code} {o.course.title} (Sec {o.section})
                      </option>
                    ))}
                  </select>
                </div>
                <Button variant="outline" onClick={exportEnrollments} disabled={enrollmentData.length === 0}>
                  <Download className="h-4 w-4 mr-2" /> Export to CSV ({enrollmentData.length})
                </Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Reg. No</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Instructor</TableHead>
                    <TableHead>Enrollment Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {enrollmentData.slice(0, 10).map((e) => (
                    <TableRow key={e.id}>
                      <TableCell className="font-medium">{e.student.user.name}</TableCell>
                      <TableCell className="font-mono text-sm">{e.student.registrationNo}</TableCell>
                      <TableCell>{e.courseOffering.course.code} — {e.courseOffering.course.title}</TableCell>
                      <TableCell>{e.courseOffering.faculty.user.name}</TableCell>
                      <TableCell className="text-sm text-gray-500">{formatDate(e.enrollmentDate)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            {/* TAB 4: Semester-wise */}
            <TabsContent value="semester">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <div className="w-full sm:w-48">
                  <select
                    value={selectedSemester}
                    onChange={(e) => setSelectedSemester(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1 text-sm shadow-sm"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={String(s)}>Semester {s}</option>
                    ))}
                  </select>
                </div>
                <Button variant="outline" onClick={exportSemester} disabled={semesterData.length === 0}>
                  <Download className="h-4 w-4 mr-2" /> Export to CSV ({semesterData.length})
                </Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reg. No</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Current Semester</TableHead>
                    <TableHead>Courses Enrolled</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {semesterData.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-mono text-sm">{s.registrationNo}</TableCell>
                      <TableCell className="font-medium">{s.user.name}</TableCell>
                      <TableCell><Badge variant="secondary">{s.department.code}</Badge></TableCell>
                      <TableCell>Semester {s.currentSemester}</TableCell>
                      <TableCell>{s.enrollments?.length ?? 0} courses</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            {/* TAB 5: Exam Results */}
            <TabsContent value="results">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <div className="w-full sm:w-80">
                  <select
                    value={resultOfferingId}
                    onChange={(e) => setResultOfferingId(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1 text-sm shadow-sm"
                  >
                    <option value="">All Course Offerings</option>
                    {offerings.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.course.code} {o.course.title} (Sec {o.section})
                      </option>
                    ))}
                  </select>
                </div>
                <Button variant="outline" onClick={exportResults} disabled={resultData.length === 0}>
                  <Download className="h-4 w-4 mr-2" /> Export to CSV ({resultData.length})
                </Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reg. No</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Internal</TableHead>
                    <TableHead>External</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Grade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {resultData.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-mono text-sm">{r.enrollment.student.registrationNo}</TableCell>
                      <TableCell className="font-medium">{r.enrollment.student.user.name}</TableCell>
                      <TableCell>{r.enrollment.courseOffering.course.code}</TableCell>
                      <TableCell>{r.internalMarks ?? '—'}</TableCell>
                      <TableCell>{r.externalMarks ?? '—'}</TableCell>
                      <TableCell className="font-semibold">{r.totalMarks ?? '—'}</TableCell>
                      <TableCell>
                        {r.grade ? <Badge variant="secondary">{r.grade}</Badge> : '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}


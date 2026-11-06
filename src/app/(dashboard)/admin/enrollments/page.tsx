'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Search, Trash2, UserPlus, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/components/ui/toast'
import { getEnrollments, createEnrollment, deleteEnrollment } from '@/lib/actions/enrollments'
import { getAllStudents } from '@/lib/actions/students'
import { getOfferings } from '@/lib/actions/offerings'
import { formatDate } from '@/lib/utils'

export default function EnrollmentsPage() {
  const { toast } = useToast()
  const [enrollments, setEnrollments] = useState<any[]>([])
  const [students, setStudents] = useState<any[]>([])
  const [offerings, setOfferings] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [openModal, setOpenModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const fetchEnrollments = useCallback(async () => {
    setLoading(true)
    const result = await getEnrollments({ search, page, limit: 10 })
    if (result.data) {
      setEnrollments(result.data.enrollments)
      setTotal(result.data.total)
      setTotalPages(result.data.totalPages)
    }
    setLoading(false)
  }, [search, page])

  useEffect(() => {
    fetchEnrollments()
  }, [fetchEnrollments])

  useEffect(() => {
    if (openModal) {
      Promise.all([
        getAllStudents(),
        getOfferings({ limit: 100 }),
      ]).then(([s, off]) => {
        setStudents(s)
        if (off.data) setOfferings(off.data.offerings)
      })
    }
  }, [openModal])

  const handleEnroll = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)

    const formData = new FormData(e.currentTarget)
    const result = await createEnrollment(formData)

    if (result.error) {
      toast({ title: 'Enrollment Failed', description: result.error, variant: 'error' })
      setSubmitting(false)
      return
    }

    toast({ title: 'Success', description: 'Student enrolled successfully', variant: 'success' })
    setOpenModal(false)
    setSubmitting(false)
    fetchEnrollments()
  }

  const handleDelete = async () => {
    if (!deleteId) return
    const result = await deleteEnrollment(deleteId)
    if (result.error) {
      toast({ title: 'Error', description: result.error, variant: 'error' })
    } else {
      toast({ title: 'Success', description: 'Enrollment removed successfully', variant: 'success' })
      fetchEnrollments()
    }
    setDeleteId(null)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Student Enrollments</h1>
          <p className="text-sm text-gray-500 mt-1">{total} active course enrollments</p>
        </div>
        <Button onClick={() => setOpenModal(true)}>
          <UserPlus className="h-4 w-4 mr-2" /> Enroll Student
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3 mb-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by student name, registration number, or course code..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : enrollments.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg font-medium">No enrollments found</p>
              <p className="text-sm mt-1">Enroll students into course offerings to begin</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Registration No</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Instructor</TableHead>
                    <TableHead>Section</TableHead>
                    <TableHead>Enrollment Date</TableHead>
                    <TableHead className="w-[60px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {enrollments.map((enr) => (
                    <TableRow key={enr.id}>
                      <TableCell className="font-medium">
                        {enr.student.user.name}
                      </TableCell>
                      <TableCell className="font-mono text-sm text-gray-600">
                        {enr.student.registrationNo}
                      </TableCell>
                      <TableCell>
                        <div>
                          <span className="font-mono font-medium text-xs text-[#1e3a5f] mr-1">
                            {enr.courseOffering.course.code}
                          </span>
                          <span className="text-sm font-medium text-gray-900">
                            {enr.courseOffering.course.title}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-700">
                        {enr.courseOffering.faculty.user.name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">Sec {enr.courseOffering.section}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {formatDate(enr.enrollmentDate)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => setDeleteId(enr.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-500">Page {page} of {totalPages}</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</Button>
                    <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next</Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Enroll Student Dialog */}
      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Enroll Student in Course</DialogTitle>
            <DialogDescription>
              Select a student and an active course offering to create a course enrollment.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEnroll} className="space-y-4 py-2">
            <div>
              <Label htmlFor="studentId">Select Student *</Label>
              <select
                id="studentId"
                name="studentId"
                required
                className="flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#1e3a5f]"
              >
                <option value="">-- Choose a student --</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.user.name} ({s.registrationNo} — {s.department.code}, Sem {s.currentSemester})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="courseOfferingId">Select Course Offering *</Label>
              <select
                id="courseOfferingId"
                name="courseOfferingId"
                required
                className="flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#1e3a5f]"
              >
                <option value="">-- Choose an offering --</option>
                {offerings.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.course.code} {o.course.title} (Sec {o.section}, Sem {o.semester}) — {o.faculty.user.name}
                  </option>
                ))}
              </select>
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setOpenModal(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Enrolling...' : 'Confirm Enrollment'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Enrollment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this enrollment? This student will be unenrolled from the course offering.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Remove Enrollment</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Plus, Search, Trash2, Calendar, Users, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/components/ui/toast'
import { getOfferings, deleteOffering } from '@/lib/actions/offerings'

export default function OfferingsPage() {
  const { toast } = useToast()
  const [offerings, setOfferings] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const fetchOfferings = useCallback(async () => {
    setLoading(true)
    const result = await getOfferings({ search, page, limit: 10 })
    if (result.data) {
      setOfferings(result.data.offerings)
      setTotal(result.data.total)
      setTotalPages(result.data.totalPages)
    }
    setLoading(false)
  }, [search, page])

  useEffect(() => { fetchOfferings() }, [fetchOfferings])
  useEffect(() => { setPage(1) }, [search])

  const handleDelete = async () => {
    if (!deleteId) return
    const result = await deleteOffering(deleteId)
    if (result.error) {
      toast({ title: 'Error', description: result.error, variant: 'error' })
    } else {
      toast({ title: 'Success', description: 'Course offering deactivated successfully', variant: 'success' })
      fetchOfferings()
    }
    setDeleteId(null)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Course Offerings</h1>
          <p className="text-sm text-gray-500 mt-1">{total} active offerings scheduled</p>
        </div>
        <Link href="/admin/offerings/new">
          <Button><Plus className="h-4 w-4 mr-2" /> Create Offering</Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3 mb-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by course title, code, or faculty name..."
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
          ) : offerings.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg font-medium">No course offerings found</p>
              <p className="text-sm mt-1">Create an offering to assign faculty and enable student enrollment</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Assigned Faculty</TableHead>
                    <TableHead>Academic Year</TableHead>
                    <TableHead>Semester / Sec</TableHead>
                    <TableHead>Enrollment</TableHead>
                    <TableHead className="w-[60px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {offerings.map((offering) => (
                    <TableRow key={offering.id}>
                      <TableCell>
                        <div>
                          <p className="font-mono font-medium text-sm text-[#1e3a5f]">{offering.course.code}</p>
                          <p className="font-medium text-gray-900">{offering.course.title}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{offering.course.department.code}</Badge>
                      </TableCell>
                      <TableCell className="font-medium text-gray-900">
                        {offering.faculty?.user?.name || 'Unassigned'}
                      </TableCell>
                      <TableCell>{offering.academicYear}</TableCell>
                      <TableCell>
                        <span>Sem {offering.semester}</span>
                        <Badge variant="outline" className="ml-2">Sec {offering.section}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-gray-900">{offering._count?.enrollments ?? 0}</span>
                        <span className="text-gray-500 text-xs"> / {offering.maxStudents}</span>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => setDeleteId(offering.id)}
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

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate Course Offering</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to deactivate this course offering? Students will no longer be able to enroll.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Deactivate</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

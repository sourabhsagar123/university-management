'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Plus, Search, MoreHorizontal, Eye, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/components/ui/toast'
import { getFaculty, deleteFaculty } from '@/lib/actions/faculty'
import { getAllDepartments } from '@/lib/actions/departments'

export default function FacultyPage() {
  const { toast } = useToast()
  const [facultyList, setFacultyList] = useState<any[]>([])
  const [departments, setDepartments] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [departmentId, setDepartmentId] = useState('all')
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const fetchFaculty = useCallback(async () => {
    setLoading(true)
    const result = await getFaculty({ search, departmentId, page, limit: 10 })
    if (result.data) {
      setFacultyList(result.data.faculty)
      setTotal(result.data.total)
      setTotalPages(result.data.totalPages)
    }
    setLoading(false)
  }, [search, departmentId, page])

  const fetchDepartments = useCallback(async () => {
    const depts = await getAllDepartments()
    setDepartments(depts)
  }, [])

  useEffect(() => { fetchDepartments() }, [fetchDepartments])
  useEffect(() => { fetchFaculty() }, [fetchFaculty])
  useEffect(() => { setPage(1) }, [search, departmentId])

  const handleDelete = async () => {
    if (!deleteId) return
    const result = await deleteFaculty(deleteId)
    if (result.error) {
      toast({ title: 'Error', description: result.error, variant: 'error' })
    } else {
      toast({ title: 'Success', description: 'Faculty member deactivated successfully', variant: 'success' })
      fetchFaculty()
    }
    setDeleteId(null)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Faculty Management</h1>
          <p className="text-sm text-gray-500 mt-1">{total} total faculty members</p>
        </div>
        <Link href="/admin/faculty/new">
          <Button><Plus className="h-4 w-4 mr-2" /> Add Faculty</Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, email, or employee ID..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={departmentId} onValueChange={setDepartmentId}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((d) => (
                  <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : facultyList.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg font-medium">No faculty members found</p>
              <p className="text-sm mt-1">Try adjusting your search or filters</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Emp. ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Designation</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[60px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {facultyList.map((f) => (
                    <TableRow key={f.id}>
                      <TableCell className="font-mono text-sm">{f.employeeId}</TableCell>
                      <TableCell className="font-medium">{f.user.name}</TableCell>
                      <TableCell className="text-gray-500">{f.user.email}</TableCell>
                      <TableCell><Badge variant="secondary">{f.department.code}</Badge></TableCell>
                      <TableCell>{f.designation}</TableCell>
                      <TableCell><Badge variant="success">Active</Badge></TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <Link href={`/admin/faculty/${f.id}`}>
                              <DropdownMenuItem><Eye className="h-4 w-4 mr-2" /> View</DropdownMenuItem>
                            </Link>
                            <Link href={`/admin/faculty/${f.id}/edit`}>
                              <DropdownMenuItem><Pencil className="h-4 w-4 mr-2" /> Edit</DropdownMenuItem>
                            </Link>
                            <DropdownMenuItem className="text-red-600" onClick={() => setDeleteId(f.id)}>
                              <Trash2 className="h-4 w-4 mr-2" /> Deactivate
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
            <AlertDialogTitle>Deactivate Faculty Member</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to deactivate this faculty member? Their account access will be disabled.</AlertDialogDescription>
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


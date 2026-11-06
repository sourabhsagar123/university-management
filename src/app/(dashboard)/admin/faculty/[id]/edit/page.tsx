'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/toast'
import { getFacultyById, updateFaculty } from '@/lib/actions/faculty'
import { getAllDepartments } from '@/lib/actions/departments'

export default function EditFacultyPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [departments, setDepartments] = useState<any[]>([])
  const [faculty, setFaculty] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    Promise.all([
      getFacultyById(params.id),
      getAllDepartments()
    ]).then(([res, depts]) => {
      if (res.data) setFaculty(res.data)
      setDepartments(depts)
    })
  }, [params.id])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const result = await updateFaculty(params.id, formData)

    if (result.error) {
      toast({ title: 'Error', description: result.error, variant: 'error' })
      setLoading(false)
      return
    }

    toast({ title: 'Success', description: 'Faculty member updated successfully', variant: 'success' })
    router.push('/admin/faculty')
  }

  if (!faculty) return <div className="p-6 text-gray-500">Loading...</div>

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/faculty" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-2">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Faculty
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900">Edit Faculty Member</h1>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="text-base">Update Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="employeeId">Employee ID *</Label>
                <Input id="employeeId" name="employeeId" defaultValue={faculty.employeeId} required />
              </div>
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input id="name" name="name" defaultValue={faculty.user.name} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input id="email" name="email" type="email" defaultValue={faculty.user.email} required />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" name="phone" defaultValue={faculty.phone || ''} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="departmentId">Department *</Label>
                <select
                  id="departmentId"
                  name="departmentId"
                  required
                  defaultValue={faculty.departmentId}
                  className="flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#1e3a5f]"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="designation">Designation *</Label>
                <select
                  id="designation"
                  name="designation"
                  required
                  defaultValue={faculty.designation}
                  className="flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#1e3a5f]"
                >
                  <option value="Professor">Professor</option>
                  <option value="Associate Professor">Associate Professor</option>
                  <option value="Assistant Professor">Assistant Professor</option>
                  <option value="Lecturer">Lecturer</option>
                  <option value="Visiting Faculty">Visiting Faculty</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
              <Link href="/admin/faculty">
                <Button type="button" variant="outline">Cancel</Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}


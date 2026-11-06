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
import { createFaculty } from '@/lib/actions/faculty'
import { getAllDepartments } from '@/lib/actions/departments'

export default function NewFacultyPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [departments, setDepartments] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getAllDepartments().then(setDepartments)
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const result = await createFaculty(formData)

    if (result.error) {
      toast({ title: 'Error', description: result.error, variant: 'error' })
      setLoading(false)
      return
    }

    toast({ title: 'Success', description: 'Faculty member created successfully', variant: 'success' })
    router.push('/admin/faculty')
  }

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/faculty" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-2">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Faculty
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900">Add New Faculty Member</h1>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="text-base">Faculty Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="employeeId">Employee ID *</Label>
                <Input id="employeeId" name="employeeId" placeholder="EMP001" required />
              </div>
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input id="name" name="name" placeholder="Dr. John Doe" required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input id="email" name="email" type="email" placeholder="faculty@cu.edu" required />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" name="phone" placeholder="9876543210" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="departmentId">Department *</Label>
                <select
                  id="departmentId"
                  name="departmentId"
                  required
                  className="flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#1e3a5f]"
                >
                  <option value="">Select department</option>
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
            <div>
              <Label htmlFor="password">Password *</Label>
              <Input id="password" name="password" type="password" placeholder="Min 6 characters" required />
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Faculty'}
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


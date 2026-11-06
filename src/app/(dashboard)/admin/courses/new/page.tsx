'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/toast'
import { createCourse } from '@/lib/actions/courses'
import { getAllDepartments } from '@/lib/actions/departments'

export default function NewCoursePage() {
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
    const result = await createCourse(formData)

    if (result.error) {
      toast({ title: 'Error', description: result.error, variant: 'error' })
      setLoading(false)
      return
    }

    toast({ title: 'Success', description: 'Course created successfully', variant: 'success' })
    router.push('/admin/courses')
  }

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/courses" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-2">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Courses
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900">Add New Course</h1>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="text-base">Course Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="code">Course Code *</Label>
                <Input id="code" name="code" placeholder="CS201" required />
              </div>
              <div>
                <Label htmlFor="title">Course Title *</Label>
                <Input id="title" name="title" placeholder="Database Management Systems" required />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
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
                <Label htmlFor="semester">Semester *</Label>
                <select
                  id="semester"
                  name="semester"
                  required
                  className="flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#1e3a5f]"
                >
                  {[1,2,3,4,5,6,7,8].map((s) => (
                    <option key={s} value={s}>Semester {s}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="credits">Credits (1-6) *</Label>
                <Input id="credits" name="credits" type="number" min="1" max="6" defaultValue="4" required />
              </div>
            </div>
            <div>
              <Label htmlFor="description">Course Description</Label>
              <Textarea id="description" name="description" placeholder="Course syllabus and prerequisites..." rows={3} />
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Course'}
              </Button>
              <Link href="/admin/courses">
                <Button type="button" variant="outline">Cancel</Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}


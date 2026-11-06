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
import { getCourseById, updateCourse } from '@/lib/actions/courses'
import { getAllDepartments } from '@/lib/actions/departments'

export default function EditCoursePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [departments, setDepartments] = useState<any[]>([])
  const [course, setCourse] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    Promise.all([
      getCourseById(params.id),
      getAllDepartments()
    ]).then(([res, depts]) => {
      if (res.data) setCourse(res.data)
      setDepartments(depts)
    })
  }, [params.id])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const result = await updateCourse(params.id, formData)

    if (result.error) {
      toast({ title: 'Error', description: result.error, variant: 'error' })
      setLoading(false)
      return
    }

    toast({ title: 'Success', description: 'Course updated successfully', variant: 'success' })
    router.push('/admin/courses')
  }

  if (!course) return <div className="p-6 text-gray-500">Loading course...</div>

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/courses" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-2">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Courses
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900">Edit Course</h1>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="text-base">Update Course Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="code">Course Code *</Label>
                <Input id="code" name="code" defaultValue={course.code} required />
              </div>
              <div>
                <Label htmlFor="title">Course Title *</Label>
                <Input id="title" name="title" defaultValue={course.title} required />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="departmentId">Department *</Label>
                <select
                  id="departmentId"
                  name="departmentId"
                  required
                  defaultValue={course.departmentId}
                  className="flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#1e3a5f]"
                >
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
                  defaultValue={course.semester}
                  className="flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#1e3a5f]"
                >
                  {[1,2,3,4,5,6,7,8].map((s) => (
                    <option key={s} value={s}>Semester {s}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="credits">Credits (1-6) *</Label>
                <Input id="credits" name="credits" type="number" min="1" max="6" defaultValue={course.credits} required />
              </div>
            </div>
            <div>
              <Label htmlFor="description">Course Description</Label>
              <Textarea id="description" name="description" defaultValue={course.description || ''} rows={3} />
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
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


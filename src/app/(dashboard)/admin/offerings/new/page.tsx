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
import { createOffering } from '@/lib/actions/offerings'
import { getAllCourses } from '@/lib/actions/courses'
import { getAllFaculty } from '@/lib/actions/faculty'

export default function NewOfferingPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [courses, setCourses] = useState<any[]>([])
  const [facultyList, setFacultyList] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    Promise.all([getAllCourses(), getAllFaculty()]).then(([c, f]) => {
      setCourses(c)
      setFacultyList(f)
    })
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const result = await createOffering(formData)

    if (result.error) {
      toast({ title: 'Error', description: result.error, variant: 'error' })
      setLoading(false)
      return
    }

    toast({ title: 'Success', description: 'Course offering created successfully', variant: 'success' })
    router.push('/admin/offerings')
  }

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/offerings" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-2">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Offerings
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900">Create Course Offering</h1>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="text-base">Offering Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="courseId">Course *</Label>
              <select
                id="courseId"
                name="courseId"
                required
                className="flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#1e3a5f]"
              >
                <option value="">Select course</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} — {c.title} ({c.department.code}, Sem {c.semester})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="facultyId">Assigned Faculty Member *</Label>
              <select
                id="facultyId"
                name="facultyId"
                required
                className="flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#1e3a5f]"
              >
                <option value="">Select faculty member</option>
                {facultyList.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.user.name} ({f.department.code} — {f.designation})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="academicYear">Academic Year *</Label>
                <Input
                  id="academicYear"
                  name="academicYear"
                  type="number"
                  defaultValue={new Date().getFullYear()}
                  required
                />
              </div>
              <div>
                <Label htmlFor="semester">Semester (1-8) *</Label>
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="section">Section *</Label>
                <select
                  id="section"
                  name="section"
                  required
                  defaultValue="A"
                  className="flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#1e3a5f]"
                >
                  <option value="A">Section A</option>
                  <option value="B">Section B</option>
                  <option value="C">Section C</option>
                </select>
              </div>
              <div>
                <Label htmlFor="maxStudents">Max Student Capacity *</Label>
                <Input
                  id="maxStudents"
                  name="maxStudents"
                  type="number"
                  defaultValue="60"
                  min="1"
                  required
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Offering'}
              </Button>
              <Link href="/admin/offerings">
                <Button type="button" variant="outline">Cancel</Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

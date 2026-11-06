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
import { getStudentById, updateStudent } from '@/lib/actions/students'
import { getAllDepartments } from '@/lib/actions/departments'

export default function EditStudentPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [departments, setDepartments] = useState<any[]>([])
  const [student, setStudent] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    Promise.all([
      getStudentById(params.id),
      getAllDepartments()
    ]).then(([res, depts]) => {
      if (res.data) setStudent(res.data)
      setDepartments(depts)
    })
  }, [params.id])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const result = await updateStudent(params.id, formData)
    if (result.error) {
      toast({ title: 'Error', description: result.error, variant: 'error' })
      setLoading(false)
      return
    }
    toast({ title: 'Success', description: 'Student updated successfully', variant: 'success' })
    router.push('/admin/students')
  }

  if (!student) return <div className="p-6 text-gray-500">Loading...</div>

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/students" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-2">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Students
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900">Edit Student</h1>
      </div>

      <Card className="max-w-2xl">
        <CardHeader><CardTitle className="text-base">Update Student Information</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="registrationNo">Registration Number *</Label>
                <Input id="registrationNo" name="registrationNo" defaultValue={student.registrationNo} required />
              </div>
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input id="name" name="name" defaultValue={student.user.name} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input id="email" name="email" type="email" defaultValue={student.user.email} required />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" defaultValue={student.phone || ''} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="departmentId">Department *</Label>
                <select id="departmentId" name="departmentId" required defaultValue={student.departmentId} className="flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#1e3a5f]">
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <Label htmlFor="programme">Programme *</Label>
                <Input id="programme" name="programme" defaultValue={student.programme} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="currentSemester">Semester *</Label>
                <select id="currentSemester" name="currentSemester" required defaultValue={student.currentSemester} className="flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#1e3a5f]">
                  {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                </select>
              </div>
              <div>
                <Label htmlFor="admissionYear">Admission Year *</Label>
                <Input id="admissionYear" name="admissionYear" type="number" defaultValue={student.admissionYear} required />
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</Button>
              <Link href="/admin/students"><Button type="button" variant="outline">Cancel</Button></Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}


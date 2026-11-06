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
import { getDepartmentById, updateDepartment } from '@/lib/actions/departments'

export default function EditDepartmentPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [dept, setDept] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getDepartmentById(params.id).then((res) => {
      if (res.data) setDept(res.data)
    })
  }, [params.id])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const result = await updateDepartment(params.id, formData)

    if (result.error) {
      toast({ title: 'Error', description: result.error, variant: 'error' })
      setLoading(false)
      return
    }

    toast({ title: 'Success', description: 'Department updated successfully', variant: 'success' })
    router.push('/admin/departments')
  }

  if (!dept) return <div className="p-6 text-gray-500">Loading department...</div>

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/departments" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-2">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Departments
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900">Edit Department</h1>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="text-base">Update Department Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="code">Department Code *</Label>
                <Input id="code" name="code" defaultValue={dept.code} required maxLength={10} />
              </div>
              <div>
                <Label htmlFor="name">Department Name *</Label>
                <Input id="name" name="name" defaultValue={dept.name} required />
              </div>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" defaultValue={dept.description || ''} rows={3} />
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
              <Link href="/admin/departments">
                <Button type="button" variant="outline">Cancel</Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

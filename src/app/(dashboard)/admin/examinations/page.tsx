'use client'

import { useState, useEffect } from 'react'
import { Check, Save, FileText, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useToast } from '@/components/ui/toast'
import { getOfferings } from '@/lib/actions/offerings'
import { getEnrollmentsByOffering } from '@/lib/actions/enrollments'
import { saveResult } from '@/lib/actions/results'
import { calculateGrade, getGradeColor } from '@/lib/utils'

export default function ExaminationsPage() {
  const { toast } = useToast()
  const [offerings, setOfferings] = useState<any[]>([])
  const [selectedOfferingId, setSelectedOfferingId] = useState<string>('')
  const [enrollments, setEnrollments] = useState<any[]>([])
  const [loadingOfferings, setLoadingOfferings] = useState(true)
  const [loadingEnrollments, setLoadingEnrollments] = useState(false)
  const [marksState, setMarksState] = useState<Record<string, { internal: string; external: string }>>({})
  const [savingId, setSavingId] = useState<string | null>(null)

  useEffect(() => {
    getOfferings({ limit: 100 }).then((res) => {
      if (res.data && res.data.offerings.length > 0) {
        setOfferings(res.data.offerings)
        setSelectedOfferingId(res.data.offerings[0].id)
      }
      setLoadingOfferings(false)
    })
  }, [])

  useEffect(() => {
    if (!selectedOfferingId) return
    setLoadingEnrollments(true)
    getEnrollmentsByOffering(selectedOfferingId).then((res) => {
      if (res.data) {
        setEnrollments(res.data)
        // Initialize marksState from existing results
        const initial: Record<string, { internal: string; external: string }> = {}
        res.data.forEach((enr: any) => {
          initial[enr.id] = {
            internal: enr.result?.internalMarks !== null && enr.result?.internalMarks !== undefined ? String(enr.result.internalMarks) : '',
            external: enr.result?.externalMarks !== null && enr.result?.externalMarks !== undefined ? String(enr.result.externalMarks) : '',
          }
        })
        setMarksState(initial)
      }
      setLoadingEnrollments(false)
    })
  }, [selectedOfferingId])

  const handleMarkChange = (enrollmentId: string, field: 'internal' | 'external', val: string) => {
    setMarksState((prev) => ({
      ...prev,
      [enrollmentId]: {
        ...prev[enrollmentId],
        [field]: val,
      },
    }))
  }

  const handleSaveMarks = async (enrollmentId: string) => {
    const marks = marksState[enrollmentId]
    if (!marks) return

    const intVal = parseFloat(marks.internal)
    const extVal = parseFloat(marks.external)

    if (isNaN(intVal) || intVal < 0 || intVal > 40) {
      toast({ title: 'Validation Error', description: 'Internal marks must be between 0 and 40', variant: 'error' })
      return
    }
    if (isNaN(extVal) || extVal < 0 || extVal > 60) {
      toast({ title: 'Validation Error', description: 'External marks must be between 0 and 60', variant: 'error' })
      return
    }

    setSavingId(enrollmentId)
    const formData = new FormData()
    formData.append('enrollmentId', enrollmentId)
    formData.append('internalMarks', String(intVal))
    formData.append('externalMarks', String(extVal))

    const result = await saveResult(formData)
    setSavingId(null)

    if (result.error) {
      toast({ title: 'Error', description: result.error, variant: 'error' })
    } else {
      toast({ title: 'Marks Saved', description: 'Internal & external marks saved successfully', variant: 'success' })
      // Refresh enrollments to get updated result
      getEnrollmentsByOffering(selectedOfferingId).then((res) => {
        if (res.data) setEnrollments(res.data)
      })
    }
  }

  const selectedOffering = offerings.find((o) => o.id === selectedOfferingId)

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Examination & Marks Entry</h1>
        <p className="text-sm text-gray-500 mt-1">
          Enter internal (max 40) and external end-semester examination marks (max 60)
        </p>
      </div>

      {/* Offering Selector Card */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <Label htmlFor="offeringSelect" className="text-xs text-gray-500 uppercase font-semibold">
                Select Course Offering
              </Label>
              <select
                id="offeringSelect"
                value={selectedOfferingId}
                onChange={(e) => setSelectedOfferingId(e.target.value)}
                className="mt-1 flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#1e3a5f]"
              >
                {offerings.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.course.code} — {o.course.title} (Sec {o.section}, Sem {o.semester}) | Instructor: {o.faculty.user.name}
                  </option>
                ))}
              </select>
            </div>
            {selectedOffering && (
              <div className="flex gap-4 pt-4 sm:pt-0 border-t sm:border-t-0 sm:border-l sm:pl-4 border-gray-200">
                <div>
                  <p className="text-xs text-gray-500">Department</p>
                  <p className="font-medium text-sm text-gray-900">{selectedOffering.course.department.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Enrolled Students</p>
                  <p className="font-semibold text-sm text-[#1e3a5f]">{enrollments.length} Students</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Marks Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Marks Evaluation Sheet</CardTitle>
              <CardDescription>
                Grading Scale: O (≥90), A+ (≥80), A (≥70), B+ (≥60), B (≥50), C (≥40), F (&lt;40)
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loadingEnrollments ? (
            <p className="text-sm text-gray-500 py-8 text-center">Loading enrolled students...</p>
          ) : enrollments.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg font-medium">No students enrolled in this offering</p>
              <p className="text-sm mt-1">Enroll students into this course offering first</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Registration No</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead className="w-[140px]">Internal Marks (Max 40)</TableHead>
                  <TableHead className="w-[140px]">External Marks (Max 60)</TableHead>
                  <TableHead className="w-[100px]">Total (100)</TableHead>
                  <TableHead className="w-[90px]">Grade</TableHead>
                  <TableHead className="w-[120px]">Status</TableHead>
                  <TableHead className="w-[110px]">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {enrollments.map((enr) => {
                  const state = marksState[enr.id] || { internal: '', external: '' }
                  const intNum = parseFloat(state.internal)
                  const extNum = parseFloat(state.external)
                  const hasValidMarks = !isNaN(intNum) && !isNaN(extNum)
                  const total = hasValidMarks ? intNum + extNum : null
                  const gradeInfo = total !== null ? calculateGrade(total) : null

                  return (
                    <TableRow key={enr.id}>
                      <TableCell className="font-mono text-sm font-medium">
                        {enr.student.registrationNo}
                      </TableCell>
                      <TableCell className="font-medium text-gray-900">
                        {enr.student.user.name}
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          max="40"
                          step="0.5"
                          placeholder="0-40"
                          value={state.internal}
                          onChange={(e) => handleMarkChange(enr.id, 'internal', e.target.value)}
                          className="h-8 w-24 text-center font-mono"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          max="60"
                          step="0.5"
                          placeholder="0-60"
                          value={state.external}
                          onChange={(e) => handleMarkChange(enr.id, 'external', e.target.value)}
                          className="h-8 w-24 text-center font-mono"
                        />
                      </TableCell>
                      <TableCell className="font-semibold text-gray-900">
                        {total !== null ? total : '—'}
                      </TableCell>
                      <TableCell>
                        {gradeInfo ? (
                          <Badge className={getGradeColor(gradeInfo.grade)}>
                            {gradeInfo.grade}
                          </Badge>
                        ) : '—'}
                      </TableCell>
                      <TableCell>
                        {enr.result?.isPublished ? (
                          <Badge variant="success">Published</Badge>
                        ) : enr.result ? (
                          <Badge variant="warning">Draft</Badge>
                        ) : (
                          <Badge variant="outline">Unsaved</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          disabled={savingId === enr.id || !hasValidMarks}
                          onClick={() => handleSaveMarks(enr.id)}
                        >
                          <Save className="h-3.5 w-3.5 mr-1" />
                          {savingId === enr.id ? 'Saving...' : 'Save'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


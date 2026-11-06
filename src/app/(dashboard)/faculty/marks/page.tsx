'use client'

import { useState, useEffect } from 'react'
import { Save, AlertCircle, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useToast } from '@/components/ui/toast'
import { getFacultyAssignedOfferings } from '@/lib/actions/faculty'
import { getEnrollmentsByOffering } from '@/lib/actions/enrollments'
import { saveResult } from '@/lib/actions/results'
import { calculateGrade, getGradeColor } from '@/lib/utils'

export default function FacultyMarksPage() {
  const { toast } = useToast()
  const [offerings, setOfferings] = useState<any[]>([])
  const [selectedOfferingId, setSelectedOfferingId] = useState<string>('')
  const [enrollments, setEnrollments] = useState<any[]>([])
  const [loadingOfferings, setLoadingOfferings] = useState(true)
  const [loadingEnrollments, setLoadingEnrollments] = useState(false)
  const [marksState, setMarksState] = useState<Record<string, { internal: string; external: string }>>({})
  const [savingId, setSavingId] = useState<string | null>(null)

  useEffect(() => {
    getFacultyAssignedOfferings().then((res) => {
      if (res.data && res.data.length > 0) {
        setOfferings(res.data)
        setSelectedOfferingId(res.data[0].id)
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
      toast({ title: 'Marks Saved', description: 'Evaluation marks recorded successfully', variant: 'success' })
      getEnrollmentsByOffering(selectedOfferingId).then((res) => {
        if (res.data) setEnrollments(res.data)
      })
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Enter Examination Marks</h1>
        <p className="text-sm text-gray-500 mt-1">
          Record continuous internal assessment (max 40) and external end-term examination marks (max 60)
        </p>
      </div>

      {loadingOfferings ? (
        <Card className="p-8 text-center text-gray-500">Loading your courses...</Card>
      ) : offerings.length === 0 ? (
        <Card className="p-8 text-center text-gray-500">
          <p className="text-base font-medium">No Course Offerings Assigned</p>
          <p className="text-sm mt-1">You currently have no course offerings assigned to evaluate.</p>
        </Card>
      ) : (
        <>
          <Card className="mb-6">
            <CardContent className="p-4">
              <Label htmlFor="offeringSelect" className="text-xs text-gray-500 uppercase font-semibold">
                Select Assigned Course Offering
              </Label>
              <select
                id="offeringSelect"
                value={selectedOfferingId}
                onChange={(e) => setSelectedOfferingId(e.target.value)}
                className="mt-1 flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#1e3a5f]"
              >
                {offerings.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.course.code} — {o.course.title} (Sec {o.section}, Sem {o.semester}) | {o._count?.enrollments ?? 0} Students Enrolled
                  </option>
                ))}
              </select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Student Grade Roster</CardTitle>
              <CardDescription>
                Grading: O (≥90), A+ (≥80), A (≥70), B+ (≥60), B (≥50), C (≥40), F (&lt;40)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingEnrollments ? (
                <p className="text-sm text-gray-500 py-8 text-center">Loading student records...</p>
              ) : enrollments.length === 0 ? (
                <p className="text-sm text-gray-500 py-8 text-center">No students currently enrolled in this offering</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Registration No</TableHead>
                      <TableHead>Student Name</TableHead>
                      <TableHead className="w-[140px]">Internal (Max 40)</TableHead>
                      <TableHead className="w-[140px]">External (Max 60)</TableHead>
                      <TableHead className="w-[90px]">Total</TableHead>
                      <TableHead className="w-[90px]">Grade</TableHead>
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
        </>
      )}
    </div>
  )
}

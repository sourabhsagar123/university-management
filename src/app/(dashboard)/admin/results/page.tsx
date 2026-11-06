'use client'

import { useState, useEffect } from 'react'
import { CheckCircle2, XCircle, Printer, Send, Undo2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useToast } from '@/components/ui/toast'
import { getOfferings } from '@/lib/actions/offerings'
import { getResultsByOffering, publishResults, unpublishResults } from '@/lib/actions/results'
import { getGradeColor } from '@/lib/utils'

export default function ResultsPage() {
  const { toast } = useToast()
  const [offerings, setOfferings] = useState<any[]>([])
  const [selectedOfferingId, setSelectedOfferingId] = useState<string>('')
  const [enrollments, setEnrollments] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [publishing, setPublishing] = useState(false)

  useEffect(() => {
    getOfferings({ limit: 100 }).then((res) => {
      if (res.data && res.data.offerings.length > 0) {
        setOfferings(res.data.offerings)
        setSelectedOfferingId(res.data.offerings[0].id)
      }
    })
  }, [])

  const loadResults = (offeringId: string) => {
    if (!offeringId) return
    setLoading(true)
    getResultsByOffering(offeringId).then((res) => {
      if (res.data) setEnrollments(res.data)
      setLoading(false)
    })
  }

  useEffect(() => {
    loadResults(selectedOfferingId)
  }, [selectedOfferingId])

  const handlePublish = async () => {
    if (!selectedOfferingId) return
    setPublishing(true)
    const res = await publishResults(selectedOfferingId)
    setPublishing(false)

    if (res.error) {
      toast({ title: 'Error', description: res.error, variant: 'error' })
    } else {
      toast({ title: 'Results Published', description: 'Students can now view their official examination results.', variant: 'success' })
      loadResults(selectedOfferingId)
    }
  }

  const handleUnpublish = async () => {
    if (!selectedOfferingId) return
    setPublishing(true)
    const res = await unpublishResults(selectedOfferingId)
    setPublishing(false)

    if (res.error) {
      toast({ title: 'Error', description: res.error, variant: 'error' })
    } else {
      toast({ title: 'Results Unpublished', description: 'Results are now hidden from student view.', variant: 'default' })
      loadResults(selectedOfferingId)
    }
  }

  const selectedOffering = offerings.find((o) => o.id === selectedOfferingId)
  const evaluatedCount = enrollments.filter((e) => e.result !== null).length
  const publishedCount = enrollments.filter((e) => e.result?.isPublished).length
  const isAllPublished = evaluatedCount > 0 && publishedCount === evaluatedCount

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 no-print">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Examination Results & Publishing</h1>
          <p className="text-sm text-gray-500 mt-1">
            Review grade distribution and publish official student results
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="h-4 w-4 mr-2" /> Print Gazette
          </Button>
          {isAllPublished ? (
            <Button variant="outline" disabled={publishing} onClick={handleUnpublish}>
              <Undo2 className="h-4 w-4 mr-2" /> Unpublish Results
            </Button>
          ) : (
            <Button disabled={publishing || evaluatedCount === 0} onClick={handlePublish}>
              <Send className="h-4 w-4 mr-2" /> Publish Official Results
            </Button>
          )}
        </div>
      </div>

      {/* Offering Selector Card */}
      <Card className="mb-6 no-print">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <label className="text-xs text-gray-500 uppercase font-semibold">Select Course Offering</label>
              <select
                value={selectedOfferingId}
                onChange={(e) => setSelectedOfferingId(e.target.value)}
                className="mt-1 flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#1e3a5f]"
              >
                {offerings.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.course.code} — {o.course.title} (Sec {o.section}, Sem {o.semester}) | {o.faculty.user.name}
                  </option>
                ))}
              </select>
            </div>
            {selectedOffering && (
              <div className="flex gap-4 pt-4 sm:pt-0 border-t sm:border-t-0 sm:border-l sm:pl-4 border-gray-200">
                <div>
                  <p className="text-xs text-gray-500">Evaluated</p>
                  <p className="font-semibold text-sm text-gray-900">{evaluatedCount} / {enrollments.length}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Published Status</p>
                  <p className="font-semibold text-sm text-[#1e3a5f]">{publishedCount} Published</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Gazette / Result Table */}
      <Card>
        <CardHeader className="border-b border-gray-100 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">
                {selectedOffering ? `${selectedOffering.course.code} — ${selectedOffering.course.title}` : 'Result Sheet'}
              </CardTitle>
              {selectedOffering && (
                <CardDescription className="mt-1">
                  Department: {selectedOffering.course.department.name} | Semester: {selectedOffering.semester} | Academic Year: {selectedOffering.academicYear} | Instructor: {selectedOffering.faculty.user.name}
                </CardDescription>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {loading ? (
            <p className="text-sm text-gray-500 py-8 text-center">Loading result records...</p>
          ) : enrollments.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg font-medium">No students enrolled</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Registration No</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead className="text-center">Internal (40)</TableHead>
                  <TableHead className="text-center">External (60)</TableHead>
                  <TableHead className="text-center">Total (100)</TableHead>
                  <TableHead className="text-center">Grade</TableHead>
                  <TableHead className="text-center">Grade Points</TableHead>
                  <TableHead className="text-right">Publication Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {enrollments.map((enr) => {
                  const res = enr.result
                  return (
                    <TableRow key={enr.id}>
                      <TableCell className="font-mono text-sm font-medium">
                        {enr.student.registrationNo}
                      </TableCell>
                      <TableCell className="font-medium text-gray-900">
                        {enr.student.user.name}
                      </TableCell>
                      <TableCell className="text-center font-mono text-sm">
                        {res?.internalMarks !== null && res?.internalMarks !== undefined ? res.internalMarks : '—'}
                      </TableCell>
                      <TableCell className="text-center font-mono text-sm">
                        {res?.externalMarks !== null && res?.externalMarks !== undefined ? res.externalMarks : '—'}
                      </TableCell>
                      <TableCell className="text-center font-semibold text-gray-900 font-mono">
                        {res?.totalMarks !== null && res?.totalMarks !== undefined ? res.totalMarks : '—'}
                      </TableCell>
                      <TableCell className="text-center">
                        {res?.grade ? (
                          <Badge className={getGradeColor(res.grade)}>{res.grade}</Badge>
                        ) : '—'}
                      </TableCell>
                      <TableCell className="text-center font-mono text-sm">
                        {res?.gradePoints !== null && res?.gradePoints !== undefined ? res.gradePoints : '—'}
                      </TableCell>
                      <TableCell className="text-right">
                        {res?.isPublished ? (
                          <Badge variant="success">Published</Badge>
                        ) : res ? (
                          <Badge variant="warning">Draft / Unpublished</Badge>
                        ) : (
                          <Badge variant="outline">Unmarked</Badge>
                        )}
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

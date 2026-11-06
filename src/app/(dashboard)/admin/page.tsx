import { Users, GraduationCap, Building2, BookOpen } from 'lucide-react'
import { getDashboardStats } from '@/lib/actions/reports'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { DepartmentChart } from '@/components/charts/department-chart'

export default async function AdminDashboard() {
  const result = await getDashboardStats()
  const stats = result.data

  if (!stats) {
    return <div className="p-6 text-gray-500">Failed to load dashboard data.</div>
  }

  const statCards = [
    { title: 'Total Students', value: stats.studentCount, icon: Users, color: 'bg-blue-50 text-blue-700' },
    { title: 'Total Faculty', value: stats.facultyCount, icon: GraduationCap, color: 'bg-emerald-50 text-emerald-700' },
    { title: 'Departments', value: stats.departmentCount, icon: Building2, color: 'bg-purple-50 text-purple-700' },
    { title: 'Courses', value: stats.courseCount, icon: BookOpen, color: 'bg-amber-50 text-amber-700' },
  ]

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Welcome to the University Management System</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                    <p className="mt-1 text-2xl font-semibold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${stat.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Department Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Department-wise Student Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <DepartmentChart data={stats.departmentDistribution} />
          </CardContent>
        </Card>

        {/* Recent Registrations */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Registrations</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.recentStudents.map((student: any) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900">{student.user.name}</p>
                        <p className="text-xs text-gray-500">{student.user.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{student.department.name}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="success">Active</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

function calculateGrade(totalMarks: number): { grade: string; gradePoints: number } {
  if (totalMarks >= 90) return { grade: 'O', gradePoints: 10 }
  if (totalMarks >= 80) return { grade: 'A+', gradePoints: 9 }
  if (totalMarks >= 70) return { grade: 'A', gradePoints: 8 }
  if (totalMarks >= 60) return { grade: 'B+', gradePoints: 7 }
  if (totalMarks >= 50) return { grade: 'B', gradePoints: 6 }
  if (totalMarks >= 40) return { grade: 'C', gradePoints: 5 }
  return { grade: 'F', gradePoints: 0 }
}

async function main() {
  console.log('Starting seed...')

  // Clear existing data
  await prisma.result.deleteMany()
  await prisma.enrollment.deleteMany()
  await prisma.courseOffering.deleteMany()
  await prisma.course.deleteMany()
  await prisma.student.deleteMany()
  await prisma.faculty.deleteMany()
  await prisma.department.deleteMany()
  await prisma.user.deleteMany()
  console.log('Cleared existing data')

  const passwordHash = await bcrypt.hash('password123', 10)

  // ── Departments ──
  const [csDept, eeDept, meDept, ceDept, eceDept] = await prisma.$transaction([
    prisma.department.create({ data: { name: 'Computer Science & Engineering', code: 'CSE', description: 'Department of Computer Science and Engineering' } }),
    prisma.department.create({ data: { name: 'Electrical Engineering', code: 'EE', description: 'Department of Electrical Engineering' } }),
    prisma.department.create({ data: { name: 'Mechanical Engineering', code: 'ME', description: 'Department of Mechanical Engineering' } }),
    prisma.department.create({ data: { name: 'Civil Engineering', code: 'CE', description: 'Department of Civil Engineering' } }),
    prisma.department.create({ data: { name: 'Electronics & Communication', code: 'ECE', description: 'Department of Electronics and Communication Engineering' } }),
  ])
  console.log('Created 5 departments')

  // ── Admin ──
  await prisma.user.create({
    data: { email: 'admin@cu.edu', passwordHash, name: 'System Administrator', role: 'ADMIN' },
  })
  await prisma.user.create({
    data: { email: 'im.aditya@gmail.com', passwordHash, name: 'Aditya (Administrator)', role: 'ADMIN' },
  })
  console.log('Created admin users')

  // ── Faculty ──
  const facultyData = [
    { email: 'faculty@cu.edu', name: 'Dr. Rajesh Kumar', empId: 'EMP001', deptId: csDept.id, designation: 'Professor' },
    { email: 'priya.sharma@cu.edu', name: 'Dr. Priya Sharma', empId: 'EMP002', deptId: eeDept.id, designation: 'Associate Professor' },
    { email: 'amit.singh@cu.edu', name: 'Dr. Amit Singh', empId: 'EMP003', deptId: meDept.id, designation: 'Assistant Professor' },
    { email: 'neha.gupta@cu.edu', name: 'Dr. Neha Gupta', empId: 'EMP004', deptId: ceDept.id, designation: 'Professor' },
    { email: 'vikram.patel@cu.edu', name: 'Dr. Vikram Patel', empId: 'EMP005', deptId: eceDept.id, designation: 'Associate Professor' },
    { email: 'sunita.verma@cu.edu', name: 'Dr. Sunita Verma', empId: 'EMP006', deptId: csDept.id, designation: 'Assistant Professor' },
  ]

  const facultyRecords = []
  for (const f of facultyData) {
    const user = await prisma.user.create({
      data: { email: f.email, passwordHash, name: f.name, role: 'FACULTY' },
    })
    const faculty = await prisma.faculty.create({
      data: { userId: user.id, departmentId: f.deptId, employeeId: f.empId, designation: f.designation, phone: '9876500001' },
    })
    facultyRecords.push(faculty)
  }
  const [rajesh, priya, amit, neha, vikram, sunita] = facultyRecords
  console.log('Created 6 faculty members')

  // ── Students ──
  const studentData = [
    { email: 'student@cu.edu', name: 'Aarav Mehta', regNo: 'REG2024001', deptId: csDept.id, programme: 'B.Tech CSE', semester: 3, year: 2024, phone: '9876543001' },
    { email: 'ishaan.reddy@cu.edu', name: 'Ishaan Reddy', regNo: 'REG2023001', deptId: csDept.id, programme: 'B.Tech CSE', semester: 5, year: 2023, phone: '9876543002' },
    { email: 'ananya.iyer@cu.edu', name: 'Ananya Iyer', regNo: 'REG2024002', deptId: csDept.id, programme: 'B.Tech CSE', semester: 1, year: 2024, phone: '9876543003' },
    { email: 'rohan.desai@cu.edu', name: 'Rohan Desai', regNo: 'REG2024003', deptId: eeDept.id, programme: 'B.Tech EE', semester: 3, year: 2024, phone: '9876543004' },
    { email: 'kavya.nair@cu.edu', name: 'Kavya Nair', regNo: 'REG2023002', deptId: eeDept.id, programme: 'B.Tech EE', semester: 5, year: 2023, phone: '9876543005' },
    { email: 'arjun.kapoor@cu.edu', name: 'Arjun Kapoor', regNo: 'REG2024004', deptId: meDept.id, programme: 'B.Tech ME', semester: 1, year: 2024, phone: '9876543006' },
    { email: 'diya.choudhury@cu.edu', name: 'Diya Choudhury', regNo: 'REG2024005', deptId: meDept.id, programme: 'B.Tech ME', semester: 3, year: 2024, phone: '9876543007' },
    { email: 'vihaan.joshi@cu.edu', name: 'Vihaan Joshi', regNo: 'REG2023003', deptId: ceDept.id, programme: 'B.Tech CE', semester: 5, year: 2023, phone: '9876543008' },
    { email: 'saanvi.rao@cu.edu', name: 'Saanvi Rao', regNo: 'REG2024006', deptId: ceDept.id, programme: 'B.Tech CE', semester: 1, year: 2024, phone: '9876543009' },
    { email: 'aditya.malhotra@cu.edu', name: 'Aditya Malhotra', regNo: 'REG2024007', deptId: eceDept.id, programme: 'B.Tech ECE', semester: 3, year: 2024, phone: '9876543010' },
    { email: 'myra.bhatia@cu.edu', name: 'Myra Bhatia', regNo: 'REG2023004', deptId: eceDept.id, programme: 'B.Tech ECE', semester: 5, year: 2023, phone: '9876543011' },
    { email: 'reyansh.pillai@cu.edu', name: 'Reyansh Pillai', regNo: 'REG2022001', deptId: csDept.id, programme: 'B.Tech CSE', semester: 7, year: 2022, phone: '9876543012' },
    { email: 'kiara.saxena@cu.edu', name: 'Kiara Saxena', regNo: 'REG2022002', deptId: eeDept.id, programme: 'B.Tech EE', semester: 7, year: 2022, phone: '9876543013' },
    { email: 'dhruv.tiwari@cu.edu', name: 'Dhruv Tiwari', regNo: 'REG2023005', deptId: meDept.id, programme: 'B.Tech ME', semester: 5, year: 2023, phone: '9876543014' },
    { email: 'navya.agarwal@cu.edu', name: 'Navya Agarwal', regNo: 'REG2024008', deptId: ceDept.id, programme: 'B.Tech CE', semester: 3, year: 2024, phone: '9876543015' },
    { email: 'vivaan.mishra@cu.edu', name: 'Vivaan Mishra', regNo: 'REG2024009', deptId: eceDept.id, programme: 'B.Tech ECE', semester: 1, year: 2024, phone: '9876543016' },
  ]

  const studentRecords: Record<string, any> = {}
  for (const s of studentData) {
    const user = await prisma.user.create({
      data: { email: s.email, passwordHash, name: s.name, role: 'STUDENT' },
    })
    const student = await prisma.student.create({
      data: { userId: user.id, registrationNo: s.regNo, departmentId: s.deptId, programme: s.programme, currentSemester: s.semester, admissionYear: s.year, phone: s.phone },
    })
    studentRecords[s.regNo] = student
  }
  console.log('Created 16 students')

  // ── Courses ──
  const coursesData = [
    { code: 'CS001', title: 'Introduction to Programming', deptId: csDept.id, semester: 1, credits: 4 },
    { code: 'CS101', title: 'Data Structures', deptId: csDept.id, semester: 3, credits: 4 },
    { code: 'CS201', title: 'Database Management Systems', deptId: csDept.id, semester: 5, credits: 4 },
    { code: 'CS301', title: 'Operating Systems', deptId: csDept.id, semester: 5, credits: 3 },
    { code: 'EE101', title: 'Circuit Theory', deptId: eeDept.id, semester: 3, credits: 4 },
    { code: 'EE201', title: 'Signals & Systems', deptId: eeDept.id, semester: 5, credits: 3 },
    { code: 'ME101', title: 'Engineering Mechanics', deptId: meDept.id, semester: 1, credits: 4 },
    { code: 'ME201', title: 'Thermodynamics', deptId: meDept.id, semester: 3, credits: 3 },
    { code: 'CE101', title: 'Structural Analysis', deptId: ceDept.id, semester: 3, credits: 4 },
    { code: 'CE201', title: 'Geotechnical Engineering', deptId: ceDept.id, semester: 5, credits: 3 },
    { code: 'ECE101', title: 'Digital Electronics', deptId: eceDept.id, semester: 3, credits: 4 },
    { code: 'ECE201', title: 'Microprocessors', deptId: eceDept.id, semester: 5, credits: 3 },
  ]

  const courseRecords: Record<string, any> = {}
  for (const c of coursesData) {
    const course = await prisma.course.create({
      data: { code: c.code, title: c.title, departmentId: c.deptId, semester: c.semester, credits: c.credits },
    })
    courseRecords[c.code] = course
  }
  console.log('Created 12 courses')

  // ── Course Offerings (Academic Year 2024) ──
  const offeringsData = [
    { courseCode: 'CS001', faculty: sunita, semester: 1, section: 'A' },
    { courseCode: 'ME101', faculty: amit, semester: 1, section: 'A' },
    { courseCode: 'CS101', faculty: rajesh, semester: 3, section: 'A' },
    { courseCode: 'EE101', faculty: priya, semester: 3, section: 'A' },
    { courseCode: 'ME201', faculty: amit, semester: 3, section: 'A' },
    { courseCode: 'CE101', faculty: neha, semester: 3, section: 'A' },
    { courseCode: 'ECE101', faculty: vikram, semester: 3, section: 'A' },
    { courseCode: 'CS201', faculty: sunita, semester: 5, section: 'A' },
    { courseCode: 'CS301', faculty: rajesh, semester: 5, section: 'A' },
    { courseCode: 'EE201', faculty: priya, semester: 5, section: 'A' },
    { courseCode: 'CE201', faculty: neha, semester: 5, section: 'A' },
    { courseCode: 'ECE201', faculty: vikram, semester: 5, section: 'A' },
  ]

  const offeringRecords: Record<string, any> = {}
  for (const o of offeringsData) {
    const course = courseRecords[o.courseCode]
    const offering = await prisma.courseOffering.create({
      data: { courseId: course.id, facultyId: o.faculty.id, academicYear: 2024, semester: o.semester, section: o.section, maxStudents: 60 },
    })
    offeringRecords[o.courseCode] = offering
  }
  console.log('Created 12 course offerings')

  // ── Enrollments ──
  const enrollments = [
    { regNo: 'REG2024002', courseCode: 'CS001' },
    { regNo: 'REG2024004', courseCode: 'ME101' },
    { regNo: 'REG2024006', courseCode: 'ME101' },
    { regNo: 'REG2024009', courseCode: 'CS001' },
    { regNo: 'REG2024001', courseCode: 'CS101' },
    { regNo: 'REG2024003', courseCode: 'EE101' },
    { regNo: 'REG2024005', courseCode: 'ME201' },
    { regNo: 'REG2024007', courseCode: 'ECE101' },
    { regNo: 'REG2024008', courseCode: 'CE101' },
    { regNo: 'REG2023001', courseCode: 'CS201' },
    { regNo: 'REG2023001', courseCode: 'CS301' },
    { regNo: 'REG2023002', courseCode: 'EE201' },
    { regNo: 'REG2023003', courseCode: 'CE201' },
    { regNo: 'REG2023004', courseCode: 'ECE201' },
    { regNo: 'REG2023005', courseCode: 'ME201' },
  ]

  const enrollmentRecords: Record<string, any> = {}
  for (const e of enrollments) {
    const student = studentRecords[e.regNo]
    const offering = offeringRecords[e.courseCode]
    if (!student || !offering) continue
    const enrollment = await prisma.enrollment.create({
      data: { studentId: student.id, courseOfferingId: offering.id },
    })
    enrollmentRecords[`${e.regNo}-${e.courseCode}`] = enrollment
  }
  console.log('Created enrollments')

  // ── Results ──
  const resultsData = [
    { key: 'REG2023001-CS201', internal: 35, external: 52, published: true },
    { key: 'REG2023001-CS301', internal: 32, external: 48, published: true },
    { key: 'REG2023002-EE201', internal: 38, external: 55, published: true },
    { key: 'REG2023003-CE201', internal: 28, external: 42, published: true },
    { key: 'REG2023004-ECE201', internal: 36, external: 50, published: true },
    { key: 'REG2024001-CS101', internal: 33, external: 45, published: false },
    { key: 'REG2024003-EE101', internal: 30, external: 40, published: false },
    { key: 'REG2024007-ECE101', internal: 37, external: 51, published: false },
    { key: 'REG2024008-CE101', internal: 25, external: 38, published: false },
  ]

  for (const r of resultsData) {
    const enrollment = enrollmentRecords[r.key]
    if (!enrollment) continue
    const totalMarks = r.internal + r.external
    const { grade, gradePoints } = calculateGrade(totalMarks)
    await prisma.result.create({
      data: { enrollmentId: enrollment.id, internalMarks: r.internal, externalMarks: r.external, totalMarks, grade, gradePoints, isPublished: r.published },
    })
  }
  console.log('Created results')

  console.log('')
  console.log('Seed completed successfully!')
  console.log('')
  console.log('Demo Accounts:')
  console.log('  Admin:   admin@cu.edu / password123')
  console.log('  Faculty: faculty@cu.edu / password123')
  console.log('  Student: student@cu.edu / password123')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })

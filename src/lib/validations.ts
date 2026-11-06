import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const studentSchema = z.object({
  registrationNo: z.string().min(1, 'Registration number is required'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional().or(z.literal('')),
  departmentId: z.string().min(1, 'Department is required'),
  programme: z.string().min(1, 'Programme is required'),
  currentSemester: z.coerce.number().int().min(1).max(8),
  admissionYear: z.coerce.number().int(),
  password: z.string().min(6, 'Password must be at least 6 characters').optional().or(z.literal('')),
})

export const facultySchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional().or(z.literal('')),
  departmentId: z.string().min(1, 'Department is required'),
  designation: z.string().min(1, 'Designation is required'),
  password: z.string().min(6, 'Password must be at least 6 characters').optional().or(z.literal('')),
})

export const departmentSchema = z.object({
  code: z.string().min(2, 'Code must be at least 2 characters').max(10, 'Code must be at most 10 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional().or(z.literal('')),
})

export const courseSchema = z.object({
  code: z.string().min(1, 'Course code is required'),
  title: z.string().min(2, 'Title must be at least 2 characters'),
  credits: z.coerce.number().int().min(1).max(6),
  departmentId: z.string().min(1, 'Department is required'),
  semester: z.coerce.number().int().min(1).max(8),
  description: z.string().optional().or(z.literal('')),
})

export const courseOfferingSchema = z.object({
  courseId: z.string().min(1, 'Course is required'),
  facultyId: z.string().min(1, 'Faculty is required'),
  academicYear: z.coerce.number().int(),
  semester: z.coerce.number().int().min(1).max(8),
  section: z.string().min(1, 'Section is required'),
  maxStudents: z.coerce.number().int().min(1, 'Max students must be at least 1'),
})

export const enrollmentSchema = z.object({
  studentId: z.string().min(1, 'Student is required'),
  courseOfferingId: z.string().min(1, 'Course offering is required'),
})

export const resultSchema = z.object({
  enrollmentId: z.string().min(1, 'Enrollment is required'),
  internalMarks: z.coerce.number().min(0).max(40),
  externalMarks: z.coerce.number().min(0).max(60),
})

export type LoginInput = z.infer<typeof loginSchema>
export type StudentInput = z.infer<typeof studentSchema>
export type FacultyInput = z.infer<typeof facultySchema>
export type DepartmentInput = z.infer<typeof departmentSchema>
export type CourseInput = z.infer<typeof courseSchema>
export type CourseOfferingInput = z.infer<typeof courseOfferingSchema>
export type EnrollmentInput = z.infer<typeof enrollmentSchema>
export type ResultInput = z.infer<typeof resultSchema>

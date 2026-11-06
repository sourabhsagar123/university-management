# University Management System (UMS)
**Academic DBMS Capstone Project — Chandigarh University**

A full-stack, enterprise-grade University Management System built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, **shadcn/ui**, **Prisma ORM**, and **PostgreSQL**.

---

## 1. Project Overview

This platform is a fully functional academic administration and examination management system designed according to real-world higher-education ERP workflows. It rejects AI-generated aesthetic tropes (avoiding excessive gradients, glowing cards, and empty templates) in favor of a clean, minimal enterprise design palette (deep navy blue `#1e3a5f`, muted slate, clean data tables, responsive layouts, and rigorous server-side validation).

### Key Features
- **Relational Integrity**: Complete 3NF relational schema with foreign key constraints, composite unique keys, cascade rules, and indexes.
- **Three Distinct User Roles**:
  - **Administrator**: Complete administrative authority over students, faculty, departments, courses, course offerings, student enrollments, exam evaluations, result publications, and CSV report generation.
  - **Faculty**: Dedicated portal to manage assigned courses, inspect enrolled rosters, record internal continuous assessment (0–40) and external end-semester marks (0–60), and view student performance.
  - **Student**: Isolated private portal to inspect personal academic profiles, view registered courses, and access official published result cards with GPA calculations.
- **Strict Data Privacy**: Students cannot view or tamper with any other student's grades; unpublished examination drafts remain hidden until formally released by administration.
- **Duplicate Protection**: Database-level composite unique constraints prevent double-enrollments and duplicate course offerings.
- **Automatic Grading Engine**: Server-side grade and grade-point calculations based on standardized university grading scales.
- **Exportable Reports**: One-click CSV generation for students, faculty rosters, course enrollments, semester breakdowns, and examination gazettes.

---

## 2. Technology Stack

- **Framework**: Next.js 14.2 (App Router, Server Actions, Server Components)
- **Language**: TypeScript 5 (Strict Mode enabled)
- **Styling**: Tailwind CSS 3.4 with custom design tokens
- **Component Primitives**: Radix UI (accessible dialogs, dropdowns, select menus, alert dialogs, tabs)
- **Icons**: Lucide React
- **Data Visualization**: Recharts (Department student distribution chart)
- **Database & ORM**: PostgreSQL with Prisma ORM 5.22.0
- **Validation**: Zod (Form schema validation on client and server)
- **Authentication**: Custom session management via signed JWT in HTTP-Only Cookies + bcryptjs password hashing (12 rounds)

---

## 3. Demo Login Credentials

The database seed script initializes ready-to-test accounts for all three user roles:

| Role | Email Address | Password | Description |
|---|---|---|---|
| **Administrator** | `admin@cu.edu` | `password123` | Full ERP administrative dashboard access |
| **Faculty** | `faculty@cu.edu` | `password123` | Dr. Rajesh Kumar (Professor, CSE Department) |
| **Student** | `student@cu.edu` | `password123` | Aarav Mehta (B.Tech CSE, Semester 3, REG2024001) |

> **Note**: Passwords for all seeded users are set to `password123`.

---

## 4. Database Architecture & ER Diagram

The system employs eight normalized relational tables:
1. `users`: Stores core credentials, role (`ADMIN`, `FACULTY`, `STUDENT`), and account status.
2. `departments`: Academic units (`CSE`, `EE`, `ME`, `CE`, `ECE`).
3. `students`: Student profile linked 1-to-1 with `users` and N-to-1 with `departments`.
4. `faculty`: Faculty profile linked 1-to-1 with `users` and N-to-1 with `departments`.
5. `courses`: Curricular subjects offered by departments with semester and credit weights.
6. `course_offerings`: Schedules a course for a specific academic year, semester, section, and faculty member.
7. `enrollments`: Resolves the M:N relationship between `students` and `course_offerings` with duplicate prevention.
8. `results`: 1-to-1 evaluation sheet per enrollment tracking internal, external, and total marks, grade, grade points, and publication status.

For the comprehensive Entity-Relationship Diagram and Normalization breakdown, see:
- [`docs/ERD.md`](docs/ERD.md)
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)

---

## 5. Getting Started & Setup Guide

### Prerequisites
- Node.js 18.x, 20.x, or 22.x
- npm or pnpm
- PostgreSQL 14+ (local instance or managed cloud provider such as Supabase, Neon, Railway, or AWS RDS)

### Step 1: Clone & Install Dependencies
```bash
git clone <repository-url>
cd University_Management
npm install
```

### Step 2: Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Update `DATABASE_URL` with your PostgreSQL connection string:
```env
DATABASE_URL="postgresql://<username>:<password>@localhost:5432/university_management?schema=public"
JWT_SECRET="ums-production-secure-random-key"
NODE_ENV="development"
```

### Step 3: Run Database Migrations
Deploy the complete schema to your PostgreSQL database:
```bash
npx prisma migrate deploy
```
*(Or in development mode: `npx prisma migrate dev --name init`)*

### Step 4: Seed the Database
Populate the database with realistic university departments, 6 faculty members, 16 students across 5 branches, 12 courses, course offerings, enrollments, and examination results:
```bash
npx prisma db seed
```

### Step 5: Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser. You will be automatically redirected to `/login`.

---

## 6. Application Routes & Modules

### Public
- `/login`: Secure authentication portal with brand identity

### Administrator (`/admin`)
- `/admin`: Dashboard with KPI stat cards, department student distribution chart, and recent registrations
- `/admin/students`: Student directory with department/semester filters, search, and pagination
- `/admin/students/new`: Multi-field student enrollment form
- `/admin/students/[id]`: Individual student transcript and academic profile
- `/admin/students/[id]/edit`: Student record update
- `/admin/faculty`: Faculty roster with department filtering and deactivation
- `/admin/faculty/new`: Onboarding form for faculty members
- `/admin/faculty/[id]`: Faculty profile and assigned offerings
- `/admin/departments`: Department registry with student/faculty/course counters
- `/admin/departments/new`: Department creation
- `/admin/departments/[id]`: Department detail with tabbed view of students, faculty, and courses
- `/admin/courses`: Course catalogue with credit and semester metadata
- `/admin/courses/new`: Course creation form
- `/admin/offerings`: Course offering timetable and section scheduler
- `/admin/offerings/new`: Create offering with faculty assignment and student cap
- `/admin/enrollments`: Manage student course registrations with capacity and duplicate check
- `/admin/examinations`: Record continuous internal (40) and external (60) exam marks
- `/admin/results`: Grade gazette with one-click official result publishing and print view
- `/admin/reports`: Multi-tab CSV reporting center (Students, Faculty, Enrollments, Semester-wise, Results)

### Faculty (`/faculty`)
- `/faculty`: Faculty dashboard with assigned offerings and roster counters
- `/faculty/courses`: Course cards detailing credits, semester, and enrolled student counts
- `/faculty/students`: Enrolled student roster across all assigned courses
- `/faculty/marks`: Interactive evaluation sheet to record and update exam marks
- `/faculty/results`: Overview of recorded student scores and publication statuses

### Student (`/student`)
- `/student`: Student dashboard with enrolled courses, current semester info, and CGPA
- `/student/courses`: Registered course cards with instructor details and syllabus descriptions
- `/student/results`: Official semester grade card with breakdown of internal, external, total marks, and letter grades
- `/student/profile`: Personal academic profile and verification records

---

## 7. Grading Scale Specification

| Percentage / Total Marks | Letter Grade | Grade Points | Performance Level |
|:---:|:---:|:---:|:---|
| **90 – 100** | **O** | **10.0** | Outstanding |
| **80 – 89** | **A+** | **9.0** | Excellent |
| **70 – 79** | **A** | **8.0** | Very Good |
| **60 – 69** | **B+** | **7.0** | Good |
| **50 – 59** | **B** | **6.0** | Above Average |
| **40 – 49** | **C** | **5.0** | Pass |
| **0 – 39** | **F** | **0.0** | Fail |

---

## 8. Build Verification

To verify production readiness:
```bash
npm run build
```
The build produces zero TypeScript errors and compiles all 30 static and server-rendered routes into production bundles.

# University Management System — Technical Architecture

## 1. Architectural Overview

The University Management System is engineered as an enterprise-grade full-stack web application built on **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, and **Prisma ORM with PostgreSQL**.

```
+-----------------------------------------------------------------+
|                         Client Layer                            |
|  - Server-Side Rendered (SSR) & Client Components               |
|  - shadcn/ui Design System (Radix UI + Tailwind CSS)            |
|  - Recharts for Real-time Academic Analytics                    |
+-----------------------------------------------------------------+
                                |
                                v
+-----------------------------------------------------------------+
|                       Application Layer                         |
|  - Next.js Server Actions ("use server")                        |
|  - Authentication (HTTP-Only Cookie + JWT Session + bcryptjs)   |
|  - Role-Based Access Control (RBAC: ADMIN | FACULTY | STUDENT)  |
|  - Server-Side Zod Schema Validations                           |
+-----------------------------------------------------------------+
                                |
                                v
+-----------------------------------------------------------------+
|                     Data Persistence Layer                      |
|  - Prisma ORM 5.22.0 (Type-safe query builder & migrations)     |
|  - PostgreSQL Relational Database (Strict referential integrity)|
+-----------------------------------------------------------------+
```

---

## 2. Authentication & Session Flow

1. **Credentials Validation**:
   - Client sends credentials (`email`, `password`) via secure form data to the `login` Server Action.
   - Server validates payload format with Zod (`loginSchema`).
2. **Password Verification**:
   - The user record is retrieved from PostgreSQL.
   - `bcryptjs.compare` checks the submitted plain password against the stored bcrypt hash (`$2a$12$...`).
3. **Session Issuance**:
   - A signed JWT token is constructed containing `{ id, email, name, role }`.
   - The token is placed into an `httpOnly`, `sameSite: lax`, `secure` cookie (`ums-session`) with a 24-hour expiration window.
4. **Role Routing**:
   - `ADMIN` &rarr; redirected to `/admin`
   - `FACULTY` &rarr; redirected to `/faculty`
   - `STUDENT` &rarr; redirected to `/student`
5. **Server-Side Guard**:
   - Dashboard layouts and server actions invoke `getSession()` and `requireRole(...)`. If unauthenticated or unauthorized, requests are immediately halted or redirected to `/login`.

---

## 3. Role-Based Access Control (RBAC) Matrix

| Module / Operation | Admin | Faculty | Student | Enforcement Mechanism |
|---|:---:|:---:|:---:|---|
| **System Dashboard** | Full | — | — | Server action + Layout guard |
| **Manage Students (CRUD)** | Full | — | — | `requireRole('ADMIN')` |
| **Manage Faculty (CRUD)** | Full | — | — | `requireRole('ADMIN')` |
| **Manage Departments (CRUD)** | Full | — | — | `requireRole('ADMIN')` |
| **Manage Courses (CRUD)** | Full | — | — | `requireRole('ADMIN')` |
| **Create Course Offerings** | Full | — | — | Unique constraint check |
| **Enroll / Unenroll Students**| Full | — | — | Capacity + Unique constraint |
| **Faculty Portal** | — | Full | — | Filtered by `faculty.userId` |
| **Enter / Edit Marks** | Full | Assigned | — | Server range check (0-40, 0-60) |
| **Publish / Unpublish Results**| Full | — | — | Admin only action |
| **View Published Results** | Full | Assigned | Self only | Query filtered by `isPublished: true` & `student.userId` |
| **Export Academic Reports** | Full | — | — | Server Actions + CSV generator |

---

## 4. Academic Grading Scale

The calculation engine automatically determines grade and grade points based on total marks (`internalMarks + externalMarks`):

| Total Marks Range | Letter Grade | Grade Points | Qualitative Description |
|:---:|:---:|:---:|:---|
| **90 – 100** | **O** | **10.0** | Outstanding |
| **80 – 89** | **A+** | **9.0** | Excellent |
| **70 – 79** | **A** | **8.0** | Very Good |
| **60 – 69** | **B+** | **7.0** | Good |
| **50 – 59** | **B** | **6.0** | Above Average |
| **40 – 49** | **C** | **5.0** | Pass |
| **0 – 39** | **F** | **0.0** | Fail |

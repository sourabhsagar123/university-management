# Entity-Relationship (ER) Diagram & Database Architecture

## 1. Conceptual Entity-Relationship Diagram

```mermaid
erDiagram
    USER ||--o| STUDENT : "has student profile"
    USER ||--o| FACULTY : "has faculty profile"
    DEPARTMENT ||--o{ STUDENT : "enrolls"
    DEPARTMENT ||--o{ FACULTY : "employs"
    DEPARTMENT ||--o{ COURSE : "offers"
    FACULTY ||--o{ COURSE_OFFERING : "teaches"
    COURSE ||--o{ COURSE_OFFERING : "scheduled as"
    STUDENT ||--o{ ENROLLMENT : "registers for"
    COURSE_OFFERING ||--o{ ENROLLMENT : "contains"
    ENROLLMENT ||--o| RESULT : "evaluated by"

    USER {
        string id PK
        string email UK
        string passwordHash
        string name
        enum role "ADMIN | FACULTY | STUDENT"
        enum status "ACTIVE | INACTIVE | SUSPENDED"
        datetime createdAt
        datetime updatedAt
    }

    DEPARTMENT {
        string id PK
        string code UK "CSE, EE, ME, etc."
        string name
        string description
        string headId
        enum status "ACTIVE | INACTIVE | SUSPENDED"
        datetime createdAt
        datetime updatedAt
    }

    STUDENT {
        string id PK
        string registrationNo UK "REG2024XXX"
        string userId FK, UK
        string departmentId FK
        string programme "B.Tech CSE"
        int currentSemester "1-8"
        int admissionYear
        string phone
        enum status "ACTIVE | INACTIVE | SUSPENDED"
        datetime createdAt
        datetime updatedAt
    }

    FACULTY {
        string id PK
        string employeeId UK "EMPXXX"
        string userId FK, UK
        string departmentId FK
        string designation "Professor, etc."
        string phone
        enum status "ACTIVE | INACTIVE | SUSPENDED"
        datetime createdAt
        datetime updatedAt
    }

    COURSE {
        string id PK
        string code UK "CS101, etc."
        string title
        int credits "1-6"
        string departmentId FK
        int semester "1-8"
        string description
        enum status "ACTIVE | INACTIVE | SUSPENDED"
        datetime createdAt
        datetime updatedAt
    }

    COURSE_OFFERING {
        string id PK
        string courseId FK
        string facultyId FK
        int academicYear "e.g. 2024"
        int semester "1-8"
        string section "A, B, C"
        int maxStudents "Capacity cap"
        enum status "ACTIVE | INACTIVE | SUSPENDED"
        datetime createdAt
        datetime updatedAt
    }

    ENROLLMENT {
        string id PK
        string studentId FK
        string courseOfferingId FK
        datetime enrollmentDate
        enum status "ACTIVE | INACTIVE | SUSPENDED"
        datetime createdAt
        datetime updatedAt
    }

    RESULT {
        string id PK
        string enrollmentId FK, UK
        float internalMarks "0.0 - 40.0"
        float externalMarks "0.0 - 60.0"
        float totalMarks "0.0 - 100.0"
        string grade "O, A+, A, B+, B, C, F"
        float gradePoints "0.0 - 10.0"
        boolean isPublished
        string remarks
        datetime createdAt
        datetime updatedAt
    }
```

---

## 2. Relational Schema & Constraints

### 1. `users` Table
- **Primary Key**: `id` (CUID text)
- **Unique Constraints**: `email`
- **Indexes**: `users_email_idx`, `users_role_idx`
- **Fields**: `id`, `email`, `passwordHash`, `role`, `name`, `status`, `createdAt`, `updatedAt`

### 2. `departments` Table
- **Primary Key**: `id` (CUID text)
- **Unique Constraints**: `code` (e.g. "CSE", "ECE")
- **Indexes**: `departments_code_idx`
- **Fields**: `id`, `code`, `name`, `description`, `headId`, `status`, `createdAt`, `updatedAt`

### 3. `students` Table
- **Primary Key**: `id` (CUID text)
- **Foreign Keys**: 
  - `userId` &rarr; `users.id` (ON DELETE CASCADE)
  - `departmentId` &rarr; `departments.id` (ON DELETE RESTRICT)
- **Unique Constraints**: `registrationNo`, `userId`
- **Indexes**: `students_registrationNo_idx`, `students_departmentId_idx`, `students_currentSemester_idx`

### 4. `faculty` Table
- **Primary Key**: `id` (CUID text)
- **Foreign Keys**:
  - `userId` &rarr; `users.id` (ON DELETE CASCADE)
  - `departmentId` &rarr; `departments.id` (ON DELETE RESTRICT)
- **Unique Constraints**: `employeeId`, `userId`
- **Indexes**: `faculty_employeeId_idx`, `faculty_departmentId_idx`

### 5. `courses` Table
- **Primary Key**: `id` (CUID text)
- **Foreign Keys**: `departmentId` &rarr; `departments.id` (ON DELETE RESTRICT)
- **Unique Constraints**: `code`
- **Indexes**: `courses_code_idx`, `courses_departmentId_idx`, `courses_semester_idx`

### 6. `course_offerings` Table
- **Primary Key**: `id` (CUID text)
- **Foreign Keys**:
  - `courseId` &rarr; `courses.id` (ON DELETE RESTRICT)
  - `facultyId` &rarr; `faculty.id` (ON DELETE RESTRICT)
- **Composite Unique Constraint**: `(courseId, academicYear, semester, section)`
- **Indexes**: `course_offerings_courseId_idx`, `course_offerings_facultyId_idx`, `course_offerings_academicYear_semester_idx`

### 7. `enrollments` Table (Resolves Many-to-Many between Student & CourseOffering)
- **Primary Key**: `id` (CUID text)
- **Foreign Keys**:
  - `studentId` &rarr; `students.id` (ON DELETE RESTRICT)
  - `courseOfferingId` &rarr; `course_offerings.id` (ON DELETE RESTRICT)
- **Composite Unique Constraint**: `(studentId, courseOfferingId)` &larr; **Guarantees no duplicate enrollments**
- **Indexes**: `enrollments_studentId_idx`, `enrollments_courseOfferingId_idx`

### 8. `results` Table
- **Primary Key**: `id` (CUID text)
- **Foreign Keys**: `enrollmentId` &rarr; `enrollments.id` (ON DELETE CASCADE)
- **Unique Constraints**: `enrollmentId` (One-to-One with Enrollment)
- **Indexes**: `results_enrollmentId_idx`, `results_isPublished_idx`

---

## 3. Database Normalization Analysis

### First Normal Form (1NF)
- All attributes contain only atomic (indivisible) values.
- No repeating groups or arrays stored in single columns.
- Each table has a defined Primary Key.

### Second Normal Form (2NF)
- The database is in 1NF.
- Every non-key attribute is fully functionally dependent on the primary key.
- Composite-keyed entities (such as `Enrollment`) have attributes that depend entirely on the primary identifier, with foreign keys linking to independent parent records.

### Third Normal Form (3NF)
- The database is in 2NF.
- There are no transitive dependencies: non-key attributes do not depend on other non-key attributes.
- Student department details (`Department`) are factored out of `Student` into `Department`.
- Course details are factored out into `Course`, and academic sessions are factored out into `CourseOffering`.
- User authentication details (`User`) are decoupled from domain entities (`Student`, `Faculty`), allowing single sign-on extensibility and zero redundancy.

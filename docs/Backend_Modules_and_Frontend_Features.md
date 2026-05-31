# EMS Backend Modules and Frontend Feature Overview

This document describes the backend modules available in the EMS backend and the corresponding frontend features that should be implemented to consume them effectively.

---

## 1. Authentication (`/auth`)

### Backend features
- `POST /auth/login`: user login with credentials.
- `POST /auth/register`: user creation by Admin only.
- `GET /auth/me`: fetch the authenticated user profile.
- `POST /auth/refresh-token`: refresh access and refresh tokens.
- `POST /auth/change-password`: password update for authenticated users.
- `POST /auth/logout`: log out the current user and clear auth cookies.

### Frontend features
- Login page
  - Email/username and password fields.
  - Error handling for invalid credentials.
  - Successful login stores tokens/cookies and redirects based on role.
- Admin registration/user creation page
  - Accessible only to Admin users.
  - Form fields for new user data and role selection.
- Profile page
  - Displays user information from `/auth/me`.
- Change password page
  - Current password, new password, confirm password.
  - Success confirmation and auto logout if required.
- Token refresh handling
  - Silent refresh mechanism using `/auth/refresh-token`.
  - Auto-refresh before access token expiry.
- Logout action
  - Clears cookies and redirects to login.

---

## 2. Employee Management (`/employees`)

### Backend features
- `GET /employees`: list all employees.
- `GET /employees/:id`: get employee details by ID.
- `POST /employees/create`: create a new employee.
- `PUT /employees/update/:id`: update an existing employee.
- `DELETE /employees/delete/:id`: delete an employee. (Note: the route has a missing leading slash in the current backend file, which should be `/delete/:id`.)

### Frontend features
- Employee list page
  - Table or cards with employee summary fields.
  - Search, filter, and pagination.
- Employee detail page
  - View full employee profile and job details.
- Create/Edit employee form
  - Fields for name, department, contact, role, status, and relevant metadata.
  - Validation and inline error display.
- Delete employee action
  - Confirmation dialog before deletion.

---

## 3. Department Management (`/departments`)

### Backend features
- `GET /departments`: fetch all departments.
- `POST /departments/create`: create a department.
- `PUT /departments/update/:id`: update department data.
- `DELETE /departments/delete/:id`: remove a department.

### Frontend features
- Department list page
  - Display departments and head count or status.
- Department detail/edit page
  - Manage department name, description, and metadata.
- Create department form
  - Add new department with required fields.
- Delete department action
  - Confirm before deletion.

---

## 4. User Management (`/users`)

### Backend features
- `GET /users`: list all user accounts.
- `GET /users/:id`: fetch user details.
- `PUT /users/update/:id`: update user data.
- `DELETE /users/delete/:id`: delete a user account.
- `POST /users/hr-profile/create`: create an HR profile for a user.

### Frontend features
- User list and admin dashboard
  - Show users, roles, and account statuses.
- User profile page
  - Display and edit profile information.
- HR profile creation page
  - Form to attach HR-specific data to a user.
- User account management

---

## 5. Leave Management (`/leaves`)

### Backend features
- `GET /leaves/me`: fetch current user leave requests.
- `POST /leaves`: apply for leave.
- `PUT /leaves/:id/cancel`: cancel an existing leave request.
- `GET /leaves`: list all leaves (authenticated users).
- `GET /leaves/:id`: fetch leave details (HR/Admin only).
- `PUT /leaves/:id/approve`: approve a leave request.
- `PUT /leaves/:id/reject`: reject a leave request.

### Frontend features
- My leave overview page
  - List leave requests with status and dates.
- Leave application form
  - Pick leave type, start/end dates, reason, and supporting info.
- Leave cancellation action
  - Cancel pending leave requests with confirmation.
- Leave approval dashboard
  - HR/Admin view of pending leave requests.
  - Approve/reject actions with comments.
- Leave details page
  - Show history and current status of a leave request.

---

## 6. Payslip Management (`/payslips`)

### Backend features
- `GET /payslips/me`: list authenticated user's payslips.
- `GET /payslips/me/:id`: fetch a single payslip for the user.
- `GET /payslips`: list all payslips.
- `POST /payslips`: generate a payslip (HR/Admin only).
- `GET /payslips/:id`: get a payslip by ID.
- `PATCH /payslips/:id/approve`: approve a payslip.
- `PATCH /payslips/:id/mark-paid`: mark a payslip as paid.

### Frontend features
- My payslips page
  - List payslips with download/view links.
- Payslip detail view
  - Show amount, period, status, and breakdown.
- Payslip generation form
  - HR/Admin interface to generate payslips.
- Payslip approval and payment workflow
  - Approve and mark paid from admin/hr panels.

---

## 7. Announcements (`/announcements`)

### Backend features
- `GET /announcements`: list all announcements.
- `POST /announcements`: create announcements (HR/Admin only).
- `GET /announcements/:id`: fetch announcement details.
- `PUT /announcements/:id`: update announcements (HR/Admin only).
- `DELETE /announcements/:id`: delete announcements (HR/Admin only).
- `PUT /announcements/:id/publish`: publish announcements (HR/Admin only).

### Frontend features
- Announcement feed/homepage widget
  - Display recent published announcements.
- Announcement detail page
  - Full content for each announcement.
- Announcement management panel
  - Create, edit, delete, and publish announcements.
- Announcement drafts and publish controls
  - Allow HR/Admin users to save draft content before publishing.

---

## 8. Holiday Management (`/holidays`)

### Backend features
- `POST /holidays`: create a holiday.
- `GET /holidays`: fetch all holidays.
- Note: auth middleware is currently not applied to holiday routes (TODO).

### Frontend features
- Holiday calendar view
  - Show holidays by date on a calendar.
- Holiday list page
  - Display upcoming and past holidays.
- Create holiday form
  - Add holiday name, date, description, and status.
- Holiday management dashboard
  - Manage holiday record.

---

## 9. Attendance (`/attendance`)

### Backend features
- Employee attendance actions
  - `POST /attendance/clock-in`: clock in for the authenticated employee.
  - `POST /attendance/clock-out`: clock out for the authenticated employee.
  - `GET /attendance/me`: view own attendance records.
- HR attendance management
  - `GET /attendance/details/:id`: get attendance details by record ID.
  - `GET /attendance`: list all attendance records.
  - `GET /attendance/:employeeId`: get attendance by employee.
  - `POST /attendance/hr/clock-in`: HR clock-in on behalf of an employee.
  - `POST /attendance/hr/clock-out`: HR clock-out on behalf of an employee.
  - `PUT /attendance/hr/:id/informed`: mark an attendance record as informed.
  - `PUT /attendance/hr/:id`: update a record.

### Frontend features
- Employee attendance dashboard
  - Show today’s clock-in/out status.
  - Clock in and clock out buttons.
- Attendance history page
  - Display personal attendance records and totals.
- HR attendance management page
  - View attendance records for all employees.
  - Search by employee and date range.
- HR attendance edit actions
  - Clock in/out on behalf of staff.
  - Update records and mark as informed.
- Attendance analytics widgets
  - Show daily attendance, late count, and missing clock-outs.

---

## 10. Suggested Frontend Role-Based Pages

### Employee dashboard
- My profile and user info.
- My leave requests and apply form.
- My attendance status and history.
- My payslips.
- Latest announcements and holidays.

### HR dashboard
- Leave approval queue and request details.
- Payslip generation and approval.
- Attendance management for employees.
- User and employee management.
- Announcements creation and publication.
- Holiday calendar and holiday creation.

### Admin dashboard
- Full user, employee, and department management.
- HR and leave approvals.
- System-wide reporting and settings.
- User registration, role assignment, and account lifecycle.

---

## Summary

This backend supports a complete EMS system with authentication, employee and department management, user and HR profile handling, leave workflows, payslip generation, announcements, holiday management, and attendance tracking. The frontend should provide role-specific dashboards and management interfaces to reflect these backend modules cleanly and securely.

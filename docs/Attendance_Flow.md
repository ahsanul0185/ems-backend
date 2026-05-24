All Attendance Cases & Full Flow
---

### Updated Enum (Final)

```prisma
enum AttendanceStatus {
  PRESENT    // Clocked in + clocked out
  ABSENT     // No show, no leave
  ON_LEAVE   // Approved leave covers the day
  INFORMED   // HR marked early departure
}
```

---

### Updated Schema

```prisma
model Attendance {
  id                  String           @id @default(uuid()) @db.Uuid
  employee_id         String           @db.Uuid
  date                DateTime         @db.Date
  clock_in_time       DateTime?
  clock_out_time      DateTime?
  status              AttendanceStatus
  late_minutes        Int              @default(0)
  early_leave_minutes Int              @default(0)
  work_minutes        Int              @default(0)
  notes               String?

  is_informed         Boolean          @default(false)
  informed_reason     String?
  informed_at         DateTime?
  informed_by         String?          @db.Uuid

  is_auto_clocked_out Boolean          @default(false)
  leave_request_id    String?          @db.Uuid

  created_at          DateTime         @default(now())
  updated_at          DateTime         @updatedAt

  // Relations
  employee        Employee      @relation(fields: [employee_id], references: [id])
  informed_by_emp Employee?     @relation("AttendanceInformedBy", fields: [informed_by], references: [id])
  leave_request   LeaveRequest? @relation(fields: [leave_request_id], references: [id])

  @@unique([employee_id, date])
  @@map("attendance")
}
```

---

### All Cases & Full Flow

---

#### CASE 1 — Normal Day

```
09:00 AM  Employee clicks clock-in
          → record created
          {
            clock_in_time: 09:00,
            status: PRESENT,
            late_minutes: 0
          }

05:00 PM  Employee clicks clock-out
          → record updated
          {
            clock_out_time: 17:00,
            work_minutes: 480,
            early_leave_minutes: 0
          }
```

---

#### CASE 2 — Employee Clocks In Late (The tricky case you asked about)

```
09:15 AM  Cron Job 1 fires
          Employee has no record yet
          No approved leave found
          → record created { status: ABSENT }
          
          (employee is on the way, cron doesn't know that)

09:18 AM  Employee arrives and clicks clock-in
          System finds today's record → status is ABSENT
                    │
                    ▼
          Is status ABSENT and is_auto_clocked_out = false?
          (meaning cron marked it, not a real confirmed absent)
                    │
                   YES
                    │
                    ▼
          ALLOW clock-in → update the existing record
          {
            clock_in_time: 09:18,
            status: PRESENT,        ← override ABSENT
            late_minutes: 18        ← still tracked via field
          }

05:00 PM  Employee clocks out normally
          {
            clock_out_time: 17:00,
            work_minutes: 461
          }
```

So the rule is:
- Cron-created `ABSENT` records are **soft** — overridable by a real clock-in
- `is_auto_clocked_out: false` is the flag that tells you the cron created it but it's not finalized
- After **Cron Job 2** fires at 5 PM and sets `is_auto_clocked_out: true`, the record becomes **locked**

---

#### CASE 3 — Cron Job 1 (09:15 AM)

```
Runs at 09:15 AM for all ACTIVE employees
          │
          ▼
For each employee:
          │
          ├── Record EXISTS for today?
          │         │
          │        YES → Skip entirely
          │
          └── NO record
                    │
                    ▼
            APPROVED leave exists where
            start_date <= today <= end_date?
                    │
                ┌───┴───┐
               YES       NO
                │         │
                ▼         ▼
            Create       Create
            {            {
              status:      status: ABSENT,
              ON_LEAVE,    is_auto_clocked_out: false
              leave_         ← soft absent, can be
              request_id     overridden by clock-in
            }            }
```

---

#### CASE 4 — Cron Job 2 (05:00 PM)

```
Runs at 05:00 PM (shift end)
          │
          ▼
Find all records where:
  date = today
  clock_in_time IS NOT NULL
  clock_out_time IS NULL
  is_informed = false
          │
          ▼
For each found record:
  {
    clock_out_time: 17:00,   ← system sets shift end
    status: ABSENT,          ← didn't check out = absent
    is_auto_clocked_out: true,
    work_minutes: calculated,
    notes: "Auto closed by system"
  }

Also find records where:
  date = today
  status = ABSENT
  is_auto_clocked_out = false
  clock_in_time IS NULL
          │
          ▼
These are confirmed absent now (no clock-in all day)
  {
    is_auto_clocked_out: true  ← lock it, finalize
  }
```

---

#### CASE 5 — HR Marks Informed

```
Employee clocked in at 09:00 AM → PRESENT record exists
Incident happens mid-day

HR opens attendance dashboard
HR clicks "Mark as Informed" on employee row
          │
          ▼
Modal → HR enters informed_reason
          │
          ▼
PATCH /api/attendance/:id/informed
          │
          ▼
System updates:
{
  is_informed: true,
  informed_reason: "Family emergency",
  informed_at: now(),
  informed_by: hr_employee_id,
  clock_out_time: now(),         ← forced right now
  status: INFORMED,
  early_leave_minutes: shiftEnd - now(),
  work_minutes: now() - clock_in_time
}

Later — employee tries to clock out:
          │
          ▼
System checks: is_informed = true?
          │
         YES
          │
          ▼
Block clock-out
→ "Your attendance has been marked 
   as informed by HR"
```

---

#### CASE 6 — Employee Never Clocks Out (no-show after clock-in)

```
Employee clocked in at 09:30 AM
Never clicks clock-out (phone died, forgot, left abruptly)

Cron Job 2 fires at 05:00 PM
Finds: clock_in exists, clock_out is NULL, is_informed = false
          │
          ▼
{
  clock_out_time: 17:00,
  status: ABSENT,
  is_auto_clocked_out: true,
  notes: "Auto closed — no clock-out detected"
}
```

---

#### CASE 7 — On Leave But Clocks In Anyway

```
Cron Job 1 marked employee ON_LEAVE at 09:15 AM

Employee shows up and clicks clock-in
          │
          ▼
Record exists with status ON_LEAVE
          │
          ▼
Block clock-in
→ "You have an approved leave for today.
   Contact HR if you are reporting to work."

HR can manually override via
PATCH /api/attendance/:id  →  { status: PRESENT }
and clear the leave_request_id if needed
```

---

### Record Lifecycle Summary

```
                    [09:15 AM - Cron 1]
                           │
              ┌────────────┴────────────┐
           ON_LEAVE                  ABSENT
         (locked, has               (soft, no
         leave_request_id)          clock_in yet)
                                       │
                                 Employee arrives?
                                  ┌────┴────┐
                                 YES        NO
                                  │          │
                               Override   [5PM Cron 2]
                               → PRESENT  locks it as
                               clock_in   confirmed ABSENT
                               recorded

[Clock-in exists, no clock-out]
           │
      [5PM Cron 2]
           │
       → ABSENT + is_auto_clocked_out: true

[HR marks informed]
           │
       → INFORMED + clock_out forced to informed_at
```

---
#### CASE 8 — HR Clocks In/Out On Behalf Of Employee

```
HR opens attendance dashboard
HR finds an employee who hasn't clocked in/out
          │
          ▼
POST /api/attendance/hr/clock-in
POST /api/attendance/hr/clock-out
Body:
{
  employee_id: "uuid",
  notes: "Employee was on field"  // optional
}
          │
          ▼
Runs the EXACT same service logic as:
  POST /api/attendance/clock-in
  POST /api/attendance/clock-out

Only differences:
  - employee_id comes from request BODY instead of JWT token
  - endpoint is protected by HR/ADMIN role guard
          │
          ▼
Same validations apply:
  clock-in  → no existing clock-in today? proceed
  clock-out → clock-in exists? not informed? proceed

Same calculations apply:
  late_minutes, early_leave_minutes,
  work_minutes, status — all recalculated
  exactly as employee would trigger them
```
#### CASE 9 — HR Updates Full Attendance Record

```
HR opens attendance dashboard
HR finds a record that needs full correction
HR clicks "Edit" on the record
          │
          ▼
PUT /api/attendance/hr/:id
Body:
{
  clock_in_time: "2026-05-24T09:00:00.000Z",
  clock_out_time: "2026-05-24T17:00:00.000Z",
  status: "PRESENT",
  notes: "Correction — system error on original record"
}
          │
          ▼
Validations:
  - is_informed = true? → block, INFORMED is final
  - clock_out_time must be > clock_in_time if both provided
  - status must be valid AttendanceStatus enum value
          │
          ▼
HR provides values directly — no recalculation,
HR owns the data fully on this endpoint:
{
  clock_in_time:       from body,
  clock_out_time:      from body,
  status:              from body,
  late_minutes:        recalculated from provided clock_in_time,
  early_leave_minutes: recalculated from provided clock_out_time,
  work_minutes:        recalculated from both times,
  notes:               from body
}
```

Based on your full plan, here are all the endpoints:

### Employee Endpoints
```
POST   /api/attendance/clock-in        # CASE 1, 2
POST   /api/attendance/clock-out       # CASE 1, 6
GET    /api/attendance/today           # own today's record
GET    /api/attendance/me              # own full history
```

### HR Endpoints
```
GET    /api/attendance                 # all employees attendance
GET    /api/attendance/:employeeId     # specific employee history
POST   /api/attendance/hr/clock-in     # CASE 8 — clock in on behalf
POST   /api/attendance/hr/clock-out    # CASE 8 — clock out on behalf
PATCH  /api/attendance/hr/:id/informed # CASE 5 — mark informed
PUT    /api/attendance/hr/:id          # CASE 9 — full record correction
```

### Internal (Cron Jobs — no HTTP, service layer only)
```
cronClockIn()   # CASE 3 — runs 09:15 AM
cronClockOut()  # CASE 4, 6 — runs 05:00 PM
```
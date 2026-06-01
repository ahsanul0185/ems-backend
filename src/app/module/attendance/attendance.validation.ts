import { z } from "zod";
import { AttendanceStatus } from "../../../generated/prisma/client";

// ── Helpers ────────────────────────────────────────────────────────────────────

const timeStringRegex = /^([01]\d|2[0-3]):([0-5]\d)(:([0-5]\d))?$/;

const timeStringSchema = z.string().regex(timeStringRegex, "Invalid time format. Expected HH:mm or HH:mm:ss").optional();

// ── Schemas ────────────────────────────────────────────────────────────────────

const clockInSchema = z.object({
    notes: z.string().optional(),
    employee_id: z.string().uuid().optional(), // Used by HR
    date: z.string().optional(),               // "YYYY-MM-DD" — used by HR for backdated clock-in
    time: z.string().optional(),               // ISO datetime or "HH:mm" — used by HR for custom clock-in time
});

const clockOutSchema = z.object({
    notes: z.string().optional(),
    employee_id: z.string().uuid().optional(), // Used by HR
    date: z.string().optional(),               // "YYYY-MM-DD" — used by HR for backdated clock-out
    time: z.string().optional(),               // ISO datetime or "HH:mm" — used by HR for custom clock-out time
});

const markInformedSchema = z.object({
    informed_reason: z.string("Reason is required when marking as informed"),
});

const updateRecordSchema = z.object({
    clock_in_time: timeStringSchema,
    clock_out_time: timeStringSchema,
    status: z.nativeEnum(AttendanceStatus),
    notes: z.string().optional(),
}).refine(data => {
    if (data.clock_in_time && data.clock_out_time) {
        return data.clock_out_time > data.clock_in_time;
    }
    return true;
}, {
    message: "clock_out_time must be after clock_in_time",
    path: ["clock_out_time"],
});

export const attendanceValidation = {
    clockInSchema,
    clockOutSchema,
    markInformedSchema,
    updateRecordSchema,
};

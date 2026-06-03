"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.attendanceValidation = void 0;
const zod_1 = require("zod");
const client_1 = require("../../../generated/prisma/client");
// ── Helpers ────────────────────────────────────────────────────────────────────
const timeStringRegex = /^([01]\d|2[0-3]):([0-5]\d)(:([0-5]\d))?$/;
const timeStringSchema = zod_1.z.string().regex(timeStringRegex, "Invalid time format. Expected HH:mm or HH:mm:ss").optional();
// ── Schemas ────────────────────────────────────────────────────────────────────
const clockInSchema = zod_1.z.object({
    notes: zod_1.z.string().optional(),
    employee_id: zod_1.z.string().uuid().optional(), // Used by HR
    date: zod_1.z.string().optional(), // "YYYY-MM-DD" — used by HR for backdated clock-in
    time: zod_1.z.string().optional(), // ISO datetime or "HH:mm" — used by HR for custom clock-in time
});
const clockOutSchema = zod_1.z.object({
    notes: zod_1.z.string().optional(),
    employee_id: zod_1.z.string().uuid().optional(), // Used by HR
    date: zod_1.z.string().optional(), // "YYYY-MM-DD" — used by HR for backdated clock-out
    time: zod_1.z.string().optional(), // ISO datetime or "HH:mm" — used by HR for custom clock-out time
});
const markInformedSchema = zod_1.z.object({
    informed_reason: zod_1.z.string("Reason is required when marking as informed"),
});
const updateRecordSchema = zod_1.z.object({
    clock_in_time: timeStringSchema,
    clock_out_time: timeStringSchema,
    status: zod_1.z.nativeEnum(client_1.AttendanceStatus),
    notes: zod_1.z.string().optional(),
}).refine(data => {
    if (data.clock_in_time && data.clock_out_time) {
        return data.clock_out_time > data.clock_in_time;
    }
    return true;
}, {
    message: "clock_out_time must be after clock_in_time",
    path: ["clock_out_time"],
});
exports.attendanceValidation = {
    clockInSchema,
    clockOutSchema,
    markInformedSchema,
    updateRecordSchema,
};

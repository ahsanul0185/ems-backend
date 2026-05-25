import { z } from "zod";
import { AttendanceStatus } from "../../../generated/prisma/client";
const clockInSchema = z.object({
    notes: z.string().optional(),
    employee_id: z.string().uuid().optional(), // Used by HR
});
const clockOutSchema = z.object({
    notes: z.string().optional(),
    employee_id: z.string().uuid().optional(), // Used by HR
});
const markInformedSchema = z.object({
    informed_reason: z.string("Reason is required when marking as informed"),
});
const updateRecordSchema = z.object({
    clock_in_time: z.string().datetime().optional(),
    clock_out_time: z.string().datetime().optional(),
    status: z.nativeEnum(AttendanceStatus),
    notes: z.string().optional(),
}).refine(data => {
    if (data.clock_in_time && data.clock_out_time) {
        return new Date(data.clock_out_time) > new Date(data.clock_in_time);
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

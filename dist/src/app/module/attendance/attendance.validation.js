"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.attendanceValidation = void 0;
const zod_1 = require("zod");
const client_1 = require("../../../generated/prisma/client");
const clockInSchema = zod_1.z.object({
    notes: zod_1.z.string().optional(),
    employee_id: zod_1.z.string().uuid().optional(), // Used by HR
});
const clockOutSchema = zod_1.z.object({
    notes: zod_1.z.string().optional(),
    employee_id: zod_1.z.string().uuid().optional(), // Used by HR
});
const markInformedSchema = zod_1.z.object({
    informed_reason: zod_1.z.string("Reason is required when marking as informed"),
});
const updateRecordSchema = zod_1.z.object({
    clock_in_time: zod_1.z.string().datetime().optional(),
    clock_out_time: zod_1.z.string().datetime().optional(),
    status: zod_1.z.nativeEnum(client_1.AttendanceStatus),
    notes: zod_1.z.string().optional(),
}).refine(data => {
    if (data.clock_in_time && data.clock_out_time) {
        return new Date(data.clock_out_time) > new Date(data.clock_in_time);
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

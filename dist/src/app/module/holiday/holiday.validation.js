"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.holidayValidation = void 0;
const zod_1 = require("zod");
const createHolidaySchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string("Holiday name is required"),
        description: zod_1.z.string().optional(),
        date: zod_1.z.string().optional(),
        from: zod_1.z.string().optional(),
        to: zod_1.z.string().optional(),
    }).refine((data) => data.date || (data.from && data.to), {
        message: "Either single 'date' or both 'from' and 'to' must be provided",
        path: ["date"],
    })
});
exports.holidayValidation = {
    createHolidaySchema,
};

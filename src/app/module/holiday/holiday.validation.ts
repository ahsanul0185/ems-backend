import { z } from "zod";

const createHolidaySchema = z.object({
    body: z.object({
        name: z.string("Holiday name is required"),
        description: z.string().optional(),
        date: z.string().optional(),
        from: z.string().optional(),
        to: z.string().optional(),
    }).refine((data) => data.date || (data.from && data.to), {
        message: "Either single 'date' or both 'from' and 'to' must be provided",
        path: ["date"],
    })
});

export const holidayValidation = {
    createHolidaySchema,
};

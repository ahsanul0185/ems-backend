import z from "zod";

export const createDepartmentZodSchema = z.object({
    name: z.string("Department name is required"),
    description: z.string().optional(),
    is_active: z.boolean().optional(),
});

export const updateDepartmentZodSchema = z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    is_active: z.boolean().optional(),
});
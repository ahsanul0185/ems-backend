import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
const createHoliday = async (payload, hrProfileId) => {
    if (!hrProfileId) {
        throw new AppError(status.BAD_REQUEST, "created_by (HR Profile ID) is required");
    }
    const { name, description, date, from, to } = payload;
    const datesToCreate = [];
    if (date) {
        datesToCreate.push(new Date(date));
    }
    else if (from && to) {
        let currentDate = new Date(from);
        const endDate = new Date(to);
        while (currentDate <= endDate) {
            datesToCreate.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
        }
    }
    if (datesToCreate.length === 0) {
        throw new AppError(status.BAD_REQUEST, "Invalid date parameters");
    }
    // Check for existing holidays
    const existingHolidays = await prisma.holiday.findMany({
        where: {
            date: {
                in: datesToCreate,
            },
        },
    });
    if (existingHolidays.length > 0) {
        const takenDates = existingHolidays.map(h => h.date.toISOString().split('T')[0]).join(", ");
        throw new AppError(status.CONFLICT, `Holidays already exist for dates: ${takenDates}`);
    }
    // Create holidays
    const holidaysData = datesToCreate.map(d => ({
        name,
        description,
        date: d,
        created_by: hrProfileId,
    }));
    const result = await prisma.holiday.createMany({
        data: holidaysData,
    });
    return {
        count: result.count,
    };
};
const getAllHolidays = async () => {
    const holidays = await prisma.holiday.findMany({
        orderBy: {
            date: 'asc'
        }
    });
    return holidays;
};
export const holidayService = {
    createHoliday,
    getAllHolidays,
};

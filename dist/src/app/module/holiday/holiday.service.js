"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.holidayService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const prisma_1 = require("../../lib/prisma");
const createHoliday = async (payload, hrProfileId) => {
    if (!hrProfileId) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "created_by (HR Profile ID) is required");
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
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Invalid date parameters");
    }
    // Check for existing holidays
    const existingHolidays = await prisma_1.prisma.holiday.findMany({
        where: {
            date: {
                in: datesToCreate,
            },
        },
    });
    if (existingHolidays.length > 0) {
        const takenDates = existingHolidays.map(h => h.date.toISOString().split('T')[0]).join(", ");
        throw new AppError_1.default(http_status_1.default.CONFLICT, `Holidays already exist for dates: ${takenDates}`);
    }
    // Create holidays
    const holidaysData = datesToCreate.map(d => ({
        name,
        description,
        date: d,
        created_by: hrProfileId,
    }));
    const result = await prisma_1.prisma.holiday.createMany({
        data: holidaysData,
    });
    return {
        count: result.count,
    };
};
const getAllHolidays = async () => {
    const holidays = await prisma_1.prisma.holiday.findMany({
        orderBy: {
            date: 'asc'
        }
    });
    return holidays;
};
exports.holidayService = {
    createHoliday,
    getAllHolidays,
};

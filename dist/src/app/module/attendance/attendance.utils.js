"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isWeekend = exports.getExpectedShiftTimes = exports.parseTimeString = exports.calculateEarlyLeaveMinutes = exports.calculateLateMinutes = exports.calculateWorkMinutes = exports.getStartOfDayUTC = void 0;
const env_1 = require("../../config/env");
/**
 * Returns a Date at midnight UTC for the given date's UTC calendar date.
 * Uses UTC getters so the result is correct regardless of server timezone.
 */
const getStartOfDayUTC = (d = new Date()) => {
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
};
exports.getStartOfDayUTC = getStartOfDayUTC;
const calculateWorkMinutes = (clockIn, clockOut) => {
    const diff = clockOut.getTime() - clockIn.getTime();
    return Math.floor(diff / (1000 * 60)); // convert ms to minutes
};
exports.calculateWorkMinutes = calculateWorkMinutes;
const calculateLateMinutes = (clockIn, expectedClockIn) => {
    if (clockIn > expectedClockIn) {
        const diff = clockIn.getTime() - expectedClockIn.getTime();
        return Math.floor(diff / (1000 * 60));
    }
    return 0;
};
exports.calculateLateMinutes = calculateLateMinutes;
const calculateEarlyLeaveMinutes = (clockOut, expectedClockOut) => {
    if (clockOut < expectedClockOut) {
        const diff = expectedClockOut.getTime() - clockOut.getTime();
        return Math.floor(diff / (1000 * 60));
    }
    return 0;
};
exports.calculateEarlyLeaveMinutes = calculateEarlyLeaveMinutes;
/**
 * Parses a time string into a UTC Date using the provided base date.
 * Supports both ISO datetime strings and "HH:mm" / "HH:mm:ss" time-only strings.
 */
const parseTimeString = (baseDate, timeStr) => {
    if (timeStr.includes("T")) {
        // Already an ISO datetime string
        const parsed = new Date(timeStr);
        if (isNaN(parsed.getTime())) {
            throw new Error(`Invalid datetime string: ${timeStr}`);
        }
        return parsed;
    }
    // timeStr is "HH:mm" or "HH:mm:ss"
    const datePart = (0, exports.getStartOfDayUTC)(baseDate).toISOString().split("T")[0];
    const isoString = `${datePart}T${timeStr}:00.000Z`;
    const parsed = new Date(isoString);
    if (isNaN(parsed.getTime())) {
        throw new Error(`Invalid time string: ${timeStr}`);
    }
    return parsed;
};
exports.parseTimeString = parseTimeString;
const getExpectedShiftTimes = (date) => {
    // Trim to guard against accidental whitespace in .env values (e.g. "09:00  ")
    const [startHourRaw, startMinuteRaw] = env_1.env.SHIFT_START_TIME.trim().split(":").map(Number);
    const [endHourRaw, endMinuteRaw] = env_1.env.SHIFT_END_TIME.trim().split(":").map(Number);
    // Guard against NaN (Number("bad") produces NaN, which ?? does not catch)
    const startHour = Number.isNaN(startHourRaw) ? 9 : startHourRaw;
    const startMinute = Number.isNaN(startMinuteRaw) ? 0 : startMinuteRaw;
    const endHour = Number.isNaN(endHourRaw) ? 17 : endHourRaw;
    const endMinute = Number.isNaN(endMinuteRaw) ? 0 : endMinuteRaw;
    // date is stored as midnight UTC — use setUTCHours so shift times are
    // applied in UTC, not the server's local timezone.
    const expectedClockIn = new Date(date);
    expectedClockIn.setUTCHours(startHour, startMinute, 0, 0);
    const expectedClockOut = new Date(date);
    expectedClockOut.setUTCHours(endHour, endMinute, 0, 0);
    return { expectedClockIn, expectedClockOut };
};
exports.getExpectedShiftTimes = getExpectedShiftTimes;
const isWeekend = (date) => {
    // 5 = Friday per project requirements
    // Use getUTCDay because dates are stored as midnight UTC.
    return date.getUTCDay() === 5;
};
exports.isWeekend = isWeekend;

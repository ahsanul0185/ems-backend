"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isWeekend = exports.getExpectedShiftTimes = exports.calculateEarlyLeaveMinutes = exports.calculateLateMinutes = exports.calculateWorkMinutes = void 0;
const env_1 = require("../../config/env");
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
const getExpectedShiftTimes = (date) => {
    // Fetch from env config. Format should be "HH:mm" (e.g. "09:00", "17:00")
    const [startHour, startMinute] = env_1.env.SHIFT_START_TIME.split(":").map(Number);
    const [endHour, endMinute] = env_1.env.SHIFT_END_TIME.split(":").map(Number);
    const expectedClockIn = new Date(date);
    expectedClockIn.setHours(startHour || 9, startMinute || 0, 0, 0);
    const expectedClockOut = new Date(date);
    expectedClockOut.setHours(endHour || 17, endMinute || 0, 0, 0);
    return { expectedClockIn, expectedClockOut };
};
exports.getExpectedShiftTimes = getExpectedShiftTimes;
const isWeekend = (date) => {
    // 5 = Friday, 6 = Saturday (if Middle East weekend) or 0 = Sunday, 6 = Saturday.
    // The requirement specified: "cron jobs dont run in friday, also clock in clock out has all logic like someone can't clock in out in holiday or friday."
    return date.getDay() === 5; // Friday
};
exports.isWeekend = isWeekend;

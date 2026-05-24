import { env } from "../../config/env";

export const calculateWorkMinutes = (clockIn: Date, clockOut: Date): number => {
    const diff = clockOut.getTime() - clockIn.getTime();
    return Math.floor(diff / (1000 * 60)); // convert ms to minutes
};

export const calculateLateMinutes = (clockIn: Date, expectedClockIn: Date): number => {
    if (clockIn > expectedClockIn) {
        const diff = clockIn.getTime() - expectedClockIn.getTime();
        return Math.floor(diff / (1000 * 60));
    }
    return 0;
};

export const calculateEarlyLeaveMinutes = (clockOut: Date, expectedClockOut: Date): number => {
    if (clockOut < expectedClockOut) {
        const diff = expectedClockOut.getTime() - clockOut.getTime();
        return Math.floor(diff / (1000 * 60));
    }
    return 0;
};

export const getExpectedShiftTimes = (date: Date) => {
    // Fetch from env config. Format should be "HH:mm" (e.g. "09:00", "17:00")
    const [startHour, startMinute] = env.SHIFT_START_TIME.split(":").map(Number);
    const [endHour, endMinute] = env.SHIFT_END_TIME.split(":").map(Number);

    const expectedClockIn = new Date(date);
    expectedClockIn.setHours(startHour || 9, startMinute || 0, 0, 0);

    const expectedClockOut = new Date(date);
    expectedClockOut.setHours(endHour || 17, endMinute || 0, 0, 0);

    return { expectedClockIn, expectedClockOut };
};

export const isWeekend = (date: Date): boolean => {
    // 5 = Friday, 6 = Saturday (if Middle East weekend) or 0 = Sunday, 6 = Saturday.
    // The requirement specified: "cron jobs dont run in friday, also clock in clock out has all logic like someone can't clock in out in holiday or friday."
    return date.getDay() === 5; // Friday
};

import { prisma } from "../../lib/prisma";
import { AttendanceStatus, LeaveRequestStatus, PayslipStatus } from "../../../generated/prisma/enums";
import { IAdminDashboardData, IHrDashboardData, IEmployeeDashboardData } from "./dashboard.interface";

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const PIE_COLORS: Record<string, string> = {
    "Present": "#22c55e",
    "Absent": "#ef4444",
    "On Leave": "#3b82f6",
    "Informed": "#f59e0b",
};

const getStartOfDayUTC = (date: Date): Date => {
    const d = new Date(date);
    d.setUTCHours(0, 0, 0, 0);
    return d;
};

const getStartOfMonthUTC = (date: Date): Date => {
    const d = new Date(date);
    d.setUTCDate(1);
    d.setUTCHours(0, 0, 0, 0);
    return d;
};

const formatTime = (date: Date | null): string => {
    if (!date) return "—";
    const h = date.getUTCHours();
    const m = date.getUTCMinutes();
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
};

const formatMinutes = (mins: number): string => {
    if (mins <= 0) return "0 min";
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h > 0 && m > 0) return `${h}h ${m}m`;
    if (h > 0) return `${h}h`;
    return `${m} min`;
};

const buildDashboardData = async (): Promise<IAdminDashboardData> => {
    const now = new Date();
    const todayStart = getStartOfDayUTC(now);
    const currentYear = now.getUTCFullYear();
    const currentMonth = now.getUTCMonth();

    // ── KPI: Today Present ──
    const todayPresentCount = await prisma.attendance.count({
        where: {
            date: todayStart,
            status: AttendanceStatus.PRESENT,
        },
    });

    // ── KPI: Absent Today ──
    const todayAbsentCount = await prisma.attendance.count({
        where: {
            date: todayStart,
            status: AttendanceStatus.ABSENT,
        },
    });

    // ── KPI: Employee On Leave ──
    const todayOnLeaveCount = await prisma.attendance.count({
        where: {
            date: todayStart,
            status: AttendanceStatus.ON_LEAVE,
        },
    });

    // ── KPI: Pending Leave Requests ──
    const pendingLeaveRequestsCount = await prisma.leaveRequest.count({
        where: {
            status: LeaveRequestStatus.PENDING,
        },
    });

    const kpiData = [
        {
            title: "Today Present",
            value: todayPresentCount,
            description: "Employees checked in today",
        },
        {
            title: "Absent Today",
            value: todayAbsentCount,
            description: "Employees absent without notice",
        },
        {
            title: "Employee On Leave",
            value: todayOnLeaveCount,
            description: "Approved leave requests",
        },
        {
            title: "Pending Leave Requests",
            value: pendingLeaveRequestsCount,
            description: "Awaiting approval",
        },
    ];

    // ── Total Payslips (monthly total paid for current year) ──
    const payslips = await prisma.payslip.findMany({
        where: {
            pay_period_year: currentYear,
            status: {
                in: [PayslipStatus.APPROVED, PayslipStatus.PAID],
            },
        },
        select: {
            pay_period_month: true,
            net_salary: true,
        },
    });

    const monthlyTotals = Array(12).fill(0);
    for (const p of payslips) {
        const monthIndex = p.pay_period_month - 1;
        if (monthIndex >= 0 && monthIndex < 12) {
            monthlyTotals[monthIndex] += p.net_salary;
        }
    }

    const monthlyPayslips = MONTH_NAMES.map((month, index) => ({
        month,
        totalPaid: monthlyTotals[index],
    }));

    // ── Today's Employee Summary ──
    const todayInformedCount = await prisma.attendance.count({
        where: {
            date: todayStart,
            status: AttendanceStatus.INFORMED,
        },
    });

    const todayEmployeeSummary = [
        { status: "Present", count: todayPresentCount, color: PIE_COLORS["Present"] },
        { status: "Absent", count: todayAbsentCount, color: PIE_COLORS["Absent"] },
        { status: "On Leave", count: todayOnLeaveCount, color: PIE_COLORS["On Leave"] },
        { status: "Informed", count: todayInformedCount, color: PIE_COLORS["Informed"] },
    ];

    // ── Monthly Attendance (current month, day 01–30/31) ──
    const daysInMonth = new Date(Date.UTC(currentYear, currentMonth + 1, 0)).getUTCDate();
    const monthStart = getStartOfMonthUTC(now);
    const monthEnd = new Date(Date.UTC(currentYear, currentMonth + 1, 0, 23, 59, 59, 999));

    const attendanceRecords = await prisma.attendance.findMany({
        where: {
            date: {
                gte: monthStart,
                lte: monthEnd,
            },
        },
        select: {
            date: true,
            status: true,
        },
    });

    const dailyMap = new Map<string, { present: number; absent: number }>();
    for (let day = 1; day <= daysInMonth; day++) {
        const dayStr = day.toString().padStart(2, "0");
        dailyMap.set(dayStr, { present: 0, absent: 0 });
    }

    for (const record of attendanceRecords) {
        const day = record.date.getUTCDate().toString().padStart(2, "0");
        const entry = dailyMap.get(day);
        if (entry) {
            if (record.status === AttendanceStatus.PRESENT) {
                entry.present += 1;
            } else if (record.status === AttendanceStatus.ABSENT) {
                entry.absent += 1;
            }
        }
    }

    const monthlyAttendance = Array.from(dailyMap.entries()).map(([day, counts]) => ({
        day,
        present: counts.present,
        absent: counts.absent,
    }));

    return {
        kpiData,
        monthlyPayslips,
        todayEmployeeSummary,
        monthlyAttendance,
    };
};

const getAdminDashboardData = async (): Promise<IAdminDashboardData> => {
    return buildDashboardData();
};

const getHrDashboardData = async (): Promise<IHrDashboardData> => {
    return buildDashboardData();
};

const getEmployeeDashboardData = async (employeeId: string): Promise<IEmployeeDashboardData> => {
    const now = new Date();
    const todayStart = getStartOfDayUTC(now);
    const currentYear = now.getUTCFullYear();
    const currentMonth = now.getUTCMonth();

    // ── Month boundaries ──
    const daysInMonth = new Date(Date.UTC(currentYear, currentMonth + 1, 0)).getUTCDate();
    const monthStart = getStartOfMonthUTC(now);
    const monthEnd = new Date(Date.UTC(currentYear, currentMonth + 1, 0, 23, 59, 59, 999));

    // ── Today's attendance ──
    const todayAttendance = await prisma.attendance.findFirst({
        where: {
            employee_id: employeeId,
            date: todayStart,
        },
        select: {
            clock_in_time: true,
            clock_out_time: true,
            status: true,
        },
    });

    // ── Monthly attendance stats ──
    const monthlyAttendances = await prisma.attendance.findMany({
        where: {
            employee_id: employeeId,
            date: {
                gte: monthStart,
                lte: monthEnd,
            },
        },
        select: {
            date: true,
            status: true,
            work_minutes: true,
            late_minutes: true,
        },
    });

    const presentDays = monthlyAttendances.filter(
        (a) => a.status === AttendanceStatus.PRESENT
    ).length;

    const absentDays = monthlyAttendances.filter(
        (a) => a.status === AttendanceStatus.ABSENT
    ).length;

    // ── Build KPI data ──
    const kpiData = [
        {
            title: "Present This Month",
            value: `${presentDays}`,
            description: "Total present days this month",
        },
        {
            title: "Absent This Month",
            value: `${absentDays}`,
            description: "Total absent days this month",
        },
        {
            title: "Clock In Time",
            value: formatTime(todayAttendance?.clock_in_time ?? null),
            description: "Today's check-in time",
        },
        {
            title: "Clock Out Time",
            value: formatTime(todayAttendance?.clock_out_time ?? null),
            description: "Today's check-out time",
        },
    ];

    // ── Monthly working hours chart data ──
    const dailyMap = new Map<string, number>();
    for (let day = 1; day <= daysInMonth; day++) {
        const dayStr = day.toString().padStart(2, "0");
        dailyMap.set(dayStr, 0);
    }

    for (const record of monthlyAttendances) {
        const day = record.date.getUTCDate().toString().padStart(2, "0");
        const hours = record.work_minutes > 0 ? record.work_minutes / 60 : 0;
        dailyMap.set(day, Number(hours.toFixed(2)));
    }

    const monthlyWorkingHours = Array.from(dailyMap.entries()).map(([day, workingHours]) => ({
        day,
        workingHours,
    }));

    return {
        kpiData,
        monthlyWorkingHours,
    };
};

export const dashboardService = {
    getAdminDashboardData,
    getHrDashboardData,
    getEmployeeDashboardData,
};

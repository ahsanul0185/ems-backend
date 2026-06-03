export interface IMonthlyPayslipData {
    month: string;
    totalPaid: number;
}

export interface ITodayEmployeeSummary {
    status: string;
    count: number;
    color: string;
}

export interface IDailyAttendanceData {
    day: string;
    present: number;
    absent: number;
}

export interface IKpiData {
    title: string;
    value: number;
    description: string;
}

export interface IAdminDashboardData {
    kpiData: IKpiData[];
    monthlyPayslips: IMonthlyPayslipData[];
    todayEmployeeSummary: ITodayEmployeeSummary[];
    monthlyAttendance: IDailyAttendanceData[];
}

export type IHrDashboardData = IAdminDashboardData;

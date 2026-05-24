export interface ICreateHolidayPayload {
    name: string;
    description?: string;
    date?: string; // YYYY-MM-DD
    from?: string; // YYYY-MM-DD
    to?: string;   // YYYY-MM-DD
}

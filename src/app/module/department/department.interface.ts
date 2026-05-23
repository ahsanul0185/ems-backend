
export interface ICreateDepartmentPayload {
    name: string;
    description?: string;
    is_active?: boolean;
}

export interface IGetAllDepartmentsResult {
    departments: any[]; // Replace any with proper Department type if available
}

export interface IUpdateDepartmentPayload {
    name?: string;
    description?: string;
    is_active?: boolean;
}
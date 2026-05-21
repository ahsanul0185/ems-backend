import { UserRole } from "../../../generated/prisma/enums";


export interface ICreateUserPayload {
    email: string;
    password: string;
    role : UserRole   
}


export interface ILoginUserPayload {
    email: string;
    password: string;
}


export interface IRegisterUserPayload {
    email: string;
    role: UserRole;
}

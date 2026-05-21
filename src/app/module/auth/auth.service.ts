import { ILoginUserPayload, IRegisterUserPayload } from "./auth.interface";

const createUser = async (payload: IRegisterUserPayload) => {
    const { email, role } = payload;

    return {}
}

const loginUser = async (payload: ILoginUserPayload) => {
    const { email, password } = payload;

   
    return {};
}

const getMe = async () => { 
    
    return {};
}


const changePassword = async () => {

    return {
       
    }
}

const verifyEmail = async () => {
    return {};
}


const logoutUser = async () => {
   
    return {};
}


export const authService = {
    createUser,
    loginUser,
    getMe,
    changePassword,
    verifyEmail,
    logoutUser,
};
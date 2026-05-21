import { Response } from "express";
import { JwtPayload, SignOptions } from "jsonwebtoken";
import { env } from "../config/env";
import { CookieUtils } from "./cookie";
import { jwtUtils } from "./jwt";


//Creating access token
const getAccessToken = (payload: JwtPayload) => {
    const accessToken = jwtUtils.createToken(
        payload,
        env.ACCESS_TOKEN_SECRET,
        { expiresIn: env.ACCESS_TOKEN_EXPIRES_IN } as SignOptions
    );

    return accessToken;
}

const getRefreshToken = (payload: JwtPayload) => {
    const refreshToken = jwtUtils.createToken(
        payload,
        env.REFRESH_TOKEN_SECRET,
        { expiresIn: env.REFRESH_TOKEN_EXPIRES_IN } as SignOptions
    );
    return refreshToken;
}


const setAccessTokenCookie = (res: Response, token: string) => {
    CookieUtils.setCookie(res, 'accessToken', token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: '/',
        //1 day
        maxAge: 60 * 60 * 24 * 1000,
    });
}

const setRefreshTokenCookie = (res: Response, token: string) => {
    CookieUtils.setCookie(res, 'refreshToken', token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: '/',
        //7d
        maxAge: 60 * 60 * 24 * 1000 * 7,
    });
}



export const tokenUtils = {
    getAccessToken,
    getRefreshToken,
    setAccessTokenCookie,
    setRefreshTokenCookie,
}
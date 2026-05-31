"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokenUtils = void 0;
const env_1 = require("../config/env");
const cookie_1 = require("./cookie");
const jwt_1 = require("./jwt");
//Creating access token
const getAccessToken = (payload) => {
    const accessToken = jwt_1.jwtUtils.createToken(payload, env_1.env.ACCESS_TOKEN_SECRET, { expiresIn: env_1.env.ACCESS_TOKEN_EXPIRES_IN });
    return accessToken;
};
const getRefreshToken = (payload) => {
    const refreshToken = jwt_1.jwtUtils.createToken(payload, env_1.env.REFRESH_TOKEN_SECRET, { expiresIn: env_1.env.REFRESH_TOKEN_EXPIRES_IN });
    return refreshToken;
};
const setAccessTokenCookie = (res, token) => {
    cookie_1.CookieUtils.setCookie(res, 'accessToken', token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: '/',
        //1 day
        maxAge: 60 * 60 * 24 * 1000,
    });
};
const setRefreshTokenCookie = (res, token) => {
    cookie_1.CookieUtils.setCookie(res, 'refreshToken', token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: '/',
        //7d
        maxAge: 60 * 60 * 24 * 1000 * 7,
    });
};
exports.tokenUtils = {
    getAccessToken,
    getRefreshToken,
    setAccessTokenCookie,
    setRefreshTokenCookie,
};

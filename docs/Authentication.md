# Backend Authentication Flow

This document explains how authentication works in this backend, including access token and refresh token handling, session storage, and protected routes.

## Overview

The backend uses JSON Web Tokens (JWTs) for authentication. It issues two tokens on login:

- `accessToken`: short-lived token used to authorize API requests.
- `refreshToken`: longer-lived token used to obtain new access tokens when the access token expires.

Both tokens are stored in HTTP cookies and also returned in the login response body.

## Relevant Files

- `src/app/module/auth/auth.route.ts`
- `src/app/module/auth/auth.controller.ts`
- `src/app/module/auth/auth.service.ts`
- `src/app/utils/token.ts`
- `src/app/utils/jwt.ts`
- `src/app/middleware/checkAuth.ts`

## API Endpoints

### `POST /auth/login`

Used to authenticate an existing user.

Request body:
- `email`: string
- `password`: string

Behavior:
1. Validates credentials.
2. Generates a JWT payload:
   - `userId`
   - `email`
   - `role`
3. Creates `accessToken` and `refreshToken`.
4. Stores an HTTP-only `accessToken` cookie and an HTTP-only `refreshToken` cookie.
5. Saves a hashed refresh token in the `session` table.
6. Returns:
   - `user`
   - `accessToken`
   - `refreshToken`

### `POST /auth/refresh-token`

Used to refresh tokens when the access token is expired or about to expire.

Behavior:
1. Reads `refreshToken` from `req.cookies.refreshToken`.
2. Verifies the refresh token using `REFRESH_TOKEN_SECRET`.
3. Looks up active user sessions in the database.
4. Compares the provided refresh token with stored hashed refresh tokens.
5. If matched and still valid, generates:
   - a new `accessToken`
   - a new `refreshToken`
6. Updates the session record with the new hashed refresh token and expiration.
7. Returns new token values and refreshes cookies.

### `POST /auth/logout`

Logs the user out.

Behavior:
1. Reads `refreshToken` from `req.cookies.refreshToken`.
2. Verifies it and finds the matching session.
3. Deletes the session from the database.
4. Clears `accessToken` and `refreshToken` cookies.

### `GET /auth/me`

Returns the authenticated user profile.

Behavior:
1. Requires a valid access token.
2. Extracts the token from either:
   - cookie `accessToken`
   - `Authorization: Bearer <token>` header
3. Verifies the access token using `ACCESS_TOKEN_SECRET`.
4. Loads user data from the database.

### `POST /auth/change-password`

Allows an authenticated user to change their password.

Behavior:
1. Requires a valid access token.
2. Validates `oldPassword` and `newPassword`.
3. Checks current password.
4. Updates the user password.
5. Deletes all sessions for that user.
6. Clears `accessToken` and `refreshToken` cookies.

### `POST /auth/register`

Allows an admin user to create a new user.

Behavior:
1. Protected by role-based middleware: only `ADMIN` users can call it.
2. Validates and creates a new user record.
3. Does not automatically log in the new user.

## Token Creation

### `src/app/utils/token.ts`

- `getAccessToken(payload)` uses `ACCESS_TOKEN_SECRET` and `ACCESS_TOKEN_EXPIRES_IN`.
- `getRefreshToken(payload)` uses `REFRESH_TOKEN_SECRET` and `REFRESH_TOKEN_EXPIRES_IN`.
- `setAccessTokenCookie(res, token)` stores the token with:
  - `httpOnly: true`
  - `secure: true`
  - `sameSite: 'none'`
  - `path: '/'`
  - `maxAge`: 1 day
- `setRefreshTokenCookie(res, token)` stores the token with:
  - `httpOnly: true`
  - `secure: true`
  - `sameSite: 'none'`
  - `path: '/'`
  - `maxAge`: 7 days

## JWT Utility

### `src/app/utils/jwt.ts`

- `createToken(payload, secret, { expiresIn })` signs a JWT.
- `verifyToken(token, secret)` verifies a token and returns:
  - `success: true, data` when valid
  - `success: false, message, error` when invalid or expired
- `decodeToken(token)` decodes without verifying.

## Session Storage and Refresh Security

When a user logs in:
- The refresh token is hashed using bcrypt before storage.
- The backend creates a `session` record with:
  - `user_id`
  - `refresh_token` (hashed)
  - `expires_at`

When refreshing a token:
- The incoming refresh token is verified with JWT.
- The backend searches sessions for the user.
- Then compares the raw refresh token to each stored hashed value.
- If found and not expired, the session is updated with a new hashed refresh token.

This prevents raw refresh tokens from being stored in the database.

## Access Token Verification Middleware

### `src/app/middleware/checkAuth.ts`

This middleware:
1. Reads the access token from a cookie or Authorization header.
2. Verifies it with `ACCESS_TOKEN_SECRET`.
3. Loads the user from the database.
4. Verifies the user is not deleted or inactive.
5. Stores `req.user` with:
   - `userId`
   - `role`
   - `email`
   - `employeeId`
   - `hrProfileId`
6. Optionally enforces role-based access.

## Env Variables Used

- `ACCESS_TOKEN_SECRET`
- `ACCESS_TOKEN_EXPIRES_IN`
- `REFRESH_TOKEN_SECRET`
- `REFRESH_TOKEN_EXPIRES_IN`

## Security Notes

- `accessToken` is short-lived and used for protecting each request.
- `refreshToken` is longer-lived and used only when the access token cannot be trusted anymore.
- Refresh tokens are stored in a hashed form in the `session` table.
- `checkAuth` rejects requests with invalid or expired access tokens.
- `logout` invalidates a refresh token session, preventing reuse.
- `change-password` removes all active sessions after password update.

## Sequence Diagrams

### Login

1. `POST /auth/login`
2. Backend validates user credentials.
3. Backend issues `accessToken` and `refreshToken`.
4. Backend saves hashed refresh token in `session`.
5. Backend sets HTTP-only cookies and returns tokens in response.

### API Request

1. Client sends request with `accessToken` cookie or header.
2. `checkAuth` verifies the access token.
3. If valid, request continues.

### Refresh Token Flow

1. Client calls `POST /auth/refresh-token`.
2. Backend reads `refreshToken` cookie.
3. Backend verifies the refresh token JWT.
4. Backend validates the session and expiry.
5. Backend issues a new `accessToken` and `refreshToken`.
6. Backend updates the session with a new hashed refresh token.

### Logout

1. Client calls `POST /auth/logout`.
2. Backend reads `refreshToken` cookie.
3. Backend deletes matching session.
4. Backend clears both auth cookies.

## Summary

The backend implements a standard JWT auth pattern with refresh token rotation and server-side session validation. Access tokens protect individual requests, while refresh tokens are used to obtain new access tokens and are stored safely in hashed form.

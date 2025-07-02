// src/services/createDefaultAuthService.ts

import { createAuthService } from "./auth";
import { WrappedHttp } from "../types";

export const createDefaultAuthService = (http: WrappedHttp) =>
    createAuthService(http, {
        login: {
            method: "post",
            endpoint: "/auth/login",
            requestType: {} as { username: string; password: string },
            responseType: {} as {
                accessToken: string;
                refreshToken: string;
            },
        },
        loginWithOtp: {
            method: "post",
            endpoint: "/auth/otp-login",
            requestType: {} as { phone: string; otp: string },
            responseType: {} as { accessToken: string; refreshToken: string },
        },
        verify2fa: {
            method: "post",
            endpoint: "/auth/verify-2fa",
            requestType: {} as { code: string },
            responseType: {} as { verified: boolean },
        },
        refresh: {
            method: "post",
            endpoint: "/auth/refresh",
            responseType: {} as { accessToken: string },
        },
        logout: {
            method: "post",
            endpoint: "/auth/logout",
            responseType: {} as { message: string },
        },
    });

// src/services/createDefaultAuthService.ts

import { createAuthService } from "./auth";
import type { LoginResponse, WrappedHttp } from "../types";

interface DefaultAuthOptions {
  features?: {
    loginVia?: "email" | "username" | "both";
    enable2FA?: boolean;
  };
}

export const createDefaultAuthService = (
  http: WrappedHttp,
  options?: DefaultAuthOptions
) => {
  const { features } = options ?? {};

  const loginRequestType =
    features?.loginVia === "email"
      ? { email: "", password: "" }
      : features?.loginVia === "username"
      ? { username: "", password: "" }
      : { email: "", username: "", password: "" };

  return createAuthService(http, {
    login: {
      method: "post",
      endpoint: "/auth/login",
      requestType: loginRequestType,
      responseType: {} as LoginResponse,
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
};


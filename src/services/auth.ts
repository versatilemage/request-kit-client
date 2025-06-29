// src/services/auth.ts

import { WrappedHttp } from "../types";
import { LoginRequest, LoginResponse, ApiRoutes } from "../types";

// internal/configurable version
export const createAuthService = (
  http: WrappedHttp,
  routes: ApiRoutes["auth"]
) => ({
  login: (data: LoginRequest) => http.post<LoginResponse>(routes!.login!, data),
  logout: () => http.post(routes!.logout!),
  refresh: () => http.post(routes!.refresh!),
});

// default export with built-in route config
export const createDefaultAuthService = (http: WrappedHttp) =>
  createAuthService(http, {
    login: "/auth/login",
    logout: "/auth/logout",
    refresh: "/auth/refresh",
  });

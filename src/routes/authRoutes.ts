// src/routes/authRoutes.ts
import type { ApiRoutes } from "../types";

export const defaultAuthRoutes: ApiRoutes["auth"] = {
  login: "/auth/login",
  logout: "/auth/logout",
  refresh: "/auth/refresh",
};

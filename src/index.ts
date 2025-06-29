import { createHttpClient } from "./http/client";
import { createWrappedHttpClient } from "./http/wrappedHttpClient";
import { createAuthService } from "./services/auth";
import { createUserService } from "./services/user";
import { defaultAuthRoutes } from "./routes/authRoutes";
import { defaultUserRoutes } from "./routes/userRoutes";

import type {
  ApiRoutes,
  LoginRequest,
  LoginResponse,
  UserProfile,
  NormalizedError,
  WrappedHttp,
} from "./types";

export interface CreateApiClientConfig {
  baseUrl: string;
  getToken?: () => string | null;
  routeOverrides?: Partial<ApiRoutes>;
  onUnauthorized?: (status: number) => void;
}

export const createApiClient = ({
  baseUrl,
  getToken,
  routeOverrides,
}: CreateApiClientConfig) => {
  const axiosInstance = createHttpClient(baseUrl, getToken);
  const wrappedHttp = createWrappedHttpClient(axiosInstance);

  const routes: ApiRoutes = {
    auth: { ...defaultAuthRoutes, ...routeOverrides?.auth },
    user: { ...defaultUserRoutes, ...routeOverrides?.user },
  };

  return {
    auth: createAuthService(wrappedHttp, routes.auth),
    user: createUserService(wrappedHttp, routes.user),
    http: wrappedHttp, // optional: helpful for custom service or fallback calls
  };
};

// Re-exports
export { createCustomService } from "./services/createCustomService";
export type {
  ApiRoutes,
  LoginRequest,
  LoginResponse,
  UserProfile,
  NormalizedError,
  WrappedHttp,
};

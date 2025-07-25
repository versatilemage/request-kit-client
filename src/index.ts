import { createHttpClient } from "./http/client";
import { createWrappedHttpClient } from "./http/wrappedHttpClient";

import { createAuthService } from "./services/auth";
import { createDefaultAuthService } from "./services/createDefaultAuthService";

import { createUserService } from "./services/user";
import { createDefaultUserService } from "./services/createDefaultUserService";

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

  // 🆕 Optional: Disable internal service creation
  disable?: {
    auth?: boolean;
    user?: boolean;
  };

  // 🆕 Optional: Enable/alter internal service behavior
  features?: {
    loginVia?: "email" | "username" | "both";
    enable2FA?: boolean;
    useRefreshTokenFlow?: boolean;
    useDefaultInterceptors?: boolean;
  };

  // 🆕 Optional global headers or error hook
  headers?: Record<string, string>;
  onError?: (err: unknown) => void;
}

export const createApiClient = ({
  baseUrl,
  getToken,
  routeOverrides,
  disable,
  features,
  headers,
  onUnauthorized,
  onError,
}: CreateApiClientConfig) => {
  const axiosInstance = createHttpClient(baseUrl, getToken);
  const wrappedHttp = createWrappedHttpClient(axiosInstance, {
    onUnauthorized,
    headers,
    onError,
  });

  return {
    auth: disable?.auth
      ? undefined
      : routeOverrides?.auth
      ? createAuthService(wrappedHttp, routeOverrides.auth)
      : createDefaultAuthService(wrappedHttp, {
          features,
        }),

    user: disable?.user
      ? undefined
      : routeOverrides?.user
      ? createUserService(wrappedHttp, routeOverrides.user)
      : createDefaultUserService(wrappedHttp),

    http: wrappedHttp,
  };
};

export { createCustomService } from "./services/createCustomService";
export { createDefaultAuthService } from "./services/createDefaultAuthService";

export type {
  ApiRoutes,
  LoginRequest,
  LoginResponse,
  UserProfile,
  NormalizedError,
  WrappedHttp,
};

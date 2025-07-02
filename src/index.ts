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
}

export const createApiClient = ({
  baseUrl,
  getToken,
  routeOverrides,
}: CreateApiClientConfig) => {
  const axiosInstance = createHttpClient(baseUrl, getToken);
  const wrappedHttp = createWrappedHttpClient(axiosInstance);

  return {
    auth: routeOverrides?.auth
      ? createAuthService(wrappedHttp, routeOverrides.auth)
      : createDefaultAuthService(wrappedHttp),

    user: routeOverrides?.user
      ? createUserService(wrappedHttp, routeOverrides.user)
      : createDefaultUserService(wrappedHttp),

    http: wrappedHttp,
  };
};

export { createCustomService } from "./services/createCustomService";
export type {
  ApiRoutes,
  LoginRequest,
  LoginResponse,
  UserProfile,
  NormalizedError,
  WrappedHttp,
};

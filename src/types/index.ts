// src/types/index.ts

import { AuthServiceDefinition } from "../services/auth";
import { UserServiceDefinition } from "../services/user";

export interface LoginRequest {
  email: string;
  password: string;
}

export type HttpMethod = "get" | "post" | "put" | "delete";

export type EndpointResolver =
  | string
  | ((...args: any[]) => string);

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
}

export interface NormalizedError {
  message: string;
  statusCode?: number;
  isNetworkError?: boolean;
  raw?: unknown;
}

// Routes can be overridden during client creation
export interface ApiRoutes {
  auth?: AuthServiceDefinition;
  user?: UserServiceDefinition;
}

export interface WrappedHttp {
  get: <T>(
    url: string,
    options?: { cacheTTL?: number }
  ) => Promise<{ data: T | null; error: NormalizedError | null }>;

  post: <T>(
    url: string,
    body?: unknown,
    options?: { headers?: Record<string, string> }
  ) => Promise<{ data: T | null; error: NormalizedError | null }>;

  put: <T>(
    url: string,
    body?: unknown,
    options?: { headers?: Record<string, string> }
  ) => Promise<{ data: T | null; error: NormalizedError | null }>;

  delete: <T>(
    url: string,
    body?: unknown,
    options?: { headers?: Record<string, string> }
  ) => Promise<{ data: T | null; error: NormalizedError | null }>;
}

export type HandleErrorOptions = {
  onUnauthorized?: (status: number) => void;
  onError?: (err: unknown) => void;
  headers?: Record<string, string>;
};

export interface CustomServiceDefinition {
  [key: string]: {
    method: HttpMethod;
    endpoint: EndpointResolver;
  };
}

export type AuthService = ReturnType<typeof import("../services/auth").createAuthService>;


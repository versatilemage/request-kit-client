// src/types/index.ts

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
  auth?: {
    login?: string;
    logout?: string;
    refresh?: string;
  };
  user?: {
    profile?: string;
    update?: string;
  };
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
    options?: { headers?: Record<string, string> }
  ) => Promise<{ data: T | null; error: NormalizedError | null }>;
}

export type HandleErrorOptions = {
  onUnauthorized?: (status: number) => void;
};

export interface CustomServiceDefinition {
  [key: string]: {
    method: HttpMethod;
    endpoint: EndpointResolver;
  };
}

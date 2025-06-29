// src/http/wrappedHttpClient.ts

import { AxiosInstance } from "axios";
import { handleApiError } from "../utils/handleApiError";
import { getFromCache, setCache } from "../utils/cache";
import { HandleErrorOptions, NormalizedError, WrappedHttp } from "../types";

const buildHeaders = (
  body: unknown,
  headers: Record<string, string> = {}
): Record<string, string> => {
  const isFormData =
    typeof FormData !== "undefined" && body instanceof FormData;
  if (!isFormData && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }
  return headers;
};

export const wrapHttp = (
  http: AxiosInstance,
  options?: HandleErrorOptions
): WrappedHttp => ({
  get: async <T>(url: string, opt?: { cacheTTL?: number }) => {
    if (opt?.cacheTTL) {
      const cached = getFromCache<T>(url);
      if (cached) return { data: cached, error: null };
    }

    try {
      const res = await http.get<T>(url);
      if (opt?.cacheTTL) setCache(url, res.data, opt.cacheTTL);
      return { data: res.data, error: null };
    } catch (err) {
      return { data: null, error: handleApiError(err, options) };
    }
  },

  post: async <T>(
    url: string,
    body?: unknown,
    opt?: { headers?: Record<string, string> }
  ) => {
    try {
      const headers = buildHeaders(body, opt?.headers);
      const res = await http.post<T>(url, body, { headers });
      return { data: res.data, error: null };
    } catch (err) {
      return { data: null, error: handleApiError(err, options) };
    }
  },

  put: async <T>(
    url: string,
    body?: unknown,
    opt?: { headers?: Record<string, string> }
  ) => {
    try {
      const headers = buildHeaders(body, opt?.headers);
      const res = await http.put<T>(url, body, { headers });
      return { data: res.data, error: null };
    } catch (err) {
      return { data: null, error: handleApiError(err, options) };
    }
  },

  delete: async <T>(
    url: string,
    opt?: { headers?: Record<string, string> }
  ) => {
    try {
      const res = await http.delete<T>(url, { headers: opt?.headers });
      return { data: res.data, error: null };
    } catch (err) {
      return { data: null, error: handleApiError(err, options) };
    }
  },
});

export const createWrappedHttpClient = (
  axios: AxiosInstance,
  options?: HandleErrorOptions
) => wrapHttp(axios, options);

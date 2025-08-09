// src/http/wrappedHttpClient.ts

import { AxiosInstance } from "axios";
import { handleApiError } from "../utils/handleApiError";
import { getFromCache, setCache } from "../utils/cache";
import { HandleErrorOptions, NormalizedError, WrappedHttp } from "../types";

const buildHeaders = (
  body: unknown,
  localHeaders: Record<string, string> = {},
  globalHeaders: Record<string, string> = {}
): Record<string, string> => {
  const isFormData =
    typeof FormData !== "undefined" && body instanceof FormData;

  const combined = { ...globalHeaders, ...localHeaders };

  if (!isFormData && !combined["Content-Type"]) {
    combined["Content-Type"] = "application/json";
  }

  return combined;
};


export const wrapHttp = (
  http: AxiosInstance,
  options?: HandleErrorOptions
): WrappedHttp => {
  const globalHeaders = options?.headers ?? {};
  const onError = options?.onError;

  return {
    get: async <T>(url: string, opt?: { cacheTTL?: number }) => {
      if (opt?.cacheTTL) {
        const cached = getFromCache<T>(url);
        if (cached) return { data: cached, error: null };
      }

      try {
        const res = await http.get<T>(url, { headers: globalHeaders });
        if (opt?.cacheTTL) setCache(url, res.data, opt.cacheTTL);
        return { data: res.data, error: null };
      } catch (err) {
        onError?.(err);
        return { data: null, error: handleApiError(err, options) };
      }
    },

    post: async <T>(
      url: string,
      body?: unknown,
      opt?: { headers?: Record<string, string> }
    ) => {
      try {
        const headers = buildHeaders(body, opt?.headers, globalHeaders);
        const res = await http.post<T>(url, body, { headers });
        return { data: res.data, error: null };
      } catch (err) {
        onError?.(err);
        return { data: null, error: handleApiError(err, options) };
      }
    },

    put: async <T>(
      url: string,
      body?: unknown,
      opt?: { headers?: Record<string, string> }
    ) => {
      try {
        const headers = buildHeaders(body, opt?.headers, globalHeaders);
        const res = await http.put<T>(url, body, { headers });
        return { data: res.data, error: null };
      } catch (err) {
        onError?.(err);
        return { data: null, error: handleApiError(err, options) };
      }
    },

    delete: async <T>(
      url: string,
      body?: unknown,
      opt?: { headers?: Record<string, string> }
    ) => {
      try {
        const headers = buildHeaders(body, opt?.headers, globalHeaders);
        const res = await http.delete<T>(url, { data: body, headers });
        return { data: res.data, error: null };
      } catch (err) {
        onError?.(err);
        return { data: null, error: handleApiError(err, options) };
      }
    },
  };
};


export const createWrappedHttpClient = (
  axios: AxiosInstance,
  options?: HandleErrorOptions
) => wrapHttp(axios, options);

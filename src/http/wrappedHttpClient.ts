// src/http/wrappedHttpClient.ts

import { AxiosInstance } from "axios";
import { handleApiError } from "../utils/handleApiError";
import { getFromCache, setCache, buildCacheKey } from "../utils/cache";
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

/**
 * Filters out null and undefined values from params object
 */
const filterParams = (
  params?: Record<string, string | number | boolean | null | undefined>
): Record<string, string | number | boolean> | undefined => {
  if (!params) return undefined;
  
  const filtered: Record<string, string | number | boolean> = {};
  Object.entries(params).forEach(([key, value]) => {
    if (value != null) {
      filtered[key] = value;
    }
  });
  
  return Object.keys(filtered).length > 0 ? filtered : undefined;
};


export const wrapHttp = (
  http: AxiosInstance,
  options?: HandleErrorOptions
): WrappedHttp => {
  const globalHeaders = options?.headers ?? {};
  const onError = options?.onError;

  return {
    get: async <T>(
      url: string,
      opt?: {
        cacheTTL?: number;
        params?: Record<string, string | number | boolean | null | undefined>;
        headers?: Record<string, string>;
      }
    ) => {
      const cacheKey = buildCacheKey(url, opt?.params);
      
      if (opt?.cacheTTL) {
        const cached = getFromCache<T>(cacheKey);
        if (cached) return { data: cached, error: null };
      }

      try {
        const filteredParams = filterParams(opt?.params);
        const res = await http.get<T>(url, {
          headers: { ...globalHeaders, ...opt?.headers },
          params: filteredParams,
        });
        if (opt?.cacheTTL) setCache(cacheKey, res.data, opt.cacheTTL);
        return { data: res.data, error: null };
      } catch (err) {
        onError?.(err);
        return { data: null, error: handleApiError(err, options) };
      }
    },

    post: async <T>(
      url: string,
      body?: unknown,
      opt?: {
        headers?: Record<string, string>;
        params?: Record<string, string | number | boolean | null | undefined>;
      }
    ) => {
      try {
        const headers = buildHeaders(body, opt?.headers, globalHeaders);
        const filteredParams = filterParams(opt?.params);
        const res = await http.post<T>(url, body, {
          headers,
          params: filteredParams,
        });
        return { data: res.data, error: null };
      } catch (err) {
        onError?.(err);
        return { data: null, error: handleApiError(err, options) };
      }
    },

    put: async <T>(
      url: string,
      body?: unknown,
      opt?: {
        headers?: Record<string, string>;
        params?: Record<string, string | number | boolean | null | undefined>;
      }
    ) => {
      try {
        const headers = buildHeaders(body, opt?.headers, globalHeaders);
        const filteredParams = filterParams(opt?.params);
        const res = await http.put<T>(url, body, {
          headers,
          params: filteredParams,
        });
        return { data: res.data, error: null };
      } catch (err) {
        onError?.(err);
        return { data: null, error: handleApiError(err, options) };
      }
    },

    delete: async <T>(
      url: string,
      body?: unknown,
      opt?: {
        headers?: Record<string, string>;
        params?: Record<string, string | number | boolean | null | undefined>;
      }
    ) => {
      try {
        const headers = buildHeaders(body, opt?.headers, globalHeaders);
        const filteredParams = filterParams(opt?.params);
        const res = await http.delete<T>(url, {
          data: body,
          headers,
          params: filteredParams,
        });
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

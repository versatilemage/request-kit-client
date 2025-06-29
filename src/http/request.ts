import type { AxiosInstance, Method } from "axios";
import { handleApiError } from "../utils/handleApiError";
import type { NormalizedError } from "../types";

interface AxiosRequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, any>;
  signal?: AbortSignal;
  cacheTTL?: number; // reserved for future support
}

export const createRequest = (axios: AxiosInstance) => {
  return async <T>(
    url: string,
    method: Method,
    body?: any,
    options: AxiosRequestOptions = {}
  ): Promise<{ data: T | null; error: NormalizedError | null }> => {
    try {
      const response = await axios.request<T>({
        url,
        method,
        data: body,
        headers: options.headers,
        params: options.params,
        signal: options.signal,
      });

      return { data: response.data, error: null };
    } catch (err: any) {
      return { data: null, error: handleApiError(err) };
    }
  };
};

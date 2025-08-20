// src/http/fetchHttp.ts
import { NormalizedError, WrappedHttp } from "../types";

function isFormData(v: unknown): v is FormData {
  return typeof FormData !== "undefined" && v instanceof FormData;
}

function normalizeError(err: unknown, res?: Response): NormalizedError {
  if (res) {
    return {
      message: `HTTP ${res.status} ${res.statusText}`,
      statusCode: res.status,
      raw: err,
    };
  }
  if (err instanceof Error) {
    return { message: err.message, isNetworkError: true, raw: err };
  }
  return { message: "Unknown error", raw: err };
}

async function parseResponse<T>(res: Response): Promise<T | null> {
  const ctype = res.headers.get("content-type") || "";
  if (ctype.includes("application/json")) {
    try {
      return (await res.json()) as T;
    } catch {
      return null;
    }
  }
  // fallback: text → try to parse JSON, else return null
  try {
    const text = await res.text();
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

async function doFetch<T>(
  method: "GET" | "POST" | "PUT" | "DELETE",
  url: string,
  body?: unknown,
  options?: { headers?: Record<string, string> }
): Promise<{ data: T | null; error: NormalizedError | null }> {
  const headers: Record<string, string> = { ...(options?.headers ?? {}) };

  let payload: BodyInit | undefined = undefined;

  if (method !== "GET") {
    if (isFormData(body)) {
      // CRITICAL: do NOT set Content-Type for FormData (boundary must be auto)
      payload = body as FormData;
    } else if (body instanceof Blob) {
      payload = body as Blob;
      if (!headers["Content-Type"]) headers["Content-Type"] = body.type || "application/octet-stream";
    } else if (typeof body === "string") {
      payload = body;
      if (!headers["Content-Type"]) headers["Content-Type"] = "text/plain";
    } else if (body !== undefined && body !== null) {
      payload = JSON.stringify(body);
      if (!headers["Content-Type"]) headers["Content-Type"] = "application/json";
    }
  }

  try {
    const res = await fetch(url, { method, headers, body: payload });

    const data = await parseResponse<T>(res);

    if (!res.ok) {
      return { data, error: normalizeError(data ?? await res.text().catch(() => null), res) };
    }

    return { data, error: null };
  } catch (err) {
    return { data: null, error: normalizeError(err) };
  }
}

export const fetchHttp: WrappedHttp = {
  get: <T>(url: string /*, options?: { cacheTTL?: number }*/) => {
    // cacheTTL can be handled by your own layer if desired
    return doFetch<T>("GET", url);
  },

  post: <T>(url: string, body?: unknown, options?: { headers?: Record<string, string> }) => {
    return doFetch<T>("POST", url, body, options);
  },

  put:  <T>(url: string, body?: unknown, options?: { headers?: Record<string, string> }) => {
    return doFetch<T>("PUT", url, body, options);
  },

  delete: <T>(url: string, body?: unknown, options?: { headers?: Record<string, string> }) => {
    return doFetch<T>("DELETE", url, body, options);
  },
};

// src/utils/cache.ts

type CacheValue = {
  data: any;
  expiresAt: number;
};

const cache = new Map<string, CacheValue>();

/**
 * Builds a cache key from URL and query params
 */
export const buildCacheKey = (
  url: string,
  params?: Record<string, string | number | boolean | null | undefined>
): string => {
  if (!params || Object.keys(params).length === 0) {
    return url;
  }

  // Sort params for consistent cache keys
  const sortedParams = Object.keys(params)
    .sort()
    .filter((key) => params[key] != null)
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(String(params[key]))}`)
    .join("&");

  return `${url}?${sortedParams}`;
};

export const getFromCache = <T>(key: string): T | null => {
  const cached = cache.get(key);
  if (!cached) return null;

  if (Date.now() > cached.expiresAt) {
    cache.delete(key);
    return null;
  }

  return cached.data as T;
};

export const setCache = (key: string, data: any, ttl: number = 60 * 1000): void => {
  cache.set(key, {
    data,
    expiresAt: Date.now() + ttl,
  });
};

export const clearCache = (key: string): void => {
  cache.delete(key);
};

export const clearAllCache = (): void => {
  cache.clear();
};

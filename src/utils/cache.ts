// src/utils/cache.ts

type CacheValue = {
  data: any;
  expiresAt: number;
};

const cache = new Map<string, CacheValue>();

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

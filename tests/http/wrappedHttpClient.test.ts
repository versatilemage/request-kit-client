// tests/http/wrappedHttpClient.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ✅ MUST come before importing axios
vi.mock('axios', async () => {
  const actual: typeof import('axios') = await vi.importActual('axios');

  const mockInstance = {
    get: vi.fn(() => Promise.resolve({ data: 'mock-get' })),
    post: vi.fn(() => Promise.resolve({ data: 'mock-post' })),
    put: vi.fn(() => Promise.resolve({ data: 'mock-put' })),
    delete: vi.fn(() => Promise.resolve({ data: 'mock-delete' })),
  };

  return {
    ...actual,
    default: {
      ...actual.default,
      create: vi.fn(() => mockInstance),
    },
  };
});

import axios from 'axios';
import { createWrappedHttpClient } from '../../src/http/wrappedHttpClient';
import { handleApiError } from '../../src/utils/handleApiError';

vi.mock('../../src/utils/handleApiError', () => ({
  handleApiError: vi.fn((err) => ({ message: 'Handled Error', statusCode: 403, raw: err }))
}));

describe('wrappedHttpClient', () => {
  let client: ReturnType<typeof createWrappedHttpClient>;

  beforeEach(() => {
    const instance = axios.create();
    client = createWrappedHttpClient(instance, {
      onUnauthorized: vi.fn()
    });
  });

  it('should call GET and return mock data', async () => {
    const result = await client.get<string>('/test');
    expect(result.data).toBe('mock-get');
    expect(result.error).toBeNull();
  });

  it('should call POST and return mock data', async () => {
    const result = await client.post<string>('/test', { foo: 'bar' });
    expect(result.data).toBe('mock-post');
    expect(result.error).toBeNull();
  });

  it('should call PUT and return mock data', async () => {
    const result = await client.put<string>('/test', { foo: 'bar' });
    expect(result.data).toBe('mock-put');
    expect(result.error).toBeNull();
  });

  it('should call DELETE and return mock data', async () => {
    const result = await client.delete<string>('/test');
    expect(result.data).toBe('mock-delete');
    expect(result.error).toBeNull();
  });

  it('should call handleApiError on GET failure', async () => {
    const instance = axios.create();
    const mockedGet = vi.fn(() => Promise.reject(new Error('GET failed')));
    (instance as any).get = mockedGet;

    const errorClient = createWrappedHttpClient(instance, {
      onUnauthorized: vi.fn()
    });
    const result = await errorClient.get('/fail');
    expect(handleApiError).toHaveBeenCalled();
    expect(result.data).toBeNull();
    expect(result.error?.message).toBe('Handled Error');
    expect(result.error?.statusCode).toBe(403);
  });

  it('should merge headers correctly for POST', async () => {
    const instance = axios.create();
    const mockPost = vi.fn((_url, _body, config) => {
      expect(config.headers['Content-Type']).toBe('application/json');
      expect(config.headers['x-test-header']).toBe('test-value');
      return Promise.resolve({ data: 'header-post' });
    });
    (instance as any).post = mockPost;

    const clientWithHeaders = createWrappedHttpClient(instance);
    const result = await clientWithHeaders.post<string>('/test', { hello: 'world' }, {
      headers: { 'x-test-header': 'test-value' },
    });

    expect(result.data).toBe('header-post');
    expect(result.error).toBeNull();
  });

  describe('query parameters', () => {
    it('should pass query params to GET request', async () => {
      const instance = axios.create();
      const mockGet = vi.fn((_url, config) => {
        expect(config.params).toEqual({ page: 1, limit: 10 });
        return Promise.resolve({ data: 'get-with-params' });
      });
      (instance as any).get = mockGet;

      const client = createWrappedHttpClient(instance);
      const result = await client.get<string>('/test', {
        params: { page: 1, limit: 10 },
      });

      expect(mockGet).toHaveBeenCalledWith('/test', expect.objectContaining({
        params: { page: 1, limit: 10 },
      }));
      expect(result.data).toBe('get-with-params');
      expect(result.error).toBeNull();
    });

    it('should pass query params to POST request', async () => {
      const instance = axios.create();
      const mockPost = vi.fn((_url, _body, config) => {
        expect(config.params).toEqual({ filter: 'active' });
        return Promise.resolve({ data: 'post-with-params' });
      });
      (instance as any).post = mockPost;

      const client = createWrappedHttpClient(instance);
      const result = await client.post<string>('/test', { name: 'test' }, {
        params: { filter: 'active' },
      });

      expect(mockPost).toHaveBeenCalledWith(
        '/test',
        { name: 'test' },
        expect.objectContaining({
          params: { filter: 'active' },
        })
      );
      expect(result.data).toBe('post-with-params');
      expect(result.error).toBeNull();
    });

    it('should pass query params to PUT request', async () => {
      const instance = axios.create();
      const mockPut = vi.fn((_url, _body, config) => {
        expect(config.params).toEqual({ version: 2 });
        return Promise.resolve({ data: 'put-with-params' });
      });
      (instance as any).put = mockPut;

      const client = createWrappedHttpClient(instance);
      const result = await client.put<string>('/test', { name: 'updated' }, {
        params: { version: 2 },
      });

      expect(mockPut).toHaveBeenCalledWith(
        '/test',
        { name: 'updated' },
        expect.objectContaining({
          params: { version: 2 },
        })
      );
      expect(result.data).toBe('put-with-params');
      expect(result.error).toBeNull();
    });

    it('should pass query params to DELETE request', async () => {
      const instance = axios.create();
      const mockDelete = vi.fn((_url, config) => {
        expect(config.params).toEqual({ force: true });
        return Promise.resolve({ data: 'delete-with-params' });
      });
      (instance as any).delete = mockDelete;

      const client = createWrappedHttpClient(instance);
      const result = await client.delete<string>('/test', undefined, {
        params: { force: true },
      });

      expect(mockDelete).toHaveBeenCalledWith(
        '/test',
        expect.objectContaining({
          params: { force: true },
        })
      );
      expect(result.data).toBe('delete-with-params');
      expect(result.error).toBeNull();
    });

    it('should include query params in cache key for GET requests', async () => {
      const instance = axios.create();
      const mockGet = vi.fn(() => Promise.resolve({ data: 'cached-data' }));
      (instance as any).get = mockGet;

      const client = createWrappedHttpClient(instance);
      
      // First request - should make network call
      const result1 = await client.get<string>('/test', {
        params: { page: 1 },
        cacheTTL: 1000,
      });
      expect(mockGet).toHaveBeenCalledTimes(1);
      expect(result1.data).toBe('cached-data');

      // Second request with same params - should use cache
      const result2 = await client.get<string>('/test', {
        params: { page: 1 },
        cacheTTL: 1000,
      });
      expect(mockGet).toHaveBeenCalledTimes(1); // Still 1, cache hit
      expect(result2.data).toBe('cached-data');

      // Third request with different params - should make new network call
      const result3 = await client.get<string>('/test', {
        params: { page: 2 },
        cacheTTL: 1000,
      });
      expect(mockGet).toHaveBeenCalledTimes(2); // New call
      expect(result3.data).toBe('cached-data');
    });

    it('should handle null and undefined params correctly', async () => {
      const instance = axios.create();
      const mockGet = vi.fn((_url, config) => {
        // null and undefined should be filtered out
        expect(config.params).toEqual({ active: true, name: 'test' });
        return Promise.resolve({ data: 'filtered-params' });
      });
      (instance as any).get = mockGet;

      const client = createWrappedHttpClient(instance);
      const result = await client.get<string>('/test', {
        params: {
          active: true,
          name: 'test',
          deleted: null,
          archived: undefined,
        },
      });

      expect(result.data).toBe('filtered-params');
      expect(result.error).toBeNull();
    });
  });
});

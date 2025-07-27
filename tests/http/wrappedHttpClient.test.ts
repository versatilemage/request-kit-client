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
});

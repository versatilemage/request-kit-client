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

describe('wrappedHttpClient', () => {
  let client: ReturnType<typeof createWrappedHttpClient>;

  beforeEach(() => {
    const instance = axios.create(); // ✅ This is the mocked instance now
    client = createWrappedHttpClient(instance);
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
});

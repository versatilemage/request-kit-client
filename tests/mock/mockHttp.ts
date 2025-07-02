// test/mock/mockHttp.ts
import { vi } from "vitest";

export function createMockHttp() {
  return {
    get: vi.fn().mockResolvedValue({ data: { foo: "bar" }, error: null }),
    post: vi.fn().mockResolvedValue({ data: { id: 1 }, error: null }),
    put: vi.fn().mockResolvedValue({ data: { success: true }, error: null }),
    delete: vi.fn().mockResolvedValue({ data: { deleted: true }, error: null }),
  };
}

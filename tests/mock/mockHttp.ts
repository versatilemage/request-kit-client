import type { WrappedHttp, NormalizedError } from "../../src/types";
import { vi } from "vitest";

export function createMockHttp(): WrappedHttp {
  const get: WrappedHttp["get"] = vi.fn((url, _options) =>
    Promise.resolve({
      data: { foo: "bar" } as any,
      error: null,
    })
  );

  const post: WrappedHttp["post"] = vi.fn((url, _body, _options) =>
    Promise.resolve({
      data: { id: 1 } as any,
      error: null,
    })
  );

  const put: WrappedHttp["put"] = vi.fn((url, _body, _options) =>
    Promise.resolve({
      data: { success: true } as any,
      error: null,
    })
  );

  const del: WrappedHttp["delete"] = vi.fn((url, _options) =>
    Promise.resolve({
      data: { deleted: true } as any,
      error: null,
    })
  );

  return {
    get,
    post,
    put,
    delete: del,
  };
}

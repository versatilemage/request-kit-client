// tests/service/createCustomService.test.ts
import { describe, it, expect, beforeEach, vi, type Mock } from "vitest";
import { createCustomService } from "../../src/services/createCustomService";
import { createMockHttp } from "../mock/mockHttp";
import type { WrappedHttp } from "../../src/types";

let mockHttp: WrappedHttp & {
  get: Mock<(url: string, options?: any) => Promise<{ data: any; error: any }>>;
  post: Mock<(url: string, body?: any, options?: any) => Promise<{ data: any; error: any }>>;
  put: Mock<(url: string, body?: any, options?: any) => Promise<{ data: any; error: any }>>;
  delete: Mock<(url: string, options?: any) => Promise<{ data: any; error: any }>>;
};

beforeEach(() => {
  mockHttp = createMockHttp() as typeof mockHttp;
});

describe("createCustomService", () => {
  const routes = {
    getUser: {
      method: "get",
      endpoint: "/user",
      responseType: {} as { name: string; email: string }
    },
    createUser: {
      method: "post",
      endpoint: "/user",
      requestType: {} as { name: string },
      responseType: {} as { id: number }
    },
    updateUser: {
      method: "put",
      endpoint: "/user",
      requestType: {} as { id: number },
      responseType: {} as { success: boolean }
    },
    deleteUser: {
      method: "delete",
      endpoint: "/user",
      responseType: {} as { deleted: boolean }
    },
    getWithTransform: {
      method: "get",
      endpoint: "/transformed",
      responseType: {} as { userName: string },
      transformResponse: (data: any) => ({
        userName: `${data.first_name} ${data.last_name}`
      })
    }
  } as const;

  it("should call GET endpoint", async () => {
    const service = createCustomService(mockHttp, routes);
    const result = await service.getUser();
    expect(result.data).toEqual({ foo: "bar" });
    expect(result.error).toBeNull();
    expect(mockHttp.get).toHaveBeenCalledWith("/user", undefined);
  });

  it("should call POST endpoint", async () => {
    const service = createCustomService(mockHttp, routes);
    const result = await service.createUser({ name: "Alice" });
    expect(result.data).toEqual({ id: 1 });
    expect(mockHttp.post).toHaveBeenCalledWith("/user", { name: "Alice" }, undefined);
  });

  it("should call PUT endpoint", async () => {
    const service = createCustomService(mockHttp, routes);
    const result = await service.updateUser({ id: 1 });
    expect(result.data).toEqual({ success: true });
    expect(mockHttp.put).toHaveBeenCalledWith("/user", { id: 1 }, undefined);
  });

  it("should call DELETE endpoint", async () => {
    const service = createCustomService(mockHttp, routes);
    const result = await service.deleteUser();
    expect(result.data).toEqual({ deleted: true });
    expect(result.error).toBeNull();
    expect(mockHttp.delete).toHaveBeenCalledWith("/user", undefined);
  });

  it("should call transformResponse if provided", async () => {
    mockHttp.get.mockResolvedValueOnce({
      data: { first_name: "Alice", last_name: "Smith" },
      error: null
    });

    const service = createCustomService(mockHttp, routes);
    const result = await service.getWithTransform();
    expect(result.data).toEqual({ userName: "Alice Smith" });
    expect(result.error).toBeNull();
    expect(mockHttp.get).toHaveBeenCalledWith("/transformed", undefined);
  });
});

import { describe, it, expect, beforeEach } from "vitest";
import { createCustomService } from "../../src/services/createCustomService";
import { createMockHttp } from "../mock/mockHttp";
import type { CustomServiceDefinition, WrappedHttp } from "../../src/types";

let mockHttp: WrappedHttp;

beforeEach(() => {
  mockHttp = createMockHttp();
});

describe("createCustomService", () => {
  const routes: CustomServiceDefinition = {
    getUser: { method: "get", endpoint: "/user" },
    createUser: { method: "post", endpoint: "/user" },
    updateUser: { method: "put", endpoint: "/user" },
    deleteUser: { method: "delete", endpoint: "/user" },
  };

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
    expect(mockHttp.post).toHaveBeenCalledWith(
      "/user",
      { name: "Alice" },
      undefined
    );
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
    expect(mockHttp.delete).toHaveBeenCalledWith("/user", undefined);
  });
});

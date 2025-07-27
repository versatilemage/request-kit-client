// tests/service/userService.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { createUserService } from "../../src/services/user";
import { createMockHttp } from "../mock/mockHttp";
import { UserProfile } from "../../src";

let mockHttp: ReturnType<typeof createMockHttp>;

beforeEach(() => {
  mockHttp = createMockHttp();
});

const routes = {
  getProfile: {
    method: "get",
    endpoint: "/user/me",
    responseType: {} as UserProfile,
    transformResponse: (data: any) => ({
      ...data,
      name: `${data.first_name} ${data.last_name}`,
    }),
  },
  updateProfile: {
    method: "put",
    endpoint: "/user/me",
    requestType: {} as Partial<UserProfile>,
    responseType: {} as { updated: boolean },
  },
} as const;

describe("userService", () => {
  it("should get profile and apply transform", async () => {
    mockHttp.get.mockResolvedValueOnce({
      data: {
        first_name: "John",
        last_name: "Doe",
        email: "john@example.com",
      },
      error: null,
    });

    const service = createUserService(mockHttp, routes);
    const res = await service.getProfile();

    expect(res.data.name).toBe("John Doe");
    expect(mockHttp.get).toHaveBeenCalledWith("/user/me", undefined);
  });

  it("should update profile", async () => {
    mockHttp.put.mockResolvedValueOnce({
      data: { updated: true },
      error: null,
    });

    const service = createUserService(mockHttp, {
      updateProfile: {
        method: "put",
        endpoint: "/user/me",
        requestType: {} as { email: string },
        responseType: {} as { updated: boolean },
      },
    });

    const res = await service.updateProfile({ email: "new@example.com" });

    expect(res.data.updated).toBe(true);
    expect(mockHttp.put).toHaveBeenCalledWith("/user/me", { email: "new@example.com" }, undefined);
  });
});

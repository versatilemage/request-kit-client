// tests/service/authService.test.ts
import { describe, it, expect, beforeEach, vi } from "vitest";
import { createAuthService } from "../../src/services/auth";
import { createMockHttp } from "../mock/mockHttp";

let mockHttp: ReturnType<typeof createMockHttp>;

const routes = {
  login: {
    method: "post",
    endpoint: "/auth/login",
    requestType: {} as { email: string; password: string },
    responseType: {} as { token: string },
  },
  logout: {
    method: "post",
    endpoint: "/auth/logout",
    responseType: {} as { message: string },
  },
  refresh: {
    method: "post",
    endpoint: "/auth/refresh",
    responseType: {} as { token: string },
    transformResponse: (data: any) => ({ token: `Bearer ${data.token}` }),
  },
} as const;

describe("authService", () => {
  beforeEach(() => {
    mockHttp = createMockHttp();
  });

  it("should call login and return token", async () => {
    mockHttp.post.mockResolvedValueOnce({
      data: { token: "abc" },
      error: null,
    });
    const service = createAuthService(mockHttp, routes);

    const res = await service.login({
      email: "test@mail.com",
      password: "123",
    });

    expect(mockHttp.post).toHaveBeenCalledWith(
      "/auth/login",
      { email: "test@mail.com", password: "123" },
      undefined
    );
    expect(res.data).toEqual({ token: "abc" });
    expect(res.error).toBeNull();
  });

  it("should call logout and return message", async () => {
    mockHttp.post.mockResolvedValueOnce({
      data: { message: "Logged out successfully" },
      error: null,
    });
    const service = createAuthService(mockHttp, routes);

    const res = await service.logout();

    expect(mockHttp.post).toHaveBeenCalledWith(
      "/auth/logout",
      undefined,
      undefined
    );
    expect(res.data).toEqual({ message: "Logged out successfully" });
    expect(res.error).toBeNull();
  });

  it("should call refresh and transform response", async () => {
    mockHttp.post.mockResolvedValueOnce({
      data: { token: "xyz" },
      error: null,
    });
    const service = createAuthService(mockHttp, routes);

    const res = await service.refresh();

    expect(mockHttp.post).toHaveBeenCalledWith(
      "/auth/refresh",
      undefined,
      undefined
    );
    expect(res.data).toEqual({ token: "Bearer xyz" });
    expect(res.error).toBeNull();
  });

  it("should return error when login fails", async () => {
    const mockError = { message: "Invalid credentials" };
    mockHttp.post.mockResolvedValueOnce({ data: null, error: mockError });
    const service = createAuthService(mockHttp, routes);

    const res = await service.login({
      email: "fail@mail.com",
      password: "wrong",
    });

    expect(res.data).toBeNull();
    expect(res.error).toEqual(mockError);
  });

  it("should throw if method is missing from route definitions", async () => {
    const partialRoutes = {
      login: routes.login,
    } as const;

    const service = createAuthService(mockHttp, partialRoutes);

    await expect(async () => {
      await (service as any).logout();
    }).rejects.toThrowError("logout is not defined in the service routes");

    await expect(async () => {
      await (service as any).refresh();
    }).rejects.toThrowError("refresh is not defined in the service routes");
  });
});

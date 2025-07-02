import { describe, it, expect, beforeEach } from "vitest";
import { createAuthService } from "../../src/services/auth";
import { createMockHttp } from "../mock/mockHttp";

let mockHttp: ReturnType<typeof createMockHttp>;

beforeEach(() => {
  mockHttp = createMockHttp();
});

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
  it("should call login correctly", async () => {
    mockHttp.post.mockResolvedValueOnce({ data: { token: "abc" }, error: null });

    const service = createAuthService(mockHttp, routes);
    const res = await service.login({ email: "test@mail.com", password: "123" });

    expect(res.data).toEqual({ token: "abc" });
    expect(mockHttp.post).toHaveBeenCalledWith("/auth/login", { email: "test@mail.com", password: "123" }, undefined);
  });

  it("should call logout", async () => {
  mockHttp.post.mockResolvedValueOnce({ data: { message: "Logged out successfully" }, error: null });

  const service = createAuthService(mockHttp, routes);
  const res = await service.logout();

  expect(res.data).toEqual({ message: "Logged out successfully" });
  expect(mockHttp.post).toHaveBeenCalledWith("/auth/logout", undefined, undefined);
});


  it("should call refresh with transformResponse", async () => {
    mockHttp.post.mockResolvedValueOnce({ data: { token: "xyz" }, error: null });

    const service = createAuthService(mockHttp, routes);
    const res = await service.refresh();

    expect(res.data).toEqual({ token: "Bearer xyz" });
  });
});

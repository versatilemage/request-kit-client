// src/services/user.ts

import { WrappedHttp } from "../types";
import { ApiRoutes, UserProfile } from "../types";

export const createUserService = (
  http: WrappedHttp,
  routes: ApiRoutes["user"]
) => ({
  getProfile: (options?: { cacheTTL?: number }) =>
    http.get<UserProfile>(routes!.profile!, options),

  updateProfile: (data: Partial<UserProfile>) =>
    http.put(routes!.profile!, data),
});

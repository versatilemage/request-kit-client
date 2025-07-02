import type { UserProfile, WrappedHttp } from "../types";
import { createUserService } from "./user";

export const createDefaultUserService = (http: WrappedHttp) =>
    createUserService(http, {
        getProfile: {
            method: "get",
            endpoint: "/user/profile",
            responseType: {} as UserProfile,
        },
        updateProfile: {
            method: "put",
            endpoint: "/user/profile",
            requestType: {} as Partial<UserProfile>,
            responseType: {} as { updated: boolean },
        },
    });

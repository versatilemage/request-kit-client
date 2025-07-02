import { WrappedHttp } from "../types";
import type { UserProfile } from "../types";

export type UserServiceDefinition = {
  getProfile: {
    method: "get";
    endpoint: string | (() => string);
    responseType: UserProfile;
    transformResponse?: (data: any) => any;
  };
  updateProfile: {
    method: "put";
    endpoint: string | (() => string);
    requestType: Partial<UserProfile>;
    responseType: { updated: boolean };
    transformResponse?: (data: any) => any;
  };
};

export const createUserService = <
  T extends Partial<UserServiceDefinition>
>(
  http: WrappedHttp,
  config: T
): {
  [K in keyof T]: T[K] extends { method: "get" | "delete", responseType: infer Res }
    ? (options?: any) => Promise<{ data: Res; error: any }>
    : T[K] extends { method: any, requestType: infer Req, responseType: infer Res }
      ? (body: Req, options?: any) => Promise<{ data: Res; error: any }>
      : never;
} => {
  const service = {} as any;

  (Object.keys(config) as (keyof T)[]).forEach((key) => {
    const def = config[key]! as unknown as {
      endpoint: string | (() => string);
      method: string;
      transformResponse?: (data: any) => any;
    };
    service[key] = async (...args: any[]) => {
      const url = typeof def.endpoint === "function"
        ? def.endpoint()
        : def.endpoint;

      let res;
      if (def.method === "get") {
        res = await http.get(url, args[0]);
      } else if (def.method === "delete") {
        res = await http.delete(url, args[0]);
      } else if (def.method === "put") {
        res = await http.put(url, args[0], args[1]);
      } else if (def.method === "post") {
        res = await http.post(url, args[0], args[1]);
      } else {
        throw new Error(`Unsupported HTTP method: ${def.method}`);
      }

      return {
        ...res,
        data: def.transformResponse?.(res.data) ?? res.data,
      };
    };
  });

  return service;
};


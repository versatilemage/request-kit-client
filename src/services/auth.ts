import { WrappedHttp } from "../types";

export type AuthServiceDefinition = {
  [methodName: string]: {
    method: "get" | "post" | "put" | "delete";
    endpoint: string | ((...args: any[]) => string);
    requestType?: any;
    responseType?: any;
    transformResponse?: (data: any) => any;
  };
};

type HasRequest<T> = T extends { requestType: infer Req }
  ? [Req] extends [undefined]
  ? false
  : true
  : false;

type AuthService<T extends AuthServiceDefinition> = {
  [K in keyof T]:
  T[K]["method"] extends "get" | "delete"
  ? (options?: any) => Promise<{ data: T[K]["responseType"]; error: any }>
  : HasRequest<T[K]> extends true
  ? (body: T[K]["requestType"], options?: any) => Promise<{ data: T[K]["responseType"]; error: any }>
  : (options?: any) => Promise<{ data: T[K]["responseType"]; error: any }>
};

export const createAuthService = <T extends AuthServiceDefinition>(
  http: WrappedHttp,
  config: T
): AuthService<T> => {
  const service = {} as AuthService<T>;

  for (const key in config) {
    const def = config[key];

    const handler = async (...args: any[]) => {
      const url =
        typeof def.endpoint === "function"
          ? def.endpoint(...args)
          : def.endpoint;

      let res;

      switch (def.method) {
        case "get":
        case "delete":
          res = await http[def.method]<typeof def.responseType>(url, args[0]);
          break;

        case "post":
        case "put":
          const hasBody = "requestType" in def && def.requestType !== undefined;
          const body = hasBody ? args[0] : undefined;
          const options = hasBody ? args[1] : args[0];
          res = await http[def.method]<typeof def.responseType>(url, body, options);
          break;

        default:
          throw new Error(`Unsupported method: ${def.method}`);
      }

      return {
        ...res,
        data: def.transformResponse?.(res.data) ?? res.data,
      };
    };

    service[key] = handler as any;
  }

  return service;
};

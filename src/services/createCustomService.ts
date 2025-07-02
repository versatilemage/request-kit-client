// src/services/createCustomService.ts

import { WrappedHttp } from "../types";

type HttpMethod = "get" | "post" | "put" | "delete";
type EndpointFunction = (...args: any[]) => string;
type Endpoint = string | EndpointFunction;

type CustomEndpointConfig<
  Method extends HttpMethod,
  Res = unknown,
  Req = unknown
> = {
  method: Method;
  endpoint: Endpoint;
  requestType?: Req;
  responseType?: Res;
  transformResponse?: (data: any) => any;
};

type CustomServiceDefinitionTyped = Record<
  string,
  CustomEndpointConfig<any, any, any>
>;

type CustomService<T extends CustomServiceDefinitionTyped> = {
  [K in keyof T]: T[K]["method"] extends "get" | "delete"
    ? (options?: any) => Promise<{ data: T[K]["responseType"]; error: any }>
    : T[K]["requestType"] extends never
      ? (options?: any) => Promise<{ data: T[K]["responseType"]; error: any }>
      : (body: T[K]["requestType"], options?: any) => Promise<{ data: T[K]["responseType"]; error: any }>;
};


export const createCustomService = <
  T extends CustomServiceDefinitionTyped
>(
  http: WrappedHttp,
  config: T
): CustomService<T> => {
  const service = {} as CustomService<T>;

  for (const key in config) {
    const {
      method,
      endpoint,
      transformResponse,
    } = config[key];

    service[key] = (async (...args: any[]) => {
      const url = typeof endpoint === "function" ? endpoint(...args) : endpoint;
      let response;

      switch (method) {
        case "get":
          response = await http.get(url, args[0]);
          break;
        case "delete":
          response = await http.delete(url, args[0]);
          break;
        case "post":
          response = await http.post(url, args[0], args[1]);
          break;
        case "put":
          response = await http.put(url, args[0], args[1]);
          break;
        default:
          throw new Error(`Unsupported method: ${method}`);
      }

      const data = transformResponse
        ? transformResponse(response.data)
        : response.data;

      return { data, error: response.error };
    }) as any;
  }

  return service;
};

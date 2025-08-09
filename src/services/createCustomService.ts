import { WrappedHttp } from "../types";

type HttpMethod = "get" | "post" | "put" | "delete";
type EndpointFunction<Args extends any[] = any[]> = (...args: Args) => string;
type Endpoint<Args extends any[] = any[]> = string | EndpointFunction<Args>;

type CustomEndpointConfig<
  Method extends HttpMethod,
  Res = unknown,
  Req = undefined,
  Args extends any[] = []
> = {
  method: Method;
  endpoint: Endpoint<Args>;
  requestType?: Req;
  responseType?: Res;
  transformResponse?: (data: any) => any;
};

type CustomServiceDefinitionTyped = Record<
  string,
  CustomEndpointConfig<any, any, any, any>
>;

type InferResponseType<Cfg> =
  Cfg extends { transformResponse: (...a: any[]) => infer R }
    ? R
    : Cfg extends { responseType: infer R }
      ? R
      : unknown;

type CustomService<T extends CustomServiceDefinitionTyped> = {
  [K in keyof T]:
    // GET → never body
    T[K]["method"] extends "get"
      ? T[K]["endpoint"] extends EndpointFunction<infer Args>
        ? (...args: [...args: Args, options?: any]) => Promise<{ data: InferResponseType<T[K]>; error: any }>
        : (options?: any) => Promise<{ data: InferResponseType<T[K]>; error: any }>
    // DELETE → no body unless requestType provided
    : T[K]["method"] extends "delete"
      ? undefined extends T[K]["requestType"]
        ? T[K]["endpoint"] extends EndpointFunction<infer Args>
          ? (...args: [...args: Args, options?: any]) => Promise<{ data: InferResponseType<T[K]>; error: any }>
          : (options?: any) => Promise<{ data: InferResponseType<T[K]>; error: any }>
        : T[K]["endpoint"] extends EndpointFunction<infer Args>
          ? (body: T[K]["requestType"], ...args: [...args: Args, options?: any]) => Promise<{ data: InferResponseType<T[K]>; error: any }>
          : (body: T[K]["requestType"], options?: any) => Promise<{ data: InferResponseType<T[K]>; error: any }>
    // POST/PUT
    : undefined extends T[K]["requestType"]
      ? T[K]["endpoint"] extends EndpointFunction<infer Args>
        ? (...args: [...args: Args, options?: any]) => Promise<{ data: InferResponseType<T[K]>; error: any }>
        : (options?: any) => Promise<{ data: InferResponseType<T[K]>; error: any }>
      : T[K]["endpoint"] extends EndpointFunction<infer Args>
        ? (body: T[K]["requestType"], ...args: [...args: Args, options?: any]) => Promise<{ data: InferResponseType<T[K]>; error: any }>
        : (body: T[K]["requestType"], options?: any) => Promise<{ data: InferResponseType<T[K]>; error: any }>;
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
      const url =
        typeof endpoint === "function"
          ? endpoint(...args)
          : endpoint;

      let response;
      switch (method) {
        case "get":
          response = await http.get(url, args.at(-1));
          break;
        case "delete":
          if (args.length > 1) {
            // DELETE with body if requestType provided
            response = await http.delete(url, args[0], args[1]);
          } else {
            // DELETE without body
            response = await http.delete(url, args[0]);
          }
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

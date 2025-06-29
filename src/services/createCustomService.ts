// src/services/createCustomService.ts

import { CustomServiceDefinition, WrappedHttp } from "../types";

export const createCustomService = (
  http: WrappedHttp,
  config: CustomServiceDefinition
): Record<string, any> => {
  const service: Record<string, any> = {};

  for (const key in config) {
    const { method, endpoint } = config[key];

    service[key] = async (...args: any[]) => {
      const url = typeof endpoint === "function" ? endpoint(...args) : endpoint;

      if (method === "get") {
        const options = args[0];
        return await http.get(url, options);
      }

      if (method === "delete") {
        const options = args[0];
        return await http.delete(url, options);
      }

      if (method === "post") {
        const body = args[0];
        const options = args[1];
        return await http.post(url, body, options);
      }

      if (method === "put") {
        const body = args[0];
        const options = args[1];
        return await http.put(url, body, options);
      }

      throw new Error(`Unsupported method: ${method}`);
    };
  }

  return service;
};


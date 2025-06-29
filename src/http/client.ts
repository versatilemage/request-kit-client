// src/http/client.ts

import axios from "axios";

export const createHttpClient = (
  baseURL: string,
  getToken?: () => string | null
) => {
  const instance = axios.create({
    baseURL,
    timeout: 10000,
  });

  instance.interceptors.request.use((config) => {
    const token = getToken?.();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  instance.interceptors.response.use(
    (response) => response,
    (error) => Promise.reject(error) // raw error passed to `handleApiError`
  );

  return instance;
};

// src/utils/handleApiError.ts

import axios from "axios";
import { ApiError } from "./ApiErrors";
import { HTTP_STATUS } from "../types/statusCodes";
import { HandleErrorOptions, NormalizedError } from "../types";

export const handleApiError = (
  error: unknown,
  options?: HandleErrorOptions
): NormalizedError => {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const message =
      (error.response?.data as any)?.message ||
      error.message ||
      "Unexpected error occurred";

    if (
      (status === HTTP_STATUS.UNAUTHORIZED ||
        status === HTTP_STATUS.FORBIDDEN) &&
      options?.onUnauthorized
    ) {
      options.onUnauthorized(status);
    }

    return {
      message,
      statusCode: status || HTTP_STATUS.INTERNAL_SERVER_ERROR,
      raw: new ApiError(message, status, error.response?.data),
    };
  }

  return {
    message: (error as any)?.message || "Unknown error occurred",
    raw: new ApiError((error as any)?.message || "Unknown error", 500),
  };
};

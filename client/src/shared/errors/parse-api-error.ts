import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { ApiError } from "../../types/errors/api-error.types";

export function parseApiError(error: unknown): ApiError | null {
  if (typeof error === "object" && error !== null && "data" in error) {
    return (error as FetchBaseQueryError).data as ApiError;
  }
  return null;
}

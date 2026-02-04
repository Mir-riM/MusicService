import { FieldValues, UseFormSetError } from "react-hook-form";
import { ApiError } from "../../types/errors/api-error.types";

export function applyApiErrorToForm<T extends FieldValues>(
  apiError: ApiError,
  setError: UseFormSetError<T>,
) {
  if (apiError.fields) {
    Object.entries(apiError.fields).forEach(([field, message]) => {
      setError(field as any, {
        type: "server",
        message,
      });
    });
  } else {
    setError("root", {
      type: "server",
      message: apiError.message,
    });
  }
}

import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { ApiFieldError } from "@/lib/api/client";

/**
 * Maps a mock/real API field error onto the matching form field (and focuses
 * it). Returns false when the error isn't a known field error, so the caller
 * can show a generic error toast instead.
 */
export function applyApiError<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  fields: Partial<Record<string, Path<T>>>,
): boolean {
  if (!(error instanceof ApiFieldError)) return false;
  const field = fields[error.field];
  if (!field) return false;
  setError(field, { type: "server", message: error.messageKey }, { shouldFocus: true });
  return true;
}

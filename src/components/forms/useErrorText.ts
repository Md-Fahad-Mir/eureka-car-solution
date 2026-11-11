"use client";

import { useTranslations } from "next-intl";
import type { FieldError } from "react-hook-form";

type ValidationKey = Parameters<ReturnType<typeof useTranslations<"validation">>>[0];

/**
 * Translates a form error whose message is a `validation.*` key (schemas and
 * the mock server both emit keys). Unknown messages fall back to "required".
 */
export function useErrorText() {
  const t = useTranslations("validation");
  return (error: FieldError | { message?: string } | undefined, values?: Record<string, string | number>) => {
    const key = error?.message;
    if (!key) return undefined;
    return t.has(key as ValidationKey) ? t(key as ValidationKey, values) : t("required");
  };
}

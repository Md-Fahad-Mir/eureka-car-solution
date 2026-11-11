"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Checkbox } from "@/components/ui/Choice";
import { Segmented } from "@/components/ui/Segmented";
import { documentsFor } from "@/config/finance";
import { EMPLOYMENT_TYPES } from "@/types";
import { useFormat } from "@/lib/format/useFormat";
import { useFinanceDocsStore } from "@/stores/financeDocs";
import { useHydrated } from "@/stores/hydration";
import { ensureHydrated } from "@/stores/persist";

/** Tick-off list of required documents, saved in this browser. */
export function DocumentsChecklist() {
  const t = useTranslations("finance.documents");
  const tDemo = useTranslations("demo");
  const f = useFormat();
  const hydrated = useHydrated();
  const { employment, checked, setEmployment, toggle, reset } = useFinanceDocsStore();

  useEffect(() => ensureHydrated(useFinanceDocsStore), []);

  const docs = documentsFor(employment);
  const done = hydrated ? docs.filter((d) => checked.includes(d)).length : 0;
  const progress = docs.length ? (done / docs.length) * 100 : 0;

  return (
    <div className="rounded-card border border-line bg-bg-alt p-5 sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Segmented
          label={t("applicantType")}
          value={employment}
          onValueChange={setEmployment}
          options={EMPLOYMENT_TYPES.map((e) => ({ value: e, label: t(`types.${e}`) }))}
        />
        <p className="text-sm text-muted" aria-live="polite">
          {t("progress", { done: f.number(done), total: f.number(docs.length) })}
        </p>
      </div>
      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-ink/[0.08]" aria-hidden>
        <div className="h-full rounded-full bg-success transition-[width] duration-500" style={{ width: `${progress}%` }} />
      </div>
      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        {docs.map((d) => (
          <li key={d}>
            <Checkbox
              checked={hydrated && checked.includes(d)}
              onChange={() => toggle(d)}
              label={t(`items.${d}.label`)}
              description={t(`items.${d}.hint`)}
            />
          </li>
        ))}
      </ul>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4 text-xs text-muted">
        <span>{tDemo("browserOnly")}</span>
        <button type="button" onClick={reset} className="font-medium text-accent-ink underline-offset-4 hover:underline">
          {t("reset")}
        </button>
      </div>
    </div>
  );
}

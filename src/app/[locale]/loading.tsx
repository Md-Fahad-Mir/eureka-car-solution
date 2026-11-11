import { useTranslations } from "next-intl";
import { Skeleton } from "@/components/ui/Skeleton";

/** Generic route skeleton: heading block + card grid. Routes with richer layouts add their own. */
export default function Loading() {
  const t = useTranslations("a11y");
  return (
    <div className="container-page py-14" role="status" aria-live="polite">
      <span className="sr-only">{t("loading")}</span>
      <Skeleton className="h-3 w-28" />
      <Skeleton className="mt-5 h-12 w-full max-w-xl" />
      <Skeleton className="mt-3 h-5 w-full max-w-md" />
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="rounded-card border border-line bg-bg-alt p-4">
            <Skeleton className="aspect-[16/10] w-full" />
            <Skeleton className="mt-4 h-5 w-2/3" />
            <Skeleton className="mt-2 h-4 w-1/3" />
          </div>
        ))}
      </div>
    </div>
  );
}

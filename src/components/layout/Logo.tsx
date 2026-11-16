import Image from "next/image";
import { siteConfig } from "@/config/site";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

/** Largest height the logo is shown at (px). The images' intrinsic size, so next/image serves 1×/2× files sharp enough for it. */
const MAX_HEIGHT = 56;

/**
 * The brand logo (the "Eureka / CAR SOLUTION" wordmark with its car line), linking home.
 * Two renditions: full colour for light surfaces, cream and blue for dark ones. Both are
 * in the page and CSS cross-fades between them, so the header can switch over the dark
 * hero without waiting for a download. The link's accessible name is the logo's text.
 *
 * Sized by its height class (default `h-11`); the width follows the logo's proportions,
 * so callers can size it per breakpoint (`className="h-9 xl:h-11"`).
 */
export function Logo({
  tone = "ink",
  eager = false,
  className,
}: {
  tone?: "ink" | "light";
  /** Above the fold (the header): load straight away. */
  eager?: boolean;
  className?: string;
}) {
  const { logo, name } = siteConfig;
  const width = Math.round(MAX_HEIGHT * logo.ratio);
  const loading = eager ? "eager" : "lazy";
  const img = "absolute inset-0 size-full transition-opacity duration-500 ease-(--ease-cinema)";
  return (
    <Link
      href="/"
      className={cn("relative block h-11 shrink-0 transition-opacity duration-300 hover:opacity-85", className)}
      style={{ aspectRatio: logo.ratio }}
    >
      <Image src={logo.src} alt={name} width={width} height={MAX_HEIGHT} loading={loading} className={cn(img, tone === "light" ? "opacity-0" : "opacity-100")} />
      <Image
        src={logo.srcOnDark}
        alt=""
        aria-hidden
        width={width}
        height={MAX_HEIGHT}
        loading={loading}
        className={cn(img, tone === "light" ? "opacity-100" : "opacity-0")}
      />
    </Link>
  );
}

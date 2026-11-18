"use client";

import { useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from "react";
import { ChevronLeft, ChevronRight, Expand } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { VehicleImage } from "@/components/media/VehicleImage";
import { Dialog } from "@/components/ui/Dialog";
import { useFormat } from "@/lib/format/useFormat";
import { cn } from "@/lib/utils";
import type { BodyType, Media } from "@/types";

type Placeholder = { bodyType: BodyType; paint: string; initial: string };

/** Width ÷ height of each media aspect: the lightbox caps the image's width so its height fits the screen. */
const RATIO: Record<Media["aspect"], number> = { "16/10": 1.6, "4/3": 4 / 3, "1/1": 1 };

/**
 * Vehicle gallery: main image with previous/next, thumbnails, ←/→ keys,
 * touch swipe, and a fullscreen lightbox (native <dialog>, focus-trapped).
 */
export function Gallery({ images, placeholder, title }: { images: Media[]; placeholder: Placeholder; title: string }) {
  const t = useTranslations("gallery");
  const locale = useLocale();
  const f = useFormat();
  const [index, setIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const swipeStart = useRef<number | null>(null);
  const count = images.length;

  const go = (delta: number) => setIndex((i) => (i + delta + count) % count);

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    go(e.key === "ArrowLeft" ? -1 : 1);
  };
  const onPointerDown = (e: PointerEvent) => {
    swipeStart.current = e.clientX;
  };
  const onPointerUp = (e: PointerEvent) => {
    if (swipeStart.current === null) return;
    const dx = e.clientX - swipeStart.current;
    swipeStart.current = null;
    if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
  };

  const position = t("position", { current: f.number(index + 1), total: f.number(count) });

  const stage = (large: boolean) => (
    <div
      role="group"
      aria-roledescription={t("carousel")}
      aria-label={title}
      tabIndex={0}
      onKeyDown={onKeyDown}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      className={cn(
        "relative touch-pan-y select-none focus-visible:outline-offset-4",
        // Lightbox: as wide as fits the height left by the title and thumbnails (no thumbnails when short).
        large && "mx-auto w-full max-w-[calc((100dvh-13rem)*var(--ratio))] short:max-w-[calc((100dvh-6.5rem)*var(--ratio))]",
      )}
      style={large ? ({ "--ratio": RATIO[images[index].aspect] } as CSSProperties) : undefined}
    >
      <VehicleImage
        media={images[index]}
        placeholder={placeholder}
        priority={index === 0 && !large}
        sizes={large ? "100vw" : "(min-width: 1024px) 58vw, 100vw"}
        rounded={!large}
        className={large ? "rounded-2xl" : undefined}
      />
      <p className="sr-only" aria-live="polite">
        {position}: {images[index].alt[locale]}
      </p>
      {count > 1 ? (
        <>
          <ArrowButton side="left" label={t("previous")} onClick={() => go(-1)} />
          <ArrowButton side="right" label={t("next")} onClick={() => go(1)} />
        </>
      ) : null}
      <span aria-hidden className="absolute bottom-3 left-3 rounded-full bg-ink/70 px-2.5 py-1 text-xs text-bg-alt tabular">
        {position}
      </span>
    </div>
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        {stage(false)}
        <button
          type="button"
          onClick={() => setLightbox(true)}
          className="absolute right-3 bottom-3 inline-flex h-9 items-center gap-1.5 rounded-full bg-bg-alt/90 px-3 text-xs font-medium shadow-sm backdrop-blur hover:bg-bg-alt"
        >
          <Expand aria-hidden className="size-3.5" />
          {t("fullscreen")}
        </button>
      </div>
      <Thumbnails images={images} placeholder={placeholder} index={index} onSelect={setIndex} />

      <Dialog open={lightbox} onOpenChange={setLightbox} title={title} description={position} placement="full" tone="dark">
        <div className="mx-auto flex h-full max-w-6xl flex-col justify-center gap-4">
          {stage(true)}
          <Thumbnails images={images} placeholder={placeholder} index={index} onSelect={setIndex} dark className="mx-auto w-full max-w-md short:hidden" />
        </div>
      </Dialog>
    </div>
  );
}

function ArrowButton({ side, label, onClick }: { side: "left" | "right"; label: string; onClick: () => void }) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "absolute top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-bg-alt/90 text-ink shadow-sm backdrop-blur transition-colors hover:bg-bg-alt",
        side === "left" ? "left-3" : "right-3",
      )}
    >
      <Icon aria-hidden className="size-5" />
    </button>
  );
}

function Thumbnails({
  images,
  placeholder,
  index,
  onSelect,
  dark,
  className,
}: {
  images: Media[];
  placeholder: Placeholder;
  index: number;
  onSelect: (i: number) => void;
  dark?: boolean;
  className?: string;
}) {
  const t = useTranslations("gallery");
  const locale = useLocale();
  return (
    <ul className={cn("grid grid-cols-4 gap-2 sm:gap-3", className)}>
      {images.map((m, i) => (
        <li key={`${m.view}-${i}`}>
          <button
            type="button"
            onClick={() => onSelect(i)}
            aria-current={i === index ? "true" : undefined}
            aria-label={t("showImage", { n: i + 1, alt: m.alt[locale] })}
            className={cn(
              "block w-full overflow-hidden rounded-xl border-2 transition-[border-color,opacity]",
              i === index ? (dark ? "border-on-dark" : "border-ink") : "border-transparent opacity-70 hover:opacity-100",
            )}
          >
            <VehicleImage media={m} placeholder={placeholder} sizes="15vw" rounded={false} />
          </button>
        </li>
      ))}
    </ul>
  );
}

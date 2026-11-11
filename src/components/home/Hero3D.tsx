"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, Search } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { ButtonLink } from "@/components/ui/Button";
import { HERO_CHAPTERS, heroConfig } from "@/config/hero";
import { useFormat } from "@/lib/format/useFormat";
import { cn } from "@/lib/utils";
import type { HeroWorldState } from "@/components/three/heroWorld";
import { HeroPoster } from "./HeroPoster";

// three.js + R3F load only here, only on capable devices, after first paint.
const HeroCanvas = dynamic(() => import("@/components/three/HeroCanvas"), { ssr: false });

/** Keyframe index where each chapter starts; mirrors CHAPTER_KEYFRAMES in heroWorld (kept here to avoid importing three). */
const CHAPTER_KEYFRAMES = [1, 2, 5, 9];
const KEYFRAME_COUNT = 12;

type Mode = "pending" | "immersive" | "poster";

/**
 * Homepage hero. The headline, CTAs and search are plain HTML (LCP-safe and
 * usable without 3D). On wide screens without reduced motion, with WebGL and
 * ≥ 4 GB device memory, a scroll-driven 3D story plays behind them across
 * `heroConfig.scrollLengthVh`; everywhere else the static poster is the hero.
 */
export function Hero3D() {
  const t = useTranslations("hero");
  const tHome = useTranslations("home");
  const locale = useLocale();
  const f = useFormat();
  const sectionRef = useRef<HTMLElement>(null);
  const calloutRef = useRef<SVGSVGElement>(null);
  const progressRef = useRef(0);

  const [mode, setMode] = useState<Mode>("pending");
  const [mountCanvas, setMountCanvas] = useState(false);
  const [active, setActive] = useState(true);
  const [ready, setReady] = useState(false);
  const [state, setState] = useState<HeroWorldState>({ cap: -1, swatch: 0, progress: 0 });
  const [paint, setPaint] = useState<number | null>(null);

  // Capability check → immersive or poster.
  useEffect(() => {
    const wide = window.matchMedia("(min-width: 48rem)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const webgl = (() => {
      try {
        const c = document.createElement("canvas");
        return Boolean(c.getContext("webgl2") ?? c.getContext("webgl"));
      } catch {
        return false;
      }
    })();
    const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
    const capable = webgl && !(typeof memory === "number" && memory < 4);
    const evaluate = () => setMode(capable && wide.matches && !reduced.matches ? "immersive" : "poster");
    evaluate();
    wide.addEventListener("change", evaluate);
    reduced.addEventListener("change", evaluate);
    return () => {
      wide.removeEventListener("change", evaluate);
      reduced.removeEventListener("change", evaluate);
    };
  }, []);

  // Mount the canvas once the page is idle, so the headline/poster paint first.
  useEffect(() => {
    if (mode !== "immersive") return;
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number; cancelIdleCallback?: (id: number) => void };
    if (w.requestIdleCallback) {
      const id = w.requestIdleCallback(() => setMountCanvas(true), { timeout: 1500 });
      return () => w.cancelIdleCallback?.(id);
    }
    const id = window.setTimeout(() => setMountCanvas(true), 800);
    return () => window.clearTimeout(id);
  }, [mode]);

  // Scroll progress through the story (0 → 1), read by the render loop.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || mode !== "immersive") return;
    const update = () => {
      const r = el.getBoundingClientRect();
      const total = r.height - window.innerHeight;
      progressRef.current = total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 0;
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    const io = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting), { rootMargin: "100px" });
    io.observe(el);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      io.disconnect();
    };
  }, [mode]);

  const getProgress = useCallback(() => progressRef.current, []);
  const onReady = useCallback(() => setReady(true), []);
  const immersive = mode === "immersive";
  // Narrowing the window (or turning on reduced motion) unmounts the 3D again.
  const showCanvas = mountCanvas && immersive;
  const showIntro = !immersive || !ready || (state.cap === -1 && state.progress < 0.04);

  const goToChapter = (i: number) => {
    const el = sectionRef.current;
    if (!el) return;
    const total = el.offsetHeight - window.innerHeight;
    const top = el.getBoundingClientRect().top + window.scrollY + (CHAPTER_KEYFRAMES[i] / (KEYFRAME_COUNT - 1)) * total;
    window.scrollTo({ top, behavior: "smooth" });
  };

  const calloutLabels = (["c1", "c2", "c3", "c4", "c5", "c6"] as const).map((k) => t(`callouts.${k}`));

  return (
    <section
      ref={sectionRef}
      data-hero
      data-mode={mode}
      aria-labelledby="hero-title"
      className="relative"
      style={{ ["--hero-scroll" as string]: `${heroConfig.scrollLengthVh}vh` }}
    >
      <div className="relative overflow-hidden immersive:sticky immersive:top-0 immersive:h-svh">
        {/* Studio backdrop */}
        <div
          aria-hidden
          className="bg-studio-grid absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_70%_60%_at_60%_45%,black,transparent)]"
        />

        {/* Intro: headline, CTAs, search (always in the DOM) */}
        <div
          className={cn(
            "container-page relative z-10 pt-10 pb-8 transition-[opacity,transform] duration-700 ease-out-soft",
            "immersive:absolute immersive:inset-x-0 immersive:top-[calc(var(--header-h)+3vh)] immersive:pt-0 immersive:pb-0",
            immersive && !showIntro && "pointer-events-none -translate-y-3 opacity-0",
          )}
        >
          <div className="max-w-xl immersive:max-w-md xl:immersive:max-w-lg">
            <p className="eyebrow text-accent-ink">{t("eyebrow")}</p>
            <h1 id="hero-title" className="display-xl mt-5 immersive:display-lg">
              {t("title")} <em className="font-light text-accent-ink">{t("titleAccent")}</em>
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-muted">{t("lead")}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <ButtonLink href="/vehicles" size="lg">
                {t("ctaBrowse")}
              </ButtonLink>
              <ButtonLink href="/test-drive" size="lg" variant="outline">
                {t("ctaTestDrive")}
              </ButtonLink>
            </div>
            <form action={`/${locale}/vehicles`} method="get" role="search" className="relative mt-6 max-w-md">
              <label htmlFor="hero-search" className="sr-only">
                {t("searchLabel")}
              </label>
              <Search aria-hidden className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted" />
              <input
                id="hero-search"
                name="q"
                type="search"
                enterKeyHint="search"
                placeholder={t("searchPlaceholder")}
                className="h-12 w-full rounded-full border border-line-strong bg-bg-alt/85 pr-24 pl-11 text-[0.9375rem] backdrop-blur placeholder:text-muted/80 focus:border-ink focus:ring-2 focus:ring-accent/35 focus:outline-none [&::-webkit-search-cancel-button]:hidden"
              />
              <button
                type="submit"
                className="absolute top-1/2 right-1.5 inline-flex h-9 -translate-y-1/2 items-center gap-1.5 rounded-full bg-ink px-4 text-sm font-medium text-bg-alt hover:bg-ink/85"
              >
                {t("searchSubmit")}
                <ArrowRight aria-hidden className="size-3.5" />
              </button>
            </form>
          </div>
        </div>

        {/* Static poster: LCP-safe first paint and the no-3D fallback */}
        <div
          className={cn(
            "container-page relative pb-16 transition-opacity duration-700",
            "immersive:absolute immersive:inset-0 immersive:flex immersive:max-w-none immersive:items-center immersive:justify-end immersive:pb-0 immersive:pl-[36vw] immersive:pr-[7vw]",
            immersive && ready && "pointer-events-none opacity-0",
          )}
        >
          <div className="mx-auto w-full max-w-3xl immersive:mx-0 immersive:max-w-none">
            <HeroPoster
              label={tHome("poster.alt")}
              callouts={[
                { n: f.number(1, { minimumIntegerDigits: 2 }), label: tHome("poster.callout1") },
                { n: f.number(2, { minimumIntegerDigits: 2 }), label: tHome("poster.callout2") },
                { n: f.number(3, { minimumIntegerDigits: 2 }), label: tHome("poster.callout3") },
              ]}
            />
          </div>
        </div>

        {/* 3D canvas */}
        {showCanvas ? (
          <div className={cn("absolute inset-0 transition-opacity duration-1000", ready ? "opacity-100" : "opacity-0")}>
            <HeroCanvas
              active={active}
              getProgress={getProgress}
              onState={setState}
              onReady={onReady}
              paint={paint}
              calloutSvgRef={calloutRef}
              calloutLabels={calloutLabels}
            />
          </div>
        ) : null}
        <svg ref={calloutRef} aria-hidden className="pointer-events-none absolute inset-0 h-full w-full opacity-0" />

        {immersive ? (
          <>
            {/* Chapter captions (visual; the sr-only list below carries the same text) */}
            <div aria-hidden className="pointer-events-none absolute bottom-24 left-0 right-0">
              <div className="container-page relative h-56">
                {HERO_CHAPTERS.map((ch, i) => (
                  <div
                    key={ch}
                    className={cn(
                      "absolute bottom-0 max-w-xl transition-[opacity,transform] duration-700 ease-out-soft",
                      ready && state.cap === i ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
                    )}
                  >
                    <p className="eyebrow flex items-center gap-3 text-accent-ink">
                      <span aria-hidden className="h-px w-9 bg-accent" />
                      {t(`chapters.${ch}.num`)}
                    </p>
                    <p className="display-lg mt-4">
                      {t(`chapters.${ch}.title`)} <em className="font-light text-accent-ink">{t(`chapters.${ch}.titleAccent`)}</em>
                    </p>
                    <p className="mt-4 max-w-md text-[0.9375rem] leading-relaxed text-muted">{t(`chapters.${ch}.body`)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Finish swatches (chapter II) */}
            <div
              className={cn(
                "absolute right-24 bottom-28 transition-[opacity,transform] duration-700 ease-out-soft",
                ready && state.cap === 1 ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0",
              )}
            >
              <p className="eyebrow mb-4 text-muted">{t("finishTitle")}</p>
              <div role="group" aria-label={t("finishTitle")} className="flex max-w-md flex-wrap gap-x-3 gap-y-4">
                {heroConfig.finishes.map((fin, i) => (
                  <button
                    key={fin.key}
                    type="button"
                    tabIndex={ready && state.cap === 1 ? 0 : -1}
                    aria-pressed={state.swatch === i}
                    onClick={() => setPaint(i)}
                    className="group flex w-16 flex-col items-center gap-2 text-center text-[0.6875rem] leading-tight text-muted aria-pressed:text-ink"
                  >
                    <span
                      className="size-9 rounded-full shadow-[inset_0_0_0_1px_rgba(255,255,255,0.2),0_8px_18px_rgba(0,0,0,0.16)] outline-1 outline-offset-4 outline-transparent transition-[outline-color,transform] group-hover:scale-105 group-aria-pressed:outline-accent"
                      style={{ background: `radial-gradient(circle at 32% 28%, color-mix(in srgb, ${fin.hex} 55%, white) 0%, ${fin.hex} 48%, color-mix(in srgb, ${fin.hex} 50%, black) 100%)` }}
                    />
                    {t(`finishes.${fin.key}`)}
                  </button>
                ))}
              </div>
            </div>

            {/* Chapter index */}
            <nav aria-label={t("chapterNav")} className="absolute top-1/2 right-6 flex -translate-y-1/2 flex-col items-end gap-4 xl:right-12">
              {HERO_CHAPTERS.map((ch, i) => (
                <button
                  key={ch}
                  type="button"
                  onClick={() => goToChapter(i)}
                  aria-current={state.cap === i ? "step" : undefined}
                  className="group flex items-center gap-3 text-[0.6875rem] text-muted"
                >
                  <span className={cn("transition-opacity", state.cap === i ? "text-ink opacity-100" : "opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100")}>
                    {t(`chapters.${ch}.short`)}
                  </span>
                  <span aria-hidden className={cn("h-px transition-all duration-500", state.cap === i ? "w-10 bg-accent" : "w-4 bg-ink/25")} />
                </button>
              ))}
            </nav>

            {/* Progress bar + credit */}
            <div className="container-page absolute inset-x-0 bottom-8 flex items-center gap-6 text-[0.6875rem] text-muted">
              <div aria-hidden className="relative h-px flex-1 bg-line">
                <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-ink to-accent" style={{ width: `${state.progress * 100}%` }} />
              </div>
              <span className="min-w-36 text-right">
                {state.cap >= 0 && state.cap < HERO_CHAPTERS.length ? t(`chapters.${HERO_CHAPTERS[state.cap]}.num`) : t("scrollHint")}
              </span>
            </div>
            {ready ? (
              <p className="absolute right-6 bottom-2 text-[0.625rem] text-muted/80 xl:right-12">
                {t.rich("credit", {
                  model: (chunks) => (
                    <a href={heroConfig.credit.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline-offset-2 hover:underline">
                      {chunks}
                    </a>
                  ),
                  licence: (chunks) => (
                    <a href={heroConfig.credit.licenceUrl} target="_blank" rel="noopener noreferrer" className="underline-offset-2 hover:underline">
                      {chunks}
                    </a>
                  ),
                  title: heroConfig.credit.title,
                  author: heroConfig.credit.author,
                  holder: heroConfig.credit.holder,
                  year: String(heroConfig.credit.year),
                  licenceName: heroConfig.credit.licence,
                })}
              </p>
            ) : (
              <p className="absolute right-6 bottom-2 text-[0.625rem] text-muted xl:right-12" role="status">
                {showCanvas ? t("loading3d") : ""}
              </p>
            )}
          </>
        ) : null}
      </div>

      {/* The story for screen readers (the visual captions are aria-hidden). */}
      <ol className="sr-only">
        {HERO_CHAPTERS.map((ch) => (
          <li key={ch}>
            {t(`chapters.${ch}.title`)} {t(`chapters.${ch}.titleAccent`)}. {t(`chapters.${ch}.body`)}
          </li>
        ))}
      </ol>
    </section>
  );
}

"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, Search } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { ButtonLink } from "@/components/ui/Button";
import { HERO_CHAPTER_KEYFRAMES, HERO_CHAPTERS, HERO_FINALE, HERO_KEYFRAME_COUNT, heroConfig } from "@/config/hero";
import { useFormat } from "@/lib/format/useFormat";
import { cn } from "@/lib/utils";
import type { HeroWorldState } from "@/components/three/heroWorld";
import { HeroPoster } from "./HeroPoster";

// three.js + R3F load only here, only on capable devices, after first paint.
const HeroCanvas = dynamic(() => import("@/components/three/HeroCanvas"), { ssr: false });

const LAST_CHAPTER = HERO_CHAPTERS.length - 1;

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
  const stageRef = useRef<HTMLDivElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);

  const [mode, setMode] = useState<Mode>("pending");
  const [mountCanvas, setMountCanvas] = useState(false);
  const [active, setActive] = useState(true);
  const [ready, setReady] = useState(false);
  /** The real car is showing (false while loading, or if it failed and the procedural car stayed). */
  const [modelShown, setModelShown] = useState(false);
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
  const onReady = useCallback((withModel: boolean) => {
    setModelShown(withModel);
    setReady(true);
  }, []);
  const immersive = mode === "immersive";
  // Narrowing the window (or turning on reduced motion) unmounts the 3D again.
  const showCanvas = mountCanvas && immersive;
  const showIntro = !immersive || !ready || (state.cap === -1 && state.progress < 0.04);

  const goToChapter = (i: number) => {
    const el = sectionRef.current;
    if (!el) return;
    const total = el.offsetHeight - window.innerHeight;
    const top = el.getBoundingClientRect().top + window.scrollY + (HERO_CHAPTER_KEYFRAMES[i] / (HERO_KEYFRAME_COUNT - 1)) * total;
    window.scrollTo({ top, behavior: "smooth" });
  };

  const calloutLabels = (["c1", "c2", "c3", "c4", "c5", "c6"] as const).map((k) => t(`callouts.${k}`));
  /** Chapter shown in the index and progress label (the finale belongs to the last chapter). */
  const chapter = ready && state.cap >= 0 ? Math.min(state.cap, LAST_CHAPTER) : -1;
  const finale = ready && state.cap === HERO_FINALE;

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
          className={cn(
            "bg-studio-grid absolute inset-0 opacity-60 transition-opacity duration-1000 [mask-image:radial-gradient(ellipse_70%_60%_at_60%_45%,black,transparent)]",
            immersive && !showIntro && "opacity-0",
          )}
        />

        {/* Stage behind the car: faint wordmark (intro, chapter I) and the chapter numeral, with pointer parallax. */}
        {immersive ? (
          <div ref={stageRef} aria-hidden className="hero-stage">
            <div className={cn("hero-bigword", ready && state.cap <= 0 && "is-on")}>{t("stageWord")}</div>
            {HERO_CHAPTERS.map((ch, i) => (
              <div key={ch} className={cn("hero-numeral", ready && state.cap === i && "is-on")}>
                {t(`chapters.${ch}.numeral`)}
              </div>
            ))}
          </div>
        ) : null}

        {/* Intro: headline, CTAs, search (always in the DOM) */}
        <div
          className={cn(
            "container-page relative z-10 pt-10 pb-8 transition-[opacity,transform] duration-700 ease-out-soft",
            "immersive:absolute immersive:inset-x-0 immersive:top-[calc(var(--header-h)+3vh)] immersive:pt-0 immersive:pb-0",
            immersive && !showIntro && "pointer-events-none -translate-y-3 opacity-0",
          )}
        >
          <div ref={introRef} className="max-w-xl immersive:max-w-md xl:immersive:max-w-lg">
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

        {/* Static poster: the hero image when there's no 3D (phones, reduced motion, no WebGL).
            Hidden wherever the 3D story runs, so it never shows under or cross-fades with the animated car. */}
        <div className="container-page relative pb-16 immersive:hidden">
          <div className="mx-auto w-full max-w-3xl">
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
          <div className={cn("hero-frame absolute transition-opacity duration-1000", ready ? "opacity-100" : "opacity-0")}>
            <HeroCanvas
              active={active}
              getProgress={getProgress}
              onState={setState}
              onReady={onReady}
              paint={paint}
              calloutSvgRef={calloutRef}
              calloutLabels={calloutLabels}
              stageRef={stageRef}
              introRef={introRef}
            />
          </div>
        ) : null}
        {immersive ? (
          <>
            <div aria-hidden className="hero-vignette" />
            <div aria-hidden className="hero-grain" />
          </>
        ) : null}
        <svg ref={calloutRef} aria-hidden className="hero-frame pointer-events-none absolute opacity-0" />

        {immersive ? (
          <>
            {/* Chapter captions (visual; the sr-only list below carries the same text) */}
            <div aria-hidden className="pointer-events-none absolute bottom-24 left-0 right-0">
              <div className="container-page relative h-56">
                {/* Soft backing so the caption stays legible while the car moves behind it. */}
                <div
                  className={cn(
                    "absolute -bottom-6 -left-12 h-[calc(100%+3rem)] w-[min(40rem,80vw)] rounded-[50%] bg-bg/70 blur-3xl transition-opacity duration-700",
                    ready && state.cap >= 0 && state.cap <= LAST_CHAPTER ? "opacity-100" : "opacity-0",
                  )}
                />
                {HERO_CHAPTERS.map((ch, i) => {
                  const title = t(`chapters.${ch}.title`);
                  return (
                    <div key={ch} data-on={ready && state.cap === i ? "" : undefined} className="hero-cap absolute bottom-0 max-w-2xl">
                      <p className="hero-cap-num eyebrow flex items-center gap-3 text-accent-ink">{t(`chapters.${ch}.num`)}</p>
                      <p className="display-lg mt-4">
                        <Reveal text={title} by={locale === "en" ? "letter" : "word"} />{" "}
                        <em className="font-light text-accent-ink">
                          <Reveal text={t(`chapters.${ch}.titleAccent`)} by={locale === "en" ? "letter" : "word"} from={title.length} />
                        </em>
                      </p>
                      <p className="hero-cap-body mt-4 max-w-md text-[0.9375rem] leading-relaxed text-muted">{t(`chapters.${ch}.body`)}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Finish swatches (chapter III) */}
            <div
              className={cn(
                "absolute right-24 bottom-28 transition-[opacity,transform] duration-700 ease-out-soft",
                ready && state.cap === 2 ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0",
              )}
            >
              <p className="eyebrow mb-4 text-muted">{t("finishTitle")}</p>
              <div role="group" aria-label={t("finishTitle")} className="flex max-w-md flex-wrap gap-x-3 gap-y-4">
                {heroConfig.finishes.map((fin, i) => (
                  <button
                    key={fin.key}
                    type="button"
                    tabIndex={ready && state.cap === 2 ? 0 : -1}
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
                  aria-current={chapter === i ? "step" : undefined}
                  className="group flex items-center gap-3 text-[0.6875rem] text-muted"
                >
                  <span className={cn("transition-opacity", chapter === i ? "text-ink opacity-100" : "opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100")}>
                    {t(`chapters.${ch}.short`)}
                  </span>
                  <span aria-hidden className={cn("h-px transition-all duration-700", chapter === i ? "w-10 bg-accent" : "w-4 bg-ink/25")} />
                </button>
              ))}
            </nav>

            {/* Finale over the tunnel (the reference's closing card), with the homepage's own headline and CTAs. */}
            <div
              inert={!finale}
              className={cn(
                "absolute inset-0 isolate flex flex-col items-center justify-center text-center transition-opacity duration-1000",
                finale ? "opacity-100" : "pointer-events-none opacity-0",
              )}
            >
              <div aria-hidden className="hero-finale-veil absolute inset-0 -z-10" />
              <p className="eyebrow flex items-center gap-4 text-accent-ink">
                <span aria-hidden className="h-px w-9 bg-accent" />
                {t("eyebrow")}
                <span aria-hidden className="h-px w-9 bg-accent" />
              </p>
              <p aria-hidden className="display-xl mt-6">
                {t("title")}
                <br />
                <em className="font-light text-accent-ink">{t("titleAccent")}</em>
              </p>
              <p className="mt-6 text-[0.9375rem] text-muted">{t("finaleLead")}</p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <ButtonLink href="/test-drive" size="lg">
                  {t("ctaTestDrive")}
                </ButtonLink>
                <ButtonLink href="/vehicles" size="lg" variant="outline">
                  {t("ctaBrowse")}
                </ButtonLink>
              </div>
            </div>

            {/* Progress bar + credit */}
            <div className="container-page absolute inset-x-0 bottom-8 flex items-center gap-6 text-[0.6875rem] text-muted">
              <div aria-hidden className="relative h-px flex-1 bg-line">
                <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-ink to-accent" style={{ width: `${state.progress * 100}%` }} />
              </div>
              <span className="min-w-36 text-right">
                {chapter >= 0 ? t(`chapters.${HERO_CHAPTERS[chapter]}.num`) : t("scrollHint")}
              </span>
            </div>
            {ready && modelShown ? (
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
                {showCanvas && !ready ? t("loading3d") : ""}
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

/**
 * Masked rise-in for a caption line, as in the reference: each unit slides up out of
 * its word's clip box, staggered. English goes letter by letter; Bangla word by word,
 * because splitting letters would break conjuncts and vowel signs.
 */
function Reveal({ text, by, from = 0 }: { text: string; by: "letter" | "word"; from?: number }) {
  let i = from;
  const words = text.split(/\s+/).filter(Boolean);
  return words.map((word, w) => (
    <span key={w}>
      {w > 0 ? " " : null}
      <span className="hero-w">
        {(by === "letter" ? [...word] : [word]).map((unit, u) => (
          <span key={u} className="hero-l" style={{ ["--i" as string]: i++ }}>
            {unit}
          </span>
        ))}
      </span>
    </span>
  ));
}

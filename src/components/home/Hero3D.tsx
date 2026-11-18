"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { ArrowDown, ArrowRight, Minus, Plus, RotateCcw, RotateCw, Search, Undo2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { ButtonLink } from "@/components/ui/Button";
import { HERO_CHAPTER_KEYFRAMES, HERO_CHAPTERS, HERO_EXPLORE, HERO_KEYFRAME_COUNT, heroConfig, heroModel } from "@/config/hero";
import { useFormat } from "@/lib/format/useFormat";
import { cn } from "@/lib/utils";
import type { ExploreApi, ExploreView, HeroWorldState } from "@/components/three/heroWorld";
import { HeroPoster } from "./HeroPoster";

// three.js + R3F load only here, only on capable devices, after first paint.
const HeroCanvas = dynamic(() => import("@/components/three/HeroCanvas"), { ssr: false });

/** Studio colour the 3D scene fades into; matches the immersive hero backdrop below. */
const STUDIO_FOG = "#0a0f19";
const EXPLORE_VIEWS: ExploreView[] = ["front", "threeQuarter", "side", "rear"];

/**
 * The 3D frame (canvas, callouts, drag surface) sits below the compact sticky header,
 * so the whole frame is visible. Inline on purpose: the canvas must never end up 0×0
 * (React Three Fiber renders nothing then), whatever the stylesheet.
 */
const FRAME_STYLE = {
  position: "absolute",
  top: "var(--header-h-compact)",
  left: 0,
  width: "100%",
  height: "calc(100% - var(--header-h-compact))",
} as const;

type Mode = "pending" | "immersive" | "poster";

/**
 * Homepage hero. The headline, CTAs and search are plain HTML (LCP-safe and
 * usable without 3D). On screens at least 32rem tall (phones held upright too) without reduced motion, with WebGL and
 * ≥ 4 GB device memory, the car plays a cinematic intro in a dark studio and a
 * scroll story across `heroConfig.scrollLengthVh`, ending in Explore, where the
 * visitor turns the car themselves. Everywhere else (and if the model fails to
 * load) the static poster is the hero.
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
  const exploreRef = useRef<ExploreApi | null>(null);
  const progressRef = useRef(0);
  const drag = useRef<{ id: number; x: number; y: number } | null>(null);

  const [mode, setMode] = useState<Mode>("pending");
  const [failed, setFailed] = useState(false);
  const [mountCanvas, setMountCanvas] = useState(false);
  const [active, setActive] = useState(true);
  const [ready, setReady] = useState(false);
  const [state, setState] = useState<HeroWorldState>({ cap: -1, progress: 0 });

  // Capability check → immersive or poster.
  useEffect(() => {
    // Same condition as the `immersive` CSS variant (globals.css): any width, but not a short landscape phone.
    const wide = window.matchMedia("(min-height: 32rem)");
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
    const capable = webgl && !(typeof memory === "number" && memory < 4) && !failed;
    const evaluate = () => setMode(capable && wide.matches && !reduced.matches ? "immersive" : "poster");
    evaluate();
    wide.addEventListener("change", evaluate);
    reduced.addEventListener("change", evaluate);
    return () => {
      wide.removeEventListener("change", evaluate);
      reduced.removeEventListener("change", evaluate);
    };
  }, [failed]);

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
  const onFail = useCallback(() => setFailed(true), []);
  const immersive = mode === "immersive";
  // Narrowing the window (or turning on reduced motion) unmounts the 3D again.
  const showCanvas = mountCanvas && immersive;
  const showIntro = !immersive || !ready || (state.cap === -1 && state.progress < 0.03);
  const chapter = ready && state.cap >= 0 ? state.cap : -1;
  const exploring = ready && state.cap === HERO_EXPLORE;
  const ending = ready && state.progress > 0.965;

  const goToChapter = (i: number) => {
    const el = sectionRef.current;
    if (!el) return;
    const total = el.offsetHeight - window.innerHeight;
    const top = el.getBoundingClientRect().top + window.scrollY + (HERO_CHAPTER_KEYFRAMES[i] / (HERO_KEYFRAME_COUNT - 1)) * total;
    window.scrollTo({ top, behavior: "smooth" });
  };

  // Explore: drag to turn the car (horizontal drags only; vertical swipes still scroll the page).
  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    exploreRef.current?.rotate(-(e.clientX - d.x) * 0.006, (e.clientY - d.y) * 0.004);
    d.x = e.clientX;
    d.y = e.clientY;
  };
  const endDrag = () => {
    drag.current = null;
  };

  const features = heroModel.features.map((ft) => ({ label: t(`features.${ft.key}`), at: ft.at }));
  const tool =
    "grid size-10 place-items-center rounded-full border border-line-on-dark text-on-dark transition-[background-color,border-color,color] duration-300 hover:border-on-dark hover:bg-on-dark hover:text-ink";

  return (
    <section
      ref={sectionRef}
      data-hero
      data-mode={mode}
      aria-labelledby="hero-title"
      className="relative"
      style={{ ["--hero-scroll" as string]: `${heroConfig.scrollLengthVh}vh` }}
    >
      <div
        data-header-dark={immersive ? "" : undefined}
        className="relative overflow-hidden immersive:sticky immersive:top-0 immersive:h-svh immersive:bg-[radial-gradient(120%_80%_at_70%_35%,#152036_0%,#0c1322_45%,#070a11_100%)]"
      >
        {/* Light studio grid behind the poster (landscape phones, reduced motion, no WebGL). */}
        <div
          aria-hidden
          className="bg-studio-grid absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_70%_60%_at_60%_45%,black,transparent)] immersive:hidden"
        />

        {/* Stage behind the car: faint wordmark (hero) and the chapter numeral, with pointer parallax. */}
        {immersive ? (
          <div ref={stageRef} aria-hidden className="hero-stage">
            <div className={cn("hero-bigword", ready && state.cap < 0 && "is-on")}>{t("stageWord")}</div>
            {HERO_CHAPTERS.map((ch, i) => (
              <div key={ch} className={cn("hero-numeral", chapter === i && "is-on")}>
                {t(`chapters.${ch}.numeral`)}
              </div>
            ))}
          </div>
        ) : null}

        {/* Scrim behind the headline, so the copy stays legible over the studio. */}
        {immersive ? (
          <div
            aria-hidden
            className={cn(
              "pointer-events-none absolute inset-y-0 left-0 z-[5] w-[62%] bg-gradient-to-r from-[#070a11]/85 via-[#070a11]/45 to-transparent transition-opacity duration-1000",
              // Phones: the headline spans the top, the car sits below it.
              "max-md:bottom-auto max-md:h-[62%] max-md:w-full max-md:bg-gradient-to-b",
              showIntro ? "opacity-100" : "opacity-0",
            )}
          />
        ) : null}

        {/* Intro: headline, CTAs, search (always in the DOM; light on the dark studio). */}
        <div
          className={cn(
            "container-page relative z-10 pt-10 pb-8 transition-[opacity,transform] duration-700 ease-out-soft",
            "immersive:absolute immersive:inset-x-0 immersive:top-[calc(var(--header-h)+3vh)] immersive:pt-0 immersive:pb-0 immersive:text-on-dark",
            // Phones: tighter, so the car has room under the text.
            "max-sm:immersive:top-[calc(var(--header-h)+1rem)]",
            immersive && !showIntro && "pointer-events-none -translate-y-3 opacity-0",
          )}
        >
          <div ref={introRef} className="max-w-xl immersive:max-w-md xl:immersive:max-w-lg">
            {/* Layered entrance on load. The headline only moves (never fades), so it paints at once and stays the LCP element. */}
            <p className="eyebrow flex items-center gap-3 text-accent-ink motion-safe:animate-[hero-rise_1s_var(--ease-cinema)_both] immersive:text-accent-2">
              <span aria-hidden className="h-px w-10 bg-accent" />
              {t("eyebrow")}
            </p>
            <h1 id="hero-title" className="display-xl mt-5 motion-safe:animate-[hero-lift_1.2s_var(--ease-cinema)_both] immersive:display-lg max-sm:immersive:mt-3">
              {t("title")} <em className="font-light text-accent-ink immersive:text-accent-2">{t("titleAccent")}</em>
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-muted motion-safe:animate-[hero-rise_1s_var(--ease-cinema)_0.15s_both] immersive:text-muted-on-dark max-sm:immersive:mt-3 max-sm:immersive:text-[0.9375rem]">
              {t("lead")}
            </p>
            <div className="mt-7 flex flex-wrap gap-3 motion-safe:animate-[hero-rise_1s_var(--ease-cinema)_0.3s_both] max-sm:immersive:mt-5 max-sm:immersive:gap-2">
              <ButtonLink href="/vehicles" size="lg" className="sheen immersive:bg-on-dark immersive:text-ink immersive:hover:bg-white max-sm:immersive:h-11 max-sm:immersive:px-5 max-sm:immersive:text-sm">
                {t("ctaBrowse")}
              </ButtonLink>
              <ButtonLink
                href="/test-drive"
                size="lg"
                variant="outline"
                className="immersive:border-line-on-dark immersive:text-on-dark immersive:hover:border-on-dark immersive:hover:bg-white/5 max-sm:immersive:h-11 max-sm:immersive:px-5 max-sm:immersive:text-sm"
              >
                {t("ctaTestDrive")}
              </ButtonLink>
            </div>
            <form action={`/${locale}/vehicles`} method="get" role="search" className="relative mt-6 max-w-md motion-safe:animate-[hero-rise_1s_var(--ease-cinema)_0.45s_both] max-sm:immersive:mt-4">
              <label htmlFor="hero-search" className="sr-only">
                {t("searchLabel")}
              </label>
              <Search aria-hidden className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted immersive:text-muted-on-dark" />
              <input
                id="hero-search"
                name="q"
                type="search"
                enterKeyHint="search"
                placeholder={t("searchPlaceholder")}
                className="h-12 w-full rounded-full border border-line-strong bg-bg-alt/85 pr-24 pl-11 text-[0.9375rem] backdrop-blur placeholder:text-muted/80 focus:border-ink focus:ring-2 focus:ring-accent/35 focus:outline-none immersive:border-line-on-dark immersive:bg-white/[0.06] immersive:text-on-dark immersive:placeholder:text-muted-on-dark immersive:focus:border-on-dark [&::-webkit-search-cancel-button]:hidden"
              />
              <button
                type="submit"
                className="absolute top-1/2 right-1.5 inline-flex h-9 -translate-y-1/2 items-center gap-1.5 rounded-full bg-ink px-4 text-sm font-medium text-bg-alt hover:bg-ink/85 immersive:bg-on-dark immersive:text-ink immersive:hover:bg-white"
              >
                {t("searchSubmit")}
                <ArrowRight aria-hidden className="size-3.5" />
              </button>
            </form>
          </div>
        </div>

        {/* Static poster: the hero image when there's no 3D (landscape phones, reduced motion, no WebGL, model unavailable).
            Hidden wherever the 3D story runs, so it never shows under or cross-fades with the animated car. */}
        <div className="container-page relative pb-24 immersive:hidden">
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
          <div style={FRAME_STYLE} className={cn("transition-opacity duration-[1600ms]", ready ? "opacity-100" : "opacity-0")}>
            <HeroCanvas
              active={active}
              getProgress={getProgress}
              onState={setState}
              onReady={onReady}
              onFail={onFail}
              calloutSvgRef={calloutRef}
              features={features}
              stageRef={stageRef}
              introRef={introRef}
              exploreRef={exploreRef}
              fogHex={STUDIO_FOG}
            />
          </div>
        ) : null}
        {immersive ? (
          <>
            <div aria-hidden className="hero-vignette" />
            <div aria-hidden className="hero-grain" />
          </>
        ) : null}
        <svg ref={calloutRef} aria-hidden style={FRAME_STYLE} className="pointer-events-none opacity-0" />

        {immersive ? (
          <>
            {/* Explore: drag surface over the car (horizontal drags turn it; vertical swipes still scroll). */}
            <div
              aria-hidden
              style={FRAME_STYLE}
              className={cn("touch-pan-y select-none", exploring ? "cursor-grab active:cursor-grabbing" : "pointer-events-none")}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
            />

            {/* Chapter captions (visual; the sr-only list below carries the same text) */}
            <div aria-hidden className="pointer-events-none absolute right-0 bottom-24 left-0 text-on-dark">
              <div className="container-page relative h-56">
                {/* Soft backing so the caption stays legible while the car moves behind it. */}
                <div
                  className={cn(
                    "absolute -bottom-6 -left-12 h-[calc(100%+3rem)] w-[min(40rem,80vw)] rounded-[50%] bg-[#070a11]/60 blur-3xl transition-opacity duration-700",
                    chapter >= 0 ? "opacity-100" : "opacity-0",
                  )}
                />
                {HERO_CHAPTERS.map((ch, i) => {
                  const title = t(`chapters.${ch}.title`);
                  return (
                    <div
                      key={ch}
                      data-on={chapter === i ? "" : undefined}
                      // On phones the Explore controls take the caption's place.
                      className={cn("hero-cap absolute bottom-0 max-w-2xl", ch === "explore" && "max-md:hidden")}
                    >
                      <p className="hero-cap-num eyebrow flex items-center gap-3 text-accent-2">{t(`chapters.${ch}.num`)}</p>
                      <p className="display-lg mt-4">
                        <Reveal text={title} by={locale === "en" ? "letter" : "word"} />{" "}
                        <em className="font-light text-accent-2">
                          <Reveal text={t(`chapters.${ch}.titleAccent`)} by={locale === "en" ? "letter" : "word"} from={title.length} />
                        </em>
                      </p>
                      <p className="hero-cap-body mt-4 max-w-md text-[0.9375rem] leading-relaxed text-muted-on-dark">{t(`chapters.${ch}.body`)}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Explore: take the camera, then book the real thing. */}
            <div
              inert={!exploring}
              className={cn(
                "absolute right-6 bottom-24 flex flex-col items-end gap-4 transition-[opacity,transform] duration-700 ease-(--ease-cinema) max-md:left-4 max-md:right-4 max-md:bottom-20 max-md:gap-3 xl:right-12",
                exploring ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0",
              )}
            >
              <p className="text-xs text-muted-on-dark">{t("explore.hint")}</p>
              <div role="group" aria-label={t("explore.views")} className="flex flex-wrap justify-end gap-1.5">
                {EXPLORE_VIEWS.map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => exploreRef.current?.view(v)}
                    className="h-9 rounded-full border border-line-on-dark px-3.5 text-xs text-on-dark transition-[background-color,border-color,color] duration-300 hover:border-on-dark hover:bg-on-dark hover:text-ink"
                  >
                    {t(`explore.view.${v}`)}
                  </button>
                ))}
              </div>
              <div className="flex gap-1.5">
                <button type="button" className={tool} onClick={() => exploreRef.current?.rotate(0.5, 0)} aria-label={t("explore.left")}>
                  <RotateCcw aria-hidden className="size-4" />
                </button>
                <button type="button" className={tool} onClick={() => exploreRef.current?.rotate(-0.5, 0)} aria-label={t("explore.right")}>
                  <RotateCw aria-hidden className="size-4" />
                </button>
                <button type="button" className={tool} onClick={() => exploreRef.current?.zoom(0.85)} aria-label={t("explore.zoomIn")}>
                  <Plus aria-hidden className="size-4" />
                </button>
                <button type="button" className={tool} onClick={() => exploreRef.current?.zoom(1 / 0.85)} aria-label={t("explore.zoomOut")}>
                  <Minus aria-hidden className="size-4" />
                </button>
                <button type="button" className={tool} onClick={() => exploreRef.current?.reset()} aria-label={t("explore.reset")}>
                  <Undo2 aria-hidden className="size-4" />
                </button>
              </div>
              <div className="mt-2 flex flex-wrap justify-end gap-3 max-md:mt-0 max-md:gap-2">
                <ButtonLink href="/test-drive" size="lg" variant="light" className="sheen max-md:h-11 max-md:px-5 max-md:text-sm">
                  {t("ctaTestDrive")}
                </ButtonLink>
                <ButtonLink href="/vehicles" size="lg" variant="outline-light" className="max-md:h-11 max-md:px-5 max-md:text-sm">
                  {t("ctaBrowse")}
                </ButtonLink>
              </div>
            </div>

            {/* Chapter index */}
            <nav aria-label={t("chapterNav")} className="absolute top-1/2 right-6 flex -translate-y-1/2 flex-col items-end gap-4 max-md:hidden xl:right-12">
              {HERO_CHAPTERS.map((ch, i) => (
                <button
                  key={ch}
                  type="button"
                  onClick={() => goToChapter(i)}
                  aria-current={chapter === i ? "step" : undefined}
                  className="group flex items-center gap-3 text-[0.6875rem] text-muted-on-dark"
                >
                  <span className={cn("transition-opacity", chapter === i ? "text-on-dark opacity-100" : "opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100")}>
                    {t(`chapters.${ch}.short`)}
                  </span>
                  <span aria-hidden className={cn("h-px transition-all duration-700", chapter === i ? "w-10 bg-accent-2" : "w-4 bg-on-dark/30")} />
                </button>
              ))}
            </nav>

            {/* Hand-off: as the story ends, the frame's lower edge melts into the page under the rising search console. */}
            <div
              aria-hidden
              className={cn(
                "pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-bg via-bg/60 to-transparent transition-opacity duration-1000",
                ending ? "opacity-100" : "opacity-0",
              )}
            />

            {/* Progress bar + skip + credit */}
            <div className="container-page absolute inset-x-0 bottom-8 flex items-center gap-4 text-[0.6875rem] text-muted-on-dark sm:gap-6">
              {/* The story is long; this jumps straight to the search console below it. */}
              <a
                href="#find"
                className={cn(
                  "group inline-flex h-8 items-center gap-1.5 rounded-full border border-line-on-dark px-3.5 text-on-dark transition-[background-color,color,border-color,opacity] duration-300 hover:border-on-dark hover:bg-on-dark hover:text-ink",
                  ending && "pointer-events-none opacity-0",
                )}
                tabIndex={ending ? -1 : undefined}
              >
                {t("skipStory")}
                <ArrowDown aria-hidden className="size-3.5 transition-transform duration-300 group-hover:translate-y-0.5" />
              </a>
              <div aria-hidden className="relative h-px flex-1 bg-line-on-dark">
                <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-on-dark/60 to-accent-2" style={{ width: `${state.progress * 100}%` }} />
              </div>
              <span className="text-right sm:min-w-36">{chapter >= 0 ? t(`chapters.${HERO_CHAPTERS[chapter]}.num`) : t("scrollHint")}</span>
            </div>
            {ready ? (
              <p className="absolute right-6 bottom-2 text-[0.625rem] text-muted-on-dark xl:right-12">
                {t.rich("credit", {
                  model: (chunks) => (
                    <a href={heroModel.credit.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline-offset-2 hover:underline">
                      {chunks}
                    </a>
                  ),
                  licence: (chunks) => (
                    <a href={heroModel.credit.licenceUrl} target="_blank" rel="noopener noreferrer" className="underline-offset-2 hover:underline">
                      {chunks}
                    </a>
                  ),
                  title: heroModel.credit.title,
                  author: heroModel.credit.author,
                  holder: heroModel.credit.holder,
                  year: String(heroModel.credit.year),
                  licenceName: heroModel.credit.licence,
                })}
              </p>
            ) : (
              <p className="absolute right-6 bottom-2 text-[0.625rem] text-muted-on-dark xl:right-12" role="status">
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

/**
 * Masked rise-in for a caption line: each unit slides up out of its word's clip
 * box, staggered. English goes letter by letter; Bangla word by word, because
 * splitting letters would break conjuncts and vowel signs.
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

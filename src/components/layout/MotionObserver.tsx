"use client";

import { useEffect } from "react";

const SELECTOR = "[data-reveal]";

/**
 * Drives the CSS reveal system (globals.css → "Motion system"): one shared
 * IntersectionObserver marks each `[data-reveal]` element with `data-shown` as
 * it enters the viewport, including content that streams in or arrives with a
 * client navigation. Elements already on screen are shown before the start
 * states switch on, so nothing visible ever blinks out. With reduced motion it
 * does nothing and the CSS leaves everything visible.
 */
export function MotionObserver() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const root = document.documentElement;
    const show = (el: Element) => el.setAttribute("data-shown", "");

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          show(entry.target);
          io.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );

    const track = (el: Element) => {
      if (el.hasAttribute("data-shown")) return;
      io.observe(el);
    };
    const scan = (node: ParentNode) => node.querySelectorAll(SELECTOR).forEach(track);

    // Show what's already in view, then switch the start states on.
    document.querySelectorAll(SELECTOR).forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.bottom > 0 && r.top < window.innerHeight && r.width > 0) show(el);
    });
    root.setAttribute("data-motion", "");
    scan(document);

    const mo = new MutationObserver((records) => {
      for (const record of records) {
        record.addedNodes.forEach((node) => {
          if (!(node instanceof Element)) return;
          if (node.matches(SELECTOR)) track(node);
          scan(node);
        });
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
      root.removeAttribute("data-motion");
    };
  }, []);
  return null;
}

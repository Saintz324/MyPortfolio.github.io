"use client";

import { useEffect, type RefObject } from "react";
import { gsap } from "@/lib/gsap";

type Options = { strength?: number; inner?: RefObject<HTMLElement | null>; innerStrength?: number };

/**
 * Pulls an element toward the pointer while hovered and springs it back on leave.
 * Fine pointers only; disabled for reduced motion.
 */
export function useMagnetic(ref: RefObject<HTMLElement | null>, { strength = 0.35, inner, innerStrength = 0.2 }: Options = {}) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;

    const xTo = gsap.quickTo(el, "x", { duration: 0.6, ease: "power3.out" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.6, ease: "power3.out" });
    const innerEl = inner?.current;
    const ixTo = innerEl ? gsap.quickTo(innerEl, "x", { duration: 0.6, ease: "power3.out" }) : null;
    const iyTo = innerEl ? gsap.quickTo(innerEl, "y", { duration: 0.6, ease: "power3.out" }) : null;

    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      xTo(dx * strength);
      yTo(dy * strength);
      ixTo?.(dx * innerStrength);
      iyTo?.(dy * innerStrength);
    };
    const leave = () => {
      gsap.to(el, { x: 0, y: 0, duration: 1.1, ease: "elastic.out(1, 0.35)", overwrite: true });
      if (innerEl) gsap.to(innerEl, { x: 0, y: 0, duration: 1.1, ease: "elastic.out(1, 0.35)", overwrite: true });
    };

    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
      gsap.killTweensOf([el, innerEl].filter(Boolean));
    };
  }, [ref, inner, strength, innerStrength]);
}

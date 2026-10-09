"use client";

import { createContext, useContext } from "react";
import type Lenis from "lenis";

export const LenisContext = createContext<Lenis | null>(null);

/** Lenis instance (null when reduced motion disables smooth scrolling). */
export function useLenis() {
  return useContext(LenisContext);
}

/** Scrolls to a section id, smoothly when Lenis is active. */
export function scrollToId(lenis: Lenis | null, id: string) {
  const target = id === "top" ? 0 : document.getElementById(id);
  if (target === null) return;
  if (lenis) {
    lenis.scrollTo(target, { duration: 1.6, easing: (t) => 1 - Math.pow(1 - t, 4) });
  } else if (target === 0) {
    window.scrollTo({ top: 0 });
  } else {
    target.scrollIntoView();
  }
}

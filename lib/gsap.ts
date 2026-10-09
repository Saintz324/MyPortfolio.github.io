"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
  gsap.defaults({ ease: "expo.out", duration: 1 });
  ScrollTrigger.config({ ignoreMobileResize: true });
}

/** Shared easing vocabulary: slow, physical, cinematic. */
export const ease = {
  out: "expo.out",
  inOut: "expo.inOut",
  soft: "power3.out",
  none: "none",
} as const;

/** Query matching the full-motion experience. Everything else gets a static layout. */
export const MOTION_OK = "(prefers-reduced-motion: no-preference)";

export { gsap, ScrollTrigger, useGSAP };

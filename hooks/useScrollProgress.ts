"use client";

import { world } from "@/lib/world";

/**
 * Read-only accessors for the scroll state. Values update every frame without
 * re-rendering React: call them from animation loops (useFrame, gsap.ticker).
 */
export function useScrollProgress() {
  return {
    /** Continuous scene timeline (0 hero ... 6 end). */
    timeline: () => world.t,
    /** Whole-page progress 0..1. */
    progress: () => {
      const max = world.anchors[world.anchors.length - 1] || 1;
      return Math.min(1, world.scroll / max);
    },
    scroll: () => world.scroll,
  };
}

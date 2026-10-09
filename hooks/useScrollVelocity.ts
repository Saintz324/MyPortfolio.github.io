"use client";

import { world } from "@/lib/world";

/** Eased absolute scroll speed (0 at rest, ~1 for a fast flick) and the raw signed velocity. */
export function useScrollVelocity() {
  return {
    speed: () => world.speed,
    velocity: () => world.velocity,
  };
}

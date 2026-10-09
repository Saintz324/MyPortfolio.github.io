"use client";

import { world } from "@/lib/world";

/**
 * Pointer position in normalized coordinates (-1..1).
 * `raw` follows the pointer, `eased` trails it with inertia. Both are mutable objects
 * updated by SmoothScroll; read them inside animation loops.
 */
export function useMousePosition() {
  return { raw: world.mouse, eased: world.mouseEased };
}

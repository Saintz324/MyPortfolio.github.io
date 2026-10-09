"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { cursorLabel } from "@/lib/world";
import { useMediaQuery } from "@/hooks/useMediaQuery";

/**
 * Custom cursor (fine pointers only).
 * A small inverted dot that trails the pointer with inertia, snaps slightly toward
 * magnetic targets and expands into a label: View for links, Open for projects,
 * Explore for the 3D world. Labels come from `data-cursor` or from the 3D scene.
 */
export function Cursor() {
  const fine = useMediaQuery("(hover: hover) and (pointer: fine)");
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const root = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState<string | null>(null);
  const [pressed, setPressed] = useState(false);
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    if (!fine || !root.current) return;
    const el = root.current;
    document.documentElement.classList.add("has-cursor");
    const xTo = gsap.quickTo(el, "x", { duration: reduced ? 0 : 0.45, ease: "power3.out" });
    const yTo = gsap.quickTo(el, "y", { duration: reduced ? 0 : 0.45, ease: "power3.out" });

    let domLabel: string | null = null;
    let sceneLabel: string | null = cursorLabel.get();
    const sync = () => setLabel(domLabel ?? sceneLabel);

    const move = (e: PointerEvent) => {
      setHidden(false);
      let x = e.clientX;
      let y = e.clientY;
      const target = e.target instanceof Element ? e.target.closest<HTMLElement>("[data-magnetic]") : null;
      if (target) {
        const r = target.getBoundingClientRect();
        x += (r.left + r.width / 2 - x) * 0.25;
        y += (r.top + r.height / 2 - y) * 0.25;
      }
      xTo(x);
      yTo(y);
    };
    const over = (e: PointerEvent) => {
      const t = e.target instanceof Element ? e.target : null;
      const labelled = t?.closest<HTMLElement>("[data-cursor]");
      const interactive = t?.closest("a, button");
      domLabel = labelled?.dataset.cursor || (interactive ? "View" : null);
      sync();
    };
    const down = () => setPressed(true);
    const up = () => setPressed(false);
    const leave = () => setHidden(true);
    const unsub = cursorLabel.subscribe((v) => {
      sceneLabel = v;
      sync();
    });

    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerover", over, { passive: true });
    window.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);
    document.documentElement.addEventListener("pointerleave", leave);
    return () => {
      unsub();
      document.documentElement.classList.remove("has-cursor");
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerover", over);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
      document.documentElement.removeEventListener("pointerleave", leave);
    };
  }, [fine, reduced]);

  if (!fine) return null;

  const expanded = Boolean(label);
  return (
    <div
      ref={root}
      aria-hidden="true"
      className="pointer-events-none fixed top-0 left-0 z-[100] mix-blend-difference"
      style={{ opacity: hidden ? 0 : 1, transition: "opacity .3s" }}
    >
      <div
        className="flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-ink"
        style={{
          width: expanded ? 76 : 10,
          height: expanded ? 76 : 10,
          transform: `translate(-50%, -50%) scale(${pressed ? 0.82 : 1})`,
          transition: "width .5s var(--ease-expo), height .5s var(--ease-expo), transform .3s var(--ease-expo)",
        }}
      >
        <span
          className="font-mono text-[10px] tracking-[0.14em] uppercase"
          style={{ opacity: expanded ? 1 : 0, transition: "opacity .25s" }}
        >
          {label}
        </span>
      </div>
    </div>
  );
}

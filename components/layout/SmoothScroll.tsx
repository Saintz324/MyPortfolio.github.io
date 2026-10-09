"use client";

import { useEffect, useState, type ReactNode } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { damp } from "@/lib/math";
import { introDone, timelineFromScroll, world } from "@/lib/world";
import { LenisContext } from "@/hooks/useLenis";

/**
 * The scroll engine.
 * One GSAP ticker drives Lenis, ScrollTrigger and the world store, so the DOM,
 * the scroll-scrubbed timelines and the WebGL scene all read the same frame.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mobile = window.matchMedia("(max-width: 767px), (pointer: coarse)").matches;
    world.reduced = reduced;
    world.mobile = mobile;
    document.documentElement.classList.toggle("is-reduced", reduced);

    const instance = reduced
      ? null
      : new Lenis({ lerp: 0.085, wheelMultiplier: 0.9, touchMultiplier: 1.4, autoRaf: false });
    if (instance) {
      instance.on("scroll", ScrollTrigger.update);
      // Locked until the intro hands over control.
      if (!introDone.get()) instance.stop();
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Lenis needs the DOM; expose the instance once it exists.
    setLenis(instance);

    // Section anchors: the timeline reaches index i when section i crosses the viewport center.
    const measure = () => {
      const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-scene]"));
      const half = window.innerHeight / 2;
      const anchors = sections.map((el, i) =>
        i === 0 ? 0 : Math.max(0, el.getBoundingClientRect().top + window.scrollY - half),
      );
      anchors.push(Math.max(anchors[anchors.length - 1] + 1, ScrollTrigger.maxScroll(window)));
      world.anchors = anchors;
    };
    measure();
    ScrollTrigger.addEventListener("refresh", measure);
    // Late layout shifts (fonts, images) re-measure every trigger once things settle.
    let refreshTimer = 0;
    const ro = new ResizeObserver(() => {
      window.clearTimeout(refreshTimer);
      refreshTimer = window.setTimeout(() => ScrollTrigger.refresh(), 200);
    });
    ro.observe(document.body);

    let last = window.scrollY;
    const tick = (time: number, deltaMs: number) => {
      const dt = Math.min(deltaMs / 1000, 0.1);
      if (instance) instance.raf(time * 1000);
      const y = instance ? instance.scroll : window.scrollY;
      world.velocity = instance ? instance.velocity : y - last;
      last = y;
      world.scroll = y;
      world.t = timelineFromScroll(y, world.anchors);
      const target = Math.min(Math.abs(world.velocity) / 28, 2);
      world.speed += (target - world.speed) * damp(target > world.speed ? 8 : 2.5, dt);
      world.mouseEased.x += (world.mouse.x - world.mouseEased.x) * damp(4, dt);
      world.mouseEased.y += (world.mouse.y - world.mouseEased.y) * damp(4, dt);
      world.pulse *= 1 - damp(2.2, dt);
    };
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    const onPointer = (e: PointerEvent) => {
      world.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      world.mouse.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onPointer, { passive: true });

    const unsub = introDone.subscribe((done) => {
      if (!done) return;
      instance?.start();
      ScrollTrigger.refresh();
    });

    return () => {
      unsub();
      gsap.ticker.remove(tick);
      window.removeEventListener("pointermove", onPointer);
      ScrollTrigger.removeEventListener("refresh", measure);
      ro.disconnect();
      window.clearTimeout(refreshTimer);
      instance?.destroy();
    };
  }, []);

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>;
}

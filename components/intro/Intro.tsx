"use client";

import { useLayoutEffect, useRef } from "react";
import { fullName } from "@/data/profile";
import { gsap } from "@/lib/gsap";
import { introDone, world } from "@/lib/world";

const VISITED_KEY = "es-visited";

/**
 * The welcome sequence: entering the environment, not waiting for a loader.
 *
 *  black → counter + small type → the name rises → the curtain lifts →
 *  the poster frame settles into place → the portrait unmasks →
 *  the 3D world fades up → navigation arrives → control is handed to the user.
 *
 * About 2.2s on a first visit, under a second on return visits, skipped for reduced motion.
 */
export function Intro() {
  const overlay = useRef<HTMLDivElement>(null);
  const counter = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const el = overlay.current;
    const q = (s: string) => Array.from(document.querySelectorAll<HTMLElement>(s));
    const hiddenUntilIntro = q("[data-intro-hidden]");
    const world3d = document.getElementById("world");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Scripts are running, so the CSS failsafe is no longer needed.
    hiddenUntilIntro.forEach((n) => n.removeAttribute("data-intro-hidden"));

    const finish = () => {
      world.intro = 1;
      introDone.set(true);
      try {
        sessionStorage.setItem(VISITED_KEY, "1");
      } catch {
        /* storage unavailable: intro simply plays again */
      }
    };

    if (reduced || !el) {
      gsap.set(hiddenUntilIntro, { autoAlpha: 1 });
      if (world3d) gsap.set(world3d, { opacity: 1 });
      if (el) el.style.display = "none";
      finish();
      return;
    }

    let visited = false;
    try {
      visited = sessionStorage.getItem(VISITED_KEY) === "1";
    } catch {
      visited = false;
    }

    const chars = q("[data-intro='name'] .char");
    const posterIntro = q("[data-intro='poster']");
    const portrait = q("[data-intro='portrait']");
    const late = q("[data-intro='nav'], [data-intro='meta']");
    const nameWrap = q("[data-intro='name']");
    const small = el.querySelectorAll("[data-intro-small]");
    const progress = { v: 0 };

    const ctx = gsap.context(() => {
      gsap.set(nameWrap, { autoAlpha: 1 });
      gsap.set(chars, { yPercent: 115 });
      gsap.set(posterIntro, { scale: 1.1, clipPath: "inset(16% 24% 16% 24% round 22px)" });
      gsap.set(portrait, { scale: 1.35 });
      gsap.set(late, { autoAlpha: 0, y: 16 });
      if (world3d) gsap.set(world3d, { opacity: 0 });

      const tl = gsap.timeline({
        defaults: { ease: "expo.out" },
        onComplete: () => {
          gsap.set(posterIntro, { clearProps: "clipPath,scale" });
          el.style.display = "none";
          finish();
        },
      });

      tl.to(small, { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.08 }, 0.05)
        .to(progress, {
          v: 100,
          duration: 1.15,
          ease: "power2.inOut",
          onUpdate: () => {
            if (counter.current) counter.current.textContent = String(Math.round(progress.v)).padStart(3, "0");
          },
        }, 0)
        .fromTo(bar.current, { scaleX: 0 }, { scaleX: 1, duration: 1.15, ease: "power2.inOut" }, 0)
        .to(chars, { yPercent: 0, duration: 1.1, stagger: 0.035 }, 0.4)
        .to(small, { autoAlpha: 0, duration: 0.4 }, 1.1)
        .to(el, { clipPath: "inset(0% 0% 100% 0%)", duration: 1.05, ease: "expo.inOut" }, 1.15)
        .to(posterIntro, { scale: 1, clipPath: "inset(0% 0% 0% 0% round 22px)", duration: 1.4, ease: "expo.inOut" }, 1.15)
        .to(portrait, { scale: 1, duration: 1.9 }, 1.3)
        .to(world3d, { opacity: 1, duration: 1.4, ease: "power2.out" }, 1.4)
        .to(world, { intro: 1, duration: 1.8, ease: "power2.out" }, 1.4)
        .to(late, { autoAlpha: 1, y: 0, duration: 1, stagger: 0.06 }, 1.85);

      if (visited) tl.timeScale(2.4);
    });

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={overlay}
      className="intro-overlay fixed inset-0 z-[2] flex flex-col justify-between bg-ink px-[calc(var(--gutter)+26px)] py-[calc(var(--gutter)+18px)] text-bone"
      style={{ clipPath: "inset(0% 0% 0% 0%)" }}
      aria-hidden="true"
    >
      <div className="flex justify-between font-mono text-[11px] tracking-[0.12em] uppercase">
        <span data-intro-small="" className="opacity-0">
          {fullName}
        </span>
        <span data-intro-small="" className="opacity-0">
          Portfolio
        </span>
      </div>
      <div className="flex items-end justify-between gap-6">
        <span ref={counter} data-intro-small="" className="font-mono text-[11px] tracking-[0.12em] tabular-nums opacity-0">
          000
        </span>
        <span data-intro-small="" className="relative h-px flex-1 overflow-hidden bg-white/10 opacity-0">
          <span ref={bar} className="absolute inset-0 origin-left scale-x-0 bg-bone" />
        </span>
      </div>
    </div>
  );
}

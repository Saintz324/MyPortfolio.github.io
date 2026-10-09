"use client";

import Image from "next/image";
import { useRef, type CSSProperties } from "react";
import { fullName, profile } from "@/data/profile";
import { gsap, MOTION_OK, useGSAP } from "@/lib/gsap";
import { world } from "@/lib/world";
import { asset } from "@/lib/asset";
import { SocialIcon } from "@/components/ui/SocialIcon";

function Word({ word, className = "" }: { word: string; className?: string }) {
  return (
    <span data-name-word="" className={`mask inline-block whitespace-nowrap will-change-transform ${className}`}>
      {Array.from(word).map((ch, i) => (
        <span key={i} className="char">
          {ch}
        </span>
      ))}
    </span>
  );
}

/**
 * The hero is an editorial poster that happens to be interactive.
 *
 * Two sticky layers share one tall section:
 *  1. the poster (light paper, portrait, socials, role)
 *  2. the name, in difference blend, so it reads dark on paper and light on the dark world.
 * Scrolling tips the poster back into space and tears the name apart,
 * revealing the 3D sculpture that was behind it the whole time.
 */
export function Hero() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: { trigger: root.current, start: "top top", end: "bottom bottom", scrub: 0.8 },
        });
        tl.to("[data-poster]", { scale: 0.7, rotateX: 18, yPercent: -4, transformPerspective: 1400, transformOrigin: "50% 20%", duration: 1 }, 0)
          .to("[data-portrait-inner]", { scale: 1.2, yPercent: 6, duration: 1 }, 0)
          .to("[data-hero-meta]", { autoAlpha: 0, y: -24, duration: 0.22 }, 0)
          .to("[data-poster]", { autoAlpha: 0, duration: 0.3 }, 0.6)
          .to("[data-name-word]:first-child", { xPercent: -62, duration: 0.85 }, 0.12)
          .to("[data-name-word]:last-child", { xPercent: 72, duration: 0.85 }, 0.12)
          .to("[data-name-scale]", { scale: 1.3, duration: 0.85 }, 0.12)
          .to("[data-name-scale]", { "--wdth": 125, duration: 0.6 }, 0)
          .to("[data-name-scale]", { autoAlpha: 0, duration: 0.18 }, 0.82);

        // Pointer parallax: the frame tilts toward the hand, the name drifts against it.
        const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
        if (!fine) return;
        const tiltX = gsap.quickTo("[data-poster-tilt]", "rotationY", { duration: 1.2, ease: "power3.out" });
        const tiltY = gsap.quickTo("[data-poster-tilt]", "rotationX", { duration: 1.2, ease: "power3.out" });
        const imgX = gsap.quickTo("[data-portrait-shift]", "xPercent", { duration: 1.4, ease: "power3.out" });
        const nameX = gsap.quickTo("[data-name-drift]", "xPercent", { duration: 1.6, ease: "power3.out" });
        gsap.set("[data-poster-tilt]", { transformPerspective: 1600 });
        const tick = () => {
          tiltX(world.mouse.x * 2.2);
          tiltY(world.mouse.y * 1.6);
          imgX(world.mouse.x * 1.2);
          nameX(world.mouse.x * -1.4);
        };
        gsap.ticker.add(tick);
        return () => gsap.ticker.remove(tick);
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} id="top" data-scene="0" aria-label="Introduction" className="relative h-[240vh]">
      {/* Layer 1: the poster */}
      <div className="sticky top-0 z-[1] h-[100dvh] p-[var(--gutter)]">
        <div data-intro="poster" className="h-full w-full">
          <div data-poster-tilt="" className="h-full w-full">
            <div data-poster="" className="poster relative h-full w-full overflow-hidden text-ink">
              <div data-portrait-inner="" className="absolute inset-0">
                <div data-intro="portrait" className="absolute inset-0">
                  <div data-portrait-shift="" className="absolute inset-[-3%]">
                    <Image
                      src={asset(profile.portrait.src)}
                      alt={profile.portrait.alt}
                      fill
                      priority
                      sizes="100vw"
                      className="object-cover object-[58%_30%] contrast-[1.06] grayscale"
                    />
                  </div>
                </div>
              </div>

              {/* soft paper wash so the edges sit in the frame */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "radial-gradient(120% 90% at 55% 40%, transparent 55%, rgb(228 227 224 / 0.55) 100%)",
                }}
              />

              <div
                data-intro="meta"
                data-intro-hidden=""
                className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-6 p-[clamp(18px,2.2vw,32px)]"
              >
                <ul data-hero-meta="" className="flex flex-col gap-4" aria-label="Social profiles">
                  {profile.socials.map((s) => (
                    <li key={s.label}>
                      <a
                        href={s.href}
                        target="_blank"
                        rel="noreferrer noopener"
                        aria-label={s.label}
                        className="block transition-opacity duration-300 hover:opacity-60"
                      >
                        <SocialIcon icon={s.icon} size={22} />
                      </a>
                    </li>
                  ))}
                </ul>
                <div data-hero-meta="" className="text-right">
                  <p className="mb-3 font-mono text-[11px] tracking-[0.1em] text-ink/70 uppercase">{profile.availability}</p>
                  <p className="display text-[clamp(2.4rem,5.4vw,6.2rem)] leading-[0.88] tracking-[-0.045em]">
                    {profile.role.map((line) => (
                      <span key={line} className="block">
                        {line}
                      </span>
                    ))}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Layer 2: the name, blended against everything beneath it */}
      <h1
        data-intro="name"
        data-intro-hidden=""
        className="pointer-events-none sticky top-0 z-[3] -mt-[100dvh] flex h-[100dvh] items-center justify-center overflow-x-clip text-white mix-blend-difference"
      >
        <span className="sr-only">{fullName}</span>
        <span data-name-drift="" aria-hidden="true" className="block w-full">
          <span
            data-name-scale=""
            className="display flex w-full flex-col px-3 text-[23.5vw] font-semibold md:flex-row md:justify-center md:gap-[0.22em] md:px-0 md:text-[16.4vw]"
            style={{ fontVariationSettings: '"wdth" var(--wdth)', translate: "0 6%", "--wdth": 100 } as CSSProperties}
          >
            <Word word={profile.firstName} />
            <Word word={profile.lastName} className="self-end md:self-auto" />
          </span>
        </span>
      </h1>
    </section>
  );
}

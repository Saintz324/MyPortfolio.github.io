"use client";

import { useRef } from "react";
import { profile } from "@/data/profile";
import { gsap, MOTION_OK, useGSAP } from "@/lib/gsap";

/** Splits "*word*" markers into highlighted tokens. */
function tokens(line: string) {
  return line.split(" ").map((raw) => {
    const highlight = /^\*.+\*[.,]?$/.test(raw);
    return { text: raw.replace(/\*/g, ""), highlight };
  });
}

/**
 * About: an editorial manifesto.
 * A massive statement slides against the sculpture (which drifts the other way),
 * then the manifesto is read into existence word by word as you scroll.
 */
export function About() {
  const root = useRef<HTMLElement>(null);
  const [lead, ...rest] = profile.manifesto;

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const band = root.current?.querySelector<HTMLElement>("[data-band]");
        if (band) {
          gsap.fromTo(
            band,
            { x: () => window.innerWidth * 0.35 },
            {
              x: () => -(band.scrollWidth - window.innerWidth * 0.55),
              ease: "none",
              scrollTrigger: { trigger: band.parentElement, start: "top bottom", end: "bottom top", scrub: 0.6, invalidateOnRefresh: true },
            },
          );
        }

        gsap.utils.toArray<HTMLElement>("[data-read]").forEach((block) => {
          const words = block.querySelectorAll("[data-w]");
          gsap.fromTo(
            words,
            { opacity: 0.14 },
            {
              opacity: 1,
              stagger: 0.08,
              ease: "none",
              scrollTrigger: { trigger: block, start: "top 82%", end: "bottom 45%", scrub: 0.5 },
            },
          );
        });

        gsap.from("[data-about-meta] > *", {
          y: 40,
          autoAlpha: 0,
          duration: 1.2,
          stagger: 0.1,
          scrollTrigger: { trigger: "[data-about-meta]", start: "top 85%" },
        });
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} id="about" data-scene="1" aria-labelledby="about-title" className="relative pb-[18vh]">
      <h2 id="about-title" className="sr-only">
        About
      </h2>

      {/* The statement: one oversized line, moving against the sculpture */}
      <div className="relative flex h-[75vh] items-center overflow-x-clip">
        <p
          data-band=""
          className="display text-[clamp(5rem,19vw,22rem)] font-semibold whitespace-nowrap text-white mix-blend-difference"
        >
          {profile.statement}
        </p>
      </div>

      <div className="grid grid-cols-12 gap-x-6 px-[calc(var(--gutter)+12px)] md:px-[calc(var(--gutter)+26px)]">
        <p
          data-read=""
          className="display col-span-12 text-[clamp(2.6rem,6.4vw,7.4rem)] leading-[0.92] font-medium tracking-[-0.045em] md:col-span-10 lg:col-span-8"
        >
          {tokens(lead).map((t, i) => (
            <span key={i} data-w="" className="inline-block pr-[0.22em]">
              {t.text}
            </span>
          ))}
        </p>

        <div className="col-span-12 mt-[14vh] md:col-span-9 md:col-start-3 lg:col-span-6 lg:col-start-2">
          {rest.map((line, li) => (
            <p
              key={li}
              data-read=""
              className="mb-8 text-[clamp(1.45rem,2.5vw,2.6rem)] leading-[1.18] tracking-[-0.025em] text-bone"
            >
              {tokens(line).map((t, i) => (
                <span
                  key={i}
                  data-w=""
                  className={`inline-block pr-[0.26em] ${t.highlight ? "font-display italic text-white" : ""}`}
                >
                  {t.text}
                </span>
              ))}
            </p>
          ))}
        </div>

        <div
          data-about-meta=""
          className="col-span-12 mt-[10vh] grid gap-8 border-t border-white/10 pt-8 md:col-span-10 md:col-start-3 md:grid-cols-3 lg:col-span-7 lg:col-start-2"
        >
          <p className="max-w-[46ch] text-[15px] leading-relaxed text-fog md:col-span-2">{profile.bio}</p>
          <dl className="grid gap-4 text-[13px]">
            <div>
              <dt className="font-mono text-[11px] tracking-[0.1em] text-ash uppercase">Based in</dt>
              <dd className="mt-1 text-bone">{profile.location}</dd>
            </div>
            <div>
              <dt className="font-mono text-[11px] tracking-[0.1em] text-ash uppercase">Status</dt>
              <dd className="mt-1 text-bone">{profile.availability}</dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}

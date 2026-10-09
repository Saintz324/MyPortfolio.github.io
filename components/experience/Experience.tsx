"use client";

import { useRef } from "react";
import { experience } from "@/data/experience";
import { gsap, MOTION_OK, useGSAP } from "@/lib/gsap";

/**
 * Experience: a timeline that draws itself as you read it.
 * The spine fills with scroll, each entry rises in as the line reaches it.
 * Behind it the world calms down to a single ring and a small core.
 */
export function Experience() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.fromTo(
          "[data-spine]",
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: "none",
            scrollTrigger: { trigger: "[data-timeline]", start: "top 70%", end: "bottom 60%", scrub: 0.5 },
          },
        );
        gsap.utils.toArray<HTMLElement>("[data-entry]").forEach((entry) => {
          const tl = gsap.timeline({ scrollTrigger: { trigger: entry, start: "top 78%" } });
          tl.from(entry.querySelector("[data-node]"), { scale: 0, duration: 0.8, ease: "expo.out" })
            .from(entry.querySelectorAll("[data-rise]"), { yPercent: 100, duration: 1.1, stagger: 0.06 }, 0.05)
            .from(entry.querySelectorAll("[data-fade]"), { autoAlpha: 0, y: 16, duration: 1, stagger: 0.06 }, 0.2);
        });
        gsap.fromTo(
          "[data-exp-title]",
          { xPercent: -6 },
          { xPercent: 4, ease: "none", scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: 0.6 } },
        );
      });
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      id="experience"
      data-scene="4"
      aria-labelledby="experience-title"
      className="relative px-[calc(var(--gutter)+12px)] pt-[22vh] pb-[26vh] md:px-[calc(var(--gutter)+26px)]"
    >
      <h2
        id="experience-title"
        data-exp-title=""
        className="display mb-[12vh] text-[clamp(3.6rem,12vw,14rem)] font-semibold text-white mix-blend-difference"
      >
        Experience
      </h2>

      <ol data-timeline="" className="relative max-w-[880px] lg:ml-[8vw]">
        <span aria-hidden="true" className="absolute top-2 bottom-2 left-[5px] w-px bg-white/12" />
        <span aria-hidden="true" data-spine="" className="absolute top-2 bottom-2 left-[5px] w-px origin-top bg-bone" />
        {experience.map((item, i) => (
          <li key={i} data-entry="" className="relative grid gap-3 pb-[9vh] pl-10 last:pb-0 md:grid-cols-[180px_1fr] md:gap-10">
            <span
              data-node=""
              aria-hidden="true"
              className="absolute top-[0.55em] left-0 h-[11px] w-[11px] rounded-full border border-bone bg-ink"
            />
            <p className="mask font-mono text-[12px] tracking-[0.08em] text-ash uppercase">
              <span data-rise="" className="block pt-1">
                {item.period ?? ""}
              </span>
            </p>
            <div>
              <h3 className="mask">
                <span data-rise="" className="display block pb-[0.08em] text-[clamp(1.9rem,3.6vw,3.6rem)] leading-[0.95] font-medium tracking-[-0.04em]">
                  {item.role}
                </span>
              </h3>
              <p data-fade="" className="mt-2 text-[17px] text-bone">
                {item.company}
              </p>
              <p data-fade="" className="mt-4 max-w-[52ch] text-[15px] leading-relaxed text-fog">
                {item.description}
              </p>
              {item.stack.length > 0 && (
                <ul
                  data-fade=""
                  className="mt-5 flex flex-wrap gap-x-5 gap-y-1 font-mono text-[11px] tracking-[0.08em] text-ash uppercase"
                  aria-label="Technologies"
                >
                  {item.stack.map((tech) => (
                    <li key={tech}>{tech}</li>
                  ))}
                </ul>
              )}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

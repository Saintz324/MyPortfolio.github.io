"use client";

import { useRef } from "react";
import { skills } from "@/data/skills";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { activeSkill } from "@/lib/world";
import { useSignal } from "@/hooks/useSignal";

/**
 * Skills: the DOM half of the 3D skill system.
 * While the section is held in place, scroll walks through the stack and the matching
 * node lights up in the scene. Hover or keyboard focus takes over; hovering a node in 3D
 * does the same in reverse. The list is the accessible version of the 3D system.
 */
export function Skills() {
  const root = useRef<HTMLElement>(null);
  const locked = useRef(false);
  const active = useSignal(activeSkill);
  const current = active >= 0 ? skills[active] : skills[0];

  useGSAP(
    () => {
      const st = ScrollTrigger.create({
        trigger: root.current,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => {
          if (locked.current) return;
          activeSkill.set(Math.min(skills.length - 1, Math.floor(self.progress * skills.length)));
        },
        onLeave: () => activeSkill.set(-1),
        onLeaveBack: () => activeSkill.set(-1),
      });

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from("[data-skill-row]", {
          yPercent: 100,
          autoAlpha: 0,
          stagger: 0.05,
          duration: 1.1,
          scrollTrigger: { trigger: root.current, start: "top 60%" },
        });
      });
      return () => st.kill();
    },
    { scope: root },
  );

  const take = (i: number) => {
    locked.current = true;
    activeSkill.set(i);
  };
  const release = () => {
    locked.current = false;
  };

  return (
    <section
      ref={root}
      id="skills"
      data-scene="2"
      aria-labelledby="skills-title"
      className="relative"
      style={{ height: `${Math.max(260, skills.length * 45)}vh` }}
    >
      <div className="sticky top-0 grid h-[100dvh] grid-cols-12 items-start pt-[14vh] md:items-center md:pt-0 px-[calc(var(--gutter)+12px)] md:px-[calc(var(--gutter)+26px)]">
        <div className="col-span-12 md:col-span-7 lg:col-span-5">
          <h2 id="skills-title" className="display mb-[5vh] text-[clamp(3rem,7.2vw,8rem)] font-semibold">
            The stack
          </h2>

          <ul className="mb-[5vh]" onPointerLeave={release} onBlur={release} aria-label="Skills">
            {skills.map((skill, i) => {
              const on = i === active;
              return (
                <li key={skill.name} className="mask">
                  <button
                    type="button"
                    data-skill-row=""
                    data-cursor="Explore"
                    aria-pressed={on}
                    onPointerEnter={() => take(i)}
                    onFocus={() => take(i)}
                    onClick={() => take(i)}
                    className={`group flex w-full items-baseline gap-4 py-[0.12em] text-left text-[clamp(1.6rem,2.9vw,3.1rem)] leading-[1.02] tracking-[-0.035em] transition-colors duration-500 ${
                      on ? "text-white" : "text-white/30 hover:text-white/60"
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`h-px bg-current transition-[width] duration-700 ease-[var(--ease-expo)] ${on ? "w-10" : "w-0"}`}
                    />
                    <span className="font-display">{skill.name}</span>
                  </button>
                </li>
              );
            })}
          </ul>

          <div aria-live="polite" className="min-h-[6.5rem] max-w-[44ch] border-t border-white/10 pt-5">
            <p className="font-mono text-[11px] tracking-[0.1em] text-ash uppercase">{current.area}</p>
            <p key={current.name} className="mt-2 text-[15px] leading-relaxed text-fog">
              {current.description}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

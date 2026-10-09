"use client";

import { useRef } from "react";
import { ArrowRight, ArrowUp } from "@phosphor-icons/react";
import { fullName, profile } from "@/data/profile";
import { gsap, MOTION_OK, useGSAP } from "@/lib/gsap";
import { scrollToId, useLenis } from "@/hooks/useLenis";
import { MagneticLink } from "@/components/ui/MagneticLink";

/**
 * Contact: the final scene.
 * The statement rises line by line as the section arrives; then the page holds
 * while the camera pulls far back and every element of the world converges.
 */
export function Contact() {
  const root = useRef<HTMLElement>(null);
  const lenis = useLenis();

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.fromTo(
          "[data-c-line]",
          { yPercent: 125 },
          {
            yPercent: 0,
            stagger: 0.12,
            ease: "none",
            scrollTrigger: { trigger: root.current, start: "top 75%", end: "top top", scrub: 0.6 },
          },
        );
        gsap.fromTo(
          "[data-c-fade]",
          { autoAlpha: 0, y: 30 },
          {
            autoAlpha: 1,
            y: 0,
            stagger: 0.08,
            ease: "none",
            scrollTrigger: { trigger: root.current, start: "top 20%", end: "top -30%", scrub: 0.6 },
          },
        );
        // While held, the statement slowly gives way to the world behind it.
        gsap.to("[data-c-statement]", {
          scale: 0.92,
          autoAlpha: 0.35,
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top -40%", end: "bottom bottom", scrub: 0.6 },
        });
      });
    },
    { scope: root },
  );

  const mail = `mailto:${profile.email}?subject=${encodeURIComponent("New project")}`;

  return (
    <section ref={root} id="contact" data-scene="5" aria-labelledby="contact-title" className="relative h-[230vh]">
      <div className="sticky top-0 flex h-[100dvh] flex-col justify-between px-[calc(var(--gutter)+12px)] pt-[16vh] pb-[calc(var(--gutter)+12px)] md:px-[calc(var(--gutter)+26px)]">
        <h2
          id="contact-title"
          data-c-statement=""
          className="display origin-left text-[clamp(3.4rem,11.6vw,14rem)] font-semibold text-white mix-blend-difference"
        >
          {profile.contactStatement.map((line, i) => (
            <span key={line} className="mask pb-[0.04em]">
              <span data-c-line="" className={`block ${i === 2 ? "italic" : ""}`}>
                {line}
              </span>
            </span>
          ))}
        </h2>

        <div className="grid gap-10">
          <div className="flex flex-col items-start gap-6 md:flex-row md:items-end md:justify-between">
            <a
              data-c-fade=""
              href={`mailto:${profile.email}`}
              data-cursor="Write"
              className="group relative text-[clamp(1.4rem,3.2vw,3.2rem)] tracking-[-0.03em] break-all"
            >
              {profile.email}
              <span
                aria-hidden="true"
                className="absolute -bottom-1 left-0 h-px w-full origin-right scale-x-0 bg-current transition-transform duration-700 ease-[var(--ease-expo)] group-hover:origin-left group-hover:scale-x-100"
              />
            </a>
            <div data-c-fade="">
              <MagneticLink
                href={mail}
                className="inline-flex items-center gap-3 rounded-full bg-bone px-8 py-5 text-[16px] font-medium whitespace-nowrap text-ink transition-colors duration-500 hover:bg-white active:scale-[0.98]"
                cursor="Write"
                strength={0.4}
              >
                Start a project
                <ArrowRight size={18} weight="bold" aria-hidden="true" />
              </MagneticLink>
            </div>
          </div>

          <footer
            data-c-fade=""
            className="grid grid-cols-2 gap-6 border-t border-white/10 pt-5 text-[13px] text-fog md:grid-cols-4"
          >
            <ul className="grid gap-1" aria-label="Social profiles">
              {profile.socials.map((s) => (
                <li key={s.label}>
                  <a href={s.href} target="_blank" rel="noreferrer noopener" className="transition-colors hover:text-white">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
            <p>
              <span className="block font-mono text-[10px] tracking-[0.1em] text-ash uppercase">Location</span>
              <span className="text-bone">{profile.location}</span>
            </p>
            <p>
              <span className="block font-mono text-[10px] tracking-[0.1em] text-ash uppercase">Status</span>
              <span className="text-bone">{profile.availability}</span>
            </p>
            <div className="flex items-start justify-between gap-4">
              <p>
                &copy; {fullName}
              </p>
              <button
                type="button"
                onClick={() => scrollToId(lenis, "top")}
                className="inline-flex items-center gap-1 transition-colors hover:text-white"
              >
                Top <ArrowUp size={13} aria-hidden="true" />
              </button>
            </div>
          </footer>
        </div>
      </div>
    </section>
  );
}

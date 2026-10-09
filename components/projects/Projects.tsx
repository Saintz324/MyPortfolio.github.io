"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ArrowUpRight } from "@phosphor-icons/react";
import { projects } from "@/data/projects";
import { gsap, useGSAP } from "@/lib/gsap";
import { clamp } from "@/lib/math";
import { world } from "@/lib/world";
import { asset } from "@/lib/asset";
import { useLenis } from "@/hooks/useLenis";

const HOLD = 0.7;

/**
 * Selected work as a held, cinematic sequence.
 * The section stays in place while scroll plays a timeline: each project's image
 * wipes up over the last inside the same frame, titles roll, details cross-fade.
 * Behind it the 3D world fragments into particles and re-forms as a knot.
 */
export function Projects() {
  const root = useRef<HTMLElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const [current, setCurrent] = useState(0);
  const lenis = useLenis();

  useGSAP(
    () => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const images = gsap.utils.toArray<HTMLElement>("[data-p-image]");
      const inner = gsap.utils.toArray<HTMLElement>("[data-p-image-inner]");
      const titles = gsap.utils.toArray<HTMLElement>("[data-p-title]");
      const details = gsap.utils.toArray<HTMLElement>("[data-p-details]");

      gsap.set(images.slice(1), { clipPath: "inset(100% 0% 0% 0%)" });
      gsap.set(titles.slice(1), { yPercent: 140 });
      gsap.set(details.slice(1), { autoAlpha: 0, y: 24 });

      const tl = gsap.timeline({
        defaults: { ease: "none", duration: 1 },
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: "bottom bottom",
          scrub: reduced ? true : 0.6,
          onUpdate: (self) => {
            // A project becomes current halfway through its transition in.
            const t = self.progress * tl.duration();
            let index = 0;
            for (let i = 1; i < projects.length; i++) if (t >= tl.labels[`p${i}`] - 0.5) index = i;
            setCurrent(index);
          },
        },
      });
      tl.addLabel("p0", 0).to({}, { duration: HOLD * 0.5 });
      for (let i = 1; i < projects.length; i++) {
        const at = tl.duration();
        tl.to(images[i], { clipPath: "inset(0% 0% 0% 0%)", ease: "power2.inOut" }, at)
          .to(inner[i - 1], { scale: 1.18, yPercent: -8, ease: "power1.in" }, at)
          .to(titles[i - 1], { yPercent: -140, ease: "power3.inOut", duration: 0.7 }, at)
          .to(titles[i], { yPercent: 0, ease: "power3.inOut", duration: 0.7 }, at + 0.25)
          .to(details[i - 1], { autoAlpha: 0, y: -24, duration: 0.4 }, at)
          .to(details[i], { autoAlpha: 1, y: 0, duration: 0.5 }, at + 0.5)
          .addLabel(`p${i}`, at + 1)
          .to({}, { duration: HOLD });
      }
      tlRef.current = tl;

      if (reduced) return;

      // Entry: the frame opens from a narrow slit as the section arrives.
      gsap.fromTo(
        frame.current,
        { clipPath: "inset(18% 12% 18% 12% round 22px)" },
        {
          clipPath: "inset(0% 0% 0% 0% round 22px)",
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top 85%", end: "top top", scrub: 0.6 },
        },
      );

      // Scroll speed shears the frame slightly: velocity made visible.
      const skew = gsap.quickTo(frame.current, "skewY", { duration: 0.6, ease: "power3.out" });
      const tick = () => {
        skew(clamp(world.velocity * -0.06, -2.5, 2.5));
      };
      gsap.ticker.add(tick);
      return () => gsap.ticker.remove(tick);
    },
    { scope: root },
  );

  const goTo = (i: number) => {
    const tl = tlRef.current;
    const st = tl?.scrollTrigger;
    if (!tl || !st) return;
    const y = st.start + (tl.labels[`p${i}`] / tl.duration()) * (st.end - st.start);
    if (lenis) lenis.scrollTo(y, { duration: 1.4 });
    else window.scrollTo({ top: y });
  };

  const active = projects[current];

  return (
    <section
      ref={root}
      id="work"
      data-scene="3"
      aria-labelledby="work-title"
      className="relative"
      style={{ height: `${(projects.length + 1) * 100}vh` }}
    >
      <div className="sticky top-0 flex h-[100dvh] flex-col justify-center overflow-hidden px-[calc(var(--gutter)+12px)] md:px-[calc(var(--gutter)+26px)]">
        <h2 id="work-title" className="sr-only">
          Selected work
        </h2>

        <div className="grid grid-cols-12 items-end gap-x-6 gap-y-8">
          {/* Text column */}
          <div className="order-2 col-span-12 lg:order-1 lg:col-span-5">
            <ol className="mb-6 flex gap-5 font-mono text-[11px] tracking-[0.1em]" aria-label="Projects">
              {projects.map((p, i) => (
                <li key={p.title}>
                  <button
                    type="button"
                    onClick={() => goTo(i)}
                    aria-current={i === current ? "true" : undefined}
                    aria-label={`Show ${p.title}`}
                    className={`transition-colors duration-500 ${i === current ? "text-white" : "text-white/35 hover:text-white/70"}`}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </button>
                </li>
              ))}
            </ol>

            {/* Clipped vertically only: long titles run over the image, inverted. */}
            <div className="relative z-10 h-[1em] text-[clamp(3rem,6.6vw,7.6rem)] [clip-path:inset(-0.1em_-100vw_-0.14em_-100vw)]">
              {projects.map((p, i) => (
                <h3
                  key={p.title}
                  data-p-title=""
                  aria-hidden={i !== current}
                  className="display absolute top-0 left-0 text-[1em] leading-[0.92] font-semibold whitespace-nowrap text-white mix-blend-difference"
                >
                  {p.title}
                </h3>
              ))}
            </div>

            <div className="mt-6 grid">
              {projects.map((p, i) => (
                <div
                  key={p.title}
                  data-p-details=""
                  inert={i !== current}
                  className="col-start-1 row-start-1 grid max-w-[46ch] gap-5"
                >
                  <dl className="grid grid-cols-3 gap-4 border-t border-white/10 pt-4 text-[13px]">
                    <div>
                      <dt className="font-mono text-[10px] tracking-[0.1em] text-ash uppercase">Discipline</dt>
                      <dd className="mt-1 text-bone">{p.discipline}</dd>
                    </div>
                    <div>
                      <dt className="font-mono text-[10px] tracking-[0.1em] text-ash uppercase">Role</dt>
                      <dd className="mt-1 text-bone">{p.role}</dd>
                    </div>
                    <div>
                      <dt className="font-mono text-[10px] tracking-[0.1em] text-ash uppercase">Year</dt>
                      <dd className="mt-1 text-bone">{p.year}</dd>
                    </div>
                  </dl>
                  <p className="text-[15px] leading-relaxed text-fog">{p.summary}</p>
                  {p.url ? (
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      data-cursor="Open"
                      className="group inline-flex w-fit items-center gap-2 rounded-full border border-white/25 px-5 py-2.5 text-[14px] transition-colors duration-500 hover:bg-bone hover:text-ink"
                    >
                      {p.linkLabel ?? "View project"}
                      <ArrowUpRight size={16} className="transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </a>
                  ) : (
                    <p className="font-mono text-[11px] tracking-[0.1em] text-ash uppercase">Case study in progress</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Image column: one frame, many projects */}
          <div className="order-1 col-span-12 lg:order-2 lg:col-span-7">
            <FrameLink url={active.url}>
              <div
                ref={frame}
                className="group relative aspect-[4/3] w-full overflow-hidden rounded-[var(--radius-frame)] bg-graphite will-change-transform max-lg:aspect-[16/11] max-lg:max-h-[42dvh]"
                onPointerEnter={() => (world.projectHover = true)}
                onPointerLeave={() => (world.projectHover = false)}
              >
                {projects.map((p, i) => (
                  <div key={p.title} data-p-image="" className="absolute inset-0" style={{ zIndex: i }}>
                    <div data-p-image-inner="" className="absolute inset-0">
                      <div className="absolute inset-0 transition-transform duration-[1.2s] ease-[var(--ease-expo)] group-hover:scale-[1.045]">
                        <Image
                          src={asset(p.image.src)}
                          alt={p.image.alt}
                          fill
                          sizes="(min-width: 1024px) 58vw, 100vw"
                          className="object-cover contrast-[1.1] grayscale transition-[filter] duration-700 group-hover:contrast-[1.25]"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 z-[20] bg-[radial-gradient(120%_90%_at_50%_40%,transparent_50%,rgb(0_0_0/0.45))]"
                />
              </div>
            </FrameLink>
          </div>
        </div>
      </div>
    </section>
  );
}

function FrameLink({ url, children }: { url: string | null; children: React.ReactNode }) {
  if (!url) return <div>{children}</div>;
  return (
    <a href={url} target="_blank" rel="noreferrer noopener" data-cursor="Open" aria-label="Open project" className="block">
      {children}
    </a>
  );
}

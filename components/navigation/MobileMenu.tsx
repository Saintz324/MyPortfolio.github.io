"use client";

import { useEffect, useRef } from "react";
import { fullName, navItems, profile } from "@/data/profile";
import { gsap } from "@/lib/gsap";
import { scrollToId, useLenis } from "@/hooks/useLenis";

type Props = { open: boolean; onClose: () => void; active: string };

/** Fullscreen menu for small screens: a curtain drops, links rise line by line. */
export function MobileMenu({ open, onClose, active }: Props) {
  const lenis = useLenis();
  const root = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const links = el.querySelectorAll("[data-menu-link]");
    if (open) {
      wasOpen.current = true;
      lenis?.stop();
      gsap.set(el, { visibility: "visible" });
      gsap.fromTo(el, { clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)", duration: reduced ? 0 : 0.9, ease: "expo.inOut" });
      gsap.fromTo(links, { yPercent: 110 }, { yPercent: 0, duration: reduced ? 0 : 1, stagger: 0.06, delay: reduced ? 0 : 0.35, ease: "expo.out" });
      closeBtn.current?.focus();
      const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }
    if (!wasOpen.current) return;
    wasOpen.current = false;
    lenis?.start();
    gsap.to(el, {
      clipPath: "inset(0 0 100% 0)",
      duration: reduced ? 0 : 0.7,
      ease: "expo.inOut",
      onComplete: () => {
        gsap.set(el, { visibility: "hidden" });
      },
    });
  }, [open, lenis, onClose]);

  const go = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    onClose();
    // wait for the curtain before travelling
    window.setTimeout(() => scrollToId(lenis, id), 350);
  };

  return (
    <div
      ref={root}
      id="mobile-menu"
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      aria-hidden={!open}
      inert={!open}
      className="invisible fixed inset-0 z-[60] flex flex-col justify-between bg-bone px-5 pt-6 pb-8 text-ink md:hidden"
      style={{ clipPath: "inset(0 0 100% 0)" }}
    >
      <div className="flex items-center justify-between text-[15px]">
        <span>&copy; {fullName}</span>
        <button ref={closeBtn} type="button" onClick={onClose}>
          Close
        </button>
      </div>
      <nav aria-label="Mobile">
        <ul>
          {navItems.map((item) => (
            <li key={item.id} className="mask">
              <a
                data-menu-link=""
                href={`#${item.id}`}
                onClick={go(item.id)}
                aria-current={active === item.id ? "true" : undefined}
                className="display block py-1 text-[17vw] aria-[current=true]:italic"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <div className="flex items-end justify-between text-[13px]">
        <a href={`mailto:${profile.email}`} className="underline underline-offset-4">
          {profile.email}
        </a>
        <span className="text-smoke">{profile.location}</span>
      </div>
    </div>
  );
}

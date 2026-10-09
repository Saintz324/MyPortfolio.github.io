"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { fullName, navItems } from "@/data/profile";
import { gsap } from "@/lib/gsap";
import { world } from "@/lib/world";
import { scrollToId, useLenis } from "@/hooks/useLenis";
import { MobileMenu } from "./MobileMenu";

/**
 * Floating navigation.
 * Rendered in difference blend mode so it stays legible over the light poster,
 * the dark world and the chrome. Hides while reading down, returns on the way up.
 */
export function Nav() {
  const lenis = useLenis();
  const bar = useRef<HTMLElement>(null);
  const [active, setActive] = useState<string>("top");
  const [compact, setCompact] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  // Active section: whichever section crosses the middle of the viewport.
  useEffect(() => {
    const ids = ["top", ...navItems.map((n) => n.id)];
    const els = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => Boolean(el));
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setActive(entry.target.id);
      },
      { rootMargin: "-50% 0px -50% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // Hide on scroll down, reveal on scroll up. Runs on the shared ticker, no scroll listeners.
  useEffect(() => {
    const el = bar.current;
    if (!el) return;
    let shown = true;
    let wasCompact = false;
    const tick = () => {
      const past = world.scroll > window.innerHeight * 0.6;
      if (past !== wasCompact) {
        wasCompact = past;
        setCompact(past);
      }
      const v = world.velocity;
      const shouldShow = !past || v < -0.5 || menuOpen;
      if (Math.abs(v) < 0.5 && past) return;
      if (shouldShow !== shown) {
        shown = shouldShow;
        gsap.to(el, { yPercent: shown ? 0 : -130, duration: world.reduced ? 0 : 0.9, ease: "expo.out" });
      }
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, [menuOpen]);

  const go = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    scrollToId(lenis, id);
  };

  return (
    <>
      <header
        ref={bar}
        data-intro-hidden=""
        data-intro="nav"
        className="fixed inset-x-0 top-0 z-50 text-white mix-blend-difference"
      >
        <nav
          aria-label="Primary"
          className="flex items-center justify-between transition-[padding] duration-700 ease-[var(--ease-expo)]"
          style={{
            padding: compact
              ? "14px calc(var(--gutter) + 8px)"
              : "calc(var(--gutter) + 18px) calc(var(--gutter) + 26px)",
          }}
        >
          <a href="#top" onClick={go("top")} className="text-[15px] tracking-[-0.01em]" aria-label={`${fullName}, back to top`}>
            <span aria-hidden="true">&copy; </span>
            {fullName}
          </a>

          <ul className="hidden items-center gap-[clamp(24px,4vw,72px)] md:flex">
            {navItems.map((item) => {
              const isActive = active === item.id;
              return (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    onClick={go(item.id)}
                    aria-current={isActive ? "true" : undefined}
                    className="group relative text-[15px] tracking-[-0.01em]"
                  >
                    {item.label}
                    <span
                      aria-hidden="true"
                      className={`absolute -bottom-1 left-0 h-px w-full origin-left bg-current transition-transform duration-700 ease-[var(--ease-expo)] ${
                        isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                      }`}
                    />
                  </a>
                </li>
              );
            })}
          </ul>

          <button
            type="button"
            className="text-[15px] md:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen(true)}
          >
            Menu
          </button>
        </nav>
      </header>
      <MobileMenu open={menuOpen} onClose={closeMenu} active={active} />
    </>
  );
}

"use client";

import { useRef, type ReactNode } from "react";
import { useMagnetic } from "@/hooks/useMagnetic";

type Props = {
  href: string;
  children: ReactNode;
  className?: string;
  cursor?: string;
  external?: boolean;
  strength?: number;
};

/** A link that leans toward the pointer. Its label moves a little further than its body, which gives it depth. */
export function MagneticLink({ href, children, className = "", cursor, external, strength = 0.3 }: Props) {
  const ref = useRef<HTMLAnchorElement>(null);
  const inner = useRef<HTMLSpanElement>(null);
  useMagnetic(ref, { strength, inner, innerStrength: strength * 0.5 });
  return (
    <a
      ref={ref}
      href={href}
      className={className}
      data-cursor={cursor}
      data-magnetic=""
      {...(external ? { target: "_blank", rel: "noreferrer noopener" } : {})}
    >
      <span ref={inner} className="inline-flex items-center gap-[inherit]">
        {children}
      </span>
    </a>
  );
}

"use client";

import dynamic from "next/dynamic";

/** The WebGL world is split into its own chunk and never server-rendered. */
const Scene = dynamic(() => import("./Scene"), { ssr: false });

export function SceneLoader() {
  return (
    <div id="world" className="pointer-events-none fixed inset-0 -z-10 opacity-0" aria-hidden="true">
      <Scene />
      {/* Fixed layer for HTML labels projected from 3D (see SkillSystem). */}
      <div id="world-labels" className="absolute inset-0 overflow-hidden" />
    </div>
  );
}

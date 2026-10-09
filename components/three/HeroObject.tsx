"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { SphereGeometry, TubeGeometry, type Group, type Mesh } from "three";
import { BRACE_ENDS, BRACE_TUBE, bracePath } from "@/lib/brace";
import { damp } from "@/lib/math";
import { cursorLabel, world } from "@/lib/world";
import { scene } from "./sceneState";
import { createLiquidMaterial, type LiquidMaterial } from "./liquidMaterial";

const explorable = () => world.t > 0.45 && scene.solid > 0.5;

/**
 * The central sculpture: a pair of liquid chrome braces, an empty code block.
 * Open and empty in the hero, wide apart while the stack orbits inside them,
 * shattered into particles in the work section, closed around a core at contact.
 * Scroll sets the gap, scale and dissolve; the pointer tilts the pair;
 * scroll velocity speeds the sway and agitates the surface.
 */
export function HeroObject({ segments = 360 }: { segments?: number }) {
  const group = useRef<Group>(null);
  const sway = useRef<Group>(null);
  const left = useRef<Mesh>(null);
  const right = useRef<Mesh>(null);
  const core = useRef<Mesh>(null);
  const spin = useRef(0);
  const hover = useRef(0);

  const geometry = useMemo(() => new TubeGeometry(bracePath(), segments, BRACE_TUBE, 28, false), [segments]);
  const cap = useMemo(() => new SphereGeometry(BRACE_TUBE, 28, 20), []);
  const coreGeometry = useMemo(() => new SphereGeometry(0.17, 48, 32), []);
  const material = useMemo(() => createLiquidMaterial(), []);

  useEffect(
    () => () => {
      geometry.dispose();
      cap.dispose();
      coreGeometry.dispose();
    },
    [geometry, cap, coreGeometry],
  );
  useEffect(() => () => material.dispose(), [material]);

  useFrame((state, delta) => {
    const g = group.current;
    const s = sway.current;
    const l = left.current;
    const r = right.current;
    const c = core.current;
    if (!g || !s || !l || !r || !c) return;
    const dt = Math.min(delta, 0.1);
    const reduced = world.reduced;

    // The world moves under a still pointer while scrolling: drop a hover that no longer applies.
    if (world.objectHover && !explorable()) {
      world.objectHover = false;
      cursorLabel.set(null);
    }
    hover.current += ((world.objectHover ? 1 : 0) - hover.current) * damp(6, dt);

    const speed = reduced ? 0 : world.speed;
    spin.current += dt * (scene.spin + speed * 1.6 + world.pulse * 2.5) * (reduced ? 0.25 : 1);

    const solid = Math.max(0, scene.solid);
    const scale = scene.objScale * (0.55 + 0.45 * world.intro) * (0.2 + 0.8 * solid);
    g.visible = solid > 0.01 && world.intro > 0.01;
    g.scale.setScalar(scale);
    g.position.y = scene.objY + (reduced ? 0 : Math.sin(state.clock.elapsedTime * 0.6) * 0.04);

    // The pair sways as one object (a brace seen edge-on is just a line, so it never spins fully).
    const mx = world.mouseEased.x;
    const my = world.mouseEased.y;
    s.rotation.y = Math.sin(spin.current * 0.5) * 0.42 + mx * 0.4;
    s.rotation.x = Math.sin(spin.current * 0.3) * 0.1 - my * 0.3;
    s.rotation.z = Math.sin(spin.current * 0.21) * 0.05;

    // Each brace also counter-rotates a little, so the gap between them breathes in depth.
    const gap = scene.braceGap + hover.current * 0.08 + world.pulse * 0.25;
    const twist = Math.sin(spin.current * 0.8) * (0.18 + speed * 0.3);
    l.position.x = -gap;
    r.position.x = gap;
    l.rotation.y = twist;
    r.rotation.y = Math.PI - twist;

    c.scale.setScalar(Math.max(0.0001, scene.core) * (1 + Math.sin(state.clock.elapsedTime * 1.4) * 0.04));
    c.visible = scene.core > 0.01;

    const m = l.material as LiquidMaterial;
    m.uniforms.uTime.value += dt * (1 + speed * 3 + hover.current);
    m.uniforms.uAmp.value = Math.min(0.12, (scene.distort + speed * 0.25 + hover.current * 0.15 + world.pulse * 0.2) * 0.07);
    m.opacity = Math.min(1, solid * 1.4);
  });

  const handlers = {
    onPointerMove: (e: ThreeEvent<PointerEvent>) => {
      // Only explorable once it is actually on screen (not hidden behind the poster or dissolved).
      if (world.objectHover || !explorable()) return;
      e.stopPropagation();
      world.objectHover = true;
      cursorLabel.set("Explore");
    },
    onPointerOut: () => {
      world.objectHover = false;
      cursorLabel.set(null);
    },
    onClick: () => {
      if (world.objectHover) world.pulse = 1;
    },
  };

  const caps = BRACE_ENDS.map(([x, y]) => <mesh key={y} geometry={cap} material={material} position={[x, y, 0]} />);

  return (
    <group ref={group}>
      <group ref={sway}>
        <mesh ref={left} geometry={geometry} material={material} {...handlers}>
          {caps}
        </mesh>
        <mesh ref={right} geometry={geometry} material={material} {...handlers}>
          {caps}
        </mesh>
        <mesh ref={core} geometry={coreGeometry} material={material} />
      </group>
    </group>
  );
}

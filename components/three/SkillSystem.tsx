"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { BufferAttribute, BufferGeometry, type Group, type LineBasicMaterial, type Mesh } from "three";
import { skills } from "@/data/skills";
import { damp } from "@/lib/math";
import { activeSkill, cursorLabel, world } from "@/lib/world";
import { scene, skillFocus } from "./sceneState";

/** Fixed orbital slots so the composition is designed, not random. */
const SLOTS = skills.map((_, i) => ({
  angle: (i / skills.length) * Math.PI * 2 + 0.3,
  height: Math.sin(i * 2.1) * 0.85,
  depth: 0.85 + ((i * 37) % 10) / 40,
}));

/**
 * The skill ecosystem: technology nodes orbiting the core.
 * Each node is hoverable in 3D; hovering (or the DOM list, or scroll) highlights it,
 * pulls the camera toward it and sends an impulse through the scene.
 */
export function SkillSystem() {
  const group = useRef<Group>(null);
  const nodes = useRef<(Mesh | null)[]>([]);
  const labels = useRef<(HTMLDivElement | null)[]>([]);
  const emphasis = useRef<number[]>(skills.map(() => 0));
  const rotation = useRef(0);
  const linesMat = useRef<LineBasicMaterial>(null);
  // Labels render into a fixed layer; the default (the event source, document.body) scrolls away.
  const portal = useMemo(() => ({ current: document.getElementById("world-labels") as HTMLElement }), []);

  const lines = useMemo(() => {
    const g = new BufferGeometry();
    g.setAttribute("position", new BufferAttribute(new Float32Array(skills.length * 6), 3));
    return g;
  }, []);
  useEffect(() => () => lines.dispose(), [lines]);

  useEffect(
    () =>
      activeSkill.subscribe((i) => {
        if (i >= 0) world.pulse = Math.max(world.pulse, 0.55);
      }),
    [],
  );

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    const dt = Math.min(delta, 0.1);
    const vis = scene.nodes * world.intro;
    g.visible = vis > 0.01;
    if (!g.visible) {
      skillFocus.weight += (0 - skillFocus.weight) * damp(4, dt);
      labels.current.forEach((l) => l && (l.style.opacity = "0"));
      return;
    }

    const active = activeSkill.get();
    rotation.current += dt * (0.08 + (world.reduced ? 0 : world.speed * 0.6));
    const pos = lines.getAttribute("position") as BufferAttribute;

    for (let i = 0; i < SLOTS.length; i++) {
      const slot = SLOTS[i];
      const e = emphasis.current;
      e[i] += ((i === active ? 1 : 0) - e[i]) * damp(7, dt);
      const a = slot.angle + rotation.current;
      const r = scene.nodeRadius * slot.depth * (0.6 + 0.4 * vis);
      const bob = world.reduced ? 0 : Math.sin(state.clock.elapsedTime * 0.8 + i) * 0.06;
      const x = Math.cos(a) * r;
      const y = slot.height * Math.min(1, scene.nodeRadius / 1.6) + bob;
      const z = Math.sin(a) * r;

      const node = nodes.current[i];
      if (node) {
        node.position.set(x, y, z);
        node.scale.setScalar((0.6 + vis * 0.4) * (1 + e[i] * 0.7));
        node.rotation.y += dt * (0.4 + e[i] * 2);
      }
      pos.setXYZ(i * 2, 0, 0, 0);
      pos.setXYZ(i * 2 + 1, x, y, z);

      const label = labels.current[i];
      if (label) {
        // Labels give way once the nodes converge around the core (contact scene).
        const spread = 1 - Math.min(1, Math.max(0, (world.t - 4.5) / 0.6));
        label.style.opacity = String(vis * spread * (active < 0 ? 0.75 : 0.3 + e[i] * 0.7));
        label.dataset.active = i === active ? "true" : "false";
      }
      if (i === active) skillFocus.position.set(x, y, z);
    }
    pos.needsUpdate = true;
    if (linesMat.current) linesMat.current.opacity = vis * 0.18;
    skillFocus.weight += ((active >= 0 ? vis : 0) - skillFocus.weight) * damp(4, dt);
  });

  return (
    <group ref={group}>
      <lineSegments geometry={lines}>
        <lineBasicMaterial ref={linesMat} color="#e9e9e6" transparent opacity={0.15} depthWrite={false} />
      </lineSegments>
      {skills.map((skill, i) => (
        <mesh
          key={skill.name}
          ref={(el) => {
            nodes.current[i] = el;
          }}
          onPointerOver={(e) => {
            if (scene.nodes < 0.5) return;
            e.stopPropagation();
            activeSkill.set(i);
            cursorLabel.set("Explore");
          }}
          onPointerOut={() => cursorLabel.set(null)}
        >
          <octahedronGeometry args={[0.075, 0]} />
          <meshStandardMaterial color="#d9d9d6" metalness={1} roughness={0.25} envMapIntensity={1.4} />
          <Html center portal={portal} zIndexRange={[4, 0]} style={{ pointerEvents: "none" }}>
            <div
              ref={(el) => {
                labels.current[i] = el;
              }}
              className="skill-label"
              aria-hidden="true"
            >
              {skill.name}
            </div>
          </Html>
        </mesh>
      ))}
    </group>
  );
}

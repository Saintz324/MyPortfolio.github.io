"use client";

import { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer, PerformanceMonitor } from "@react-three/drei";
import type { PointLight } from "three";
import { world } from "@/lib/world";
import { CameraController } from "./CameraController";
import { HeroObject } from "./HeroObject";
import { ParticleField } from "./ParticleField";
import { Dust } from "./Dust";
import { SkillSystem } from "./SkillSystem";

/** A light that follows the pointer, so the chrome answers to the hand. */
function PointerLight() {
  const ref = useRef<PointLight>(null);
  useFrame(() => {
    const l = ref.current;
    if (!l) return;
    l.position.set(world.mouseEased.x * 4, world.mouseEased.y * 3 + 1, 3.5);
    l.intensity = 18 * world.intro;
  });
  return <pointLight ref={ref} color="#ffffff" distance={14} decay={2} />;
}

/** Studio lighting built from local light-formers: no HDR download, monochrome by design. */
function Studio() {
  return (
    <Environment resolution={256} frames={1}>
      <Lightformer form="rect" intensity={3.2} position={[0, 5, -6]} scale={[12, 1.2, 1]} />
      <Lightformer form="rect" intensity={1.6} position={[-6, 0.5, 1]} rotation-y={Math.PI / 2} scale={[9, 0.5, 1]} />
      <Lightformer form="rect" intensity={1.2} position={[6, -1, 0]} rotation-y={-Math.PI / 2} scale={[9, 0.35, 1]} />
      <Lightformer form="ring" intensity={2.2} position={[2.5, 2, 6]} scale={2.2} />
      <Lightformer form="rect" intensity={0.6} position={[0, -5, 2]} rotation-x={-Math.PI / 2} scale={[10, 10, 1]} />
    </Environment>
  );
}

export default function Scene() {
  const [mobile] = useState(() => window.matchMedia("(max-width: 767px), (pointer: coarse)").matches);
  const [dpr, setDpr] = useState<number>(mobile ? 1.25 : 1.75);

  return (
    <Canvas
      className="!fixed inset-0"
      dpr={dpr}
      camera={{ fov: 35, near: 0.1, far: 80, position: [0, 0, 6] }}
      gl={{ antialias: !mobile, alpha: true, powerPreference: "high-performance" }}
      eventSource={document.body}
      eventPrefix="client"
      aria-hidden="true"
    >
      <PerformanceMonitor onDecline={() => setDpr(1)} onIncline={() => setDpr(mobile ? 1.25 : 1.75)} />
      <CameraController />
      <Studio />
      <ambientLight intensity={0.15} />
      <PointerLight />
      <Dust count={mobile ? 260 : 700} />
      <ParticleField count={mobile ? 3500 : 9000} />
      <HeroObject segments={mobile ? 180 : 360} />
      <SkillSystem />
    </Canvas>
  );
}

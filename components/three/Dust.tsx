"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { BufferAttribute, BufferGeometry, ShaderMaterial, type Points } from "three";
import { dustField } from "@/lib/shapes";
import { world } from "@/lib/world";
import { scene } from "./sceneState";

const vertex = /* glsl */ `
  uniform float uTime;
  uniform float uDrift;
  uniform float uPixelRatio;
  attribute float aSeed;
  varying float vAlpha;
  void main() {
    vec3 p = position;
    p.y = mod(p.y + uDrift * (0.3 + aSeed) + 8.0, 16.0) - 8.0;
    p.x += sin(uTime * 0.2 + aSeed * 40.0) * 0.3;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = (6.0 + aSeed * 10.0) * uPixelRatio / -mv.z;
    // fade with depth so the far field reads as atmosphere, not noise
    vAlpha = smoothstep(32.0, 4.0, -mv.z);
  }
`;

const fragment = /* glsl */ `
  uniform float uOpacity;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d) * vAlpha * uOpacity;
    if (a < 0.01) discard;
    gl_FragColor = vec4(vec3(0.85), a);
  }
`;

/** Atmospheric dust: the deepest layer. Drifts slowly and streams with scroll velocity. */
export function Dust({ count }: { count: number }) {
  const ref = useRef<Points>(null);
  const drift = useRef(0);
  const dpr = useThree((s) => s.viewport.dpr);

  const geometry = useMemo(() => {
    const g = new BufferGeometry();
    const { positions, seeds } = dustField(count);
    g.setAttribute("position", new BufferAttribute(positions, 3));
    g.setAttribute("aSeed", new BufferAttribute(seeds, 1));
    return g;
  }, [count]);

  const material = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: vertex,
        fragmentShader: fragment,
        transparent: true,
        depthWrite: false,
        uniforms: { uTime: { value: 0 }, uDrift: { value: 0 }, uOpacity: { value: 0 }, uPixelRatio: { value: 1 } },
      }),
    [],
  );

  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );

  useFrame((state, delta) => {
    const u = (ref.current?.material as ShaderMaterial | undefined)?.uniforms;
    if (!u) return;
    const dt = Math.min(delta, 0.1);
    // Scroll direction pushes the field, so fast scrolling streams the dust past the lens.
    drift.current += dt * 0.15 + (world.reduced ? 0 : world.velocity * 0.0025);
    u.uTime.value = state.clock.elapsedTime;
    u.uDrift.value = drift.current;
    u.uOpacity.value = scene.dust * world.intro * 0.55;
    u.uPixelRatio.value = dpr;
  });

  return <points ref={ref} geometry={geometry} material={material} frustumCulled={false} />;
}

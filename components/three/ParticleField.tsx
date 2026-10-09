"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { AdditiveBlending, BufferAttribute, BufferGeometry, ShaderMaterial, type Points } from "three";
import { braces, knot, randoms, ring, shell } from "@/lib/shapes";
import { world } from "@/lib/world";
import { scene } from "./sceneState";

const vertex = /* glsl */ `
  uniform float uTime;
  uniform float uShape;
  uniform float uScatter;
  uniform float uSize;
  uniform float uPixelRatio;
  uniform float uOpacity;
  uniform float uSpeed;
  attribute vec3 aBraces;
  attribute vec3 aKnot;
  attribute vec3 aRing;
  attribute vec3 aShell;
  attribute vec4 aRand;
  varying float vAlpha;

  float w(float i) { return clamp(1.0 - abs(uShape - i), 0.0, 1.0); }

  void main() {
    vec3 p = aBraces * w(0.0) + aKnot * w(1.0) + aRing * w(2.0) + aShell * w(3.0);

    // Between two shapes the form explodes outward and re-condenses:
    // fragments -> particles -> reassembly, driven purely by scroll.
    float between = sin(fract(uShape) * 3.14159265);
    vec3 dir = normalize(aRand.xyz - 0.5 + 0.0001);
    p += dir * (between * (0.9 + aRand.w * 2.4) + uScatter * (0.4 + aRand.w));

    float t = uTime * (0.5 + aRand.w * 0.5);
    p += 0.035 * (1.0 + uSpeed * 5.0) * vec3(
      sin(t + aRand.x * 30.0),
      cos(t * 0.9 + aRand.y * 30.0),
      sin(t * 0.8 + aRand.z * 30.0)
    );

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = min(uSize * uPixelRatio * (0.5 + aRand.w) * (1.0 / -mv.z), 7.0 * uPixelRatio);
    vAlpha = uOpacity * (0.3 + 0.7 * aRand.w) * (1.0 - between * 0.35);
  }
`;

const fragment = /* glsl */ `
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.1, d) * vAlpha;
    if (a < 0.01) discard;
    gl_FragColor = vec4(vec3(0.93, 0.93, 0.91), a);
  }
`;

/**
 * One particle system, four forms (braces, knot, ring, shell). Each particle stores its position in every form;
 * the shader blends them with `uShape`, which comes straight from the scroll timeline.
 */
export function ParticleField({ count }: { count: number }) {
  const ref = useRef<Points>(null);
  const dpr = useThree((s) => s.viewport.dpr);

  const geometry = useMemo(() => {
    const g = new BufferGeometry();
    const base = braces(count);
    g.setAttribute("position", new BufferAttribute(base, 3));
    g.setAttribute("aBraces", new BufferAttribute(base, 3));
    g.setAttribute("aKnot", new BufferAttribute(knot(count), 3));
    g.setAttribute("aRing", new BufferAttribute(ring(count), 3));
    g.setAttribute("aShell", new BufferAttribute(shell(count), 3));
    g.setAttribute("aRand", new BufferAttribute(randoms(count), 4));
    return g;
  }, [count]);

  const material = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: vertex,
        fragmentShader: fragment,
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uShape: { value: 0 },
          uScatter: { value: 0 },
          uSize: { value: 14 },
          uPixelRatio: { value: 1 },
          uOpacity: { value: 0 },
          uSpeed: { value: 0 },
        },
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

  useFrame((state) => {
    const u = (ref.current?.material as ShaderMaterial | undefined)?.uniforms;
    if (!u || !ref.current) return;
    u.uTime.value = state.clock.elapsedTime;
    u.uShape.value = Math.min(3, Math.max(0, scene.shape));
    u.uScatter.value = world.pulse * 0.6 + (world.projectHover ? 0.15 : 0);
    u.uSpeed.value = world.reduced ? 0 : world.speed;
    u.uPixelRatio.value = dpr;
    u.uOpacity.value = scene.particles * world.intro * 0.85;
    ref.current.visible = scene.particles > 0.005;
    ref.current.rotation.y += (world.reduced ? 0.0005 : 0.0015 + world.speed * 0.01);
  });

  return <points ref={ref} geometry={geometry} material={material} frustumCulled={false} />;
}

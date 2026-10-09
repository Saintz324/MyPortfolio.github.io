"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { Vector3, type PerspectiveCamera } from "three";
import { sampleScene, createSceneState, type SceneState } from "@/lib/timeline";
import { damp } from "@/lib/math";
import { world } from "@/lib/world";
import { scene, skillFocus } from "./sceneState";

const FIELDS = Object.keys(scene) as (keyof SceneState)[];

/**
 * Scroll is the camera.
 * Runs before every other frame callback: samples the timeline at the current scroll
 * position, eases the shared scene state toward it, then places the camera.
 */
export function CameraController() {
  const targetRef = useRef<SceneState>(null);
  const lookRef = useRef(new Vector3());

  useFrame((state, delta) => {
    const camera = state.camera as PerspectiveCamera;
    const size = state.size;
    targetRef.current ??= createSceneState();
    const target = targetRef.current;
    const look = lookRef.current;
    const dt = Math.min(delta, 0.1);
    sampleScene(world.t, target);

    // Ease toward the sampled state. Scroll is already smoothed by Lenis; this
    // removes residual stepping on fast flicks and lets the world settle physically.
    const k = world.reduced ? 1 : damp(5, dt);
    for (const f of FIELDS) scene[f] += (target[f] - scene[f]) * k;

    const mx = world.mouseEased.x;
    const my = world.mouseEased.y;
    const intro = world.intro;

    if (world.reduced) {
      camera.position.set(0, 0.4, 6.5);
      look.set(0, 0, 0);
    } else {
      const theta = scene.camTheta + mx * 0.12;
      const radius = scene.camRadius * (world.mobile ? 1.3 : 1) + (1 - intro) * 2.5;
      camera.position.set(
        Math.sin(theta) * radius,
        scene.camHeight + my * 0.28,
        Math.cos(theta) * radius,
      );
      look.set(0, scene.objY, 0).lerp(skillFocus.position, skillFocus.weight * 0.14);
    }
    camera.lookAt(look);

    // Velocity widens the lens slightly: speed reads as depth, not noise.
    camera.fov = scene.fov + (world.reduced ? 0 : world.speed * 3.5);
    const vx = world.mobile ? 0 : world.reduced ? 0.2 : scene.viewX;
    const vy = world.mobile ? scene.viewY : 0;
    camera.setViewOffset(size.width, size.height, -vx * size.width, -vy * size.height, size.width, size.height);
    camera.updateProjectionMatrix();
  }, -1);

  return null;
}

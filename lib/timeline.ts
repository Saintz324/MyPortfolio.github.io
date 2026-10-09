/**
 * The scene timeline.
 * Page scroll is mapped to a continuous value `t` (see world.ts):
 *   0 hero · 1 about · 2 skills · 3 work · 4 experience · 5 contact · 6 end
 * Each key below is a complete description of the 3D world at a point on that
 * timeline. The camera, object, particles and skill nodes all read one sampled state,
 * which is what makes scrolling feel like moving through a single space.
 */

import { clamp, lerp, smoothstep } from "./math";

export type SceneState = {
  /** Camera orbit around the subject. */
  camRadius: number;
  camTheta: number;
  camHeight: number;
  /** Horizontal framing offset (fraction of the viewport), shifts the subject left/right on screen. */
  viewX: number;
  /** Vertical framing offset, used on small screens to move the subject below the text column. */
  viewY: number;
  fov: number;
  /** Central sculpture. */
  objScale: number;
  objY: number;
  spin: number;
  distort: number;
  /** 0..1 visibility of the solid sculpture. */
  solid: number;
  /** Half the distance between the two braces (the "{ }" opening and closing). */
  braceGap: number;
  /** Scale of the small core held between the braces. */
  core: number;
  /** Particle morph target: 0 braces · 1 knot · 2 ring · 3 shell. */
  shape: number;
  particles: number;
  dust: number;
  /** Skill nodes visibility and orbit radius. */
  nodes: number;
  nodeRadius: number;
};

type Key = { t: number } & SceneState;

const base: SceneState = {
  camRadius: 3.4,
  camTheta: 0,
  camHeight: 0,
  viewX: 0,
  viewY: 0,
  fov: 35,
  objScale: 0.85,
  objY: 0,
  spin: 0.15,
  distort: 0.22,
  solid: 1,
  braceGap: 0.95,
  core: 0,
  shape: 0,
  particles: 0,
  dust: 0.15,
  nodes: 0,
  nodeRadius: 2.6,
};

const k = (t: number, s: Partial<SceneState>, prev: SceneState): Key => ({ ...prev, ...s, t });

function build(): Key[] {
  const keys: Key[] = [];
  const push = (t: number, s: Partial<SceneState>) => {
    const prev = keys.length ? keys[keys.length - 1] : { ...base, t: 0 };
    keys.push(k(t, s, prev));
  };

  // HERO: an empty code block, close to the lens, hidden behind the poster, revealed as it recedes.
  push(0, {});
  push(0.62, { camRadius: 4.6, camTheta: 0.18, camHeight: 0.15, spin: 0.35, distort: 0.3, dust: 0.35 });
  // ABOUT: camera pulls back, the subject drifts right, atmosphere fills in.
  push(1, { viewY: 0.2, camRadius: 6, camTheta: -0.5, camHeight: 0.6, viewX: 0.22, spin: 0.45, distort: 0.34, dust: 1 });
  push(1.7, { camRadius: 6.6, camTheta: -0.95, camHeight: 0.2, viewX: 0.24 });
  // SKILLS: the braces open wide and the stack orbits inside them. The skills are the block's content.
  push(2, { viewY: 0.27, camRadius: 7.4, camTheta: -0.35, camHeight: 1.4, viewX: 0.2, objScale: 0.95, braceGap: 1.85, core: 1, spin: 0.3, distort: 0.16, nodes: 1, nodeRadius: 1.45, particles: 0 });
  push(2.88, { camRadius: 7.8, camTheta: 0.45, camHeight: 0.2, viewX: 0.2, nodes: 1 });
  // WORK: the solid fragments into particles, which reassemble into a knot the camera flies through.
  // (gap and scale here match the particle braces in lib/shapes.ts, so the burst starts from the exact form)
  push(3.02, { viewY: 0, camRadius: 6.4, camTheta: 0.6, camHeight: 0.3, viewX: 0, objScale: 1, braceGap: 1.1, core: 0, distort: 0.7, nodes: 0, particles: 0.2 });
  push(3.18, { solid: 0, distort: 1, particles: 0.9, shape: 0, objScale: 1.15 });
  push(3.5, { shape: 1, camRadius: 5, camTheta: 2.1, camHeight: -0.4, particles: 0.85 });
  push(3.92, { shape: 1, camRadius: 2.6, camTheta: 3.7, camHeight: 0.1 });
  // EXPERIENCE: everything simplifies. Small braces inside a thin ring, a steady camera.
  push(4.1, { viewY: 0.18, shape: 2, solid: 1, objScale: 0.42, braceGap: 0.85, distort: 0.12, spin: 0.12, camRadius: 6.8, camTheta: 6.28, camHeight: 1.6, viewX: 0.26, particles: 0.7 });
  push(4.85, { camRadius: 7, camTheta: 6.45, camHeight: 1.4, viewX: 0.26 });
  // CONTACT: the stack converges, the braces close around the core, the camera pulls far back.
  push(5.1, { viewY: 0.05, shape: 3, objScale: 0.7, braceGap: 0.8, core: 1, nodes: 1, nodeRadius: 0.75, camRadius: 10, camTheta: 6.1, camHeight: 2.4, viewX: 0.2, particles: 0.9, spin: 0.2 });
  push(6, { shape: 3, objScale: 1.05, braceGap: 0.62, nodeRadius: 0.4, nodes: 0.55, camRadius: 12.5, camTheta: 5.75, camHeight: 3.4, viewX: 0.18, dust: 1 });

  return keys;
}

export const KEYS = build();
const FIELDS = Object.keys(base) as (keyof SceneState)[];

/** Samples the timeline into `out` (no allocation per frame). */
export function sampleScene(t: number, out: SceneState): SceneState {
  const last = KEYS[KEYS.length - 1];
  if (t <= KEYS[0].t) return Object.assign(out, KEYS[0]);
  if (t >= last.t) return Object.assign(out, last);
  let i = 0;
  while (i < KEYS.length - 2 && t > KEYS[i + 1].t) i++;
  const a = KEYS[i];
  const b = KEYS[i + 1];
  const p = smoothstep(clamp((t - a.t) / (b.t - a.t)));
  for (const f of FIELDS) out[f] = lerp(a[f], b[f], p);
  return out;
}

export const createSceneState = (): SceneState => ({ ...base });

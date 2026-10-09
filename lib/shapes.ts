import { BRACE_TUBE, bracePath } from "./brace";

/**
 * Particle morph targets. Each returns `count * 3` positions.
 * A seeded PRNG keeps shapes identical between renders.
 */

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const GOLDEN = Math.PI * (3 - Math.sqrt(5));

/** Even distribution on a sphere surface, matching the solid sculpture. */
export function sphere(count: number, radius = 1.02) {
  const out = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const th = GOLDEN * i;
    out[i * 3] = Math.cos(th) * r * radius;
    out[i * 3 + 1] = y * radius;
    out[i * 3 + 2] = Math.sin(th) * r * radius;
  }
  return out;
}

/** The "{ }" sculpture as a point cloud: points on the surface of both brace tubes. */
export function braces(count: number, gap = 1.1) {
  const rand = mulberry32(3);
  const path = bracePath();
  const out = new Float32Array(count * 3);
  const p = new Float32Array(3);
  for (let i = 0; i < count; i++) {
    const pt = path.getPointAt(rand());
    // a random point on a sphere around the centerline sweeps out the tube surface
    const a = rand() * Math.PI * 2;
    const b = Math.acos(2 * rand() - 1);
    const r = BRACE_TUBE * (0.9 + rand() * 0.25);
    p[0] = pt.x + r * Math.sin(b) * Math.cos(a);
    p[1] = pt.y + r * Math.sin(b) * Math.sin(a);
    p[2] = pt.z + r * Math.cos(b);
    const side = i % 2 === 0 ? -1 : 1;
    // the right brace is the left one mirrored ("{" -> "}")
    out[i * 3] = side < 0 ? p[0] - gap : gap - p[0];
    out[i * 3 + 1] = p[1];
    out[i * 3 + 2] = side < 0 ? p[2] : -p[2];
  }
  return out;
}

/** (2,3) torus knot with a volumetric tube. */
export function knot(count: number, scale = 0.95, tube = 0.3) {
  const rand = mulberry32(7);
  const out = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const t = rand() * Math.PI * 2;
    const p = 2;
    const q = 3;
    const r = Math.cos(q * t) + 2;
    const x = r * Math.cos(p * t);
    const y = r * Math.sin(p * t);
    const z = -Math.sin(q * t);
    // random offset inside the tube, denser at the core
    const a = rand() * Math.PI * 2;
    const b = Math.acos(2 * rand() - 1);
    const d = tube * Math.pow(rand(), 0.6);
    out[i * 3] = (x + d * Math.sin(b) * Math.cos(a)) * scale;
    out[i * 3 + 1] = (y + d * Math.sin(b) * Math.sin(a)) * scale;
    out[i * 3 + 2] = (z + d * Math.cos(b)) * scale;
  }
  return out;
}

/** Flat, minimal orbit: one wide band and one hairline ring. */
export function ring(count: number) {
  const rand = mulberry32(21);
  const out = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const a = rand() * Math.PI * 2;
    const hairline = i % 5 === 0;
    const r = hairline ? 1.25 + (rand() - 0.5) * 0.01 : 2.3 + Math.pow(rand(), 1.6) * 1.1;
    out[i * 3] = Math.cos(a) * r;
    out[i * 3 + 1] = (rand() - 0.5) * (hairline ? 0.004 : 0.05);
    out[i * 3 + 2] = Math.sin(a) * r;
  }
  return out;
}

/** Final payoff: a large shell with an equatorial disc. */
export function shell(count: number) {
  const rand = mulberry32(42);
  const out = new Float32Array(count * 3);
  const shellCount = Math.floor(count * 0.62);
  const surface = sphere(shellCount, 4.4);
  out.set(surface);
  for (let i = shellCount; i < count; i++) {
    const a = rand() * Math.PI * 2;
    const r = 1.8 + Math.pow(rand(), 0.7) * 5.2;
    out[i * 3] = Math.cos(a) * r;
    out[i * 3 + 1] = (rand() - 0.5) * 0.08 * r * 0.3;
    out[i * 3 + 2] = Math.sin(a) * r;
  }
  return out;
}

/** Per-particle random vec4 (direction seed + magnitude). */
export function randoms(count: number) {
  const rand = mulberry32(99);
  const out = new Float32Array(count * 4);
  for (let i = 0; i < out.length; i++) out[i] = rand();
  return out;
}

/** Atmospheric dust volume: positions plus a per-particle seed. */
export function dustField(count: number) {
  const rand = mulberry32(5);
  const positions = new Float32Array(count * 3);
  const seeds = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (rand() - 0.5) * 34;
    positions[i * 3 + 1] = (rand() - 0.5) * 16;
    positions[i * 3 + 2] = (rand() - 0.5) * 34;
    seeds[i] = rand();
  }
  return { positions, seeds };
}

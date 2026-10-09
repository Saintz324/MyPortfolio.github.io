export const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Frame-rate independent damping factor. */
export const damp = (lambda: number, dt: number) => 1 - Math.exp(-lambda * dt);

export const smoothstep = (t: number) => t * t * (3 - 2 * t);

/** Maps v from [a, b] to [0, 1], clamped. */
export const range = (v: number, a: number, b: number) => clamp((v - a) / (b - a));

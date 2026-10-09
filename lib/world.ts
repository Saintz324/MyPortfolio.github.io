/**
 * The world store.
 * High-frequency values (scroll, velocity, pointer, timeline position) live in a
 * plain mutable object read inside animation loops. React never re-renders for them.
 * Low-frequency UI state uses tiny signals that React subscribes to.
 */

type Listener<T> = (value: T) => void;

export type Signal<T> = {
  get: () => T;
  set: (value: T) => void;
  subscribe: (listener: Listener<T>) => () => void;
};

export function signal<T>(initial: T): Signal<T> {
  let value = initial;
  const listeners = new Set<Listener<T>>();
  return {
    get: () => value,
    set: (next) => {
      if (Object.is(next, value)) return;
      value = next;
      listeners.forEach((l) => l(next));
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

export const world = {
  /** Smoothed scroll offset in px. */
  scroll: 0,
  /** Continuous scene timeline: integer = section index, fraction = progress to the next. */
  t: 0,
  /** Raw scroll velocity (px per frame, signed). */
  velocity: 0,
  /** Normalized, eased absolute velocity in the 0..~2 range. */
  speed: 0,
  /** Pointer in normalized device coordinates (-1..1), and an eased copy. */
  mouse: { x: 0, y: 0 },
  mouseEased: { x: 0, y: 0 },
  /** Scroll anchors (px) for each [data-scene] section, last entry = max scroll. */
  anchors: [] as number[],
  /** 0..1 reveal of the 3D world, driven by the intro. */
  intro: 0,
  /** Short-lived impulse (0..1) used for particle bursts. */
  pulse: 0,
  objectHover: false,
  projectHover: false,
  reduced: false,
  mobile: false,
};

/** Skill highlighted in the 3D system (-1 = none). */
export const activeSkill = signal<number>(-1);
/** Text shown inside the custom cursor (null = default dot). */
export const cursorLabel = signal<string | null>(null);
/** Intro finished, page is interactive. */
export const introDone = signal(false);

export function timelineFromScroll(y: number, anchors: number[]) {
  if (anchors.length < 2 || y <= anchors[0]) return 0;
  for (let i = 0; i < anchors.length - 1; i++) {
    if (y < anchors[i + 1]) {
      const span = Math.max(1, anchors[i + 1] - anchors[i]);
      return i + (y - anchors[i]) / span;
    }
  }
  return anchors.length - 1;
}

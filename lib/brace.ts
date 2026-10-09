import { CubicBezierCurve3, CurvePath, LineCurve3, Vector3 } from "three";

/**
 * Centerline of a curly brace "{", 2 units tall, centered on its own origin.
 * The point faces -x (outward), the open ends face +x (inward).
 * Shared by the chrome sculpture and the particle morph target so both match exactly.
 */
export const BRACE_TUBE = 0.085;

const v = (x: number, y: number) => new Vector3(x, y, 0);

export function bracePath() {
  const path = new CurvePath<Vector3>();
  // top arm
  path.add(new CubicBezierCurve3(v(0.38, 1), v(0.16, 1), v(0.08, 0.93), v(0.08, 0.72)));
  path.add(new LineCurve3(v(0.08, 0.72), v(0.08, 0.3)));
  // the point
  path.add(new CubicBezierCurve3(v(0.08, 0.3), v(0.08, 0.08), v(-0.1, 0), v(-0.28, 0)));
  path.add(new CubicBezierCurve3(v(-0.28, 0), v(-0.1, 0), v(0.08, -0.08), v(0.08, -0.3)));
  // bottom arm
  path.add(new LineCurve3(v(0.08, -0.3), v(0.08, -0.72)));
  path.add(new CubicBezierCurve3(v(0.08, -0.72), v(0.08, -0.93), v(0.16, -1), v(0.38, -1)));
  return path;
}

/** Ends of the stroke, used to cap the open tube. */
export const BRACE_ENDS: [number, number][] = [
  [0.38, 1],
  [0.38, -1],
];

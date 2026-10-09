import { Vector3 } from "three";
import { createSceneState } from "@/lib/timeline";

/** Eased scene state shared by every 3D component (written by SceneDriver each frame). */
export const scene = createSceneState();

/** World-space position of the highlighted skill node, used to steer the camera. */
export const skillFocus = { position: new Vector3(), weight: 0 };

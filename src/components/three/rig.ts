import type * as THREE from "three";

/** Suspension motion of the body only (the wheels stay planted): heave (m), pitch (rad, + nose up) about the rear axle, roll (rad, + leaning right). */
export type BodyMotion = { heave: number; pitch: number; roll: number };

/** What the hero world needs from a car (built by makeGLBRig). Lengths in metres, car frame: x forward, y up, z right. */
export type Rig = {
  root: THREE.Object3D;
  L: number;
  W: number;
  H: number;
  /** Front / rear axle x. */
  fx: number;
  rx: number;
  wheelY: number;
  wheelR: number;
  headGain: number;
  headPos: THREE.Vector3[];
  tailPos: THREE.Vector3;
  headMats: THREE.MeshStandardMaterial[];
  tailMats: THREE.MeshStandardMaterial[];
  casters: THREE.Mesh[];
  paintMats: THREE.MeshStandardMaterial[];
  /** `spin`: wheel angle about the axle (rad); `steer`: front-wheel angle (rad, + = left). */
  update: (spin: number, steer: number, body: BodyMotion) => void;
  dispose?: () => void;
};

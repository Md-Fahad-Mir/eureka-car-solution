/**
 * Hero choreography as plain numbers (no three.js), so it can be unit-tested:
 * the drive path and its geometry, the vehicle-dynamics helpers, the timed
 * intro and the scroll keyframes.
 *
 * Car frame: x forward (nose), y up, z to the car's right. World yaw is about
 * +y, so a positive yaw (and a positive steer or curvature) turns left.
 * Camera positions are in metres in the car frame; camera targets give x/z in
 * metres and y as a fraction of the car's height, so a tall SUV and a low
 * coupe are framed alike.
 */

export type Vec3 = readonly [number, number, number];

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
export const clamp01 = (t: number) => clamp(t, 0, 1);
export const smooth = (t: number) => t * t * (3 - 2 * t);
/** C2-continuous ease (zero velocity and acceleration at both ends). */
export const smoother = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
const smootherD1 = (t: number) => 30 * t * t * (t - 1) * (t - 1);
const smootherD2 = (t: number) => 60 * t * (2 * t * t - 3 * t + 1);

/* ───────────── Drive path: straight, a smooth lane change to the left, straight ───────────── */

export const PATH = {
  /** Where the car waits before the intro drive-in. */
  introStart: -8,
  /** The lane change: lateral shift (negative z = to the left) between bendStart and bendEnd (metres along x). */
  laneShift: -3.2,
  bendStart: 7,
  bendEnd: 19,
  /** Where the car stops at the end of the drive. */
  end: 26,
} as const;

const BEND = PATH.bendEnd - PATH.bendStart;

/** Path parameter s is the x coordinate; z(s) and its derivatives describe the lane change. */
function lateral(s: number) {
  const u = (s - PATH.bendStart) / BEND;
  if (u <= 0) return { z: 0, d1: 0, d2: 0 };
  if (u >= 1) return { z: PATH.laneShift, d1: 0, d2: 0 };
  return { z: PATH.laneShift * smoother(u), d1: (PATH.laneShift * smootherD1(u)) / BEND, d2: (PATH.laneShift * smootherD2(u)) / (BEND * BEND) };
}

export type PathPose = { x: number; z: number; yaw: number; curvature: number };

/** Position, heading (yaw) and signed curvature (1/m, + = turning left) at path parameter s. */
export function pathPose(s: number): PathPose {
  const { z, d1, d2 } = lateral(s);
  return { x: s, z, yaw: -Math.atan(d1), curvature: -d2 / Math.pow(1 + d1 * d1, 1.5) };
}

/** Distance actually travelled along the path from s = 0 (arc length; negative behind the start). */
const LUT_STEP = 0.05;
const LUT_FROM = PATH.introStart - 1;
const LUT = (() => {
  const n = Math.ceil((PATH.end + 1 - LUT_FROM) / LUT_STEP);
  const out = new Float64Array(n + 1);
  for (let i = 1; i <= n; i++) {
    // Simpson's rule on each step.
    const a = LUT_FROM + (i - 1) * LUT_STEP, m = a + LUT_STEP / 2, b = a + LUT_STEP;
    const f = (s: number) => Math.sqrt(1 + lateral(s).d1 ** 2);
    out[i] = out[i - 1] + (LUT_STEP / 6) * (f(a) + 4 * f(m) + f(b));
  }
  return out;
})();
const zeroAt = LUT[Math.round((0 - LUT_FROM) / LUT_STEP)];
export function arcLength(s: number) {
  const x = clamp((s - LUT_FROM) / LUT_STEP, 0, LUT.length - 1);
  const i = Math.min(LUT.length - 2, Math.floor(x));
  return LUT[i] + (LUT[i + 1] - LUT[i]) * (x - i) - zeroAt;
}

/* ───────────── Vehicle dynamics (body only; the wheels stay planted) ───────────── */

/** Front-wheel steer angle for a path curvature (bicycle model): tan δ = wheelbase · κ. */
export const steerFor = (wheelbase: number, curvature: number) => Math.atan(wheelbase * curvature);
/** Wheel spin angle for a distance travelled: rolling without slip, θ = -d / r (forward = negative about the axle). */
export const spinFor = (distance: number, wheelRadius: number) => -distance / wheelRadius;
/**
 * Body roll (rad, + = leaning right) from lateral acceleration v²κ: about 0.35° per m/s².
 * Capped so the body moves no more than ~1.5 cm over a wheel: the arches must stay round the tyres.
 */
export const rollFor = (speed: number, curvature: number) => clamp(0.006 * speed * speed * curvature, -0.016, 0.016);
/** Body pitch (rad, + = nose up, about mid-wheelbase) from longitudinal acceleration: squat when speeding up, dive when braking. Capped like roll. */
export const pitchFor = (accel: number) => clamp(0.004 * accel, -0.01, 0.01);

/* ───────────── Camera helpers ───────────── */

/** Interpolate around the car's vertical axis (radius, angle the short way round, height), so the camera never cuts through it. */
export function orbitLerp(a: Vec3, b: Vec3, f: number): Vec3 {
  const ra = Math.hypot(a[0], a[2]), rb = Math.hypot(b[0], b[2]), ta = Math.atan2(a[2], a[0]);
  let d = Math.atan2(b[2], b[0]) - ta;
  if (d > Math.PI) d -= 2 * Math.PI;
  if (d < -Math.PI) d += 2 * Math.PI;
  const r = ra + (rb - ra) * f, t = ta + d * f;
  return [Math.cos(t) * r, a[1] + (b[1] - a[1]) * f, Math.sin(t) * r];
}
export const lerp3 = (a: Vec3, b: Vec3, f: number): Vec3 => [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f];

/** One camera + car state. `head`: headlights 0..1; `lights`: studio light level 0..1. */
export type Pose = { cam: Vec3; tgt: Vec3; s: number; head: number; lights: number };

/* ───────────── Intro (timed, plays once when the car is in place) ───────────── */

export const INTRO = {
  /** Lights rise from black and a light pass draws the body lines. */
  reveal: 2.4,
  /** Headlights ignite. */
  headlights: 3.6,
  /** Camera orbits from the front three-quarter to the side profile. */
  orbitEnd: 7,
  /** The car drives in and brakes to a stop; the camera tracks it round to the hero view. */
  driveEnd: 10.4,
  /** Settled: the hero composition (= scroll keyframe 0). */
  end: 11.2,
} as const;

const HERO_TARGET: Vec3 = [0, 0.42, 0];

/* ───────────── Scroll keyframes ───────────── */

export type Key = { cam: Vec3; tgt: Vec3; cap: number };

/**
 * Hero composition, then: I Overview (side profile) · II Exterior design (lamps
 * and nose, then wheel and flank) · III Performance (pulls away, then low
 * tracking through the bend) · IV Technology (high three-quarter, callouts) ·
 * V Interior (from above, down through the glass) · VI Explore (dramatic three-quarter; the
 * visitor takes the camera).
 */
export const KEYS: readonly Key[] = [
  { cap: -1, cam: [7.0, 1.55, 6.1], tgt: HERO_TARGET },
  { cap: 0, cam: [0.3, 1.2, 9.2], tgt: [0, 0.42, 0] },
  { cap: 1, cam: [5.1, 1.1, 2.6], tgt: [1.9, 0.55, 0.5] },
  { cap: 1, cam: [2.6, 0.6, 3.6], tgt: [1.2, 0.32, 0.85] },
  { cap: 2, cam: [-3.4, 1.45, 7.4], tgt: [0.4, 0.4, 0] },
  { cap: 2, cam: [7.2, 0.85, 3.8], tgt: [0, 0.4, 0] },
  { cap: 3, cam: [5.2, 4.8, 6.0], tgt: [0, 0.3, 0] },
  { cap: 4, cam: [-0.7, 3.3, 2.5], tgt: [0.15, 0.35, 0] },
  { cap: 5, cam: [6.4, 0.95, 4.9], tgt: [0, 0.45, 0] },
];

/** The drive spans keyframes 3 → 6: it pulls away at the end of the design chapter and stops for technology. */
export const DRIVE_KEYS = [3, 6] as const;

/** Keyframes hold still around each stop, so captions can be read. */
const hold = (f: number) => smooth(clamp01((f - 0.12) / 0.76));

/** Scroll pose at keyframe position t (0 … KEYS.length - 1). The car's distance flows through the drive without stopping at keyframes. */
export function scrollPose(t: number): Pose & { cap: number } {
  const last = KEYS.length - 1;
  const i = Math.min(last - 1, Math.max(0, Math.floor(t)));
  const f = hold(clamp(t - i, 0, 1));
  const a = KEYS[i], b = KEYS[i + 1];
  const drive = clamp01((t - DRIVE_KEYS[0]) / (DRIVE_KEYS[1] - DRIVE_KEYS[0]));
  return {
    cam: orbitLerp(a.cam, b.cam, f),
    tgt: lerp3(a.tgt, b.tgt, f),
    s: PATH.end * smoother(drive),
    head: 1,
    lights: 1,
    cap: t - i < 0.5 ? a.cap : b.cap,
  };
}

/** Intro pose at time t (seconds since the car was ready). Ends exactly at scroll keyframe 0. */
export function introPose(t: number): Pose {
  const revealCam: Vec3 = [7.6, 1.5, 6.4], frontCam: Vec3 = [6.0, 1.2, 4.6], sideCam: Vec3 = [0.6, 1.2, 8.6];
  let cam: Vec3;
  if (t < INTRO.headlights) cam = lerp3(revealCam, frontCam, smooth(clamp01(t / INTRO.headlights)));
  else if (t < INTRO.orbitEnd) cam = orbitLerp(frontCam, sideCam, smoother(clamp01((t - INTRO.headlights) / (INTRO.orbitEnd - INTRO.headlights))));
  else cam = orbitLerp(sideCam, KEYS[0].cam, smoother(clamp01((t - INTRO.orbitEnd) / (INTRO.end - INTRO.orbitEnd))));
  const drive = clamp01((t - INTRO.orbitEnd) / (INTRO.driveEnd - INTRO.orbitEnd));
  return {
    cam,
    tgt: HERO_TARGET,
    s: PATH.introStart * (1 - smoother(drive)),
    head: clamp01((t - INTRO.reveal) / (INTRO.headlights - INTRO.reveal)),
    lights: smooth(clamp01(t / INTRO.reveal)),
  };
}

/** Blend two poses (camera orbits round the car). */
export function mixPose(a: Pose, b: Pose, f: number): Pose {
  return {
    cam: orbitLerp(a.cam, b.cam, f),
    tgt: lerp3(a.tgt, b.tgt, f),
    s: a.s + (b.s - a.s) * f,
    head: a.head + (b.head - a.head) * f,
    lights: a.lights + (b.lights - a.lights) * f,
  };
}

/** Caption state per keyframe (checked against the config in tests). */
export const KEYFRAME_CAPS = KEYS.map((k) => k.cap);

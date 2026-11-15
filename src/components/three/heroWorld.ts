/**
 * Homepage hero 3D world, ported from reference/eureka-reference (Spyder demo)
 * to three r187 and driven by React Three Fiber (see HeroCanvas.tsx).
 *
 * Imperative on purpose: the custom shaders (clay scan, x-ray ghost), the
 * mirror-gloss floor pass and the scroll choreography map 1:1 onto the
 * reference this way. R3F owns the renderer, canvas, resize and frame loop.
 *
 * Chapters (scroll 0→1): I Awakening (light bar) → II Finish (light sweep,
 * paint) → III Engineering (clay scan → x-ray + callouts → exploded) →
 * IV The Drive (tunnel), then hand-off to the normal homepage sections.
 */
import * as THREE from "three";

type V3 = THREE.Vector3;
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
const smooth = (t: number) => t * t * (3 - 2 * t);
const sstep = (a: number, b: number, x: number) => smooth(clamp01((x - a) / (b - a)));
/** Legacy (r128) light intensities → physical units (r155+). */
const LIGHT = Math.PI;

export type HeroWorldState = { cap: number; swatch: number; progress: number };

export type HeroWorldOptions = {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  /** Overlay <svg> for x-ray leader-line callouts. */
  calloutSvg: SVGSVGElement | null;
  calloutLabels: string[];
  finishes: readonly string[];
  clayHex: string;
  /** Background colour the scene fades into (fog). */
  backgroundHex: string;
  getProgress: () => number;
  onState: (state: HeroWorldState) => void;
};

export type HeroWorld = {
  setPaint: (index: number | null) => void;
  /** Swap in a real car (glTF scene). Returns a one-line diagnostic. */
  setModel: (root: THREE.Object3D, paintPattern: RegExp | null) => string;
  resize: (width: number, height: number, dpr: number) => void;
  frame: (dt: number) => void;
  dispose: () => void;
};

/* ───────────────────────── Shader patches: clay scan + x-ray ghost ───────────────────────── */

type FxUniforms = {
  uClayX: THREE.IUniform<number>;
  uScan: THREE.IUniform<number>;
  uGhost: THREE.IUniform<number>;
  uClayCol: THREE.IUniform<THREE.Color>;
  uScanCol: THREE.IUniform<THREE.Color>;
};

const FRAG_HEAD = /* glsl */ `
varying vec3 vWPos;
uniform float uClayX; uniform float uScan; uniform float uGhost;
uniform vec3 uClayCol; uniform vec3 uScanCol;
float clayMask(){ return smoothstep(uClayX - 0.035, uClayX + 0.035, vWPos.x); }`;

function makePatcher(fx: FxUniforms) {
  const patched = new Set<THREE.Material>();
  const onBeforeCompile = (sh: THREE.WebGLProgramParametersWithUniforms) => {
    (Object.keys(fx) as (keyof FxUniforms)[]).forEach((k) => {
      sh.uniforms[k] = fx[k];
    });
    sh.vertexShader = sh.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vWPos;")
      .replace(
        "#include <worldpos_vertex>",
        "#include <worldpos_vertex>\n vWPos = (modelMatrix * vec4(transformed, 1.0)).xyz;",
      );
    sh.fragmentShader = sh.fragmentShader
      .replace("#include <common>", `#include <common>\n${FRAG_HEAD}`)
      .replace(
        "#include <clipping_planes_fragment>",
        `#include <clipping_planes_fragment>
#ifdef GHOSTABLE
  if(uGhost > 0.001){ float gn = fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715)))); if(gn < uGhost) discard; }
#endif`,
      )
      .replace(
        "#include <color_fragment>",
        `#include <color_fragment>
#ifdef PAINTSWEEP
 diffuseColor.rgb = mix(diffuseColor.rgb, uClayCol, clayMask());
#endif`,
      )
      .replace(
        "#include <roughnessmap_fragment>",
        `#include <roughnessmap_fragment>
#ifdef PAINTSWEEP
 roughnessFactor = mix(roughnessFactor, 0.62, clayMask());
#endif`,
      )
      .replace(
        "#include <metalnessmap_fragment>",
        `#include <metalnessmap_fragment>
#ifdef PAINTSWEEP
 metalnessFactor = mix(metalnessFactor, 0.0, clayMask());
#endif`,
      )
      .replace(
        "#include <lights_physical_fragment>",
        `#include <lights_physical_fragment>
#if defined(PAINTSWEEP) && defined(USE_CLEARCOAT)
 material.clearcoat *= 1.0 - clayMask();
#endif`,
      )
      .replace(
        "#include <emissivemap_fragment>",
        `#include <emissivemap_fragment>
#ifndef CHASSIS
 totalEmissiveRadiance += uScanCol * exp(-pow((vWPos.x - uClayX)/0.028, 2.0)) * uScan * 2.2;
#endif`,
      );
  };
  return function patch<M extends THREE.Material>(mat: M, opts: { ghost?: boolean; chassis?: boolean; sweep?: boolean } = {}): M {
    const sm = mat as unknown as THREE.MeshStandardMaterial;
    if (patched.has(mat) || !sm.isMeshStandardMaterial) return mat;
    patched.add(mat);
    const defines: Record<string, unknown> = { ...(sm.defines ?? {}) };
    if (opts.ghost) defines.GHOSTABLE = "";
    if (opts.chassis) defines.CHASSIS = "";
    if (opts.sweep) defines.PAINTSWEEP = "";
    sm.defines = defines;
    mat.onBeforeCompile = onBeforeCompile;
    mat.customProgramCacheKey = () => `eureka-fx|${Object.keys(defines).sort().join(",")}`;
    mat.needsUpdate = true;
    return mat;
  };
}

/* ───────────────────────── Small helpers ───────────────────────── */

function radialTex(stops: [number, string][]) {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d")!;
  const grd = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  stops.forEach(([o, col]) => grd.addColorStop(o, col));
  g.fillStyle = grd;
  g.fillRect(0, 0, 256, 256);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** Monotone cubic interpolation through [x, y] knots. */
function mono(pts: [number, number][]) {
  const n = pts.length, xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]), d: number[] = [], m = new Array<number>(n);
  for (let i = 0; i < n - 1; i++) d.push((ys[i + 1] - ys[i]) / (xs[i + 1] - xs[i]));
  m[0] = d[0];
  m[n - 1] = d[n - 2];
  for (let i = 1; i < n - 1; i++) m[i] = d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2;
  for (let i = 0; i < n - 1; i++) {
    if (d[i] === 0) {
      m[i] = m[i + 1] = 0;
      continue;
    }
    const a = m[i] / d[i], b = m[i + 1] / d[i], s = a * a + b * b;
    if (s > 9) {
      const t = 3 / Math.sqrt(s);
      m[i] = t * a * d[i];
      m[i + 1] = t * b * d[i];
    }
  }
  return (x: number) => {
    if (x <= xs[0]) return ys[0];
    if (x >= xs[n - 1]) return ys[n - 1];
    let i = 0;
    while (x > xs[i + 1]) i++;
    const h = xs[i + 1] - xs[i], t = (x - xs[i]) / h, t2 = t * t, t3 = t2 * t;
    return (2 * t3 - 3 * t2 + 1) * ys[i] + (t3 - 2 * t2 + t) * h * m[i] + (-2 * t3 + 3 * t2) * ys[i + 1] + (t3 - t2) * h * m[i + 1];
  };
}

function rbox(w: number, h: number, d: number, r: number) {
  r = Math.min(r, w / 2 - 0.001, h / 2 - 0.001);
  const s = new THREE.Shape(), x0 = -w / 2, y0 = -h / 2;
  s.moveTo(x0 + r, y0);
  s.lineTo(x0 + w - r, y0);
  s.quadraticCurveTo(x0 + w, y0, x0 + w, y0 + r);
  s.lineTo(x0 + w, y0 + h - r);
  s.quadraticCurveTo(x0 + w, y0 + h, x0 + w - r, y0 + h);
  s.lineTo(x0 + r, y0 + h);
  s.quadraticCurveTo(x0, y0 + h, x0, y0 + h - r);
  s.lineTo(x0, y0 + r);
  s.quadraticCurveTo(x0, y0, x0 + r, y0);
  const bv = Math.min(r * 0.6, d * 0.3);
  const g = new THREE.ExtrudeGeometry(s, {
    depth: Math.max(0.001, d - 2 * bv),
    bevelEnabled: true,
    bevelThickness: bv,
    bevelSize: bv * 0.8,
    bevelSegments: 3,
    curveSegments: 6,
  });
  g.translate(0, 0, -Math.max(0.001, d - 2 * bv) / 2);
  g.computeVertexNormals();
  return g;
}

function tube(pts: V3[], r: number, mat: THREE.Material, closed = false) {
  return new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, closed), Math.max(16, pts.length * 3), r, 8, closed), mat);
}

function between(a: V3, b: V3, r: number, mat: THREE.Material) {
  const dir = b.clone().sub(a), len = dir.length();
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, 12), mat);
  m.position.copy(a).add(b).multiplyScalar(0.5);
  m.quaternion.setFromUnitVectors(V(0, 1, 0), dir.normalize());
  return m;
}

const shadowed = <T extends THREE.Mesh>(m: T) => {
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
};

/* ───────────────────────── Parts (each flies on its own path when exploded) ───────────────────────── */

type Part = { g: THREE.Group; c: V3; off: V3; rot: { x: number; y: number; z: number }; d: number; arc: number };

function animParts(list: Part[], e: number) {
  list.forEach((P) => {
    const p = smooth(clamp01((e - P.d) / 0.62));
    P.g.position.set(P.c.x + P.off.x * p, P.c.y + P.off.y * p + Math.sin(Math.PI * p) * P.arc, P.c.z + P.off.z * p);
    P.g.rotation.set(P.rot.x * p, P.rot.y * p, P.rot.z * p);
  });
}

/** Common interface for the procedural car and a loaded glTF car. */
type Rig = {
  root: THREE.Object3D;
  L: number;
  W: number;
  H: number;
  fx: number;
  rx: number;
  wheelY: number;
  wheelR: number;
  headGain: number;
  headPos: V3[];
  tailPos: V3;
  headMats: THREE.MeshStandardMaterial[];
  tailMats: THREE.MeshStandardMaterial[];
  shells: THREE.Mesh[];
  casters: THREE.Mesh[];
  paintMats: THREE.MeshStandardMaterial[];
  wake?: (w: number) => void;
  update: (e: number, theta: number) => void;
  dispose?: () => void;
};

/* ───────────────────────── Scroll choreography ───────────────────────── */

type Keyframe = {
  cam: V3;
  tgt: V3;
  head: number;
  paint: number;
  clay: number;
  ghost: number;
  explode: number;
  tunnel: number;
  grid: number;
  /** -1 intro overlay · 0..3 chapters · 4 hand-off. */
  cap: number;
  /** Arrive by orbiting around the car's vertical axis instead of a straight line. */
  orbit?: boolean;
};
const kf = (cam: V3, tgt: V3, o: Partial<Keyframe>): Keyframe => ({
  cam,
  tgt,
  head: 1,
  paint: 1,
  clay: 0,
  ghost: 0,
  explode: 0,
  tunnel: 0,
  grid: 0,
  cap: 0,
  ...o,
});

/** Condensed from the reference's 13 keyframes / 7 chapters to 4 chapters (brief §11). */
const K: Keyframe[] = [
  kf(V(7.8, 2.2, 6.4), V(0, 0.55, 0), { head: 0, paint: 0, cap: -1 }),
  kf(V(7.2, 0.85, 1.0), V(0, 0.6, 0), { paint: 0, cap: 0 }),
  kf(V(2.5, 0.7, 3.4), V(1.5, 0.55, 0), { paint: 0, cap: 1 }),
  kf(V(-1.9, 1.0, 3.8), V(-1.2, 0.6, 0), { cap: 1 }),
  kf(V(0.3, 0.95, 9.4), V(0, 0.62, 0), { cap: 1 }),
  kf(V(-0.4, 1.05, 9.0), V(0, 0.62, 0), { clay: 1, grid: 1, cap: 2 }),
  kf(V(4.2, 6.6, 5.2), V(0, 0.3, 0), { clay: 1, ghost: 1, grid: 0.6, cap: 2 }),
  kf(V(9.6, 3.6, 8.6), V(0, 1.0, 0), { clay: 1, explode: 1, grid: 1, cap: 2 }),
  kf(V(-7.6, 4.2, 9.6), V(0, 0.95, 0), { clay: 1, explode: 1, grid: 1, cap: 2 }),
  kf(V(6.4, 1.25, 5.4), V(0, 0.65, 0), { cap: 3 }),
  // Orbit round the side into the tunnel; the camera ends a little left of the lane
  // so the car clears the bottom-left caption.
  kf(V(-8.2, 1.8, -0.75), V(3, 0.85, -0.75), { tunnel: 1, cap: 3, orbit: true }),
  kf(V(-8.8, 1.6, 0), V(3, 0.85, 0), { tunnel: 1, cap: 4 }),
];
/** Keyframe index where each chapter starts (for the chapter index links). */
export const CHAPTER_KEYFRAMES = [1, 2, 5, 9];
export const KEYFRAME_COUNT = K.length;
/** Which segment carries the light sweep along the shoulder. */
const SWEEP_SEGMENT = 2;

const hold = (f: number) => smooth(clamp01((f - 0.12) / 0.76));
/** Interpolate radius, height and angle (shortest way round) about the y axis. */
function orbitLerp(a: V3, b: V3, f: number) {
  const ra = Math.hypot(a.x, a.z), rb = Math.hypot(b.x, b.z), ta = Math.atan2(a.z, a.x);
  let d = Math.atan2(b.z, b.x) - ta;
  if (d > Math.PI) d -= 2 * Math.PI;
  if (d < -Math.PI) d += 2 * Math.PI;
  const r = ra + (rb - ra) * f, t = ta + d * f;
  return V(Math.cos(t) * r, a.y + (b.y - a.y) * f, Math.sin(t) * r);
}
function sample(t: number) {
  const i = Math.min(K.length - 2, Math.floor(t)), f = hold(t - i), a = K[i], b = K[i + 1];
  const mix = (k: "head" | "paint" | "clay" | "ghost" | "explode" | "tunnel" | "grid") => a[k] + (b[k] - a[k]) * f;
  return {
    cam: b.orbit ? orbitLerp(a.cam, b.cam, f) : a.cam.clone().lerp(b.cam, f),
    tgt: a.tgt.clone().lerp(b.tgt, f),
    head: mix("head"),
    paint: mix("paint"),
    clay: mix("clay"),
    ghost: mix("ghost"),
    explode: mix("explode"),
    tunnel: mix("tunnel"),
    grid: mix("grid"),
    cap: t - i < 0.5 ? a.cap : b.cap,
    sweep: i === SWEEP_SEGMENT ? f : 0,
  };
}

/* ───────────────────────── World ───────────────────────── */

export function createHeroWorld(o: HeroWorldOptions): HeroWorld {
  const { renderer, scene, camera } = o;
  const disposables: { dispose: () => void }[] = [];
  const track = <T extends { dispose: () => void }>(x: T) => {
    disposables.push(x);
    return x;
  };

  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.02;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap; // PCFSoftShadowMap was removed in r18x
  renderer.shadowMap.autoUpdate = false;
  renderer.setClearColor(0x000000, 0);
  scene.background = null;
  scene.fog = new THREE.Fog(new THREE.Color(o.backgroundHex), 15, 38);
  camera.fov = 30;
  camera.near = 0.1;
  camera.far = 200;
  camera.position.set(12.5, 3.4, 10.5);
  camera.updateProjectionMatrix();

  const FX: FxUniforms = {
    uClayX: { value: 50 },
    uScan: { value: 0 },
    uGhost: { value: 0 },
    uClayCol: { value: new THREE.Color(o.clayHex) },
    uScanCol: { value: new THREE.Color(1.0, 0.78, 0.42) },
  };
  const patchMat = makePatcher(FX);
  const root = new THREE.Group();
  scene.add(root);

  /* Studio environment (PMREM from a lit box) */
  {
    const env = new THREE.Scene();
    const room = new THREE.Mesh(new THREE.BoxGeometry(30, 14, 30), new THREE.MeshBasicMaterial({ color: new THREE.Color(0.52, 0.51, 0.5), side: THREE.BackSide }));
    room.position.y = 6;
    env.add(room);
    const fl = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.MeshBasicMaterial({ color: new THREE.Color(0.78, 0.77, 0.75) }));
    fl.rotation.x = -Math.PI / 2;
    fl.position.y = -0.9;
    env.add(fl);
    const bright = (c: number) => new THREE.MeshBasicMaterial({ color: new THREE.Color(c, c * 0.985, c * 0.96), side: THREE.DoubleSide });
    [-4, -1.3, 1.3, 4].forEach((z) => {
      const s = new THREE.Mesh(new THREE.PlaneGeometry(20, 1.1), bright(8));
      s.rotation.x = Math.PI / 2;
      s.position.set(0, 12.5, z);
      env.add(s);
    });
    const l = new THREE.Mesh(new THREE.PlaneGeometry(12, 2.4), bright(3.6));
    l.position.set(0, 3.6, -14.5);
    env.add(l);
    const r = new THREE.Mesh(new THREE.PlaneGeometry(12, 2.4), bright(3.6));
    r.position.set(0, 3.6, 14.5);
    r.rotation.y = Math.PI;
    env.add(r);
    const f = new THREE.Mesh(new THREE.PlaneGeometry(6, 5), bright(2.4));
    f.position.set(14.5, 4, 0);
    f.rotation.y = -Math.PI / 2;
    env.add(f);
    const b = new THREE.Mesh(new THREE.PlaneGeometry(6, 5), bright(2.0));
    b.position.set(-14.5, 4, 0);
    b.rotation.y = Math.PI / 2;
    env.add(b);
    const dark = new THREE.MeshBasicMaterial({ color: 0x0c0c0c, side: THREE.DoubleSide });
    [-14.8, 14.8].forEach((z) => {
      const d = new THREE.Mesh(new THREE.PlaneGeometry(30, 2.6), dark);
      d.position.set(0, 1.0, z);
      env.add(d);
    });
    const pm = new THREE.PMREMGenerator(renderer);
    const rt = pm.fromScene(env, 0.025);
    scene.environment = rt.texture;
    track(rt);
    pm.dispose();
    env.traverse((x) => {
      if ((x as THREE.Mesh).isMesh) {
        (x as THREE.Mesh).geometry.dispose();
        ((x as THREE.Mesh).material as THREE.Material).dispose();
      }
    });
  }

  /* Lights */
  root.add(new THREE.HemisphereLight(0xffffff, 0xe9e3d8, 0.5 * LIGHT));
  const key = new THREE.DirectionalLight(0xffffff, 1.35 * LIGHT);
  key.position.set(2.5, 10, 4);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -7, right: 7, top: 7, bottom: -7 });
  key.shadow.radius = 7;
  key.shadow.bias = -0.0004;
  root.add(key);
  const rim = new THREE.DirectionalLight(0xfff1dc, 0.55 * LIGHT);
  rim.position.set(-6, 4, -5);
  root.add(rim);
  const sweepLight = new THREE.PointLight(0xfff6ea, 0, 6.5, 2);
  root.add(sweepLight);

  /* Mirror-gloss floor (second render pass from a mirrored camera) */
  const reflRT = track(new THREE.WebGLRenderTarget(2, 2, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, type: THREE.HalfFloatType }));
  const mirrorCam = new THREE.PerspectiveCamera();
  const texMat = new THREE.Matrix4();
  const mirrorMat = track(
    new THREE.ShaderMaterial({
      uniforms: { tRefl: { value: reflRT.texture }, textureMatrix: { value: texMat }, strength: { value: 0.34 }, texel: { value: new THREE.Vector2(0.002, 0.002) } },
      vertexShader: /* glsl */ `uniform mat4 textureMatrix; varying vec4 vUv; varying vec3 vW;
      void main(){ vec4 w = modelMatrix * vec4(position,1.0); vW = w.xyz; vUv = textureMatrix * w; gl_Position = projectionMatrix * viewMatrix * w; }`,
      fragmentShader: /* glsl */ `uniform sampler2D tRefl; uniform float strength; uniform vec2 texel; varying vec4 vUv; varying vec3 vW;
      void main(){
        vec2 uv = vUv.xy / vUv.w; vec4 acc = vec4(0.0); float tw = 0.0;
        for(int i=-2;i<=2;i++){ for(int j=-2;j<=2;j++){
          float wgt = 1.0/(1.0+float(i*i+j*j));
          vec4 s = texture2D(tRefl, uv + vec2(float(i),float(j))*texel*1.7);
          acc += vec4(s.rgb*s.a, s.a)*wgt; tw += wgt; } }
        acc /= tw;
        vec3 col = acc.a > 0.001 ? acc.rgb/acc.a : vec3(1.0);
        float fade = 1.0 - smoothstep(2.2, 8.0, length(vW.xz));
        gl_FragColor = vec4(col, acc.a * strength * fade);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
      transparent: true,
      depthWrite: false,
    }),
  );
  const mirrorFloor = new THREE.Mesh(track(new THREE.PlaneGeometry(90, 90)), mirrorMat);
  mirrorFloor.rotation.x = -Math.PI / 2;
  mirrorFloor.renderOrder = -2;
  root.add(mirrorFloor);
  const floor = new THREE.Mesh(track(new THREE.PlaneGeometry(200, 200)), track(new THREE.ShadowMaterial({ opacity: 0.15 })));
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = 0.001;
  floor.receiveShadow = true;
  floor.renderOrder = -1;
  root.add(floor);
  const blob = new THREE.Mesh(
    track(new THREE.PlaneGeometry(6.4, 3.0)),
    track(
      new THREE.MeshBasicMaterial({
        map: track(radialTex([[0, "rgba(0,0,0,0.6)"], [0.42, "rgba(0,0,0,0.26)"], [1, "rgba(0,0,0,0)"]])),
        transparent: true,
        depthWrite: false,
      }),
    ),
  );
  blob.rotation.x = -Math.PI / 2;
  blob.position.y = 0.003;
  root.add(blob);

  /* Wireframe studio cyclorama (engineering chapter, ref. image 4) */
  const gridG = new THREE.Group();
  root.add(gridG);
  const domeLines = new THREE.LineSegments(
    track(new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(21, 3))),
    track(new THREE.LineBasicMaterial({ color: 0x161a16, transparent: true, opacity: 0, depthWrite: false })),
  );
  domeLines.position.y = 2.5;
  gridG.add(domeLines);
  const floorGrid = new THREE.GridHelper(44, 44, 0x161a16, 0x161a16);
  const gridMat = floorGrid.material as THREE.LineBasicMaterial;
  gridMat.transparent = true;
  gridMat.opacity = 0;
  gridMat.depthWrite = false;
  floorGrid.position.y = 0.004;
  gridG.add(floorGrid);

  /* X-ray ghost material (fresnel teal) */
  const ghostMat = track(
    new THREE.ShaderMaterial({
      uniforms: { uGhost: FX.uGhost, uCol: { value: new THREE.Color("#1d6a72") } },
      vertexShader: /* glsl */ `varying vec3 vN; varying vec3 vV;
      void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`,
      fragmentShader: /* glsl */ `uniform float uGhost; uniform vec3 uCol; varying vec3 vN; varying vec3 vV;
      void main(){ float f = 1.0 - abs(dot(normalize(vN), normalize(vV))); float a = (pow(f, 2.4)*0.85 + 0.03) * uGhost; gl_FragColor = vec4(uCol, a);
        #include <colorspace_fragment>
      }`,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
    }),
  );

  /* Materials */
  const FIN = o.finishes.map((h) => new THREE.Color(h));
  const G = { ghost: true, sweep: true };
  const CH = { chassis: true };
  const std = (p: THREE.MeshStandardMaterialParameters, opts: Parameters<typeof patchMat>[1]) => patchMat(track(new THREE.MeshStandardMaterial(p)), opts);
  const paint = patchMat(
    track(new THREE.MeshPhysicalMaterial({ color: FIN[0].clone(), metalness: 0.55, roughness: 0.2, clearcoat: 1, clearcoatRoughness: 0.03, envMapIntensity: 1.4, side: THREE.DoubleSide })),
    G,
  );
  const chrome = std({ color: 0xeeeeee, metalness: 1, roughness: 0.12, envMapIntensity: 1.5 }, G);
  const satin = std({ color: 0xcfd1d4, metalness: 1, roughness: 0.22, envMapIntensity: 1.4 }, G);
  const trim = std({ color: 0x121315, metalness: 0.4, roughness: 0.45, side: THREE.DoubleSide }, G);
  const shutMat = std({ color: 0x0a0a0b, metalness: 0.2, roughness: 0.6 }, G);
  const gloss = std({ color: 0x08080a, metalness: 0.35, roughness: 0.12, side: THREE.DoubleSide }, G);
  const lens = std({ color: 0x0b0d12, metalness: 0.9, roughness: 0.05, side: THREE.DoubleSide }, { ghost: true });
  const rubber = std({ color: 0x0e0e0f, roughness: 0.86, metalness: 0, side: THREE.DoubleSide }, G);
  const goldBody = std({ color: 0xb8925a, metalness: 0.95, roughness: 0.24, envMapIntensity: 1.5 }, G);
  const enamel = std({ color: 0x0b0b0d, metalness: 0.5, roughness: 0.15 }, G);
  const headMat = std({ color: 0x1b1d22, emissive: 0xf2f7ff, emissiveIntensity: 0 }, { ghost: true });
  const tailMat = std({ color: 0x2a0306, emissive: 0xff1530, emissiveIntensity: 0.6 }, { ghost: true });
  const wsGlass = patchMat(
    track(new THREE.MeshPhysicalMaterial({ color: 0x0a0f14, metalness: 0, roughness: 0.04, transparent: true, opacity: 0.3, envMapIntensity: 1.7, clearcoat: 1, side: THREE.DoubleSide, depthWrite: false })),
    { ghost: true },
  );
  // Chassis + interior: full colour in the x-ray view.
  const discMat = std({ color: 0x6e7279, metalness: 0.9, roughness: 0.38 }, CH);
  const caliperMat = std({ color: 0xb8925a, metalness: 0.85, roughness: 0.26, envMapIntensity: 1.4 }, CH);
  const springMat = std({ color: new THREE.Color("#8f1b2c"), metalness: 0.35, roughness: 0.32 }, CH);
  const damperMat = std({ color: 0xd5d7da, metalness: 1, roughness: 0.2 }, CH);
  const armMat = std({ color: 0x2c2f34, metalness: 0.75, roughness: 0.35 }, CH);
  const motorMat = std({ color: 0x9aa0a8, metalness: 0.92, roughness: 0.26 }, CH);
  const plateMat = std({ color: 0x2a2c31, metalness: 0.7, roughness: 0.35 }, CH);
  const batteryMat = std({ color: 0x0d2a33, emissive: 0x22d3ee, emissiveIntensity: 0, metalness: 0.3, roughness: 0.4 }, CH);
  const cableMat = std({ color: new THREE.Color("#e07a1f"), metalness: 0.1, roughness: 0.5 }, CH);
  const goldCh = std({ color: 0xb8925a, metalness: 0.95, roughness: 0.24 }, CH);
  const leather = std({ color: new THREE.Color("#6a3a22"), metalness: 0, roughness: 0.55 }, { sweep: true });
  const dashMat = std({ color: 0x17181a, metalness: 0.2, roughness: 0.5 }, { sweep: true });
  const screenMat = std({ color: 0x05070a, emissive: 0x9fb6c9, emissiveIntensity: 0.35, metalness: 0.5, roughness: 0.1 }, {});

  /* Car container + shared lighting effects */
  const car = new THREE.Group();
  root.add(car);
  const fxG = new THREE.Group();
  car.add(fxG);
  const chassisG = new THREE.Group();
  car.add(chassisG);
  const glowTex = track(radialTex([[0, "rgba(255,255,255,1)"], [0.18, "rgba(225,238,255,0.8)"], [0.5, "rgba(175,205,255,0.2)"], [1, "rgba(160,190,255,0)"]]));
  const glows = [0, 1].map(() => {
    const sp = new THREE.Sprite(track(new THREE.SpriteMaterial({ map: glowTex, transparent: true, depthWrite: false, opacity: 0 })));
    fxG.add(sp);
    return sp;
  });
  const headSpots = [0, 1].map(() => {
    const sl = new THREE.SpotLight(0xe4eeff, 0, 14, 0.42, 0.7, 1.6);
    fxG.add(sl);
    fxG.add(sl.target);
    return sl;
  });
  const tailGlow = new THREE.Sprite(
    track(
      new THREE.SpriteMaterial({
        map: track(radialTex([[0, "rgba(255,40,60,0.9)"], [0.4, "rgba(255,30,50,0.25)"], [1, "rgba(255,30,50,0)"]])),
        transparent: true,
        depthWrite: false,
        opacity: 0.3,
      }),
    ),
  );
  fxG.add(tailGlow);

  /* ── Procedural concept car (fallback until the real model loads) ── */
  const LH = 2.35, W2 = 0.99, PEXP = 5, FXP = 1.38, RXP = -1.32, WR = 0.364, AR = 0.43, TRACK = 0.85;
  const gauss = (x: number, c: number, w: number) => Math.exp(-Math.pow((x - c) / w, 2));
  const plan = (x: number) => {
    const u = Math.min(1, Math.abs(x) / LH);
    const base = W2 * Math.pow(Math.max(0, 1 - Math.pow(u, PEXP)), 1 / PEXP) * (1 - 0.03 * Math.max(0, x / LH));
    const shape = (0.03 * gauss(x, FXP, 0.45) + 0.055 * gauss(x, RXP, 0.55) - 0.035 * gauss(x, -0.62, 0.32)) * (1 - Math.pow(u, 8));
    return base + shape;
  };
  const ybelt = mono([[-2.35, 0.8], [-2.2, 0.9], [-1.6, 0.94], [-0.7, 0.92], [0.0, 0.87], [0.7, 0.86], [1.38, 0.875], [1.9, 0.74], [2.35, 0.58]]);
  const ybot = (x: number) => {
    let y = 0.25 + 0.05 * sstep(1.85, 2.35, x) + 0.08 * sstep(-1.85, -2.35, x);
    [FXP, RXP].forEach((wx) => {
      const dx = x - wx;
      if (Math.abs(dx) < AR) y = Math.max(y, WR + Math.sqrt(AR * AR - dx * dx));
    });
    return y;
  };
  const crownAt = (x: number) => (0.035 - 0.08 * sstep(0.85, 1.25, x)) * (1 - Math.pow(Math.min(1, Math.abs(x) / LH), 6));
  const SIDE_F = [0.94, 0.965, 0.985, 0.998, 1.0, 0.995, 0.975, 0.945, 0.9];
  const sideYs = (yb: number, yt: number) => {
    const span = yt - yb, A = [yb + 0.012, yb + 0.03, 0.45, 0.545, 0.64, 0.8, yt - 0.04, yt - 0.018, yt - 0.004];
    const f = A.map((a) => (a - yb) / span), d = 0.02;
    f[0] = Math.max(f[0], 0.01);
    for (let k = 1; k < f.length; k++) f[k] = Math.max(f[k], f[k - 1] + d);
    f[f.length - 1] = Math.min(f[f.length - 1], 0.996);
    for (let k = f.length - 2; k >= 0; k--) f[k] = Math.min(f[k], f[k + 1] - d);
    return f.map((t) => yb + t * span);
  };
  const bodyHalf = (x: number): [number, number][] => {
    const hw = plan(x), yb = ybot(x), yt = ybelt(x), cr = crownAt(x), ys = sideYs(yb, yt);
    const P: [number, number][] = [[0, yb], [0.88 * hw, yb]];
    ys.forEach((y, k) => P.push([SIDE_F[k] * hw, y]));
    P.push([0.8 * hw, yt + 0.2 * cr], [0.62 * hw, yt + 0.55 * cr], [0.42 * hw, yt + 0.8 * cr], [0.2 * hw, yt + 0.95 * cr], [0, yt + cr]);
    return P;
  };
  const sectionZ = (x: number, y: number) => {
    const P = bodyHalf(x);
    for (let k = 1; k < 11; k++) {
      const a = P[k], b = P[k + 1];
      if (y <= b[1]) {
        const t = b[1] > a[1] ? clamp01((y - a[1]) / (b[1] - a[1])) : 0;
        return a[0] + (b[0] - a[0]) * t;
      }
    }
    return P[11][0];
  };
  const deformX = (x: number, y: number) => x - sstep(1.75, LH, x) * (y - 0.5) * 0.24 + sstep(-1.75, -LH, x) * (y - 0.55) * 0.2;
  const frontX = (z: number, y: number) => {
    z = Math.abs(z);
    let a = 1.65, b = LH;
    for (let i = 0; i < 34; i++) {
      const m = (a + b) / 2;
      if (sectionZ(m, y) > z) a = m;
      else b = m;
    }
    return deformX((a + b) / 2, y);
  };
  const rearX = (z: number, y: number) => {
    z = Math.abs(z);
    let a = -LH, b = -1.65;
    for (let i = 0; i < 34; i++) {
      const m = (a + b) / 2;
      if (sectionZ(m, y) > z) b = m;
      else a = m;
    }
    return deformX((a + b) / 2, y);
  };

  const RING_N = 30;
  const halfIdx = (j: number) => (j <= 15 ? j : RING_N - j);
  const ringOf = (h: [number, number][]) => {
    const ring = h.slice();
    for (let k = h.length - 2; k >= 1; k--) ring.push([-h[k][0], h[k][1]]);
    return ring;
  };
  const loft = (stations: number[], halfFn: (x: number) => [number, number][], keep?: (x: number, k: number, s: number) => boolean) => {
    const rings = stations.map((x) => ringOf(halfFn(x)));
    const R = rings[0].length, pos: number[] = [], raw: number[] = [];
    stations.forEach((x, i) => rings[i].forEach(([z, y]) => pos.push(deformX(x, y), y, z)));
    for (let i = 0; i < stations.length - 1; i++) {
      const xm = (stations[i] + stations[i + 1]) / 2;
      for (let j = 0; j < R; j++) {
        const j2 = (j + 1) % R;
        if (keep && !keep(xm, Math.min(halfIdx(j), halfIdx(j2)), j < 15 ? 1 : -1)) continue;
        const a = i * R + j, b = (i + 1) * R + j, c = i * R + j2, d = (i + 1) * R + j2;
        raw.push(a, b, c, b, d, c);
      }
    }
    const map = new Map<number, number>(), np: number[] = [];
    const idx = raw.map((v) => {
      let n = map.get(v);
      if (n === undefined) {
        n = np.length / 3;
        map.set(v, n);
        np.push(pos[v * 3], pos[v * 3 + 1], pos[v * 3 + 2]);
      }
      return n;
    });
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(np, 3));
    g.setIndex(idx);
    g.computeVertexNormals();
    return g;
  };
  const conformPlane = (w: number, y0: number, y1: number, zc: number, front: boolean, d: number, mat: THREE.Material, segs = 32) => {
    const g = new THREE.PlaneGeometry(w, y1 - y0, segs, 3), p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const z = p.getX(i) + zc, y = p.getY(i) + (y0 + y1) / 2;
      p.setXYZ(i, front ? frontX(z, y) + d : rearX(z, y) - d, y, z);
    }
    g.computeVertexNormals();
    return new THREE.Mesh(g, mat);
  };

  const procRoot = new THREE.Group();
  car.add(procRoot);
  const procParts: Part[] = [], procShells: THREE.Mesh[] = [], procCasters: THREE.Mesh[] = [];
  const makePart = (parent: THREE.Object3D, list: Part[], c: V3, opt: Partial<Omit<Part, "g" | "c">> = {}): Part => {
    const g = new THREE.Group();
    g.position.copy(c);
    parent.add(g);
    const P: Part = { g, c: c.clone(), off: V(0, 0, 0), rot: { x: 0, y: 0, z: 0 }, d: 0, arc: 0, ...opt };
    list.push(P);
    return P;
  };
  const shell = (geo: THREE.BufferGeometry, mat: THREE.Material, P: Part, ghostShell = true) => {
    geo.translate(-P.c.x, -P.c.y, -P.c.z);
    const m = shadowed(new THREE.Mesh(geo, mat));
    P.g.add(m);
    procCasters.push(m);
    if (ghostShell) {
      const gs = new THREE.Mesh(geo, ghostMat);
      gs.renderOrder = 6;
      gs.visible = false;
      m.add(gs);
      procShells.push(gs);
    }
    return m;
  };
  const put = <T extends THREE.Object3D>(P: Part, obj: T) => {
    obj.position.sub(P.c);
    P.g.add(obj);
    return obj;
  };
  const centerOf = (geo: THREE.BufferGeometry) => {
    geo.computeBoundingBox();
    return geo.boundingBox!.getCenter(new THREE.Vector3());
  };

  // Body panels
  const B = { frontB: 1.95, hood0: 0.95, cab1: 0.62, door1: 0.9, door0: -0.38, cab0: -0.62, rearB: -2.0 };
  const st: number[] = [];
  const NS = 220;
  for (let i = 0; i <= NS; i++) st.push(LH * Math.sin((Math.PI / 2) * (-1 + (2 * i) / NS)));
  [FXP, RXP].forEach((wx) => {
    for (let k = -14; k <= 14; k++) st.push(wx + (k / 14) * AR * 0.999);
    st.push(wx - AR - 0.002, wx + AR + 0.002);
  });
  Object.values(B).forEach((x) => st.push(x));
  st.sort((a, b) => a - b);
  const stations = st.filter((x, i) => i === 0 || x - st[i - 1] > 0.0015);
  const inR = (x: number, a: number, b: number) => x > a && x < b;
  const isDoor = (x: number, k: number) => inR(x, B.door0, B.door1) && k >= 3 && k <= 9;
  const isHood = (x: number, k: number) => inR(x, B.hood0, B.frontB) && k >= 10 && k <= 14;
  const isCabTop = (x: number, k: number) => inR(x, B.cab0, B.cab1) && k >= 11 && k <= 14;
  const coreKeep = (x: number, k: number) => x < B.frontB && x > B.rearB && !isDoor(x, k) && !isHood(x, k) && !isCabTop(x, k);
  const bodyPart = (keep: (x: number, k: number, s: number) => boolean, opt: Partial<Omit<Part, "g" | "c">>) => {
    const geo = loft(stations, bodyHalf, keep), P = makePart(procRoot, procParts, centerOf(geo), opt);
    shell(geo, paint, P);
    return P;
  };
  const CORE = bodyPart(coreKeep, { off: V(0, 0.45, 0) });
  bodyPart(isHood, { off: V(0.5, 1.35, 0), rot: { x: 0, y: 0, z: 0.5 }, d: 0.1, arc: 0.25 });
  const DOORL = bodyPart((x, k, s) => isDoor(x, k) && s > 0, { off: V(0.25, 0.85, 1.45), rot: { x: 0.35, y: -0.45, z: 0.08 }, d: 0.16, arc: 0.2 });
  const DOORR = bodyPart((x, k, s) => isDoor(x, k) && s < 0, { off: V(0.25, 0.85, -1.45), rot: { x: -0.35, y: 0.45, z: 0.08 }, d: 0.16, arc: 0.2 });
  const FRONT = bodyPart((x) => x > B.frontB, { off: V(1.05, 0.3, 0), rot: { x: 0, y: 0, z: -0.15 }, d: 0.06, arc: 0.15 });
  const REAR = bodyPart((x) => x < B.rearB, { off: V(-1.05, 0.3, 0), rot: { x: 0, y: 0, z: 0.15 }, d: 0.08, arc: 0.15 });

  // Raked windscreen with dark frame
  const wsPt = (u: number, v: number) => {
    const zb = u * 0.7, zt = u * 0.6, xb = 0.74 - 0.1 * u * u, xt = 0.1 - 0.07 * u * u;
    const yb = ybelt(xb) + 0.006, yt = 1.165 - 0.04 * u * u, bow = Math.sin(Math.PI * v) * 0.025;
    return V(xb + (xt - xb) * v + bow, yb + (yt - yb) * v + bow * 0.6, zb + (zt - zb) * v);
  };
  const wsGeo = (() => {
    const nu = 24, nv = 10, pos: number[] = [], idx: number[] = [];
    for (let j = 0; j <= nv; j++) for (let i = 0; i <= nu; i++) {
      const p = wsPt((i / nu) * 2 - 1, j / nv);
      pos.push(p.x, p.y, p.z);
    }
    for (let j = 0; j < nv; j++) for (let i = 0; i < nu; i++) {
      const a = j * (nu + 1) + i, b = a + 1, c = a + nu + 1, d = c + 1;
      idx.push(a, c, b, b, c, d);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setIndex(idx);
    g.computeVertexNormals();
    return g;
  })();
  const WSCREEN = makePart(procRoot, procParts, centerOf(wsGeo), { off: V(0.35, 1.55, 0), rot: { x: 0, y: 0, z: -0.35 }, d: 0.2, arc: 0.2 });
  shell(wsGeo, wsGlass, WSCREEN).castShadow = false;
  {
    const frame: V3[] = [];
    for (let i = 0; i <= 12; i++) frame.push(wsPt(-1, 1 - i / 12));
    for (let i = 1; i <= 24; i++) frame.push(wsPt(-1 + (2 * i) / 24, 0));
    for (let i = 1; i <= 12; i++) frame.push(wsPt(1, i / 12));
    for (let i = 23; i >= 1; i--) frame.push(wsPt(-1 + (2 * i) / 24, 1));
    put(WSCREEN, tube(frame, 0.016, gloss, true));
  }

  // Twin humps behind the seats
  const humpGeo = (zc: number) => {
    const n = 64, m = 18, pos: number[] = [], idx: number[] = [], x0 = -0.64, x1 = -1.95, f0 = 0.1;
    for (let i = 0; i <= n; i++) {
      const u = i / n, x = x0 + (x1 - x0) * u;
      const env = u < f0 ? Math.sqrt(Math.max(0, 1 - Math.pow(1 - u / f0, 2))) : 1 - Math.pow((u - f0) / (1 - f0), 1.7);
      const wenv = u < f0 ? env : 0.3 + 0.7 * (1 - Math.pow((u - f0) / (1 - f0), 1.3));
      const h = 0.26 * env, w = 0.21 * wenv, yb = ybelt(x) + 0.82 * crownAt(x) - 0.012;
      for (let j = 0; j <= m; j++) {
        const a = (Math.PI * j) / m, y = yb + h * Math.sin(a);
        pos.push(deformX(x, y), y, zc + w * Math.cos(a));
      }
    }
    for (let i = 0; i < n; i++) for (let j = 0; j < m; j++) {
      const a = i * (m + 1) + j, b = a + m + 1, c = a + 1, d = b + 1;
      idx.push(a, b, c, b, d, c);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setIndex(idx);
    g.computeVertexNormals();
    return g;
  };
  const HUMPS = makePart(procRoot, procParts, V(-1.1, 0.98, 0), { off: V(-0.35, 1.3, 0), rot: { x: 0, y: 0, z: 0.15 }, d: 0.22, arc: 0.2 });
  [0.37, -0.37].forEach((zc) => shell(humpGeo(zc), paint, HUMPS));

  // Side intakes
  const sidePatch = (x0: number, x1: number, y0: number, y1: number, slant: number, s: number, d: number, mat: THREE.Material) => {
    const nu = 16, nv = 6, pos: number[] = [], idx: number[] = [];
    for (let j = 0; j <= nv; j++) {
      const v = j / nv, y = y0 + (y1 - y0) * v;
      for (let i = 0; i <= nu; i++) {
        const x = x0 + ((x1 - x0) * i) / nu + slant * v;
        pos.push(x, y, s * (sectionZ(x, y) + d));
      }
    }
    for (let j = 0; j < nv; j++) for (let i = 0; i < nu; i++) {
      const a = j * (nu + 1) + i, b = a + 1, c = a + nu + 1, dd = c + 1;
      idx.push(a, b, c, b, dd, c);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setIndex(idx);
    g.computeVertexNormals();
    return new THREE.Mesh(g, mat);
  };
  [-1, 1].forEach((s) => {
    put(CORE, sidePatch(-0.88, -0.5, 0.44, 0.7, 0.1, s, 0.003, gloss));
    const blade: V3[] = [];
    for (let i = 0; i <= 12; i++) {
      const x = -0.86 + (0.36 * i) / 12 + 0.05, y = 0.57;
      blade.push(V(x, y, s * (sectionZ(x, y) + 0.01)));
    }
    put(CORE, tube(blade, 0.008, satin));
  });

  // Panel shut lines
  const ringPt = (x: number, k: number, s: number) => {
    const P = bodyHalf(x)[k], y = P[1] + (k >= 10 ? 0.002 : 0);
    return V(deformX(x, y), y, s * (P[0] + 0.0025));
  };
  const xsBetween = (a: number, b: number, n: number) => Array.from({ length: n + 1 }, (_, i) => a + ((b - a) * i) / n);
  [-1, 1].forEach((s) => {
    const loop: V3[] = [];
    xsBetween(B.door0, B.door1, 14).forEach((x) => loop.push(ringPt(x, 3, s)));
    for (let k = 4; k <= 10; k++) loop.push(ringPt(B.door1, k, s));
    xsBetween(B.door1, B.door0, 14).slice(1).forEach((x) => loop.push(ringPt(x, 10, s)));
    for (let k = 9; k >= 4; k--) loop.push(ringPt(B.door0, k, s));
    put(CORE, tube(loop, 0.0022, shutMat, true));
  });
  {
    const loop: V3[] = [];
    xsBetween(B.hood0, B.frontB, 12).forEach((x) => loop.push(ringPt(x, 10, 1)));
    for (let k = 11; k <= 15; k++) loop.push(ringPt(B.frontB, k, 1));
    for (let k = 14; k >= 10; k--) loop.push(ringPt(B.frontB, k, -1));
    xsBetween(B.frontB, B.hood0, 12).slice(1).forEach((x) => loop.push(ringPt(x, 10, -1)));
    for (let k = 11; k <= 15; k++) loop.push(ringPt(B.hood0, k, -1));
    for (let k = 14; k >= 11; k--) loop.push(ringPt(B.hood0, k, 1));
    put(CORE, tube(loop, 0.0022, shutMat, true));
    [B.frontB, B.rearB].forEach((x) => {
      const ring: V3[] = [];
      for (let k = 1; k <= 15; k++) ring.push(ringPt(x, k, 1));
      for (let k = 14; k >= 1; k--) ring.push(ringPt(x, k, -1));
      put(CORE, tube(ring, 0.0022, shutMat, true));
    });
  }

  // Front fascia: welcome light bar, lamps, intake, emblem
  const BAR_SEG = 48, BAR_RAD = 8, BAR_Y = 0.545;
  const barHalves = [1, -1].map((s) => {
    const pts: V3[] = [];
    for (let k = 0; k <= 24; k++) {
      const z = (s * 0.66 * k) / 24;
      pts.push(V(frontX(z, BAR_Y) + 0.008, BAR_Y, z));
    }
    const g = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), BAR_SEG, 0.0105, BAR_RAD, false);
    g.setDrawRange(0, 0);
    return put(FRONT, new THREE.Mesh(g, headMat));
  });
  [-1, 1].forEach((s) => {
    put(FRONT, conformPlane(0.22, 0.485, 0.522, s * 0.55, true, 0.004, lens, 16));
    const pts: V3[] = [];
    for (let k = 0; k <= 10; k++) {
      const z = s * (0.45 + (0.19 * k) / 10);
      pts.push(V(frontX(z, 0.503) + 0.009, 0.503, z));
    }
    put(FRONT, tube(pts, 0.0055, headMat));
  });
  put(FRONT, conformPlane(1.3, 0.315, 0.43, 0, true, 0.003, gloss, 48));
  {
    const pts: V3[] = [], rr = 0.03, zw = 0.65, y0 = 0.313, y1 = 0.432;
    const corner = (cz: number, cy: number, a0: number) => {
      for (let k = 0; k <= 5; k++) {
        const a = a0 + (k / 5) * (Math.PI / 2);
        const z = cz + Math.cos(a) * rr, y = cy + Math.sin(a) * rr;
        pts.push(V(frontX(z, y) + 0.012, y, z));
      }
    };
    corner(zw - rr, y1 - rr, 0);
    corner(-zw + rr, y1 - rr, Math.PI / 2);
    corner(-zw + rr, y0 + rr, Math.PI);
    corner(zw - rr, y0 + rr, Math.PI * 1.5);
    put(FRONT, tube(pts, 0.007, chrome, true));
    for (let k = 0; k < 31; k++) {
      const z = -0.6 + (1.2 * k) / 30;
      const sl = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.095, 0.007), satin);
      sl.position.set(frontX(z, 0.372) + 0.009, 0.372, z);
      sl.rotation.z = 0.235;
      put(FRONT, sl);
    }
    const em = new THREE.Group();
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.058, 0.058, 0.012, 48), enamel);
    disc.rotation.z = -Math.PI / 2;
    em.add(disc);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.058, 0.006, 12, 64), goldBody);
    ring.rotation.y = Math.PI / 2;
    em.add(ring);
    const add = (h: number, w: number, y: number, z: number) => {
      const b = new THREE.Mesh(new THREE.BoxGeometry(0.008, h, w), goldBody);
      b.position.set(0.008, y, z);
      em.add(b);
    };
    add(0.068, 0.011, 0, 0.016);
    add(0.01, 0.04, 0.029, -0.0025);
    add(0.01, 0.03, 0, 0.0025);
    add(0.01, 0.04, -0.029, -0.0025);
    em.scale.setScalar(0.72);
    em.position.set(frontX(0, 0.478) + 0.006, 0.478, 0);
    em.rotation.z = 0.235;
    put(FRONT, em);
  }

  // Rear: tail bar, lettering, vents, diffuser
  {
    const pts: V3[] = [];
    for (let k = 0; k <= 36; k++) {
      const z = -0.74 + (1.48 * k) / 36;
      pts.push(V(rearX(z, 0.745) - 0.008, 0.745, z));
    }
    put(REAR, tube(pts, 0.012, tailMat));
    put(REAR, conformPlane(1.3, 0.4, 0.565, 0, false, 0.003, gloss, 48));
    [0.425, 0.455, 0.485, 0.515, 0.545].forEach((y) => {
      const sl: V3[] = [];
      for (let k = 0; k <= 20; k++) {
        const z = -0.62 + (1.24 * k) / 20;
        sl.push(V(rearX(z, y) - 0.012, y, z));
      }
      put(REAR, tube(sl, 0.0055, satin));
    });
    put(REAR, conformPlane(1.3, 0.335, 0.39, 0, false, 0.003, gloss, 48));
    for (let k = 0; k < 7; k++) {
      const z = -0.54 + (1.08 * k) / 6;
      const fin = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.055, 0.006), gloss);
      fin.position.set(rearX(z, 0.36) - 0.05, 0.36, z);
      put(REAR, fin);
    }
    const c = document.createElement("canvas");
    c.width = 1024;
    c.height = 96;
    const tex = track(new THREE.CanvasTexture(c));
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    const draw = () => {
      const g = c.getContext("2d")!;
      g.clearRect(0, 0, 1024, 96);
      g.fillStyle = "#d2b37c";
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.font = `500 56px ${getComputedStyle(document.body).fontFamily}`;
      const L = "EUREKA".split("");
      L.forEach((ch, i) => g.fillText(ch, 512 + (i - (L.length - 1) / 2) * 118, 52));
      tex.needsUpdate = true;
    };
    draw();
    void document.fonts?.ready.then(draw);
    const letterMat = std({ map: tex, transparent: true, metalness: 0.7, roughness: 0.3, side: THREE.DoubleSide }, { ghost: true });
    put(REAR, conformPlane(0.8, 0.62, 0.68, 0, false, 0.004, letterMat, 24));
  }

  // Sill chrome, handles, wheel liners, cockpit floor
  [-1, 1].forEach((s) => {
    const pts: V3[] = [];
    for (let i = 0; i <= 24; i++) {
      const x = RXP + AR + 0.08 + ((FXP - AR - RXP - AR - 0.16) * i) / 24;
      pts.push(V(x, 0.268, s * (sectionZ(x, 0.268) + 0.004)));
    }
    put(CORE, tube(pts, 0.005, chrome));
    const hd = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.013, 0.008), chrome);
    hd.position.set(0.55, 0.7, s * (sectionZ(0.55, 0.7) + 0.003));
    put(s > 0 ? DOORL : DOORR, hd);
  });
  [FXP, RXP].forEach((wx) => {
    const liner = new THREE.Mesh(new THREE.CylinderGeometry(AR - 0.012, AR - 0.012, 2 * plan(wx) * 0.95, 40, 1, true, Math.PI / 2, Math.PI), trim);
    liner.rotation.x = Math.PI / 2;
    liner.position.set(wx, WR, 0);
    put(CORE, liner);
  });
  {
    const fl = new THREE.Mesh(new THREE.BoxGeometry(1.24, 0.03, 1.5), trim);
    fl.position.set(0.0, 0.33, 0);
    put(CORE, fl);
  }

  // Mirrors
  [-1, 1].forEach((s) => {
    const mx = 0.8, my = ybelt(mx) + 0.1, mz = s * (plan(mx) * 0.86 + 0.13);
    const P = makePart(procRoot, procParts, V(mx, my, mz), { off: V(0.5, 1.25, s * 1.9), rot: { x: s * 0.6, y: 0.3, z: 0.4 }, d: 0.22, arc: 0.2 });
    const housing = shadowed(new THREE.Mesh(new THREE.SphereGeometry(0.1, 32, 20), paint));
    housing.scale.set(1.45, 0.55, 0.85);
    housing.position.set(mx, my, mz);
    put(P, housing);
    const gs = new THREE.Mesh(housing.geometry, ghostMat);
    gs.visible = false;
    gs.renderOrder = 6;
    housing.add(gs);
    procShells.push(gs);
    const stalk = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.025, 0.12), trim);
    stalk.position.set(mx + 0.02, my - 0.03, mz - s * 0.08);
    put(P, stalk);
  });

  // Cockpit
  const seat = (x: number, z: number, y0: number) => {
    const P = makePart(procRoot, procParts, V(x, y0, z));
    const gg = new THREE.Group();
    gg.position.set(x, y0, z);
    const cush = new THREE.Mesh(rbox(0.5, 0.11, 0.48, 0.05), leather);
    cush.position.set(0, -0.27, 0);
    gg.add(cush);
    const back = new THREE.Mesh(rbox(0.11, 0.62, 0.48, 0.05), leather);
    back.position.set(-0.24, 0.06, 0);
    back.rotation.z = 0.2;
    gg.add(back);
    const head = new THREE.Mesh(rbox(0.08, 0.15, 0.26, 0.035), leather);
    head.position.set(-0.31, 0.44, 0);
    head.rotation.z = 0.2;
    gg.add(head);
    gg.children.forEach((m) => shadowed(m as THREE.Mesh));
    put(P, gg);
    return P;
  };
  const seats = [seat(-0.18, 0.36, 0.7), seat(-0.18, -0.36, 0.7)];
  Object.assign(seats[0], { off: V(0.1, 1.45, 0.6), rot: { x: 0.15, y: 0.2, z: 0.1 }, d: 0.26, arc: 0.15 });
  Object.assign(seats[1], { off: V(0.1, 1.45, -0.6), rot: { x: -0.15, y: -0.2, z: 0.1 }, d: 0.26, arc: 0.15 });
  {
    const P = makePart(procRoot, procParts, V(0.42, 0.74, 0), { off: V(0.35, 1.05, 0), rot: { x: 0, y: 0, z: 0.15 }, d: 0.28, arc: 0.1 });
    const dash = shadowed(new THREE.Mesh(rbox(0.34, 0.18, 1.5, 0.06), dashMat));
    dash.position.set(0.52, 0.74, 0);
    put(P, dash);
    const scr = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.12, 0.5), screenMat);
    scr.position.set(0.37, 0.85, -0.05);
    scr.rotation.z = 0.25;
    put(P, scr);
    const sw = new THREE.Group();
    sw.position.set(0.28, 0.8, 0.36);
    sw.rotation.z = 0.35;
    const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.165, 0.017, 12, 48), leather);
    wheel.rotation.y = Math.PI / 2;
    sw.add(wheel);
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.04, 24), dashMat);
    hub.rotation.z = Math.PI / 2;
    sw.add(hub);
    [0, 2.2, -2.2].forEach((a) => {
      const sp = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.15, 0.025), dashMat);
      sp.position.set(0, Math.cos(a) * 0.08, Math.sin(a) * 0.08);
      sp.rotation.x = -a;
      sw.add(sp);
    });
    put(P, sw);
    const cons = new THREE.Mesh(rbox(0.9, 0.16, 0.22, 0.05), dashMat);
    cons.position.set(-0.05, 0.42, 0);
    put(P, cons);
  }

  // Wheels: tyre / rim / disc / caliper split apart when exploded
  type ProcWheel = { g: THREE.Group; tire: THREE.Group; rim: THREE.Group; disc: THREE.Group; cal: THREE.Mesh; base: V3; side: number };
  const makeWheel = () => {
    const g = new THREE.Group(), tire = new THREE.Group(), rimG = new THREE.Group(), disc = new THREE.Group();
    g.add(tire, rimG, disc);
    const prof = [[0.262, -0.118], [0.3, -0.128], [0.338, -0.126], [0.356, -0.112], [0.362, -0.06], [0.364, 0], [0.362, 0.06], [0.356, 0.112], [0.338, 0.126], [0.3, 0.128], [0.262, 0.118]].map(
      (p) => new THREE.Vector2(p[0], p[1]),
    );
    const t = shadowed(new THREE.Mesh(new THREE.LatheGeometry(prof, 72), rubber));
    t.rotation.x = Math.PI / 2;
    tire.add(t);
    const ts = new THREE.Mesh(t.geometry, ghostMat);
    ts.visible = false;
    ts.renderOrder = 6;
    t.add(ts);
    procShells.push(ts);
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.262, 0.262, 0.22, 48, 1, true), trim);
    barrel.rotation.x = Math.PI / 2;
    rimG.add(barrel);
    for (let i = 0; i < 20; i++) {
      const sp = new THREE.Group();
      const bar = new THREE.Mesh(new THREE.BoxGeometry(0.016, 0.205, 0.022), satin);
      bar.position.y = 0.155;
      bar.rotation.y = 0.45;
      sp.add(bar);
      sp.rotation.z = (i / 20) * Math.PI * 2;
      sp.position.z = 0.096;
      rimG.add(sp);
    }
    const lip = new THREE.Mesh(new THREE.TorusGeometry(0.257, 0.011, 12, 72), chrome);
    lip.position.z = 0.104;
    rimG.add(lip);
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.02, 40), enamel);
    cap.rotation.x = Math.PI / 2;
    cap.position.z = 0.108;
    rimG.add(cap);
    const capRing = new THREE.Mesh(new THREE.TorusGeometry(0.048, 0.004, 8, 48), goldBody);
    capRing.position.z = 0.119;
    rimG.add(capRing);
    const rotor = new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.21, 0.024, 48), discMat);
    rotor.rotation.x = Math.PI / 2;
    rotor.position.z = 0.015;
    disc.add(rotor);
    const hat = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.05, 32), armMat);
    hat.rotation.x = Math.PI / 2;
    hat.position.z = 0.02;
    disc.add(hat);
    const cal = new THREE.Mesh(rbox(0.17, 0.085, 0.05, 0.025), caliperMat);
    cal.position.set(0.125, 0.125, 0.055);
    cal.rotation.z = -0.78;
    g.add(cal);
    return { g, tire, rim: rimG, disc, cal };
  };
  const procWheels: ProcWheel[] = [];
  ([[FXP, 1], [FXP, -1], [RXP, 1], [RXP, -1]] as const).forEach(([x, s]) => {
    const w = makeWheel();
    w.g.position.set(x, WR, s * TRACK);
    if (s < 0) w.g.rotation.y = Math.PI;
    procRoot.add(w.g);
    procWheels.push({ ...w, base: w.g.position.clone(), side: s });
  });

  const procRig: Rig = {
    root: procRoot,
    L: 4.7,
    W: 2 * W2,
    H: 1.2,
    fx: FXP,
    rx: RXP,
    wheelY: WR,
    wheelR: WR,
    headGain: 5.5,
    headPos: [V(frontX(0.58, BAR_Y) + 0.06, BAR_Y, 0.58), V(frontX(0.58, BAR_Y) + 0.06, BAR_Y, -0.58)],
    tailPos: V(rearX(0, 0.745) - 0.04, 0.745, 0),
    headMats: [headMat],
    tailMats: [tailMat],
    shells: procShells,
    casters: procCasters,
    paintMats: [paint],
    wake(w) {
      const n = Math.floor(clamp01(w / 0.85) * BAR_SEG) * BAR_RAD * 6;
      barHalves.forEach((m) => m.geometry.setDrawRange(0, n));
    },
    update(e, theta) {
      animParts(procParts, e);
      const p = smooth(clamp01((e - 0.1) / 0.62)), q = smooth(clamp01((e - 0.22) / 0.62));
      procWheels.forEach((w) => {
        w.g.position.set(w.base.x + Math.sign(w.base.x) * 0.2 * p, w.base.y + 0.12 * p, w.base.z + w.side * 0.42 * p);
        w.disc.position.z = 0.1 * q;
        w.cal.position.z = 0.055 + 0.26 * q;
        w.rim.position.z = 0.52 * q;
        w.tire.position.z = 0.88 * q;
        w.tire.rotation.z = w.rim.rotation.z = w.disc.rotation.z = w.side * theta;
      });
    },
  };

  /* ── Chassis: battery floor, motors, suspension, steering, HV cables (x-ray chapter) ── */
  const chassisParts: Part[] = [];
  const cells: THREE.Mesh[] = [];
  {
    const bat = new THREE.Group();
    chassisG.add(bat);
    const plateM = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.06, 1.5), plateMat);
    plateM.position.set(0, 0.3, 0);
    bat.add(plateM);
    for (let i = 0; i < 8; i++) for (let j = 0; j < 5; j++) {
      const c = new THREE.Mesh(new THREE.BoxGeometry(0.21, 0.06, 0.24), batteryMat);
      c.position.set(-0.855 + i * 0.244, 0.36, -0.56 + j * 0.28);
      bat.add(c);
      cells.push(c);
    }
    ([[FXP, 1], [RXP, -1]] as const).forEach(([x, sg]) => {
      const P = makePart(chassisG, chassisParts, V(x, 0.4, 0), { off: V(sg * 0.38, 0.18, 0), rot: { x: 0, y: 0, z: sg * 0.12 }, d: 0.2, arc: 0.1 });
      const house = shadowed(new THREE.Mesh(rbox(0.42, 0.3, 0.5, 0.06), motorMat));
      house.position.set(x - sg * 0.06, 0.42, 0);
      put(P, house);
      const can = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.66, 32), motorMat));
      can.rotation.x = Math.PI / 2;
      can.position.set(x + sg * 0.08, 0.38, 0);
      put(P, can);
      [-1, 1].forEach((s) => {
        const ring = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.012, 8, 40), goldCh);
        ring.position.set(x + sg * 0.08, 0.38, s * 0.33);
        put(P, ring);
        put(P, between(V(x, 0.37, s * 0.32), V(x, WR, s * 0.74), 0.022, damperMat));
      });
      [-1, 1].forEach((s) => {
        const pts = [V(sg * 1.02, 0.37, s * 0.18), V(sg * 1.1, 0.44, s * 0.2), V(x - sg * 0.22, 0.47, s * 0.14), V(x - sg * 0.28, 0.43, s * 0.1)];
        chassisG.add(tube(pts, 0.013, cableMat));
      });
    });
    ([[FXP, 1], [FXP, -1], [RXP, 1], [RXP, -1]] as const).forEach(([wx, s]) => {
      const P = makePart(chassisG, chassisParts, V(wx, 0.62, s * 0.64), { off: V(Math.sign(wx) * 0.12, 0.45, s * 0.28), rot: { x: s * 0.25, y: 0, z: 0 }, d: 0.18, arc: 0.12 });
      const zc = s * 0.64, zh = s * 0.72;
      put(P, between(V(wx, 0.4, zc), V(wx, 0.84, zc), 0.022, damperMat));
      const top = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.03, 24), armMat);
      top.position.set(wx, 0.84, zc);
      put(P, top);
      const seatL = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.015, 24), armMat);
      seatL.position.set(wx, 0.5, zc);
      put(P, seatL);
      const helix: V3[] = [];
      for (let i = 0; i <= 120; i++) {
        const t = i / 120, a = t * Math.PI * 2 * 5.5;
        helix.push(V(wx + Math.cos(a) * 0.068, 0.51 + 0.31 * t, zc + Math.sin(a) * 0.068));
      }
      put(P, shadowed(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(helix), 360, 0.011, 8, false), springMat)));
      const knuckle = new THREE.Mesh(rbox(0.12, 0.18, 0.06, 0.025), armMat);
      knuckle.position.set(wx, 0.37, zh);
      put(P, knuckle);
      ([[0.22, 0.31, 0.28, 0.33], [-0.22, 0.31, 0.28, 0.33], [0.16, 0.6, 0.4, 0.56], [-0.16, 0.6, 0.4, 0.56]] as const).forEach(([dx, y, zi, yh]) => {
        put(P, between(V(wx, yh, zh), V(wx + dx, y, s * zi), 0.016, armMat));
      });
    });
    const R = makePart(chassisG, chassisParts, V(FXP + 0.15, 0.43, 0), { off: V(0.3, 0.28, 0), d: 0.22, arc: 0.1 });
    put(R, between(V(FXP + 0.15, 0.43, -0.55), V(FXP + 0.15, 0.43, 0.55), 0.024, damperMat));
    [-1, 1].forEach((s) => put(R, between(V(FXP + 0.15, 0.43, s * 0.55), V(FXP + 0.06, 0.38, s * 0.72), 0.012, armMat)));
    const rad = new THREE.Mesh(rbox(0.07, 0.24, 1.05, 0.02), armMat);
    rad.position.set(2.0, 0.45, 0);
    put(R, rad);
  }
  chassisG.visible = false;

  /* ── Tunnel (final chapter) ── */
  const tunnel = new THREE.Group();
  root.add(tunnel);
  const tunnelMats: THREE.MeshStandardMaterial[] = [];
  const tMat = (p: THREE.MeshStandardMaterialParameters) => {
    const m = track(new THREE.MeshStandardMaterial({ transparent: true, opacity: 0, ...p }));
    tunnelMats.push(m);
    return m;
  };
  // Single-sided walls facing inward: while the camera is still outside the tunnel the
  // near wall is culled instead of washing over the car.
  const wallMat = tMat({ color: 0xeef1ea, roughness: 0.9 });
  const stripeMat = tMat({ color: 0x1a1a1a, roughness: 0.5 });
  const lampMat = tMat({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 1.2 });
  const goldLineMat = tMat({ color: 0xb8925a, emissive: 0xc9a05e, emissiveIntensity: 1.1, metalness: 0.6, roughness: 0.3 });
  const LEN = 120;
  [-1, 1].forEach((s) => {
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(LEN, 4.2), wallMat);
    wall.position.set(LEN / 2 - 20, 2.1, s * 4.2);
    if (s > 0) wall.rotation.y = Math.PI; // plane normals face +z; turn the +z wall inward
    tunnel.add(wall);
  });
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(LEN, 8.4), wallMat);
  ceil.rotation.x = Math.PI / 2;
  ceil.position.set(LEN / 2 - 20, 4.2, 0);
  tunnel.add(ceil);
  const movers: THREE.Mesh[] = [];
  for (let i = 0; i < 30; i++) {
    const x = -20 + i * 4;
    [-1.7, 1.7].forEach((z) => {
      const s = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.01, 0.06), stripeMat);
      s.position.set(x, 0.006, z);
      tunnel.add(s);
      movers.push(s);
    });
    const lamp = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.04, 0.22), lampMat);
    lamp.position.set(x + 2, 4.15, 0);
    tunnel.add(lamp);
    movers.push(lamp);
    [-1, 1].forEach((s) => {
      const g = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.03, 0.03), goldLineMat);
      g.position.set(x + 1, 1.1, s * 4.15);
      tunnel.add(g);
      movers.push(g);
    });
  }
  tunnel.visible = false;

  /* ── Rig handling ── */
  let rig: Rig = procRig;
  let glbRig: Rig | null = null;
  const setRig = (r: Rig) => {
    rig = r;
    procRoot.visible = r === procRig;
    r.headPos.forEach((p, i) => {
      glows[i].position.set(p.x + 0.05, p.y, p.z);
      glows[i].scale.set(r.W * 0.5, r.W * 0.26, 1);
      headSpots[i].position.copy(p);
      headSpots[i].target.position.set(p.x + 6, 0, p.z * 1.8);
    });
    tailGlow.position.set(r.tailPos.x - 0.08, r.tailPos.y, r.tailPos.z);
    tailGlow.scale.set(r.W * 1.35, 0.32, 1);
    const k = Math.max(1, r.fx - r.rx) / (FXP - RXP);
    chassisG.scale.set(k, 1, r.W / (2 * W2));
    chassisG.position.set((r.fx + r.rx) / 2 - ((FXP + RXP) / 2) * k, r.wheelY - WR, 0);
    blob.scale.set(r.L / 4.9, r.W / 1.92, 1);
    if (r !== procRig) barHalves.forEach((m) => m.geometry.setDrawRange(0, 0));
    renderer.shadowMap.needsUpdate = true;
  };
  setRig(procRig);

  /**
   * Compile every chapter's shaders up front (x-ray shells, chassis, tunnel), for both
   * the screen pass and the mirror pass, so later chapters don't stall on first view.
   * compile() walks the whole scene, hidden objects included.
   */
  const warmShaders = () => {
    const done = () => undefined;
    renderer.compileAsync(scene, camera).then(done, done);
    const prev = renderer.getRenderTarget();
    renderer.setRenderTarget(reflRT);
    renderer.compileAsync(scene, mirrorCam).then(done, done);
    renderer.setRenderTarget(prev);
  };

  /* ── X-ray callouts (SVG overlay with leader lines) ── */
  const CALLOUT_POINTS = [V(FXP, 0.42, 0), V(0.1, 0.37, -0.25), V(FXP, 0.78, 0.64), V(RXP, 0.52, 0.9), V(RXP, 0.42, 0), V(-0.18, 0.78, -0.36)];
  type Callout = { p: V3; n: string; t: string; g: SVGGElement; line: SVGPathElement; ring: SVGCircleElement; dot: SVGCircleElement; num: SVGTextElement; txt: SVGTextElement };
  const SVGNS = "http://www.w3.org/2000/svg";
  const mk = <K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string>) => {
    const e = document.createElementNS(SVGNS, tag);
    Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v));
    return e;
  };
  const callouts: Callout[] = [];
  if (o.calloutSvg) {
    o.calloutSvg.replaceChildren();
    CALLOUT_POINTS.forEach((p, i) => {
      const g = mk("g", {});
      const line = mk("path", { fill: "none", stroke: "rgba(22,26,22,.55)", "stroke-width": "1" });
      const ring = mk("circle", { r: "9", fill: "none", stroke: "#9c8150", "stroke-opacity": ".55", "stroke-width": "1" });
      const dot = mk("circle", { r: "3.2", fill: "#9c8150" });
      const num = mk("text", { class: "hero-callout-num" });
      const txt = mk("text", { class: "hero-callout-text" });
      const n = String(i + 1).padStart(2, "0");
      num.textContent = n;
      txt.textContent = o.calloutLabels[i] ?? "";
      g.append(line, ring, dot, num, txt);
      o.calloutSvg!.appendChild(g);
      callouts.push({ p, n, t: txt.textContent, g, line, ring, dot, num, txt });
    });
  }
  const _pv = new THREE.Vector3();
  let viewW = 1, viewH = 1;
  const updateCallouts = (alpha: number) => {
    if (!o.calloutSvg) return;
    o.calloutSvg.style.opacity = alpha.toFixed(3);
    if (alpha < 0.01) return;
    callouts.forEach((c, i) => {
      _pv.copy(c.p);
      chassisG.localToWorld(_pv);
      _pv.project(camera);
      if (_pv.z > 1) {
        c.g.style.display = "none";
        return;
      }
      c.g.style.display = "";
      const ax = ((_pv.x + 1) / 2) * viewW, ay = ((1 - _pv.y) / 2) * viewH, dir = ax < viewW / 2 ? -1 : 1;
      // Left-hand labels stay above the chapter caption (bottom-left); right-hand ones above the progress bar.
      const maxY = dir < 0 ? viewH * 0.58 : viewH - 110;
      const ly = Math.max(90, Math.min(maxY, ay + (ay < viewH * 0.5 ? -1 : 1) * (46 + (i % 3) * 24)));
      const tw = c.t.length * 6.6 + 34;
      let lx = ax + dir * (64 + (i % 2) * 46);
      lx = dir > 0 ? Math.min(lx, viewW - tw - 28) : Math.max(lx, tw + 28);
      const lx2 = lx + dir * tw, left = Math.min(lx, lx2);
      c.line.setAttribute("d", `M${ax.toFixed(1)} ${ay.toFixed(1)}L${ax.toFixed(1)} ${ly.toFixed(1)}L${lx2.toFixed(1)} ${ly.toFixed(1)}`);
      c.ring.setAttribute("cx", ax.toFixed(1));
      c.ring.setAttribute("cy", ay.toFixed(1));
      c.dot.setAttribute("cx", ax.toFixed(1));
      c.dot.setAttribute("cy", ay.toFixed(1));
      c.num.setAttribute("x", (left + 2).toFixed(1));
      c.num.setAttribute("y", (ly - 8).toFixed(1));
      c.txt.setAttribute("x", (left + 28).toFixed(1));
      c.txt.setAttribute("y", (ly - 8).toFixed(1));
    });
  };

  /* ── Mouse parallax ── */
  const mouse = { x: 0, y: 0, sx: 0, sy: 0 };
  const onMouse = (e: MouseEvent) => {
    mouse.x = e.clientX / window.innerWidth - 0.5;
    mouse.y = e.clientY / window.innerHeight - 0.5;
  };
  window.addEventListener("mousemove", onMouse, { passive: true });

  /* ── Frame ── */
  const camPos = V(12.5, 3.4, 10.5), camTgt = K[0].tgt.clone(), paintTarget = new THREE.Color();
  let clockT = 0, theta = 0, cur = 0, userPaint: number | null = null;
  let lastState: HeroWorldState = { cap: -2, swatch: -1, progress: -1 };
  /** Horizontal film offset (mm on a 35 mm gauge) used while the intro text is shown. */
  let introOffset = 7;

  const frame = (rawDt: number) => {
    const dt = Math.min(rawDt, 0.05);
    clockT += dt;
    cur += (o.getProgress() - cur) * Math.min(1, dt * 3.0);
    const s = sample(cur * (K.length - 1));

    mouse.sx += (mouse.x - mouse.sx) * dt * 2;
    mouse.sy += (mouse.y - mouse.sy) * dt * 2;
    const drift = V(Math.sin(clockT * 0.22) * 0.12, Math.sin(clockT * 0.3) * 0.05, Math.cos(clockT * 0.19) * 0.12);
    const want = s.cam.clone().add(drift).add(V(0, -mouse.sy * 0.35, mouse.sx * 0.6));
    const glide = Math.min(4, 0.55 + clockT * 1.1);
    camPos.lerp(want, Math.min(1, dt * glide));
    camTgt.lerp(s.tgt, Math.min(1, dt * Math.max(glide, 0.5)));
    camera.position.copy(camPos);
    camera.lookAt(camTgt);
    // Intro: slide the car into the right of the frame, clear of the HTML headline,
    // then ease back to centre as the story starts.
    const intro = 1 - smooth(clamp01(cur * (K.length - 1)));
    camera.filmOffset = -introOffset * intro;
    camera.updateProjectionMatrix();

    const clay = smooth(clamp01(s.clay)), ghost = smooth(clamp01(s.ghost)), e = smooth(clamp01(s.explode)), tn = smooth(clamp01(s.tunnel));
    const solidPaint = 1 - ghost;

    // Clay scan sweeps front→back on the way in and back→front on the way out.
    FX.uClayX.value = clay <= 0.001 ? 50 : clay >= 0.999 ? -50 : 3.4 - 6.8 * clay;
    FX.uScan.value = Math.sin(Math.PI * clay);
    FX.uGhost.value = ghost;
    rig.shells.forEach((m) => (m.visible = ghost > 0.01));
    rig.casters.forEach((m) => (m.castShadow = ghost < 0.5));
    chassisG.visible = ghost > 0.01 || e > 0.01;

    // Welcome sequence: light bar draws itself, then lamps bloom.
    const wake = Math.max(s.head, clamp01((clockT - 0.5) / 1.8));
    rig.wake?.(wake);
    const bloom = rig.wake ? clamp01((wake - 0.7) / 0.3) : wake;
    rig.headMats.forEach((m) => (m.emissiveIntensity = (rig.wake ? wake : bloom) * rig.headGain));
    glows.forEach((g) => (g.material.opacity = bloom * 0.85 * solidPaint));
    headSpots.forEach((l) => (l.intensity = bloom * 6 * LIGHT * solidPaint));

    // Paint: scroll moves finish 0 → 1; a chosen swatch wins.
    if (userPaint !== null) paintTarget.copy(FIN[userPaint]);
    else paintTarget.copy(FIN[0]).lerp(FIN[1], smooth(clamp01(s.paint)));
    rig.paintMats.forEach((m) => m.color.lerp(paintTarget, Math.min(1, dt * 4.5)));
    const swatch = userPaint !== null ? userPaint : s.paint > 0.5 ? 1 : 0;

    // Light pass along the shoulder.
    sweepLight.intensity = Math.sin(s.sweep * Math.PI) * 30 * LIGHT;
    sweepLight.position.set(-3.4 + s.sweep * 6.8, 2.0, 2.3);

    // Studio grid + floor mood.
    const grid = clamp01(s.grid) * (1 - tn);
    (domeLines.material as THREE.LineBasicMaterial).opacity = grid * 0.06;
    gridMat.opacity = grid * 0.055;
    gridG.visible = grid > 0.005;
    mirrorMat.uniforms.strength.value = 0.34 * (1 - 0.35 * e);

    // Tunnel drive.
    tunnel.visible = tn > 0.01;
    tunnelMats.forEach((m) => (m.opacity = tn));
    const speed = tn * 22;
    movers.forEach((m) => {
      m.position.x -= speed * dt;
      if (m.position.x < -22) m.position.x += 120;
    });
    theta -= (speed / rig.wheelR) * dt;
    car.position.y = tn ? Math.sin(clockT * 9) * 0.004 * tn : 0;
    rig.tailMats.forEach((m) => (m.emissiveIntensity = 0.6 + tn * 3.5));
    tailGlow.material.opacity = (0.28 + tn * 0.5) * solidPaint;
    (floor.material as THREE.ShadowMaterial).opacity = 0.15 * (1 - tn * 0.4);

    // Exploded view.
    batteryMat.emissiveIntensity = Math.max(ghost, e) * 2.2;
    cells.forEach((c, i) => (c.position.y = 0.39 + e * 0.03 * Math.sin(i * 0.7 + clockT * 2)));
    (blob.material as THREE.MeshBasicMaterial).opacity = 1 - e * 0.4;
    rig.update(e, theta);
    animParts(chassisParts, e);

    updateCallouts(clamp01((ghost - 0.55) / 0.35) * (1 - clamp01(e * 4)));

    const state: HeroWorldState = { cap: s.cap, swatch, progress: cur };
    if (state.cap !== lastState.cap || state.swatch !== lastState.swatch || Math.abs(state.progress - lastState.progress) > 0.002) {
      lastState = state;
      o.onState(state);
    }

    // Mirror pass for the gloss floor, then the main render.
    mirrorCam.fov = camera.fov;
    mirrorCam.filmGauge = camera.filmGauge;
    mirrorCam.filmOffset = camera.filmOffset;
    mirrorCam.aspect = camera.aspect;
    mirrorCam.near = camera.near;
    mirrorCam.far = camera.far;
    mirrorCam.updateProjectionMatrix();
    mirrorCam.position.set(camera.position.x, -camera.position.y, camera.position.z);
    mirrorCam.up.set(0, -1, 0);
    mirrorCam.lookAt(camTgt.x, -camTgt.y, camTgt.z);
    mirrorCam.updateMatrixWorld();
    texMat.set(0.5, 0, 0, 0.5, 0, 0.5, 0, 0.5, 0, 0, 0.5, 0.5, 0, 0, 0, 1).multiply(mirrorCam.projectionMatrix).multiply(mirrorCam.matrixWorldInverse);
    const gv = gridG.visible;
    mirrorFloor.visible = false;
    floor.visible = false;
    blob.visible = false;
    gridG.visible = false;
    renderer.setRenderTarget(reflRT);
    renderer.clear();
    renderer.render(scene, mirrorCam);
    renderer.setRenderTarget(null);
    mirrorFloor.visible = true;
    floor.visible = true;
    blob.visible = true;
    gridG.visible = gv;
    renderer.shadowMap.needsUpdate = true;
    renderer.render(scene, camera);
  };

  return {
    setPaint: (i) => {
      userPaint = i;
    },
    setModel: (src, paintPattern) => {
      if (glbRig) {
        car.remove(glbRig.root);
        glbRig.dispose?.();
      }
      glbRig = makeGLBRig(src, paintPattern, { paint, ghostMat, patchMat, track });
      car.add(glbRig.root);
      setRig(glbRig);
      warmShaders();
      return (glbRig as Rig & { info?: string }).info ?? "";
    },
    resize: (w, h, dpr) => {
      viewW = w;
      viewH = h;
      // Wider screens have more room beside the text, so shift less.
      introOffset = w >= 1600 ? 7 : w >= 1360 ? 8.5 : w >= 1100 ? 10 : 11.5;
      const rw = Math.max(2, Math.floor(w * dpr * 0.5)), rh = Math.max(2, Math.floor(h * dpr * 0.5));
      reflRT.setSize(rw, rh);
      (mirrorMat.uniforms.texel.value as THREE.Vector2).set(1 / rw, 1 / rh);
    },
    frame,
    dispose: () => {
      window.removeEventListener("mousemove", onMouse);
      scene.remove(root);
      scene.environment = null;
      scene.fog = null;
      root.traverse((x) => {
        const m = x as THREE.Mesh;
        if (m.isMesh) m.geometry?.dispose();
      });
      disposables.forEach((d) => d.dispose());
      o.calloutSvg?.replaceChildren();
    },
  };
}

/* ───────────────────────── Real model (.glb) rig ───────────────────────── */

const tok = (s: string | undefined) => " " + String(s || "").toLowerCase().replace(/[^a-z]+/g, " ") + " ";
type AnyMat = THREE.Material | THREE.Material[];
const matsOf = (m: THREE.Mesh) => (Array.isArray(m.material) ? m.material : [m.material]) as THREE.Material[];
const matNames = (m: THREE.Mesh) => matsOf(m).map((x) => x?.name).join(" ");
function meshBox(m: THREE.Mesh) {
  const g = m.geometry;
  if (!g.boundingBox) g.computeBoundingBox();
  return g.boundingBox!.clone().applyMatrix4(m.matrixWorld);
}
function boxOf(obj: THREE.Object3D) {
  const box = new THREE.Box3();
  obj.traverse((o) => {
    const m = o as THREE.Mesh;
    if (m.isMesh && m.visible && m.geometry) box.union(meshBox(m));
  });
  return box;
}
const WHEEL_RE = /wheel|tire|tyre| rims? |felge|reifen|rueda|roue/;
const NOTWHEEL_RE = /steer|arch|well|spare|house|cover|guard|base/;
const HEAD_RE = /head ?(light|lamp)|front ?(light|lamp)|(light|lamp)s? ?front| drl |daytime/;
const TAIL_RE = /tail ?(light|lamp)|rear ?(light|lamp)|(light|lamp)s? ?(rear|back)|brake ?(light|lamp)|stop ?(light|lamp)|backlight/;
const LIGHT_RE = / (light|lights|lamp|lamps|led|leds) /;
const LIGHT_EX = /grey|gray|interior|plastic|leather|wood|fabric|cabin|dome|reading|steel|metal/;
const GLASS_RE = /glass|window|windshield|windscreen| glas |vitre|crystal/;
const PAINT_RE = /paint|body|exterior|shell|lack|karosserie|coat/;
const PAINT_EX = /glass|window|light|lamp|tire|tyre| rim|wheel|interior|seat|chrome|trim|plastic|grill|logo|badge|emblem|carbon|rubber|leather|dash|steer|caliper|brake|exhaust|plate|black|dark|matte|under|mirror glass|engine/;

type NodePrep = { node: THREE.Object3D; pwInv: THREE.Matrix4; base: THREE.Matrix4 };
function prep(node: THREE.Object3D): NodePrep {
  node.updateMatrix();
  const pw = node.parent!.matrixWorld.clone();
  return { node, pwInv: pw.clone().invert(), base: pw.clone().multiply(node.matrix) };
}
/** Re-poses a node: `pre` acts in the rig's frame (offsets), `post` in the node's own frame (spin). */
function applyNode(n: NodePrep, pre: THREE.Matrix4, post?: THREE.Matrix4) {
  n.node.matrixAutoUpdate = false;
  n.node.matrix.copy(n.pwInv).multiply(pre).multiply(n.base);
  if (post) n.node.matrix.multiply(post);
  n.node.matrixWorldNeedsUpdate = true;
}

function makeGLBRig(
  src: THREE.Object3D,
  paintPattern: RegExp | null,
  ctx: {
    paint: THREE.MeshPhysicalMaterial;
    ghostMat: THREE.ShaderMaterial;
    patchMat: ReturnType<typeof makePatcher>;
    track: <T extends { dispose: () => void }>(x: T) => T;
  },
): Rig & { info: string } {
  const _T = new THREE.Matrix4(), _R = new THREE.Matrix4(), _T2 = new THREE.Matrix4(), _P = new THREE.Matrix4();
  const root = new THREE.Group(), orient = new THREE.Group();
  orient.add(src);
  root.add(orient);
  root.updateMatrixWorld(true);

  // Hide studio floors/backdrops baked into the model.
  const whole = boxOf(orient), ws = whole.getSize(new THREE.Vector3());
  orient.traverse((o) => {
    const m = o as THREE.Mesh;
    if (!m.isMesh || !m.geometry) return;
    const s = meshBox(m).getSize(new THREE.Vector3());
    const flat = s.y < 0.012 * Math.max(s.x, s.z), big = s.x > 0.9 * ws.x && s.z > 0.9 * ws.z;
    const named = /ground|floor|shadow|plane|backdrop|studio|stage/.test(tok(m.name + " " + matNames(m)));
    if (flat && (big || named)) m.visible = false;
  });

  // Orient length along X, nose towards +X (judged by head/tail light positions), length 4.9.
  let b = boxOf(orient), s = b.getSize(new THREE.Vector3());
  const rotY = s.z > s.x ? Math.PI / 2 : 0;
  orient.rotation.y = rotY;
  root.updateMatrixWorld(true);
  const avgX = (re: RegExp) => {
    let sum = 0, n = 0;
    orient.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh && m.visible && re.test(tok(m.name + " " + matNames(m) + " " + (m.parent ? m.parent.name : "")))) {
        sum += meshBox(m).getCenter(new THREE.Vector3()).x;
        n++;
      }
    });
    return n ? sum / n : null;
  };
  const hx = avgX(HEAD_RE), tx = avgX(TAIL_RE);
  let flip = false;
  if (hx !== null && tx !== null) flip = hx < tx;
  else if (hx !== null) flip = hx < 0;
  else if (tx !== null) flip = tx > 0;
  orient.rotation.y = rotY + (flip ? Math.PI : 0);
  root.updateMatrixWorld(true);
  b = boxOf(orient);
  s = b.getSize(new THREE.Vector3());
  orient.scale.setScalar(4.9 / s.x);
  root.updateMatrixWorld(true);
  b = boxOf(orient);
  const c = b.getCenter(new THREE.Vector3());
  orient.position.set(-c.x, -b.min.y, -c.z);
  root.updateMatrixWorld(true);
  b = boxOf(orient);
  s = b.getSize(new THREE.Vector3());
  const L = s.x, Wd = s.z, H = s.y;

  const meshes: THREE.Mesh[] = [];
  orient.traverse((o) => {
    const m = o as THREE.Mesh;
    if (m.isMesh && m.visible && m.geometry) meshes.push(m);
  });
  const mb = new Map<THREE.Mesh, THREE.Box3>();
  meshes.forEach((m) => mb.set(m, meshBox(m)));

  // Wheels: named groups first, then wheel-like meshes, clustered into four corners.
  const wheelOK = (bb: THREE.Box3) => {
    const z = bb.getSize(new THREE.Vector3()), cc = bb.getCenter(new THREE.Vector3());
    return Math.max(z.x, z.y) < 0.38 * L && cc.y < 0.5 * H && z.y > 0.12 * H;
  };
  const cands: { node: THREE.Object3D; bb: THREE.Box3 }[] = [];
  const candSet = new Set<THREE.Object3D>(), stay = new Set<THREE.Mesh>();
  (function walk(o: THREE.Object3D) {
    for (const ch of o.children) {
      const t = tok(ch.name);
      if (WHEEL_RE.test(t) && !NOTWHEEL_RE.test(t)) {
        const bb = boxOf(ch);
        if (!bb.isEmpty() && wheelOK(bb)) {
          cands.push({ node: ch, bb });
          candSet.add(ch);
          continue;
        }
      }
      walk(ch);
    }
  })(orient);
  const inCand = (o: THREE.Object3D) => {
    for (let p: THREE.Object3D | null = o; p; p = p.parent) if (candSet.has(p)) return true;
    return false;
  };
  meshes.forEach((m) => {
    if (inCand(m)) return;
    const t = tok(matNames(m) + " " + m.name);
    if (/ (tire|tyre|tires|tyres|rim|rims|wheel|wheels|rubber|felge|reifen) /.test(t) && !NOTWHEEL_RE.test(t)) {
      const bb = mb.get(m)!;
      if (wheelOK(bb)) {
        cands.push({ node: m, bb });
        candSet.add(m);
      } else if (bb.getCenter(new THREE.Vector3()).y < 0.5 * H) stay.add(m);
    }
  });
  const clusters: Record<string, { nodes: THREE.Object3D[]; bb: THREE.Box3 }> = {};
  cands.forEach((cd) => {
    const cc = cd.bb.getCenter(new THREE.Vector3()), k = (cc.x > 0 ? "F" : "R") + (cc.z > 0 ? "L" : "R");
    if (!clusters[k]) clusters[k] = { nodes: [], bb: new THREE.Box3() };
    clusters[k].nodes.push(cd.node);
    clusters[k].bb.union(cd.bb);
  });
  /**
   * Wheels spin about their own axle, in their own frame: a model's front wheels are
   * often posed steered, so their axle isn't the car's lateral axis, and spinning them
   * about that axis made them wobble out of the arches. `axis` is the local axis that
   * points most nearly across the car (world Z), `spin` its direction, `pivot` the
   * wheel centre in local space. Brake calipers inside the wheel are held still.
   */
  type WheelNode = NodePrep & {
    sx: number;
    sz: number;
    axis: V3;
    spin: number;
    pivot: V3;
    calipers: { node: THREE.Object3D; base: THREE.Matrix4 }[];
  };
  const spinFrame = (np: NodePrep, ctr: V3) => {
    const rot = new THREE.Matrix3().setFromMatrix4(np.base);
    let axis = V(1, 0, 0), along = 0;
    for (const a of [V(1, 0, 0), V(0, 1, 0), V(0, 0, 1)]) {
      const z = a.clone().applyMatrix3(rot).normalize().z;
      if (Math.abs(z) > Math.abs(along)) {
        axis = a;
        along = z;
      }
    }
    return { axis, spin: Math.sign(along) || 1, pivot: ctr.clone().applyMatrix4(np.base.clone().invert()) };
  };
  const CALIPER_RE = / (brake ?pad|brakepad|caliper|calliper|brake) /;
  const calipersOf = (node: THREE.Object3D) =>
    node.children
      .filter((c) => CALIPER_RE.test(tok(c.name + " " + ((c as THREE.Mesh).isMesh ? matNames(c as THREE.Mesh) : ""))) && !/ disc /.test(tok(c.name)))
      .map((c) => {
        c.updateMatrix();
        return { node: c, base: c.matrix.clone() };
      });
  const wheelNodes: WheelNode[] = [], fxs: number[] = [], rxs: number[] = [], wy: number[] = [], wr: number[] = [];
  Object.keys(clusters).forEach((k) => {
    const cl = clusters[k], ctr = cl.bb.getCenter(new THREE.Vector3()), sz = cl.bb.getSize(new THREE.Vector3());
    (k[0] === "F" ? fxs : rxs).push(ctr.x);
    wy.push(ctr.y);
    wr.push(sz.y / 2);
    cl.nodes.forEach((n) => {
      const np = prep(n);
      wheelNodes.push({ ...np, ...spinFrame(np, ctr), sx: k[0] === "F" ? 1 : -1, sz: k[1] === "L" ? 1 : -1, calipers: calipersOf(n) });
    });
  });
  const avg = (a: number[]) => a.reduce((p, q) => p + q, 0) / a.length;

  // Exploded layers: every top-most non-wheel mesh flies out radially and upwards.
  const hasCandDesc = (o: THREE.Object3D) => {
    let f = false;
    o.traverse((x) => {
      if (x !== o && candSet.has(x)) f = true;
    });
    return f;
  };
  const layerSet = new Set<THREE.Mesh>();
  meshes.forEach((m) => {
    if (!inCand(m) && !stay.has(m) && !hasCandDesc(m)) layerSet.add(m);
  });
  type Layer = NodePrep & { off: V3 };
  const layers: Layer[] = [];
  layerSet.forEach((m) => {
    for (let p = m.parent; p; p = p.parent) if (layerSet.has(p as THREE.Mesh)) return;
    const cc = mb.get(m)!.getCenter(new THREE.Vector3());
    const hN = clamp01(cc.y / H);
    const lift = (0.6 + 0.9 * hN) * (H / 1.4);
    const side = (cc.z / (Wd / 2)) * 0.45 * Wd;
    const fore = (cc.x / (L / 2)) * 0.1 * L;
    layers.push({ ...prep(m), off: V(fore, lift, side) });
  });

  // Head/tail lights get their own emissive materials.
  const headMats: THREE.MeshStandardMaterial[] = [], tailMats: THREE.MeshStandardMaterial[] = [], heads: THREE.Box3[] = [], tails: THREE.Box3[] = [];
  const lightClone = (kind: "head" | "tail") => (mat: THREE.Material) => {
    if (!mat) return mat;
    const cm = ctx.track(mat.clone()) as THREE.MeshStandardMaterial;
    if (cm.emissive) {
      cm.emissive.set(kind === "head" ? 0xeaf3ff : 0xff1530);
      cm.emissiveIntensity = kind === "head" ? 0 : 0.6;
    }
    (kind === "head" ? headMats : tailMats).push(cm);
    return cm;
  };
  meshes.forEach((m) => {
    m.castShadow = true;
    m.receiveShadow = true;
    matsOf(m).forEach((mt) => {
      const sm = mt as THREE.MeshStandardMaterial;
      if (sm && sm.envMapIntensity !== undefined) sm.envMapIntensity = 1.3;
    });
    const lt = tok(m.name + " " + matNames(m) + " " + (m.parent ? m.parent.name : "")), cc = mb.get(m)!.getCenter(new THREE.Vector3());
    let kind: "head" | "tail" | null = null;
    if (TAIL_RE.test(lt)) kind = "tail";
    else if (HEAD_RE.test(lt)) kind = "head";
    else if (LIGHT_RE.test(lt) && !LIGHT_EX.test(lt)) kind = cc.x > 0.25 * L ? "head" : cc.x < -0.25 * L ? "tail" : null;
    if (kind) {
      m.material = (Array.isArray(m.material) ? m.material.map(lightClone(kind)) : lightClone(kind)(m.material)) as AnyMat;
      (kind === "head" ? heads : tails).push(mb.get(m)!);
    }
  });

  // Paint: configured pattern first, then name heuristics, then the dominant body material.
  const isGlass = (mt: THREE.Material, m: THREE.Mesh) => {
    const pm = mt as THREE.MeshPhysicalMaterial;
    return GLASS_RE.test(tok(mt.name + " " + m.name)) || (mt.transparent && mt.opacity < 0.95) || (pm.transmission ?? 0) > 0;
  };
  const lightSet = new Set<THREE.Material>([...headMats, ...tailMats]);
  const paintSet = new Set<THREE.Material>();
  if (paintPattern) meshes.forEach((m) => matsOf(m).forEach((mt) => mt && paintPattern.test(mt.name) && paintSet.add(mt)));
  if (!paintSet.size)
    meshes.forEach((m) =>
      matsOf(m).forEach((mt) => {
        if (mt && !lightSet.has(mt) && !isGlass(mt, m)) {
          const t = tok(mt.name);
          if (PAINT_RE.test(t) && !PAINT_EX.test(t)) paintSet.add(mt);
        }
      }),
    );
  if (!paintSet.size) {
    const area = new Map<THREE.Material, number>();
    let total = 0;
    meshes.forEach((m) => {
      if (inCand(m)) return;
      const z = mb.get(m)!.getSize(new THREE.Vector3()), a = 2 * (z.x * z.y + z.y * z.z + z.x * z.z);
      matsOf(m).forEach((mt) => {
        if (!mt) return;
        total += a;
        if (lightSet.has(mt) || isGlass(mt, m) || PAINT_EX.test(tok(mt.name))) return;
        area.set(mt, (area.get(mt) || 0) + a);
      });
    });
    let best: THREE.Material | null = null, bestA = 0;
    area.forEach((a, mt) => {
      if (a > bestA) {
        bestA = a;
        best = mt;
      }
    });
    if (best && bestA / total > 0.12 && bestA / total < 0.7) paintSet.add(best);
  }
  let paintCount = 0;
  meshes.forEach((m) => {
    if (Array.isArray(m.material))
      m.material = m.material.map((mt) => {
        if (paintSet.has(mt)) {
          paintCount++;
          return ctx.paint;
        }
        return mt;
      });
    else if (paintSet.has(m.material)) {
      m.material = ctx.paint;
      paintCount++;
    }
  });

  // Clay sweep + x-ray ghost for every model material (glass and lights don't turn to clay).
  const shells: THREE.Mesh[] = [], casters: THREE.Mesh[] = [];
  meshes.forEach((m) => {
    matsOf(m).forEach((mt) => ctx.patchMat(mt, { ghost: true, sweep: !lightSet.has(mt) && !isGlass(mt, m) }));
    casters.push(m);
    const gs = new THREE.Mesh(m.geometry, ctx.ghostMat);
    gs.visible = false;
    gs.renderOrder = 6;
    m.add(gs);
    shells.push(gs);
  });

  let headPos: V3[];
  if (heads.length) {
    const side = (sg: number) => {
      const l = heads.filter((bb) => sg * bb.getCenter(new THREE.Vector3()).z >= 0);
      if (!l.length) return null;
      return V(Math.max(...l.map((bb) => bb.max.x)), avg(l.map((bb) => bb.getCenter(new THREE.Vector3()).y)), avg(l.map((bb) => bb.getCenter(new THREE.Vector3()).z)));
    };
    let a = side(1), d = side(-1);
    if (!a && d) a = V(d.x, d.y, -d.z);
    if (!d && a) d = V(a.x, a.y, -a.z);
    if (a && d && Math.abs(a.z) < 0.1 * Wd) {
      a.z = 0.33 * Wd;
      d.z = -0.33 * Wd;
    }
    headPos = [a!, d!];
  } else headPos = [V(L / 2 - 0.02, 0.48 * H, 0.34 * Wd), V(L / 2 - 0.02, 0.48 * H, -0.34 * Wd)];
  const tailPos = tails.length ? V(Math.min(...tails.map((bb) => bb.min.x)), avg(tails.map((bb) => bb.getCenter(new THREE.Vector3()).y)), 0) : V(-L / 2 + 0.02, 0.6 * H, 0);

  let lastE = -1;
  return {
    root,
    L,
    W: Wd,
    H,
    headGain: 2.4,
    headPos,
    tailPos,
    headMats,
    tailMats,
    shells,
    casters,
    paintMats: [ctx.paint],
    fx: fxs.length ? avg(fxs) : 0.3 * L,
    rx: rxs.length ? avg(rxs) : -0.3 * L,
    wheelY: wy.length ? avg(wy) : 0.36,
    wheelR: wr.length ? avg(wr) : 0.36,
    info: `${Object.keys(clusters).length} wheels · ${paintCount ? "paint found" : "paint not found"} · ${heads.length ? "headlights found" : "no headlights named"} · ${layers.length} parts`,
    update(e, theta) {
      if (e !== lastE) {
        layers.forEach((n) => {
          _T.makeTranslation(n.off.x * e, n.off.y * e, n.off.z * e);
          applyNode(n, _T);
        });
        lastE = e;
      }
      wheelNodes.forEach((n) => {
        // Exploded offset in the rig's frame; spin about the wheel's own axle through its centre.
        _T.makeTranslation(n.sx * e * 0.35, e * 0.12, n.sz * e * 0.75);
        _R.makeRotationAxis(n.axis, n.spin * theta);
        _T2.makeTranslation(-n.pivot.x, -n.pivot.y, -n.pivot.z);
        _P.makeTranslation(n.pivot.x, n.pivot.y, n.pivot.z).multiply(_R).multiply(_T2);
        applyNode(n, _T, _P);
        if (n.calipers.length) {
          // Undo the spin for the calipers (they're children of the wheel, but don't rotate).
          _R.makeRotationAxis(n.axis, -n.spin * theta);
          _P.makeTranslation(n.pivot.x, n.pivot.y, n.pivot.z).multiply(_R).multiply(_T2);
          n.calipers.forEach((c) => {
            c.node.matrixAutoUpdate = false;
            c.node.matrix.copy(_P).multiply(c.base);
            c.node.matrixWorldNeedsUpdate = true;
          });
        }
      });
    },
    dispose() {
      shells.forEach((g) => g.removeFromParent());
    },
  };
}

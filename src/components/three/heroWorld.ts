/**
 * Homepage hero 3D world: a dark automotive studio and one persistent car,
 * driven by React Three Fiber (HeroCanvas owns the renderer, canvas, resize
 * and frame loop; this module owns the scene).
 *
 * - Intro (timed, once the car is ready): the studio lights rise from black and
 *   a light pass draws the body lines, the headlights ignite, the camera orbits
 *   from the front three-quarter to the side, the car drives in and brakes to a
 *   stop, and the camera settles into the hero composition beside the headline.
 * - Scroll story (scrubs both ways): Overview → Exterior design → Performance
 *   (a real drive through a lane change) → Technology (callouts) → Interior →
 *   Explore, where the visitor takes the camera (drag, views, zoom).
 *
 * Motion is physical: the car follows a path; wheel spin is the distance
 * travelled divided by the wheel radius; front-wheel steer comes from the path's
 * curvature (bicycle model); the body squats, dives and rolls on a damped
 * spring from the real acceleration and cornering; the wheels stay planted.
 * Choreography numbers live in ./choreography (pure, unit-tested).
 */
import * as THREE from "three";
import { HERO_EXPLORE, heroModel, type CarAnchor } from "@/config/hero";
import { arcLength, clamp01, introPose, KEYS, mixPose, pathPose, pitchFor, rollFor, scrollPose, smooth, spinFor, steerFor, type Vec3 } from "./choreography";
import { makeGLBRig } from "./glbRig";
import type { BodyMotion, Rig } from "./rig";

/** Legacy light intensities → physical units (r155+). */
const LIGHT = Math.PI;
/** Studio exposure once the lights are fully up. */
const EXPOSURE = 1.05;
const LAST = KEYS.length - 1;

export type HeroWorldState = { cap: number; progress: number };
export type ExploreView = "front" | "threeQuarter" | "side" | "rear";
/** The visitor's camera in the Explore chapter. Angles in radians; zoom is a distance factor. */
export type ExploreApi = {
  rotate: (dAzimuth: number, dElevation: number) => void;
  zoom: (factor: number) => void;
  view: (view: ExploreView) => void;
  reset: () => void;
};

export type HeroWorldOptions = {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  /** Overlay <svg> for the Technology chapter's leader-line callouts. */
  calloutSvg: SVGSVGElement | null;
  /** Feature callouts: label and anchor on the car (see heroModel.features). */
  features: { label: string; at: CarAnchor }[];
  /** Colour the studio fades into at distance (matches the hero backdrop). */
  fogHex: string;
  getProgress: () => number;
  onState: (state: HeroWorldState) => void;
  /** Element whose --mx / --my custom properties follow the smoothed pointer (background parallax). */
  stageEl: HTMLElement | null;
  /** Homepage intro text; in the hero composition the car is framed in the space to its right. */
  introEl: HTMLElement | null;
};

export type HeroWorld = {
  /** Start the intro once the car is in place. */
  start: () => void;
  /** Put a real car (glTF scene) on stage. Returns a one-line diagnostic. */
  setModel: (root: THREE.Object3D) => string;
  resize: (width: number, height: number, dpr: number) => void;
  frame: (dt: number) => void;
  explore: ExploreApi;
  dispose: () => void;
};

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

/** Critically-ish damped spring (ζ ≈ 0.6): the body overshoots a little and settles, like a real suspension. */
function spring(state: { x: number; v: number }, target: number, dt: number, k = 70, c = 10) {
  state.v += (k * (target - state.x) - c * state.v) * dt;
  state.x += state.v * dt;
  return state.x;
}

export function createHeroWorld(o: HeroWorldOptions): HeroWorld {
  const { renderer, scene, camera } = o;
  const disposables: { dispose: () => void }[] = [];
  const track = <T extends { dispose: () => void }>(x: T) => {
    disposables.push(x);
    return x;
  };

  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.shadowMap.autoUpdate = false;
  renderer.setClearColor(0x000000, 0);
  scene.background = null;
  const fogColor = new THREE.Color(o.fogHex);
  scene.fog = new THREE.Fog(fogColor, 14, 46);
  camera.fov = 30;
  camera.near = 0.05;
  camera.far = 200;
  camera.updateProjectionMatrix();

  const root = new THREE.Group();
  scene.add(root);

  /* ── Studio reflections: a dark room lit by overhead strips, side softboxes and a horizon line ── */
  {
    const env = new THREE.Scene();
    const solid = (r: number, g: number, b: number, side: THREE.Side = THREE.FrontSide) => new THREE.MeshBasicMaterial({ color: new THREE.Color(r, g, b), side });
    const room = new THREE.Mesh(new THREE.BoxGeometry(40, 16, 40), solid(0.03, 0.036, 0.05, THREE.BackSide));
    room.position.y = 6;
    env.add(room);
    const fl = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), solid(0.015, 0.018, 0.026));
    fl.rotation.x = -Math.PI / 2;
    fl.position.y = -0.9;
    env.add(fl);
    const panel = (w: number, h: number, c: number, pos: Vec3, rot: Vec3, tint: Vec3 = [1, 1, 1.08]) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), solid(c * tint[0], c * tint[1], c * tint[2], THREE.DoubleSide));
      m.position.set(...pos);
      m.rotation.set(...rot);
      env.add(m);
    };
    [-3.2, 0, 3.2].forEach((z) => panel(26, 0.8, 9, [0, 13, z], [Math.PI / 2, 0, 0]));
    panel(14, 3, 3.4, [0, 4.5, -19], [0, 0, 0], [0.92, 0.98, 1.15]);
    panel(14, 3, 3.8, [0, 4.5, 19], [0, Math.PI, 0], [0.92, 0.98, 1.15]);
    panel(30, 0.22, 2.4, [0, 1.3, -19.5], [0, 0, 0]);
    panel(30, 0.22, 2.4, [0, 1.3, 19.5], [0, Math.PI, 0]);
    panel(6, 4, 1.4, [19, 4, 0], [0, -Math.PI / 2, 0]);
    panel(6, 4, 1.1, [-19, 4, 0], [0, Math.PI / 2, 0]);
    const pm = new THREE.PMREMGenerator(renderer);
    const rt = pm.fromScene(env, 0.02);
    scene.environment = rt.texture;
    track(rt);
    pm.dispose();
    env.traverse((x) => {
      const m = x as THREE.Mesh;
      if (m.isMesh) {
        m.geometry.dispose();
        (m.material as THREE.Material).dispose();
      }
    });
  }

  /* ── Lights (they follow the car, so the shadow camera always frames it) ── */
  const hemi = new THREE.HemisphereLight(0xa9bddf, 0x07080b, 0.35 * LIGHT);
  root.add(hemi);
  const key = new THREE.DirectionalLight(0xffffff, 1.5 * LIGHT);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6, near: 1, far: 30 });
  key.shadow.bias = -0.0004;
  key.shadow.radius = 4;
  const rimL = new THREE.DirectionalLight(0x7f9fff, 1.5 * LIGHT);
  const rimR = new THREE.DirectionalLight(0x9fb8ff, 0.9 * LIGHT);
  const fill = new THREE.DirectionalLight(0xffffff, 0.3 * LIGHT);
  const lightRig: [THREE.DirectionalLight, Vec3, number][] = [
    [key, [2.5, 10, 4], 1.5],
    [rimL, [-6, 3.5, -5], 1.5],
    [rimR, [-5, 2.5, 6], 0.9],
    [fill, [6, 2, 2], 0.3],
  ];
  lightRig.forEach(([l]) => {
    root.add(l);
    root.add(l.target);
  });
  const sweepLight = new THREE.PointLight(0xfff3e6, 0, 7, 2);
  root.add(sweepLight);

  /* ── Wet studio floor: dark base, soft shadows, a blurred mirror pass on top ── */
  // Dark, slightly glossy: it shows the headlight pools; the mirror pass on top supplies the wet reflections.
  const floorBase = new THREE.Mesh(track(new THREE.PlaneGeometry(400, 400)), track(new THREE.MeshStandardMaterial({ color: 0x05070b, roughness: 0.62, metalness: 0, envMapIntensity: 0.06 })));
  floorBase.rotation.x = -Math.PI / 2;
  root.add(floorBase);
  const shadowFloor = new THREE.Mesh(track(new THREE.PlaneGeometry(400, 400)), track(new THREE.ShadowMaterial({ opacity: 0.55 })));
  shadowFloor.rotation.x = -Math.PI / 2;
  shadowFloor.position.y = 0.001;
  shadowFloor.receiveShadow = true;
  root.add(shadowFloor);

  const reflRT = track(new THREE.WebGLRenderTarget(2, 2, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, type: THREE.HalfFloatType }));
  const mirrorCam = new THREE.PerspectiveCamera();
  const texMat = new THREE.Matrix4();
  const mirrorCenter = new THREE.Vector2();
  const mirrorMat = track(
    new THREE.ShaderMaterial({
      uniforms: {
        tRefl: { value: reflRT.texture },
        textureMatrix: { value: texMat },
        strength: { value: 0.42 },
        texel: { value: new THREE.Vector2(0.002, 0.002) },
        center: { value: mirrorCenter },
      },
      vertexShader: /* glsl */ `uniform mat4 textureMatrix; varying vec4 vUv; varying vec3 vW;
      void main(){ vec4 w = modelMatrix * vec4(position,1.0); vW = w.xyz; vUv = textureMatrix * w; gl_Position = projectionMatrix * viewMatrix * w; }`,
      fragmentShader: /* glsl */ `uniform sampler2D tRefl; uniform float strength; uniform vec2 texel; uniform vec2 center; varying vec4 vUv; varying vec3 vW;
      void main(){
        vec2 uv = vUv.xy / vUv.w; vec4 acc = vec4(0.0); float tw = 0.0;
        for(int i=-2;i<=2;i++){ for(int j=-2;j<=2;j++){
          float wgt = 1.0/(1.0+float(i*i+j*j));
          vec4 s = texture2D(tRefl, uv + vec2(float(i),float(j))*texel*1.6);
          acc += vec4(s.rgb*s.a, s.a)*wgt; tw += wgt; } }
        acc /= tw;
        vec3 col = acc.a > 0.001 ? acc.rgb/acc.a : vec3(0.0);
        float fade = 1.0 - smoothstep(3.0, 16.0, length(vW.xz - center));
        gl_FragColor = vec4(col, acc.a * strength * fade);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
      transparent: true,
      depthWrite: false,
    }),
  );
  const mirrorFloor = new THREE.Mesh(track(new THREE.PlaneGeometry(400, 400)), mirrorMat);
  mirrorFloor.rotation.x = -Math.PI / 2;
  mirrorFloor.position.y = 0.002;
  mirrorFloor.renderOrder = 2;
  root.add(mirrorFloor);

  /* ── Studio set: overhead light bars with haze shafts, glowing streaks along the road ── */
  const setG = new THREE.Group();
  root.add(setG);
  // Ceiling light tubes: thin and bright, so they read as lights (and streak across the wet floor).
  const barMat = track(new THREE.MeshBasicMaterial({ color: new THREE.Color(7, 7.6, 9) }));
  const barGeo = track(new THREE.BoxGeometry(7, 0.035, 0.07));
  const shaftMat = track(
    new THREE.ShaderMaterial({
      uniforms: { uCol: { value: new THREE.Color(0.55, 0.68, 1.0) }, uLevel: { value: 1 } },
      vertexShader: /* glsl */ `varying float vY; varying vec3 vN; varying vec3 vV; varying float vD;
        void main(){ vY = uv.y; vec4 mv = modelViewMatrix * vec4(position,1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); vD = -mv.z; gl_Position = projectionMatrix * mv; }`,
      fragmentShader: /* glsl */ `uniform vec3 uCol; uniform float uLevel; varying float vY; varying vec3 vN; varying vec3 vV; varying float vD;
        void main(){ float edge = pow(abs(dot(normalize(vN), normalize(vV))), 1.5); float a = vY * vY * 0.075 * edge * uLevel * (1.0 - smoothstep(16.0, 40.0, vD)); gl_FragColor = vec4(uCol * a, a); }`,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    }),
  );
  const shaftGeo = track(new THREE.CylinderGeometry(0.35, 2.4, 7, 32, 1, true));
  for (let x = -36; x <= 64; x += 9) {
    for (const z of [-3.4, 3.4]) {
      const bar = new THREE.Mesh(barGeo, barMat);
      bar.position.set(x, 8.6, z);
      setG.add(bar);
    }
    if ((x / 9) % 2 === 0) {
      const shaft = new THREE.Mesh(shaftGeo, shaftMat);
      shaft.position.set(x, 3.6, 3.4);
      setG.add(shaft);
    }
  }
  const backGlow = new THREE.Sprite(
    track(new THREE.SpriteMaterial({ map: track(radialTex([[0, "rgba(110,150,255,0.55)"], [0.5, "rgba(70,110,220,0.12)"], [1, "rgba(40,60,140,0)"]])), transparent: true, depthWrite: false, fog: false, blending: THREE.AdditiveBlending })),
  );
  backGlow.position.set(14, 4, -26);
  backGlow.scale.set(60, 24, 1);
  setG.add(backGlow);

  // Streaks: road edges that follow the lane change, plus sweeping arcs round the start and end bays.
  const streakG = new THREE.Group();
  root.add(streakG);
  const streakMat = track(new THREE.MeshBasicMaterial({ color: new THREE.Color(0.55, 0.7, 1.25), transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false }));
  const streak = (pts: THREE.Vector3[], r = 0.008) => streakG.add(new THREE.Mesh(track(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), pts.length * 4, r, 6, false)), streakMat));
  for (const off of [-6.2, 6.2]) {
    const pts: THREE.Vector3[] = [];
    for (let s = -30; s <= 60; s += 1.5) pts.push(new THREE.Vector3(s, 0.006, pathPose(s).z + off));
    streak(pts);
  }
  const arc = (cx: number, cz: number, r: number, a0: number, a1: number) => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 48; i++) {
      const a = a0 + ((a1 - a0) * i) / 48;
      pts.push(new THREE.Vector3(cx + Math.cos(a) * r, 0.006, cz + Math.sin(a) * r));
    }
    streak(pts, 0.01);
  };
  arc(0, 0, 8.5, -1.2, 0.3);
  arc(0, 0, 10.5, 2.2, 3.6);
  arc(26, -3.2, 8.5, -0.6, 0.9);
  arc(26, -3.2, 11, 2.5, 4.1);

  /* ── The car (positioned on the path) and its lights ── */
  const car = new THREE.Group();
  root.add(car);
  const fxG = new THREE.Group();
  car.add(fxG);
  const glowTex = track(radialTex([[0, "rgba(255,255,255,1)"], [0.18, "rgba(225,238,255,0.8)"], [0.5, "rgba(175,205,255,0.2)"], [1, "rgba(160,190,255,0)"]]));
  const glows = [0, 1].map(() => {
    const sp = new THREE.Sprite(track(new THREE.SpriteMaterial({ map: glowTex, transparent: true, depthWrite: false, opacity: 0, blending: THREE.AdditiveBlending })));
    fxG.add(sp);
    return sp;
  });
  const headSpots = [0, 1].map(() => {
    const sl = new THREE.SpotLight(0xe4eeff, 0, 16, 0.38, 0.65, 1.5);
    fxG.add(sl);
    fxG.add(sl.target);
    return sl;
  });
  const tailGlow = new THREE.Sprite(
    track(new THREE.SpriteMaterial({ map: track(radialTex([[0, "rgba(255,40,60,0.9)"], [0.4, "rgba(255,30,50,0.25)"], [1, "rgba(255,30,50,0)"]])), transparent: true, depthWrite: false, opacity: 0.3, blending: THREE.AdditiveBlending })),
  );
  fxG.add(tailGlow);
  const blob = new THREE.Mesh(
    track(new THREE.PlaneGeometry(1, 1)),
    track(new THREE.MeshBasicMaterial({ map: track(radialTex([[0, "rgba(0,0,0,0.75)"], [0.45, "rgba(0,0,0,0.35)"], [1, "rgba(0,0,0,0)"]])), transparent: true, depthWrite: false })),
  );
  blob.rotation.x = -Math.PI / 2;
  blob.position.y = 0.004;
  car.add(blob);

  const p = heroModel.paint;
  const paint = track(
    new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(p.hex),
      metalness: p.metalness,
      roughness: p.roughness,
      clearcoat: 1,
      clearcoatRoughness: 0.04,
      iridescence: p.iridescence,
      iridescenceIOR: 1.3,
      envMapIntensity: 1.35,
      side: THREE.DoubleSide,
    }),
  );

  let rig: Rig | null = null;
  const setRig = (r: Rig) => {
    rig = r;
    car.add(r.root);
    r.headPos.forEach((hp, i) => {
      glows[i].position.set(hp.x + 0.05, hp.y, hp.z);
      glows[i].scale.set(r.W * 0.45, r.W * 0.22, 1);
      headSpots[i].position.copy(hp);
      headSpots[i].target.position.set(hp.x + 7, 0, hp.z * 1.6);
    });
    tailGlow.position.set(r.tailPos.x - 0.08, r.tailPos.y, r.tailPos.z);
    tailGlow.scale.set(r.W * 1.2, 0.3, 1);
    blob.scale.set(r.L * 1.25, r.W * 1.5, 1);
    renderer.shadowMap.needsUpdate = true;
  };

  /** Compile every shader up front (screen + mirror pass) so nothing stalls on first view. */
  const warmShaders = () => {
    const done = () => undefined;
    renderer.compileAsync(scene, camera).then(done, done);
    const prev = renderer.getRenderTarget();
    renderer.setRenderTarget(reflRT);
    renderer.compileAsync(scene, mirrorCam).then(done, done);
    renderer.setRenderTarget(prev);
  };

  /* ── Technology callouts (SVG overlay with leader lines) ── */
  type Callout = { at: CarAnchor; label: string; g: SVGGElement; line: SVGPathElement; ring: SVGCircleElement; dot: SVGCircleElement; num: SVGTextElement; txt: SVGTextElement };
  const SVGNS = "http://www.w3.org/2000/svg";
  const mk = <K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string>) => {
    const e = document.createElementNS(SVGNS, tag);
    Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v));
    return e;
  };
  const callouts: Callout[] = [];
  if (o.calloutSvg) {
    o.calloutSvg.replaceChildren();
    o.features.forEach((ft, i) => {
      const g = mk("g", {});
      const line = mk("path", { fill: "none", stroke: "rgba(243,239,231,.55)", "stroke-width": "1" });
      const ring = mk("circle", { r: "9", fill: "none", stroke: "#c8b07c", "stroke-opacity": ".7", "stroke-width": "1" });
      const dot = mk("circle", { r: "3.2", fill: "#c8b07c" });
      const num = mk("text", { class: "hero-callout-num" });
      const txt = mk("text", { class: "hero-callout-text" });
      num.textContent = String(i + 1).padStart(2, "0");
      txt.textContent = ft.label;
      g.append(line, ring, dot, num, txt);
      o.calloutSvg!.appendChild(g);
      callouts.push({ at: ft.at, label: ft.label, g, line, ring, dot, num, txt });
    });
  }
  const _pv = new THREE.Vector3();
  let viewW = 1, viewH = 1;
  const updateCallouts = (alpha: number) => {
    if (!o.calloutSvg) return;
    o.calloutSvg.style.opacity = alpha.toFixed(3);
    if (alpha < 0.01 || !rig) return;
    // Phones and any portrait screen: labels stack above the car (no room beside it).
    if (viewW < 640 || viewW < viewH) return narrowCallouts();
    callouts.forEach((c, i) => {
      _pv.set((c.at[0] * rig!.L) / 2, c.at[1] * rig!.H, (c.at[2] * rig!.W) / 2);
      car.localToWorld(_pv);
      _pv.project(camera);
      if (_pv.z > 1) {
        c.g.style.display = "none";
        return;
      }
      c.g.style.display = "";
      const ax = ((_pv.x + 1) / 2) * viewW, ay = ((1 - _pv.y) / 2) * viewH, dir = ax < viewW / 2 ? -1 : 1;
      const maxY = dir < 0 ? viewH * 0.58 : viewH - 110;
      const ly = Math.max(90, Math.min(maxY, ay + (ay < viewH * 0.5 ? -1 : 1) * (46 + (i % 3) * 24)));
      const tw = c.label.length * 6.6 + 34;
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

  /**
   * Phones: no room for labels beside the car, so they stack in rows in the open space above
   * it, each against the nearer screen edge, with the leader rising straight to its row. The
   * label nearest its edge takes the lowest row, so leaders don't cross other labels' lines.
   */
  const textW = new Map<Callout, number>();
  const narrowCallouts = () => {
    const pts: { c: Callout; ax: number; ay: number; reach: number }[] = [];
    callouts.forEach((c) => {
      _pv.set((c.at[0] * rig!.L) / 2, c.at[1] * rig!.H, (c.at[2] * rig!.W) / 2);
      car.localToWorld(_pv);
      _pv.project(camera);
      c.g.style.display = _pv.z > 1 ? "none" : "";
      if (_pv.z > 1) return;
      const ax = ((_pv.x + 1) / 2) * viewW;
      pts.push({ c, ax, ay: ((1 - _pv.y) / 2) * viewH, reach: Math.min(ax, viewW - ax) });
    });
    if (!pts.length) return;
    const ROW = 28, M = 16;
    pts.sort((p, q) => p.reach - q.reach);
    const lowest = Math.max(40 + (pts.length - 1) * ROW, Math.min(...pts.map((p) => p.ay)) - 36);
    const place = (p: { c: Callout; ax: number; ay: number }, ly: number) => {
      const { c, ax, ay } = p;
      // Real text width (letter-spaced caps), measured once the font is in.
      let w = textW.get(c);
      if (!w) {
        w = c.txt.getComputedTextLength();
        if (w > 0 && document.fonts.status === "loaded") textW.set(c, w);
      }
      const tw = (w || c.label.length * 9) + 30;
      const right = ax > viewW / 2;
      const left = right ? viewW - M - tw : M;
      const end = right ? viewW - M : M;
      c.line.setAttribute("d", `M${ax.toFixed(1)} ${ay.toFixed(1)}L${ax.toFixed(1)} ${ly.toFixed(1)}L${end.toFixed(1)} ${ly.toFixed(1)}`);
      c.ring.setAttribute("cx", ax.toFixed(1));
      c.ring.setAttribute("cy", ay.toFixed(1));
      c.dot.setAttribute("cx", ax.toFixed(1));
      c.dot.setAttribute("cy", ay.toFixed(1));
      c.num.setAttribute("x", (left + 2).toFixed(1));
      c.num.setAttribute("y", (ly - 8).toFixed(1));
      c.txt.setAttribute("x", (left + 28).toFixed(1));
      c.txt.setAttribute("y", (ly - 8).toFixed(1));
    };
    pts.forEach((p, i) => place(p, lowest - i * ROW));
  };

  /* ── Pointer parallax ── */
  const mouse = { x: 0, y: 0, sx: 0, sy: 0 };
  const onMouse = (e: MouseEvent) => {
    mouse.x = e.clientX / window.innerWidth - 0.5;
    mouse.y = e.clientY / window.innerHeight - 0.5;
  };
  window.addEventListener("mousemove", onMouse, { passive: true });

  /* ── Explore: the visitor's orbit around the car (eased towards targets) ── */
  const ex = { az: 0, el: 0, zoom: 1, tAz: 0, tEl: 0, tZoom: 1 };
  const exploreBase = (() => {
    const c = KEYS[LAST].cam;
    return Math.atan2(c[2], c[0]);
  })();
  const VIEW_AZ: Record<ExploreView, number> = { front: 0, threeQuarter: 0.65, side: Math.PI / 2, rear: Math.PI };
  const explore: ExploreApi = {
    rotate: (dAz, dEl) => {
      ex.tAz += dAz;
      ex.tEl = THREE.MathUtils.clamp(ex.tEl + dEl, -0.25, 0.7);
    },
    zoom: (f) => {
      ex.tZoom = THREE.MathUtils.clamp(ex.tZoom * f, 0.55, 1.6);
    },
    view: (v) => {
      // Shortest way round from where the camera is now.
      let d = VIEW_AZ[v] - exploreBase - ex.tAz;
      d = Math.atan2(Math.sin(d), Math.cos(d));
      ex.tAz += d;
      ex.tEl = 0.05;
      ex.tZoom = 1;
    },
    reset: () => {
      ex.tAz = 0;
      ex.tEl = 0;
      ex.tZoom = 1;
    },
  };
  /** Apply the explore orbit to a car-frame camera position around its target. */
  const _sph = new THREE.Spherical(), _off = new THREE.Vector3();
  const exploreCam = (cam: THREE.Vector3, tgt: THREE.Vector3) => {
    if (Math.abs(ex.az) < 1e-4 && Math.abs(ex.el) < 1e-4 && Math.abs(ex.zoom - 1) < 1e-4) return;
    _off.copy(cam).sub(tgt);
    _sph.setFromVector3(_off);
    // ex.az is measured like atan2(z, x) (from the nose towards the right side); Spherical.theta runs the other way.
    _sph.theta -= ex.az;
    _sph.phi = THREE.MathUtils.clamp(_sph.phi - ex.el, 0.2, 1.52);
    _sph.radius *= ex.zoom;
    cam.copy(tgt).add(_off.setFromSpherical(_sph));
  };

  /* ── Framing beside the intro text: film offset + zoom fitted from the car's projected box ── */
  const fitCam = new THREE.PerspectiveCamera(30, 1, 0.1, 200);
  const _corner = new THREE.Vector3();
  const fitBeside = (camRel: THREE.Vector3, tgtRel: THREE.Vector3) => {
    if (!rig) return { offset: 0, zoom: 1, down: 0 };
    const aspect = viewW / viewH, tanHalf = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    fitCam.aspect = aspect;
    fitCam.position.copy(camRel);
    fitCam.lookAt(tgtRel);
    fitCam.updateMatrixWorld();
    fitCam.updateProjectionMatrix();
    let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    for (const cx of [-0.5, 0.5]) for (const cy of [0, 1]) for (const cz of [-0.5, 0.5]) {
      _corner.set(cx * rig.L, cy * rig.H, cz * rig.W).project(fitCam);
      x0 = Math.min(x0, _corner.x);
      x1 = Math.max(x1, _corner.x);
      y0 = Math.min(y0, _corner.y);
      y1 = Math.max(y1, _corner.y);
    }
    const text = o.introEl?.getBoundingClientRect();
    const textRight = text ? text.right / viewW : 0;
    // Landscape: the car sits right of the headline. Portrait (tablets and phones held upright): the
    // headline spans the top, so the car uses the full width and sits in the space below the text.
    const portrait = aspect < 1;
    const lo = portrait ? 2 * 0.03 - 1 : 2 * Math.min(0.6, textRight + 0.03) - 1, hi = 2 * 0.97 - 1;
    const zoom = Math.max(portrait ? 0.25 : 0.55, Math.min(1, (hi - lo) / (x1 - x0)));
    let down = 0, z = zoom;
    if (portrait && text) {
      // Fit the car into the space between the text's bottom and the progress bar (px, in the
      // canvas): small enough for its height too, then centred there.
      const top = renderer.domElement.getBoundingClientRect().top;
      const a = Math.min(viewH * 0.8, text.bottom - top + 12), b = viewH - 64;
      z = Math.max(0.2, Math.min(zoom, (0.94 * 2 * (b - a)) / viewH / (y1 - y0)));
      const want = 1 - (a + b) / viewH; // NDC y of that centre
      down = ((((y0 + y1) / 2) * z - want) / 2) * viewH;
    }
    const shiftZ = (lo + hi) / 2 - ((x0 + x1) / 2) * z;
    return { offset: (shiftZ * 35 * tanHalf * aspect) / z, zoom: z, down };
  };
  /**
   * Portrait screens see less horizontally (the field of view is vertical), so the camera pulls
   * back in proportion: the car keeps the share of the width it has on a landscape screen.
   * 1 for every screen at least 1.3:1 (desktops, laptops, landscape tablets), so those are unchanged.
   */
  const narrowZoom = () => Math.min(1, viewW / viewH / 1.3);

  /* ── Frame ── */
  let clockT = 0, cur = 0, introClock = 0;
  /** Clock time the intro started (car in place), or null while loading. */
  let startT: number | null = null;
  let lastState: HeroWorldState = { cap: -2, progress: -1 };
  const camRel = new THREE.Vector3(), tgtRel = new THREE.Vector3(), camWant = new THREE.Vector3(), tgtWant = new THREE.Vector3();
  let camInit = false;
  /** Portrait only: px the car is raised in the frame during the story (eased). */
  let lift = 0;
  // Vehicle dynamics state.
  let lastDist = 0, speed = 0, lastSpeed = 0, accel = 0, dynInit = false;
  const pitchS = { x: 0, v: 0 }, rollS = { x: 0, v: 0 }, heaveS = { x: 0, v: 0 };
  const body: BodyMotion = { heave: 0, pitch: 0, roll: 0 };
  const _cos = { c: 1, s: 0 };
  const toWorld = (v: THREE.Vector3, out: THREE.Vector3) =>
    out.set(car.position.x + _cos.c * v.x + _cos.s * v.z, v.y, car.position.z - _cos.s * v.x + _cos.c * v.z);
  const camWorld = new THREE.Vector3(), tgtWorld = new THREE.Vector3();

  const frame = (rawDt: number) => {
    const dt = Math.min(rawDt, 0.05);
    clockT += dt;
    cur += (o.getProgress() - cur) * Math.min(1, dt * 3.0);
    const tKey = cur * LAST;
    // The intro plays on its own clock; once the visitor scrolls it hurries to its end while the scroll pose takes over.
    if (startT !== null) introClock += dt * (cur > 0.002 ? 5 : 1);
    const sc = scrollPose(tKey);
    const pose = mixPose(introPose(introClock), sc, smooth(clamp01(tKey / 0.6)));
    const H = rig ? rig.H : 1.3;

    // Car on the path.
    const pp = pathPose(pose.s);
    car.position.set(pp.x, 0, pp.z);
    car.rotation.y = pp.yaw;
    _cos.c = Math.cos(pp.yaw);
    _cos.s = Math.sin(pp.yaw);

    // Dynamics from the distance actually travelled.
    const dist = arcLength(pose.s);
    if (!dynInit) {
      lastDist = dist;
      dynInit = true;
    }
    speed += ((dist - lastDist) / dt - speed) * Math.min(1, dt * 6);
    accel += ((speed - lastSpeed) / dt - accel) * Math.min(1, dt * 4);
    lastDist = dist;
    lastSpeed = speed;
    body.pitch = spring(pitchS, pitchFor(accel), dt);
    body.roll = spring(rollS, rollFor(speed, pp.curvature), dt);
    // Road texture: tiny bumps tied to the distance (so they scrub with the scroll), only while moving.
    body.heave = spring(heaveS, Math.sin(dist * 2.3) * Math.sin(dist * 0.9) * 0.004 * Math.min(1, Math.abs(speed) / 4), dt, 120, 14);
    if (rig) rig.update(spinFor(dist, rig.wheelR), steerFor(rig.fx - rig.rx, pp.curvature), body);

    // Camera, in the car's frame (so it tracks the moving car without lag), then into the world.
    camWant.set(...pose.cam);
    tgtWant.set(pose.tgt[0], pose.tgt[1] * H, pose.tgt[2]);
    // Explore: ease the visitor's orbit; it unwinds whenever the story is elsewhere.
    const exploring = sc.cap === HERO_EXPLORE && tKey > LAST - 0.35;
    if (!exploring) explore.reset();
    const ease = Math.min(1, dt * 5);
    ex.az += (ex.tAz - ex.az) * ease;
    ex.el += (ex.tEl - ex.el) * ease;
    ex.zoom += (ex.tZoom - ex.zoom) * ease;
    exploreCam(camWant, tgtWant);
    const since = startT === null ? -1 : clockT - startT;
    const glide = since < 0 ? 1 : Math.min(1, dt * Math.min(4, 1.2 + since * 1.5));
    if (!camInit || since < 0) {
      camRel.copy(camWant);
      tgtRel.copy(tgtWant);
      camInit = true;
    } else {
      camRel.lerp(camWant, glide);
      tgtRel.lerp(tgtWant, glide);
    }
    mouse.sx += (mouse.x - mouse.sx) * dt * 2;
    mouse.sy += (mouse.y - mouse.sy) * dt * 2;
    if (o.stageEl) {
      o.stageEl.style.setProperty("--mx", mouse.sx.toFixed(3));
      o.stageEl.style.setProperty("--my", mouse.sy.toFixed(3));
    }
    toWorld(camRel, camWorld);
    toWorld(tgtRel, tgtWorld);
    camWorld.x += Math.sin(clockT * 0.22) * 0.08;
    camWorld.y += Math.sin(clockT * 0.3) * 0.04 - mouse.sy * 0.25;
    camWorld.z += Math.cos(clockT * 0.19) * 0.08 + mouse.sx * 0.4;
    camWorld.y = Math.max(0.12, camWorld.y);
    camera.position.copy(camWorld);
    camera.lookAt(tgtWorld);
    // Hero composition: the car sits in the space right of the headline, then centres as the story starts.
    const beside = 1 - smooth(clamp01(tKey / 0.8));
    const base = narrowZoom();
    // Portrait: during the story the captions (and Explore's controls) take the lower part of the
    // screen, so the car rides higher in the frame; eased so chapter changes glide.
    const liftWant = viewW < viewH ? -(exploring ? 0.2 : 0.1) * viewH * (1 - beside) : 0;
    lift += (liftWant - lift) * Math.min(1, dt * 3);
    let down = lift;
    if (beside > 0.001) {
      const fit = fitBeside(camRel, tgtRel);
      camera.filmOffset = -fit.offset * beside;
      camera.zoom = base + (fit.zoom - base) * beside;
      down += fit.down * beside;
    } else {
      camera.filmOffset = 0;
      camera.zoom = base;
    }
    // Vertical placement (portrait intro only): shift the rendered view, so perspective is untouched.
    if (Math.abs(down) > 0.5) camera.setViewOffset(viewW, viewH, 0, -down, viewW, viewH);
    else if (camera.view) camera.clearViewOffset();
    camera.updateProjectionMatrix();

    // Studio lights rise from black (reveal); rims come first so the silhouette appears before the body.
    const lv = pose.lights;
    renderer.toneMappingExposure = EXPOSURE * (0.12 + 0.88 * lv);
    lightRig.forEach(([l, off, base]) => {
      l.position.set(car.position.x + off[0], off[1], car.position.z + off[2]);
      l.target.position.copy(car.position);
      l.intensity = base * LIGHT * (l === rimL || l === rimR ? 0.45 + 0.55 * lv : lv);
    });
    hemi.intensity = (0.1 + 0.25 * lv) * LIGHT;
    (shaftMat.uniforms.uLevel as THREE.IUniform<number>).value = 0.3 + 0.7 * lv;
    streakMat.opacity = 0.15 + 0.45 * lv;
    scene.environmentRotation.y = Math.sin(clockT * 0.07) * 0.3;
    // A light pass draws the body lines during the reveal.
    const pass = since < 0 ? 0 : clamp01((since - 0.3) / 2.1);
    const passOn = pass > 0 && pass < 1 ? Math.sin(pass * Math.PI) : 0;
    sweepLight.intensity = passOn * 28 * LIGHT;
    _pv.set(-(rig ? rig.L : 4.9) / 2 - 1 + pass * ((rig ? rig.L : 4.9) + 2), 2.0, 2.4);
    toWorld(_pv, sweepLight.position);

    // Headlights ignite; brake lights brighten whenever the car slows.
    const head = pose.head;
    rig?.headMats.forEach((m) => (m.emissiveIntensity = head * rig!.headGain));
    glows.forEach((g) => (g.material.opacity = head * 0.85));
    headSpots.forEach((l) => (l.intensity = head * 4.5 * LIGHT));
    const braking = clamp01(-accel / 2.5);
    rig?.tailMats.forEach((m) => (m.emissiveIntensity = 0.6 + braking * 3));
    tailGlow.material.opacity = 0.28 + braking * 0.6;

    mirrorCenter.set(car.position.x, car.position.z);
    updateCallouts(clamp01(1 - Math.abs(tKey - 6) * 2.4));

    const cap = sc.cap;
    const state: HeroWorldState = { cap, progress: cur };
    if (state.cap !== lastState.cap || Math.abs(state.progress - lastState.progress) > 0.002) {
      lastState = state;
      o.onState(state);
    }

    // Mirror pass for the wet floor, then the main render.
    mirrorCam.fov = camera.fov;
    mirrorCam.filmGauge = camera.filmGauge;
    mirrorCam.filmOffset = camera.filmOffset;
    mirrorCam.zoom = camera.zoom;
    mirrorCam.aspect = camera.aspect;
    mirrorCam.near = camera.near;
    mirrorCam.far = camera.far;
    // The mirror camera is the main camera reflected in the floor, so it takes the same view offset.
    if (camera.view?.enabled) mirrorCam.setViewOffset(viewW, viewH, camera.view.offsetX, camera.view.offsetY, viewW, viewH);
    else if (mirrorCam.view) mirrorCam.clearViewOffset();
    mirrorCam.updateProjectionMatrix();
    mirrorCam.position.set(camera.position.x, -camera.position.y, camera.position.z);
    mirrorCam.up.set(0, -1, 0);
    mirrorCam.lookAt(tgtWorld.x, -tgtWorld.y, tgtWorld.z);
    mirrorCam.updateMatrixWorld();
    texMat.set(0.5, 0, 0, 0.5, 0, 0.5, 0, 0.5, 0, 0, 0.5, 0.5, 0, 0, 0, 1).multiply(mirrorCam.projectionMatrix).multiply(mirrorCam.matrixWorldInverse);
    // Floor layers (and the big background glow, which would wash the floor out) stay out of the reflection.
    mirrorFloor.visible = floorBase.visible = shadowFloor.visible = blob.visible = streakG.visible = backGlow.visible = false;
    renderer.setRenderTarget(reflRT);
    renderer.clear();
    renderer.render(scene, mirrorCam);
    renderer.setRenderTarget(null);
    mirrorFloor.visible = floorBase.visible = shadowFloor.visible = blob.visible = streakG.visible = backGlow.visible = true;
    renderer.shadowMap.needsUpdate = true;
    renderer.render(scene, camera);
  };

  return {
    start: () => {
      startT ??= clockT;
    },
    setModel: (src) => {
      if (rig) {
        car.remove(rig.root);
        rig.dispose?.();
      }
      const r = makeGLBRig(src, heroModel.paintMaterialPattern, { paint, track });
      setRig(r);
      warmShaders();
      return r.info;
    },
    resize: (w, h, dpr) => {
      viewW = w;
      viewH = h;
      const rw = Math.max(2, Math.floor(w * dpr * 0.65)), rh = Math.max(2, Math.floor(h * dpr * 0.65));
      reflRT.setSize(rw, rh);
      (mirrorMat.uniforms.texel.value as THREE.Vector2).set(1 / rw, 1 / rh);
    },
    frame,
    explore,
    dispose: () => {
      window.removeEventListener("mousemove", onMouse);
      o.stageEl?.style.removeProperty("--mx");
      o.stageEl?.style.removeProperty("--my");
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

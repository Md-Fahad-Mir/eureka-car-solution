/**
 * Turns any car glTF into a rig the hero world can drive: orients and scales it
 * (length along x, nose to +x, 4.9 m long, standing on y = 0), finds the four
 * wheels (named groups first, then wheel-like meshes) and the head/tail lamps,
 * assigns the shared paint, converts transmissive glass, and moves the parts:
 * each wheel spins about its own axle (and the front pair steers about the
 * vertical through its hub) while the body pitches, rolls and heaves on the
 * suspension. Brake calipers inside a wheel are held still.
 */
import * as THREE from "three";
import type { BodyMotion, Rig } from "./rig";

type V3 = THREE.Vector3;
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);


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

export function makeGLBRig(
  src: THREE.Object3D,
  paintPattern: RegExp | null,
  ctx: {
    paint: THREE.MeshPhysicalMaterial;
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
    /** Front wheel (steers). */
    front: boolean;
    /** Wheel centre in the rig's frame (steering pivot). */
    hub: V3;
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
      wheelNodes.push({ ...np, ...spinFrame(np, ctr), front: k[0] === "F", hub: ctr, calipers: calipersOf(n) });
    });
  });
  const avg = (a: number[]) => a.reduce((p, q) => p + q, 0) / a.length;

  // Body: every top-most mesh that isn't (and doesn't hold) a wheel moves on the suspension.
  // A mesh that holds wheels (e.g. an underbody parent node) stays put with them.
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
  const layers: NodePrep[] = [];
  layerSet.forEach((m) => {
    for (let p = m.parent; p; p = p.parent) if (layerSet.has(p as THREE.Mesh)) return;
    layers.push(prep(m));
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

  // Transmissive glass becomes the reference's tinted glass. Transmission renders through a
  // screen-sized buffer that doesn't line up in the mirror pass (blocky streaks in the
  // floor reflection), and it costs an extra pass every frame.
  meshes.forEach((m) =>
    matsOf(m).forEach((mt) => {
      const pm = mt as THREE.MeshPhysicalMaterial;
      if (!pm.isMeshPhysicalMaterial || !(pm.transmission > 0)) return;
      Object.assign(pm, { transmission: 0, transparent: true, opacity: 0.3, depthWrite: false, metalness: 0, roughness: 0.04, clearcoat: 1, envMapIntensity: 1.7 });
      pm.color.set(0x0a0f14);
      pm.needsUpdate = true;
    }),
  );

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

  const casters = meshes.slice();

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

  const last: BodyMotion = { heave: NaN, pitch: NaN, roll: NaN };
  const _B = new THREE.Matrix4(), _M = new THREE.Matrix4();
  const px = rxs.length ? avg(rxs) : -0.3 * L, py = wy.length ? avg(wy) : 0.36;
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
    casters,
    paintMats: [ctx.paint],
    fx: fxs.length ? avg(fxs) : 0.3 * L,
    rx: rxs.length ? avg(rxs) : -0.3 * L,
    wheelY: wy.length ? avg(wy) : 0.36,
    wheelR: wr.length ? avg(wr) : 0.36,
    info: `${Object.keys(clusters).length} wheels · ${paintCount ? "paint found" : "paint not found"} · ${heads.length ? "headlights found" : "no headlights named"} · ${layers.length} parts`,
    update(spin, steer, body) {
      if (body.heave !== last.heave || body.pitch !== last.pitch || body.roll !== last.roll) {
        // Suspension: heave, pitch about the rear axle, roll about the axle line.
        _B.makeTranslation(0, body.heave, 0)
          .multiply(_M.makeTranslation(px, py, 0))
          .multiply(_T.makeRotationZ(body.pitch))
          .multiply(_M.makeTranslation(-px, 0, 0))
          .multiply(_T.makeRotationX(body.roll))
          .multiply(_M.makeTranslation(0, -py, 0));
        layers.forEach((n) => applyNode(n, _B));
        Object.assign(last, body);
      }
      wheelNodes.forEach((n) => {
        // Steer (front pair) about the vertical through the hub, in the rig's frame...
        if (n.front) _T.makeTranslation(n.hub.x, n.hub.y, n.hub.z).multiply(_R.makeRotationY(steer)).multiply(_T2.makeTranslation(-n.hub.x, -n.hub.y, -n.hub.z));
        else _T.identity();
        // ...and spin about the wheel's own axle through its centre, in its own frame.
        _R.makeRotationAxis(n.axis, n.spin * spin);
        _T2.makeTranslation(-n.pivot.x, -n.pivot.y, -n.pivot.z);
        _P.makeTranslation(n.pivot.x, n.pivot.y, n.pivot.z).multiply(_R).multiply(_T2);
        applyNode(n, _T, _P);
        if (n.calipers.length) {
          // Undo the spin for the calipers (they're children of the wheel, but don't rotate).
          _R.makeRotationAxis(n.axis, -n.spin * spin);
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
      root.removeFromParent();
    },
  };
}

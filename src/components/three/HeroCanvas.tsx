"use client";

import { Component, Suspense, useEffect, useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PerformanceMonitor, useGLTF } from "@react-three/drei";
import { heroConfig, heroModel, type CarAnchor } from "@/config/hero";
import { createHeroWorld, type ExploreApi, type HeroWorld, type HeroWorldState } from "./heroWorld";

export type HeroCanvasProps = {
  /** Render loop runs only while the hero is on screen. */
  active: boolean;
  getProgress: () => number;
  onState: (state: HeroWorldState) => void;
  /** The car is on stage and the intro has started. */
  onReady: () => void;
  /** The model couldn't be loaded (the hero falls back to the static poster). */
  onFail: () => void;
  calloutSvgRef: RefObject<SVGSVGElement | null>;
  /** Technology callouts: localised label + anchor on the car. */
  features: { label: string; at: CarAnchor }[];
  /** Background layer that takes the pointer parallax (--mx / --my). */
  stageRef: RefObject<HTMLElement | null>;
  /** The intro text block; in the hero composition the car is framed beside it. */
  introRef: RefObject<HTMLElement | null>;
  /** Filled with the Explore camera controls once the world exists. */
  exploreRef: RefObject<ExploreApi | null>;
  /** Studio fog colour (the hero backdrop). */
  fogHex: string;
};

/**
 * React Three Fiber host for the hero world. Loaded with next/dynamic
 * (ssr: false) on the homepage only, so three.js never ships elsewhere.
 */
export default function HeroCanvas(props: HeroCanvasProps) {
  // Phones: a lower pixel-density cap (their screens are dense and their GPUs share power with everything else).
  const [cap] = useState(() => (window.innerWidth < 768 ? Math.min(heroConfig.maxDpr, heroConfig.phoneMaxDpr) : heroConfig.maxDpr));
  const [dpr, setDpr] = useState<number>(cap);
  return (
    <Canvas
      aria-hidden
      frameloop={props.active ? "always" : "never"}
      dpr={[heroConfig.minDpr, dpr]}
      shadows
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ fov: 30, near: 0.05, far: 200, position: [7.6, 1.5, 6.4] }}
      style={{ position: "absolute", inset: 0 }}
    >
      <PerformanceMonitor
        flipflops={3}
        onDecline={() => setDpr(heroConfig.minDpr)}
        onIncline={() => setDpr(cap)}
        onFallback={() => setDpr(heroConfig.minDpr)}
      />
      <World {...props} />
    </Canvas>
  );
}

function World({ getProgress, onState, onReady, onFail, calloutSvgRef, features, stageRef, introRef, exploreRef, fogHex }: HeroCanvasProps) {
  const { gl, scene, camera, size, viewport } = useThree();
  const world = useRef<HeroWorld | null>(null);
  const [failed, setFailed] = useState(false);
  const callbacks = useRef({ getProgress, onState });
  useEffect(() => {
    callbacks.current = { getProgress, onState };
  });

  useLayoutEffect(() => {
    const w = createHeroWorld({
      renderer: gl,
      scene,
      camera: camera as THREE.PerspectiveCamera,
      calloutSvg: calloutSvgRef.current,
      features,
      fogHex,
      stageEl: stageRef.current,
      introEl: introRef.current,
      getProgress: () => callbacks.current.getProgress(),
      onState: (s) => callbacks.current.onState(s),
    });
    world.current = w;
    exploreRef.current = w.explore;
    return () => {
      exploreRef.current = null;
      w.dispose();
      world.current = null;
    };
    // Labels are fixed for the lifetime of a locale; the world is rebuilt only if the renderer changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gl, scene, camera]);

  useEffect(() => world.current?.resize(size.width, size.height, viewport.dpr), [size.width, size.height, viewport.dpr]);
  useEffect(() => {
    if (failed) onFail();
  }, [failed, onFail]);

  // Priority 1: this callback renders the frame itself (mirror pass + main pass).
  useFrame((_, dt) => world.current?.frame(dt), 1);

  if (failed) return null;
  return (
    <ModelErrorBoundary onError={() => setFailed(true)}>
      <Suspense fallback={null}>
        <RealCar
          url={heroModel.url}
          onLoaded={(car) => {
            const info = world.current?.setModel(car);
            if (process.env.NODE_ENV !== "production" && info) console.info(`[hero] ${info}`);
            world.current?.start();
            onReady();
          }}
        />
      </Suspense>
    </ModelErrorBoundary>
  );
}

function RealCar({ url, onLoaded }: { url: string; onLoaded: (root: THREE.Object3D) => void }) {
  const gltf = useGLTF(url, heroConfig.dracoPath, true);
  const loaded = useRef(onLoaded);
  useEffect(() => {
    loaded.current = onLoaded;
  });
  useEffect(() => {
    // Work on a deep copy (meshes and materials) so the cached glTF stays pristine.
    const car = gltf.scene.clone(true);
    car.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh) m.material = Array.isArray(m.material) ? m.material.map((x) => x.clone()) : m.material.clone();
    });
    loaded.current(car);
  }, [gltf]);
  return null;
}

/** If the model can't load (missing file, unsupported compression), report it; the hero shows the poster instead. */
class ModelErrorBoundary extends Component<{ onError: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: unknown) {
    console.warn("[hero] 3D model failed to load; showing the poster instead.", error);
    this.props.onError();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

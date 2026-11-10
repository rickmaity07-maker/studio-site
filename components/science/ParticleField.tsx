"use client";

import { useEffect, useRef } from "react";
import type { MotionValue } from "motion/react";

/*
 * A cloud of glowing points that bursts apart and re-forms into four
 * scientific shapes as you scroll: a spiral galaxy, a two-source wave
 * interference surface, a DNA double helix, and a globe with an orbit.
 *
 * Every shape is computed once on the CPU; the GPU blends between them
 * in the vertex shader, so scrolling costs almost nothing. `progress`
 * runs from 0 (galaxy) to 3 (globe); whole numbers are the rest states.
 */

const TAU = Math.PI * 2;

type Shape = Float32Array;

function rotX(p: Shape, a: number) {
  const c = Math.cos(a), s = Math.sin(a);
  for (let i = 0; i < p.length; i += 3) {
    const y = p[i + 1], z = p[i + 2];
    p[i + 1] = y * c - z * s;
    p[i + 2] = y * s + z * c;
  }
  return p;
}

function rotZ(p: Shape, a: number) {
  const c = Math.cos(a), s = Math.sin(a);
  for (let i = 0; i < p.length; i += 3) {
    const x = p[i], y = p[i + 1];
    p[i] = x * c - y * s;
    p[i + 1] = x * s + y * c;
  }
  return p;
}

/** Discover: a three-armed spiral galaxy, denser at the core. */
function galaxy(n: number, rnd: () => number): Shape {
  const p = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const r = Math.pow(rnd(), 1.6) * 2.3;
    const arm = ((i % 3) / 3) * TAU;
    const a = arm + r * 1.9;
    const spread = Math.pow(rnd(), 3) * 0.45 * (0.3 + r);
    const sx = (rnd() < 0.5 ? -1 : 1) * spread;
    const sz = (rnd() < 0.5 ? -1 : 1) * spread;
    p[i * 3] = Math.cos(a) * r + sx;
    p[i * 3 + 1] = (rnd() - 0.5) * 0.18 * (2.4 - r);
    p[i * 3 + 2] = Math.sin(a) * r + sz;
  }
  return rotX(p, 0.95);
}

/** Design: ripples from two point sources interfering on a plane. */
function interference(n: number, rnd: () => number): Shape {
  const p = new Float32Array(n * 3);
  const side = Math.ceil(Math.sqrt(n));
  for (let i = 0; i < n; i++) {
    const gx = (i % side) / (side - 1);
    const gz = Math.floor(i / side) / (side - 1);
    const x = (gx - 0.5) * 4 + (rnd() - 0.5) * 0.02;
    const z = (gz - 0.5) * 4 + (rnd() - 0.5) * 0.02;
    const d1 = Math.hypot(x + 0.9, z);
    const d2 = Math.hypot(x - 0.9, z);
    const y = 0.22 * (Math.sin(d1 * 7.5) / (1 + d1 * 0.6) + Math.sin(d2 * 7.5) / (1 + d2 * 0.6));
    p[i * 3] = x;
    p[i * 3 + 1] = y;
    p[i * 3 + 2] = z;
  }
  return rotX(p, 0.75);
}

/** Build: a DNA double helix with base-pair rungs. */
function helix(n: number, rnd: () => number): Shape {
  const p = new Float32Array(n * 3);
  const rungs = 30;
  for (let i = 0; i < n; i++) {
    let x: number, y: number, z: number;
    if (rnd() < 0.68) {
      // The two backbones.
      y = (rnd() - 0.5) * 4.6;
      const a = y * 2.4 + (i % 2) * Math.PI;
      const r = 0.72 + (rnd() - 0.5) * 0.07;
      x = Math.cos(a) * r;
      z = Math.sin(a) * r;
    } else {
      // A rung between them.
      const k = Math.floor(rnd() * rungs);
      y = (k / (rungs - 1) - 0.5) * 4.4;
      const a = y * 2.4;
      const t = rnd() * 2 - 1;
      x = Math.cos(a) * 0.72 * t;
      z = Math.sin(a) * 0.72 * t;
    }
    p[i * 3] = x + (rnd() - 0.5) * 0.03;
    p[i * 3 + 1] = y;
    p[i * 3 + 2] = z + (rnd() - 0.5) * 0.03;
  }
  return rotZ(p, -0.5);
}

/** Launch: an evenly covered globe, with a tilted orbit around it. */
function globe(n: number, rnd: () => number): Shape {
  const p = new Float32Array(n * 3);
  const ring = Math.floor(n * 0.16);
  const body = n - ring;
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < body; i++) {
    const y = 1 - (i / (body - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const a = i * golden;
    p[i * 3] = Math.cos(a) * r * 1.45;
    p[i * 3 + 1] = y * 1.45;
    p[i * 3 + 2] = Math.sin(a) * r * 1.45;
  }
  for (let j = 0; j < ring; j++) {
    const i = body + j;
    const a = rnd() * TAU;
    const r = 2.15 + (rnd() - 0.5) * 0.12;
    const x = Math.cos(a) * r, z = Math.sin(a) * r, y = (rnd() - 0.5) * 0.04;
    // Tilt the orbit.
    p[i * 3] = x;
    p[i * 3 + 1] = y * Math.cos(0.45) - z * Math.sin(0.45);
    p[i * 3 + 2] = y * Math.sin(0.45) + z * Math.cos(0.45);
  }
  return p;
}

/** Small seeded generator, so the shapes are identical on every visit. */
function seeded(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const vertex = /* glsl */ `
  attribute vec3 aB;
  attribute vec3 aC;
  attribute vec3 aD;
  attribute vec4 aRand;
  uniform float uProgress;
  uniform float uTime;
  uniform float uBurst;
  uniform float uSize;
  uniform float uPixelRatio;
  uniform float uCamZ;
  varying float vAlpha;
  varying float vHeat;

  void main() {
    float p = clamp(uProgress, 0.0, 3.0);
    float seg = min(floor(p), 2.0);
    float t = p - seg;
    // Each particle leaves a little later than the last: an organic wave, not a jump.
    float d = aRand.x * 0.4;
    float lt = smoothstep(d, d + 0.6, t);

    vec3 from = seg < 0.5 ? position : (seg < 1.5 ? aB : aC);
    vec3 to   = seg < 0.5 ? aB : (seg < 1.5 ? aC : aD);
    vec3 pos = mix(from, to, lt);

    // Mid-flight, every point is flung outward and swirled, then pulled home.
    float burst = sin(lt * 3.14159265);
    vec3 dir = normalize(aRand.yzw - 0.5 + 0.0001);
    pos += dir * burst * (0.5 + aRand.x * 1.6) * uBurst;
    float sw = burst * 1.4 * uBurst;
    pos.xz = mat2(cos(sw), -sin(sw), sin(sw), cos(sw)) * pos.xz;

    // Always a little alive, like particles in a field.
    pos += 0.025 * vec3(
      sin(uTime * 0.8 + aRand.y * 40.0),
      cos(uTime * 0.7 + aRand.z * 40.0),
      sin(uTime * 0.6 + aRand.w * 40.0)
    );

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
    // Size and fade are relative to the camera distance, which grows on tall phone screens.
    gl_PointSize = uSize * uPixelRatio * (0.55 + aRand.x * 0.9) * (uCamZ / 7.0) / -mv.z;
    vAlpha = smoothstep(uCamZ + 3.0, uCamZ - 4.0, -mv.z) * (0.45 + 0.55 * aRand.y);
    vHeat = burst * uBurst;
  }
`;

const fragment = /* glsl */ `
  uniform vec3 uColor;
  uniform vec3 uHot;
  varying float vAlpha;
  varying float vHeat;

  void main() {
    // Soft round point with a bright core.
    float r = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, r);
    a *= a;
    vec3 col = mix(uColor, uHot, clamp(vHeat * 1.2 + (0.18 - r) * 1.5, 0.0, 1.0));
    gl_FragColor = vec4(col, a * vAlpha);
  }
`;

export function ParticleField({
  progress,
  reduce,
  className
}: {
  progress: MotionValue<number>;
  reduce: boolean;
  className?: string;
}) {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let disposed = false;
    let cleanup = () => {};

    (async () => {
      const THREE = await import("three");
      if (disposed) return;

      let renderer: InstanceType<typeof THREE.WebGLRenderer>;
      try {
        renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: "high-performance" });
      } catch {
        return; // No WebGL: the text still tells the story.
      }
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      renderer.setPixelRatio(dpr);
      renderer.setClearColor(0x000000, 0);
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
      renderer.domElement.style.display = "block";
      el.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 50);
      camera.position.set(0, 0, 7);

      const small = window.innerWidth < 768;
      const n = small ? 7000 : 14000;
      const rnd = seeded(20261110);
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(galaxy(n, rnd), 3));
      geo.setAttribute("aB", new THREE.BufferAttribute(interference(n, rnd), 3));
      geo.setAttribute("aC", new THREE.BufferAttribute(helix(n, rnd), 3));
      geo.setAttribute("aD", new THREE.BufferAttribute(globe(n, rnd), 3));
      const r4 = new Float32Array(n * 4);
      for (let i = 0; i < r4.length; i++) r4[i] = rnd();
      geo.setAttribute("aRand", new THREE.BufferAttribute(r4, 4));

      const uniforms = {
        uProgress: { value: progress.get() },
        uTime: { value: 0 },
        uBurst: { value: reduce ? 0 : 1 },
        uSize: { value: small ? 34 : 42 },
        uPixelRatio: { value: dpr },
        uCamZ: { value: 7 },
        uColor: { value: new THREE.Color("#4CE8B0") },
        uHot: { value: new THREE.Color("#E9FFF7") }
      };
      const mat = new THREE.ShaderMaterial({
        vertexShader: vertex,
        fragmentShader: fragment,
        uniforms,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      });
      const points = new THREE.Points(geo, mat);
      points.frustumCulled = false;
      const group = new THREE.Group();
      group.add(points);
      scene.add(group);

      function resize() {
        const w = el!.clientWidth || 1;
        const h = el!.clientHeight || 1;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        // Keep the shapes fully in frame on tall phone screens.
        camera.position.z = w / h < 0.8 ? 9.5 : 7;
        uniforms.uCamZ.value = camera.position.z;
        camera.updateProjectionMatrix();
      }
      resize();
      const ro = new ResizeObserver(resize);
      ro.observe(el);

      // Gentle parallax toward the cursor.
      const target = { x: 0, y: 0 };
      function onPointer(e: PointerEvent) {
        target.x = (e.clientX / window.innerWidth - 0.5) * 0.5;
        target.y = (e.clientY / window.innerHeight - 0.5) * 0.3;
      }
      window.addEventListener("pointermove", onPointer, { passive: true });

      // Only draw while on screen.
      let raf = 0;
      let visible = false;
      const io = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        if (visible && !raf) {
          last = performance.now();
          raf = requestAnimationFrame(frame);
        }
      });
      io.observe(el);

      let last = performance.now();
      let smooth = progress.get();
      function frame(now: number) {
        raf = 0;
        if (!visible || disposed) return;
        const dt = Math.min((now - last) / 1000, 0.05);
        last = now;
        // Ease toward the scroll position, so even a jumpy wheel looks fluid.
        smooth += (progress.get() - smooth) * (reduce ? 1 : Math.min(1, dt * 4));
        uniforms.uProgress.value = smooth;
        if (!reduce) {
          uniforms.uTime.value += dt;
          group.rotation.y += dt * 0.08;
          group.rotation.x += (target.y - group.rotation.x) * dt * 2;
          group.position.x += (target.x * 0.4 - group.position.x) * dt * 2;
        }
        renderer.render(scene, camera);
        raf = requestAnimationFrame(frame);
      }

      cleanup = () => {
        cancelAnimationFrame(raf);
        io.disconnect();
        ro.disconnect();
        window.removeEventListener("pointermove", onPointer);
        geo.dispose();
        mat.dispose();
        renderer.dispose();
        renderer.domElement.remove();
      };
    })();

    return () => {
      disposed = true;
      cleanup();
    };
  }, [progress, reduce]);

  return <div ref={host} aria-hidden className={className} />;
}

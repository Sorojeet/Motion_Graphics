// Reusable first-person 3D kit for "What if" Shorts. Everything is procedural, seeded and driven by the
// frame number, so renders are deterministic. Pass colors as props instead of editing them here.
import React, { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";

export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const ss = (a: number, b: number, x: number) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;
export const rng = (seed: number) => () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const hash = (x: number, y: number) => { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s); };
export const noise = (x: number, y: number) => {
  const i = Math.floor(x), j = Math.floor(y), f = x - i, g = y - j, u = f * f * (3 - 2 * f), v = g * g * (3 - 2 * g);
  return mix(mix(hash(i, j), hash(i + 1, j), u), mix(hash(i, j + 1), hash(i + 1, j + 1), u), v);
};
export const groundHeight = (x: number, z: number) => (noise(x * 0.12, z * 0.12) - 0.5) * 1.2 + (noise(x * 0.55, z * 0.55) - 0.5) * 0.3;

/** Points the camera. Call it once inside a scene. */
export const Camera: React.FC<{ pos: number[]; look: number[]; fov?: number; roll?: number }> = ({ pos, look, fov = 55, roll = 0 }) => {
  const cam = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  useLayoutEffect(() => {
    cam.fov = fov; cam.far = 600; cam.near = 0.05; cam.position.set(pos[0], pos[1], pos[2]); cam.up.set(0, 1, 0);
    cam.lookAt(look[0], look[1], look[2]); cam.rotateZ(roll); cam.updateProjectionMatrix();
  });
  return null;
};

/** Vertical gradient sky. */
export const Sky: React.FC<{ top: string; horizon: string }> = ({ top, horizon }) => {
  const mat = useMemo(() => new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { a: { value: new THREE.Color() }, b: { value: new THREE.Color() } },
    vertexShader: "varying vec3 p; void main(){ p = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }",
    fragmentShader: "uniform vec3 a; uniform vec3 b; varying vec3 p; void main(){ float t = pow(clamp(p.y*1.5+.05,0.,1.),.6); gl_FragColor = vec4(mix(b,a,t),1.);\n#include <colorspace_fragment>\n}",
  }), []);
  mat.uniforms.a.value.set(top); mat.uniforms.b.value.set(horizon);
  return <mesh material={mat} renderOrder={-10}><sphereGeometry args={[400, 24, 16]} /></mesh>;
};

type Fill = (i: number, d: THREE.Object3D, c: THREE.Color) => void;
/** Instanced mesh. `fill` runs for every instance whenever `dep` changes. Use a constant dep for static sets. */
export const Instances: React.FC<{ count: number; dep?: unknown; fill: Fill; children: React.ReactNode; castShadow?: boolean; receiveShadow?: boolean; frustumCulled?: boolean }> = ({ count, dep = 0, fill, children, ...rest }) => {
  const ref = useRef<THREE.InstancedMesh>(null!);
  useLayoutEffect(() => {
    const d = new THREE.Object3D(), col = new THREE.Color("#fff"), m = ref.current;
    for (let i = 0; i < count; i++) { d.position.set(0, 0, 0); d.rotation.set(0, 0, 0); d.scale.set(1, 1, 1); col.set("#fff"); fill(i, d, col); d.updateMatrix(); m.setMatrixAt(i, d.matrix); m.setColorAt(i, col); }
    m.instanceMatrix.needsUpdate = true; if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [dep, count]);
  return <instancedMesh ref={ref} args={[undefined as any, undefined as any, count]} frustumCulled={false} {...rest}>{children}</instancedMesh>;
};

export const leafGeometry = () => {
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute([0, 0, -0.14, 0.07, 0.012, -0.03, 0, 0.018, 0.14, -0.07, 0.012, -0.03], 3));
  g.setIndex([0, 2, 1, 0, 3, 2]); g.computeVertexNormals(); return g;
};

/** Apple. rot 0 = perfect, 1 = browned, moldy and shrunken. */
export const Apple: React.FC<{ rot?: number; radius?: number; position?: number[]; rotationY?: number }> = ({ rot = 0, radius = 0.5, position = [0, 0, 0], rotationY = 0 }) => {
  const geo = useMemo(() => {
    const pts: THREE.Vector2[] = [];
    for (let i = 40; i >= 0; i--) { const a = (i / 40) * Math.PI, s = Math.sin(a), y = Math.cos(a); pts.push(new THREE.Vector2(Math.max(0.001, s * (1 + 0.1 * y) * (1 - 0.1 * Math.exp(-((y + 1) ** 2) * 8))), y * 0.92 - 0.2 * Math.exp(-(s * s) * 18) * Math.sign(y))); }
    const g = new THREE.LatheGeometry(pts, 72); g.setAttribute("color", new THREE.BufferAttribute(new Float32Array(g.attributes.position.count * 3), 3));
    g.userData.base = (g.attributes.position.array as Float32Array).slice(); return g;
  }, []);
  useLayoutEffect(() => {
    const pos = geo.attributes.position, col = geo.attributes.color, base = geo.userData.base as Float32Array;
    const red = new THREE.Color("#c81e2b"), blush = new THREE.Color("#e8a12f"), brown = new THREE.Color("#4a2c16"), mold = new THREE.Color("#b9bda6"), c = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      const x = base[i * 3], y = base[i * 3 + 1], z = base[i * 3 + 2], n = noise(x * 2.3 + 5, z * 2.3 + y * 2.1), n2 = noise(x * 6 + 1, y * 6 + z * 6);
      c.copy(red).lerp(blush, ss(0.55, 0.85, noise(x * 1.5 + y, z * 1.5 + 3)) * 0.65);
      const b = ss(1.02 - rot * 1.1, 1.28 - rot * 1.1, n + 0.25 * n2);
      c.lerp(brown, b); c.lerp(mold, ss(0.56, 0.72, n2 * n * 2) * ss(0.5, 1, rot) * b);
      col.setXYZ(i, c.r, c.g, c.b);
      const w = 1 - b * (0.1 + 0.1 * n2); pos.setXYZ(i, x * w, y * w, z * w);
    }
    pos.needsUpdate = true; col.needsUpdate = true; geo.computeVertexNormals();
  }, [rot, geo]);
  return <group position={position as any} rotation={[0, rotationY, 0]} scale={radius}>
    <mesh geometry={geo} castShadow receiveShadow><meshStandardMaterial vertexColors roughness={0.32 + rot * 0.5} metalness={0.02} /></mesh>
    <mesh position={[0.03, 0.82, 0]} rotation={[0, 0, -0.18]}><cylinderGeometry args={[0.022, 0.035, 0.42, 8]} /><meshStandardMaterial color="#3d2a18" /></mesh>
    <mesh position={[0.23, 0.92, 0]} rotation={[0.2, 0.2, -0.6]} scale={[0.26, 0.03, 0.12]}><sphereGeometry args={[1, 10, 8]} /><meshStandardMaterial color={rot > 0.5 ? "#6d5a2a" : "#3f8f3a"} /></mesh>
  </group>;
};

const Capsule: React.FC<{ a: number[]; b: number[]; r: number; color: string }> = ({ a, b, r, color }) => {
  const { p, q, len } = useMemo(() => {
    const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), d = B.clone().sub(A);
    return { p: A.clone().add(B).multiplyScalar(0.5), q: new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize()), len: d.length() };
  }, [a.join(), b.join()]);
  return <mesh position={p} quaternion={q} castShadow><capsuleGeometry args={[r, len, 6, 12]} /><meshStandardMaterial color={color} roughness={0.68} /></mesh>;
};

/** First-person hand and sleeve. Palm up at the origin, arm toward +z. grip 0 = open, 1 = holding something of radius 0.5. */
export const Hand: React.FC<{ grip?: number; position?: number[]; rotation?: number[]; skin?: string; sleeve?: string; scale?: number }> = ({ grip = 1, position = [0, 0, 0], rotation = [0, 0, 0], skin = "#c4906b", sleeve = "#2f3d2e", scale = 1 }) => {
  const finger = (x: number, len: number, spread: number) => {
    const c = mix(0.35, 1.25, grip), z0 = -0.38;
    const p1 = [x, 0.02, z0], p2 = [x + spread, 0.02 + Math.sin(c * 0.5) * len * 0.5, z0 - Math.cos(c * 0.5) * len * 0.5];
    const p3 = [x + spread * 1.5, p2[1] + Math.sin(c) * len * 0.42, p2[2] - Math.cos(c) * len * 0.42];
    const p4 = [x + spread * 1.8, p3[1] + Math.sin(c * 1.45) * len * 0.3, p3[2] - Math.cos(c * 1.45) * len * 0.3];
    return <React.Fragment key={x}><Capsule a={p1} b={p2} r={0.078} color={skin} /><Capsule a={p2} b={p3} r={0.072} color={skin} /><Capsule a={p3} b={p4} r={0.064} color={skin} /></React.Fragment>;
  };
  const t = mix(0.2, 0.75, grip);
  return <group position={position as any} rotation={rotation as any} scale={scale}>
    <mesh scale={[0.4, 0.14, 0.46]} castShadow><sphereGeometry args={[1, 24, 16]} /><meshStandardMaterial color={skin} roughness={0.68} /></mesh>
    {finger(-0.27, 0.62, -0.03)}{finger(-0.09, 0.7, -0.01)}{finger(0.09, 0.66, 0.01)}{finger(0.26, 0.52, 0.03)}
    <Capsule a={[-0.34, 0.02, 0.1]} b={[-0.5, 0.1 + t * 0.2, -0.1]} r={0.08} color={skin} />
    <Capsule a={[-0.5, 0.1 + t * 0.2, -0.1]} b={[-0.52, 0.2 + t * 0.36, -0.3]} r={0.07} color={skin} />
    <Capsule a={[0, -0.02, 0.35]} b={[0.03, -0.14, 0.95]} r={0.2} color={skin} />
    <Capsule a={[0.03, -0.14, 0.95]} b={[0.1, -0.5, 3.6]} r={0.27} color={sleeve} />
  </group>;
};

const leafPalette = ["#c2571a", "#d9861c", "#a33b16", "#e0a526", "#7f3a15", "#b5471d"];
export type ForestProps = {
  seed?: number; pile?: number; litter?: number; canopy?: string[]; canopyTint?: string; tintAmount?: number; canopyScale?: number;
  groundLow?: string; groundHigh?: string; trees?: number; center?: number[]; charred?: number; logs?: number; dep?: unknown;
};
/** Autumn forest, with a ground layer that rises by `pile` and fills with leaves and logs. */
export const Forest: React.FC<ForestProps> = ({ seed = 7, pile = 0, litter = 0, canopy = ["#c9581b", "#de8a1f", "#a83a18", "#e5ad2c", "#8a4a1a"], canopyTint = "#b8a22c", tintAmount = 0, canopyScale = 1, groundLow = "#34241a", groundHigh = "#5c3a1f", trees = 260, center = [0, 0, 0], charred = 0, logs = 0 }) => {
  const data = useMemo(() => {
    const r = rng(seed), t: { x: number; z: number; h: number; s: number; rot: number; c: number }[] = [];
    while (t.length < trees) { const x = (r() - 0.5) * 170, z = (r() - 0.5) * 170 - 20; if (Math.abs(x) < 2.6 && z > -60) continue; t.push({ x, z, h: 7 + r() * 8, s: 0.8 + r() * 0.7, rot: r() * 6, c: Math.floor(r() * 5) }); }
    return t;
  }, [seed, trees]);
  const ground = useMemo(() => {
    const g = new THREE.PlaneGeometry(240, 240, 180, 180); g.rotateX(-Math.PI / 2);
    const col = new Float32Array(g.attributes.position.count * 3), a = new THREE.Color(groundLow), b = new THREE.Color(groundHigh), c = new THREE.Color(), p = g.attributes.position;
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i); p.setY(i, groundHeight(x, z)); c.copy(a).lerp(b, noise(x * 0.8, z * 0.8)); col.set([c.r, c.g, c.b], i * 3); }
    g.setAttribute("color", new THREE.BufferAttribute(col, 3)); g.computeVertexNormals(); return g;
  }, [groundLow, groundHigh]);
  const leaf = useMemo(leafGeometry, []);
  const NL = 11000, NLog = 170;
  const lf = useMemo(() => { const r = rng(seed + 1); return Array.from({ length: NL }, () => { const a = r() * 6.283, d = Math.pow(r(), 0.7) * 34; return { x: center[0] + Math.cos(a) * d, z: center[2] + Math.sin(a) * d, ry: r() * 6.28, rx: (r() - 0.5) * 0.5, rz: (r() - 0.5) * 0.5, s: 1.1 + r() * 1.4, c: Math.floor(r() * 6), o: r() }; }); }, [seed]);
  const lg = useMemo(() => { const r = rng(seed + 2); return Array.from({ length: NLog }, () => { let x = 0, z = 0; do { x = center[0] + (r() - 0.5) * 60; z = center[2] + (r() - 0.5) * 60; } while (Math.hypot(x - center[0], z - center[2]) < 2.6); return { x, z, ry: r() * 6.28, rx: (r() - 0.5) * 0.3, l: 4 + r() * 6, s: 0.16 + r() * 0.2, o: r(), y: r() }; }); }, [seed]);
  const trunkCol = new THREE.Color("#3b2a1f").lerp(new THREE.Color("#0d0b0a"), charred);
  const tint = new THREE.Color(canopyTint);
  return <group>
    <group position={[0, pile, 0]}><mesh geometry={ground} receiveShadow><meshStandardMaterial vertexColors roughness={1} /></mesh></group>
    <Instances count={trees} fill={(i, d) => { const t = data[i]; d.position.set(t.x, t.h * 0.5 - 0.3, t.z); d.scale.set(t.s, t.h, t.s); d.rotation.set(0, t.rot, 0); }} dep={charred}>
      <cylinderGeometry args={[0.16, 0.32, 1, 8]} /><meshStandardMaterial color={trunkCol} roughness={1} />
    </Instances>
    {canopyScale > 0.01 ? <Instances count={trees * 3} dep={`${tintAmount}${canopyScale}`} fill={(i, d, c) => {
      const t = data[Math.floor(i / 3)], k = i % 3, o = [[0, 0, 0], [1.2, -1, 0.8], [-1, -1.3, -0.9]][k], s = (2.6 - k * 0.45) * t.s * 1.25 * canopyScale;
      d.position.set(t.x + o[0] * t.s, t.h + o[1] * t.s, t.z + o[2] * t.s); d.scale.set(s, s * 0.85, s); d.rotation.set(t.rot, t.rot * k, 0);
      c.set(canopy[(t.c + k) % canopy.length]).lerp(tint, tintAmount);
    }}><icosahedronGeometry args={[1, 1]} /><meshStandardMaterial flatShading roughness={0.9} /></Instances> : null}
    {litter > 0 ? <Instances count={NL} dep={`${litter}${pile}`} fill={(i, d, c) => {
      const l = lf[i], on = l.o < litter; d.position.set(l.x, pile + groundHeight(l.x, l.z) + 0.03 + l.o * 0.05, l.z); d.rotation.set(l.rx, l.ry, l.rz);
      const s = on ? l.s : 0; d.scale.set(s, s, s); c.set(leafPalette[l.c]);
    }}><primitive object={leaf} attach="geometry" /><meshStandardMaterial side={THREE.DoubleSide} roughness={0.85} /></Instances> : null}
    {logs > 0 ? <Instances count={NLog} dep={`${logs}${pile}`} fill={(i, d) => {
      const l = lg[i], s = ss(l.o, l.o + 0.06, logs) * l.s; d.position.set(l.x, pile + groundHeight(l.x, l.z) + l.y * pile * 0.55 + 0.12, l.z); d.rotation.set(Math.PI / 2 + l.rx, 0, l.ry, "YXZ"); d.scale.set(s, l.l, s);
    }}><cylinderGeometry args={[1, 1.1, 1, 8]} /><meshStandardMaterial color="#4a3526" roughness={1} /></Instances> : null}
  </group>;
};

/** Falling leaves or ash around `at`. */
export const Falling: React.FC<{ count?: number; t: number; at?: number[]; spread?: number; top?: number; speed?: number; colors?: string[]; size?: number; seed?: number; bottom?: number }> = ({ count = 500, t, at = [0, 0, 0], spread = 18, top = 16, speed = 0.09, colors = leafPalette, size = 1.8, seed = 3, bottom = 0 }) => {
  const leaf = useMemo(leafGeometry, []);
  const d0 = useMemo(() => { const r = rng(seed); return Array.from({ length: count }, () => ({ x: (r() - 0.5) * spread, z: (r() - 0.5) * spread, p: r(), v: speed * (0.7 + r() * 0.6), w: r() * 6.28, c: Math.floor(r() * colors.length) })); }, [count]);
  return <Instances count={count} dep={t} fill={(i, d, c) => {
    const l = d0[i], u = (l.p + t * l.v) % 1; d.position.set(at[0] + l.x + Math.sin(t * 1.3 + l.w) * 0.5, bottom + (1 - u) * (top - bottom), at[2] + l.z + Math.cos(t * 1.1 + l.w) * 0.4);
    d.rotation.set(t * 1.7 + l.w, t * 1.1 + l.w, t * 0.9); d.scale.setScalar(size); c.set(colors[l.c]);
  }}><primitive object={leaf} attach="geometry" /><meshStandardMaterial side={THREE.DoubleSide} roughness={0.8} /></Instances>;
};

/** Glowing particles. `path` gives position and brightness for each one. */
export const Glow: React.FC<{ count: number; t: number; size?: number; additive?: boolean; path: (i: number, t: number) => { p: number[]; a: number; color?: string } }> = ({ count, t, size = 0.12, additive = true, path }) =>
  <Instances count={count} dep={t} fill={(i, d, c) => { const q = path(i, t); d.position.set(q.p[0], q.p[1], q.p[2]); d.scale.setScalar(size * Math.max(q.a, 0.0001)); c.set(q.color ?? "#fff"); }}>
    <sphereGeometry args={[1, 8, 6]} /><meshBasicMaterial blending={additive ? THREE.AdditiveBlending : THREE.NormalBlending} transparent depthWrite={false} fog={false} toneMapped={false} />
  </Instances>;

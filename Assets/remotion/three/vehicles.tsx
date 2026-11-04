// Detailed procedural 3D vehicles in 22 varieties. Sizes are roughly real meters. Front toward +x, up +y, wheels on y = 0.
// Use: <Vehicle variety="suv" t={time} speed={12} lights colors={{ paint: "#2255aa" }} />
import React, { useMemo } from "react";
import * as THREE from "three";

export type VehicleColors = { paint: string; accent: string; trim: string };
type Ctx = { c: VehicleColors; spin: number; rotor: number; lights: boolean };

/* ---------- Materials ---------- */
const Paint: React.FC<{ c: string; gloss?: number }> = ({ c, gloss = 1 }) => <meshPhysicalMaterial color={c} roughness={0.34} metalness={0.12} clearcoat={gloss} clearcoatRoughness={0.1} />;
const Matte: React.FC<{ c: string; r?: number }> = ({ c, r = 0.75 }) => <meshStandardMaterial color={c} roughness={r} />;
const Metal: React.FC<{ c?: string }> = ({ c = "#c5cad0" }) => <meshStandardMaterial color={c} roughness={0.28} metalness={0.72} />;
const Glass: React.FC<{ c?: string }> = ({ c = "#26394a" }) => <meshPhysicalMaterial color={c} roughness={0.07} metalness={0.25} clearcoat={1} />;
const Lamp: React.FC<{ c: string; on?: boolean; off?: string }> = ({ c, on, off }) => <meshStandardMaterial color={on ? c : off ?? c} emissive={c} emissiveIntensity={on ? 2.2 : 0.18} roughness={0.2} toneMapped={!on} />;

/* ---------- Geometry helpers ---------- */
type P = number[];
const cache = new Map<string, THREE.BufferGeometry>();
const once = (key: string, make: () => THREE.BufferGeometry) => { let g = cache.get(key); if (!g) { g = make(); cache.set(key, g); } return g; };
const rounded = (s: THREE.Shape | THREE.Path, pts: P[], r: number, start = true) => {
  const n = pts.length;
  pts.forEach((p, i) => {
    const a = pts[i - 1] ?? p, b = pts[i + 1] ?? p;
    if (i === 0 || i === n - 1 || r <= 0) { if (i === 0 && start) s.moveTo(p[0], p[1]); else s.lineTo(p[0], p[1]); return; }
    const la = Math.hypot(a[0] - p[0], a[1] - p[1]), lb = Math.hypot(b[0] - p[0], b[1] - p[1]), k = Math.min(r, la / 2, lb / 2);
    s.lineTo(p[0] + ((a[0] - p[0]) / la) * k, p[1] + ((a[1] - p[1]) / la) * k); s.quadraticCurveTo(p[0], p[1], p[0] + ((b[0] - p[0]) / lb) * k, p[1] + ((b[1] - p[1]) / lb) * k);
  });
};
const extrude = (s: THREE.Shape, w: number, b: number) => { const g = new THREE.ExtrudeGeometry(s, { depth: Math.max(0.001, w - 2 * b), bevelEnabled: b > 0, bevelSize: b, bevelThickness: b, bevelSegments: 4, curveSegments: 14 }); g.translate(0, 0, -(w - 2 * b) / 2); return g; };
/** Flat side outline pushed out to width `w`, with soft edges. */
const Prism: React.FC<{ pts: P[]; w: number; r?: number; b?: number; z?: number; rot?: number[]; pos?: number[]; children: React.ReactNode; shadow?: boolean }> = ({ pts, w, r = 0, b = 0.02, z = 0, rot, pos, children, shadow = true }) => {
  const g = once(`p${JSON.stringify(pts)}${w}${r}${b}`, () => { const s = new THREE.Shape(); const c = [...pts, pts[0]]; if (r > 0) { const m = [(pts[0][0] + pts[pts.length - 1][0]) / 2, (pts[0][1] + pts[pts.length - 1][1]) / 2]; rounded(s, [m, ...pts, m], r); } else rounded(s, c, 0); return extrude(s, w, b); });
  return <mesh geometry={g} position={(pos ?? [0, 0, z]) as any} rotation={rot as any} castShadow={shadow} receiveShadow>{children}</mesh>;
};
/** Car shell with real wheel arches cut out. `top` runs front to rear. */
const Shell: React.FC<{ top: P[]; bottom: number; wheels: number[]; arch: number; axle: number; w: number; r?: number; c: string }> = ({ top, bottom, wheels, arch, axle, w, r = 0.12, c }) => {
  const g = once(`s${JSON.stringify([top, bottom, wheels, arch, axle, w, r])}`, () => {
    const s = new THREE.Shape(), rear = top[top.length - 1][0], front = top[0][0], dy = Math.sqrt(Math.max(0, arch * arch - (axle - bottom) ** 2)); s.moveTo(rear, bottom);
    [...wheels].sort((a, b) => a - b).forEach((x) => { s.lineTo(x - dy, bottom); s.absarc(x, axle, arch, Math.PI + Math.asin((axle - bottom) / arch), -Math.asin((axle - bottom) / arch), true); s.lineTo(x + dy, bottom); });
    s.lineTo(front, bottom); rounded(s, [[front, bottom], ...top, [rear, bottom]], r, false); s.lineTo(rear, bottom); return extrude(s, w, 0.07);
  });
  return <mesh geometry={g} castShadow receiveShadow><Paint c={c} /></mesh>;
};
/** Cylinder between two points. */
const Tube: React.FC<{ a: P; b: P; r: number; r2?: number; children: React.ReactNode; seg?: number }> = ({ a, b, r, r2, children, seg = 10 }) => {
  const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), d = B.clone().sub(A), q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize());
  return <mesh position={A.add(B).multiplyScalar(0.5)} quaternion={q} castShadow><cylinderGeometry args={[r2 ?? r, r, d.length(), seg]} />{children}</mesh>;
};
const Box: React.FC<{ p: P; s: P; rot?: P; children: React.ReactNode }> = ({ p, s, rot, children }) => <mesh position={p as any} rotation={rot as any} castShadow receiveShadow><boxGeometry args={s as any} />{children}</mesh>;
const Disc: React.FC<{ p: P; r: number; w: number; children: React.ReactNode; seg?: number }> = ({ p, r, w, children, seg = 24 }) => <mesh position={p as any} rotation={[Math.PI / 2, 0, 0]} castShadow><cylinderGeometry args={[r, r, w, seg]} />{children}</mesh>;
const Ball: React.FC<{ p: P; s: P; rot?: P; children: React.ReactNode }> = ({ p, s, rot, children }) => <mesh position={p as any} scale={s as any} rotation={rot as any} castShadow><sphereGeometry args={[1, 24, 16]} />{children}</mesh>;

/* ---------- Wheels ---------- */
const Wheel: React.FC<{ x: number; z: number; r: number; w?: number; spin: number; rim?: string; spokes?: number; y?: number }> = ({ x, z, r, w = 0.24, spin, rim = "#c9ced3", spokes = 5, y }) => {
  const sd = Math.sign(z) || 1;
  return <group position={[x, y ?? r, z]}>
    <mesh rotation={[Math.PI / 2, 0, 0]} castShadow><cylinderGeometry args={[r, r, w, 30]} /><Matte c="#141517" r={0.9} /></mesh>
    <mesh rotation={[0, 0, 0]}><torusGeometry args={[r - w * 0.14, w * 0.3, 8, 30]} /><Matte c="#1a1b1e" r={0.85} /></mesh>
    <group rotation={[0, 0, -spin / r]}>
      <Disc p={[0, 0, (sd * w) / 2 - sd * 0.015]} r={r * 0.68} w={0.035}><Matte c="#25272b" /></Disc>
      <mesh position={[0, 0, (sd * w) / 2]}><torusGeometry args={[r * 0.66, r * 0.05, 8, 28]} /><Metal c={rim} /></mesh>
      {Array.from({ length: spokes }, (_, i) => <group key={i} rotation={[0, 0, (i / spokes) * Math.PI * 2]}><Box p={[0, r * 0.34, (sd * w) / 2 + sd * 0.005]} s={[r * 0.13, r * 0.62, 0.025]}><Metal c={rim} /></Box></group>)}
      <Disc p={[0, 0, (sd * w) / 2 + sd * 0.012]} r={r * 0.17} w={0.04}><Metal c={rim} /></Disc>
    </group>
  </group>;
};
const pairs = (xs: number[], z: number, r: number, spin: number, o: Partial<React.ComponentProps<typeof Wheel>> = {}) => xs.flatMap((x) => [1, -1].map((s) => <Wheel key={`${x}${s}`} x={x} z={s * z} r={r} spin={spin} {...o} />));

/* ---------- Cars ---------- */
type CarSpec = { W: number; top: P[]; cabin: P[]; axles: number[]; r: number; doors: number[]; bottom?: number; rimCol?: string; spokes?: number; pillar?: number };
const CARS: Record<string, CarSpec> = {
  sedan: { W: 1.82, r: 0.33, axles: [1.42, -1.38], doors: [0.72, -0.28, -1.15], top: [[2.34, 0.5], [2.28, 0.74], [0.98, 0.93], [-1.55, 0.98], [-2.25, 0.97], [-2.36, 0.56]], cabin: [[0.98, 0.9], [0.08, 1.42], [-0.98, 1.44], [-1.82, 0.95]] },
  hatchback: { W: 1.76, r: 0.31, axles: [1.24, -1.24], doors: [0.6, -0.3, -1.0], top: [[1.98, 0.5], [1.93, 0.75], [0.9, 0.95], [-1.72, 1.0], [-1.98, 0.54]], cabin: [[0.9, 0.92], [0.12, 1.46], [-1.12, 1.48], [-1.75, 0.98]] },
  suv: { W: 1.95, r: 0.39, bottom: 0.32, axles: [1.42, -1.36], doors: [0.8, -0.22, -1.16], top: [[2.3, 0.62], [2.24, 1.0], [1.02, 1.14], [-2.26, 1.18], [-2.35, 0.62]], cabin: [[1.02, 1.1], [0.32, 1.76], [-1.96, 1.78], [-2.24, 1.14]], rimCol: "#2e3135", spokes: 6, pillar: 0.1 },
  sports: { W: 1.92, r: 0.34, bottom: 0.14, axles: [1.34, -1.32], doors: [0.5, -0.82], top: [[2.28, 0.34], [2.2, 0.56], [0.72, 0.8], [-1.12, 0.88], [-2.1, 0.84], [-2.26, 0.5]], cabin: [[0.82, 0.76], [-0.05, 1.16], [-0.74, 1.17], [-1.74, 0.84]], rimCol: "#e2b23f", spokes: 7 },
  pickup: { W: 1.98, r: 0.4, bottom: 0.36, axles: [1.72, -1.5], doors: [1.02, 0.04, -0.72], top: [[2.72, 0.68], [2.65, 1.06], [1.3, 1.2], [-0.82, 1.22], [-0.85, 1.22], [-2.68, 1.2], [-2.72, 0.66]], cabin: [[1.3, 1.16], [0.62, 1.84], [-0.56, 1.86], [-0.82, 1.2]], spokes: 6 },
};
const Car: React.FC<{ v: string; x: Ctx; taxi?: boolean }> = ({ v, x, taxi }) => {
  const s = CARS[v], { c } = x, f = s.top[0][0], rr = s.top[s.top.length - 1][0], cw = s.W * 0.84, zs = s.W / 2, low = s.bottom ?? 0.2, cab = s.cabin, A = cab[0], B = cab[1], C = cab[2], D = cab[3], side = (z: number) => z * zs;
  const beltY = (px: number) => { const t = s.top; for (let i = 0; i < t.length - 1; i++) if (px <= t[i][0] && px >= t[i + 1][0]) return t[i][1] + ((px - t[i][0]) / (t[i + 1][0] - t[i][0])) * (t[i + 1][1] - t[i][1]); return t[0][1]; };
  return <group>
    <Shell top={s.top} bottom={low} wheels={s.axles} arch={s.r * 1.2} axle={s.r} w={s.W} c={c.paint} />
    <Prism pts={[[f + 0.02, low - 0.02], [f + 0.02, low + 0.17], [rr - 0.02, low + 0.17], [rr - 0.02, low - 0.02]]} w={s.W - 0.48} b={0.03}><Matte c="#17181a" /></Prism>
    {s.axles.map((ax) => <Disc key={ax} p={[ax, s.r, 0]} r={s.r * 1.17} w={s.W - 0.08}><Matte c="#08090a" /></Disc>)}
    <Prism pts={cab} w={cw} b={0.04}><Glass /></Prism>
    <Prism pts={[B, [B[0] + 0.02, B[1] + 0.05], [C[0] - 0.02, C[1] + 0.05], C]} w={cw + 0.06} b={0.025}><Paint c={c.paint} /></Prism>
    {[1, -1].map((m) => <group key={m}>
      <Tube a={[A[0], A[1], (m * cw) / 2]} b={[B[0], B[1], (m * cw) / 2]} r={0.035}><Paint c={c.paint} /></Tube>
      <Tube a={[C[0], C[1], (m * cw) / 2]} b={[D[0], D[1], (m * cw) / 2]} r={s.pillar ?? 0.05}><Paint c={c.paint} /></Tube>
      {s.doors.length > 2 ? <Tube a={[s.doors[1], D[1], (m * cw) / 2 + m * 0.005]} b={[s.doors[1], B[1], (m * cw) / 2 + m * 0.005]} r={0.03}><Matte c="#101113" /></Tube> : null}
      {s.doors.map((dx) => <Box key={dx} p={[dx, (low + 0.15 + beltY(dx)) / 2, side(m) + m * 0.002]} s={[0.012, beltY(dx) - low - 0.17, 0.006]}><Matte c="#0a0a0b" /></Box>)}
      {s.doors.slice(0, -1).map((dx, i) => <Box key={i} p={[dx - 0.2, beltY(dx) - 0.14, side(m) + m * 0.012]} s={[0.15, 0.03, 0.03]}><Metal /></Box>)}
      <Box p={[(s.doors[0] + s.doors[s.doors.length - 1]) / 2, low + 0.17, side(m) + m * 0.002]} s={[Math.abs(s.doors[0] - s.doors[s.doors.length - 1]), 0.012, 0.006]}><Matte c="#0a0a0b" /></Box>
      <Ball p={[A[0] - 0.08, A[1] + 0.03, m * (zs + 0.08)]} s={[0.06, 0.055, 0.1]}><Paint c={c.paint} /></Ball>
      <Ball p={[f - 0.02, s.top[0][1] + 0.08, m * (zs - 0.32)]} s={[0.13, 0.08, 0.25]}><Lamp c="#fff5d0" on={x.lights} off="#e9edf0" /></Ball>
      <Box p={[rr - 0.07, s.top[s.top.length - 1][1] + 0.16, m * (zs - 0.3)]} s={[0.05, 0.14, 0.45]}><Lamp c="#ff2a1f" on={x.lights} off="#a51d17" /></Box>
    </group>)}
    <Box p={[f + 0.065, s.top[0][1] - 0.06, 0]} s={[0.05, 0.17, s.W * 0.42]}><Matte c="#0e0f10" /></Box>
    {[0, 1, 2].map((i) => <Box key={i} p={[f + 0.095, s.top[0][1] - 0.11 + i * 0.05, 0]} s={[0.01, 0.015, s.W * 0.4]}><Metal /></Box>)}
    <Box p={[rr - 0.07, low + 0.26, 0]} s={[0.03, 0.14, 0.46]}><Matte c="#eeeae0" /></Box>
    <Box p={[f + 0.08, low + 0.13, 0]} s={[0.03, 0.11, 0.42]}><Matte c="#eeeae0" /></Box>
    <Tube a={[rr, low + 0.03, 0.52]} b={[rr - 0.24, low + 0.03, 0.52]} r={0.04}><Metal /></Tube>
    {v === "pickup" ? <><Box p={[-1.75, 1.272, 0]} s={[1.72, 0.012, s.W - 0.26]}><Matte c="#101113" /></Box><Tube a={[-0.9, 1.45, -0.72]} b={[-0.9, 1.45, 0.72]} r={0.03}><Metal /></Tube><Tube a={[-0.9, 1.2, 0.72]} b={[-0.9, 1.45, 0.72]} r={0.03}><Metal /></Tube><Tube a={[-0.9, 1.2, -0.72]} b={[-0.9, 1.45, -0.72]} r={0.03}><Metal /></Tube></> : null}
    {v === "sports" ? <><Box p={[-2.0, 1.04, 0]} s={[0.32, 0.03, 1.72]}><Paint c={c.accent} /></Box>{[1, -1].map((m) => <Box key={m} p={[-2.0, 0.93, m * 0.6]} s={[0.1, 0.2, 0.04]}><Matte c="#121315" /></Box>)}<Box p={[0.2, 0.84, 0]} s={[2.6, 0.012, 0.34]}><Paint c={c.accent} /></Box></> : null}
    {v === "suv" ? [1, -1].map((m) => <Tube key={m} a={[0.3, 1.82, m * 0.72]} b={[-1.85, 1.82, m * 0.72]} r={0.025}><Metal c="#3a3d41" /></Tube>) : null}
    {taxi ? <><Prism pts={[[-0.74, 1.47], [-0.74, 1.67], [-0.25, 1.67], [-0.12, 1.47]]} w={0.56} b={0.015}><Lamp c="#fff0a8" on={x.lights} off="#faf3c5" /></Prism>{[1, -1].map((m) => Array.from({ length: 13 }, (_, i) => <Box key={`${m}${i}`} p={[0.9 - i * 0.2, 0.71 + (i % 2) * 0.05, m * (zs + 0.002)]} s={[0.1, 0.05, 0.004]}><Matte c="#111" /></Box>))}</> : null}
    {pairs(s.axles, zs - 0.13, s.r, x.spin, { rim: s.rimCol ?? "#c9ced3", spokes: s.spokes ?? 5 })}
  </group>;
};

/* ---------- Bus and truck ---------- */
const Bus: React.FC<{ kind: "city" | "school" | "double"; x: Ctx }> = ({ kind, x }) => {
  const { c } = x, L = kind === "double" ? 10.6 : kind === "school" ? 9.4 : 11.8, W = 2.5, H = kind === "double" ? 4.3 : 3.05, fr = L / 2, rr = -L / 2, nose = kind === "school" ? 1.45 : 0, face = fr - nose, wr = 0.5, axles = [face - (kind === "school" ? -0.2 : 2.6), rr + 2.6], low = 0.38, zs = W / 2;
  const levels = kind === "double" ? [[1.42, 2.1], [2.96, 3.82]] : kind === "school" ? [[1.68, 2.42]] : [[1.08, 2.6]];
  return <group>
    <Prism pts={[[rr, low], [rr, H - 0.12], [rr + 0.2, H], [face - 0.3, H], [face, H - 0.34], [face + 0.08, low]]} w={W} b={0.06} r={0.1}><Paint c={c.paint} /></Prism>
    {kind === "school" ? <Prism pts={[[face, 0.48], [face, 1.72], [fr - 0.25, 1.48], [fr, 1.2], [fr, 0.48]]} w={W - 0.3} b={0.08} r={0.14}><Paint c={c.paint} /></Prism> : null}
    <Box p={[(rr + face) / 2, low + 0.08, 0]} s={[L - nose - 0.1, 0.16, W + 0.015]}><Matte c="#171819" /></Box>
    {[1, -1].map((m) => <group key={m}>
      {levels.map(([a, b], li) => { const n = kind === "school" ? 7 : kind === "double" ? 6 : 6, x0 = rr + 0.3, x1 = face - 0.45, w = (x1 - x0) / n; return <group key={li}>
        <Box p={[(x0 + x1) / 2, (a + b) / 2, m * (zs + 0.012)]} s={[x1 - x0, b - a, 0.012]}><Glass c="#223340" /></Box>
        {Array.from({ length: n + 1 }, (_, i) => <Box key={i} p={[x0 + i * w, (a + b) / 2, m * (zs + 0.024)]} s={[0.07, b - a + 0.02, 0.012]}><Matte c={kind === "city" ? "#191a1d" : c.paint} /></Box>)}
        {kind === "school" ? <Box p={[(x0 + x1) / 2, a + 0.26, m * (zs + 0.024)]} s={[x1 - x0, 0.03, 0.012]}><Matte c="#c3c4bf" /></Box> : null}
      </group>; })}
      {kind === "school" ? [1.14, 0.84, 1.42].map((y) => <Box key={y} p={[(rr + face) / 2, y, m * (zs + 0.006)]} s={[L - nose - 0.2, 0.07, 0.012]}><Matte c="#101010" /></Box>) : <Box p={[(rr + face) / 2, kind === "double" ? 2.52 : 0.82, m * (zs + 0.006)]} s={[L - 0.3, kind === "double" ? 0.34 : 0.22, 0.012]}><Paint c={c.accent} /></Box>}
      <Tube a={[(kind === "school" ? fr - 1.1 : face), H - 0.5, m * zs]} b={[(kind === "school" ? fr - 1.05 : face + 0.08), H - 0.74, m * (zs + 0.26)]} r={0.018}><Matte c="#111" /></Tube>
      <Box p={[(kind === "school" ? fr - 1.05 : face + 0.08), H - 0.95, m * (zs + 0.26)]} s={[0.06, 0.42, 0.18]}><Matte c="#151618" /></Box>
      <Ball p={[kind === "school" ? fr + 0.08 : face + 0.15, 0.82, m * (zs - 0.36)]} s={[0.05, 0.13, 0.2]}><Lamp c="#fff5d0" on={x.lights} off="#eef0f1" /></Ball>
      <Box p={[rr - 0.01, 0.98, m * (zs - 0.26)]} s={[0.03, 0.42, 0.18]}><Lamp c="#ff2a1f" on={x.lights} off="#a51d17" /></Box>
      {axles.map((ax) => <Disc key={ax} p={[ax, wr, m * (zs - 0.02)]} r={wr * 1.22} w={0.08}><Matte c="#08090a" /></Disc>)}
    </group>)}
    {/* Doors on the +z side */}
    {(kind === "city" ? [face - 1.05, -0.45] : [face - 1.05]).map((dx) => <group key={dx}>
      <Box p={[dx, (0.44 + (kind === "double" ? 2.28 : 2.62)) / 2, zs + 0.03]} s={[1.14, (kind === "double" ? 2.28 : 2.62) - 0.44, 0.02]}><Matte c="#101214" /></Box>
      {[-0.28, 0.28].map((o) => <Box key={o} p={[dx + o, (0.56 + (kind === "double" ? 2.2 : 2.54)) / 2, zs + 0.044]} s={[0.46, (kind === "double" ? 2.2 : 2.54) - 0.56, 0.012]}><Glass c="#31495a" /></Box>)}
    </group>)}
    {/* Front face */}
    <Prism pts={[[face + 0.03, kind === "school" ? 1.78 : 1.12], [face + 0.03, H - 0.26], [face - 0.28, H - 0.1], [face - 0.33, H - 0.2]]} w={W - 0.28} b={0.01} pos={[0.1, 0, 0]}><Glass c="#1e3140" /></Prism>
    {kind !== "school" ? <Box p={[face + 0.1, H - 0.42, 0]} s={[0.1, 0.28, 1.6]}><Lamp c="#ffb22e" on={x.lights} off="#3a2708" /></Box> : <>
      <Box p={[fr + 0.005, 0.96, 0]} s={[0.04, 0.42, 1.2]}><Matte c="#0f1012" /></Box>{[0, 1, 2, 3].map((i) => <Box key={i} p={[fr + 0.03, 0.82 + i * 0.09, 0]} s={[0.012, 0.025, 1.14]}><Metal /></Box>)}
      <Box p={[fr + 0.02, 0.48, 0]} s={[0.14, 0.2, W - 0.2]}><Matte c="#14151a" /></Box><Disc p={[rr + 1.6, 1.26, zs + 0.06]} r={0.25} w={0.02} seg={8}><Matte c="#c7231c" /></Disc>
      {[1, -1].map((m) => <Ball key={m} p={[face + 0.02, H - 0.12, m * 0.92]} s={[0.05, 0.08, 0.08]}><Lamp c="#ff3a1f" on={x.lights} off="#a51d17" /></Ball>)}
    </>}
    {kind === "city" ? <><Prism pts={[[-3.6, H], [-3.5, H + 0.28], [-0.8, H + 0.28], [-0.7, H]]} w={1.5} b={0.04} r={0.05}><Matte c="#cfd2d4" /></Prism><Box p={[face - 0.02, 0.5, 0]} s={[0.12, 0.3, W - 0.1]}><Matte c="#141518" /></Box></> : null}
    {kind === "double" ? <Box p={[0, 2.82, 0]} s={[L - 0.3, 0.06, W + 0.012]}><Matte c="#dfddd2" /></Box> : null}
    {pairs(axles, zs - 0.17, wr, x.spin, { w: 0.34, rim: "#b2b7bb", spokes: 8 })}
  </group>;
};
const Truck: React.FC<{ x: Ctx }> = ({ x }) => {
  const { c } = x, ax = [3.0, -1.9, -3.25], r = 0.5;
  return <group>
    <Box p={[-0.5, 0.74, 0]} s={[8.2, 0.26, 1.18]}><Matte c="#17191c" /></Box>
    <Prism pts={[[2.05, 0.74], [2.05, 3.02], [3.55, 3.02], [4.1, 2.45], [4.32, 1.55], [4.32, 0.74]]} w={2.44} b={0.07} r={0.12}><Paint c={c.paint} /></Prism>
    <Prism pts={[[3.65, 1.82], [4.28, 1.75], [4.08, 2.42], [3.56, 2.94], [3.1, 2.94], [3.1, 1.82]]} w={2.48} b={0.012}><Glass /></Prism>
    <Box p={[2.65, 1.3, 1.235]} s={[0.012, 0.95, 0.008]}><Matte c="#0a0a0a" /></Box><Box p={[2.65, 1.3, -1.235]} s={[0.012, 0.95, 0.008]}><Matte c="#0a0a0a" /></Box>
    <Box p={[4.335, 1.25, 0]} s={[0.04, 0.72, 1.45]}><Matte c="#0f1012" /></Box>{[0, 1, 2, 3, 4].map((i) => <Box key={i} p={[4.36, 0.98 + i * 0.13, 0]} s={[0.012, 0.035, 1.38]}><Metal /></Box>)}
    <Box p={[4.28, 0.68, 0]} s={[0.2, 0.3, 2.46]}><Matte c="#1b1c20" /></Box>
    {[1, -1].map((m) => <group key={m}><Box p={[4.32, 1.02, m * 0.98]} s={[0.05, 0.22, 0.34]}><Lamp c="#fff5d0" on={x.lights} off="#eaeef0" /></Box><Box p={[3.75, 2.22, m * 1.45]} s={[0.07, 0.46, 0.17]}><Matte c="#121315" /></Box><Tube a={[3.45, 2.3, m * 1.22]} b={[3.75, 2.3, m * 1.42]} r={0.02}><Matte c="#121315" /></Tube><Box p={[-4.82, 1.0, m * 0.92]} s={[0.05, 0.2, 0.3]}><Lamp c="#ff2a1f" on={x.lights} off="#a51d17" /></Box><Box p={[3.0, 1.12, m * 1.02]} s={[1.3, 0.06, 0.45]}><Matte c="#141518" /></Box>{ax.map((a) => <Disc key={a} p={[a, r, m * 1.2]} r={r * 1.18} w={0.06}><Matte c="#08090a" /></Disc>)}</group>)}
    <Tube a={[2.15, 2.95, 1.03]} b={[2.15, 3.5, 1.03]} r={0.06}><Metal /></Tube>
    <Prism pts={[[2.3, 3.02], [2.5, 3.5], [3.1, 3.5], [3.45, 3.02]]} w={2.1} b={0.03} r={0.08}><Paint c={c.paint} /></Prism>
    <Box p={[-1.45, 2.38, 0]} s={[6.75, 2.72, 2.5]}><Paint c={c.accent} gloss={0.3} /></Box>
    {[1, -1].map((m) => <group key={m}>{Array.from({ length: 19 }, (_, i) => <Box key={i} p={[-4.7 + i * 0.36, 2.38, m * 1.258]} s={[0.05, 2.62, 0.02]}><Paint c={c.accent} gloss={0.2} /></Box>)}<Box p={[-1.45, 3.08, m * 1.27]} s={[6.6, 0.55, 0.012]}><Matte c={c.paint} /></Box></group>)}
    <Box p={[-4.83, 2.38, 0]} s={[0.02, 2.62, 0.03]}><Metal /></Box>
    {pairs(ax, 1.08, r, x.spin, { w: 0.34, rim: "#adb3b8", spokes: 8 })}
  </group>;
};

/* ---------- Two and three wheelers ---------- */
const ThinWheel: React.FC<{ x: number; r: number; spin: number; width?: number; spokes?: number; y?: number; z?: number }> = ({ x, r, spin, width = 0.028, spokes = 18, y, z = 0 }) => <group position={[x, y ?? r, z]}>
  <mesh castShadow><torusGeometry args={[r - width, width, 10, 40]} /><Matte c="#121315" r={0.92} /></mesh>
  <mesh><torusGeometry args={[r - width * 2.2, width * 0.42, 8, 40]} /><Metal /></mesh>
  <group rotation={[0, 0, -spin / r]}>{Array.from({ length: spokes }, (_, i) => <group key={i} rotation={[0, 0, (i / spokes) * Math.PI * 2]}><mesh position={[0, (r - width * 2) / 2, 0]}><cylinderGeometry args={[0.0035, 0.0035, r - width * 2, 5]} /><Metal /></mesh></group>)}</group>
  <Disc p={[0, 0, 0]} r={Math.max(0.025, r * 0.1)} w={0.08}><Metal /></Disc>
</group>;
const Bicycle: React.FC<{ x: Ctx }> = ({ x }) => {
  const c = x.c.paint, bb = [0, 0.31, 0], se = [-0.15, 0.82, 0], hd = [0.43, 0.86, 0], hb = [0.46, 0.76, 0], rw = [-0.54, 0.34], fw = [0.56, 0.34], a = x.spin / 0.34 * 0.55;
  return <group>
    <ThinWheel x={rw[0]} r={0.34} spin={x.spin} /><ThinWheel x={fw[0]} r={0.34} spin={x.spin} />
    <Tube a={bb} b={se} r={0.017}><Paint c={c} /></Tube><Tube a={bb} b={hb} r={0.021}><Paint c={c} /></Tube><Tube a={se} b={hd} r={0.017}><Paint c={c} /></Tube><Tube a={hd} b={hb} r={0.024}><Paint c={c} /></Tube>
    {[1, -1].map((m) => <group key={m}><Tube a={[bb[0], bb[1], m * 0.02]} b={[rw[0], rw[1], m * 0.05]} r={0.009}><Paint c={c} /></Tube><Tube a={[se[0], se[1] - 0.03, m * 0.015]} b={[rw[0], rw[1], m * 0.05]} r={0.008}><Paint c={c} /></Tube><Tube a={[hb[0], hb[1], m * 0.018]} b={[fw[0], fw[1], m * 0.05]} r={0.012}><Metal /></Tube></group>)}
    <Tube a={se} b={[-0.19, 0.97, 0]} r={0.012}><Metal /></Tube><Ball p={[-0.2, 0.99, 0]} s={[0.13, 0.025, 0.055]}><Matte c="#16171a" /></Ball>
    <Tube a={hd} b={[0.41, 1.0, 0]} r={0.012}><Metal /></Tube><Tube a={[0.41, 1.0, -0.26]} b={[0.41, 1.0, 0.26]} r={0.011}><Metal /></Tube>{[1, -1].map((m) => <Tube key={m} a={[0.41, 1.0, m * 0.18]} b={[0.41, 1.0, m * 0.27]} r={0.016}><Matte c="#121315" /></Tube>)}
    <Disc p={[0, 0.31, 0.03]} r={0.085} w={0.008}><Metal c="#7d838a" /></Disc>
    <Tube a={[0, 0.39, 0.035]} b={[rw[0], rw[1] + 0.035, 0.04]} r={0.004}><Matte c="#222" /></Tube><Tube a={[0, 0.23, 0.035]} b={[rw[0], rw[1] - 0.035, 0.04]} r={0.004}><Matte c="#222" /></Tube>
    {[1, -1].map((m) => { const dx = Math.cos(a) * 0.16 * m, dy = Math.sin(a) * 0.16 * m; return <group key={m}><Tube a={[0, 0.31, m * 0.05]} b={[dx, 0.31 + dy, m * 0.06]} r={0.008}><Metal /></Tube><Box p={[dx, 0.31 + dy, m * 0.105]} s={[0.09, 0.016, 0.08]}><Matte c="#16171a" /></Box></group>; })}
  </group>;
};
const Motorcycle: React.FC<{ x: Ctx }> = ({ x }) => {
  const { c } = x, rw = -0.72, fw = 0.76, r = 0.32;
  return <group>
    {[rw, fw].map((w) => <group key={w}><ThinWheel x={w} r={r} spin={x.spin} width={0.05} spokes={0} />
      <group position={[w, r, 0]} rotation={[0, 0, -x.spin / r]}>{Array.from({ length: 5 }, (_, i) => <group key={i} rotation={[0, 0, (i / 5) * 6.283]}><Box p={[0, 0.13, 0]} s={[0.035, 0.24, 0.025]}><Matte c={c.accent} /></Box></group>)}<Disc p={[0, 0, 0.05]} r={0.13} w={0.01}><Metal /></Disc></group></group>)}
    <Prism pts={[[-0.12, 0.28], [0.3, 0.3], [0.34, 0.62], [-0.2, 0.62]]} w={0.3} b={0.02} r={0.04}><Matte c="#303338" r={0.5} /></Prism>
    {[0, 1, 2, 3, 4].map((i) => <Box key={i} p={[0.09, 0.66 + i * 0.03, 0]} s={[0.3, 0.012, 0.28]}><Metal c="#8d9298" /></Box>)}
    <Disc p={[-0.02, 0.38, 0.16]} r={0.11} w={0.03}><Metal /></Disc>
    <Tube a={[0.33, 0.95, 0]} b={[-0.3, 0.78, 0]} r={0.035}><Matte c="#1b1c1f" /></Tube><Tube a={[0.33, 0.95, 0]} b={[0.26, 0.42, 0]} r={0.03}><Matte c="#1b1c1f" /></Tube><Tube a={[-0.25, 0.45, 0]} b={[0.26, 0.42, 0]} r={0.025}><Matte c="#1b1c1f" /></Tube>
    <Ball p={[0.14, 0.92, 0]} s={[0.3, 0.14, 0.15]}><Paint c={c.paint} /></Ball>
    <Prism pts={[[-0.68, 0.88], [-0.48, 0.84], [-0.12, 0.8], [-0.08, 0.86], [-0.42, 0.93], [-0.7, 0.97]]} w={0.24} b={0.025} r={0.03}><Matte c="#121315" /></Prism>
    <Prism pts={[[-0.86, 0.9], [-0.62, 0.72], [-0.24, 0.72], [-0.24, 0.8], [-0.6, 0.87]]} w={0.17} b={0.015} r={0.03}><Paint c={c.paint} /></Prism>
    <Box p={[-0.88, 0.9, 0]} s={[0.03, 0.05, 0.12]}><Lamp c="#ff2a1f" on={x.lights} off="#a51d17" /></Box>
    {[1, -1].map((m) => <group key={m}><Tube a={[0.43, 1.03, m * 0.09]} b={[fw, r, m * 0.09]} r={0.021}><Metal /></Tube><Tube a={[-0.3, 0.42, m * 0.11]} b={[rw, r, m * 0.09]} r={0.02}><Matte c="#1b1c1f" /></Tube><Tube a={[0.43, 1.12, m * 0.09]} b={[0.39, 1.17, m * 0.36]} r={0.012}><Metal /></Tube><Tube a={[0.39, 1.17, m * 0.27]} b={[0.39, 1.17, m * 0.39]} r={0.018}><Matte c="#111" /></Tube></group>)}
    <Tube a={[0.25, 0.3, 0.13]} b={[-0.45, 0.42, 0.16]} r={0.024}><Metal /></Tube><Tube a={[-0.42, 0.41, 0.16]} b={[-0.9, 0.52, 0.17]} r={0.05} r2={0.056}><Metal /></Tube>
    <Ball p={[0.52, 1.06, 0]} s={[0.1, 0.095, 0.095]}><Lamp c="#fff5d0" on={x.lights} off="#e9edf0" /></Ball>
    <Prism pts={[[0.5, 0.56], [0.76, 0.66], [1.04, 0.61], [0.84, 0.72], [0.54, 0.65]]} w={0.13} b={0.008}><Paint c={c.paint} /></Prism>
  </group>;
};
const Scooter: React.FC<{ x: Ctx }> = ({ x }) => {
  const { c } = x, r = 0.25, rw = -0.56, fw = 0.64;
  return <group>
    {[rw, fw].map((w) => <group key={w}><ThinWheel x={w} r={r} spin={x.spin} width={0.045} spokes={0} />
      <group position={[w, r, 0]} rotation={[0, 0, -x.spin / r]}>{Array.from({ length: 5 }, (_, i) => <group key={i} rotation={[0, 0, (i / 5) * 6.283]}><Box p={[0, 0.085, 0]} s={[0.05, 0.13, 0.03]}><Metal /></Box></group>)}<Disc p={[0, 0, 0]} r={0.05} w={0.07}><Metal /></Disc></group></group>)}
    {/* Rear body with rounded side panels */}
    <Prism pts={[[-0.9, 0.5], [-0.87, 0.72], [-0.68, 0.76], [-0.16, 0.74], [-0.07, 0.56], [-0.09, 0.34], [-0.3, 0.33], [-0.72, 0.41]]} w={0.3} b={0.05} r={0.1}><Paint c={c.paint} /></Prism>
    {[1, -1].map((m) => <group key={m}>
      <Ball p={[-0.5, 0.56, m * 0.15]} s={[0.36, 0.17, 0.055]}><Paint c={c.paint} /></Ball>
      {[0, 1, 2].map((i) => <Box key={i} p={[-0.3 - i * 0.05, 0.47, m * 0.2]} s={[0.018, 0.1, 0.012]}><Matte c="#17181a" /></Box>)}
      <Tube a={[0.46, 0.5, m * 0.075]} b={[fw, r, m * 0.075]} r={0.018}><Metal /></Tube>
      <Tube a={[0.5, 1.13, m * 0.05]} b={[0.47, 1.15, m * 0.33]} r={0.014}><Metal /></Tube>
      <Tube a={[0.47, 1.15, m * 0.25]} b={[0.47, 1.15, m * 0.36]} r={0.019}><Matte c="#111" /></Tube>
      <Tube a={[0.48, 1.16, m * 0.18]} b={[0.44, 1.29, m * 0.23]} r={0.005}><Metal /></Tube>
      <Ball p={[0.44, 1.31, m * 0.24]} s={[0.018, 0.035, 0.05]}><Metal /></Ball>
      <Tube a={[-0.72, 0.84, m * 0.13]} b={[-0.95, 0.84, m * 0.13]} r={0.009}><Metal /></Tube>
    </group>)}
    <Tube a={[-0.95, 0.84, -0.13]} b={[-0.95, 0.84, 0.13]} r={0.009}><Metal /></Tube>
    <Box p={[-0.92, 0.66, 0]} s={[0.05, 0.08, 0.17]}><Lamp c="#ff2a1f" on={x.lights} off="#a51d17" /></Box>
    <Prism pts={[[-0.76, 0.76], [-0.74, 0.86], [-0.42, 0.87], [-0.36, 0.84], [-0.28, 0.89], [-0.12, 0.86], [-0.1, 0.74]]} w={0.27} b={0.03} r={0.03}><Matte c={c.accent} r={0.62} /></Prism>
    {/* Floorboard with a rubber mat */}
    <Box p={[0.14, 0.31, 0]} s={[0.56, 0.07, 0.38]}><Paint c={c.paint} /></Box>
    <Box p={[0.14, 0.35, 0]} s={[0.46, 0.012, 0.31]}><Matte c="#17181a" /></Box>
    {/* Leg shield, tall and curved, with a contrasting inner panel */}
    <Prism pts={[[0.34, 0.28], [0.46, 0.3], [0.53, 0.62], [0.56, 1.0], [0.5, 1.03], [0.45, 0.7], [0.36, 0.42]]} w={0.42} b={0.025} r={0.05}><Paint c={c.paint} /></Prism>
    <Prism pts={[[0.33, 0.36], [0.35, 0.36], [0.45, 0.72], [0.49, 0.98], [0.47, 0.98], [0.43, 0.72]]} w={0.3} b={0.006}><Matte c="#eeeae0" r={0.55} /></Prism>
    <Tube a={[0.53, 1.0, 0]} b={[0.5, 1.12, 0]} r={0.035}><Metal /></Tube>
    <Ball p={[0.5, 1.14, 0]} s={[0.13, 0.065, 0.13]}><Paint c={c.paint} /></Ball>
    <Ball p={[0.61, 1.13, 0]} s={[0.055, 0.075, 0.075]}><Lamp c="#fff5d0" on={x.lights} off="#ffffff" /></Ball>
    <Box p={[0.57, 0.72, 0]} s={[0.012, 0.25, 0.04]} rot={[0, 0, 0.1]}><Metal /></Box>
    {/* Front fender hugging the wheel */}
    <Prism pts={[[0.42, 0.33], [0.5, 0.5], [0.66, 0.56], [0.84, 0.47], [0.93, 0.31], [0.88, 0.31], [0.8, 0.43], [0.65, 0.5], [0.52, 0.45]]} w={0.15} b={0.012} r={0.04}><Paint c={c.paint} /></Prism>
    <Tube a={[-0.28, 0.33, 0.13]} b={[-0.82, 0.38, 0.13]} r={0.038}><Metal /></Tube>
    <Tube a={[-0.1, 0.3, 0.17]} b={[-0.34, 0.16, 0.19]} r={0.012}><Metal c="#3a3d41" /></Tube>
  </group>;
};
const AutoRickshaw: React.FC<{ x: Ctx }> = ({ x }) => {
  const { c } = x, r = 0.23;
  return <group>
    <Prism pts={[[-1.24, 0.34], [-1.28, 0.95], [0.6, 0.95], [1.28, 0.95], [1.32, 0.42], [1.2, 0.3]]} w={1.3} b={0.05} r={0.08}><Paint c={c.paint} /></Prism>
    <Prism pts={[[0.88, 0.94], [0.72, 1.6], [0.48, 1.6], [0.72, 0.94]]} w={1.22} b={0.01}><Glass c="#2f4553" /></Prism>
    <Prism pts={[[-1.34, 1.52], [-1.34, 1.68], [-0.9, 1.84], [0.45, 1.86], [0.86, 1.68], [0.86, 1.58]]} w={1.42} b={0.05} r={0.12}><Paint c={c.accent} /></Prism>
    {[1, -1].map((m) => <group key={m}><Tube a={[0.84, 0.94, m * 0.62]} b={[0.72, 1.6, m * 0.62]} r={0.022}><Matte c="#111" /></Tube><Tube a={[-0.4, 0.94, m * 0.62]} b={[-0.42, 1.6, m * 0.62]} r={0.022}><Matte c="#111" /></Tube><Tube a={[-1.25, 0.94, m * 0.62]} b={[-1.28, 1.56, m * 0.62]} r={0.024}><Matte c="#111" /></Tube><Disc p={[-0.75, r, m * 0.67]} r={r * 1.2} w={0.05}><Matte c="#08090a" /></Disc><Ball p={[1.37, 0.72, m * 0.42]} s={[0.06, 0.1, 0.12]}><Lamp c="#fff5d0" on={x.lights} off="#ffffff" /></Ball><Box p={[-1.3, 0.76, m * 0.48]} s={[0.03, 0.1, 0.12]}><Lamp c="#ff2a1f" on={x.lights} off="#a51d17" /></Box><Tube a={[0.7, 1.28, m * 0.62]} b={[0.86, 1.33, m * 0.83]} r={0.01}><Matte c="#111" /></Tube><Ball p={[0.87, 1.33, m * 0.86]} s={[0.025, 0.05, 0.06]}><Matte c="#111" /></Ball></group>)}
    <Box p={[-0.72, 1.04, 0]} s={[0.55, 0.2, 1.14]}><Matte c="#1b1d21" /></Box><Box p={[-0.92, 1.36, 0]} s={[0.12, 0.46, 1.14]}><Matte c="#1b1d21" /></Box>
    <Box p={[0.45, 1.22, 0]} s={[0.04, 0.03, 0.58]}><Metal /></Box><Tube a={[0.68, 0.94, 0]} b={[0.46, 1.22, 0]} r={0.018}><Matte c="#111" /></Tube>
    <Box p={[1.33, 0.48, 0]} s={[0.04, 0.11, 0.4]}><Matte c="#f4e23a" /></Box>
    <Tube a={[1.08, 0.45, 0.04]} b={[1.1, r, 0.04]} r={0.018}><Metal /></Tube><Tube a={[1.08, 0.45, -0.04]} b={[1.1, r, -0.04]} r={0.018}><Metal /></Tube>
    <Prism pts={[[0.85, 0.4], [1.1, 0.53], [1.38, 0.44], [1.14, 0.48]]} w={0.2} b={0.012}><Paint c={c.paint} /></Prism>
    <Wheel x={1.1} z={0} r={r} w={0.13} spin={x.spin} spokes={5} />{pairs([-0.75], 0.6, r, x.spin, { w: 0.13 })}
  </group>;
};

/* ---------- Rail ---------- */
const RailCar: React.FC<{ kind: "train" | "tram"; x: Ctx }> = ({ kind, x }) => {
  const { c } = x, tram = kind === "tram", L = tram ? 14 : 22, W = tram ? 2.4 : 3, H = tram ? 3.35 : 3.85, fr = L / 2, rr = -L / 2, low = tram ? 0.42 : 1.05, zs = W / 2, wr = tram ? 0.34 : 0.48, bogies = tram ? [fr - 3, rr + 3] : [fr - 4.2, rr + 4.2];
  const noseTop = tram ? fr - 1.1 : fr - 3.2, winA = tram ? 1.32 : 2.05, winB = H - (tram ? 0.5 : 0.62), nw = tram ? 6 : 8, x0 = rr + 0.6, x1 = noseTop - 0.6, ww = (x1 - x0) / nw;
  return <group>
    <Prism pts={[[rr, low], [rr, H - 0.28], [rr + 0.3, H], [noseTop, H], [fr - (tram ? 0.22 : 1.1), low + (tram ? 1.45 : 1.25)], [fr, low + (tram ? 0.3 : 0.25)], [fr, low]]} w={W} b={0.1} r={tram ? 0.32 : 0.55}><Paint c={c.paint} /></Prism>
    <Prism pts={[[noseTop - 0.32, H - 0.2], [noseTop - 0.12, H - 0.16], [fr - (tram ? 0.26 : 1.18), low + (tram ? 1.5 : 1.34)], [fr - (tram ? 0.86 : 2), low + (tram ? 1.02 : 1.05)]]} w={W - 0.3} b={0.03}><Glass c="#14232e" /></Prism>
    {[1, -1].map((m) => <group key={m}>
      <Box p={[(x0 + x1) / 2, (winA + winB) / 2, m * (zs + 0.005)]} s={[x1 - x0 + 0.1, winB - winA + 0.14, 0.012]}><Matte c="#171a1d" /></Box>
      {Array.from({ length: nw }, (_, i) => <Box key={i} p={[x0 + ww * (i + 0.5), (winA + winB) / 2, m * (zs + 0.012)]} s={[ww - 0.2, winB - winA, 0.012]}><Glass /></Box>)}
      <Box p={[(rr + fr - 0.5) / 2, winA - 0.28, m * (zs + 0.006)]} s={[L - 1, 0.24, 0.012]}><Paint c={c.accent} /></Box>
      {[x0 + ww * 1, x1 - ww * 1].map((d) => <group key={d}><Box p={[d, (low + winB + 0.05) / 2, m * (zs + 0.018)]} s={[ww - 0.12, winB + 0.05 - low - 0.14, 0.018]}><Paint c={c.trim} /></Box>{[-0.25, 0.25].map((o) => <Box key={o} p={[d + o * (ww / 1.5), (winA + winB) / 2, m * (zs + 0.03)]} s={[ww * 0.3, winB - winA, 0.01]}><Glass /></Box>)}</group>)}
      <Ball p={[fr - 0.02, low + 0.42, m * (zs - 0.42)]} s={[0.07, 0.11, 0.2]}><Lamp c="#fff5d0" on={x.lights} off="#e9edf0" /></Ball><Box p={[rr, low + 0.5, m * (zs - 0.42)]} s={[0.03, 0.17, 0.2]}><Lamp c="#ff2a1f" on={x.lights} off="#a51d17" /></Box>
    </group>)}
    {!tram ? <><Box p={[0, low - 0.28, 0]} s={[L - 1.2, 0.5, W - 0.5]}><Matte c="#1b1d20" /></Box><Box p={[fr - 0.05, 0.78, 0]} s={[0.5, 0.5, W - 0.5]}><Matte c="#25282c" /></Box></> : null}
    {bogies.map((b) => <group key={b}><Box p={[b, wr + 0.14, 0]} s={[3, 0.32, W - 0.72]}><Matte c="#101214" /></Box>{[1, -1].map((m) => <Box key={m} p={[b, wr, m * (W / 2 - 0.42)]} s={[2.7, 0.22, 0.09]}><Matte c="#1e2023" /></Box>)}{pairs([b - 1, b + 1], W / 2 - 0.5, wr, x.spin, { w: 0.13, rim: "#9fa5ab", spokes: 6 })}</group>)}
    {tram ? <group><Box p={[0, H + 0.07, 0]} s={[3.2, 0.14, 1.2]}><Matte c="#2b2d31" /></Box><Tube a={[-0.7, H + 0.14, 0]} b={[0.15, H + 0.72, 0]} r={0.026}><Metal /></Tube><Tube a={[0.15, H + 0.72, 0]} b={[-0.45, H + 1.22, 0]} r={0.022}><Metal /></Tube><Box p={[-0.45, H + 1.24, 0]} s={[0.08, 0.05, 1.3]}><Metal /></Box></group> : Array.from({ length: 4 }, (_, i) => <Prism key={i} pts={[[-7 + i * 3.8, H], [-6.9 + i * 3.8, H + 0.22], [-5.1 + i * 3.8, H + 0.22], [-5 + i * 3.8, H]]} w={1.6} b={0.03} r={0.04}><Matte c="#9fa4a8" /></Prism>)}
  </group>;
};

/* ---------- Painted bodies of revolution ---------- */
type Prof = (u: number) => number[]; // [radius across, radius up, center y]
const Fuselage: React.FC<{ id: string; x0: number; x1: number; prof: Prof; paint: (g: CanvasRenderingContext2D, W: number, H: number) => void; dep: string }> = ({ id, x0, x1, prof, paint, dep }) => {
  const g = useMemo(() => once(`f${id}`, () => { const R = 100, S = 40, pos: number[] = [], uv: number[] = [], idx: number[] = []; for (let i = 0; i <= R; i++) { const u = i / R, [rz, ry, cy] = prof(u); for (let j = 0; j <= S; j++) { const a = (j / S) * Math.PI * 2, s = Math.sin(a); pos.push(x1 + (x0 - x1) * u, cy + s * ry, Math.cos(a) * rz); uv.push(u, (s + 1) / 2); } } for (let i = 0; i < R; i++) for (let j = 0; j < S; j++) { const a = i * (S + 1) + j, b = a + S + 1; idx.push(a, b, a + 1, b, b + 1, a + 1); } const t = new THREE.BufferGeometry(); t.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); t.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); t.setIndex(idx); t.computeVertexNormals(); return t; }), [id]);
  const tex = useMemo(() => { const c = document.createElement("canvas"); c.width = 2048; c.height = 512; paint(c.getContext("2d")!, 2048, 512); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; }, [dep]);
  return <mesh geometry={g} castShadow receiveShadow><meshPhysicalMaterial map={tex} roughness={0.35} metalness={0.1} clearcoat={0.7} clearcoatRoughness={0.15} side={THREE.DoubleSide} /></mesh>;
};
/** Flat wing shape. Points are [x, spanwise]; `sides` mirrors it to both sides. */
const Wing: React.FC<{ pts: P[]; t: number; y: number; c: string; sides?: boolean; metal?: boolean }> = ({ pts, t, y, c, sides = true }) => <>{(sides ? [1, -1] : [1]).map((m) => <Prism key={m} pts={pts.map((p) => [p[0], p[1] * m])} w={t} b={t * 0.35} rot={[Math.PI / 2, 0, 0]} pos={[0, y, 0]}><Paint c={c} gloss={0.5} /></Prism>)}</>;
const Airliner: React.FC<{ x: Ctx }> = ({ x }) => {
  const { c } = x;
  const prof: Prof = (u) => { const nose = Math.min(1, Math.sqrt(Math.min(1, u / 0.1)) * (1 - 0.0) ); const tail = u > 0.72 ? Math.pow(1 - (u - 0.72) / 0.28, 0.85) : 1; const r = 1.98 * nose * Math.max(0.08, tail); return [r, r, 3.2 + (u > 0.72 ? (u - 0.72) * 3.2 : 0) - (u < 0.08 ? (0.08 - u) * 3 : 0)]; };
  const paint = (g: CanvasRenderingContext2D, W: number, H: number) => { g.fillStyle = "#f4f5f6"; g.fillRect(0, 0, W, H); g.fillStyle = c.paint; g.fillRect(0, H * 0.72, W, H * 0.28); g.fillStyle = c.accent; g.fillRect(0, H * 0.655, W, H * 0.065); g.fillStyle = "#17202a"; for (let i = 0; i < 74; i++) { const px = W * (0.145 + i * 0.0087); if (i % 25 === 24) continue; g.beginPath(); g.roundRect(px, H * 0.3, W * 0.0048, H * 0.052, 4); g.fill(); } g.fillStyle = "#1a2a38"; g.beginPath(); g.moveTo(W * 0.035, H * 0.34); g.lineTo(W * 0.07, H * 0.3); g.lineTo(W * 0.095, H * 0.3); g.lineTo(W * 0.095, H * 0.39); g.lineTo(W * 0.045, H * 0.39); g.fill(); g.strokeStyle = "rgba(0,0,0,.4)"; g.lineWidth = 3; for (const u of [0.12, 0.34, 0.62, 0.84]) { g.strokeRect(W * u, H * 0.25, W * 0.014, H * 0.28); } g.fillStyle = "#2e3338"; g.fillRect(W * 0.455, H * 0.74, W * 0.1, H * 0.26); };
  const eng = (ex: number, ez: number) => <group position={[ex, 1.95, ez]} key={`${ex}${ez}`}>
    <Tube a={[-1.7, 0, 0]} b={[1.5, 0, 0]} r={0.72} r2={0.9} seg={28}><Paint c="#eef0f1" /></Tube>
    <Tube a={[-2.3, 0, 0]} b={[-1.7, 0, 0]} r={0.4} r2={0.7} seg={24}><Metal c="#7f858b" /></Tube>
    <mesh position={[1.5, 0, 0]} rotation={[0, Math.PI / 2, 0]}><torusGeometry args={[0.84, 0.09, 10, 32]} /><Metal /></mesh>
    <group position={[1.42, 0, 0]} rotation={[x.rotor, 0, 0]}><Disc p={[0, 0, 0]} r={0.18} w={0.1}><Matte c="#101113" /></Disc><mesh rotation={[0, 0, -Math.PI / 2]} position={[0.14, 0, 0]}><coneGeometry args={[0.2, 0.4, 16]} /><Metal /></mesh>{Array.from({ length: 16 }, (_, i) => <group key={i} rotation={[(i / 16) * 6.283, 0, 0]}><Box p={[0, 0.48, 0]} s={[0.05, 0.62, 0.1]} rot={[0, 0.5, 0]}><Metal c="#555a60" /></Box></group>)}</group>
    <Box p={[0.1, 0.8, 0]} s={[1.9, 0.5, 0.14]}><Paint c="#eef0f1" /></Box>
  </group>;
  return <group>
    <Fuselage id="airliner" dep={JSON.stringify(c)} x0={-19.5} x1={19.5} prof={prof} paint={paint} />
    <Wing pts={[[3.8, 1.4], [-0.8, 1.4], [-6.4, 17.2], [-4.9, 17.2]]} t={0.28} y={2.3} c="#d9dcdf" />
    {[1, -1].map((m) => <Prism key={m} pts={[[-6.4, 0], [-4.9, 0], [-5.7, 1.5], [-6.4, 1.5]]} w={0.1} b={0.02} pos={[0, 2.5, m * 17.2]}><Paint c={c.accent} /></Prism>)}
    <Wing pts={[[-13.8, 0.2], [-16.6, 0.2], [-19.2, 6.4], [-17.9, 6.4]]} t={0.16} y={5.3} c="#d9dcdf" />
    <Prism pts={[[-13.6, 5.2], [-18.4, 11.9], [-19.9, 11.9], [-18.5, 5.2]]} w={0.3} b={0.06}><Paint c={c.paint} /></Prism>
    <Box p={[-18, 8.4, 0.17]} s={[1.9, 0.5, 0.012]} rot={[0, 0, -0.1]}><Matte c={c.accent} /></Box><Box p={[-18, 8.4, -0.17]} s={[1.9, 0.5, 0.012]} rot={[0, 0, -0.1]}><Matte c={c.accent} /></Box>
    {[6.8, -6.8].map((z) => eng(0.9, z))}
    {[[14.6, 0, 1], [-2.4, 2.35, 2], [-2.4, -2.35, 2]].map(([gx, gz, n], i) => <group key={i}><Tube a={[gx, 1.6, gz]} b={[gx, 0.55, gz]} r={0.11}><Metal /></Tube>{Array.from({ length: n }, (_, k) => <group key={k}>{[0.3, -0.3].map((o) => <Wheel key={o} x={gx + (n > 1 ? (k ? 0.6 : -0.6) : 0)} z={gz + o} r={0.5} w={0.3} spin={x.spin} spokes={6} />)}</group>)}</group>)}
    <Ball p={[-3.4, 1.35, 0]} s={[6.5, 0.72, 1.9]}><Paint c={c.paint} /></Ball>
  </group>;
};
const PropPlane: React.FC<{ x: Ctx }> = ({ x }) => {
  const { c } = x, prof: Prof = (u) => { const r = u < 0.1 ? 0.3 + (u / 0.1) * 0.25 : u < 0.42 ? 0.55 + ((u - 0.1) / 0.32) * 0.15 : 0.7 * (1 - (u - 0.42) / 0.58) ** 1.15 + 0.07; return [r * 0.88, r, 1.28 + (u > 0.42 ? (u - 0.42) * 0.42 : 0)]; };
  const paint = (g: CanvasRenderingContext2D, W: number, H: number) => { g.fillStyle = "#f6f6f2"; g.fillRect(0, 0, W, H); g.fillStyle = c.paint; g.fillRect(0, H * 0.54, W, H * 0.13); g.fillStyle = c.accent; g.fillRect(0, H * 0.67, W, H * 0.06); g.fillStyle = c.paint; g.fillRect(0, 0, W * 0.1, H); g.fillStyle = "#1f2f3b"; for (const [a, b] of [[0.16, 0.25], [0.28, 0.37]]) { g.beginPath(); g.roundRect(W * a, H * 0.12, W * (b - a), H * 0.32, 12); g.fill(); } };
  return <group>
    <Fuselage id="prop" dep={JSON.stringify(c)} x0={-3.9} x1={3.9} prof={prof} paint={paint} />
    <Wing pts={[[1.6, 0], [0.2, 0], [0.2, 5.5], [1.5, 5.5]]} t={0.15} y={2.0} c="#f2f2ee" />
    {[1, -1].map((m) => <group key={m}><Tube a={[0.9, 0.82, m * 0.55]} b={[0.9, 1.96, m * 2.5]} r={0.035}><Metal /></Tube><Box p={[0.92, 2.0, m * 5.3]} s={[1.2, 0.18, 0.2]}><Paint c={c.paint} /></Box><Tube a={[0.1, 0.8, m * 0.5]} b={[-0.1, 0.33, m * 1.2]} r={0.04}><Metal /></Tube><Wheel x={-0.1} z={m * 1.25} r={0.27} w={0.14} spin={x.spin} /><Ball p={[-0.1, 0.32, m * 1.25]} s={[0.42, 0.22, 0.13]}><Paint c={c.paint} /></Ball></group>)}
    <Tube a={[2.9, 0.75, 0]} b={[2.95, 0.3, 0]} r={0.035}><Metal /></Tube><Wheel x={2.95} z={0} r={0.25} w={0.12} spin={x.spin} />
    <Wing pts={[[-2.85, 0], [-3.7, 0], [-3.95, 1.75], [-3.3, 1.75]]} t={0.08} y={1.65} c="#f2f2ee" />
    <Prism pts={[[-2.7, 1.9], [-3.55, 3.0], [-4.05, 3.0], [-3.95, 1.75]]} w={0.1} b={0.02}><Paint c={c.paint} /></Prism>
    <group position={[3.98, 1.25, 0]} rotation={[x.rotor, 0, 0]}>
      <mesh rotation={[0, 0, -Math.PI / 2]}><coneGeometry args={[0.15, 0.36, 18]} /><Paint c={c.accent} /></mesh>
      {[0, 1].map((i) => <group key={i} rotation={[i * Math.PI, 0, 0]}><Prism pts={[[0, 0], [0, 0.95], [0.04, 0.98], [0.09, 0]]} w={0.1} b={0.01} rot={[0, 0.4, 0]}><Matte c="#1b1c1f" /></Prism></group>)}
    </group>
  </group>;
};
const Helicopter: React.FC<{ x: Ctx }> = ({ x }) => {
  const { c } = x, r = 1.0;
  return <group>
    <Ball p={[0.6, 1.6, 0]} s={[1.95, 1.0, 0.98]}><Paint c={c.paint} /></Ball>
    <Ball p={[1.25, 1.75, 0]} s={[1.42, 0.86, 0.9]}><Glass c="#2a4252" /></Ball>
    <Tube a={[-1, 1.9, 0]} b={[-6.2, 2.35, 0]} r={0.5} r2={0.12} seg={20}><Paint c={c.paint} /></Tube>
    <Prism pts={[[-1.2, 2.55], [-0.82, 2.95], [0.72, 2.95], [1.1, 2.5]]} w={0.9} b={0.08} r={0.15}><Paint c={c.paint} /></Prism>
    <Box p={[-3.2, 1.95, 0.32]} s={[3, 0.09, 0.012]} rot={[0, 0, 0.09]}><Matte c={c.accent} /></Box><Box p={[-3.2, 1.95, -0.32]} s={[3, 0.09, 0.012]} rot={[0, 0, 0.09]}><Matte c={c.accent} /></Box>
    <Prism pts={[[-5.5, 2.28], [-6.35, 3.4], [-6.85, 3.4], [-6.45, 2.2], [-6.2, 1.5], [-5.9, 1.5]]} w={0.11} b={0.02}><Paint c={c.paint} /></Prism>
    <Wing pts={[[-4.8, 0], [-5.4, 0], [-5.65, 1.15], [-5.15, 1.15]]} t={0.06} y={2.25} c={c.paint} />
    <group position={[-6.45, 2.9, 0.15]} rotation={[0, 0, x.rotor * 1.2]}><Disc p={[0, 0, 0]} r={0.09} w={0.08}><Metal /></Disc>{[0, 1].map((i) => <group key={i} rotation={[0, 0, (i * Math.PI) / 2]}><Box p={[0, 0, 0.03]} s={[0.1, 1.25, 0.02]}><Matte c="#17181a" /></Box></group>)}</group>
    <Tube a={[0, 2.9, 0]} b={[0, 3.45, 0]} r={0.08}><Metal /></Tube>
    <group position={[0, 3.46, 0]} rotation={[0, x.rotor, 0]}><Disc p={[0, 0, 0]} r={0.22} w={0.1}><Metal /></Disc>{[0, 1, 2, 3].map((i) => <group key={i} rotation={[0, (i * Math.PI) / 2, 0]}><Box p={[2.95, 0, 0]} s={[5.7, 0.04, 0.27]}><Matte c="#17181a" /></Box><Box p={[5.6, 0.002, 0]} s={[0.35, 0.042, 0.272]}><Matte c={c.accent} /></Box></group>)}</group>
    {[1, -1].map((m) => <group key={m}><Tube a={[-1.15, 0.13, m * 1]} b={[2.1, 0.13, m * 1]} r={0.05}><Metal c="#30343a" /></Tube><Tube a={[2.1, 0.13, m]} b={[2.5, 0.42, m]} r={0.05}><Metal c="#30343a" /></Tube><Tube a={[-0.5, 0.15, m * 1]} b={[-0.3, 0.84, m * 0.52]} r={0.045}><Metal c="#30343a" /></Tube><Tube a={[1.2, 0.15, m * 1]} b={[1, 0.84, m * 0.52]} r={0.045}><Metal c="#30343a" /></Tube><Tube a={[-0.1, 0.65, m * 0.95]} b={[-0.1, 2.36, m * 0.96]} r={0.012}><Matte c="#101010" /></Tube></group>)}
    <Tube a={[r * 0.2, 0.62, 0.0]} b={[2.25, 0.84, 0.0]} r={0.012}><Matte c="#101010" /></Tube>
  </group>;
};
const Jet: React.FC<{ x: Ctx }> = ({ x }) => {
  const { c } = x, prof: Prof = (u) => { const r = u < 0.38 ? 0.06 + 0.72 * Math.pow(u / 0.38, 0.72) : u < 0.86 ? 0.78 + (u - 0.38) * 0.2 : 0.87 - (u - 0.86) * 1.4; return [r * 0.95, r * 0.86, 2.05 - (u < 0.2 ? (0.2 - u) * 0.8 : 0)]; };
  const paint = (g: CanvasRenderingContext2D, W: number, H: number) => { g.fillStyle = c.paint; g.fillRect(0, 0, W, H); g.fillStyle = "rgba(0,0,0,.2)"; for (let i = 0; i < 90; i++) g.fillRect((i % 18) * (W / 18) + (i % 2) * 40, Math.floor(i / 18) * (H / 5), W / 40, 2); g.fillStyle = "#1c1e20"; g.fillRect(0, 0, W * 0.03, H); g.fillStyle = "#24272b"; g.fillRect(W * 0.92, 0, W * 0.08, H); g.fillStyle = c.accent; g.fillRect(W * 0.38, H * 0.48, W * 0.2, H * 0.04); };
  return <group>
    <Fuselage id="jet" dep={JSON.stringify(c)} x0={-7.1} x1={8.0} prof={prof} paint={paint} />
    <Ball p={[3.45, 2.58, 0]} s={[1.5, 0.42, 0.4]}><Glass c="#5a5228" /></Ball><Tube a={[2.9, 2.74, -0.38]} b={[2.9, 2.74, 0.38]} r={0.03}><Matte c="#1b1c1e" /></Tube>
    <Wing pts={[[1.4, 0.4], [-5.4, 0.4], [-5.3, 5.3], [-3.3, 5.3]]} t={0.12} y={1.95} c={c.paint} />
    <Wing pts={[[-3.4, 0.4], [-7.3, 0.4], [-7.6, 3.05], [-6.0, 3.05]]} t={0.09} y={1.8} c={c.paint} />
    {[1, -1].map((m) => <group key={m}>
      <Prism pts={[[-3.5, 2.4], [-5.75, 5.3], [-6.8, 5.3], [-6.05, 2.4]]} w={0.1} b={0.02} pos={[0, 0, m * 1.05]} rot={[m * -0.25, 0, 0]}><Paint c={c.paint} /></Prism>
      <Tube a={[-7.1, 1.96, m * 0.5]} b={[-7.75, 1.96, m * 0.5]} r={0.56} r2={0.42} seg={24}><Metal c="#6f747a" /></Tube><Disc p={[-7.4, 1.96, m * 0.5]} r={0.01} w={0.01}><Matte c="#111" /></Disc>
      <Prism pts={[[2.45, 1.05], [2.05, 2.0], [0.2, 2.1], [0.2, 1.05]]} w={0.68} b={0.03} pos={[0, 0, m * 1.02]}><Paint c={c.paint} /></Prism>
      <Tube a={[-2.2, 1.85, m * 5.3]} b={[-4.9, 1.85, m * 5.3]} r={0.05}><Metal /></Tube><Tube a={[-1.6, 1.85, m * 5.3]} b={[-2.2, 1.85, m * 5.3]} r={0.003} r2={0.05}><Metal /></Tube>
      <Tube a={[-2.6, 1.72, m * 3.4]} b={[-0.8, 1.72, m * 3.4]} r={0.09}><Matte c="#dfe1dd" /></Tube>
      <Tube a={[-2.2, 1.45, m * 1.3]} b={[-2.2, 0.28, m * 1.5]} r={0.07}><Metal /></Tube><Wheel x={-2.2} z={m * 1.5} r={0.34} w={0.2} spin={x.spin} />
    </group>)}
    <Tube a={[5.1, 1.25, 0]} b={[5.1, 0.27, 0]} r={0.06}><Metal /></Tube><Wheel x={5.1} z={0} r={0.27} w={0.14} spin={x.spin} />
  </group>;
};

/* ---------- Boats ---------- */
const hull = (L: number, W: number, deck: number, keel: number, bow: number, flat: number) => {
  const R = 60, S = 8, pos: number[] = [], idx: number[] = [];
  for (let i = 0; i <= R; i++) { const u = i / R, x = L / 2 - u * L, n = u < bow ? Math.sin((u / bow) * Math.PI / 2) ** 0.9 : 1, hw = (W / 2) * Math.max(0.005, n), d = deck + (u < bow ? (1 - u / bow) ** 2 * (deck - keel) * 0.28 : 0); const k = keel + (u < bow * 0.8 ? (1 - u / (bow * 0.8)) ** 2 * (deck - keel) * 0.5 : 0), sec = [[hw, d], [hw * 0.95, k + (d - k) * 0.42], [hw * 0.74, k + (d - k) * flat], [hw * 0.35, k + (d - k) * flat * 0.4], [0, k], [-hw * 0.35, k + (d - k) * flat * 0.4], [-hw * 0.74, k + (d - k) * flat], [-hw * 0.95, k + (d - k) * 0.42], [-hw, d]]; for (const q of sec) pos.push(x, q[1], q[0]); }
  for (let i = 0; i < R; i++) for (let j = 0; j < S; j++) { const a = i * (S + 1) + j, b = a + S + 1; idx.push(a, a + 1, b, b, a + 1, b + 1); }
  const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals(); return g;
};
const Speedboat: React.FC<{ x: Ctx }> = ({ x }) => {
  const { c } = x, g = once("hull-speed", () => hull(7.6, 2.5, 1.2, 0, 0.42, 0.22));
  return <group>
    <mesh geometry={g} castShadow><meshPhysicalMaterial color={c.paint} roughness={0.25} clearcoat={1} side={THREE.DoubleSide} /></mesh>
    <Prism pts={[[-3.74, 1.18], [-3.74, 1.22], [2.2, 1.22], [3.7, 1.46], [3.78, 1.4]]} w={0.012} b={0} pos={[0, 0, 1.25]}><Matte c={c.accent} /></Prism><Prism pts={[[-3.74, 1.18], [-3.74, 1.22], [2.2, 1.22], [3.7, 1.46], [3.78, 1.4]]} w={0.012} b={0} pos={[0, 0, -1.25]}><Matte c={c.accent} /></Prism>
    {[1, -1].map((m) => <Box key={m} p={[-0.8, 0.72, m * 1.23]} s={[5.2, 0.14, 0.012]}><Matte c={c.accent} /></Box>)}
    <Prism pts={[[1.2, 1.2], [3.2, 1.2], [3.4, 1.37], [1.4, 1.34]]} w={1.4} b={0.08} r={0.1}><Paint c="#f5f4ef" /></Prism>
    <Box p={[-1.2, 1.17, 0]} s={[4.9, 0.1, 2.25]}><Matte c="#c9a26b" r={0.6} /></Box>
    <Box p={[-1.1, 1.0, 0]} s={[4, 0.05, 1.9]}><Matte c="#1f2124" /></Box>
    <Prism pts={[[0.45, 1.25], [0.15, 1.92], [-0.1, 1.92], [0.05, 1.25]]} w={2} b={0.02}><Glass c="#2f4d5f" /></Prism>
    <Box p={[-0.7, 1.45, 0.42]} s={[0.55, 0.42, 0.58]}><Matte c="#eeece4" /></Box><Box p={[-0.7, 1.45, -0.42]} s={[0.55, 0.42, 0.58]}><Matte c="#eeece4" /></Box><Box p={[-0.95, 1.8, 0.42]} s={[0.12, 0.62, 0.56]}><Matte c="#eeece4" /></Box><Box p={[-0.95, 1.8, -0.42]} s={[0.12, 0.62, 0.56]}><Matte c="#eeece4" /></Box>
    <Box p={[-2.7, 1.42, 0]} s={[0.9, 0.42, 1.9]}><Matte c="#eeece4" /></Box>
    <Prism pts={[[-3.72, 1.2], [-3.95, 1.1], [-4.05, 0.55], [-3.7, 0.5]]} w={0.48} b={0.04} r={0.04}><Matte c="#1a1b1f" /></Prism><Tube a={[-3.92, 0.55, 0]} b={[-3.96, 0.1, 0]} r={0.05}><Matte c="#1a1b1f" /></Tube>
    <group position={[-4.0, 0.13, 0]} rotation={[x.rotor, 0, 0]}>{[0, 1, 2].map((i) => <group key={i} rotation={[(i / 3) * 6.283, 0, 0]}><Box p={[0, 0.11, 0]} s={[0.03, 0.2, 0.1]}><Metal /></Box></group>)}</group>
    <Tube a={[-3.5, 1.2, 0]} b={[-3.5, 2.1, 0]} r={0.02}><Metal /></Tube>
    <Box p={[-3.5, 2.0, 0.17]} s={[0.25, 0.17, 0.008]}><Matte c={c.accent} /></Box>
    {[1, -1].map((m) => <Tube key={m} a={[1.1, 1.38, m * 1]} b={[3.3, 1.5, m * 0.28]} r={0.016}><Metal /></Tube>)}
  </group>;
};
const CargoShip: React.FC<{ x: Ctx }> = ({ x }) => {
  const { c } = x, L = 62, W = 11, g = once("hull-ship", () => hull(L, W, 7.4, 0, 0.24, 0.1)), pal = ["#c7392f", "#2f6db0", "#e0a42f", "#3d8d5e", "#d8d9d4", "#7c4f9e", "#d26a2d", "#2c8b9b"];
  const boxes = useMemo(() => { const out: number[][] = []; for (let bay = 0; bay < 9; bay++) for (let row = -2; row <= 2; row++) { const hgt = 2 + ((bay * 7 + (row + 2) * 3) % 3); for (let h = 0; h < hgt; h++) out.push([18 - bay * 4.7, 8.6 + h * 2.25, row * 2.05, (bay * 13 + row * 5 + h * 7 + 40) % 8]); } return out; }, []);
  return <group>
    <mesh geometry={g} castShadow><meshPhysicalMaterial color={c.paint} roughness={0.5} clearcoat={0.3} side={THREE.DoubleSide} /></mesh>
    {[1, -1].map((m) => <Box key={m} p={[-5, 2.0, m * 5.51]} s={[43, 4, 0.02]}><Matte c={c.accent} /></Box>)}
    <Box p={[-4, 7.45, 0]} s={[50, 0.14, W - 0.2]}><Matte c="#6d7379" /></Box>
    {boxes.map((b, i) => <group key={i} position={[b[0], b[1], b[2]]}><Box p={[0, 0, 0]} s={[4.4, 2.2, 1.95]}><Matte c={pal[b[3]]} r={0.68} /></Box>{[-1, 1].map((sd) => <Box key={sd} p={[0, 0, sd * 0.985]} s={[4.2, 2, 0.02]}><Matte c={new THREE.Color(pal[b[3]]).multiplyScalar(0.72).getStyle()} /></Box>)}</group>)}
    <Box p={[-22.5, 11.5, 0]} s={[7, 8, 9.4]}><Paint c="#f2f2ec" gloss={0.3} /></Box><Box p={[-22, 16.7, 0]} s={[6, 2.4, 11.8]}><Paint c="#f2f2ec" gloss={0.3} /></Box><Box p={[-18.95, 16.8, 0]} s={[0.05, 1.1, 11.2]}><Glass /></Box>
    {[0, 1, 2].map((f) => [1, -1].map((m) => <Box key={`${f}${m}`} p={[-22.5, 9 + f * 2.2, m * 4.72]} s={[5.4, 0.6, 0.012]}><Glass /></Box>))}
    <Box p={[-27.2, 12.5, 0]} s={[3, 7.5, 3.5]}><Paint c={c.accent} gloss={0.2} /></Box><Box p={[-27.2, 15.3, 0]} s={[3.04, 0.9, 3.54]}><Matte c="#111" /></Box>
    <Tube a={[-22, 18, 0]} b={[-22, 21.5, 0]} r={0.09}><Metal /></Tube><Box p={[-22, 20.2, 0]} s={[0.1, 0.1, 2.6]}><Metal /></Box>
    <Box p={[27, 8.1, 0]} s={[4, 1.2, 5]}><Matte c="#c9b8a0" /></Box>
    <group position={[-31.2, 1.2, 0]} rotation={[x.rotor * 0.4, 0, 0]}>{[0, 1, 2, 3].map((i) => <group key={i} rotation={[(i / 4) * 6.283, 0, 0]}><Box p={[0, 0.8, 0]} s={[0.12, 1.5, 0.6]}><Metal c="#a98c47" /></Box></group>)}</group>
  </group>;
};

/* ---------- Catalog ---------- */
type Entry = { label: string; group: string; length: number; colors: VehicleColors; make: (x: Ctx) => React.ReactNode; wheelR: number };
const col = (paint: string, accent: string, trim = "#d8dbde"): VehicleColors => ({ paint, accent, trim });
export const VEHICLES: Record<string, Entry> = {
  sedan: { label: "Sedan", group: "Cars", length: 4.7, wheelR: 0.33, colors: col("#b4212b", "#111111"), make: (x) => <Car v="sedan" x={x} /> },
  hatchback: { label: "Hatchback", group: "Cars", length: 4, wheelR: 0.31, colors: col("#2a7fb8", "#111111"), make: (x) => <Car v="hatchback" x={x} /> },
  suv: { label: "SUV", group: "Cars", length: 4.7, wheelR: 0.39, colors: col("#3f5f7d", "#111111"), make: (x) => <Car v="suv" x={x} /> },
  sports: { label: "Sports Car", group: "Cars", length: 4.5, wheelR: 0.34, colors: col("#f0b416", "#121212"), make: (x) => <Car v="sports" x={x} /> },
  pickup: { label: "Pickup Truck", group: "Cars", length: 5.4, wheelR: 0.4, colors: col("#d7d9d6", "#111111"), make: (x) => <Car v="pickup" x={x} /> },
  taxi: { label: "Taxi", group: "Cars", length: 4.7, wheelR: 0.33, colors: col("#f5c518", "#111111"), make: (x) => <Car v="sedan" x={x} taxi /> },
  truck: { label: "Cargo Truck", group: "Trucks", length: 9.2, wheelR: 0.5, colors: col("#c8382d", "#e6e6df"), make: (x) => <Truck x={x} /> },
  citybus: { label: "City Bus", group: "Buses", length: 11.8, wheelR: 0.5, colors: col("#f1f1ec", "#1e6fbd"), make: (x) => <Bus kind="city" x={x} /> },
  schoolbus: { label: "School Bus", group: "Buses", length: 9.4, wheelR: 0.5, colors: col("#f4b618", "#111111"), make: (x) => <Bus kind="school" x={x} /> },
  doubledecker: { label: "Double-Decker Bus", group: "Buses", length: 10.6, wheelR: 0.5, colors: col("#c5211f", "#efe9d8"), make: (x) => <Bus kind="double" x={x} /> },
  bicycle: { label: "Bicycle", group: "Bikes", length: 1.8, wheelR: 0.34, colors: col("#0f8c7a", "#111111"), make: (x) => <Bicycle x={x} /> },
  motorcycle: { label: "Motorcycle", group: "Bikes", length: 2.1, wheelR: 0.32, colors: col("#c22a22", "#f0b416"), make: (x) => <Motorcycle x={x} /> },
  scooter: { label: "Scooter", group: "Bikes", length: 1.9, wheelR: 0.25, colors: col("#5fbfb2", "#6d4023"), make: (x) => <Scooter x={x} /> },
  autorickshaw: { label: "Auto Rickshaw", group: "Bikes", length: 2.7, wheelR: 0.23, colors: col("#2f8a4b", "#f3c21d"), make: (x) => <AutoRickshaw x={x} /> },
  train: { label: "Passenger Train", group: "Rail", length: 22, wheelR: 0.48, colors: col("#eff1f2", "#c62f26", "#2d4d78"), make: (x) => <RailCar kind="train" x={x} /> },
  tram: { label: "Tram", group: "Rail", length: 14, wheelR: 0.34, colors: col("#e6b325", "#f1efe3", "#ae2c22"), make: (x) => <RailCar kind="tram" x={x} /> },
  airliner: { label: "Airliner", group: "Aircraft", length: 39, wheelR: 0.5, colors: col("#1d4f96", "#d43a2c"), make: (x) => <Airliner x={x} /> },
  propplane: { label: "Propeller Plane", group: "Aircraft", length: 8.2, wheelR: 0.27, colors: col("#c8362b", "#20334f"), make: (x) => <PropPlane x={x} /> },
  helicopter: { label: "Helicopter", group: "Aircraft", length: 11, wheelR: 0, colors: col("#1f4f7a", "#f0b416"), make: (x) => <Helicopter x={x} /> },
  jet: { label: "Fighter Jet", group: "Aircraft", length: 15.6, wheelR: 0.34, colors: col("#7f8a93", "#c53a2d"), make: (x) => <Jet x={x} /> },
  speedboat: { label: "Speedboat", group: "Boats", length: 8, wheelR: 0, colors: col("#f4f4ef", "#1f5fa5"), make: (x) => <Speedboat x={x} /> },
  cargoship: { label: "Cargo Ship", group: "Boats", length: 62, wheelR: 0, colors: col("#1c2d40", "#a12e27"), make: (x) => <CargoShip x={x} /> },
};
export const VEHICLE_VARIETIES = Object.keys(VEHICLES);
export type VehicleProps = { variety?: string; t?: number; speed?: number; rotorSpeed?: number; lights?: boolean; colors?: Partial<VehicleColors>; position?: number[]; rotation?: number[]; scale?: number };
/** A detailed vehicle. `t` is seconds and `speed` is meters per second for the wheels. `rotorSpeed` is radians per second for propellers and rotors. */
export const Vehicle: React.FC<VehicleProps> = ({ variety = "sedan", t = 0, speed = 0, rotorSpeed = 30, lights = false, colors, position = [0, 0, 0], rotation = [0, 0, 0], scale = 1 }) => {
  const e = VEHICLES[variety] ?? VEHICLES.sedan, x: Ctx = { c: { ...e.colors, ...colors }, spin: t * speed, rotor: t * rotorSpeed, lights };
  return <group position={position as any} rotation={rotation as any} scale={scale}>{e.make(x)}</group>;
};

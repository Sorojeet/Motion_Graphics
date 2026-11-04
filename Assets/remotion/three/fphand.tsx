// Detailed first-person hand and forearm. Same setup as Hand in kit.tsx so it can replace it in new videos: palm up at the origin, fingers toward -z, arm toward +z.
// Use: <FPHand pose="hold" sleeve="long" colors={{ sleeve: "#2f7f86" }} /> grip 0 to 1 overrides the fingers, and side="right" mirrors it.
import React, { useMemo } from "react";
import * as THREE from "three";
import { clamp, mix, noise, rng } from "./kit";

export type FPHandColors = { skin: string; sleeve: string; cuff: string; watch: string };
const DEF: FPHandColors = { skin: "#c68c64", sleeve: "#2f7f86", cuff: "#256a70", watch: "#1d2024" };
const gs = (v: number, c: number, w: number) => Math.exp(-(((v - c) / w) ** 2));

/* ---------- Skin mesh ---------- */
type Ring = number[]; // z, half width x, half height y, y offset
const cat = (a: number, b: number, c: number, d: number, s: number) => 0.5 * (2 * b + (c - a) * s + (2 * a - 5 * b + 4 * c - d) * s * s + (3 * b - a - 3 * c + d) * s * s * s);
const cache = new Map<string, THREE.BufferGeometry>();
/** Smooth shape along -z with per-vertex skin tone. `tone` gets (0..1 along, x, y on the unit ring). `bump` pushes the surface. */
const skinTube = (key: string, rings: Ring[], skin: string, tone: (u: number, x: number, y: number) => number[], bump?: (u: number, x: number, y: number) => number, seg = 40, sub = 8) => {
  const k = key + skin; let g = cache.get(k); if (g) return g;
  const R: Ring[] = []; for (let i = 0; i < rings.length - 1; i++) for (let s = 0; s < sub; s++) { const p = rings[Math.max(0, i - 1)], a = rings[i], b = rings[i + 1], q = rings[Math.min(rings.length - 1, i + 2)]; R.push([0, 1, 2, 3].map((j) => cat(p[j] ?? 0, a[j] ?? 0, b[j] ?? 0, q[j] ?? 0, s / sub))); }
  R.push(rings[rings.length - 1].map((v) => v)); R[R.length - 1][3] = R[R.length - 1][3] ?? 0;
  const first = R[0], last = R[R.length - 1], all = [[first[0], first[1] * 0.02, first[2] * 0.02, first[3] ?? 0], ...R, [last[0], last[1] * 0.02, last[2] * 0.02, last[3] ?? 0]], pos: number[] = [], col: number[] = [], uv: number[] = [], idx: number[] = [], S = new THREE.Color(skin), c = new THREE.Color();
  all.forEach((r, i) => { const u = i / (all.length - 1); for (let j = 0; j <= seg; j++) { const a = (j / seg) * Math.PI * 2, x = Math.cos(a), y = Math.sin(a), e = 1 + (bump ? bump(u, x, y) : 0), q = 2 / 2.08; pos.push(Math.sign(x) * Math.abs(x) ** q * r[1] * e, Math.sign(y) * Math.abs(y) ** q * r[2] * e + (r[3] || 0), r[0]); const t = tone(u, x, y); c.copy(S).multiplyScalar(t[0]).lerp(new THREE.Color("#e8836e"), t[1]).lerp(new THREE.Color("#5a2e20"), t[2]); col.push(c.r, c.g, c.b); uv.push((j / seg) * 3, u * Math.max(0.6, Math.abs(rings[0][0] - rings[rings.length - 1][0])) * 5); } });
  for (let i = 0; i < all.length - 1; i++) for (let j = 0; j < seg; j++) { const a = i * (seg + 1) + j, b = a + seg + 1; idx.push(a, b, a + 1, a + 1, b, b + 1); }
  g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals(); const n = g.attributes.normal; for (let i = 0; i < n.count; i += seg + 1) n.setXYZ(i + seg, n.getX(i), n.getY(i), n.getZ(i)); cache.set(k, g); return g;
};
let pores: THREE.Texture | null = null;
const poreTex = () => { if (pores) return pores; const C = document.createElement("canvas"); C.width = C.height = 256; const x = C.getContext("2d")!, r = rng(5); x.fillStyle = "#808080"; x.fillRect(0, 0, 256, 256); for (let i = 0; i < 5200; i++) { x.fillStyle = r() > 0.55 ? "rgba(40,40,40,.34)" : "rgba(225,225,225,.2)"; const w = 0.6 + r() * 1.5; x.beginPath(); x.ellipse(r() * 256, r() * 256, w, w * (0.6 + r() * 0.8), r() * 3, 0, 7); x.fill(); } const t = new THREE.CanvasTexture(C); t.wrapS = t.wrapT = THREE.RepeatWrapping; pores = t; return t; };
const useSkinMat = () => useMemo(() => new THREE.MeshPhysicalMaterial({ vertexColors: true, bumpMap: poreTex(), bumpScale: 0.32, roughness: 0.5, sheen: 0.6, sheenColor: new THREE.Color("#ff9a7a"), sheenRoughness: 0.55, side: THREE.DoubleSide }), []);

/* ---------- Palm ---------- */
const crease = (x: number, z: number) => { // life, head and heart lines in palm coordinates
  const lifeX = -0.05 - 0.27 * Math.sin((Math.PI * (0.36 - z)) / 0.96), life = 0.8 * gs(x - lifeX, 0, 0.03) * (z > -0.13 && z < 0.34 ? 1 : 0);
  const head = gs(z - (-0.12 + (x + 0.32) * 0.26), 0, 0.018) * (x > -0.31 && x < 0.26 ? 1 : 0);
  const heart = gs(z - (-0.2 - (0.36 - x) * 0.2), 0, 0.018) * (x > -0.1 && x < 0.36 ? 1 : 0);
  return Math.max(life, head, heart);
};
const Z0 = 0.72, Z1 = -0.47, KN = [-0.27, -0.09, 0.09, 0.265];
const palmGeo = (skin: string) => skinTube("palm", [[Z0, 0.19, 0.11, -0.035], [0.52, 0.245, 0.14, -0.022], [0.3, 0.315, 0.165, -0.012], [0.1, 0.365, 0.17, 0], [-0.15, 0.39, 0.155, 0.006], [-0.33, 0.395, 0.12, 0.012], [-0.42, 0.37, 0.083, 0.016], [Z1, 0.28, 0.035, 0.018]], skin, (u, x, y) => {
  const z = mix(Z0, Z1, u), px = x * mix(0.22, 0.39, Math.min(1, u * 1.8)), up = clamp(y * 0.5 + 0.5), cr = y > 0.1 ? crease(px, z) : 0;
  const back = y < 0 ? -y : 0, knuck = KN.reduce((m, q) => Math.max(m, gs(px, q, 0.055) * gs(z, -0.385, 0.05)), 0), vein = back * 0.11 * gs(noise(px * 7 + 3, z * 3.6) - 0.5, 0, 0.022) * gs(z, 0.03, 0.27), wrist = up * (gs(z, 0.5, 0.009) + gs(z, 0.555, 0.009)) * gs(px, 0, 0.17);
  return [mix(0.86, 1.05, up) * (1 + (noise(px * 9, z * 9) - 0.5) * 0.045), up * 0.1 + 0.06 * up * gs(u, 0.25, 0.25) + back * knuck * 0.2 + up * 0.07 * gs(z, -0.34, 0.08), cr * 0.42 + vein + wrist * 0.38];
}, (u, x, y) => {
  const z = mix(Z0, Z1, u), px = x * 0.36; if (y <= 0) { const b = -y, ten = KN.reduce((m, q) => Math.max(m, gs(px - q * clamp(mix(1, 0.35, (z + 0.38) / 0.8)), 0, 0.03)), 0) * gs(z, -0.08, 0.26), kn = KN.reduce((m, q) => Math.max(m, gs(px, q, 0.058) * gs(z, -0.39, 0.052)), 0), veinUp = gs(noise(px * 7 + 3, z * 3.6) - 0.5, 0, 0.022) * gs(z, 0.03, 0.27); return b * (0.14 * ten + 0.1 * kn + 0.05 * veinUp); }
  return y * (0.17 * gs(px, -0.24, 0.13) * gs(z, 0.12, 0.26) + 0.12 * gs(px, 0.24, 0.12) * gs(z, 0.14, 0.27) + 0.075 * gs(z, -0.33, 0.07) - 0.13 * gs(px, 0.03, 0.14) * gs(z, -0.05, 0.14)) - 0.03 * crease(px, z) * y;
}, 110, 20);

/* ---------- Fingers ---------- */
const phalanx = (k: string, L: number, r0: number, r1: number, skin: string, tip: boolean, base: boolean) => skinTube(`ph${k}${L}${r0}${tip}${base}`, tip ? [[0.01, r0, r0 * 0.92], [-L * 0.3, r0 * 0.96, r0 * 0.88], [-L * 0.7, r1, r1 * 0.9], [-L * 0.93, r1 * 0.78, r1 * 0.68], [-L, r1 * 0.26, r1 * 0.22]] : [[0.012, r0 * 1.02, r0 * 0.97], [-L * 0.25, r0 * 0.98, r0 * 0.93], [-L * 0.65, (r0 + r1) * 0.49, (r0 + r1) * 0.46], [-L - 0.008, r1 * 1.02, r1 * 0.96]], skin, (u, x, y) => {
  const up = clamp(y * 0.5 + 0.5), ends = gs(u, 0.06, 0.06) + gs(u, 0.94, 0.06);
  if (tip && y < -0.06) { const ax = Math.abs(x) / 0.74, base = 0.2 + 0.07 * ax * ax, end = 0.8 - 0.05 * ax * ax; if (ax < 1 && u > base && u < end) { const edge = Math.min((1 - ax) / 0.14, (u - base) / 0.03, (end - u) / 0.02), rim = 1 - clamp(edge), free = u > end - 0.07 - 0.015 * Math.cos(ax * 1.6), moon = u < base + 0.09 * Math.sqrt(Math.max(0, 1 - (ax / 0.62) ** 2)) ; return [free ? 1.5 : moon ? 1.36 : 1.2, free ? 0 : moon ? 0.03 : 0.14, rim * 0.5]; } }
  return [mix(0.86, 1.05, up), tip ? 0.14 * gs(u, 0.86, 0.2) * up + 0.06 : up * 0.1, (y > 0 && !tip ? ends * 0.42 * up : 0) + (y < 0 ? (gs(u, 0.05, 0.08) + gs(u, 0.95, 0.08)) * (0.1 + 0.2 * Math.max(0, Math.sin(u * 95))) * (1 - up) : 0) + (y > 0 && tip ? gs(u, 0.05, 0.05) * 0.4 : 0)];
}, (u, x, y) => (y > 0 ? y * 0.06 * gs(u, 0.5, 0.26) : tip ? -y * 0.025 * gs(u, 0.5, 0.26) * gs(x, 0, 0.7) : -y * ((gs(u, 0.04, 0.09) + gs(u, 0.96, 0.09)) * (0.022 + 0.012 * Math.sin(u * 95)))), 36, 16);
const Finger: React.FC<{ x: number; z: number; len: number; r: number; curl: number; splay: number; skin: string; mat: THREE.Material; name: string }> = ({ x, z, len, r, curl, splay, skin, mat, name }) => {
  const L1 = len * 0.46, L2 = len * 0.3, L3 = len * 0.24, a1 = mix(0.12, 1.42, curl), a2 = mix(0.08, 1.62, curl), a3 = mix(0.05, 0.9, curl), r1 = r * 0.92, r2 = r * 0.84, r3 = r * 0.76;
  return <group position={[x, 0.012, z]} rotation={[a1, splay, 0]}>
    <mesh geometry={phalanx(`${name}1`, L1, r, r1, skin, false, true)} material={mat} castShadow />
    <group position={[0, 0, -L1]} rotation={[a2, 0, 0]}><mesh geometry={phalanx(`${name}2`, L2, r1, r2, skin, false, false)} material={mat} castShadow />
      <group position={[0, 0, -L2]} rotation={[a3, 0, 0]}><mesh geometry={phalanx(`${name}3`, L3, r2, r3, skin, true, false)} material={mat} castShadow /></group></group>
  </group>;
};
const Thumb: React.FC<{ curl: number; open: number; skin: string; mat: THREE.Material }> = ({ curl, open, skin, mat }) => {
  const yaw = mix(-0.42, 0.82, open), roll = mix(-0.65, -1.2, curl), tilt = mix(0.18, 0.32, curl), a2 = mix(0.08, 0.55, curl), a3 = mix(0.05, 0.75, curl);
  return <group position={[-0.28, 0.035, 0.17]} rotation={[tilt, yaw, roll, "YXZ"]}>
    <mesh geometry={skinTube("thumbbase", [[0.08, 0.075, 0.07], [-0.05, 0.098, 0.09], [-0.2, 0.09, 0.08], [-0.29, 0.082, 0.073]], skin, (u, x, y) => { const up = clamp(y * 0.5 + 0.5); return [mix(0.87, 1.05, up), up * 0.09, 0]; })} material={mat} castShadow />
    <group position={[0, 0, -0.27]} rotation={[a2, 0, 0]}><mesh geometry={phalanx("th1", 0.22, 0.083, 0.076, skin, false, false)} material={mat} castShadow />
      <group position={[0, 0, -0.22]} rotation={[a3, 0, 0]}><mesh geometry={phalanx("th2", 0.2, 0.076, 0.067, skin, true, false)} material={mat} castShadow /></group></group>
  </group>;
};

/* ---------- Poses ---------- */
export type FingerPose = { i: number; m: number; r: number; p: number; t: number; to: number; sp?: number; wrist?: number[] };
export const FP_POSES: Record<string, FingerPose> = {
  open: { i: 0, m: 0, r: 0, p: 0, t: 0, to: 1, sp: 1 }, relaxed: { i: 0.2, m: 0.27, r: 0.32, p: 0.36, t: 0.2, to: 0.65 }, hold: { i: 0.46, m: 0.48, r: 0.5, p: 0.5, t: 0.45, to: 0.5 }, grip: { i: 0.72, m: 0.76, r: 0.78, p: 0.8, t: 0.7, to: 0.2 }, fist: { i: 1, m: 1, r: 1, p: 1, t: 1, to: 0 },
  point: { i: 0, m: 0.95, r: 1, p: 1, t: 0.8, to: 0.15 }, thumbsup: { i: 1, m: 1, r: 1, p: 1, t: 0, to: 1 }, pinch: { i: 0.62, m: 0.3, r: 0.22, p: 0.14, t: 0.62, to: 0.3 }, peace: { i: 0, m: 0, r: 1, p: 1, t: 0.72, to: 0.42, sp: 2.8 }, reach: { i: 0.1, m: 0.14, r: 0.2, p: 0.25, t: 0.12, to: 0.82, sp: 0.8 },
};
export const FP_POSE_NAMES = Object.keys(FP_POSES);
export type FPHandProps = { pose?: string; from?: string; blend?: number; grip?: number; wiggle?: number; t?: number; side?: "left" | "right"; sleeve?: "long" | "rolled" | "short" | "bare"; watch?: boolean; colors?: Partial<FPHandColors>; position?: number[]; rotation?: number[]; scale?: number; armLength?: number };
const arm = (skin: string, len: number, end: number) => { const R: Ring[] = [[0.42, 0.21, 0.125, -0.025], [0.68, 0.225, 0.14, -0.04], [1.1, 0.27, 0.19, -0.08], [0.42 + (len - 0.42) * 0.55, 0.36, 0.28, -0.2], [len, 0.39, 0.32, -0.32]].filter((r) => r[0] <= end); const last = R[R.length - 1]; if (last[0] < end) R.push([end, last[1] * 0.9, last[2] * 0.9, last[3] - 0.015]); return skinTube(`arm${len}${end}`, R, skin, (u, x, y) => { const up = clamp(y * 0.5 + 0.5), freck = noise(x * 19 + u * 40, y * 19) > 0.93 ? 0.022 : 0; return [mix(0.84, 1.03, up) * (1 + (noise(x * 8 + u * 12, y * 8) - 0.5) * 0.04), up * 0.05 + 0.04 * gs(u, 0.05, 0.08), freck + (y > 0 ? 0.08 * gs(noise(x * 3, u * 7) - 0.5, 0, 0.025) : 0)]; }, (u, x, y) => (y > 0 ? y * (0.025 * gs(x, 0.25, 0.14) + 0.025 * gs(x, -0.25, 0.14)) * gs(u, 0.35, 0.3) : -y * 0.06 * gs(x, 0.55, 0.22) * gs(u, 0.08, 0.1)), 56, 10); };

const Cloth: React.FC<{ c: string }> = ({ c }) => <meshStandardMaterial color={c} roughness={0.8} />;
const sleeveStart = (kind: string) => (kind === "long" ? 0.82 : kind === "rolled" ? 1.35 : 2.1);
const Sleeve: React.FC<{ kind: string; c: FPHandColors; len: number }> = ({ kind, c, len }) => {
  const start = sleeveStart(kind), geo = useMemo(() => { const R = 80, S = 44, pos: number[] = [], idx: number[] = []; const rad = (z: number) => { const k = (z - 0.42) / (len - 0.42), a = mix(0.25, 0.42, Math.min(1, k * 1.25)), b = mix(0.17, 0.35, Math.min(1, k * 1.25)), cy = mix(-0.02, -0.34, Math.min(1, k * 1.2)); return [a, b, cy]; }; for (let i = 0; i <= R; i++) { const u = i / R, z = mix(start, len + 0.1, u), r = rad(z); for (let j = 0; j <= S; j++) { const t = (j / S) * Math.PI * 2, fold = 1.05 + 0.06 * noise(z * 2.6 + Math.cos(t) * 2, Math.sin(t) * 2.4) + 0.038 * Math.sin(z * 9 + t * 2.3 + noise(t, z) * 3) * gs(u, 0.22, 0.32); pos.push(Math.cos(t) * r[0] * fold, Math.sin(t) * r[1] * fold + r[2], z); } } for (let i = 0; i < R; i++) for (let j = 0; j < S; j++) { const a = i * (S + 1) + j, b = a + S + 1; idx.push(a, a + 1, b, a + 1, b + 1, b); } const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals(); return g; }, [start, len]);
  const k0 = Math.min(1, ((start + 0.075 - 0.42) / (len - 0.42)) * 1.25), cuffR = [mix(0.25, 0.42, k0) * 1.13, mix(0.17, 0.35, k0) * 1.13], cy = mix(-0.02, -0.34, Math.min(1, ((start + 0.075 - 0.42) / (len - 0.42)) * 1.2));
  return <group><mesh geometry={geo} castShadow><meshStandardMaterial color={c.sleeve} roughness={0.8} side={THREE.DoubleSide} /></mesh>
    <mesh position={[0, cy, start + 0.075]} rotation={[Math.PI / 2, 0, 0]} scale={[cuffR[0], 1, cuffR[1]]} castShadow><cylinderGeometry args={[1, 1.01, kind === "rolled" ? 0.26 : 0.18, 44, 1, true]} /><meshStandardMaterial color={c.cuff} roughness={0.75} side={THREE.DoubleSide} /></mesh>
    <mesh position={[0, cy, start + (kind === "rolled" ? 0.197 : 0.158)]} rotation={[Math.PI / 2, 0, 0]} scale={[cuffR[0] * 1.012, 1, cuffR[1] * 1.012]}><cylinderGeometry args={[1, 1, 0.01, 44, 1, true]} /><meshStandardMaterial color={c.sleeve} roughness={0.8} side={THREE.DoubleSide} /></mesh>
    {kind === "long" ? [0, 1].map((n) => <mesh key={n} position={[cuffR[0] + 0.002, cy + 0.04 - n * 0.09, start + 0.075]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.024, 0.024, 0.012, 14]} /><meshStandardMaterial color="#e8e2d2" roughness={0.3} /></mesh>) : null}
  </group>;
};
const Watch: React.FC<{ c: string; z: number }> = ({ c, z }) => <group position={[0, -0.03, z]}>
  <mesh rotation={[Math.PI / 2, 0, 0]} scale={[0.262, 1, 0.168]}><cylinderGeometry args={[1, 1, 0.12, 40, 1, true]} /><meshStandardMaterial color={c} roughness={0.5} side={THREE.DoubleSide} /></mesh>
  <mesh position={[0, -0.165, 0]}><cylinderGeometry args={[0.13, 0.13, 0.05, 30]} /><meshStandardMaterial color="#b9bdc2" metalness={0.8} roughness={0.25} /></mesh><mesh position={[0, -0.19, 0]}><cylinderGeometry args={[0.112, 0.112, 0.005, 30]} /><meshPhysicalMaterial color="#10151a" roughness={0.08} clearcoat={1} /></mesh>
</group>;

/** Detailed first-person hand. `pose` sets the fingers, `from` and `blend` move between poses, and `grip` (0 to 1) overrides with open-to-closed. `sleeve` is long, rolled, short or bare. */
export const FPHand: React.FC<FPHandProps> = ({ pose = "relaxed", from, blend = 1, grip, wiggle = 0, t = 0, side = "left", sleeve = "long", watch = false, colors, position = [0, 0, 0], rotation = [0, 0, 0], scale = 1, armLength = 3.6 }) => {
  const c = { ...DEF, ...colors }, mat = useSkinMat(), A = FP_POSES[from ?? pose] ?? FP_POSES.relaxed, B = FP_POSES[pose] ?? FP_POSES.relaxed, b = from ? clamp(blend) : 1, m = (k: "i" | "m" | "r" | "p" | "t" | "to") => mix(A[k], B[k], b);
  const w = (ph: number) => wiggle * 0.07 * Math.sin(t * 3 + ph), gv = grip !== undefined ? grip * 0.95 : null, f = (k: "i" | "m" | "r" | "p", ph: number) => clamp((gv ?? m(k)) + w(ph)), sp = mix(A.sp ?? 0.55, B.sp ?? 0.55, b), s = c.skin;
  return <group position={position as any} rotation={rotation as any} scale={[side === "right" ? -scale : scale, scale, scale]}>
    <mesh geometry={palmGeo(s)} material={mat} castShadow receiveShadow />
    <mesh geometry={arm(s, armLength, sleeve === "bare" ? armLength : sleeveStart(sleeve) + 0.13)} material={mat} castShadow />
    <Finger name="i" x={-0.27} z={-0.385} len={0.64} r={0.083} curl={f("i", 0)} splay={0.1 * sp} skin={s} mat={mat} />
    <Finger name="m" x={-0.09} z={-0.415} len={0.71} r={0.086} curl={f("m", 1.2)} splay={0.025 * sp} skin={s} mat={mat} />
    <Finger name="r" x={0.09} z={-0.4} len={0.66} r={0.081} curl={f("r", 2.3)} splay={-0.045 * sp} skin={s} mat={mat} />
    <Finger name="p" x={0.265} z={-0.355} len={0.51} r={0.07} curl={f("p", 3.4)} splay={-0.13 * sp} skin={s} mat={mat} />
    {KN.map((q, n) => <mesh key={q} position={[q, -0.042, [-0.375, -0.405, -0.39, -0.345][n]]} scale={[0.08, 0.032, 0.105]} castShadow><sphereGeometry args={[1, 20, 14]} /><meshPhysicalMaterial color={new THREE.Color(s).multiplyScalar(0.91).lerp(new THREE.Color("#e8836e"), 0.1)} roughness={0.5} sheen={0.5} sheenColor="#ff9a7a" /></mesh>)}
    {[[-0.18, -0.42], [0, -0.44], [0.18, -0.42]].map((q) => <mesh key={q[0]} position={[q[0], 0.018, q[1]]} scale={[0.058, 0.03, 0.065]}><sphereGeometry args={[1, 16, 12]} /><meshPhysicalMaterial color={new THREE.Color(s).multiplyScalar(1.02)} roughness={0.5} sheen={0.5} sheenColor="#ff9a7a" /></mesh>)}
    <mesh position={[-0.34, 0.03, -0.16]} rotation={[0, 0.5, 0]} scale={[0.058, 0.032, 0.18]}><sphereGeometry args={[1, 18, 12]} /><meshPhysicalMaterial color={new THREE.Color(s).multiplyScalar(0.99)} roughness={0.5} sheen={0.5} sheenColor="#ff9a7a" /></mesh>
    <Thumb curl={gv !== null ? gv * 0.8 : m("t")} open={gv !== null ? 1 - gv * 0.7 : m("to")} skin={s} mat={mat} />
    {sleeve !== "bare" ? <Sleeve kind={sleeve} c={c} len={armLength} /> : null}
    {watch ? <Watch c={c.watch} z={sleeve === "long" ? 0.68 : 0.64} /> : null}
  </group>;
};

// Lightweight background people for crowds. Each person comes from a seed, and everyone in a Crowd shares a few instanced meshes, so large groups stay fast.
// Use: <Crowd count={40} seed={3} area={[24, 14]} poses={["stand", "talk", "phone"]} t={time} /> or one person: <Extra seed={5} pose="wave" t={time} />
import React, { useMemo } from "react";
import * as THREE from "three";
import { Instances, mix, rng } from "./kit";

const D = Math.PI / 180;
const SKIN = ["#f2d0b5", "#e6b892", "#d9a47c", "#c68c64", "#a96f4a", "#8a5637", "#6b3f28", "#4f2d1d"];
const HAIR = ["#14100e", "#1e1511", "#2e1d13", "#47301e", "#6d4a2a", "#a07b45"];
const GREY = ["#b9b6b0", "#8f8d89", "#d8d5ce"];
const TOPS = ["#c8473f", "#d9a441", "#3f7fb0", "#2f8a6b", "#7d5fb0", "#e8e4da", "#36404f", "#d66f8f", "#8a9a5b", "#e27a3f", "#46688f", "#9b3c5a", "#5a6c7a", "#f0d9a8"];
const BOTTOMS = ["#27364d", "#1f2a3a", "#3a3a40", "#5b4a3a", "#2f4f4a", "#6c6f76", "#8c7a5c", "#191b20"];
const SHOES = ["#efece4", "#1d1b1a", "#4a3324", "#7b6a58", "#2e3340"];
export type ExtraSpec = { kind: "man" | "woman" | "boy" | "girl" | "elderman" | "elderwoman"; s: number; build: number; skin: string; hair: string; style: string; top: string; bottom: string; shoes: string; sleeve: "long" | "short"; outfit: "pants" | "skirt" | "dress" | "kurta" | "suit"; beard: boolean; glasses: boolean; acc: "none" | "backpack" | "handbag" | "phone"; acc2: string; stoop: number; ph: number };
const pick = <T,>(r: () => number, a: T[]) => a[Math.floor(r() * a.length)];
/** Makes a person from a seed. `force` overrides any field, such as { kind: "girl" }. */
export const makeExtra = (seed: number, force: Partial<ExtraSpec> = {}): ExtraSpec => {
  const r = rng(seed * 7919 + 13); r(); const q = r(), kind: ExtraSpec["kind"] = force.kind ?? (q < 0.34 ? "man" : q < 0.68 ? "woman" : q < 0.77 ? "boy" : q < 0.86 ? "girl" : q < 0.93 ? "elderman" : "elderwoman"), fem = kind === "woman" || kind === "girl" || kind === "elderwoman", kid = kind === "boy" || kind === "girl", old = kind === "elderman" || kind === "elderwoman";
  const s = kid ? 0.58 + r() * 0.17 : (fem ? 0.92 : 0.98) + r() * 0.1 - (old ? 0.03 : 0), hair = old ? pick(r, GREY) : pick(r, HAIR), style = fem ? pick(r, ["long", "bun", "bob", "ponytail", "scarf", "curly", "long"]) : pick(r, old ? ["short", "bald", "side", "cap"] : ["short", "side", "curly", "cap", "bald", "short"]), outfit: ExtraSpec["outfit"] = kid ? (fem && r() < 0.5 ? "dress" : "pants") : fem ? pick(r, ["pants", "skirt", "dress", "kurta"]) : pick(r, ["pants", "pants", "pants", "kurta", "suit"]);
  const suit = outfit === "suit";
  return { kind, s, build: kid ? 0.92 : 0.86 + r() * 0.42, skin: pick(r, SKIN), hair, style, top: suit ? pick(r, ["#2a3447", "#36404f", "#3b3b42"]) : pick(r, TOPS), bottom: suit ? "#2a3447" : pick(r, BOTTOMS), shoes: pick(r, SHOES), sleeve: r() < 0.5 || suit ? "long" : "short", outfit, beard: !fem && !kid && r() < 0.32, glasses: !kid && r() < 0.24, acc: kid ? (r() < 0.45 ? "backpack" : "none") : r() < 0.2 ? "backpack" : fem && r() < 0.3 ? "handbag" : "none", acc2: pick(r, ["#7b4b2a", "#1d2024", "#a33a3a", "#3f5f7d"]), stoop: old ? 9 : 0, ph: r() * 20, ...force };
};

/* ---------- Poses: arm [x, y, z, elbow], leg [hip, knee] ---------- */
export const EXTRA_POSES = ["stand", "talk", "phone", "wave", "cheer", "lookup", "clap", "armscrossed", "sit", "walk", "run"];
type P = { lean: number; spine: number; head: number[]; l: number[]; r: number[]; ll: number[]; rl: number[]; sit?: boolean; phone?: boolean };
const pose = (name: string, t: number): P => {
  const s = Math.sin, b: P = { lean: 0, spine: s(t * 1.4) * 0.6, head: [0, s(t * 0.5) * 4, 0], l: [2, 0, 6, -10], r: [2, 0, 6, -10], ll: [0, 1], rl: [-1, 3] };
  switch (name) {
    case "talk": return { ...b, spine: s(t * 1.8) * 2, head: [s(t * 2) * 3, s(t * 0.9) * 12, 0], l: [-14, -10, 12, -72 + s(t * 2.6) * 18], r: [3, 0, 7, -14] };
    case "phone": return { ...b, head: [14, 0, 0], l: [2, 0, 6, -10], r: [-42, -30, 10, -105], phone: true };
    case "wave": return { ...b, head: [0, 0, 4], r: [0, 0, 128, -38 + s(t * 7) * 22] };
    case "cheer": return { ...b, head: [-8, 0, 0], l: [-4, 0, 150 + s(t * 7) * 10, -20], r: [-4, 0, 150 + s(t * 7 + 1) * 10, -20] };
    case "lookup": return { ...b, spine: -3, head: [-30, s(t * 0.5) * 8, 0], r: [-4, 0, 110, -8] };
    case "clap": { const c = s(t * 11) * 8; return { ...b, l: [-30, -44 - c, 10, -90], r: [-30, -44 - c, 10, -90] }; }
    case "armscrossed": return { ...b, head: [-2, s(t * 0.5) * 6, 0], l: [-20, -60, 10, -102], r: [-14, -68, 12, -92] };
    case "sit": return { ...b, l: [-18, -8, 7, -62], r: [-18, -8, 7, -62], ll: [-86, 86], rl: [-86, 86], sit: true };
    case "walk": case "run": { const R = name === "run", q = t * (R ? 10 : 6.2), A = R ? 44 : 26, kn = (x: number) => (R ? 22 + 75 : 5 + 44) * Math.max(0, s(x - 0.9)) + (R ? 22 : 5); return { ...b, lean: R ? 10 : 2, spine: 0, head: [R ? -5 : 0, s(q) * 2, 0], l: [s(q) * (R ? 38 : 22), 0, 7, R ? -92 : -20 - s(q) * 10], r: [-s(q) * (R ? 38 : 22), 0, 7, R ? -92 : -20 + s(q) * 10], ll: [-s(q) * A, kn(q)], rl: [s(q) * A, kn(q + Math.PI)] }; }
    default: return b;
  }
};

/* ---------- Building a person from simple shapes ---------- */
type Kind = "ball" | "limb" | "torso" | "flare" | "box";
type Emit = (k: Kind, m: THREE.Matrix4, c: string) => void;
const V = new THREE.Vector3(), UP = new THREE.Vector3(0, 1, 0);
const T = (x: number, y: number, z: number) => new THREE.Matrix4().makeTranslation(x, y, z);
const R = (x: number, y: number, z: number) => new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(x * D, y * D, z * D));
const S = (x: number, y: number, z: number) => new THREE.Matrix4().makeScale(x, y, z);
const mul = (...a: THREE.Matrix4[]) => a.reduce((m, n) => m.clone().multiply(n));
const person = (sp: ExtraSpec, name: string, t0: number, root: THREE.Matrix4, emit: Emit) => {
  const t = t0 + sp.ph, p = pose(name, t), fem = sp.kind === "woman" || sp.kind === "girl" || sp.kind === "elderwoman", kid = sp.kind === "boy" || sp.kind === "girl", b = sp.build, hipW = (fem ? 0.165 : 0.15) * b, H = kid ? 1.28 : 1;
  const ball = (m: THREE.Matrix4, x: number, y: number, z: number, a: number, bb: number, cc: number, c: string) => emit("ball", mul(m, T(x, y, z), S(a, bb, cc)), c);
  const box = (m: THREE.Matrix4, x: number, y: number, z: number, a: number, bb: number, cc: number, c: string) => emit("box", mul(m, T(x, y, z), S(a, bb, cc)), c);
  const limb = (m: THREE.Matrix4, len: number, r0: number, _r1: number, c: string) => { emit("limb", mul(m, T(0, -len / 2, 0), S(r0, len, r0)), c); ball(m, 0, 0, 0, r0, r0, r0, c); ball(m, 0, -len, 0, r0 * 0.74, r0 * 0.74, r0 * 0.74, c); };
  const legY = (l: number[]) => 0.43 * Math.cos(l[0] * D) + 0.43 * Math.cos((l[0] + l[1]) * D) + 0.075;
  const hy = p.sit ? 0.47 : Math.max(legY(p.ll), legY(p.rl)), base = mul(root, S(sp.s, sp.s, sp.s));
  if (p.sit) box(base, 0, 0.22, -0.08, 0.44, 0.44, 0.42, "#5a4634");
  const hips = mul(base, T(0, hy, 0), R(p.lean, 0, 0));
  const skirt = sp.outfit === "skirt" || sp.outfit === "dress" || sp.outfit === "kurta", legC = sp.outfit === "skirt" || sp.outfit === "dress" ? sp.skin : sp.bottom;
  { const k = skirt ? 0.82 : 0.96; ball(hips, 0, -0.01, 0, hipW * k, 0.115, 0.105 * b * (skirt ? 0.86 : 1), sp.outfit === "dress" || sp.outfit === "kurta" ? sp.top : sp.bottom); }
  const leg = (m: number, l: number[]) => { const a = mul(hips, T(m * 0.085 * b, -0.03, 0), R(l[0], 0, -m * 0)); const thick = (fem ? 0.072 : 0.075) * (0.7 + b * 0.3); limb(a, 0.43, thick, 0, legC); const k = mul(a, T(0, -0.43, 0), R(l[1], 0, 0)); limb(k, 0.43, thick * 0.74, 0, legC); const ft = mul(k, T(0, -0.43, 0)); ball(ft, 0, -0.04, 0.055, 0.046, 0.036, 0.115, sp.shoes); };
  leg(1, p.ll); leg(-1, p.rl);
  const sp2 = mul(hips, T(0, 0.08, 0), R(p.spine + sp.stoop, 0, 0));
  const tw = (fem ? 0.155 : 0.175) * (0.72 + b * 0.28), td = 0.11 * (0.65 + b * 0.35), sh = tw * 1.04;
  emit("torso", mul(sp2, T(0, -0.09, 0), S(tw * 1.1, 0.54, td * 1.13)), sp.top);
  if (sp.outfit === "dress") emit("flare", mul(hips, T(0, 0.04, 0), S(tw * 1.05, -0.74, td * 1.25)), sp.top);
  else if (sp.outfit === "skirt") emit("flare", mul(hips, T(0, 0.05, 0), S(tw * 1.05, -0.5, td * 1.2)), sp.bottom);
  else if (sp.outfit === "kurta") emit("flare", mul(hips, T(0, 0.04, 0), S(tw * 1.02, -0.5, td * 1.1)), sp.top);
  else ball(hips, 0, 0.012, 0, tw * 1.03, 0.022, td * 1.06, sp.outfit === "suit" ? sp.bottom : "#2a1d14");
  if (sp.outfit === "suit") { box(sp2, 0, 0.3, td * 1.12, 0.065, 0.2, 0.012, "#efece4"); box(sp2, 0, 0.3, td * 1.15, 0.022, 0.18, 0.012, sp.acc2); }
  if (sp.acc === "backpack") { ball(sp2, 0, 0.22, -td * 1.34, tw * 0.9, 0.18, 0.08, sp.acc2); [1, -1].forEach((m) => box(sp2, m * tw * 0.58, 0.3, td * 0.65, 0.024, 0.2, 0.02, sp.acc2)); }
  const arm = (m: number, a: number[], holds: boolean) => { const r0 = (fem ? 0.046 : 0.054) * (0.75 + b * 0.25), up = sp.sleeve === "long" ? sp.top : sp.top, lo = sp.sleeve === "long" ? sp.top : sp.skin, A = mul(sp2, T(m * sh, 0.335, 0), R(a[0], m * a[1], m * a[2])); limb(A, 0.3, r0, 0, up); const E = mul(A, T(0, -0.3, 0), R(a[3], 0, 0)); limb(E, 0.26, r0 * 0.74, 0, lo); const Hd = mul(E, T(0, -0.3, 0)); ball(Hd, 0, 0, 0, 0.032, 0.05, 0.042, sp.skin); if (holds) box(Hd, m * 0.01, -0.02, 0.035, 0.075, 0.14, 0.012, "#17191d"); if (sp.acc === "handbag" && m === 1 && !p.sit && a[3] > -40 && a[2] < 40) { box(A, 0.03, -0.42, 0, 0.1, 0.2, 0.26, sp.acc2); } };
  arm(1, p.l, false); arm(-1, p.r, !!p.phone);
  // Neck and head
  const nk = mul(sp2, T(0, 0.425, 0));
  emit("limb", mul(nk, T(0, 0.03, 0), S(0.048, 0.12, 0.048)), sp.style === "scarf" ? sp.acc2 : sp.skin);
  const hd = mul(nk, T(0, 0.09, 0.006), R(p.head[0], p.head[1], p.head[2]), T(0, 0.1, 0.008), S(H, H, H));
  const hc = sp.hair, sk = sp.skin, dk = "#1b1411";
  ball(hd, 0, 0, 0, 0.09, 0.115, 0.103, sk); ball(hd, 0, -0.058, 0.012, 0.074, 0.068, 0.08, sk);
  [1, -1].forEach((m) => { ball(hd, m * 0.09, -0.006, -0.008, 0.012, 0.026, 0.019, sk); ball(hd, m * 0.037, 0.016, 0.092, 0.0125, 0.0125, 0.008, "#f7f3ec"); ball(hd, m * 0.037, 0.015, 0.0985, 0.0072, 0.0072, 0.004, dk); box(hd, m * 0.038, 0.041, 0.095, 0.03, 0.0065, 0.009, hc === GREY[2] ? "#6d6b66" : hc); });
  ball(hd, 0, -0.018, 0.106, 0.012, 0.024, 0.015, sk); box(hd, 0, -0.058, 0.094, 0.03, 0.0052, 0.008, "#7a3a33");
  if (sp.beard) { ball(hd, 0, -0.075, 0.018, 0.078, 0.066, 0.08, hc); box(hd, 0, -0.04, 0.097, 0.052, 0.008, 0.01, hc); box(hd, 0, -0.058, 0.103, 0.028, 0.0052, 0.006, "#7a3a33"); }
  if (sp.glasses) { [1, -1].forEach((m) => { box(hd, m * 0.037, 0.016, 0.105, 0.042, 0.03, 0.003, "#1a1c20"); box(hd, m * 0.037, 0.016, 0.1065, 0.034, 0.022, 0.003, "#5a6a74"); }); box(hd, 0, 0.022, 0.105, 0.03, 0.005, 0.003, "#1a1c20"); }
  // Hair
  const cap = () => ball(hd, 0, 0.032, -0.012, 0.095, 0.098, 0.102, hc);
  if (sp.style === "short") { cap(); box(hd, 0, 0.085, 0.07, 0.09, 0.05, 0.04, hc); }
  else if (sp.style === "side") { cap(); ball(hd, 0.03, 0.09, 0.05, 0.075, 0.033, 0.058, hc); }
  else if (sp.style === "curly") { cap(); for (let i = 0; i < 16; i++) { const a = (i / 16) * 6.283; ball(hd, Math.cos(a) * 0.08, 0.055 + (i % 3) * 0.02, Math.sin(a) * 0.08 - 0.01, 0.035, 0.035, 0.035, hc); } ball(hd, 0, 0.108, 0, 0.055, 0.035, 0.055, hc); }
  else if (sp.style === "cap") { ball(hd, 0, 0.055, -0.006, 0.097, 0.075, 0.106, sp.acc2); box(hd, 0, 0.055, 0.112, 0.13, 0.012, 0.09, sp.acc2); }
  else if (sp.style === "bald") { box(hd, 0, -0.002, -0.08, 0.14, 0.06, 0.03, hc); }
  else if (sp.style === "long") { cap(); ball(hd, 0, -0.07, -0.058, 0.098, 0.19, 0.055, hc); [1, -1].forEach((m) => ball(hd, m * 0.085, -0.055, 0.018, 0.024, 0.13, 0.04, hc)); }
  else if (sp.style === "bob") { cap(); ball(hd, 0, -0.03, -0.035, 0.112, 0.105, 0.085, hc); }
  else if (sp.style === "bun") { cap(); ball(hd, 0, 0.1, -0.075, 0.046, 0.046, 0.046, hc); }
  else if (sp.style === "ponytail") { cap(); ball(hd, 0, 0.01, -0.13, 0.034, 0.13, 0.034, hc); }
  else if (sp.style === "scarf") { ball(hd, 0, 0.012, -0.014, 0.103, 0.13, 0.112, sp.acc2); ball(hd, 0, -0.14, -0.015, 0.1, 0.05, 0.1, sp.acc2); ball(hd, 0, -0.015, 0.05, 0.073, 0.082, 0.062, sk); [1, -1].forEach((m) => { ball(hd, m * 0.037, 0.016, 0.092, 0.0125, 0.0125, 0.008, "#f7f3ec"); ball(hd, m * 0.037, 0.015, 0.0985, 0.0072, 0.0072, 0.004, dk); }); ball(hd, 0, -0.018, 0.106, 0.012, 0.024, 0.015, sk); box(hd, 0, -0.058, 0.098, 0.03, 0.0052, 0.008, "#7a3a33"); }
};

/* ---------- Instancing ---------- */
const geos = () => { const lathe = (pts: number[][]) => { const g = new THREE.LatheGeometry(pts.map((p) => new THREE.Vector2(p[0], p[1])), 18); g.computeVertexNormals(); return g; }; return { ball: new THREE.SphereGeometry(1, 14, 10), limb: new THREE.CylinderGeometry(1, 0.74, 1, 14), torso: lathe([[0.001, 0], [0.9, 0.001], [0.88, 0.1], [0.84, 0.3], [0.95, 0.55], [1.02, 0.74], [0.96, 0.87], [0.62, 0.97], [0.3, 1.01], [0.001, 1.01]]), flare: lathe([[0.86, 0], [0.92, 0.12], [1.02, 0.4], [1.14, 0.75], [1.2, 1], [0.001, 1]]), box: new THREE.BoxGeometry(1, 1, 1) } as Record<Kind, THREE.BufferGeometry>; };
let G: Record<Kind, THREE.BufferGeometry> | null = null;
const Batch: React.FC<{ k: Kind; items: { m: THREE.Matrix4; c: string }[]; dep: unknown; shadows: boolean }> = ({ k, items, dep, shadows }) => {
  const geo = G![k]; const col = useMemo(() => new THREE.Color(), []);
  return items.length ? <Instances count={items.length} dep={dep} castShadow={shadows} fill={(i, d, c) => { const it = items[i]; it.m.decompose(d.position, d.quaternion, d.scale); c.set(it.c); }}><primitive object={geo} attach="geometry" /><meshStandardMaterial roughness={0.72} side={k === "flare" ? THREE.DoubleSide : THREE.FrontSide} /></Instances> : null;
};
export type CrowdMember = { spec?: Partial<ExtraSpec>; seed?: number; pose?: string; position: number[]; rotationY?: number; scale?: number };
export type CrowdProps = { members?: CrowdMember[]; count?: number; seed?: number; area?: number[]; poses?: string[]; force?: Partial<ExtraSpec>; t?: number; flow?: number; center?: number[]; position?: number[]; rotation?: number[]; shadows?: boolean };
/** A group of people. Give `count`, `area` [width, depth] and `poses` for a scattered crowd, or `members` to place each person. `flow` (meters per second) walks everyone along z, wrapping within the area. */
export const Crowd: React.FC<CrowdProps> = ({ members, count = 20, seed = 1, area = [20, 12], poses = ["stand", "talk", "phone"], force, t = 0, flow = 0, center = [0, 0, 0], position = [0, 0, 0], rotation = [0, 0, 0], shadows = true }) => {
  if (!G) G = geos();
  const list = useMemo(() => { const r = rng(seed * 311 + 5); if (members) return members.map((m, i) => ({ sp: makeExtra(m.seed ?? seed + i, m.spec ?? force), pose: m.pose ?? "stand", x: m.position[0], y: m.position[1] ?? 0, z: m.position[2] ?? 0, ry: m.rotationY ?? 0, sc: m.scale ?? 1 })); const out: { sp: ExtraSpec; pose: string; x: number; y: number; z: number; ry: number; sc: number }[] = []; for (let i = 0; i < count; i++) { let x = 0, z = 0, tries = 0; do { x = (r() - 0.5) * area[0]; z = (r() - 0.5) * area[1]; tries++; } while (tries < 30 && out.some((o) => Math.hypot(o.x - x, o.z - z) < 0.75)); out.push({ sp: makeExtra(seed * 97 + i, force), pose: poses[Math.floor(r() * poses.length)], x, y: 0, z, ry: flow ? (r() < 0.5 ? 0 : Math.PI) : r() * 6.283, sc: 1 }); } return out; }, [JSON.stringify(members), count, seed, JSON.stringify(area), JSON.stringify(poses), JSON.stringify(force), flow]);
  const buckets: Record<Kind, { m: THREE.Matrix4; c: string }[]> = { ball: [], limb: [], torso: [], flare: [], box: [] };
  const emit: Emit = (k, m, c) => buckets[k].push({ m, c });
  for (const p of list) { const dir = p.ry === 0 ? 1 : -1, z = flow ? ((((p.z + area[1] / 2 + dir * flow * t) % area[1]) + area[1]) % area[1]) - area[1] / 2 : p.z; person(p.sp, flow ? "walk" : p.pose, t, mul(T(p.x + center[0], p.y + center[1], z + center[2]), R(0, p.ry / D, 0), S(p.sc, p.sc, p.sc)), emit); }
  return <group position={position as any} rotation={rotation as any}>{(Object.keys(buckets) as Kind[]).map((k) => <Batch key={k} k={k} items={buckets[k]} dep={t + (list.length * 0.0001)} shadows={shadows} />)}</group>;
};
/** One background person from a `seed`. */
export const Extra: React.FC<{ seed?: number; spec?: Partial<ExtraSpec>; pose?: string; t?: number; position?: number[]; rotationY?: number; scale?: number; shadows?: boolean }> = ({ seed = 1, spec, pose: name = "stand", t = 0, position = [0, 0, 0], rotationY = 0, scale = 1, shadows }) => <Crowd members={[{ seed, spec, pose: name, position, rotationY, scale }]} t={t} shadows={shadows} />;

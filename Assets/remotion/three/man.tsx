// Detailed stylized 3D man for third-person explainer shots. About 1.78 m tall, feet on y = 0, facing +z. Everything is procedural and frame-driven.
// Use: <Man pose="explain" expression="smile" t={time} /> Blend poses with from="idle" blend={0.5}.
import React, { useMemo } from "react";
import * as THREE from "three";
import { clamp, mix, noise, rng } from "./kit";

export type ManColors = { skin: string; hair: string; shirt: string; pants: string; shoes: string; sole: string; eyes: string; belt: string; inner: string; accent: string };
export type Outfit = "shirt" | "tshirt" | "hoodie" | "suit" | "jacket";
export const MAN_OUTFITS: Outfit[] = ["shirt", "tshirt", "hoodie", "suit", "jacket"];
const DEFAULT: ManColors = { skin: "#c68c64", hair: "#1e1511", shirt: "#2f7f86", pants: "#27364d", shoes: "#e8e2d6", sole: "#f7f4ec", eyes: "#4a2c18", belt: "#3a2616", inner: "#efece4", accent: "#b33a3a" };
const OUTFIT_COLORS: Record<Outfit, Partial<ManColors>> = {
  shirt: {}, tshirt: { shirt: "#d9a441", pants: "#2f3d55" }, hoodie: { shirt: "#566270", inner: "#e8e2d6", pants: "#1f2a3a" },
  suit: { shirt: "#2a3447", pants: "#2a3447", inner: "#f3f1ea", accent: "#b33a3a", shoes: "#1f1814", sole: "#120e0c", belt: "#141210" }, jacket: { shirt: "#55633f", inner: "#efece4", pants: "#2f3a4f", shoes: "#4a3324", sole: "#d8cdb8" },
};
const D = Math.PI / 180;

/* ---------- Geometry ---------- */
const geo = new Map<string, THREE.BufferGeometry>();
const once = (k: string, f: () => THREE.BufferGeometry) => { let g = geo.get(k); if (!g) { g = f(); geo.set(k, g); } return g; };
type Ring = number[]; // y, rx, rz, z offset
const cat = (a: number, b: number, c: number, d: number, s: number) => 0.5 * (2 * b + (c - a) * s + (2 * a - 5 * b + 4 * c - d) * s * s + (3 * b - a - 3 * c + d) * s * s * s);
/** Smooth body part through elliptical rings. */
const loft = (rings: Ring[], pow = 2, seg = 30) => once(`l${JSON.stringify(rings)}${pow}`, () => {
  const R: number[][] = []; for (let i = 0; i < rings.length - 1; i++) for (let s = 0; s < 6; s++) { const p = rings[Math.max(0, i - 1)], a = rings[i], b = rings[i + 1], q = rings[Math.min(rings.length - 1, i + 2)]; R.push([0, 1, 2, 3].map((k) => cat(p[k] ?? 0, a[k] ?? 0, b[k] ?? 0, q[k] ?? 0, s / 6))); }
  R.push([...rings[rings.length - 1].slice(0, 3), rings[rings.length - 1][3] ?? 0]);
  const pos: number[] = [], uv: number[] = [], idx: number[] = []; const all = [[R[0][0], R[0][1] * 0.02, R[0][2] * 0.02, R[0][3]], ...R, [R[R.length - 1][0], R[R.length - 1][1] * 0.02, R[R.length - 1][2] * 0.02, R[R.length - 1][3]]]; let L = 0;
  all.forEach((r, i) => { if (i) L += Math.abs(r[0] - all[i - 1][0]); for (let j = 0; j <= seg; j++) { const a = (j / seg) * Math.PI * 2, c = Math.cos(a), s = Math.sin(a), e = 2 / pow; pos.push(Math.sign(c) * Math.abs(c) ** e * r[1], r[0], Math.sign(s) * Math.abs(s) ** e * r[2] + (r[3] || 0)); uv.push((j / seg) * 4, L * 8); } });
  for (let i = 0; i < all.length - 1; i++) for (let j = 0; j < seg; j++) { const a = i * (seg + 1) + j, b = a + seg + 1; if (rings[0][0] > rings[rings.length - 1][0]) idx.push(a, a + 1, b, b, a + 1, b + 1); else idx.push(a, b, a + 1, a + 1, b, b + 1); }
  const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
  const n = g.attributes.normal; for (let i = 0; i < n.count; i += seg + 1) { n.setXYZ(i + seg, n.getX(i), n.getY(i), n.getZ(i)); } return g;
});
const fabric = new Map<string, THREE.Texture>();
const weave = (kind: "shirt" | "denim") => { let t = fabric.get(kind); if (t) return t; const c = document.createElement("canvas"); c.width = c.height = 128; const x = c.getContext("2d")!, r = rng(kind.length); x.fillStyle = "#808080"; x.fillRect(0, 0, 128, 128); if (kind === "denim") for (let i = -128; i < 128; i += 4) { x.strokeStyle = i % 8 ? "#a8a8a8" : "#585858"; x.lineWidth = 2; x.beginPath(); x.moveTo(i, 0); x.lineTo(i + 128, 128); x.stroke(); } else for (let i = 0; i < 128; i += 4) for (let j = 0; j < 128; j += 4) { x.fillStyle = (i + j) % 8 ? "#6a6a6a" : "#a4a4a4"; x.fillRect(i, j, 3, 3); } for (let i = 0; i < 1500; i++) { x.fillStyle = `rgba(${r() > 0.5 ? "255,255,255" : "0,0,0"},.05)`; x.fillRect(r() * 128, r() * 128, 2, 2); } t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3, 3); fabric.set(kind, t); return t; };
const Cloth: React.FC<{ c: string; k?: "shirt" | "denim" }> = ({ c, k = "shirt" }) => { const t = useMemo(() => weave(k), [k]); return <meshStandardMaterial color={c} roughness={k === "denim" ? 0.88 : 0.76} bumpMap={t} bumpScale={0.45} />; };
const Skin: React.FC<{ c: string }> = ({ c }) => <meshPhysicalMaterial color={c} roughness={0.56} sheen={0.5} sheenColor="#ff9a7a" sheenRoughness={0.6} />;
const Part: React.FC<{ g: THREE.BufferGeometry; children: React.ReactNode; p?: number[]; s?: number | number[]; r?: number[] }> = ({ g, children, p, s, r }) => <mesh geometry={g} position={p as any} scale={s as any} rotation={r as any} castShadow receiveShadow>{children}</mesh>;
const sph = () => once("sph", () => new THREE.SphereGeometry(1, 28, 20));
const box = () => once("box", () => new THREE.BoxGeometry(1, 1, 1));
const Ball: React.FC<{ p: number[]; s: number | number[]; r?: number[]; children: React.ReactNode }> = (a) => <Part g={sph()} p={a.p} s={a.s} r={a.r}>{a.children}</Part>;
const Box: React.FC<{ p: number[]; s: number[]; r?: number[]; children: React.ReactNode }> = (a) => <Part g={box()} p={a.p} s={a.s} r={a.r}>{a.children}</Part>;
const Tube: React.FC<{ pts: number[][]; r: number; children: React.ReactNode }> = ({ pts, r, children }) => { const g = useMemo(() => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(p[0], p[1], p[2]))), 16, r, 6), [JSON.stringify(pts), r]); return <mesh geometry={g} castShadow>{children}</mesh>; };

/* ---------- Head shape ---------- */
const gs = (v: number, c: number, w: number) => Math.exp(-(((v - c) / w) ** 2));
const HS = [0.098, 0.125, 0.11];
/** Sculpts a point on a unit sphere into the head. */
const shape = (x0: number, y0: number, z: number) => {
  // Pushes the front outline toward a rounded octagon, with flat cheeks and a broad jaw.
  const len = Math.hypot(x0, y0), sq = len > 0.001 ? len / (Math.abs(x0) ** 5 + Math.abs(y0) ** 5) ** 0.2 : 1, k = 1 + (Math.min(sq, 1.32) - 1) * 0.62 * Math.max(0, 1 - Math.max(0, -z) * 0.6), x = x0 * k, yy = y0 * k, y = Math.sign(yy) * Math.min(Math.abs(yy), 1);
  const w = y > 0 ? 1 - 0.04 * y : 1 - 0.1 * (-y) ** 1.5, f = Math.max(z, 0), a = Math.abs(x);
  let Z = z * (y > 0 ? 1 : 1 - 0.08 * -y) * (z < 0 ? 1.08 : 1);
  Z += 0.08 * f * f * gs(y, -0.76, 0.2) + 0.07 * f * gs(y, 0.33, 0.13) * gs(a, 0.35, 0.4) + 0.05 * f * gs(a, 0.5, 0.22) * gs(y, -0.2, 0.24) - 0.075 * f * gs(a, 0.42, 0.17) * gs(y, 0.14, 0.12) + 0.035 * f * gs(x, 0, 0.3) * gs(y, -0.5, 0.14);
  return [x * w * HS[0] * 0.94, y * HS[1] * 0.96, Z * HS[2]];
};
const face = (x: number, y: number, out = 0) => { const z = Math.sqrt(Math.max(0.02, 1 - x * x - y * y)), p = shape(x, y, z); return [p[0], p[1], p[2] + out]; };
const headGeo = (skin: string, stubble: number) => once(`h${skin}${stubble}`, () => {
  const g = new THREE.SphereGeometry(1, 96, 72), p = g.attributes.position, col = new Float32Array(p.count * 3), S = new THREE.Color(skin), blush = S.clone().lerp(new THREE.Color("#d9534a"), 0.32), dark = S.clone().lerp(new THREE.Color("#1c1a1a"), 0.42), c = new THREE.Color();
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), q = shape(x, y, z), f = Math.max(z, 0), a = Math.abs(x); p.setXYZ(i, q[0], q[1], q[2]); c.copy(S).lerp(blush, f * gs(a, 0.55, 0.2) * gs(y, -0.12, 0.2) * 0.75); const jaw = clamp((-y - 0.42) * 2.6) * (1 - gs(x, 0, 0.17) * gs(y, -0.5, 0.11)); c.lerp(dark, stubble * jaw * (0.65 + 0.35 * noise(x * 40, y * 40))); c.lerp(dark, 0.3 * f * gs(a, 0.42, 0.13) * gs(y, 0.16, 0.1)); col.set([c.r, c.g, c.b], i * 3); }
  g.setAttribute("color", new THREE.BufferAttribute(col, 3)); g.computeVertexNormals(); return g;
});
const hairLim = (a: number) => (a < 0.17 ? mix(0.6, 0.42, (a / 0.17) ** 2) : a < 0.42 ? mix(0.42, -0.02, (a - 0.17) / 0.25) : mix(-0.02, -0.55, (a - 0.42) / 0.58));
const hairGeo = () => once("hair", () => {
  const R = 40, S = 96, pos: number[] = [], idx: number[] = [];
  for (let i = 0; i <= R; i++) for (let j = 0; j <= S; j++) { const ph = (j / S) * Math.PI * 2, az = Math.abs(((ph + Math.PI) % (2 * Math.PI)) - Math.PI) / Math.PI, th = (i / R) * Math.acos(hairLim(az)), x = Math.sin(th) * Math.sin(ph), y = Math.cos(th), z = Math.sin(th) * Math.cos(ph), q = shape(x, y, z), n = 1.012 + (i / R < 0.97 ? 0.03 * Math.min(1, (1 - i / R) * 7) : 0) + noise(x * 5 + 3, z * 5 + y * 5) * 0.008; pos.push(q[0] * n, q[1] * n, q[2] * n); }
  for (let i = 0; i < R; i++) for (let j = 0; j < S; j++) { const a = i * (S + 1) + j, b = a + S + 1; idx.push(a, b, a + 1, b, b + 1, a + 1); }
  const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals(); return g;
});
const clumps = (() => { const r = rng(77), out: { p: number[]; s: number[]; q: number[]; v: number }[] = []; const E = new THREE.Euler(), Q = new THREE.Quaternion();
  for (let i = 0; i < 620; i++) { const a = r() * 6.283, b = Math.acos(mix(1, -0.5, r() ** 0.9)), x = Math.sin(b) * Math.sin(a), y = Math.cos(b), z = Math.sin(b) * Math.cos(a), az = Math.abs(Math.atan2(x, z)) / Math.PI; if (y < hairLim(az) + 0.1) continue; const q = shape(x, y, z), part = x > 0.2 ? 1 : -1, big = z > 0.1 && y > 0.55; E.set((z > 0 ? -1.2 : 1.1) + (r() - 0.5) * 0.18, (r() - 0.5) * 0.25, part * (0.3 + r() * 0.5) * Math.min(1, Math.abs(x) * 2.2)); Q.setFromEuler(E); out.push({ p: [q[0] * 1.04, q[1] * 1.04 + (big ? 0.004 : 0), q[2] * 1.04], s: big ? [0.0085, 0.03, 0.0058] : [0.006 + r() * 0.0025, 0.019 + r() * 0.008, 0.0038], q: [Q.x, Q.y, Q.z, Q.w], v: r() }); } return out; })();

/* ---------- Beard ---------- */
const beardTop = (a: number) => mix(-0.36, 0.08, Math.min(1, Math.max(0, (a - 0.42) / 0.5)) ** 1.5);
const inBeard = (x: number, y: number, z: number) => { const a = Math.abs(x); if (z < -0.12) return false; return y <= beardTop(a); };
const clearOfMouth = (x: number, y: number, open: number, smile: number) => { const up = Math.max(0, smile), rx = 0.335 + up * 0.075, cy = -0.51 - open * 0.075 + up * 0.012, ry = 0.068 + open * 0.125 + up * 0.03; return (x / rx) ** 2 + ((y - cy) / ry) ** 2 > 1; };
const beardGeo = (open: number, smile: number) => once(`beard${open}${smile}`, () => { const R = 110, S = 180, pos: number[] = [], idx: number[] = [], on: boolean[] = []; for (let i = 0; i <= R; i++) for (let j = 0; j <= S; j++) { const th = Math.PI * (0.42 + (i / R) * 0.58), ph = (j / S) * Math.PI * 2, x = Math.sin(th) * Math.sin(ph), y = Math.cos(th), z = Math.sin(th) * Math.cos(ph), q = shape(x, y, z), n = 1.008 + 0.018 * Math.min(1, Math.max(0, (-y - 0.5) * 2.2)); on.push(inBeard(x, y, z) && clearOfMouth(x, y, open, smile)); pos.push(q[0] * n, q[1] * n, q[2] * n + 0.001); } for (let i = 0; i < R; i++) for (let j = 0; j < S; j++) { const a = i * (S + 1) + j, b = a + S + 1; if (on[a] && on[b] && on[a + 1] && on[b + 1]) idx.push(a, b, a + 1, b, b + 1, a + 1); } const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals(); return g; });
type Tuft = { p: number[]; s: number[]; q: number[]; v: number; ux: number; uy: number };
const tufts = (() => { const r = rng(19), out: Tuft[] = [], E = new THREE.Euler(), Q = new THREE.Quaternion(); for (let i = 0; i < 12000 && out.length < 2800; i++) { const y = -1 + r() * 1.2, ph = r() * 6.283, rad = Math.sqrt(Math.max(0, 1 - y * y)), x = rad * Math.sin(ph), z = rad * Math.cos(ph); if (!inBeard(x, y, z)) continue; const q = shape(x, y, z), lift = 1.016 + 0.02 * Math.min(1, Math.max(0, (-y - 0.5) * 2.2)), ang = Math.atan2(x, Math.max(z, 0.05)); E.set(0.2 - (z > 0 ? y * 0.25 : 0) + (r() - 0.5) * 0.3, ang, (x > 0 ? 1 : -1) * 0.2 + (r() - 0.5) * 0.45, "YXZ"); Q.setFromEuler(E); out.push({ p: [q[0] * lift, q[1] * lift, q[2] * lift + 0.001], s: [0.0028 + r() * 0.0012, 0.0072 + r() * 0.0042, 0.0016], q: [Q.x, Q.y, Q.z, Q.w], v: r(), ux: x, uy: y }); } return out; })();
const Tufts: React.FC<{ list: { p: number[]; s: number[]; q: number[]; v: number }[]; color: string; lo?: number; hi?: number; rough?: number }> = ({ list, color, lo = 0.8, hi = 0.85, rough = 0.62 }) => <instancedMesh ref={(m) => { if (!m) return; const d = new THREE.Object3D(), col = new THREE.Color(); list.forEach((q, i) => { d.position.set(q.p[0], q.p[1], q.p[2]); d.quaternion.set(q.q[0], q.q[1], q.q[2], q.q[3]); d.scale.set(q.s[0], q.s[1], q.s[2]); d.updateMatrix(); m.setMatrixAt(i, d.matrix); col.set(color).multiplyScalar(lo + q.v * hi); m.setColorAt(i, col); }); m.instanceMatrix.needsUpdate = true; if (m.instanceColor) m.instanceColor.needsUpdate = true; }} args={[undefined as any, undefined as any, list.length]} frustumCulled={false} castShadow><sphereGeometry args={[1, 10, 8]} /><meshStandardMaterial roughness={rough} /></instancedMesh>;

/* ---------- Face ---------- */
export type Expression = "neutral" | "smile" | "happy" | "worried" | "surprised" | "angry" | "thinking";
const EXPR: Record<string, { smile: number; open: number; raise: number; tilt: number; lid: number; teeth?: number; side?: number }> = {
  neutral: { smile: 0.15, open: 0, raise: 0, tilt: 0, lid: 0.18 }, smile: { smile: 0.75, open: 0.05, raise: 0.2, tilt: 0.05, lid: 0.26 }, happy: { smile: 1, open: 0.5, raise: 0.5, tilt: 0.1, lid: 0.3 }, worried: { smile: -0.45, open: 0.1, raise: 0.5, tilt: 0.9, lid: 0.2 },
  surprised: { smile: 0, open: 0.85, raise: 1, tilt: 0.2, lid: 0 }, angry: { smile: -0.55, open: 0.08, raise: -0.5, tilt: -1, lid: 0.32 }, thinking: { smile: -0.08, open: 0, raise: 0.25, tilt: -0.1, lid: 0.3, side: 1 },
};
const Eye: React.FC<{ s: number; c: ManColors; look: number[]; lid: number; blink: number }> = ({ s, c, look, lid, blink }) => {
  const R = 0.0178, up = Math.max(lid, blink), p = face(s * 0.415, 0.13, -0.0098), th = mix(-0.72, 1.32, up), e2 = [0, -Math.sin(th), Math.cos(th)];
  const edge = Array.from({ length: 9 }, (_, i) => { const a = -1.42 + (i / 8) * 2.84, k = R * 1.085; return [Math.sin(a) * k, Math.cos(a) * e2[1] * k, Math.cos(a) * e2[2] * k]; });
  return <group position={p as any}>
    <Ball p={[0, 0, 0]} s={R}><meshPhysicalMaterial color="#f7f3ec" roughness={0.18} clearcoat={1} /></Ball>
    <group rotation={[-look[1] * 0.45, look[0] * 0.55, 0]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}><sphereGeometry args={[R * 1.006, 28, 10, 0, 6.283, 0, 0.66]} /><meshStandardMaterial color={c.eyes} roughness={0.35} /></mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}><sphereGeometry args={[R * 1.012, 18, 8, 0, 6.283, 0, 0.32]} /><meshStandardMaterial color="#060505" roughness={0.1} /></mesh>
    </group>
    <Ball p={[R * 0.3, R * 0.36, R * 0.94]} s={R * 0.14}><meshBasicMaterial color="#fff" toneMapped={false} /></Ball>
    <mesh rotation={[th, 0, 0]}><sphereGeometry args={[R * 1.07, 26, 12, 0, 6.283, 0, Math.PI / 2]} /><Skin c={new THREE.Color(c.skin).multiplyScalar(0.93).getStyle()} /></mesh>
    <mesh rotation={[Math.PI + mix(0.92, 0.1, blink), 0, 0]}><sphereGeometry args={[R * 1.05, 26, 10, 0, 6.283, 0, Math.PI / 2]} /><Skin c={c.skin} /></mesh>
    <Tube pts={edge} r={0.00125}><meshStandardMaterial color="#130d0a" /></Tube>
  </group>;
};
const Brow: React.FC<{ s: number; c: string; raise: number; tilt: number }> = ({ s, c, raise, tilt }) => { const pts = Array.from({ length: 6 }, (_, i) => { const k = i / 5, x = mix(0.17, 0.66, k), y = 0.36 + raise * 0.055 - (k * 2 - 1) * tilt * 0.048 + 0.03 * Math.sin(k * Math.PI); const f = face(s * x, y, 0.004); return f; }); return <Tube pts={pts} r={0.0034}><meshStandardMaterial color={c} roughness={0.9} /></Tube>; };
const strip = (a: number[][], b: number[][]) => { const pos: number[] = [], idx: number[] = []; a.forEach((p, i) => { pos.push(...p, ...b[i]); if (i < a.length - 1) { const q = i * 2; idx.push(q, q + 1, q + 2, q + 1, q + 3, q + 2); } }); const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals(); return g; };
const Mouth: React.FC<{ open: number; smile: number; wide: number; lip: string }> = ({ open, smile, wide, lip }) => {
  const k = `${open.toFixed(2)}|${smile.toFixed(2)}|${wide.toFixed(2)}`;
  const m = useMemo(() => { const N = 12, W = 0.27 + wide * 0.06 + Math.max(0, smile) * 0.075 - open * 0.03, base = -0.51, up: number[][] = [], lo: number[][] = [], inU: number[][] = [], tE: number[][] = []; for (let i = 0; i <= N; i++) { const u = (i / N) * 2 - 1, cur = (1 - u * u), cor = u * u, y0 = base + cor * smile * 0.075; up.push(face(u * W, y0 + cur * (0.018 + open * 0.05), 0.0026)); lo.push(face(u * W, y0 - cur * (0.016 + open * 0.2 + Math.max(0, smile) * 0.018), 0.0026)); inU.push(face(u * W, y0 + cur * (0.008 + open * 0.05), 0.002)); tE.push(face(u * W * 0.92, y0 + cur * (0.006 + open * 0.05) - cur * Math.min(0.1, open * 0.11 + 0.008), 0.0023)); } return { up, lo, inner: strip(inU, lo), teeth: strip(inU, tE) }; }, [k]);
  return <group>
    {open > 0.01 || smile > 0.7 ? <><mesh geometry={m.inner}><meshBasicMaterial color="#2a0d0c" side={THREE.DoubleSide} /></mesh><mesh geometry={m.teeth}><meshStandardMaterial color="#f2eee4" roughness={0.3} side={THREE.DoubleSide} /></mesh></> : null}
    <Tube pts={m.up} r={0.0034}><meshPhysicalMaterial color={lip} roughness={0.42} /></Tube><Tube pts={m.lo} r={0.0044}><meshPhysicalMaterial color={lip} roughness={0.42} /></Tube>
  </group>;
};
const Head: React.FC<{ c: ManColors; t: number; expression: string; from?: string; blend: number; look: number[]; stubble: number; beard: boolean; glasses: boolean }> = ({ c, t, expression, look, stubble, beard, glasses }) => {
  const ex = EXPR[expression] ?? EXPR.neutral, blinkT = t % 3.7, blink = blinkT < 0.13 ? Math.sin((blinkT / 0.13) * Math.PI) : 0;
  const open = ex.open, lip = "#" + new THREE.Color(c.skin).lerp(new THREE.Color("#a33a3a"), 0.48).getHexString();
  const Sk = useMemo(() => new THREE.MeshPhysicalMaterial({ vertexColors: true, roughness: 0.56, sheen: 0.5, sheenColor: new THREE.Color("#ff9a7a"), sheenRoughness: 0.6 }), []);
  const n0 = face(0, 0.03), tip = face(0, -0.2, 0.0095), wing = (s: number) => face(s * 0.115, -0.235, 0.001);
  const Sn = <Skin c={c.skin} />;
  return <group>
    <mesh geometry={headGeo(c.skin, stubble)} material={Sk} castShadow receiveShadow />
    {/* Nose */}
    <Tube pts={[[0, n0[1] + 0.01, n0[2] - 0.003], [0, (n0[1] + tip[1]) / 2 + 0.003, (n0[2] + tip[2]) / 2 + 0.002], [0, tip[1], tip[2] - 0.004]]} r={0.0066}>{Sn}</Tube>
    <Ball p={tip} s={[0.0098, 0.0092, 0.0102]}>{Sn}</Ball>
    {[1, -1].map((s) => { const q = wing(s); return <group key={s}><Ball p={q} s={[0.0072, 0.0058, 0.0085]}>{Sn}</Ball><Ball p={[s * 0.0055, tip[1] - 0.0078, tip[2] - 0.003]} s={[0.0035, 0.0022, 0.0035]}><meshBasicMaterial color="#2c1410" /></Ball></group>; })}
    {/* Ears */}
    {[1, -1].map((s) => { const q = shape(s, 0.02, -0.05); return <group key={s} position={[q[0] + s * 0.004, q[1] - 0.004, q[2]]} rotation={[0, s * 0.45, s * -0.08]}><Ball p={[0, 0, 0]} s={[0.0095, 0.031, 0.021]}>{Sn}</Ball><Ball p={[s * 0.006, 0.002, 0.003]} s={[0.0042, 0.017, 0.011]}><meshStandardMaterial color={new THREE.Color(c.skin).multiplyScalar(0.55).getStyle()} /></Ball></group>; })}
    <Eye s={1} c={c} look={look} lid={ex.lid} blink={blink} /><Eye s={-1} c={c} look={look} lid={ex.lid} blink={blink} />
    <Brow s={1} c={c.hair} raise={ex.raise} tilt={ex.tilt} /><Brow s={-1} c={c.hair} raise={ex.raise + (ex.side ? 0.55 : 0)} tilt={ex.tilt} />
    <Mouth open={open} smile={ex.smile} wide={ex.side ? -0.3 : 0} lip={lip} />
    {/* Hair */}
    <mesh geometry={hairGeo()} castShadow><meshStandardMaterial color={c.hair} roughness={0.72} /></mesh>
    <Tufts list={clumps} color={c.hair} />
    {beard ? <><mesh geometry={beardGeo(ex.open, ex.smile)} castShadow><meshStandardMaterial color={c.hair} roughness={0.82} /></mesh><Tufts key={expression} list={tufts.filter((q) => clearOfMouth(q.ux, q.uy, ex.open, ex.smile))} color={c.hair} lo={0.9} hi={1.25} rough={0.72} /></> : null}
    {glasses ? <group>{[1, -1].map((s) => { const e = face(s * 0.415, 0.13, 0.005); return <mesh key={s} position={e as any}><torusGeometry args={[0.025, 0.0022, 8, 30]} /><meshStandardMaterial color="#15171a" roughness={0.3} /></mesh>; })}<Box p={[0, face(0, 0.13, 0.006)[1] + 0.005, face(0, 0.13, 0.006)[2]]} s={[0.022, 0.003, 0.003]}><meshStandardMaterial color="#15171a" /></Box></group> : null}
  </group>;
};

/* ---------- Hands and limbs (authored for his left, mirrored for his right) ---------- */
const Finger: React.FC<{ z: number; y: number; len: number; curl: number; skin: string }> = ({ z, y, len, curl, skin }) => { const a = -curl * 1.25, r = 0.0088; const seg = (l: number, rad: number, kids?: React.ReactNode) => <group rotation={[0, 0, a]}><Part g={loft([[0, rad, rad], [-l, rad * 0.86, rad * 0.86]])}><Skin c={skin} /></Part><Ball p={[0, -l, 0]} s={rad * 0.9}><Skin c={skin} /></Ball><group position={[0, -l, 0]}>{kids}</group></group>; return <group position={[0, y, z]}>{seg(len * 0.46, r, seg(len * 0.32, r * 0.88, seg(len * 0.24, r * 0.78)))}</group>; };
const Hand: React.FC<{ skin: string; curl: number; thumb: number; index?: number }> = ({ skin, curl, thumb, index }) => <group>
  <Part g={loft([[0.004, 0.016, 0.028], [-0.03, 0.02, 0.039], [-0.078, 0.016, 0.041], [-0.095, 0.012, 0.038]], 2.6)}><Skin c={skin} /></Part>
  <Finger z={0.029} y={-0.09} len={0.075} curl={index ?? curl} skin={skin} /><Finger z={0.0095} y={-0.095} len={0.084} curl={curl} skin={skin} /><Finger z={-0.0105} y={-0.092} len={0.077} curl={curl} skin={skin} /><Finger z={-0.029} y={-0.085} len={0.06} curl={curl} skin={skin} />
  <group position={[-0.004, -0.024, 0.033]} rotation={thumb >= 0.8 ? [-0.95, 0, -1.25] : [mix(-0.75, -2.5, thumb), 0, -0.2 - thumb * 0.3]}><Part g={loft([[0, 0.0145, 0.0145], [-0.035, 0.0108, 0.0108]])}><Skin c={skin} /></Part><group position={[0, -0.035, 0]} rotation={[thumb * 0.2 - 0.1, 0, -0.25]}><Ball p={[0, 0, 0]} s={0.0112}><Skin c={skin} /></Ball><Part g={loft([[0, 0.0112, 0.0112], [-0.036, 0.0092, 0.0092]])}><Skin c={skin} /></Part></group></group>
</group>;
type Arm = { sh: number[]; el: number; wr: number[]; curl: number; thumb: number; index?: number };
const ArmRig: React.FC<{ a: Arm; c: ManColors; up: number; outfit: Outfit }> = ({ a, c, up, outfit }) => { const S = <Cloth c={c.shirt} />, K = <Skin c={c.skin} />, big = outfit === "hoodie" ? 1.13 : outfit === "jacket" ? 1.08 : outfit === "suit" ? 1.03 : 1; return <group position={[0.19, 0.354 + up, 0]} rotation={[a.sh[0] * D, a.sh[1] * D, a.sh[2] * D]}>
  {outfit === "tshirt" ? <>
    <Part g={loft([[0.056, 0.012, 0.012], [0.047, 0.032, 0.033], [0.026, 0.047, 0.048], [0, 0.055, 0.056], [-0.12, 0.054, 0.056], [-0.165, 0.054, 0.056], [-0.172, 0.05, 0.052]])}>{S}</Part>
    <Part g={loft([[-0.14, 0.044, 0.046], [-0.3, 0.036, 0.038]])}>{K}</Part>
  </> : <Part g={loft([[0.056, 0.012 * big, 0.012 * big], [0.047, 0.032 * big, 0.033 * big], [0.026, 0.047 * big, 0.048 * big], [0, 0.054 * big, 0.055 * big], [-0.12, 0.049 * big, 0.052 * big], [-0.3, 0.04 * big, 0.042 * big]])}>{S}</Part>}
  <group position={[0, -0.3, 0]} rotation={[a.el * D, 0, 0]}>
    {outfit === "tshirt" ? <><Ball p={[0, 0, 0]} s={0.036}>{K}</Ball><Part g={loft([[0.01, 0.036, 0.038], [-0.1, 0.036, 0.038], [-0.17, 0.033, 0.035], [-0.265, 0.023, 0.03]])}>{K}</Part></>
    : outfit === "shirt" ? <><Ball p={[0, 0, 0]} s={0.041}>{S}</Ball><Part g={loft([[0, 0.04, 0.042], [-0.085, 0.042, 0.043], [-0.115, 0.046, 0.047], [-0.128, 0.042, 0.043]])}>{S}</Part><Part g={loft([[-0.1, 0.036, 0.038], [-0.17, 0.033, 0.035], [-0.265, 0.023, 0.03]])}>{K}</Part></>
    : <><Ball p={[0, 0, 0]} s={0.041 * big}>{S}</Ball><Part g={loft([[0, 0.04 * big, 0.042 * big], [-0.14, 0.038 * big, 0.04 * big], [-0.232, 0.034 * big, 0.036 * big], [-0.242, 0.032 * big, 0.034 * big]])}>{S}</Part>
      {outfit === "suit" ? <Part g={loft([[-0.225, 0.033, 0.035], [-0.256, 0.031, 0.033]])}><Cloth c={c.inner} /></Part> : <Part g={loft([[-0.215, 0.037 * big, 0.039 * big], [-0.232, 0.038 * big, 0.04 * big], [-0.258, 0.03, 0.033], [-0.262, 0.027, 0.03]])}><Cloth c={new THREE.Color(c.shirt).multiplyScalar(0.8).getStyle()} /></Part>}
      <Part g={loft([[-0.24, 0.025, 0.031], [-0.27, 0.023, 0.03]])}>{K}</Part></>}
    <group position={[0, -0.27, 0]} rotation={[a.wr[0] * D, a.wr[1] * D, a.wr[2] * D]}><Hand skin={c.skin} curl={a.curl} thumb={a.thumb} index={a.index} /></group>
  </group>
</group>; };
const Shoe: React.FC<{ c: ManColors }> = ({ c }) => { const U = <meshStandardMaterial color={c.shoes} roughness={0.6} />; return <group>
  <Part g={loft([[-0.097, 0.05, 0.138, 0.045], [-0.085, 0.054, 0.142, 0.045], [-0.068, 0.051, 0.138, 0.045]], 2.3)}><meshStandardMaterial color={c.sole} roughness={0.7} /></Part>
  <Ball p={[0, -0.055, 0.105]} s={[0.049, 0.034, 0.072]}>{U}</Ball><Ball p={[0, -0.042, 0.02]} s={[0.048, 0.052, 0.09]}>{U}</Ball><Ball p={[0, -0.04, -0.055]} s={[0.045, 0.05, 0.045]}>{U}</Ball>
  <Part g={loft([[-0.03, 0.047, 0.05], [0.022, 0.043, 0.046]])}>{U}</Part>
  <Ball p={[0, -0.056, 0.138]} s={[0.04, 0.022, 0.034]}><meshStandardMaterial color={c.sole} roughness={0.55} /></Ball>
  {[0, 1, 2, 3].map((i) => <Box key={i} p={[0, -0.006 - i * 0.011, 0.043 + i * 0.019]} s={[0.04, 0.004, 0.007]} r={[-0.55, 0, 0]}><meshStandardMaterial color="#8a8378" /></Box>)}
  {[1, -1].map((m) => <Box key={m} p={[m * 0.0485, -0.045, 0.03]} s={[0.002, 0.01, 0.1]} r={[-0.25, 0, 0]}><meshStandardMaterial color={c.pants} /></Box>)}
</group>; };
type Leg = { h: number[]; kn: number; an: number };
const LegRig: React.FC<{ l: Leg; c: ManColors }> = ({ l, c }) => <group position={[0.092, -0.035, 0]} rotation={[l.h[0] * D, l.h[1] * D, l.h[2] * D]}>
  <Part g={loft([[0.078, 0.07, 0.098], [0.03, 0.086, 0.116], [-0.03, 0.092, 0.112], [-0.09, 0.087, 0.1], [-0.14, 0.08, 0.09], [-0.41, 0.0575, 0.0615], [-0.45, 0.045, 0.05]])}><Cloth c={c.pants} k="denim" /></Part>
  <group position={[0, -0.42, 0]} rotation={[l.kn * D, 0, 0]}>
    <Ball p={[0, 0, 0]} s={[0.0585, 0.062, 0.0628]}><Cloth c={c.pants} k="denim" /></Ball>
    <Part g={loft([[0, 0.057, 0.061], [-0.14, 0.055, 0.06], [-0.37, 0.054, 0.059], [-0.395, 0.056, 0.061]])}><Cloth c={c.pants} k="denim" /></Part>
    <Part g={loft([[-0.33, 0.04, 0.043], [-0.42, 0.035, 0.038]])}><meshStandardMaterial color="#efece4" roughness={0.9} /></Part>
    <group position={[0, -0.42, 0]} rotation={[l.an * D, 0, 0]}><Shoe c={c} /></group>
  </group>
</group>;

/* ---------- Torso ---------- */
const UPPER: Ring[] = [[0.04, 0.158, 0.113, 0], [0.17, 0.18, 0.126, 0.004], [0.29, 0.203, 0.13, 0.012], [0.36, 0.214, 0.115, 0.005], [0.415, 0.168, 0.092, -0.004], [0.455, 0.07, 0.066, -0.006]];
const TORSO: Ring[] = [[-0.09, 0.145, 0.102, 0], [-0.03, 0.152, 0.108, 0], ...UPPER];
const loose = (w: number): Ring[] => [[-0.2, 0.21, 0.146, 0], [-0.1, 0.205, 0.141, 0], [0.04, 0.178 * Math.max(w, 1.03), 0.126 * Math.max(w, 1.03), 0], ...UPPER.slice(1).map((r, i) => { const k = i < 2 ? w : i === 2 ? 1 + (w - 1) * 0.4 : 1; return [r[0], r[1] * k, r[2] * k, r[3]]; })];
const ringAt = (T: Ring[], y: number) => { for (let i = 0; i < T.length - 1; i++) if (y >= T[i][0] && y <= T[i + 1][0]) { const p = T[Math.max(0, i - 1)], A = T[i], B = T[i + 1], q = T[Math.min(T.length - 1, i + 2)]; let lo = 0, hi = 1; for (let n = 0; n < 12; n++) { const m = (lo + hi) / 2; if (cat(p[0], A[0], B[0], q[0], m) < y) lo = m; else hi = m; } const k = (lo + hi) / 2; return [1, 2, 3].map((j) => cat(p[j] ?? 0, A[j] ?? 0, B[j] ?? 0, q[j] ?? 0, k)); } return [0, 0.09, 0]; };
const frontOn = (T: Ring[], x: number, y: number) => { const r = ringAt(T, y); return r[1] * Math.sqrt(Math.max(0.1, 1 - (x / r[0]) ** 2)) + r[2]; };
const front = (x: number, y: number) => frontOn(TORSO, x, y);
const collarGeo = () => once("collar", () => { const f = new THREE.Shape(); f.moveTo(0, 0); f.lineTo(0.074, 0.018); f.lineTo(0.05, -0.058); f.lineTo(0.008, -0.022); f.lineTo(0, 0); return new THREE.ExtrudeGeometry(f, { depth: 0.004, bevelEnabled: true, bevelSize: 0.0016, bevelThickness: 0.0016, bevelSegments: 2 }); });
/** Flat panel following the chest, from `pts`: [y, left x, right x]. */
const panel = (T: Ring[], pts: number[][], lift: number) => { const up = 8, C = 12, pos: number[] = [], idx: number[] = []; let rows = 0; for (let i = 0; i < pts.length - 1; i++) for (let k = i ? 1 : 0; k <= up; k++) { const t = k / up, y = mix(pts[i][0], pts[i + 1][0], t), l = mix(pts[i][1], pts[i + 1][1], t), r = mix(pts[i][2], pts[i + 1][2], t); for (let c = 0; c <= C; c++) { const x = mix(l, r, c / C); pos.push(x, y, frontOn(T, x, y) + lift); } rows++; } for (let i = 0; i < rows - 1; i++) for (let c = 0; c < C; c++) { const a = i * (C + 1) + c, b = a + C + 1; idx.push(a, a + 1, b, b, a + 1, b + 1); } const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals(); return g; };
const Pan: React.FC<{ T: Ring[]; pts: number[][]; lift?: number; children: React.ReactNode }> = ({ T, pts, lift = 0.004, children }) => { const g = useMemo(() => panel(T, pts, lift), [JSON.stringify(pts), lift, T]); return <mesh geometry={g}>{children}</mesh>; };
const D2: React.FC<{ c: string }> = ({ c }) => <meshStandardMaterial color={c} roughness={0.72} side={THREE.DoubleSide} />;
const Neck: React.FC<{ c: ManColors }> = ({ c }) => <Part g={loft([[0.405, 0.062, 0.058, -0.004], [0.5, 0.052, 0.052, 0], [0.56, 0.054, 0.056, 0.006]])}><Skin c={c.skin} /></Part>;
const Torso: React.FC<{ c: ManColors; outfit: Outfit }> = ({ c, outfit }) => {
  const dk = new THREE.Color(c.shirt).multiplyScalar(0.72).getStyle(), dk2 = new THREE.Color(c.shirt).multiplyScalar(0.55).getStyle(), lt = new THREE.Color(c.shirt).lerp(new THREE.Color("#fff"), 0.06).getStyle(), lap = new THREE.Color(c.shirt).multiplyScalar(0.82).getStyle();
  const T = useMemo(() => (outfit === "shirt" ? TORSO : loose(outfit === "hoodie" ? 1.09 : outfit === "jacket" ? 1.06 : outfit === "suit" ? 1.03 : 1)), [outfit]);
  const hem = <Part g={loft([[T[0][0] - 0.004, T[0][1] * 1.005, T[0][2] * 1.005], [T[0][0] + 0.05, T[0][1] * 1.01, T[0][2] * 1.01]])}><Cloth c={dk} /></Part>;
  const Stand = <Part g={loft([[0.43, 0.0695, 0.0655, -0.006], [0.49, 0.062, 0.058, -0.012]], 2.2)}><Cloth c={dk} /></Part>;
  const Flaps = (col: string) => [1, -1].map((m) => <group key={m} scale={[m, 1, 1]}><mesh geometry={collarGeo()} position={[0.005, 0.456, 0.074]} rotation={[-0.42, 0.34, 0]} castShadow><Cloth c={col} /></mesh></group>);
  return <group>
    <Part g={loft(T)}><Cloth c={c.shirt} /></Part><Neck c={c} />
    {outfit === "shirt" ? <>
      <Pan T={T} pts={[[-0.03, -0.016, 0.016], [0.4, -0.016, 0.016]]}><D2 c={lt} /></Pan>
      {[0.0, 0.08, 0.16, 0.24, 0.32].map((y) => <mesh key={y} position={[0, y, front(0, y) + 0.0062]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.0058, 0.0058, 0.003, 14]} /><meshStandardMaterial color="#e8e2d2" roughness={0.3} /></mesh>)}
      <group position={[0.086, 0.285, front(0.086, 0.285) + 0.002]} rotation={[0.08, 0.36, 0]}><Box p={[0, 0, 0]} s={[0.075, 0.082, 0.003]}><Cloth c={lt} /></Box><Box p={[0, 0.04, 0.002]} s={[0.078, 0.022, 0.003]}><Cloth c={dk} /></Box></group>
      <Box p={[0, 0.43, front(0, 0.43) + 0.0015]} s={[0.031, 0.031, 0.002]} r={[-0.55, 0, Math.PI / 4]}><Skin c={c.skin} /></Box>
      {Flaps(lt)}{Stand}<Part g={loft([[0.415, 0.072, 0.068, -0.006], [0.468, 0.062, 0.061, -0.004]])}><Cloth c={lt} /></Part>
    </> : null}
    {outfit === "tshirt" ? <>
      <Part g={loft([[0.408, 0.1, 0.082, -0.002], [0.432, 0.071, 0.069, -0.002], [0.44, 0.066, 0.065, -0.002]])}><Cloth c={dk} /></Part>{hem}
    </> : null}
    {outfit === "hoodie" ? <>
      {hem}
      <Part g={loft([[0.408, 0.11, 0.09, -0.004], [0.44, 0.08, 0.078, -0.004], [0.462, 0.066, 0.066, -0.004]])}><Cloth c={dk} /></Part>
      <Ball p={[0, 0.455, -0.082]} s={[0.118, 0.092, 0.06]}><Cloth c={c.shirt} /></Ball><Ball p={[0, 0.45, -0.062]} s={[0.09, 0.066, 0.05]}><Cloth c={dk2} /></Ball>
      {[1, -1].map((m) => <group key={m}><Tube pts={[[m * 0.024, 0.417, 0.09], [m * 0.026, 0.33, frontOn(T, 0.026, 0.33) + 0.004], [m * 0.021, 0.265, frontOn(T, 0.02, 0.265) + 0.004]]} r={0.0028}><meshStandardMaterial color={c.inner} /></Tube><Ball p={[m * 0.021, 0.262, frontOn(T, 0.02, 0.265) + 0.004]} s={[0.0042, 0.009, 0.0042]}><meshStandardMaterial color={c.inner} /></Ball></group>)}
      <Pan T={T} pts={[[-0.15, -0.14, 0.14], [-0.05, -0.14, 0.14], [0.08, -0.085, 0.085]]} lift={0.006}><D2 c={lt} /></Pan>
      {[1, -1].map((m) => <Tube key={m} pts={[[m * 0.14, -0.05, frontOn(T, 0.14, -0.05) + 0.007], [m * 0.114, 0.015, frontOn(T, 0.114, 0.015) + 0.007], [m * 0.085, 0.08, frontOn(T, 0.085, 0.08) + 0.007]]} r={0.003}><meshStandardMaterial color={dk2} /></Tube>)}
    </> : null}
    {outfit === "suit" ? <>
      <Pan T={T} pts={[[0.14, 0, 0], [0.43, -0.06, 0.06]]} lift={0.003}><D2 c={c.inner} /></Pan>
      <Pan T={T} pts={[[0.17, -0.003, 0.003], [0.385, -0.019, 0.019], [0.408, -0.011, 0.011]]} lift={0.0055}><D2 c={c.accent} /></Pan>
      <Pan T={T} pts={[[0.39, -0.015, 0.015], [0.42, -0.02, 0.02]]} lift={0.007}><D2 c={new THREE.Color(c.accent).multiplyScalar(0.8).getStyle()} /></Pan>
      {[1, -1].map((m) => <group key={m}>
        <Pan T={T} pts={[[0.125, m * 0.004, m * 0.05], [0.33, m * 0.04, m * 0.108], [0.345, m * 0.042, m * 0.12], [0.37, m * 0.053, m * 0.098], [0.435, m * 0.07, m * 0.1]]} lift={0.0065}><D2 c={lap} /></Pan>
        <Box p={[m * 0.105, -0.055, frontOn(T, 0.105, -0.055) + 0.003]} s={[0.085, 0.016, 0.004]} r={[0, m * 0.5, 0]}><Cloth c={dk} /></Box>
      </group>)}
      <Box p={[0.105, 0.3, frontOn(T, 0.105, 0.3) + 0.002]} s={[0.052, 0.012, 0.003]} r={[0.1, 0.4, 0]}><Cloth c={dk} /></Box>
      <Box p={[0.105, 0.313, frontOn(T, 0.105, 0.3) + 0.002]} s={[0.04, 0.018, 0.003]} r={[0.1, 0.4, 0.12]}><Cloth c={c.inner} /></Box>
      {[0.1, 0.03].map((y) => <mesh key={y} position={[0, y, frontOn(T, 0, y) + 0.004]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.009, 0.009, 0.004, 16]} /><meshStandardMaterial color="#0d0c0b" roughness={0.3} /></mesh>)}
      <Part g={loft([[0.42, 0.073, 0.067, -0.006], [0.47, 0.062, 0.059, -0.005]])}><Cloth c={c.inner} /></Part>
    </> : null}
    {outfit === "jacket" ? <>
      <Pan T={T} pts={[[-0.17, -0.034, 0.034], [0.34, -0.036, 0.036], [0.425, -0.052, 0.052]]} lift={0.008}><D2 c={c.inner} /></Pan>
      {[1, -1].map((m) => <group key={m}>
        <Pan T={T} pts={[[-0.17, m * 0.034, m * 0.044], [0.4, m * 0.04, m * 0.05]]} lift={0.01}><D2 c={dk2} /></Pan>
        <group position={[m * 0.105, 0.26, frontOn(T, 0.105, 0.26) + 0.003]} rotation={[0.08, m * 0.36, 0]}><Box p={[0, 0, 0]} s={[0.066, 0.07, 0.003]}><Cloth c={lt} /></Box><Box p={[0, 0.034, 0.002]} s={[0.07, 0.02, 0.003]}><Cloth c={dk} /></Box></group>
        <Tube pts={[[m * 0.135, -0.1, frontOn(T, 0.135, -0.1) + 0.003], [m * 0.1, -0.02, frontOn(T, 0.1, -0.02) + 0.003]]} r={0.0028}><meshStandardMaterial color={dk2} /></Tube>
      </group>)}
      {hem}{Flaps(dk)}{Stand}
    </> : null}
  </group>;
};
const Pelvis: React.FC<{ c: ManColors; outfit: Outfit }> = ({ c, outfit }) => { const R = 0.128, st = outfit === "suit" ? new THREE.Color(c.pants).multiplyScalar(0.6).getStyle() : "#b28a55", K = outfit === "suit" ? "shirt" : "denim"; return <group>
  <Part g={loft([[0.12, 0.158, 0.113], [0.04, 0.166, 0.118], [-0.05, 0.17, 0.1], [-0.085, 0.13, 0.075], [-0.115, 0.05, 0.05]])}><Cloth c={c.pants} k="denim" /></Part>
  {outfit === "shirt" ? <>
  <Part g={loft([[0.075, 0.165, 0.123], [0.115, 0.163, 0.121]])}><meshStandardMaterial color={c.belt} roughness={0.4} /></Part>
  <Box p={[0, 0.095, 0.124]} s={[0.044, 0.036, 0.006]}><meshStandardMaterial color="#c7c5be" metalness={0.75} roughness={0.25} /></Box>
  {[1, -1].map((s) => <group key={s}>
    <Box p={[s * 0.082, -0.015, -R * 1.0]} s={[0.1, 0.11, 0.004]}><Cloth c={new THREE.Color(c.pants).multiplyScalar(0.85).getStyle()} k="denim" /></Box>
    <Tube pts={[[s * 0.058, 0.06, 0.118], [s * 0.1, 0.03, 0.118], [s * 0.15, -0.002, 0.092]]} r={0.0022}><meshStandardMaterial color={st} /></Tube>
    <Box p={[s * 0.055, 0.1, 0.122]} s={[0.012, 0.042, 0.004]}><meshStandardMaterial color={c.belt} /></Box>
  </group>)}
  <Box p={[0, -0.012, 0.1215]} s={[0.003, 0.1, 0.003]}><meshStandardMaterial color={st} /></Box>
  </> : null}
</group>; };

/* ---------- Poses ---------- */
export type Pose = { hipsY?: number; lean: number[]; spine: number[]; neck: number[]; head: number[]; up: number; l: Arm; r: Arm; lLeg: Leg; rLeg: Leg };
const rest: Arm = { sh: [3, 0, 6], el: -12, wr: [0, 0, 0], curl: 0.32, thumb: 0.2 };
const stand = { lLeg: { h: [0, 0, -2], kn: 1, an: 0 }, rLeg: { h: [-2, 0, -3], kn: 3, an: 1 } };
const P = (o: Partial<Pose>): Pose => ({ lean: [0, 0, 0], spine: [0, 0, 0], neck: [0, 0, 0], head: [0, 0, 0], up: 0, l: rest, r: rest, ...stand, ...o });
const breathe = (t: number) => Math.sin(t * 1.5);
export const MAN_POSES = ["idle", "explain", "point", "present", "wave", "think", "shrug", "shock", "thumbsup", "crossed", "walk", "run"];
const pose = (name: string, t: number): Pose => {
  const s = Math.sin, b = breathe(t);
  switch (name) {
    case "explain": { const g = s(t * 2.1), h = s(t * 1.4 + 1); return P({ spine: [2, g * 3, 0], head: [0, h * 7, g * 2], neck: [2, 0, 0], l: { sh: [-20 + h * 5, -4, 15], el: -80 + g * 12, wr: [8, 72, 0], curl: 0.14, thumb: 0.05 }, r: { sh: [-22 - g * 5, -8, 15], el: -84 - h * 10, wr: [8, 74, 0], curl: 0.12, thumb: 0.05 } }); }
    case "point": return P({ spine: [0, -13, 0], head: [0, -28, 0], r: { sh: [-4, 0, 84], el: -6, wr: [0, 12, 0], curl: 0.92, thumb: 0.9, index: 0.02 } });
    case "present": return P({ spine: [0, -7, -2], head: [0, -20, 2], r: { sh: [-30, 0, 42], el: -28, wr: [0, 82, 0], curl: 0.1, thumb: 0.05 }, l: { ...rest, el: -18 } });
    case "wave": return P({ spine: [0, 0, 3], head: [0, 0, 3 + s(t * 7) * 1.5], r: { sh: [0, 0, 128], el: -44 + s(t * 7) * 19, wr: [0, 88, 0], curl: 0.06, thumb: 0.05 } });
    case "think": return P({ spine: [3, 0, 0], neck: [4, 0, 0], head: [6, -9, -6], l: { sh: [-10, -45, 7], el: -92, wr: [0, 25, 0], curl: 0.62, thumb: 0.92 }, r: { sh: [-34, -30, 18], el: -116, wr: [28, 70, -8], curl: 0.72, thumb: 0.92, index: 0.45 } });
    case "shrug": return P({ head: [0, 0, 9], up: 0.035, l: { sh: [-12, -6, 31], el: -92, wr: [0, 92, 0], curl: 0.12, thumb: 0.05 }, r: { sh: [-12, -6, 31], el: -92, wr: [0, 92, 0], curl: 0.12, thumb: 0.05 } });
    case "shock": return P({ lean: [-5, 0, 0], head: [-5, 0, 0], up: 0.015, l: { sh: [-30, 4, 36], el: -106, wr: [-12, 82, 0], curl: 0.02, thumb: 0 }, r: { sh: [-30, 4, 36], el: -106, wr: [-12, 82, 0], curl: 0.02, thumb: 0 } });
    case "thumbsup": return P({ spine: [0, -5, 0], head: [0, 0, 4], r: { sh: [-38, -6, 20], el: -56, wr: [0, 0, 0], curl: 1, thumb: 0.47 } });
    case "crossed": return P({ spine: [-2, 0, 0], head: [-2, 0, 0], l: { sh: [-22, -58, 10], el: -103, wr: [0, 20, 0], curl: 0.55, thumb: 0.5 }, r: { sh: [-16, -68, 12], el: -92, wr: [0, 20, 0], curl: 0.55, thumb: 0.5 } });
    case "walk": case "run": { const R = name === "run", q = t * (R ? 10 : 6.2), A = R ? 44 : 26, k = (ph: number) => Math.max(0, s(ph - 0.9)), kn = (ph: number) => (R ? 22 + 75 * k(ph) : 5 + 44 * k(ph)); const arm = (ph: number): Arm => ({ sh: [-s(ph) * (R ? 38 : 22), 0, 7], el: R ? -92 : -22 + s(ph) * 11, wr: [0, 0, 0], curl: R ? 0.72 : 0.35, thumb: 0.3 }); return P({ lean: [R ? 11 : 2, s(q) * 3, 0], spine: [0, -s(q) * (R ? 9 : 5), 0], head: [R ? -5 : 0, s(q) * 3, 0], l: arm(q + Math.PI), r: arm(q), lLeg: { h: [-s(q) * A, 0, -1], kn: kn(q), an: s(q) * 8 }, rLeg: { h: [s(q) * A, 0, -1], kn: kn(q + Math.PI), an: -s(q) * 8 } }); }
    default: return P({ spine: [b * 0.5, 0, 0], head: [0, s(t * 0.6) * 2, 0] });
  }
};
const lv = (a: number[], b: number[], k: number) => a.map((v, i) => mix(v, b[i], k));
const lArm = (a: Arm, b: Arm, k: number): Arm => ({ sh: lv(a.sh, b.sh, k), el: mix(a.el, b.el, k), wr: lv(a.wr, b.wr, k), curl: mix(a.curl, b.curl, k), thumb: mix(a.thumb, b.thumb, k), index: mix(a.index ?? a.curl, b.index ?? b.curl, k) });
const lLeg = (a: Leg, b: Leg, k: number): Leg => ({ h: lv(a.h, b.h, k), kn: mix(a.kn, b.kn, k), an: mix(a.an, b.an, k) });
const lPose = (a: Pose, b: Pose, k: number): Pose => ({ lean: lv(a.lean, b.lean, k), spine: lv(a.spine, b.spine, k), neck: lv(a.neck, b.neck, k), head: lv(a.head, b.head, k), up: mix(a.up, b.up, k), l: lArm(a.l, b.l, k), r: lArm(a.r, b.r, k), lLeg: lLeg(a.lLeg, b.lLeg, k), rLeg: lLeg(a.rLeg, b.rLeg, k) });
const reach = (l: Leg) => 0.035 + 0.42 * Math.cos(l.h[0] * D) + 0.42 * Math.cos((l.h[0] + l.kn) * D) + 0.097;

export type ManProps = { pose?: string; from?: string; blend?: number; expression?: Expression | string; t?: number; look?: number[]; colors?: Partial<ManColors>; outfit?: Outfit; stubble?: number; beard?: boolean; glasses?: boolean; position?: number[]; rotation?: number[]; scale?: number };
/** `pose` plus optional `from` and `blend` (0 = from, 1 = pose) for smooth changes. The mouth follows `expression`. `look` is [x, y] from -1 to 1. */
export const Man: React.FC<ManProps> = ({ pose: name = "idle", from, blend = 1, expression = "neutral", t = 0, look = [0, 0], colors, outfit = "shirt", stubble = 0.25, beard = true, glasses = false, position = [0, 0, 0], rotation = [0, 0, 0], scale = 1 }) => {
  const c = { ...DEFAULT, ...OUTFIT_COLORS[outfit], ...colors }, p = from ? lPose(pose(from, t), pose(name, t), clamp(blend)) : pose(name, t), hipsY = Math.max(reach(p.lLeg), reach(p.rLeg)), br = breathe(t) * 0.0028, ang = (a: number[]) => [a[0] * D, a[1] * D, a[2] * D] as any;
  return <group position={position as any} rotation={rotation as any} scale={scale}>
    <group position={[0, hipsY, 0]} rotation={ang(p.lean)}>
      <Pelvis c={c} outfit={outfit} />
      <LegRig l={p.lLeg} c={c} /><group scale={[-1, 1, 1]}><LegRig l={p.rLeg} c={c} /></group>
      <group position={[0, 0.12, 0]} rotation={ang(p.spine)}>
        <group scale={[1 + br * 2, 1 + br, 1 + br * 3]}><Torso c={c} outfit={outfit} /></group>
        <ArmRig a={p.l} c={c} up={p.up} outfit={outfit} /><group scale={[-1, 1, 1]}><ArmRig a={p.r} c={c} up={p.up} outfit={outfit} /></group>
        <group position={[0, 0.47, 0.004]} rotation={ang(p.neck)}><group position={[0, 0.04, 0.006]} rotation={ang(p.head)}><group position={[0, 0.07, 0.012]}><Head c={c} t={t} expression={expression} blend={1} look={look} stubble={stubble} beard={beard} glasses={glasses} /></group></group></group>
      </group>
    </group>
  </group>;
};

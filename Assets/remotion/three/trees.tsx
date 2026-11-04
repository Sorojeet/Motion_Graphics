// Detailed procedural 3D trees (12 varieties) and close-up leaves (8 varieties). Seeded, so renders are deterministic.
// Sizes are roughly real meters, with the base at y = 0. Use: <Tree variety="oak" t={time} wind={0.3} /> and <Leaf variety="maple" dry={0.4} />
import React, { useMemo } from "react";
import * as THREE from "three";
import { Instances, rng } from "./kit";

type LeafKind = "ovate" | "oak" | "maple" | "lance" | "needle" | "petal";
type Spec = {
  label: string; size: number; h: number; r: number; levels: number; n: number; spread: number; ratio: number; rRatio: number; wob: number; up: number; droop: number; start: number;
  leaves: number; leafSize: number; leafSpread: number; kind: LeafKind; leafCols: string[]; bark: string[]; barkStyle: "ridged" | "smooth" | "birch" | "plates" | "rings"; flare?: number; bulge?: number; whorl?: boolean; hang?: { count: number; len: number }; roots?: number; palm?: boolean; fruit?: string; trunks?: number; maxLeaves?: number; smooth?: boolean;
};
const G = ["#3f7d33", "#2f6b2d", "#55923f", "#4a8a38"];
export const TREES: Record<string, Spec> = {
  oak: { label: "Oak", size: 13, h: 3.6, r: 0.55, levels: 5, n: 3, spread: 0.8, ratio: 0.82, rRatio: 0.5, wob: 0.26, up: 0.06, droop: 0.02, start: 0.45, leaves: 90, leafSize: 0.3, leafSpread: 1.0, kind: "oak", leafCols: G, bark: ["#4b3a2c", "#2b2019"], barkStyle: "ridged", flare: 0.8 },
  maple: { label: "Autumn Maple", size: 12, h: 3.8, r: 0.38, levels: 5, n: 3, spread: 0.68, ratio: 0.78, rRatio: 0.52, wob: 0.18, up: 0.1, droop: 0, start: 0.5, leaves: 80, leafSize: 0.3, leafSpread: 0.95, kind: "maple", leafCols: ["#d9531e", "#c63d1b", "#e8862a", "#efb130", "#a92d1a"], bark: ["#54463a", "#30271f"], barkStyle: "ridged", flare: 0.5 },
  birch: { label: "Silver Birch", size: 13, h: 7, r: 0.2, levels: 5, n: 3, spread: 0.46, ratio: 0.68, rRatio: 0.48, wob: 0.14, up: 0.09, droop: 0.05, start: 0.4, leaves: 56, leafSize: 0.17, leafSpread: 0.75, kind: "ovate", leafCols: ["#7ea83e", "#92b846", "#a6c653", "#6d9a39"], bark: ["#e7e4da", "#1d1b19"], barkStyle: "birch", flare: 0.25 },
  pine: { label: "Pine", size: 16, h: 15, r: 0.34, levels: 3, n: 46, spread: 1.5, ratio: 0.31, rRatio: 0.34, wob: 0.06, up: 0.04, droop: 0.04, start: 0.14, leaves: 30, leafSize: 0.72, leafSpread: 0.42, kind: "needle", leafCols: ["#24512f", "#1e4629", "#2e5f35", "#346b3b"], bark: ["#4f3526", "#29190f"], barkStyle: "plates", flare: 0.4, whorl: true, maxLeaves: 14000 },
  cypress: { label: "Cypress", size: 14, h: 13.5, r: 0.24, levels: 3, n: 64, spread: 0.3, ratio: 0.2, rRatio: 0.35, wob: 0.05, up: 0.07, droop: 0, start: 0.07, leaves: 30, leafSize: 0.52, leafSpread: 0.3, kind: "needle", leafCols: ["#1f4a32", "#25553a", "#1a402c", "#2d6242"], bark: ["#54402f", "#2f2219"], barkStyle: "ridged", whorl: true, maxLeaves: 14000 },
  palm: { label: "Coconut Palm", size: 13, h: 10.5, r: 0.21, levels: 1, n: 0, spread: 0, ratio: 0, rRatio: 0.6, wob: 0, up: 0, droop: 0, start: 1, leaves: 0, leafSize: 0.72, leafSpread: 0, kind: "lance", leafCols: ["#3f8a3a", "#4f9a42", "#2f7a35", "#68a74a"], bark: ["#7c6a55", "#3e3126"], barkStyle: "rings", flare: 0.8, palm: true, fruit: "#5c4326" },
  cherry: { label: "Cherry Blossom", size: 10, h: 2.9, r: 0.26, levels: 5, n: 3, spread: 0.75, ratio: 0.76, rRatio: 0.52, wob: 0.28, up: 0.03, droop: 0.04, start: 0.55, leaves: 62, leafSize: 0.15, leafSpread: 0.72, kind: "petal", leafCols: ["#f7b8d0", "#f9cfe0", "#f39bbd", "#fde6ef"], bark: ["#3c2b28", "#1e1514"], barkStyle: "smooth", flare: 0.5 },
  willow: { label: "Weeping Willow", size: 13, h: 3.8, r: 0.48, levels: 4, n: 4, spread: 0.92, ratio: 0.78, rRatio: 0.48, wob: 0.2, up: 0.12, droop: 0, start: 0.55, leaves: 14, leafSize: 0.15, leafSpread: 0.3, kind: "lance", leafCols: ["#8bab3e", "#7a9c38", "#9bb94a", "#6b8f35"], bark: ["#54463a", "#2d241d"], barkStyle: "ridged", flare: 0.6, hang: { count: 6, len: 4.8 } },
  banyan: { label: "Banyan", size: 15, h: 3.7, r: 0.85, levels: 4, n: 4, spread: 0.98, ratio: 0.72, rRatio: 0.5, wob: 0.2, up: 0.01, droop: 0.03, start: 0.5, leaves: 42, leafSize: 0.3, leafSpread: 0.8, kind: "ovate", leafCols: ["#2f6d2f", "#3c7d36", "#27602a", "#4b8b3c"], bark: ["#6c5b49", "#3a2f25"], barkStyle: "ridged", flare: 1, roots: 26, trunks: 3 },
  baobab: { label: "Baobab", size: 12, h: 6.2, r: 1.35, levels: 4, n: 6, spread: 1.0, ratio: 0.56, rRatio: 0.4, wob: 0.13, up: 0.07, droop: 0, start: 0.9, leaves: 28, leafSize: 0.28, leafSpread: 0.45, kind: "ovate", leafCols: ["#6d9a3e", "#7dab46", "#5a8835"], bark: ["#8c7a68", "#57493c"], barkStyle: "smooth", flare: 0.25, bulge: 0.22, smooth: true },
  apple: { label: "Apple Tree", size: 8, h: 2.1, r: 0.2, levels: 5, n: 3, spread: 0.76, ratio: 0.76, rRatio: 0.54, wob: 0.3, up: 0.04, droop: 0.03, start: 0.55, leaves: 62, leafSize: 0.14, leafSpread: 0.55, kind: "ovate", leafCols: ["#3c7f33", "#4c9039", "#2e6d2c"], bark: ["#55463a", "#2c2219"], barkStyle: "plates", flare: 0.4, fruit: "#c8232b" },
  dead: { label: "Dead Tree", size: 11, h: 4, r: 0.42, levels: 5, n: 3, spread: 0.68, ratio: 0.62, rRatio: 0.48, wob: 0.36, up: 0.05, droop: 0, start: 0.4, leaves: 0, leafSize: 0, leafSpread: 0, kind: "ovate", leafCols: ["#000"], bark: ["#6a6058", "#2c2723"], barkStyle: "ridged", flare: 0.7 },
};
export const TREE_VARIETIES = Object.keys(TREES);

/* ---------- Leaf outlines: half shapes as [along, width], base at 0, tip at 1 ---------- */
const OUT: Record<string, { pts: number[][]; sharp?: boolean; serrate?: number; label: string; veins: number; cols: string[]; palmate?: boolean }> = {
  oak: { label: "Oak Leaf", veins: 6, cols: ["#4c8a35", "#2f6b2a"], pts: [[0, 0], [0.05, 0.06], [0.12, 0.1], [0.18, 0.06], [0.26, 0.17], [0.33, 0.1], [0.43, 0.25], [0.5, 0.13], [0.6, 0.28], [0.68, 0.14], [0.78, 0.22], [0.86, 0.1], [0.95, 0.11], [1, 0]] },
  maple: { label: "Maple Leaf", veins: 0, palmate: true, sharp: true, cols: ["#e0621f", "#b5301a"], pts: [[0.18, 0], [0.15, 0.12], [0.24, 0.18], [0.1, 0.46], [0.29, 0.38], [0.33, 0.5], [0.5, 0.36], [0.46, 0.22], [0.62, 0.28], [0.68, 0.14], [0.78, 0.17], [1, 0]] },
  birch: { label: "Birch Leaf", veins: 8, serrate: 26, cols: ["#8bb543", "#5f9136"], pts: [[0, 0], [0.08, 0.17], [0.22, 0.3], [0.42, 0.32], [0.65, 0.2], [0.85, 0.08], [1, 0]] },
  ginkgo: { label: "Ginkgo Leaf", veins: 0, palmate: true, cols: ["#e9c43a", "#c99a24"], pts: [[0, 0], [0.3, 0.03], [0.56, 0.26], [0.78, 0.47], [0.87, 0.4], [0.92, 0.2], [0.86, 0.05], [0.79, 0]] },
  peepal: { label: "Peepal Leaf", veins: 7, cols: ["#4c9440", "#2d6f31"], pts: [[0.12, 0], [0.05, 0.2], [0.12, 0.38], [0.3, 0.43], [0.5, 0.33], [0.68, 0.17], [0.82, 0.05], [1, 0]] },
  willow: { label: "Willow Leaf", veins: 12, serrate: 40, cols: ["#94b348", "#6d9538"], pts: [[0, 0], [0.1, 0.05], [0.4, 0.085], [0.7, 0.065], [0.9, 0.02], [1, 0]] },
};
const smoothPath = (x: CanvasRenderingContext2D, pts: number[][], sharp?: boolean) => { if (sharp) { pts.forEach((p, i) => (i ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1]))); return; } x.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length - 1; i++) { const m = [(pts[i][0] + pts[i + 1][0]) / 2, (pts[i][1] + pts[i + 1][1]) / 2]; x.quadraticCurveTo(pts[i][0], pts[i][1], m[0], m[1]); } const l = pts[pts.length - 1]; x.lineTo(l[0], l[1]); };
const outline = (o: (typeof OUT)[string]) => { let half = o.pts; if (o.serrate) { const d: number[][] = []; for (let i = 0; i <= o.serrate; i++) { const u = i / o.serrate, a = half.findIndex((p, k) => k < half.length - 1 && u >= p[0] && u <= half[k + 1][0]), p = half[Math.max(0, a)], q = half[Math.max(0, a) + 1], w = p[1] + ((u - p[0]) / (q[0] - p[0])) * (q[1] - p[1]); d.push([u, w * (i % 2 ? 1.05 : 0.95)]); } half = d; } return half; };

/* ---------- Close-up leaf ---------- */
const LEAF_VARIETIES_ALL = ["oak", "maple", "birch", "ginkgo", "peepal", "willow", "palm", "pine"];
export const LEAF_VARIETIES = LEAF_VARIETIES_ALL;
export const LEAF_LABELS: Record<string, string> = { oak: "Oak Leaf", maple: "Maple Leaf", birch: "Birch Leaf", ginkgo: "Ginkgo Leaf", peepal: "Peepal Leaf", willow: "Willow Leaf", palm: "Palm Frond", pine: "Pine Sprig" };
const leafArt = (kind: string, cols?: string[]) => {
  const S = 1024, cv = document.createElement("canvas"); cv.width = cv.height = S; const x = cv.getContext("2d")!, r = rng(kind.length * 37), X = (w: number) => S / 2 + w * S * 0.92, Y = (a: number) => S * (0.92 - a * 0.88);
  const mk = document.createElement("canvas"); mk.width = mk.height = S; const m = mk.getContext("2d")!; m.fillStyle = "#000"; m.fillRect(0, 0, S, S);
  const o = OUT[kind];
  const stem = (col: string) => { x.strokeStyle = col; x.lineWidth = 10; x.lineCap = "round"; x.beginPath(); x.moveTo(X(0), Y(-0.08)); x.lineTo(X(0), Y(0.12)); x.stroke(); };
  if (o) {
    const c = cols ?? o.cols, half = outline(o), side = (s: number) => half.map((p) => [X(p[1] * s), Y(p[0])]), path = () => { x.beginPath(); const R = side(1), L = side(-1).reverse(); smoothPath(x, R, o.sharp); smoothPath(x, L, o.sharp); x.closePath(); };
    stem(c[1]); path(); x.save(); x.clip();
    const g = x.createLinearGradient(0, Y(0), 0, Y(1)); g.addColorStop(0, c[1]); g.addColorStop(0.55, c[0]); g.addColorStop(1, c[0]); x.fillStyle = g; x.fillRect(0, 0, S, S);
    for (let i = 0; i < 1400; i++) { x.fillStyle = `rgba(${r() > 0.5 ? "255,255,220" : "0,20,0"},${0.012 + r() * 0.03})`; const w = 8 + r() * 34; x.beginPath(); x.ellipse(r() * S, r() * S, w, w * (0.3 + r() * 0.7), r() * 3, 0, 7); x.fill(); }
    const vein = (a: number[], b: number[], w: number, al = 0.52) => { x.strokeStyle = `rgba(245,240,170,${al})`; x.lineWidth = w; x.beginPath(); x.moveTo(a[0], a[1]); x.lineTo(b[0], b[1]); x.stroke(); x.strokeStyle = `rgba(0,0,0,${al * 0.32})`; x.lineWidth = w * 0.7; x.beginPath(); x.moveTo(a[0] + w, a[1] + w * 0.8); x.lineTo(b[0] + w, b[1] + w * 0.8); x.stroke(); };
    if (o.palmate) { const tips = kind === "maple" ? [[0.46, 0.1], [0.36, 0.33], [0.5, 0.36], [0.76, 0.17], [1, 0]] : Array.from({ length: 12 }, (_, i) => { const k = i / 11; return [0.84 * (1 - k * k * 0.4) + 0.04, 0.46 * Math.cos((k * Math.PI) / 2)]; }); for (const s of [1, -1]) for (const t of tips) { vein([X(0), Y(kind === "maple" ? 0.18 : 0.03)], [X(t[1] * s), Y(t[0])], kind === "maple" ? 7 : 3, kind === "maple" ? 0.6 : 0.34); } if (kind === "maple") for (let i = 0; i < 90; i++) { const a = r() * 6.28, l = 30 + r() * 300, s = [X(0) + Math.cos(a) * l, Y(0.42) + Math.sin(a) * l]; vein(s, [s[0] + (r() - 0.5) * 60, s[1] - 40 * r()], 1.5, 0.2); } }
    else { vein([X(0), Y(0)], [X(0), Y(1)], 8, 0.72); for (const s of [1, -1]) for (let i = 1; i <= o.veins; i++) { const a = (i / (o.veins + 1)) * 0.85, end = a + 0.15, wid = Math.max(...half.filter((p) => Math.abs(p[0] - end) < 0.15).map((p) => p[1]), 0.05); vein([X(0), Y(a)], [X(wid * 0.96 * s), Y(end)], 3.6); for (let k = 0; k < 3; k++) { const q = 0.3 + k * 0.22, px = wid * q * s, py = a + 0.15 * q; vein([X(px), Y(py)], [X(px + wid * 0.14 * s), Y(py - 0.04)], 1.4, 0.3); vein([X(px), Y(py)], [X(px - wid * 0.03 * s), Y(py + 0.05)], 1.4, 0.3); } } }
    x.restore();
    m.filter = "blur(26px)"; m.fillStyle = "#fff"; m.beginPath(); const R = half.map((p) => [X(p[1]), Y(p[0])]), L = half.map((p) => [X(-p[1]), Y(p[0])]).reverse(); smoothPath(m, R, o.sharp); smoothPath(m, L, o.sharp); m.closePath(); m.fill(); m.filter = "none";
  } else if (kind === "palm") {
    const c = cols ?? ["#3f8a3a", "#27672d"]; for (const s of [1, -1]) for (let i = 0; i < 34; i++) { const a = 0.04 + (i / 33) * 0.95, L = 0.46 * Math.sin(Math.PI * Math.min(1, a + 0.14)) ** 0.7 + 0.02, drop = -0.1 * (1 - a) - 0.05, b = [X(0), Y(a)], t = [X(L * s), Y(a + 0.1 + drop * 0)], w = 11; const g = x.createLinearGradient(b[0], b[1], t[0], t[1]); g.addColorStop(0, c[1]); g.addColorStop(1, c[0]); x.fillStyle = g; x.beginPath(); x.moveTo(b[0], b[1] - w); x.quadraticCurveTo((b[0] + t[0]) / 2, (b[1] + t[1]) / 2 - w * 1.2, t[0], t[1]); x.quadraticCurveTo((b[0] + t[0]) / 2, (b[1] + t[1]) / 2 + w, b[0], b[1] + w * 0.8); x.fill(); x.strokeStyle = "rgba(240,240,170,.35)"; x.lineWidth = 1.5; x.beginPath(); x.moveTo(b[0], b[1]); x.lineTo(t[0], t[1]); x.stroke(); m.strokeStyle = "#fff"; m.lineWidth = 16; m.beginPath(); m.moveTo(b[0], b[1]); m.lineTo(b[0] + (t[0] - b[0]) * (0.75 - r() * 0.12), b[1] + (t[1] - b[1]) * 0.7); m.stroke(); } x.strokeStyle = "#b49f5f"; x.lineWidth = 11; x.lineCap = "round"; x.beginPath(); x.moveTo(X(0), Y(-0.08)); x.lineTo(X(0), Y(1)); x.stroke();
  } else {
    const c = cols ?? ["#2e6a3a", "#1d4a2c"]; for (let i = 0; i < 620; i++) { const a = 0.03 + r() * 0.68, s = r() > 0.5 ? 1 : -1, ang = 0.4 + r() * 0.8, l = (0.26 + r() * 0.1) * (1 - a * 0.25), b = [X(0), Y(a)], t = [X(Math.sin(ang) * l * s), Y(a + Math.cos(ang) * l)]; x.strokeStyle = r() > 0.5 ? c[0] : c[1]; x.lineWidth = 3.4; x.lineCap = "round"; x.beginPath(); x.moveTo(b[0], b[1]); x.lineTo(t[0], t[1]); x.stroke(); m.strokeStyle = "#ccc"; m.lineWidth = 3; m.beginPath(); m.moveTo(b[0], b[1]); m.lineTo(b[0] + (t[0] - b[0]) * 0.7, b[1] + (t[1] - b[1]) * 0.7); m.stroke(); } x.strokeStyle = "#5a3d28"; x.lineWidth = 15; x.lineCap = "round"; x.beginPath(); x.moveTo(X(0), Y(-0.08)); x.lineTo(X(0), Y(0.78)); x.stroke();
  }
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return { map: t, mask: new THREE.CanvasTexture(mk) };
};
const leafGeo = (curl: number) => { const g = new THREE.PlaneGeometry(1, 1, 36, 36), p = g.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i) + 0.5; p.setZ(i, curl * (x * x * 0.8 - (y - 0.45) ** 2 * 0.4) + Math.sin(y * 9) * Math.cos(x * 5) * 0.012); p.setY(i, y); } g.computeVertexNormals(); return g; };
const artCache = new Map<string, ReturnType<typeof leafArt>>();
export type LeafProps = { variety?: string; dry?: number; curl?: number; colors?: string[]; position?: number[]; rotation?: number[]; scale?: number };
/** One detailed leaf, about 1 unit long, base at y = 0. `dry` 0 to 1 browns it from the edges in. `colors` is [light, dark]. */
export const Leaf: React.FC<LeafProps> = ({ variety = "oak", dry = 0, curl, colors, position = [0, 0, 0], rotation = [0, 0, 0], scale = 1 }) => {
  const art = useMemo(() => { const k = variety + JSON.stringify(colors ?? []); let a = artCache.get(k); if (!a) { a = leafArt(variety, colors); artCache.set(k, a); } return a; }, [variety, JSON.stringify(colors)]);
  const c = curl ?? 0.12 + dry * 0.55, geo = useMemo(() => leafGeo(c), [c]), u = useMemo(() => ({ value: 0 }), []); u.value = dry;
  const mat = useMemo(() => { const mm = new THREE.MeshStandardMaterial({ map: art.map, side: THREE.DoubleSide, alphaTest: 0.5, roughness: 0.62 }); mm.onBeforeCompile = (s) => { s.uniforms.uDry = u; s.uniforms.uMask = { value: art.mask }; s.fragmentShader = "uniform float uDry; uniform sampler2D uMask;\n" + s.fragmentShader.replace("#include <map_fragment>", "#include <map_fragment>\nfloat mk = texture2D(uMask, vMapUv).r; float br = uDry <= 0.0 ? 0.0 : smoothstep(mk - 0.09, mk + 0.09, uDry * 1.12); vec3 tan = mix(vec3(0.27, 0.12, 0.04), vec3(0.08, 0.035, 0.015), smoothstep(0.35, 0.05, mk)); diffuseColor.rgb = mix(diffuseColor.rgb, tan * (0.6 + 1.2 * dot(diffuseColor.rgb, vec3(0.5))), br);"); }; mm.customProgramCacheKey = () => "leaf-dry"; return mm; }, [art]);
  return <mesh geometry={geo} material={mat} position={position as any} rotation={rotation as any} scale={scale} castShadow />;
};

/* ---------- Tree skeleton ---------- */
type Built = { wood: THREE.BufferGeometry; leaves: { p: number[]; q: number[]; s: number; c: number; shade: number; o: number }[]; fruit: number[][]; top: number };
const V = (a: number[]) => new THREE.Vector3(a[0], a[1], a[2]);
const build = (key: string, sp: Spec, seed: number): Built => {
  const r = rng(seed * 131 + key.length * 17), pos: number[] = [], uv: number[] = [], idx: number[] = [], leaves: Built["leaves"] = [], fruit: number[][] = [];
  let top = 0;
  const addTube = (pts: THREE.Vector3[], rad: (k: number) => number, sides: number, flare = 0) => {
    const base = pos.length / 3; let n = new THREE.Vector3(1, 0, 0), len = 0;
    pts.forEach((p, i) => {
      const d = (pts[i + 1] ?? p).clone().sub(pts[i - 1] ?? p).normalize(); if (Math.abs(d.dot(n)) > 0.95) n = new THREE.Vector3(0, 0, 1); const a = n.clone().cross(d).normalize(), b = d.clone().cross(a).normalize(); n = b;
      if (i) len += p.distanceTo(pts[i - 1]); const R = rad(i / (pts.length - 1)); top = Math.max(top, p.y);
      for (let j = 0; j <= sides; j++) { const t = (j / sides) * Math.PI * 2, fl = flare ? 1 + flare * Math.exp(-p.y * 2.4) * (0.45 + 0.55 * Math.abs(Math.sin(t * 2.5 + 0.6))) : 1, q = R * fl * (flare ? 1 + (sp.smooth ? 0.025 : 0.06) * Math.sin(t * 7 + (sp.smooth ? p.y * 0.8 : i)) : 1); pos.push(p.x + (a.x * Math.cos(t) + b.x * Math.sin(t)) * q, p.y + (a.y * Math.cos(t) + b.y * Math.sin(t)) * q, p.z + (a.z * Math.cos(t) + b.z * Math.sin(t)) * q); uv.push((j / sides) * Math.max(1, Math.round(R * 6)), len * 0.6); }
    });
    for (let i = 0; i < pts.length - 1; i++) for (let j = 0; j < sides; j++) { const A = base + i * (sides + 1) + j, B = A + sides + 1; idx.push(A, A + 1, B, B, A + 1, B + 1); }
  };
  const q = new THREE.Quaternion(), e = new THREE.Euler();
  const leaf = (at: THREE.Vector3, s: number, d = new THREE.Vector3(0, 1, 0), lock = false, sp2 = sp.leafSpread) => {
    const dx = lock ? 0 : (r() + r() + r() - 1.5) * sp2 * 1.2, dy = lock ? 0 : (r() + r() + r() - 1.5) * sp2 * 0.85, dz = lock ? 0 : (r() + r() + r() - 1.5) * sp2 * 1.2;
    if (lock) q.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize()); else { e.set(r() * 6.28, r() * 6.28, r() * 6.28); q.setFromEuler(e); }
    leaves.push({ p: [at.x + dx, at.y + dy, at.z + dz], q: [q.x, q.y, q.z, q.w], s: s * (0.75 + r() * 0.5), c: Math.floor(r() * sp.leafCols.length), shade: 0.72 + r() * 0.42, o: r() });
  };
  const nodes: THREE.Vector3[] = [];
  const limb = (start: THREE.Vector3, dir: THREE.Vector3, len: number, rad: number, level: number) => {
    const N = sp.smooth ? (level === 0 ? 30 : level === 1 ? 16 : 9) : level === 0 ? 10 : 6, pts = [start.clone()], d = dir.clone().normalize(), stp = len / N;
    for (let i = 0; i < N; i++) { d.x += (r() - 0.5) * sp.wob; d.y += (r() - 0.5) * sp.wob * 0.5 + sp.up - sp.droop * level; d.z += (r() - 0.5) * sp.wob; d.normalize(); pts.push(pts[pts.length - 1].clone().addScaledVector(d, stp)); }
    const end = sp.levels === level + 1 ? rad * 0.25 : rad * sp.rRatio * 0.92;
    addTube(pts, (k) => { let v = rad + (end - rad) * (sp.smooth ? Math.pow(k, level === 0 ? 1.5 : 0.8) : k); if (level === 0 && sp.bulge) v *= 1 + sp.bulge * Math.sin(Math.min(1, k * 1.25) * Math.PI); return v; }, sp.smooth ? (level === 0 ? 40 : level === 1 ? 22 : 12) : level === 0 ? 16 : level === 1 ? 9 : 6, level === 0 ? sp.flare ?? 0 : 0);
    if (level >= 1 && level < 3) nodes.push(pts[3].clone());
    if (level + 1 >= sp.levels) {
      for (let i = 0; i < sp.leaves; i++) { const k = 0.25 + r() * 0.75, a = pts[Math.min(N, Math.floor(k * N))]; leaf(a, sp.leafSize); }
      if (sp.hang) for (let h = 0; h < sp.hang.count; h++) { const k = 0.2 + r() * 0.8, st = pts[Math.min(N, Math.floor(k * N))], dl = sp.hang.len * (0.45 + r() * 0.75), str = [st.clone()], M = 9, sway = [(r() - 0.5) * 0.1, (r() - 0.5) * 0.1]; for (let m = 1; m <= M; m++) { const pv = str[m - 1], y = Math.max(0.2, st.y - (dl * m) / M); str.push(new THREE.Vector3(pv.x + sway[0] + (st.x > 0 ? 0.04 : -0.04) * (1 - m / M) * 2, y, pv.z + sway[1] + (st.z > 0 ? 0.04 : -0.04) * (1 - m / M) * 2)); } addTube(str, () => 0.012, 3); for (let m = 2; m <= M; m++) for (let f = 0; f < 5; f++) { const a = str[m].clone().lerp(str[m - 1], r()), dd = new THREE.Vector3((r() - 0.5) * 0.9, -1, (r() - 0.5) * 0.9); leaf(a, sp.leafSize * 1.6, dd, true); } }
      if (sp.fruit && r() < 0.2) fruit.push([pts[N].x + (r() - 0.5) * 0.5, pts[N].y - r() * 0.3, pts[N].z + (r() - 0.5) * 0.5]);
      return;
    }
    const kids = sp.whorl ? (level === 0 ? sp.n : 5) : sp.n;
    for (let c = 0; c < kids; c++) {
      const t = sp.whorl ? sp.start + ((1 - sp.start) * c) / kids : sp.start + (1 - sp.start) * ((c + r()) / kids), P = pts[Math.min(N, Math.round(t * N))].clone();
      if (sp.whorl && level === 0) P.copy(pts[0].clone().lerp(pts[N], t));
      const az = c * 2.4 + r() * 0.5, parent = pts[Math.min(N, Math.round(t * N) + 1)].clone().sub(pts[Math.max(0, Math.round(t * N) - 1)]).normalize(), side = new THREE.Vector3(Math.cos(az), 0.2, Math.sin(az)).normalize();
      const ang = sp.spread * (0.82 + r() * 0.36), kid = parent.clone().multiplyScalar(Math.cos(ang)).addScaledVector(side, Math.sin(ang)).normalize();
      const fade = sp.whorl && level === 0 ? (1 - t) ** 0.85 + 0.1 : 1, l = len * sp.ratio * fade * (0.8 + r() * 0.4) * (sp.whorl && level === 1 ? 1.5 : 1);
      limb(P, sp.whorl && level === 1 ? kid.lerp(dir, 0.5).normalize() : kid, l, Math.max(0.018, rad * sp.rRatio * (sp.whorl ? fade : 1)), level + 1);
    }
  };
  if (sp.palm) {
    const pts: THREE.Vector3[] = []; const bend = 0.09; for (let i = 0; i <= 18; i++) { const k = i / 18; pts.push(new THREE.Vector3(bend * sp.h * k * k * 1.4, k * sp.h, bend * 0.3 * sp.h * k * k)); }
    addTube(pts, (k) => sp.r * (1.15 - k * 0.45), 14, sp.flare); const crown = pts[18];
    for (let f = 0; f < 22; f++) { const az = f * 2.4, ring = f / 22, lift = 0.95 - ring * 1.25, L = 4.4 + r() * 1.1, frond = [crown.clone()], M = 15; let dx = new THREE.Vector3(Math.cos(az) * Math.cos(lift), Math.sin(lift), Math.sin(az) * Math.cos(lift)); for (let m = 1; m <= M; m++) { dx = dx.clone(); dx.y -= 0.075 + (m / M) * 0.09; dx.normalize(); frond.push(frond[m - 1].clone().addScaledVector(dx, L / M)); } addTube(frond, (k) => 0.05 * (1 - k * 0.8), 5); const side = new THREE.Vector3(-Math.sin(az), 0, Math.cos(az)); for (let m = 2; m <= M; m++) for (let k = 0; k < 6; k++) { const at = frond[m].clone().lerp(frond[m - 1], k / 6), kk = m / M, pinna = 0.9 * Math.sin(Math.PI * Math.min(0.98, kk * 0.86 + 0.12)) + 0.15; for (const sd of [1, -1]) { const dd = frond[m].clone().sub(frond[m - 1]).normalize().multiplyScalar(0.55).addScaledVector(side, sd).add(new THREE.Vector3(0, -0.35, 0)); leaf(at, sp.leafSize * pinna * 1.45, dd, true); } } }
    for (let c = 0; c < 9; c++) { const a = c * 2.1; fruit.push([crown.x + Math.cos(a) * 0.3, crown.y - 0.35 - (c % 3) * 0.13, crown.z + Math.sin(a) * 0.3]); }
  } else {
    const nT = sp.trunks ?? 1; for (let i = 0; i < nT; i++) { const a = (i / nT) * 6.28; limb(new THREE.Vector3(i ? Math.cos(a) * sp.r * 0.72 : 0, 0, i ? Math.sin(a) * sp.r * 0.72 : 0), new THREE.Vector3(i ? Math.cos(a) * 0.25 : 0, 1, i ? Math.sin(a) * 0.25 : 0), sp.h, i ? sp.r * 0.72 : sp.r, 0); }
    if (sp.roots) for (let i = 0; i < sp.roots && nodes.length; i++) { const st = nodes[Math.floor(r() * nodes.length)], pts = [st.clone()], M = 7; for (let m = 1; m <= M; m++) pts.push(new THREE.Vector3(st.x + (r() - 0.5) * 0.12 * (m > 1 ? 1 : 0), st.y * (1 - m / M), st.z + (r() - 0.5) * 0.12 * (m > 1 ? 1 : 0))); addTube(pts, (k) => 0.03 + 0.12 * k * k + r() * 0.002, 6); }
  }
  const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
  const max = sp.maxLeaves ?? 18000; const kept = leaves.length > max ? leaves.filter((_, i) => i % Math.ceil(leaves.length / max) === 0) : leaves;
  return { wood: g, leaves: kept, fruit, top };
};
const barkTex = (style: Spec["barkStyle"], a: string, b: string) => {
  const S = 512, cv = document.createElement("canvas"), bm = document.createElement("canvas"); cv.width = cv.height = bm.width = bm.height = S; const x = cv.getContext("2d")!, y = bm.getContext("2d")!, r = rng(style.length * 11); x.fillStyle = a; x.fillRect(0, 0, S, S); y.fillStyle = "#999"; y.fillRect(0, 0, S, S);
  const both = (col: string, g: string, fn: (c: CanvasRenderingContext2D) => void) => { x.fillStyle = x.strokeStyle = col; fn(x); y.fillStyle = y.strokeStyle = g; fn(y); };
  if (style === "ridged") for (let i = 0; i < 170; i++) { const px = r() * S, py = r() * S, l = 40 + r() * 150, w = 2 + r() * 6; both(b, "#222", (c) => { c.lineWidth = w; c.beginPath(); c.moveTo(px, py); c.bezierCurveTo(px + (r() - 0.5) * 22, py + l / 3, px + (r() - 0.5) * 22, py + (2 * l) / 3, px + (r() - 0.5) * 14, py + l); c.stroke(); }); }
  if (style === "plates") for (let i = 0; i < 95; i++) { const px = r() * S, py = r() * S; both(b, "#222", (c) => { c.lineWidth = 3; c.beginPath(); c.ellipse(px, py, 16 + r() * 18, 28 + r() * 30, (r() - 0.5) * 0.4, 0, 7); c.stroke(); }); }
  if (style === "smooth") for (let i = 0; i < 90; i++) { const px = r() * S, py = r() * S; both(b + "88", "#666", (c) => { c.lineWidth = 1 + r() * 3; c.beginPath(); c.moveTo(px, py); c.lineTo(px + (r() - 0.5) * 22, py + 14 + r() * 40); c.stroke(); }); }
  if (style === "birch") for (let i = 0; i < 70; i++) { const px = r() * S, py = r() * S, l = 8 + r() * 70, h = 1.5 + r() * 6; both(b, "#222", (c) => { c.beginPath(); c.ellipse(px, py, l, h, 0, 0, 7); c.fill(); }); }
  if (style === "rings") for (let i = 0; i < 14; i++) { const py = (i / 14) * S; both(b, "#222", (c) => { c.fillRect(0, py, S, 5); }); both(a, "#ccc", (c) => { c.fillRect(0, py + 5, S, 5); }); }
  const t = new THREE.CanvasTexture(cv), m = new THREE.CanvasTexture(bm); for (const q of [t, m]) { q.wrapS = q.wrapT = THREE.RepeatWrapping; q.anisotropy = 4; } t.colorSpace = THREE.SRGBColorSpace; return { map: t, bump: m };
};
const kindGeo = (k: LeafKind) => {
  if (k === "needle") { const pos: number[] = []; for (let i = 0; i < 10; i++) { const a = (i / 10) * 6.28, l = 0.42, t = 1, w = 0.03, cx = Math.cos(a), cz = Math.sin(a); pos.push(-w * cz, 0, w * cx, cx * l, t, cz * l, w * cz, 0, -w * cx); } const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.computeVertexNormals(); return g; }
  const half = k === "oak" ? OUT.oak.pts : k === "maple" ? OUT.maple.pts : k === "lance" ? [[0, 0], [0.3, 0.065], [0.7, 0.05], [1, 0]] : k === "petal" ? [[0, 0], [0.35, 0.33], [0.8, 0.36], [1, 0.1], [1, 0]] : [[0, 0], [0.22, 0.28], [0.5, 0.31], [0.8, 0.14], [1, 0]];
  const s = new THREE.Shape(); half.forEach((p, i) => (i ? s.lineTo(p[1], p[0]) : s.moveTo(p[1], p[0]))); [...half].reverse().forEach((p) => s.lineTo(-p[1], p[0])); const g = new THREE.ShapeGeometry(s); if (k !== "oak" && k !== "maple") { const p = g.attributes.position; for (let i = 0; i < p.count; i++) p.setZ(i, Math.abs(p.getX(i)) * 0.3); g.computeVertexNormals(); } return g;
};
/** Sways anything above the ground, by height. */
const windy = <T extends THREE.Material>(m: T, u: { value: THREE.Vector2 }, h: number, flutter: number) => { m.onBeforeCompile = (s) => { s.uniforms.uW = u; s.vertexShader = "uniform vec2 uW;\n" + s.vertexShader.replace("#include <project_vertex>", `vec4 mvPosition = vec4(transformed, 1.0);\n#ifdef USE_INSTANCING\nmvPosition = instanceMatrix * mvPosition;\nfloat fl = sin(uW.y * 3.1 + instanceMatrix[3][0] * 7.0 + instanceMatrix[3][2] * 5.0) * ${flutter.toFixed(3)} * uW.x;\nmvPosition.y += fl * position.y;\n#endif\nfloat hk = pow(max(mvPosition.y, 0.0) / ${h.toFixed(2)}, 1.6);\nmvPosition.x += uW.x * hk * (0.7 + 0.3 * sin(uW.y + mvPosition.y * 0.5 + mvPosition.z * 0.4));\nmvPosition.z += uW.x * 0.35 * hk * sin(uW.y * 0.8 + mvPosition.x * 0.4);\nmvPosition = modelViewMatrix * mvPosition;\ngl_Position = projectionMatrix * mvPosition;`); }; m.customProgramCacheKey = () => `tree-wind-${h}-${flutter}`; return m; };
const cache = new Map<string, Built>();
/** Height of a tree in meters, for fitting it to a scene. */
export const treeHeight = (variety: string, seed = 1) => { const k = `${variety}${seed}`; let b = cache.get(k); if (!b) { b = build(variety, TREES[variety], seed); cache.set(k, b); } return b.top; };
/** Widest reach of a tree from its trunk in meters, including leaves. */
export const treeReach = (variety: string, seed = 1) => { treeHeight(variety, seed); return Math.max(1, ...cache.get(`${variety}${seed}`)!.leaves.map((l) => Math.max(Math.abs(l.p[0]), Math.abs(l.p[2])))); };
export type TreeProps = { variety?: string; seed?: number; t?: number; wind?: number; dry?: number; leafAmount?: number; leafColors?: string[]; position?: number[]; rotation?: number[]; scale?: number; shadows?: boolean };
/** A detailed tree. `seed` gives a different tree of the same kind. `t` and `wind` sway it. `dry` turns leaves brown, and `leafAmount` (1 to 0) thins them. */
export const Tree: React.FC<TreeProps> = ({ variety = "oak", seed = 1, t = 0, wind = 0.25, dry = 0, leafAmount = 1, leafColors, position = [0, 0, 0], rotation = [0, 0, 0], scale = 1, shadows = true }) => {
  const key = TREES[variety] ? variety : "oak", sp = TREES[key], built = useMemo(() => { const k = `${key}${seed}`; let b = cache.get(k); if (!b) { b = build(key, sp, seed); cache.set(k, b); } return b; }, [key, seed]);
  const u = useMemo(() => ({ value: new THREE.Vector2() }), []); u.value.set(wind, t * 1.4 + seed);
  const tex = useMemo(() => barkTex(sp.barkStyle, sp.bark[0], sp.bark[1]), [key]);
  const wood = useMemo(() => windy(new THREE.MeshStandardMaterial({ map: tex.map, bumpMap: tex.bump, bumpScale: 2.2, roughness: 0.95 }), u, built.top, 0), [tex, built]);
  const lm = useMemo(() => windy(new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, roughness: 0.68 }), u, built.top, sp.kind === "needle" ? 0.02 : 0.06), [built]);
  const geo = useMemo(() => kindGeo(sp.kind), [sp.kind]), cols = leafColors ?? sp.leafCols, brown = ["#7a4c22", "#5e3a1c", "#92602a", "#6b431f"];
  return <group position={position as any} rotation={rotation as any} scale={scale}>
    <mesh geometry={built.wood} material={wood} castShadow={shadows} receiveShadow />
    {built.leaves.length ? <Instances count={built.leaves.length} dep={`${dry}|${leafAmount}|${cols.join()}|${seed}`} castShadow={shadows} fill={(i, d, c) => { const l = built.leaves[i], s = l.o < leafAmount ? l.s : 0; d.position.set(l.p[0], l.p[1], l.p[2]); d.quaternion.set(l.q[0], l.q[1], l.q[2], l.q[3]); d.scale.setScalar(s); const h = Math.min(1, l.p[1] / (built.top || 1)); c.set(cols[l.c % cols.length]).lerp(new THREE.Color(brown[l.c % 4]), dry * (0.5 + l.o * 0.6) > 0.5 ? Math.min(1, dry * 1.2) : dry * 0.6).multiplyScalar(l.shade * (0.62 + h * 0.5)); }}><primitive object={geo} attach="geometry" /><primitive object={lm} attach="material" /></Instances> : null}
    {built.fruit.map((f, i) => <mesh key={i} position={f as any} castShadow={shadows} scale={sp.palm ? 0.2 : 0.07}><sphereGeometry args={[1, 12, 10]} /><meshPhysicalMaterial color={sp.fruit} roughness={0.34} clearcoat={0.6} /></mesh>)}
  </group>;
};

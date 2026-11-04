// Detailed procedural 3D fish in ten varieties. Everything is seeded and driven by props, so renders are deterministic.
// Local axes: head toward +x, back toward +y, about 2 units long. Use: <Fish variety="koi" t={time} position={[0, 0, 0]} />
import React, { useMemo } from "react";
import * as THREE from "three";
import { rng } from "./kit";

type Knots = number[][];
type Fin = { from: number; to: number; h: Knots; sweep?: number };
export type FishColors = { back: string; flank: string; belly: string; head?: string; a?: string; b?: string; fin: string; finTip: string; iris: string; tail?: string; tailTip?: string };
type Spec = {
  label: string; top: Knots; bot: Knots; wid: Knots; colors: FishColors; pattern: string; scales: number; scaleA: number; shine: number;
  dorsal: Fin[]; anal: Fin[]; tail: { type: "fork" | "round" | "lunate" | "fan" | "square"; len: number; spread: number };
  pect: { u: number; y: number; len: number; w: number; a: number }; pelvic?: { u: number; len: number; w: number }; eye: { u: number; y: number; r: number }; barbels?: boolean; finlets?: boolean;
};

const STD_W: Knots = [[0, 0.02], [0.08, 0.1], [0.28, 0.2], [0.5, 0.2], [0.8, 0.09], [1, 0.03]];
export const FISH: Record<string, Spec> = {
  goldfish: { label: "Goldfish", top: [[0, 0.03], [0.12, 0.16], [0.35, 0.4], [0.6, 0.36], [0.85, 0.13], [1, 0.07]], bot: [[0, 0.03], [0.12, 0.17], [0.4, 0.44], [0.65, 0.34], [0.85, 0.12], [1, 0.07]], wid: [[0, 0.03], [0.1, 0.13], [0.35, 0.29], [0.6, 0.25], [0.85, 0.09], [1, 0.03]], colors: { back: "#e8590f", flank: "#f6821f", belly: "#ffd9a0", a: "#fff4e4", fin: "#f9862a", finTip: "#ffe4bd", iris: "#e8c547" }, pattern: "patch", scales: 15, scaleA: 0.34, shine: 0.75, dorsal: [{ from: 0.3, to: 0.82, h: [[0, 0.1], [0.15, 0.3], [0.6, 0.2], [1, 0.05]], sweep: -0.1 }], anal: [{ from: 0.68, to: 0.85, h: [[0, 0.06], [0.3, 0.24], [1, 0.08]], sweep: -0.14 }], tail: { type: "fan", len: 0.85, spread: 0.72 }, pect: { u: 0.29, y: -0.14, len: 0.32, w: 0.16, a: 0.9 }, pelvic: { u: 0.46, len: 0.3, w: 0.12 }, eye: { u: 0.13, y: 0.05, r: 0.06 } },
  koi: { label: "Koi", top: [[0, 0.03], [0.1, 0.11], [0.32, 0.23], [0.6, 0.21], [0.85, 0.1], [1, 0.06]], bot: [[0, 0.03], [0.1, 0.12], [0.35, 0.21], [0.65, 0.17], [0.85, 0.09], [1, 0.06]], wid: STD_W, colors: { back: "#f6f1e6", flank: "#fbf7ee", belly: "#fffdf7", a: "#e2401f", b: "#191614", fin: "#fbf3e6", finTip: "#ffffff", iris: "#d9b13a" }, pattern: "koi", scales: 18, scaleA: 0.3, shine: 0.7, dorsal: [{ from: 0.32, to: 0.8, h: [[0, 0.07], [0.12, 0.17], [1, 0.05]], sweep: -0.1 }], anal: [{ from: 0.74, to: 0.88, h: [[0, 0.05], [0.3, 0.13], [1, 0.05]], sweep: -0.08 }], tail: { type: "fork", len: 0.46, spread: 0.36 }, pect: { u: 0.27, y: -0.12, len: 0.3, w: 0.15, a: 0.95 }, pelvic: { u: 0.5, len: 0.2, w: 0.1 }, eye: { u: 0.13, y: 0.04, r: 0.042 }, barbels: true },
  clownfish: { label: "Clownfish", top: [[0, 0.04], [0.12, 0.18], [0.35, 0.33], [0.65, 0.28], [0.88, 0.14], [1, 0.1]], bot: [[0, 0.04], [0.12, 0.18], [0.35, 0.3], [0.65, 0.23], [0.88, 0.12], [1, 0.09]], wid: [[0, 0.03], [0.1, 0.12], [0.3, 0.2], [0.6, 0.15], [1, 0.03]], colors: { back: "#e85a10", flank: "#f77a1a", belly: "#ffa23f", a: "#fdfdf8", b: "#15120f", fin: "#f4701a", finTip: "#17120e", iris: "#e78b1f" }, pattern: "clown", scales: 22, scaleA: 0.12, shine: 0.8, dorsal: [{ from: 0.26, to: 0.54, h: [[0, 0.08], [0.3, 0.2], [1, 0.08]], sweep: -0.03 }, { from: 0.56, to: 0.88, h: [[0, 0.1], [0.4, 0.22], [1, 0.09]], sweep: -0.05 }], anal: [{ from: 0.66, to: 0.88, h: [[0, 0.06], [0.4, 0.2], [1, 0.08]], sweep: -0.05 }], tail: { type: "round", len: 0.42, spread: 0.3 }, pect: { u: 0.3, y: -0.08, len: 0.26, w: 0.17, a: 0.85 }, pelvic: { u: 0.38, len: 0.2, w: 0.1 }, eye: { u: 0.14, y: 0.07, r: 0.06 } },
  angelfish: { label: "Angelfish", top: [[0, 0.03], [0.12, 0.2], [0.38, 0.52], [0.62, 0.48], [0.86, 0.14], [1, 0.07]], bot: [[0, 0.03], [0.12, 0.2], [0.38, 0.5], [0.62, 0.45], [0.86, 0.13], [1, 0.07]], wid: [[0, 0.02], [0.1, 0.07], [0.35, 0.1], [0.65, 0.08], [1, 0.02]], colors: { back: "#b9bcae", flank: "#dfe1d2", belly: "#f4f3e6", a: "#17171a", fin: "#d8d9ca", finTip: "#1c1c20", iris: "#c43b28" }, pattern: "bars", scales: 24, scaleA: 0.14, shine: 0.85, dorsal: [{ from: 0.42, to: 0.92, h: [[0, 0.26], [0.12, 0.35], [0.55, 0.18], [1, 0.07]], sweep: -0.3 }], anal: [{ from: 0.42, to: 0.92, h: [[0, 0.26], [0.12, 0.35], [0.55, 0.18], [1, 0.07]], sweep: -0.3 }], tail: { type: "lunate", len: 0.42, spread: 0.3 }, pect: { u: 0.3, y: -0.05, len: 0.22, w: 0.11, a: 0.6 }, pelvic: { u: 0.32, len: 0.26, w: 0.04 }, eye: { u: 0.14, y: 0.06, r: 0.058 } },
  trout: { label: "Rainbow Trout", top: [[0, 0.02], [0.1, 0.1], [0.35, 0.2], [0.65, 0.18], [0.88, 0.09], [1, 0.06]], bot: [[0, 0.02], [0.1, 0.1], [0.35, 0.2], [0.65, 0.16], [0.88, 0.08], [1, 0.06]], wid: [[0, 0.02], [0.08, 0.08], [0.32, 0.15], [0.6, 0.14], [0.85, 0.06], [1, 0.02]], colors: { back: "#46603f", flank: "#a4ad8f", belly: "#f2f1e6", a: "#d1496f", b: "#17190f", fin: "#7f8a70", finTip: "#c9ccb4", iris: "#c7b271" }, pattern: "trout", scales: 34, scaleA: 0.2, shine: 0.85, dorsal: [{ from: 0.42, to: 0.6, h: [[0, 0.06], [0.2, 0.2], [1, 0.05]], sweep: -0.08 }, { from: 0.8, to: 0.86, h: [[0, 0.03], [0.5, 0.06], [1, 0.02]] }], anal: [{ from: 0.72, to: 0.85, h: [[0, 0.05], [0.2, 0.15], [1, 0.05]], sweep: -0.08 }], tail: { type: "square", len: 0.42, spread: 0.3 }, pect: { u: 0.26, y: -0.13, len: 0.25, w: 0.1, a: 0.95 }, pelvic: { u: 0.56, len: 0.17, w: 0.07 }, eye: { u: 0.12, y: 0.03, r: 0.037 } },
  bass: { label: "Largemouth Bass", top: [[0, 0.05], [0.12, 0.13], [0.36, 0.27], [0.65, 0.21], [0.88, 0.09], [1, 0.06]], bot: [[0, 0.06], [0.12, 0.17], [0.36, 0.26], [0.65, 0.2], [0.88, 0.09], [1, 0.06]], wid: [[0, 0.03], [0.1, 0.13], [0.32, 0.19], [0.62, 0.15], [0.85, 0.06], [1, 0.02]], colors: { back: "#34492a", flank: "#7f9353", belly: "#eef0d0", a: "#1d2815", fin: "#5a6a3b", finTip: "#a8b37d", iris: "#c39b2e" }, pattern: "bass", scales: 28, scaleA: 0.26, shine: 0.6, dorsal: [{ from: 0.27, to: 0.56, h: [[0, 0.09], [0.25, 0.24], [0.75, 0.13], [1, 0.05]], sweep: -0.03 }, { from: 0.58, to: 0.82, h: [[0, 0.08], [0.3, 0.2], [1, 0.05]], sweep: -0.07 }], anal: [{ from: 0.68, to: 0.84, h: [[0, 0.06], [0.3, 0.16], [1, 0.05]], sweep: -0.07 }], tail: { type: "square", len: 0.42, spread: 0.31 }, pect: { u: 0.29, y: -0.1, len: 0.27, w: 0.13, a: 0.9 }, pelvic: { u: 0.35, len: 0.22, w: 0.08 }, eye: { u: 0.14, y: 0.05, r: 0.045 } },
  tuna: { label: "Bluefin Tuna", top: [[0, 0.02], [0.1, 0.11], [0.36, 0.28], [0.65, 0.2], [0.9, 0.05], [1, 0.03]], bot: [[0, 0.02], [0.1, 0.11], [0.36, 0.27], [0.65, 0.18], [0.9, 0.05], [1, 0.03]], wid: [[0, 0.02], [0.1, 0.1], [0.36, 0.24], [0.65, 0.16], [0.9, 0.05], [1, 0.03]], colors: { back: "#101d3a", flank: "#8f9fae", belly: "#e7ebea", a: "#1b305c", b: "#d8bf43", fin: "#29406f", finTip: "#55749f", iris: "#1d2020", tail: "#2f4676", tailTip: "#587bab" }, pattern: "tuna", scales: 0, scaleA: 0, shine: 1, dorsal: [{ from: 0.33, to: 0.47, h: [[0, 0.17], [0.4, 0.1], [1, 0.03]], sweep: -0.1 }, { from: 0.52, to: 0.64, h: [[0, 0.2], [0.5, 0.15], [1, 0.03]], sweep: -0.14 }], anal: [{ from: 0.56, to: 0.67, h: [[0, 0.19], [0.5, 0.14], [1, 0.03]], sweep: -0.14 }], tail: { type: "lunate", len: 0.42, spread: 0.52 }, pect: { u: 0.26, y: 0.0, len: 0.34, w: 0.07, a: 0.48 }, pelvic: { u: 0.31, len: 0.11, w: 0.05 }, eye: { u: 0.1, y: 0.02, r: 0.035 }, finlets: true },
  catfish: { label: "Catfish", top: [[0, 0.03], [0.1, 0.1], [0.3, 0.17], [0.6, 0.16], [0.88, 0.1], [1, 0.05]], bot: [[0, 0.03], [0.1, 0.09], [0.3, 0.14], [0.6, 0.13], [0.88, 0.08], [1, 0.05]], wid: [[0, 0.03], [0.1, 0.17], [0.25, 0.2], [0.6, 0.11], [0.88, 0.05], [1, 0.02]], colors: { back: "#3f4246", flank: "#74787a", belly: "#e8e6dc", a: "#24272a", fin: "#494d50", finTip: "#7d8183", iris: "#b89a4c" }, pattern: "mottle", scales: 0, scaleA: 0, shine: 0.55, dorsal: [{ from: 0.28, to: 0.38, h: [[0, 0.09], [0.15, 0.24], [1, 0.05]], sweep: -0.08 }, { from: 0.76, to: 0.84, h: [[0, 0.04], [0.5, 0.08], [1, 0.03]] }], anal: [{ from: 0.62, to: 0.94, h: [[0, 0.04], [0.5, 0.13], [1, 0.05]], sweep: -0.05 }], tail: { type: "fork", len: 0.42, spread: 0.3 }, pect: { u: 0.23, y: -0.09, len: 0.28, w: 0.1, a: 1.1 }, pelvic: { u: 0.52, len: 0.17, w: 0.07 }, eye: { u: 0.1, y: 0.05, r: 0.026 }, barbels: true },
  piranha: { label: "Red-Bellied Piranha", top: [[0, 0.06], [0.1, 0.16], [0.36, 0.37], [0.65, 0.27], [0.88, 0.1], [1, 0.06]], bot: [[0, 0.09], [0.1, 0.24], [0.36, 0.41], [0.65, 0.31], [0.88, 0.11], [1, 0.06]], wid: [[0, 0.04], [0.1, 0.13], [0.36, 0.18], [0.65, 0.13], [1, 0.02]], colors: { back: "#3c4a52", flank: "#94a4a6", belly: "#c62f1f", a: "#e8efef", b: "#16191b", fin: "#7a4238", finTip: "#352320", iris: "#d8421f", tail: "#666b70", tailTip: "#2a2c30" }, pattern: "piranha", scales: 40, scaleA: 0.2, shine: 0.85, dorsal: [{ from: 0.36, to: 0.58, h: [[0, 0.1], [0.3, 0.2], [1, 0.05]], sweep: -0.06 }, { from: 0.78, to: 0.84, h: [[0, 0.03], [0.5, 0.06], [1, 0.02]] }], anal: [{ from: 0.62, to: 0.86, h: [[0, 0.07], [0.3, 0.16], [1, 0.04]], sweep: -0.05 }], tail: { type: "square", len: 0.4, spread: 0.32 }, pect: { u: 0.27, y: -0.2, len: 0.2, w: 0.1, a: 0.9 }, pelvic: { u: 0.5, len: 0.14, w: 0.07 }, eye: { u: 0.12, y: 0.07, r: 0.055 } },
  bluetang: { label: "Blue Tang", top: [[0, 0.03], [0.1, 0.16], [0.35, 0.44], [0.68, 0.38], [0.9, 0.11], [1, 0.05]], bot: [[0, 0.03], [0.1, 0.16], [0.35, 0.42], [0.68, 0.36], [0.9, 0.1], [1, 0.05]], wid: [[0, 0.02], [0.1, 0.07], [0.35, 0.12], [0.68, 0.1], [1, 0.02]], colors: { back: "#0d43c6", flank: "#1261e5", belly: "#2b7df0", a: "#080b1d", b: "#f6d81f", fin: "#0c2fa6", finTip: "#09102c", iris: "#101014", tail: "#f6d81f", tailTip: "#ffe95a" }, pattern: "tang", scales: 0, scaleA: 0, shine: 0.9, dorsal: [{ from: 0.2, to: 0.94, h: [[0, 0.05], [0.25, 0.13], [0.8, 0.15], [1, 0.05]], sweep: -0.03 }], anal: [{ from: 0.45, to: 0.94, h: [[0, 0.05], [0.25, 0.14], [0.8, 0.15], [1, 0.05]], sweep: -0.03 }], tail: { type: "square", len: 0.4, spread: 0.32 }, pect: { u: 0.28, y: -0.04, len: 0.24, w: 0.13, a: 0.7 }, pelvic: { u: 0.35, len: 0.15, w: 0.07 }, eye: { u: 0.13, y: 0.1, r: 0.05 } },
};
export type FishVariety = keyof typeof FISH;
export const FISH_VARIETIES = Object.keys(FISH);

/* ---------- Shape ---------- */
const BODY = 1.6; // nose at x = 1, end of the body at x = 1 - BODY
const X = (u: number) => 1 - u * BODY;
const curve = (k: Knots, u: number) => {
  u = Math.min(1, Math.max(0, u)); let i = 0; while (i < k.length - 2 && u > k[i + 1][0]) i++;
  const p0 = k[Math.max(0, i - 1)], p1 = k[i], p2 = k[i + 1], p3 = k[Math.min(k.length - 1, i + 2)], s = (u - p1[0]) / (p2[0] - p1[0] || 1), a = p1[1], b = p2[1], m1 = ((b - p0[1]) / 2) * 0.8, m2 = ((p3[1] - a) / 2) * 0.8;
  return Math.max(0, (2 * s ** 3 - 3 * s ** 2 + 1) * a + (s ** 3 - 2 * s ** 2 + s) * m1 + (-2 * s ** 3 + 3 * s ** 2) * b + (s ** 3 - s ** 2) * m2);
};
const bodyGeometry = (sp: Spec) => {
  const R = 110, S = 56, pos: number[] = [], uv: number[] = [], idx: number[] = [];
  for (let i = 0; i <= R; i++) {
    const u = i / R, top = curve(sp.top, u), bot = curve(sp.bot, u), w = curve(sp.wid, u);
    for (let j = 0; j <= S; j++) {
      const a = (j / S) * Math.PI * 2, s = Math.sin(a);
      pos.push(X(u), s * (s > 0 ? top : bot), Math.cos(a) * w); uv.push(u, (s + 1) / 2);
    }
  }
  for (let i = 0; i < R; i++) for (let j = 0; j < S; j++) { const a = i * (S + 1) + j, b = a + S + 1; idx.push(a, b, a + 1, b, b + 1, a + 1); }
  const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals(); return g;
};
/** A strip of fin rays, from base points to tip points, with slight pleats. */
const finGeometry = (base: number[][], tip: number[][]) => {
  const n = base.length, M = 6, pos: number[] = [], uv: number[] = [], idx: number[] = [];
  for (let i = 0; i < n; i++) for (let j = 0; j <= M; j++) {
    const k = j / M; pos.push(base[i][0] + (tip[i][0] - base[i][0]) * k, base[i][1] + (tip[i][1] - base[i][1]) * k, Math.sin(i * 2.4) * 0.007 * k); uv.push(n > 1 ? i / (n - 1) : 0, k);
  }
  for (let i = 0; i < n - 1; i++) for (let j = 0; j < M; j++) { const a = i * (M + 1) + j, b = a + M + 1; idx.push(a, b, a + 1, b, b + 1, a + 1); }
  const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals(); return g;
};
const backFin = (sp: Spec, f: Fin, up: number) => {
  const n = 26, base: number[][] = [], tip: number[][] = [], prof = up > 0 ? sp.top : sp.bot;
  for (let i = 0; i < n; i++) { const k = i / (n - 1), u = f.from + (f.to - f.from) * k, y = curve(prof, u) * 0.96, h = curve(f.h, k); base.push([X(u), up * y]); tip.push([X(u) + (f.sweep ?? -0.04) * (0.4 + h * 3) - h * 0.12, up * (y + h)]); }
  return finGeometry(base, tip);
};
const tailFin = (sp: Spec) => {
  const n = 34, { type, len, spread } = sp.tail, h = Math.max(curve(sp.top, 1), curve(sp.bot, 1)) * 0.95, x0 = X(0.98), base: number[][] = [], tip: number[][] = [];
  for (let i = 0; i < n; i++) {
    const v = (i / (n - 1)) * 2 - 1, a = Math.abs(v);
    const L = type === "fork" ? len * (0.58 + 0.42 * a ** 1.3) : type === "lunate" ? len * (0.28 + 0.72 * a ** 1.6) : type === "round" ? len * (1 - 0.28 * a * a) : type === "fan" ? len * (0.7 + 0.3 * Math.abs(Math.sin(v * 3.1)) ) : len * (0.93 + 0.07 * a);
    base.push([x0, v * h]); tip.push([x0 - L, v * spread]);
  }
  return finGeometry(base, tip);
};
const pairedFin = (len: number, w: number, a: number) => {
  const n = 16, base: number[][] = [], tip: number[][] = [];
  for (let i = 0; i < n; i++) { const k = i / (n - 1), ang = -Math.PI + a * (k - 0.5) * 1.4 + 0.35, L = len * (0.65 + 0.35 * Math.sin(k * Math.PI)); base.push([0, (k - 0.5) * w * 0.35]); tip.push([Math.cos(ang) * L, (k - 0.5) * w * 0.35 + Math.sin(ang) * L]); }
  return finGeometry(base, tip);
};

/* ---------- Painted skin ---------- */
const skinTextures = (sp: Spec, c: FishColors) => {
  const W = 1536, H = 768, cv = document.createElement("canvas"), bm = document.createElement("canvas"); cv.width = bm.width = W; cv.height = bm.height = H;
  const x = cv.getContext("2d")!, b = bm.getContext("2d")!, r = rng(sp.label.length * 97 + 3), PU = (u: number) => u * W, PV = (v: number) => (1 - v) * H;
  const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, c.back); g.addColorStop(0.28, c.back); g.addColorStop(0.5, c.flank); g.addColorStop(0.72, c.flank); g.addColorStop(0.92, c.belly); g.addColorStop(1, c.belly); x.fillStyle = g; x.fillRect(0, 0, W, H);
  b.fillStyle = "#808080"; b.fillRect(0, 0, W, H);
  const band = (u: number, w: number, col: string, wob = 0.012) => { x.fillStyle = col; x.beginPath(); for (let v = 0; v <= 1.001; v += 0.05) x.lineTo(PU(u - w / 2 + Math.sin(v * 7 + u * 20) * wob), PV(v)); for (let v = 1; v >= -0.001; v -= 0.05) x.lineTo(PU(u + w / 2 + Math.sin(v * 7 + u * 20) * wob), PV(v)); x.closePath(); x.fill(); };
  const blob = (u: number, v: number, ru: number, rv: number, col: string) => { x.fillStyle = col; x.beginPath(); const n = 40, ph = r() * 6; for (let i = 0; i <= n; i++) { const a = (i / n) * 6.283, k = 0.8 + 0.2 * Math.sin(a * 2 + ph) + 0.08 * Math.sin(a * 5 + ph * 2); x.lineTo(PU(u + Math.cos(a) * ru * k), PV(v + Math.sin(a) * rv * k)); } x.closePath(); x.fill(); };
  const a = c.a ?? c.back, bb = c.b ?? c.back;
  if (sp.pattern === "patch") { blob(0.62, 0.3, 0.13, 0.17, a + "bb"); blob(0.4, 0.2, 0.07, 0.1, a + "99"); blob(0.8, 0.65, 0.06, 0.09, c.belly + "aa"); }
  if (sp.pattern === "koi") { for (const q of [[0.08, 0.72, 0.08, 0.2, a], [0.32, 0.7, 0.12, 0.22, a], [0.56, 0.68, 0.11, 0.25, a], [0.8, 0.64, 0.09, 0.18, a], [0.68, 0.42, 0.05, 0.1, a], [0.27, 0.42, 0.06, 0.08, bb], [0.5, 0.78, 0.05, 0.1, bb], [0.72, 0.8, 0.045, 0.08, bb], [0.9, 0.5, 0.03, 0.09, bb]] as [number, number, number, number, string][]) blob(q[0], q[1], q[2], q[3], q[4]); }
  if (sp.pattern === "clown") for (const [u, w] of [[0.24, 0.095], [0.54, 0.11], [0.9, 0.06]]) { band(u, w + 0.025, bb); band(u, w, a); }
  if (sp.pattern === "bars") { for (const [u, w] of [[0.15, 0.03], [0.37, 0.05], [0.56, 0.035], [0.74, 0.05], [0.92, 0.04]]) band(u, w, a, 0.006); }
  if (sp.pattern === "trout") { const s = x.createLinearGradient(0, PV(0.68), 0, PV(0.32)); s.addColorStop(0, a + "00"); s.addColorStop(0.5, a + "ee"); s.addColorStop(1, a + "00"); x.fillStyle = s; x.fillRect(0, PV(0.68), W, PV(0.32) - PV(0.68)); x.fillStyle = bb; for (let i = 0; i < 420; i++) { const v = 0.42 + r() ** 0.8 * 0.58, u = 0.1 + r() * 0.9; x.beginPath(); x.ellipse(PU(u), PV(v), 2 + r() * 5, 2 + r() * 4, 0, 0, 7); x.fill(); } }
  if (sp.pattern === "bass") { for (let u = 0.25; u < 1; u += 0.028) blob(u, 0.53 + (r() - 0.5) * 0.05, 0.022, 0.05 + r() * 0.05, a + "dd"); for (let i = 0; i < 20; i++) blob(0.2 + r() * 0.75, 0.68 + r() * 0.24, 0.02, 0.035, a + "66"); }
  if (sp.pattern === "tuna") { x.fillStyle = a + "cc"; x.fillRect(0, 0, W, PV(0.58)); x.fillStyle = "#ffffff55"; for (let u = 0.3; u < 0.92; u += 0.018) { x.fillRect(PU(u), PV(0.5), 3, PV(0.2) - PV(0.5)); } const s = x.createLinearGradient(0, PV(0.68), 0, PV(0.55)); s.addColorStop(0, "#5f8fb000"); s.addColorStop(0.6, "#7fb1d066"); s.addColorStop(1, "#7fb1d000"); x.fillStyle = s; x.fillRect(0, PV(0.68), W, PV(0.55) - PV(0.68)); }
  if (sp.pattern === "mottle") for (let i = 0; i < 300; i++) blob(r(), 0.46 + r() * 0.54, 0.008 + r() * 0.018, 0.012 + r() * 0.03, a + "88");
  if (sp.pattern === "piranha") { x.fillStyle = "#e9f2f3"; for (let i = 0; i < 900; i++) { const v = 0.28 + r() * 0.72; x.globalAlpha = 0.25 + r() * 0.65; x.fillRect(PU(r()), PV(v), 2 + r() * 3, 2 + r() * 3); } x.globalAlpha = 1; band(0.98, 0.04, bb); }
  if (sp.pattern === "tang") { x.fillStyle = a; x.beginPath(); x.moveTo(PU(0.13), PV(0.72)); x.bezierCurveTo(PU(0.35), PV(1.02), PU(0.72), PV(0.95), PU(0.97), PV(0.56)); x.bezierCurveTo(PU(0.75), PV(0.72), PU(0.68), PV(0.46), PU(0.84), PV(0.3)); x.bezierCurveTo(PU(0.62), PV(0.38), PU(0.56), PV(0.62), PU(0.4), PV(0.56)); x.bezierCurveTo(PU(0.31), PV(0.54), PU(0.22), PV(0.6), PU(0.13), PV(0.72)); x.fill(); x.fillStyle = "#1261e5"; x.beginPath(); x.ellipse(PU(0.55), PV(0.8), 95, 32, 0.08, 0, 7); x.fill(); band(0.975, 0.05, bb, 0); }
  // Darker back on the head, gill cover, mouth and lateral line.
  const gill = sp.scales ? 0.27 : 0.25;
  if (sp.pattern !== "koi" && sp.pattern !== "clown") { x.fillStyle = (c.head ?? c.back) + "33"; x.fillRect(0, 0, PU(gill), H); }
  x.strokeStyle = "rgba(0,0,0,.27)"; x.lineWidth = 4; x.beginPath(); x.moveTo(PU(gill - 0.01), PV(0.9)); x.quadraticCurveTo(PU(gill + 0.045), PV(0.5), PU(gill - 0.02), PV(0.12)); x.stroke();
  x.strokeStyle = "rgba(255,255,255,.2)"; x.lineWidth = 2; x.beginPath(); x.moveTo(PU(gill + 0.006), PV(0.86)); x.quadraticCurveTo(PU(gill + 0.055), PV(0.5), PU(gill - 0.01), PV(0.16)); x.stroke();
  x.strokeStyle = "rgba(0,0,0,.66)"; x.lineWidth = 6; x.lineCap = "round"; x.beginPath(); x.moveTo(0, PV(0.45)); x.quadraticCurveTo(PU(0.045), PV(0.46), PU(sp.pattern === "bass" ? 0.13 : 0.075), PV(0.36)); x.stroke();
  if (sp.pattern !== "tang") { x.strokeStyle = "rgba(25,20,15,.32)"; x.lineWidth = 3; x.setLineDash([9, 5]); x.beginPath(); for (let u = gill; u <= 1; u += 0.02) x.lineTo(PU(u), PV(0.6 - (u - gill) * 0.12)); x.stroke(); x.setLineDash([]); }
  if (sp.pattern === "piranha") { x.fillStyle = "#f2f1e7"; for (let i = 0; i < 5; i++) { const u = 0.012 + i * 0.012; x.beginPath(); x.moveTo(PU(u), PV(0.44)); x.lineTo(PU(u + 0.01), PV(0.44)); x.lineTo(PU(u + 0.005), PV(0.38)); x.fill(); } }
  // Scales, overlapping rows behind the gill cover, on both the color and the relief map.
  if (sp.scales) {
    const nu = sp.scales * 2.4, dx = W / nu, dy = H / (sp.scales * 1.2), s = dy * 0.74;
    for (let row = 0; row * dy < H + dy; row++) for (let col = 0; col * dx < W + dx; col++) {
      const px = col * dx + (row % 2) * dx * 0.5, py = row * dy; if (px < PU(gill + 0.035)) continue;
      x.lineWidth = 2.2; x.strokeStyle = `rgba(0,0,0,${sp.scaleA})`; x.beginPath(); x.arc(px, py, s, -Math.PI / 2, Math.PI / 2, false); x.stroke();
      x.strokeStyle = `rgba(255,255,255,${sp.scaleA * 0.75})`; x.lineWidth = 1.4; x.beginPath(); x.arc(px - 2.5, py, s, -Math.PI / 3, Math.PI / 3, false); x.stroke();
      const q = b.createRadialGradient(px - s * 0.3, py, 1, px, py, s); q.addColorStop(0, "#c4c4c4"); q.addColorStop(0.85, "#8a8a8a"); q.addColorStop(1, "#404040"); b.fillStyle = q; b.beginPath(); b.arc(px, py, s, -Math.PI / 2, Math.PI / 2, false); b.fill();
    }
  }
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; const bt = new THREE.CanvasTexture(bm); return { map: t, bump: bt };
};
const finTexture = (a: string, tip: string, seed: number) => {
  const cv = document.createElement("canvas"); cv.width = 512; cv.height = 256; const x = cv.getContext("2d")!, r = rng(seed);
  const g = x.createLinearGradient(0, 256, 0, 0); g.addColorStop(0, a); g.addColorStop(0.6, a + "ee"); g.addColorStop(1, tip + "b8"); x.fillStyle = g; x.fillRect(0, 0, 512, 256);
  for (let i = 0; i < 46; i++) { const u = (i / 46) * 512; x.strokeStyle = "rgba(0,0,0,.25)"; x.lineWidth = 1.6; x.beginPath(); x.moveTo(u, 256); x.lineTo(u + (r() - 0.5) * 7, 0); x.stroke(); x.strokeStyle = "rgba(255,255,255,.14)"; x.beginPath(); x.moveTo(u + 3, 256); x.lineTo(u + 3 + (r() - 0.5) * 7, 0); x.stroke(); }
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t;
};

/* ---------- Component ---------- */
type Parts = { body: THREE.BufferGeometry; map: THREE.Texture; bump: THREE.Texture; fins: THREE.BufferGeometry[]; tail: THREE.BufferGeometry; pect: THREE.BufferGeometry; pelvic?: THREE.BufferGeometry; finTex: THREE.Texture; tailTex: THREE.Texture; c: FishColors };
const cache = new Map<string, Parts>();
const parts = (variety: string, over?: Partial<FishColors>) => {
  const key = variety + JSON.stringify(over ?? {}); const got = cache.get(key); if (got) return got;
  const sp = FISH[variety], c = { ...sp.colors, ...over }, { map, bump } = skinTextures(sp, c);
  const made: Parts = { body: bodyGeometry(sp), map, bump, fins: [...sp.dorsal.map((f) => backFin(sp, f, 1)), ...sp.anal.map((f) => backFin(sp, f, -1))], tail: tailFin(sp), pect: pairedFin(sp.pect.len, sp.pect.w, sp.pect.a), pelvic: sp.pelvic ? pairedFin(sp.pelvic.len, sp.pelvic.w, 0.8) : undefined, finTex: finTexture(c.fin, c.finTip, 5), tailTex: finTexture(c.tail ?? c.fin, c.tailTip ?? c.finTip, 9), c };
  cache.set(key, made); return made;
};
/** Bends a material's vertices in a wave traveling from head to tail. */
const swimming = <T extends THREE.Material>(m: T, u: { value: THREE.Vector2 }) => {
  m.onBeforeCompile = (s) => { s.uniforms.uBend = u; s.vertexShader = "uniform vec2 uBend;\n" + s.vertexShader.replace("#include <begin_vertex>", "#include <begin_vertex>\nfloat fe = 1.0 - smoothstep(-1.1, 0.55, position.x); transformed.z += uBend.x * fe * fe * sin(position.x * 3.6 + uBend.y);"); };
  m.customProgramCacheKey = () => "fish-swim"; return m;
};
const Eye: React.FC<{ sp: Spec; side: number; iris: string }> = ({ sp, side, iris }) => {
  const { u, y, r } = sp.eye, ref = y > 0 ? curve(sp.top, u) : curve(sp.bot, u), s = Math.min(0.9, Math.abs(y) / (ref || 1)), z = curve(sp.wid, u) * Math.sqrt(1 - s * s) * side;
  return <group position={[X(u), y, z]} rotation={[0, side > 0 ? 0 : Math.PI, 0]}>
    <mesh scale={[r, r, r * 0.38]}><sphereGeometry args={[1, 24, 16]} /><meshStandardMaterial color={iris} roughness={0.3} /></mesh>
    <mesh position={[0, 0, r * 0.2]} scale={[r * 0.58, r * 0.58, r * 0.22]}><sphereGeometry args={[1, 20, 14]} /><meshPhysicalMaterial color="#050506" roughness={0.05} clearcoat={1} /></mesh>
    <mesh position={[r * 0.24, r * 0.28, r * 0.42]} scale={r * 0.15}><sphereGeometry args={[1, 10, 8]} /><meshBasicMaterial color="#ffffff" toneMapped={false} /></mesh>
  </group>;
};
const Barbels: React.FC<{ long: boolean; color: string }> = ({ long, color }) => {
  const tubes = useMemo(() => [1, -1].flatMap((sd) => (long ? [[1.5, 0.05, 0.1], [1.2, -0.08, 0.06], [1.1, -0.1, 0.03]] : [[0.4, -0.03, 0.02]]).map(([l, dy, dz]) => new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(0.97, -0.02, sd * 0.05), new THREE.Vector3(0.97 - l * 0.14, dy - 0.02, sd * (0.15 + dz)), new THREE.Vector3(0.95 - l * 0.32, dy - 0.1, sd * (0.27 + dz))]), 12, 0.009, 6))), [long]);
  return <>{tubes.map((g, i) => <mesh key={i} geometry={g}><meshStandardMaterial color={color} roughness={0.7} /></mesh>)}</>;
};
export type FishProps = { variety?: FishVariety | string; t?: number; speed?: number; swing?: number; phase?: number; colors?: Partial<FishColors>; position?: number[]; rotation?: number[]; scale?: number; shadows?: boolean };
/** A detailed fish. `t` (seconds) drives the swimming; leave it out for a still pose. Override any color with `colors`. */
export const Fish: React.FC<FishProps> = ({ variety = "trout", t = 0, speed = 8, swing = 0.1, phase = 0, colors, position = [0, 0, 0], rotation = [0, 0, 0], scale = 1, shadows = true }) => {
  const sp = FISH[variety] ?? FISH.trout, p = useMemo(() => parts(FISH[variety] ? variety : "trout", colors), [variety, JSON.stringify(colors)]);
  const u = useMemo(() => ({ value: new THREE.Vector2() }), []); u.value.set(swing, t * speed + phase);
  const skin = useMemo(() => swimming(new THREE.MeshPhysicalMaterial({ map: p.map, bumpMap: p.bump, bumpScale: 1.3, roughness: 0.52 - sp.shine * 0.26, metalness: 0.06, clearcoat: 0.55 * sp.shine, clearcoatRoughness: 0.28, side: THREE.DoubleSide }), u), [p]);
  const fin = useMemo(() => swimming(new THREE.MeshStandardMaterial({ map: p.finTex, side: THREE.DoubleSide, transparent: true, roughness: 0.6, alphaTest: 0.04 }), u), [p]);
  const tail = useMemo(() => swimming(new THREE.MeshStandardMaterial({ map: p.tailTex, side: THREE.DoubleSide, transparent: true, roughness: 0.6, alphaTest: 0.04 }), u), [p]);
  const paired = useMemo(() => new THREE.MeshStandardMaterial({ map: p.finTex, side: THREE.DoubleSide, transparent: true, roughness: 0.6, alphaTest: 0.04 }), [p]);
  const flap = Math.sin(t * speed * 0.42 + phase) * 0.16 * (swing > 0 ? 1 : 0);
  const pz = curve(sp.wid, sp.pect.u) * 0.9, py = sp.pect.y;
  const finletRows = sp.finlets ? [1, -1].flatMap((up) => Array.from({ length: 7 }, (_, i) => { const a = 0.71 + i * 0.038, y = curve(up > 0 ? sp.top : sp.bot, a) * up; return { key: `${up}${i}`, geo: new THREE.ConeGeometry(0.017, 0.055, 4), x: X(a), y: y + up * 0.033, up }; })) : [];
  return <group position={position as any} rotation={rotation as any} scale={scale}>
    <mesh geometry={p.body} material={skin} castShadow={shadows} receiveShadow />
    {p.fins.map((g, i) => <mesh key={i} geometry={g} material={fin} castShadow={shadows} />)}
    <mesh geometry={p.tail} material={tail} castShadow={shadows} />
    {[1, -1].map((s) => <group key={s}>
      <group position={[X(sp.pect.u), py, s * pz]} rotation={[-s * (0.75 + flap), 0, 0]}><mesh geometry={p.pect} material={paired} /></group>
      {p.pelvic && sp.pelvic ? <group position={[X(sp.pelvic.u), -curve(sp.bot, sp.pelvic.u) * 0.9, s * curve(sp.wid, sp.pelvic.u) * 0.4]} rotation={[-s * 0.45, 0, 0]}><mesh geometry={p.pelvic} material={paired} /></group> : null}
      <Eye sp={sp} side={s} iris={p.c.iris} />
    </group>)}
    {sp.barbels ? <Barbels long={variety === "catfish"} color={variety === "catfish" ? "#26282b" : "#e6dcc8"} /> : null}
    {finletRows.map((f) => <mesh key={f.key} geometry={f.geo} position={[f.x, f.y, 0]} rotation={[0, 0, f.up > 0 ? 0.5 : Math.PI - 0.5]} scale={[1, 1, 0.25]}><meshStandardMaterial color={p.c.b ?? p.c.fin} roughness={0.5} /></mesh>)}
  </group>;
};

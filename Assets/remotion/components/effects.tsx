import React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { c } from "../theme";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const seq = (seed: string, n: number) => Array.from({ length: n }, (_, i) => (k: string) => random(`${seed}-${i}-${k}`));
const palette = () => [c.cyan, c.amber, c.coral, c.green, c.white];

// One-shot burst from the top corners
export const Confetti: React.FC<{ count?: number }> = ({ count = 150 }) => {
  const f = useCurrentFrame(); const { fps, width: w, height: h } = useVideoConfig(); const t = f / fps; const pal = palette();
  return <AbsoluteFill>{seq("confetti", count).map((r, i) => {
    const left = i % 2 === 0; const age = Math.max(0, t - r("d") * 0.35); const ang = (20 + r("a") * 55) * (Math.PI / 180); const v = h * (0.45 + r("v") * 0.75);
    const x = (left ? 0 : w) + (left ? 1 : -1) * Math.cos(ang) * v * (1 - Math.exp(-1.5 * age)) / 1 + Math.sin(age * 4 + r("p") * 6) * 26;
    const y = -40 + Math.sin(ang) * v * 0.45 * (1 - Math.exp(-1.5 * age)) + h * (0.14 + r("g") * 0.1) * age * age;
    const size = 12 + r("s") * 16; const rot = age * 300 * (r("r") - 0.5) * 3; const flip = Math.cos(age * 9 + r("f") * 6);
    const op = interpolate(t, [2.5, 3], [1, 0], clamp);
    return age > 0 ? <div key={i} style={{ position: "absolute", left: x, top: y, width: size, height: size * 0.6, background: pal[i % 4], borderRadius: 2, opacity: op, transform: `rotate(${rot}deg) scaleY(${flip})` }} /> : null;
  })}</AbsoluteFill>;
};

// Radial spark and ring blast from the center. Move it with `x`, `y`.
export const Explosion: React.FC<{ x?: number; y?: number; scale?: number }> = ({ x, y, scale = 1 }) => {
  const f = useCurrentFrame(); const { fps, width: w, height: h } = useVideoConfig(); const t = f / fps; const X = x ?? w / 2, Y = y ?? h / 2, S = Math.min(w, h) * 0.55 * scale;
  const ease = (a: number) => 1 - Math.exp(-5 * a);
  return <AbsoluteFill><svg width={w} height={h}>
    <circle cx={X} cy={Y} r={S * ease(t) * 1.1} fill="none" stroke={c.white} strokeWidth={interpolate(t, [0, 0.5], [60, 0], clamp)} opacity={interpolate(t, [0, 0.6], [1, 0], clamp)} />
    <circle cx={X} cy={Y} r={S * 0.55 * ease(t * 1.4)} fill={c.amber} opacity={interpolate(t, [0.1, 0.6], [1, 0], clamp)} />
    <circle cx={X} cy={Y} r={S * 0.33 * ease(t * 1.8)} fill={c.white} opacity={interpolate(t, [0.05, 0.4], [1, 0], clamp)} />
    {seq("blast", 110).map((r, i) => { const a = r("a") * Math.PI * 2, d = S * (0.45 + r("d") * 1.25) * ease(t * (0.7 + r("v") * 0.5)); const px = X + Math.cos(a) * d, py = Y + Math.sin(a) * d + 180 * t * t; const life = 0.9 + r("l") * 1; const col = [c.amber, c.coral, c.white, c.amberDark][i % 4]; const len = (18 + r("z") * 34) * Math.max(0.15, 1 - t / life); return <circle key={i} cx={px} cy={py} r={len * 0.5} fill={col} opacity={interpolate(t, [life * 0.5, life], [1, 0], clamp)} />; })}
  </svg></AbsoluteFill>;
};

const Falling: React.FC<{ seed: string; n: number; speed: number; draw: (r: (k: string) => number, i: number, x: number, y: number) => React.ReactNode; sway?: number }> = ({ seed, n, speed, draw, sway = 0 }) => {
  const f = useCurrentFrame(); const { fps, width: w, height: h } = useVideoConfig(); const t = f / fps; const { durationInFrames: d } = useVideoConfig(); const T = d / fps;
  // Whole-number laps per clip, so the loop is seamless.
  return <AbsoluteFill><svg width={w} height={h}>{seq(seed, n).map((r, i) => { const laps = Math.max(1, Math.round((speed * (0.6 + r("v") * 0.8) * T) / (h + 120))); const p = (t / T * laps + r("o")) % 1; const y = -60 + p * (h + 120); const x = r("x") * w + Math.sin((t / T) * Math.PI * 2 * 2 + r("p") * 6) * sway; return <React.Fragment key={i}>{draw(r, i, x, y)}</React.Fragment>; })}</svg></AbsoluteFill>;
};

export const Snow: React.FC = () => <Falling seed="snow" n={110} speed={230} sway={26} draw={(r, _i, x, y) => <circle cx={x} cy={y} r={3 + r("s") * 8} fill={c.white} opacity={0.45 + r("a") * 0.5} />} />;
export const Rain: React.FC = () => <Falling seed="rain" n={150} speed={1900} draw={(r, _i, x, y) => <line x1={x} y1={y} x2={x - 8} y2={y + 44 + r("l") * 36} stroke="#BAE6FD" strokeWidth={2 + r("w") * 2} strokeLinecap="round" opacity={0.3 + r("a") * 0.5} />} />;

export const Smoke: React.FC<{ color?: string; x?: number; y?: number }> = ({ color = "#94A3B8", x, y }) => {
  const f = useCurrentFrame(); const { fps, width: w, height: h, durationInFrames: d } = useVideoConfig(); const T = d / fps, t = f / fps; const X = x ?? w / 2, Y = y ?? h * 0.86;
  return <AbsoluteFill><svg width={w} height={h}><defs><filter id="soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="16" /></filter></defs><g filter="url(#soft)">{seq("smoke", 44).map((r, i) => { const p = (t / T + r("o")) % 1; const px = X + (r("x") - 0.5) * 80 + (r("d") - 0.5) * 340 * p + Math.sin(p * 8 + r("p") * 6) * 24; const py = Y - p * h * (0.5 + r("v") * 0.25); const rad = 36 + p * (110 + r("s") * 90); return <circle key={i} cx={px} cy={py} r={rad} fill={color} opacity={0.34 * Math.sin(p * Math.PI)} />; })}</g></svg></AbsoluteFill>;
};

export const Sparks: React.FC<{ x?: number; y?: number; color?: string }> = ({ x, y, color = c.amber }) => {
  const f = useCurrentFrame(); const { fps, width: w, height: h, durationInFrames: d } = useVideoConfig(); const T = d / fps, t = f / fps; const X = x ?? w / 2, Y = y ?? h * 0.82;
  return <AbsoluteFill><svg width={w} height={h}>{seq("sparks", 90).map((r, i) => { const p = (t / T * 3 + r("o")) % 1; const a = -Math.PI / 2 + (r("a") - 0.5) * 1.5, v = 900 + r("v") * 1100; const px = X + Math.cos(a) * v * p, py = Y + Math.sin(a) * v * p + 1100 * p * p; const qx = X + Math.cos(a) * v * (p - 0.03), qy = Y + Math.sin(a) * v * (p - 0.03) + 1100 * (p - 0.03) ** 2; return p > 0.03 ? <line key={i} x1={qx} y1={qy} x2={px} y2={py} stroke={i % 5 === 0 ? c.white : color} strokeWidth={6} strokeLinecap="round" opacity={1 - p * p} /> : null; })}</svg></AbsoluteFill>;
};

export const Dust: React.FC = () => <Falling seed="dust" n={60} speed={90} sway={40} draw={(r, _i, x, y) => <circle cx={x} cy={y} r={1.5 + r("s") * 4} fill={c.cyan} opacity={0.2 + r("a") * 0.5} />} />;

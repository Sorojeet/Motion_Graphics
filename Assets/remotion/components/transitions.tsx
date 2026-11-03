import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { c } from "../theme";

// All transitions fully cover the frame at the exact midpoint: cut your two scenes there.
const useProgress = () => {
  const f = useCurrentFrame(); const { durationInFrames: d } = useVideoConfig(); const mid = (d - 1) / 2;
  const opts = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
  return { inn: interpolate(f, [0, mid], [0, 1], { ...opts, easing: Easing.inOut(Easing.cubic) }), out: interpolate(f, [mid, d - 1], [0, 1], { ...opts, easing: Easing.inOut(Easing.cubic) }), mid, f };
};

export const CircleIris: React.FC<{ color?: string }> = ({ color = c.cyan }) => {
  const { width: w, height: h } = useVideoConfig(); const { inn, out } = useProgress(); const R = Math.hypot(w, h) / 2 + 4;
  return <AbsoluteFill><svg width={w} height={h}><path fillRule="evenodd" fill={color} d={`M${w / 2 - R * inn} ${h / 2}a${R * inn} ${R * inn} 0 1 0 ${2 * R * inn} 0a${R * inn} ${R * inn} 0 1 0 ${-2 * R * inn} 0ZM${w / 2 - R * out} ${h / 2}a${R * out} ${R * out} 0 1 0 ${2 * R * out} 0a${R * out} ${R * out} 0 1 0 ${-2 * R * out} 0Z`} /></svg></AbsoluteFill>;
};

export const DiagonalWipe: React.FC<{ colors?: string[] }> = ({ colors = [c.amber, c.coral, c.surface] }) => {
  const { width: w, height: h } = useVideoConfig(); const { inn, out } = useProgress(); const k = w + h;
  // Three bands slide across with a slight stagger; the last is solid and covers the frame at the midpoint.
  return <AbsoluteFill><svg width={w} height={h}>{colors.map((col, i) => {
    const lag = i * 0.12, lead = interpolate(inn, [lag, 1], [0, 1], { extrapolateLeft: "clamp" }), tail = interpolate(out, [0, 1 - (colors.length - 1 - i) * 0.12], [0, 1], { extrapolateRight: "clamp" });
    const x2 = lead * (k + h), x1 = tail * (k + h);
    return <polygon key={i} fill={col} points={`${x1 - h},${h} ${x1},0 ${x2},0 ${x2 - h},${h}`} />;
  })}</svg></AbsoluteFill>;
};

export const StripeWipe: React.FC<{ count?: number; color?: string; accent?: string }> = ({ count = 8, color = c.surfaceAlt, accent = c.cyan }) => {
  const { width: w, height: h } = useVideoConfig(); const { inn, out } = useProgress(); const sh = h / count;
  return <AbsoluteFill>{Array.from({ length: count }, (_, i) => {
    const lag = (i / count) * 0.4; const scale = (p: number) => interpolate(p, [lag, lag + 0.6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const a = scale(inn), b = scale(out); const dir = i % 2 === 0;
    const left = dir ? b : 1 - a, right = dir ? a : 1 - b;
    return <div key={i} style={{ position: "absolute", top: i * sh, height: sh + 1, left: left * w, width: Math.max(0, (right - left) * w), background: i % 3 === 0 ? accent : color }} />;
  })}</AbsoluteFill>;
};

export const ShutterWipe: React.FC<{ color?: string }> = ({ color = c.coral }) => {
  const { width: w, height: h } = useVideoConfig(); const { inn, out } = useProgress(); const n = 6, sw = w / n;
  return <AbsoluteFill>{Array.from({ length: n }, (_, i) => { const g = (p: number) => interpolate(p, [(i / n) * 0.4, (i / n) * 0.4 + 0.6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }); const t = i % 2 ? g(out) : 1 - g(inn), b = i % 2 ? 1 - 0 : 1; const top = i % 2 ? g(out) : 1 - g(inn), bot = i % 2 ? g(inn) : 1 - g(out); return <div key={i} style={{ position: "absolute", left: i * sw, width: sw + 1, top: top * h, height: Math.max(0, (bot - top) * h), background: color }} />; })}</AbsoluteFill>;
};

export const Flash: React.FC<{ color?: string }> = ({ color = c.white }) => {
  const f = useCurrentFrame(); const { durationInFrames: d } = useVideoConfig(); const m = (d - 1) / 2;
  return <AbsoluteFill style={{ background: color, opacity: interpolate(f, [0, m, d - 1], [0, 1, 0], { easing: Easing.inOut(Easing.quad) }) }} />;
};

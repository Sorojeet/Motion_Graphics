import React from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BODY, c, HEADING, safeZone } from "../theme";

const useEnter = (delay = 0) => { const f = useCurrentFrame(); const { fps } = useVideoConfig(); return spring({ frame: f - delay, fps, config: { damping: 15, stiffness: 130 } }); };
const useExit = (frames = 10) => { const f = useCurrentFrame(); const { durationInFrames: d } = useVideoConfig(); return interpolate(f, [d - frames, d], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.in(Easing.cubic) }); };
const Rise: React.FC<{ delay?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ delay = 0, children, style }) => { const e = useEnter(delay); return <div style={{ opacity: Math.min(1, e * 1.4), transform: `translateY(${(1 - e) * 44}px)`, ...style }}>{children}</div>; };
const center = (w: number, h: number) => { const s = safeZone(w, h); return { paddingTop: s.top, paddingBottom: s.bottom, paddingLeft: s.left, paddingRight: s.right, justifyContent: "center", alignItems: "center", textAlign: "center" as const }; };

export const TitleCard: React.FC<{ kicker?: string; title?: string }> = ({ kicker = "WHAT IF", title = "YOUR TITLE GOES HERE" }) => {
  const { width: w, height: h } = useVideoConfig(); const bar = useEnter(16), x = useExit();
  return <AbsoluteFill style={{ ...center(w, h), opacity: x }}>
    <Rise style={{ fontFamily: HEADING, fontWeight: 800, fontSize: 76, color: c.cyan, letterSpacing: 2 }}>{kicker}</Rise>
    <Rise delay={6} style={{ fontFamily: HEADING, fontWeight: 800, fontSize: 104, lineHeight: 1.05, color: c.text, marginTop: 18 }}>{title}</Rise>
    <div style={{ width: 180 * bar, height: 10, borderRadius: 5, background: c.amber, marginTop: 30 }} />
  </AbsoluteFill>;
};

export const LowerThird: React.FC<{ name?: string; role?: string }> = ({ name = "Name Goes Here", role = "Short description or role" }) => {
  const { width: w, height: h } = useVideoConfig(); const s = safeZone(w, h); const e = useEnter(), x = useExit();
  return <AbsoluteFill style={{ opacity: x }}>
    <div style={{ position: "absolute", left: s.left, bottom: s.bottom + 20, maxWidth: w - s.left - s.right, background: c.surface, borderRadius: 24, borderLeft: `16px solid ${c.cyan}`, padding: "26px 56px 28px 36px", transform: `translateX(${(1 - e) * -(w * 0.8)}px)` }}>
      <div style={{ fontFamily: HEADING, fontWeight: 800, fontSize: 54, color: c.text }}>{name}</div>
      <Rise delay={8} style={{ fontFamily: BODY, fontWeight: 500, fontSize: 36, color: c.muted, marginTop: 6 }}>{role}</Rise>
    </div>
  </AbsoluteFill>;
};

// Word-by-word caption. Wrap a word in *asterisks* to highlight it.
export const Caption: React.FC<{ text?: string; framesPerWord?: number }> = ({ text = "Captions pop in *word* by word", framesPerWord = 6 }) => {
  const f = useCurrentFrame(); const { fps, width: w, height: h } = useVideoConfig(); const s = safeZone(w, h);
  return <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: s.bottom + 20, paddingLeft: s.left, paddingRight: s.right }}>
    <div style={{ background: `${c.bgDeep}E0`, borderRadius: 28, padding: "24px 36px", textAlign: "center", fontFamily: BODY, fontWeight: 700, fontSize: 54, lineHeight: 1.25, color: c.text }}>
      {text.split(" ").map((raw, i) => { const hi = raw.startsWith("*"), word = raw.replaceAll("*", ""); const e = spring({ frame: f - i * framesPerWord, fps, config: { damping: 12, stiffness: 180 } }); return <span key={i} style={{ display: "inline-block", marginRight: 14, color: hi ? c.amber : c.text, opacity: e > 0.02 ? 1 : 0, transform: `scale(${0.7 + 0.3 * e})` }}>{word}</span>; })}
    </div>
  </AbsoluteFill>;
};

export const StatCounter: React.FC<{ value?: number; prefix?: string; suffix?: string; decimals?: number; label?: string; source?: string }> = ({ value = 100, prefix = "", suffix = "%", decimals = 0, label = "What this number means", source = "Source: add your source" }) => {
  const f = useCurrentFrame(); const { width: w, height: h } = useVideoConfig(); const e = useEnter(), x = useExit();
  const n = interpolate(f, [6, 46], [0, value], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  return <AbsoluteFill style={{ ...center(w, h), opacity: x }}>
    <div style={{ background: c.surface, borderRadius: 36, padding: "48px 56px", transform: `scale(${0.8 + 0.2 * e})`, opacity: e }}>
      <div style={{ fontFamily: HEADING, fontWeight: 800, fontSize: 170, color: c.amber, fontVariantNumeric: "tabular-nums" }}>{prefix}{n.toFixed(decimals)}{suffix}</div>
      <div style={{ fontFamily: BODY, fontWeight: 600, fontSize: 42, color: c.text, marginTop: 8 }}>{label}</div>
      <div style={{ fontFamily: BODY, fontWeight: 400, fontSize: 26, color: c.muted, marginTop: 14 }}>{source}</div>
    </div>
  </AbsoluteFill>;
};

export const Callout: React.FC<{ text?: string; x?: number; y?: number }> = ({ text = "Point this out", x, y }) => {
  const { width: w, height: h } = useVideoConfig(); const line = useEnter(4), box = useEnter(12), dot = useEnter(0), out = useExit();
  const X = x ?? w * 0.22, Y = y ?? h * 0.45;
  return <AbsoluteFill style={{ opacity: out }}>
    <div style={{ position: "absolute", left: X - 16, top: Y - 16, width: 32, height: 32, borderRadius: 16, background: c.coral, transform: `scale(${dot})` }} />
    <div style={{ position: "absolute", left: X, top: Y - 3, width: 110 * line, height: 6, background: c.coral }} />
    <div style={{ position: "absolute", left: X + 110, top: Y - 54, height: 108, display: "flex", alignItems: "center", padding: "0 40px", borderRadius: 20, background: c.coral, color: c.bgDeep, fontFamily: HEADING, fontWeight: 800, fontSize: 50, whiteSpace: "nowrap", transformOrigin: "left center", transform: `scale(${box})` }}>{text}</div>
  </AbsoluteFill>;
};

export const EndCard: React.FC<{ line1?: string; line2?: string; cta?: string }> = ({ line1 = "WHAT WOULD", line2 = "YOU DO?", cta = "FOLLOW FOR MORE" }) => {
  const { width: w, height: h } = useVideoConfig(); const f = useCurrentFrame(); const e = useEnter(14); const pulse = 1 + 0.03 * Math.sin((f / 30) * 5);
  return <AbsoluteFill style={center(w, h)}>
    <Rise style={{ fontFamily: HEADING, fontWeight: 800, fontSize: 88, color: c.text }}>{line1}</Rise>
    <Rise delay={5} style={{ fontFamily: HEADING, fontWeight: 800, fontSize: 88, color: c.amber }}>{line2}</Rise>
    <div style={{ marginTop: 44, padding: "30px 56px", borderRadius: 60, background: c.coral, color: c.bgDeep, fontFamily: HEADING, fontWeight: 800, fontSize: 44, transform: `scale(${e * pulse})` }}>{cta}</div>
  </AbsoluteFill>;
};

export type NarrationData = { duration: number; beats: { voice: string; text: string; start: number; end: number }[]; chunks: { voice: string; start: number; end: number; words: { text: string; highlight: boolean; start: number; end: number }[] }[] };

// Captions synced to scripts/narrate.py output. Pass the imported narration.json as `data`.
export const NarrationCaptions: React.FC<{ data: NarrationData }> = ({ data }) => {
  const f = useCurrentFrame(); const { fps, width: w, height: h } = useVideoConfig(); const s = safeZone(w, h); const t = f / fps;
  const chunk = data.chunks.find((x, i) => t >= x.start && t < (data.chunks[i + 1]?.start ?? x.end + 0.4));
  if (!chunk) return null;
  return <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: s.bottom + 20, paddingLeft: s.left, paddingRight: s.right }}>
    <div style={{ background: `${c.bgDeep}E0`, borderRadius: 28, padding: "22px 34px", textAlign: "center", fontFamily: BODY, fontWeight: 700, fontSize: 54, lineHeight: 1.25, color: c.text }}>
      {chunk.words.map((word, i) => { const on = t >= word.start && t < word.end; return <span key={i} style={{ display: "inline-block", marginRight: 14, color: word.highlight ? c.amber : c.text, opacity: t >= word.start ? 1 : 0.55, transform: `scale(${on ? 1.06 : 1})` }}>{word.text}</span>; })}
    </div>
  </AbsoluteFill>;
};

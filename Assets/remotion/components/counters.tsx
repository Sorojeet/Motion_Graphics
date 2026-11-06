// Reusable 2D counters: a rolling year counter and animated comparison bars. Colors and fonts come from the theme.
import React from "react";
import { c, HEADING, BODY } from "../theme";

const clamp = (x: number) => Math.min(1, Math.max(0, x));
const ease = (x: number) => 1 - Math.pow(1 - clamp(x), 3);

/** Big number that counts from `from` to `to` between `start` and `end` seconds. Digits are monospaced so they don't jitter. */
export const YearCounter: React.FC<{ t: number; from: number; to: number; start: number; end: number; size?: number; color?: string; label?: string; format?: (n: number) => string; top?: number }> = ({ t, from, to, start, end, size = 150, color = c.text, label, format = (n) => String(Math.round(n)), top = 240 }) => {
  const p = ease((t - start) / (end - start)), v = from + (to - from) * p, fade = clamp((t - start + 0.2) / 0.3);
  return <div style={{ position: "absolute", top, left: 60, right: 160, textAlign: "center", opacity: fade }}>
    <div style={{ fontFamily: HEADING, fontWeight: 800, fontSize: size, lineHeight: 1, color, fontVariantNumeric: "tabular-nums", textShadow: "0 6px 30px rgba(0,0,0,.7)" }}>{format(v)}</div>
    {label ? <div style={{ fontFamily: BODY, fontWeight: 800, fontSize: 38, letterSpacing: 4, color: c.text, opacity: 0.9, marginTop: 8, textShadow: "0 2px 12px rgba(0,0,0,.9)" }}>{label}</div> : null}
  </div>;
};

export type Bar = { label: string; value: number; color: string; start: number };
/** Vertical comparison bars that grow with a count-up label. `max` sets the full height, `h` is the height in pixels. */
export const CompareBars: React.FC<{ t: number; bars: Bar[]; max: number; grow?: number; h?: number; w?: number; top?: number; unit?: string; marker?: { value: number; label: string } }> = ({ t, bars, max, grow = 1.4, h = 700, w = 220, top = 330, unit = "", marker }) => (
  <div style={{ position: "absolute", top, left: 60, right: 160, height: h + 120, display: "flex", justifyContent: "center", alignItems: "flex-end", gap: 70 }}>
    {marker ? <div style={{ position: "absolute", left: 0, right: 0, bottom: 100 + (marker.value / max) * h, borderTop: `3px dashed ${c.text}88` }}><span style={{ position: "absolute", right: 0, top: -34, fontFamily: BODY, fontWeight: 800, fontSize: 28, color: c.text }}>{marker.label}</span></div> : null}
    {bars.map((b) => { const p = ease((t - b.start) / grow), v = b.value * p; return <div key={b.label} style={{ width: w, textAlign: "center", opacity: clamp((t - b.start) / 0.2) }}>
      <div style={{ fontFamily: HEADING, fontWeight: 800, fontSize: 84, color: c.text, fontVariantNumeric: "tabular-nums", textShadow: "0 4px 18px rgba(0,0,0,.8)" }}>{Math.round(v)}{unit}</div>
      <div style={{ height: Math.max(4, (v / max) * h), background: `linear-gradient(180deg, ${b.color}, ${b.color}99)`, borderRadius: "20px 20px 6px 6px", boxShadow: `0 0 40px ${b.color}66` }} />
      <div style={{ fontFamily: BODY, fontWeight: 800, fontSize: 34, color: c.text, marginTop: 14, letterSpacing: 2 }}>{b.label}</div>
    </div>; })}
  </div>
);

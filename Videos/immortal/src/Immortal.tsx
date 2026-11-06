import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import * as THREE from "three";
import { BODY, HEADING, c } from "../../../Assets/remotion/theme";
import { Camera, Glow, Instances, Sky, clamp, mix, rng, ss } from "../../../Assets/remotion/three/kit";
import { Man } from "../../../Assets/remotion/three/man";
import { Extra } from "../../../Assets/remotion/three/crowd";
import { Chair, RoundTable } from "../../../Assets/remotion/three/gameprops";
import { Bubble, Candle, Earth, Globe, GREETINGS, Hourglass, StarField, Sun, TimeCity } from "../../../Assets/remotion/three/spaceprops";
import data from "../narration.json";

// "What if you became immortal?" Third-person, the main character. Speculative what-if; imagined scenes are tagged on screen.
const JACKET = { shirt: "#5A6B45", inner: "#E8E2D0", pants: "#26324D", shoes: "#3a2a1c" };
const SKIN = "#C68C64";
export const FPS = 30, TOTAL = 2340;
export const CUTS = [0, 4.5, 12.8, 21.0, 28.6, 36.6, 43.3, 51.0, 58.9, 65.3, 74.6, 78.0];

/** Time a narration word is spoken, within beat `b` (nth occurrence). */
export const W = (b: number, word: string, nth = 0) => {
  const beat = data.beats[b]; let k = 0;
  for (const ch of data.chunks) for (const w of ch.words) if (w.start >= beat.start - 0.01 && w.end <= beat.end + 0.01 && w.text.replace(/\W/g, "").toLowerCase() === word.toLowerCase()) { if (k++ === nth) return w.start; }
  throw new Error(`No word ${word} in beat ${b}`);
};
const hexMix = (a: string, b: string, t: number) => "#" + new THREE.Color(a).lerp(new THREE.Color(b), clamp(t)).getHexString();
const head = (t: number) => ({ sx: Math.sin(t * 1.25) * 0.004, sy: Math.sin(t * 1.9) * 0.006 });

const Hero: React.FC<{ t: number; position?: number[]; rotation?: number[]; pose?: string; expression?: string; look?: number[]; scale?: number }> = ({ t, position = [0, 0, 0], rotation = [0, 0, 0], pose = "idle", expression = "neutral", look = [0, 0], scale = 1 }) =>
  <Man outfit="jacket" colors={{ ...JACKET, skin: SKIN }} t={t} pose={pose} expression={expression} look={look} position={position} rotation={rotation} scale={scale} />;

/** Generic stage: gradient sky, optional ground, fog, a key light, a front fill and a rim light. */
const Stage: React.FC<{ sky?: [string, string]; ground?: string | null; fog?: [number, number]; hemi?: number; key?: number; keyColor?: string; fill?: number; rim?: string; rimI?: number; children: React.ReactNode }> = ({ sky = ["#0b1020", "#1a2440"], ground = "#161b29", fog = [8, 60], hemi = 0.9, key: keyI = 1.4, keyColor = "#ffe2bd", fill = 1.3, rim = "#7fa6ff", rimI = 1.2, children }) => {
  const { width, height } = useVideoConfig();
  return <ThreeCanvas width={width} height={height} shadows gl={{ antialias: true, preserveDrawingBuffer: true, toneMapping: THREE.ACESFilmicToneMapping }}>
    <fog attach="fog" args={[sky[1], fog[0], fog[1]]} />
    <Sky top={sky[0]} horizon={sky[1]} />
    <hemisphereLight args={["#dfe8ff", "#3a3430", hemi]} />
    <directionalLight position={[-5, 8, 4]} intensity={keyI} color={keyColor} castShadow shadow-mapSize={[1024, 1024]} shadow-camera-left={-9} shadow-camera-right={9} shadow-camera-top={9} shadow-camera-bottom={-9} shadow-camera-far={40} shadow-bias={-0.0006} />
    <directionalLight position={[1.5, 3, 9]} intensity={fill} color="#fff0dc" />
    <directionalLight position={[3, 4, -6]} intensity={rimI} color={rim} />
    {ground ? <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><circleGeometry args={[120, 48]} /><meshStandardMaterial color={ground} roughness={0.9} /></mesh> : null}
    {children}
  </ThreeCanvas>;
};

/* ---------- overlays ---------- */
const Vignette: React.FC<{ a?: number; flash?: number }> = ({ a = 0.5, flash = 0 }) => <AbsoluteFill style={{ pointerEvents: "none" }}>
  <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 45%, transparent 50%, rgba(3,5,12,${a}) 100%)` }} />
  <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(3,5,12,.5) 0%, rgba(3,5,12,0) 26%)" }} />
  {flash > 0 ? <AbsoluteFill style={{ background: "#fff", opacity: flash }} /> : null}
</AbsoluteFill>;
const Label: React.FC<{ t: number; text: string; sub?: string; start: number; size?: number; color?: string; top?: number; out?: number }> = ({ t, text, sub, start, size = 92, color = c.text, top = 245, out = 1e9 }) => {
  const k = ss(start, start + 0.22, t) * (1 - ss(out, out + 0.25, t)), s = mix(1.18, 1, ss(start, start + 0.22, t));
  return <div style={{ position: "absolute", top, left: 60, right: 160, textAlign: "center", opacity: k, transform: `scale(${s})` }}>
    <div style={{ fontFamily: HEADING, fontWeight: 800, fontSize: size, lineHeight: 1.06, color, letterSpacing: 1, textShadow: "0 5px 30px rgba(0,0,0,.9)" }}>{text}</div>
    {sub ? <div style={{ marginTop: 14, fontFamily: BODY, fontWeight: 800, fontSize: 40, color: c.text, textShadow: "0 2px 14px rgba(0,0,0,.95)" }}>{sub}</div> : null}
  </div>;
};
const Tag: React.FC<{ t: number; text: string; start: number; top: number; color?: string }> = ({ t, text, start, top, color = c.amber }) =>
  <div style={{ position: "absolute", top, left: 60, right: 160, textAlign: "center", opacity: ss(start, start + 0.25, t) }}><span style={{ display: "inline-block", background: `${c.bgDeep}D8`, border: `3px solid ${color}`, color, fontFamily: BODY, fontWeight: 800, fontSize: 34, letterSpacing: 3, borderRadius: 18, padding: "8px 24px" }}>{text}</span></div>;
const Num: React.FC<{ t: number; v: number; start: number; label: string; color: string; dur?: number }> = ({ t, v, start, label, color, dur = 1.3 }) =>
  <div style={{ flex: 1, textAlign: "center", opacity: ss(start - 0.1, start + 0.2, t) }}>
    <div style={{ fontFamily: HEADING, fontWeight: 800, fontSize: 130, lineHeight: 1, color, fontVariantNumeric: "tabular-nums", textShadow: "0 5px 26px rgba(0,0,0,.85)" }}>{Math.round(v * ss(start, start + dur, t))}</div>
    <div style={{ fontFamily: BODY, fontWeight: 800, fontSize: 32, letterSpacing: 3, color: c.text, textShadow: "0 2px 12px rgba(0,0,0,.95)" }}>{label}</div>
  </div>;

/** Floating golden specks. `t` is held by the caller to freeze time. */
const Dust: React.FC<{ t: number; at?: number[]; n?: number; spread?: number[]; color?: string; size?: number; speed?: number }> = ({ t, at = [0, 1.5, 0], n = 90, spread = [6, 3.5, 5], color = "#FFD27A", size = 0.025, speed = 0.12 }) => {
  const d0 = useMemo(() => { const r = rng(4); return Array.from({ length: n }, () => ({ x: r() - 0.5, y: r() - 0.5, z: r() - 0.5, p: r(), s: 0.5 + r() })); }, [n]);
  return <Glow count={n} t={t} size={size} path={(i, tt) => { const q = d0[i]; return { p: [at[0] + q.x * spread[0] + Math.sin(tt * 0.5 + i) * 0.15, at[1] + q.y * spread[1] + ((q.p + tt * speed * q.s) % 1) * 0.8, at[2] + q.z * spread[2]], a: q.s * (0.5 + 0.5 * Math.sin(tt * 1.3 + i)), color }; }} />;
};

/* ---------- 0: the hourglass stops ---------- */
const S0: React.FC<{ t: number }> = ({ t }) => {
  const nv = W(0, "never"), h = head(t), frozen = t > nv + 0.05, ft = Math.min(t, nv);
  const flash = ss(nv - 0.02, nv + 0.05, t) * (1 - ss(nv + 0.05, nv + 0.5, t)) * 0.35;
  return <>
    <Stage sky={["#04060e", "#141b33"]} ground="#0a0e18" fog={[6, 34]} hemi={0.55} key={1.1} rim="#7fb0ff" rimI={2.2}>
      <Camera pos={[0.1 + h.sx, 1.6 + h.sy, mix(8.2, 6.4, ss(0, CUTS[1], t))]} look={[0.05, 1.45, 0]} fov={42} />
      <Hourglass scale={1.05} p={0.28 + 0.3 * ss(0.2, nv, t)} frozen={frozen} t={t} position={[0.6, 0, -0.3]} rotation={[0, -0.25, 0]} />
      <Hero t={t} position={[-0.9, 0, 0.4]} rotation={[0, 0.75, 0]} pose={frozen ? "shock" : "idle"} expression={frozen ? "surprised" : "neutral"} look={[0.7, 0.25]} />
      <Dust t={ft} at={[0, 1.6, 0]} n={110} />
    </Stage>
    <Vignette a={0.6} flash={flash} />
    <Label t={t} text="WHAT IF YOU NEVER DIED?" start={nv - 0.1} size={92} />
  </>;
};

/* ---------- 1: a gift ---------- */
const S1: React.FC<{ t: number }> = ({ t }) => {
  const s = CUTS[1], p = ss(s, CUTS[2], t), h = head(t), mx = mix(-1.9, -0.3, p), gx = 1.0, lang = W(1, "language");
  return <>
    <Stage sky={["#4a9be0", "#ffd9a0"]} ground="#c9a86a" fog={[14, 80]} hemi={1.4} key={2.6} keyColor="#fff0cf" rim="#ffd9a0" rimI={0.8}>
      <Camera pos={[mix(-0.9, 0.5, p) + h.sx, 1.65 + h.sy, 6.6]} look={[mix(-0.8, 0.2, p), 1.4, 0]} fov={46} />
      {[[-14, -34, 12], [10, -42, 16], [30, -30, 11]].map((q, i) => <mesh key={i} position={[q[0], -q[2] * 0.55, q[1]]} scale={[q[2] * 1.8, q[2], q[2]]}><sphereGeometry args={[1, 24, 16]} /><meshStandardMaterial color={["#8fb06a", "#a7b872", "#7aa069"][i]} roughness={1} /></mesh>)}
      <Globe scale={1.7} spin={t * 0.7} position={[gx, 0, -0.2]} />
      {GREETINGS.map((g, i) => { const a = lang + i * 0.38, u = clamp((t - a) / 2.2), ang = i * 0.9 + 0.4; return t > a ? <Bubble key={i} text={g.text} font={g.font} width={1.15} opacity={ss(0, 0.12, u) * (1 - ss(0.75, 1, u))} position={[gx + Math.cos(ang) * 1.15, 1.9 + u * 1.2 + (i % 3) * 0.28, 0.5 + Math.sin(ang) * 0.5]} /> : null; })}
      <Hero t={t} position={[mx, 0, 0.4]} rotation={[0, Math.PI / 2 - 0.15, 0]} pose="walk" expression="smile" look={[0.4, 0.1]} />
      <Dust t={t} at={[gx, 2.2, 0]} n={70} spread={[8, 3, 4]} color="#fff3c0" size={0.02} />
    </Stage>
    <Vignette a={0.35} />
    <Label t={t} text="NO DEADLINES" start={W(1, "deadlines") - 0.1} size={96} color={c.amber} />
  </>;
};

/* ---------- 2: how long people live ---------- */
const S2: React.FC<{ t: number }> = ({ t }) => {
  const a = W(2, "seventythree"), b = W(2, "hundred"), h = head(t), g1 = ss(a, a + 1.3, t), g2 = ss(b, b + 1.5, t), K = 0.024;
  const mk = (x: number, hh: number, col: string, k: number) => <mesh position={[x, (hh * K * k) / 2, 0]} castShadow><boxGeometry args={[0.85, Math.max(0.001, hh * K * k), 0.85]} /><meshStandardMaterial color={col} roughness={0.4} emissive={col} emissiveIntensity={0.28} /></mesh>;
  return <>
    <Stage sky={["#0e1a33", "#2b3f69"]} ground="#18233d" fog={[10, 60]} hemi={1.0} key={1.6} rim="#9fc2ff" rimI={1.4}>
      <Camera pos={[0.55 + h.sx, 1.9 + h.sy, 8.0]} look={[0.55, 1.5, 0]} fov={44} />
      <Hero t={t} position={[-0.55, 0, 0.9]} rotation={[0, 0.55, 0]} pose="present" expression="neutral" look={[0.5, 0.2]} />
      {mk(0.85, 73, "#FBBF24", g1)}{mk(2.0, 122, "#FB7185", g2)}
      <mesh position={[0.85, 73 * K * g1 + 0.001, 0]}><boxGeometry args={[0.9, 0.02, 0.9]} /><meshBasicMaterial color="#fff2c0" /></mesh>
      <mesh position={[0, 0.002, 0.5]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[0.55, 0.6, 40]} /><meshBasicMaterial color="#9fc2ff" transparent opacity={0.5} /></mesh>
    </Stage>
    <Vignette a={0.45} />
    <div style={{ position: "absolute", top: 232, left: 60, right: 160, display: "flex", gap: 30 }}>
      <Num t={t} v={73} start={a} label="YEARS · AVERAGE" color={c.amber} />
      <Num t={t} v={122} start={b} label="YEARS · LONGEST" color={c.coral} dur={1.5} />
    </div>
    <Tag t={t} text="UN WPP 2024 · GUINNESS RECORDS" start={a} top={470} />
  </>;
};

/* ---------- 3: a thousand years ---------- */
const S3: React.FC<{ t: number }> = ({ t }) => {
  const s = CUTS[3], tau = t - s, k = W(3, "keep"), e = W(3, "eight"), dist = 1.3 * tau + 0.55 * tau * tau, h = head(t);
  const year = Math.round(mix(2026, 3026, ss(k, k + 4.6, t)));
  return <>
    <Stage sky={["#1a1146", "#c0603c"]} ground="#1c1830" fog={[8, 55]} hemi={0.9} key={1.5} keyColor="#ffb98a" rim="#ff8a5a" rimI={1.5}>
      <Camera pos={[0.6 + h.sx, 1.55 + h.sy, 4.8]} look={[0.3, 1.25, 0]} fov={42} />
      <Instances count={26} dep={Math.round(dist * 20)} fill={(i, d) => { d.position.set((((i * 3.2 - dist) % 83.2) + 83.2) % 83.2 - 26, 1.1, -0.5); d.scale.set(0.09, 2.2, 0.09); }}><boxGeometry args={[1, 1, 1]} /><meshStandardMaterial color="#f0c98a" emissive="#f0c98a" emissiveIntensity={0.5} /></Instances>
      <mesh position={[0, 0.01, -0.2]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[200, 0.12]} /><meshBasicMaterial color="#ffd9a0" /></mesh>
      <Hero t={t * (1 + 0.5 * ss(k, k + 4, t))} position={[0, 0, 0.5]} rotation={[0, Math.PI / 2 - 0.1, 0]} pose="walk" expression="neutral" look={[0.5, 0]} />
      <Dust t={t * 3} at={[0, 1.4, 0]} n={80} spread={[10, 2.5, 4]} color="#ffd9a0" size={0.02} speed={0.5} />
    </Stage>
    <Vignette a={0.5} />
    <div style={{ position: "absolute", top: 232, left: 60, right: 160, textAlign: "center", opacity: ss(k - 0.2, k + 0.2, t) }}><div style={{ fontFamily: HEADING, fontWeight: 800, fontSize: 170, lineHeight: 1, color: c.text, fontVariantNumeric: "tabular-nums", textShadow: "0 6px 30px rgba(0,0,0,.8)" }}>{year}</div></div>
    <Label t={t} text="1,000 YEARS = 8× THE RECORD" start={e - 0.15} size={58} color={c.amber} top={450} />
  </>;
};

/* ---------- 4: they leave ---------- */
const FRIENDS = [{ seed: 3, a: "woman", b: "elderwoman", p: [-1.35, 0, 0.1], ry: Math.PI / 2 }, { seed: 8, a: "man", b: "elderman", p: [1.35, 0, 0.1], ry: -Math.PI / 2 }, { seed: 12, a: "girl", b: "elderwoman", p: [-0.95, 0, 1.0], ry: 2.38 }, { seed: 5, a: "boy", b: "elderman", p: [0.95, 0, 1.0], ry: -2.38 }];
const S4: React.FC<{ t: number }> = ({ t }) => {
  const old = W(4, "old"), leave = W(4, "leave"), fade = W(4, "fade"), h = head(t), p = ss(CUTS[4], CUTS[5], t);
  const goneAt = FRIENDS.map((_, i) => leave + i * 0.95), lamp = mix(1.0, 0.25, ss(leave, leave + 3.6, t));
  return <>
    <Stage sky={["#150f0c", "#2a1c14"]} ground="#3a2a1e" fog={[8, 40]} hemi={0.55 * lamp + 0.2} key={0.5 + 1.0 * lamp} keyColor="#ffcf99" fill={0.7 + 0.6 * lamp} rim="#ff9a5a" rimI={0.6}>
      <Camera pos={[mix(-0.8, 0.6, p) + h.sx, 2.5 + h.sy, 5.0]} look={[0, 0.95, -0.2]} fov={48} />
      <mesh position={[0, 1.8, -3.2]}><planeGeometry args={[14, 6]} /><meshStandardMaterial color="#2e2018" roughness={1} /></mesh>
      {[-2.2, -0.75, 0.75, 2.2].map((x, i) => <mesh key={i} position={[x, 2.1 + (i % 2) * 0.2, -3.15]}><planeGeometry args={[0.7, 0.9]} /><meshBasicMaterial color={hexMix(["#c28a5a", "#7d9ab8", "#b8a06a", "#9a7aa8"][i], "#2e2018", ss(fade - 0.2, fade + 1.0, t))} /></mesh>)}
      <RoundTable radius={1.1} height={0.74} color="#6b3f28" base="#2b1a10" />
      <Chair position={[0, 0, -1.4]} rotationY={0} />
      {FRIENDS.map((f, i) => <Chair key={i} position={[f.p[0] * 1.06, 0, f.p[2] * 1.06]} rotationY={f.ry} />)}
      <Hero t={t} position={[0, 0, -2.0]} rotation={[0, 0, 0]} pose="idle" expression={t > leave ? "worried" : "neutral"} look={[0, -0.1]} />
      {FRIENDS.map((f, i) => { const aged = t > old, u = clamp((t - goneAt[i]) / 0.9), pop = aged ? 1 + 0.06 * Math.max(0, 1 - (t - old) * 4) : 1; return u < 1 ? <Extra key={i} seed={f.seed} spec={{ kind: (aged ? f.b : f.a) as any }} pose="sit" t={t} position={f.p} rotationY={f.ry} scale={Math.max(0.0001, (1 - u * u) * pop)} /> : null; })}
      {FRIENDS.map((f, i) => <Glow key={i} count={26} t={t} size={0.05} path={(k, tt) => { const u = clamp((tt - goneAt[i]) / 1.6), r1 = Math.sin(k * 12.9), r2 = Math.sin(k * 78.2); return { p: [f.p[0] + r1 * 0.35, 0.4 + (r2 * 0.5 + 0.5) * 1.1 + u * 1.3, f.p[2] + r2 * 0.3], a: tt > goneAt[i] ? Math.sin(Math.PI * u) * 1.4 : 0, color: "#ffd9a0" }; }} />)}
    </Stage>
    <Vignette a={0.55} />
    <Label t={t} text="THEY LEAVE. YOU STAY." start={leave - 0.15} size={84} />
  </>;
};

/* ---------- 5: the city changes ---------- */
const S5: React.FC<{ t: number }> = ({ t }) => {
  const s = CUTS[5], p = clamp((t - s) / (CUTS[6] - s)), era = mix(0.04, 0.97, p), night = ss(0.25, 0.8, era), h = head(t), van = W(5, "vanish");
  const skyTop = hexMix("#5b86b8", "#060a18", night), skyHor = hexMix("#e0b27a", "#18203a", night), fog = hexMix("#b59a7a", "#141a30", night);
  return <>
    <Stage sky={[skyTop, skyHor]} ground={hexMix("#4a4640", "#0c0f1a", night)} fog={[16, 90]} hemi={mix(1.1, 0.35, night)} key={mix(2.0, 0.5, night)} keyColor={hexMix("#ffd9a8", "#6a86c8", night)} fill={mix(1.2, 0.7, night)} rim="#ff9a6a" rimI={0.6}>
      <Camera pos={[0.1 + h.sx, 1.55 + h.sy, 5.6]} look={[-0.2, 3.4, -22]} fov={50} />
      <TimeCity era={era} night={night} fog={fog} fogRange={[16, 95]} slots={56} area={[64, 55]} />
      <Hero t={t} position={[0.5, 0, 0.6]} rotation={[0, Math.PI - 0.2, 0]} pose="idle" expression="neutral" look={[-0.3, 0.2]} />
      {GREETINGS.slice(0, 5).map((g, i) => { const a = van - 0.3 + i * 0.28, u = clamp((t - a) / 2.4); return t > a ? <Bubble key={i} text={g.text} font={g.font} width={1.2} opacity={ss(0, 0.1, u) * (1 - ss(0.45, 1, u))} position={[-1.8 + i * 0.95, 2.4 + u * 1.4, 1.2]} /> : null; })}
    </Stage>
    <Vignette a={0.5} />
    <Tag t={t} text="IMAGINED" start={CUTS[5] + 0.3} top={250} />
  </>;
};

/* ---------- 6: Earth dies ---------- */
const S6: React.FC<{ t: number }> = ({ t }) => {
  const half = W(6, "half"), pl = W(6, "plants"), bil = W(6, "billion", 1), oc = W(6, "oceans");
  const life = ss(pl - 0.6, pl + 1.8, t) * 0.55 + ss(bil, bil + 2.6, t) * 0.45, sea = 1 - ss(bil - 0.1, bil + 2.9, t), boil = ss(oc - 0.2, oc + 1.0, t) * (1 - ss(oc + 2.0, oc + 3.2, t));
  return <>
    <Stage sky={["#02030a", "#02030a"]} ground={null} fog={[100, 200]} hemi={0.1} key={0} fill={0} rimI={0}>
      <Camera pos={[0, 0.2, mix(9.6, 8.4, ss(CUTS[6], CUTS[7], t))]} look={[0, 0, 0]} fov={38} />
      <StarField t={t} seed={5} />
      <Earth position={[0, -0.5, 0]} scale={1.55} life={life} sea={sea} boil={boil} spin={t * 0.22} t={t} sun={[-0.7, 0.45, 0.75]} />
    </Stage>
    <Vignette a={0.5} />
    <Label t={t} text="+500 MILLION YRS" sub="PLANTS STRUGGLE" start={half - 0.2} size={78} out={bil - 0.15} color={c.green} />
    <Label t={t} text="+1 BILLION YRS" sub="OCEANS BOIL" start={bil - 0.05} size={84} color={c.coral} />
    <Tag t={t} text="WORST-CASE ESTIMATE" start={bil} top={470} />
  </>;
};

/* ---------- 7: the red giant ---------- */
const S7: React.FC<{ t: number }> = ({ t }) => {
  const five = W(7, "five"), sw = W(7, "swells"), sv = W(7, "survive"), grow = ss(sw - 0.4, sw + 4.2, t), giant = ss(sw - 0.6, sw + 3.0, t), flash = ss(sv - 0.1, sv + 0.5, t) * (1 - ss(sv + 0.9, sv + 1.8, t)) * 0.9;
  return <>
    <Stage sky={["#02030a", "#02030a"]} ground={null} fog={[100, 200]} hemi={0.15} key={0} fill={0} rimI={0}>
      <Camera pos={[0, 0.3, 11.5]} look={[0, 0, 0]} fov={38} />
      <StarField t={t} seed={9} />
      <Sun giant={giant} t={t} position={[0, 0.2, -3]} scale={mix(1.3, 7.8, grow)} />
      <Earth position={[1.9, -1.5, 2.2]} scale={0.5} life={1} sea={0} spin={t * 0.3} t={t} sun={[-0.3, 0.2, -1]} />
    </Stage>
    <Vignette a={0.5} flash={flash} />
    <Label t={t} text="+5 BILLION YEARS" sub="THE SUN BECOMES A RED GIANT" start={five - 0.2} size={80} color="#ff7a4a" />
  </>;
};

/* ---------- 8: alone in space ---------- */
const S8: React.FC<{ t: number }> = ({ t }) => {
  const p = ss(CUTS[8], CUTS[9], t), bob = Math.sin(t * 0.9) * 0.12;
  return <>
    <Stage sky={["#02030a", "#02030a"]} ground={null} fog={[120, 240]} hemi={0.35} key={0.5} fill={0.9} rim="#7fa6ff" rimI={2.0} keyColor="#ffb08a">
      <Camera pos={[0, 1.5, mix(5.6, 3.9, p)]} look={[0, 1.25, 0]} fov={40} />
      <StarField t={t} seed={13} />
      <Sun giant={1} t={t} position={[-38, 12, -95]} scale={7} flares={false} />
      <group position={[0, 1.15 + bob, 0]} rotation={[0.12 * Math.sin(t * 0.5), t * 0.32, 0.08 * Math.sin(t * 0.7)]}><Hero t={t} position={[0, -0.9, 0]} pose="idle" expression="neutral" look={[0, -0.1]} /></group>
    </Stage>
    <Vignette a={0.5} />
    <Tag t={t} text="IMAGINED · PURE SPECULATION" start={CUTS[8] + 0.4} top={250} />
  </>;
};

/* ---------- 9: the candle ---------- */
const S9: React.FC<{ t: number }> = ({ t }) => {
  const nc = W(9, "change"), me = W(9, "meaning"), en = W(9, "ends"), lim = W(9, "limited"), h = head(t);
  const lit = 1 - 0.5 * ss(en - 0.1, en + 0.35, t) * (1 - ss(en + 0.6, en + 1.5, t)) + 0.25 * ss(lim - 0.4, lim + 1.2, t);
  const warm = ss(lim - 0.6, lim + 2.0, t);
  return <>
    <Stage sky={["#06070c", "#14110f"]} ground="#201812" fog={[4, 18]} hemi={0.12 + 0.35 * warm} key={0.12 + 0.5 * warm} keyColor="#ffb070" fill={0.25 + 0.35 * warm} rim="#4a6aa8" rimI={0.5}>
      <Camera pos={[0.05 + h.sx, 1.3 + h.sy, mix(2.7, 2.3, ss(CUTS[9], CUTS[10], t))]} look={[0.1, 1.25, 0]} fov={44} />
      <RoundTable radius={0.9} height={0.74} color="#3f2616" base="#2b1a10" position={[0, 0, 0.1]} />
      <Candle position={[0.42, 0.745, 0.45]} scale={1.1} burn={ss(CUTS[9], CUTS[10], t) * 0.5} lit={lit} t={t} />
      <Hero t={t} position={[0, 0, -0.55]} rotation={[0, 0, 0]} pose="idle" expression={t > lim ? "smile" : "neutral"} look={[0.35, -0.2]} />
    </Stage>
    <Vignette a={0.6} />
    <Label t={t} text="MAYBE THE END IS WHAT MATTERS" start={me - 0.1} size={70} color={c.amber} top={245} />
  </>;
};

/* ---------- 10: would you take it ---------- */
const S10: React.FC<{ t: number }> = ({ t }) => {
  const tk = W(10, "take"), h = head(t), k = ss(CUTS[10], CUTS[11], t);
  return <>
    <Stage sky={["#3f8fe0", "#ffd9a6"]} ground="#b9a27c" fog={[10, 70]} hemi={1.5} key={2.8} keyColor="#fff1d6" rim="#ffe2b0" rimI={1.2}>
      <Camera pos={[0 + h.sx, 1.5 + h.sy, mix(4.5, 3.9, k)]} look={[0, 1.4, 0]} fov={40} />
      <Sun position={[0, 3.6, -40]} scale={4} flares={false} t={t} />
      <Hero t={t} position={[0, 0, 0]} rotation={[0, 0, 0]} pose="present" expression="smile" look={[0, 0.05]} />
      <Dust t={t} at={[0, 1.8, 0]} n={70} spread={[5, 3, 3]} size={0.02} />
    </Stage>
    <Vignette a={0.25} />
    <Label t={t} text="WOULD YOU TAKE IT?" start={tk - 0.45} size={104} color={c.amber} />
  </>;
};

/** Same look as the library NarrationCaptions, with wider word gaps so the enlarged active word never touches its neighbor. */
const Captions: React.FC<{ t: number }> = ({ t }) => {
  const chunk = data.chunks.find((x, i) => t >= x.start && t < (data.chunks[i + 1]?.start ?? x.end + 0.4));
  if (!chunk) return null;
  return <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 440, paddingLeft: 60, paddingRight: 160 }}>
    <div style={{ background: `${c.bgDeep}E0`, borderRadius: 28, padding: "22px 34px", textAlign: "center", fontFamily: BODY, fontWeight: 700, fontSize: 54, lineHeight: 1.25, color: c.text }}>
      {chunk.words.map((w, i) => <span key={i} style={{ display: "inline-block", margin: "0 9px", color: w.highlight ? c.amber : c.text, opacity: t >= w.start ? 1 : 0.55, transform: `scale(${t >= w.start && t < w.end ? 1.04 : 1})` }}>{w.text}</span>)}
    </div>
  </AbsoluteFill>;
};

const SCENES = [S0, S1, S2, S3, S4, S5, S6, S7, S8, S9, S10];
export const Immortal: React.FC = () => {
  const t = useCurrentFrame() / FPS; let i = 0;
  for (let k = 0; k < SCENES.length; k++) if (t >= CUTS[k]) i = k;
  const Scene = SCENES[i];
  const dip = Math.max(i >= 1 ? 1 - clamp((t - CUTS[i]) / 0.2) : 0, i < SCENES.length - 1 ? ss(CUTS[i + 1] - 0.14, CUTS[i + 1], t) : ss(CUTS[11] - 0.4, CUTS[11], t));
  return <AbsoluteFill style={{ background: "#03060E" }}>
    <Scene t={t} />
    {dip > 0 ? <AbsoluteFill style={{ background: "#03060E", opacity: dip }} /> : null}
    <Captions t={t} />
  </AbsoluteFill>;
};

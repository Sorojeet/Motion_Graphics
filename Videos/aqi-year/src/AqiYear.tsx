import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import * as THREE from "three";
import { BODY, HEADING, c } from "../../../Assets/remotion/theme";
import { Camera, Glow, Instances, Sky, clamp, mix, noise, rng, ss } from "../../../Assets/remotion/three/kit";
import { Man } from "../../../Assets/remotion/three/man";
import data from "../narration.json";

// Third-person video: the main character (bearded 3D man, jacket) is seen from outside.
// Colors for this video only. Smog tones are set here and the theme file is untouched.
const P = { smog: "#C79A68", gray: "#8C8C93", coral: c.coral, amber: c.amber, skin: "#C68C64", skinGray: "#8E8E96" };
const JACKET = { shirt: "#5A6B45", inner: "#E8E2D0", pants: "#26324D", shoes: "#3a2a1c" };
export const TOTAL = 1920, FPS = 30;
export const CUTS = [0, 5.2, 13.38, 18.17, 27.25, 34.82, 43.95, 49.97, 56.63, 60.73, 64.0];

/** Time a narration word is spoken, within beat `b`. */
export const W = (b: number, word: string, nth = 0) => {
  const beat = data.beats[b]; let k = 0;
  for (const ch of data.chunks) for (const w of ch.words) if (w.start >= beat.start - 0.01 && w.end <= beat.end + 0.01 && w.text.replace(/\W/g, "").toLowerCase() === word.toLowerCase()) { if (k++ === nth) return w.start; }
  throw new Error(`No word ${word} in beat ${b}`);
};
const hexMix = (a: string, b: string, t: number) => "#" + new THREE.Color(a).lerp(new THREE.Color(b), clamp(t)).getHexString();
const fmt = (n: number) => Math.round(n).toLocaleString("en-US");

/** Small natural motion for the camera, plus an optional cough shake. */
const head = (t: number, cough: number[] = []) => {
  let sx = Math.sin(t * 1.25) * 0.004, sy = Math.sin(t * 1.9) * 0.006, sr = Math.sin(t * 0.8) * 0.004;
  for (const k of cough) { const d = t - k; if (d > 0 && d < 0.7) { const a = Math.exp(-d * 6); sy += Math.sin(d * 50) * 0.05 * a; sx += Math.sin(d * 37) * 0.02 * a; sr += Math.sin(d * 44) * 0.03 * a; } }
  return { sx, sy, sr };
};

/** Pose timeline: keys of [time, pose]. Blends 0.35 s into each. */
const poseAt = (t: number, keys: [number, string][]) => { let i = 0; for (let k = 0; k < keys.length; k++) if (t >= keys[k][0]) i = k; return { from: keys[Math.max(0, i - 1)][1], pose: keys[i][1], blend: i === 0 ? 1 : ss(keys[i][0], keys[i][0] + 0.35, t) }; };
const aqiTex = (n: number) => {
  const cv = document.createElement("canvas"); cv.width = 256; cv.height = 512; const x = cv.getContext("2d")!;
  const col = n < 50 ? "#00A651" : n < 100 ? "#E8C600" : n < 150 ? "#F78F1E" : n < 200 ? "#E3262C" : n < 300 ? "#8F3F97" : "#7E0023";
  x.fillStyle = "#0B1426"; x.fillRect(0, 0, 256, 512); x.fillStyle = col; x.fillRect(0, 150, 256, 230);
  x.fillStyle = "#fff"; x.textAlign = "center"; x.font = "800 40px Montserrat, sans-serif"; x.fillText("AQI", 128, 100);
  x.font = "800 118px Montserrat, sans-serif"; x.fillText(String(Math.round(n)), 128, 300);
  x.font = "700 26px Inter, sans-serif"; x.fillText(n >= 300 ? "HAZARDOUS" : n >= 200 ? "VERY UNHEALTHY" : n >= 150 ? "UNHEALTHY" : "AIR QUALITY", 128, 350); x.fillText("PM2.5", 128, 450);
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t;
};

/* ---------- The man, with an optional mask ---------- */
const Mask: React.FC<{ tone?: string; drop?: number }> = ({ tone = "#D9DDE2", drop = 0 }) =>
  <group position={[0, 1.545 - drop, 0.1]} rotation={[drop * 1.2, 0, 0]}>
    <mesh scale={[0.092, 0.06, 0.05]}><sphereGeometry args={[1, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.62]} /><meshStandardMaterial color={tone} roughness={0.9} side={THREE.DoubleSide} /></mesh>
    {[-1, 1].map((m) => <mesh key={m} position={[m * 0.098, 0.04 - drop * 0.0, -0.03]} rotation={[0, 0, m * 0.35]} scale={[0.003, 0.07, 0.003]}><boxGeometry args={[1, 1, 1]} /><meshStandardMaterial color="#aeb4bb" /></mesh>)}
  </group>;
const Hero: React.FC<{ t: number; mask?: number; tone?: string; drop?: number; position?: number[]; rotation?: number[]; skin?: string; pose?: string; from?: string; blend?: number; expression?: string; look?: number[]; shake?: number }> = ({ t, mask = 0, tone, drop = 0, position = [0, 0, 0], rotation = [0, 0, 0], skin = P.skin, pose = "idle", from, blend = 1, expression = "neutral", look = [0, 0], shake = 0 }) =>
  <group position={position as any} rotation={[shake * 0.5, rotation[1], shake]}>
    <Man outfit="jacket" colors={{ ...JACKET, skin }} t={t} pose={pose} from={from} blend={blend} expression={expression} look={look} />
    {mask > 0 ? <Mask tone={tone} drop={drop} /> : null}
  </group>;
/** Specks drawn toward the man's mouth. */
const MouthSpecks: React.FC<{ t: number; at: number[]; n?: number; speed?: number; size?: number }> = ({ t, at, n = 90, speed = 0.4, size = 0.022 }) => {
  const d0 = useMemo(() => { const r = rng(9); return Array.from({ length: n }, () => { const a = r() * 6.28, b = (r() - 0.35) * 1.6, rad = 1.0 + r() * 1.6; return { x: Math.cos(a) * Math.cos(b) * rad, y: Math.sin(b) * rad * 0.8, z: Math.abs(Math.sin(a)) * rad * 0.9 + 0.3, p: r(), v: 0.7 + r() * 0.6 }; }); }, [n]);
  return <Glow count={n} t={t} size={size} path={(i, tt) => { const q = d0[i], u = (q.p + tt * speed * q.v) % 1, k = Math.pow(1 - u, 1.3); return { p: [at[0] + q.x * k, at[1] + q.y * k, at[2] + q.z * k], a: Math.sin(Math.PI * Math.min(1, u * 1.05)) * 1.3 + 0.05, color: "#FFB347" }; }} />;
};
/* ---------- Stage ---------- */
/** `haze` 1 is thick brown smog, 0 is clear. `blue` 1 turns the sky blue. */
const Stage: React.FC<{ haze?: number; blue?: number; fog?: [number, number]; children: React.ReactNode; ground?: string }> = ({ haze = 1, blue = 0, fog = [3, 30], children, ground = "#2a2723" }) => {
  const { width, height } = useVideoConfig();
  const top = hexMix(hexMix("#7a6a58", "#4c5f78", 1 - haze), "#3f8fe0", blue), hor = hexMix(hexMix("#c9a074", "#8aa0b8", 1 - haze), "#bfe0f7", blue);
  const f = fog[1] * mix(1, 0.4, haze) * mix(1, 3, blue);
  return <ThreeCanvas width={width} height={height} shadows gl={{ antialias: true, preserveDrawingBuffer: true, toneMapping: THREE.ACESFilmicToneMapping }}>
    <fog attach="fog" args={[hor, fog[0], f]} />
    <Sky top={top} horizon={hor} />
    <hemisphereLight args={[hexMix("#d9b98f", "#dfeeff", blue), "#4a4036", mix(1.0, 1.7, blue)]} />
    <directionalLight position={[-6, 9, 4]} intensity={mix(1.4, 2.8, blue)} color={hexMix("#ffcf99", "#fff6e6", blue)} castShadow shadow-mapSize={[1024, 1024]} shadow-camera-left={-14} shadow-camera-right={14} shadow-camera-top={14} shadow-camera-bottom={-14} shadow-camera-far={50} shadow-bias={-0.0006} />
    <directionalLight position={[1.5, 3, 9]} intensity={mix(2.0, 2.4, blue)} color="#fff0dc" />
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><circleGeometry args={[120, 48]} /><meshStandardMaterial color={hexMix(ground, "#3f4a52", blue)} roughness={0.95} /></mesh>
    {children}
  </ThreeCanvas>;
};
/** City street running along -z, with buildings, lane marks and street lamps. */
const City: React.FC<{ t?: number }> = () => {
  const b = useMemo(() => { const r = rng(21); return Array.from({ length: 56 }, (_, i) => { const side = i % 2 ? 1 : -1, k = Math.floor(i / 2); return { x: side * (4.4 + r() * 2.2), z: -k * 3.3 + 3, w: 2.2 + r() * 1.8, h: 5 + r() * 14, d: 2.6 + r() * 1.2, shade: 0.35 + r() * 0.35 }; }); }, []);
  return <>
    <Instances count={b.length} dep={0} castShadow receiveShadow fill={(i, d, col) => { const q = b[i]; d.position.set(q.x, q.h / 2, q.z); d.scale.set(q.w, q.h, q.d); col.setHSL(0.08, 0.1, q.shade); }}>
      <boxGeometry args={[1, 1, 1]} /><meshStandardMaterial roughness={0.9} />
    </Instances>
    <Instances count={30} dep={0} fill={(i, d) => { d.position.set(0, 0.012, 2 - i * 3); d.rotation.set(-Math.PI / 2, 0, 0); d.scale.set(0.16, 1.4, 1); }}>
      <planeGeometry args={[1, 1]} /><meshBasicMaterial color="#d8d0b0" />
    </Instances>
    <Instances count={40} dep={0} fill={(i, d) => { const s = i % 2 ? 1 : -1; d.position.set(s * 3.1, 2.1, 2 - Math.floor(i / 2) * 6.5); d.scale.set(0.08, 4.2, 0.08); }}>
      <boxGeometry args={[1, 1, 1]} /><meshStandardMaterial color="#3a3d42" />
    </Instances>
  </>;
};
const Specks: React.FC<{ t: number; cam: number[]; n?: number; speed?: number; spread?: number; color?: string; size?: number }> = ({ t, cam, n = 130, speed = 0.45, spread = 2.4, color = "#FFB347", size = 0.011 }) => {
  const d0 = useMemo(() => { const r = rng(7); return Array.from({ length: n }, () => ({ x: (r() - 0.5) * spread, y: (r() - 0.5) * spread * 0.9, p: r(), v: 0.7 + r() * 0.6, s: 0.6 + r() * 1.2 })); }, [n, spread]);
  return <Glow count={n} t={t} size={size} path={(i, tt) => { const q = d0[i], u = (q.p + tt * speed * q.v * 0.25) % 1, z = -6 + u * 5.3; return { p: [cam[0] + q.x * (0.4 + (1 - u) * 1.2) + Math.sin(tt * 1.5 + i) * 0.04, cam[1] + q.y * (0.4 + (1 - u) * 1.2), cam[2] + z], a: q.s * (0.35 + u * 0.9), color }; }} />;
};

/* ---------- Overlays ---------- */
const Lens: React.FC<{ a: number; tint?: string }> = ({ a, tint = "181,138,92" }) => <AbsoluteFill style={{ pointerEvents: "none", background: `radial-gradient(ellipse at 50% 50%, rgba(${tint},${a * 0.35}) 0%, rgba(${tint},${a}) 100%)` }} />;
const Vignette: React.FC<{ a?: number; flash?: number; black?: number }> = ({ a = 0.5, flash = 0, black = 0 }) => <AbsoluteFill style={{ pointerEvents: "none" }}>
  <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 45%, transparent 50%, rgba(10,6,4,${a}) 100%)` }} />
  <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(10,6,4,.55) 0%, rgba(10,6,4,0) 26%)" }} />
  {black > 0 ? <AbsoluteFill style={{ background: "#000", opacity: black }} /> : null}
  {flash > 0 ? <AbsoluteFill style={{ background: "#fff", opacity: flash }} /> : null}
</AbsoluteFill>;
const Label: React.FC<{ t: number; text: string; sub?: string; start?: number; size?: number; color?: string; top?: number; out?: number }> = ({ t, text, sub, start = 0, size = 92, color = c.text, top = 245, out = 1e9 }) => {
  const k = ss(start, start + 0.22, t) * (1 - ss(out, out + 0.25, t)), s = mix(1.18, 1, ss(start, start + 0.22, t));
  return <div style={{ position: "absolute", top, left: 60, right: 160, textAlign: "center", opacity: k, transform: `scale(${s})` }}>
    <div style={{ fontFamily: HEADING, fontWeight: 800, fontSize: size, lineHeight: 1.06, color, letterSpacing: 1, textShadow: "0 5px 30px rgba(0,0,0,.9)" }}>{text}</div>
    {sub ? <div style={{ marginTop: 14, fontFamily: BODY, fontWeight: 800, fontSize: 40, color: c.text, textShadow: "0 2px 14px rgba(0,0,0,.95)" }}>{sub}</div> : null}
  </div>;
};
const Tag: React.FC<{ t: number; text: string; start: number; top: number }> = ({ t, text, start, top }) => {
  const k = ss(start, start + 0.25, t);
  return <div style={{ position: "absolute", top, left: 60, right: 160, textAlign: "center", opacity: k }}><span style={{ display: "inline-block", background: `${c.bgDeep}D8`, border: `3px solid ${c.amber}`, color: c.amber, fontFamily: BODY, fontWeight: 800, fontSize: 34, letterSpacing: 3, borderRadius: 18, padding: "8px 24px" }}>{text}</span></div>;
};


/* ---------- 0: AQI 500 ---------- */
const S0: React.FC<{ t: number }> = ({ t }) => {
  const h = head(t), n = mix(0, 500, ss(1.2, 2.3, t)), d = mix(6.6, 5.0, ss(0, CUTS[1], t));
  const tex = useMemo(() => aqiTex(n), [Math.round(n / 5)]);
  return <>
    <Stage haze={1}>
      <Camera pos={[0.9 + h.sx, 1.45 + h.sy, d - 2.6]} look={[-0.4, 1.4, -3]} fov={42} />
      <City />
      <mesh position={[-0.95, 2.0, -3.2]} castShadow><boxGeometry args={[1.25, 2.3, 0.1]} /><meshStandardMaterial color="#14161c" roughness={0.4} /></mesh>
      <mesh position={[-0.95, 2.0, -3.145]}><planeGeometry args={[1.15, 2.18]} /><meshBasicMaterial map={tex} toneMapped={false} /></mesh>
      <mesh position={[-0.95, 0.3, -3.2]}><cylinderGeometry args={[0.06, 0.06, 0.7, 10]} /><meshStandardMaterial color="#3a3d42" /></mesh>
      <Hero t={t} position={[0.4, 0, -3]} rotation={[0, -0.25, 0]} {...poseAt(t, [[0, "idle"], [1.1, "point"]])} expression={t < 2.2 ? "neutral" : "worried"} look={[-0.7, 0.4]} />
      <Specks t={t} cam={[0, 1.5, -2]} n={70} />
    </Stage>
    <Lens a={0.22} /><Vignette a={0.5} />
    <Label t={t} text="AQI 500 · 365 DAYS" start={W(0, "five") - 0.1} size={84} color={P.amber} />
  </>;
};

/* ---------- 1: day one ---------- */
const S1: React.FC<{ t: number }> = ({ t }) => {
  const coughs = [W(1, "particles") + 0.2, W(1, "small") - 0.25], h = head(t), push = ss(CUTS[1], CUTS[2], t);
  let shake = 0; for (const k of coughs) { const d = t - k; if (d > 0 && d < 0.7) shake += Math.sin(d * 46) * 0.05 * Math.exp(-d * 5.5); }
  const rush = ss(W(1, "slip") - 0.2, W(1, "lungs") + 0.1, t);
  return <>
    <Stage haze={1}>
      <Camera pos={[0.5 + h.sx, 1.55 + h.sy, mix(3.6, 2.5, push)]} look={[0, 1.5, 0]} fov={36} />
      <City />
      <Hero t={t} position={[0, 0, 0]} pose="think" expression="worried" look={[0.2, 0.2]} shake={shake} />
      <MouthSpecks t={t * (1 + rush * 1.2)} at={[0, 1.57, 0.12]} n={110} speed={0.34} />
      <Specks t={t} cam={[0, 1.5, -1.6]} n={90} />
    </Stage>
    <Lens a={0.28} /><Vignette a={0.5} />
    <Label t={t} text="PM2.5" start={W(1, "pm") - 0.1} size={140} color={P.amber} />
  </>;
};

/* ---------- 2: through the body ---------- */
const S2: React.FC<{ t: number }> = ({ t }) => {
  const s = CUTS[2], u = t - s, dur = CUTS[3] - s, tb = W(2, "bloodstream") - s;
  const zOf = (x: number) => (x < tb ? -34 * (x / tb) : -34 - 30 * ss(0, 1, (x - tb) / (dur - tb)) * 0.6 - 30 * ((x - tb) / (dur - tb)) * 0.4);
  const z = zOf(u), cam = [Math.sin(u * 2.1) * 0.08, Math.cos(u * 1.7) * 0.06, z];
  const rings = useMemo(() => Array.from({ length: 14 }, (_, i) => -i * 2.4 - 1), []);
  const sacs = useMemo(() => { const r = rng(12); return Array.from({ length: 110 }, () => ({ x: (r() - 0.5) * 9, y: (r() - 0.5) * 6, z: -14 - r() * 20, s: 0.5 + r() * 1.2 })); }, []);
  const cells = useMemo(() => { const r = rng(4); return Array.from({ length: 240 }, () => { const a = r() * 6.28, rad = 0.2 + Math.sqrt(r()) * 1.15; return { x: Math.cos(a) * rad, y: Math.sin(a) * rad, z: -34 - r() * 40, ry: r() * 3, rz: r() * 3 }; }); }, []);
  const beat = 1 + 0.07 * Math.max(0, Math.sin(u * 7)) ** 2;
  const inLung = ss(-4, -2, z) * 1, blood = ss(-31, -35, z);
  const fogC = hexMix(hexMix("#4a1620", "#5a1a1f", 1 - blood), "#4a0a12", blood);
  const { width, height } = useVideoConfig();
  return <>
    <ThreeCanvas width={width} height={height} gl={{ antialias: true, preserveDrawingBuffer: true, toneMapping: THREE.ACESFilmicToneMapping }}>
      <color attach="background" args={[fogC]} /><fog attach="fog" args={[fogC, 1, 15]} />
      <Camera pos={cam} look={[0, 0, z - 6]} roll={Math.sin(u * 1.3) * 0.04} fov={64} />
      <ambientLight intensity={1.4} color="#ffb8b0" /><pointLight position={[cam[0], cam[1], z - 0.5]} intensity={26} distance={16} color="#ffd2c4" />
      {/* windpipe: ribbed pink tunnel */}
      <mesh position={[0, 0, -9]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[1.5, 1.5, 24, 28, 1, true]} /><meshStandardMaterial color="#d97b86" roughness={0.6} side={THREE.BackSide} /></mesh>
      {rings.map((rz, i) => <mesh key={i} position={[0, 0, rz]}><torusGeometry args={[1.46, 0.09, 8, 28]} /><meshStandardMaterial color="#efe0d0" roughness={0.5} /></mesh>)}
      {/* lung tissue: clustered air sacs */}
      {sacs.map((q, i) => <mesh key={i} position={[q.x, q.y, q.z]}><sphereGeometry args={[q.s, 14, 10]} /><meshStandardMaterial color={i % 3 ? "#e8909c" : "#d46f82"} roughness={0.55} transparent opacity={0.92} /></mesh>)}
      {/* blood vessel with red cells */}
      <mesh position={[0, 0, -62]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[1.6, 1.6, 64, 24, 1, true]} /><meshStandardMaterial color="#8f1a2a" roughness={0.5} side={THREE.BackSide} emissive="#3a0610" /></mesh>
      <Instances count={cells.length} dep={Math.round(u * 30)} fill={(i, d) => { const q = cells[i]; d.position.set(q.x, q.y, q.z + ((u * 3) % 1) * 0.0); d.rotation.set(q.ry, 0, q.rz); d.scale.set(0.34, 0.12, 0.34); }}>
        <sphereGeometry args={[1, 12, 8]} /><meshStandardMaterial color="#d0243a" roughness={0.45} emissive="#4d0612" />
      </Instances>
      {/* organs, passed on the way */}
      <mesh position={[-2.6, 0.2, -64]} scale={[1.6 * beat, 1.9 * beat, 1.5 * beat]}><sphereGeometry args={[1, 24, 18]} /><meshStandardMaterial color="#b3243b" roughness={0.4} emissive="#4a0a14" /></mesh>
      <mesh position={[2.9, 0.4, -73]} scale={[1.7, 1.4, 1.8]}><icosahedronGeometry args={[1, 3]} /><meshStandardMaterial color="#e29bb0" roughness={0.5} emissive="#3a1520" flatShading /></mesh>
      <Glow count={70} t={u} size={0.07} path={(i, tt) => { const r = rng(i + 3); const a = r() * 6.28, rad = r() * 1.0; const zz = z - 1.2 - ((r() * 9 + tt * 0.5) % 9); return { p: [cam[0] + Math.cos(a) * rad, cam[1] + Math.sin(a) * rad * 0.8, zz], a: 0.5 + r(), color: "#FFB347" }; }} />
    </ThreeCanvas>
    <Vignette a={0.6} flash={ss(CUTS[2], CUTS[2] + 0.02, t) * (1 - ss(CUTS[2] + 0.02, CUTS[2] + 0.2, t)) * 0.9} />
    <Label t={t} text="STRAIGHT INTO THE BLOODSTREAM" start={W(2, "bloodstream") - 0.15} size={74} color={c.text} />
  </>;
};


const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
const pageTex = (m: string, k: number) => {
  const cv = document.createElement("canvas"); cv.width = 384; cv.height = 512; const x = cv.getContext("2d")!;
  x.fillStyle = "#F4F1EA"; x.fillRect(0, 0, 384, 512); x.fillStyle = k % 2 ? "#E11D48" : "#0B1426"; x.fillRect(0, 0, 384, 150);
  x.fillStyle = "#fff"; x.font = "800 90px Montserrat, sans-serif"; x.textAlign = "center"; x.fillText(m, 192, 108);
  x.fillStyle = "#98a0ad"; for (let i = 0; i < 5; i++) for (let j = 0; j < 7; j++) x.fillRect(30 + j * 47, 190 + i * 62, 34, 34);
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t;
};
const S3: React.FC<{ t: number }> = ({ t }) => {
  const total = 3650, p = ss(W(3, "over") - 0.1, W(3, "hundred") + 0.5, t), n = Math.round(p * total), h = head(t);
  const tex = useMemo(() => MONTHS.map((m, k) => pageTex(m, k)), []);
  const pile = useMemo(() => { const r = rng(31); return Array.from({ length: total }, () => { const a = r() * 6.28, rad = Math.sqrt(r()) * 0.34, hgt = Math.max(0, 0.2 * (1 - rad / 0.34)) * (0.4 + r() * 0.6); return { x: Math.cos(a) * rad, y: hgt + r() * 0.015, z: Math.sin(a) * rad, ry: r() * 6.28, rx: (r() - 0.5) * 0.7, tone: r() }; }); }, []);
  const flip = (k: number) => ss(mix(W(3, "over"), W(3, "hundred") + 0.2, k / 12) - 0.25, mix(W(3, "over"), W(3, "hundred") + 0.2, k / 12) + 0.2, t);
  const { width, height } = useVideoConfig();
  return <>
    <ThreeCanvas width={width} height={height} shadows gl={{ antialias: true, preserveDrawingBuffer: true, toneMapping: THREE.ACESFilmicToneMapping }}>
      <color attach="background" args={["#2a211b"]} /><fog attach="fog" args={["#2a211b", 6, 16]} />
      <hemisphereLight args={["#e0c8a8", "#3a2f26", 1.4]} />
      <pointLight position={[0.4, 2.6, 2.6]} intensity={34} distance={12} color="#ffd9a8" castShadow /><directionalLight position={[1, 2.5, 6]} intensity={1.6} color="#fff0dc" />
      <Camera pos={[0.1 + h.sx + 0.4 * Math.sin(t * 0.35), 1.5 + h.sy, 6.4]} look={[0, 1.05, -0.3]} fov={44} />
      <mesh position={[0, 1.4, -1.6]} receiveShadow><boxGeometry args={[7, 4, 0.05]} /><meshStandardMaterial color="#3b2f28" roughness={0.9} /></mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[9, 9]} /><meshStandardMaterial color="#2a2118" roughness={0.9} /></mesh>
      <mesh position={[0.6, 0.74, -0.7]} receiveShadow castShadow><boxGeometry args={[1.2, 0.05, 0.8]} /><meshStandardMaterial color="#6b4a30" roughness={0.6} /></mesh>
      {[[0.05, -0.35], [1.15, -0.35], [0.05, -1.05], [1.15, -1.05]].map(([x, z], i) => <mesh key={i} position={[x, 0.37, z]} castShadow><boxGeometry args={[0.06, 0.74, 0.06]} /><meshStandardMaterial color="#4a3320" /></mesh>)}
      <group position={[0.6, 1.7, -1.55]} scale={0.7}>
        <mesh position={[0, 0, -0.01]}><boxGeometry args={[0.88, 1.16, 0.02]} /><meshStandardMaterial color="#1b2333" /></mesh>
        {tex.map((tx, k) => k < 11 && flip(k) >= 0.98 ? null : <group key={k} position={[0, 0.54, 0.012 + (12 - k) * 0.0012]} rotation={[-Math.PI * 0.5 * flip(k), 0, 0]}><mesh position={[0, -0.54, 0]}><planeGeometry args={[0.84, 1.1]} /><meshBasicMaterial map={tx} toneMapped={false} /></mesh></group>)}
      </group>
      <Instances count={total} dep={n} castShadow fill={(i, d, col) => { const q = pile[i], on = i < n ? 1 : 0; d.position.set(0.6 + q.x * 1.2, 0.765 + q.y * 1.4, -0.7 + q.z * 1.2); d.rotation.set(q.rx, q.ry, 0); d.scale.set(0.011 * on, 0.011 * on, 0.1 * on); col.set(q.tone > 0.8 ? "#d9a15a" : "#F2EFE6"); }}>
        <boxGeometry args={[1, 1, 1]} /><meshStandardMaterial roughness={0.7} />
      </Instances>
      <Hero t={t} position={[-0.7, 0, 0.1]} rotation={[0, 0.5, 0]} mask={1} tone="#C9CDD2" {...poseAt(t, [[CUTS[3], "crossed"], [W(3, "thousand"), "shock"]])} expression={t < W(3, "thousand") ? "worried" : "surprised"} look={[0.5, 0]} />
    </ThreeCanvas>
    <Vignette a={0.6} />
    <div style={{ position: "absolute", top: 232, left: 60, right: 160, textAlign: "center", opacity: ss(W(3, "ten") - 0.3, W(3, "ten"), t) }}>
      <div style={{ fontFamily: HEADING, fontWeight: 800, fontSize: 60, color: P.amber, textShadow: "0 5px 30px rgba(0,0,0,.9)" }}>10+ CIGARETTES A DAY</div>
      <div style={{ fontFamily: HEADING, fontWeight: 800, fontSize: 130, color: c.text, textShadow: "0 5px 30px rgba(0,0,0,.9)", opacity: ss(W(3, "year"), W(3, "year") + 0.3, t) }}>{fmt(n)}{n >= total ? "+" : ""}</div>
    </div>
    <Tag t={t} text="ROUGH ESTIMATE" start={W(3, "rough") - 0.1} top={600} />
  </>;
};

/* ---------- 4: the damage adds up ---------- */
const S4: React.FC<{ t: number }> = ({ t }) => {
  const s = CUTS[4], p = ss(s, CUTS[5], t), skin = hexMix(P.skin, P.skinGray, p), h = head(t), orb = mix(-0.35, 0.3, p);
  const words = [["STROKE", "stroke", 0], ["HEART DISEASE", "heart", 0], ["LUNG CANCER", "cancer", 0], ["COPD", "disease", 1]] as const;
  let shake = 0; for (const k of [W(4, "stroke") + 0.3, W(4, "lung", 1) - 0.4]) { const d = t - k; if (d > 0 && d < 0.6) shake += Math.sin(d * 44) * 0.04 * Math.exp(-d * 6); }
  return <>
    <Stage haze={1}>
      <Camera pos={[Math.sin(orb) * 3.7 + h.sx, 1.5 + h.sy, Math.cos(orb) * 3.7]} look={[0, 1.3, 0]} fov={40} />
      <City />
      <Hero t={t} mask={1} tone={hexMix("#D9DDE2", "#6e6a66", p)} skin={skin} {...poseAt(t, [[s, "idle"], [s + 2, "think"]])} expression="worried" shake={shake} look={[0, -0.1]} />
      <Specks t={t} cam={[0, 1.5, 1.5]} n={110} />
    </Stage>
    <Lens a={mix(0.3, 0.6, p)} tint={`${Math.round(mix(181, 120, p))},${Math.round(mix(138, 118, p))},${Math.round(mix(92, 116, p))}`} /><Vignette a={0.6} />
    <div style={{ position: "absolute", top: 235, left: 60, right: 160, display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
      {words.map(([label, w, nth]) => { const st = W(4, w, nth); const k = ss(st - 0.1, st + 0.25, t); return <div key={label} style={{ opacity: k, transform: `translateX(${(1 - k) * 60}px)`, background: `${c.bgDeep}E0`, border: `4px solid ${c.coral}`, borderRadius: 22, padding: "8px 34px", fontFamily: HEADING, fontWeight: 800, fontSize: 60, color: c.text, letterSpacing: 2 }}>{label}</div>; })}
    </div>
  </>;
};

/* ---------- 5: the children ---------- */
const S5: React.FC<{ t: number }> = ({ t }) => {
  const s = CUTS[5], delhi = W(5, "fortythree"), vill = W(5, "twentyfive");
  const lit = (i: number, start: number, share: number) => { const k = ss(start + i * 0.012, start + i * 0.012 + 0.2, t); return i < Math.floor(share) ? k : i === Math.floor(share) ? k * (share % 1) : 0; };
  const fig = (i: number, x0: number, start: number, share: number) => { const col = i % 5, row = Math.floor(i / 5); return { x: x0 + (col - 2) * 0.34, z: -row * 0.36, a: lit(i, start, share) }; };
  const h = head(t), push = ss(s, CUTS[6], t);
  const body = (i: number, x0: number, start: number, share: number, d: THREE.Object3D, col: THREE.Color, hd: boolean) => { const f = fig(i, x0, start, share); d.position.set(f.x, hd ? 0.47 : 0.2, f.z); d.scale.set(hd ? 0.1 : 0.13, hd ? 0.1 : 0.4, hd ? 0.1 : 0.13); col.set(hexMix("#D6DCE6", P.coral, f.a)); };
  return <>
    <Stage haze={0.7} ground="#26221f" fog={[10, 70]}>
      <Camera pos={[mix(0.6, 0.3, push) + h.sx, mix(3.4, 3.0, push) + h.sy, mix(6.2, 5.4, push)]} look={[0, 0.3, -1.6]} fov={46} />
      <Hero t={t} position={[-0.1, 0, 1.5]} rotation={[0, Math.PI - 0.25, 0]} mask={1} tone="#6e6a66" skin={P.skinGray} pose="idle" expression="worried" look={[0, 0]} />
      <Instances count={100} dep={Math.round(t * 30)} fill={(i, d, col) => body(i, -1.25, delhi, 43.5, d, col, false)}><capsuleGeometry args={[0.5, 0.6, 4, 10]} /><meshStandardMaterial roughness={0.5} emissive="#2a0a10" emissiveIntensity={0.25} /></Instances>
      <Instances count={100} dep={Math.round(t * 30)} fill={(i, d, col) => body(i, -1.25, delhi, 43.5, d, col, true)}><sphereGeometry args={[0.5, 12, 10]} /><meshStandardMaterial roughness={0.5} /></Instances>
      <Instances count={100} dep={Math.round(t * 30) + 1} fill={(i, d, col) => body(i, 1.25, vill, 25.7, d, col, false)}><capsuleGeometry args={[0.5, 0.6, 4, 10]} /><meshStandardMaterial roughness={0.5} emissive="#2a0a10" emissiveIntensity={0.25} /></Instances>
      <Instances count={100} dep={Math.round(t * 30) + 1} fill={(i, d, col) => body(i, 1.25, vill, 25.7, d, col, true)}><sphereGeometry args={[0.5, 12, 10]} /><meshStandardMaterial roughness={0.5} /></Instances>
    </Stage>
    <Lens a={0.42} /><Vignette a={0.55} />
    <div style={{ position: "absolute", top: 232, left: 60, right: 160, display: "flex", justifyContent: "center", gap: 20 }}>
      <div style={{ flex: 1, textAlign: "center", opacity: ss(W(5, "delhi") - 0.1, W(5, "delhi") + 0.2, t) }}><div style={{ fontFamily: BODY, fontWeight: 800, fontSize: 40, color: c.text, letterSpacing: 3 }}>DELHI</div><div style={{ fontFamily: HEADING, fontWeight: 800, fontSize: 96, color: c.coral, opacity: ss(delhi, delhi + 0.4, t) }}>43.5%</div></div>
      <div style={{ flex: 1, textAlign: "center", opacity: ss(vill - 0.3, vill, t) }}><div style={{ fontFamily: BODY, fontWeight: 800, fontSize: 40, color: c.text, letterSpacing: 3 }}>VILLAGES</div><div style={{ fontFamily: HEADING, fontWeight: 800, fontSize: 96, color: c.cyan }}>25.7%</div></div>
    </div>
    <Tag t={t} text="REDUCED LUNG FUNCTION · 2008 SURVEY" start={delhi} top={410} />
  </>;
};

/* ---------- 6: the hourglass ---------- */
const S6: React.FC<{ t: number }> = ({ t }) => {
  const a = W(6, "lose"), b = W(6, "life") + 0.4, p = ss(a, b, t), h = head(t);
  const bulb = useMemo(() => new THREE.LatheGeometry([[0.0, 0.0], [0.34, 0.02], [0.5, 0.28], [0.5, 0.6], [0.04, 1.02], [0.04, 1.05]].map((q) => new THREE.Vector2(q[0], q[1])), 36), []);
  return <>
    <Stage haze={0.85} ground="#2b2622" fog={[3, 22]}>
      <Camera pos={[0.1 + h.sx, 1.6 + h.sy, 5.6]} look={[0.05, 1.15, -0.6]} fov={44} />
      <Hero t={t} position={[-0.7, 0, 0.4]} rotation={[0, 0.45, 0]} mask={1} tone="#6e6a66" skin={P.skinGray} {...poseAt(t, [[CUTS[6], "idle"], [W(6, "eight") - 0.3, "present"]])} expression="worried" look={[0.7, 0.1]} />
      <group position={[0.78, 0.74, -0.8]} rotation={[0, t * 0.35, 0]} scale={0.78}>
        <mesh position={[0, 0.74 - 0.77, 0]}><cylinderGeometry args={[0.001, 0.001, 0.001, 4]} /><meshBasicMaterial visible={false} /></mesh>
        <mesh position={[0, -0.03, 0]} castShadow><cylinderGeometry args={[0.7, 0.7, 0.06, 36]} /><meshStandardMaterial color="#5a3c24" roughness={0.5} /></mesh>
        <mesh position={[0, 1.98, 0]} castShadow><cylinderGeometry args={[0.7, 0.7, 0.06, 36]} /><meshStandardMaterial color="#5a3c24" roughness={0.5} /></mesh>
        {[0, 1, 2].map((k) => <mesh key={k} position={[Math.cos(k * 2.094) * 0.62, 1.0, Math.sin(k * 2.094) * 0.62]} castShadow><cylinderGeometry args={[0.025, 0.025, 2, 8]} /><meshStandardMaterial color="#8a6a40" metalness={0.5} roughness={0.4} /></mesh>)}
        <mesh geometry={bulb} position={[0, 0.06, 0]}><meshPhysicalMaterial color="#cfe6f2" transparent opacity={0.28} roughness={0.05} side={THREE.DoubleSide} /></mesh>
        <mesh geometry={bulb} position={[0, 1.94, 0]} rotation={[Math.PI, 0, 0]}><meshPhysicalMaterial color="#cfe6f2" transparent opacity={0.28} roughness={0.05} side={THREE.DoubleSide} /></mesh>
        <mesh position={[0, 0.06 + 0.02 + 0.3 * p, 0]} scale={[0.36 * (0.4 + p * 0.6), 0.04 + 0.5 * p, 0.36 * (0.4 + p * 0.6)]}><coneGeometry args={[1, 1, 28]} /><meshStandardMaterial color="#F2C14E" emissive="#7a5200" emissiveIntensity={0.35} roughness={0.9} /></mesh>
        <mesh position={[0, 1.94 - 0.3, 0]} scale={[0.46 * (1 - p * 0.9), 0.55 * (1 - p), 0.46 * (1 - p * 0.9)]}><cylinderGeometry args={[1, 1, 1, 28]} /><meshStandardMaterial color="#F2C14E" emissive="#7a5200" emissiveIntensity={0.35} roughness={0.9} /></mesh>
        {p > 0.01 && p < 0.99 ? <mesh position={[0, 0.98, 0]}><cylinderGeometry args={[0.012, 0.012, 0.9, 8]} /><meshBasicMaterial color="#F6D27A" /></mesh> : null}
      </group>
    </Stage>
    <Lens a={0.42} tint="140,125,110" /><Vignette a={0.6} />
    <Label t={t} text={`−${(8.2 * p).toFixed(1)} YEARS`} start={W(6, "eight") - 0.15} size={128} color={c.coral} />
    <Tag t={t} text="LONG-TERM DELHI AVERAGE · AQLI ESTIMATE" start={W(6, "eight")} top={430} />
  </>;
};

/* ---------- 7: a wall of dots ---------- */
const S7: React.FC<{ t: number }> = ({ t }) => {
  const s = CUTS[7], a = W(7, "over"), b = W(7, "deaths") + 0.5, p = ss(a, b, t), n = Math.round(1718 * p), h = head(t), push = ss(s, CUTS[8], t), COLS = 40;
  return <>
    <Stage haze={0.6} ground="#1d1b1a" fog={[10, 60]}>
      <Camera pos={[0.2 + h.sx, 1.2 + h.sy, mix(7.4, 6.4, push)]} look={[0, 1.95, 0]} fov={40} />
      <Hero t={t} position={[0.5, 0, 2.7]} rotation={[0, Math.PI + 0.25, 0]} mask={1} tone="#6e6a66" skin={P.skinGray} pose="idle" expression="worried" look={[0, 0]} />
      <mesh position={[0, 1.78, -0.08]}><boxGeometry args={[3.2, 3.55, 0.05]} /><meshStandardMaterial color="#14171f" roughness={0.8} /></mesh>
      <Instances count={1718} dep={n} fill={(i, d, col) => { const cc = i % COLS, rr = Math.floor(i / COLS), on = i < n ? 1 : 0; d.position.set((cc - (COLS - 1) / 2) * 0.075, 0.12 + rr * 0.075, 0); d.scale.setScalar(0.026 * on); col.set(rr % 2 ? "#FB7185" : "#F4F7FB"); }}>
        <sphereGeometry args={[1, 10, 8]} /><meshStandardMaterial roughness={0.4} emissive="#5a1020" emissiveIntensity={0.5} />
      </Instances>
    </Stage>
    <Lens a={0.3} tint="120,110,100" /><Vignette a={0.5} />
    <div style={{ position: "absolute", top: 225, left: 60, right: 160, textAlign: "center", opacity: ss(W(7, "india") - 0.2, W(7, "india") + 0.1, t) }}>
      <div style={{ fontFamily: HEADING, fontWeight: 800, fontSize: 118, whiteSpace: "nowrap", color: c.coral, textShadow: "0 5px 30px rgba(0,0,0,.9)" }}>{(1.718 * p).toFixed(1)} MILLION</div>
      <div style={{ fontFamily: BODY, fontWeight: 800, fontSize: 40, color: c.text, textShadow: "0 2px 14px rgba(0,0,0,.95)" }}>DEATHS LINKED TO PM2.5 · INDIA, 2022</div>
    </div>
    <Tag t={t} text="1 DOT = 1,000 DEATHS" start={a} top={440} />
  </>;
};

/* ---------- 8: day 365, the mask comes off ---------- */
const S8: React.FC<{ t: number }> = ({ t }) => {
  const off = ss(W(8, "clean") + 0.2, W(8, "luxury") + 0.5, t), clear = ss(W(8, "luxury") - 0.4, CUTS[9], t), h = head(t), skin = hexMix(P.skinGray, P.skin, clear);
  const fall = ss(W(8, "luxury") + 0.2, W(8, "luxury") + 0.9, t);
  return <>
    <Stage haze={1 - clear} blue={clear * 0.7}>
      <Camera pos={[0.4 + h.sx, 1.5 + h.sy, 3.9]} look={[0, 1.35, 0]} fov={38} />
      <City />
      <Hero t={t} skin={skin} mask={fall < 0.99 ? 1 : 0} tone="#8a8682" drop={off * 0.05 + fall * 1.3} {...poseAt(t, [[CUTS[8], "idle"], [W(8, "clean") + 0.1, "think"], [W(8, "luxury") + 0.9, "idle"]])} expression={clear > 0.4 ? "smile" : "worried"} look={[0, clear * 0.5]} />
      <Specks t={t} cam={[0, 1.5, 1.5]} n={80} />
    </Stage>
    <Lens a={0.4 * (1 - clear)} /><Vignette a={mix(0.55, 0.3, clear)} />
    <Label t={t} text="CLEAN AIR ISN'T A LUXURY" start={W(8, "clean") - 0.05} size={78} color={c.text} />
  </>;
};

/* ---------- 9: blue sky ---------- */
const S9: React.FC<{ t: number }> = ({ t }) => {
  const s = CUTS[9], h = head(t), up = ss(s, s + 1.4, t);
  const clouds = useMemo(() => { const r = rng(40); return Array.from({ length: 26 }, () => ({ x: (r() - 0.5) * 30, y: 8 + r() * 12, z: -14 - r() * 30, s: 2 + r() * 4 })); }, []);
  return <>
    <Stage haze={0} blue={1} fog={[20, 80]}>
      <Camera pos={[0.15 + h.sx, mix(1.0, 0.7, up) + h.sy, 3.9]} look={[0, mix(1.35, 1.75, up), 0]} fov={46} />
      <Hero t={t} pose="idle" expression="smile" look={[0, 0.9]} />
      {clouds.map((q, i) => <mesh key={i} position={[q.x, q.y, q.z]} scale={[q.s * 1.6, q.s * 0.5, q.s]}><sphereGeometry args={[1, 14, 10]} /><meshBasicMaterial color="#ffffff" transparent opacity={0.88} fog={false} /></mesh>)}
      <mesh position={[-14, 22, -60]}><sphereGeometry args={[4, 20, 16]} /><meshBasicMaterial color="#fff6c8" toneMapped={false} fog={false} /></mesh>
    </Stage>
    <Vignette a={0.28} />
    <Label t={t} text="WOULD YOU MOVE FOR CLEANER AIR?" start={W(9, "would") - 0.1} size={80} color={c.amber} />
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

const SCENES = [S0, S1, S2, S3, S4, S5, S6, S7, S8, S9];
export const AqiYear: React.FC = () => {
  const t = useCurrentFrame() / FPS; let i = 0;
  for (let k = 0; k < SCENES.length; k++) if (t >= CUTS[k]) i = k;
  const Scene = SCENES[i];
  // Soft dips between scenes; the body fly-through starts and ends on a cut.
  const dip = i >= 1 ? Math.max(1 - clamp((t - CUTS[i]) / 0.2), i < 9 && i !== 1 && i !== 2 ? ss(CUTS[i + 1] - 0.14, CUTS[i + 1], t) : 0) : 0;
  return <AbsoluteFill style={{ background: "#03060E" }}>
    <Scene t={t} />
    {dip > 0 && i !== 2 ? <AbsoluteFill style={{ background: "#03060E", opacity: dip }} /> : null}
    <Captions t={t} />
  </AbsoluteFill>;
};

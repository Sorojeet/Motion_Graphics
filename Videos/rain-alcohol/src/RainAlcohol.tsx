import React, { useLayoutEffect, useMemo, useRef } from "react";
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { NarrationCaptions } from "../../../Assets/remotion/components/text";
import { BODY, HEADING } from "../../../Assets/remotion/theme";
import { Camera, Glow, Hand, Instances, Sky, clamp, mix, noise, rng, ss } from "../../../Assets/remotion/three/kit";
import data from "../narration.json";

// Colors for this video only.
const P = { ice: "#BDEBFF", cyan: "#7FE3E0", red: "#FF5A4F", amber: "#F2B04A", bone: "#F4F1EA", blue: "#6FA8FF" };
export const TOTAL = 2340, FPS = 30;
export const CUTS = [0, 5.67, 13.1, 22.78, 31.39, 39.87, 50.19, 59.4, 67.74, 78];

/** Time a narration word is spoken, within beat `b`. */
export const W = (b: number, word: string) => {
  const beat = data.beats[b];
  for (const ch of data.chunks) for (const w of ch.words) if (w.start >= beat.start - 0.01 && w.end <= beat.end + 0.01 && w.text.replace(/\W/g, "").toLowerCase() === word.toLowerCase()) return w.start;
  throw new Error(`No word ${word} in beat ${b}`);
};
const useT = () => useCurrentFrame() / FPS;
const hex = (a: string, b: string, t: number) => "#" + new THREE.Color(a).lerp(new THREE.Color(b), clamp(t)).getHexString();

const Canvas3D: React.FC<{ children: React.ReactNode; fog?: [string, number, number] }> = ({ children, fog }) => {
  const { width, height } = useVideoConfig();
  return <ThreeCanvas width={width} height={height} shadows gl={{ antialias: true, preserveDrawingBuffer: true, toneMapping: THREE.ACESFilmicToneMapping }}>
    {fog ? <fog attach="fog" args={fog} /> : null}{children}
  </ThreeCanvas>;
};
const Sun: React.FC<{ intensity?: number; color?: string }> = ({ intensity = 1.5, color = "#e8f0f2" }) =>
  <directionalLight position={[-14, 26, 12]} color={color} intensity={intensity} castShadow shadow-mapSize={[1024, 1024]} shadow-camera-left={-30} shadow-camera-right={30} shadow-camera-top={30} shadow-camera-bottom={-30} shadow-camera-far={90} shadow-bias={-0.0006} />;

/* ---------- Overlays ---------- */
const Grade: React.FC<{ flash?: number; flashColor?: string; tint?: string; tintA?: number; black?: number }> = ({ flash = 0, flashColor = "#fff", tint, tintA = 0, black = 0 }) => <AbsoluteFill style={{ pointerEvents: "none" }}>
  {tint ? <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 45%, transparent 35%, ${tint} 100%)`, opacity: tintA }} /> : null}
  <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, transparent 50%, rgba(4,10,16,.6) 100%)" }} />
  <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(4,10,16,.66) 0%, rgba(4,10,16,0) 34%)" }} />
  {black > 0 ? <AbsoluteFill style={{ background: "#000", opacity: black }} /> : null}
  {flash > 0 ? <AbsoluteFill style={{ background: flashColor, opacity: flash }} /> : null}
</AbsoluteFill>;
const Label: React.FC<{ text: string; sub?: string; at?: number; size?: number; color?: string; out?: number }> = ({ text, sub, at = 0.2, size = 78, color = P.bone, out = 1e9 }) => {
  const t = useT(), k = ss(at, at + 0.3, t) * (1 - ss(out, out + 0.3, t));
  return <div style={{ position: "absolute", top: 240, left: 70, right: 170, textAlign: "center", opacity: k, transform: `translateY(${(1 - k) * 22}px)` }}>
    <div style={{ fontFamily: HEADING, fontWeight: 800, fontSize: size, lineHeight: 1.08, color, letterSpacing: 1, textShadow: "0 4px 26px rgba(0,0,0,.8)" }}>{text}</div>
    {sub ? <div style={{ marginTop: 16, fontFamily: BODY, fontWeight: 600, fontSize: 34, color: P.bone, textShadow: "0 2px 14px rgba(0,0,0,.95)" }}>{sub}</div> : null}
  </div>;
};

/* ---------- Effects ---------- */
const softTex = () => {
  const c = document.createElement("canvas"); c.width = c.height = 128; const x = c.getContext("2d")!;
  const g = x.createRadialGradient(64, 64, 2, 64, 64, 62); g.addColorStop(0, "rgba(255,255,255,1)"); g.addColorStop(0.45, "rgba(255,255,255,.45)"); g.addColorStop(1, "rgba(255,255,255,0)");
  x.fillStyle = g; x.fillRect(0, 0, 128, 128); return new THREE.CanvasTexture(c);
};
/** Soft camera-facing sprites for vapor, steam, flame and cloud. */
const Sprites: React.FC<{ count: number; dep: unknown; additive?: boolean; opacity?: number; fill: (i: number, d: THREE.Object3D, c: THREE.Color) => void }> = ({ count, dep, additive, opacity = 0.3, fill }) => {
  const tex = useMemo(softTex, []); const cam = useThree((s) => s.camera);
  return <Instances count={count} dep={dep} fill={(i, d, c) => { fill(i, d, c); d.quaternion.copy(cam.quaternion); }}>
    <planeGeometry args={[1, 1]} /><meshBasicMaterial map={tex} transparent opacity={opacity} depthWrite={false} fog={false} toneMapped={false} blending={additive ? THREE.AdditiveBlending : THREE.NormalBlending} />
  </Instances>;
};
/** Rain streaks around the camera. `rt` can run slower than real time. */
const Rain: React.FC<{ rt: number; at: number[]; count?: number; color?: string; opacity?: number }> = ({ rt, at, count = 1500, color = "#d8f2ff", opacity = 0.42 }) => {
  const d0 = useMemo(() => { const r = rng(17); return Array.from({ length: count }, () => ({ x: (r() - 0.5) * 26, z: (r() - 0.5) * 30, p: r(), v: 0.75 + r() * 0.4, s: 0.5 + r() * 0.7 })); }, [count]);
  const cam = useThree((s) => s.camera);
  return <Instances count={count} dep={`${rt}${at.join()}`} fill={(i, d, c) => { const q = d0[i], u = (q.p + rt * q.v) % 1; d.position.set(at[0] + q.x + (1 - u) * 1.1, (1 - u) * 16, at[2] + q.z); d.rotation.set(0, 0, 0.07); const near = d.position.distanceTo(cam.position) < 2.2; d.scale.set(near ? 0 : 0.012, near ? 0 : q.s, near ? 0 : 0.012); c.set(color); }}>
    <boxGeometry args={[1, 1, 1]} /><meshBasicMaterial transparent opacity={opacity} depthWrite={false} fog={false} toneMapped={false} />
  </Instances>;
};
const Rings: React.FC<{ t: number; at: number[]; count?: number; y?: number; spread?: number; color?: string }> = ({ t, at, count = 220, y = 0.03, spread = 22, color = "#a9d8ee" }) => {
  const d0 = useMemo(() => { const r = rng(5); return Array.from({ length: count }, () => ({ x: (r() - 0.5) * spread, z: (r() - 0.5) * spread, p: r() })); }, [count, spread]);
  return <Instances count={count} dep={t} fill={(i, d, c) => { const q = d0[i], u = (q.p + t * 1.4) % 1; d.position.set(at[0] + q.x, y, at[2] + q.z); d.rotation.x = -Math.PI / 2; d.scale.setScalar(0.03 + u * 0.34); c.set(color).multiplyScalar(1 - u); }}>
    <ringGeometry args={[0.8, 1, 18]} /><meshBasicMaterial blending={THREE.AdditiveBlending} transparent depthWrite={false} fog={false} toneMapped={false} />
  </Instances>;
};

/* ---------- The street ---------- */
const Car: React.FC<{ position: number[]; color: string; rotationY?: number; lights?: number; char?: number }> = ({ position, color, rotationY = 0, lights = 0, char = 0 }) => {
  const body = hex(color, "#131110", char), glass = hex("#22323c", "#0b0a0a", char);
  return <group position={position as any} rotation={[0, rotationY, 0]}>
    <mesh position={[0, 0.62, 0]} castShadow><boxGeometry args={[1.9, 0.62, 4.3]} /><meshStandardMaterial color={body} roughness={0.32} metalness={0.45} /></mesh>
    <mesh position={[0, 1.2, 0.2]} castShadow><boxGeometry args={[1.66, 0.58, 2.1]} /><meshStandardMaterial color={body} roughness={0.32} metalness={0.45} /></mesh>
    <mesh position={[0, 1.21, 1.27]}><boxGeometry args={[1.48, 0.44, 0.03]} /><meshStandardMaterial color={glass} roughness={0.12} metalness={0.5} /></mesh>
    <mesh position={[0, 1.21, -0.87]}><boxGeometry args={[1.48, 0.44, 0.03]} /><meshStandardMaterial color={glass} roughness={0.12} metalness={0.5} /></mesh>
    {[-1, 1].map((s) => <mesh key={s} position={[s * 0.84, 1.21, 0.2]}><boxGeometry args={[0.02, 0.42, 1.8]} /><meshStandardMaterial color={glass} roughness={0.12} /></mesh>)}
    {[-0.98, 0.98].flatMap((x) => [-1.35, 1.35].map((z) => <mesh key={`${x}${z}`} position={[x, 0.34, z]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.34, 0.34, 0.22, 16]} /><meshStandardMaterial color="#0e0f11" /></mesh>))}
    {[-0.65, 0.65].map((x) => <mesh key={x} position={[x, 0.72, 2.16]}><boxGeometry args={[0.42, 0.14, 0.03]} /><meshBasicMaterial color={lights > 0 ? "#ff3b2e" : "#50211c"} toneMapped={false} /></mesh>)}
  </group>;
};
export type StreetProps = { dry?: number; scorch?: number; extras?: React.ReactNode; zEnd?: number };
const Street: React.FC<StreetProps> = ({ dry = 0, scorch = 0, extras }) => {
  const b = useMemo(() => { const r = rng(21), out: { x: number; z: number; w: number; h: number; d: number; c: string }[] = []; const pal = ["#667079", "#7a6f66", "#59636c", "#8b7f70", "#6d6a70", "#4f5962"]; for (const s of [-1, 1]) { let z = 5; while (z > -170) { const d = 9 + r() * 7, w = 10; out.push({ x: s * (8 + w / 2), z: z - d / 2, w, h: 9 + r() * 20, d: d - 0.5, c: pal[Math.floor(r() * 6)] }); z -= d; } } return out; }, []);
  const win = useMemo(() => { const out: { x: number; y: number; z: number; ry: number; lit: boolean }[] = []; const r = rng(4); for (const q of b) { const s = Math.sign(q.x); for (let y = 2.2; y < q.h - 1; y += 3) for (let z = q.z - q.d / 2 + 1.2; z < q.z + q.d / 2 - 0.8; z += 2.3) out.push({ x: q.x - s * (q.w / 2 + 0.02), y, z, ry: s > 0 ? -Math.PI / 2 : Math.PI / 2, lit: r() < 0.28 }); } return out; }, [b]);
  const trees = useMemo(() => { const r = rng(9), out: { x: number; z: number; h: number; s: number; k: number }[] = []; for (const s of [-1, 1]) for (let z = -3; z > -150; z -= 11) out.push({ x: s * 6.4, z: z + r() * 2, h: 4.8 + r() * 1.8, s: 0.9 + r() * 0.5, k: r() }); return out; }, []);
  const puddles = useMemo(() => { const r = rng(33); return Array.from({ length: 34 }, () => ({ x: (r() - 0.5) * 9, z: 4 - r() * 80, a: 0.6 + r() * 1.9, b: 0.4 + r() * 1 })); }, []);
  const road = hex("#3b4247", "#25221f", scorch), walk = hex("#6a6f70", "#1d1b1a", scorch);
  const cScale = 1 - ss(0.25, 0.9, scorch);
  return <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -80]} receiveShadow><planeGeometry args={[12, 200]} /><meshStandardMaterial color={road} roughness={0.42} metalness={0.15} /></mesh>
    {[-1, 1].map((s) => <mesh key={s} position={[s * 7, 0.08, -80]} receiveShadow><boxGeometry args={[2.4, 0.16, 200]} /><meshStandardMaterial color={walk} roughness={0.8} /></mesh>)}
    <Instances count={20} fill={(i, d) => { d.position.set(0, 0.012, 2 - i * 8); d.scale.set(0.16, 0.01, 3.4); }}><boxGeometry args={[1, 1, 1]} /><meshStandardMaterial color={hex("#c9c7bb", "#2a2826", scorch)} /></Instances>
    {puddles.map((p, i) => <mesh key={i} position={[p.x, 0.018, p.z]} rotation={[-Math.PI / 2, 0, 0]} scale={[p.a, p.b, 1]}><circleGeometry args={[1, 24]} /><meshStandardMaterial color={hex("#8fa3ad", "#2b2a2a", scorch)} roughness={0.08} metalness={0.8} /></mesh>)}
    <Instances count={b.length} dep={scorch} castShadow receiveShadow fill={(i, d, c) => { const q = b[i]; d.position.set(q.x, q.h / 2, q.z); d.scale.set(q.w, q.h, q.d); c.set(q.c).lerp(new THREE.Color("#1c1917"), scorch * 0.7); }}><boxGeometry args={[1, 1, 1]} /><meshStandardMaterial roughness={0.9} /></Instances>
    <Instances count={win.length} dep={scorch} fill={(i, d, c) => { const q = win[i]; d.position.set(q.x, q.y, q.z); d.rotation.y = q.ry; d.scale.set(1.25, 1.65, 1); c.set(q.lit && scorch < 0.2 ? "#f0d7a2" : "#28333a").lerp(new THREE.Color("#050505"), scorch); }}><planeGeometry args={[1, 1]} /><meshBasicMaterial /></Instances>
    <Instances count={trees.length} dep={scorch} castShadow fill={(i, d, c) => { const q = trees[i]; d.position.set(q.x, q.h / 2, q.z); d.scale.set(q.s, q.h, q.s); c.set("#3b2c22").lerp(new THREE.Color("#0b0a09"), scorch); }}><cylinderGeometry args={[0.12, 0.24, 1, 8]} /><meshStandardMaterial roughness={1} /></Instances>
    {cScale > 0.02 ? <Instances count={trees.length * 3} dep={`${dry}${cScale}`} castShadow fill={(i, d, c) => { const q = trees[Math.floor(i / 3)], k = i % 3, o = [[0, 0, 0], [0.9, -0.8, 0.5], [-0.8, -0.9, -0.6]][k], s = (2 - k * 0.3) * q.s * cScale * mix(1, 0.86, dry); d.position.set(q.x + o[0] * q.s, q.h + o[1] * q.s, q.z + o[2] * q.s); d.scale.set(s, s * 0.88, s); d.rotation.set(q.k * 3, k, 0); c.set(["#4f8f42", "#3e7f3a", "#62a04b"][k]).lerp(new THREE.Color(["#7a4c22", "#5e3a1c", "#92602a"][k]), ss(q.k * 0.45, q.k * 0.45 + 0.55, dry)); }}><icosahedronGeometry args={[1, 1]} /><meshStandardMaterial flatShading roughness={0.9} /></Instances> : null}
    <Instances count={22} fill={(i, d) => { d.position.set(i % 2 ? 5.6 : -5.6, 3, -8 - i * 11); d.scale.set(0.09, 6, 0.09); }}><cylinderGeometry args={[1, 1, 1, 8]} /><meshStandardMaterial color="#2a2f33" /></Instances>
    <Car position={[-2.6, 0, -13]} color="#8e2f2b" char={scorch} />
    <Car position={[2.8, 0, -21]} color="#d8dadb" char={scorch} />
    <Car position={[-2.8, 0, -34]} color="#2e5e8c" char={scorch} />
    {extras}
  </group>;
};
const Limb: React.FC<{ a: number[]; b: number[]; r: number; color: string }> = ({ a, b, r, color }) => {
  const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), v = B.clone().sub(A), q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), v.clone().normalize());
  return <mesh position={A.clone().add(B).multiplyScalar(0.5)} quaternion={q} castShadow><capsuleGeometry args={[r, v.length(), 5, 10]} /><meshStandardMaterial color={color} roughness={0.75} /></mesh>;
};
/** Neighbor holding a cup up to the rain. */
const Person: React.FC<{ position: number[]; shirt: string; skin: string; pants: string; hair: string; t: number; rotationY?: number; phase?: number; cupUp?: number }> = ({ position, shirt, skin, pants, hair, t, rotationY = 0, phase = 0, cupUp = 1 }) => {
  const bob = Math.abs(Math.sin(t * 3.4 + phase)) * 0.06, sw = Math.sin(t * 3.4 + phase) * 0.06, hx = 0.43 + sw, hy = mix(1.1, 2.03, cupUp) + bob;
  return <group position={position as any} rotation={[0, rotationY, 0]}>
    <Limb a={[-0.14, 0.9, 0]} b={[-0.17, 0.08, 0]} r={0.085} color={pants} /><Limb a={[0.14, 0.9, 0]} b={[0.17, 0.08, 0]} r={0.085} color={pants} />
    <group position={[0, bob, 0]}>
      <mesh position={[0, 1.22, 0]} scale={[1, 1, 0.68]} castShadow><capsuleGeometry args={[0.24, 0.42, 6, 14]} /><meshStandardMaterial color={shirt} roughness={0.85} /></mesh>
      <mesh position={[0, 1.76, 0]} castShadow><sphereGeometry args={[0.17, 18, 14]} /><meshStandardMaterial color={skin} roughness={0.7} /></mesh>
      <mesh position={[0, 1.83, -0.02]} scale={[1.05, 0.72, 1.05]}><sphereGeometry args={[0.17, 18, 12]} /><meshStandardMaterial color={hair} roughness={0.9} /></mesh>
    </group>
    <Limb a={[-0.28, 1.42 + bob, 0]} b={[-0.42, 0.95, 0.04]} r={0.065} color={shirt} />
    <Limb a={[0.28, 1.42 + bob, 0]} b={[hx, hy - 0.05, 0.1]} r={0.065} color={shirt} />
    <mesh position={[hx, hy + 0.1, 0.1]} castShadow><cylinderGeometry args={[0.075, 0.055, 0.2, 14]} /><meshStandardMaterial color="#e8473f" roughness={0.4} /></mesh>
  </group>;
};

/* ---------- Scene 1: hook ---------- */
const S1: React.FC = () => {
  const t = useT(), out = ss(0.1, 1.5, t);
  return <AbsoluteFill><Canvas3D fog={["#a9b6bb", 26, 135]}>
    <Sky top="#7f929d" horizon="#d4dbd8" />
    <Camera pos={[0.02 + Math.sin(t * 2) * 0.02, 1.7 + Math.sin(t * 6.8) * 0.03 * (1 - ss(1.3, 2, t)), mix(9, 2.5, out)]} look={[Math.sin(t * 0.5) * 0.5, mix(1.65, 3.8, ss(1.6, 4.6, t)), -22]} fov={60} />
    <hemisphereLight args={["#e6f1f6", "#4a5258", 1.8]} /><Sun />
    <group position={[0, 0, 6.2]}>
      <mesh position={[-3.4, 3, 0]}><boxGeometry args={[5, 6, 0.3]} /><meshStandardMaterial color="#2c3338" /></mesh>
      <mesh position={[3.4, 3, 0]}><boxGeometry args={[5, 6, 0.3]} /><meshStandardMaterial color="#2c3338" /></mesh>
      <mesh position={[0, 5.2, 0]}><boxGeometry args={[2, 1.6, 0.3]} /><meshStandardMaterial color="#2c3338" /></mesh>
      <group position={[-0.9, 0, 0]} rotation={[0, -ss(0, 0.8, t) * 1.8, 0]}><mesh position={[0.9, 2.2, 0]}><boxGeometry args={[1.8, 4.4, 0.08]} /><meshStandardMaterial color="#50301d" /></mesh></group>
    </group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 9]}><planeGeometry args={[14, 8]} /><meshStandardMaterial color="#1a1c1e" /></mesh>
    <Street />
    <Rain rt={t * 1.8} at={[0, 0, mix(4, -4, out)]} /><Rings t={t} at={[0, 0, -6]} />
  </Canvas3D><Grade black={1 - ss(0, 0.15, t)} /><Label text="WHAT IF IT RAINED ALCOHOL?" sub="A hypothetical scenario" at={W(0, "What") - 0.2} /></AbsoluteFill>;
};

/* ---------- Scene 2: hand ---------- */
const S2: React.FC<{ off: number }> = ({ off }) => {
  const rel = useT(), t = rel + off, cold = ss(0.2, 4.2, rel);
  const drops = useMemo(() => { const r = rng(8); return Array.from({ length: 52 }, () => ({ x: (r() - 0.5) * 0.7, z: -0.55 + r() * 0.95, p: r(), s: 0.022 + r() * 0.03 })); }, []);
  const cam = [Math.sin(t * 0.9) * 0.02, 2.17 + Math.sin(t * 1.3) * 0.012, mix(2.9, 2.2, ss(0, 7, rel))];
  return <AbsoluteFill><Canvas3D fog={["#a9b6bb", 7, 95]}>
    <Sky top="#7f929d" horizon="#d4dbd8" />
    <Camera pos={cam} look={[0, 1.3, -0.1]} fov={46} />
    <hemisphereLight args={["#eaf5fb", "#4a5258", 2.1]} /><Sun intensity={1.8} />
    <group position={[0, 0, -3]}><Street /></group>
    <Hand grip={0.08} position={[0, 1.42, 0]} skin={hex("#c4906b", "#a8c6dc", cold * 0.6)} sleeve="#28384a" />
    <group position={[0, 1.42, 0]}><Instances count={drops.length} dep={t} fill={(i, d, c) => { const q = drops[i], u = (q.p + t * 0.72) % 1; const fall = 1 - ss(0, 0.1, u), life = u < 0.1 ? 1 : 1 - ss(0.14, 1, u); d.position.set(q.x, 0.14 + fall * 3, q.z); d.scale.set(q.s * life * (fall > 0 ? 0.65 : 1), q.s * life * (fall > 0 ? 2 : 0.6), q.s * life * (fall > 0 ? 0.65 : 1)); c.set("#dff5ff"); }}><sphereGeometry args={[1, 12, 10]} /><meshPhysicalMaterial roughness={0.06} clearcoat={1} metalness={0.1} transparent opacity={0.9} /></Instances></group>
    <Sprites count={70} dep={t} opacity={0.2} fill={(i, d, c) => { const r = rng(i + 40), x = (r() - 0.5) * 0.9, z = -0.65 + r() * 1.1, u = (r() + t * 0.42) % 1; d.position.set(x + Math.sin(t + i) * 0.05, 1.56 + u * 0.9, z); d.scale.setScalar((0.1 + u * 0.32) * (1 - u) * 1.8); c.set("#e8f8ff"); }} />
    <Rain rt={t * 1.8} at={[0, 0, -4]} count={900} />
  </Canvas3D><Grade tint="#7fc9ff" tintA={cold * 0.45} /><Label text="EVAPORATES FAST" color={P.ice} at={W(1, "Alcohol") - off - 0.1} size={70} /></AbsoluteFill>;
};

/* ---------- Scene 3: neighbors ---------- */
const S3: React.FC<{ off: number }> = ({ off }) => {
  const rel = useT(), t = rel + off, bad = W(2, "Bad") - off;
  const pan = ss(0, bad, rel), red = ss(bad, bad + 0.25, rel), pos = mix(-1.8, 1.8, pan);
  const hit = rel > bad ? Math.exp(-(rel - bad) * 8) * 0.05 : 0;
  return <AbsoluteFill><Canvas3D fog={["#a9b6bb", 24, 130]}>
    <Sky top="#7f929d" horizon="#d4dbd8" />
    <Camera pos={[pos * 0.3 + Math.sin(t * 41) * hit, 1.72 + Math.cos(t * 37) * hit, 3.6 - red * 1.2]} look={[pos, 1.75, -8]} fov={58} />
    <hemisphereLight args={["#e6f1f6", "#4a5258", 1.9]} /><Sun />
    <Street />
    <Person position={[-4.3, 0.16, -6.2]} rotationY={0.55} shirt="#e1b23f" pants="#25364c" skin="#8d5a3b" hair="#17110e" t={t} phase={0} />
    <Person position={[-1.7, 0, -4.6]} rotationY={0.22} shirt="#d7574c" pants="#3a3a44" skin="#c99672" hair="#27170f" t={t} phase={1.4} />
    <Person position={[0.8, 0, -5.8]} rotationY={-0.05} shirt="#51a79e" pants="#2d2d33" skin="#e3b08f" hair="#4f2f18" t={t} phase={2.6} />
    <Person position={[3.1, 0, -4.8]} rotationY={-0.35} shirt="#7e70c9" pants="#2c3b45" skin="#70472f" hair="#111" t={t} phase={3.6} />
    <Person position={[5.2, 0.16, -7]} rotationY={-0.6} shirt="#e88a3a" pants="#34424d" skin="#d9a27d" hair="#352012" t={t} phase={4.9} />
    <Rain rt={t * 1.8} at={[0, 0, -3]} /><Rings t={t} at={[0, 0, -5]} />
  </Canvas3D><Grade tint="#e0261f" tintA={red * 0.5} /><Label text="NOT A DRINK" at={bad} color={P.red} size={96} /></AbsoluteFill>;
};

/* ---------- Scene 4: leaf, then street ---------- */
const LeafMesh: React.FC<{ dry: number; wax: number }> = ({ dry, wax }) => {
  const geo = useMemo(() => { const g = new THREE.PlaneGeometry(1, 2, 90, 180); g.setAttribute("color", new THREE.BufferAttribute(new Float32Array(g.attributes.position.count * 3), 3)); g.userData.base = (g.attributes.position.array as Float32Array).slice(); return g; }, []);
  useLayoutEffect(() => {
    const p = geo.attributes.position, c = geo.attributes.color, base = geo.userData.base as Float32Array, g1 = new THREE.Color("#3e8f35"), g2 = new THREE.Color("#2c6d2a"), vein = new THREE.Color("#94c864"), br = new THREE.Color("#6e4120"), dk = new THREE.Color("#2f1c10"), k = new THREE.Color();
    for (let i = 0; i < p.count; i++) {
      const u = base[i * 3] * 2, y = base[i * 3 + 1], v = (y + 1) / 2, w = Math.pow(Math.sin(Math.PI * Math.pow(v, 0.8)), 0.75) * 0.5, x = u * w;
      const edge = Math.abs(u), n = noise(x * 5 + 3, y * 5), brown = ss(1.1 - dry * 1.55, 1.45 - dry * 1.55, edge * 0.8 + n * 0.55);
      const side = Math.abs(((y - Math.abs(x) * 0.9) * 6) % 1 - 0.5);
      k.copy(g1).lerp(g2, noise(x * 3, y * 3)); if (edge < 0.035) k.lerp(vein, 0.9); else if (side < 0.05) k.lerp(vein, 0.3 * (1 - side / 0.05));
      k.lerp(br, brown).lerp(dk, ss(0.72, 0.95, n) * brown * 0.8); c.setXYZ(i, k.r, k.g, k.b);
      const curl = dry * 0.42 * u * u + (noise(x * 4, y * 4) - 0.5) * 0.07 * (0.2 + dry) + Math.sin(y * 1.5) * 0.05; p.setXYZ(i, x, y, curl);
    }
    p.needsUpdate = true; c.needsUpdate = true; geo.computeVertexNormals();
  }, [dry, geo]);
  return <mesh geometry={geo}><meshPhysicalMaterial vertexColors side={THREE.DoubleSide} roughness={mix(0.8, 0.26, wax)} clearcoat={wax} clearcoatRoughness={0.12} /></mesh>;
};
const S4: React.FC<{ off: number }> = ({ off }) => {
  const rel = useT(), t = rel + off, a = W(3, "strips") - off, b = W(3, "brown") - off;
  const dry = ss(a, b, rel), wax = 1 - ss(a, a + 2, rel), back = ss(b - 2.4, b + 0.55, rel);
  const leaf = [4.1, 2.9, -2.6];
  const pos = [mix(leaf[0] - 0.05, 0, back), mix(leaf[1] + 0.02, 1.7, back), mix(leaf[2] + 1.75, 5.5, back)];
  const look = [mix(leaf[0], 0, back), mix(leaf[1], 4.5, back), mix(leaf[2], -32, back)];
  return <AbsoluteFill><Canvas3D fog={["#aeb6b3", 22, 130]}>
    <Sky top="#7c8c96" horizon="#d4d4c9" />
    <Camera pos={pos} look={look} fov={50} />
    <hemisphereLight args={["#ecf5f8", "#4a5258", 1.9]} /><Sun intensity={1.8} />
    <Street dry={dry} />
    <group position={leaf as any} rotation={[-0.08, 0, -0.26]} scale={0.5}><LeafMesh dry={dry} wax={wax} /></group>
    <mesh position={[leaf[0] + 0.28, leaf[1] - 0.96, leaf[2] - 0.02]} rotation={[0, 0, -0.26]}><cylinderGeometry args={[0.012, 0.018, 0.5, 8]} /><meshStandardMaterial color="#3f2c1a" /></mesh>
    <Instances count={30} dep={wax} fill={(i, d, c) => { const r = rng(i + 200), v = r() * 1.7 - 0.85, x = (r() - 0.5) * 0.42; d.position.set(leaf[0] + x + v * 0.13, leaf[1] + v * 0.45, leaf[2] + 0.04); const s = (0.012 + r() * 0.016) * (0.25 + wax * 0.75); d.scale.set(s, s, s * 0.55); c.set("#d9f2ff"); }}><sphereGeometry args={[1, 10, 8]} /><meshPhysicalMaterial roughness={0.05} clearcoat={1} transparent opacity={0.85} /></Instances>
    <Glow count={70} t={t} size={0.012} path={(i, q) => { const r = rng(i + 300), v = r() * 1.7 - 0.85, x = (r() - 0.5) * 0.42, k = (r() + q * 0.5) % 1; return { p: [leaf[0] + x + v * 0.13, leaf[1] + v * 0.45 + k * 0.4, leaf[2] + 0.05 + k * 0.2], a: (1 - k) * ss(a, a + 0.3, q - off) * wax, color: P.cyan }; }} />
    <Rain rt={t * 1.8} at={[pos[0], 0, pos[2] - 7]} count={1100} opacity={0.3} />
  </Canvas3D><Grade /><Label text="WAX STRIPPED" color={P.cyan} at={a} out={b - 0.4} size={68} /><Label text="ILLUSTRATIVE TIMING" size={42} color={P.amber} at={b - 0.35} /></AbsoluteFill>;
};

/* ---------- Scene 5: river ---------- */
const O2Meter: React.FC<{ v: number; k: number }> = ({ v, k }) => <div style={{ position: "absolute", top: 240, left: 90, right: 190, opacity: k, textAlign: "center" }}>
  <div style={{ fontFamily: HEADING, fontWeight: 800, fontSize: 66, color: P.bone, textShadow: "0 4px 22px rgba(0,0,0,.85)" }}>OXYGEN FALLING</div>
  <div style={{ marginTop: 22, height: 34, background: "rgba(4,12,18,.68)", border: "3px solid rgba(255,255,255,.75)", borderRadius: 20, overflow: "hidden" }}><div style={{ width: `${v * 100}%`, height: "100%", background: hex(P.red, P.cyan, v) }} /></div>
  <div style={{ marginTop: 14, fontFamily: BODY, fontWeight: 600, fontSize: 32, color: P.bone, textShadow: "0 2px 12px rgba(0,0,0,.95)" }}>Illustrative meter</div>
</div>;
const S5: React.FC<{ off: number }> = ({ off }) => {
  const rel = useT(), t = rel + off, m = W(4, "microbes") - off, s = W(4, "suffocate") - off;
  const dead = ss(m + 0.8, s + 0.2, rel), o2 = 1 - ss(m, s, rel), tilt = ss(0, 1.5, rel), swim = mix(rel, s, ss(s - 2.6, s, rel));
  const fish = useMemo(() => { const r = rng(61); return Array.from({ length: 34 }, () => ({ x: (r() - 0.5) * 15, z: -4 - r() * 9, ph: r() * 6.28, v: 0.45 + r() * 0.5, s: 0.75 + r() * 0.6, c: r(), lag: r() })); }, []);
  const fp = (i: number) => { const f = fish[i], k = ss(f.lag * 0.45, f.lag * 0.45 + 0.55, dead), a = f.ph + swim * f.v; return { x: f.x + Math.sin(a) * 1.8, z: f.z + Math.cos(a * 0.8) * 1.5, y: mix(-0.72 + Math.sin(a * 1.5) * 0.12, -0.03, k), ry: Math.atan2(Math.cos(a) * 1.8, -Math.sin(a * 0.8) * 1.2) - Math.PI / 2, roll: k * Math.PI, wag: Math.sin(t * 9 + f.ph) * 0.4 * (1 - k), s: f.s, c: f.c, k }; };
  return <AbsoluteFill><Canvas3D fog={["#9fada9", 18, 95]}>
    <Sky top="#74858f" horizon="#c6c9ba" />
    <Camera pos={[Math.sin(t * 0.3) * 0.15, 5.6, 2.5]} look={[0, mix(5.4, -0.3, tilt), mix(-22, -7.5, tilt)]} fov={58} />
    <hemisphereLight args={["#e9f3f6", "#4d5a58", 2]} /><Sun />
    <mesh position={[0, -1.8, -30]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[70, 120]} /><meshStandardMaterial color="#232c28" /></mesh>
    <Instances count={34} dep={t} fill={(i, d, c) => { const f = fp(i); d.position.set(f.x, f.y, f.z); d.rotation.set(f.roll, f.ry, 0, "YXZ"); d.scale.set(0.55 * f.s, 0.17 * f.s, 0.13 * f.s); c.set(f.c < 0.5 ? "#c9d4d8" : "#d39a56").lerp(new THREE.Color("#f2eee3"), f.k * 0.75); }}><sphereGeometry args={[1, 14, 10]} /><meshStandardMaterial roughness={0.35} metalness={0.2} /></Instances>
    <Instances count={34} dep={t} fill={(i, d, c) => { const f = fp(i), off2 = 0.55 * f.s; d.position.set(f.x + Math.cos(f.ry) * off2, f.y, f.z - Math.sin(f.ry) * off2); d.rotation.set(0, f.ry + f.wag, -Math.PI / 2, "YXZ"); d.scale.set(0.2 * f.s, 0.24 * f.s, 0.05 * f.s); c.set(f.c < 0.5 ? "#9cabb0" : "#b57a3c").lerp(new THREE.Color("#e8e3d7"), f.k * 0.75); }}><coneGeometry args={[1, 1, 4]} /><meshStandardMaterial /></Instances>
    <Glow count={150} t={t} size={0.05} path={(i, q) => { const r = rng(i + 800), u = (r() + q * 0.55) % 1; return { p: [(r() - 0.5) * 16, -1.4 + u * 1.38, -2 - r() * 15], a: o2 * (1 - u * 0.35), color: "#d8f6ff" }; }} />
    <mesh position={[0, 0, -30]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[70, 120]} /><meshPhysicalMaterial color="#3b6b77" transparent opacity={0.48} roughness={0.15} metalness={0.15} depthWrite={false} /></mesh>
    <Rings t={t} at={[0, 0, -9]} count={150} spread={22} y={0.02} />
    {[-1, 1].map((s2) => <mesh key={s2} position={[s2 * 22, 0.6, -40]} rotation={[0, 0, s2 * 0.05]}><boxGeometry args={[18, 2.2, 150]} /><meshStandardMaterial color="#5d4b34" roughness={1} /></mesh>)}
    <Instances count={110} castShadow fill={(i, d, c) => { const r = rng(i + 12), s2 = i % 2 ? 1 : -1, sz = 1.6 + r() * 2.2; d.position.set(s2 * (15 + r() * 12), 3 + r() * 2.4, 2 - r() * 92); d.scale.set(sz, sz * 0.92, sz); d.rotation.set(r() * 3, r() * 3, 0); c.set(["#7a4c22", "#5e3a1c", "#92602a"][i % 3]); }}><icosahedronGeometry args={[1, 1]} /><meshStandardMaterial flatShading /></Instances>
    <mesh position={[0, 4.6, 1.7]}><boxGeometry args={[26, 0.08, 0.08]} /><meshStandardMaterial color="#20262a" metalness={0.55} roughness={0.4} /></mesh>
    <Instances count={15} fill={(i, d) => { d.position.set(-7 + i, 4.15, 1.7); d.scale.set(0.05, 0.9, 0.05); }}><boxGeometry args={[1, 1, 1]} /><meshStandardMaterial color="#20262a" metalness={0.55} /></Instances>
    <Rain rt={t * 1.8} at={[0, 0, -3]} count={1000} />
  </Canvas3D><Grade /><O2Meter v={o2} k={ss(m - 0.7, m - 0.3, rel)} /></AbsoluteFill>;
};

/* ---------- Scene 6: vapor and spark ---------- */
const S6: React.FC<{ off: number }> = ({ off }) => {
  const rel = useT(), t = rel + off, sp = W(5, "spark") - off, engine = W(5, "car") - off;
  const slow = ss(engine, sp, rel), rt = rel * 1.8 - slow * Math.max(0, rel - engine) * 1.6, after = rel - sp;
  const vapor = useMemo(() => { const r = rng(71); return Array.from({ length: 190 }, () => ({ x: (r() - 0.5) * 11, z: r(), h: 0.12 + r() * 0.65, s: 1.3 + r() * 2.4, ph: r() * 6.28 })); }, []);
  const z = mix(4, -5.7, ss(0, sp, rel));
  return <AbsoluteFill><Canvas3D fog={["#a2afb2", 22, 120]}>
    <Sky top="#6f818c" horizon="#c9d0ca" />
    <Camera pos={[mix(0.2, -0.7, ss(0, sp, rel)), mix(0.62, 0.42, ss(0, sp, rel)), z]} look={[mix(-0.8, -2.6, ss(0, sp, rel)), 0.75, -13]} fov={55} />
    <hemisphereLight args={["#e2edf2", "#47515a", 1.7]} /><Sun />
    <Street dry={1} />
    <Sprites count={190} dep={t} opacity={0.17} fill={(i, d, c) => { const v = vapor[i], zz = 5 - ((v.z + rt * 0.018) % 1) * 28; d.position.set(v.x + Math.sin(t * 0.5 + v.ph) * 0.8, v.h, zz); d.scale.set(v.s * 1.5, v.s * 0.42, 1); c.set(P.cyan); }} />
    <Sprites count={20} dep={t} opacity={0.28} fill={(i, d, c) => { const r = rng(i + 15), u = (r() + t * 0.4) % 1; d.position.set(-3.2 + u * -0.1 + (r() - 0.5) * 0.15, 0.36 + u * 0.35, -10.6 + u * 1.3); d.scale.setScalar(0.1 + u * 0.55); c.set("#f4f6f7"); }} />
    {after > 0 ? <><pointLight position={[-3.2, 0.5, -10.4]} color="#ffb060" intensity={12} distance={10} />
      <Glow count={40} t={t} size={0.022} path={(i, q) => { const r = rng(i + 500), a = r() * 6.28, sp2 = r() * 0.9 + 0.2, k = clamp((q - off - sp) * 1.8); return { p: [-3.2 + Math.cos(a) * sp2 * k, 0.45 + Math.abs(Math.sin(a)) * sp2 * k * 0.8 - k * k * 0.3, -10.4 + Math.sin(a) * sp2 * k * 0.4], a: 1 - k * 0.4, color: i % 2 ? "#fff0b0" : "#ffb347" }; }} /></> : null}
    <Rain rt={rt} at={[0, 0, z - 6]} count={1000} /><Rings t={rt / 1.8} at={[0, 0, z - 6]} />
  </Canvas3D><Grade /><Label text="FLASH POINT: 13°C" sub="Vapor shown for illustration" at={W(5, "thirteen") - off - 0.5} color={P.cyan} size={70} /></AbsoluteFill>;
};

/* ---------- Fire ---------- */
const BlueFire: React.FC<{ t: number; front: number; amt: number; orange?: number; count?: number; depth?: number }> = ({ t, front, amt, orange = 0, count = 520, depth = 58 }) => {
  const d0 = useMemo(() => { const r = rng(44); return Array.from({ length: count }, () => ({ x: (r() - 0.5) * 16, z: r(), h: 0.8 + r() * 2, w: 0.5 + r() * 1, p: r() * 6.28, o: r() })); }, [count]);
  return <>
    <Sprites count={count} dep={t} additive opacity={0.4} fill={(i, d, c) => { const f = d0[i], fl = 0.72 + 0.34 * Math.sin(t * (9 + f.p) + f.p * 7), h = f.h * fl * amt; d.position.set(f.x + Math.sin(t * 3 + f.p) * 0.1, h * 0.47, front - f.z * depth); d.scale.set(f.w, h * 1.15, 1); c.set(f.o < 0.45 ? "#8ec7ff" : "#3f7fff"); }} />
    {orange > 0 ? <Sprites count={260} dep={t} additive opacity={0.6} fill={(i, d, c) => { const f = d0[i], side = i % 2 ? 1 : -1, zz = -3 - f.z * 70, fl = 0.72 + 0.34 * Math.sin(t * (7 + f.p) + f.p * 4), h = (2.2 + f.h * 1.6) * fl * orange; d.position.set(side * (6.4 + f.w), 3.2 + f.o * 2 + h * 0.2, zz); d.scale.set(1.3 + f.w * 1.4, h, 1); c.set(f.o < 0.5 ? "#ff9a2c" : "#ffd25e"); }} /> : null}
  </>;
};
/** Heat ripple, driven by the frame so it renders deterministically. */
const Heat: React.FC<{ amt: number; id: string; children: React.ReactNode }> = ({ amt, id, children }) => {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{ filter: amt > 0.01 ? `url(#${id})` : undefined }}>
    <svg width="0" height="0" style={{ position: "absolute" }}><filter id={id} x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.004 0.03" numOctaves={1} seed={f % 40} /><feDisplacementMap in="SourceGraphic" scale={amt * 28} /></filter></svg>
    {children}
  </AbsoluteFill>;
};

/* ---------- Scene 7: flames ---------- */
const S7: React.FC<{ off: number }> = ({ off }) => {
  const rel = useT(), t = rel + off, fe = W(6, "feel") - off, dur = CUTS[7] - CUTS[6];
  const front = mix(-34, 4, ss(0, dur - 0.8, rel)), flash = Math.exp(-rel * 5) * 0.75, burn = ss(fe - 0.2, dur, rel);
  const shake = Math.exp(-rel * 1.6) * 0.09 + 0.012 + burn * 0.02, back = ss(0, 3, rel) * 3;
  return <AbsoluteFill><Heat amt={0.25 + burn * 0.75} id="h7"><Canvas3D fog={[hex("#a8afad", "#5d4639", burn), 20, 125]}>
    <Sky top={hex("#6f818c", "#2d2a30", burn)} horizon={hex("#c9d0ca", "#b76f3b", burn)} />
    <Camera pos={[Math.sin(t * 37) * shake, 1.62 + Math.cos(t * 43) * shake, -1 + back]} look={[Math.sin(t * 29) * shake, 1.8 + burn * 1.4, -24]} fov={60} roll={Math.sin(t * 13) * shake * 0.25} />
    <hemisphereLight args={[hex("#e2edf2", "#d9b28d", burn), "#47515a", mix(1.7, 1.2, burn)]} /><Sun intensity={mix(1.4, 0.8, burn)} />
    <pointLight position={[0, 1.2, front - 1]} color="#6aa2ff" intensity={320} distance={34} />
    {burn > 0 ? <pointLight position={[0, 6, -12]} color="#ff8a2c" intensity={900 * burn} distance={60} /> : null}
    <Street dry={1} scorch={ss(1.5, dur, rel) * 0.45} />
    <BlueFire t={t} front={front} amt={ss(0, 0.5, rel)} orange={burn} />
    <Rain rt={t * 1.8} at={[0, 0, -3]} count={700} opacity={0.26} />
  </Canvas3D></Heat><Grade flash={flash} flashColor="#d6e8ff" tint="#ff7a26" tintA={burn * 0.38} /><Label text="ALMOST INVISIBLE" sub="Flames brightened so you can see them" color="#A8D2FF" at={W(6, "Burning") - off - 0.3} size={68} /></AbsoluteFill>;
};

/* ---------- Scene 8: water ---------- */
const S8: React.FC<{ off: number }> = ({ off }) => {
  const rel = useT(), t = rel + off, up = ss(0.5, 6, rel), fade = 1 - ss(0.4, 5, rel);
  return <AbsoluteFill><Canvas3D fog={["#4e4a4b", 24, 125]}>
    <Sky top="#44515b" horizon="#8b6f5b" />
    <Camera pos={[0, 1.7, 7 + rel * 0.2]} look={[0, mix(2.4, 38, up), mix(-24, -22, up)]} fov={62} />
    <hemisphereLight args={["#c9d2d5", "#3a3430", 1.65]} /><Sun intensity={0.8} />
    <Street scorch={0.8} dry={1} />
    <BlueFire t={t} front={4} amt={fade} count={300} />
    <Sprites count={170} dep={t} opacity={0.17} fill={(i, d, c) => { const r = rng(i + 90), u = (r() + t * 0.085) % 1; d.position.set((r() - 0.5) * 14 + Math.sin(t * 0.5 + i) * u * 2, u * 45, -6 - r() * 24); d.scale.setScalar(1.4 + u * 7); c.set("#f2f7f8"); }} />
    <Sprites count={60} dep={0} opacity={0.5} fill={(i, d, c) => { const r = rng(i + 170); d.position.set((r() - 0.5) * 70, 40 + r() * 10, -18 - r() * 28); d.scale.set(15 + r() * 18, 6 + r() * 6, 1); c.set("#b5bec3"); }} />
  </Canvas3D><Grade />
    <Label text="FIRE MAKES WATER" sub="C₂H₅OH + 3O₂ → 2CO₂ + 3H₂O" at={W(7, "water") - off - 0.3} color={P.cyan} size={70} />
    <div style={{ position: "absolute", top: 455, left: 70, right: 170, textAlign: "center", fontFamily: BODY, fontWeight: 600, fontSize: 30, color: P.amber, opacity: ss(W(7, "steam") - off, W(7, "steam") - off + 0.3, rel), textShadow: "0 2px 12px #000" }}>Simplified: steam falling back as rain</div>
  </AbsoluteFill>;
};

/* ---------- Scene 9: end ---------- */
const S9: React.FC<{ off: number }> = ({ off }) => {
  const rel = useT(), t = rel + off, q = W(8, "What") - off, f = W(8, "fire") - off, end = TOTAL / FPS - off;
  const k = ss(q - 0.15, q + 0.25, rel), c = ss(W(8, "Comment") - off - 0.1, W(8, "Comment") - off + 0.25, rel), clear = ss(0, 6, rel);
  return <AbsoluteFill><Canvas3D fog={[hex("#4d5354", "#747f83", clear), 22, 125]}>
    <Sky top={hex("#43505a", "#6e8796", clear)} horizon={hex("#736a63", "#b3bdb9", clear)} />
    <Camera pos={[0, 1.7, mix(-7, 3, ss(0, 7, rel))]} look={[0, 2, -40]} fov={60} />
    <hemisphereLight args={["#d5e1e6", "#34302c", mix(2.1, 2.6, clear)]} /><Sun intensity={mix(0.6, 1.1, clear)} />
    <Street scorch={1} dry={1} />
    <Rain rt={t * 1.5} at={[0, 0, -5]} count={1200} color="#8fc8f2" opacity={0.45} /><Rings t={t} at={[0, 0, -8]} color="#7ebce6" />
    <Sprites count={45} dep={t} opacity={0.14} fill={(i, d, c2) => { const r = rng(i + 400), u = (r() + t * 0.1) % 1; d.position.set((r() - 0.5) * 16, u * 8, -3 - r() * 36); d.scale.setScalar(1 + u * 3.5); c2.set("#d9dfe2"); }} />
  </Canvas3D><Grade black={ss(end - 0.3, end, rel)} />
    <div style={{ position: "absolute", top: 240, left: 70, right: 170, textAlign: "center", opacity: k * (1 - ss(end - 0.35, end - 0.1, rel)), transform: `translateY(${(1 - k) * 26}px)` }}>
      <div style={{ fontFamily: HEADING, fontWeight: 800, fontSize: 88, lineHeight: 1.08, color: P.bone, textShadow: "0 4px 26px rgba(0,0,0,.85)" }}>WHAT SHOULD IT RAIN NEXT?</div>
      <div style={{ marginTop: 20, opacity: c, fontFamily: BODY, fontWeight: 700, fontSize: 44, color: P.cyan, textShadow: "0 2px 14px rgba(0,0,0,.95)" }}>Comment below</div>
    </div>
  </AbsoluteFill>;
};

export const RainAlcohol: React.FC = () => {
  const f = (s: number) => Math.round(s * FPS), t = useCurrentFrame() / FPS;
  const S = [S1, S2, S3, S4, S5, S6, S7, S8, S9] as React.FC<{ off: number }>[];
  return <AbsoluteFill style={{ background: "#000" }}>
    {S.map((C, i) => <Sequence key={i} from={f(CUTS[i])} durationInFrames={f(CUTS[i + 1]) - f(CUTS[i])}><C off={CUTS[i]} /></Sequence>)}
    {t < TOTAL / FPS - 0.35 ? <NarrationCaptions data={data as any} /> : null}
  </AbsoluteFill>;
};

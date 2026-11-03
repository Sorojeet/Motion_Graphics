import React, { useMemo } from "react";
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import * as THREE from "three";
import { NarrationCaptions } from "../../../Assets/remotion/components/text";
import { BODY, HEADING, c as theme } from "../../../Assets/remotion/theme";
import { Apple, Camera, Falling, Forest, Glow, Hand, Instances, Sky, clamp, groundHeight, mix, noise, rng, ss } from "../../../Assets/remotion/three/kit";
import data from "../narration.json";

// Earthy overrides for this video only.
const P = { amber: "#F2B04A", rust: "#C8562A", moss: "#7FB069", bone: "#F3EBDD", cyan: "#7FE3E0" };
export const TOTAL = 2400, FPS = 30;
export const CUTS = [0, 3.46, 10.62, 17.87, 28.28, 37.72, 50.74, 63.86, 70.19, 75.39, 80];

/** Time a narration word is spoken, within beat `b`. */
export const W = (b: number, word: string) => {
  const beat = data.beats[b];
  for (const ch of data.chunks) for (const w of ch.words) if (w.start >= beat.start - 0.01 && w.end <= beat.end + 0.01 && w.text.replace(/\W/g, "").toLowerCase() === word.toLowerCase()) return w.start;
  throw new Error(`No word ${word} in beat ${b}`);
};

const useT = () => { const f = useCurrentFrame(); return f / FPS; };
const Canvas3D: React.FC<{ children: React.ReactNode; fog?: [string, number, number] }> = ({ children, fog }) => {
  const { width, height } = useVideoConfig();
  return <ThreeCanvas width={width} height={height} shadows gl={{ antialias: true, preserveDrawingBuffer: true, toneMapping: THREE.ACESFilmicToneMapping }}>
    {fog ? <fog attach="fog" args={fog} /> : null}{children}
  </ThreeCanvas>;
};
const SunShadow: React.FC<{ pos: number[]; color?: string; intensity?: number; size?: number; at?: number[] }> = ({ pos, color = "#ffe2b8", intensity = 2.4, size = 8, at = [0, 0, 0] }) => {
  const target = useMemo(() => new THREE.Object3D(), []); target.position.set(at[0], at[1], at[2]); target.updateMatrixWorld();
  return <><primitive object={target} /><directionalLight position={pos as any} target={target} color={color} intensity={intensity} castShadow shadow-mapSize={[1536, 1536]} shadow-camera-left={-size} shadow-camera-right={size} shadow-camera-top={size} shadow-camera-bottom={-size} shadow-camera-far={120} shadow-bias={-0.0006} /></>;
};

/* ---------- Overlays ---------- */
const Grade: React.FC<{ fadeIn?: number; flash?: number; black?: number }> = ({ fadeIn = 0.15, flash = 0, black = 0 }) => {
  const t = useT();
  return <AbsoluteFill style={{ pointerEvents: "none" }}>
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, transparent 48%, rgba(10,6,3,.62) 100%)" }} />
    <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(8,5,2,.62) 0%, rgba(8,5,2,0) 34%)" }} />
    <AbsoluteFill style={{ background: "#000", opacity: Math.max(1 - clamp(t / fadeIn), black) }} />
    {flash > 0 ? <AbsoluteFill style={{ background: "#fff", opacity: flash }} /> : null}
  </AbsoluteFill>;
};
const pop = (t: number, at: number, d = 0.3) => ss(at, at + d, t);
const Label: React.FC<{ text: string; sub?: string; at?: number; size?: number; color?: string }> = ({ text, sub, at = 0.2, size = 78, color = P.bone }) => {
  const t = useT(), k = pop(t, at);
  return <div style={{ position: "absolute", top: 240, left: 70, right: 170, textAlign: "center", opacity: k, transform: `translateY(${(1 - k) * 22}px)` }}>
    <div style={{ fontFamily: HEADING, fontWeight: 800, fontSize: size, lineHeight: 1.08, color, letterSpacing: 1, textShadow: "0 4px 26px rgba(0,0,0,.75)" }}>{text}</div>
    {sub ? <div style={{ marginTop: 16, fontFamily: BODY, fontWeight: 600, fontSize: 34, color: P.bone, opacity: 0.92, textShadow: "0 2px 14px rgba(0,0,0,.9)" }}>{sub}</div> : null}
  </div>;
};

/* ---------- Scene 1: hook ---------- */
const S1: React.FC = () => {
  const t = useT(), snap = W(0, "nothing") + useCurrentFrame() * 0 - 0.05;
  const rot = 1 - ss(snap - 0.08, snap + 0.12, t), push = ss(0, snap, t), freeze = t > snap ? Math.exp(-(t - snap) * 9) * 0.05 : 0;
  return <AbsoluteFill><Canvas3D fog={["#120b07", 6, 18]}>
    <Sky top="#0f0906" horizon="#2b1a0f" />
    <Camera pos={[0.05 + Math.sin(t * 40) * freeze, 0.72 + Math.cos(t * 47) * freeze, mix(3.5, 2.75, push)]} look={[0, 0.46, 0]} fov={46} />
    <hemisphereLight args={["#ffe9cb", "#26160b", 1.1]} />
    <SunShadow pos={[-3, 5, 3]} intensity={3.2} size={4} />
    <pointLight position={[2, 1, 1.5]} color={P.rust} intensity={8} />
    <Apple rot={rot} position={[0, 0.5, 0]} rotationY={t * 0.35} />
    <Hand rotation={[0, 0.75, 0]} />
  </Canvas3D><Grade /><Label text="WHAT IF NOTHING DECAYED?" at={0.1} /></AbsoluteFill>;
};

/* ---------- Scene 2: kitchen ---------- */
const Kitchen: React.FC<{ t: number }> = ({ t }) => {
  const clockH = t * 0.9;
  return <group>
    <mesh position={[0, 3, -3]} receiveShadow><boxGeometry args={[16, 8, 0.2]} /><meshStandardMaterial color="#6b7c63" roughness={0.95} /></mesh>
    <mesh position={[-7, 3, 3]} receiveShadow><boxGeometry args={[0.2, 8, 12]} /><meshStandardMaterial color="#62725c" /></mesh>
    <mesh position={[7, 3, 3]} receiveShadow><boxGeometry args={[0.2, 8, 12]} /><meshStandardMaterial color="#62725c" /></mesh>
    <mesh position={[0, -1, 2]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[20, 20]} /><meshStandardMaterial color="#3b2a1e" /></mesh>
    {/* table */}
    <mesh position={[0, -0.09, 0.2]} castShadow receiveShadow><boxGeometry args={[9, 0.18, 3.6]} /><meshStandardMaterial color="#6e4a2c" roughness={0.65} /></mesh>
    {/* window */}
    <mesh position={[-1.6, 3.1, -2.88]}><boxGeometry args={[2.6, 2.6, 0.05]} /><meshBasicMaterial color="#ffe4b0" toneMapped={false} /></mesh>
    {[-1.6].map((x) => <React.Fragment key={x}><mesh position={[x, 3.1, -2.82]}><boxGeometry args={[0.1, 2.6, 0.08]} /><meshStandardMaterial color="#2c2118" /></mesh><mesh position={[x, 3.1, -2.82]}><boxGeometry args={[2.6, 0.1, 0.08]} /><meshStandardMaterial color="#2c2118" /></mesh></React.Fragment>)}
    {/* clock runs through the day while the food stays fresh */}
    <group position={[1.8, 3.6, -2.86]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.62, 0.62, 0.07, 40]} /><meshStandardMaterial color="#f3ebdd" /></mesh>
      <mesh rotation={[0, 0, -clockH * 12]} position={[0, 0, 0.06]}><boxGeometry args={[0.04, 0.0001, 0.001]} /><meshBasicMaterial color="#000" /></mesh>
      <group rotation={[0, 0, -clockH * 12]}><mesh position={[0, 0.23, 0.06]}><boxGeometry args={[0.035, 0.48, 0.02]} /><meshStandardMaterial color="#20150e" /></mesh></group>
      <group rotation={[0, 0, -clockH]}><mesh position={[0, 0.15, 0.08]}><boxGeometry args={[0.06, 0.32, 0.02]} /><meshStandardMaterial color="#20150e" /></mesh></group>
    </group>
    {/* shelf */}
    <mesh position={[3.4, 2.25, -2.7]} castShadow><boxGeometry args={[3.2, 0.09, 0.5]} /><meshStandardMaterial color="#5c3d24" /></mesh>
    {[2.5, 3.2, 3.9, 4.5].map((x, i) => <mesh key={x} position={[x, 2.54 + (i % 2) * 0.06, -2.7]} castShadow><cylinderGeometry args={[0.2, 0.2, 0.5 + (i % 2) * 0.12, 16]} /><meshStandardMaterial color={["#c8562a", "#d8b26e", "#7f8d5a", "#a44"][i]} /></mesh>)}
    {/* bread */}
    <group position={[0.1, 0.27, 0.15]} rotation={[0, 0.3, 0]}>
      <mesh scale={[0.78, 0.32, 0.38]} castShadow><sphereGeometry args={[1, 30, 20]} /><meshStandardMaterial color="#c98a45" roughness={0.75} /></mesh>
      {[-0.4, -0.13, 0.14, 0.41].map((x) => <mesh key={x} position={[x, 0.27, 0]} rotation={[0, 0.5, 0]} scale={[0.035, 0.05, 0.3]}><sphereGeometry args={[1, 8, 8]} /><meshStandardMaterial color="#efd3a1" /></mesh>)}
    </group>
    {/* milk */}
    <group position={[1.75, 0, 0.1]}>
      <mesh castShadow position={[0, 0.5, 0]}><cylinderGeometry args={[0.3, 0.34, 1, 28]} /><meshPhysicalMaterial color="#fbf7ee" roughness={0.2} clearcoat={1} /></mesh>
      <mesh castShadow position={[0, 1.18, 0]}><cylinderGeometry args={[0.15, 0.3, 0.38, 28]} /><meshPhysicalMaterial color="#fbf7ee" roughness={0.2} clearcoat={1} /></mesh>
      <mesh position={[0, 1.44, 0]}><cylinderGeometry args={[0.17, 0.17, 0.14, 24]} /><meshStandardMaterial color={P.rust} /></mesh>
      <mesh position={[0, 0.52, 0]}><cylinderGeometry args={[0.326, 0.334, 0.34, 28, 1, true]} /><meshStandardMaterial color="#5d7f9e" /></mesh>
    </group>
    <Apple position={[-1.65, 0.46, 0.2]} rotationY={0.4} radius={0.47} />
  </group>;
};
const S2: React.FC<{ off: number }> = ({ off }) => {
  const t = useT() + off;
  const a = W(1, "This"), b = W(1, "Bread"), m = W(1, "Milk");
  const x = mix(0, -1.65, ss(a - 0.5, a, t)) * (1 - ss(b - 0.5, b, t)) + mix(0, 0.1, ss(b - 0.5, b, t)) + 1.65 * ss(m - 0.4, m, t);
  const px = x * 0.7 + Math.sin(t * 1.5) * 0.04;
  return <AbsoluteFill><Canvas3D fog={["#433a2c", 12, 30]}>
    <Camera pos={[px, 2.25 + Math.sin(t * 2.1) * 0.015, 5.4]} look={[x, 0.45, 0.1]} fov={42} />
    <hemisphereLight args={["#fff0d8", "#4a3524", 1.2]} />
    <SunShadow pos={[-3.5, 6.5, 5]} intensity={3.1} size={6} />
    <pointLight position={[-1.6, 3, -1.5]} color="#ffdca0" intensity={18} />
    <Kitchen t={t} />
  </Canvas3D><Grade /><Label text="DAY 1" at={off + 0.1 - off} /></AbsoluteFill>;
};

/* ---------- Scene 3: leaves stay ---------- */
const S3: React.FC<{ off: number }> = ({ off }) => {
  const rel = useT(), t = rel + off;
  const open = ss(0.05, 0.75, rel), z = mix(5, -3, ss(0.25, 2.1, rel)) - ss(2, 8, rel) * 8;
  const walk = Math.sin(rel * 7) * 0.05 * ss(0.2, 1, rel);
  const lit = ss(1, 7, rel);
  return <AbsoluteFill><Canvas3D fog={["#c99c64", 20, 95]}>
    <Sky top="#7fa4c0" horizon="#efc791" />
    <Camera pos={[Math.sin(rel * 3.5) * 0.04, 1.7 + walk, z]} look={[Math.sin(rel * 0.5) * 0.7, 1.75 - ss(3, 6, rel) * 1.15, z - 8]} fov={62} />
    <hemisphereLight args={["#fff1d9", "#6b4525", 1.5]} />
    <SunShadow pos={[-30, 40, 16]} intensity={3} size={38} at={[0, 0, z - 14]} />
    {/* doorway */}
    <group position={[0, 0, 3.2]}>
      <mesh position={[-3.2, 3, 0]}><boxGeometry args={[4.4, 6, 0.3]} /><meshStandardMaterial color="#5a6a54" /></mesh>
      <mesh position={[3.2, 3, 0]}><boxGeometry args={[4.4, 6, 0.3]} /><meshStandardMaterial color="#5a6a54" /></mesh>
      <mesh position={[0, 5.2, 0]}><boxGeometry args={[2, 1.6, 0.3]} /><meshStandardMaterial color="#5a6a54" /></mesh>
      <group position={[-1, 0, 0]} rotation={[0, -open * 1.9, 0]}><mesh position={[1, 2.2, 0]}><boxGeometry args={[2, 4.4, 0.1]} /><meshStandardMaterial color="#6d4526" /></mesh><mesh position={[1.75, 2.1, 0.12]}><sphereGeometry args={[0.07, 12, 10]} /><meshStandardMaterial color="#d3a646" metalness={0.7} roughness={0.3} /></mesh></group>
    </group>
    <Forest litter={0.12 + lit * 0.5} center={[0, 0, -8]} />
    <Falling t={t} at={[0, 0, z - 6]} count={650} spread={26} top={14} size={2} />
  </Canvas3D><Grade fadeIn={0.08} /><Label text="YEAR 1" at={0.5} /></AbsoluteFill>;
};

/* ---------- Scene 4: carbon ---------- */
const S4: React.FC<{ off: number }> = ({ off }) => {
  const rel = useT(), t = rel + off;
  const stop = W(3, "stopped"), norm = W(3, "Normally");
  const backOn = ss(norm - 0.2, norm + 0.8, t) * (1 - ss(stop - 0.35, stop + 0.45, t));
  const n = Math.round(60 * ss(0.1, W(3, "carbon") - off, rel));
  const tilt = ss(0, 3, rel);
  return <AbsoluteFill><Canvas3D fog={["#a78a63", 22, 110]}>
    <Sky top="#4d7595" horizon="#e2bb85" />
    <Camera pos={[0, mix(1.7, 7, ss(0, 5, rel)), -11 - rel * 0.4]} look={[0, mix(3, 9.5, tilt), -26]} fov={62} />
    <hemisphereLight args={["#fff1d9", "#6b4525", 1.25]} />
    <SunShadow pos={[-30, 40, 16]} intensity={2.6} size={38} at={[0, 0, -26]} />
    <Forest litter={0.65} center={[0, 0, -18]} />
    <Falling t={t} at={[0, 0, -20]} count={260} spread={26} />
    <Glow count={520} t={t} size={0.11} path={(i, q) => { const r = (i * 12.9898) % 1, k = (i * 0.137 + q * 0.13) % 1, x = (noise(i, 2) - 0.5) * 34, z = -28 + (noise(i, 7) - 0.5) * 18; return { p: [x + Math.sin(q + i) * 0.5, mix(32, 9, k), z], a: ss(0, 0.1, k) * (1 - ss(0.85, 1, k)), color: P.cyan }; }} />
    <Glow count={420} t={t} size={0.11} path={(i, q) => { const k = (i * 0.211 + q * 0.16) % 1, x = (noise(i, 11) - 0.5) * 34, z = -28 + (noise(i, 13) - 0.5) * 18; return { p: [x + Math.sin(q * 1.2 + i) * 0.6, mix(0.3, 32, k), z], a: backOn * ss(0, 0.08, k) * (1 - ss(0.8, 1, k)), color: P.amber }; }} />
  </Canvas3D><Grade />
    <div style={{ position: "absolute", top: 230, left: 70, right: 170, textAlign: "center" }}>
      <div style={{ fontFamily: HEADING, fontWeight: 800, fontSize: 158, lineHeight: 1, color: P.cyan, textShadow: "0 4px 30px rgba(0,0,0,.65)", fontVariantNumeric: "tabular-nums" }}>~{n}</div>
      <div style={{ fontFamily: HEADING, fontWeight: 800, fontSize: 48, lineHeight: 1.12, color: P.bone, textShadow: "0 3px 20px rgba(0,0,0,.85)" }}>BILLION TONS OF CARBON A YEAR</div>
    </div>
  </AbsoluteFill>;
};

/* ---------- Scene 5: the pile ---------- */
const Deer: React.FC<{ position: number[]; rotationY?: number; scale?: number }> = ({ position, rotationY = 0, scale = 1 }) => <group position={position as any} rotation={[0, rotationY, 0]} scale={scale}>
  <mesh rotation={[0, 0, 1.45]} scale={[1, 1, 0.82]} castShadow><capsuleGeometry args={[0.42, 1.3, 6, 16]} /><meshStandardMaterial color="#8a6340" roughness={1} /></mesh>
  <mesh position={[1.05, 0.07, 0.1]} rotation={[0.2, 0, -1.15]} castShadow><capsuleGeometry args={[0.15, 0.68, 6, 12]} /><meshStandardMaterial color="#83592f" roughness={1} /></mesh>
  <mesh position={[1.6, -0.1, 0.25]} rotation={[0.3, 0, -1.4]} castShadow scale={[0.9, 1, 0.8]}><capsuleGeometry args={[0.15, 0.32, 6, 12]} /><meshStandardMaterial color="#8a6340" roughness={1} /></mesh>
  {[[1.5, 0.12, 0.06, 0.5], [1.5, 0.12, 0.42, 0.5]].map((p, i) => <group key={i} position={[p[0], p[1], p[2]]} rotation={[i ? 0.35 : -0.35, 0, p[3]]}><mesh position={[0, 0.25, 0]}><cylinderGeometry args={[0.018, 0.035, 0.52, 6]} /><meshStandardMaterial color="#d6c6a4" /></mesh><mesh position={[0.1, 0.32, 0]} rotation={[0, 0, -0.8]}><cylinderGeometry args={[0.012, 0.024, 0.28, 6]} /><meshStandardMaterial color="#d6c6a4" /></mesh></group>)}
  <mesh position={[-1.05, 0.08, 0.1]} scale={[0.12, 0.14, 0.12]}><sphereGeometry args={[1, 10, 8]} /><meshStandardMaterial color="#efe6d5" /></mesh>
  {[[-0.75, -0.06, 0.62, 0.25], [-0.45, -0.1, 0.72, -0.1], [0.35, -0.08, 0.66, 0.2], [0.65, -0.1, 0.62, -0.25]].map((p, i) => <mesh key={i} position={[p[0], p[1], p[2]]} rotation={[1.45, 0, p[3]]} castShadow><capsuleGeometry args={[0.055, 0.95, 4, 8]} /><meshStandardMaterial color="#6e4a28" /></mesh>)}
</group>;
const S5: React.FC<{ off: number }> = ({ off }) => {
  const rel = useT(), t = rel + off;
  const dur = CUTS[5] - CUTS[4], g = ss(0, dur, rel), pile = mix(0.3, 1.9, g), logs = ss(W(4, "Fallen") - off - 0.6, W(4, "Dead") - off, rel);
  const look = ss(W(4, "Dead") - off - 0.8, W(4, "Dead") - off + 0.2, rel);
  const z = -14 - rel * 0.45;
  const deerY = pile + groundHeight(-2.8, z - 6) * 0 - 0.12;
  return <AbsoluteFill><Canvas3D fog={["#a57d4e", 14, 78]}>
    <Sky top="#7b8996" horizon="#d9a86c" />
    <Camera pos={[0, pile + 1.65 + Math.sin(t * 5) * 0.025, z]} look={[mix(0.2, -2.9, look), pile + mix(1.2, 0.1, look), z - 7]} fov={60} />
    <hemisphereLight args={["#ffe9cd", "#5b3d22", 1.2]} />
    <SunShadow pos={[-25, 34, 10]} intensity={2.5} size={24} at={[0, 0, z - 8]} />
    <Forest pile={pile} litter={0.72 + g * 0.28} logs={logs} center={[0, 0, z - 6]} />
    <Falling t={t} at={[0, 0, z - 8]} count={300} spread={24} bottom={pile} top={pile + 13} />
    <Deer position={[-2.9, deerY + 0.52, z - 7.3]} rotationY={0.05} scale={0.95} />
    <Deer position={[6, pile + 0.2, z - 15]} rotationY={2.4} scale={1.1} />
  </Canvas3D><Grade /><Label text="YEAR 5" sub="Illustrative timeline, depth exaggerated" at={0.2} /></AbsoluteFill>;
};

/* ---------- Scene 6: nitrogen ---------- */
const Roots: React.FC<{ grow: number }> = ({ grow }) => {
  const curves = useMemo(() => {
    const r = rng(31);
    return Array.from({ length: 13 }, (_, i) => {
      const side = i / 12 - 0.5, tx = side * 8 + (r() - 0.5) * 0.7, ty = -0.45 - r() * 0.55;
      const start = new THREE.Vector3(side * 1.1, 2.4, 0.25);
      const mid = new THREE.Vector3(side * 6, -1.3 - r() * 1.1, 0.3);
      const end = new THREE.Vector3(tx, ty - 0.1, 0.32);
      return new THREE.TubeGeometry(new THREE.CatmullRomCurve3([start, new THREE.Vector3(side * 4.2, 0.45, 0.3), mid, new THREE.Vector3(mix(mid.x, tx, 0.7), -1.5, 0.3), end]), 80, 0.085 - r() * 0.015, 7);
    });
  }, []);
  return <group>{curves.map((g, i) => { const tot = g.index!.count; g.setDrawRange(0, Math.floor(tot * clamp(grow))); return <mesh key={i} geometry={g}><meshStandardMaterial color="#e3c29a" roughness={0.9} /></mesh>; })}</group>;
};
const S6: React.FC<{ off: number }> = ({ off }) => {
  const rel = useT(), t = rel + off;
  const down = ss(0.1, 1.4, rel), up = ss(W(5, "Leaves") - off - 0.35, W(5, "Leaves") - off + 0.5, rel);
  const yellow = ss(W(5, "Leaves") - off, W(5, "Forests") - off, rel);
  const pos = up > 0.001 ? [0, mix(-0.1, 7, up), mix(8.6, 18, up)] : [Math.sin(t * 0.3) * 0.25, mix(5.5, -0.1, down), 8.6];
  const look = [0, mix(mix(4.5, -0.1, down), 19, up), 0];
  const grow = ss(W(5, "Plants") - off, W(5, "trapped") - off, rel);
  const soil = useMemo(() => {
    const g = new THREE.PlaneGeometry(50, 26, 200, 100), p = g.attributes.position, col = new Float32Array(p.count * 3), A = new THREE.Color("#8f4e1e"), B = new THREE.Color("#684530"), C = new THREE.Color("#33221a"), c = new THREE.Color();
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i) - 13 + 2.4; const n = noise(x * 2.5, y * 2.5), line = 0.0 + (noise(x * 0.5, 2) - 0.5) * 0.25; c.copy(y > line ? A : B).multiplyScalar(0.72 + n * 0.5); if (y <= line) c.lerp(C, clamp(-y / 4)); else if (noise(x * 8, y * 8) > 0.6) c.set("#6e3414"); col.set([c.r, c.g, c.b], i * 3); }
    g.setAttribute("color", new THREE.BufferAttribute(col, 3)); return g;
  }, []);
  return <AbsoluteFill><Canvas3D fog={["#83684a", 14, 85]}>
    <Sky top="#83949f" horizon="#c9a877" />
    <Camera pos={pos} look={look} fov={56} />
    <hemisphereLight args={["#ffeed8", "#8a7a55", 2.4]} />
    <directionalLight position={[3, 3, 22]} color="#fff0d2" intensity={2.8} />
    {/* cutaway face: leaf pile on top of soil */}
    <mesh geometry={soil} position={[0, -10.6, 0]}><meshBasicMaterial vertexColors /></mesh>
    <mesh position={[0, 2.41, -24]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[160, 48]} /><meshStandardMaterial color="#8a4e20" roughness={1} /></mesh>
    <Roots grow={0.2 + grow * 0.8} />
    {/* Tree whose roots we follow, with its canopy above */}
    <mesh position={[0, 10.4, 0.1]}><cylinderGeometry args={[0.46, 0.75, 16, 12]} /><meshStandardMaterial color="#3b2a1f" /></mesh>
    <Instances count={70} dep={yellow} fill={(i, d, cc) => { const r = rng(i + 90), a = r() * 6.28, b = r() * 6.5; d.position.set(Math.cos(a) * b, 16 + r() * 7, Math.sin(a) * b - 0.2); d.scale.setScalar(1.8 + r() * 1.8); d.rotation.set(r() * 3, r() * 3, 0); cc.set(["#4d8c3d", "#3f7a36", "#5ea047"][i % 3]).lerp(new THREE.Color(["#d8c23a", "#c7a82f", "#a98d2a"][i % 3]), yellow); }}><icosahedronGeometry args={[1, 1]} /><meshStandardMaterial flatShading /></Instances>
    <Glow count={230} t={t} size={0.085} additive={false} path={(i, q) => { const r = rng(i + 500), x = (r() - 0.5) * 11, y = 0.2 + r() * 2.0, tw = 0.8 + 0.2 * Math.sin(q * 3 + i); return { p: [x + Math.sin(q * 0.6 + i) * 0.05, y + Math.cos(q * 0.8 + i) * 0.04, 0.45], a: tw, color: P.cyan }; }} />
    {yellow > 0.02 ? <Falling t={t} at={[0, 0, 2]} count={160} spread={18} top={18} colors={["#d8c23a", "#c7a82f", "#a98d2a"]} seed={8} bottom={3} /> : null}
  </Canvas3D><Grade /><Label text="NITROGEN: LOCKED" at={W(5, "nitrogen") - off} color={P.cyan} size={70} /></AbsoluteFill>;
};

/* ---------- Scene 7: air ---------- */
const lerpHex = (a: string, b: string, t: number) => "#" + new THREE.Color(a).lerp(new THREE.Color(b), t).getHexString();
const Gauge: React.FC<{ v: number; k: number; done: number }> = ({ v, k, done }) => {
  const f = (v - 150) / (425 - 150), R = 130, A = 1.5 * Math.PI * R, col = lerpHex(P.cyan, P.rust, 1 - f);
  return <div style={{ position: "absolute", top: 215, left: 70, right: 170, display: "flex", flexDirection: "column", alignItems: "center", opacity: k }}>
    <div style={{ position: "relative", width: 320, height: 270 }}>
      <svg width="320" height="320" viewBox="0 0 320 320" style={{ position: "absolute", top: 0, left: 0 }}>
        <circle cx="160" cy="160" r={R} fill="rgba(10,6,3,.5)" stroke="rgba(255,255,255,.2)" strokeWidth="22" strokeDasharray={`${A} ${2 * Math.PI * R}`} transform="rotate(135 160 160)" strokeLinecap="round" />
        <circle cx="160" cy="160" r={R} fill="none" stroke={col} strokeWidth="22" strokeDasharray={`${A * f + 0.01} ${2 * Math.PI * R}`} transform="rotate(135 160 160)" strokeLinecap="round" />
      </svg>
      <div style={{ position: "absolute", top: 86, width: "100%", textAlign: "center", fontFamily: HEADING, fontWeight: 800, fontSize: 88, color: P.bone, fontVariantNumeric: "tabular-nums" }}>{Math.round(v)}</div>
      <div style={{ position: "absolute", top: 190, width: "100%", textAlign: "center", fontFamily: BODY, fontWeight: 700, fontSize: 30, color: P.bone }}>CO₂ ppm</div>
    </div>
    <div style={{ marginTop: 64, textAlign: "center", opacity: done }}>
      <div style={{ fontFamily: HEADING, fontWeight: 800, fontSize: 66, color: P.amber, textShadow: "0 3px 20px rgba(0,0,0,.85)" }}>~10 YEARS</div>
      <div style={{ marginTop: 6, fontFamily: BODY, fontWeight: 600, fontSize: 31, lineHeight: 1.25, color: P.bone, textShadow: "0 2px 14px rgba(0,0,0,.95)" }}>Simplified estimate, ignores oceans</div>
    </div>
  </div>;
};
const S7: React.FC<{ off: number }> = ({ off }) => {
  const rel = useT(), t = rel + off;
  const a = W(6, "Plants"), b = W(6, "ten");
  const g = ss(a, b + 0.3, t), done = ss(W(6, "survival"), b, t);
  const v = mix(425.6, 150, g);
  return <AbsoluteFill><Canvas3D fog={[lerpHex("#b08859", "#57412d", g), 18, mix(120, 62, g)]}>
    <Sky top={lerpHex("#6c8ba5", "#3c3b3a", g)} horizon={lerpHex("#e0b67c", "#7a5533", g)} />
    <Camera pos={[rel * 0.45 - 5, 6.2 + Math.sin(t * 0.6) * 0.1, -18]} look={[rel * 0.3 - 2, 5.2, -50]} fov={62} />
    <hemisphereLight args={[lerpHex("#fff0d9", "#a49a8a", g), "#493422", mix(1.3, 1, g)]} />
    <SunShadow pos={[-30, 40, 10]} intensity={mix(2.5, 0.7, g)} size={40} at={[0, 0, -40]} />
    <Forest pile={2.1} litter={1} logs={1} center={[0, 0, -30]} tintAmount={0.45 + g * 0.55} canopyTint={lerpHex("#b8a22c", "#4d3a22", g)} canopyScale={mix(1, 0.62, g)} />
    <Glow count={400} t={t} size={0.16} path={(i, q) => { const k = (i * 0.193 + q * 0.2) % 1; return { p: [(noise(i, 3) - 0.5) * 48, mix(30, 6, k), -44 + (noise(i, 9) - 0.5) * 34], a: ss(0, 0.1, k) * (1 - ss(0.85, 1, k)) * mix(1, 0.15, g), color: P.cyan }; }} />
  </Canvas3D><Grade /><Gauge v={v} k={pop(t, W(6, "carbon") - 0.8)} done={done} /></AbsoluteFill>;
};

/* ---------- Scene 8: fire ---------- */
const Bolt: React.FC<{ on: number }> = ({ on }) => {
  const g = useMemo(() => { const r = rng(14), pts: THREE.Vector3[] = []; let x = 7, y = 65; for (let i = 0; i < 16; i++) { pts.push(new THREE.Vector3(x, y, -50)); x += (r() - 0.5) * 8; y -= 4.2; } return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0), 110, 0.3, 6); }, []);
  return on > 0 ? <mesh geometry={g}><meshBasicMaterial color="#f3fbff" fog={false} toneMapped={false} /></mesh> : null;
};
const S8: React.FC<{ off: number }> = ({ off }) => {
  const rel = useT(), t = rel + off, s = W(7, "lightning") - off;
  const after = rel - s, front = after > 0 ? mix(-46, -14, ss(0, 4.3, after)) : -200, burn = ss(0, 4, after);
  const flash = after > 0 ? Math.max(Math.exp(-after * 8) * (0.9 + 0.1 * Math.sin(after * 80)), after > 0.2 && after < 0.3 ? 0.6 : 0) : 0;
  const boltOn = after >= 0 && after < 0.32 && !(after > 0.09 && after < 0.2) ? 1 : 0;
  const shake = after > 0 ? Math.exp(-after * 3) * 0.1 + burn * 0.02 : 0;
  const back = ss(0, 3.8, after) * 4.5;
  const flames = useMemo(() => { const r = rng(44); return Array.from({ length: 1700 }, () => ({ x: (r() - 0.5) * 150, z: r(), w: r() * 6.28, h: 2 + r() * 6, s: 0.6 + r() * 1.3, c: r() })); }, []);
  const flameFill = (i: number, d: THREE.Object3D, c: THREE.Color) => {
    const f = flames[i]; const flick = 0.72 + 0.35 * Math.sin(t * (7 + f.w) + f.w * 8);
    d.position.set(f.x, 2.2, front - f.z * 16 + (noise(f.x * 0.12, 3) - 0.5) * 7);
    d.scale.set(f.s * flick, f.h * flick * (0.55 + 0.45 * (1 - f.z)) * ss(0, 0.7, after), f.s * flick);
    d.translateY(d.scale.y * 0.5); d.rotation.set(0, 0, Math.sin(t * 6 + f.w) * 0.12);
    c.set(f.c < 0.33 ? "#ffe07a" : f.c < 0.7 ? "#ff8c1f" : "#e2401a");
  };
  return <AbsoluteFill><Canvas3D fog={[lerpHex("#7d5233", "#3a1d10", burn), 16, 110]}>
    <Sky top={lerpHex("#3f3b3e", "#1f1211", burn)} horizon={lerpHex("#855b39", "#c9581e", burn)} />
    <Camera pos={[Math.sin(t * 37) * shake, 4.3 + Math.cos(t * 43) * shake, 0 + back]} look={[Math.sin(t * 29) * shake + 1.5 * (1 - burn), 5.4 + mix(5, 0, ss(0, 1.6, after + 0.8)), -44]} fov={62} roll={Math.sin(t * 13) * shake * 0.25} />
    <hemisphereLight args={["#a89a85", "#3b2619", mix(0.75, 0.5, burn)]} />
    <directionalLight position={[-10, 30, 10]} intensity={0.6} color="#d9c8ad" />
    <pointLight position={[0, 6, front + 4]} color="#ff7a24" intensity={after > 0 ? 900 * ss(0, 1, after) : 0} distance={70} />
    {flash > 0 ? <directionalLight position={[8, 60, -20]} intensity={flash * 6} color="#d9efff" /> : null}
    <Forest pile={2.1} litter={1} logs={1} center={[0, 0, -10]} tintAmount={1} canopyTint="#4d3a22" canopyScale={0.62} />
    <Bolt on={boltOn} />
    {after > 0 ? <>
      <mesh position={[0, 2.7, front - 95]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[240, 190]} /><meshBasicMaterial color="#120b08" /></mesh>
      <Instances count={1700} dep={t} fill={flameFill}><coneGeometry args={[1, 1, 7]} /><meshBasicMaterial transparent opacity={0.72} blending={THREE.AdditiveBlending} depthWrite={false} fog={false} toneMapped={false} /></Instances>
      <Glow count={420} t={t} size={0.11} path={(i, q) => { const k = (i * 0.173 + q * 0.28) % 1; return { p: [(noise(i, 21) - 0.5) * 70 + Math.sin(q * 2 + i) * 1.2, 2.5 + k * 22, front + 4 - noise(i, 23) * 16 + k * 6], a: ss(0, 0.05, k) * (1 - k) * ss(0, 0.7, after), color: "#ffb347" }; }} />
    </> : null}
  </Canvas3D><Grade flash={flash * 0.8} /><Label text="SPECULATIVE" at={0.2} size={46} color={P.amber} /></AbsoluteFill>;
};

/* ---------- Scene 9: renewal ---------- */
const Mushroom: React.FC<{ p: number[]; g: number; s?: number }> = ({ p, g, s = 1 }) => <group position={p as any} scale={g * s}>
  <mesh position={[0, 0.2, 0]} castShadow><cylinderGeometry args={[0.05, 0.08, 0.4, 10]} /><meshStandardMaterial color="#e8dcc6" /></mesh>
  <mesh position={[0, 0.38, 0]} scale={[1, 0.62, 1]} castShadow><sphereGeometry args={[0.2, 18, 12, 0, 6.283, 0, 1.6]} /><meshStandardMaterial color="#b75b2c" roughness={0.7} /></mesh>
</group>;
const S9: React.FC<{ off: number }> = ({ off }) => {
  const rel = useT(), t = rel + off, dur = CUTS[9] - CUTS[8];
  const rotT = ss(0.3, 2, rel), sprout = ss(W(8, "actually") - off - 0.3, W(8, "built") - off, rel), kneel = ss(0.2, 3, rel), hand = ss(W(8, "next") - off - 0.4, dur - 0.5, rel);
  const ash = useMemo(() => { const g = new THREE.PlaneGeometry(90, 90, 110, 110); g.rotateX(-Math.PI / 2); const p = g.attributes.position; for (let i = 0; i < p.count; i++) p.setY(i, (noise(p.getX(i) * 0.8, p.getZ(i) * 0.8) - 0.5) * 0.25 * ss(4, 8, Math.hypot(p.getX(i), p.getZ(i))) - 0.02); g.computeVertexNormals(); return g; }, []);
  const blades = useMemo(() => { const r = rng(9); return Array.from({ length: 1600 }, () => { const a = r() * 6.28, d = Math.pow(r(), 0.6) * 4.5; return { x: Math.cos(a) * d, z: Math.sin(a) * d, d, h: 0.1 + r() * 0.22, ry: r() * 3, tilt: (r() - 0.5) * 0.4 }; }); }, []);
  return <AbsoluteFill><Canvas3D fog={[lerpHex("#6f6a62", "#a6a288", sprout), 6, 50]}>
    <Sky top={lerpHex("#5c5a58", "#94b0bb", sprout)} horizon={lerpHex("#898176", "#d9cc9c", sprout)} />
    <Camera pos={[0.1, mix(1.9, 1, kneel), mix(3.8, 2.5, kneel)]} look={[0, mix(0.5, 0.2, kneel), 0]} fov={52} />
    <hemisphereLight args={["#fff5e0", "#4a4238", mix(1.2, 1.75, sprout)]} />
    <SunShadow pos={[-4, 8, 5]} intensity={mix(1, 2.8, sprout)} size={6} />
    <mesh geometry={ash} receiveShadow><meshStandardMaterial color={lerpHex("#6a6660", "#55493a", rotT)} roughness={1} /></mesh>
    <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={0.001 + rotT * 3.2} receiveShadow><circleGeometry args={[1, 40]} /><meshStandardMaterial color="#2b1e15" roughness={1} /></mesh>
    {[[-0.75, 0.02, -0.25], [0.8, 0.02, 0.05], [-0.42, 0.02, 0.45], [0.46, 0.02, -0.72], [-1.1, 0.02, -0.9], [1.25, 0.02, -0.7]].map((p, i) => <Mushroom key={i} p={p} g={ss(0.7 + i * 0.12, 1.6 + i * 0.12, rel)} s={0.75 + (i % 3) * 0.22} />)}
    {/* charred trunks */}
    <Instances count={30} fill={(i, d) => { const r = rng(i + 70), a = r() * 6.28, b = 9 + r() * 28; d.position.set(Math.cos(a) * b, 2.5, -Math.abs(Math.sin(a) * b) - 2); d.scale.set(0.5 + r() * 0.5, 5 + r() * 8, 0.5 + r() * 0.5); }}><cylinderGeometry args={[0.45, 0.6, 1, 7]} /><meshStandardMaterial color="#14100d" /></Instances>
    <Instances count={1600} dep={sprout} fill={(i, d, c) => { const b = blades[i], g = ss(b.d / 4.5 - 0.02, b.d / 4.5 + 0.2, sprout * 1.2); d.position.set(b.x, b.h * g * 0.5, b.z); d.rotation.set(b.tilt, b.ry, b.tilt); d.scale.set(0.014 * g, b.h * g, 0.014 * g); c.set(i % 2 ? "#5da445" : "#79bc55"); }}><coneGeometry args={[1, 1, 4]} /><meshStandardMaterial /></Instances>
    {/* sprout */}
    <group scale={sprout}>
      <mesh position={[0, 0.21, 0]} castShadow><cylinderGeometry args={[0.018, 0.03, 0.42, 10]} /><meshStandardMaterial color="#6cb04b" /></mesh>
      <mesh position={[0.13, 0.43, 0]} rotation={[0, 0, -0.45]} scale={[0.17, 0.025, 0.085]} castShadow><sphereGeometry args={[1, 14, 10]} /><meshStandardMaterial color="#82cb59" /></mesh>
      <mesh position={[-0.13, 0.46, 0]} rotation={[0, 0, 0.5]} scale={[0.17, 0.025, 0.085]} castShadow><sphereGeometry args={[1, 14, 10]} /><meshStandardMaterial color="#6ec04e" /></mesh>
    </group>
    <Hand grip={0.15} position={[mix(1.7, 0.5, hand), mix(0.1, 0.42, hand), mix(2.2, 1.1, hand)]} rotation={[-0.55, 0.6, 0.05]} scale={0.42} />
    <Falling t={t} at={[0, 0, 0]} count={280} spread={9} top={4.5} speed={0.05} size={0.42} colors={["#d1cbc1", "#a5a097", "#ece7dc"]} seed={12} />
  </Canvas3D><Grade /></AbsoluteFill>;
};

/* ---------- Scene 10: question ---------- */
const S10: React.FC<{ off: number }> = ({ off }) => {
  const rel = useT(), t = rel + off, end = TOTAL / FPS - 0.3;
  return <AbsoluteFill style={{ background: "#000" }}>{t < end ? <><Canvas3D fog={["#1c2c19", 5, 24]}>
    <Sky top="#0c130c" horizon="#3c5533" />
    <Camera pos={[0.05, 0.72, mix(3.25, 2.8, ss(0, 4, rel))]} look={[0, 0.45, 0]} fov={46} />
    <hemisphereLight args={["#fff0d6", "#1d2b16", 1.25]} />
    <SunShadow pos={[-3, 5, 3]} intensity={3.3} size={4} />
    <pointLight position={[2, 1, 1.5]} color={P.moss} intensity={7} />
    <Apple position={[0, 0.5, 0]} rotationY={t * 0.3} />
    <Hand rotation={[0, 0.75, 0]} />
  </Canvas3D><Grade /><Label text="WHAT WOULD YOU NEVER LET DECAY?" at={0.1} size={70} /></> : null}</AbsoluteFill>;
};

export const NoDecay: React.FC = () => {
  const f = (s: number) => Math.round(s * FPS);
  const S = [S1, S2, S3, S4, S5, S6, S7, S8, S9, S10] as React.FC<{ off: number }>[];
  const showCap = useCurrentFrame() / FPS < TOTAL / FPS - 0.3;
  return <AbsoluteFill style={{ background: "#000" }}>
    {S.map((C, i) => <Sequence key={i} from={f(CUTS[i])} durationInFrames={f(CUTS[i + 1]) - f(CUTS[i])}><C off={CUTS[i]} /></Sequence>)}
    {showCap ? <NarrationCaptions data={data as any} /> : null}
  </AbsoluteFill>;
};

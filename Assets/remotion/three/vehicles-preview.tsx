// Preview sheet for Vehicle. Rebuild: npx remotion still remotion/three/vehicles-preview.tsx VehiclePreview preview/vehicle-varieties.png --public-dir=public --gl=swangle --timeout=240000
import React from "react";
import { AbsoluteFill, Composition, registerRoot, useCurrentFrame } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import * as THREE from "three";
import { Camera } from "./kit";
import { VEHICLES, VEHICLE_VARIETIES, Vehicle } from "./vehicles";
import { HEADING } from "../theme";

const W = 2400, H = 3400, COLS = 4, ROWS = 6, DIST = 50, HALF = DIST * Math.tan((24 * Math.PI) / 180 / 2), HW = HALF * (W / H);
const cx = (i: number) => -HW + (2 * HW * (i + 0.5)) / COLS, cy = (r: number) => HALF - (2 * HALF * (r + 0.56)) / ROWS;
const Sheet: React.FC = () => {
  const t = useCurrentFrame() / 30;
  return <AbsoluteFill style={{ background: "#16273d" }}>
    <ThreeCanvas width={W} height={H} gl={{ antialias: true, logarithmicDepthBuffer: true, preserveDrawingBuffer: true, toneMapping: THREE.ACESFilmicToneMapping }}>
      <Camera pos={[0, 0, DIST]} look={[0, 0, 0]} fov={24} />
      <hemisphereLight args={["#ffffff", "#667788", 2.2]} />
      <directionalLight position={[10, 18, 20]} intensity={2.6} color="#fff6e8" />
      <directionalLight position={[-14, 2, 12]} intensity={0.9} color="#b4dcff" />
      {VEHICLE_VARIETIES.map((v, i) => { const e = VEHICLES[v], s = (2 * HW * 0.78) / COLS / e.length * (e.length < 3 ? 0.78 : 1); return <group key={v} position={[cx(i % COLS), cy(Math.floor(i / COLS)) - 0.75, 0]}><group scale={s} rotation={[0.2, -0.62, 0]}><Vehicle variety={v} t={t} speed={3} /></group></group>; })}
    </ThreeCanvas>
    {VEHICLE_VARIETIES.map((v, i) => <div key={v} style={{ position: "absolute", top: (Math.floor(i / COLS) * H) / ROWS + 34, left: ((i % COLS) * W) / COLS, width: W / COLS, textAlign: "center", fontFamily: HEADING, fontWeight: 800, fontSize: 38, color: "#F4F1EA" }}>{VEHICLES[v].label}</div>)}
  </AbsoluteFill>;
};
registerRoot(() => <Composition id="VehiclePreview" component={Sheet} width={W} height={H} fps={30} durationInFrames={60} />);

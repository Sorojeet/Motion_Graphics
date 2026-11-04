// Preview sheet for Fish. Rebuild: npx remotion still remotion/three/fish-preview.tsx FishPreview preview/fish-varieties.png --public-dir=public --gl=swangle
import React from "react";
import { AbsoluteFill, Composition, registerRoot, useCurrentFrame } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import * as THREE from "three";
import { Camera } from "./kit";
import { FISH, FISH_VARIETIES, Fish } from "./fish";
import { HEADING } from "../theme";

const W = 2160, H = 2800, COLS = 2, HALF = 5.16, rowY = (r: number) => 3.45 - r * 1.8;
const topPx = (y: number) => H / 2 - (y / HALF) * (H / 2);
const Sheet: React.FC = () => {
  const t = useCurrentFrame() / 30;
  return <AbsoluteFill style={{ background: "#0d1b2e" }}>
    <ThreeCanvas width={W} height={H} gl={{ antialias: true, preserveDrawingBuffer: true, toneMapping: THREE.ACESFilmicToneMapping }}>
      <Camera pos={[0, 0, 15]} look={[0, 0, 0]} fov={38} />
      <hemisphereLight args={["#ffffff", "#5a6a78", 2.1]} />
      <directionalLight position={[3, 8, 10]} intensity={2.3} color="#fff7ea" />
      <directionalLight position={[-6, -2, 5]} intensity={0.8} color="#a8d8ff" />
      {FISH_VARIETIES.map((v, i) => <Fish key={v} variety={v} t={t} swing={0.1} phase={i} shadows={false} scale={0.86} position={[(i % COLS === 0 ? -1 : 1) * 1.85 - 0.1 + 0.2, rowY(Math.floor(i / COLS)), 0]} rotation={[0.04, -0.3, 0]} />)}
    </ThreeCanvas>
    {FISH_VARIETIES.map((v, i) => <div key={v} style={{ position: "absolute", top: topPx(rowY(Math.floor(i / COLS)) + 0.95), left: i % COLS === 0 ? 0 : W / 2, width: W / 2, textAlign: "center", fontFamily: HEADING, fontWeight: 800, fontSize: 46, color: "#F4F1EA" }}>{FISH[v].label}</div>)}
  </AbsoluteFill>;
};
registerRoot(() => <Composition id="FishPreview" component={Sheet} width={W} height={H} fps={30} durationInFrames={60} />);

// Preview sheet for Man. Rebuild: npx remotion still remotion/three/man-preview.tsx ManPreview preview/man-character.png --public-dir=public --gl=swangle --timeout=240000
import React from "react";
import { AbsoluteFill, Composition, registerRoot } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import * as THREE from "three";
import { Camera } from "./kit";
import { MAN_OUTFITS, MAN_POSES, Man } from "./man";
import { HEADING } from "../theme";

const W = 2400, H = 5100, BG = "#16273d";
const L = () => <><hemisphereLight args={["#fff6ea", "#5a6470", 1.9]} /><directionalLight position={[3, 5, 6]} intensity={2.4} color="#fff2df" /><directionalLight position={[-5, 2, 2]} intensity={0.9} color="#a9d2ff" /></>;
const Lab: React.FC<{ x: number; y: number; w: number; t: string; size?: number }> = ({ x, y, w, t, size = 36 }) => <div style={{ position: "absolute", left: x, top: y, width: w, textAlign: "center", fontFamily: HEADING, fontWeight: 800, fontSize: size, color: "#F4F1EA", textShadow: "0 2px 8px #000" }}>{t}</div>;
const EX = ["neutral", "smile", "happy", "worried", "surprised", "angry", "thinking"];
const Sheet: React.FC = () => {
  const PW = 7.6, cellX = (i: number, n: number) => -PW / 2 + ((i + 0.5) * PW) / n;
  return <AbsoluteFill style={{ background: BG }}>
    {/* Turnaround */}
    <div style={{ position: "absolute", top: 0, left: 0 }}><ThreeCanvas width={W} height={1100} gl={{ antialias: true, preserveDrawingBuffer: true, toneMapping: THREE.ACESFilmicToneMapping }}><Camera pos={[0, 0.95, 8.6]} look={[0, 0.95, 0]} fov={15.5} /><L />{[0, 0.8, 1.57, 3.14].map((a, i) => <Man key={a} expression="smile" t={1} rotation={[0, -a, 0]} position={[(i - 1.5) * 1.05, 0, 0]} />)}</ThreeCanvas></div>
    {["Front", "Three-Quarter", "Side", "Back"].map((t, i) => <Lab key={t} x={(i * W) / 4} y={18} w={W / 4} t={t} />)}
    {/* Poses */}
    <div style={{ position: "absolute", top: 1100, left: 0 }}><ThreeCanvas width={W} height={2280} gl={{ antialias: true, preserveDrawingBuffer: true, toneMapping: THREE.ACESFilmicToneMapping }}><Camera pos={[0, 0, 16]} look={[0, 0, 0]} fov={24.3} /><L />{MAN_POSES.map((p, i) => <Man key={p} pose={p} expression={p === "shock" ? "surprised" : p === "think" ? "thinking" : p === "shrug" ? "worried" : "smile"} t={0.6} position={[((i % 4) - 1.5) * 1.81, 1.32 - Math.floor(i / 4) * 2.3, 0]} scale={0.98} rotation={[0, 0.1, 0]} />)}</ThreeCanvas></div>
    {MAN_POSES.map((p, i) => <Lab key={p} x={((i % 4) * W) / 4} y={1110 + Math.floor(i / 4) * 760} w={W / 4} t={p} size={32} />)}
    {/* Outfits */}
    <div style={{ position: "absolute", top: 4040, left: 0 }}><ThreeCanvas width={W} height={1060} gl={{ antialias: true, preserveDrawingBuffer: true, toneMapping: THREE.ACESFilmicToneMapping }}><Camera pos={[0, 0.98, 9]} look={[0, 0.98, 0]} fov={15} /><L />{MAN_OUTFITS.map((o, i) => <Man key={o} outfit={o} expression="smile" t={1} position={[(i - 2) * 0.85, 0, 0]} rotation={[0, 0.25, 0]} />)}</ThreeCanvas></div>
    {MAN_OUTFITS.map((o, i) => <Lab key={o} x={(i * W) / 5} y={4050} w={W / 5} t={o} />)}
    {/* Faces */}
    {EX.map((e, i) => <div key={e} style={{ position: "absolute", left: (i * W) / 7, top: 3400 }}><ThreeCanvas width={Math.floor(W / 7)} height={560} gl={{ antialias: true, preserveDrawingBuffer: true, toneMapping: THREE.ACESFilmicToneMapping }}><Camera pos={[0.05, 1.64, 0.82]} look={[0, 1.63, 0]} fov={24} /><L /><Man expression={e} t={1} /></ThreeCanvas></div>)}
    {EX.map((e, i) => <Lab key={e} x={(i * W) / 7} y={3970} w={W / 7} t={e} size={30} />)}
  </AbsoluteFill>;
};
registerRoot(() => <Composition id="ManPreview" component={Sheet} width={W} height={H} fps={30} durationInFrames={1} />);

// Preview sheets for FPHand. Rebuild: npx remotion still remotion/three/fphand-preview.tsx FPHandPreview preview/fp-hand.png --public-dir=public --gl=swangle --timeout=240000 (and FPHandDetail for preview/fp-hand-details.png)
import React from "react";
import { AbsoluteFill, Composition, registerRoot } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import * as THREE from "three";
import { Apple, Camera, Hand } from "./kit";
import { FPHand, FP_POSE_NAMES } from "./fphand";
import { HEADING } from "../theme";

const COL = 600, G = { antialias: true, preserveDrawingBuffer: true, toneMapping: THREE.ACESFilmicToneMapping };
const L = () => <><hemisphereLight args={["#fff6ea", "#5a6470", 2]} /><directionalLight position={[-2, 5, 3]} intensity={2.5} color="#fff2df" /><directionalLight position={[3, 1, 2]} intensity={0.7} color="#a9d2ff" /></>;
const Cell: React.FC<{ i: number; label: string; children: React.ReactNode; cam?: number[]; look?: number[] }> = ({ i, label, children, cam = [0.05, 2.1, 2.5], look = [0, 0.02, -0.15] }) => <div style={{ position: "absolute", left: (i % 4) * COL, top: Math.floor(i / 4) * 600 }}><ThreeCanvas width={COL} height={600} gl={G}><Camera pos={cam} look={look} fov={40} /><L />{children}</ThreeCanvas><div style={{ position: "absolute", top: 18, width: COL, textAlign: "center", fontFamily: HEADING, fontWeight: 800, fontSize: 36, color: "#F4F1EA", textShadow: "0 2px 8px #000" }}>{label}</div></div>;
const Sheet: React.FC = () => <AbsoluteFill style={{ background: "#16273d" }}>
  <Cell i={0} label="Old hand, with apple" cam={[0.05, 0.75, 2.75]} look={[0, 0.46, 0]}><Apple position={[0, 0.5, 0]} /><Hand rotation={[0, 0.75, 0]} /></Cell>
  <Cell i={1} label="New hand, with apple" cam={[0.05, 0.75, 2.75]} look={[0, 0.46, 0]}><Apple position={[0, 0.52, -0.15]} /><FPHand pose="hold" rotation={[0, 0.75, 0]} /></Cell>
  {FP_POSE_NAMES.map((p, i) => <Cell key={p} i={i + 2} label={p}><FPHand pose={p} rotation={p === "thumbsup" ? [0, 0, -Math.PI / 2] : [0, 0, 0]} /></Cell>)}
</AbsoluteFill>;
const BACK = [0, 0, Math.PI];
const Detail: React.FC = () => <AbsoluteFill style={{ background: "#16273d" }}>
  <Cell i={0} label="Back of hand" cam={[0, 2.4, 0.7]} look={[0, 0.2, -0.4]}><FPHand pose="open" rotation={BACK} position={[0, 0.25, 0]} /></Cell>
  <Cell i={1} label="Knuckles and tendons" cam={[0.05, 1.5, 0.25]} look={[0, 0.25, -0.25]}><FPHand pose="relaxed" rotation={BACK} position={[0, 0.25, 0]} /></Cell>
  <Cell i={2} label="Palm close-up" cam={[0, 1.6, 0.6]} look={[0, 0, -0.1]}><FPHand pose="open" /></Cell>
  <Cell i={3} label="Nails" cam={[0.05, 1.05, -0.45]} look={[0, 0.22, -1.0]}><FPHand pose="open" rotation={BACK} position={[0, 0.25, 0]} /></Cell>
  <Cell i={4} label="Rolled sleeve" cam={[0.05, 3, 2.8]} look={[0, 0, 0.9]}><FPHand pose="relaxed" sleeve="rolled" /></Cell>
  <Cell i={5} label="Short sleeve" cam={[0.05, 3.1, 3.3]} look={[0, 0, 1.1]}><FPHand pose="relaxed" sleeve="short" colors={{ sleeve: "#d9a441", cuff: "#b98a32" }} /></Cell>
  <Cell i={6} label="Long sleeve" cam={[0.05, 2.6, 2.3]} look={[0, 0, 0.5]}><FPHand pose="relaxed" /></Cell>
  <Cell i={7} label="Watch" cam={[0.05, 1.85, 1.8]} look={[0, 0.15, 0.3]}><FPHand pose="relaxed" sleeve="bare" watch rotation={BACK} position={[0, 0.25, 0]} /></Cell>
</AbsoluteFill>;
registerRoot(() => <><Composition id="FPHandPreview" component={Sheet} width={2400} height={1800} fps={30} durationInFrames={1} /><Composition id="FPHandDetail" component={Detail} width={2400} height={1200} fps={30} durationInFrames={1} /></>);

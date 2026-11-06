// Preview sheet for spaceprops. Rebuild: npx remotion still remotion/three/spaceprops-preview.tsx SpacePreview preview/space-props.png --public-dir=public --gl=swangle --timeout=240000
import React from "react";
import { AbsoluteFill, Composition, registerRoot } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import * as THREE from "three";
import { Camera } from "./kit";
import { Bubble, Candle, Earth, Globe, GREETINGS, Hourglass, StarField, Sun, TimeCity } from "./spaceprops";
import { HEADING } from "../theme";

const W = 2400, H = 2800, BG = "#16273d", CW = 600, CH = 700;
const L = () => <><hemisphereLight args={["#fff6ea", "#5a6470", 1.6]} /><directionalLight position={[3, 5, 6]} intensity={2.2} color="#fff2df" /><directionalLight position={[-5, 2, 2]} intensity={0.8} color="#a9d2ff" /></>;
const gl = { antialias: true, preserveDrawingBuffer: true, toneMapping: THREE.ACESFilmicToneMapping };
const Cell: React.FC<{ x: number; y: number; label: string; bg?: string; children: React.ReactNode; w?: number; h?: number }> = ({ x, y, label, bg = BG, children, w = 1, h = 1 }) => (
  <div style={{ position: "absolute", left: x * CW, top: y * CH, width: CW * w, height: CH * h, background: bg, border: "2px solid #0b1424" }}>
    <ThreeCanvas width={CW * w - 4} height={CH * h - 4} gl={gl}>{children}</ThreeCanvas>
    <div style={{ position: "absolute", left: 0, right: 0, top: 10, textAlign: "center", fontFamily: HEADING, fontWeight: 800, fontSize: 30, color: "#F4F1EA", textShadow: "0 2px 8px #000" }}>{label}</div>
  </div>
);
const Sheet: React.FC = () => <AbsoluteFill style={{ background: BG }}>
  <Cell x={0} y={0} w={2} label="Hourglass · 20% fallen · 70% turned · time frozen"><Camera pos={[0, 1.4, 8.5]} look={[0, 1.3, 0]} fov={34} /><L /><Hourglass p={0.2} position={[-2.2, 0, 0]} /><Hourglass p={0.7} rotation={[0, 0.9, 0]} /><Hourglass p={0.45} frozen position={[2.2, 0, 0]} /></Cell>
  <Cell x={2} y={0} label="Desk globe"><Camera pos={[0, 1.0, 3.6]} look={[0, 0.8, 0]} fov={36} /><L /><Globe spin={0.9} /></Cell>
  <Cell x={3} y={0} label="Candle · new and burnt" bg="#0b0d14"><Camera pos={[0, 0.5, 2.6]} look={[0, 0.4, 0]} fov={34} /><ambientLight intensity={0.25} /><Candle burn={0.1} t={1} position={[-0.3, 0, 0]} /><Candle burn={0.9} t={2.3} position={[0.3, 0, 0]} light={false} /></Cell>
  <Cell x={0} y={1} w={4} label="Earth · lush  →  drying  →  boiling oceans  →  dead"><Camera pos={[0, 0, 8.6]} look={[0, 0, 0]} fov={30} /><L />
    <Earth position={[-3.6, 0, 0]} /><Earth position={[-1.2, 0, 0]} life={0.5} sea={0.5} spin={1} /><Earth position={[1.2, 0, 0]} life={0.8} sea={0.3} boil={0.8} spin={2} /><Earth position={[3.6, 0, 0]} life={1} sea={0} spin={3} /></Cell>
  <Cell x={0} y={2} w={2} label="Sun  ·  red giant" bg="#04060d"><Camera pos={[0, 0, 8.4]} look={[0, 0, 0]} fov={40} /><Sun position={[-1.8, 0, 0]} scale={1.2} /><Sun giant={1} t={3} position={[1.8, 0, 0]} scale={1.2} /></Cell>
  <Cell x={2} y={2} label="Star field + galaxy" bg="#02030a"><Camera pos={[0, 0, 0]} look={[0.3, 0.1, -1]} fov={80} /><StarField t={1} /></Cell>
  <Cell x={3} y={2} label="Greeting bubbles"><Camera pos={[0, 0, 7]} look={[0, 0, 0]} fov={30} />{GREETINGS.map((g, i) => <Bubble key={i} text={g.text} font={g.font} width={1.3} position={[(i % 2 - 0.5) * 1.5, 2.0 - Math.floor(i / 2) * 1.1, 0]} />)}</Cell>
  <Cell x={0} y={3} label="Time-lapse city · era 0.1"><Camera pos={[0, 6, 14]} look={[0, 6, -20]} fov={50} /><L /><TimeCity era={0.1} night={0.2} fog="#8a7a68" /></Cell>
  <Cell x={1} y={3} label="era 0.5 (glass)"><Camera pos={[0, 6, 14]} look={[0, 6, -20]} fov={50} /><L /><TimeCity era={0.5} night={0.5} fog="#6e7f94" /></Cell>
  <Cell x={2} y={3} label="era 0.95 (neon, night)"><Camera pos={[0, 6, 14]} look={[0, 6, -20]} fov={50} /><L /><TimeCity era={0.95} night={1} fog="#1a1f33" /></Cell>
  <Cell x={3} y={3} label="era 0.33 (crumbling)"><Camera pos={[0, 6, 14]} look={[0, 6, -20]} fov={50} /><L /><TimeCity era={0.33} night={0.4} fog="#8a7a68" /></Cell>
</AbsoluteFill>;
registerRoot(() => <Composition id="SpacePreview" component={Sheet} width={W} height={H} fps={30} durationInFrames={1} />);

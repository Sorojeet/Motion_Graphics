// Preview sheet for Crowd. Rebuild: npx remotion still remotion/three/crowd-preview.tsx CrowdPreview preview/background-characters.png --public-dir=public --gl=swangle --timeout=240000
import React from "react";
import { AbsoluteFill, Composition, registerRoot } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import * as THREE from "three";
import { Camera } from "./kit";
import { Crowd, EXTRA_POSES, Extra } from "./crowd";
import { HEADING } from "../theme";

const W = 2400, G = { antialias: true, preserveDrawingBuffer: true, toneMapping: THREE.ACESFilmicToneMapping }, BG = "#16273d";
const L = () => <><hemisphereLight args={["#fff6ea", "#5a6470", 2]} /><directionalLight position={[3, 7, 6]} intensity={2.4} color="#fff2df" castShadow shadow-mapSize={[1024, 1024]} shadow-camera-left={-18} shadow-camera-right={18} shadow-camera-top={18} shadow-camera-bottom={-18} shadow-camera-far={50} /><directionalLight position={[-5, 2, 3]} intensity={0.7} color="#a9d2ff" /></>;
const Lab: React.FC<{ x: number; y: number; w: number; t: string }> = ({ x, y, w, t }) => <div style={{ position: "absolute", left: x, top: y, width: w, textAlign: "center", fontFamily: HEADING, fontWeight: 800, fontSize: 36, color: "#F4F1EA", textShadow: "0 2px 8px #000" }}>{t}</div>;
const KINDS: [string, object][] = [["man", {}], ["woman", {}], ["man", {}], ["woman", {}], ["boy", {}], ["girl", {}], ["elderman", {}], ["elderwoman", {}]];
const Sheet: React.FC = () => <AbsoluteFill style={{ background: BG }}>
  <div style={{ position: "absolute", top: 0 }}><ThreeCanvas width={W} height={1400} gl={G}><Camera pos={[0, 0, 14.5]} look={[0, 0, 0]} fov={24} /><L />
    {Array.from({ length: 24 }, (_, i) => <Extra key={i} seed={i * 3 + 2 + (i % 4 ? 1 : 0)} spec={i < 8 ? { kind: KINDS[i][0] as any } : undefined} t={1} shadows={false} position={[((i % 8) - 3.5) * 1.1, 1.1 - Math.floor(i / 8) * 2.06, 0]} rotationY={0.18} />)}</ThreeCanvas></div>
  <Lab x={0} y={14} w={W} t="Variety from seeds" />
  <div style={{ position: "absolute", top: 1400 }}><ThreeCanvas width={W} height={680} gl={G}><Camera pos={[0, 1, 11.6]} look={[0, 1, 0]} fov={15.5} /><L />{EXTRA_POSES.map((p, i) => <Extra key={p} seed={i * 5 + 3} pose={p} t={1.1} shadows={false} position={[((i) - 5) * 0.9, 0, 0]} rotationY={0.15} />)}</ThreeCanvas></div>
  {EXTRA_POSES.map((p, i) => <Lab key={p} x={(i * W) / 11} y={1410} w={W / 11} t={p} />)}
  <div style={{ position: "absolute", top: 2080 }}><ThreeCanvas width={W} height={1020} shadows gl={G}><fog attach="fog" args={["#16273d", 14, 42]} /><Camera pos={[0, 1.9, 8]} look={[0, 0.85, -4]} fov={38} /><L /><mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -10]} receiveShadow><planeGeometry args={[80, 80]} /><meshStandardMaterial color="#59616b" /></mesh>
    <Crowd count={60} seed={4} center={[0, 0, -5]} area={[14, 16]} poses={["stand", "talk", "phone", "armscrossed", "walk", "lookup", "clap"]} t={2} /></ThreeCanvas></div>
  <Lab x={0} y={2095} w={W} t="60 people" />
</AbsoluteFill>;
registerRoot(() => <Composition id="CrowdPreview" component={Sheet} width={W} height={3100} fps={30} durationInFrames={1} />);

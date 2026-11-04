// Preview sheet for Tree and Leaf. Rebuild: npx remotion still remotion/three/trees-preview.tsx TreePreview preview/tree-varieties.png --public-dir=public --gl=swangle --timeout=240000
import React from "react";
import { AbsoluteFill, Composition, registerRoot } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import * as THREE from "three";
import { Camera } from "./kit";
import { LEAF_LABELS, LEAF_VARIETIES, Leaf, TREES, TREE_VARIETIES, Tree, treeHeight, treeReach } from "./trees";
import { HEADING } from "../theme";

const W = 2400, H = 3400, COLS = 4, ROWS = 5, DIST = 70, HALF = DIST * Math.tan((24 * Math.PI) / 180 / 2), HW = HALF * (W / H);
const cx = (i: number) => -HW + (2 * HW * (i + 0.5)) / COLS, base = (r: number) => HALF - (2 * HALF * (r + 0.97)) / ROWS, cellH = (2 * HALF) / ROWS;
const Sheet: React.FC = () => <AbsoluteFill style={{ background: "#16273d" }}>
  <ThreeCanvas width={W} height={H} gl={{ antialias: true, preserveDrawingBuffer: true, logarithmicDepthBuffer: true, toneMapping: THREE.ACESFilmicToneMapping }}>
    <Camera pos={[0, 0, DIST]} look={[0, 0, 0]} fov={24} />
    <hemisphereLight args={["#fff8ec", "#5d6b58", 2.4]} />
    <directionalLight position={[12, 22, 24]} intensity={2.8} color="#fff4e0" />
    <directionalLight position={[-16, 4, 12]} intensity={0.7} color="#b4dcff" />
    {TREE_VARIETIES.map((v, i) => <Tree key={v} variety={v} wind={0} shadows={false} scale={Math.min((cellH * 0.84) / treeHeight(v), (HW / COLS) * 0.94 / treeReach(v))} position={[cx(i % COLS), base(Math.floor(i / COLS)), 0]} />)}
    {LEAF_VARIETIES.map((v, i) => <Leaf key={v} variety={v} scale={cellH * 0.74} dry={v === "maple" ? 0 : v === "oak" ? 0.55 : 0} position={[cx(i % COLS), base(3 + Math.floor(i / COLS)) + cellH * 0.04, 0]} rotation={[-0.15, 0.22, 0]} />)}
  </ThreeCanvas>
  {[...TREE_VARIETIES.map((v) => TREES[v].label), ...LEAF_VARIETIES.map((v) => (v === "oak" ? "Oak Leaf, Half Dry" : LEAF_LABELS[v]))].map((l, i) => <div key={l} style={{ position: "absolute", top: (Math.floor(i / COLS) * H) / ROWS + 22, left: ((i % COLS) * W) / COLS, width: W / COLS, textAlign: "center", fontFamily: HEADING, fontWeight: 800, fontSize: 38, color: "#F4F1EA", textShadow: "0 2px 8px #000" }}>{l}</div>)}
</AbsoluteFill>;
registerRoot(() => <Composition id="TreePreview" component={Sheet} width={W} height={H} fps={30} durationInFrames={1} />);

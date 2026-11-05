// Reusable 3D game and award props: coin, trophy, game board, game piece, poker chips, table, chair, open book.
// Sizes are roughly real meters unless noted; everything rests on y = 0. Original and procedural.
import React, { useMemo } from "react";
import * as THREE from "three";

const lathe = (pts: number[][], seg = 32) => new THREE.LatheGeometry(pts.map((p) => new THREE.Vector2(p[0], p[1])), seg);
const GOLD = "#F2B632", GOLD_DARK = "#A87412";
const Gold: React.FC<{ c?: string; rough?: number }> = ({ c = GOLD, rough = 0.28 }) => <meshStandardMaterial color={c} metalness={0.4} roughness={rough} emissive={c} emissiveIntensity={0.22} />;

const starShape = (R: number, r: number) => { const s = new THREE.Shape(); for (let i = 0; i < 10; i++) { const a = Math.PI / 2 + (i * Math.PI) / 5, k = i % 2 ? r : R; const x = Math.cos(a) * k, y = Math.sin(a) * k; if (i) s.lineTo(x, y); else s.moveTo(x, y); } s.closePath(); return s; };

/** Radius 1, thickness 0.14, axis along y, centered at the origin, so it lies flat. Scale to fit. */
export const Coin: React.FC<{ position?: number[]; rotation?: number[]; scale?: number; color?: string }> = ({ position = [0, 0, 0], rotation = [0, 0, 0], scale = 1, color = GOLD }) => {
  const star = useMemo(() => new THREE.ExtrudeGeometry(starShape(0.56, 0.24), { depth: 0.022, bevelEnabled: false }), []);
  return <group position={position as any} rotation={rotation as any} scale={scale}>
    <mesh castShadow><cylinderGeometry args={[1, 1, 0.14, 64]} /><Gold c={color} /></mesh>
    {[1, -1].map((m) => <group key={m}>
      <mesh position={[0, m * 0.07, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.9, 0.035, 12, 64]} /><Gold c={color} /></mesh>
      <mesh geometry={star} position={[0, m * 0.07, 0]} rotation={[m > 0 ? -Math.PI / 2 : Math.PI / 2, 0, 0]}><Gold c={GOLD_DARK} rough={0.4} /></mesh>
    </group>)}
  </group>;
};

const CUP = lathe([[0, 0.2], [0.05, 0.2], [0.045, 0.27], [0.03, 0.31], [0.03, 0.37], [0.08, 0.41], [0.15, 0.5], [0.19, 0.62], [0.2, 0.74], [0.185, 0.74], [0.17, 0.62], [0.13, 0.5], [0, 0.44]]);
/** About 0.8 tall. */
export const Trophy: React.FC<{ position?: number[]; rotation?: number[]; scale?: number; color?: string; dim?: number }> = ({ position = [0, 0, 0], rotation = [0, 0, 0], scale = 1, color = GOLD, dim = 0 }) => <group position={position as any} rotation={rotation as any} scale={scale}>
  <mesh geometry={CUP} castShadow><meshStandardMaterial color={color} metalness={0.4} roughness={0.28} side={THREE.DoubleSide} emissive={color} emissiveIntensity={0.22 + dim} /></mesh>
  {[1, -1].map((m) => <mesh key={m} position={[m * 0.17, 0.6, 0]} rotation={[0, m > 0 ? 0 : Math.PI, 0]}><torusGeometry args={[0.07, 0.014, 8, 20, Math.PI * 1.2]} /><Gold c={color} /></mesh>)}
  <mesh position={[0, 0.06, 0]} castShadow><boxGeometry args={[0.24, 0.12, 0.24]} /><meshStandardMaterial color="#1b2333" roughness={0.45} /></mesh>
  <mesh position={[0, 0.16, 0]}><boxGeometry args={[0.15, 0.08, 0.15]} /><meshStandardMaterial color="#1b2333" roughness={0.45} /></mesh>
</group>;

/** Checkered board, 1 unit wide and flat on y = 0. */
export const GameBoard: React.FC<{ position?: number[]; rotation?: number[]; scale?: number; light?: string; dark?: string; frame?: string }> = ({ position = [0, 0, 0], rotation = [0, 0, 0], scale = 1, light = "#E9DFC8", dark = "#3C4A66", frame = "#5A3C24" }) => {
  const tex = useMemo(() => { const c = document.createElement("canvas"); c.width = c.height = 256; const x = c.getContext("2d")!; for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) { x.fillStyle = (i + j) % 2 ? dark : light; x.fillRect(i * 32, j * 32, 32, 32); } const t = new THREE.CanvasTexture(c); t.magFilter = THREE.NearestFilter; t.colorSpace = THREE.SRGBColorSpace; return t; }, [light, dark]);
  return <group position={position as any} rotation={rotation as any} scale={scale}>
    <mesh position={[0, 0.02, 0]} castShadow receiveShadow><boxGeometry args={[1.08, 0.04, 1.08]} /><meshStandardMaterial color={frame} roughness={0.5} /></mesh>
    <mesh position={[0, 0.041, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[1, 1]} /><meshStandardMaterial map={tex} roughness={0.42} /></mesh>
  </group>;
};

const PAWN = lathe([[0, 0], [0.042, 0], [0.042, 0.012], [0.03, 0.022], [0.016, 0.06], [0.014, 0.085], [0.024, 0.09], [0.014, 0.096], [0.021, 0.112], [0.022, 0.125], [0.014, 0.14], [0, 0.145]], 20);
/** Pawn-style piece, about 0.145 tall. */
export const GamePiece: React.FC<{ position?: number[]; rotation?: number[]; scale?: number; color?: string }> = ({ position = [0, 0, 0], rotation = [0, 0, 0], scale = 1, color = "#F4F1EA" }) => <mesh geometry={PAWN} position={position as any} rotation={rotation as any} scale={scale} castShadow><meshStandardMaterial color={color} roughness={0.35} /></mesh>;

/** Stack of `count` poker chips, each 0.08 wide. */
export const ChipStack: React.FC<{ count?: number; position?: number[]; color?: string; edge?: string; scale?: number }> = ({ count = 8, position = [0, 0, 0], color = "#E11D48", edge = "#F4F1EA", scale = 1 }) => <group position={position as any} scale={scale}>
  {Array.from({ length: count }, (_, i) => <group key={i} position={[Math.sin(i * 7.3) * 0.002, 0.0055 + i * 0.0105, Math.cos(i * 5.1) * 0.002]}>
    <mesh castShadow><cylinderGeometry args={[0.04, 0.04, 0.01, 24]} /><meshStandardMaterial color={color} roughness={0.5} /></mesh>
    <mesh position={[0, 0, 0]}><cylinderGeometry args={[0.0405, 0.0405, 0.004, 24]} /><meshStandardMaterial color={edge} roughness={0.5} /></mesh>
  </group>)}
</group>;

/** Round pedestal table, top at y = height. */
export const RoundTable: React.FC<{ radius?: number; height?: number; position?: number[]; color?: string; base?: string }> = ({ radius = 0.9, height = 0.74, position = [0, 0, 0], color = "#1F6F62", base = "#2B2118" }) => <group position={position as any}>
  <mesh position={[0, height - 0.025, 0]} castShadow receiveShadow><cylinderGeometry args={[radius, radius, 0.05, 56]} /><meshStandardMaterial color={base} roughness={0.5} /></mesh>
  <mesh position={[0, height + 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow><circleGeometry args={[radius * 0.93, 56]} /><meshStandardMaterial color={color} roughness={0.9} /></mesh>
  <mesh position={[0, height / 2, 0]} castShadow><cylinderGeometry args={[0.07, 0.1, height, 16]} /><meshStandardMaterial color={base} roughness={0.5} /></mesh>
  <mesh position={[0, 0.03, 0]} castShadow><cylinderGeometry args={[0.36, 0.42, 0.06, 28]} /><meshStandardMaterial color={base} roughness={0.5} /></mesh>
</group>;

/** Plain chair facing +z, seat at y = 0.47. */
export const Chair: React.FC<{ position?: number[]; rotationY?: number; color?: string; seat?: string }> = ({ position = [0, 0, 0], rotationY = 0, color = "#3A2A1C", seat = "#6B2F3A" }) => <group position={position as any} rotation={[0, rotationY, 0]}>
  <mesh position={[0, 0.455, 0]} castShadow><boxGeometry args={[0.46, 0.05, 0.46]} /><meshStandardMaterial color={seat} roughness={0.8} /></mesh>
  {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([x, z], i) => <mesh key={i} position={[x * 0.2, 0.215, z * 0.2]} castShadow><boxGeometry args={[0.04, 0.43, 0.04]} /><meshStandardMaterial color={color} roughness={0.6} /></mesh>)}
  {[-1, 1].map((x) => <mesh key={x} position={[x * 0.2, 0.72, -0.2]} castShadow><boxGeometry args={[0.04, 0.5, 0.04]} /><meshStandardMaterial color={color} roughness={0.6} /></mesh>)}
  <mesh position={[0, 0.88, -0.2]} castShadow><boxGeometry args={[0.44, 0.17, 0.035]} /><meshStandardMaterial color={color} roughness={0.6} /></mesh>
</group>;

/** Open book, about 0.42 wide, lying on y = 0, top edge toward -z. */
export const OpenBook: React.FC<{ position?: number[]; rotationY?: number; scale?: number; cover?: string; page?: string }> = ({ position = [0, 0, 0], rotationY = 0, scale = 1, cover = "#22577A", page = "#F2EBD9" }) => <group position={position as any} rotation={[0, rotationY, 0]} scale={scale}>
  {[-1, 1].map((m) => <group key={m} rotation={[0, 0, m * -0.09]}>
    <mesh position={[m * 0.105, 0.012, 0]} castShadow><boxGeometry args={[0.215, 0.012, 0.3]} /><meshStandardMaterial color={cover} roughness={0.6} /></mesh>
    <mesh position={[m * 0.1, 0.032, 0]}><boxGeometry args={[0.195, 0.028, 0.28]} /><meshStandardMaterial color={page} roughness={0.85} /></mesh>
    {[-0.09, -0.05, -0.01, 0.03, 0.07].map((z) => <mesh key={z} position={[m * 0.1, 0.0472, z]}><boxGeometry args={[0.14, 0.0015, 0.008]} /><meshBasicMaterial color="#8c8676" /></mesh>)}
  </group>)}
</group>;

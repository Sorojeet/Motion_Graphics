// Reusable 3D time-and-space props: hourglass, desk globe, greeting bubbles, Earth that can die, Sun that can swell
// into a red giant, candle, time-lapse city and star field. Original and procedural (shaders and generated geometry).
// Everything rests on y = 0 unless noted. Stylized, not scientific models. Preview: preview/space-props.png
import React, { useEffect, useLayoutEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { continueRender, delayRender, staticFile } from "remotion";
import { Instances, clamp, mix, rng, ss } from "./kit";

type V3 = number[];
const lathe = (pts: number[][], seg = 48) => new THREE.LatheGeometry(pts.map((p) => new THREE.Vector2(p[0], p[1])), seg);
const smooth = (pts: number[][], n = 5) => new THREE.SplineCurve(pts.map((p) => new THREE.Vector2(p[0], p[1]))).getPoints(pts.length * n).map((v) => [Math.max(0, v.x), v.y]);

const GLSL_NOISE = `
float h31(vec3 p){ p = fract(p * 0.3183099 + .1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float vn(vec3 x){ vec3 i = floor(x), f = fract(x); f = f * f * (3. - 2. * f);
  return mix(mix(mix(h31(i), h31(i + vec3(1,0,0)), f.x), mix(h31(i + vec3(0,1,0)), h31(i + vec3(1,1,0)), f.x), f.y),
             mix(mix(h31(i + vec3(0,0,1)), h31(i + vec3(1,0,1)), f.x), mix(h31(i + vec3(0,1,1)), h31(i + vec3(1,1,1)), f.x), f.y), f.z); }
float fbm(vec3 p){ float a = .5, s = 0.; for (int i = 0; i < 5; i++) { s += a * vn(p); p = p * 2.03 + vec3(1.7, 9.2, 3.1); a *= .5; } return s; }
`;
const VERT_OBJ = `varying vec3 vP; varying vec3 vN; varying vec3 vW;
void main(){ vP = position; vN = normalize(mat3(modelMatrix) * normal); vec4 w = modelMatrix * vec4(position, 1.); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`;
const OUT = `\n#include <colorspace_fragment>\n`;
const OUTL = `\n gl_FragColor.rgb = pow(gl_FragColor.rgb, vec3(2.2));\n#include <colorspace_fragment>\n`; // shows authored sRGB colors as written

/* ------------------------------------------------------------------ fonts for the greeting bubbles */
let fontPromise: Promise<void> | null = null;
const loadScriptFonts = () => (fontPromise ??= Promise.all([
  ["NotoDeva", "fonts/NotoSansDevanagari-Bold.woff2"], ["NotoArab", "fonts/NotoSansArabic-Bold.woff2"],
].map(async ([fam, file]) => { const f = new FontFace(fam, `url(${staticFile(file)})`, { weight: "700" }); document.fonts.add(await f.load()); })).then(() => undefined));
const useScriptFonts = () => {
  const [ok, setOk] = useState(false);
  useLayoutEffect(() => { const h = delayRender("Loading script fonts"); loadScriptFonts().then(() => { setOk(true); continueRender(h); }, () => { setOk(true); continueRender(h); }); }, []);
  return ok;
};

/* ------------------------------------------------------------------ hourglass */
// Inner glass radius for the lower bulb, measured down from the neck (y = 0 at the neck, bottom at y = -1).
const BULB = [[0.035, 0], [0.06, -0.04], [0.14, -0.12], [0.26, -0.24], [0.37, -0.4], [0.44, -0.58], [0.455, -0.72], [0.41, -0.88], [0.27, -0.97], [0.0, -1.0]];
const rIn = (d: number) => { // d = distance from the neck, 0..1
  for (let i = 1; i < BULB.length; i++) { const a = BULB[i - 1], b = BULB[i]; if (d <= -b[1]) { const k = clamp((d - -a[1]) / (-b[1] - -a[1])); return mix(a[0], b[0], k) * 0.97; } }
  return 0;
};
const bulbPts = smooth(BULB.map((p) => [p[0], p[1]]), 6);
const glassMat = () => new THREE.ShaderMaterial({
  transparent: true, depthWrite: false, side: THREE.DoubleSide, uniforms: { tint: { value: new THREE.Color("#cfe9f4") } },
  vertexShader: `varying vec3 vN; varying vec3 vV; void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`,
  fragmentShader: `uniform vec3 tint; varying vec3 vN; varying vec3 vV; void main(){ float f = pow(1. - abs(dot(normalize(vN), normalize(vV))), 2.6); float a = 0.07 + 0.6 * f; gl_FragColor = vec4(mix(tint, vec3(1.), f * 0.7), a);` + OUT + `}`,
});
const SAND = "#F0BE4C";

/** Wooden and brass hourglass, 2.5 tall, base on y = 0.
 *  p = how much sand has fallen (0 full on top, 1 all below). frozen = the stream stops and grains hang in the air. */
export const Hourglass: React.FC<{ p?: number; frozen?: boolean; position?: V3; rotation?: V3; scale?: number; wood?: string; brass?: string; sand?: string; t?: number }> = ({ p = 0.4, frozen = false, position = [0, 0, 0], rotation = [0, 0, 0], scale = 1, wood = "#5a3c24", brass = "#C9963A", sand = SAND, t = 0 }) => {
  const glass = useMemo(glassMat, []);
  const pq = Math.round(clamp(p) * 240) / 240;
  const bulbGeo = useMemo(() => lathe(bulbPts, 56), []);
  const sandLow = useMemo(() => {
    const pts: number[][] = [[0, -0.985]]; const yw = -0.985 + 0.03 + 0.5 * Math.pow(pq, 0.8); // top of the sand along the wall
    for (let y = -0.985; y <= yw; y += 0.02) pts.push([rIn(-y) * 0.985, y]);
    const rw = rIn(-yw) * 0.985; pts.push([rw, yw]); pts.push([rw * 0.5, yw + rw * 0.26 * (pq > 0.01 ? 1 : 0)]); pts.push([0, yw + rw * 0.5 * (pq > 0.01 ? 1 : 0)]);
    return lathe(pts, 40);
  }, [pq]);
  const sandHigh = useMemo(() => {
    const top = 0.9 * (1 - pq) + 0.02; // level above the neck
    const pts: number[][] = [[0, 0.02]]; for (let d = 0.02; d <= top; d += 0.02) pts.push([rIn(d) * 0.985, d]);
    const r = rIn(top) * 0.985; const dip = Math.min(0.05 + 0.1 * r, Math.max(0.005, top - 0.03)); pts.push([r, top]); pts.push([r * 0.45, top - dip * 0.4]); pts.push([0.02, top - dip]); pts.push([0, top - dip]);
    return lathe(pts, 40);
  }, [pq]);
  const grains = useMemo(() => { const r = rng(5); return Array.from({ length: 16 }, () => ({ x: (r() - 0.5) * 0.04, y: -0.1 - r() * 0.7, z: (r() - 0.5) * 0.04, s: 0.008 + r() * 0.008 })); }, []);
  const ywall = -0.985 + 0.03 + 0.5 * Math.pow(pq, 0.8), apex = ywall + rIn(-ywall) * 0.5;
  const post = useMemo(() => lathe([[0, 0], [0.03, 0], [0.034, 0.05], [0.022, 0.12], [0.03, 0.2], [0.02, 1.0], [0.026, 1.8], [0.02, 2.1], [0.034, 2.2], [0.03, 2.28], [0, 2.3]], 14), []);
  const plate = useMemo(() => lathe([[0, 0], [0.82, 0], [0.86, 0.02], [0.86, 0.1], [0.8, 0.14], [0.72, 0.15], [0.7, 0.18], [0, 0.18]], 48), []);
  return <group position={position as any} rotation={rotation as any} scale={scale}>
    <group position={[0, 1.27, 0]}>
      {/* base and top plates */}
      <mesh geometry={plate} position={[0, -1.24, 0]} castShadow><meshStandardMaterial color={wood} roughness={0.45} /></mesh>
      <mesh geometry={plate} position={[0, 1.24, 0]} rotation={[Math.PI, 0, 0]} castShadow><meshStandardMaterial color={wood} roughness={0.45} /></mesh>
      {[0, 1, 2].map((k) => <mesh key={k} geometry={post} position={[Math.cos(k * 2.0944 + 0.5) * 0.62, -1.15, Math.sin(k * 2.0944 + 0.5) * 0.62]} castShadow><meshStandardMaterial color={brass} metalness={0.7} roughness={0.35} /></mesh>)}
      {/* brass collars and neck */}
      {[-1.06, 1.06].map((y) => <mesh key={y} position={[0, y, 0]}><torusGeometry args={[0.2, 0.025, 10, 36]} /><meshStandardMaterial color={brass} metalness={0.7} roughness={0.32} /></mesh>)}
      <mesh position={[0, 0, 0]}><torusGeometry args={[0.075, 0.018, 10, 24]} /><meshStandardMaterial color={brass} metalness={0.7} roughness={0.3} /></mesh>
      {/* glass */}
      <mesh geometry={bulbGeo} material={glass} renderOrder={5} />
      <mesh geometry={bulbGeo} material={glass} scale={[1, -1, 1]} renderOrder={5} />
      {/* sand */}
      <mesh geometry={sandLow}><meshStandardMaterial color={sand} roughness={0.85} emissive={sand} emissiveIntensity={0.12} /></mesh>
      {pq < 0.985 ? <mesh geometry={sandHigh} rotation={[0, 0.4, 0]}><meshStandardMaterial color={sand} roughness={0.85} emissive={sand} emissiveIntensity={0.12} /></mesh> : null}
      {/* stream */}
      {!frozen && pq > 0.005 && pq < 0.995 ? <mesh position={[0, (apex - 0.02) / 2, 0]}><cylinderGeometry args={[0.009, 0.009, Math.max(0.01, -apex + 0.02), 6]} /><meshBasicMaterial color="#F7D78A" /></mesh> : null}
      {frozen ? grains.map((g, i) => <mesh key={i} position={[g.x, g.y + Math.sin(t * 0.8 + i) * 0.004, g.z]}><sphereGeometry args={[g.s, 8, 6]} /><meshBasicMaterial color="#FBE3A0" /></mesh>) : null}
    </group>
  </group>;
};

/* ------------------------------------------------------------------ globe */
const globeMat = (ocean = "#1e5f9c", land = "#4f9b4a") => new THREE.ShaderMaterial({
  uniforms: { uOcean: { value: new THREE.Color(ocean) }, uLand: { value: new THREE.Color(land) } },
  vertexShader: VERT_OBJ,
  fragmentShader: `${GLSL_NOISE} uniform vec3 uOcean; uniform vec3 uLand; varying vec3 vP; varying vec3 vN; varying vec3 vW;
  void main(){ vec3 p = normalize(vP); float h = fbm(p * 1.9 + 3.0) * .75 + fbm(p * 5.) * .25; float lat = abs(p.y);
    float land = smoothstep(.505, .52, h); float coast = smoothstep(.47, .505, h) * (1. - land);
    vec3 desert = vec3(.82, .68, .42); float m = fbm(p * 3. + 11.); vec3 lc = mix(desert, uLand, smoothstep(.3, .6, m * (1.1 - lat * .5)));
    lc = mix(lc, vec3(.55, .5, .44), smoothstep(.62, .72, h));
    vec3 oc = mix(uOcean * .55, uOcean * 1.25, smoothstep(.3, .5, h)); oc += vec3(.1, .22, .22) * coast;
    vec3 col = mix(oc, lc, land);
    col = mix(col, vec3(.95), smoothstep(.84, .9, lat + (fbm(p * 6.) - .5) * .08));
    // graticule every 15 degrees
    float lo = atan(p.z, p.x), la = asin(clamp(p.y, -1., 1.)); float gl = abs(fract(lo / .2618 + .5) - .5), gb = abs(fract(la / .2618 + .5) - .5);
    float gr = (1. - smoothstep(.0, .018, gl)) + (1. - smoothstep(.0, .018, gb)); col = mix(col, vec3(1.), clamp(gr, 0., 1.) * .13);
    vec3 n = normalize(vN); float d = max(dot(n, normalize(vec3(.5, .7, .8))), 0.); float v = max(dot(n, normalize(cameraPosition - vW)), 0.);
    col *= .42 + .85 * d; vec3 hv = normalize(normalize(vec3(.5, .7, .8)) + normalize(cameraPosition - vW)); col += (1. - land) * pow(max(dot(n, hv), 0.), 50.) * .35;
    col += vec3(.5, .7, 1.) * pow(1. - v, 3.) * .25;
    gl_FragColor = vec4(col, 1.);` + OUTL + `}`,
});

/** Brass-and-walnut desk globe, about 1.15 tall. spin = turn around its tilted axis, in radians. */
export const Globe: React.FC<{ spin?: number; position?: V3; rotation?: V3; scale?: number; brass?: string; wood?: string }> = ({ spin = 0, position = [0, 0, 0], rotation = [0, 0, 0], scale = 1, brass = "#C9963A", wood = "#4a2f1c" }) => {
  const mat = useMemo(() => globeMat(), []);
  const base = useMemo(() => lathe([[0, 0], [0.34, 0], [0.36, 0.02], [0.36, 0.06], [0.3, 0.1], [0.26, 0.12], [0.1, 0.16], [0.07, 0.3], [0.06, 0.34], [0, 0.34]], 36), []);
  const tilt = (23.5 * Math.PI) / 180;
  return <group position={position as any} rotation={rotation as any} scale={scale}>
    <mesh geometry={base} castShadow><meshStandardMaterial color={wood} roughness={0.4} /></mesh>
    <mesh position={[0, 0.355, 0]}><cylinderGeometry args={[0.09, 0.11, 0.03, 24]} /><meshStandardMaterial color={brass} metalness={0.75} roughness={0.3} /></mesh>
    <group position={[0, 0.82, 0]}>
      <group rotation={[0, 0, tilt]}>
        <mesh material={mat} rotation={[0, spin, 0]} castShadow><sphereGeometry args={[0.46, 64, 48]} /></mesh>
        {/* meridian arc and axis pins */}
        <mesh rotation={[0, 0, 0]}><torusGeometry args={[0.49, 0.014, 10, 64, Math.PI * 1.55]} /><meshStandardMaterial color={brass} metalness={0.8} roughness={0.28} /></mesh>
        <mesh position={[0, 0.5, 0]}><sphereGeometry args={[0.03, 12, 10]} /><meshStandardMaterial color={brass} metalness={0.8} roughness={0.25} /></mesh>
        <mesh position={[0, -0.5, 0]}><sphereGeometry args={[0.03, 12, 10]} /><meshStandardMaterial color={brass} metalness={0.8} roughness={0.25} /></mesh>
        <mesh position={[0, -0.46, 0]}><cylinderGeometry args={[0.01, 0.01, 0.1, 8]} /><meshStandardMaterial color={brass} metalness={0.8} roughness={0.25} /></mesh>
      </group>
      <mesh position={[0, -0.36, 0]}><cylinderGeometry args={[0.012, 0.02, 0.2, 10]} /><meshStandardMaterial color={brass} metalness={0.75} roughness={0.3} /></mesh>
    </group>
  </group>;
};

/* ------------------------------------------------------------------ greeting bubbles */
export const GREETINGS = [
  { text: "Hello", font: "Montserrat" }, { text: "नमस्ते", font: "NotoDeva" }, { text: "こんにちは", font: "Noto Sans CJK JP" },
  { text: "Hola", font: "Montserrat" }, { text: "مرحبا", font: "NotoArab" }, { text: "Bonjour", font: "Montserrat" },
  { text: "你好", font: "Noto Sans CJK SC" }, { text: "Ciao", font: "Montserrat" },
];
/** Speech-bubble sprite with a greeting. Always faces the camera. width is in world units. */
export const Bubble: React.FC<{ text: string; font?: string; position?: V3; width?: number; opacity?: number; color?: string; ink?: string }> = ({ text, font = "Montserrat", position = [0, 0, 0], width = 1, opacity = 1, color = "#F4F1EA", ink = "#16273d" }) => {
  const ready = useScriptFonts();
  const tex = useMemo(() => {
    const cv = document.createElement("canvas"); cv.width = 512; cv.height = 224; const x = cv.getContext("2d")!;
    x.fillStyle = color; x.beginPath(); x.roundRect(8, 8, 496, 160, 64); x.fill();
    x.beginPath(); x.moveTo(110, 160); x.lineTo(90, 214); x.lineTo(170, 164); x.closePath(); x.fill();
    x.fillStyle = ink; x.font = `700 84px "${font}", "Montserrat", sans-serif`; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText(text, 256, 92, 440);
    const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t;
  }, [text, font, color, ink, ready]);
  return <sprite position={position as any} scale={[width, width * (224 / 512), 1]}><spriteMaterial map={tex} transparent opacity={opacity} depthWrite={false} toneMapped={false} /></sprite>;
};

/* ------------------------------------------------------------------ Earth */
const earthMat = () => new THREE.ShaderMaterial({
  uniforms: { uLife: { value: 0 }, uSea: { value: 1 }, uBoil: { value: 0 }, uSun: { value: new THREE.Vector3(0.6, 0.35, 0.8) } },
  vertexShader: VERT_OBJ,
  fragmentShader: `${GLSL_NOISE} uniform float uLife, uSea, uBoil; uniform vec3 uSun; varying vec3 vP; varying vec3 vN; varying vec3 vW;
  void main(){ vec3 p = normalize(vP); float h = fbm(p * 1.9 + 3.0) * .75 + fbm(p * 5.) * .25; float lat = abs(p.y);
    float sea = mix(.26, .52, uSea); float moist = fbm(p * 3. + 11.);
    float g = (1. - uLife) * smoothstep(.18, .5, moist * (1.25 - lat * .6));
    vec3 desert = vec3(.78, .63, .38), lush = vec3(.2, .5, .22), grass = vec3(.38, .6, .26);
    vec3 land = mix(desert, mix(grass, lush, smoothstep(.45, .8, moist)), g);
    land = mix(land, vec3(.5, .45, .4), smoothstep(.64, .78, h) * (1. - uLife * .4));
    vec3 dead = mix(vec3(.5, .34, .2), vec3(.24, .16, .12), smoothstep(.3, .75, moist)); float crack = smoothstep(.04, .0, abs(fbm(p * 9.) - .5)); dead = mix(dead, vec3(.12, .06, .05), crack * .8 * smoothstep(.55, 1., uLife)); land = mix(land, dead, uLife * .95);
    float seabed = (1. - smoothstep(.5, .54, h)) * (1. - uSea); land = mix(land, mix(vec3(.72, .66, .55), vec3(.3, .24, .2), moist), seabed * .8);
    float depth = clamp((sea - h) / sea, 0., 1.); vec3 oc = mix(vec3(.1, .45, .66), vec3(.02, .1, .3), smoothstep(.0, .4, depth));
    oc = mix(oc, vec3(.62, .72, .75), uBoil * .8);
    float isLand = smoothstep(sea - .004, sea + .004, h); vec3 col = mix(oc, land, isLand);
    float ice = smoothstep(.84, .9, lat + (fbm(p * 6.) - .5) * .08 + uLife * .22); col = mix(col, vec3(.95, .97, 1.), ice * (1. - uLife * .9));
    vec3 n = normalize(vN), l = normalize(uSun), v = normalize(cameraPosition - vW); float d = max(dot(n, l), 0.); float term = smoothstep(-.05, .3, dot(n, l));
    col *= .05 + 1.15 * term * (.55 + .45 * d); vec3 hv = normalize(l + v); col += (1. - isLand) * (1. - uBoil) * pow(max(dot(n, hv), 0.), 70.) * .5 * term;
    vec3 atm = mix(vec3(.35, .6, 1.), vec3(.9, .55, .3), uLife); col += atm * pow(1. - max(dot(n, v), 0.), 3.) * .4 * (.25 + .75 * term);
    gl_FragColor = vec4(col, 1.);` + OUTL + `}`,
});
const cloudMat = () => new THREE.ShaderMaterial({
  transparent: true, depthWrite: false, uniforms: { uCloud: { value: 1 }, uTime: { value: 0 }, uSun: { value: new THREE.Vector3(0.6, 0.35, 0.8) } },
  vertexShader: VERT_OBJ,
  fragmentShader: `${GLSL_NOISE} uniform float uCloud, uTime; uniform vec3 uSun; varying vec3 vP; varying vec3 vN; varying vec3 vW;
  void main(){ vec3 p = normalize(vP); float c = fbm(p * 2.8 + vec3(uTime * .03, 0., 0.)) * .7 + fbm(p * 7. + 4.) * .3; float a = smoothstep(.5, .72, c) * uCloud;
    vec3 n = normalize(vN); float term = smoothstep(-.1, .35, dot(n, normalize(uSun))); gl_FragColor = vec4(vec3(.97, .98, 1.) * (.12 + .95 * term), a * .88);` + OUT + `}`,
});

/** Stylized Earth, radius 1. life: 0 lush to 1 dead. sea: 1 full oceans to 0 dry basins. boil: 0..1 oceans turn to steam.
 *  clouds: 0..1. spin: rotation about the vertical axis. A simplified model, not a scientific render. */
export const Earth: React.FC<{ life?: number; sea?: number; boil?: number; clouds?: number; spin?: number; t?: number; sun?: V3; position?: V3; scale?: number; tilt?: number }> = ({ life = 0, sea = 1, boil = 0, clouds = 1, spin = 0, t = 0, sun = [0.6, 0.35, 0.8], position = [0, 0, 0], scale = 1, tilt = 0.41 }) => {
  const m = useMemo(earthMat, []), cm = useMemo(cloudMat, []);
  m.uniforms.uLife.value = life; m.uniforms.uSea.value = sea; m.uniforms.uBoil.value = boil; m.uniforms.uSun.value.set(sun[0], sun[1], sun[2]);
  cm.uniforms.uCloud.value = clouds * (1 - life * 0.85) * (0.25 + 0.75 * sea) + boil * 0.8; cm.uniforms.uTime.value = t; cm.uniforms.uSun.value.set(sun[0], sun[1], sun[2]);
  return <group position={position as any} scale={scale} rotation={[0, 0, tilt]}>
    <mesh material={m} rotation={[0, spin, 0]}><sphereGeometry args={[1, 96, 64]} /></mesh>
    <mesh material={cm} rotation={[0, spin * 1.15 + 1, 0]}><sphereGeometry args={[1.012, 80, 56]} /></mesh>
  </group>;
};

/* ------------------------------------------------------------------ Sun / red giant */
const sunMat = () => new THREE.ShaderMaterial({
  uniforms: { uGiant: { value: 0 }, uTime: { value: 0 } }, vertexShader: VERT_OBJ,
  fragmentShader: `${GLSL_NOISE} uniform float uGiant, uTime; varying vec3 vP; varying vec3 vN; varying vec3 vW;
  void main(){ vec3 p = normalize(vP); float g = fbm(p * 7. + vec3(uTime * .05, uTime * .03, 0.)); float s = smoothstep(.5, .3, fbm(p * 2.6 + vec3(0., uTime * .02, 3.)));
    vec3 hot = mix(vec3(1., .86, .38), vec3(1., .34, .12), uGiant), cool = mix(vec3(1., .52, .1), vec3(.55, .08, .04), uGiant);
    vec3 col = mix(cool, hot, smoothstep(.35, .7, g)); col *= 1. - .5 * s; float mu = max(dot(normalize(vN), normalize(cameraPosition - vW)), 0.); col *= mix(.5, 1.05, pow(mu, .45));
    gl_FragColor = vec4(col, 1.);` + OUTL + `}`,
});
const glowTex = (inner: string, outer: string) => { const cv = document.createElement("canvas"); cv.width = cv.height = 256; const x = cv.getContext("2d")!; const g = x.createRadialGradient(128, 128, 0, 128, 128, 128); g.addColorStop(0, inner); g.addColorStop(0.35, outer); g.addColorStop(1, "rgba(0,0,0,0)"); x.fillStyle = g; x.fillRect(0, 0, 256, 256); const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t; };

/** Sun, radius 1. giant: 0 yellow Sun to 1 swollen red giant. Scale it up with `scale`. */
export const Sun: React.FC<{ giant?: number; t?: number; flares?: boolean; position?: V3; scale?: number }> = ({ giant = 0, t = 0, flares = true, position = [0, 0, 0], scale = 1 }) => {
  const m = useMemo(sunMat, []); m.uniforms.uGiant.value = giant; m.uniforms.uTime.value = t;
  const warm = useMemo(() => glowTex("rgba(255,235,170,0.95)", "rgba(255,150,40,0.35)"), []), red = useMemo(() => glowTex("rgba(255,120,70,0.95)", "rgba(220,40,20,0.35)"), []);
  const arcs = useMemo(() => { const r = rng(9); return Array.from({ length: 6 }, (_, i) => ({ a: (i / 6) * Math.PI * 2 + r() * 0.8, s: 0.22 + r() * 0.2, f: 0.6 + r() * 0.8, ph: r() * 6 })); }, []);
  const col = giant > 0.5 ? "#ff5a2a" : "#ffb347";
  return <group position={position as any} scale={scale}>
    <mesh material={m}><sphereGeometry args={[1, 96, 64]} /></mesh>
    <sprite scale={[3.4 + giant, 3.4 + giant, 1]}><spriteMaterial map={giant > 0.5 ? red : warm} transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} /></sprite>
    <sprite scale={[6.4 + giant * 2, 6.4 + giant * 2, 1]}><spriteMaterial map={giant > 0.5 ? red : warm} transparent opacity={0.45} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} /></sprite>
    {flares ? arcs.map((a, i) => { const k = 0.7 + 0.3 * Math.sin(t * a.f + a.ph); return <group key={i} position={[Math.cos(a.a), Math.sin(a.a), 0.05]} rotation={[0, 0, a.a - Math.PI / 2]} scale={[k, k, k]}>
      <mesh position={[0, 0, 0]}><torusGeometry args={[a.s, 0.045, 8, 28, Math.PI]} /><meshBasicMaterial color={col} transparent opacity={0.5} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} /></mesh></group>; }) : null}
  </group>;
};

/* ------------------------------------------------------------------ candle */
const flameMat = (core: boolean) => new THREE.ShaderMaterial({
  transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, uniforms: { uTime: { value: 0 }, uPow: { value: 1 } },
  vertexShader: `uniform float uTime; varying vec2 vUv; varying vec3 vN; varying vec3 vV; void main(){ vUv = uv; vec3 p = position; float y = uv.y;
    p.x += sin(uTime * 9. + y * 5.) * .06 * y * y + sin(uTime * 5.3 + 1.) * .04 * y; p.z += cos(uTime * 7.1 + y * 4.) * .05 * y * y; p.y *= 1. + .06 * sin(uTime * 11.);
    vec4 mv = modelViewMatrix * vec4(p, 1.); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`,
  fragmentShader: `uniform float uPow; varying vec2 vUv; varying vec3 vN; varying vec3 vV; void main(){ float y = vUv.y; float f = abs(dot(normalize(vN), normalize(vV)));
    vec3 c = mix(vec3(.2, .4, 1.), vec3(1., .86, .3), smoothstep(.0, .3, y)); c = mix(c, vec3(1., .42, .08), smoothstep(.35, .95, y));
    ${core ? "c = mix(c, vec3(1., .95, .8), .6);" : ""} float a = pow(f, 1.2) * (1. - smoothstep(.55, 1., y)) * uPow; gl_FragColor = vec4(c * a * 1.6, a);` + OUT + `}`,
});
const flameGeo = (h: number, w: number) => lathe(Array.from({ length: 24 }, (_, i) => { const y = i / 23; return [w * Math.pow(Math.sin(Math.PI * Math.pow(y, 0.62)), 0.95) * (1 - y * 0.35) * (y < 0.06 ? y / 0.06 : 1), y * h]; }), 28);

/** Brass candlestick with a melting candle and a flickering flame, about 0.62 tall with the flame. burn: 0 new to 1 stub.
 *  lit: 0 to 1 flame strength. Add `light` for a warm flickering point light. */
export const Candle: React.FC<{ burn?: number; lit?: number; t?: number; light?: boolean; position?: V3; rotation?: V3; scale?: number; wax?: string; brass?: string }> = ({ burn = 0.2, lit = 1, t = 0, light = true, position = [0, 0, 0], rotation = [0, 0, 0], scale = 1, wax = "#F1E6CC", brass = "#C9963A" }) => {
  const outer = useMemo(() => flameMat(false), []), inner = useMemo(() => flameMat(true), []);
  outer.uniforms.uTime.value = t; inner.uniforms.uTime.value = t + 3; outer.uniforms.uPow.value = lit; inner.uniforms.uPow.value = lit;
  const hgt = 0.34 - 0.2 * burn, glow = useMemo(() => glowTex("rgba(255,210,120,0.9)", "rgba(255,140,40,0.25)"), []);
  const holder = useMemo(() => lathe([[0, 0], [0.16, 0], [0.17, 0.015], [0.16, 0.03], [0.1, 0.05], [0.05, 0.08], [0.024, 0.12], [0.03, 0.2], [0.024, 0.26], [0.07, 0.3], [0.09, 0.32], [0.085, 0.34], [0, 0.34]], 32), []);
  const body = useMemo(() => lathe([[0, 0], [0.045, 0], [0.046, hgt - 0.02], [0.04, hgt - 0.005], [0.028, hgt - 0.018], [0, hgt - 0.022]], 28), [hgt]);
  const f = 0.9 + 0.1 * Math.sin(t * 13) * Math.sin(t * 7.3);
  return <group position={position as any} rotation={rotation as any} scale={scale}>
    <mesh geometry={holder} castShadow><meshStandardMaterial color={brass} metalness={0.8} roughness={0.3} /></mesh>
    <group position={[0, 0.34, 0]}>
      <mesh geometry={body} castShadow><meshStandardMaterial color={wax} roughness={0.55} emissive="#ffcf8a" emissiveIntensity={0.12 * lit} /></mesh>
      {[0.2, 2.4, 4.4].map((a, i) => <mesh key={i} position={[Math.cos(a) * 0.0455, hgt - 0.06 - i * 0.025, Math.sin(a) * 0.0455]}><capsuleGeometry args={[0.007, 0.05 + i * 0.015, 4, 8]} /><meshStandardMaterial color={wax} roughness={0.5} /></mesh>)}
      <mesh position={[0, hgt - 0.012, 0]}><cylinderGeometry args={[0.0035, 0.0035, 0.035, 6]} /><meshStandardMaterial color="#2a2018" roughness={0.9} /></mesh>
      <group position={[0, hgt + 0.01, 0]} scale={[f * lit + 0.001, f * lit + 0.001, f * lit + 0.001]}>
        <mesh geometry={flameGeo(0.11, 0.028)} material={outer} /><mesh geometry={flameGeo(0.07, 0.016)} material={inner} position={[0, 0.003, 0]} />
        <sprite position={[0, 0.05, 0]} scale={[0.6, 0.6, 1]}><spriteMaterial map={glow} transparent opacity={0.8 * lit} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} /></sprite>
        {light ? <pointLight position={[0, 0.06, 0.05]} color="#ffb45a" intensity={(2.2 + 0.5 * Math.sin(t * 17)) * lit} distance={6} decay={1.6} /> : null}
      </group>
    </group>
  </group>;
};

/* ------------------------------------------------------------------ time-lapse city */
const cityMat = (style: number) => new THREE.ShaderMaterial({
  uniforms: { uStyle: { value: style }, uNight: { value: 0.5 }, uLit: { value: 0.5 }, uSun: { value: new THREE.Vector3(0.5, 0.8, 0.4) }, uFog: { value: new THREE.Color("#8a7a68") }, uFogRange: { value: new THREE.Vector2(10, 70) } },
  vertexShader: `varying vec3 vN; varying vec3 vW; varying vec3 vC; void main(){ mat4 im = instanceMatrix; vec4 w = modelMatrix * im * vec4(position, 1.); vW = w.xyz; vN = normalize(mat3(modelMatrix) * mat3(im) * normal);
    #ifdef USE_INSTANCING_COLOR
    vC = instanceColor;
    #else
    vC = vec3(.6);
    #endif
    gl_Position = projectionMatrix * viewMatrix * w; }`,
  fragmentShader: `uniform float uStyle, uNight, uLit; uniform vec3 uSun, uFog; uniform vec2 uFogRange; varying vec3 vN; varying vec3 vW; varying vec3 vC;
  float h21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
  void main(){ vec3 n = normalize(vN); float side = step(abs(n.y), .5); vec2 uv = abs(n.x) > .5 ? vec2(vW.z, vW.y) : vec2(vW.x, vW.y);
    vec2 cell = uStyle > .5 ? vec2(.5, .55) : vec2(.4, .6); vec2 g = uv / cell, id = floor(g), f = fract(g);
    float win = step(.16, f.x) * step(f.x, .84) * step(.2, f.y) * step(f.y, .8) * side;
    float lit = step(1. - uLit, h21(id + uStyle * 7.3)); vec3 glow = mix(vec3(1., .82, .5), uStyle > 1.5 ? vec3(.3, .95, 1.) : vec3(.86, .92, 1.), h21(id * 1.7));
    float d = max(dot(n, normalize(uSun)), 0.); vec3 base = vC * (.3 + .85 * d); if (n.y > .5) base = vC * .55;
    vec3 sky = mix(vec3(.15, .2, .28), vec3(.55, .72, .9), f.y) * (1. - uNight * .7); vec3 dark = uStyle > .5 ? sky : vec3(.1, .09, .1);
    vec3 wc = mix(dark, glow * (1.2 + uStyle * .3), lit * uNight + lit * (1. - uNight) * .15); vec3 col = mix(base, wc, win);
    col += (uStyle > 1.5 ? vec3(.0, .25, .3) : vec3(0.)) * smoothstep(.0, 3., vW.y) * .0;
    float fog = smoothstep(uFogRange.x, uFogRange.y, length(vW - cameraPosition)); col = mix(col, uFog, fog); gl_FragColor = vec4(col, 1.);` + OUTL + `}`,
});
const PALETTES = [["#9b6a4a", "#b08a62", "#7a5a46", "#a98f74"], ["#6d7f94", "#8499ad", "#5c6f86", "#9fb0c0"], ["#2a3146", "#343c57", "#222a3c", "#40476a"]];

/** Buildings that rise, stand, crumble and are replaced three times as `era` runs 0 to 1 (brick, then glass, then neon towers).
 *  Fills the area behind z = -3. night: 0 day to 1 night windows. The sun and fog colors are for matching the scene. */
export const TimeCity: React.FC<{ era: number; seed?: number; slots?: number; area?: number[]; night?: number; fog?: string; fogRange?: number[]; position?: V3; maxHeight?: number }> = ({ era, seed = 3, slots = 56, area = [60, 55], night = 0.4, fog = "#8a7a68", fogRange = [14, 80], position = [0, 0, 0], maxHeight = 1 }) => {
  const mats = useMemo(() => [0, 1, 2].map(cityMat), []);
  mats.forEach((m, k) => { m.uniforms.uNight.value = night; m.uniforms.uLit.value = [0.45, 0.6, 0.75][k]; m.uniforms.uFog.value.set(fog); m.uniforms.uFogRange.value.set(fogRange[0], fogRange[1]); });
  const data = useMemo(() => { const r = rng(seed); return Array.from({ length: slots }, () => {
    const x = (r() - 0.5) * area[0], z = -3.5 - r() * area[1], w = 1.4 + r() * 2.4, dp = 1.4 + r() * 2.4, d0 = 0.2 + r() * 0.22, b1 = d0 + 0.02 + r() * 0.05, d1 = b1 + 0.18 + r() * 0.18, b2 = d1 + 0.02 + r() * 0.05;
    const far = 1 + Math.min(1, -z / 40) * 0.8; // distant buildings are taller so the skyline fills the frame
    const gens = [{ b: -0.2, d: d0, h: (2.5 + Math.pow(r(), 1.6) * 8) * far }, { b: b1, d: d1, h: (3.5 + Math.pow(r(), 1.4) * 14) * far }, { b: b2, d: 9, h: (5 + Math.pow(r(), 1.2) * 22) * far }];
    return { x, z, w, dp, gens, rot: (r() - 0.5) * 0.25, tilt: r() - 0.5, col: [0, 1, 2].map((k) => PALETTES[k][Math.floor(r() * 4)]) };
  }); }, [seed, slots]);
  const life = (g: { b: number; d: number }) => ({ up: ss(g.b, g.b + 0.07, era), fall: ss(g.d, g.d + 0.06, era) });
  const deb = useMemo(() => { const r = rng(seed + 50); return Array.from({ length: slots * 3 * 5 }, () => ({ a: r() * 6.28, rr: r(), s: 0.15 + r() * 0.35, v: 0.6 + r() })); }, [seed, slots]);
  return <group position={position as any}>
    {[0, 1, 2].map((k) => <Instances key={k} count={slots} dep={era} fill={(i, dd, c) => {
      const s = data[i], g = s.gens[k], { up, fall } = life(g), l = up * (1 - fall) * maxHeight, h = Math.max(0.0001, g.h * l);
      dd.position.set(s.x, h / 2 - fall * 0.4, s.z); dd.rotation.set(0, s.rot, fall * s.tilt * 0.35 * (1 - l * 0.2)); dd.scale.set(s.w * (1 + fall * 0.12), h, s.dp * (1 + fall * 0.12)); c.set(s.col[k]);
    }}><boxGeometry args={[1, 1, 1]} /><primitive object={mats[k]} attach="material" /></Instances>)}
    <Instances count={slots * 15} dep={era} fill={(i, dd, c) => {
      const si = Math.floor(i / 15), k = Math.floor((i % 15) / 5), s = data[si], g = s.gens[k], e = deb[i], { fall } = life(g);
      const on = fall > 0.01 && fall < 0.99 ? 1 : 0, y = g.h * (1 - fall * fall) * (0.2 + e.rr * 0.8);
      dd.position.set(s.x + Math.cos(e.a) * s.w * (0.5 + fall * e.v), Math.max(0.05, y), s.z + Math.sin(e.a) * s.dp * (0.5 + fall * e.v)); dd.rotation.set(fall * 6 * e.v, fall * 4, 0); dd.scale.setScalar(e.s * on * (1 - fall * 0.5)); c.set(PALETTES[k][0]);
    }}><boxGeometry args={[1, 1, 1]} /><meshStandardMaterial roughness={0.9} /></Instances>
  </group>;
};

/* ------------------------------------------------------------------ star field */
/** Star field with a Milky Way band, colored nebula glows and a distant spiral galaxy, all around the camera.
 *  t drives twinkling and a slow drift. Add it as the background of a space scene. */
export const StarField: React.FC<{ t?: number; seed?: number; stars?: number; drift?: number; position?: V3; radius?: number }> = ({ t = 0, seed = 11, stars = 3000, drift = 0.4, position = [0, 0, 0], radius = 90 }) => {
  const sp = useMemo(() => { const r = rng(seed), tint = ["#ffffff", "#cfe0ff", "#ffe8c4", "#ffd0b0", "#b8ccff"]; return Array.from({ length: stars }, () => { const u = r() * 2 - 1, a = r() * 6.28, q = Math.sqrt(1 - u * u); return { d: [q * Math.cos(a), u, q * Math.sin(a)], s: 0.1 + Math.pow(r(), 4) * 0.5, ph: r() * 6.28, f: 0.6 + r() * 2, c: tint[Math.floor(r() * 5)], rr: 0.78 + r() * 0.22 }; }); }, [seed, stars]);
  const band = useMemo(() => { const r = rng(seed + 1); return Array.from({ length: 2600 }, () => { const a = r() * 6.28, g = (r() + r() + r() - 1.5) * 0.28; const v = new THREE.Vector3(Math.cos(a), g, Math.sin(a)).normalize().applyAxisAngle(new THREE.Vector3(1, 0, 0), 0.9); return { d: [v.x, v.y, v.z], s: 0.12 + r() * 0.22, c: r() > 0.5 ? "#c7d3ff" : "#ffe0c0" }; }); }, [seed]);
  const gal = useMemo(() => { const r = rng(seed + 2); return Array.from({ length: 1400 }, (_, i) => { const arm = i % 2, k = Math.pow(r(), 0.7), ang = k * 7 + arm * Math.PI + (r() - 0.5) * 0.5, rad = k * 9; return { p: [Math.cos(ang) * rad, (r() - 0.5) * 0.5 * (1 - k), Math.sin(ang) * rad], s: 0.05 + r() * 0.12, c: k < 0.25 ? "#ffe6b0" : "#9fb8ff" }; }); }, [seed]);
  const neb = useMemo(() => [glowTex("rgba(120,80,220,0.5)", "rgba(60,40,140,0.2)"), glowTex("rgba(60,150,220,0.45)", "rgba(30,80,150,0.18)"), glowTex("rgba(220,90,130,0.4)", "rgba(120,40,70,0.15)")], []);
  const mk = (children: React.ReactNode) => <meshBasicMaterial transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} fog={false} />;
  return <group position={position as any} rotation={[0, t * 0.004 * drift, 0]}>
    <Instances count={stars} dep={t} fill={(i, d, c) => { const s = sp[i]; d.position.set(s.d[0] * radius * s.rr, s.d[1] * radius * s.rr, s.d[2] * radius * s.rr); d.scale.setScalar(s.s * (0.75 + 0.25 * Math.sin(t * s.f + s.ph))); c.set(s.c); }}><sphereGeometry args={[1, 6, 4]} />{mk(null)}</Instances>
    <Instances count={band.length} dep={0} fill={(i, d, c) => { const s = band[i]; d.position.set(s.d[0] * radius * 0.96, s.d[1] * radius * 0.96, s.d[2] * radius * 0.96); d.scale.setScalar(s.s); c.set(s.c); }}><sphereGeometry args={[1, 5, 4]} /><meshBasicMaterial transparent opacity={0.55} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} fog={false} /></Instances>
    {neb.map((tx, i) => <sprite key={i} position={[[-30, 18, -60], [38, -10, -55], [8, 30, -70]][i].map((v) => v * 1.0) as any} scale={[[46, 30][i % 2] * 1.4, 36, 1]}><spriteMaterial map={tx} transparent opacity={0.55} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} fog={false} /></sprite>)}
    <group position={[26, 14, -70]} rotation={[0.9, 0.4, 0.2]} scale={1.1}>
      <Instances count={gal.length} dep={0} fill={(i, d, c) => { const s = gal[i]; d.position.set(s.p[0], s.p[1], s.p[2]); d.scale.setScalar(s.s); c.set(s.c); }}><sphereGeometry args={[1, 5, 4]} /><meshBasicMaterial transparent opacity={0.85} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} fog={false} /></Instances>
      <sprite scale={[5, 5, 1]}><spriteMaterial map={neb[0]} transparent opacity={0.9} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} fog={false} /></sprite>
    </group>
  </group>;
};

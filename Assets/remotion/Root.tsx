import React from "react";
import { AbsoluteFill, Audio, Composition, staticFile, useCurrentFrame } from "remotion";
import demo from "../public/narration/demo/narration.json";
import * as A from "./components";

const Stage: React.FC<{ action: A.Action; look: "alex" | "maya" }> = ({ action, look }) => (
  <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}><A.Character action={action} look={look} height={900} /></AbsoluteFill>
);
const NarrationDemo: React.FC = () => {
  const t = useCurrentFrame() / 30; const beat = demo.beats.find((b, i) => t < (demo.beats[i + 1]?.start ?? 1e9)) ?? demo.beats[0];
  return <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 42%, ${A.Palette.surfaceAlt}, ${A.Palette.bg} 55%, ${A.Palette.bgDeep})` }}>
    <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center", paddingTop: 300 }}><A.Character look={beat.voice === "michael" ? "alex" : "maya"} action="idle" height={950} /></AbsoluteFill>
    <A.NarrationCaptions data={demo} />
    <Audio src={staticFile("narration/demo/narration.wav")} />
  </AbsoluteFill>;
};
export const clips: [string, React.FC<any>, number][] = [
  ["TitleCard", A.TitleCard, 90], ["LowerThird", A.LowerThird, 90], ["Caption", A.Caption, 75], ["StatCounter", A.StatCounter, 90], ["Callout", A.Callout, 75], ["EndCard", A.EndCard, 90],
  ["CircleIris", A.CircleIris, 31], ["DiagonalWipe", A.DiagonalWipe, 31], ["StripeWipe", A.StripeWipe, 31], ["ShutterWipe", A.ShutterWipe, 31], ["Flash", A.Flash, 15],
  ["Confetti", A.Confetti, 90], ["Explosion", A.Explosion, 75], ["Snow", A.Snow, 120], ["Rain", A.Rain, 60], ["Smoke", A.Smoke, 120], ["Sparks", A.Sparks, 90], ["Dust", A.Dust, 150],
];
export const Root: React.FC = () => <>
  {clips.flatMap(([id, C, d]) => [
    <Composition key={id} id={`${id}-9x16`} component={C} width={1080} height={1920} fps={30} durationInFrames={d} />,
    <Composition key={id + "w"} id={`${id}-16x9`} component={C} width={1920} height={1080} fps={30} durationInFrames={d} />,
  ])}
  {(["alex", "maya"] as const).flatMap((look) => (["walk", "wave", "cheer", "idle"] as const).map((action) =>
    <Composition key={look + action} id={`${look}-${action}`} component={Stage as any} defaultProps={{ look, action }} width={600} height={900} fps={30} durationInFrames={action === "walk" ? 40 : 60} />
  ))}
  <Composition id="NarrationDemo" component={NarrationDemo} width={1080} height={1920} fps={30} durationInFrames={Math.ceil((demo.duration + 0.5) * 30)} />
</>;

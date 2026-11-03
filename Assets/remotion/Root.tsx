import React from "react";
import { AbsoluteFill, Composition } from "remotion";
import * as A from "./components";

const Stage: React.FC<{ action: A.Action; look: "alex" | "maya" }> = ({ action, look }) => (
  <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}><A.Character action={action} look={look} height={900} /></AbsoluteFill>
);
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
</>;

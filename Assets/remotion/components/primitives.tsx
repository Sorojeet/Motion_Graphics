import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { icons } from "../../lib/icons.js";
import { shapes } from "../../lib/shapes.js";
import { props as propArt } from "../../lib/props.js";
import { characterMarkup, lerpPose, poses, presets } from "../../lib/character.js";
import { c } from "../theme";

type Box = { size?: number; style?: React.CSSProperties };

export const Icon: React.FC<Box & { name: keyof typeof icons; color?: string; strokeWidth?: number }> = ({ name, size = 96, color = c.white, strokeWidth = 2, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={style} dangerouslySetInnerHTML={{ __html: icons[name] }} />
);

export const Shape: React.FC<Box & { name: keyof typeof shapes; color?: string }> = ({ name, size = 200, color = c.cyan, style }) => (
  <svg width={size} height={size} viewBox="0 0 512 512" style={style} dangerouslySetInnerHTML={{ __html: shapes[name].replaceAll("COLOR", color) }} />
);

export const Prop: React.FC<Box & { name: string }> = ({ name, size = 300, style }) => (
  <svg width={size} height={size} viewBox="0 0 512 512" style={style} dangerouslySetInnerHTML={{ __html: (propArt(c) as Record<string, string>)[name] }} />
);

export type Action = "idle" | "walk" | "wave" | "cheer" | "shrug" | "think" | "point" | "surprised" | "sad";
export type CharacterProps = { look?: keyof typeof presets | Record<string, string>; action?: Action; height?: number; speed?: number; style?: React.CSSProperties };

// A jointed character. Motion loops on its own; pass `look` to swap presets or custom colors.
export const Character: React.FC<CharacterProps> = ({ look = "alex", action = "idle", height = 800, speed = 1, style }) => {
  const frame = useCurrentFrame() * speed;
  const { fps } = useVideoConfig();
  const t = (frame / fps) * Math.PI * 2; // one radian cycle per second
  const swing = (Math.sin(t) + 1) / 2;
  const sw = Math.sin(t);
  let pose: Record<string, number | string>;
  if (action === "walk") pose = lerpPose(poses["walk-a"], poses["walk-b"], (Math.sin(t * 1.5) + 1) / 2);
  else if (action === "wave") pose = { ...poses.wave, rElbow: 34 + 26 * Math.sin(t * 2), bob: 2 * sw };
  else if (action === "cheer") { const j = Math.abs(Math.sin(t * 1.5)); pose = { ...poses.cheer, bob: -30 * j, lShoulder: -142 - 14 * j, rShoulder: 142 + 14 * j }; }
  else if (action === "idle") pose = { ...poses.idle, bob: 3 * sw, lShoulder: -14 - 2 * swing, rShoulder: 14 + 2 * swing };
  else pose = { ...poses[action], bob: 2 * sw };
  const l = typeof look === "string" ? presets[look] : look;
  return <svg height={height} width={height * (600 / 900)} viewBox="0 0 600 900" style={style} dangerouslySetInnerHTML={{ __html: characterMarkup(pose, l as any) }} />;
};

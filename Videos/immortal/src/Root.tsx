import React from "react";
import { Composition } from "remotion";
import { Immortal, TOTAL } from "./Immortal";
export const Root: React.FC = () => <Composition id="Immortal" component={Immortal} width={1080} height={1920} fps={30} durationInFrames={TOTAL} />;

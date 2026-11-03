import React from "react";
import { Composition } from "remotion";
import { RainAlcohol, TOTAL } from "./RainAlcohol";
export const Root: React.FC = () => <Composition id="RainAlcohol" component={RainAlcohol} width={1080} height={1920} fps={30} durationInFrames={TOTAL} />;

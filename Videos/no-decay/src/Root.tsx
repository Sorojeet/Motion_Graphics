import React from "react";
import { Composition } from "remotion";
import { NoDecay, TOTAL } from "./NoDecay";
export const Root: React.FC = () => <Composition id="NoDecay" component={NoDecay} width={1080} height={1920} fps={30} durationInFrames={TOTAL} />;

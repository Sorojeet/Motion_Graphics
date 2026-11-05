import React from "react";
import { Composition } from "remotion";
import { AqiYear, TOTAL } from "./AqiYear";
export const Root: React.FC = () => <Composition id="AqiYear" component={AqiYear} width={1080} height={1920} fps={30} durationInFrames={TOTAL} />;

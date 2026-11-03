import { continueRender, delayRender, staticFile } from "remotion";
const files: [string, string, number][] = [
  ["Montserrat", "Montserrat_400Regular.ttf", 400], ["Montserrat", "Montserrat_500Medium.ttf", 500],
  ["Montserrat", "Montserrat_700Bold.ttf", 700], ["Montserrat", "Montserrat_800ExtraBold.ttf", 800],
  ["Inter", "Inter_400Regular.ttf", 400], ["Inter", "Inter_500Medium.ttf", 500],
  ["Inter", "Inter_600SemiBold.ttf", 600], ["Inter", "Inter_700Bold.ttf", 700],
];
let started = false;
export const loadFont = () => {
  if (started || typeof document === "undefined") return;
  started = true;
  const handle = delayRender("Loading fonts");
  Promise.all(files.map(async ([family, file, weight]) => {
    const f = new FontFace(family, `url(${staticFile(file)})`, { weight: String(weight) });
    document.fonts.add(await f.load());
  })).then(() => continueRender(handle));
};

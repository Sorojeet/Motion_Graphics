// Renders transparent WebM clips to animated/. Usage: npm run build:animated [-- filter] [--still]
// For After Effects or Premiere, add --mov to render ProRes 4444 to out/mov (not committed: large files).
import { bundle } from "@remotion/bundler";
import { renderMedia, renderStill, selectComposition, getCompositions } from "@remotion/renderer";
import { mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
const args = process.argv.slice(2), mov = args.includes("--mov"), still = args.includes("--still"), filter = args.find((a) => !a.startsWith("--"));
let browserExecutable; try { browserExecutable = createRequire(import.meta.url)("playwright").chromium.executablePath(); } catch { try { const r = createRequire("/opt/"); browserExecutable = r("playwright").chromium.executablePath(); } catch {} }
const serveUrl = await bundle({ entryPoint: path.resolve("remotion/index.ts"), publicDir: path.resolve("fonts") });
const comps = (await getCompositions(serveUrl, { browserExecutable })).filter((c) => !filter || new RegExp(filter).test(c.id));
const groupOf = (id) => /^(alex|maya)/.test(id) ? "characters" : /^(TitleCard|LowerThird|Caption|StatCounter|Callout|EndCard)/.test(id) ? "text" : /^(CircleIris|DiagonalWipe|StripeWipe|ShutterWipe|Flash)/.test(id) ? "transitions" : "effects";
for (const composition of comps) {
  const dir = mov ? `out/mov/${groupOf(composition.id)}` : `animated/${groupOf(composition.id)}`; mkdirSync(dir, { recursive: true });
  const t = Date.now();
  if (still) { mkdirSync("out/stills", { recursive: true }); for (const pct of [25, 50, 75]) await renderStill({ composition, serveUrl, browserExecutable, imageFormat: "png", frame: Math.floor((composition.durationInFrames - 1) * pct / 100), output: `out/stills/${composition.id}_${pct}.png` }); console.log(composition.id); continue; }
  await renderMedia({ composition, serveUrl, browserExecutable, imageFormat: "png", pixelFormat: mov ? "yuva444p10le" : "yuva420p", codec: mov ? "prores" : "vp9", proResProfile: mov ? "4444" : undefined, crf: mov ? undefined : 30, outputLocation: `${dir}/${composition.id}.${mov ? "mov" : "webm"}`, logLevel: "error" });
  console.log(composition.id, ((Date.now() - t) / 1000).toFixed(1) + "s");
}

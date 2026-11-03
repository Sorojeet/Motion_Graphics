// Regenerates every static asset from theme/theme.json. Run: npm run build:static
import { readFileSync, writeFileSync, mkdirSync, rmSync, readdirSync } from "node:fs";
import { Resvg } from "@resvg/resvg-js";
import { icons, iconSvg } from "../lib/icons.js";
import { shapes, shapeSvg } from "../lib/shapes.js";
import { props } from "../lib/props.js";
import { poses, presets, characterSvg } from "../lib/character.js";

const theme = JSON.parse(readFileSync("theme/theme.json", "utf8"));
const c = theme.colors, HF = theme.fonts.heading, BF = theme.fonts.body;
const fontFiles = readdirSync("fonts").filter((f) => f.endsWith(".ttf")).map((f) => `fonts/${f}`);
const png = (svg, opts = {}) => new Resvg(svg, { font: { fontFiles, loadSystemFonts: false, defaultFontFamily: BF }, ...opts }).render().asPng();
const emit = (dir, name, svg, pngOpts) => {
  mkdirSync(`${dir}/svg`, { recursive: true }); mkdirSync(`${dir}/png`, { recursive: true });
  writeFileSync(`${dir}/svg/${name}.svg`, svg); writeFileSync(`${dir}/png/${name}.png`, png(svg, pngOpts));
};
for (const d of ["shapes", "icons", "props", "characters", "backgrounds", "templates", "guides"]) rmSync(d, { recursive: true, force: true });

// Shapes: four tintable colorways
for (const [cn, col] of Object.entries({ white: c.white, cyan: c.cyan, amber: c.amber, coral: c.coral }))
  for (const n of Object.keys(shapes)) emit(`shapes/${cn}`, n, shapeSvg(n, col));
// Icons: white plus accent
for (const [cn, col] of Object.entries({ white: c.white, cyan: c.cyan }))
  for (const n of Object.keys(icons)) emit(`icons/${cn}`, n, iconSvg(n, col));
// Props
const P = props(c);
for (const n of Object.keys(P)) emit("props", n, `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">${P[n]}</svg>\n`);
// Characters
for (const k of Object.keys(presets)) for (const p of Object.keys(poses)) emit(`characters/${k}`, p, characterSvg(poses[p], presets[k]));

// Backgrounds, seeded so they rebuild identically
const rng = (seed) => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
const sizes = { "9x16": [1080, 1920], "16x9": [1920, 1080] };
const hills = (W, base, amp, seed, col) => { const r = rng(seed); const n = 6; let d = `M0 ${base}`; const ph = r() * 6;
  for (let i = 1; i <= n * 4; i++) { const x = (W * i) / (n * 4); d += `L${x.toFixed(0)} ${(base - amp * (Math.sin(ph + i * 0.55) * 0.6 + Math.sin(ph * 2 + i * 0.23) * 0.4)).toFixed(0)}`; }
  return `<path d="${d}V99999H0Z" fill="${col}" stroke="${col}" stroke-linejoin="round"/>`; };
const peaks = (W, H, base, seed, col, n, amp) => { const r = rng(seed); let d = `M0 ${H}L0 ${base}`; for (let i = 0; i <= n; i++) { const x = (W * (i + 0.5)) / n; d += `L${x.toFixed(0)} ${(base - amp * (0.45 + r() * 0.55)).toFixed(0)}L${(x + W / n / 2).toFixed(0)} ${(base - amp * r() * 0.2).toFixed(0)}`; } return `<path d="${d}L${W} ${H}Z" fill="${col}"/>`; };
const defsV = (id, a, b) => `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;
const stars = (W, H, n, seed, maxY = H) => { const r = rng(seed); let s = ""; for (let i = 0; i < n; i++) s += `<circle cx="${(r() * W).toFixed(0)}" cy="${(r() * maxY).toFixed(0)}" r="${(0.8 + r() * r() * 3).toFixed(1)}" fill="${c.white}" opacity="${(0.25 + r() * 0.75).toFixed(2)}"/>`; return s; };
const bgs = {
  "solid-gradient": (W, H) => `<defs>${defsV("g", c.surface, c.bgDeep)}</defs><rect width="${W}" height="${H}" fill="url(#g)"/>`,
  "spotlight": (W, H) => `<defs><radialGradient id="g" cx=".5" cy=".42" r=".75"><stop offset="0" stop-color="${c.surfaceAlt}"/><stop offset=".55" stop-color="${c.bg}"/><stop offset="1" stop-color="${c.bgDeep}"/></radialGradient></defs><rect width="${W}" height="${H}" fill="url(#g)"/>`,
  "grid": (W, H) => `<defs><pattern id="p" width="90" height="90" patternUnits="userSpaceOnUse"><path d="M90 0H0V90" fill="none" stroke="${c.surfaceAlt}" stroke-width="2"/></pattern>${defsV("g", c.bg, c.bgDeep)}</defs><rect width="${W}" height="${H}" fill="url(#g)"/><rect width="${W}" height="${H}" fill="url(#p)"/>`,
  "dots": (W, H) => `<defs><pattern id="p" width="60" height="60" patternUnits="userSpaceOnUse"><circle cx="30" cy="30" r="3.500" fill="${c.surfaceAlt}"/></pattern></defs><rect width="${W}" height="${H}" fill="${c.bg}"/><rect width="${W}" height="${H}" fill="url(#p)"/>`,
  "starfield": (W, H) => `<defs>${defsV("g", c.bgDeep, c.surface)}</defs><rect width="${W}" height="${H}" fill="url(#g)"/>${stars(W, H, Math.round((W * H) / 9000), 11)}`,
  "night-city": (W, H) => { const r = rng(29); let b = ""; for (const [col, hMin, hMax, lit] of [[c.surface, 0.2, 0.42, 0], [c.bgDeep, 0.1, 0.3, 1]]) { let x = -20; while (x < W) { const w = 90 + r() * 120, h = H * (hMin + r() * (hMax - hMin)), y = H - h; b += `<rect x="${x.toFixed(0)}" y="${y.toFixed(0)}" width="${w.toFixed(0)}" height="${h.toFixed(0)}" fill="${col}"/>`; if (lit) for (let wy = y + 24; wy < H - 30; wy += 44) for (let wx = x + 16; wx < x + w - 26; wx += 34) if (r() > 0.62) b += `<rect x="${wx.toFixed(0)}" y="${wy.toFixed(0)}" width="16" height="24" rx="2" fill="${c.amber}" opacity="${(0.5 + r() * 0.5).toFixed(2)}"/>`; x += w + 4; } } return `<defs>${defsV("g", c.bgDeep, c.surfaceAlt)}</defs><rect width="${W}" height="${H}" fill="url(#g)"/>${stars(W, H, 90, 5, H * 0.5)}${b}`; },
  "dusk-mountains": (W, H) => `<defs>${defsV("g", c.surface, c.coral)}</defs><rect width="${W}" height="${H}" fill="url(#g)"/><circle cx="${W * 0.5}" cy="${H * 0.58}" r="${Math.min(W, H) * 0.15}" fill="${c.amber}"/>${peaks(W, H, H * 0.72, 3, c.surfaceAlt, 5, H * 0.22)}${peaks(W, H, H * 0.82, 8, c.surface, 6, H * 0.18)}${peaks(W, H, H * 0.93, 17, c.bg, 7, H * 0.14)}`,
  "day-hills": (W, H) => `<defs>${defsV("g", "#38BDF8", "#BAE6FD")}</defs><rect width="${W}" height="${H}" fill="url(#g)"/><circle cx="${W * 0.78}" cy="${H * 0.16}" r="${Math.min(W, H) * 0.09}" fill="${c.amber}"/>${hills(W, H * 0.68, H * 0.035, 7, "#6EE7B7")}${hills(W, H * 0.77, H * 0.03, 13, "#34D399")}${hills(W, H * 0.87, H * 0.025, 21, "#10B981")}`,
  "ocean": (W, H) => `<defs>${defsV("g", "#0EA5E9", "#BAE6FD")}${defsV("o", "#0E7490", c.bgDeep)}</defs><rect width="${W}" height="${H}" fill="url(#g)"/><rect y="${H * 0.45}" width="${W}" height="${H * 0.55}" fill="url(#o)"/>${hills(W, H * 0.47, H * 0.008, 3, "#0891B2")}${hills(W, H * 0.58, H * 0.012, 9, "#0E7490")}${hills(W, H * 0.72, H * 0.016, 15, "#155E75")}${hills(W, H * 0.88, H * 0.02, 19, "#164E63")}`,
  "abstract-blobs": (W, H) => `<rect width="${W}" height="${H}" fill="${c.bg}"/><circle cx="${W * 0.1}" cy="${H * 0.12}" r="${Math.min(W, H) * 0.34}" fill="${c.cyanDark}" opacity=".5"/><circle cx="${W * 0.95}" cy="${H * 0.45}" r="${Math.min(W, H) * 0.3}" fill="${c.coralDark}" opacity=".45"/><circle cx="${W * 0.2}" cy="${H * 0.95}" r="${Math.min(W, H) * 0.36}" fill="${c.amberDark}" opacity=".35"/>`,
};
for (const [n, fn] of Object.entries(bgs)) for (const [sz, [W, H]] of Object.entries(sizes))
  emit(`backgrounds/${sz}`, n, `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${fn(W, H)}</svg>\n`);

// Transparent text templates. Text stays live in the SVG; edit it in any vector editor.
const T = (x, y, s, size, fill = c.text, font = HF, weight = 800, anchor = "middle") => `<text x="${x}" y="${y}" font-family="${font}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}">${s}</text>`;
const tpl = (W, H, sf) => {
  const m = W / 2;
  return {
    "title-card": `${T(m, H * 0.40, "WHAT IF", 76 * sf, c.cyan)}${T(m, H * 0.40 + 118 * sf, "YOUR TITLE", 104 * sf)}${T(m, H * 0.40 + 216 * sf, "GOES HERE", 104 * sf)}<rect x="${m - 80 * sf}" y="${H * 0.40 + 256 * sf}" width="${160 * sf}" height="${10 * sf}" rx="${5 * sf}" fill="${c.amber}"/>`,
    "lower-third": (() => { const x = 70 * sf, y = H * 0.66, w = W - 2 * x > 900 * sf ? 900 * sf : W - 240 * sf; return `<rect x="${x}" y="${y}" width="${w}" height="${170 * sf}" rx="${24 * sf}" fill="${c.surface}"/><rect x="${x}" y="${y}" width="${16 * sf}" height="${170 * sf}" rx="${8 * sf}" fill="${c.cyan}"/>${T(x + 50 * sf, y + 76 * sf, "Name Goes Here", 54 * sf, c.text, HF, 800, "start")}${T(x + 50 * sf, y + 132 * sf, "Short description or role", 36 * sf, c.muted, BF, 500, "start")}`; })(),
    "caption-box": (() => { const w = Math.min(W - 280 * sf, 840 * sf), x = m - w / 2 - 40 * sf, y = H * 0.68; return `<rect x="${x}" y="${y}" width="${w}" height="${170 * sf}" rx="${28 * sf}" fill="${c.bgDeep}" fill-opacity=".88"/>${T(x + w / 2, y + 72 * sf, "Captions sit here,", 50 * sf, c.text, BF, 700)}${T(x + w / 2, y + 134 * sf, `with a <tspan fill="${c.amber}">key word</tspan> in color`, 50 * sf, c.text, BF, 700)}`; })(),
    "stat-card": (() => { const w = 720 * sf, x = m - w / 2, y = H * 0.36; return `<rect x="${x}" y="${y}" width="${w}" height="${400 * sf}" rx="${36 * sf}" fill="${c.surface}"/>${T(m, y + 215 * sf, "00%", 170 * sf, c.amber)}${T(m, y + 310 * sf, "What this number means", 42 * sf, c.text, BF, 600)}${T(m, y + 362 * sf, "Source: add your source", 26 * sf, c.muted, BF, 400)}`; })(),
    "callout": (() => { const x = m - 300 * sf, y = H * 0.42; return `<circle cx="${x}" cy="${y + 54 * sf}" r="${16 * sf}" fill="${c.coral}"/><path d="M${x} ${y + 54 * sf}H${x + 110 * sf}" stroke="${c.coral}" stroke-width="${6 * sf}" stroke-linecap="round"/><rect x="${x + 110 * sf}" y="${y}" width="${500 * sf}" height="${108 * sf}" rx="${20 * sf}" fill="${c.coral}"/>${T(x + 360 * sf, y + 70 * sf, "Point this out", 50 * sf, c.bgDeep, HF, 800)}`; })(),
    "end-card": `${T(m, H * 0.40, "WHAT WOULD", 88 * sf)}${T(m, H * 0.40 + 104 * sf, "YOU DO?", 88 * sf, c.amber)}<rect x="${m - 290 * sf}" y="${H * 0.40 + 170 * sf}" width="${580 * sf}" height="${112 * sf}" rx="${56 * sf}" fill="${c.coral}"/>${T(m, H * 0.40 + 243 * sf, "FOLLOW FOR MORE", 44 * sf, c.bgDeep)}`,
    "chapter": `${T(m, H * 0.44, "PART 1", 50 * sf, c.cyan)}${T(m, H * 0.44 + 100 * sf, "Chapter Title", 92 * sf)}`,
    "quote": (() => { const y = H * 0.36; return `${T(m, y, "&#8220;", 220 * sf, c.cyan)}${T(m, y + 70 * sf, "A short line that", 66 * sf)}${T(m, y + 156 * sf, "people remember.", 66 * sf)}${T(m, y + 240 * sf, "Person's name, source", 34 * sf, c.muted, BF, 500)}`; })()
  };
};
for (const [sz, [W, H]] of Object.entries(sizes)) {
  const t = tpl(W, H, 1);
  for (const n of Object.keys(t)) emit(`templates/${sz}`, n, `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${t[n]}</svg>\n`);
}

// Safe-zone guides (do not export these into a final video)
for (const [sz, [W, H], sf] of [["9x16", sizes["9x16"], theme.safeZone916], ["16x9", sizes["16x9"], theme.safeZone169]]) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><path fill-rule="evenodd" d="M0 0H${W}V${H}H0ZM${sf.left} ${sf.top}V${H - sf.bottom}H${W - sf.right}V${sf.top}Z" fill="${c.coral}" fill-opacity=".28"/><rect x="${sf.left}" y="${sf.top}" width="${W - sf.left - sf.right}" height="${H - sf.top - sf.bottom}" fill="none" stroke="${c.green}" stroke-width="4" stroke-dasharray="20 14"/>${T(W / 2, H / 2, "SAFE AREA", 44, c.green)}</svg>\n`;
  emit("guides", `safe-zone-${sz}`, svg);
}

// CSS tokens for web/HTML use
writeFileSync("theme/theme.css", `:root {\n${Object.entries(c).map(([k, v]) => `  --${k.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase())}: ${v};`).join("\n")}\n  --font-heading: "${HF}", sans-serif;\n  --font-body: "${BF}", sans-serif;\n}\n`);
console.log("static assets built");

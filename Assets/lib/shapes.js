// Original basic shapes on a 512x512 canvas. Each takes one fill color.
const poly = (n, r, rot = -90, r2 = null, c = 256) => {
  const pts = [], m = r2 ? n * 2 : n;
  for (let i = 0; i < m; i++) {
    const a = ((rot + (360 / m) * i) * Math.PI) / 180, R = r2 && i % 2 ? r2 : r;
    pts.push(`${(c + R * Math.cos(a)).toFixed(1)},${(c + R * Math.sin(a)).toFixed(1)}`);
  }
  return `<polygon points="${pts.join(" ")}" fill="COLOR" stroke="COLOR" stroke-width="16" stroke-linejoin="round"/>`;
};
const dots = (() => { let s = ""; for (let y = 0; y < 6; y++) for (let x = 0; x < 6; x++) s += `<circle cx="${76 + x * 72}" cy="${76 + y * 72}" r="14" fill="COLOR"/>`; return s; })();
export const shapes = {
  circle: '<circle cx="256" cy="256" r="220" fill="COLOR"/>',
  ring: '<circle cx="256" cy="256" r="190" fill="none" stroke="COLOR" stroke-width="56"/>',
  square: '<rect x="56" y="56" width="400" height="400" rx="56" fill="COLOR"/>',
  pill: '<rect x="26" y="166" width="460" height="180" rx="90" fill="COLOR"/>',
  triangle: poly(3, 215, -90, null, 285),
  diamond: poly(4, 215),
  pentagon: poly(5, 215),
  hexagon: poly(6, 215),
  star: poly(5, 228, -90, 100),
  burst: poly(12, 232, -90, 150),
  blob: '<path d="M256 34c74 0 150 34 186 100 34 62 22 136-8 198-30 64-92 124-172 134-80 10-158-34-200-98C22 304 14 218 54 150 92 84 176 34 256 34z" fill="COLOR"/>',
  arrow: '<path d="M46 256h380M286 106l150 150-150 150" fill="none" stroke="COLOR" stroke-width="72" stroke-linecap="round" stroke-linejoin="round"/>',
  chevron: '<path d="M176 76l180 180-180 180" fill="none" stroke="COLOR" stroke-width="84" stroke-linecap="round" stroke-linejoin="round"/>',
  cross: '<path d="M256 76v360M76 256h360" fill="none" stroke="COLOR" stroke-width="84" stroke-linecap="round"/>',
  squiggle: '<path d="M36 256c37-90 73-90 110 0s73 90 110 0 73-90 110 0 73 90 110 0" fill="none" stroke="COLOR" stroke-width="44" stroke-linecap="round"/>',
  "speech-bubble": '<path d="M116 66h280a70 70 0 0 1 70 70v170a70 70 0 0 1-70 70H236l-96 86v-86h-24a70 70 0 0 1-70-70V136a70 70 0 0 1 70-70z" fill="COLOR"/>',
  "thought-bubble": '<ellipse cx="266" cy="196" rx="214" ry="146" fill="COLOR"/><circle cx="136" cy="372" r="42" fill="COLOR"/><circle cx="76" cy="452" r="24" fill="COLOR"/>',
  "dot-grid": dots,
  "half-circle": '<path d="M36 346a220 220 0 0 1 440 0z" fill="COLOR"/>',
  "quarter-circle": '<path d="M76 436V76a360 360 0 0 1 360 360z" fill="COLOR"/>'
};
export const shapeSvg = (name, color, size = 512) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512">${shapes[name].replaceAll("COLOR", color)}</svg>\n`;

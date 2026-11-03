// Jointed 2D character. All poses are joint angles, so characters can be animated by changing numbers.
// Canvas: 600 x 900. Angles are in degrees; 0 points straight down, positive swings toward screen-right.
const rad = (d) => (d * Math.PI) / 180;
const step = ([x, y], len, deg) => [x + len * Math.sin(rad(deg)), y + len * Math.cos(rad(deg))];
const f = (n) => n.toFixed(1);

export const skinTones = { light: "#F6CBA8", tan: "#DDA06F", brown: "#A9683F", deep: "#6F4228" };

export const presets = {
  alex: { skin: skinTones.tan, shirt: "#22D3EE", shirtShade: "#0891B2", pants: "#24365A", shoes: "#F4F7FB", hair: "#1B1B2F", hairStyle: "short" },
  maya: { skin: skinTones.brown, shirt: "#FB7185", shirtShade: "#E11D48", pants: "#F4F7FB", shoes: "#FBBF24", hair: "#2A1720", hairStyle: "long" }
};

// lShoulder/rShoulder etc. "l" is on the left of the screen. Elbow and knee angles are relative to the parent limb.
const base = { lShoulder: -14, lElbow: -6, rShoulder: 14, rElbow: 6, lHip: -7, lKnee: 0, rHip: 7, rKnee: 0, lean: 0, bob: 0, expression: "happy", look: 0 };
export const poses = {
  idle: {},
  wave: { rShoulder: 128, rElbow: 34, look: 3 },
  point: { rShoulder: 90, rElbow: 0, look: 8, expression: "neutral" },
  think: { rShoulder: 115, rElbow: -200, look: -5, expression: "neutral" },
  cheer: { lShoulder: -142, lElbow: -18, rShoulder: 142, rElbow: 18, expression: "excited", bob: -14 },
  shrug: { lShoulder: -58, lElbow: -112, rShoulder: 58, rElbow: 112, expression: "neutral" },
  surprised: { lShoulder: -48, lElbow: -128, rShoulder: 48, rElbow: 128, expression: "surprised" },
  sad: { lShoulder: -7, rShoulder: 7, lean: 0, bob: 8, expression: "sad", look: 0 },
  "walk-a": { lShoulder: -30, lElbow: -10, rShoulder: 8, rElbow: 14, lHip: -24, lKnee: 12, rHip: 5, rKnee: 0, look: 3, bob: -5 },
  "walk-b": { lShoulder: -8, lElbow: -14, rShoulder: 30, rElbow: 10, lHip: -5, lKnee: 0, rHip: 24, rKnee: -12, look: 3, bob: 3 }
};

export const lerpPose = (a, b, t) => {
  const A = { ...base, ...a }, B = { ...base, ...b }, out = {};
  for (const k of Object.keys(base)) out[k] = typeof A[k] === "number" ? A[k] + (B[k] - A[k]) * t : (t < 0.5 ? A[k] : B[k]);
  return out;
};

const face = (cx, cy, look, expr, c) => {
  const ex = cx + look, dark = "#1B1B2F";
  const eyes = expr === "surprised"
    ? `<circle cx="${ex - 24}" cy="${cy - 6}" r="9.5" fill="${dark}"/><circle cx="${ex + 24}" cy="${cy - 6}" r="9.5" fill="${dark}"/>`
    : `<circle cx="${ex - 24}" cy="${cy - 6}" r="7.5" fill="${dark}"/><circle cx="${ex + 24}" cy="${cy - 6}" r="7.5" fill="${dark}"/>`;
  const m = {
    happy: `<path d="M${ex - 19} ${cy + 19}Q${ex} ${cy + 39} ${ex + 19} ${cy + 19}" fill="none" stroke="${dark}" stroke-width="6" stroke-linecap="round"/>`,
    excited: `<path d="M${ex - 24} ${cy + 15}Q${ex} ${cy + 17} ${ex + 24} ${cy + 15}Q${ex + 17} ${cy + 47} ${ex} ${cy + 47}Q${ex - 17} ${cy + 47} ${ex - 24} ${cy + 15}Z" fill="${dark}"/><path d="M${ex - 14} ${cy + 36}Q${ex} ${cy + 27} ${ex + 14} ${cy + 36}Q${ex} ${cy + 50} ${ex - 14} ${cy + 36}Z" fill="#FB7185"/>`,
    neutral: `<path d="M${ex - 14} ${cy + 26}H${ex + 14}" stroke="${dark}" stroke-width="6" stroke-linecap="round"/>`,
    surprised: `<ellipse cx="${ex}" cy="${cy + 30}" rx="11" ry="15" fill="${dark}"/>`,
    sad: `<path d="M${ex - 17} ${cy + 33}Q${ex} ${cy + 16} ${ex + 17} ${cy + 33}" fill="none" stroke="${dark}" stroke-width="6" stroke-linecap="round"/>`
  }[expr] || "";
  const brow = expr === "sad"
    ? `<path d="M${ex - 36} ${cy - 22}L${ex - 15} ${cy - 30}M${ex + 36} ${cy - 22}L${ex + 15} ${cy - 30}" stroke="${dark}" stroke-width="5" stroke-linecap="round"/>`
    : expr === "surprised" ? `<path d="M${ex - 35} ${cy - 30}Q${ex - 24} ${cy - 38} ${ex - 13} ${cy - 30}M${ex + 13} ${cy - 30}Q${ex + 24} ${cy - 38} ${ex + 35} ${cy - 30}" fill="none" stroke="${dark}" stroke-width="5" stroke-linecap="round"/>` : "";
  return eyes + m + brow;
};

// Returns the inner SVG markup for a 600x900 canvas.
export const characterMarkup = (poseInput = {}, look = presets.alex) => {
  const p = { ...base, ...poseInput }, c = look;
  const hipY = 545 + p.bob, cx = 300, neckY = 300 + p.bob;
  const shoulderY = neckY + 28, sL = [cx - 62, shoulderY], sR = [cx + 62, shoulderY];
  const hL = [cx - 36, hipY], hR = [cx + 36, hipY];
  const limb = (a, b, d, color, w) => `<path d="M${f(a[0])} ${f(a[1])}L${f(b[0])} ${f(b[1])}L${f(d[0])} ${f(d[1])}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
  const arm = (s, sh, el, shade) => {
    const e = step(s, 92, sh), h = step(e, 88, sh + el), g = step(h, 12, sh + el);
    return limb(s, e, h, shade ? c.shirtShade : c.shirt, 38) + `<circle cx="${f(g[0])}" cy="${f(g[1])}" r="20" fill="${c.skin}"/>`;
  };
  const leg = (h, hip, kn, side) => {
    const k = step(h, 118, hip), a = step(k, 112, hip + kn);
    const out = side * 30, inn = -side * 18, top = a[1] - 6, sole = a[1] + 34;
    const x1 = a[0] + Math.min(out, inn), x2 = a[0] + Math.max(out, inn);
    return limb(h, k, a, c.pants, 46) + `<path d="M${f(x1)} ${f(sole)}C${f(x1 - 4)} ${f(top + 10)} ${f(x1 + 12)} ${f(top)} ${f(a[0])} ${f(top)}C${f(x2 - 12)} ${f(top)} ${f(x2 + 4)} ${f(top + 10)} ${f(x2)} ${f(sole)}Z" fill="${c.shoes}" stroke="${c.shoes}" stroke-width="6" stroke-linejoin="round"/>`;
  };
  const head = { x: cx, y: neckY - 85 };
  const hairBack = c.hairStyle === "long" ? `<path d="M${cx - 92} ${head.y - 8}C${cx - 94} ${head.y - 96} ${cx + 94} ${head.y - 96} ${cx + 92} ${head.y - 8}C${cx + 98} ${head.y + 55} ${cx + 96} ${head.y + 100} ${cx + 76} ${head.y + 132}H${cx - 76}C${cx - 96} ${head.y + 100} ${cx - 98} ${head.y + 55} ${cx - 92} ${head.y - 8}Z" fill="${c.hair}"/>` : "";
  const hairFront = c.hairStyle === "long"
    ? `<path d="M${cx - 86} ${head.y - 2}C${cx - 94} ${head.y - 112} ${cx + 94} ${head.y - 112} ${cx + 86} ${head.y - 2}C${cx + 62} ${head.y - 20} ${cx + 28} ${head.y - 34} ${cx + 4} ${head.y - 56}C${cx - 16} ${head.y - 32} ${cx - 54} ${head.y - 16} ${cx - 86} ${head.y - 2}Z" fill="${c.hair}"/>`
    : `<path d="M${cx - 84} ${head.y - 2}C${cx - 100} ${head.y - 104} ${cx + 96} ${head.y - 116} ${cx + 84} ${head.y - 2}C${cx + 76} ${head.y - 30} ${cx + 58} ${head.y - 42} ${cx + 30} ${head.y - 42}C${cx - 4} ${head.y - 40} ${cx - 66} ${head.y - 48} ${cx - 84} ${head.y - 2}Z" fill="${c.hair}"/>`;
  return (
    `<g transform="translate(0 60)">` + hairBack +
    leg(hL, p.lHip, p.lKnee, -1) + leg(hR, p.rHip, p.rKnee, 1) +
    arm(sL, p.lShoulder, p.lElbow, true) +
    `<rect x="${cx - 21}" y="${neckY - 22}" width="42" height="52" fill="${c.skin}"/>` +
    `<path d="M${cx - 78} ${shoulderY - 18}Q${cx} ${shoulderY - 44} ${cx + 78} ${shoulderY - 18}Q${cx + 84} ${shoulderY + 90} ${cx + 62} ${hipY + 18}H${cx - 62}Q${cx - 84} ${shoulderY + 90} ${cx - 78} ${shoulderY - 18}Z" fill="${c.shirt}"/>` +
    `<circle cx="${head.x}" cy="${head.y}" r="80" fill="${c.skin}"/>` +
    face(head.x, head.y, p.look, p.expression, c) + hairFront +
    arm(sR, p.rShoulder, p.rElbow, false) + `</g>`
  );
};
export const characterSvg = (pose, look) => `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="900" viewBox="0 0 600 900">${characterMarkup(pose, look)}</svg>\n`;

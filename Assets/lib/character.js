// Jointed 2D character. All poses are joint angles, so characters can be animated by changing numbers.
// Canvas: 600 x 900. Angles are in degrees; 0 points straight down, positive swings toward screen-right.
const rad = (d) => (d * Math.PI) / 180;
const step = ([x, y], len, deg) => [x + len * Math.sin(rad(deg)), y + len * Math.cos(rad(deg))];
const f = (n) => n.toFixed(1);

export const skinTones = { light: "#F6CBA8", tan: "#DDA06F", brown: "#A9683F", deep: "#6F4228" };

export const presets = {
  alex: { skin: skinTones.tan, shirt: "#22D3EE", shirtShade: "#0891B2", pants: "#24365A", shoes: "#F4F7FB", hair: "#1B1B2F", hairStyle: "short" },
  maya: { skin: skinTones.brown, shirt: "#FB7185", shirtShade: "#E11D48", pants: "#F4F7FB", shoes: "#FBBF24", hair: "#2A1720", hairStyle: "long" },
  // Men
  omar: { skin: skinTones.deep, shirt: "#FBBF24", shirtShade: "#D97706", pants: "#24365A", shoes: "#F4F7FB", hair: "#33272F", hairStyle: "buzz", beard: "#33272F" },
  kenji: { skin: skinTones.light, shirt: "#34D399", shirtShade: "#059669", pants: "#3F3F5A", shoes: "#FB7185", hair: "#14141F", hairStyle: "short", glasses: true },
  luis: { skin: skinTones.tan, shirt: "#A78BFA", shirtShade: "#7C3AED", pants: "#16233D", shoes: "#FBBF24", hair: "#3B2416", hairStyle: "curly" },
  arthur: { skin: skinTones.light, shirt: "#94A3B8", shirtShade: "#64748B", pants: "#7C4A2D", shoes: "#1B1B2F", hair: "#E2E8F0", hairStyle: "balding", beard: "#E2E8F0", glasses: true },
  dev: { skin: skinTones.brown, shirt: "#F4F7FB", shirtShade: "#CBD5E1", pants: "#0891B2", shoes: "#7C4A2D", hair: "#D97706", hairStyle: "turban", beard: "#33272F" },
  // Women
  zara: { skin: skinTones.deep, shirt: "#22D3EE", shirtShade: "#0891B2", pants: "#F4F7FB", shoes: "#FB7185", hair: "#3A2A2E", hairStyle: "afro" },
  mei: { skin: skinTones.light, shirt: "#FBBF24", shirtShade: "#D97706", pants: "#24365A", shoes: "#F4F7FB", hair: "#33303F", hairStyle: "bob" },
  aisha: { skin: skinTones.tan, shirt: "#34D399", shirtShade: "#059669", pants: "#16233D", shoes: "#FBBF24", hair: "#7C3AED", hairStyle: "hijab" },
  elena: { skin: skinTones.light, shirt: "#A78BFA", shirtShade: "#7C3AED", pants: "#F6CBA8", shoes: "#F4F7FB", hair: "#E0A93B", hairStyle: "long", skirt: "#7C3AED" },
  ruth: { skin: skinTones.deep, shirt: "#FB7185", shirtShade: "#E11D48", pants: "#3F3F5A", shoes: "#F4F7FB", hair: "#CBD5E1", hairStyle: "bun", glasses: true }
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
  // Optional extras. Looks without these keys render exactly as before.
  const X = cx, Y = head.y, hc = c.hair, st = c.hairStyle;
  const extraBack = {
    afro: `<circle cx="${X}" cy="${Y - 22}" r="128" fill="${hc}"/>`,
    bob: `<path d="M${X - 96} ${Y - 10}C${X - 96} ${Y - 112} ${X + 96} ${Y - 112} ${X + 96} ${Y - 10}V${Y + 62}Q${X + 96} ${Y + 80} ${X + 78} ${Y + 80}H${X - 78}Q${X - 96} ${Y + 80} ${X - 96} ${Y + 62}Z" fill="${hc}"/>`,
    bun: `<circle cx="${X}" cy="${Y - 104}" r="38" fill="${hc}"/>`,
    hijab: `<path d="M${X - 98} ${Y}C${X - 98} ${Y - 124} ${X + 98} ${Y - 124} ${X + 98} ${Y}C${X + 100} ${Y + 50} ${X + 112} ${Y + 96} ${X + 90} ${Y + 142}H${X - 90}C${X - 112} ${Y + 96} ${X - 100} ${Y + 50} ${X - 98} ${Y}Z" fill="${hc}"/>`
  }[st] || "";
  const extraFront = {
    afro: `<path d="M${X - 84} ${Y - 2}C${X - 92} ${Y - 100} ${X + 92} ${Y - 100} ${X + 84} ${Y - 2}C${X + 60} ${Y - 40} ${X - 60} ${Y - 40} ${X - 84} ${Y - 2}Z" fill="${hc}"/>`,
    bob: `<path d="M${X - 86} ${Y + 6}C${X - 94} ${Y - 110} ${X + 94} ${Y - 110} ${X + 86} ${Y + 6}C${X + 74} ${Y - 26} ${X + 62} ${Y - 40} ${X + 44} ${Y - 46}H${X - 44}C${X - 62} ${Y - 40} ${X - 74} ${Y - 26} ${X - 86} ${Y + 6}Z" fill="${hc}"/>`,
    bun: `<path d="M${X - 84} ${Y - 4}C${X - 92} ${Y - 106} ${X + 92} ${Y - 106} ${X + 84} ${Y - 4}C${X + 56} ${Y - 46} ${X - 56} ${Y - 46} ${X - 84} ${Y - 4}Z" fill="${hc}"/>`,
    buzz: `<path d="M${X - 80} ${Y - 26}C${X - 80} ${Y - 102} ${X + 80} ${Y - 102} ${X + 80} ${Y - 26}C${X + 56} ${Y - 56} ${X - 56} ${Y - 56} ${X - 80} ${Y - 26}Z" fill="${hc}"/>`,
    curly: [[-70, -38, 30], [-44, -66, 32], [-10, -78, 34], [26, -76, 33], [56, -60, 31], [76, -32, 26], [-82, -12, 20], [84, -8, 18]].map(([a, b, r]) => `<circle cx="${X + a}" cy="${Y + b}" r="${r}" fill="${hc}"/>`).join(""),
    balding: `<path d="M${X - 84} ${Y - 6}C${X - 92} ${Y - 40} ${X - 72} ${Y - 56} ${X - 60} ${Y - 54}C${X - 68} ${Y - 36} ${X - 72} ${Y - 20} ${X - 84} ${Y - 6}ZM${X + 84} ${Y - 6}C${X + 92} ${Y - 40} ${X + 72} ${Y - 56} ${X + 60} ${Y - 54}C${X + 68} ${Y - 36} ${X + 72} ${Y - 20} ${X + 84} ${Y - 6}Z" fill="${hc}"/>`,
    turban: `<path d="M${X - 88} ${Y - 26}C${X - 102} ${Y - 136} ${X + 102} ${Y - 136} ${X + 88} ${Y - 26}C${X + 50} ${Y - 44} ${X - 50} ${Y - 44} ${X - 88} ${Y - 26}Z" fill="${hc}"/><path d="M${X - 76} ${Y - 40}C${X - 30} ${Y - 92} ${X + 40} ${Y - 112} ${X + 66} ${Y - 92}M${X - 44} ${Y - 40}C${X - 6} ${Y - 74} ${X + 44} ${Y - 80} ${X + 82} ${Y - 58}" fill="none" stroke="#FBBF24" stroke-width="7" stroke-linecap="round"/>`,
    hijab: `<path fill-rule="evenodd" d="M${X - 98} ${Y}C${X - 98} ${Y - 124} ${X + 98} ${Y - 124} ${X + 98} ${Y}C${X + 100} ${Y + 60} ${X + 60} ${Y + 104} ${X} ${Y + 104}C${X - 60} ${Y + 104} ${X - 100} ${Y + 60} ${X - 98} ${Y}ZM${X - 66} ${Y}C${X - 66} ${Y + 44} ${X - 36} ${Y + 68} ${X} ${Y + 68}C${X + 36} ${Y + 68} ${X + 66} ${Y + 44} ${X + 66} ${Y}C${X + 66} ${Y - 62} ${X - 66} ${Y - 62} ${X - 66} ${Y}Z" fill="${hc}"/>`
  }[st] || "";
  const beard = c.beard ? `<path d="M${X - 80} ${Y + 4}C${X - 80} ${Y + 64} ${X - 44} ${Y + 96} ${X} ${Y + 96}C${X + 44} ${Y + 96} ${X + 80} ${Y + 64} ${X + 80} ${Y + 4}C${X + 66} ${Y + 30} ${X + 44} ${Y + 8} ${X + 26} ${Y + 12}H${X - 26}C${X - 44} ${Y + 8} ${X - 66} ${Y + 30} ${X - 80} ${Y + 4}Z" fill="${c.beard}"/><path d="M${X - 25} ${Y + 15}Q${X} ${Y + 58} ${X + 25} ${Y + 15}Z" fill="${c.skin}"/>` : "";
  const glasses = c.glasses ? `<g fill="none" stroke="${c.skin === skinTones.deep ? "#F4F7FB" : "#1B1B2F"}" stroke-width="5"><circle cx="${X + p.look - 24}" cy="${Y - 6}" r="20"/><circle cx="${X + p.look + 24}" cy="${Y - 6}" r="20"/><path d="M${X + p.look - 4} ${Y - 8}H${X + p.look + 4}"/></g>` : "";
  const skirt = c.skirt ? `<path d="M${cx - 62} ${hipY - 8}H${cx + 62}L${cx + 96} ${hipY + 118}H${cx - 96}Z" fill="${c.skirt}"/>` : "";
  const hairBack = extraBack ? extraBack : c.hairStyle === "long" ? `<path d="M${cx - 92} ${head.y - 8}C${cx - 94} ${head.y - 96} ${cx + 94} ${head.y - 96} ${cx + 92} ${head.y - 8}C${cx + 98} ${head.y + 55} ${cx + 96} ${head.y + 100} ${cx + 76} ${head.y + 132}H${cx - 76}C${cx - 96} ${head.y + 100} ${cx - 98} ${head.y + 55} ${cx - 92} ${head.y - 8}Z" fill="${c.hair}"/>` : "";
  const hairFront = extraFront ? extraFront : c.hairStyle === "long"
    ? `<path d="M${cx - 86} ${head.y - 2}C${cx - 94} ${head.y - 112} ${cx + 94} ${head.y - 112} ${cx + 86} ${head.y - 2}C${cx + 62} ${head.y - 20} ${cx + 28} ${head.y - 34} ${cx + 4} ${head.y - 56}C${cx - 16} ${head.y - 32} ${cx - 54} ${head.y - 16} ${cx - 86} ${head.y - 2}Z" fill="${c.hair}"/>`
    : `<path d="M${cx - 84} ${head.y - 2}C${cx - 100} ${head.y - 104} ${cx + 96} ${head.y - 116} ${cx + 84} ${head.y - 2}C${cx + 76} ${head.y - 30} ${cx + 58} ${head.y - 42} ${cx + 30} ${head.y - 42}C${cx - 4} ${head.y - 40} ${cx - 66} ${head.y - 48} ${cx - 84} ${head.y - 2}Z" fill="${c.hair}"/>`;
  return (
    `<g transform="translate(0 60)">` + hairBack +
    leg(hL, p.lHip, p.lKnee, -1) + leg(hR, p.rHip, p.rKnee, 1) +
    arm(sL, p.lShoulder, p.lElbow, true) +
    `<rect x="${cx - 21}" y="${neckY - 22}" width="42" height="52" fill="${c.skin}"/>` +
    `<path d="M${cx - 78} ${shoulderY - 18}Q${cx} ${shoulderY - 44} ${cx + 78} ${shoulderY - 18}Q${cx + 84} ${shoulderY + 90} ${cx + 62} ${hipY + 18}H${cx - 62}Q${cx - 84} ${shoulderY + 90} ${cx - 78} ${shoulderY - 18}Z" fill="${c.shirt}"/>` + skirt +
    `<circle cx="${head.x}" cy="${head.y}" r="80" fill="${c.skin}"/>` +
    beard + face(head.x, head.y, p.look, p.expression, c) + glasses + hairFront +
    arm(sR, p.rShoulder, p.rElbow, false) + `</g>`
  );
};
export const characterSvg = (pose, look) => `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="900" viewBox="0 0 600 900">${characterMarkup(pose, look)}</svg>\n`;

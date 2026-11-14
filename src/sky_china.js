// Sky props, hanging cards and close-up cards for "The Long Thread". Every group of sprites is cut
// lazily, the first time the film draws it: a long film should not cut its last minute before its first.
import { ellipse, strip, KRAFT, put } from './paper.js';
import { bakeFlames, bakeSky } from './cutouts.js';
import { TEMPLATE_FX } from './sky_borrowed.js';
import { rng, shade, rgb, mix, clamp, smooth, sramp, DEG } from './util.js';

export const rect = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
// [names, maker] groups added by the chapters (see the bottom of this file and src/sky_cards.js)
export const CHINA_FX = [];
export const fxGroup = (names, fn) => CHINA_FX.push([names, fn]);

export function makeFx(mk, mkSoft, mkBig, stage) {
  const S = bakeSky(mkSoft);
  S.flames = bakeFlames(mk);
  const r = rng(77);
  S.puffs = [0, 1, 2].map((v) => {
    const pts = []; for (let i = 0; i < 9; i++) { const a = (i / 9) * Math.PI * 2, rr = 16 + r() * 7; pts.push([Math.cos(a) * rr, Math.sin(a) * rr * 0.8]); }
    return mk('puff' + v, [-26, -24, 26, 24], { pad: 6 }).piece(pts, ['#8e8a86', '#a09a94', '#7a7672'][v], { round: 7, rough: 1.6, seg: 8, rim: 0.3 }).finish({ shadowBlur: 3 });
  });
  S.wing = mk('wing', [-2, -12, 30, 5], { pad: 4 }).piece([[0, -1], [8, -7], [18, -10], [28, -9], [16, -4], [6, 3]], '#2b2420', { round: 2, rough: 0.4, rim: 0.2, thick: 0.6, lift: 0 }).finish({ shadowBlur: 2 });
  // made later sprites join the stage's list, so a resize can give their memory back
  const reg = (o, seen = new Set(), d = 0) => { if (!o || typeof o !== 'object' || seen.has(o) || d > 6) return; seen.add(o); if (o.sprite) { stage.baked?.add(o); return; } if (o instanceof HTMLCanvasElement) return; for (const k in o) reg(o[k], seen, d + 1); };
  const group = (names, fn) => {
    let v = null;
    const get = () => { if (!v) { v = fn(mk, mkSoft, mkBig, stage); reg(v); } return v; };
    for (const n of names) Object.defineProperty(S, n, { get: () => get()[n], enumerable: false, configurable: true });
  };
  for (const [names, fn] of TEMPLATE_FX) group(names, fn);
  for (const [names, fn] of CHINA_FX) group(names, fn);
  return S;
}

// Hang a prop from two threads (long things: a flute, a scroll, a banner).
export function hang2(st, g, spr, x, y, s, swing, alpha = 1, spread = 0.42) {
  const u = st.eu, w = spr.w * spread * u * s;
  g.save(); g.globalAlpha = alpha; g.translate(x, y); g.rotate(swing);
  g.strokeStyle = 'rgba(200,190,175,0.32)'; g.lineWidth = Math.max(1, 0.6 * u);
  for (const dx of [-w, w]) { g.beginPath(); g.moveTo(dx, (spr.y + 6) * u * s); g.lineTo(dx - Math.sin(swing) * (y + 40), -y - 40); g.stroke(); }
  g.scale(u * s, u * s); put(g, spr, 0.2, 4, 6);
  g.restore(); g.globalAlpha = 1;
}

// ----------------------------------------------------------- the bone flute ---
// The flute itself, as it came out of the ground at Jiahu: a crane's wing bone with seven holes.
fxGroup(['boneflute'], (mk) => {
  const r = rng(9000), S = {};
  S.boneflute = mk('boneflute', [-120, -16, 120, 16], { pad: 8 })
    .piece([[-112, -6], [-104, -9.5], [-60, -8], [40, -7.4], [100, -8.6], [112, -6], [114, 4], [104, 8], [40, 7], [-60, 7.6], [-104, 9], [-114, 5]], '#e2d3b0', { round: 4, rough: 0.5, seg: 30, paint: (g) => {
      g.fillStyle = 'rgba(140,100,60,.25)'; for (let i = 0; i < 40; i++) { g.beginPath(); g.ellipse(-110 + r() * 220, -6 + r() * 12, 2 + r() * 8, 0.8 + r() * 2, 0, 0, 7); g.fill(); }
      g.fillStyle = 'rgba(120,80,40,.35)'; g.fillRect(-114, -9, 10, 18); g.fillRect(104, -9, 10, 18);
      for (let i = 0; i < 7; i++) { const x = -42 + i * 16; g.fillStyle = 'rgba(40,24,14,.92)'; g.beginPath(); g.ellipse(x, -0.5, 3.2, 2.6, 0, 0, 7); g.fill(); g.fillStyle = 'rgba(255,240,210,.35)'; g.beginPath(); g.ellipse(x - 0.8, -1.4, 1.1, 0.8, 0, 0, 7); g.fill(); }
      g.fillStyle = 'rgba(40,24,14,.7)'; g.beginPath(); g.arc(-26 + 8, -0.5, 0.9, 0, 7); g.fill(); // the tiny tuning hole beside the seventh
      g.strokeStyle = 'rgba(90,60,30,.4)'; g.lineWidth = 0.6; g.beginPath(); g.moveTo(60, -7); g.lineTo(66, -1); g.lineTo(63, 6); g.stroke();
    } }).finish({ shadowBlur: 4 });
  return S;
});

// ------------------------------------------------------------ oracle bones ---
// A turtle's under-shell, prepared for divination: polished, with rows of hollows drilled into it.
export const HOLLOWS = [[-42, -78], [42, -78], [-46, -26], [46, -26], [-46, 26], [46, 26], [-40, 76], [40, 76]];
fxGroup(['plastron', 'rod', 'slip'], (mk, mkSoft, mkBig) => {
  const r = rng(1250), S = {};
  const pts = [[-30, -140], [30, -140], [44, -126], [70, -96], [84, -50], [80, -20], [80, 20], [88, 58], [74, 104], [44, 132], [18, 144], [-18, 144], [-44, 132], [-74, 104], [-88, 58], [-80, 20], [-80, -20], [-84, -50], [-70, -96], [-44, -126]];
  S.plastron = mkBig('plastron', [-96, -150, 96, 152], { pad: 14 }).piece(pts, '#e6d6b2', { round: 22, rough: 1.4, seg: 20, lift: 4, thick: 4, paint: (g) => {
    for (let i = 0; i < 70; i++) { g.fillStyle = `rgba(${r() < 0.5 ? '150,110,60' : '255,246,226'},${0.05 + r() * 0.1})`; g.beginPath(); g.ellipse(-80 + r() * 160, -130 + r() * 270, 4 + r() * 18, 2 + r() * 8, r() * 3, 0, 7); g.fill(); }
    g.strokeStyle = 'rgba(120,86,50,.45)'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(0, -140); g.lineTo(0, 144); g.stroke();
    for (const [y, b] of [[-104, 10], [-52, 14], [0, 8], [50, 14], [104, 10]]) { g.beginPath(); g.moveTo(-86, y + b); g.quadraticCurveTo(0, y - b, 86, y + b); g.stroke(); }
    for (const [x, y] of HOLLOWS) { const s = Math.sign(x); g.fillStyle = 'rgba(96,64,36,.55)'; g.beginPath(); g.ellipse(x, y, 7, 12, 0, 0, 7); g.fill(); g.fillStyle = 'rgba(70,44,24,.5)'; g.beginPath(); g.arc(x - s * 12, y, 5.4, 0, 7); g.fill(); g.strokeStyle = 'rgba(255,246,226,.5)'; g.lineWidth = 1; g.beginPath(); g.ellipse(x + 0.8, y + 0.8, 7, 12, 0, 0.3, 2.6); g.stroke(); }
  } }).finish({ shadowBlur: 10 });
  S.rod = mkBig('hotrod', [-6, -200, 6, 6], { pad: 6 }).piece([[-3, 0], [3, 0], [3.6, -196], [-3, -196]], '#5a3a26', { round: 1.5, rough: 0.6, paint: (g) => { g.fillStyle = '#2a1810'; g.fillRect(-3, -12, 6.6, 12); } }).finish({ shadowBlur: 5 });
  S.slip = mkBig('signslip', [-140, -60, 140, 60], { pad: 10 }).piece([[-132, -52], [132, -54], [134, 52], [-130, 54]], '#efe5cc', { round: 4, rough: 0.8, lift: 3, thick: 3, paint: (g) => { g.strokeStyle = 'rgba(150,120,80,.3)'; g.lineWidth = 1; g.beginPath(); g.moveTo(-126, 0); g.lineTo(126, 0); g.stroke(); for (let i = 0; i < 40; i++) { g.fillStyle = 'rgba(160,130,90,.12)'; g.fillRect(-130 + Math.random() * 260, -50 + Math.random() * 100, 3, 1); } } }).finish({ shadowBlur: 8 });
  return S;
});

// Signs as strokes in a 40-unit box: the oracle-bone forms (incised) and the forms written today (brush).
const circ = (rx, ry, n = 14, a0 = 0, a1 = Math.PI * 2) => { const p = []; for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * (i / n); p.push([Math.cos(a) * rx, Math.sin(a) * ry]); } return p; };
export const GLYPH = {
  // the inscription: 卜 (crack), 貞 (to ask, drawn as a ding), 旬 (ten days, a spiral), 亡 (no), and a bone with a crack (misfortune)
  bu: [[[0, -18], [0, 18]], [[0, -4], [12, -12]]],
  zhen: [[[-12, -9], [12, -9], [12, 8], [-12, 8], [-12, -9]], [[-8, 8], [-10, 18]], [[8, 8], [10, 18]], [[-7, -9], [-7, -17]], [[7, -9], [7, -17]], [[-12, 0], [12, 0]]],
  xun: [[[10, -16], [-6, -16], [-12, -6], [-10, 8], [2, 12], [10, 4], [4, -4], [-4, 0]]],
  wang: [[[-4, -18], [-4, 14], [14, 14]], [[-14, -10], [6, -10]]],
  huo: [[[-10, -18], [10, -18], [10, 16], [-10, 16], [-10, -18]], [[0, -10], [0, 10]], [[0, -2], [7, -8]]],
  // 日 月 人 木 山, then and now
  m_tian: [[[-12, -14], [12, -14]], [[-15, -2], [15, -2]], [[0, -14], [0, -2], [-4, 6], [-13, 16]], [[0, -2], [5, 6], [14, 16]]],
  o_ri: [circ(13, 15, 16), [[-4, 0], [4, 0]]], m_ri: [[[-10, -16], [10, -16], [10, 16], [-10, 16], [-10, -16]], [[-10, 0], [10, 0]]],
  o_yue: [[[4, -18], [-8, -10], [-12, 4], [-4, 16], [8, 18], [2, 8], [0, -6], [4, -18]], [[-6, 2], [0, 4]]], m_yue: [[[-9, -16], [-9, 6], [-14, 17]], [[-9, -16], [10, -16], [10, 14], [6, 17]], [[-9, -5], [10, -5]], [[-9, 5], [10, 5]]],
  o_ren: [[[6, -18], [-2, -6], [-4, 6], [-10, 18]], [[-2, -4], [10, 4]]], m_ren: [[[1, -17], [-1, 0], [-13, 16]], [[0, -4], [6, 6], [14, 15]]],
  o_mu: [[[0, -18], [0, 18]], [[0, -6], [-10, -16]], [[0, -6], [10, -16]], [[0, 8], [-10, 18]], [[0, 8], [10, 18]]], m_mu: [[[-15, -6], [15, -6]], [[0, -18], [0, 18]], [[0, -6], [-14, 12]], [[0, -6], [14, 12]]],
  o_shan: [[[-16, 14], [-14, -4], [-8, 10], [0, -16], [8, 10], [14, -4], [16, 14], [-16, 14]]], m_shan: [[[0, -18], [0, 14]], [[-13, -6], [-13, 14], [13, 14]], [[13, -6], [13, 14]]],
};
// Draw a sign, stroke by stroke, k from 0 (nothing) to 1 (all). style: 'cut' (incised in bone), 'red' (cut, rubbed with
// red pigment), 'ink' (brush).
export function glyph(g, name, x, y, s, k, style = 'cut') {
  if (k <= 0) return;
  const strokes = GLYPH[name], lens = strokes.map((p) => p.slice(1).reduce((a, q, i) => a + Math.hypot(q[0] - p[i][0], q[1] - p[i][1]), 0)), total = lens.reduce((a, b) => a + b, 0);
  let left = k * total;
  g.save(); g.translate(x, y); g.scale(s, s); g.lineCap = 'round'; g.lineJoin = 'round';
  const pass = (col, w, dx, dy) => {
    let rem = left;
    g.strokeStyle = col; g.lineWidth = w;
    strokes.forEach((p, si) => {
      if (rem <= 0) return; g.beginPath(); g.moveTo(p[0][0] + dx, p[0][1] + dy);
      for (let i = 1; i < p.length; i++) { const L = Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]); if (rem >= L) { g.lineTo(p[i][0] + dx, p[i][1] + dy); rem -= L; } else { const f = rem / L; g.lineTo(p[i - 1][0] + (p[i][0] - p[i - 1][0]) * f + dx, p[i - 1][1] + (p[i][1] - p[i - 1][1]) * f + dy); rem = 0; break; } }
      g.stroke();
    });
  };
  if (style === 'ink') { pass('rgba(24,18,16,.92)', 3.6, 0, 0); }
  else { const w = style === 'red' ? 2.2 : 3; pass('rgba(255,248,230,.6)', w + 0.4, 0.8, 0.8); pass(style === 'red' ? 'rgba(150,40,26,.92)' : 'rgba(60,34,18,.95)', w, 0, 0); }
  g.restore();
}
// A crack spreading from a hollow: the long split along the shell, then the side branch (the sign 卜 copies it).
export function crack(g, x, y, k, dir = 1, seed = 1) {
  if (k <= 0) return;
  const r = rng(seed), main = [[0, 0]], side = [[0, 0]];
  for (let i = 1; i <= 8; i++) main.push([(r() - 0.5) * 3, i * 7 * (i % 2 ? 1 : 1)]);
  for (let i = 1; i <= 5; i++) side.push([dir * i * 5 + (r() - 0.5) * 2, -i * 2.4 - (r() - 0.5) * 2]);
  g.save(); g.translate(x, y - 22); g.strokeStyle = 'rgba(40,22,10,.95)'; g.lineWidth = 1.8; g.lineCap = 'round';
  const draw = (pts, kk) => { if (kk <= 0) return; const n = Math.max(1, Math.floor(kk * (pts.length - 1))); g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i <= n; i++) g.lineTo(pts[i][0], pts[i][1]); g.stroke(); };
  draw(main, clamp(k * 1.6)); g.translate(main[3][0], main[3][1]); draw(side, clamp(k * 1.6 - 0.6));
  g.restore();
}

// The Mandate of Heaven: a scroll of yellow silk with the sign for heaven, lowered on a thread.
fxGroup(['mandate'], (mk) => ({
  mandate: mk('mandate', [-44, -100, 44, 100], { pad: 8 }).piece([[-36, -86], [36, -86], [36, 88], [-36, 88]], '#e8c96a', { round: 2, paint: (g) => { g.strokeStyle = 'rgba(160,110,40,.5)'; g.lineWidth = 1.4; g.strokeRect(-30, -78, 60, 160); glyph(g, 'm_tian', 0, -24, 1.6, 1, 'ink'); g.fillStyle = 'rgba(178,40,32,.9)'; g.fillRect(-10, 34, 20, 20); g.fillStyle = 'rgba(232,201,106,.9)'; g.fillRect(-6, 38, 4, 12); g.fillRect(2, 38, 4, 12); g.fillRect(-6, 42, 12, 3); } })
    .piece([[-42, -94], [42, -94], [42, -84], [-42, -84]], '#6a3a22', { round: 2, lift: 1.2 }).piece([[-42, 86], [42, 86], [42, 96], [-42, 96]], '#6a3a22', { round: 2, lift: 1.2 }).finish({ shadowBlur: 4 }),
}));

// ------------------------------------------------------- the First Emperor ---
fxGroup(['qinslip', 'knifecoin', 'spadecoin', 'banliang', 'weight', 'faces'], (mk) => {
  const r = rng(221), S = {};
  const slip = mk('qinslip', [-44, -90, 44, 90], { pad: 6 });
  for (let i = 0; i < 6; i++) { const x = -36 + i * 14.4; slip.piece([[x - 6.4, -84], [x + 6.4, -84], [x + 6.4, 84], [x - 6.4, 84]], i % 2 ? '#d8c08a' : '#ccb27a', { round: 1.5, rough: 0.3, lift: 0.8, thick: 0.8 }); }
  S.qinslip = slip.piece([[-42, -60], [42, -60], [42, -57], [-42, -57]], '#7a5a3a', { round: 0.5, lift: 0.6 }).piece([[-42, 58], [42, 58], [42, 61], [-42, 61]], '#7a5a3a', { round: 0.5, lift: 0.6, paint: (g) => { const names = ['m_ri', 'm_yue', 'm_ren', 'm_mu', 'm_shan', 'm_tian']; for (let i = 0; i < 6; i++) for (let j = 0; j < 3; j++) glyph(g, names[(i + j * 2) % 6], -36 + i * 14.4, -40 + j * 40, 0.3, 1, 'ink'); } }).finish({ shadowBlur: 4 });
  S.knifecoin = mk('knifecoin', [-14, -60, 14, 20], { pad: 5 }).piece([[-4, 16], [4, 16], [6, 6], [6, -30], [2, -52], [-6, -56], [-6, -30], [-6, 6]], '#7a8a6a', { round: 2, paint: (g) => { g.strokeStyle = 'rgba(40,50,30,.6)'; g.lineWidth = 1; g.beginPath(); g.arc(0, 10, 3, 0, 7); g.stroke(); } }).finish({ shadowBlur: 3 });
  S.spadecoin = mk('spadecoin', [-24, -36, 24, 30], { pad: 5 }).piece([[-4, -30], [4, -30], [4, -16], [18, -10], [22, 24], [8, 18], [0, 26], [-8, 18], [-22, 24], [-18, -10], [-4, -16]], '#7a8a6a', { round: 2, paint: (g) => { g.strokeStyle = 'rgba(40,50,30,.6)'; g.lineWidth = 1; g.beginPath(); g.moveTo(0, -12); g.lineTo(0, 16); g.stroke(); } }).finish({ shadowBlur: 3 });
  S.banliang = mk('banliang', [-28, -28, 28, 28], { pad: 5 }).piece(ellipse(0, 0, 25, 25, 26), '#a88a52', { round: 4, paint: (g) => { g.fillStyle = 'rgba(30,20,10,.92)'; g.fillRect(-6, -6, 12, 12); g.strokeStyle = 'rgba(70,50,24,.7)'; g.lineWidth = 1.4; g.beginPath(); g.arc(0, 0, 22, 0, 7); g.stroke(); glyph(g, 'm_ren', -15, 0, 0.26, 1, 'ink'); glyph(g, 'm_mu', 15, 0, 0.26, 1, 'ink'); } }).finish({ shadowBlur: 3 });
  S.weight = mk('weight', [-30, -36, 30, 24], { pad: 5 }).piece([[-26, 20], [26, 20], [24, 4], [16, -12], [6, -18], [-6, -18], [-16, -12], [-24, 4]], '#8a7a52', { round: 6, paint: (g) => { glyph(g, 'm_tian', -8, 4, 0.3, 1, 'cut'); glyph(g, 'm_shan', 8, 4, 0.3, 1, 'cut'); } }).piece([[-6, -18], [-6, -28], [6, -28], [6, -18], [3, -18], [3, -24], [-3, -24], [-3, -18]], '#7a6a44', { round: 1.5, lift: 1 }).finish({ shadowBlur: 3 });
  const f = mk('faces', [-110, -50, 110, 50], { pad: 8 }).piece([[-104, -44], [104, -44], [104, 44], [-104, 44]], '#e8dcc0', { round: 3, rough: 0.6 });
  [[-66, 0], [0, 1], [66, 2]].forEach(([x, k]) => {
    const nose = 10 + k * 2;
    f.piece([[x - 18, 34], [x + 14, 34], [x + 18, 16], [x + nose + 8, 6], [x + 18, 0], [x + 18, -14], [x + 6, -26], [x - 14, -24], [x - 22, -4]], ['#a8907a', '#b09880', '#9a8470'][k], { round: 6, lift: 1.4, paint: (g) => {
      g.fillStyle = 'rgba(40,26,18,.85)'; g.beginPath(); g.arc(x + 9, -2, 1.6, 0, 7); g.fill();
      g.strokeStyle = 'rgba(60,40,28,.75)'; g.lineWidth = 1.8; g.lineCap = 'round';
      if (k === 0) { g.beginPath(); g.moveTo(x + 6, 12); g.quadraticCurveTo(x + 14, 8, x + 22, 14); g.stroke(); }
      if (k === 1) { g.fillStyle = 'rgba(80,58,40,.6)'; g.beginPath(); g.moveTo(x - 2, 18); g.lineTo(x + 16, 20); g.lineTo(x + 6, 34); g.fill(); }
      if (k === 2) { g.beginPath(); g.moveTo(x + 4, 14); g.lineTo(x + 20, 10); g.stroke(); g.beginPath(); g.moveTo(x + 2, -8); g.lineTo(x + 14, -10); g.stroke(); }
    } });
    f.piece(k === 1 ? [[x - 16, -22], [x - 18, -36], [x + 4, -40], [x + 10, -26]] : ellipse(x - 10, -24, 8, 7, 10), '#8a7460', { round: 2, lift: 1 });
  });
  S.faces = f.finish({ shadowBlur: 4 });
  return S;
});

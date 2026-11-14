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

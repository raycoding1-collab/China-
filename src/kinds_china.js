// Cut-outs for "The Long Thread": China, from the first villages to now.
// Same conventions as the rest of the library: design units, a cut-out stands on its origin
// facing +x, a person is about 120 units tall, y up is negative.
import { put, ellipse, strip, KRAFT, KRAFT_EDGE } from './paper.js';
import { KINDS } from './cutouts.js';
import { LOOKS, drawPerson } from './people.js';
import { rng, fbm, noise, DEG, hash, shade, mix, rgb, clamp, smooth, sramp, spring, lerp } from './util.js';

export const rect = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
const dark = '#2b1f18';
const dab = (g, r, n, box, cols, len = 6, w = 2) => {
  g.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const x = box[0] + r() * (box[2] - box[0]), y = box[1] + r() * (box[3] - box[1]), a = (r() - 0.5) * 1.2;
    g.strokeStyle = cols[(r() * cols.length) | 0]; g.lineWidth = w * (0.6 + r() * 0.8);
    g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * len * (0.5 + r()), y + Math.sin(a) * len * 0.4); g.stroke();
  }
};
const sway = (t, e, amt = 2, sp = 0.6) => fbm(t * sp + e.a * 0.37, 13) * amt * DEG;
export const tiles = (col, step = 5, a = 0.4) => (g, sh) => { g.strokeStyle = rgb(shade(col, -0.4), a); g.lineWidth = 1; for (let x = sh.x0; x < sh.x0 + sh.w; x += step) { g.beginPath(); g.moveTo(x, sh.y0); g.lineTo(x, sh.y0 + sh.h); g.stroke(); } };

// Lit openings: doors and windows that glow when e.winOn(t, i) > 0.
export function glowRects(g, P, t, e, env, p) {
  if (!e.winOn || p < 0.6 || !P.windows) return;
  g.globalCompositeOperation = 'lighter';
  P.windows.forEach((w, i) => {
    const k = e.winOn(t, i); if (k <= 0.01) return;
    const [x, y, ww, hh] = w, c = e.winCol || [255, 190, 110];
    g.fillStyle = rgb(c, 0.75 * k); g.fillRect(x + 0.6, y + 0.6, ww - 1.2, hh - 1.2);
    const r = Math.max(ww, hh) * 1.4, gr = g.createRadialGradient(x + ww / 2, y + hh / 2, 0, x + ww / 2, y + hh / 2, r);
    gr.addColorStop(0, rgb(c, 0.16 * k)); gr.addColorStop(1, rgb(c, 0));
    g.fillStyle = gr; g.fillRect(x + ww / 2 - r, y + hh / 2 - r, r * 2, r * 2);
  });
  g.globalCompositeOperation = 'source-over';
}
export const paintRects = (list, col = 'rgba(30,22,18,.85)') => (g) => { g.fillStyle = col; for (const [x, y, w, h] of list) g.fillRect(x, y, w, h); };

// Two-link reach for the puppets' arms: the shoulder-relative target -> [upper, fore] angles in the
// arm convention of people.js (0 hangs straight down; negative swings forward).
export function reach(dx, dy, bend = 1, L1 = 19, L2 = 21) {
  const D = Math.min(L1 + L2 - 0.01, Math.max(Math.abs(L1 - L2) + 0.01, Math.hypot(dx, dy)));
  const phi = Math.atan2(-dx, dy), al = Math.acos((L1 * L1 + D * D - L2 * L2) / (2 * L1 * D)), be = Math.acos((L1 * L1 + L2 * L2 - D * D) / (2 * L1 * L2));
  const a1 = phi + bend * al, a2 = -bend * (Math.PI - be);
  return [a1 / DEG, a2 / DEG];
}

// ======================================================= the first villages ===
// A round house of wattle and daub under a cone of thatch, like those at Banpo and Jiahu.
KINDS.roundhut = {
  bake(mk, v = 0) {
    const r = rng(1100 + v), w = [54, 64, 46][v % 3], wh = [26, 30, 22][v % 3], rh = [96, 108, 86][v % 3];
    const door = [-9, -24, 18, 28];
    const sh = mk('roundhut' + v, [-w - 22, -wh - rh - 16, w + 22, 6]);
    sh.piece([[-w, 4], [-w + 2, -wh - 4], [w - 2, -wh - 4], [w, 4]], '#9a7650', { round: 3, paint: (g) => {
      g.strokeStyle = 'rgba(70,46,26,.35)'; g.lineWidth = 1.1; for (let i = 0; i < 26; i++) { const x = -w + r() * w * 2; g.beginPath(); g.moveTo(x, 4); g.lineTo(x + (r() - 0.5) * 6, -wh); g.stroke(); }
      paintRects([door], 'rgba(28,18,12,.92)')(g);
    } });
    const roof = [[-w - 18, -wh + 6]];
    for (let i = 1; i < 9; i++) { const x = -w - 18 + i * ((w + 18) * 2 / 9); roof.push([x, -wh + 6 + (i % 2 ? 6 + r() * 4 : -1)]); }
    roof.push([w + 18, -wh + 6], [w * 0.36, -wh - rh * 0.62], [6, -wh - rh], [-6, -wh - rh], [-w * 0.36, -wh - rh * 0.62]);
    sh.piece(roof, '#b89a5c', { round: 4, rough: 2.4, seg: 14, paint: (g) => {
      g.lineWidth = 1; for (let i = 0; i < 70; i++) { const x = -w - 16 + r() * (w + 16) * 2; g.strokeStyle = r() < 0.5 ? 'rgba(110,80,40,.45)' : 'rgba(240,215,150,.35)'; g.beginPath(); g.moveTo(x * 0.08, -wh - rh + 6); g.lineTo(x, -wh + 8); g.stroke(); }
      g.strokeStyle = 'rgba(80,56,30,.55)'; g.lineWidth = 2.2; g.beginPath(); g.moveTo(-w * 0.46, -wh - rh * 0.5); g.quadraticCurveTo(0, -wh - rh * 0.44, w * 0.46, -wh - rh * 0.5); g.stroke();
    } });
    sh.piece([[-7, -wh - rh + 2], [7, -wh - rh + 2], [4, -wh - rh - 12], [-4, -wh - rh - 12]], '#8a6a40', { round: 2, lift: 1.2, rough: 1.4 });
    return { spr: sh.finish(), windows: [door], top: [0, -wh - rh - 12] };
  },
  draw(g, P, t, e, env) { put(g, P.spr, env.sh); },
  glow: glowRects,
};

// The red-crowned crane: white body, black neck and bustle, a red cap. It can stand, preen and dance.
KINDS.crane = {
  bake(mk, v = 0) {
    const P = {};
    P.legs = mk('crane-legs', [-10, -56, 14, 4], { pad: 4 })
      .piece(strip(-2, -52, -4, 1, 2.6, 2), '#3a3a3c', { round: 0.8, thick: 0.5 })
      .piece(strip(4, -52, 7, 1, 2.6, 2), '#4a4a4c', { round: 0.8, thick: 0.5, lift: 0.6 })
      .piece([[-8, 1], [0, 1], [-1, 3], [-9, 3]], '#3a3a3c', { round: 0.8, lift: 0.4 }).piece([[2, 1], [11, 1], [10, 3], [2, 3]], '#4a4a4c', { round: 0.8, lift: 0.4 })
      .finish({ shadowBlur: 2 });
    P.body = mk('crane-body', [-40, -24, 34, 16], { pad: 5 })
      .piece([[-26, 2], [-34, -2], [-38, 6], [-30, 10], [-18, 8]], '#262426', { round: 3, rough: 1.2 })
      .piece([[-30, 0], [-22, -14], [-4, -20], [16, -18], [30, -8], [28, 4], [10, 10], [-14, 10]], '#f1ede4', { round: 7, rough: 0.8, lift: 1.4, paint: (g) => { g.strokeStyle = 'rgba(150,140,130,.35)'; g.lineWidth = 0.9; for (let i = 0; i < 6; i++) { g.beginPath(); g.moveTo(-20 + i * 6, -10); g.quadraticCurveTo(-14 + i * 6, -2, -22 + i * 6, 8); g.stroke(); } } })
      .piece([[-30, -2], [-40, 2], [-38, 12], [-28, 14], [-18, 10], [-20, 2]], '#2a2729', { round: 4, rough: 1.4, lift: 1.4, paint: (g) => { g.strokeStyle = 'rgba(255,255,255,.12)'; g.lineWidth = 0.8; for (let k = 0; k < 5; k++) { g.beginPath(); g.moveTo(-22 - k * 3, 2); g.lineTo(-34 - k * 1.4, 12); g.stroke(); } } })
      .finish({ shadowBlur: 3 });
    P.neck = mk('crane-neck', [-6, -62, 30, 6], { pad: 4 })
      .piece([[-4, 4], [-2, -16], [4, -34], [6, -50], [12, -58], [18, -58], [20, -53], [12, -48], [10, -34], [6, -14], [6, 4]], '#262426', { round: 3, paint: (g) => { g.fillStyle = '#efebe2'; g.beginPath(); g.moveTo(-2, -24); g.quadraticCurveTo(2, -40, 6, -48); g.lineTo(8, -44); g.quadraticCurveTo(4, -30, 2, -18); g.fill(); } })
      .piece(ellipse(14, -58.5, 4.4, 2.4, 10), '#c8282a', { round: 1, lift: 0.6 })
      .piece([[18, -56], [30, -53], [18, -52]], '#8a8670', { round: 0.6, lift: 0.6 })
      .finish({ shadowBlur: 2 });
    const wing = (n) => mk('crane-wing' + n, [-6, -66, 46, 8], { pad: 4 })
      .piece([[0, 2], [6, -24], [16, -48], [30, -62], [36, -60], [42, -50], [38, -40], [40, -30], [32, -16], [20, -4], [8, 4]], '#f3efe6', { round: 4, rough: 0.8, paint: (g) => { g.fillStyle = '#242224'; g.beginPath(); g.moveTo(30, -62); g.lineTo(42, -50); g.lineTo(38, -40); g.lineTo(40, -30); g.lineTo(32, -16); g.lineTo(26, -26); g.lineTo(30, -40); g.closePath(); g.fill(); g.strokeStyle = 'rgba(140,130,120,.4)'; g.lineWidth = 0.8; for (let k = 0; k < 5; k++) { g.beginPath(); g.moveTo(6 + k * 3, -6 - k * 6); g.lineTo(28 + k * 2, -22 - k * 7); g.stroke(); } } })
      .finish({ shadowBlur: 3 });
    P.wingF = wing('F'); P.wingB = wing('B');
    return P;
  },
  draw(g, P, t, e, env) {
    const d = e.dance ? e.dance(t) : 0, ph = t * 3.2 + e.a;
    const hop = d * Math.max(0, Math.sin(ph)) * 10, preen = d > 0.05 ? 0 : sramp(Math.sin(t * 0.33 + e.a * 2), 0.82, 0.98);
    g.translate(0, -hop);
    put(g, P.legs, env.sh, 2, 3);
    g.translate(0, -58);
    const spread = d * (0.7 + 0.3 * Math.sin(ph * 0.5 + 1));
    if (spread > 0.02) { g.save(); g.translate(-4, -8); g.rotate((-14 - spread * 46) * DEG); g.scale(1, 0.3 + 0.7 * spread); put(g, P.wingB, env.sh * 0.5); g.restore(); }
    g.save(); g.rotate((Math.sin(t * 0.8 + e.a) * 2 - d * 8) * DEG); put(g, P.body, env.sh, 2, 3); g.restore();
    g.save(); g.translate(18, -10); g.rotate((preen * 70 + fbm(t * 0.4 + e.a, 3) * 6 - d * 18 + Math.sin(ph) * d * 10) * DEG); put(g, P.neck, env.sh * 0.6); g.restore();
    if (spread > 0.02) { g.save(); g.translate(2, -10); g.rotate((6 + spread * 30) * DEG); g.scale(1, 0.3 + 0.7 * spread); put(g, P.wingF, env.sh * 0.5); g.restore(); }
  },
};

KINDS.reeds = {
  bake(mk, v = 0) {
    const r = rng(1200 + v), sh = mk('reeds' + v, [-30, -110, 30, 5], { pad: 6 });
    for (let i = 0; i < 7; i++) { const x = -18 + i * 6 + (r() - 0.5) * 3, h = 60 + r() * 40, lean = (r() - 0.5) * 14; sh.piece([[x - 1.6, 2], [x + lean, -h], [x + 1.6, 2]], i % 2 ? '#7a8a4a' : '#8a9452', { round: 0.4, thick: 0.6, lift: 0.6, rough: 0.3 }); if (r() < 0.6) sh.piece(ellipse(x + lean, -h - 4, 2.6, 9, 8, lean * 0.02), '#b8a070', { round: 2, lift: 0.6, thick: 0.4 }); }
    return { spr: sh.finish({ shadowBlur: 2 }) };
  },
  draw(g, P, t, e, env) { g.rotate((fbm(t * 0.9 + e.a * 0.7, 9) * 6 + Math.sin(t * 1.4 + e.a) * 1.5) * DEG); put(g, P.spr, env.sh * 0.5, 2, 2); },
};

// An early domestic pig, dark and bristly, nose to the ground.
KINDS.pig = {
  bake(mk, v = 0) {
    const r = rng(1300 + v), c = ['#4a3a34', '#5a4436', '#3e3434'][v % 3], P = {};
    const lg = mk('pig-legs' + v, [-24, -6, 26, 18]); for (const x of [-16, -8, 12, 19]) lg.piece(strip(x, -4, x, 15, 5, 4), shade(c, -0.15), { round: 1.5, thick: 0.6 }); P.legs = lg.finish({ shadowBlur: 2 });
    P.body = mk('pig-body' + v, [-34, -30, 30, 6]).piece([[-30, 0], [-32, -14], [-22, -26], [0, -28], [20, -24], [28, -12], [24, 2], [-10, 4]], c, { round: 8, rough: 1.4, paint: (g) => { dab(g, r, 60, [-30, -28, 26, 2], [rgb(shade(c, -0.3), 0.5), rgb(shade(c, 0.2), 0.35)], 5, 1.2); } }).piece([[-30, -14], [-36, -18], [-35, -12]], c, { round: 1, lift: 0.6 }).finish({ shadowBlur: 3 });
    P.head = mk('pig-head' + v, [-4, -16, 26, 10]).piece([[-2, -8], [8, -14], [16, -10], [24, -2], [24, 4], [12, 6], [0, 4]], c, { round: 3, paint: (g) => { g.fillStyle = 'rgba(20,12,10,.9)'; g.beginPath(); g.arc(13, -6, 1, 0, 7); g.fill(); g.fillStyle = shade(c, 0.15).length ? rgb(shade(c, 0.15)) : c; g.fillRect(22, -2, 3, 6); } }).piece([[4, -12], [8, -20], [12, -12]], shade(c, -0.1), { round: 1, lift: 0.8 }).finish({ shadowBlur: 2 });
    return P;
  },
  draw(g, P, t, e, env) {
    const root = sramp(Math.sin(t * 0.7 + e.a * 3), -0.3, 0.3);
    g.translate(0, -16); put(g, P.legs, env.sh, 2, 3);
    g.translate(0, -2 + Math.sin(t * 5 + e.a) * root * 0.6); put(g, P.body, env.sh, 2, 3);
    g.save(); g.translate(24, -12); g.rotate((root * 26 + Math.sin(t * 7 + e.a) * root * 4) * DEG); put(g, P.head, env.sh); g.restore();
  },
};

// A clump of bamboo: each cane sways on its own.
KINDS.bamboo = {
  bake(mk, v = 0) {
    const r = rng(1400 + v), canes = [], n = 5 + (v % 2);
    for (let i = 0; i < n; i++) {
      const h = 200 + r() * 140, w = 5 + r() * 2.4, lean = (i - n / 2) * 6 + (r() - 0.5) * 10, col = ['#7a9a52', '#6a8c4a', '#8aa860', '#5e7e44'][i % 4];
      const sh = mk('bamboo' + v + '-' + i, [-60 + Math.min(0, lean), -h - 40, 60 + Math.max(0, lean), 6], { pad: 6 });
      sh.piece([[-w / 2, 3], [lean - w * 0.35, -h], [lean + w * 0.35, -h], [w / 2, 3]], col, { round: 1, thick: 0.9, rough: 0.3, seg: 60, paint: (g) => { g.strokeStyle = rgb(shade(col, -0.35), 0.75); g.lineWidth = 1.3; for (let y = -14 - r() * 6; y > -h; y -= 22 + r() * 8) { const x = lean * (-y / h); g.beginPath(); g.moveTo(x - w * 0.55, y); g.lineTo(x + w * 0.55, y); g.stroke(); } g.fillStyle = rgb(shade(col, 0.25), 0.35); g.fillRect(-1.4, -h, 1.2, h); } });
      for (let k = 0; k < 6; k++) {
        const y = -h * (0.5 + r() * 0.48), x = lean * (-y / h), s = r() < 0.5 ? -1 : 1;
        for (let j = 0; j < 3; j++) { const a = (s > 0 ? -0.5 : Math.PI + 0.5) + (j - 1) * 0.35 + (r() - 0.5) * 0.3, L = 22 + r() * 12; const tx = x + Math.cos(a) * L, ty = y + Math.sin(a) * L * 0.6 + 6; sh.piece([[x, y], [(x + tx) / 2 - Math.sin(a) * 3, (y + ty) / 2 - 2], [tx, ty], [(x + tx) / 2 + Math.sin(a) * 2, (y + ty) / 2 + 2]], j % 2 ? '#6f9448' : '#86a85a', { round: 1.2, thick: 0.5, lift: 0.8, rough: 0.4 }); }
      }
      canes.push({ spr: sh.finish({ shadowBlur: 3 }), ph: r() * 10, x: (i - (n - 1) / 2) * 7 });
    }
    return { canes };
  },
  draw(g, P, t, e, env) {
    for (const c of P.canes) { g.save(); g.translate(c.x, 0); g.rotate((fbm(t * 0.45 + c.ph + e.a * 0.2, 11) * 3.4 + Math.sin(t * 0.9 + c.ph) * 0.8) * DEG); put(g, c.spr, env.sh); g.restore(); }
  },
};

KINDS.mulberry = {
  bake(mk, v = 0) {
    const r = rng(1500 + v), col = ['#4f7a3c', '#5a8442', '#47703a'][v % 3], h = 110 + v * 10;
    const sh = mk('mulberry' + v, [-70, -h - 60, 70, 6]);
    sh.piece([[-7, 2], [-5, -h * 0.5], [-26, -h * 0.82], [-20, -h * 0.86], [-2, -h * 0.64], [2, -h * 0.95], [7, -h * 0.94], [6, -h * 0.6], [24, -h * 0.84], [28, -h * 0.78], [8, -h * 0.48], [9, 2]], '#6a5040', { round: 2, paint: (g) => dab(g, r, 14, [-10, -h, 10, 0], ['rgba(40,26,18,.35)'], 8, 1.4) });
    for (const [x, y, rr] of [[-34, -h * 0.86, 34], [30, -h * 0.9, 34], [0, -h * 1.08, 42], [-10, -h * 0.74, 30], [16, -h * 0.72, 28]]) {
      sh.piece(ellipse(x, y, rr, rr * 0.8, 14), shade(col, (r() - 0.5) * 0.16), { round: 8, rough: 2.4, seg: 10, paint: (g) => {
        for (let i = 0; i < 26; i++) { const lx = x + (r() - 0.5) * rr * 1.7, ly = y + (r() - 0.5) * rr * 1.3; g.fillStyle = rgb(shade(col, r() < 0.5 ? 0.22 : -0.22), 0.6); g.beginPath(); g.ellipse(lx, ly, 6, 4.4, r() * 3, 0, 7); g.fill(); }
        g.fillStyle = 'rgba(70,20,50,.75)'; for (let i = 0; i < 8; i++) { g.beginPath(); g.arc(x + (r() - 0.5) * rr * 1.4, y + (r() - 0.5) * rr, 1.6, 0, 7); g.fill(); }
      } });
    }
    return { spr: sh.finish() };
  },
  draw(g, P, t, e, env) { g.rotate(sway(t, e, 1.2)); put(g, P.spr, env.sh); },
};

// The water buffalo: wide swept-back horns, a slow walk through the paddies.
KINDS.buffalo = {
  bake(mk, v = 0) {
    const r = rng(1600 + v), c = ['#4e4a4a', '#5a5450'][v % 2], P = {};
    for (const s of ['F', 'B']) P['leg' + s] = mk('buf-leg' + s + v, [-8, -6, 10, 46]).piece([[-6, -4], [6, -4], [5, 22], [4, 38], [6, 44], [-5, 44], [-4, 22]], s === 'B' ? shade(c, -0.18) : c, { round: 2.5 }).finish({ shadowBlur: 2 });
    P.body = mk('buf-body' + v, [-70, -60, 60, 10]).piece([[-62, -6], [-66, -30], [-50, -48], [-10, -52], [24, -56], [48, -46], [54, -24], [44, 4], [-40, 6]], c, { round: 9, rough: 1.2, paint: (g) => { dab(g, r, 50, [-60, -50, 50, 0], [rgb(shade(c, -0.25), 0.4), rgb(shade(c, 0.18), 0.3)], 8, 1.6); g.fillStyle = 'rgba(160,120,80,.35)'; g.fillRect(-66, -8, 120, 12); } }).piece([[-62, -26], [-74, -8], [-70, -6], [-60, -18]], c, { round: 1.5, lift: 0.8 }).finish();
    P.head = mk('buf-head' + v, [-12, -40, 46, 26]).piece([[-8, -8], [8, -14], [26, -10], [36, 4], [34, 16], [22, 20], [6, 12], [-6, 6]], shade(c, -0.05), { round: 5, paint: (g) => { g.fillStyle = 'rgba(15,10,10,.9)'; g.beginPath(); g.arc(18, -4, 1.5, 0, 7); g.fill(); g.fillStyle = 'rgba(170,150,140,.6)'; g.beginPath(); g.ellipse(32, 12, 4, 3, 0, 0, 7); g.fill(); } })
      .piece([[0, -10], [-10, -22], [-6, -36], [4, -40], [16, -36], [8, -32], [2, -24], [8, -12]], '#a8a090', { round: 3, lift: 1.4, paint: (g) => { g.strokeStyle = 'rgba(80,70,60,.4)'; g.lineWidth = 0.8; for (let k = 0; k < 6; k++) { g.beginPath(); g.moveTo(-6 + k, -14 - k * 4); g.lineTo(-2 + k * 2, -16 - k * 4); g.stroke(); } } })
      .finish({ shadowBlur: 3 });
    return P;
  },
  draw(g, P, t, e, env) {
    const walk = e.move ? 1 : 0, ph = t * (e.pace ?? 2.2) + e.a;
    g.translate(0, -44);
    for (const [x, o, s] of [[-44, 0, 'B'], [30, Math.PI, 'B'], [-36, Math.PI, 'F'], [38, 0, 'F']]) { g.save(); g.translate(x, 0); g.rotate(Math.sin(ph + o) * 12 * walk * DEG); put(g, P['leg' + s], env.sh, 2, 3); g.restore(); }
    g.translate(0, Math.abs(Math.cos(ph)) * 1.5 * walk);
    put(g, P.body, env.sh, 3, 4);
    g.save(); g.translate(48, -30); g.rotate((fbm(t * 0.35 + e.a, 4) * 6 + 8 + Math.sin(ph) * 3 * walk) * DEG); put(g, P.head, env.sh * 0.6); g.restore();
  },
};

// Karst towers: the limestone peaks of the south, for the distant layers.
KINDS.karst = {
  bake(mk, v = 0) {
    const r = rng(1700 + v), w = [54, 44, 64, 50, 40, 60][v % 6], h = [190, 240, 165, 215, 260, 180][v % 6], col = ['#5f7f6c', '#6a8a76', '#577762'][v % 3];
    const side = (s0) => { const pts = [], n = 16, ph = r() * 9; for (let i = 0; i <= n; i++) { const f = i / n, hw = w * Math.pow(Math.max(0, 1 - f ** 2.6), 0.5) * (1 + 0.05 * Math.sin(f * 6 + ph) + 0.03 * Math.sin(f * 15 + ph * 2)) * (1 + 0.22 * (1 - f) ** 8); pts.push([s0 * hw + (r() - 0.5) * 3, -h * f]); } return pts; };
    const R = side(1).reverse(), Lf = side(-1), lean = (r() - 0.5) * 10;
    const pts = [[-w * 1.25, 6], ...Lf.map(([x, y]) => [x + lean * (-y / h) ** 2, y]), ...R.map(([x, y]) => [x + lean * (-y / h) ** 2, y]), [w * 1.25, 6]];
    const sh = mk('karst' + v, [-w * 1.4 - 10, -h - 14, w * 1.4 + 10, 8]);
    sh.piece(pts, col, { round: 6, rough: 2, seg: 16, paint: (g) => {
      g.strokeStyle = 'rgba(30,50,40,.28)'; g.lineWidth = 2.2; for (let i = 0; i < 16; i++) { const x = (r() - 0.5) * w * 1.5, y0 = -h * (0.3 + r() * 0.6); g.beginPath(); g.moveTo(x, y0); g.lineTo(x + (r() - 0.5) * 5, y0 + h * (0.1 + r() * 0.25)); g.stroke(); }
      dab(g, r, 90, [-w, -h * 0.98, w, -h * 0.1], ['rgba(40,84,52,.55)', 'rgba(62,104,64,.5)', 'rgba(30,64,44,.45)'], 8, 3.2);
      g.fillStyle = 'rgba(220,226,214,.16)'; for (let i = 0; i < 10; i++) g.fillRect(-w + r() * w * 2, -h * r(), 2, 14 + r() * 20);
      const mist = g.createLinearGradient(0, -h * 0.45, 0, 6); mist.addColorStop(0, 'rgba(226,232,226,0)'); mist.addColorStop(1, 'rgba(226,232,226,.55)'); g.fillStyle = mist; g.fillRect(-w * 1.5, -h, w * 3, h + 10);
    } });
    return { spr: sh.finish({ shadowBlur: 6 }) };
  },
  draw(g, P, t, e, env) { put(g, P.spr, env.sh, 3, 4); },
};

// Little ripples for rivers: v 0 the silt-yellow Yellow River, 1 the green Yangtze, 2 dark night water.
KINDS.ripple = {
  bake(mk, v = 0) {
    const r = rng(1750 + v), c = ['#b8894a', '#4f8a8a', '#2c4058'][v % 3], pts = [[-34, 4]];
    for (let i = 0; i <= 4; i++) { const x = -34 + i * 17; pts.push([x - 4, -2 - r() * 2], [x + 3, -7 - r() * 3, 2], [x + 7, -2]); }
    pts.push([34, 4]);
    return { spr: mk('ripple' + v, [-38, -14, 38, 6], { pad: 5 }).piece(pts, c, { round: 2.4, rough: 0.6, seg: 30, thick: 0.8, paint: (g) => { g.fillStyle = 'rgba(245,240,225,.45)'; for (let i = 0; i <= 4; i++) { g.beginPath(); g.ellipse(-30 + i * 17, -5, 3, 1, -0.4, 0, 7); g.fill(); } } }).finish({ shadowBlur: 2 }), ph: r() * 9 };
  },
  draw(g, P, t, e, env) { g.translate(Math.sin(t * 0.9 + P.ph + e.a * 3) * 3, Math.sin(t * 1.3 + e.a * 2) * 1.2); put(g, P.spr, env.sh * 0.4, 1, 2); },
};

// Reeling silk: cocoons in a basin of hot water, a single thread wound onto a turning reel.
KINDS.silkreel = {
  bake(mk) {
    const P = {};
    P.base = mk('silk-base', [-40, -64, 60, 6])
      .piece([[-34, 4], [-30, -14], [-4, -14], [0, 4]], '#6a4a34', { round: 2 })
      .piece([[-38, -14], [4, -14], [0, -30], [-34, -30]], '#a8653c', { round: 4, lift: 1.4, paint: (g) => { g.fillStyle = 'rgba(240,215,170,.35)'; g.fillRect(-34, -26, 34, 1.6); } })
      .piece(ellipse(-17, -30, 17, 3.4, 12), '#7a9aa8', { round: 2, lift: 0.8, paint: (g) => { g.fillStyle = '#f4efe2'; for (const x of [-26, -20, -12, -7]) { g.beginPath(); g.ellipse(x, -30.5, 2.8, 1.8, 0.2, 0, 7); g.fill(); } } })
      .piece(strip(30, 4, 30, -56, 3.4, 3), '#5b4331', { round: 1, lift: 1 }).piece(strip(54, 4, 54, -56, 3.4, 3), '#5b4331', { round: 1, lift: 1 })
      .finish({ shadowBlur: 4 });
    P.reel = mk('silk-reel', [-18, -18, 18, 18], { pad: 4 }).piece(ellipse(0, 0, 3, 3, 8), '#4a3423', { round: 1 });
    for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2; P.reel.piece(strip(0, 0, Math.cos(a) * 16, Math.sin(a) * 16, 2.2, 2), '#6a4a2e', { round: 0.6, lift: 0.6 }); }
    P.reel.piece(ellipse(0, 0, 9, 9, 14), '#e8c46a', { round: 3, lift: 1, thick: 0.5, rim: 0.2, paint: (g) => { g.strokeStyle = 'rgba(255,240,190,.6)'; g.lineWidth = 0.6; for (let rr = 3; rr < 9; rr += 1.4) { g.beginPath(); g.arc(0, 0, rr, 0, 7); g.stroke(); } } });
    P.reel = P.reel.finish({ shadowBlur: 2 });
    return P;
  },
  draw(g, P, t, e, env) {
    put(g, P.base, env.sh, 3, 4);
    const spin = e.spin ? e.spin(t) : t * 2;
    g.save(); g.translate(42, -50); g.rotate(spin); put(g, P.reel, env.sh * 0.5); g.restore();
    // the single thread, from a cocoon to the reel
    g.strokeStyle = 'rgba(245,214,130,.9)'; g.lineWidth = 0.7;
    g.beginPath(); g.moveTo(-14, -31); g.quadraticCurveTo(10, -60 + Math.sin(t * 3) * 2, 42, -59); g.stroke();
  },
};

// Someone playing an end-blown bone flute, sitting. Arms reach the flute (inverse kinematics), fingers move.
// e.v: the look; e.play(t): 0 holding it in the lap, 1 playing.
KINDS.flutist = {
  bake(mk, v) { const P = KINDS.person.bake(mk, v); P.flute = mk('flutist-flute', [-3, -4, 4, 32], { pad: 4 }).piece(strip(0.5, 0, 0.5, 30, 3, 2.4), '#e8dcc0', { round: 1, thick: 0.6, rough: 0.3, paint: (g) => { g.fillStyle = 'rgba(70,50,35,.85)'; for (let y = 10; y < 28; y += 2.8) { g.beginPath(); g.arc(0.5, y, 0.7, 0, 7); g.fill(); } } }).finish({ shadowBlur: 2 }); return P; },
  draw(g, P, t, e, env) {
    const pl = e.play ? e.play(t) : 1, lean = 6 + pl * 4 + Math.sin(t * 0.9) * 0.8, hd = -4 + pl * 6 + Math.sin(t * 1.7) * pl * 2;
    const cs = Math.cos(hd * DEG), sn = Math.sin(hd * DEG), mx = 9.6, my = -8.5;
    const mouth = [0.5 + mx * cs - my * sn, -38.5 + mx * sn + my * cs];
    const anchor = [lerp(6, mouth[0], pl), lerp(-22, mouth[1], pl)], ang = lerp(0, 50, pl) * DEG, dir = [Math.cos(ang), Math.sin(ang)];
    const f1 = pl * Math.sin(t * 9.1) * 0.8, f2 = pl * Math.sin(t * 7.3 + 1) * 0.8;
    const h1 = [anchor[0] + dir[0] * (9 + f1), anchor[1] + dir[1] * (9 + f1)], h2 = [anchor[0] + dir[0] * (19 + f2), anchor[1] + dir[1] * (19 + f2)];
    const [b1, b2] = reach(h1[0] + 3, h1[1] + 35), [a1, a2] = reach(h2[0] - 2, h2[1] + 34.5);
    drawPerson(g, P, t, e, env, { lean, head: hd, back: [b1, b2], front: [a1, a2], held: (g2) => {
      g2.save(); g2.rotate(-a2 * DEG); g2.translate(0, -19); g2.rotate(-a1 * DEG); g2.translate(-2, 34.5);
      g2.translate(anchor[0], anchor[1]); g2.rotate(Math.atan2(-dir[0], dir[1])); put(g2, P.flute, env.sh * 0.4, 1, 2); g2.restore();
    } });
  },
};

// "The Long Thread": the whole film. Where everything stands on the globe, how the light and the sky
// change, and the special moments. Times come from src/timeline.js (generated from film/film.json).
// Each chapter adds its cut-outs with add(), and its moments as hooks: lights(), sky(), ground(), over().
import { monotone, track, noise, fbm, smooth, sramp, clamp, spring, hash, rng, lerp, mix, shade, rgb, DEG } from './util.js';
import { put } from './paper.js';
import { KINDS } from './cutouts.js';
import { LOOKS } from './people.js';
import './kinds_nature.js';
import './kinds_built.js';
import './kinds_modern.js';
import './kinds_china.js';
import { makeFx, hang2 } from './sky_china.js';
import { BlurSheet } from './engine.js';
import { EV, DURATION } from './timeline.js';

const ev = (k, d) => EV[k] ?? d;

// ------------------------------------------------------------------ people ---
Object.assign(LOOKS, {
  fluteman: { skin: 3, top: 'tunic', topCol: '#b8a07a', hair: 'bun', hairCol: '#1e1612', pose: 'sit' },
  jiahuW: { skin: 3, top: 'dress', topCol: '#a8865a', legs: 'skirt', legCol: '#8a6a48', hair: 'long', pose: 'sit' },
  jiahuKid: { skin: 3, top: 'tunic', topCol: '#c8b088', hair: 'short', pose: 'stand', small: 0.66 },
  jiahuOld: { skin: 3, top: 'tunic', topCol: '#9a7e5a', hair: 'bun', hairCol: '#b8b0a4', beard: 1, beardCol: '#c8c0b4', pose: 'stand' },
  milletF: { skin: 3, top: 'tunic', topCol: '#a89068', hair: 'bun', pose: 'stand', item: 'hoe' },
  milletW: { skin: 4, top: 'dress', topCol: '#8a6a4a', legs: 'skirt', legCol: '#7a5a3a', hair: 'long', pose: 'stand', item: 'basket' },
  paddyF: { skin: 4, top: 'tunic', topCol: '#7a8a7a', hat: 'cone', hatCol: '#c9a86a', legs: 'trousers', legCol: '#5a6a6a', pose: 'stand' },
  reeler: { skin: 4, top: 'dress', topCol: '#c4a070', legs: 'skirt', legCol: '#a8865a', hair: 'bun', pose: 'sit' },
});

// ------------------------------------------------------------------ camera ---
const cam = monotone([
  // 1. the bone flute
  [0, -40], [3, -31], [7, -15], [11, -5.5], [15, -1], [19, 2], [22.5, 4.5], [25, 13], [27.5, 30], [30, 41], [32.5, 53], [35, 64], [37.5, 80], [40.5, 88], [43, 93], [46, 104],
  // (the rest of the film is laid out chapter by chapter)
  [52, 140], [662, 2600], [800, 2740],
]);

// ------------------------------------------------- paint and shape of land --
const ZONES = [
  [-200, 28, [148, 134, 86]], [33, 50, [196, 164, 104]], [56, 76, [112, 140, 82]], [80, 110, [104, 132, 76]],
  [116, 9999, [176, 150, 108]],
];
const SEAS = [];
function zoneColor(a) {
  for (let i = 0; i < ZONES.length; i++) {
    const [a0, a1, c] = ZONES[i];
    if (a <= a1) { if (a >= a0 || i === 0) return c; const p = ZONES[i - 1]; return mix(p[2], c, smooth((a - p[1]) / (a0 - p[1]))); }
  }
  return ZONES[ZONES.length - 1][2];
}
const water = (a) => { let w = 0; for (const [a0, a1] of SEAS) w = Math.max(w, sramp(a, a0 - 2, a0 + 1) * (1 - sramp(a, a1 - 1, a1 + 2))); return w; };
const band = (a, a0, a1, e = 3) => sramp(a, a0 - e, a0 + e) * (1 - sramp(a, a1 - e, a1 + e));
function ground(layer, a) {
  const c = zoneColor(a), w = water(a);
  if (layer === 'main') return c;
  if (layer === 'mid') return w > 0.5 ? mix(c, [70, 110, 140], 0.3) : mix(mix(shade(c, 0.06), [196, 186, 172], 0.16), [214, 180, 112], band(a, 32, 50) * 0.35);
  if (layer === 'far') return w > 0.5 ? [90, 120, 150] : mix(mix(c, [150, 150, 162], 0.55), [110, 140, 130], band(a, 56, 100) * 0.4);
  if (layer === 'front') return shade(c, w > 0.5 ? -0.25 : -0.32);
  return shade(c, -0.55);
}
const profile = {
  far: (a) => (1 - water(a)) * (noise(a * 0.07, 5) * 14 + noise(a * 0.31, 6) * 4 + 12) + band(a, -60, 26) * 8,
  mid: (a) => (1 - water(a)) * (noise(a * 0.33, 3) * 8 + noise(a * 0.1, 4) * 13) + band(a, 30, 50, 4) * (16 + noise(a * 0.8, 9) * 4) - water(a) * 6,
  main: (a) => (1 - water(a)) * (noise(a * 0.9, 1) * 1.6 + noise(a * 0.21, 2) * 3.5) - band(a, 9, 21, 1.5) * 3 - band(a, 58, 73, 1) * 2.5 - water(a) * 4,
  front: (a) => noise(a * 0.5, 7) * 4 + noise(a * 0.13, 17) * 6,
  core: (a) => noise(a * 0.2, 8) * 8,
};

// --------------------------------------------------------------- cut-outs --
const E = [];
const add = (kind, layer, a, o = {}) => { const e = { kind, layer, a, ...o }; E.push(e); return e; };
const PS = 1.3, P2 = 1.2;
const R = rng(5);
function grassRun(a0, a1, step, layer, o = {}) { for (let a = a0; a < a1; a += step * (0.7 + R() * 0.8)) { if (o.skip && o.skip(a)) continue; add('grass', layer, a, { v: (R() * 6) | 0, z: R() < 0.5 ? 1 : 3, flip: R() < 0.5, scale: (o.s || 1) * (0.8 + R() * 0.5), loud: 0.25 }); } }
// chapter hooks
const HOOK = { lights: [], sky: [], ground: [], over: [] };
const hook = (o) => { for (const k in o) HOOK[k].push(o[k]); };
// Drop-in for things on threads: falls from above, bounces, settles; and leaves again at t1.
const drop = (t, t0, t1 = 1e9) => clamp(spring(t - t0, 5.5, 0.42), 0, 1.4) - (t > t1 ? spring(t - t1, 4, 0.7) * 1.4 : 0);
const near = (a, c, w = 70) => Math.abs(a - c) < w;
const flick = (t, s) => 0.84 + 0.16 * fbm(t * 7.3 + s, 60) + 0.05 * Math.sin(t * 31 + s);

// ===================================================== 1. The bone flute ===
// Nine thousand years ago, a village by the water at night: round houses, a fire, a flute, cranes.
{
  const T_FLUTE = 11.4, T_STOP = 20.4;
  add('logs', 'main', 0, { z: 2, delay: 0.75, scale: PS });
  add('flutist', 'main', -4.6, { v: 'fluteman', z: 2, scale: PS, delay: 0.3, play: (t) => sramp(t, T_FLUTE - 0.8, T_FLUTE) * (1 - sramp(t, T_STOP + 0.6, T_STOP + 1.6)) });
  add('person', 'main', 4.4, { v: 'jiahuW', z: 2, scale: PS, flip: true, delay: 0.6, act: (t) => ({ head: t > T_FLUTE ? 6 + Math.sin(t * 0.6) * 3 : -2, lean: 10 }) });
  add('person', 'main', 7.2, { v: 'jiahuKid', z: 2.5, scale: PS, flip: true, delay: 0.9, act: (t) => ({ head: t > T_FLUTE + 1 ? -10 + Math.sin(t * 0.8) * 4 : 4, front: t > T_FLUTE + 1 ? [-20 + Math.sin(t * 2) * 10, -20] : [-12, -16] }) });
  add('person', 'main', -9.4, { v: 'jiahuOld', z: 1.5, scale: PS, delay: 0.2, act: (t) => ({ head: 6 + Math.sin(t * 0.5) * 2 }) });
  for (const [a, v, z] of [[-16, 0, 0], [-27, 1, 0], [26, 2, 0], [-38, 0, 0]]) add('roundhut', 'main', a, { v, z, winOn: (t) => 0.55 * (1 - sramp(t, 25, 28)) * (0.85 + 0.15 * fbm(t * 6 + a, 3)) });
  for (const [a, v] of [[-22, 0], [-30, 1], [-8, 2], [22, 0], [34, 1]]) add('roundhut', 'mid', a, { v, scale: 0.55, winOn: (t) => 0.5 * (1 - sramp(t, 25, 28)) });
  add('pig', 'main', -20.6, { v: 0, z: 3, scale: 0.9 }); add('pig', 'main', -23.2, { v: 1, z: 3, scale: 0.7, flip: true });
  // the marsh beside the village: reeds, and two cranes
  for (const [a, z, s] of [[9.6, 1, 1.1], [11.4, 4, 0.7], [16.2, 1, 0.9], [19.8, 4, 0.75], [21.4, 1, 1.2], [23, 4, 0.8]]) add('reeds', 'main', a, { v: (R() * 4) | 0, z, scale: s, loud: 0.3 });
  for (let a = 9.6; a < 22; a += 2.6) add('ripple', 'main', a, { v: 2, z: 3.5, y: -4, scale: 0.7 });
  add('crane', 'main', 13.6, { z: 3, scale: 1.25, dance: (t) => sramp(t, T_FLUTE + 1.2, T_FLUTE + 2.4) * (1 - sramp(t, T_STOP, T_STOP + 1.2)) });
  add('crane', 'main', 18.6, { z: 2, scale: 1.0, flip: true });
  for (const a of [-44, 31.5]) add('bamboo', 'main', a, { v: a > 0 ? 1 : 0, z: 0 });
  for (const [a, v] of [[-50, 0], [-12, 1], [10, 2], [40, 0]]) add('oak', 'mid', a, { v, scale: 0.5 });
  for (const a of [-34, 4, 28]) add('bamboo', 'mid', a, { v: 2, scale: 0.55 });
  grassRun(-60, 30, 3.6, 'main', { skip: (a) => (a > -6 && a < 9) || (a > 9 && a < 21) });
  grassRun(-60, 32, 8, 'mid', { s: 0.7 });
  grassRun(-60, 30, 6, 'front', { s: 2.0 });

  // dawn: farming along two rivers. Millet by the Yellow River (north), rice along the Yangtze (south).
  const T_MILLET = 29.0, T_RICE = 32.2;
  [38.6, 40.6, 42.6, 44.8, 47.0].forEach((a, i) => add('millet', 'main', a, { v: i % 3, z: 1, scale: 1.6, popAt: T_MILLET + 0.2 + i * 0.13, loud: 0.6 }));
  add('person', 'main', 46, { v: 'milletF', z: 2, scale: P2, popAt: T_MILLET + 0.5, act: (t) => { const k = Math.max(0, Math.sin(t * 2.4)); return { lean: 10 + k * 14, front: [-110 + k * 70, -30], back: [-90 + k * 70, -40] }; } });
  add('person', 'main', 41.6, { v: 'milletW', z: 2.5, scale: P2, popAt: T_MILLET + 0.8, flip: true });
  [59.4, 61.8, 64.2, 66.6, 69.0, 71.4].forEach((a, i) => add('rice', 'main', a, { v: i % 3, z: 1, scale: 1.4, popAt: T_RICE + 0.2 + i * 0.12, loud: 0.5, ground: true }));
  add('person', 'main', 63.2, { v: 'paddyF', z: 2, scale: P2, popAt: T_RICE + 0.5, act: (t) => ({ lean: 34 + Math.sin(t * 1.6) * 4, head: 10, front: [-30 + Math.sin(t * 3.2) * 18, -10], back: [-20 + Math.sin(t * 3.2 + 1.5) * 16, -14] }) });
  add('buffalo', 'main', 70.2, { z: 2.2, scale: 0.95, popAt: T_RICE + 0.9, flip: true, pace: 1.6, move: (t) => -clamp((t - T_RICE - 1.5) * 0.25, 0, 3) });
  for (const [a, v, s] of [[78, 0, 0.75], [84, 1, 0.9], [89, 4, 0.7], [95, 2, 0.95], [101, 3, 0.8], [108, 5, 0.85], [114, 1, 0.7]]) add('karst', 'far', a, { v, scale: s });
  for (const [a, v, s] of [[60.5, 2, 0.5], [66, 1, 0.42], [74.5, 0, 0.55], [79, 4, 0.4]]) add('karst', 'mid', a, { v, scale: s });
  for (let a = 34.6; a < 38; a += 1.6) add('ripple', 'main', a, { v: 0, z: 0.5, y: -4, scale: 0.6 });
  for (let a = 53.8; a < 57.4; a += 1.6) add('ripple', 'main', a, { v: 1, z: 0.5, y: -4, scale: 0.6 });
  add('bamboo', 'main', 75.4, { v: 0, z: 0 }); add('bamboo', 'mid', 69, { v: 1, scale: 0.55 });
  grassRun(34, 56, 3.4, 'main', { skip: (a) => a > 37 && a < 48.5 });
  grassRun(30, 110, 7, 'front', { s: 2 });

  // and they learned to unwind a silk moth's cocoon into one long, shining thread
  const T_SILK = 37.1;
  for (const [a, v] of [[80.5, 0], [85.6, 1], [100.4, 2], [106, 0]]) add('mulberry', 'main', a, { v, z: 0 });
  for (const a of [78, 90, 103]) add('mulberry', 'mid', a, { v: 1, scale: 0.55 });
  add('silkreel', 'main', 92.6, { z: 2, scale: 1.25, spin: (t) => t * 1.5 + Math.max(0, t - T_SILK) * 2.2 });
  add('person', 'main', 89.2, { v: 'reeler', z: 2.5, scale: P2, act: (t) => ({ lean: 14, head: 14, front: [-44 + Math.sin(t * 2.2) * 8, -40], back: [-36, -30] }) });
  grassRun(78, 112, 3.4, 'main', { skip: (a) => a > 88 && a < 96 });

  hook({
    lights(t, c, L, Em) {
      if (near(0, c, 60) && t < 30) {
        const k = 1 - sramp(t, 26, 29);
        L.push({ a: 0, h: 34, r: 1000, k: 1.15 * k * flick(t, 0), color: [255, 158, 80] });
        Em.push({ a: 0, h: 5, scale: PS * 1.15, lit: k, litAt: -20, seed: 1 });
        for (const a of [-16, -27, 26, -38]) L.push({ a, h: 20, r: 160, k: 0.45 * k, color: [255, 170, 90] });
      }
    },
  });
}
// the thread of silk: unwound from the reel, it runs on, stitched into the world, through everything
const THREAD0 = 94.6;
const threadEnd = (t) => (t < 40.4 ? -1e9 : t < 46.5 ? THREAD0 + (t - 40.4) * 9 : 1e9);

E.sort((p, q) => (p.z || 0) - (q.z || 0) || p.a - q.a);
const byLayer = {};
for (const e of E) (byLayer[e.layer] ||= []).push(e);

// -------------------------------------------------------------------- sky ---
const NIGHT = ['#0a102b', '#11193c', '#1a2650', '#2e3a66'], DUSK = ['#141b3c', '#27294f', '#4f3d63', '#8a5a62'], DAWN = ['#3a4a7a', '#9a8aa8', '#f0b88a', '#f8d8a8'], DAY = ['#7aa4cc', '#a8c4d8', '#e2e6e0', '#f0e8d0'];
const W_ = [255, 252, 244];
const skyK = track([
  [0, ['#34406c', '#80628a', '#dc8c62', '#f6b76a']], [5, ['#262f5a', '#57497c', '#b0627a', '#e08f5e']], [9, DUSK], [13, ['#0c1230', '#131c42', '#1e2a56', '#35426e']],
  [23, ['#0c1230', '#131c42', '#1e2a56', '#35426e']], [27, DAWN], [31, DAY], [46, DAY], [49, DUSK], [53, NIGHT],
]);
const ambK = track([[0, [244, 214, 196]], [5, [176, 150, 164]], [9, [96, 98, 138]], [13, [58, 70, 114]], [23, [58, 70, 114]], [27, [200, 180, 175]], [31, W_], [46, W_], [49, [150, 120, 130]], [53, [50, 58, 100]]]);
const moteK = track([[0, [255, 222, 170]], [12, [255, 190, 120]], [26, [255, 222, 170]], [46, [255, 222, 170]], [52, [255, 190, 120]]]);
const gradeK = track([[0, [255, 170, 95, 0.16]], [24, [255, 170, 95, 0.16]], [30, [255, 205, 150, 0.1]], [46, [255, 205, 150, 0.1]], [52, [255, 160, 90, 0.16]]]);
const SUNS = [[-1, 11, -430, -78, 170], [24, 31, 430, 170, -60], [45, 52, -430, -40, 170]];
const NIGHTS = [[7, 27]];
const ZOOM = [[8, 12, 19.5, 24, 0.36], [26.5, 28.5, 34, 36, 0.12], [36.5, 38.5, 43.5, 46, 0.22]];

function state(t, stage) {
  const c = cam(t), lights = [], emitters = [], smoke = [];
  for (const f of HOOK.lights) f(t, c, lights, emitters, smoke);
  let nightK = 0; for (const [a0, a1] of NIGHTS) nightK = Math.max(nightK, sramp(t, a0, a0 + 5) * (1 - sramp(t, a1 - 4, a1)));
  let sun = null;
  for (const [t0, t1, x, y0, y1] of SUNS) if (t > t0 && t < t1) sun = { x, y: lerp(y0, y1, smooth((t - t0) / (t1 - t0))), k: 1 };
  const pull = sramp(t, ev('pull', 631), ev('pull', 631) + 12);
  let zoom = 1;
  for (const [a0, a1, b0, b1, k] of ZOOM) zoom *= 1 + k * sramp(t, a0, a1) * (1 - sramp(t, b0, b1));
  return {
    fire: { lit: 0, reach: 0, blow: 0 }, lights, emitters, smoke,
    sky: skyK(t), ambient: ambK(t), ground: null,
    stars: nightK + pull * lerp(1, 0.22, sramp(t, 640, 652)),
    sun, cloud: 1 - nightK * 0.4, snow: 0,
    motes: 0.4 + 0.25 * nightK, moteColor: moteK(t),
    emit: true, screen: 0, blink: 0, bloom: 0.16 + 0.34 * nightK, grade: gradeK(t), rays: 1,
    zoom, pull, rustle: 0,
    fade: Math.max(1 - sramp(t, 0.1, 3.4), sramp(t, DURATION - 3.5, DURATION)),
  };
}

const clouds = [
  { v: 0, x: -520, yf: 0.72, s: 1, par: 2.2, drift: 3.0 },
  { v: 1, x: 260, yf: 0.84, s: 0.8, par: 1.6, drift: 2.2 },
  { v: 2, x: 820, yf: 0.6, s: 1.1, par: 2.6, drift: 3.6 },
  { v: 3, x: -1050, yf: 0.9, s: 0.7, par: 1.4, drift: 1.8 },
];

// -------------------------------------------------------------- moments ---
function sky(g, st, t, S) {
  const { W, H } = st, u = st.eu;
  g.setTransform(1, 0, 0, 1, 0, 0);
  const mw = 0.7 * sramp(t, 10, 15) * (1 - sramp(t, 22, 26));
  if (mw > 0.01) milkyWay(g, st, t, mw * (1 - S.pull), 0);
  birds(g, st, t);
  // the moon over the village
  if (t > 7 && t < 30) {
    const y = H * lerp(-0.12, 0.15, drop(t, 7.5, 24.5)), x = W * (st.aspectK > 0.4 ? 0.74 : 0.7);
    g.globalCompositeOperation = 'screen'; const gl = g.createRadialGradient(x, y, 0, x, y, 230 * u); gl.addColorStop(0, 'rgba(210,222,255,0.2)'); gl.addColorStop(1, 'rgba(200,215,255,0)'); g.fillStyle = gl; g.fillRect(0, 0, W, H); g.globalCompositeOperation = 'source-over';
    st.hang(g, st.fx.moon, x, y, 1, Math.sin(t * 0.5) * 1.6 * DEG, 1, -0.35);
  }
  // in the long days a paper sun hangs on its thread
  for (const [t0, t1] of [[30.5, 45]]) {
    if (t < t0 - 0.5 || t > t1 + 3) continue;
    const k = drop(t, t0, t1), sx = W * (st.aspectK > 0.4 ? 0.16 : 0.2), sy = H * lerp(-0.25, 0.13, k);
    g.globalCompositeOperation = 'screen'; const gl = g.createRadialGradient(sx, sy, 0, sx, sy, 300 * u); gl.addColorStop(0, `rgba(255,236,190,${0.35 * clamp(k)})`); gl.addColorStop(1, 'rgba(255,230,180,0)'); g.fillStyle = gl; g.fillRect(sx - 300 * u, sy - 300 * u, 600 * u, 600 * u); g.globalCompositeOperation = 'source-over';
    st.hang(g, st.fx.sun, sx, sy, 0.75, Math.sin(t * 0.4) * 1.2 * DEG, 1, t * 0.03);
  }
  for (const f of HOOK.sky) f(g, st, t, S);
}

// Things drawn in the world, in planet units: rivers, paths, the thread.
function groundFx(g, st, t, S) {
  const c = cam(t), rad = (a, h) => { const rel = (a - c) * DEG, r = 1000 + profile.main(a) + h; return [Math.sin(rel) * r, -Math.cos(rel) * r]; };
  const vis = st.visE + 4, from = c - vis, to = c + vis;
  const run = (a0, a1, fn) => { const s0 = Math.max(a0, from), s1 = Math.min(a1, to); if (s0 < s1) fn(s0, s1); };
  const along = (a0, a1, step, fn) => { for (let a = Math.ceil(a0 / step) * step; a < a1; a += step) fn(a); };
  const arc = (a0, a1, h, w, style, dash, off = 0) => { g.save(); g.strokeStyle = style; g.lineWidth = w; if (dash) { g.setLineDash(dash); g.lineDashOffset = off; } g.beginPath(); for (let a = a0; a <= a1 + 0.001; a += 0.3) { const [x, y] = rad(Math.min(a, a1), h); a === a0 ? g.moveTo(x, y) : g.lineTo(x, y); } g.stroke(); g.restore(); };
  const river = (a0, a1, h, w, col, glint) => run(a0, a1, (s0, s1) => { arc(s0, s1, h, w, col); arc(s0, s1, h - w * 0.2, 1.2, glint, [10, 16], -t * 14); });
  const GF = { c, rad, run, along, arc, river, t, S };
  // the village path, the marsh
  run(-60, 30, (a0, a1) => arc(a0, a1, -9, 2.2, 'rgba(110,84,46,.3)', [7, 9]));
  river(9, 22.5, -5, 11, 'rgba(46,70,92,.9)', 'rgba(200,220,240,.35)');
  // the Yellow River, thick with loess; the Yangtze, green-blue; the flooded paddies
  river(34.2, 38.2, -6, 15, 'rgba(176,132,62,.95)', 'rgba(255,230,170,.45)');
  river(53.4, 57.6, -6, 15, 'rgba(62,112,120,.95)', 'rgba(210,240,240,.45)');
  run(58.4, 72.6, (a0, a1) => { arc(a0, a1, -3, 5, 'rgba(100,140,150,.85)'); arc(a0, a1, -4, 1, 'rgba(230,245,250,.5)', [6, 18], -t * 6); along(a0, a1, 2.4, (a) => { const [x0, y0] = rad(a, -1), [x1, y1] = rad(a, -8); g.strokeStyle = 'rgba(90,110,70,.5)'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); }); });
  run(38, 48, (a0, a1) => along(a0, a1, 0.55, (a) => { const [x0, y0] = rad(a, -4), [x1, y1] = rad(a + 0.25, -15); g.strokeStyle = 'rgba(120,90,50,.42)'; g.lineWidth = 2.2; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); }));
  for (const f of HOOK.ground) f(g, st, t, S, GF);
  // The thread. From the reel it rises, then runs on just under the edge of the world, stitched in.
  const end = threadEnd(t);
  if (end > THREAD0 - 1) run(THREAD0 - 2, end, (a0, a1) => {
    const H = (a) => (a < THREAD0 + 2 ? lerp(52, -12, smooth((a - THREAD0) / 2)) : -12) + (S.threadLift ? S.threadLift(a) : 0);
    g.save(); g.lineCap = 'round';
    g.strokeStyle = 'rgba(120,80,20,.35)'; g.lineWidth = 3.2; g.setLineDash([9, 7]); g.beginPath();
    for (let a = Math.max(a0, THREAD0); a <= a1; a += 0.25) { const [x, y] = rad(a, H(a) - 1.2); a === Math.max(a0, THREAD0) ? g.moveTo(x, y + 1.5) : g.lineTo(x, y + 1.5); } g.stroke();
    g.strokeStyle = 'rgba(244,206,108,.95)'; g.lineWidth = 2; g.beginPath();
    for (let a = Math.max(a0, THREAD0); a <= a1; a += 0.25) { const [x, y] = rad(a, H(a)); a === Math.max(a0, THREAD0) ? g.moveTo(x, y) : g.lineTo(x, y); } g.stroke();
    g.restore();
    // the shine running along it as it is drawn out
    if (t < 47) { const [x, y] = rad(Math.min(end, a1), H(Math.min(end, a1))); st.stamp(g, st.dot(255, 214, 120, '255,246,220'), x, y, 14, 0.9); }
  });
}

function overFx(g, st, t, S) {
  const { W, H } = st, u = st.eu, c = cam(t);
  g.setTransform(1, 0, 0, 1, 0, 0);
  // It can still be played: the flute itself, as it was found
  if (t > 20 && t < 27) {
    const k = drop(t, 20.3, 25.2), por = st.aspectK > 0.4 ? 0 : 1;
    if (k > -1.3) hang2(st, g, st.fx.boneflute, W * 0.5, H * lerp(-0.25, por ? 0.24 : 0.2, k), por ? 1.0 : 1.5, Math.sin(t * 0.7) * 1.4 * DEG);
  }
  // fireflies over the marsh while the flute plays
  if (t > 9 && t < 27) {
    const k = sramp(t, 10, 12) * (1 - sramp(t, 23, 26));
    g.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 24; i++) {
      const a = 6 + hash(i * 11) * 22 + Math.sin(t * 0.3 + i) * 0.6, h = 14 + hash(i * 13) * 120 + Math.sin(t * 0.7 + i * 2) * 10;
      const pulse = Math.max(0, Math.sin(t * (1.1 + hash(i) * 0.8) + i * 2.1)) ** 3 * k; if (pulse < 0.03) continue;
      const [x, y] = st.place('main', a, h, t); st.stamp(g, st.dot(190, 240, 110, '230,255,150'), x, y, 9 * u, pulse);
    }
    g.globalCompositeOperation = 'source-over';
  }
  for (const f of HOOK.over) f(g, st, t, S);
}

// shadows fall away from the strongest light nearby: the fire, a low sun
function shadowDx(e, a, t, S) {
  let dx = 0;
  if (t < 28 && Math.abs(a) < 18) dx += clamp(a / 3.5, -1, 1) * 10 * (1 - sramp(t, 25, 28)) * (1 - clamp((Math.abs(a) - 7) / 11));
  if (S.sun && S.sun.k > 0) dx -= Math.sign(S.sun.x) * 7 * S.sun.k * clamp((S.sun.y + 120) / 260);
  return e.flip ? -dx : dx;
}

// flocks of paper birds at dusk and dawn
const FLOCKS = [[1.5, 10, -1, 0.3, 9], [27, 36, 1, 0.24, 7]];
function birds(g, st, t) {
  const { W, H } = st, u = st.eu * 1.1;
  for (const [t0, t1, dir, yf, n] of FLOCKS) {
    if (t < t0 || t > t1) continue;
    const k = (t - t0) / (t1 - t0);
    for (let i = 0; i < n; i++) {
      const lag = i * 0.035 + hash(i * 3 + t0) * 0.03, kk = k - lag; if (kk < 0 || kk > 1) continue;
      const x = dir > 0 ? lerp(-0.1, 1.1, kk) * W : lerp(1.1, -0.1, kk) * W, row = (i % 2 ? 1 : -1) * Math.ceil(i / 2);
      const y = st.hy * yf + row * 14 * u + Math.sin(t * 1.3 + i) * 6 * u + (Math.abs(row) * 10 * u);
      const flap = Math.sin(t * (7 + hash(i) * 2) + i * 1.7), s = u * (0.7 + hash(i * 7) * 0.3);
      g.save(); g.translate(x - dir * Math.abs(row) * 18 * u, y);
      for (const side of [-1, 1]) { g.save(); g.scale(side * s, s * (0.2 + 0.8 * Math.abs(flap)) * (flap > 0 ? 1 : -0.6)); put(g, st.fx.wing, 0); g.restore(); }
      g.fillStyle = '#2b2420'; g.beginPath(); g.ellipse(0, 0, 4 * s, 2.2 * s, 0, 0, 7); g.fill();
      g.restore();
    }
  }
}

// a river of light across the sky: a soft band, a darker dust lane, and thousands of faint stars
let MW = null;
function milkyWay(g, st, t, k, v) {
  const { W, H } = st, D = Math.hypot(W, H);
  if (!MW) { const r = rng(777); MW = []; for (let i = 0; i < 1400; i++) { const s = r(), w = (r() + r() + r() + r() - 2) * 0.5; MW.push([s, w, 0.3 + r() * r() * 1.4, r() * 50, r()]); } }
  const ang = (v ? -0.42 : -0.3) + Math.sin(t * 0.01) * 0.02, cx = W * (v ? 0.46 : 0.58), cy = st.hy - H * (v ? 0.36 : 0.42), wid = H * (v ? 0.11 : 0.09);
  g.save(); g.translate(cx, cy); g.rotate(ang);
  g.globalCompositeOperation = 'screen';
  for (const [sc, al, col] of [[1, 0.13, '170,180,235'], [0.45, 0.12, '215,205,235'], [0.18, 0.1, '240,230,240']]) {
    g.save(); g.scale(1, (wid / (D * 0.5)) * sc * 2.4);
    const gr = g.createRadialGradient(0, 0, 0, 0, 0, D * 0.5); gr.addColorStop(0, `rgba(${col},${al * k})`); gr.addColorStop(0.55, `rgba(${col},${al * k * 0.5})`); gr.addColorStop(1, `rgba(${col},0)`);
    g.fillStyle = gr; g.fillRect(-D * 0.5, -D * 0.5, D, D); g.restore();
  }
  for (let i = 0; i < 7; i++) {
    const x = (hash(i * 13 + 5) - 0.5) * D * 0.9, y = (hash(i * 7 + 1) - 0.5) * wid * 0.8, rx = D * (0.04 + hash(i * 3) * 0.05);
    g.save(); g.translate(x, y); g.scale(1, 0.45);
    const cg = g.createRadialGradient(0, 0, 0, 0, 0, rx); cg.addColorStop(0, `rgba(225,225,245,${0.09 * k})`); cg.addColorStop(1, 'rgba(225,225,245,0)');
    g.fillStyle = cg; g.fillRect(-rx, -rx, rx * 2, rx * 2); g.restore();
  }
  g.globalCompositeOperation = 'multiply';
  g.save(); g.translate(D * 0.05, wid * 0.12); g.scale(1, (wid / (D * 0.5)) * 0.35);
  const dg = g.createRadialGradient(0, 0, 0, 0, 0, D * 0.4); dg.addColorStop(0, `rgba(120,120,150,${0.5 * k})`); dg.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = dg; g.fillRect(-D * 0.4, -D * 0.4, D * 0.8, D * 0.8); g.restore();
  g.globalCompositeOperation = 'lighter';
  for (const [s, w, sz, ph, cc] of MW) {
    const x = (s - 0.5) * D * 1.1, y = w * wid * 1.2 * (1 + Math.abs(s - 0.5)), tw = 0.6 + 0.4 * Math.sin(t * (0.6 + cc) + ph);
    const al = k * tw * (0.25 + 0.5 * (1 - Math.abs(w))) * (sz > 1 ? 1 : 0.6); if (al < 0.03) continue;
    g.fillStyle = cc > 0.85 ? `rgba(255,228,200,${al})` : `rgba(220,230,255,${al})`;
    const rr = Math.max(0.7, sz * 0.85 * st.dpr); g.fillRect(x - rr / 2, y - rr / 2, rr, rr);
  }
  g.restore(); g.globalCompositeOperation = 'source-over';
}

function bake(mk, mkSoft, stage) {
  const mkBig = (name, box, o = {}) => new BlurSheet(name, box, Math.max(1.4, Math.min(stage.W * 0.62, stage.H * 0.56) / 270 * 1.15), o, 0);
  return makeFx(mk, mkSoft, mkBig, stage);
}

export const film = { titleT: 15.2, keepFull: (a) => a > 2492, duration: DURATION, cam, state, entities: E, byLayer, profile, ground, clouds, bake, shadowDx, body: [110, 80, 52], fx: { sky, ground: groundFx, over: overFx } };

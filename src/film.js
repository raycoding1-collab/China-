// "The Long Thread": the whole film. Where everything stands on the globe, how the light and the sky
// change, and the special moments. Times come from src/timeline.js (generated from film/film.json).
// Each chapter adds its cut-outs with add(), and its moments as hooks: lights(), sky(), ground(), over().
import { monotone, track, noise, fbm, smooth, sramp, clamp, spring, hash, rng, lerp, mix, shade, rgb, DEG } from './util.js';
import { put, ellipse, strip } from './paper.js';
import { KINDS } from './cutouts.js';
import { LOOKS } from './people.js';
import './kinds_nature.js';
import './kinds_built.js';
import './kinds_modern.js';
import './kinds_china.js';
import { makeFx, hang2, glyph, crack, SEIS_DRAGONS, TEAR } from './sky_china.js';
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
  // 2. bronze and bone
  [48.5, 124], [51, 136], [54, 148], [57, 163], [59.5, 180], [62, 186], [70, 189], [80, 192], [85, 202], [87.5, 230], [90, 244], [94.5, 250.5], [97, 262],
  // 3. a hundred schools
  [99.5, 304], [102, 311], [106, 316], [108.5, 336], [111, 348], [113.5, 360], [116, 377], [118.7, 387], [121.5, 396], [124, 405], [126.5, 413], [129.5, 418], [132, 432], [135, 440], [137.5, 446],
  // 4. the First Emperor
  [141, 486], [144, 493], [147, 500], [150, 506], [152.5, 510], [155, 513], [157.5, 518], [160, 526], [162.5, 538], [165, 549], [167.5, 566], [170, 580], [173, 591], [175.5, 608], [178, 623], [181, 630], [184, 640], [187, 650],
  // 5. the Silk Road
  [189.5, 685], [192, 693], [195, 700], [198, 712], [201, 726], [204, 742], [207.5, 756], [210.5, 764], [213.5, 772], [216, 784], [219, 790], [222, 795], [225, 806], [227.5, 818], [231, 822], [236, 826], [239, 840],
  // 6. long divided
  [241.5, 900], [244, 905], [247.5, 911], [250, 926], [252.5, 935], [255.5, 942], [258, 952],
  // 7. the Tang
  [260.5, 982], [263, 992], [266, 1001], [268.5, 1016], [272, 1023], [275, 1029], [277.5, 1044], [281, 1056], [285, 1066], [287.5, 1086], [291, 1093], [294, 1102], [297, 1116], [301, 1119], [306, 1121], [312, 1123], [315.5, 1128],
  [318.5, 1200], [662, 2600], [800, 2740],
]);

// ------------------------------------------------- paint and shape of land --
const ZONES = [
  [-200, 28, [148, 134, 86]], [33, 50, [196, 164, 104]], [56, 76, [112, 140, 82]], [80, 110, [104, 132, 76]],
  [116, 182, [150, 132, 92]], [186, 214, [128, 120, 88]], [222, 272, [150, 104, 78]], [280, 704, [176, 150, 108]], [710, 772, [214, 182, 122]], [778, 9999, [168, 150, 104]],
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
  if (layer === 'far') return w > 0.5 ? [90, 120, 150] : mix(mix(mix(c, [150, 150, 162], 0.55), [110, 140, 130], band(a, 56, 100) * 0.4), [236, 238, 244], band(a, 730, 790, 6) * 0.6);
  if (layer === 'front') return shade(c, w > 0.5 ? -0.25 : -0.32);
  return shade(c, -0.55);
}
const profile = {
  far: (a) => (1 - water(a)) * (noise(a * 0.07, 5) * 14 + noise(a * 0.31, 6) * 4 + 12) + band(a, -60, 26) * 8 + band(a, 728, 790, 6) * (Math.abs(noise(a * 0.5, 41)) * 70 + 40),
  mid: (a) => (1 - water(a)) * (noise(a * 0.33, 3) * 8 + noise(a * 0.1, 4) * 13) + band(a, 30, 50, 4) * (16 + noise(a * 0.8, 9) * 4) + band(a, 710, 772, 4) * (Math.sin(a * 0.9) * 10 + 14) - water(a) * 6,
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

// ==================================================== 2. Bronze and bone ===
// Dusk at a Shang court: a hall on pounded earth, a foundry pouring bronze, vessels standing up in a row.
Object.assign(LOOKS, {
  shangKing: { skin: 3, top: 'robe', topCol: '#4a2420', legs: 'robe', legCol: '#4a2420', sleeve: '#4a2420', pattern: 'stripe', hat: 'band', hatCol: '#c9a24a', hair: 'bun', beard: 1, pose: 'stand' },
  shangLady: { skin: 3, top: 'robe', topCol: '#6a5a3a', legs: 'robe', legCol: '#6a5a3a', sleeve: '#6a5a3a', hair: 'bun', hat: 'band', hatCol: '#3a6a5a', pose: 'stand' },
  caster: { skin: 1, top: 'bare', wrap: '#8a6a48', hair: 'bun', pose: 'stand' },
  caster2: { skin: 0, top: 'tunic', topCol: '#9a7a56', hair: 'short', pose: 'stand' },
  diviner: { skin: 3, top: 'robe', topCol: '#3a3040', legs: 'robe', legCol: '#3a3040', sleeve: '#3a3040', hat: 'band', hatCol: '#a8282a', hair: 'bun', pose: 'kneel' },
  sxPriest: { skin: 3, top: 'robe', topCol: '#6a4a2a', legs: 'robe', legCol: '#6a4a2a', sleeve: '#6a4a2a', hat: 'band', hatCol: '#c9a24a', hair: 'bun', pose: 'stand' },
});
const FOUNDRY_A = 153;
{
  add('shanghall', 'main', 139.6, { z: 0, wide: 16, popAt: ev('king') - 0.6, loud: 2, winOn: (t) => 0.75 * sramp(t, 49, 51.5) * (0.9 + 0.1 * fbm(t * 5, 2)) });
  add('person', 'main', 131.4, { v: 'shangKing', z: 2, scale: P2, popAt: ev('king'), act: (t) => ({ head: t > ev('vessels') ? 8 + Math.sin(t) * 2 : -2, front: [-30 + Math.sin(t * 0.5) * 4, -30] }) });
  add('person', 'main', 128.2, { v: 'shangLady', z: 1.5, scale: P2, popAt: ev('king') + 0.3 });
  add('foundry', 'main', FOUNDRY_A, { z: 1, scale: 1.15, popAt: 50.6, loud: 1.4, pour: (t) => sramp(t, ev('pour') - 0.9, ev('pour')) * (1 - sramp(t, ev('pour') + 2.6, ev('pour') + 3.4)) });
  add('person', 'main', 147.6, { v: 'caster', z: 2, scale: P2, popAt: 51, act: (t) => ({ lean: 14, head: 8, front: [-100 + Math.sin(t * 2.4) * 12, -30], back: [-90 + Math.sin(t * 2.4) * 12, -30] }) });
  add('person', 'main', 156.4, { v: 'caster2', z: 2, scale: P2, flip: true, popAt: 51.3, act: (t) => ({ lean: 6, head: 10, front: [-150, -20], back: [-130, -20] }) });
  [[161.6, 0, 1.25], [166.4, 1, 1.05], [169.8, 2, 0.62], [172.2, 3, 0.62], [175.2, 1, 0.8]].forEach(([a, v, s], i) => add('ding', 'main', a, { v, z: 1.5, scale: s, popAt: ev('vessels') + i * 0.32, loud: 1.2 }));
  for (const [a, v] of [[122, 1], [145, 2], [181, 0]]) add('oak', 'mid', a, { v, scale: 0.55 });
  for (const a of [126, 150, 172]) add('shanghall', 'far', a, { v: 1, scale: 0.4 });
  grassRun(118, 182, 3.4, 'main', { skip: (a) => a > 124 && a < 178 });
  grassRun(118, 182, 7, 'front', { s: 2 });
  // the diviner by a small fire, a basket of shells
  add('person', 'main', 186.8, { v: 'diviner', z: 2, scale: P2, popAt: 57.6, act: (t) => ({ lean: 20, head: 14, front: [-60 + Math.sin(t * 0.7) * 4, -50], back: [-50, -40] }) });
  add('logs', 'main', 190.4, { z: 2, scale: 0.8, popAt: 57.8 });
  for (const [a, v] of [[180, 0], [196, 1], [203, 2]]) add('oak', 'main', a, { v, z: 0, scale: 0.9 });
  grassRun(182, 214, 3.6, 'main', { skip: (a) => a > 185 && a < 192 });
  // Sanxingdui by torchlight
  for (const a of [234.6, 250.8, 262.4]) add('torchpost', 'main', a, { z: 1, scale: 1.3, popAt: 86.2 + (a - 234) * 0.02 });
  add('sxfigure', 'main', 241.2, { z: 1, popAt: 87.8, loud: 1.6 });
  add('sxmask', 'main', 247.4, { z: 1.2, popAt: 88.6, loud: 1.4, eyesAt: ev('eyes') });
  add('sxtree', 'main', 256.4, { z: 0.8, popAt: 89.4, loud: 1.6 });
  add('person', 'main', 252.8, { v: 'sxPriest', z: 2, scale: P2, flip: true, popAt: 89.8, act: (t) => ({ head: t > ev('eyes') && t < ev('eyes') + 2.4 ? -12 : 4, lean: t > ev('eyes') && t < ev('eyes') + 2.4 ? -6 : 2 }) });
  for (const a of [228, 244, 266]) add('bamboo', 'mid', a, { v: (a | 0) % 3, scale: 0.55 });
  for (const [a, v, s] of [[236, 3, 0.7], [250, 1, 0.6], [264, 4, 0.75]]) add('karst', 'far', a, { v, scale: s });
  grassRun(226, 270, 3.8, 'main', { skip: (a) => a > 238 && a < 260 });
  grassRun(214, 300, 7, 'front', { s: 2 });

  hook({
    lights(t, c, L, Em) {
      if (near(FOUNDRY_A, c, 60) && t > 46 && t < 80) {
        L.push({ a: FOUNDRY_A - 4.2, h: 24, r: 760, k: 1.1 * flick(t, 2), color: [255, 150, 70] });
        const p = sramp(t, ev('pour') - 0.4, ev('pour')) * (1 - sramp(t, ev('pour') + 2.6, ev('pour') + 3.4)); if (p > 0) L.push({ a: FOUNDRY_A + 3.8, h: 80, r: 420, k: 1.1 * p, color: [255, 190, 90] });
        L.push({ a: 139.6, h: 60, r: 420, k: 0.7 * sramp(t, 49, 51.5), color: [255, 170, 90] });
        for (const [a, i] of [[161.6, 0], [166.4, 1], [170.4, 2], [173.6, 3]]) { const k = sramp(t, ev('vessels') + i * 0.32, ev('vessels') + 0.6 + i * 0.32); if (k > 0) L.push({ a, h: 50, r: 200, k: 0.55 * k, color: [255, 200, 120] }); }
      }
      if (near(190, c, 60) && t > 56 && t < 100) {
        const k = sramp(t, 57.8, 58.6);
        L.push({ a: 190.4, h: 30, r: 640, k: 1.1 * k * flick(t, 3), color: [255, 150, 74] });
        Em.push({ a: 190.4, h: 4, scale: 0.6, lit: k, litAt: 57.8, seed: 3 });
      }
      if (near(248, c, 60) && t > 84) for (const [a, n] of [[234.6, 4], [250.8, 5], [262.4, 6]]) {
        const k = sramp(t, 86.6 + (a - 234) * 0.02, 87.4 + (a - 234) * 0.02) * (1 - sramp(t, 97, 99)); if (k <= 0) continue;
        L.push({ a, h: 90, r: 640, k: 1.25 * k * flick(t, n), color: [255, 150, 74] });
        Em.push({ a, h: 84, scale: 0.5, small: 1, lit: k, litAt: 86.6, seed: n });
      }
    },
    over(g, st, t, S) {
      const { W, H } = st;
      if (t < ev('oracle') - 0.2 || t > ev('oracleOut') + 1.6) return;
      const up = clamp(spring(t - ev('oracle'), 5.2, 0.55), 0, 1.3), out = sramp(t, ev('oracleOut'), ev('oracleOut') + 1.1), veil = clamp(up) * (1 - out);
      g.fillStyle = `rgba(10,6,4,${0.5 * veil})`; g.fillRect(0, 0, W, H);
      const wide = W > H, evo = sramp(t, EV.signs[0] - 1.6, EV.signs[0] - 0.3), base = Math.min(W * 0.62, H * 0.56) / 270;
      const cx = lerp(W * 0.5, W * (wide ? 0.27 : 0.5), evo), cy = lerp(H * 0.44, H * (wide ? 0.44 : 0.27), evo), s = base * lerp(wide ? 1.0 : 0.9, wide ? 0.78 : 0.5, evo);
      g.save(); g.translate(cx, cy + (1 - Math.min(1, up)) * H * 0.9 + out * H * 0.9); g.rotate((1 - Math.min(1, up)) * 0.25 - 0.04); g.scale(s, s);
      put(g, st.fx.plastron, 0.6, 8, 12);
      // the red-hot rod, pressed into one hollow, then the next; each one cracks
      const [hx, hy] = [46, -26], [jx, jy] = [-46, -26], rodT = ev('rod');
      const at = t < EV.cracks[0] + 0.3 ? 0 : 1, tx = at ? jx : hx, ty = at ? jy : hy;
      const rin = sramp(t, rodT - 1, rodT), rout = sramp(t, EV.cracks[1] + 0.4, EV.cracks[1] + 1.2);
      const press = Math.exp(-(((t - (at ? EV.cracks[1] - 0.6 : EV.cracks[0] - 0.6)) / 0.5) ** 2));
      const heat = (x, y, k) => { if (k <= 0.01) return; g.globalCompositeOperation = 'lighter'; const gr = g.createRadialGradient(x, y, 0, x, y, 22); gr.addColorStop(0, `rgba(255,170,80,${0.8 * k})`); gr.addColorStop(1, 'rgba(255,90,30,0)'); g.fillStyle = gr; g.fillRect(x - 22, y - 22, 44, 44); g.globalCompositeOperation = 'source-over'; };
      heat(hx, hy, Math.exp(-(((t - EV.cracks[0] + 0.5) / 0.5) ** 2))); heat(jx, jy, Math.exp(-(((t - EV.cracks[1] + 0.5) / 0.5) ** 2)));
      crack(g, hx, hy, sramp(t, EV.cracks[0], EV.cracks[0] + 0.5), -1, 3); crack(g, jx, jy, sramp(t, EV.cracks[1], EV.cracks[1] + 0.5), 1, 7);
      // then the question and the answer, cut beside the cracks and rubbed with red
      ['bu', 'zhen', 'xun', 'wang', 'huo'].forEach((n, i) => glyph(g, n, 18, -94 + i * 34, 0.7, sramp(t, EV.carve[i], EV.carve[i] + 0.6), 'red'));
      ['bu', 'zhen', 'wang'].forEach((n, i) => glyph(g, n, -20, -60 + i * 34, 0.62, sramp(t, EV.carve[i] + 0.35, EV.carve[i] + 0.95), 'red'));
      if (rin > 0 && rout < 1) { g.save(); g.translate(lerp(tx + 80, tx, rin) + 0, lerp(ty - 200, ty, rin) - (1 - press) * 10 - rout * 260); g.rotate(0.35); put(g, st.fx.rod, 0.5, 6, 8); if (press > 0.05) { g.globalCompositeOperation = 'lighter'; const gr = g.createRadialGradient(0, -4, 0, 0, -4, 12); gr.addColorStop(0, `rgba(255,190,90,${press})`); gr.addColorStop(1, 'rgba(255,90,30,0)'); g.fillStyle = gr; g.fillRect(-12, -16, 24, 24); g.globalCompositeOperation = 'source-over'; } g.restore(); }
      g.restore();
      // and the signs, then and now: 日 月 人 木 山
      if (t > EV.signs[0] - 1.6) {
        const rise = clamp(spring(t - (EV.signs[0] - 1.2), 5.2, 0.55), 0, 1.3), ss = base * (wide ? 1.12 : 0.66);
        g.save(); g.translate(wide ? W * 0.66 : W * 0.5, (wide ? H * 0.44 : H * 0.66) + (1 - Math.min(1, rise)) * H * 0.9 + out * H * 0.9); g.rotate(0.02 - (1 - Math.min(1, rise)) * 0.2); g.scale(ss, ss);
        put(g, st.fx.slip, 0.5, 8, 12);
        ['ri', 'yue', 'ren', 'mu', 'shan'].forEach((n, i) => { const x = -104 + i * 52; glyph(g, 'o_' + n, x, -25, 1.15, sramp(t, EV.signs[i], EV.signs[i] + 0.6), 'cut'); glyph(g, 'm_' + n, x, 27, 1.15, sramp(t, EV.signs[i] + 0.45, EV.signs[i] + 1.1), 'ink'); });
        g.restore();
      }
    },
  });
}

// ================================================== 3. A hundred schools ===
Object.assign(LOOKS, {
  zhouKing: { skin: 3, top: 'robe', topCol: '#2a2228', legs: 'robe', legCol: '#2a2228', sleeve: '#2a2228', pattern: 'stripe', hat: 'mian', hair: 'bun', beard: 1, pose: 'stand' },
  zhouOfficial: { skin: 4, top: 'robe', topCol: '#7a3a2a', legs: 'robe', legCol: '#7a3a2a', sleeve: '#7a3a2a', hat: 'topknot', beard: 1, pose: 'stand' },
  charioteer: { skin: 3, top: 'tunic', topCol: '#6a5040', sleeve: '#6a5040', legs: 'trousers', legCol: '#4a3a30', hat: 'helmet', hatCol: '#5a4a3a', pose: 'stand' },
  zhouSoldier: { skin: 3, top: 'coat', topCol: '#5a4a3a', sleeve: '#5a4a3a', legs: 'trousers', legCol: '#3a3028', hat: 'helmet', hatCol: '#4a4038', pose: 'stand', item: 'ge' },
  zhouSoldierW: { skin: 4, top: 'coat', topCol: '#6a5038', sleeve: '#6a5038', legs: 'trousers', legCol: '#3a3028', hat: 'helmet', hatCol: '#4a4038', pose: 'walk', item: 'ge' },
  redSoldier: { skin: 3, top: 'coat', topCol: '#8a3a2a', sleeve: '#8a3a2a', legs: 'trousers', legCol: '#3a2a24', hat: 'helmet', hatCol: '#5a3a2a', pose: 'stand', item: 'ge' },
  redSoldierW: { skin: 4, top: 'coat', topCol: '#8a3a2a', sleeve: '#8a3a2a', legs: 'trousers', legCol: '#3a2a24', hat: 'helmet', hatCol: '#5a3a2a', pose: 'walk', item: 'ge' },
  confucius: { skin: 4, top: 'robe', topCol: '#3a4a5a', legs: 'robe', legCol: '#3a4a5a', sleeve: '#3a4a5a', hat: 'topknot', beard: 1, beardCol: '#c8c0b0', hairCol: '#c8c0b0', pose: 'sit' },
  pupil: { skin: 3, top: 'robe', topCol: '#c8b890', legs: 'robe', legCol: '#c8b890', sleeve: '#c8b890', hat: 'topknot', pose: 'kneel', item: 'scroll' },
  pupil2: { skin: 4, top: 'robe', topCol: '#8a9a7a', legs: 'robe', legCol: '#8a9a7a', sleeve: '#8a9a7a', hat: 'topknot', pose: 'kneel' },
  sageA: { skin: 4, top: 'robe', topCol: '#5a3a4a', legs: 'robe', legCol: '#5a3a4a', sleeve: '#5a3a4a', hat: 'topknot', beard: 1, pose: 'stand', item: 'scroll' },
  sageB: { skin: 3, top: 'robe', topCol: '#4a5a3a', legs: 'robe', legCol: '#4a5a3a', sleeve: '#4a5a3a', hair: 'bald', beard: 1, beardCol: '#d8d0c4', pose: 'stand' },
  daoist: { skin: 4, top: 'robe', topCol: '#d8d0bc', legs: 'robe', legCol: '#d8d0bc', sleeve: '#d8d0bc', hat: 'topknot', beard: 1, beardCol: '#e0dcd4', hairCol: '#e0dcd4', pose: 'sit' },
  laozi: { skin: 4, top: 'robe', topCol: '#b8a888', legs: 'robe', legCol: '#b8a888', sleeve: '#b8a888', hair: 'bald', beard: 1, beardCol: '#eeeae2', pose: 'sit' },
  sunzi: { skin: 3, top: 'robe', topCol: '#2a3a3a', legs: 'robe', legCol: '#2a3a3a', sleeve: '#2a3a3a', hat: 'topknot', beard: 1, pose: 'stand', item: 'scroll' },
});
{
  // the Zhou king at his altar; the Mandate lowered to him from heaven (and nearly taken back)
  add('shanghall', 'main', 302, { z: 0, wide: 16 });
  add('person', 'main', 312.6, { v: 'zhouKing', z: 2, scale: P2, popAt: ev('zhou'), act: (t) => { const up = sramp(t, ev('mandate') + 1.2, ev('mandate') + 2), take = sramp(t, ev('take') - 0.2, ev('take') + 0.3) * (1 - sramp(t, ev('take') + 1.1, ev('take') + 1.6)); return { head: -up * 18 - take * 10, lean: -up * 3, front: [-120 * up - take * 40, -30 * up], back: [-110 * up - take * 30, -30 * up] }; } });
  add('person', 'main', 308.8, { v: 'zhouOfficial', z: 1.5, scale: P2, popAt: ev('zhou') + 0.3, act: (t) => ({ lean: 18, head: 10 }) });
  for (const [a, v] of [[316.6, 1], [319.4, 0]]) add('ding', 'main', a, { v, z: 1.5, scale: 0.75, popAt: ev('zhou') + 0.6 });
  for (const [a, v] of [[298, 1], [324, 2], [330, 0]]) add('oak', 'main', a, { v, z: 0, scale: 0.9 });
  grassRun(296, 328, 3.6, 'main', { skip: (a) => a > 306 && a < 322 });
  // five hundred years of war: banners up and down, chariots, marching men
  const W0 = ev('war');
  [[333, 1], [337.4, 2], [341.6, 3], [346, 4], [350.4, 5], [354.6, 7], [358.6, 0]].forEach(([a, v], i) => add('banner', 'mid', a, { v, scale: 0.9, popAt: W0 + i * 0.3, raise: (t) => sramp(t, W0 + i * 0.3, W0 + 0.8 + i * 0.3) * (1 - sramp(t, W0 + 3.4 + ((i * 5) % 7) * 0.22, W0 + 3.9 + ((i * 5) % 7) * 0.22)), loud: 0.6 }));
  add('chariot', 'main', 333, { z: 3, scale: 0.85, from: W0 - 0.5, to: W0 + 9, move: (t) => Math.max(0, t - W0 + 0.4) * 3.2 });
  add('chariot', 'mid', 362, { scale: 0.6, from: W0, to: W0 + 9, flip: true, move: (t) => -Math.max(0, t - W0) * 2.6 });
  ['zhouSoldierW', 'zhouSoldierW', 'zhouSoldierW'].forEach((v, i) => add('person', 'main', 344 + i * 2.6, { v, z: 2, scale: P2, popAt: W0 + 0.6 + i * 0.2, pace: 5.6, move: (t) => Math.max(0, t - W0) * 1.1 }));
  ['redSoldierW', 'redSoldierW'].forEach((v, i) => add('person', 'main', 366 + i * 2.6, { v, z: 2, scale: P2, flip: true, popAt: W0 + 1 + i * 0.2, pace: 5.6, move: (t) => -Math.max(0, t - W0) * 1.1 }));
  for (const [a, v, s] of [[338, 2, 0.7], [352, 0, 0.8], [366, 4, 0.7]]) add('karst', 'far', a, { v, scale: s });
  grassRun(328, 372, 3.4, 'main');
  // the thinkers: an argument, Confucius under the apricot tree, a Daoist by falling water, Laozi on his ox
  [['sageA', 378.4, false, 0], ['sageB', 382.2, true, 1.3]].forEach(([v, a, flip, ph], i) => add('person', 'main', a, { v, scale: P2, z: 2, flip, popAt: ev('argue') - 0.6 + i * 0.3, act: (t) => {
    const turn = Math.sin((t - ev('argue')) * 2.4 + ph) > 0, k = sramp(t, ev('argue'), ev('argue') + 0.6);
    return { lean: 4 + (turn ? 10 : 0) * k, head: (turn ? -6 + Math.sin(t * 9) * 5 : 6) * k, front: turn ? [-120 + Math.sin(t * 8 + ph) * 30, -30] : [-40, -40], back: turn ? [-30 + Math.sin(t * 6) * 20, -40] : [10, -10] };
  } }));
  add('apricot', 'main', 394, { z: 0, scale: 1.1 });
  add('person', 'main', 391.6, { v: 'confucius', z: 2, scale: P2, popAt: ev('kongzi') - 0.4, act: (t) => { const k = sramp(t, ev('kongzi'), ev('kongzi') + 0.6); return { lean: 6, head: 4 + Math.sin(t * 0.9) * 2, front: [-60 - 80 * k + Math.sin(t * 1.6) * 10 * k, -60 + 30 * k], back: [-40, -50] }; } });
  [['pupil', 397.6], ['pupil2', 400.2], ['pupil', 402.6]].forEach(([v, a], i) => add('person', 'main', a, { v, z: 2, scale: P2, flip: true, popAt: ev('kongzi') + 0.3 + i * 0.2, act: (t) => { const bow = Math.exp(-(((t - ev('kongzi') - 2.4 - i * 0.25) / 0.5) ** 2)); return { lean: 18 + bow * 26, head: 10 + bow * 10 }; } }));
  add('waterfall', 'main', 414, { z: 0, scale: 1.2 });
  add('person', 'main', 410.2, { v: 'daoist', z: 2, scale: P2, act: (t) => ({ lean: 2, head: -6 + Math.sin(t * 0.4) * 2, front: [-20, -100], back: [-24, -96] }) });
  add('ox', 'main', 426, { z: 2, flip: true, rider: 1, move: (t) => -clamp((t - 120) * 0.45, 0, 7) });
  add('bamboo', 'main', 404, { v: 1, z: 0 }); add('pine', 'mid', 416, { v: 0, scale: 0.6 });
  for (const [a, v, s] of [[402, 1, 0.8], [418, 3, 0.9], [430, 5, 0.75]]) add('karst', 'far', a, { v, scale: s });
  grassRun(374, 432, 3.4, 'main', { skip: (a) => (a > 390 && a < 404) || (a > 409 && a < 420) });
  // Sunzi: two armies face each other; the red one thinks better of it and goes home
  const SZ = ev('sunzi'), HOME = ev('home');
  add('person', 'main', 440.4, { v: 'sunzi', z: 2, scale: P2, popAt: SZ - 0.6, act: (t) => ({ head: 8, front: [-70, -60], back: [-30, -20] }) });
  add('rock', 'main', 440.4, { v: 1, z: 1.5, scale: 1.2 });
  ['zhouSoldier', 'zhouSoldier', 'zhouSoldier'].forEach((v, i) => add('person', 'main', 432.4 + i * 2.4, { v, z: 2 + i * 0.1, scale: P2, popAt: SZ + 0.2 + i * 0.15 }));
  ['redSoldier', 'redSoldier', 'redSoldier'].forEach((v, i) => {
    add('person', 'main', 446.6 + i * 2.4, { v, z: 2 + i * 0.1, scale: P2, flip: true, popAt: SZ + 0.4 + i * 0.15, foldAt: HOME + 0.3 + i * 0.18, act: (t) => { const k = sramp(t, HOME - 0.6, HOME); return { lean: 2 - k * 4, head: k * -14, front: [-34 + k * 30, -62 + k * 50] }; } });
    add('person', 'main', 446.6 + i * 2.4, { v: 'redSoldierW', z: 2 + i * 0.1, scale: P2, popAt: HOME + 0.55 + i * 0.18, pace: 5.2, move: (t) => clamp((t - HOME - 0.9 - i * 0.18) * 2.0, 0, 14), act: (t) => (t < HOME + 0.9 + i * 0.18 ? { walk: undefined, head: -6 } : {}) });
  });
  add('banner', 'main', 430.6, { v: 0, z: 1, popAt: SZ }); add('banner', 'main', 452.4, { v: 1, z: 1, popAt: SZ + 0.2, flip: true });
  grassRun(432, 470, 3.6, 'main', { skip: (a) => a > 430 && a < 454 });
  grassRun(296, 470, 7, 'front', { s: 2 });

  hook({
    sky(g, st, t, S) {
      const { W, H } = st;
      if (t < ev('mandate') - 0.5 || t > ev('take') + 5) return;
      // lowered from the sky; tugged back up a little at "which heaven could take away"; let down again
      const k = drop(t, ev('mandate'), ev('take') + 3.2), tug = sramp(t, ev('take') - 0.1, ev('take') + 0.5) * (1 - sramp(t, ev('take') + 1.2, ev('take') + 1.9));
      const [kx] = st.place('main', 312.6 + 2.8, 0, t);
      st.hang(g, st.fx.mandate, kx, H * lerp(-0.4, st.aspectK > 0.4 ? 0.2 : 0.26, k) - tug * H * 0.14, st.aspectK > 0.4 ? 0.9 : 0.7, Math.sin(t * 0.8) * 2 * DEG - tug * 0.05);
    },
  });
}

// =================================================== 4. The First Emperor ===
Object.assign(LOOKS, {
  qinEmperor: { skin: 4, top: 'robe', topCol: '#1e1a1c', legs: 'robe', legCol: '#1e1a1c', sleeve: '#1e1a1c', pattern: 'stripe', hat: 'mian', hair: 'bun', beard: 1, pose: 'stand' },
  qinOfficial: { skin: 3, top: 'robe', topCol: '#3a2a2a', legs: 'robe', legCol: '#3a2a2a', sleeve: '#3a2a2a', hat: 'topknot', pose: 'kneel' },
  wallWorker: { skin: 1, top: 'tunic', topCol: '#9a8460', legs: 'trousers', legCol: '#6a5a44', hair: 'bun', pose: 'walk', item: 'basket' },
  farmer74: { skin: 3, top: 'coat', topCol: '#3a5a7a', sleeve: '#3a5a7a', legs: 'trousers', legCol: '#2a3a4a', hat: 'cap', hatCol: '#3a5a7a', pose: 'stand', item: 'shovel' },
  farmer74b: { skin: 4, top: 'shirt', topCol: '#d8d0b8', sleeve: '#d8d0b8', legs: 'trousers', legCol: '#3a3a40', hat: 'wide', hatCol: '#c9a86a', pose: 'stand' },
});
KINDS.tchead = {
  bake(mk) { return { spr: mk('tchead', [-18, -34, 22, 6], { pad: 5 }).piece([[-12, 4], [8, 4], [12, -4], [16, -12], [12, -16], [12, -24], [2, -30], [-10, -28], [-14, -14]], '#a8907a', { round: 4, paint: (g) => { g.fillStyle = 'rgba(40,26,18,.8)'; g.beginPath(); g.arc(6, -15, 1.4, 0, 7); g.fill(); g.strokeStyle = 'rgba(60,40,28,.7)'; g.lineWidth = 1.4; g.beginPath(); g.moveTo(4, -8); g.quadraticCurveTo(9, -9, 13, -6); g.stroke(); } }).piece(ellipse(-6, -28, 6, 5, 10), '#8a7460', { round: 2, lift: 1 }).finish({ shadowBlur: 3 }) }; },
  draw(g, P, t, e, env) { const k = clamp(spring(t - e.foundAt, 6, 0.5), 0, 1.2); g.translate(0, 26 - k * 30); g.rotate((1 - Math.min(1, k)) * 0.4); put(g, P.spr, env.sh); },
};
{
  // the last rivals fall; the black banner of Qin goes up; the First Emperor
  [[486.4, 1, 'main'], [490.2, 2, 'mid'], [493.4, 3, 'main'], [497.2, 4, 'mid'], [501.6, 5, 'main'], [505.4, 7, 'mid']].forEach(([a, v, L], i) => add('banner', L, a, { v, z: 1, scale: L === 'mid' ? 0.9 : 1, popAt: 139.4 + i * 0.15, foldAt: EV.conquer[i], loud: 0.8 }));
  add('banner', 'main', 498.6, { v: 0, z: 1.2, scale: 1.4, popAt: ev('qin') - 0.3, raise: (t) => sramp(t, ev('qin'), ev('qin') + 1.4), foldAt: ev('qinEnd') + 30, loud: 1.4 });
  add('hall', 'main', 508, { v: 0, z: 0, wide: 20, popAt: ev('emperor') - 1.2, loud: 2.2 });
  add('person', 'main', 504.2, { v: 'qinEmperor', z: 2.5, scale: P2 * 1.06, popAt: ev('emperor'), loud: 1.2, act: (t) => ({ head: -4 + Math.sin(t * 0.5) * 2, lean: -2, front: [-20, -40] }) });
  [[507.6, 0], [510.4, 1], [513.2, 2]].forEach(([a, i]) => add('person', 'main', a, { v: 'qinOfficial', z: 2.6, scale: P2, flip: true, popAt: ev('emperor') + 0.5 + i * 0.25, act: (t) => ({ lean: 30 + Math.exp(-(((t - ev('emperor') - 1.2 - i * 0.3) / 0.5) ** 2)) * 20, head: 14 }) }));
  // one width for every axle: two carts in the same ruts
  add('cart', 'main', 517.6, { v: 0, z: 2, scale: 0.8, popAt: EV.std[3] - 0.3, move: (t) => clamp((t - EV.std[3]) * 1.4, 0, 9) });
  add('cart', 'main', 512.4, { v: 1, z: 1.8, scale: 0.8, popAt: EV.std[3] + 0.2, move: (t) => clamp((t - EV.std[3] - 0.4) * 1.4, 0, 9) });
  for (const [a, v] of [[484, 1], [520, 2], [524, 0]]) add('oak', 'mid', a, { v, scale: 0.55 });
  grassRun(480, 526, 3.6, 'main', { skip: (a) => a > 500 && a < 516 });
  // the wall, joined across the hills, piece by piece, with beacon towers
  for (let a = 527, i = 0; a < 566; a += 2.2, i++) add('earthwall', 'mid', a, { v: 0, scale: 0.62, popAt: ev('wall') + i * 0.07, loud: 0.4 });
  for (let a = 530, i = 0; a < 562; a += 2.9, i++) if (Math.abs(a - 546) > 2) add('earthwall', 'main', a, { v: 0, z: 1, scale: 1.0, popAt: ev('wall') + 0.4 + i * 0.09, loud: 0.5 });
  for (const [a, L] of [[533, 'mid'], [546, 'main'], [557, 'mid']]) add('beacon', L, a, { v: 0, z: 1.1, scale: L === 'mid' ? 0.62 : 1, popAt: ev('wall') + 0.6 + (a - 530) * 0.06, loud: 0.8 });
  ['wallWorker', 'wallWorker'].forEach((v, i) => add('person', 'main', 538 + i * 13, { v, z: 2, scale: P2, popAt: ev('wall') + 0.8, pace: 4.6, move: (t) => Math.max(0, t - ev('wall') - 1) * 0.6 }));
  // the clay army, in rows going back into the pit
  const ARMY = ev('army');
  for (let a = 571, i = 0; a < 604; a += 2.6, i++) add('terracotta', 'main', a, { v: [0, 0, 1, 0, 2, 0, 1, 0, 3, 0, 0, 1, 2][i % 13], z: 1, scale: 1.08, popAt: ARMY + i * 0.07, loud: 0.5 });
  for (let a = 568, i = 0; a < 607; a += 1.9, i++) add('terracotta', 'mid', a, { v: [0, 1, 0, 2, 0][i % 5], scale: 0.8, popAt: ARMY + 0.3 + i * 0.05, loud: 0.3 });
  for (let a = 566, i = 0; a < 612; a += 1.5, i++) add('terracotta', 'far', a, { v: i % 3, scale: 0.6, popAt: ARMY + 0.5 + i * 0.04, loud: 0.2 });
  add('tchorse', 'main', 588.2, { z: 1.2, scale: 0.9, popAt: ARMY + 0.6, loud: 0.8 }); add('tchorse', 'main', 591.4, { z: 1.1, scale: 0.9, popAt: ARMY + 0.7, loud: 0.8 });
  // 1974: digging a well, a farmer finds a head
  const FOUND = ev('found');
  add('person', 'main', 621.6, { v: 'farmer74', z: 2, scale: P2, act: (t) => { const dig = t < FOUND ? Math.max(0, Math.sin(t * 3)) : 0, back = sramp(t, FOUND + 0.2, FOUND + 0.6); return { lean: 16 + dig * 14 - back * 22, head: 14 - back * 8, front: [-60 + dig * 50 - back * 60, -30], back: [-50 + dig * 50 - back * 50, -30] }; } });
  add('person', 'main', 628.6, { v: 'farmer74b', z: 2, scale: P2, flip: true, act: (t) => { const k = sramp(t, FOUND + 0.4, FOUND + 1); return { lean: 4 + k * 16, head: 6 + k * 16, front: [-20 - k * 20, -20] }; } });
  add('tchead', 'main', 625.2, { z: 2.2, scale: 1.3, popAt: FOUND - 0.4, foundAt: FOUND, over: true });
  for (const [a, v] of [[616, 1], [634, 2]]) add('oak', 'main', a, { v, z: 0, scale: 0.85 });
  add('banner', 'main', 638.6, { v: 0, z: 1, scale: 1.3, foldAt: ev('qinEnd'), loud: 1.2 });
  grassRun(612, 660, 3.4, 'main', { skip: (a) => a > 620 && a < 630 });
  grassRun(480, 660, 7, 'front', { s: 2 });

  hook({
    lights(t, c, L, Em, Sm) {
      // beacon smoke, passed from tower to tower
      if (near(546, c, 70) && t > ev('wall')) for (const [a, L2, k] of [[533, 'mid', 0], [546, 'main', 1], [557, 'mid', 2]]) Sm.push({ a: a + 0.3, layer: L2, h: L2 === 'mid' ? 84 : 136, t0: ev('wall') + 1.4 + k * 0.6, size: L2 === 'mid' ? 0.7 : 1.1, life: 6, every: 0.45, rise: 240, drift: 4, alpha: 0.7 });
    },
    ground(g, st, t, S, G) {
      G.run(510, 528, (a0, a1) => { G.arc(a0, a1, -4, 2.4, 'rgba(70,50,30,.45)'); G.arc(a0, a1, -11, 2.4, 'rgba(70,50,30,.45)'); });
      G.run(566, 610, (a0, a1) => { G.arc(a0, a1, -10, 14, 'rgba(70,52,34,.55)'); G.along(a0, a1, 5.2, (a) => { const [x0, y0] = G.rad(a, -3), [x1, y1] = G.rad(a, -17); g.strokeStyle = 'rgba(120,90,60,.6)'; g.lineWidth = 5; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); }); });
      G.run(622.6, 627.6, (a0, a1) => G.arc(a0, a1, -8, 12, 'rgba(50,34,22,.85)'));
    },
    over(g, st, t, S) {
      const { W, H } = st, por = st.aspectK > 0.4 ? 0 : 1, sc = por ? 0.95 : 1.55;
      if (t > EV.std[0] - 1.6 && t < ev('stdOut') + 2) {
        const out = ev('stdOut'), y = (k) => H * lerp(-0.3, por ? 0.26 : 0.24, k), sw = (i) => Math.sin(t * 0.7 + i * 2) * 2 * DEG;
        const xs = por ? [0.2, 0.42, 0.62, 0.82] : [0.24, 0.42, 0.6, 0.78];
        st.hang(g, st.fx.qinslip, W * xs[0], y(drop(t, EV.std[0], out)), sc * 0.9, sw(0));
        const c0 = EV.std[1] - 1.6; if (t > c0) { st.hang(g, st.fx.knifecoin, W * (xs[1] - 0.04), y(drop(t, c0, EV.std[1])), sc, sw(1)); st.hang(g, st.fx.spadecoin, W * (xs[1] + 0.04), y(drop(t, c0 + 0.2, EV.std[1] + 0.1)), sc, sw(4)); }
        st.hang(g, st.fx.banliang, W * xs[1], y(drop(t, EV.std[1] + 0.3, out + 0.15)), sc * 1.2, sw(2), 1, t * 0.4);
        st.hang(g, st.fx.weight, W * xs[2], y(drop(t, EV.std[2], out + 0.3)), sc * 1.2, sw(3));
      }
      if (t > ev('faces') - 0.3 && t < ev('faces') + 5) st.hang(g, st.fx.faces, W * 0.5, H * lerp(-0.3, por ? 0.26 : 0.22, drop(t, ev('faces'), ev('faces') + 3.6)), por ? 1.1 : 1.7, Math.sin(t * 0.6) * 1.6 * DEG);
    },
  });
}

// ======================================================= 5. The Silk Road ===
Object.assign(LOOKS, {
  hanOfficial: { skin: 4, top: 'robe', topCol: '#8a2a24', legs: 'robe', legCol: '#8a2a24', sleeve: '#2a2228', hat: 'topknot', beard: 1, pose: 'stand' },
  hanLady: { skin: 6, top: 'robe', topCol: '#c86a5a', legs: 'robe', legCol: '#3a2a2a', sleeve: '#3a2a2a', hair: 'bun', pose: 'stand', item: 'fan' },
  zhangQian: { skin: 3, top: 'robe', topCol: '#6a5a44', legs: 'robe', legCol: '#6a5a44', sleeve: '#6a5a44', hat: 'topknot', beard: 1, pose: 'walk', item: 'jie' },
  silkTrader: { skin: 5, top: 'coat', topCol: '#6a3a5a', sleeve: '#6a3a5a', legs: 'trousers', legCol: '#3a3040', hat: 'turban', hatCol: '#d8c8a8', beard: 1, pose: 'walk' },
  papermaker: { skin: 3, top: 'tunic', topCol: '#8a9aa8', sleeve: '#8a9aa8', legs: 'trousers', legCol: '#4a4a50', hair: 'bun', apron: '#d8d0b8', pose: 'stand' },
  zhangHeng: { skin: 4, top: 'robe', topCol: '#2a3a4a', legs: 'robe', legCol: '#2a3a4a', sleeve: '#2a3a4a', hat: 'topknot', beard: 1, beardCol: '#5a4a3a', pose: 'stand' },
  modernMan: { skin: 4, top: 'shirt', topCol: '#e8e4d8', sleeve: '#e8e4d8', legs: 'trousers', legCol: '#2a3040', hair: 'short', pose: 'stand' },
});
const ROAD = [706, 730, 754, 778, 802];
function threadLift(a, t) {
  if (a < 703 || a > 805) return 0;
  const on = sramp(t, ev('road') + (a - 706) * 0.035, ev('road') + 0.9 + (a - 706) * 0.035) * (1 - sramp(t, 238, 241.5));
  if (on <= 0) return 0;
  let i = 0; while (i < ROAD.length - 2 && a > ROAD[i + 1]) i++;
  const f = clamp((a - ROAD[i]) / (ROAD[i + 1] - ROAD[i]));
  return on * sramp(a, 703, 707) * (1 - sramp(a, 801, 805)) * (54 + Math.sin(f * Math.PI) * 120);
}
{
  add('que', 'main', 678.6, { z: 0, popAt: ev('han') - 0.8, loud: 1.2 }); add('que', 'main', 701.6, { z: 0, popAt: ev('han') - 0.6, loud: 1.2 });
  add('hall', 'main', 690, { v: 1, z: 0, wide: 20, popAt: ev('han') - 0.4, loud: 2 });
  for (const a of [683.4, 697]) add('redlantern', 'main', a, { z: 1, scale: 1.1 });
  add('person', 'main', 686.4, { v: 'hanOfficial', z: 2, scale: P2, popAt: ev('han') });
  add('person', 'main', 693.4, { v: 'hanLady', z: 2, scale: P2, flip: true, popAt: ev('han') + 0.3 });
  // two thousand years of Han, side by side
  [['hanLady', 699.4], ['modernMan', 702.6], ['granny', 705.4], ['kid', 707.6], ['phoneC', 709.8]].forEach(([v, a], i) => add('person', 'main', a, { v, z: 2.5, scale: P2, popAt: ev('hanAll') + i * 0.22, flip: i % 2 === 1, loud: 0.8, screenAt: 1e9 }));
  // west across the desert: the envoy with his staff, the caravans after him, the Jade Gate
  add('yumen', 'main', 724, { z: 0, wide: 10 });
  add('person', 'main', 716, { v: 'zhangQian', z: 2.5, scale: P2, popAt: ev('envoy'), pace: 4.4, move: (t) => clamp((t - ev('envoy') - 0.4) * 1.5, 0, 26) });
  for (const [a, v, d] of [[708, 0, 1.4], [702.4, 1, 1.8], [697, 0, 2.2]]) add('camel', 'main', a, { v, z: 2, popAt: ev('envoy') + d, move: (t) => clamp((t - ev('envoy') - d - 0.2) * 1.4, 0, 26) });
  add('person', 'main', 704.6, { v: 'silkTrader', z: 2.6, scale: P2, popAt: ev('envoy') + 1.6, pace: 4.4, move: (t) => clamp((t - ev('envoy') - 1.8) * 1.4, 0, 26) });
  for (const [a, v] of [[742, 0], [760, 1], [770, 0]]) add('camel', 'mid', a, { v, scale: 0.6, flip: true, move: (t) => -(t - 195) * 0.2 });
  add('horse', 'mid', 750, { v: 0, scale: 0.7, flip: true, gait: 'gallop', from: ev('east') - 1, move: (t) => -(t - ev('east')) * 2.2 });
  for (const a of [764, 767.6]) add('palm', 'main', a, { v: 0, z: 1, scale: 0.75 });
  add('stupa', 'mid', 776, { scale: 0.6 });
  // paper: the vat, the mould, the drying wall
  add('dryingwall', 'main', 790, { z: 0, wide: 8 });
  add('papervat', 'main', 782.6, { z: 1.5, scale: 1.1 });
  add('papermaker', 'main', 779.2, { z: 2, scale: P2, t0: 214, hold: (t) => sramp(t, ev('sheet'), ev('sheet') + 0.6) * (1 - sramp(t, ev('sheet') + 4.6, ev('sheet') + 5.4)) });
  for (const [a, v] of [[774, 1], [797, 2]]) add('oak', 'main', a, { v, z: 0, scale: 0.85 });
  // Zhang Heng's hall
  add('hall', 'main', 826, { v: 1, z: 0, wide: 20 });
  add('person', 'main', 816.6, { v: 'zhangHeng', z: 2, scale: P2, act: (t) => ({ head: t > ev('quake') - 0.4 && t < ev('quake') + 2 ? -14 : 6 }) });
  for (const [a, v] of [[812, 0], [838, 1]]) add('pine', 'main', a, { v, z: 0, scale: 0.8 });
  grassRun(672, 704, 3.6, 'main', { skip: (a) => a > 676 && a < 704 });
  grassRun(772, 850, 3.6, 'main', { skip: (a) => (a > 777 && a < 795) || (a > 815 && a < 836) });
  grassRun(672, 850, 7, 'front', { s: 2 });

  hook({
    ground(g, st, t, S, G) {
      if (t < ev('silkW') - 0.5 || t > 216) return;
      // what rode the road: silk going west, horses, grapes and glass coming east, and later the Buddha's teaching
      const pos = (a) => G.rad(a, -12 + threadLift(a, t));
      const ride = (icon, a0, a1, t0, dur, s = 1.3) => {
        if (t < t0 || t > t0 + dur + 0.6) return; const k = clamp((t - t0) / dur), a = lerp(a0, a1, smooth(k)), [x, y] = pos(a), sc = sramp(t, t0, t0 + 0.4) * (1 - sramp(t, t0 + dur, t0 + dur + 0.5));
        g.save(); g.translate(x, y + 16); g.rotate((a - G.c) * DEG + Math.sin(t * 3 + a0) * 0.08); g.scale(s * sc, s * sc); put(g, icon, 0.3, 2, 3); g.restore();
      };
      ride(st.fx.icons.silk, 740, 778, ev('silkW'), 3.4);
      ride(st.fx.horseIcon, 784, 748, ev('east'), 3.4, 1.2); ride(st.fx.grapes, 788, 754, ev('east') + 0.5, 3.4); ride(st.fx.glass, 792, 758, ev('east') + 1, 3.4);
      ride(st.fx.icons.dharma, 790, 762, ev('dharma'), 3.2, 1.4);
    },
    over(g, st, t, S) {
      const { W, H } = st;
      if (t < ev('seismo') - 0.2 || t > ev('seismoOut') + 1.6) return;
      const up = clamp(spring(t - ev('seismo'), 5.2, 0.55), 0, 1.3), out = sramp(t, ev('seismoOut'), ev('seismoOut') + 1.1), veil = clamp(up) * (1 - out);
      g.fillStyle = `rgba(10,8,6,${0.45 * veil})`; g.fillRect(0, 0, W, H);
      const base = Math.min(W * 0.62, H * 0.56) / 270, Q = ev('quake'), shake = Math.exp(-(((t - Q + 0.3) / 0.6) ** 2));
      g.save(); g.translate(W * 0.5 + Math.sin(t * 47) * shake * 6, H * 0.47 + (1 - Math.min(1, up)) * H * 0.9 + out * H * 0.9); g.rotate((1 - Math.min(1, up)) * 0.2 + Math.sin(t * 39) * shake * 0.02); g.scale(base * 1.05, base * 1.05);
      put(g, st.fx.seismo, 0.6, 8, 12);
      SEIS_DRAGONS.forEach((x, i) => {
        const falls = i === 3, d = t - Q; let y = -50;
        if (falls && d > 0) { const fall = Math.min(d, 0.5); y = -50 + 0.5 * 1000 * fall * fall; if (d > 0.5) y = 75 - Math.abs(Math.sin((d - 0.5) * 9)) * 10 * Math.exp(-(d - 0.5) * 4); y = Math.min(y, 75); }
        g.save(); g.translate(x + (Math.abs(x) > 60 && !(falls && d > 0) ? Math.sign(x) * 14 : 0), y); put(g, st.fx.seisball, 0.3, 1, 2); g.restore();
      });
      g.restore();
    },
  });
}

// ======================================================== 6. Long divided ===
Object.assign(LOOKS, {
  monk2: { skin: 4, top: 'robe', topCol: '#b8642a', legs: 'robe', legCol: '#b8642a', hair: 'bald', pose: 'walk', item: 'lanternH' },
  monk3: { skin: 3, top: 'robe', topCol: '#8a4a2a', legs: 'robe', legCol: '#8a4a2a', hair: 'bald', pose: 'kneel' },
  carver: { skin: 1, top: 'tunic', topCol: '#9a8a6a', legs: 'trousers', legCol: '#5a4a3a', hair: 'bun', pose: 'stand' },
});
{
  // three kingdoms' camps below the sheet that tears
  [[898, 2], [906, 4], [914, 1]].forEach(([a, v], i) => add('banner', 'main', a, { v, z: 1, scale: 1.1, popAt: ev('novel') + 1.4 + i * 0.3 }));
  [['zhouSoldier', 900.4], ['redSoldier', 910.6]].forEach(([v, a], i) => add('person', 'main', a, { v, z: 2, scale: P2, flip: i === 1, popAt: ev('novel') + 2 }));
  for (const [a, v] of [[894, 0], [918, 1]]) add('pine', 'main', a, { v, z: 0, scale: 0.85 });
  // Buddhism takes root: a carved cliff, a wooden pagoda, monks with lamps, a fig tree growing
  add('cliffbuddha', 'main', 938, { z: 0, wide: 18, popAt: ev('buddha') - 0.4, loud: 2.4, winOn: (t, i) => sramp(t, ev('buddha') + 1.5 + (i % 5) * 0.3, ev('buddha') + 2 + (i % 5) * 0.3) * 0.7 });
  add('pagoda', 'main', 954, { z: 0, wide: 10 });
  add('person', 'main', 927.4, { v: 'monk2', z: 2, scale: P2, pace: 4, move: (t) => (t - 246) * 0.35 });
  add('person', 'main', 946.4, { v: 'monk3', z: 2, scale: P2, act: (t) => ({ lean: 30 + Math.sin(t * 0.6) * 4, head: 14, front: [-100, -60], back: [-90, -60] }) });
  add('person', 'main', 924, { v: 'carver', z: 1.6, scale: P2, act: (t) => { const k = Math.max(0, Math.sin(t * 5)); return { front: [-130 + k * 30, -30], back: [-110 + k * 30, -40], lean: 4 }; } });
  add('bodhi', 'main', 949.6, { z: 1.2, scale: 1.05, grow: (t) => sramp(t, ev('root'), ev('root') + 3.2) });
  for (const [a, v, s] of [[928, 2, 0.6], [948, 0, 0.7]]) add('karst', 'far', a, { v, scale: s });
  grassRun(890, 960, 3.6, 'main', { skip: (a) => a > 926 && a < 956 });
  grassRun(890, 960, 7, 'front', { s: 2 });
  hook({
    lights(t, c, L) {
      if (near(938, c, 50) && t > ev('buddha')) L.push({ a: 938, h: 160, r: 600, k: 0.45 * sramp(t, ev('buddha') + 1.5, ev('buddha') + 3), color: [255, 190, 110] });
    },
    over(g, st, t, S) {
      const { W, H } = st, N = ev('novel');
      if (t < N - 0.2 || t > N + 9.5) return;
      const k = drop(t, N, N + 8.2), por = st.aspectK > 0.4 ? 0 : 1, sc = por ? 1.1 : 1.65;
      // long divided ... must unite; long united ... must divide
      const sep = sramp(t, N + 2.5, N + 3.2) * (1 - sramp(t, N + 3.7, N + 4.3)) + sramp(t, N + 5.7, N + 6.4);
      const y = H * lerp(-0.3, por ? 0.24 : 0.22, k);
      TEAR.forEach(([cx], i) => {
        const dx = (i - 1) * sep * 26, rot = (i - 1) * sep * 0.12 + Math.sin(t * 0.7 + i) * 0.02;
        g.save(); g.translate(W * 0.5 + cx * st.eu * sc + dx * st.eu * sc, 0); g.rotate(Math.sin(t * 0.6 + i) * 1.2 * DEG);
        g.strokeStyle = 'rgba(200,190,175,0.32)'; g.lineWidth = Math.max(1, 0.6 * st.eu); g.beginPath(); g.moveTo(0, -20); g.lineTo(0, y - 70 * st.eu * sc); g.stroke();
        g.translate(0, y); g.rotate(rot); g.scale(st.eu * sc, st.eu * sc); put(g, st.fx.realm[i], 0.2, 4, 6); g.restore();
      });
    },
  });
}

// ============================================================== 7. The Tang ===
Object.assign(LOOKS, {
  digger: { skin: 1, top: 'tunic', topCol: '#8a7a5a', legs: 'trousers', legCol: '#5a4a3a', hat: 'cone', hatCol: '#c9a86a', pose: 'stand', item: 'shovel' },
  examiner: { skin: 4, top: 'robe', topCol: '#3a5a3a', legs: 'robe', legCol: '#3a5a3a', sleeve: '#3a5a3a', hat: 'tangcap', hatCol: '#1e1a1c', beard: 1, pose: 'stand', item: 'scroll' },
  tangLady: { skin: 6, top: 'robe', topCol: '#d8642a', legs: 'robe', legCol: '#8a3a5a', sleeve: '#d8642a', hair: 'bun', hat: 'phoenix', pose: 'walk', item: 'fan' },
  tangMan: { skin: 4, top: 'robe', topCol: '#4a6a8a', legs: 'robe', legCol: '#4a6a8a', sleeve: '#4a6a8a', hat: 'tangcap', hatCol: '#1e1a1c', pose: 'walk' },
  persian: { skin: 5, top: 'coat', topCol: '#2f6a6a', sleeve: '#2f6a6a', legs: 'trousers', legCol: '#5a3a2a', hat: 'turban', hatCol: '#e8dcc0', beard: 1, beardCol: '#2a1c15', pose: 'walk' },
  wuZetian: { skin: 6, top: 'robe', topCol: '#d8a838', legs: 'robe', legCol: '#a8322a', sleeve: '#d8a838', pattern: 'stripe', hair: 'bun', hat: 'phoenix', pose: 'stand' },
  tangOfficial: { skin: 4, top: 'robe', topCol: '#8a2a2a', legs: 'robe', legCol: '#8a2a2a', sleeve: '#8a2a2a', hat: 'tangcap', hatCol: '#1e1a1c', pose: 'stand' },
  tangOfficial2: { skin: 3, top: 'robe', topCol: '#3a6a4a', legs: 'robe', legCol: '#3a6a4a', sleeve: '#3a6a4a', hat: 'tangcap', hatCol: '#1e1a1c', beard: 1, pose: 'stand' },
  liBai: { skin: 4, top: 'robe', topCol: '#e8e4da', legs: 'robe', legCol: '#e8e4da', sleeve: '#e8e4da', hat: 'tangcap', hatCol: '#2a2428', beard: 1, beardCol: '#2a2428', pose: 'sit' },
});
const LIBAI_A = 1122;
{
  // the Grand Canal: dug, then filled, then busy
  const C0 = ev('canal');
  add('barge', 'main', 984, { v: 0, z: 3.5, over: true, y: 2, from: C0 + 2.6, popAt: C0 + 2.8, move: (t) => (t - C0 - 2.8) * 1.6 });
  add('barge', 'main', 1004, { v: 1, z: 3.5, flip: true, over: true, y: 2, from: C0 + 3.2, popAt: C0 + 3.4, move: (t) => -(t - C0 - 3.4) * 1.2 });
  ['digger', 'digger'].forEach((v, i) => add('person', 'main', 989 + i * 9, { v, z: 2, scale: P2, flip: i === 1, foldAt: C0 + 2.4 + i * 0.3, act: (t) => { const k = Math.max(0, Math.sin(t * 3 + i)); return { lean: 16 + k * 14, front: [-60 + k * 50, -30], back: [-50 + k * 50, -30] }; } }));
  for (const [a, v] of [[980, 0], [996, 1], [1010, 2]]) add('willow', 'main', a, { v, z: 0 });
  for (const [a, v] of [[986, 1], [1002, 0]]) add('willow', 'mid', a, { v, scale: 0.55 });
  // the examinations
  add('examcells', 'main', 1024, { z: 0, wide: 14, popAt: ev('exam') - 0.3, loud: 1.6, winOn: (t, i) => 0.4 + 0.2 * Math.sin(t * 3 + i) });
  add('person', 'main', 1014.2, { v: 'examiner', z: 2, scale: P2, popAt: ev('exam') + 0.4, pace: 3, act: (t) => ({ head: 10 + Math.sin(t * 0.7) * 4, back: [20, -10] }) });
  // Chang'an
  add('hall', 'main', 1050, { v: 2, z: 0, wide: 22, popAt: ev('changan') - 0.4, loud: 2.2 });
  add('brickpagoda', 'main', 1068, { z: 0, wide: 10, popAt: ev('changan') + 0.4, loud: 2 });
  for (const a of [1043, 1058]) add('redlantern', 'main', a, { z: 1, scale: 1.1 });
  [['tangLady', 1046], ['tangMan', 1054]].forEach(([v, a], i) => add('person', 'main', a, { v, z: 2.2, scale: P2, flip: i === 1, pace: 4.2, move: (t) => (i ? -1 : 1) * clamp((t - 276) * 0.5, 0, 6) }));
  add('camel', 'main', 1072, { v: 0, z: 2, flip: true, popAt: ev('persia') - 0.6, move: (t) => -clamp((t - ev('persia')) * 1.1, 0, 8) });
  add('person', 'main', 1076.6, { v: 'persian', z: 2.3, scale: P2, flip: true, popAt: ev('persia') - 0.3, pace: 4.2, move: (t) => -clamp((t - ev('persia')) * 1.1, 0, 8) });
  add('camel', 'mid', 1060, { v: 1, scale: 0.6, move: (t) => (t - 276) * 0.4 });
  // Wu Zetian
  add('dais', 'main', 1092, { z: 0.5, scale: 1.1, popAt: ev('wu') - 0.5, loud: 1.4 });
  add('person', 'main', 1092, { v: 'wuZetian', z: 1, scale: P2 * 1.06, y: 44, popAt: ev('wu'), loud: 1.2, act: (t) => ({ head: -2 + Math.sin(t * 0.5) * 2, front: [-20, -30] }) });
  [['tangOfficial', 1099.4], ['tangOfficial2', 1102.2], ['tangOfficial', 1105]].forEach(([v, a], i) => add('person', 'main', a, { v, z: 2, scale: P2, flip: true, popAt: ev('wu') + 0.6 + i * 0.2, act: (t) => { const b = sramp(t, ev('wu') + 1.4 + i * 0.25, ev('wu') + 1.9 + i * 0.25); return { lean: 6 + b * 30, head: 6 + b * 10, front: [-60 * b, -60 * b] }; } }));
  // Li Bai, a bright moon, frost on the floor
  const room = add('tangroom', 'main', LIBAI_A, { z: 0, wide: 12, scale: 1.1, moon: (t) => sramp(t, ev('moonUp'), ev('moonUp') + 2) * (1 - sramp(t, 316, 318)), frost: (t) => sramp(t, ev('frost'), ev('frost') + 1) * (1 - sramp(t, 314, 316)) });
  add('person', 'main', LIBAI_A + 2.2, { inside: room, v: 'liBai', scale: 1.0, z: 2, y: 44, flip: true, act: (t) => { const up = sramp(t, ev('raise'), ev('raise') + 0.9) * (1 - sramp(t, ev('lower'), ev('lower') + 1.1)), down = sramp(t, ev('lower'), ev('lower') + 1.1); return { lean: 6 + down * 10, head: -up * 30 + down * 22, front: [-40 + down * 10, -60], back: [-30, -50] }; } });
  for (const [a, v] of [[1112, 1], [1134, 2]]) add('willow', 'main', a, { v, z: 0, scale: 0.9 });
  for (const [a, v, s] of [[1110, 1, 0.7], [1126, 3, 0.8], [1140, 0, 0.7]]) add('karst', 'far', a, { v, scale: s });
  grassRun(976, 1150, 3.6, 'main', { skip: (a) => (a > 982 && a < 1008) || (a > 1012 && a < 1036) || (a > 1040 && a < 1108) || (a > 1116 && a < 1130) });
  grassRun(976, 1150, 7, 'front', { s: 2 });
  hook({
    lights(t, c, L) {
      if (near(LIBAI_A, c, 50) && t > 294) { const k = room.moon(t); L.push({ a: LIBAI_A - 1.4, h: 60, r: 380, k: 0.6 * k, color: [200, 215, 255] }); }
      if (near(1050, c, 50) && t > 290) for (const a of [1043, 1058]) L.push({ a: a + 1, h: 120, r: 260, k: 0.7 * sramp(t, 292, 294), color: [255, 150, 90] });
    },
    ground(g, st, t, S, G) {
      // the canal: cut into the ground, then the water runs in along it
      const C0 = ev('canal'), fill = sramp(t, C0, C0 + 3.2);
      G.run(981, 1009, (a0, a1) => { G.arc(a0, a1, -6, 16, 'rgba(110,84,56,.6)'); const e = lerp(981, 1009, fill); if (e > a0) { G.arc(a0, Math.min(a1, e), -6, 13, 'rgba(70,110,130,.92)'); G.arc(a0, Math.min(a1, e), -9, 1.4, 'rgba(220,240,250,.5)', [10, 18], -t * 12); } });
    },
    sky(g, st, t, S) {
      const { W, H } = st, M = ev('moonUp');
      if (t > M - 0.5 && t < 318) {
        const k = drop(t, M, 315.5), x = W * (st.aspectK > 0.4 ? 0.3 : 0.24), y = H * lerp(-0.2, 0.17, k);
        g.globalCompositeOperation = 'screen'; const gl = g.createRadialGradient(x, y, 0, x, y, 260 * st.eu); gl.addColorStop(0, `rgba(220,230,255,${0.3 * clamp(k)})`); gl.addColorStop(1, 'rgba(200,215,255,0)'); g.fillStyle = gl; g.fillRect(0, 0, W, H); g.globalCompositeOperation = 'source-over';
        st.hang(g, st.fx.fullmoon, x, y, 1.4, Math.sin(t * 0.4) * 1.2 * DEG);
      }
      const HM = ev('home');
      if (t > HM - 0.2 && t < 318) { const k = drop(t, HM, 315.2); g.save(); g.globalAlpha = 0.85; st.hang(g, st.fx.homecard, W * (st.aspectK > 0.4 ? 0.74 : 0.7), H * lerp(-0.2, 0.2, k), st.aspectK > 0.4 ? 1.4 : 1.1, Math.sin(t * 0.5) * 1.4 * DEG); g.restore(); }
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
  [23, ['#0c1230', '#131c42', '#1e2a56', '#35426e']], [27, DAWN], [31, DAY], [46, DAY], [48.5, ['#34406c', '#80628a', '#dc8c62', '#f6b76a']], [51, DUSK], [54, NIGHT], [95, NIGHT], [99, DAWN], [103, DAY], [107, DAY], [109, ['#6a6a76', '#8a8580', '#a89a88', '#b8a890']], [113, ['#6a6a76', '#8a8580', '#a89a88', '#b8a890']], [116, DAY], [238, DAY], [241, ['#6a8ab0', '#a8b0c0', '#e8d0b0', '#f6c890']], [256, ['#5a6a98', '#a890a8', '#f0b088', '#f8c888']], [260, DAY], [290, DAY], [294, ['#34406c', '#80628a', '#dc8c62', '#f6b76a']], [297.5, DUSK], [300, NIGHT], [315, NIGHT], [318.5, DAWN], [321, DAY],
]);
const ambK = track([[0, [244, 214, 196]], [5, [176, 150, 164]], [9, [96, 98, 138]], [13, [58, 70, 114]], [23, [58, 70, 114]], [27, [200, 180, 175]], [31, W_], [46, W_], [48.5, [244, 200, 180]], [51, [130, 110, 140]], [54, [66, 72, 116]], [95, [66, 72, 116]], [99, [200, 180, 175]], [103, W_], [107, W_], [109, [210, 200, 196]], [113, [210, 200, 196]], [116, W_], [238, W_], [241, [255, 236, 214]], [256, [240, 200, 180]], [260, W_], [290, W_], [294, [244, 200, 180]], [297.5, [110, 104, 140]], [300, [60, 70, 116]], [315, [60, 70, 116]], [318.5, [200, 180, 175]], [321, W_]]);
const moteK = track([[0, [255, 222, 170]], [12, [255, 190, 120]], [26, [255, 222, 170]], [46, [255, 222, 170]], [52, [255, 190, 120]], [98, [255, 222, 170]]]);
const gradeK = track([[0, [255, 170, 95, 0.16]], [24, [255, 170, 95, 0.16]], [30, [255, 205, 150, 0.1]], [46, [255, 205, 150, 0.1]], [52, [255, 160, 90, 0.18]], [96, [255, 160, 90, 0.16]], [102, [255, 205, 150, 0.1]], [107, [255, 205, 150, 0.1]], [109, [150, 140, 130, 0.22]], [113, [150, 140, 130, 0.22]], [116, [255, 210, 160, 0.1]]]);
const SUNS = [[-1, 11, -430, -78, 170], [24, 31, 430, 170, -60], [45, 52, -430, -40, 170], [96, 103, 430, 170, -60]];
const NIGHTS = [[7, 27], [50, 99], [296, 319]];
const ZOOM = [[8, 12, 19.5, 24, 0.36], [26.5, 28.5, 34, 36, 0.12], [36.5, 38.5, 43.5, 46, 0.22], [50.5, 52.5, 56.5, 58.5, 0.2], [90, 92.4, 95.5, 98, 0.3], [146.5, 148.5, 150.5, 152.5, 0.22], [168, 170.5, 173, 175, 0.12], [175.5, 177.5, 180.5, 182.5, 0.42], [287, 289, 292.5, 294.5, 0.2], [299, 303, 314, 317, 0.45]];

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
    zoom, pull, rustle: Math.exp(-(((t - ev('rustle', -9)) / 0.5) ** 2)) * 0.9, shake: Math.exp(-(((t - ev('quake', -9) + 0.3) / 0.6) ** 2)) * 1.2, threadLift: (a) => threadLift(a, t),
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
  for (const [t0, t1] of [[30.5, 45], [102.5, 106.5], [117, 138], [140, 151], [161, 186], [188, 226], [262, 290]]) {
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
  if (t > 57.8 && t < 99 && Math.abs(a - 190.4) < 14) dx += clamp((a - 190.4) / 3, -1, 1) * 9;
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

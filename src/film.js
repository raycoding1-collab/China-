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
import './kinds_modern_china.js';
import { makeFx, hang2, glyph, crack, SEIS_DRAGONS, TEAR, burst } from './sky_china.js';
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
  // 8. the Song
  [318.5, 1206], [321, 1216], [323.5, 1234], [326, 1246], [329, 1252], [331.5, 1262], [334, 1266], [337.5, 1272], [340, 1290], [342.5, 1302], [345, 1316], [347.5, 1326], [350.5, 1334], [354, 1340],
  // 9. Mongols and Ming
  [357, 1366], [360, 1376], [363, 1384], [366, 1392], [369, 1400], [372, 1406], [375, 1418], [378, 1426], [381, 1446], [384, 1460], [387, 1484], [390, 1500], [393, 1522], [395.5, 1540], [398.5, 1550], [402, 1556],
  // 10. the last dynasty
  [406, 1588], [409, 1598], [412, 1606], [414.5, 1620], [417.5, 1630], [420, 1644], [422.5, 1656], [425.5, 1664], [428.5, 1676], [431, 1684], [434, 1694], [437, 1700], [440, 1716], [443, 1724], [446, 1732], [449, 1748], [452, 1752], [456, 1756],
  // 11. war and revolution
  [459, 1810], [462, 1818], [465, 1826], [468, 1844], [471, 1852], [474, 1860], [477, 1866], [480.5, 1872], [483.5, 1880],
  // 12. Mao's China
  [486, 1916], [489, 1928], [492, 1942], [495, 1950], [498, 1960], [501, 1972], [504, 1979], [507, 1987], [510, 2000], [513, 2006], [516, 2012], [519, 2020], [522, 2026],
  // 13. opening up
  [525.5, 2064], [528.5, 2071], [531.5, 2080], [534, 2096], [537, 2104], [540, 2112], [542.5, 2130], [546, 2138], [549.5, 2148], [552.5, 2172], [555.5, 2180], [558.5, 2186], [561.5, 2208], [564, 2218], [567, 2228], [570, 2236], [573, 2244],
  // 14. today, breakthroughs, 15. the long thread
  [576, 2280], [579, 2290], [582, 2306], [585, 2318], [588, 2330], [591, 2342], [594, 2353], [596.5, 2357], [600, 2360], [604, 2364], [607, 2370],
  [610, 2378], [613, 2387], [616, 2395], [619, 2401], [622, 2416], [625, 2428], [628, 2440], [631, 2450], [634, 2466], [637, 2472], [640, 2476],
  [643, 2492], [647, 2499], [652, 2502], [656, 2505], [659.5, 2512], [662, 2526], [666, 2531], [670, 2534], [673.5, 2546], [676, 2555], [679, 2566], [682, 2578],
  [685, 2594], [689, 2602], [693, 2608], [696, 2618], [699, 2628], [702, 2642], [705, 2652], [708, 2668], [711, 2678], [714, 2688], [717, 2698], [720, 2708], [730, 2722], [740, 2736], [750, 2750], [900, 2900],
]);

// ------------------------------------------------- paint and shape of land --
const ZONES = [
  [-200, 28, [148, 134, 86]], [33, 50, [196, 164, 104]], [56, 76, [112, 140, 82]], [80, 110, [104, 132, 76]],
  [116, 182, [150, 132, 92]], [186, 214, [128, 120, 88]], [222, 272, [150, 104, 78]], [280, 704, [176, 150, 108]], [710, 772, [214, 182, 122]], [778, 1196, [168, 150, 104]], [1200, 1288, [176, 160, 120]], [1290, 1312, [44, 86, 126]], [1316, 1352, [168, 150, 104]], [1356, 1384, [150, 150, 96]], [1390, 1476, [168, 150, 104]], [1480, 1526, [44, 86, 126]], [1530, 1544, [204, 178, 120]], [1548, 1668, [168, 150, 104]], [1672, 1700, [44, 86, 126]], [1704, 1740, [120, 100, 84]], [1744, 1802, [168, 150, 104]], [1804, 1858, [120, 116, 110]], [1860, 2060, [168, 150, 104]], [2062, 2092, [140, 136, 128]], [2094, 2130, [130, 130, 128]], [2134, 2166, [150, 140, 110]], [2170, 2196, [150, 146, 140]], [2200, 2268, [110, 130, 84]], [2272, 2316, [110, 110, 116]], [2318, 2356, [130, 140, 96]], [2358, 2360, [196, 178, 128]], [2362, 2372, [44, 86, 126]], [2376, 2414, [112, 120, 90]], [2417, 2462, [44, 86, 126]], [2464, 2480, [120, 120, 98]], [2484, 2548, [110, 112, 116]], [2550, 2586, [96, 96, 102]], [2588, 2620, [70, 70, 76]], [2622, 2640, [130, 124, 112]], [2642, 2664, [214, 186, 128]], [2666, 2694, [208, 182, 124]], [2698, 9999, [204, 170, 124]],
];
const SEAS = [[1290, 1312], [1480, 1526], [1672, 1700], [2362, 2372], [2417, 2462]];
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
  mid: (a) => (1 - water(a)) * (noise(a * 0.33, 3) * 8 + noise(a * 0.1, 4) * 13) + band(a, 30, 50, 4) * (16 + noise(a * 0.8, 9) * 4) + band(a, 710, 772, 4) * (Math.sin(a * 0.9) * 10 + 14) + band(a, 1440, 1476, 4) * (Math.abs(noise(a * 0.4, 51)) * 70 + 30) + band(a, 2376, 2412, 4) * 40 + band(a, 2460, 2484, 4) * 50 - water(a) * 6,
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
  add('redcrane', 'main', 13.6, { z: 3, scale: 1.25, dance: (t) => sramp(t, T_FLUTE + 1.2, T_FLUTE + 2.4) * (1 - sramp(t, T_STOP, T_STOP + 1.2)) });
  add('redcrane', 'main', 18.6, { z: 2, scale: 1.0, flip: true });
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
  add('foundry', 'main', FOUNDRY_A, { z: 1, scale: 1.4, popAt: 50.6, loud: 1.4, pour: (t) => sramp(t, ev('pour') - 0.9, ev('pour')) * (1 - sramp(t, ev('pour') + 2.6, ev('pour') + 3.4)) });
  add('person', 'main', 152.3, { v: 'caster', z: 0.5, scale: P2, popAt: 51, act: (t) => ({ lean: 14, head: 8, front: [-100 + Math.sin(t * 2.4) * 12, -30], back: [-90 + Math.sin(t * 2.4) * 12, -30] }) });
  add('person', 'main', 160.2, { v: 'caster2', z: 2, scale: P2, flip: true, popAt: 51.3, act: (t) => ({ lean: 6, head: 10, front: [-150, -20], back: [-130, -20] }) });
  [[163.4, 0, 1.25], [168.2, 1, 1.05], [171.6, 2, 0.62], [174, 3, 0.62], [177, 1, 0.8]].forEach(([a, v, s], i) => add('ding', 'main', a, { v, z: 1.5, scale: s, popAt: ev('vessels') + i * 0.32, loud: 1.2 }));
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
  add('logs', 'main', 244.6, { z: 2.5, scale: 0.75, popAt: 87.4 });
  add('person', 'main', 252.8, { v: 'sxPriest', z: 2, scale: P2, flip: true, popAt: 89.8, act: (t) => ({ head: t > ev('eyes') && t < ev('eyes') + 2.4 ? -12 : 4, lean: t > ev('eyes') && t < ev('eyes') + 2.4 ? -6 : 2 }) });
  for (const a of [228, 244, 266]) add('bamboo', 'mid', a, { v: (a | 0) % 3, scale: 0.55 });
  for (const [a, v, s] of [[236, 3, 0.7], [250, 1, 0.6], [264, 4, 0.75]]) add('karst', 'far', a, { v, scale: s });
  grassRun(226, 270, 3.8, 'main', { skip: (a) => a > 238 && a < 260 });
  grassRun(214, 300, 7, 'front', { s: 2 });

  hook({
    lights(t, c, L, Em, Sm) {
      if (near(FOUNDRY_A, c, 60) && t > 46 && t < 80) {
        L.push({ a: FOUNDRY_A - 5.1, h: 28, r: 820, k: 1.25 * flick(t, 2), color: [255, 150, 70] });
        // the furnace roars in its mouth, and smokes from its chimney
        const fk = sramp(t, 50.8, 51.6); Em.push({ a: FOUNDRY_A - 5.13, h: 22, scale: 0.42, small: 1, lit: fk, litAt: 50.8, seed: 8 });
        Sm.push({ a: FOUNDRY_A - 5.2, layer: 'main', h: 165, t0: 50.8, size: 1.15, life: 5.5, every: 0.45, rise: 170, drift: 3.5, alpha: 0.42 });
        const p = sramp(t, ev('pour') - 0.4, ev('pour')) * (1 - sramp(t, ev('pour') + 2.6, ev('pour') + 3.4)); if (p > 0) L.push({ a: FOUNDRY_A + 3.8, h: 80, r: 420, k: 1.1 * p, color: [255, 190, 90] });
        L.push({ a: 139.6, h: 60, r: 420, k: 0.7 * sramp(t, 49, 51.5), color: [255, 170, 90] });
        for (const [a, i] of [[163.4, 0], [168.2, 1], [172.2, 2], [175.4, 3]]) { const k = sramp(t, ev('vessels') + i * 0.32, ev('vessels') + 0.6 + i * 0.32); if (k > 0) L.push({ a, h: 50, r: 200, k: 0.55 * k, color: [255, 200, 120] }); }
      }
      if (near(190, c, 60) && t > 56 && t < 100) {
        const k = sramp(t, 57.8, 58.6);
        L.push({ a: 190.4, h: 30, r: 640, k: 1.1 * k * flick(t, 3), color: [255, 150, 74] });
        Em.push({ a: 190.4, h: 4, scale: 0.6, lit: k, litAt: 57.8, seed: 3 });
      }
      if (near(248, c, 60) && t > 86.8 && t < 99) {
        // a ritual fire among the bronzes
        const rk = sramp(t, 87.6, 88.4) * (1 - sramp(t, 97, 99));
        L.push({ a: 244.6, h: 30, r: 700, k: 1.3 * rk * flick(t, 9), color: [255, 140, 64] });
        Em.push({ a: 244.6, h: 4, scale: 0.72, lit: rk, litAt: 87.6, seed: 9 });
        Sm.push({ a: 244.6, layer: 'main', h: 90, t0: 88, t1: 97.5, size: 0.9, life: 5, every: 0.55, rise: 150, drift: 3, alpha: 0.3 });
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
  qinSoldierW: { skin: 3, top: 'coat', topCol: '#2a2628', sleeve: '#2a2628', legs: 'trousers', legCol: '#1e1c1e', hat: 'helmet', hatCol: '#3a3436', pose: 'walk', item: 'ge' },
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
  // the black-clad army of Qin marches in under the storm
  for (let i = 0; i < 8; i++) add('person', i % 2 ? 'mid' : 'main', 478.6 + i * 1.9, { v: 'qinSoldierW', z: 2.2, scale: i % 2 ? P2 * 0.85 : P2, popAt: 140.8 + i * 0.12, pace: 4.4, move: (t) => clamp((t - 141.2) * 1.5, 0, 8.4), foldAt: ev('emperor') - 0.8 + i * 0.05 });
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

// ============================================================== 8. The Song ===
Object.assign(LOOKS, {
  songMan: { skin: 4, top: 'robe', topCol: '#4a6a7a', legs: 'robe', legCol: '#4a6a7a', sleeve: '#4a6a7a', hat: 'futou', hatCol: '#1e1a1c', pose: 'walk' },
  songLady: { skin: 6, top: 'robe', topCol: '#c87a8a', legs: 'skirt', legCol: '#5a6a8a', sleeve: '#c87a8a', hair: 'bun', pose: 'walk' },
  songPorter: { skin: 1, top: 'tunic', topCol: '#a89a7a', legs: 'trousers', legCol: '#5a4a3a', hat: 'cone', hatCol: '#c9a86a', pose: 'walk', item: 'basket' },
  alchemist: { skin: 4, top: 'robe', topCol: '#3a3a5a', legs: 'robe', legCol: '#3a3a5a', sleeve: '#3a3a5a', hat: 'topknot', beard: 1, beardCol: '#e0dcd4', hairCol: '#e0dcd4', pose: 'kneel' },
  alchemistSoot: { skin: 2, top: 'robe', topCol: '#2a2a3a', legs: 'robe', legCol: '#2a2a3a', sleeve: '#2a2a3a', hair: 'curly', hairCol: '#1a1614', beard: 1, beardCol: '#3a3430', pose: 'kneel' },
  fwBoy: { skin: 4, top: 'tunic', topCol: '#c8642a', legs: 'trousers', legCol: '#3a3a40', hair: 'bun', pose: 'stand', small: 0.66 },
  merchantA: { skin: 4, top: 'robe', topCol: '#7a5a2a', legs: 'robe', legCol: '#7a5a2a', sleeve: '#7a5a2a', hat: 'futou', hatCol: '#1e1a1c', beard: 1, pose: 'stand' },
  merchantB: { skin: 3, top: 'robe', topCol: '#2a5a4a', legs: 'robe', legCol: '#2a5a4a', sleeve: '#2a5a4a', hat: 'soft', hatCol: '#3a2a22', pose: 'stand' },
  biSheng: { skin: 4, top: 'tunic', topCol: '#6a5a4a', sleeve: '#6a5a4a', legs: 'trousers', legCol: '#3a3a40', apron: '#d8d0b8', hat: 'scarf', hatCol: '#3a3a40', pose: 'stand' },
});
const FW = [332.4, 333.3, 334.1, 334.9, 335.9, 336.8, 337.6], FW_RACK = 1263, FW_COL = [[255, 120, 80], [255, 200, 90], [160, 220, 255], [255, 140, 170], [200, 255, 150], [255, 210, 120], [255, 110, 70]];
const fwPos = (st, i) => [st.W * [0.3, 0.62, 0.45, 0.76, 0.24, 0.55, 0.7][i], st.H * [0.2, 0.14, 0.27, 0.22, 0.12, 0.08, 0.3][i] * (st.aspectK > 0.4 ? 1 : 0.85) + st.H * (st.aspectK > 0.4 ? 0 : 0.06)];
{
  // Kaifeng: a river, the rainbow bridge, shops, crowds, someone carrying a load over the arch
  const BR = 1222;
  add('rainbowbridge', 'main', BR, { z: 1.5, scale: 1.2, y: -4, wide: 10 });
  add('barge', 'main', BR - 1, { v: 1, z: 1, over: true, y: 2, scale: 0.8, move: (t) => (t - 318) * 0.4 });
  add('person', 'main', BR - 7, { v: 'songPorter', z: 2, scale: P2, pace: 4.4, move: (t) => clamp((t - 317) * 0.9, 0, 14), lift: (t) => { const dx = clamp((t - 317) * 0.9, 0, 14) - 7, x = dx * DEG * 1000 / 1.2; return Math.abs(x) < 120 ? (Math.sin(((x + 120) / 240) * Math.PI) * 62 + 10) * 1.2 - 4 : 0; } });
  for (const [a, v] of [[1205, 0], [1212.4, 1], [1233, 2], [1240.4, 0]]) add('shop', 'main', a, { v, z: 0, winOn: (t, i) => 0.7 * sramp(t, 330, 332) * (1 - sramp(t, 338, 340)) });
  [['songMan', 1209], ['songLady', 1236.6], ['songMan', 1244]].forEach(([v, a], i) => add('person', 'main', a, { v, z: 2.2, scale: P2, flip: i === 1, pace: 4.2, move: (t) => (i === 1 ? -1 : 1) * clamp((t - 317) * 0.45, 0, 6) }));
  for (const a of [1200, 1247]) add('willow', 'main', a, { v: 1, z: 0, scale: 0.9 });
  // an alchemist and his stove: a flash, a puff, a new hairstyle
  const BANG = ev('bang');
  add('furnace', 'main', 1253.4, { z: 1.5, scale: 1.2 });
  add('person', 'main', 1250, { v: 'alchemist', z: 2, scale: P2, foldAt: BANG + 0.06, act: (t) => ({ lean: 22, head: 18, front: [-60 + Math.sin(t * 4) * 16, -40], back: [-50 + Math.sin(t * 4 + 1) * 16, -40] }) });
  add('person', 'main', 1249.4, { v: 'alchemistSoot', z: 2, scale: P2, popAt: 1e9, repopAt: BANG + 0.5, act: (t) => ({ lean: -14, head: -10 + Math.sin(t * 7) * 2, front: [-150, 30], back: [-140, 40] }) });
  // fireworks at night: a rack of rockets, lanterns, a crowd looking up
  add('rocketrack', 'main', FW_RACK, { z: 1.4, scale: 1.2 });
  for (const a of [1258, 1278]) add('redlantern', 'main', a, { z: 1, scale: 1.1, lit: (t) => sramp(t, 330, 331.5) * (1 - sramp(t, 338.5, 340)) });
  [['songMan', 1267.4], ['fwBoy', 1269.8], ['songLady', 1272.2], ['merchantB', 1275]].forEach(([v, a], i) => add('person', 'main', a, { v, z: 2, scale: P2, act: (t) => (t > FW[0] - 0.4 && t < 339 ? { walk: undefined, head: -26 + Math.sin(t * 2 + i) * 6, lean: -4, front: i === 1 ? [-160, -10] : [-20, -20] } : { walk: undefined }) }));
  add('shop', 'main', 1283, { v: 2, z: 0, winOn: (t) => 0.75 * sramp(t, 330, 332) * (1 - sramp(t, 338.5, 340)) });
  // out at sea: a junk steering by compass
  for (let a = 1290; a < 1312; a += 4) add('wave', 'main', a, { v: (R() * 4) | 0, z: 4, loud: 0.2, ground: false, y: -2 });
  for (let a = 1288; a < 1314; a += 6) add('wave', 'front', a, { v: (R() * 4) | 0, scale: 1.6, ground: false, loud: 0.2 });
  add('junk', 'main', 1300, { v: 0, z: 3, ground: false, y: 10, move: (t) => (t - 338) * 0.35 });
  add('junk', 'mid', 1306, { v: 1, scale: 0.5, ground: false, y: 4, move: (t) => (t - 338) * 0.3 });
  // merchants paying in paper
  add('person', 'main', 1318.6, { v: 'merchantA', z: 2, scale: P2, act: (t) => (t > ev('money') - 0.4 && t < ev('money') + 2 ? { front: [-110, -20], lean: 6 } : {}) });
  add('person', 'main', 1323.4, { v: 'merchantB', z: 2, scale: P2, flip: true, act: (t) => (t > ev('money') + 0.6 && t < ev('money') + 2.6 ? { front: [-100, -20], head: 6 } : {}) });
  add('shop', 'main', 1327, { v: 1, z: 0 });
  // Bi Sheng and his clay type
  add('hall', 'main', 1340, { v: 6, z: 0, wide: 10 });
  add('person', 'main', 1334.4, { v: 'biSheng', z: 2, scale: P2, act: (t) => { const k = Math.max(0, Math.sin(t * 3)); return { lean: 10 + k * 6, head: 18, front: [-70 + k * 20, -40], back: [-60 + k * 20, -30] }; } });
  add('seat', 'main', 1337, { z: 1.8, scale: 1.4 });
  grassRun(1196, 1290, 3.6, 'main', { skip: (a) => (a > 1203 && a < 1286) });
  grassRun(1314, 1352, 3.6, 'main', { skip: (a) => a > 1316 && a < 1344 });
  grassRun(1196, 1352, 7, 'front', { s: 2, skip: (a) => a > 1288 && a < 1314 });

  hook({
    lights(t, c, L, Em, Sm, st) {
      if (near(1253, c, 50) && t > 320 && t < 334) {
        L.push({ a: 1253.4, h: 20, r: 200, k: 0.6, color: [255, 150, 80] });
        const f = Math.exp(-(((t - BANG) / 0.18) ** 2)); if (f > 0.01) L.push({ a: 1253.4, h: 70, r: 900, k: 1.6 * f, color: [255, 230, 190] });
        if (t > BANG) Sm.push({ a: 1253.4, h: 70, t0: BANG, t1: BANG + 1.4, size: 1.8, life: 3.2, every: 0.12, rise: 120, drift: 2, alpha: 0.9 });
      }
      if (near(FW_RACK, c, 60) && t > 329 && t < 341) {
        for (const a of [1258, 1278]) L.push({ a: a + 1, h: 120, r: 260, k: 0.7 * sramp(t, 330, 331.5) * (1 - sramp(t, 338.5, 340)), color: [255, 140, 90] });
        if (st) FW.forEach((t0, i) => { const d = t - t0; if (d < 0 || d > 1.8) return; const [x, y] = fwPos(st, i), c2 = FW_COL[i]; L.push({ screen: [x, y + st.H * 0.2], r: 1400, k: 0.6 * Math.exp(-d * 2), color: c2 }); });
      }
    },
    ground(g, st, t, S, G) {
      G.river(1214, 1230, -6, 14, 'rgba(70,110,120,.92)', 'rgba(220,240,250,.45)');
      if (t > ev('money') - 0.2 && t < ev('money') + 3) {
        // paper money, passing from hand to hand
        for (let i = 0; i < 6; i++) { const k = clamp((t - ev('money') - i * 0.22) / 1.3); if (k <= 0 || k >= 1) continue; const a = lerp(1319.4, 1322.6, k), [x, y] = G.rad(a, 110 + Math.sin(k * Math.PI) * 40); g.save(); g.translate(x, y); g.rotate((a - G.c) * DEG + Math.sin(t * 6 + i) * 0.3); g.scale(1.2, 1.2 * (0.4 + 0.6 * Math.abs(Math.sin(t * 5 + i)))); put(g, st.fx.jiaozi, 0.3, 1, 2); g.restore(); }
      }
    },
    over(g, st, t, S) {
      const { W, H } = st, por = st.aspectK > 0.4 ? 0 : 1;
      // rockets up from the rack, and the bursts
      if (t > FW[0] - 1.2 && t < 341) {
        const [rx, ry] = st.place('main', FW_RACK + 0.4, 120, t);
        FW.forEach((t0, i) => {
          const [x, y] = fwPos(st, i), up = t - (t0 - 0.9);
          if (up > 0 && up < 0.9) { const k = up / 0.9, px = lerp(rx, x, k), py = lerp(ry, y, k * (2 - k)); g.globalCompositeOperation = 'lighter'; for (let j = 0; j < 8; j++) st.stamp(g, st.dot(255, 200, 120, '255,240,200'), lerp(rx, px, 1 - j * 0.05), lerp(ry, py, 1 - j * 0.05), (5 - j * 0.5) * st.eu, 0.9 - j * 0.1); g.globalCompositeOperation = 'source-over'; }
          burst(g, st, x, y, t - t0, FW_COL[i], 24 + (i % 3) * 4, por ? 0.8 : 1.1);
        });
      }
      // the compass: the needle swings, and settles pointing south
      if (t > ev('compass') - 0.3 && t < ev('compass') + 5.6) {
        const k = drop(t, ev('compass'), ev('compass') + 4.8), x = W * (por ? 0.5 : 0.3), y = H * lerp(-0.25, por ? 0.24 : 0.21, k), sc = por ? 1.1 : 1.5;
        st.hang(g, st.fx.compass, x, y, sc, Math.sin(t * 0.6) * 1.5 * DEG);
        const sw = Math.sin(t * 0.6) * 1.5 * DEG, len = y + 20, cx = x - Math.sin(sw) * len, cy = -20 + Math.cos(sw) * len;
        const d = t - ev('compass'), ang = Math.PI / 2 + 2.4 * Math.exp(-d * 1.1) * Math.cos(d * 5.5);
        g.save(); g.translate(cx, cy); g.scale(st.eu * sc, st.eu * sc * 0.62); g.rotate(ang); put(g, st.fx.needle, 0.3, 1, 2); g.restore();
      }
      // Bi Sheng's type, then printed pages leaving like a flock
      if (t > ev('type') - 0.3 && t < 355) {
        const k = drop(t, ev('type'), 353.4); st.hang(g, st.fx.typetray, W * (por ? 0.5 : 0.62), H * lerp(-0.3, por ? 0.24 : 0.19, k), por ? 0.85 : 1.3, Math.sin(t * 0.8 + 1) * 2 * DEG);
      }
      const P0 = ev('pages');
      if (t > P0 - 0.2 && t < P0 + 6) {
        const [px, py] = st.place('main', 1336, 80, t), u = st.eu;
        for (let i = 0; i < 26; i++) {
          const a = t - P0 - i * 0.07; if (a < 0) continue;
          const hx = 0.35 + hash(i * 3) * 0.9, hy = 0.9 + hash(i * 5) * 0.5, sp = (150 + hash(i * 7) * 120) * u;
          const x = px + hx * a * sp + Math.sin(a * 1.7 + i) * 30 * u * Math.min(1, a), y = py - hy * a * sp * 0.8 + a * a * 6 * u + Math.sin(a * 2.3 + i * 2) * 14 * u;
          if (x > W + 60 || y < -60) continue;
          const flap = Math.sin(t * (9 + hash(i) * 4) + i), s2 = u * (1.1 + hash(i * 11) * 0.5) * Math.min(1, a * 4);
          g.save(); g.translate(x, y); g.rotate(-0.5 + Math.sin(a + i) * 0.2);
          for (const side of [-1, 1]) { g.save(); g.scale(side * s2, s2 * (0.25 + 0.75 * Math.abs(flap))); g.rotate(flap > 0 ? -0.2 : 0.2); put(g, st.fx.page, 0); g.restore(); }
          g.restore();
        }
      }
    },
  });
}

// ===================================================== 9. Mongols and Ming ===
Object.assign(LOOKS, {
  mongolA: { skin: 3, top: 'coat', topCol: '#6a4a2a', sleeve: '#6a4a2a', legs: 'trousers', legCol: '#3a2a20', hat: 'mongol', hatCol: '#8a3a2a', pose: 'sit' },
  mongolB: { skin: 4, top: 'coat', topCol: '#3a5a6a', sleeve: '#3a5a6a', legs: 'trousers', legCol: '#3a2a20', hat: 'mongol', hatCol: '#2a4a5a', pose: 'sit' },
  kublai: { skin: 4, top: 'robe', topCol: '#d8b850', legs: 'robe', legCol: '#8a5a2a', sleeve: '#d8b850', pattern: 'stripe', hat: 'mongol', hatCol: '#a8322a', beard: 1, pose: 'stand' },
  beggarMonk: { skin: 3, top: 'robe', topCol: '#8a7a5a', legs: 'robe', legCol: '#8a7a5a', sleeve: '#8a7a5a', pattern: 'stripe', hair: 'bald', pose: 'walk', item: 'bowl' },
  mingEmperor: { skin: 3, top: 'robe', topCol: '#d8a838', legs: 'robe', legCol: '#d8a838', sleeve: '#d8a838', pattern: 'stripe', hat: 'futou', hatCol: '#1e1a1c', beard: 1, pose: 'stand' },
  mingOfficial: { skin: 4, top: 'robe', topCol: '#a8322a', legs: 'robe', legCol: '#a8322a', sleeve: '#a8322a', hat: 'futou', hatCol: '#1e1a1c', beard: 1, pose: 'kneel' },
  mingOfficial2: { skin: 3, top: 'robe', topCol: '#2a4a7a', legs: 'robe', legCol: '#2a4a7a', sleeve: '#2a4a7a', hat: 'futou', hatCol: '#1e1a1c', pose: 'kneel' },
  zhengHe: { skin: 4, top: 'robe', topCol: '#2a3a6a', legs: 'robe', legCol: '#2a3a6a', sleeve: '#2a3a6a', pattern: 'stripe', hat: 'futou', hatCol: '#1e1a1c', pose: 'stand' },
  swahili: { skin: 0, top: 'robe', topCol: '#e8e2d4', legs: 'robe', legCol: '#e8e2d4', sleeve: '#e8e2d4', hat: 'band', hatCol: '#c8322a', beard: 1, pose: 'stand' },
  swahili2: { skin: 2, top: 'dress', topCol: '#c8642a', legs: 'skirt', legCol: '#3a6a8a', hair: 'curly', pose: 'stand', item: 'basket' },
});
{
  // the steppe, the riders, Kublai Khan
  const MG = ev('mongols');
  for (const [a, v] of [[1362, 0], [1370, 1], [1376.4, 0]]) add('yurt', 'main', a, { v, z: 0 });
  for (const [a, v] of [[1366, 1], [1380, 0]]) add('yurt', 'mid', a, { v, scale: 0.55 });
  ['mongolA', 'mongolB', 'mongolA'].forEach((v, i) => add('rider', 'main', 1352 - i * 5, { v, z: 3 + i * 0.1, scale: 0.95, popAt: MG + i * 0.25, move: (t) => clamp((t - MG - i * 0.25) * 6, 0, 30 - i * 2), gait: 'gallop', to: ev('zhu') + 1.5, foldAt: ev('zhu') + 0.4 + i * 0.2 }));
  add('rider', 'mid', 1372, { v: 'mongolB', scale: 0.65, move: (t) => (t - 355) * 1.6, gait: 'gallop' });
  add('dais', 'main', 1388, { z: 0.5, scale: 1.1, popAt: ev('kublai') - 0.4 });
  add('person', 'main', 1388, { v: 'kublai', z: 1, scale: P2 * 1.06, y: 44, popAt: ev('kublai') });
  add('hall', 'main', 1398, { v: 1, z: 0, wide: 20, popAt: ev('kublai') + 0.6 });
  // the begging monk who became emperor
  add('person', 'main', 1402, { v: 'beggarMonk', z: 2.5, scale: P2, popAt: ev('monk'), pace: 3.6, move: (t) => clamp((t - ev('monk')) * 0.8, 0, 4.4), foldAt: ev('ming') - 0.2, act: (t) => ({ front: [-60, -40] }) });
  add('person', 'main', 1406.4, { v: 'mingEmperor', z: 2.5, scale: P2 * 1.05, popAt: 1e9, repopAt: ev('ming') + 0.15, loud: 1.4, act: (t) => ({ head: -4, lean: -2, front: [-30, -40] }) });
  // the Forbidden City and the Ming wall
  add('hall', 'main', 1424, { v: 4, z: 0, wide: 22, popAt: ev('forbidden'), loud: 2.6, scale: 1.1 });
  for (const a of [1410, 1414.6, 1433.4, 1438]) add('palacewall', 'main', a, { z: 0.2, popAt: ev('forbidden') + 0.4 + Math.abs(a - 1424) * 0.02 });
  [[1418.6, 'mingOfficial'], [1430, 'mingOfficial2']].forEach(([a, v], i) => add('person', 'main', a, { v, z: 2, scale: P2, flip: i === 1, popAt: ev('forbidden') + 0.8, act: (t) => ({ lean: 32, head: 14 }) }));
  for (let a = 1440, i = 0; a < 1478; a += 2, i++) add('earthwall', 'mid', a, { v: 1, scale: 0.6, popAt: ev('mingwall') + i * 0.06, loud: 0.35 });
  for (const [a, k] of [[1446, 0], [1458, 1], [1470, 2]]) add('beacon', 'mid', a, { v: 1, scale: 0.62, popAt: ev('mingwall') + 0.5 + k * 0.4, loud: 0.6 });
  for (let a = 1448, i = 0; a < 1468; a += 2.9, i++) if (Math.abs(a - 1458) > 1.5) add('earthwall', 'main', a, { v: 1, z: 1, popAt: ev('mingwall') + 0.3 + i * 0.08, loud: 0.5 });
  add('beacon', 'main', 1458, { v: 1, z: 1.1, popAt: ev('mingwall') + 0.8 });
  for (const [a, v] of [[1442, 0], [1474, 1]]) add('pine', 'main', a, { v, z: 0, scale: 0.9 });
  // Zheng He's fleet, out across the ocean to the coast of East Africa
  const ZH = ev('zhenghe');
  for (let a = 1480; a < 1526; a += 4.2) add('wave', 'main', a, { v: (R() * 4) | 0, z: 4, loud: 0.2, ground: false, y: -2 });
  for (let a = 1478; a < 1528; a += 6) add('wave', 'front', a, { v: (R() * 4) | 0, scale: 1.6, ground: false, loud: 0.2 });
  add('treasureship', 'main', 1494, { z: 3, ground: false, y: 12, scale: 0.8, popAt: ZH, loud: 2, move: (t) => Math.max(0, t - ZH) * 1.4 });
  for (const [a, s, L] of [[1486, 0.55, 'mid'], [1500, 0.5, 'mid'], [1510, 0.45, 'mid'], [1490, 0.3, 'far'], [1504, 0.3, 'far'], [1516, 0.28, 'far']]) add(a % 2 ? 'junk' : 'treasureship', L, a, { v: 1, scale: s, ground: false, y: 4, popAt: ZH + 0.6 + (a % 7) * 0.1, move: (t) => Math.max(0, t - ZH) * 1.1 });
  for (const [a, v] of [[1530, 0], [1538, 1]]) add('baobab', 'main', a, { v, z: 0 });
  for (const a of [1533.4, 1542]) add('palm', 'main', a, { v: 0, z: 0.5, scale: 0.85 });
  add('person', 'main', 1535.6, { v: 'swahili', z: 2, scale: P2, flip: true });
  add('person', 'main', 1537.8, { v: 'swahili2', z: 2, scale: P2, flip: true });
  // the giraffe at the Ming court; everyone bows to it
  const GIR = ev('giraffe');
  add('hall', 'main', 1562, { v: 4, z: 0, wide: 22 });
  add('giraffe', 'main', 1546, { z: 2.4, scale: 1.25, popAt: GIR - 0.2, loud: 1.4, flip: false, pace: 1.4, move: (t) => clamp((t - GIR) * 1.1, 0, 4) });
  [[1553, 'mingOfficial'], [1555.6, 'mingOfficial2'], [1558.2, 'mingOfficial']].forEach(([a, v], i) => add('person', 'main', a, { v, z: 2.2, scale: P2, flip: true, popAt: GIR + 0.5 + i * 0.2, act: (t) => { const b = sramp(t, ev('qilin') + i * 0.25, ev('qilin') + 0.5 + i * 0.25); return { lean: 18 + b * 30, head: 10 + b * 12 }; } }));
  add('person', 'main', 1550.2, { v: 'zhengHe', z: 2.1, scale: P2, popAt: GIR + 0.3 });
  grassRun(1356, 1478, 3.6, 'main', { skip: (a) => (a > 1384 && a < 1408) || (a > 1408 && a < 1440) });
  grassRun(1528, 1572, 3.6, 'main', { skip: (a) => a > 1544 && a < 1570 });
  grassRun(1356, 1572, 7, 'front', { s: 2, skip: (a) => a > 1478 && a < 1528 });
  hook({
    sky(g, st, t, S) {
      const Q = ev('qilin');
      if (t > Q - 0.3 && t < Q + 6) { const k = drop(t, Q, Q + 5.2), por = st.aspectK > 0.4 ? 0 : 1; st.hang(g, st.fx.qilin, st.W * (por ? 0.5 : 0.7), st.H * lerp(-0.3, por ? 0.24 : 0.2, k), por ? 1.0 : 1.4, Math.sin(t * 0.6) * 1.5 * DEG); }
    },
  });
}

// ====================================================== 10. The last dynasty ===
Object.assign(LOOKS, {
  bannerman: { skin: 4, top: 'coat', topCol: '#c9a24a', sleeve: '#c9a24a', legs: 'trousers', legCol: '#3a3030', hat: 'qing', hatCol: '#2a2224', hair: 'queue', pose: 'sit' },
  bannerman2: { skin: 3, top: 'coat', topCol: '#e8e2d4', sleeve: '#e8e2d4', legs: 'trousers', legCol: '#3a3030', hat: 'qing', hatCol: '#2a2224', hair: 'queue', pose: 'sit' },
  qingEmperor: { skin: 4, top: 'robe', topCol: '#d8a838', legs: 'robe', legCol: '#d8a838', sleeve: '#d8a838', pattern: 'stripe', hat: 'qing', hatCol: '#2a2224', hair: 'queue', pose: 'stand' },
  qingOfficial: { skin: 4, top: 'robe', topCol: '#2a2a4a', legs: 'robe', legCol: '#2a2a4a', sleeve: '#2a2a4a', hat: 'qing', hatCol: '#2a2224', hair: 'queue', beard: 1, pose: 'stand' },
  qingFarmer: { skin: 3, top: 'tunic', topCol: '#4a5a6a', legs: 'trousers', legCol: '#3a3a40', hat: 'cone', hatCol: '#c9a86a', hair: 'queue', pose: 'stand', item: 'hoe' },
  hongMerchant: { skin: 4, top: 'robe', topCol: '#3a2a4a', legs: 'robe', legCol: '#3a2a4a', sleeve: '#3a2a4a', hat: 'qing', hatCol: '#2a2224', hair: 'queue', pose: 'stand' },
  briton: { skin: 6, top: 'coat', topCol: '#2a2a3a', sleeve: '#2a2a3a', legs: 'trousers', legCol: '#d8d0bc', hat: 'top', hatCol: '#1e1c1c', pose: 'stand' },
  linZexu: { skin: 4, top: 'robe', topCol: '#8a2a2a', legs: 'robe', legCol: '#2a2a3a', sleeve: '#8a2a2a', hat: 'qing', hatCol: '#2a2224', hair: 'queue', beard: 1, pose: 'stand' },
  coolie: { skin: 1, top: 'tunic', topCol: '#9a8a6a', legs: 'trousers', legCol: '#4a4038', hat: 'cone', hatCol: '#c9a86a', hair: 'queue', pose: 'stand' },
  puyi: { skin: 6, top: 'robe', topCol: '#d8a838', legs: 'robe', legCol: '#d8a838', sleeve: '#d8a838', hat: 'qing', hatCol: '#2a2224', pose: 'sit', small: 0.62 },
  puyiStand: { skin: 6, top: 'robe', topCol: '#d8a838', legs: 'robe', legCol: '#d8a838', sleeve: '#d8a838', hat: 'qing', hatCol: '#2a2224', pose: 'stand', small: 0.62 },
});
const PUYI_A = 1752;
{
  // the Manchu banners ride in; a Qing emperor
  const MA = ev('manchu');
  [['bannerman', 0], ['bannerman2', 1], ['bannerman', 2]].forEach(([v, i]) => add('rider', 'main', 1580 - i * 5, { v, z: 3 + i * 0.1, scale: 0.95, popAt: MA + i * 0.25, gait: 'gallop', move: (t) => clamp((t - MA - i * 0.25) * 6, 0, 20) }));
  [[1592, 3], [1597, 6], [1602, 1], [1607, 2]].forEach(([a, v], i) => add('banner', 'mid', a, { v, scale: 0.9, popAt: MA + 0.6 + i * 0.25 }));
  add('hall', 'main', 1608, { v: 4, z: 0, wide: 22 });
  add('person', 'main', 1601.4, { v: 'qingEmperor', z: 2.4, scale: P2 * 1.05, popAt: ev('qing'), loud: 1.2 });
  add('person', 'main', 1615, { v: 'qingOfficial', z: 2.2, scale: P2, flip: true, popAt: ev('qing') + 0.4, act: (t) => ({ lean: 24, head: 10 }) });
  // terraces of maize and sweet potato; the people multiply
  const CR = ev('newcrops');
  [1622, 1625, 1628, 1631].forEach((a, i) => add('maize', 'main', a, { v: i % 2, z: 1, popAt: CR + i * 0.14, loud: 0.6 }));
  [1634.4, 1637].forEach((a, i) => add('potato', 'main', a, { v: i, z: 1, over: true, scale: 1.3, popAt: CR + 0.7 + i * 0.14, loud: 0.6 }));
  add('person', 'main', 1640.4, { v: 'qingFarmer', z: 2, scale: P2, popAt: CR + 0.4 });
  // Canton: tea, silk and porcelain out; silver in
  for (const [a, v] of [[1650, 0], [1656, 1], [1662, 2]]) add('hong', 'main', a, { v, z: 0 });
  add('person', 'main', 1666.4, { v: 'hongMerchant', z: 2, scale: P2 });
  add('person', 'main', 1668.6, { v: 'briton', z: 2, scale: P2, flip: true });
  for (let a = 1672; a < 1700; a += 4.2) add('wave', 'main', a, { v: (R() * 4) | 0, z: 4, loud: 0.2, ground: false, y: -2 });
  for (let a = 1670; a < 1702; a += 6) add('wave', 'front', a, { v: (R() * 4) | 0, scale: 1.6, ground: false, loud: 0.2 });
  add('ship', 'main', 1678, { z: 3, ground: false, y: -6, scale: 0.85 });
  // opium smuggled in; Lin Zexu has it destroyed; the gunboat
  const OP = ev('opium'), DE = ev('destroy'), WAR = ev('opiumWar');
  [1684, 1686.4, 1688.8].forEach((a, i) => add('crate', 'main', a, { v: i % 2, z: 3, ground: false, y: 30, popAt: OP + 0.6 + i * 0.25, foldAt: DE + 0.6 + i * 0.2 }));
  add('steamship', 'main', 1694, { z: 3.2, ground: false, y: 8, scale: 0.9, from: WAR - 0.6, popAt: WAR - 0.4, loud: 1.4, move: (t) => -clamp((t - WAR) * 1.2, 0, 4) });
  add('junk', 'mid', 1690, { v: 1, scale: 0.5, ground: false, y: 4, foldAt: WAR + 1.8 });
  add('junk', 'mid', 1698, { v: 0, scale: 0.45, ground: false, y: 4, foldAt: WAR + 2.4 });
  add('person', 'main', 1704, { v: 'linZexu', z: 2, scale: P2, flip: true, popAt: DE - 0.6, act: (t) => (t > DE - 0.2 && t < DE + 2 ? { front: [-150, -10], head: -4 } : {}) });
  ['coolie', 'coolie'].forEach((v, i) => add('person', 'main', 1708 + i * 3, { v, z: 2, scale: P2, flip: true, popAt: DE - 0.3, act: (t) => { const k = Math.max(0, Math.sin(t * 4 + i)); return { lean: 20 + k * 20, front: [-80 + k * 40, -30], back: [-70 + k * 40, -30] }; } }));
  // the civil war: a dark country, figures folding
  const TP = ev('taiping');
  for (let a = 1716, i = 0; a < 1736; a += 1.6, i++) add('person', 'mid', a, { v: ['coolie', 'qingFarmer', 'hongMerchant'][i % 3], scale: P2 * 0.62, popAt: TP - 1.2 + i * 0.05, foldAt: TP + 1.2 + hash(i) * 4 });
  for (const [a, v] of [[1718, 0], [1732, 1]]) add('roundhut', 'main', a, { v, z: 0, foldAt: TP + 1.5 + v * 1.2 });
  // the last emperor, six years old
  const AB = ev('abdicate');
  add('hall', 'main', PUYI_A + 6, { v: 4, z: 0, wide: 22 });
  add('dais', 'main', PUYI_A, { z: 0.5, scale: 1.1 });
  add('dragonthrone', 'main', PUYI_A, { z: 0.8, scale: 1.0, y: 44, foldAt: AB + 1.2, loud: 1.6 });
  add('person', 'main', PUYI_A - 0.6, { v: 'puyi', z: 1, scale: P2, y: 44 + 58, foldAt: AB + 0.7, act: (t) => ({ lean: 2, head: Math.sin(t * 0.8) * 4, front: [-20 + Math.sin(t * 2.2) * 8, -20], back: [-10, -10] }) });
  add('person', 'main', PUYI_A + 4.8, { v: 'puyiStand', z: 2.6, scale: P2, popAt: 1e9, repopAt: AB + 1.0, act: (t) => ({ head: 4 + Math.sin(t * 0.6) * 3, front: [-10, -10], back: [6, -6] }) });
  grassRun(1572, 1648, 3.6, 'main', { skip: (a) => (a > 1596 && a < 1644) });
  grassRun(1704, 1770, 3.6, 'main', { skip: (a) => (a > 1742 && a < 1766) });
  grassRun(1572, 1770, 7, 'front', { s: 2, skip: (a) => a > 1670 && a < 1702 });
  hook({
    lights(t, c, L, Em, Sm) {
      if (near(1694, c, 60) && t > WAR) for (let k = 0; k < 4; k++) { const tf = WAR + 0.6 + k * 0.9, f = Math.exp(-(((t - tf) / 0.12) ** 2)); if (f > 0.02) L.push({ a: 1690 - k * 0.8, h: 30, r: 500, k: 1.4 * f, color: [255, 200, 140] }); if (t > tf) Sm.push({ a: 1690 - k * 0.8, h: 30, t0: tf, t1: tf + 0.3, size: 1.2, life: 3, every: 0.1, rise: 90, drift: 3, alpha: 0.8 }); }
      if (near(1700, c, 60) && t > DE && t < DE + 6) Sm.push({ a: 1706, h: 10, t0: DE + 0.4, t1: DE + 4, size: 1.3, life: 4, every: 0.3, rise: 200, drift: 3, alpha: 0.6 });
      if (near(1726, c, 70) && t > TP - 1 && t < TP + 9) Sm.push({ a: 1726, h: 20, t0: TP, t1: TP + 6, size: 2, life: 6, every: 0.4, rise: 300, drift: 5, alpha: 0.6 });
    },
    ground(g, st, t, S, G) {
      // a thread across the water: Chinese goods out, silver back
      const TR = ev('trade');
      if (t > TR - 0.5 && t < TR + 7) {
        const [x0, y0] = G.rad(1666, 150), [x1, y1] = G.rad(1679, 230), k = sramp(t, TR, TR + 1), P = (f) => { const a = 1 - f, mx = (x0 + x1) / 2, my = Math.min(y0, y1) - 90; return [a * a * x0 + 2 * a * f * mx + f * f * x1, a * a * y0 + 2 * a * f * my + f * f * y1]; };
        g.save(); g.globalAlpha = 1 - sramp(t, TR + 5.6, TR + 6.6); g.strokeStyle = 'rgba(244,206,108,.9)'; g.lineWidth = 1.8; g.beginPath(); g.moveTo(x0, y0); for (let i = 1; i <= 24; i++) { const [x, y] = P((i / 24) * k); g.lineTo(x, y); } g.stroke();
        const ride = (icon, t0, back, s = 1.3) => { if (t < t0 || t > t0 + 2.4) return; const f = clamp((t - t0) / 2.2), [x, y] = P(back ? 1 - f : f); g.save(); g.translate(x, y + 14); g.rotate((1666 - G.c) * DEG + Math.sin(t * 3) * 0.1); g.scale(s, s); put(g, icon, 0.3, 2, 3); g.restore(); };
        ride(st.fx.teaIcon, TR + 0.6); ride(st.fx.icons.silk, TR + 1.1); ride(st.fx.vase, TR + 1.6); ride(st.fx.sycee, TR + 2.6, true); ride(st.fx.sycee, TR + 3.0, true); ride(st.fx.sycee, TR + 3.4, true);
        g.restore();
      }
    },
    over(g, st, t, S) {
      // the people of the Qing, more and more of them: a paper chain that keeps unfolding
      const PO = ev('popgrow');
      if (t < PO - 0.3 || t > PO + 7) return;
      const { W, H } = st, u = st.eu, por = st.aspectK > 0.4 ? 0 : 1, s = por ? 0.8 : 1.05, sp = 40 * s * u;
      const k = drop(t, PO, PO + 5.8), y = H * lerp(-0.32, por ? 0.24 : 0.19, k), n = Math.min(30, Math.floor(clamp((t - PO) / 4) * 30) + 1);
      const x0 = W * 0.06;
      g.save(); g.strokeStyle = 'rgba(200,190,175,0.32)'; g.lineWidth = Math.max(1, 0.6 * u);
      for (const xx of [x0 - sp * 0.5, x0 + (n - 0.5) * sp]) { g.beginPath(); g.moveTo(xx, -20); g.lineTo(xx, y - 17 * s * u); g.stroke(); }
      for (let i = 0; i < n; i++) { const open = clamp((t - PO) * 7.5 - i * 0.25), bob = Math.sin(t * 1.1 + i * 0.7) * 1.2 * u; g.save(); g.translate(x0 + i * sp, y + bob - 17 * s * u); g.scale(s * u * open, s * u); g.translate(0, 17); put(g, st.fx.dollC[(i * 3) % 5], 0.25, 2, 3); g.restore(); }
      g.restore();
    },
  });
}

// ==================================================== 11. War and revolution ===
Object.assign(LOOKS, {
  puller: { skin: 1, top: 'shirt', topCol: '#d8d0bc', sleeve: '#d8d0bc', legs: 'trousers', legCol: '#3a3a40', hat: 'cone', hatCol: '#c9a86a', pose: 'walk' },
  qipaoSit: { skin: 6, top: 'dress', topCol: '#2a6a7a', legs: 'skirt', legCol: '#2a6a7a', sleeve: '#2a6a7a', hair: 'bob', hairCol: '#1a1614', pose: 'sit' },
  qipao: { skin: 6, top: 'dress', topCol: '#8a2a4a', legs: 'skirt', legCol: '#8a2a4a', hair: 'bob', hairCol: '#1a1614', pose: 'walk' },
  suitMan: { skin: 4, top: 'coat', topCol: '#3a3a40', sleeve: '#3a3a40', legs: 'trousers', legCol: '#3a3a40', hat: 'top', hatCol: '#2a2a2e', pose: 'walk' },
  warlord: { skin: 3, top: 'coat', topCol: '#5a6048', sleeve: '#5a6048', legs: 'trousers', legCol: '#4a4a3a', hat: 'cap', hatCol: '#4a4a3a', pose: 'walk' },
  villager40: { skin: 3, top: 'tunic', topCol: '#4a5a6a', legs: 'trousers', legCol: '#3a3a40', hair: 'short', pose: 'stand' },
  villager40b: { skin: 4, top: 'dress', topCol: '#6a5a4a', legs: 'skirt', legCol: '#3a3a40', hair: 'bun', pose: 'stand' },
  crowd49: { skin: 3, top: 'coat', topCol: '#4a5a6a', sleeve: '#4a5a6a', legs: 'trousers', legCol: '#3a3a40', hat: 'cap', hatCol: '#4a5a6a', pose: 'stand' },
  crowd49b: { skin: 4, top: 'shirt', topCol: '#d8d0bc', sleeve: '#d8d0bc', legs: 'trousers', legCol: '#2a3a4a', hair: 'bob', pose: 'stand' },
});
{
  const RP = ev('republic'), JP = ev('japan'), DEAD = ev('dead'), PRC = ev('prc');
  // Shanghai's waterfront: banks, a tram, a rickshaw, the new clothes
  for (const [a, v] of [[1806, 1], [1812, 0], [1832, 2]]) add('hong', 'main', a, { v, z: 0, foldAt: JP + 1.2 + (a - 1806) * 0.03, repopAt: PRC + 0.5 });
  add('tower', 'main', 1820, { v: 1, z: 0, scale: 0.7, foldAt: JP + 1.8, repopAt: PRC + 0.8 });
  add('tram', 'main', 1804, { z: 2, scale: 0.8, from: RP - 1, to: JP + 0.5, move: (t) => (t - RP) * 1.2 });
  add('rickshaw', 'main', 1826, { z: 2.4, scale: 1.0, flip: true, from: RP - 0.5, to: JP + 0.8, move: (t) => -(t - RP) * 1.1 });
  [['qipao', 1814.6], ['suitMan', 1817]].forEach(([v, a], i) => add('person', 'main', a, { v, z: 2.2, scale: P2, flip: i === 1, pace: 4.2, to: JP + 0.6, move: (t) => (i ? -1 : 1) * clamp((t - RP) * 0.5, 0, 6) }));
  ['warlord', 'warlord', 'warlord'].forEach((v, i) => add('person', 'main', 1836 + i * 2.6, { v, z: 2, scale: P2, flip: true, popAt: RP + 2.2 + i * 0.2, pace: 5.6, to: JP + 0.7, move: (t) => -clamp((t - RP - 2.4) * 1.1, 0, 10) }));
  // the war: the town folds; a long line of people folds after it
  for (let a = 1842, i = 0; a < 1858; a += 1.25, i++) add('person', 'main', a, { v: ['villager40', 'villager40b', 'crowd49'][i % 3], z: 2, scale: P2 * 0.92, flip: i % 2 === 1, popAt: DEAD - 2.4 + i * 0.04, foldAt: DEAD + 0.3 + i * 0.22, loud: 0.3 });
  // 1949: the gate, a crowd, a flag going up
  add('tiananmen', 'main', 1872, { z: 0, wide: 26, popAt: PRC - 3.2, loud: 2.4, winOn: () => 0 });
  add('flag', 'main', 1862.4, { z: 1.2, scale: 1.0, popAt: PRC - 0.6, raise: (t) => sramp(t, PRC, PRC + 3) });
  for (let a = 1858, i = 0; a < 1886; a += 2.2, i++) if (Math.abs(a - 1862.4) > 1.2) add('person', 'main', a, { v: i % 2 ? 'crowd49' : 'crowd49b', z: 2.4, scale: P2, flip: i % 3 === 0, popAt: PRC + 0.6 + i * 0.07, act: (t) => (t > PRC + 2 && i % 2 ? { front: [-160 + Math.sin(t * 6 + i) * 12, -10] } : {}) });
  grassRun(1800, 1890, 7, 'front', { s: 2 });
  hook({
    lights(t, c, L, Em, Sm) {
      if (near(1820, c, 70) && t > JP && t < DEAD + 4) for (const [a, k] of [[1806, 0], [1812, 1], [1820, 2], [1832, 3]]) Sm.push({ a, h: 20, t0: JP + 1.2 + k * 0.4, t1: DEAD + 2, size: 1.8, life: 6, every: 0.4, rise: 300, drift: 6, alpha: 0.7 });
    },
    sky(g, st, t, S) {
      const { W, H } = st, JP2 = ev('japan');
      if (t > JP2 && t < JP2 + 9) for (const [d, y, sp, s] of [[0.2, 0.16, 0.15, 1.3], [1.2, 0.26, 0.12, 1.0], [2.4, 0.11, 0.17, 1.45], [3.6, 0.3, 0.13, 1.05]]) {
        const k = (t - JP2 - d) * sp; if (k < 0 || k > 1.25) continue;
        g.save(); g.globalAlpha = 0.9; st.hang(g, st.fx.bomber, W * lerp(1.15, -0.15, k), H * y, s, Math.sin(t * 1.4 + d) * 1.2 * DEG, 0.9, Math.PI); g.restore();
      }
    },
    over(g, st, t, S) {
      const JP2 = ev('japan');
      if (t < JP2 + 0.5 || t > ev('dead') + 4) return;
      const k = sramp(t, JP2 + 0.5, JP2 + 1.5) * (1 - sramp(t, ev('dead') + 2.6, ev('dead') + 4)), c = cam(t);
      g.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 9; i++) {
        const per = 1.3 + hash(i) * 1.6, ph = ((t + hash(i * 3) * per) % per) / per, fl = Math.exp(-ph * 6) * k; if (fl < 0.03) continue;
        const [x, y] = st.place('far', c + (hash(i * 7 + Math.floor((t + hash(i * 3) * per) / per)) - 0.5) * 70, 20, t), r = (60 + hash(i * 5) * 80) * st.eu;
        st.stamp(g, st.dot(255, 150, 80), x, y, r, 0.7 * fl);
      }
      g.globalCompositeOperation = 'source-over';
    },
  });
}

// =========================================================== 12. Mao's China ===
Object.assign(LOOKS, {
  teacher50: { skin: 4, top: 'coat', topCol: '#3a4a6a', sleeve: '#3a4a6a', legs: 'trousers', legCol: '#3a3a40', hair: 'short', pose: 'stand', item: 'book' },
  pupil50: { skin: 3, top: 'shirt', topCol: '#e8e4d8', sleeve: '#e8e4d8', legs: 'trousers', legCol: '#2a3a5a', hair: 'short', pose: 'stand', small: 0.66 },
  pupil50b: { skin: 4, top: 'shirt', topCol: '#c8322a', sleeve: '#c8322a', legs: 'skirt', legCol: '#2a3a5a', hair: 'bob', pose: 'stand', small: 0.66 },
  barefoot: { skin: 3, top: 'shirt', topCol: '#d8d0bc', sleeve: '#d8d0bc', legs: 'trousers', legCol: '#3a4a5a', hair: 'bob', pose: 'walk', item: 'medbox' },
  elder50: { skin: 3, top: 'coat', topCol: '#3a3a40', sleeve: '#3a3a40', legs: 'trousers', legCol: '#2a2a30', hair: 'bald', beard: 1, beardCol: '#e0dcd4', pose: 'stand' },
  commune: { skin: 3, top: 'coat', topCol: '#3a5a7a', sleeve: '#3a5a7a', legs: 'trousers', legCol: '#2a3a4a', hat: 'cap', hatCol: '#3a5a7a', pose: 'walk', item: 'basket' },
  commune2: { skin: 4, top: 'coat', topCol: '#5a6a4a', sleeve: '#5a6a4a', legs: 'trousers', legCol: '#3a3a30', hair: 'bob', pose: 'stand' },
  redguard: { skin: 4, top: 'coat', topCol: '#5a6a3a', sleeve: '#5a6a3a', legs: 'trousers', legCol: '#4a5030', hat: 'cap', hatCol: '#5a6a3a', pose: 'stand', item: 'redbook' },
  redguardB: { skin: 3, top: 'coat', topCol: '#5a6a3a', sleeve: '#5a6a3a', legs: 'trousers', legCol: '#4a5030', hair: 'bob', pose: 'stand', item: 'redbook' },
  teacherCR: { skin: 4, top: 'coat', topCol: '#4a4a50', sleeve: '#4a4a50', legs: 'trousers', legCol: '#3a3a40', hair: 'short', hairCol: '#8c8378', pose: 'stand' },
  tuYouyou: { skin: 4, top: 'coat', topCol: '#efece4', sleeve: '#efece4', legs: 'trousers', legCol: '#3a3a40', hair: 'bob', pose: 'stand' },
  saved70: { skin: 3, top: 'shirt', topCol: '#d8b860', sleeve: '#d8b860', legs: 'trousers', legCol: '#3a4a5a', hair: 'curly', pose: 'stand' },
  saved70b: { skin: 0, top: 'dress', topCol: '#5a8a7a', legs: 'skirt', legCol: '#5a8a7a', hair: 'long', pose: 'stand' },
});
const LAB_A = 2010;
{
  // schools and clinics
  add('hall', 'main', 1912, { v: 6, z: 0, wide: 10 });
  add('person', 'main', 1916.4, { v: 'teacher50', z: 2, scale: P2, act: (t) => ({ front: [-110 + Math.sin(t * 1.4) * 10, -20] }) });
  [['pupil50', 1919.4], ['pupil50b', 1921.4], ['pupil50', 1923.4]].forEach(([v, a], i) => add('person', 'main', a, { v, z: 2, scale: P2, flip: true, act: (t) => ({ head: -4 + Math.sin(t * 0.8 + i) * 3, front: t > 486 + i * 0.4 && t < 488 + i * 0.4 ? [-160, -10] : [-14, -16] }) }));
  add('person', 'main', 1928, { v: 'barefoot', z: 2.2, scale: P2, pace: 4.4, move: (t) => clamp((t - 483) * 0.9, 0, 4.4), act: (t) => (t > 488 ? { walk: undefined, lean: 8, front: [-60, -20] } : {}) });
  add('person', 'main', 1934.6, { v: 'elder50', z: 2, scale: P2, flip: true, popAt: ev('longer') });
  add('person', 'main', 1937, { v: 'granny', z: 2, scale: P2, flip: true, popAt: ev('longer') + 0.3, screenAt: 1e9 });
  // the Great Leap: furnaces in every yard, the harvest left in the fields, then hunger
  const GL = ev('leap'), FAM = ev('famine');
  for (const [a, i] of [[1944, 0], [1950, 1], [1956, 2]]) add('bfurnace', 'main', a, { z: 1, scale: 1.2, popAt: GL + 0.3 + i * 0.4, loud: 1, lit: (t) => 1 - sramp(t, FAM + 3, FAM + 5) });
  ['commune', 'commune2', 'commune'].forEach((v, i) => add('person', 'main', 1946.4 + i * 6, { v, z: 2, scale: P2, popAt: GL + 0.6 + i * 0.3, foldAt: FAM + 0.6 + i * 0.5 }));
  [1960, 1962.4, 1964.8].forEach((a, i) => add('millet', 'main', a, { v: i, z: 1, scale: 1.4, foldAt: GL + 3 + i * 0.4 }));
  for (let a = 1940, i = 0; a < 1966; a += 1.4, i++) add('person', 'mid', a, { v: ['commune', 'commune2'][i % 2], scale: P2 * 0.62, popAt: GL + 1 + i * 0.04, foldAt: FAM + 0.4 + hash(i * 3) * 3 });
  // the Cultural Revolution: posters, a teacher alone, students turning away
  const CR = ev('cultural'), TURN = ev('turn');
  add('posterwall', 'main', 1976, { z: 0, wide: 10, popAt: CR - 0.6, loud: 1.2 });
  add('person', 'main', 1971.4, { v: 'teacherCR', z: 2, scale: P2, popAt: CR - 0.2, act: (t) => ({ lean: 10 + sramp(t, TURN, TURN + 1) * 10, head: 14 + sramp(t, TURN, TURN + 1) * 8, front: [-10, -10], back: [10, -10] }) });
  [['redguard', 1975.2], ['redguardB', 1977.6], ['redguard', 1980]].forEach(([v, a], i) => {
    add('person', 'main', a, { v, z: 2.2, scale: P2, flip: true, popAt: CR + 0.2 + i * 0.2, foldAt: TURN + i * 0.2, act: (t) => ({ front: [-150 + Math.sin(t * 5 + i) * 10, -10] }) });
    add('person', 'main', a + 0.4, { v, z: 2.2, scale: P2, popAt: 1e9, repopAt: TURN + 0.3 + i * 0.2 });
  });
  add('person', 'main', 1986, { v: 'qipao', z: 2, scale: P2, flip: true, act: (t) => ({ walk: undefined, head: 10 }) });
  add('person', 'main', 1988.4, { v: 'suitMan', z: 2, scale: P2, flip: true, act: (t) => ({ walk: undefined, head: 10 }) });
  add('person', 'main', 1991.4, { v: 'pupil50', z: 2.2, scale: P2, flip: true, foldAt: TURN + 1.8 });
  add('person', 'main', 1991.8, { v: 'pupil50', z: 2.2, scale: P2, popAt: 1e9, repopAt: TURN + 2.1 });
  // Tu Youyou: an old book, a plant, a cure
  const TU = ev('tu'), SAVED = ev('saved');
  add('hall', 'main', LAB_A + 8, { v: 6, z: 0, wide: 10, winOn: () => 0.8, winCol: [230, 240, 255] });
  add('lab', 'main', LAB_A, { z: 1.4, scale: 1.2, popAt: TU - 0.6, loud: 1.2, found: (t) => sramp(t, ev('cure'), ev('cure') + 0.5) * (0.85 + 0.15 * Math.sin(t * 3)) });
  add('person', 'main', LAB_A - 3.4, { v: 'tuYouyou', z: 2, scale: P2, popAt: TU - 0.3, act: (t) => ({ lean: 12, head: 14, front: [-70, -40], back: [-50, -30] }) });
  for (const [a, i] of [[LAB_A + 4.6, 0], [LAB_A + 6.4, 1]]) add('wormwood', 'main', a, { v: i, z: 1.6, scale: 1.2, grow: (t) => sramp(t, ev('herb') + i * 0.3, ev('herb') + 1.6 + i * 0.3) });
  [['saved70', 2020], ['saved70b', 2022.4], ['saved', 2024.8], ['saved2', 2027.2], ['saved3', 2029.6]].forEach(([v, a], i) => add('person', 'main', a, { v, z: 2, scale: P2, flip: i % 2 === 1, popAt: SAVED + i * 0.3, loud: 0.9 }));
  grassRun(1904, 2040, 3.6, 'main', { skip: (a) => (a > 1910 && a < 1940) || (a > 1942 && a < 1994) || (a > 2004 && a < 2032) });
  grassRun(1904, 2040, 7, 'front', { s: 2 });
  hook({
    lights(t, c, L, Em, Sm) {
      if (near(1950, c, 60) && t > GL && t < FAM + 6) for (const [a, i] of [[1944, 0], [1950, 1], [1956, 2]]) { const k = sramp(t, GL + 0.3 + i * 0.4, GL + 0.8 + i * 0.4) * (1 - sramp(t, FAM + 3, FAM + 5)); L.push({ a, h: 30, r: 340, k: 0.8 * k, color: [255, 150, 80] }); Sm.push({ a: a + 0.3, h: 120, t0: GL + i * 0.4, t1: FAM + 3, size: 1.1, life: 5, every: 0.5, rise: 220, drift: 4, alpha: 0.6 }); }
      if (near(LAB_A, c, 60) && t > TU - 1) { L.push({ a: LAB_A, h: 70, r: 420, k: 0.8 * sramp(t, ev('cure'), ev('cure') + 0.5), color: [200, 255, 180] }); L.push({ a: LAB_A + 8, h: 60, r: 300, k: 0.5, color: [230, 240, 255] }); }
    },
    over(g, st, t, S) {
      const GH = ev('gehong');
      if (t > GH - 0.3 && t < GH + 7) { const k = drop(t, GH, GH + 6), por = st.aspectK > 0.4 ? 0 : 1; st.hang(g, st.fx.gehong, st.W * (por ? 0.5 : 0.34), st.H * lerp(-0.3, por ? 0.24 : 0.19, k), por ? 1.0 : 1.5, Math.sin(t * 0.6) * 1.5 * DEG); }
    },
  });
}

// ============================================================ 13. Opening up ===
Object.assign(LOOKS, {
  worker80: { skin: 4, top: 'coat', topCol: '#3a5a7a', sleeve: '#3a5a7a', legs: 'trousers', legCol: '#2a3a4a', hair: 'short', pose: 'walk' },
  worker80b: { skin: 3, top: 'shirt', topCol: '#e8e4d8', sleeve: '#e8e4d8', legs: 'trousers', legCol: '#3a3a40', hair: 'bob', pose: 'walk' },
  fisher80: { skin: 3, top: 'tunic', topCol: '#6a7a8a', legs: 'trousers', legCol: '#3a3a40', hat: 'cone', hatCol: '#c9a86a', pose: 'stand' },
  tankman: { skin: 4, top: 'shirt', topCol: '#efece4', sleeve: '#efece4', legs: 'trousers', legCol: '#2a2a30', hair: 'short', pose: 'stand' },
  villager15: { skin: 3, top: 'coat', topCol: '#5a4a6a', sleeve: '#5a4a6a', legs: 'trousers', legCol: '#2a2a30', hair: 'bob', pose: 'stand' },
  villager15b: { skin: 4, top: 'shirt', topCol: '#c8642a', sleeve: '#c8642a', legs: 'trousers', legCol: '#2a3a4a', hair: 'short', pose: 'stand', small: 0.66 },
});
const SPARK = [[2214, 150], [2220, 150], [2226, 150], [2232, 150], [2238, 150], [2244, 150]];
{
  const OP = ev('open'), SZ = ev('shenzhen'), POV = ev('poverty'), T89 = ev('tanks'), SP = ev('spark'), ALL = ev('allLit');
  // the doors open; ships, cranes, containers
  add('redgates', 'main', 2072, { z: 2.5, scale: 1.0, open: (t) => sramp(t, OP, OP + 1.6), loud: 1.6 });
  add('containers', 'main', 2080, { v: 0, z: 0.5, popAt: OP + 1.2 }); add('containers', 'main', 2086, { v: 1, z: 0.5, popAt: OP + 1.4 });
  for (const [a, i] of [[2078, 0], [2090, 1]]) add('crane', 'mid', a, { scale: 0.7, popAt: OP + 1.4 + i * 0.3 });
  ['worker80', 'worker80b'].forEach((v, i) => add('person', 'main', 2066 + i * 3, { v, z: 3, scale: P2, popAt: OP + 0.8 + i * 0.3, pace: 4.6, move: (t) => clamp((t - OP - 1.2) * 1.4, 0, 10) }));
  // Shenzhen: a fishing village, then a city
  for (const [a, v] of [[2096, 0], [2102, 1], [2108, 0]]) add('hut', 'main', a, { v, z: 0.4, scale: 0.9, foldAt: SZ + 0.4 + (a - 2096) * 0.05 });
  add('person', 'main', 2099.4, { v: 'fisher80', z: 2, scale: P2, foldAt: SZ + 0.6 });
  [[2095, 'tower', 4, 0.8], [2100, 'kk100', 0, 0.72], [2106, 'pingan', 0, 0.66], [2112, 'bamboo400', 0, 0.72], [2117, 'tower', 5, 0.8], [2122, 'tower', 1, 0.75]].forEach(([a, k, v, sc], i) => add(k, 'main', a, { v, z: 0.2, scale: sc, popAt: SZ + 0.7 + i * 0.3, loud: 1.4, wide: 6, winOn: (t, w) => (hash(w + i * 9) < 0.5 ? 0 : sramp(t, 551 + hash(w) * 4, 551.4 + hash(w) * 4) * 0.7) }));
  for (let a = 2090, i = 0; a < 2132; a += 3.2, i++) add('tower', 'mid', a, { v: i % 7, scale: 0.55, popAt: SZ + 1 + i * 0.12, loud: 0.5 });
  for (let a = 2088, i = 0; a < 2136; a += 2.6, i++) add('tower', 'far', a, { v: (i * 3) % 7, scale: 0.42, popAt: SZ + 1.4 + i * 0.08, loud: 0.3 });
  add('crane', 'main', 2109.5, { z: 0.1, scale: 0.85, popAt: SZ + 0.4, hoist: (t) => sramp(t, SZ + 1.2, SZ + 7) });
  // 1989: a square at dusk, a column of tanks, one man standing in front of them
  add('person', 'main', 2182, { v: 'tankman', z: 2.5, scale: P2, popAt: T89 - 3.0, act: (t) => ({ walk: undefined, head: 0, front: [-6, -6], back: [4, -4] }) });
  for (let i = 0; i < 3; i++) add('tank', 'main', 2188 + i * 6.4, { z: 2.2 - i * 0.1, scale: 1.05, flip: true, popAt: T89 - 2.4 + i * 0.3, loud: 1.2, move: (t) => -Math.min(clamp((t - T89 + 2) * 1.2, 0, 3.2), 3.2) });
  // light reaches the farthest villages
  for (const [a, v, i] of [[2211, 0, 0], [2217, 1, 1], [2223, 2, 2], [2229, 0, 3], [2235, 1, 4], [2241, 2, 5]]) add('farmhouse', 'main', a, { v, z: 0.4, winOn: (t, w) => sramp(t, SP + i * 0.8, SP + 0.2 + i * 0.8) * 0.9 });
  for (const [a] of SPARK) add('pole', 'main', a + 3, { z: 0.5, scale: 0.9 });
  for (let a = 2204, i = 0; a < 2262; a += 3.4, i++) add('farmhouse', 'mid', a, { v: i % 3, scale: 0.5, winOn: (t, w) => sramp(t, ALL + hash(i * 3 + w) * 1.4, ALL + 0.2 + hash(i * 3 + w) * 1.4) * 0.85 });
  for (let a = 2200, i = 0; a < 2270; a += 2.6, i++) add('farmhouse', 'far', a, { v: i % 3, scale: 0.42, winOn: (t, w) => sramp(t, ALL + 0.4 + hash(i * 5 + w) * 1.8, ALL + 0.6 + hash(i * 5 + w) * 1.8) * 0.85 });
  for (const [a, v, s] of [[2216, 1, 0.8], [2230, 3, 0.95], [2246, 0, 0.8], [2258, 4, 0.9]]) add('karst', 'far', a, { v, scale: s });
  [['villager15', 2226.4], ['villager15b', 2228]].forEach(([v, a], i) => add('person', 'main', a, { v, z: 2, scale: P2, flip: i === 1, act: (t) => (t > SP + 2 ? { head: -10, front: i ? [-150, -10] : [-20, -20] } : {}) }));
  grassRun(2060, 2096, 3.6, 'main', { skip: (a) => a > 2064 && a < 2094 });
  grassRun(2134, 2260, 3.6, 'main', { skip: (a) => (a > 2176 && a < 2206) || (a > 2208 && a < 2246) });
  grassRun(2060, 2262, 7, 'front', { s: 2 });
  hook({
    lights(t, c, L) {
      if (near(2230, c, 70) && t > SP - 1) {
        SPARK.forEach(([a], i) => { const k = sramp(t, SP + i * 0.8, SP + 0.2 + i * 0.8); if (k > 0) L.push({ a: a + 0.5, h: 40, r: 380, k: 0.8 * k, color: [255, 200, 130] }); });
        const sp = sparkAt(t); if (sp) L.push({ a: sp[0], h: sp[1], r: 220, k: 1.2, color: [210, 230, 255] });
      }
      if (near(2108, c, 60) && t > 550) L.push({ a: 2108, h: 200, r: 600, k: 0.4 * sramp(t, 551, 553), color: [255, 200, 140] });
    },
    ground(g, st, t, S, G) {
      if (!near(2230, G.c, 60)) return;
      g.strokeStyle = 'rgba(28,24,22,.7)'; g.lineWidth = 1;
      for (let i = 0; i < SPARK.length - 1; i++) { const p0 = G.rad(SPARK[i][0] + 3, 168 * 0.9), p1 = G.rad(SPARK[i + 1][0] + 3, 168 * 0.9); g.beginPath(); g.moveTo(p0[0], p0[1]); g.quadraticCurveTo((p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2 + 20, p1[0], p1[1]); g.stroke(); }
    },
    over(g, st, t, S) {
      const { W, H } = st, u = st.eu;
      // the spark running along the wire
      const sp = sparkAt(t); if (sp) { const [x, y] = st.place('main', sp[0], sp[1], t); g.globalCompositeOperation = 'lighter'; st.stamp(g, st.dot(160, 200, 255, '255,255,255'), x, y, 22 * u, 1); g.globalCompositeOperation = 'source-over'; }
      // eight hundred million out of poverty: ten paper people, nine of them grey, coming into colour
      const PV = ev('poverty');
      if (t > PV - 0.3 && t < PV + 9) {
        const por = st.aspectK > 0.4 ? 0 : 1, n = 10, s = por ? 1.05 : 1.3, sp2 = 40 * s * u, k = drop(t, PV, PV + 7.6), y = H * lerp(-0.32, por ? 0.25 : 0.19, k), x0 = W / 2 - ((n - 1) / 2) * sp2;
        g.save(); g.strokeStyle = 'rgba(200,190,175,0.32)'; g.lineWidth = Math.max(1, 0.6 * u);
        for (const xx of [x0 - sp2 * 0.5, x0 + (n - 0.5) * sp2]) { g.beginPath(); g.moveTo(xx, -20); g.lineTo(xx, y - 17 * s * u); g.stroke(); }
        for (let i = 0; i < n; i++) {
          const col = i === 9 ? 1 : sramp(t, PV + 2.2 + [3, 7, 1, 5, 8, 0, 4, 6, 2][i] * 0.42, PV + 2.7 + [3, 7, 1, 5, 8, 0, 4, 6, 2][i] * 0.42), bob = Math.sin(t * 1.1 + i * 0.7) * 1.2 * u;
          g.save(); g.translate(x0 + i * sp2, y + bob - 17 * s * u); g.scale(s * u, s * u); g.translate(0, 17);
          g.globalAlpha = 0.55; put(g, st.fx.doll, 0.25, 2, 3); if (col > 0) { g.globalAlpha = col; put(g, st.fx.dollC[(i * 3) % 5], 0, 2, 3); }
          g.restore();
        }
        g.restore(); g.globalAlpha = 1;
      }
    },
  });
}
function sparkAt(t) {
  const SP = ev('spark'), d = (t - SP) / 0.8; if (d < 0 || d >= SPARK.length - 1) return null;
  const i = Math.floor(d), f = d - i, a = lerp(SPARK[i][0], SPARK[i + 1][0], f) + 3;
  return [a, 168 * 0.9 - Math.sin(f * Math.PI) * 20];
}

// ================================================================= 14. Today ===
Object.assign(LOOKS, {
  cityA: { skin: 4, top: 'coat', topCol: '#3e5a7a', sleeve: '#3e5a7a', legs: 'trousers', legCol: '#2c2c33', hair: 'short', pose: 'walk', item: 'phone' },
  cityB: { skin: 3, top: 'hoodie', topCol: '#d0533c', sleeve: '#d0533c', legs: 'trousers', legCol: '#2f3b52', hair: 'bob', pose: 'stand', item: 'phone' },
  cityC: { skin: 6, top: 'dress', topCol: '#2f6f6a', legs: 'skirt', legCol: '#2f6f6a', sleeve: '#2f6f6a', hair: 'long', pose: 'stand', item: 'phone' },
  cityD: { skin: 4, top: 'shirt', topCol: '#e9e4d8', sleeve: '#e9e4d8', legs: 'trousers', legCol: '#3a3a40', hair: 'bald', beard: 1, beardCol: '#cfc6b8', pose: 'stand', item: 'phone' },
  cityKid: { skin: 4, top: 'hoodie', topCol: '#e3b341', sleeve: '#e3b341', legs: 'trousers', legCol: '#34507a', hair: 'bob', pose: 'stand', small: 0.66, item: 'phone' },
  engineer: { skin: 4, top: 'coat', topCol: '#e8e6e0', sleeve: '#e8e6e0', legs: 'trousers', legCol: '#2a3a4a', hat: 'helmet', hatCol: '#e8c040', pose: 'stand' },
  physicist: { skin: 4, top: 'coat', topCol: '#efece4', sleeve: '#efece4', legs: 'trousers', legCol: '#3a3a40', hair: 'short', pose: 'stand' },
  physicist2: { skin: 3, top: 'coat', topCol: '#efece4', sleeve: '#efece4', legs: 'trousers', legCol: '#3a3a40', hair: 'bob', pose: 'stand' },
  runner: { skin: 4, top: 'shirt', topCol: '#d8282a', sleeve: '#d8282a', legs: 'trousers', legCol: '#2a2a30', hair: 'short', pose: 'walk' },
  planter: { skin: 3, top: 'coat', topCol: '#3a5a3a', sleeve: '#3a5a3a', legs: 'trousers', legCol: '#3a3a30', hat: 'wide', hatCol: '#c9a86a', pose: 'stand', item: 'shovel' },
});
const GANTRY_A = 2356, DAM = [2389.6, 2393.2, 2396.8, 2400.4, 2404, 2407.6], DECK0 = 2419, DECK1 = 2447, PYL = [[2424, 0], [2431.4, 1], [2438.6, 2]], ISLE = 2450.4, TUBE1 = 2460;
const CANYON = 2472, TOK = 2502, QS = [2519, 2546], STAGE = 2556, FACT = 2603;
{
  const NOW = ev('today'), TR = ev('hsr'), LA = ev('launch');
  // Lujiazui at night: the Pearl, Jin Mao, the bottle opener and the twisting Shanghai Tower; people and their screens
  add('jinmao', 'main', 2281, { z: 0, wide: 6, scale: 0.68, winOn: (t, w) => (hash(w * 3 + 1) < 0.35 ? 0 : 0.7), winCol: [255, 214, 150] });
  add('pearl', 'main', 2288, { z: 0.2, scale: 0.72, wide: 8, winOn: () => 0.9, winCol: [255, 220, 240] });
  add('swfc', 'main', 2295.4, { z: 0, wide: 6, scale: 0.66, winOn: (t, w) => (hash(w * 5 + 2) < 0.4 ? 0 : 0.6), winCol: [210, 230, 255] });
  add('shtower', 'main', 2302.6, { z: 0, wide: 6, scale: 0.62, winOn: (t, w) => (hash(w * 7 + 3) < 0.45 ? 0 : 0.6), winCol: [200, 236, 230] });
  for (let a = 2274, i = 0; a < 2318; a += 3, i++) add('tower', 'mid', a, { v: [4, 5, 1, 4, 0, 5, 3][i % 7], scale: 0.5, winOn: (t, w) => (hash(w * 5 + i) < 0.55 ? 0 : 0.5) });
  [['cityA', 2283.6], ['cityB', 2285.8], ['cityKid', 2291.4], ['cityC', 2293.2], ['cityD', 2299], ['cityB', 2306.4]].forEach(([v, a], i) => add('person', 'main', a, { v, z: 2.4, scale: P2, flip: i % 2 === 1, screenAt: NOW + 0.3 + i * 0.25, pace: 4.2, move: v === 'cityA' ? (t) => clamp((t - 574) * 0.5, 0, 6) : undefined }));
  for (const a of [2279, 2296.4, 2310]) add('lamp', 'main', a, { v: 1, z: 1, lit: () => 1 });
  // the line through the karst, on piers, under its wire
  for (let a = 2312; a < 2352; a += 3.4) add('hsrpier', 'main', a, { z: 1 });
  add('fuxing', 'main', 2306, { z: 1.4, scale: 0.72, y: 96 * 1 - 2, ground: false, wide: 34, cars: 5, from: TR - 0.6, to: TR + 10, prof: () => 0, move: (t) => Math.max(0, t - TR + 0.5) * 6.8 });
  for (const [a, v, s] of [[2318, 1, 0.95], [2326, 4, 1.05], [2336, 2, 0.9], [2346, 0, 1]]) add('karst', 'far', a, { v, scale: s });
  for (const [a, v] of [[2322, 2], [2338, 0], [2348, 4]]) add('karst', 'mid', a, { v, scale: 0.5 });
  // Wenchang: the pad by the sea, a Long March 5
  add('lm5', 'main', GANTRY_A, { z: 1, popAt: LA - 2.6, loud: 1.4, launch: LA, wide: 6 });
  for (const a of [2350.6, 2362, 2365.4]) add('palm', 'main', a, { v: 1, z: 0.6, scale: 0.8 });
  grassRun(2312, 2370, 3.6, 'main', { skip: (a) => a > 2352 && a < 2360 });

  // ========== Breakthroughs ==========
  // the Three Gorges at sunrise: the dam across the river, the ship lift, the gates opening one by one
  const TG = ev('gorges');
  DAM.forEach((a, i) => add('damseg', 'main', a, { v: i === 5 ? 2 : i % 2, z: 1, scale: 1.15, wide: 4, spill: (t) => sramp(t, TG + 0.3 + Math.abs(i - 2.5) * 0.35, TG + 0.9 + Math.abs(i - 2.5) * 0.35) }));
  add('shiplift', 'main', 2411.6, { z: 0.8, scale: 0.9, rise: (t) => sramp(t, TG + 0.6, TG + 4.4) });
  for (const [a, v] of [[2417.6, 0], [2424, 1]]) add('uhv', 'main', a, { v, z: 0.4, scale: 0.8 });
  for (const [a, v, s] of [[2378, 1, 0.9], [2392, 3, 1.1], [2402, 0, 1], [2412, 4, 0.9]]) add('karst', 'far', a, { v, scale: s });
  for (const [a, v] of [[2382, 2], [2408, 0]]) add('karst', 'mid', a, { v, scale: 0.55 });
  ['engineer'].forEach((v) => add('person', 'main', 2415.4, { v, z: 2.2, scale: P2, flip: true, act: (t) => ({ head: -12, front: [-150, -10] }) }));
  // the sea bridge: piers, three towers, an island, and the road diving under the waves
  for (let a = DECK0 + 0.8; a < DECK1; a += 1.7) if (!PYL.some(([p]) => Math.abs(p - a) < 0.9)) add('seapier', 'main', a, { z: 1, over: true, ground: false, y: -6 });
  PYL.forEach(([a, v]) => add('hzpylon', 'main', a, { v, z: 1.2, over: true, ground: false, y: -6, scale: 0.9, popAt: ev('hzmb') - 0.4 + v * 0.5, loud: 1.4 }));
  add('hzisland', 'main', ISLE, { z: 1.5, over: true, ground: false, y: 2, scale: 0.85, winOn: () => 0 });
  for (let a = DECK0 - 2; a < TUBE1 + 4; a += 4.2) add('wave', 'main', a, { v: (R() * 4) | 0, z: 4, loud: 0.2, ground: false, y: -2 });
  for (let a = DECK0 - 4; a < TUBE1 + 6; a += 6) add('wave', 'front', a, { v: (R() * 4) | 0, scale: 1.6, ground: false, loud: 0.2 });
  // the canyon, and the highest bridge in the world across it
    for (const a of [CANYON - 8.4, CANYON + 8.4]) add('sbtower', 'main', a, { z: 1.4, popAt: ev('huajiang') - 0.6 + (a > CANYON ? 0.4 : 0), loud: 1.4 });
  for (const [a, v] of [[CANYON - 13, 0], [CANYON + 13, 1]]) add('pine', 'main', a, { v, z: 0.3, scale: 0.8 });
  for (const [a, v, s] of [[CANYON - 6, 2, 0.8], [CANYON + 4, 0, 0.9], [CANYON + 12, 3, 0.8]]) add('karst', 'far', a, { v, scale: s });
  // Hefei: the artificial sun, the people who run it, the clock
  add('tokamak', 'main', TOK, { z: 0.8, scale: 0.8, wide: 14, popAt: ev('tokamak') - 1.2, loud: 2.4, plasma: (t) => sramp(t, ev('plasma'), ev('plasma') + 1.4) * (1 - sramp(t, 661, 663)) });
  add('controldesk', 'main', TOK - 12.4, { z: 1.6, scale: 1.1, plasma: (t) => sramp(t, ev('plasma'), ev('plasma') + 1.4), clock: (t) => clamp((t - ev('seventeen')) / 4) * 1066 });
  [['physicist', TOK - 15.8, false], ['physicist2', TOK - 9.6, true]].forEach(([v, a, f]) => add('person', 'main', a, { v, z: 2, scale: P2, flip: f, act: (t) => (t > ev('plasma') && t < ev('plasma') + 3 ? { head: -12, front: [-150, -10] } : { head: 10, front: [-40, -50] }) }));
  // quantum: two observatories a world apart, the satellite between them; the golden machine; the supercomputers
  QS.forEach((a, i) => add('qstation', 'main', a, { z: 1, scale: 1.1, aim: (t) => 50 + sramp(t, ev('quantum') - 1, ev('quantum')) * (i ? -10 : 18) + (i ? 70 : 0) }));
  add('supercomp', 'main', 2533, { z: 0.9, scale: 0.9, popAt: ev('qcomputer') - 0.3, loud: 1 });
  [['physicist', 2529.6, false]].forEach(([v, a, f]) => add('person', 'main', a, { v, z: 2, scale: P2, flip: f, act: (t) => ({ head: -24, lean: -4 }) }));
  // robots: the New Year stage, then the half-marathon
  add('galastage', 'main', STAGE, { z: 0.4, scale: 0.85, wide: 12, popAt: ev('robots') - 1.2, loud: 1.6 });
  for (let i = 0; i < 5; i++) add('humanoid', 'main', STAGE - 7.2 + i * 3.6, { v: i % 2, z: 1 + i * 0.01, scale: 1.25, y: 30 * 0.85, popAt: ev('robots') - 0.6 + i * 0.12, loud: 0.8, ph: i * 0.15, dance: (t) => sramp(t, ev('robots'), ev('robots') + 0.6) });
  add('finisharch', 'main', 2581, { z: 0.6, scale: 1.1 });
  const RUN = ev('marathon');
  [[2563, 0, 'humanoid'], [2566.4, 1, 'humanoid'], [2569.6, 0, 'humanoid']].forEach(([a, v, k], i) => add(k, 'main', a, { v, z: 2 + i * 0.1, scale: 1.2, popAt: RUN - 1.2 + i * 0.2, ph: i * 1.3, run: (t) => (i === 1 && t > RUN + 1.6 && t < RUN + 3.2 ? 0 : 1), fall: i === 1 ? (t) => sramp(t, RUN + 1.6, RUN + 2.0) * (1 - sramp(t, RUN + 2.6, RUN + 3.2)) : undefined, move: (t) => Math.max(0, t - RUN + 1) * 1.6 - (i === 1 ? clamp(t - RUN - 1.6, 0, 1.6) * 1.6 : 0) }));
  add('person', 'main', 2561, { v: 'runner', z: 2.3, scale: P2, popAt: RUN - 0.8, pace: 9, move: (t) => Math.max(0, t - RUN + 0.6) * 1.7 });
  for (const a of [2560, 2576]) add('lamp', 'main', a, { v: 1, z: 0.5, lit: () => 1 });
  // the dark factory
  const DF = ev('factory');
  // the hall is lit while the robots are introduced; then, lamp by lamp, the lights go off and the machines carry on
  const LOFF = 690.4, lamp = (t, i) => sramp(t, 681, 682) * (1 - sramp(t, LOFF + i * 0.22, LOFF + 0.08 + i * 0.22));
  add('factoryhall', 'main', FACT, { z: 0, scale: 0.95, wide: 16, lamp });
  [2593, 2600, 2607].forEach((a, i) => add('robotarm', 'main', a, { z: 1, scale: 1.25, flip: i % 2 === 1, ph: i * 1.7, popAt: DF - 0.8 + i * 0.25, loud: 1 }));
  for (let i = 0; i < 4; i++) add('carbody', 'main', 2588 + i * 6, { v: i % 2, z: 1.1, scale: 0.7, move: (t) => ((t - 680) * 0.9) % 24 });
  add('agv', 'main', 2596, { z: 2, scale: 1, move: (t) => Math.sin((t - 680) * 0.5) * 6 });
  for (let a = 2588, i = 0; a < 2618; a += 2.2, i++) add('robotarm', 'mid', a, { scale: 0.62, ph: i * 0.9, popAt: ev('robotsMany') + i * 0.08, foldAt: ev('coal') - 2.4 + i * 0.05, loud: 0.3 });
  for (let a = 2586, i = 0; a < 2620; a += 1.7, i++) add('robotarm', 'far', a, { scale: 0.5, ph: i * 1.3, popAt: ev('robotsMany') + 0.4 + i * 0.05, foldAt: ev('coal') - 2.2 + i * 0.04, loud: 0.2 });
  // coal and steam; then sun and wind across the desert
  const COAL = ev('coal'), SOL = ev('solar');
  for (const [a, L, s] of [[2622, 'mid', 0.6], [2627, 'main', 0.9], [2633, 'main', 0.8]]) add('coolingtower', L, a, { z: 0.5, scale: s, popAt: COAL - 0.6 + (a - 2622) * 0.04 });
  add('stack', 'main', 2638.4, { z: 0.4, popAt: COAL - 0.2, loud: 1.2 }); add('stack', 'mid', 2630, { scale: 0.6, popAt: COAL });
  for (let a = 2643, i = 0; a < 2662; a += 3, i++) add('solar', 'main', a, { z: 1, scale: 1.15, popAt: SOL + i * 0.12, loud: 0.6 });
  for (let a = 2641, i = 0; a < 2666; a += 2.2, i++) add('solar', 'mid', a, { scale: 0.72, popAt: SOL + 0.3 + i * 0.07, loud: 0.3 });
  for (const [a, sp, sc, i] of [[2646, 0.6, 0.9, 0], [2652, 0.75, 0.8, 1], [2658, 0.5, 0.95, 2], [2664, 0.7, 0.85, 3]]) add('turbine', 'mid', a, { speed: sp, scale: sc, popAt: SOL + 0.6 + i * 0.25, loud: 0.6 });
  add('uhv', 'main', 2662, { v: 0, z: 0.6, scale: 0.8, popAt: SOL + 1 });
  add('car', 'main', 2638, { z: 3, scale: 0.9, from: SOL - 1, move: (t) => (t - SOL) * 2.6, lit: () => 0 });
  // trees against the desert, row after row; and a panda, unbothered
  const TREE = ev('trees');
  for (let a = 2668, i = 0; a < 2690; a += 2.4, i++) add('poplar', 'main', a, { v: i % 3, z: 1, popAt: TREE + i * 0.16, loud: 0.5 });
  for (let a = 2666, i = 0; a < 2694; a += 1.8, i++) add('poplar', 'mid', a, { v: i % 3, scale: 0.6, popAt: TREE + 0.3 + i * 0.1, loud: 0.3 });
  for (let a = 2664, i = 0; a < 2698; a += 1.4, i++) add('poplar', 'far', a, { v: i % 3, scale: 0.5, popAt: TREE + 0.6 + i * 0.07, loud: 0.2 });
  add('person', 'main', 2676.6, { v: 'planter', z: 2, scale: P2, popAt: TREE + 0.4, act: (t) => { const k = Math.max(0, Math.sin(t * 3)); return { lean: 14 + k * 12, front: [-60 + k * 40, -30], back: [-50 + k * 40, -30] }; } });
  add('bamboo', 'main', 2690.6, { v: 1, z: 0 });
  add('panda', 'main', 2689, { z: 1.6, scale: 1.1 });
  grassRun(2370, 2388, 3.6, 'main');
  grassRun(2462, 2486, 3.6, 'main', { skip: (a) => Math.abs(a - CANYON) < 10.5 });
  grassRun(2486, 2618, 3.8, 'main', { skip: (a) => (a > 2486 && a < 2516) || (a > 2546 && a < 2616) });
  grassRun(2370, 2694, 7, 'front', { s: 2, skip: (a) => (a > DECK0 - 4 && a < TUBE1 + 6) || Math.abs(a - CANYON) < 9 });
}

// ============================================== the modern era, made spectacular ===
// A drone light show over Shanghai: lights rise off the river front and become a flying dragon.
const DRAGON = (() => {
  const pts = [], add = (seg, n, kind) => { let L = 0; const d = []; for (let i = 1; i < seg.length; i++) { L += Math.hypot(seg[i][0] - seg[i - 1][0], seg[i][1] - seg[i - 1][1]); d.push(L); } for (let j = 0; j < n; j++) { const want = (j / Math.max(1, n - 1)) * L; let i = 0; while (i < d.length - 1 && d[i] < want) i++; const l0 = i ? d[i - 1] : 0, f = (want - l0) / Math.max(1e-6, d[i] - l0); pts.push({ kind, x: lerp(seg[i][0], seg[i + 1][0], f), y: lerp(seg[i][1], seg[i + 1][1], f) }); } };
  for (const side of [-1, -0.33, 0.33, 1]) for (let i = 0; i < 86; i++) pts.push({ kind: 'body', s: i / 85, side });
  for (let i = 0; i < 22; i++) pts.push({ kind: 'fin', s: 0.08 + i * 0.04 });
  for (const ls of [0.22, 0.36, 0.62, 0.76]) for (let j = 0; j < 6; j++) pts.push({ kind: 'leg', s: ls, j });
  add([[0, -0.05], [0.06, -0.062], [0.12, -0.046], [0.17, -0.022], [0.15, 0.0], [0.11, 0.012], [0.16, 0.034], [0.12, 0.054], [0.05, 0.046], [0, 0.04], [0, -0.05]], 34, 'head');
  add([[0.02, -0.056], [-0.04, -0.1], [-0.08, -0.13]], 7, 'head'); add([[0.05, -0.06], [0.0, -0.11], [-0.02, -0.15]], 7, 'head');
  add([[0.16, 0.0], [0.22, 0.04], [0.29, 0.02], [0.33, -0.02]], 9, 'whisker'); add([[0.15, 0.034], [0.2, 0.09], [0.27, 0.1], [0.3, 0.07]], 9, 'whisker');
  pts.push({ kind: 'eye', x: 0.075, y: -0.026 });
  return pts;
})();
function droneShow(g, st, t) {
  const T0 = ev('today') - 0.2, T1 = T0 + 6.6; if (t < T0 || t > T1 + 1.2) return;
  const { W, H } = st, por = st.aspectK > 0.4 ? 0 : 1, S = Math.min(W * (por ? 0.92 : 0.46), H * 0.84), ox = W * 0.48, oy = H * (por ? 0.22 : 0.22);
  const form = smooth(clamp((t - T0 - 0.6) / 1.6)), leave = smooth(clamp((t - T1 + 0.6) / 1.4)), fade = 1 - sramp(t, T1 + 0.2, T1 + 1.2);
  const wv = (s) => 0.12 * Math.sin(s * Math.PI * 3.2 - t * 2.4) * (0.5 + 0.5 * s), bx = (s) => -0.62 + 1.12 * s, by = (s) => wv(s);
  const pd = st.pd || (st.pd = Math.max(2.2, Math.min(W, H) / 260));
  g.save(); g.globalCompositeOperation = 'lighter';
  const head = [bx(1), by(1)], hd = Math.atan2(by(1) - by(0.97), bx(1) - bx(0.97));
  DRAGON.forEach((d, i) => {
    let x, y, col = '255,206,110';
    if (d.kind === 'body') { const w = 0.036 * (0.25 + 0.75 * Math.sin(Math.min(1, d.s * 1.15) * Math.PI * 0.9)), n = Math.atan2(by(d.s + 0.01) - by(d.s), bx(d.s + 0.01) - bx(d.s)) + Math.PI / 2; x = bx(d.s) + Math.cos(n) * w * d.side; y = by(d.s) + Math.sin(n) * w * d.side; col = d.side > 0.5 ? '255,110,70' : d.side > 0 ? '255,160,80' : '255,210,120'; }
    else if (d.kind === 'fin') { const n = Math.atan2(by(d.s + 0.01) - by(d.s), bx(d.s + 0.01) - bx(d.s)) - Math.PI / 2, h = 0.05 + 0.02 * Math.sin(i * 1.7); x = bx(d.s) + Math.cos(n) * h; y = by(d.s) + Math.sin(n) * h; col = '255,90,70'; }
    else if (d.kind === 'leg') { const kick = Math.sin(t * 3 + d.s * 9) * 0.2; x = bx(d.s) + d.j * 0.006 + Math.sin(kick) * d.j * 0.01; y = by(d.s) + 0.04 + d.j * 0.012; col = '255,180,90'; }
    else { const c = Math.cos(hd), sn = Math.sin(hd); x = head[0] + d.x * c - d.y * sn; y = head[1] + d.x * sn + d.y * c; col = d.kind === 'whisker' ? '150,230,255' : d.kind === 'eye' ? '255,255,255' : '255,214,120'; }
    // before the dragon forms: a loose swarm rising off the river front
    const sx = (hash(i * 3.1) - 0.5) * 1.3, sy = 0.6 - hash(i * 7.7) * 0.5 - clamp((t - T0) * 0.4) * 0.3;
    const fx = lerp(sx, x, form) + leave * 0.9, fy = lerp(sy, y, form) - leave * 0.35;
    const tw = 0.75 + 0.25 * Math.sin(t * 6 + i);
    st.stamp(g, st.dot(...col.split(',').map(Number), '255,250,235'), ox + fx * S, oy + fy * S, pd * (d.kind === 'eye' ? 3 : 2.3), fade * tw * sramp(t, T0, T0 + 0.6));
  });
  g.restore();
}

// China's high-speed railways, drawn onto a paper map year by year from 2008.
const CHINA = [[134.7, 48.3], [131, 42.9], [128, 41.5], [124.4, 40], [121.2, 38.8], [119.6, 39.9], [117.8, 39.1], [118.5, 38], [119.2, 37.2], [122.6, 37.4], [120.3, 36], [119.2, 34.8], [120.9, 32], [121.9, 30.9], [121.5, 29.9], [121, 28], [119.6, 25.9], [118, 24.4], [116.5, 23.1], [114.2, 22.3], [113.3, 22.1], [111, 21.5], [110, 20.3], [109.6, 21.6], [108, 21.5], [106.7, 22.8], [105.3, 23.3], [103.6, 22.7], [101.7, 21.2], [99.3, 22.1], [98.7, 24.1], [97.6, 24.8], [98.6, 27.6], [97.4, 28.3], [95.4, 29], [92, 27.9], [89, 27.3], [86, 28], [82, 30.1], [79.4, 32.5], [78.7, 34.5], [77.8, 35.5], [74.9, 37.2], [73.6, 39.5], [75.6, 40.6], [80.2, 42.2], [80.8, 45], [82.5, 45.5], [83, 47.2], [85.6, 47.1], [87.3, 49.1], [90, 47.9], [91, 46], [95.5, 44.3], [96.4, 42.8], [100.8, 42.7], [105, 41.6], [110.4, 42.8], [111.9, 43.7], [114.5, 44.8], [116.7, 46.4], [117.4, 47.7], [115.6, 47.9], [116, 49.8], [119.5, 50.3], [120.8, 52.5], [123.5, 53.5], [126, 52.8], [127.5, 49.8], [130.6, 48.9], [132.5, 47.7]];
const HAINAN = [[110, 20], [111, 19.6], [110.6, 18.5], [109.5, 18.2], [108.6, 19], [109.2, 19.9]];
const HSR_LINES = [
  [2008, [[116.4, 39.9], [117.2, 39.1]]], [2009, [[114.3, 30.6], [113, 28.2], [113.3, 23.1]]], [2009, [[114.5, 38], [112.5, 37.9]]], [2010, [[113.6, 34.7], [108.9, 34.3]]], [2010, [[118.8, 32.1], [121.5, 31.2], [120.2, 30.3]]], [2010, [[110.3, 20], [110.5, 19.2], [109.5, 18.3]]],
  [2011, [[116.4, 39.9], [117, 36.7], [117.2, 34.3], [118.8, 32.1], [121.5, 31.2]]], [2011, [[113.3, 23.1], [114.1, 22.5]]], [2012, [[116.4, 39.9], [114.5, 38], [113.6, 34.7], [114.3, 30.6]]], [2012, [[116.4, 39.9], [119.6, 39.9], [123.4, 41.8], [125.3, 43.9], [126.6, 45.8]]],
  [2013, [[120.2, 30.3], [119.3, 26.1], [118.1, 24.5], [116.7, 23.4], [114.1, 22.5]]], [2014, [[103.8, 36.1], [101.8, 36.6], [98.3, 39.8], [93.5, 42.8], [87.6, 43.8]]], [2014, [[120.2, 30.3], [115.9, 28.7], [113, 28.2], [110, 27.6], [106.7, 26.6], [102.7, 25]]],
  [2014, [[106.7, 26.6], [110.3, 25.3], [113.3, 23.1]]], [2014, [[112.5, 37.9], [110.9, 35], [108.9, 34.3]]], [2015, [[117.3, 31.9], [118.3, 29.7], [119.3, 26.1]]], [2016, [[113.3, 23.1], [108.3, 22.8], [102.7, 25]]],
  [2016, [[121.5, 31.2], [118.8, 32.1], [117.3, 31.9], [114.3, 30.6], [111.3, 30.7], [106.5, 29.6], [104.1, 30.7]]], [2017, [[108.9, 34.3], [105.7, 34.6], [103.8, 36.1]]], [2017, [[108.9, 34.3], [107, 33.1], [104.1, 30.7]]],
  [2018, [[117, 36.7], [120.4, 36.1]]], [2019, [[116.4, 39.9], [114.9, 40.8], [111.7, 40.8]]], [2019, [[104.1, 30.7], [105.4, 28.9], [106.7, 26.6]]], [2022, [[113.6, 34.7], [111.5, 33], [109.5, 31], [106.5, 29.6]]], [2022, [[106.3, 38.5], [103.8, 36.1]]],
];
const HSR_KM = [[2008, 0.12], [2010, 8.4], [2012, 9.4], [2014, 16], [2016, 22], [2018, 29], [2020, 37.9], [2022, 42], [2024, 48], [2025, 50]];
function hsrMap(g, st, t) {
  const T0 = ev('hsr') + 1.6, T1 = ev('launch') - 1.6; if (t < T0 - 0.5 || t > T1 + 1.5) return;
  const { W, H } = st, por = st.aspectK > 0.4 ? 0 : 1, k = drop(t, T0, T1);
  const cw = Math.min(por ? W * 0.84 : W * 0.34, H * 0.62), ch = cw * 0.78, x = W * (por ? 0.5 : 0.74), y = H * lerp(-0.7, por ? 0.06 : 0.05, k) + ch * 0.5, sw = Math.sin(t * 0.6) * 1.2 * DEG;
  const yr = lerp(2008, 2025, smooth(clamp((t - T0 - 0.8) / 6.2)));
  g.save(); g.strokeStyle = 'rgba(200,190,175,0.32)'; g.lineWidth = 1; g.beginPath(); g.moveTo(x, 0); g.lineTo(x, y - ch / 2); g.stroke();
  g.translate(x, y); g.rotate(sw);
  // the card
  g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(-cw / 2 + 6, -ch / 2 + 8, cw, ch);
  g.fillStyle = '#efe6d2'; g.fillRect(-cw / 2, -ch / 2, cw, ch); g.strokeStyle = 'rgba(120,100,70,.5)'; g.lineWidth = 1.5; g.strokeRect(-cw / 2 + 5, -ch / 2 + 5, cw - 10, ch - 10);
  const mw = cw * 0.84, sc = mw / ((135 - 73) * 0.82), P = ([lo, la]) => [(lo - 104) * 0.82 * sc, -(la - 36) * sc + ch * 0.06];
  const poly = (pts) => { g.beginPath(); pts.forEach((p, i) => { const [px, py] = P(p); i ? g.lineTo(px, py) : g.moveTo(px, py); }); g.closePath(); };
  g.fillStyle = '#ddd0b0'; g.strokeStyle = 'rgba(110,90,60,.8)'; g.lineWidth = 1.4; poly(CHINA); g.fill(); g.stroke(); poly(HAINAN); g.fill(); g.stroke();
  // the lines, each drawn on in the year it opened
  g.lineCap = 'round'; g.lineJoin = 'round';
  for (const [Y, pts] of HSR_LINES) {
    const f = clamp((yr - Y) / 1.2); if (f <= 0) continue;
    const seg = pts.map(P); let L = 0; const d = [0]; for (let i = 1; i < seg.length; i++) { L += Math.hypot(seg[i][0] - seg[i - 1][0], seg[i][1] - seg[i - 1][1]); d.push(L); }
    const want = L * f, path = [seg[0]]; for (let i = 1; i < seg.length; i++) { if (d[i] <= want) path.push(seg[i]); else { const q = (want - d[i - 1]) / (d[i] - d[i - 1]); path.push([lerp(seg[i - 1][0], seg[i][0], q), lerp(seg[i - 1][1], seg[i][1], q)]); break; } }
    const stroke = (w, c) => { g.strokeStyle = c; g.lineWidth = w; g.beginPath(); path.forEach(([px, py], i) => (i ? g.lineTo(px, py) : g.moveTo(px, py))); g.stroke(); };
    stroke(Math.max(3, cw * 0.012), 'rgba(200,40,36,.95)');
    if (f < 1) { const [hx, hy] = path[path.length - 1]; g.save(); g.globalCompositeOperation = 'lighter'; st.stamp(g, st.dot(255, 160, 100, '255,240,210'), hx, hy, cw * 0.03, 0.9); g.restore(); }
  }
  for (const c of [[116.4, 39.9], [121.5, 31.2], [113.3, 23.1], [104.1, 30.7], [87.6, 43.8], [126.6, 45.8], [102.7, 25], [108.9, 34.3], [114.3, 30.6]]) { const [px, py] = P(c); g.fillStyle = '#3a2a20'; g.beginPath(); g.arc(px, py, Math.max(1.8, cw * 0.007), 0, 7); g.fill(); }
  // the year, and the kilometres
  let km = HSR_KM[0][1]; for (let i = 1; i < HSR_KM.length; i++) if (yr >= HSR_KM[i - 1][0]) km = lerp(HSR_KM[i - 1][1], HSR_KM[i][1], clamp((yr - HSR_KM[i - 1][0]) / (HSR_KM[i][0] - HSR_KM[i - 1][0])));
  g.fillStyle = '#3a2a20'; g.textAlign = 'left'; g.textBaseline = 'alphabetic';
  g.font = `400 ${Math.round(cw * 0.085)}px Fraunces, Georgia, serif`; g.fillText(String(Math.floor(yr)), -cw / 2 + cw * 0.06, ch / 2 - cw * 0.06);
  g.fillStyle = '#a8282a'; g.font = `400 ${Math.round(cw * 0.05)}px Fraunces, Georgia, serif`; g.textAlign = 'right';
  g.fillText(`${(Math.round(km * 10) * 100).toLocaleString('en-US')} km`, cw / 2 - cw * 0.06, ch / 2 - cw * 0.06);
  g.restore();
}

// The Three Gorges: spray thrown up where the spillways hit the river, and a rainbow standing in it.
function damSpray(g, st, t) {
  const TG = ev('gorges'); if (t < TG || t > 625) return;
  const u = st.eu, k = sramp(t, TG + 0.6, TG + 2.4) * (1 - sramp(t, 622.5, 624.5));
  g.save();
  for (let i = 0; i < 54; i++) {
    const ph = (t * 0.2 + hash(i * 3.3)) % 1, a = DAM[0] + 0.6 + hash(i * 5.1) * (DAM[5] - DAM[0]) + ph * 4, [x, y] = st.place('main', a, 4 + ph * 120 + hash(i) * 24, t);
    st.stamp(g, st.dot(246, 249, 252), x, y, (18 + ph * 46) * u, 0.55 * k * (1 - ph) * Math.min(1, ph * 6));
  }
  // a rainbow standing in the spray at the foot of the spillways
  const rk = k * sramp(t, TG + 1.6, TG + 3.2); if (rk > 0.01) {
    const [x, y] = st.place('main', (DAM[1] + DAM[4]) / 2, -40, t), R0 = 170 * u, cols = ['255,70,70', '255,150,60', '255,230,80', '90,210,110', '80,150,255', '140,100,230'];
    g.globalCompositeOperation = 'screen'; g.lineCap = 'butt';
    cols.forEach((c, i) => { g.strokeStyle = `rgba(${c},${0.42 * rk})`; g.lineWidth = 5.5 * u; g.beginPath(); g.arc(x, y, R0 - i * 5.2 * u, Math.PI * 1.12, Math.PI * 1.88); g.stroke(); });
  }
  g.restore();
}

// Wenchang: the Long March 5 leaves in a great cloud of steam and exhaust, lit from beneath.
function launchCloud(g, st, t) {
  const LA = ev('launch'); if (t < LA - 0.2 || t > LA + 7) return;
  const u = st.eu, age = t - LA, k = sramp(t, LA - 0.1, LA + 0.4) * (1 - sramp(t, LA + 5, LA + 7));
  g.save();
  const puffs = st.fx.steam;
  for (let i = 0; i < 56; i++) {
    const side = i % 2 ? 1 : -1, sp = 0.5 + hash(i * 2.7) * 0.9, born = (i % 7) * 0.12, ag = Math.max(0, age - born); if (ag <= 0) continue;
    const grow = 1 - Math.exp(-ag * sp * 1.3), a = GANTRY_A + side * grow * (1.5 + hash(i) * 8.5), h = 6 + grow * (10 + hash(i * 9) * 60) + ag * 6;
    const [x, y, rel] = st.place('main', a, h, t), sc = (0.9 + grow * 2.4 + hash(i * 4) * 0.9) * u, hot = Math.exp(-ag * 1.1);
    g.save(); g.translate(x, y); g.rotate(rel + hash(i * 6) * 6 + ag * 0.2 * side); g.scale(sc, sc); g.globalAlpha = Math.min(1, 0.95 * k * Math.min(1, ag * 4)); put(g, puffs[i % 4], 0); g.restore();
    if (hot > 0.05) { g.globalCompositeOperation = 'lighter'; st.stamp(g, st.dot(255, 150, 70, '255,210,150'), x, y + 8 * sc, 30 * sc, 0.55 * hot * k); g.globalCompositeOperation = 'source-over'; }
  }
  g.globalAlpha = 1; g.restore();
}

// The New Year gala: sweeping spotlights and a shower of red and gold paper.
function galaFx(g, st, t) {
  const R0 = ev('robots'); if (t < R0 - 0.5 || t > R0 + 8) return;
  const u = st.eu, k = sramp(t, R0 - 0.2, R0 + 0.6) * (1 - sramp(t, R0 + 6.5, R0 + 8));
  g.save(); g.globalCompositeOperation = 'screen';
  for (let i = 0; i < 4; i++) {
    const [sx, sy] = st.place('main', STAGE + (i - 1.5) * 5.4, 300, t), ang = Math.PI / 2 + Math.sin(t * (0.9 + i * 0.2) + i * 1.7) * 0.42, L = 380 * u, w = 0.13;
    const gr = g.createLinearGradient(sx, sy, sx + Math.cos(ang) * L, sy + Math.sin(ang) * L); gr.addColorStop(0, `rgba(255,236,200,${0.34 * k})`); gr.addColorStop(1, 'rgba(255,220,180,0)');
    g.fillStyle = gr; g.beginPath(); g.moveTo(sx, sy); g.lineTo(sx + Math.cos(ang - w) * L, sy + Math.sin(ang - w) * L); g.lineTo(sx + Math.cos(ang + w) * L, sy + Math.sin(ang + w) * L); g.closePath(); g.fill();
  }
  g.globalCompositeOperation = 'source-over';
  const pu = Math.max(u, Math.min(st.W, st.H) / 820);
  for (let i = 0; i < 70; i++) {
    const ph = ((t - R0) * (0.16 + hash(i * 3) * 0.12) + hash(i * 7)) % 1, a = STAGE - 9 + hash(i * 5) * 18 + Math.sin(t * 2 + i) * 0.4, [x, y] = st.place('main', a, 380 - ph * 380, t);
    g.save(); g.translate(x, y); g.rotate(t * (3 + hash(i) * 4) + i); g.scale(1, Math.abs(Math.sin(t * 5 + i)) * 0.8 + 0.2); g.globalAlpha = k * Math.min(1, (1 - ph) * 5);
    g.fillStyle = ['#d8282a', '#f0c040', '#e8462a', '#ffd870'][i % 4]; g.fillRect(-3 * pu, -2 * pu, 6 * pu, 4 * pu); g.restore();
  }
  g.restore();
}

// Light reaches the farthest villages: a wave of tiny windows spreading over the dark hills from the one we saw lit.
function landLights(g, st, t) {
  const ALL = ev('allLit'); if (t < ALL - 0.5 || t > 575) return;
  const k = 1 - sramp(t, 572.5, 575), u = st.eu, pu = Math.max(u, Math.min(st.W, st.H) / 900);
  g.save(); g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 264; i++) {
    // forty-four hamlets of six windows each, on the far and middle ground
    const v = Math.floor(i / 6), layer = v % 3 ? 'far' : 'mid', a = 2150 + hash(v * 1.37) * 170 + (hash(i * 2.9) - 0.5) * (layer === 'far' ? 2.2 : 1.4), h = (layer === 'far' ? 4 + hash(v * 4.1) * 26 : 3 + hash(v * 4.1) * 10) + hash(i * 5.3) * 7;
    const on = sramp(t, ALL + Math.abs(a - 2230) * 0.035 + hash(v * 9) * 0.6 + hash(i) * 0.3, ALL + 0.25 + Math.abs(a - 2230) * 0.035 + hash(v * 9) * 0.6 + hash(i) * 0.3); if (on < 0.01) continue;
    const [x, y] = st.place(layer, a, h, t); if (x < -20 || x > st.W + 20) continue;
    const tw = 0.7 + 0.3 * Math.sin(t * (1.5 + hash(i) * 2) + i);
    st.stamp(g, st.dot(255, 196, 120, '255,236,190'), x, y, (layer === 'far' ? 2.6 : 3.6) * pu, on * tw * k);
  }
  g.restore();
}

// Chinese white dolphins (pink, in fact) leaping beside the sea bridge whose pylons are shaped like them.
function dolphins(g, st, t) {
  const T0 = ev('hzmb') + 1.2; if (t < T0 || t > 633) return;
  const pu = Math.max(st.eu, Math.min(st.W, st.H) / 820), k = sramp(t, T0, T0 + 0.5) * (1 - sramp(t, 631, 633));
  for (let i = 0; i < 3; i++) {
    const per = 2.9 + i * 0.4, ph = ((t - T0) / per + i * 0.37) % 1, j = clamp(ph / 0.42); if (ph > 0.6) continue;
    const a0 = 2426 + i * 5.2 + Math.floor((t - T0) / per + i * 0.37) * 0.7, a = a0 + j * 2.4, h = -10 + Math.sin(j * Math.PI) * 40, [x, y, rel] = st.place('front', a, h, t);
    const [x2, y2] = st.place('front', a0 + Math.min(1, j + 0.02) * 2.4, -10 + Math.sin(Math.min(1, j + 0.02) * Math.PI) * 40, t), ang = Math.atan2(y2 - y, x2 - x);
    if (j > 0 && j < 1) {
      g.save(); g.translate(x, y); g.rotate(ang); g.scale(pu * 1.6, pu * 1.6); g.globalAlpha = k;
      g.fillStyle = '#f0c2c4'; g.strokeStyle = 'rgba(150,90,96,.7)'; g.lineWidth = 0.8;
      g.beginPath(); [[-22, 0], [-10, -6], [8, -7], [18, -4], [25, -1], [18, 1.5], [8, 5], [-10, 5], [-22, 2]].forEach(([px, py], n) => (n ? g.lineTo(px, py) : g.moveTo(px, py))); g.closePath(); g.fill(); g.stroke();
      g.beginPath(); g.moveTo(1, -6.5); g.lineTo(-6, -14); g.lineTo(-8, -6); g.closePath(); g.fill(); g.stroke();
      g.beginPath(); g.moveTo(-21, 1); g.lineTo(-30, -6); g.lineTo(-27, 1); g.lineTo(-30, 7); g.closePath(); g.fill(); g.stroke();
      g.fillStyle = 'rgba(255,255,255,.55)'; g.beginPath(); g.ellipse(4, -3.5, 10, 1.6, 0, 0, 7); g.fill(); g.fillStyle = '#2a1c1e'; g.beginPath(); g.arc(17, -2.6, 0.9, 0, 7); g.fill();
      g.restore();
    }
    // splashes where it leaves and re-enters the water
    for (const [sa, s0] of [[a0, 0], [a0 + 2.4, 0.42]]) { const sk = clamp(1 - Math.abs(ph - s0) / 0.1); if (sk <= 0) continue; for (let n = 0; n < 6; n++) { const [sx, sy] = st.place('front', sa + (n - 2.5) * 0.12, -8 + sk * (6 + hash(n + i) * 10), t); g.fillStyle = `rgba(245,250,255,${0.85 * sk * k})`; g.beginPath(); g.arc(sx, sy, 1.6 * pu, 0, 7); g.fill(); } }
  }
  g.globalAlpha = 1;
}
// sun glinting off the solar fields
function solarGlints(g, st, t) {
  const S0 = ev('solar'); if (t < S0 + 0.8 || t > 709) return;
  const pu = Math.max(st.eu, Math.min(st.W, st.H) / 820), k = sramp(t, S0 + 0.8, S0 + 1.6) * (1 - sramp(t, 707, 709));
  g.save(); g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 7; i++) {
    const f = Math.max(0, Math.sin(t * 1.6 + i * 2.3)) ** 14; if (f < 0.02) continue;
    const [x, y] = st.place('main', 2643.6 + i * 3, 34, t), r = 14 * pu * f;
    g.strokeStyle = `rgba(255,250,225,${0.9 * f * k})`; g.lineWidth = Math.max(1, pu); g.beginPath(); g.moveTo(x - r, y); g.lineTo(x + r, y); g.moveTo(x, y - r); g.lineTo(x, y + r); g.stroke();
    st.stamp(g, st.dot(255, 240, 200, '255,255,240'), x, y, r * 0.6, 0.8 * f * k);
  }
  g.restore();
}

hook({
  sky(g, st, t) { droneShow(g, st, t); const mk = sramp(t, 563, 566) * (1 - sramp(t, 572, 575)); if (mk > 0.01) milkyWay(g, st, t, mk * 0.55, 0); },
  over(g, st, t, S) { landLights(g, st, t); hsrMap(g, st, t); damSpray(g, st, t); launchCloud(g, st, t); dolphins(g, st, t); galaFx(g, st, t); solarGlints(g, st, t); },
});

// ======================================================= 15. The long thread ===
const THREAD_END = 2695;
{
  for (let a = 2700, i = 0; a < 2800; a += 4.5 + R() * 5, i++) { const tilt = (R() - 0.5) * 7; add('blank', 'main', a, { v: (R() * 5) | 0, z: R() < 0.5 ? 0 : 2, scale: 0.7 + R() * 0.7, loud: 0.9, rot: () => tilt }); }
  for (let a = 2698; a < 2810; a += 7) add('blank', 'mid', a, { v: (R() * 5) | 0, scale: 0.55 });
  for (let a = 2800, i = 0; a < 2920; a += 3.6 + R() * 4.2, i++) { const tilt = (R() - 0.5) * 8; add('blank', 'main', a, { v: (R() * 5) | 0, z: R() < 0.5 ? 0 : 2, scale: 0.55 + R() * 0.75, popAt: ev('pull', 718.6) + 4.5 + (a - 2800) * 0.035 + R() * 0.3, loud: 0.25, rot: () => tilt }); }
  for (let a = 2810; a < 2920; a += 8) add('blank', 'mid', a, { v: (R() * 5) | 0, scale: 0.5, popAt: ev('pull', 718.6) + 5 + (a - 2810) * 0.035 });
  for (let a = 2704; a < 2810; a += 14) add('blank', 'far', a, { v: (R() * 5) | 0, scale: 0.3 });
}
hook({
  lights(t, c, L, Em, Sm, st) {
    if (t > 573 && t < 609 && near(2294, c, 80)) { for (const a of [2279, 2296.4, 2310]) L.push({ a, h: 120, r: 300, k: 0.75, color: [235, 240, 255] }); L.push({ a: 2288, h: 200, r: 600, k: 0.5, color: [255, 180, 220] }); L.push({ a: 2302, h: 300, r: 700, k: 0.35, color: [180, 230, 230] }); }
    if (t > ev('hsr') - 1 && t < ev('hsr') + 10) L.push({ a: 2306 + Math.max(0, t - ev('hsr') + 0.5) * 6.8 + 6, h: 100, r: 460, k: 0.8, color: [255, 240, 210] });
    const LA = ev('launch'); if (t > LA - 0.4 && t < LA + 4) { L.push({ a: GANTRY_A, h: 30 + Math.max(0, t - LA) ** 2 * 70, r: 1100, k: 1.6 * Math.exp(-Math.max(0, t - LA) * 0.6), color: [255, 200, 130] }); for (let k = 0; k < 3; k++) Sm.push({ a: GANTRY_A + (k - 1) * 3, h: 6, t0: LA - 0.2, t1: LA + 2.5, size: 2.4, life: 5, every: 0.12, rise: 70, drift: (k - 1) * 8, alpha: 0.85 }); }
    // the tokamak's glow on everything around it; the dark factory's arc-lights; the stage
    if (near(TOK, c, 50) && t > ev('plasma')) L.push({ a: TOK, h: 140, r: 900, k: 0.9 * sramp(t, ev('plasma'), ev('plasma') + 1.4) * (1 - sramp(t, 661, 663)), color: [230, 130, 255] });
    if (near(STAGE, c, 50) && t > 672) L.push({ a: STAGE, h: 160, r: 800, k: 0.8, color: [255, 200, 160] });
    if (near(FACT, c, 50) && t > 681 && t < 692.5) for (let i = 0; i < 8; i += 2) { const k = sramp(t, 681, 682) * (1 - sramp(t, 690.4 + i * 0.22, 690.48 + i * 0.22)); if (k > 0.01) L.push({ a: FACT + (-196 + i * 56 + 28) * 0.95 / 17.45, h: 120, r: 520, k: 0.85 * k, color: [255, 236, 205] }); }
    if (near(FACT, c, 50) && t > 681) for (let i = 0; i < 3; i++) { const a = [2593, 2600, 2607][i], w = Math.sin(t * 1.3 + i * 1.7) < -0.35; if (w) L.push({ a: a + 4, h: 120, r: 380, k: 0.9, color: [170, 210, 255] }); }
    if (near(2627, c, 60) && t > ev('coal') - 1) for (const [a, L2, h] of [[2622, 'mid', 120], [2627, 'main', 170], [2633, 'main', 150]]) Sm.push({ a, layer: L2, h, t0: ev('coal') - 1, size: 1.6, life: 6, every: 0.45, rise: 200, drift: 5, alpha: 0.5 });
    if (near(2634, c, 60) && t > ev('coal') - 0.4) for (const [a, L2, h, sz] of [[2638.4, 'main', 344, 0.9], [2630, 'mid', 206, 0.6]]) Sm.push({ a, layer: L2, h, t0: ev('coal') - 0.4, size: sz, life: 5, every: 0.35, rise: 160, drift: 6, alpha: 0.55 });
  },
  ground(g, st, t, S, G) {
    const radC = (a, R0) => { const rel = (a - G.c) * DEG; return [Math.sin(rel) * R0, -Math.cos(rel) * R0]; };
    const line = (pts, w, col, dash, off) => { g.save(); g.strokeStyle = col; g.lineWidth = w; if (dash) { g.setLineDash(dash); g.lineDashOffset = off || 0; } g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke(); g.restore(); };
    // ---- the Three Gorges: the reservoir high behind the dam, the river churning out below it, power leaving along the lines
    if (near(2398, G.c, 60)) {
      // the reservoir, held up behind the dam: a lake standing high above the valley floor
      G.run(2373, DAM[0] - 1.6, (a0, a1) => { const top = [], bot = []; for (let a = a0; a <= a1 + 0.001; a += 0.3) { const e = sramp(a, 2373, 2376.5); top.push(G.rad(a, 4 + 150 * e)); bot.push(G.rad(a, -8)); }
        g.save(); const gr = g.createLinearGradient(0, top[top.length - 1][1], 0, bot[0][1]); gr.addColorStop(0, 'rgba(80,130,150,.95)'); gr.addColorStop(1, 'rgba(40,80,100,.95)'); g.fillStyle = gr; g.beginPath(); top.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); for (let i = bot.length - 1; i >= 0; i--) g.lineTo(bot[i][0], bot[i][1]); g.closePath(); g.fill(); g.restore();
        line(top, 2.4, 'rgba(220,240,250,.8)'); line(top.map(([x, y]) => [x, y + 10]), 1.2, 'rgba(220,240,250,.4)', [10, 16], -t * 6); });
      G.river(DAM[0] - 2, 2418, -6, 16, 'rgba(70,110,120,.95)', 'rgba(240,250,250,.7)');
      const TG = ev('gorges'); if (t > TG) { const k = sramp(t, TG + 0.6, TG + 2); for (let i = 0; i < 18; i++) { const a = DAM[1] + hash(i) * 12, ph = ((t * 0.7 + hash(i * 3)) % 1), [x, y] = G.rad(a + ph * 6, -2 + Math.sin(ph * 6) * 3); g.fillStyle = `rgba(250,252,255,${0.6 * k * (1 - ph)})`; g.beginPath(); g.ellipse(x, y, 6 + ph * 8, 2.4, 0, 0, 7); g.fill(); } }
      const tipsA = [2417.6, 2424];
      for (const dy of [214, 264]) { const p0 = G.rad(tipsA[0], dy * 0.8 - 26), p1 = G.rad(tipsA[1], dy * 0.8 - 26), p2 = G.rad(2440, dy * 0.8 - 40); g.strokeStyle = 'rgba(40,40,44,.7)'; g.lineWidth = 0.9; g.beginPath(); g.moveTo(p0[0], p0[1]); g.quadraticCurveTo((p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2 + 14, p1[0], p1[1]); g.quadraticCurveTo((p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2 + 18, p2[0], p2[1]); g.stroke(); }
    }
    // ---- the sea bridge: the deck on its piers, the cables from each tower, the cars, the tunnel under the sea
    if (near(2436, G.c, 60)) {
      const DY = 1000 - 6 + 72 * 0.9, deck = []; for (let a = DECK0; a <= DECK1 + 0.01; a += 0.25) deck.push(radC(a, DY));
      line(deck, 7, 'rgba(200,196,188,1)'); line(deck.map(([x, y]) => [x * (DY + 3.5) / DY, y * (DY + 3.5) / DY]), 1.6, 'rgba(120,120,120,.9)');
      line(deck.map(([x, y]) => [x * (DY - 3) / DY, y * (DY - 3) / DY]), 1.2, 'rgba(90,90,94,.7)');
      for (const [a, v] of PYL) { const top = radC(a, 1000 - 6 + (v === 2 ? 270 : 252) * 0.9); g.strokeStyle = 'rgba(70,70,74,.6)'; g.lineWidth = 0.7; for (let k = 1; k <= 7; k++) for (const s of [-1, 1]) { const p = radC(a + s * k * 0.55, DY); g.beginPath(); g.moveTo(top[0], top[1]); g.lineTo(p[0], p[1]); g.stroke(); } }
      // the ramp down from the island into the sea, then the tube under the sea floor's water, lit inside
      const RAMP0 = ISLE + 1, ramp = []; for (let a = DECK1; a <= RAMP0 + 1.5; a += 0.25) { const f = (a - DECK1) / (RAMP0 + 1.5 - DECK1); ramp.push(radC(a, DY - smooth(f) * (DY - 1000 + 16))); }
      line(ramp, 6, 'rgba(190,186,178,1)');
      // cars on the deck, then down the ramp toward the island
      const path = [...deck, ...ramp]; const n = path.length;
      for (let i = 0; i < 9; i++) { const f = ((t * 0.06 + i / 9) % 1), j = Math.floor(f * (n - 1)), [x, y] = path[j], [x2, y2] = path[Math.min(n - 1, j + 1)], ang = Math.atan2(y2 - y, x2 - x); g.save(); g.translate(x, y); g.rotate(ang); g.fillStyle = ['#c8322a', '#e8e6e0', '#2a4a8a', '#3a3a40'][i % 4]; g.fillRect(-7, -9, 14, 5); g.fillStyle = 'rgba(255,240,200,.9)'; g.fillRect(6, -7, 2, 2); g.restore(); }
    }
    // ---- quantum: the robots' road, the factory's line
    if (near(2572, G.c, 50)) { G.run(2558, 2586, (a0, a1) => { G.arc(a0, a1, -8, 14, 'rgba(60,60,64,.85)'); G.arc(a0, a1, -8, 1.4, 'rgba(240,240,240,.7)', [10, 10]); }); }
    if (near(FACT, G.c, 50)) G.run(2586, 2620, (a0, a1) => { G.arc(a0, a1, 4, 3, 'rgba(70,72,80,.95)'); G.arc(a0, a1, -6, 10, 'rgba(40,42,48,.9)'); });
    // ---- green creeping out over the sand as the trees go in
    const TREE = ev('trees'), k = sramp(t, TREE, TREE + 5);
    if (k > 0) G.run(2666, 2694, (a0, a1) => { const e = lerp(2666, 2694, k); if (e > a0) G.arc(a0, Math.min(a1, e), -8, 14, 'rgba(96,130,70,.55)'); });
    // ---- the needle at the end of the thread
    if (near(THREAD_END, G.c, 60)) { const [x, y] = G.rad(THREAD_END + 0.4, -6), rel = (THREAD_END - G.c) * DEG; g.save(); g.translate(x, y); g.rotate(rel + 0.6); g.fillStyle = '#c8ccd2'; g.beginPath(); g.moveTo(-1.6, 0); g.lineTo(0, -62); g.lineTo(1.6, 0); g.lineTo(0, 10); g.closePath(); g.fill(); g.strokeStyle = 'rgba(60,64,70,.8)'; g.lineWidth = 0.8; g.stroke(); g.fillStyle = 'rgba(40,40,44,.9)'; g.beginPath(); g.ellipse(0, -54, 0.8, 3.4, 0, 0, 7); g.fill(); g.restore(); }
  },
  sky(g, st, t, S) {
    // the Micius satellite, high over the two observatories
    const Q = ev('quantum');
    if (t > Q - 1.5 && t < 676) { const k = drop(t, Q - 1.2, 674), por = st.aspectK > 0.4 ? 0 : 1; st.hang(g, st.fx.micius, st.W * 0.5, st.H * lerp(-0.2, por ? 0.14 : 0.12, k), por ? 0.9 : 1.2, Math.sin(t * 0.4) * 1.4 * DEG, 1, Math.sin(t * 0.3) * 0.08); }
  },
  over(g, st, t, S) {
    const { W, H } = st, u = st.eu, por = st.aspectK > 0.4 ? 0 : 1;
    // ---- far side of the Moon: Chang'e 4 and Yutu-2; then Chang'e 6 takes rock and lifts off
    const FS = ev('farside'), C6 = ev('change6'), OUT = ev('farsideOut');
    if (t > FS - 0.2 && t < OUT + 1.6) {
      const up = clamp(spring(t - FS, 5.0, 0.6), 0, 1.25), out = sramp(t, OUT, OUT + 1.3), veil = clamp(up) * (1 - out);
      g.fillStyle = `rgba(4,5,10,${0.78 * veil})`; g.fillRect(0, 0, W, H);
      g.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 110; i++) { const x = hash(i * 17 + 3) * W, y = hash(i * 29 + 7) * H * 0.62, tw = 0.6 + 0.4 * Math.sin(t * (1 + hash(i)) + i), rr = (0.8 + hash(i * 3) * 1.3) * st.dpr * 0.6; g.fillStyle = `rgba(230,236,255,${0.75 * veil * tw * (0.3 + hash(i * 5) * 0.7)})`; g.fillRect(x, y, rr, rr); }
      g.globalCompositeOperation = 'source-over';
      if (t > FS + 0.5) st.hang(g, st.fx.sat, W * 0.72, H * lerp(-0.2, 0.15, drop(t, FS + 0.6, OUT - 0.3)), 0.9, Math.sin(t * 0.4) * 2 * DEG, 1, Math.sin(t * 0.3) * 0.3);
      const base = por ? W * 1.5 / 470 : Math.max(W / 760, H * 0.95 / 470);
      const cx = W * 0.5 - (por ? 60 : 30) * base, cy = H * (por ? 0.64 : 0.68) + (1 - Math.min(1, up)) * H * 0.9 + out * H * 0.9;
      g.save(); g.translate(cx, cy); g.rotate((1 - Math.min(1, up)) * 0.2); g.scale(base, base);
      put(g, st.fx.lunar, 0.6, 8, 12);
      const ys = (x) => -40 + (x / 440) ** 2 * 70, land = FS + 1.4, lk = smooth(clamp((t - (land - 1.4)) / 1.4));
      const lx = 10, ly = ys(lx) + 2 - (1 - lk) * 760;
      g.strokeStyle = `rgba(210,205,195,${0.35 * (1 - out)})`; g.lineWidth = 0.8; g.beginPath(); g.moveTo(lx, ly - 80); g.lineTo(lx, -900); g.stroke();
      if (t < land + 0.2) { g.globalCompositeOperation = 'screen'; st.stamp(g, st.dot(255, 200, 140, '255,230,190'), lx, ly + 4, 40, 0.6 * clamp((land + 0.2 - t) * 3)); g.globalCompositeOperation = 'source-over'; }
      const rx = lx + 30 + clamp((t - land - 1) / 4) * 120;
      if (t > land + 0.8) { g.strokeStyle = 'rgba(70,66,62,.6)'; g.lineWidth = 2; for (const dy of [3, 7]) { g.beginPath(); for (let x = lx + 30; x <= rx; x += 4) { const y = ys(x) + dy; x === lx + 30 ? g.moveTo(x, y) : g.lineTo(x, y); } g.stroke(); } g.save(); g.translate(rx, ys(rx) + 4); g.scale(1.2, 1.2 * clamp(spring(t - land - 0.8, 9, 0.5), 0, 1.3)); put(g, st.fx.yutu, 0.4, 2, 3); g.restore(); }
      g.save(); g.translate(lx, ly); g.scale(1.25, 1.25); put(g, st.fx.c4, 0.5, 4, 6); g.restore();
      if (t > C6 - 0.6) {
        const kx = -200, k6 = smooth(clamp((t - (C6 - 0.6)) / 1.2)), ky = ys(kx) + 2 - (1 - k6) * 760;
        g.strokeStyle = `rgba(210,205,195,${0.35 * (1 - out)})`; g.lineWidth = 0.8; g.beginPath(); g.moveTo(kx, ky - 80); g.lineTo(kx, -900); g.stroke();
        g.save(); g.translate(kx, ky); g.scale(1.2, 1.2); put(g, st.fx.c4, 0.5, 4, 6);
        const arm = sramp(t, C6 + 0.8, C6 + 1.6) * (1 - sramp(t, C6 + 2.4, C6 + 3)); g.strokeStyle = '#8c8a86'; g.lineWidth = 2; g.beginPath(); g.moveTo(26, -30); g.lineTo(26 + arm * 22, -30 + arm * 26); g.stroke(); g.restore();
        const asc = t - (C6 + 3.2); if (asc > 0) { const ay = ky - 46 * 1.2 - asc * asc * 160; g.globalCompositeOperation = 'screen'; st.stamp(g, st.dot(255, 200, 140, '255,240,210'), kx, ay + 30, 30, Math.min(1, asc * 3)); g.globalCompositeOperation = 'source-over'; g.save(); g.translate(kx, ay); g.scale(1.2, 1.2); put(g, st.fx.ascender, 0.3, 2, 3); g.restore(); }
        else { g.save(); g.translate(kx, ky - 46 * 1.2); g.scale(1.2, 1.2); put(g, st.fx.ascender, 0.3, 2, 3); g.restore(); }
      }
      g.restore();
    }
    // ---- under the sea: the tunnel tube, lit inside, cars running through it
    if (near(ISLE, cam(t), 50)) {
      const A0 = ISLE + 2.6, pts = []; for (let a = A0; a <= TUBE1; a += 0.25) pts.push(st.place('main', a, -18 - Math.sin(((a - A0) / (TUBE1 - A0)) * Math.PI) * 30, t));
      const L = (w, c, dash, off) => { g.save(); g.strokeStyle = c; g.lineWidth = w * u; if (dash) { g.setLineDash(dash.map((d) => d * u)); g.lineDashOffset = off * u; } g.lineCap = 'round'; g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke(); g.restore(); };
      L(20, 'rgba(70,74,82,.95)'); L(14, 'rgba(26,28,34,1)'); L(2, 'rgba(255,220,150,.8)', [4, 6], -t * 40);
      // the sea over it, so the tube is seen down through the water
      const top = [], bot = []; for (let a = A0 - 1; a <= TUBE1 + 1; a += 0.3) { top.push(st.place('main', a, -3, t)); bot.push(st.place('main', a, -62, t)); }
      g.save(); g.fillStyle = 'rgba(44,90,120,.42)'; g.beginPath(); top.forEach(([px, py], i) => (i ? g.lineTo(px, py) : g.moveTo(px, py))); for (let i = bot.length - 1; i >= 0; i--) g.lineTo(bot[i][0], bot[i][1]); g.closePath(); g.fill(); g.restore();
      g.globalCompositeOperation = 'lighter'; for (let i = 0; i < 5; i++) { const f = ((t * 0.12 + i / 5) % 1), j = Math.floor(f * (pts.length - 1)), [x, y] = pts[j]; st.stamp(g, st.dot(255, 230, 180, '255,250,230'), x, y, 7 * u, 0.9); } g.globalCompositeOperation = 'source-over';
    }
    // ---- the canyon card, and the bridge drawn across it
    if (near(CANYON, cam(t), 45)) {
      const [x, y, rel] = st.place('main', CANYON, 0, t); g.save(); g.translate(x, y); g.rotate(rel); g.scale(u, u); put(g, st.fx.gorge, 0); g.restore();
      // a sea of cloud far down in the gorge, between its walls (drawn in the card's own units: 290 deep)
      const ck = sramp(t, 630.5, 632.5) * (1 - sramp(t, 642.5, 644.5));
      if (ck > 0.01) {
        g.save(); g.translate(x, y); g.rotate(rel); g.scale(u, u);
        const hz = g.createRadialGradient(0, 145, 0, 0, 145, 90); hz.addColorStop(0, `rgba(246,248,250,${0.55 * ck})`); hz.addColorStop(1, 'rgba(246,248,250,0)'); g.save(); g.scale(1, 0.45); g.fillStyle = hz; g.fillRect(-100, 230, 200, 200); g.restore();
        for (let i = 0; i < 16; i++) {
          const lay = i % 2, cx = ((hash(i * 3.7) * 130 + t * (5 + lay * 4)) % 130) - 65, cy = 122 + lay * 36 + hash(i * 2.2) * 26 + Math.sin(t * 0.6 + i) * 2.5, sc = 0.7 + hash(i * 5) * 0.5;
          g.save(); g.translate(cx, cy); g.scale(sc * 1.6, sc); g.globalAlpha = ck * (0.72 - lay * 0.16) * clamp(1 - (Math.abs(cx) - 54) / 20); put(g, st.fx.steam[i % 4], 0); g.restore();
        }
        g.restore(); g.globalAlpha = 1;
      }
      const H0 = ev('huajiang'), T0 = CANYON - 8.4, T1 = CANYON + 8.4, hk = sramp(t, H0 - 0.4, H0 + 1.4), mid = CANYON;
      const P = (a, h) => st.place('main', a, h, t), line = (pts, w, c) => { g.strokeStyle = c; g.lineWidth = w * u; g.beginPath(); pts.forEach(([px, py], i) => (i ? g.lineTo(px, py) : g.moveTo(px, py))); g.stroke(); };
      if (t > H0 - 0.6) {
        // the main cables, hung from the tower tops; the hangers; the deck growing out from both sides to meet
        const topH = 316, cab = []; for (let a = T0; a <= T1 + 0.01; a += 0.25) { const f = (a - T0) / (T1 - T0); cab.push(P(a, topH - Math.sin(f * Math.PI) * 286)); }
        g.save(); g.lineCap = 'round'; line(cab, 2.2, 'rgba(50,50,56,.95)');
        g.strokeStyle = 'rgba(50,50,56,.55)'; g.lineWidth = Math.max(0.6, 0.7 * u); for (let a = T0 + 0.6; a < T1; a += 0.6) { const f = (a - T0) / (T1 - T0), [x0, y0] = P(a, topH - Math.sin(f * Math.PI) * 286), [x1, y1] = P(a, 16); g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); }
        for (const [a, s] of [[T0 - 4, -1], [T1 + 4, 1]]) line([P(s < 0 ? T0 : T1, topH), P(a, 0)], 2.2, 'rgba(50,50,56,.9)');
        for (const s of [-1, 1]) { const end = lerp(s < 0 ? T0 - 4 : T1 + 4, mid, hk), d = []; for (let a = s < 0 ? T0 - 4 : end; a <= (s < 0 ? end : T1 + 4) + 0.001; a += 0.2) d.push(P(a, 14)); if (d.length > 1) { line(d, 9, 'rgba(196,60,50,1)'); line(d.map(([px, py]) => [px, py - 4 * u]), 1.4, 'rgba(255,255,255,.6)'); } }
        if (hk > 0.99) for (let i = 0; i < 4; i++) { const f = ((t * 0.09 + i / 4) % 1), a = lerp(T0 - 4, T1 + 4, i % 2 ? f : 1 - f), [cx2, cy2, r2] = st.place('main', a, 20, t); g.save(); g.translate(cx2, cy2); g.rotate(r2); g.scale(u, u); g.fillStyle = ['#e8e6e0', '#2a4a8a'][i % 2]; g.fillRect(-6, -5, 12, 5); g.restore(); }
        g.restore();
      }
    }
    // ---- power leaving the Three Gorges along the wires: pulses of light
    const TG = ev('gorges'); if (t > TG + 1 && t < 624) { g.globalCompositeOperation = 'lighter'; for (let i = 0; i < 8; i++) { const f = ((t - TG) * 0.5 + i / 8) % 1, a = lerp(2417.6, 2440, f), [x, y] = st.place('main', a, 214 * 0.8 - 26 - Math.sin(f * Math.PI * 2) * 4, t); st.stamp(g, st.dot(255, 230, 150, '255,250,220'), x, y, 9 * u, 0.9); } g.globalCompositeOperation = 'source-over'; }
    // ---- mist rising out of the canyon
    if (t > 630 && t < 644) { const k = sramp(t, 631, 633) * (1 - sramp(t, 641, 643)); for (let i = 0; i < 8; i++) { const a = CANYON - 4 + hash(i * 3) * 8 + Math.sin(t * 0.2 + i) * 0.6, [x, y] = st.place('main', a, -160 + i * 18 + Math.sin(t * 0.3 + i) * 6, t); st.stamp(g, st.dot(230, 236, 240), x, y, (50 + hash(i) * 40) * u, 0.18 * k); } }
    // ---- seventeen minutes, and more: a stopwatch runs through them
    const SV = ev('seventeen');
    if (t > SV - 0.4 && t < SV + 6.4) {
      const k = drop(t, SV - 0.2, SV + 5.4), x = W * (por ? 0.5 : 0.72), y = H * lerp(-0.3, por ? 0.22 : 0.2, k), sc = por ? 1.0 : 1.35, sw = Math.sin(t * 0.6) * 1.5 * DEG;
      st.hang(g, st.fx.stopwatch, x, y, sc, sw);
      const len = y + 20, cx = x - Math.sin(sw) * len, cy = -20 + Math.cos(sw) * len, secs = clamp((t - SV) / 4) * 1066;
      g.save(); g.translate(cx, cy); g.rotate(sw); g.scale(u * sc, u * sc);
      const hand = (a, L, w, col) => { g.save(); g.rotate(a); g.strokeStyle = col; g.lineWidth = w; g.lineCap = 'round'; g.beginPath(); g.moveTo(0, 6); g.lineTo(0, -L); g.stroke(); g.restore(); };
      g.save(); g.translate(0, 16); hand((secs / 60) / 30 * Math.PI * 2, 10, 1.6, '#c8282a'); g.restore();
      hand((secs % 60) / 60 * Math.PI * 2, 40, 1.4, '#2a2a30'); g.fillStyle = '#2a2a30'; g.beginPath(); g.arc(0, 0, 2.6, 0, 7); g.fill();
      g.restore();
    }
    // ---- quantum keys: beams from the satellite down to the two observatories, keys riding them
    const Q = ev('quantum');
    if (t > Q - 0.2 && t < 676) {
      const k = drop(t, Q - 1.2, 674), sy = H * lerp(-0.2, por ? 0.14 : 0.12, k) + 34 * u * (por ? 0.9 : 1.2), sx = W * 0.5, beam = sramp(t, Q, Q + 0.8) * (1 - sramp(t, 673, 675));
      g.globalCompositeOperation = 'lighter';
      QS.forEach((a, i) => {
        const [x, y] = st.place('main', a + 0.4, 130 * 1.1, t); if (beam < 0.01) return;
        const col = i ? '255,80,90' : '90,255,140';
        g.strokeStyle = `rgba(${col},${0.5 * beam})`; g.lineWidth = Math.max(1.4, 2.4 * u); g.beginPath(); g.moveTo(sx, sy); g.lineTo(x, y); g.stroke();
        g.strokeStyle = `rgba(${col},${0.18 * beam})`; g.lineWidth = 10 * u; g.beginPath(); g.moveTo(sx, sy); g.lineTo(x, y); g.stroke();
        for (let j = 0; j < 3; j++) { const f = ((t - Q) * 0.45 + j / 3) % 1; if (t < Q + 0.6) continue; const px = lerp(sx, x, f), py = lerp(sy, y, f); g.save(); g.globalCompositeOperation = 'source-over'; g.translate(px, py); g.scale(u * 1.1, u * 1.1); put(g, st.fx.qkey, 0); g.restore(); st.stamp(g, st.dot(200, 255, 230), px, py, 14 * u, 0.5 * beam); }
      });
      g.globalCompositeOperation = 'source-over';
    }
    // ---- the quantum computer: a golden chandelier lowered on its thread, its chip glowing cold blue
    const QC = ev('qcomputer');
    if (t > QC - 0.4 && t < 676) {
      const k = drop(t, QC, 674), x = W * (por ? 0.5 : 0.3), y = H * lerp(-0.7, por ? 0.04 : 0.03, k), sc = por ? 0.85 : 1.25, sw = Math.sin(t * 0.5) * 1.2 * DEG;
      st.hang(g, st.fx.qfridge, x, y, sc, sw);
      const len = y + 20, cx = x - Math.sin(sw) * (len + 236 * u * sc), cy = -20 + Math.cos(sw) * (len + 236 * u * sc), win = sramp(t, ev('beat'), ev('beat') + 0.8);
      g.globalCompositeOperation = 'lighter'; st.stamp(g, st.dot(120, 200, 255, '230,250,255'), cx, cy, (26 + 30 * win) * u * sc, 0.8 + 0.2 * Math.sin(t * 6)); g.globalCompositeOperation = 'source-over';
    }
    // ---- Datong's panda, made of solar panels
    const PF = ev('pandafarm');
    if (t > PF - 0.3 && t < PF + 6) st.hang(g, st.fx.pandafarm, W * (por ? 0.5 : 0.7), H * lerp(-0.3, por ? 0.24 : 0.2, drop(t, PF, PF + 5)), por ? 1.0 : 1.4, Math.sin(t * 0.6) * 1.5 * DEG);
  },
});

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
  [23, ['#0c1230', '#131c42', '#1e2a56', '#35426e']], [27, DAWN], [31, DAY], [46, DAY], [48.5, ['#34406c', '#80628a', '#dc8c62', '#f6b76a']], [51, DUSK], [54, NIGHT], [95, NIGHT], [99, DAWN], [103, DAY], [107, DAY], [109, ['#6a6a76', '#8a8580', '#a89a88', '#b8a890']], [113, ['#6a6a76', '#8a8580', '#a89a88', '#b8a890']], [116, DAY], [238, DAY], [241, ['#6a8ab0', '#a8b0c0', '#e8d0b0', '#f6c890']], [256, ['#5a6a98', '#a890a8', '#f0b088', '#f8c888']], [260, DAY], [290, DAY], [294, ['#34406c', '#80628a', '#dc8c62', '#f6b76a']], [297.5, DUSK], [300, NIGHT], [315, NIGHT], [318.5, DAWN], [321, DAY], [328, DAY], [330.5, DUSK], [332.5, NIGHT], [338, NIGHT], [340.5, DAWN], [343, DAY], [427, DAY], [430, ['#6a6a76', '#8a8580', '#a89a88', '#b8a890']], [438, ['#4a3a3a', '#6a4a40', '#8a5a48', '#a87a5a']], [446, ['#4a3a3a', '#6a4a40', '#8a5a48', '#a87a5a']], [449, ['#7a8aa0', '#a8aab0', '#d8ccb8', '#e8d8b8']], [457, ['#7a8aa0', '#a8aab0', '#d8ccb8', '#e8d8b8']], [462, ['#7a8aa0', '#a8aab0', '#d8ccb8', '#e8d8b8']], [465, ['#3a2a2a', '#5a3a32', '#8a4a3a', '#a86a4a']], [471, ['#2a2224', '#3a2a2a', '#5a3a34', '#6a4a40']], [474, ['#5a6a98', '#a890a8', '#f0b088', '#f8c888']], [478, DAY], [490, DAY], [493, ['#8a8a90', '#a8a49c', '#c8b8a0', '#d8c4a0']], [497, ['#5a5a66', '#7a7680', '#9a9090', '#a89a90']], [507, ['#6a6a76', '#8a8580', '#a89a88', '#b8a890']], [510, DUSK], [512.5, NIGHT], [522, NIGHT], [525.5, DAWN], [528, DAY], [550, DAY], [553, ['#5a5a6a', '#7a7078', '#a08a80', '#b89a88']], [558.5, DUSK], [561.5, NIGHT], [574, ['#05081a', '#0a1028', '#121c3c', '#1e2c50']], [606, ['#05081a', '#0a1028', '#121c3c', '#1e2c50']], [609.5, DAWN], [614, DAY], [639, DAY], [643, DUSK], [646, ['#0a0c22', '#121434', '#1e1c44', '#2e2a56']], [690, ['#05060e', '#08091a', '#0e1024', '#161a30']], [695, NIGHT], [698, DAWN], [702, DAY], [713, DAY], [717, DUSK], [721, ['#101a3c', '#2a3060', '#6a5a7a', '#a87a7a']], [730, ['#101a3c', '#2a3060', '#6a5a7a', '#a87a7a']], [740, ['#2c3a6a', '#6c6a96', '#e3a07a', '#f7c98a']], [750, ['#3f6aa0', '#7aa0c8', '#e2c8b0', '#f8d8a8']],
]);
const ambK = track([[0, [244, 214, 196]], [5, [176, 150, 164]], [9, [96, 98, 138]], [13, [58, 70, 114]], [23, [58, 70, 114]], [27, [200, 180, 175]], [31, W_], [46, W_], [48.5, [244, 200, 180]], [51, [130, 110, 140]], [54, [66, 72, 116]], [95, [66, 72, 116]], [99, [200, 180, 175]], [103, W_], [107, W_], [109, [210, 200, 196]], [113, [210, 200, 196]], [116, W_], [238, W_], [241, [255, 236, 214]], [256, [240, 200, 180]], [260, W_], [290, W_], [294, [244, 200, 180]], [297.5, [110, 104, 140]], [300, [60, 70, 116]], [315, [60, 70, 116]], [318.5, [200, 180, 175]], [321, W_], [328, W_], [330.5, [110, 104, 140]], [332.5, [56, 64, 108]], [338, [56, 64, 108]], [340.5, [200, 180, 175]], [343, W_], [427, W_], [430, [210, 200, 196]], [438, [180, 140, 126]], [446, [180, 140, 126]], [449, [236, 230, 224]], [457, [236, 230, 224]], [462, [236, 230, 224]], [465, [190, 140, 120]], [471, [120, 96, 92]], [474, [240, 210, 196]], [478, W_], [490, W_], [493, [226, 214, 200]], [497, [176, 170, 176]], [507, [196, 190, 190]], [510, [110, 104, 140]], [512.5, [60, 68, 112]], [522, [60, 68, 112]], [525.5, [200, 180, 175]], [528, W_], [550, W_], [553, [176, 166, 170]], [558.5, [100, 96, 128]], [561.5, [50, 58, 100]], [574, [36, 42, 76]], [606, [36, 42, 76]], [609.5, [200, 180, 175]], [614, W_], [639, W_], [643, [110, 104, 140]], [646, [40, 44, 80]], [688, [40, 44, 80]], [690, [14, 16, 30]], [694.5, [14, 16, 30]], [696, [60, 68, 112]], [698, [200, 180, 175]], [702, W_], [713, W_], [717, [150, 130, 150]], [721, [90, 90, 130]], [730, [90, 90, 130]], [740, [200, 182, 176]], [750, [255, 250, 240]]]);
const moteK = track([[0, [255, 222, 170]], [12, [255, 190, 120]], [26, [255, 222, 170]], [46, [255, 222, 170]], [52, [255, 190, 120]], [98, [255, 222, 170]]]);
const gradeK = track([[0, [255, 170, 95, 0.16]], [24, [255, 170, 95, 0.16]], [30, [255, 205, 150, 0.1]], [46, [255, 205, 150, 0.1]], [52, [255, 160, 90, 0.18]], [96, [255, 160, 90, 0.16]], [102, [255, 205, 150, 0.1]], [107, [255, 205, 150, 0.1]], [109, [150, 140, 130, 0.22]], [113, [150, 140, 130, 0.22]], [116, [255, 210, 160, 0.1]]]);
const SUNS = [[-1, 11, -430, -78, 170], [24, 31, 430, 170, -60], [45, 52, -430, -40, 170], [96, 103, 430, 170, -60], [607, 616, 430, 170, -60], [638, 645, -430, -40, 170], [696, 704, 430, 170, -60], [713, 720, -430, -40, 170]];
const NIGHTS = [[7, 27], [50, 99], [296, 319], [330, 341], [510, 526], [559, 610], [642, 699], [716, 744]];
const ZOOM = [[8, 12, 19.5, 24, 0.36], [26.5, 28.5, 34, 36, 0.12], [36.5, 38.5, 43.5, 46, 0.22], [50.5, 52.5, 56.5, 58.5, 0.2], [90, 92.4, 95.5, 98, 0.3], [146.5, 148.5, 150.5, 152.5, 0.22], [168, 170.5, 173, 175, 0.12], [175.5, 177.5, 180.5, 182.5, 0.42], [287, 289, 292.5, 294.5, 0.2], [299, 303, 314, 317, 0.45], [325, 326.5, 328.5, 330, 0.3], [369, 371, 373.5, 375.5, 0.25], [396, 398, 401.5, 403.5, 0.12], [448, 450, 455, 457.5, 0.4], [467, 469, 471.5, 473.5, 0.15], [511, 513, 520, 522.5, 0.2], [553, 555, 558, 560, 0.3], [613, 615.5, 619, 621, 0.12], [633, 635, 639, 641, -0.14], [644, 646, 657, 659, 0.32], [674, 676, 679, 681, 0.18], [683, 685, 692, 694, 0.12]];

// ---- the light of each age, laid over the base sky: no two eras share one day.
// Each look is [sky top..horizon], ambient light, colour grade [r,g,b,strength], and the air: dust, snow, sun rays.
const hx = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const LOOK = (sky, amb, grade, extra = {}) => ({ sky: sky.map(hx), amb, grade, ...extra });
const ERAS = [
  [116.5, 139.5, LOOK(['#8aa9c4', '#c2cbcc', '#ecdcbf', '#f4d6a6'], [255, 240, 220], [255, 200, 150, 0.14], { motes: 0.8, mote: [255, 232, 196] })],   // the thinkers: a soft, misty morning
  [140.6, 146.4, LOOK(['#2f3640', '#4a4e57', '#7a6e60', '#a8865c'], [184, 172, 160], [140, 120, 100, 0.26], { motes: 0.2 })],                      // Qin conquers: a storm sky
  [146.4, 160.4, LOOK(['#6d8fb6', '#a6b8c6', '#e6d4b0', '#f0c88a'], [255, 236, 206], [255, 190, 120, 0.14], { rays: 0.6, motes: 0.6 })],           // the First Emperor: imperial gold
  [160.4, 166.8, LOOK(['#7d8ca2', '#a6b0bc', '#c8ccd0', '#d8d6d0'], [214, 222, 238], [170, 190, 225, 0.18], { snow: 0.9, motes: 0 })],              // the wall in the north: snow
  [166.8, 181.6, LOOK(['#6b7e9c', '#a49e9c', '#dcb98a', '#ecc07c'], [255, 226, 190], [255, 180, 110, 0.18], { rays: 0.8, motes: 1.3, mote: [255, 214, 150] })], // the clay army: dust in amber light
  [181.6, 187.6, LOOK(['#2e2a48', '#5a3c58', '#b0584a', '#e08a50'], [232, 172, 142], [255, 120, 70, 0.2], { motes: 0.6, mote: [255, 180, 120] })], // fifteen years: the dynasty's sunset
  [187.6, 199, LOOK(['#5f97d0', '#9cc0dc', '#dfe8e0', '#f2ecd2'], [255, 252, 242], [255, 220, 180, 0.06], { motes: 0.3 })],                         // the Han: a clear spring day
  [199, 216.2, LOOK(['#5a88b8', '#a2b4bc', '#ecc890', '#f6b866'], [255, 232, 196], [255, 170, 90, 0.17], { rays: 0.9, motes: 1.0, mote: [255, 210, 150] })], // the Silk Road: desert gold
  [216.2, 238.5, LOOK(['#9ab4c8', '#c6cfd0', '#eae2cc', '#f2e2bc'], [255, 246, 232], [255, 215, 170, 0.1], { motes: 0.5 })],                        // paper and the seismoscope: a calm morning
  [258.5, 268, LOOK(['#8ea4c0', '#bcc4cc', '#e6dccc', '#f0d8b4'], [244, 236, 226], [220, 210, 200, 0.1], { motes: 0.4 })],                          // the Grand Canal at dawn, in mist
  [268, 291, LOOK(['#5c86b8', '#9fb2c6', '#efd2a0', '#f7c27a'], [255, 232, 200], [255, 180, 110, 0.15], { rays: 0.8, motes: 0.9, mote: [255, 220, 160] })], // Tang Chang'an: a golden afternoon
  [318.6, 328.6, LOOK(['#7896b4', '#b0bcc4', '#e4dac4', '#ecd2a8'], [255, 240, 220], [255, 200, 150, 0.1], { motes: 0.6 })],                        // Song Kaifeng: busy, hazy
  [342.6, 356.4, LOOK(['#6c90b8', '#a8bac6', '#ead6b2', '#f2cc92'], [255, 238, 212], [255, 195, 135, 0.12], { rays: 0.5, motes: 0.6 })],           // compass, money, type: warm afternoon
  [356.4, 366.6, LOOK(['#6f88a8', '#a4b0bc', '#d2ccbc', '#ddc8a0'], [236, 232, 226], [180, 180, 195, 0.15], { motes: 0.3 })],                       // the steppe: cold wind
  [366.6, 384.2, LOOK(['#4f8ac8', '#8eb4d6', '#dbe4e4', '#efe6cc'], [255, 250, 240], [255, 215, 175, 0.08], { motes: 0.4 })],                       // the Ming: crisp and clear
  [384.2, 393.8, LOOK(['#4e8cc4', '#8ec0dc', '#d8ecec', '#eef0e0'], [248, 252, 255], [200, 230, 255, 0.08], { motes: 0.3 })],                       // Zheng He's fleet: sea haze
  [393.8, 404.2, LOOK(['#5d8ec0', '#a6bcc4', '#efcf98', '#f8bc6c'], [255, 236, 200], [255, 175, 100, 0.14], { rays: 0.7, motes: 0.8 })],           // Africa and the giraffe: warm savanna
  [404.2, 428, LOOK(['#6888ae', '#a7b0b8', '#e2c69a', '#eeb878'], [255, 232, 200], [255, 170, 100, 0.15], { rays: 0.6, motes: 0.7, mote: [255, 210, 150] })], // the Qing: an autumn afternoon
  [476.6, 490.4, LOOK(['#6a92c0', '#a8bccc', '#e4dccc', '#f0d8b0'], [255, 244, 228], [255, 200, 150, 0.1], { motes: 0.5 })],                        // 1949 and the new schools
  [527.6, 550.4, LOOK(['#7a98b8', '#b4c0c8', '#e6dccc', '#eed6b4'], [255, 242, 226], [255, 205, 160, 0.1], { motes: 0.6 })],                        // opening up: the haze of a building site
  [613.6, 639.4, LOOK(['#4a86c4', '#8cbcdc', '#d6e8ec', '#eef0e4'], [250, 252, 255], [210, 230, 255, 0.07], { motes: 0.3 })],                       // the great structures: big, clear air
  [701.6, 713.6, LOOK(['#5a96cc', '#9cc4dc', '#dcece4', '#f0eed8'], [255, 252, 240], [235, 245, 210, 0.08], { motes: 0.5, mote: [240, 255, 210] })], // sun, wind and new forests
];
const mixA = (a, b, k) => a.map((v, i) => (Array.isArray(v) ? mixA(v, b[i], k) : v + (b[i] - v) * k));
function eraLook(t, b) {
  let { sky, amb, grade, mote, motes } = b, snow = 0, rays = 0;
  for (const [t0, t1, L] of ERAS) {
    const k = sramp(t, t0 - 1.2, t0 + 1.2) * (1 - sramp(t, t1 - 1.2, t1 + 1.2)); if (k <= 0.001) continue;
    sky = mixA(sky, L.sky, k); amb = mixA(amb, L.amb, k); grade = mixA(grade, L.grade, k);
    if (L.mote) mote = mixA(mote, L.mote, k);
    if (L.motes !== undefined) motes += (L.motes - motes) * k;
    if (L.snow) snow = Math.max(snow, L.snow * k);
    if (L.rays) rays = Math.max(rays, L.rays * k);
  }
  return { sky, amb, grade, mote, motes, snow, rays };
}
// the hanging paper sun's own rays, in the golden scenes (the same place sky() hangs it)
const PAPER_SUN = [[30.5, 45], [102.5, 106.5], [117, 138], [146.4, 151], [161, 186], [188, 226], [262, 290], [344, 356], [358, 402], [404, 426], [480, 490], [528, 550], [614, 640], [702, 714]];

function state(t, stage) {
  const c = cam(t), lights = [], emitters = [], smoke = [];
  for (const f of HOOK.lights) f(t, c, lights, emitters, smoke, stage);
  let nightK = 0; for (const [a0, a1] of NIGHTS) nightK = Math.max(nightK, sramp(t, a0, a0 + 5) * (1 - sramp(t, a1 - 4, a1)));
  let sun = null;
  for (const [t0, t1, x, y0, y1] of SUNS) if (t > t0 && t < t1) sun = { x, y: lerp(y0, y1, smooth((t - t0) / (t1 - t0))), k: 1 };
  if (t > ev('pull', 718) + 20) sun = { x: 380, y: lerp(190, -90, smooth((t - ev('pull', 718) - 20) / 14)), k: 1 };
  const pull = sramp(t, ev('pull', 718), ev('pull', 718) + 12);
  let zoom = 1;
  for (const [a0, a1, b0, b1, k] of ZOOM) zoom *= 1 + k * sramp(t, a0, a1) * (1 - sramp(t, b0, b1));
  const lk = eraLook(t, { sky: skyK(t), amb: ambK(t), grade: gradeK(t), mote: moteK(t), motes: 0.4 + 0.25 * nightK });
  if (!sun && lk.rays > 0.01 && stage && stage.W) {
    const hung = PAPER_SUN.find(([a, b]) => t > a + 2 && t < b);
    if (hung) sun = { x: (stage.W * (stage.aspectK > 0.4 ? 0.16 : 0.2) - stage.cx) / stage.u, y: (stage.H * 0.13 - stage.hy) / stage.u, k: lk.rays * sramp(t, hung[0] + 2, hung[0] + 4) * (1 - sramp(t, hung[1] - 2, hung[1])), noDisc: true };
  }
  return {
    fire: { lit: 0, reach: 0, blow: 0 }, lights, emitters, smoke,
    sky: lk.sky, ambient: lk.amb, ground: null,
    stars: nightK + pull * lerp(1, 0.22, sramp(t, ev('pull', 718) + 10, ev('pull', 718) + 22)),
    sun, cloud: 1 - nightK * 0.4, snow: lk.snow,
    motes: lk.motes, moteColor: lk.mote,
    emit: true, screen: 0, blink: sramp(t, 573, 575) * (1 - sramp(t, 607, 610)), bloom: 0.16 + 0.34 * nightK, grade: lk.grade, rays: 1,
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
  for (const [t0, t1] of PAPER_SUN) {
    if (t < t0 - 0.5 || t > t1 + 3) continue;
    const k = drop(t, t0, t1), sx = W * (st.aspectK > 0.4 ? 0.16 : 0.2), sy = H * lerp(-0.25, 0.13, k);
    g.globalCompositeOperation = 'screen'; const gl = g.createRadialGradient(sx, sy, 0, sx, sy, 300 * u); gl.addColorStop(0, `rgba(255,236,190,${0.35 * clamp(k)})`); gl.addColorStop(1, 'rgba(255,230,180,0)'); g.fillStyle = gl; g.fillRect(sx - 300 * u, sy - 300 * u, 600 * u, 600 * u); g.globalCompositeOperation = 'source-over';
    st.hang(g, st.fx.sun, sx, sy, 0.75, Math.sin(t * 0.4) * 1.2 * DEG, 1, t * 0.03);
  }
  // Tiangong crosses the night sky above the trains (it is not named: it is simply up there)
  if (t > 582 && t < 593.5) {
    const k = (t - 582.2) / 11, por = st.aspectK > 0.4 ? 0 : 1, x = W * lerp(-0.12, 1.12, k), y = H * (por ? 0.13 : 0.15) + Math.sin(k * Math.PI) * -H * 0.03;
    st.hang(g, st.fx.tiangong, x, y, por ? 0.42 : 0.55, Math.sin(t * 0.6) * 1.4 * DEG, 1, -0.18 + k * 0.1);
    const [bx, by] = [x + Math.cos(-0.18) * 0, y - 8 * u], on = (t * 0.9) % 1 < 0.18;
    if (on) { g.globalCompositeOperation = 'lighter'; st.stamp(g, st.dot(255, 240, 220, '255,255,250'), x, y, 7 * u, 0.9); g.globalCompositeOperation = 'source-over'; }
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
  const end = Math.min(threadEnd(t), THREAD_END), glow = smooth(S.pull || 0);
  if (end > THREAD0 - 1) run(THREAD0 - 2, end, (a0, a1) => {
    const H = (a) => (a < THREAD0 + 2 ? lerp(52, -12, smooth((a - THREAD0) / 2)) : -12) + (S.threadLift ? S.threadLift(a) : 0);
    g.save(); g.lineCap = 'round';
    g.strokeStyle = 'rgba(120,80,20,.35)'; g.lineWidth = 3.2; g.setLineDash([9, 7]); g.beginPath();
    for (let a = Math.max(a0, THREAD0); a <= a1; a += 0.25) { const [x, y] = rad(a, H(a) - 1.2); a === Math.max(a0, THREAD0) ? g.moveTo(x, y + 1.5) : g.lineTo(x, y + 1.5); } g.stroke();
    if (glow > 0.01) { g.save(); g.globalCompositeOperation = 'lighter'; g.strokeStyle = `rgba(255,200,90,${0.35 * glow})`; g.lineWidth = 10 + 10 * glow; g.beginPath(); for (let a = Math.max(a0, THREAD0); a <= a1; a += 0.5) { const [x, y] = rad(a, H(a)); a === Math.max(a0, THREAD0) ? g.moveTo(x, y) : g.lineTo(x, y); } g.stroke(); g.restore(); }
    g.strokeStyle = 'rgba(244,206,108,.95)'; g.lineWidth = 2 + 3 * glow; g.beginPath();
    for (let a = Math.max(a0, THREAD0); a <= a1; a += 0.25) { const [x, y] = rad(a, H(a)); a === Math.max(a0, THREAD0) ? g.moveTo(x, y) : g.lineTo(x, y); } g.stroke();
    g.restore();
    // the shine running along it as it is drawn out
    if (t < 47) { const [x, y] = rad(Math.min(end, a1), H(Math.min(end, a1))); st.stamp(g, st.dot(255, 214, 120, '255,246,220'), x, y, 14, 0.9); }
  });
}

// The pull-back: the whole timeline, seven and a half laps of the globe, wound up into one ball of red thread.
function threadBall(g, st, t, S) {
  const t0 = ev('pull', 718.6) + 2.6, R = st.eR * 0.972, cx = st.cx, cy = st.ecy, spin = t * 0.16, LAPS = 7.6;
  const shown = sramp(t, t0, t0 + 0.6); if (shown < 0.01) return;
  const lw = Math.max(1.4, R * 0.022), glow = 0.5 + 0.5 * Math.sin(t * 1.3);
  const loops = [];
  for (let k = 0; k < Math.ceil(LAPS); k++) {
    const th = k * 2.39996 + spin, ph = 0.62 + 0.75 * hash(k * 17 + 3), n = [Math.sin(ph) * Math.cos(th), Math.cos(ph) * 0.9, Math.sin(ph) * Math.sin(th)];
    const nl = Math.hypot(...n); n[0] /= nl; n[1] /= nl; n[2] /= nl;
    const a = Math.abs(n[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0], u = [a[1] * n[2] - a[2] * n[1], a[2] * n[0] - a[0] * n[2], a[0] * n[1] - a[1] * n[0]], ul = Math.hypot(...u); u[0] /= ul; u[1] /= ul; u[2] /= ul;
    const v = [n[1] * u[2] - n[2] * u[1], n[2] * u[0] - n[0] * u[2], n[0] * u[1] - n[1] * u[0]];
    const wind = clamp((t - t0 - k * 0.8) / 1.0) * Math.min(1, LAPS - k), off = k * 1.3;
    loops.push({ u, v, wind, off });
  }
  const pt = (L, q) => { const c = Math.cos(q + L.off), s = Math.sin(q + L.off); return [L.u[0] * c + L.v[0] * s, L.u[1] * c + L.v[1] * s, L.u[2] * c + L.v[2] * s]; };
  const stroke = (L, col, w, dy, front) => {
    const N = 96, end = L.wind * Math.PI * 2; if (end <= 0) return; g.strokeStyle = col; g.lineWidth = w; let on = false; g.beginPath();
    for (let i = 0; i <= N; i++) { const q = Math.min(end, (i / N) * Math.PI * 2), p = pt(L, q); if (p[2] * front < 0.02) { on = false; if (q >= end) break; continue; } const x = cx + p[0] * R, y = cy + p[1] * R + dy; on ? g.lineTo(x, y) : g.moveTo(x, y); on = true; if (q >= end) break; }
    g.stroke();
  };
  g.save(); g.globalAlpha = shown; g.lineCap = 'round'; g.lineJoin = 'round';
  // a soft shade on the board under the thread, then the thread, then its sheen
  for (const L of loops) stroke(L, 'rgba(20,8,6,.35)', lw * 1.5, lw * 0.7, 1);
  for (const L of loops) stroke(L, '#a8241e', lw, 0, 1);
  for (const L of loops) stroke(L, 'rgba(255,170,140,.45)', lw * 0.35, -lw * 0.25, 1);
  g.globalCompositeOperation = 'lighter'; g.globalAlpha = shown * (0.05 + 0.035 * glow);
  for (const L of loops) stroke(L, 'rgba(255,150,80,1)', lw * 3, 0, 1);
  // the needle, still threaded, riding the newest loop
  const last = loops[loops.length - 1], q = last.wind * Math.PI * 2, p = pt(last, q);
  if (last.wind > 0 && p[2] > 0) { g.globalCompositeOperation = 'source-over'; g.globalAlpha = shown; const x = cx + p[0] * R, y = cy + p[1] * R, p2 = pt(last, q - 0.08), ang = Math.atan2(y - (cy + p2[1] * R), x - (cx + p2[0] * R)); g.translate(x, y); g.rotate(ang); g.fillStyle = '#d4d8de'; g.beginPath(); g.moveTo(-R * 0.09, 0); g.lineTo(0, -R * 0.006); g.lineTo(R * 0.012, 0); g.lineTo(0, R * 0.006); g.closePath(); g.fill(); }
  g.restore();
}
// ---- weather, in screen space: apricot petals, desert sand, river mist, steppe dust, autumn leaves.
// Mist is a ring around the planet, so it lies along the curve of the ground.
const WX = [
  ['mist', 86.6, 97.6, [255, 168, 110], 0.16], ['petals', 117.4, 131.8], ['mist', 123.8, 132, [238, 236, 230], 0.3], ['dust', 141, 146.4, [196, 180, 160]],
  ['sand', 199.6, 216.2, [224, 192, 140]], ['mist', 258.6, 268.6, [240, 236, 230], 0.36], ['dust', 356.6, 366.4, [214, 206, 192]],
  ['mist', 384.4, 394, [236, 244, 250], 0.26], ['leaves', 405.4, 427.8], ['mist', 433.4, 447, [150, 130, 120], 0.22], ['mist', 464, 472.6, [140, 120, 110], 0.22],
];
const LEAF_COL = ['#e0a640', '#c8742a', '#d89a3a', '#b8582a'];
function weather(g, st, t) {
  const { W, H } = st, u = st.eu, cx = st.cx, cy = st.ecy, R = st.eR, fr = (x) => x - Math.floor(x);
  // particles keep a readable size on narrow phones, where the planet (and so u) is small
  const pu = Math.max(u, Math.min(W, H) / 820);
  for (const [kind, t0, t1, col, amt] of WX) {
    const k = sramp(t, t0, t0 + 1.6) * (1 - sramp(t, t1 - 1.6, t1)); if (k < 0.01) continue;
    g.save();
    if (kind === 'mist') {
      const [r, gg, b] = col, a = (amt || 0.25) * k;
      const gr = g.createRadialGradient(cx, cy, Math.max(1, R - 30 * u), cx, cy, R + 190 * u);
      gr.addColorStop(0, `rgba(${r},${gg},${b},0)`); gr.addColorStop(0.18, `rgba(${r},${gg},${b},${a})`); gr.addColorStop(0.45, `rgba(${r},${gg},${b},${a * 0.45})`); gr.addColorStop(1, `rgba(${r},${gg},${b},0)`);
      g.fillStyle = gr; g.fillRect(0, 0, W, H);
      // banks of it drifting along the ground
      for (let i = 0; i < 7; i++) {
        const ang = (fr(hash(i * 5) + t * 0.004 * (0.6 + hash(i))) - 0.5) * 1.1, h = 20 + hash(i * 9) * 90, rr = R + h * u, x = cx + Math.sin(ang) * rr, y = cy - Math.cos(ang) * rr, w = (160 + hash(i * 3) * 160) * u;
        const pg = g.createRadialGradient(x, y, 0, x, y, w); pg.addColorStop(0, `rgba(${r},${gg},${b},${a * 0.7})`); pg.addColorStop(1, `rgba(${r},${gg},${b},0)`);
        g.fillStyle = pg; g.save(); g.translate(x, y); g.rotate(ang); g.scale(1, 0.32); g.translate(-x, -y); g.fillRect(x - w, y - w, w * 2, w * 2); g.restore();
      }
    } else if (kind === 'petals') {
      for (let i = 0; i < 44; i++) {
        const sp = 0.6 + hash(i * 3) * 0.8, x = W * (1.15 - fr(hash(i) + t * 0.028 * sp) * 1.3) + Math.sin(t * 1.3 * sp + i) * 14 * u, y = H * fr(hash(i * 7) + t * 0.05 * sp) - 20 * u;
        g.save(); g.translate(x, y); g.rotate(t * 2.2 * sp + i); g.scale(1, 0.45 + 0.55 * Math.abs(Math.sin(t * 3 * sp + i))); g.globalAlpha = 0.9 * k;
        g.fillStyle = i % 3 ? '#f6ccd2' : '#fbe2e6'; g.beginPath(); g.ellipse(0, 0, 5.2 * pu, 3.4 * pu, 0, 0, 7); g.fill();
        g.fillStyle = 'rgba(214,120,140,.5)'; g.beginPath(); g.ellipse(-1.6 * pu, 0, 1.6 * pu, 1.1 * pu, 0, 0, 7); g.fill(); g.restore();
      }
    } else if (kind === 'sand' || kind === 'dust') {
      const [r, gg, b] = col, gy = cy - R, n = kind === 'sand' ? 150 : 90;
      // long gusts low over the ground
      for (let i = 0; i < 6; i++) {
        const x = W * (1.3 - fr(hash(i * 11) + t * 0.12 * (0.7 + hash(i)))) * 1.0, y = gy + (-10 - hash(i * 4) * 150) * u, w = (160 + hash(i) * 200) * u;
        const pg = g.createRadialGradient(x, y, 0, x, y, w); pg.addColorStop(0, `rgba(${r},${gg},${b},${0.14 * k})`); pg.addColorStop(1, `rgba(${r},${gg},${b},0)`);
        g.fillStyle = pg; g.save(); g.translate(x, y); g.scale(1, 0.12); g.translate(-x, -y); g.fillRect(x - w, y - w, w * 2, w * 2); g.restore();
      }
      g.fillStyle = `rgba(${r},${gg},${b},${0.75 * k})`;
      for (let i = 0; i < n; i++) {
        const sp = 0.6 + hash(i * 13) * 0.9, x = W * (1.1 - fr(hash(i * 2) + t * 0.16 * sp) * 1.2), y = gy + (20 - fr(hash(i * 17)) ** 1.6 * 260) * u + Math.sin(t * 3 * sp + i) * 6 * u, s = (0.8 + hash(i * 5) * 1.4) * pu;
        g.fillRect(x, y, s * 2.4, s);
      }
    } else if (kind === 'leaves') {
      for (let i = 0; i < 26; i++) {
        const sp = 0.5 + hash(i * 3) * 0.7, x = W * (1.1 - fr(hash(i * 2) + t * 0.022 * sp) * 1.2) + Math.sin(t * 1.1 * sp + i) * 30 * u, y = H * fr(hash(i * 7) + t * 0.04 * sp) - 20 * u;
        g.save(); g.translate(x, y); g.rotate(Math.sin(t * 1.6 * sp + i) * 0.9 + i); g.globalAlpha = 0.95 * k; g.fillStyle = LEAF_COL[i % 4];
        // a ginkgo fan
        const s = (5 + hash(i * 9) * 3) * pu; g.beginPath(); g.moveTo(0, s * 0.9); g.lineTo(-s * 0.9, -s * 0.5); g.quadraticCurveTo(0, -s * 1.1, s * 0.9, -s * 0.5); g.closePath(); g.fill();
        g.strokeStyle = 'rgba(90,50,20,.6)'; g.lineWidth = Math.max(0.6, 0.5 * pu); g.beginPath(); g.moveTo(0, s * 0.9); g.lineTo(0, s * 1.5); g.stroke(); g.restore();
      }
    }
    g.restore();
  }
}

function overFx(g, st, t, S) {
  const { W, H } = st, u = st.eu, c = cam(t);
  g.setTransform(1, 0, 0, 1, 0, 0);
  weather(g, st, t);
  if (S.pull > 0.02) threadBall(g, st, t, S);
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
const FLOCKS = [[1.5, 10, -1, 0.3, 9], [27, 36, 1, 0.24, 7], [259.6, 267.6, -1, 0.28, 7], [385, 392.5, -1, 0.22, 6], [707.6, 716.4, 1, 0.26, 13]];
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

export const film = { titleT: 15.2, keepFull: (a) => a > 2706, duration: DURATION, cam, state, entities: E, byLayer, profile, ground, clouds, bake, shadowDx, body: [110, 80, 52], fx: { sky, ground: groundFx, over: overFx } };

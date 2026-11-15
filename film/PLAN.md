# The Long Thread — production plan

A paperfilm (see the `paperfilm` skill in `raycoding1-collab/Globe`, branch `ccr-f077ed5e-n128tc`,
folder `skill/paperfilm/`) about the whole history of China, 12.5 minutes long.
Title: **The Long Thread** — kicker: *a history of China, in paper*.
The motif: one shining silk thread, unwound from a cocoon in chapter 1, that runs on through the
Silk Road, trade and modern networks, and at the end is seen wrapped around the whole little planet.

The narration (77 lines) is final in `film/film.json`; timings come from
`tools/narrate.py`. Duration 750 s. Respellings of Chinese names live in `SAY` in `tools/narrate.py`.

## Status
- [x] Template copied, tools installed (Playwright symlink, Kokoro venv in /home/user/tts)
- [x] Research + script + narration timing
- [x] Chapter 1 built and judged (desktop, phone, phone sideways)
- [x] All chapters built (`src/film.js`, cut-outs in `src/kinds_china.js` and `src/kinds_modern_china.js`, close-ups in `src/sky_china.js`, looks in `src/people.js`)
- [x] Breakthroughs chapter (607.8–715.7, angles 2345..2700): Three Gorges, HZMB, Huajiang bridge, EAST tokamak, Micius + quantum computer, robot gala + marathon, dark factory, coal/solar/wind, forests
- [x] Ending: the whole timeline (7.6 laps of the globe) wound into a ball of red thread
- [x] Score + ambience rewritten in `tools/build_audio.py` (guzheng, erhu, dizi, xiao, guqin, pipa, bianzhong, gong, sheng; bone-flute theme returns at the end)
- [x] Review rounds + all automated checks (scan 1,002 frames 0 errors; playtest, endtest, in-app iPhone/Android, memory 96–137 MB on phones)
- [x] Atmosphere pass: an era look over the base sky for every age (`ERAS` in `src/film.js`), weather (`WX`: petals, sand, dust, mist along the curve, ginkgo leaves, snow on the northern wall), the bronze pour and Sanxingdui reworked, the Qin army under a storm
- [x] Modern era made spectacular: drone dragon over Shanghai, the high-speed network drawn onto a paper map 2008→2025, Tiangong overhead, the Long March 5's steam cloud, spray and a rainbow at the Three Gorges, white dolphins by the HZMB, a sea of cloud in the Huajiang gorge, field lines in EAST, gala spotlights and confetti, the dark factory's lamps going out, villages lighting up across the hills, glints on the solar fields
- [x] Published: https://tinyurl.com/the-long-thread → https://raycoding1-collab.github.io/China-/ (`sh tools/publish_pages.sh`)
- [x] Share image (Zheng He's fleet), icon, title text, README

## Globe layout (angle ranges) and scenes

| Chapter | t (s) | angles | Scenes (every line gets a picture) |
| --- | --- | --- | --- |
| The bone flute | 0–46 | −40..110 | Jiahu village at night, round thatched huts, fire, a seated flute player, cranes in reeds (one dances when the flute plays), pigs, Milky Way. Dawn: Yellow River (ochre) with millet + farmer; Yangtze (blue) rice paddies, buffalo, cone-hat farmer. Mulberry trees, a woman reeling silk: the golden thread starts here. |
| Bronze and bone | 46–97 | 125..300 | Dusk/night. Shang hall on rammed earth; bronze pour (glow, sparks) → ding vessels spring up. Diviner at fire; close-up card: turtle plastron, hot rod, crack (卜 shape) grows, characters carved; then oracle signs morph to modern 日 月 人 木 山. Sanxingdui by torchlight: big mask whose eyes spring out on stalks, bronze tree, tall figure. |
| A hundred schools | 97–139 | 315..470 | Day. Zhou king; the Mandate scroll lowered from the sky on a thread, tugged back up a little at "take away". Seven state banners; chariots; banners rise and fall. Confucius under an apricot tree with students and bamboo-slip books; Daoist by a stream, water drips on a stone; Laozi on an ox; Sunzi: two paper armies face off, one bows and walks away. |
| The First Emperor | 139–187 | 485..660 | Six banners fold, black Qin banner rises; emperor in mian crown. Hanging icons: many scripts → one, knife/spade coins → round coin with square hole, weight, two carts in the same ruts. Rammed-earth wall segments + beacon towers with smoke. Terracotta army rows in three layers; a 1970s farmer digging a well finds a clay head. Qin banner folds at "fifteen years". |
| The Silk Road | 187–239 | 675..880 | Han que-tower palace, lanterns. Zhang Qian with envoy's staff walks west over dunes, camels follow; the thread draws west. Icons ride it: silk west; horse, grapes, glass east; later the dharma wheel. Papermaker at a vat, sheets drying; "This whole little world is made of it": the whole world rustles. Close-up card: Zhang Heng's seismoscope; ground shakes; a ball drops from a dragon into a toad. |
| Long divided | 239–258 | 895..960 | A hanging sheet with the empire's seal tears into three and rejoins in time with the quote. Cliff with a carved giant Buddha, monks with lamps, a bodhi tree grows. |
| The Tang | 258–316 | 975..1185 | Grand Canal fills with water along its length, barges. Exam cells in a row, candidates writing by candle. Chang'an gate + brick Big Wild Goose Pagoda, Sogdian/Persian merchants, camels, lanterns. Wu Zetian on a throne, courtiers bow. Night: Li Bai in a cutaway room; moonlight patch frosts the floor; he raises his head to the paper moon, lowers it: a far vision of home. |
| The Song | 316–355 | 1200..1345 | Kaifeng: rainbow bridge, boats, teahouses. Alchemist's furnace: flash, puff, hat flies. Night: rockets and fireworks (big light moment). A junk; hanging compass, needle swings and settles south; paper money notes drift between merchants. Bi Sheng's clay type tray; pages fly. |
| Mongols and Ming | 355–404 | 1360..1570 | Mongol riders, yurts, Kublai's throne. A begging monk folds and pops back as the Ming emperor. Forbidden City hall; Ming brick wall over mountains with watchtowers. Zheng He's nine-masted treasure ship + fleet; African coast. Giraffe on deck; at court, courtiers bow to it beside a hanging qilin card. |
| The last dynasty | 404–457 | 1585..1790 | Manchu bannermen ride in. Maize/sweet potato terraces; a paper-doll chain unfolds longer and longer (400 million). Canton waterfront: tea, silk, porcelain ride a thread to a European ship, silver rides back. Opium crates; destroyed; British steam warship, cannon smoke; junks fold. Dim: Taiping, figures fold. A boy of six on a huge throne; the throne folds. |
| War and revolution | 457–483 | 1805..1890 | Shanghai Bund, tram, rickshaw; warlords. 1937: bombers, the town folds, fires on the horizon (restraint, no melody). 1949: red flag rises over the gate, crowds. |
| Mao's China | 483–524 | 1905..2045 | Village school, barefoot doctor, an old woman. Backyard furnaces glow; crops fold; dim light; paper figures fold. Wall of paper posters; students turn their backs on a teacher. Tu Youyou in a lab, an old book hangs, sweet wormwood grows; people pop back up: millions saved. |
| Opening up | 524–574 | 2060..2260 | Red gates swing open; container ships, cranes. Shenzhen: fishing huts fold as towers spring up. Doll chain: nine of ten grey → all coloured. 1989: dusk, a column of tanks, one person stands; the tanks stop (restraint). Night: power line over karst hills, a spark runs pole to pole, village windows light one by one, then the whole hillside. |
| Today | 574–608 | 2275..2345 | Night city: Oriental Pearl–style tower, twisted tower, lit windows, phones. High-speed train (bent along the curve) on viaducts through karst. Rocket from a gantry; close-up card: far side of the Moon — no Earth in the sky, the relay satellite instead; lander, rover tracks; 2024 scoop and ascent. Coal plant cooling towers + smoke; solar fields and turbines spring up; EVs. Poplar rows spring up across dunes. |
| Breakthroughs | 608–716 | 2345..2700 | See status. |
| The long thread | 716–750 | 2695..2900 | Pull back to the whole planet; the thread winds the globe into a ball. Blank boards rise ahead. Title at 735.6. |

## Light
fire → bronze pour → oil lamps/candles → Tang lanterns → Song fireworks → Ming palace lanterns →
gas lamps in treaty ports → wartime dark → village electrification (big moment, night) →
LED city and train lights → dawn over uncut board.

## Score
Pentatonic theme (D gong: D E F# A B). Opens on a lone bone flute (11.6 s); guzheng for the first
fields; bronze bells and drums for the Shang; guqin and xiao for the thinkers; gong, sheng and war
drums for Qin; the whole ensemble (dizi, erhu, pipa, guzheng) on the Silk Road; erhu for the long
division; xiao and guqin under Li Bai's poem; piano, pulses and pads join from 1978. Hard moments
(opium wars, 1937, famine, Cultural Revolution, 1989): no melody, low strings and a drone only.
The bone flute returns at 713 s, before the pull-back.

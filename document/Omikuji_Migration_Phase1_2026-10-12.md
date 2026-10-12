# Forest Omikuji Migration: Phase 1

## Scope and Source

GitHub HTML/CSS/JS/JSON remain authoritative. The original Wix folder is read-only reference:
`C:/Users/kakao/Desktop/TeaMerry＿基本DATA/Forest（新HP）/おみくじ`.
Inventory: 27 files, consisting of 7 TXT files and 20 PNG files.
The earlier investigation message's count of 22 images was incorrect.

TXT sources:

- おみくじ_コード/おみくじコードAA.txt
- おみくじ_コード/おみくじ日本語＿コード.txt
- おみくじ_コード/おみくじ入口＿コード.txt
- おみくじ_コード/おみくじ本文コード.txt
- おみくじ_コード/おみくじ本文コードAAA.txt
- おみくじ結果_テキスト/おみくじ結果コード（2025.11.19.）txt.txt
- おみくじ結果_テキスト/おみくじ結果ページコード20251127.txt

The Japanese code and 20251127 result file are identical. They contain 25 fortunes.
Selected source SHA-256:
`f9518ed61551676e95bf4a3fecb5d1220d62e42dfec67e5f148f3b8b80f7a137`.
No English result data was found; an English illustration is not a translation dataset.
No source files were changed, removed or moved.

## Preserved Data and Logic

`data/omikuji/ja.json` retains title, main, love, work, item, quip and original char association
exactly. Only a stable resultId is added to each record.
The original work field is displayed as 金運, matching the source's visible label.
The original ★ ratings remain in JSON; display converts them to 🍃, as Wix did.
Labels retain 💓, 💰 and 🎁. Selection remains equal-probability
`Math.floor(Math.random() * results.length)`, without rankings or weighting.

`tools/omikuji/extract-wix-data.cjs` extracts the literal fortunes array with Acorn AST parsing;
it never executes Wix code. Acorn is only needed for offline extraction/source-parity tests,
not for the website. Set OMIKUJI_ACORN_PATH when using an external Acorn installation.

## Runtime

Entry and result are two views in `omikuji.html`; no introductory landing page is added.
The original transparent wooden tube is the large native button target.
Mobile shows one of 10 existing fairy assets for 1100 ms, after a 350 ms entry delay.
Candidates: Aco, Berry, Bumpy, Curly, Lavi, Lemon, Lilu, Miiru, Mint and Tiara.
Elder is excluded. The supplied fairy PDF was checked visually against existing assets.
The previous fairy ID is stored locally, when storage is available, to avoid immediate repeats.
Desktop does not show the peek effect.

Tapping hides the fairy, runs a modest 420 ms shake and plays the original dedicated sound.
Result appears after 2000 ms, following the simple original entrance timing.
Other saved Wix variants used sound-ended transitions and 3/4-second fallback timers;
those contradictory variants were not copied into the shared runtime.
The result retains text, ratings, lucky item, original character and quip.
Retry returns to entry; Forest return points to index.html.

One Audio instance is owned by this page. pagehide, Forest return and hidden-tab events
stop/reset that audio and suspend the reveal timer. Returning resumes only the remaining
delay, without replaying sound. Repeated taps are disabled while drawing.
No Forest audio manager, navigation, Mint, observatory, submissions or TBalance code is changed.
Text uses textContent, not HTML interpolation. Failed data loading provides a retry action.

## Local Assets and Wix Independence

- tube.png: original おみくじ_素材/tutu_omikuji.png.
- result-01.png through result-07.png: the seven original Wix character images,
  downloaded unchanged and mapped by config. Original URLs remain provenance identifiers
  in result JSON but are never requested by the runtime.
- omikuji-shake.mp3: original
  https://static.wixstatic.com/mp3/e0436a_e970d9dc296e4cfda3e61718cb2648c3.mp3
- shrine-background.webp: background-only edit of the supplied shrine reference.
- paper.png: plain-paper edit of original おみくじ用紙SS.png. The original decorative leaf
  overlapped result text when stretched; original source remains untouched.
- Peek fairies: existing assets/images/forest_fairy/*_v01.webp.

Runtime has no Wix SDK, Wix navigation, Wix banner, third-party image or sound requests.
Config separates locale/UI/data and original-character asset mappings.
Only ja is currently available; an unsupported lang query falls back to ja.
No English translation has been invented.

## Generated Asset Prompts

Background source:
`C:/Users/kakao/Downloads/森の神社のおみくじボックス.png`.
Generated original:
`C:/Users/kakao/.codex/generated_images/01a01ac6-039d-7d31-b9c3-7ea3ddbf07e7/exec-4846cb93-4b99-4278-8a0f-ac91c35f84d7.png`.
Project output: assets/images/omikuji/shrine-background.webp (and docs mirror).

> Edit this reference into a background-only asset for the TeaMerry Forest fortune-drawing website, portrait composition. Preserve its warm handmade miniature/clay forest shrine atmosphere, softly defocused red torii gate in the upper-middle background, mossy stone pedestal in the lower foreground, gentle natural daylight and quiet green forest. REMOVE the entire wooden fortune cylinder, REMOVE the fairy, REMOVE the floating Japanese button/sign and all writing and little white emphasis strokes. Fill those areas naturally with continuous blurred forest and the mossy stone surface. The center must remain empty for a separate interactive wooden cylinder supplied in HTML. Keep one modest shrine lamp at the right if present. No new objects, no mushrooms, no magical glow, no extra lanterns, no lettering or UI. Background must be softly subordinate to foreground interactive artwork, not spectacular fantasy CG. Full-bleed clean vertical bitmap, no border.

Paper source: おみくじ_素材/おみくじ用紙SS.png.
Generated original:
`C:/Users/kakao/.codex/generated_images/01a01ac6-039d-7d31-b9c3-7ea3ddbf07e7/exec-eee6133f-3fc8-49c0-af24-6b95fd93b6ba.png`.
Project output: assets/images/omikuji/paper.png (and docs mirror), resized to width 480.

> Edit this image into a plain, seamless-looking paper background asset for a Japanese forest fortune result. Preserve the pale warm ivory/yellow handmade paper material and very subtle fiber texture. REMOVE the green leaf completely and remove all rounded frame edges and border, filling the entire rectangular image uniformly with the existing interior paper material. No objects, no icons, no text, no frame, no shadows, no decoration, no glow or specks. Flat softly textured paper only, low contrast, so dark result text is legible everywhere. The website will add its own layout, border and content.

## Changed Files

- omikuji.html, css/omikuji.css, js/omikuji.js.
- data/omikuji/config.json and ja.json.
- assets/images/omikuji: tube, paper, shrine background and 7 original result images.
- assets/sounds/omikuji-shake.mp3.
- Matching docs copies of the above.
- index.html and docs/index.html: only the shrine URL changes to ./omikuji.html.
- tools/omikuji/extract-wix-data.cjs, tools/tests/omikuji.cjs and this record.

## Verification

Test command: node tools/tests/omikuji.cjs, with Playwright installed.
Optional OMIKUJI_SOURCE and OMIKUJI_ACORN_PATH enable exact original-data comparison.
OMIKUJI_TEST_BASE_URL switches to the published site.

Covered: all 25 original records, uniform-selection boundaries, 10 candidates without Elder,
local asset existence and image decoding, root/docs consistency, 320/375/390/412 mobile,
667x375 landscape, 1366x900 desktop and docs mobile.
Browser checks include tube tap, fairy hide, shake, actual Audio playing/paused state,
result contents, retry, rapid-tap guard, hidden-tab pause/resume, loading failure/retry,
safe text, unsupported locale and reduced motion, no external runtime requests,
no horizontal overflow and stable screenshots after reveal animation.

The pre-existing mobile-forest-guide-map test is preserved unchanged because it was
already untracked at task start. Its old Wix shrine expectation is replaced in memory
when running it against the migrated page. The test still exercises all 7 actual links,
map numbering, image decoding, touch scrolling, close and stick restoration.
Physical iPhone/Safari testing and listening to the sound on a real device remain manual checks.

## Git Safety and Phase 2

At task start: 20 modified tracked files and 89 untracked path groups.
Existing changes are protected. Shared index files are partially staged: only shrine-link
hunks, excluding the pre-existing name-modal wording changes.
No unrelated TBalance, submission, observatory or Forest runtime changes are included.

Phase 2: third destination action, character navigation remarks, English data after receiving
the original English source, further PC-specific work and fine visual adjustments.

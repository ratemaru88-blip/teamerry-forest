# Mobile Forest Navigation - 2026-10-12

## Scope
- HTML/CSS/JS remain the source authority. Root and docs copies are synchronized.
- Mobile breakpoint remains max-width:759px; desktop behavior remains unchanged.
- Added files: css/forest-mobile-navigation.css, js/forest-mobile-navigation.js, docs equivalents, tools/tests/mobile-forest-navigation.cjs.
- Extended index.html / forest.js and their docs copies. No TBalance changes.

## Navigation
- Stick: lower left, 28vw (90-150px), minimum 26px edge inset plus safe areas.
- Four direction markers, center knob, dead zone 10%, pointer capture, normalized diagonal movement.
- Constant 240 screen pixels/second via requestAnimationFrame; frame delta capped at 50ms.
- Reuses the existing camera renderer and clamping. Manual input cancels mobile camera animation.
- Stops on release/cancel/lost capture, blur, pagehide, hidden document, resizing, modal opening.
- Arrow keys work when the stick has focus.
- Two-axis swipe retains the existing camera drag. Gestures starting within 24px of side edges are not captured by the camera.
- Mobile uses a viewport-height scene instead of native 180vh document scrolling. Safari's native back gesture is not forcibly prevented.
- Title and redundant floating observatory portal are hidden only on mobile; observatory remains in the guide.
- Guide dialog reuses all seven existing portal URLs/artworks; native dialog focus/Escape/close handling.
- The full illustrated map is a future phase. Its future introduction should mention free play, no registration, anonymous names, strolling and direct destinations.
- Mobile Mint: short 7-second guide on first use and after closing name selection. Existing periodic speech is suppressed on mobile.
- Hidden mobile walker no longer writes positions every frame. Desktop characters/time/background logic untouched.
- Mobile name text follows the approved anonymous/nonregistration wording without including the prior unstaged desktop name edits.

## Verification
Run with Node and Playwright available:
```powershell
$env:NODE_PATH = '<runtime>/dependencies/node/node_modules'
node tools/tests/mobile-forest-navigation.cjs
# Optional: FOREST_TEST_BROWSER=chrome, FOREST_TEST_STAGED=1,
# FOREST_TEST_BASE_URL=<published URL>, FOREST_TEST_ARTIFACTS=<directory>
```
Includes 320x568, 375x667, 390x844, 412x915, docs mirror, real Chromium touch input, keyboard directions, cancel/release, clamp boundaries, swipe, edge gesture exclusion, map images, first/return guide, names, desktop drag/title/Mint/background and responsive transitions.
Screenshots are external artifacts, not staged repository assets.
No physical iPhone/Safari is available; system back-gesture behavior and low-end-device performance still require real-device checks.

Local results: staged-code Edge and Chrome mobile tests passed at all listed sizes.
PC normal interaction, all four time presets, saved nickname and musical arrival checks passed.
Moving requestAnimationFrame interval p95 was 16.7-16.9ms on this desktop test environment; this is not a physical-phone performance guarantee.

## Git Preservation
Baseline captured before edits; unrelated files are not staged, reverted, moved or deleted.
Name-message hunks already present in forest.js/index.html (including docs copies) are excluded by partial staging.
The baseline had 19 modified tracked paths. Other concurrent changes may occur; only the task's explicit paths/hunks are committed.

### Baseline Status
```text
M css/observatory.css
 M data/tbalance/project-assets.json
 M docs/forest.js
 M docs/index.html
 M docs/observatory.js
 M docs/tools/tbalance/tbalance-renderer.js
 M forest.js
 M index.html
 M observatory.js
 M tools/tbalance/ai-bridge/server.mjs
 M tools/tbalance/index.html
 M tools/tbalance/launch-tbalance.ps1
 M tools/tbalance/native/native-asset-storage.mjs
 M tools/tbalance/native/native-assets.js
 M tools/tbalance/native/native-migration.js
 M tools/tbalance/native/native-schema.js
 M tools/tbalance/tbalance-renderer.js
 M tools/tbalance/tbalance.css
 M tools/tbalance/tbalance.js
 M tools/tests/submissions.cjs
?? TeaMerry_Dialogue_Spreadsheet_Template.tsv
?? TeaMerry_Dialogue_Spreadsheet_Template.xlsx
?? TeaMerry_Dialogue_Spreadsheet_Template_Elder.tsv
?? TeaMerry_Dialogue_Spreadsheet_Template_Forest.tsv
?? TeaMerry_Dialogue_Spreadsheet_Template_Lil.tsv
?? TeaMerry_Dialogue_Spreadsheet_Template_Maroud.tsv
?? TeaMerry_Dialogue_Spreadsheet_Template_Mint.tsv
?? TeaMerry_Dialogue_Spreadsheet_Template_Other.tsv
?? _codex_screenshots/
?? assets/backgrounds/external-background-test-20260921-02.webp
?? assets/backgrounds/external-background-test-20260921-03.webp
?? assets/backgrounds/external-background-test-20260921.webp
?? assets/backgrounds/observatory_day_pc_v02.webp
?? assets/backgrounds/observatory_night_pc_v02.webp
?? assets/characters/
?? assets/icons/tbalance.ico
?? "assets/images/Corel 自動保持/"
?? "assets/images/forest_fairy/agent_generate_image - Create a contact sheet for this character_ Berry_ a small ch_.png"
?? "assets/images/forest_fairy/agent_generate_image - Create a contact sheet for this character_ Bumpy_ a small ro_.png"
?? "assets/images/forest_fairy/agent_generate_image - Create a contact sheet for this character_ Lemon_ a small ch_ (1).png"
?? assets/images/tea_room/tea_room_mobile_bg_03.webp
?? assets/images/ui/ぼつ/
?? assets/images/yunokaori/chachaji_front_正面１.png
?? assets/images/吹きだし画像/
?? assets/other/
?? assets/sounds/bottle_water_landing_v01.mp3
?? assets/sounds/kan_ge_kawa06.mp3
?? assets/sounds/sei_ge_mizu_chapon02.mp3
?? assets/sounds/soundreality-bubble-pop-reverb-424582.mp3
?? assets/sounds/yunokaori_bgm.mp3
?? assets/tbalance-projects/
?? data/bottle_mail/Lill_Action_Reactions_v01.csv
?? data/bottle_mail/Lill_Action_Reactions_v01.xlsx
?? data/dialogue/Lill_Action_Reactions_v01.xlsx
?? data/dialogue/dialogue.connection-test.json
?? data/tbalance/projects/
?? document/Forest_2026-10-06_ぼくの宝物SNS導入.md
?? document/Security_Backup_Codex_Audit_2026-10-07.md
?? document/Submission_System_2026-10-08.md
?? document/TBalance_2026-10-04_TESTの画面内スクロール.md
?? document/TBalance_2026-10-04_作品別ライブラリーと容量.md
?? document/TBalance_2026-10-04_再開と背景保存.md
?? document/TBalance_2026-10-04_当たり判定とページ内スクロール.md
?? document/TBalance_2026-10-04_画像ライブラリー整理.md
?? document/TBalance_2026-10-04_画面ごとの編集.md
?? document/TBalance_2026-10-04_縦スクロール.md
?? document/TBalance_2026-10-06_Mobile本編制作中札.md
?? document/TBalance_2026-10-06_PC-Mobileカラー白黒ペア展開.md
?? document/TBalance_2026-10-06_PC1カラー白黒ペア_Phase1.md
?? document/TBalance_2026-10-06_カカオ吹き出し対応.md
?? document/drift-bottle-letter-mobile-after-rebase.png
?? document/drift-bottle-letter-mobile-final.png
?? document/drift-bottle-letter-mobile.png
?? document/drift-bottle-letter-pc-after-rebase.png
?? document/drift-bottle-letter-pc-final.png
?? document/drift-bottle-letter-pc.png
?? document/submissions-test/
?? musical/boku-no-takaramono/README.md
?? musical/boku-no-takaramono/all-color-reveal-complete.tbalance
?? musical/boku-no-takaramono/all-color-reveal.tbalance
?? musical/boku-no-takaramono/assets/
?? musical/boku-no-takaramono/bridge-core.js
?? musical/boku-no-takaramono/chapter-01.tbalance
?? musical/boku-no-takaramono/chapter-02.tbalance
?? musical/boku-no-takaramono/chapters.json
?? musical/boku-no-takaramono/editor.css
?? musical/boku-no-takaramono/editor.js
?? musical/boku-no-takaramono/index.html
?? musical/boku-no-takaramono/kakao-message.tbalance
?? musical/boku-no-takaramono/launch-phase1.ps1
?? musical/boku-no-takaramono/layout-isolation.js
?? musical/boku-no-takaramono/mobile-production-label.tbalance
?? musical/boku-no-takaramono/page.css
?? musical/boku-no-takaramono/page.js
?? musical/boku-no-takaramono/pc1-color-reveal.tbalance
?? musical/boku-no-takaramono/pc1-preview.html
?? musical/boku-no-takaramono/pc1-preview.js
?? musical/boku-no-takaramono/serve-phase1.cjs
?? tools/maroudo-board-editor/まろーど掲示板エディター＿手順書.png
?? tools/tbalance/native/add-mobile-production-label.mjs
?? tools/tbalance/native/configure-kakao-message.mjs
?? tools/tbalance/native/create-pc1-background-pair.mjs
?? tools/tbalance/native/extend-background-pairs.mjs
?? tools/tbalance/normal-web-workflow.js
?? tools/tbalance/project-size.js
?? tools/tbalance/recent-projects.js
?? tools/tbalance/scroll-layout.js
?? tools/tbalance/tests/
?? tools/tests/mint-name-message.cjs
```

## Icon Attribution
Map, X and ChevronUp SVG icons use Lucide's ISC-licensed paths.
Copyright (c) Lucide Contributors.
Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.
THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

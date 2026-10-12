# Mobile Guide Map UI - 2026-10-12

## Scope and Assets
- Existing HTML/CSS/JS authority is retained. No TBalance, Mint, stick-motion or PC scenery changes.
- Reused tracked assets/backgrounds/Forest_Master_Day.png (1920x1080) and its existing docs mirror. No new scenery or destinations.
- Forest_Master_Map_v1 remains the authoritative geographic baseline. Its maintenance labels and path markings are too dense for a small public guide; the unannotated day artwork depicts the same terrain.
- The source PNG is approximately 4.7 MB and loads lazily when the dialog is visible. A smaller derived asset is a possible future bandwidth improvement; no asset conversion in this phase.

## Number Correspondence
1. ① 雫ゲーム
2. ② フォーチュンクッキー
3. ③ 森のおみくじ
4. ④ 湯の香り温泉郷
5. ⑤ 忘れ時の洞窟
6. ⑥ まろうど茶房
7. ⑦ 星風のテラス

Both marker and card are created in the existing portal DOM order. Names, URLs and small artwork are read from those portals.
Marker positions use the portal's CSS world anchor and world dimensions, not viewport/camera screen positions.
The fixed observatory portal uses its existing forest.js world anchor (1560,220).
Markers are visual only in V1; whole-card links are the primary navigation.

## UI
- White dialog, restrained warm frames, 6px corner radius, small shadow, 22px number glyphs.
- Existing top-right map button position unchanged.
- Overview plus short introduction above seven cards, no added registration text.
- Whole-card tap area is at least 82px high; 16px names, 15px descriptions, horizontal 14px "いく" cue.
- Tiny screens omit only the decorative thumbnail, retaining number/name/description/action.
- Fixed dialog header keeps the 44px close control available while the content scrolls.
- Native dialog focus, Escape and backdrop closing remain.
- Stick is hidden only during map display, restored on close; movement loop already stops on open.
- Root and docs CSS/JS copies remain synchronized; HTML updates only the two map asset cache versions.

## Changed Files
- css/forest-mobile-navigation.css
- js/forest-mobile-navigation.js
- docs/css/forest-mobile-navigation.css
- docs/js/forest-mobile-navigation.js
- index.html (cache URLs only)
- docs/index.html (cache URLs only)
- tools/tests/mobile-forest-guide-map.cjs
- document/Mobile_Guide_Map_UI_2026-10-12.md

## Verification
- New guide test: 320x568, 375x667, 390x844, 412x915, 667x375 and docs mirror.
- Map image decoding, seven readable numbers, matching card numbers, names, descriptions, target URLs and whole-card click navigation.
- Tests intercept navigation requests, avoiding unnecessary external visits, while checking each exact existing destination URL.
- Genuine Chromium touch scrolling, bounds, close/Escape and stick restoration.
- Existing mobile-forest-navigation.cjs covers camera, stick, swipe, names, Mint, PC drag/title and four time presets.
- Physical iPhone Safari is not available; real-device validation remains outstanding.
- Local Chrome and Edge checks passed across the listed portrait/landscape sizes and docs mirror. The existing navigation regression suite also passed, including desktop time presets and Mint.

## Git Safety
Existing modified/untracked paths were captured before edits. No unrelated files are staged, reverted, moved, removed or cleaned.
Only cache-version hunks of the already-dirty HTML files are staged; pre-existing name-message changes remain outside this commit.
Baseline inventory:
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

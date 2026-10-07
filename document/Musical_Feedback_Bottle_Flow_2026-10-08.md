# Musical Feedback Bottle Flow / 2026-10-08

## Authority and Scope

- Native: `musical/boku-no-takaramono/feedback-flow.tbalance`, derived from Downloads `僕の宝物 (11).tbalance` in the previous publication.
- PC 1920x1080 / Mobile 1080x1920; saved HitArea positions and all Native Actions unchanged in this revision.
- Adapter `TeaMerryMusicalFeedback.open` navigates to existing Observatory bottle writer in `musical_feedback` mode.
- Mode requires exact type, work and return tokens. Return URL is a fixed same-origin musical page, never a caller-supplied external URL.
- Former white dialog implementation remains uncalled, without creating any dialog or name input.

## Name Authority

- Uses existing `teaMerryDisplayName` and `getObservatoryDisplayName`, the same authority as the Mint/Forest/bottle flow.
- Configured name is submitted unchanged; unset/unavailable storage falls back to `お散歩さん` for musical feedback.
- No new name field or feedback-specific name storage. Receiver and existing input validation/deduplication unchanged.

## Presentation and Submission

- Existing cream stationery, desk, bottle and decorations remain. Mode-only title: 感想を書く.
- Existing 300-character input/counter, internal textarea scrolling; mode-only height 34% -> 39%.
- Type `musical_feedback`, workId `boku-no-takaramono`; failed saves retain text and stable requestId for retry.
- Only confirmed save starts existing `bottle_flush_v02.mp4` path. No bottle local history, public/private choice, normal bottle event or normal three-line Reaction.
- Video completion/error/existing fallback closes overlay; Lill displays 大切に読ませていただきます。 exactly once, followed by fixed musical return after 3500ms.
- No new success modal/toast for feedback. Normal bottle/wish sequences unchanged.

## Verification

- `tools/tests/submissions.cjs`: GAS validation/deduplication; root/docs x PC/Mobile; no name input, unset and Mint-configured names, 300/301/empty, retry retention and ID, feedback animation completion and internal return, compressed-height textarea; ordinary bottle/wish three-line Reaction regression.
- `tools/tests/published-musical.cjs`: four-screen PC/Mobile assets, canvas alignment/reveal, Kakao message and production label.
- `tools/tests/feedback-native-final.cjs`: saved Native import, TEST rendering, PC/Mobile Actions and FINAL.
- Public live check: pending deployment; exactly one new TEST submission will be made.

## Files and Git Safety

- `observatory.js`, `docs/observatory.js`
- `js/musical-feedback.js`, `docs/js/musical-feedback.js`
- `css/submissions.css`, `docs/css/submissions.css`
- `tools/tests/submissions.cjs`, this record
- Existing 13 modified and 88 untracked entries are preserved and excluded from staging. No Core, source .tbalance, assets, GAS, cleanup, reset/restore/clean or force push.
- Real mobile OS keyboard behavior cannot be fully reproduced by desktop browser viewport tests.

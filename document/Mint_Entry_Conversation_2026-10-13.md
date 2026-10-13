# Forest Entry and Mint Conversation

## Investigation

The old idle timer requires the mobile walker to be enabled, but scheduling is disabled on mobile. The newer GuideVisit policy also previously ran only on mobile. PC therefore had no useful scheduled conversation apart from unrelated ambient narration.

Existing forest.js, index.html and their docs mirrors already contained uncommitted work before this change. Those changes were retained; no staging, commit, restore or deletion was performed.

## Changes

- Short two-line greeting/name prompt and explicit anonymous-entry button.
- Short-screen dialog spacing keeps the name field and both choices visible.
- Shared forest-guide.json and GuideVisit run on PC and mobile; existing renderer/camera/guide character reused.
- Welcome includes the stored display name and a quiet invitation to play freely.
- Minimum 45-second cooldown, 30-second idle threshold, eight utterances per visit and five idle lines at most. Each line is used once per visit; last idle hint is avoided on return.
- PC proximity uses pointer distance to visible corner positions. Mobile proximity uses the visible forest region, retaining existing navigation.
- Shrine and drop-game corner hints, map hint, quiet forest/acorn/Cacao hints and a PC-only sunset hint.
- No new narration timer. Existing event-specific notifications remain.
- Existing speech cannot be overwritten by another utterance. Name dialog, other dialogs, hidden tab and blur suppress guide conversation.
- Short walking conversation is eligible during ongoing movement on PC and mobile. Continuous stick input does not hide a newly started line; a new mobile input gesture can dismiss the previous line.
- The terrace entrance now lives inside the forest world layer, like every other corner. Its anchor is (1640, 330), beside the stairway lantern rather than over the trees, with a 44px world width. CSS handles camera movement and resizing with no independent fixed positioning or visibility calculation. Guide proximity uses the entrance's actual rectangle; map markers use its CSS coordinates. The existing opening-scene hiding remains.
- Existing musical name flow and name persistence unchanged.

## Verification

Policy unit tests passed. Browser tests passed for compact anonymous entry, named/anonymous save, returning names and musical routing on PC/mobile and docs mirror. Clock-controlled PC/mobile tests verify welcome, no overlap, recurring idle conversation and actual PC shrine proximity after camera movement. Screenshots inspected on PC and 320px mobile.

Omikuji overlay regression passed for PC and docs mirror; Forest state/audio were preserved. Mobile navigation regression passed at 320x568, 375x667, 390x844, 412x915 and docs 390x844, including touch hold/release/cancel, boundaries, swipes, map and repeated idle conversation. PC drag and all four time presets also passed. Real device testing remains pending.

Walking conversation and visible, clickable terrace navigation passed at 390x844 and 1366x900 in all four time presets. Camera movement, resizing, and actual navigation also passed with the revised lantern-side placement. After local review, the user approved publication of this batch.

## Scope

No observatory dialogue, visitor submissions, forest soundscape, game content or TBalance modifications in this batch. Files outside the requested behavior remain uncommitted and unstaged.

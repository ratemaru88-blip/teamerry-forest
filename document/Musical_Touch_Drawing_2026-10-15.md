# Musical Touch Drawing

## Cause

The published musical uses TakaramonoScratch.mount in scratch.js. Mobile enables mouse/touch/pen input and listens on the stage. The canvas and its parent previously passed hit testing through, while the canvas explicitly allowed pan-y. Native scrolling could therefore take ownership of a finger gesture and cancel pointer drawing.

## Minimal Fix

Only enabled scratch mounts whose existing pointerTypes include touch make their canvas hit-testable and set touch-action: none. The browser can choose drawing instead of scrolling from touch start. Mouse-only PC mounts retain their old pointer-events and pan-y settings. Ancestor/page scrolling is not disabled; touches that begin outside the canvas retain the normal scroll behavior.

No drawing math, brush size, pointer handlers, reveal logic, layout, judgement, save data or persistence code is changed. No extra global event handlers or preventDefault calls are needed. Canvas disposal naturally removes the local gesture policy with the element.

scratch.js and pair-preview.html cache version were updated in root and docs mirrors.

## Verification

tools/tests/scratch-touch-scroll.cjs uses Chromium native touch input with Android/iPhone user agents and 390x844/375x667 viewports. It checks scrollTop during drawing, continuing pointer strokes, actual transparent pixels, native scrolling beginning outside the canvas, touch cancellation, subsequent strokes and dispose/remount reset. docs mirror and PC mouse reveal on all four canvases pass.

Existing published-musical.cjs regression also passes desktop/mobile assets, alignment, color reveal, character message/label and JS dependencies. Real Safari/iPhone and Android hardware testing remains pending; these are browser-emulated touch tests, not physical devices.

No staging, commit or push requested. Existing unrelated modified/untracked files remain untouched.

Reference: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/touch-action

# Musical Share Metadata

## Findings

The existing index.html and docs mirror had no explicit Open Graph/Twitter metadata. Common preview icons were therefore inferred, rather than configured OGP.

GitHub Pages serves static HTML. Query aliases of index.html do not produce different server-side metadata. Changing metadata from JavaScript is not a reliable crawler strategy. The existing ?story=bokunotakaramono URL and all story-entry logic remain untouched.

## Sharing

After publication, share:

https://ratemaru88-blip.github.io/teamerry-forest/bokunotakaramono.html

The new HTML has static musical title/description/image tags, summary_large_image and its own canonical/og:url. It does not use HTTP or meta-refresh redirects, which could make crawlers follow the forest page before reading its metadata. JavaScript-enabled visitors are redirected to ./index.html?story=bokunotakaramono, the same entry document and query used by the existing forest URL. A real anchor is available when JavaScript is disabled.

The original root URL with ?story=bokunotakaramono still works as before, but continues to use common forest metadata. Use the new sharing URL for the dedicated preview.

## Image

The supplied Desktop path did not exist. The matching file was found in Downloads and visually verified against the attachment:

C:/Users/kakao/Downloads/ぼくの宝物：夕暮れの絵描きたぬき.png

Copied unchanged to assets/images/bokunotakaramono/bokunotakaramono_og.png and its docs mirror. PNG is 1254x1254, 2,553,588 bytes. No cropping or recomposition.

## Changes

- New bokunotakaramono.html and docs/bokunotakaramono.html.
- New musical PNG in root/docs assets.
- index.html and docs/index.html: head-only common forest OGP/Twitter tags using the existing icon-512.png.
- New tools/tests/musical-share-ogp.cjs and this note.
- No forest.js, dialogue, name persistence, destination, manifest, or navigation logic edits.

## Verification

Crawler-mode (JavaScript disabled) tests verify static title, description, image, card type, separate canonical URL and exact image bytes. Desktop 1440px/mobile 390px tests pass shared-page redirect, original story welcome, named and anonymous entry, actual musical destination navigation and returning-name flow on both root and docs.

Actual LINE/SNS previews and cache refresh require publication and external-platform verification. No stage, commit or push for this batch.

References: https://ogp.me/ ; https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site

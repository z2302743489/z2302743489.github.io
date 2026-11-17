# Portfolio font sources

Prepared 2026-11-16. This file covers public font research and local font asset preparation only.

## Original source and exact family mapping

The original [homepage](https://www.seanhalpin.xyz/) loads [this layout stylesheet](https://www.seanhalpin.xyz/_app/immutable/assets/__layout-a6ecd9ee.css). Its aliases are `acorn` for titles and `gt` for body text. The site's own [public layout module / colophon](https://www.seanhalpin.xyz/_app/immutable/pages/__layout.svelte-3feb1075.js) identifies the full names as “Acorn Semibold for headlines, GT Planar Regular for body copy”. These are separate commercial foundries' typefaces, not freely licensed Google fonts.

| Role | Original full family / cut | Original CSS alias and weight | Local replacement / use |
| --- | --- | --- | --- |
| Hero and display headings | **Acorn Semibold**, Simon Walker / Beasts of England | `acorn`; loaded face declared normal 400, heading style requests 700; browser computed 700 | **Bricolage Grotesque**, normal 700; variable 200–800 available |
| Body, English navigation, labels | **GT Planar Regular**, Grilli Type | `gt`; normal 400; browser computed 400 | **DM Sans**, normal 400; variable 100–1000 available, including 500/600/700 for UI emphasis |
| Chinese information / project text | Platform fallback | Not a Latin webfont | System **PingFang SC**, followed by Microsoft YaHei / sans-serif; no Chinese font binary bundled |

Original URL declarations, recorded as research evidence only: `https://www.seanhalpin.xyz/font/acorn.woff` and `https://www.seanhalpin.xyz/font/gt.woff`. Neither original font binary was requested, copied, converted, or saved. No original photos, artwork, project screenshots, or other media were fetched for this task.

Original font licensing evidence:

- [Acorn official product page](https://beastsofengland.co/products/acorn) and [Beasts of England EULA](https://beastsofengland.co/pages/test-page) require purchased licensing for the relevant use. No redistributable license was supplied for this reconstruction.
- [GT Planar official product page](https://www.grillitype.com/typeface/gt-planar), [Grilli Type EULA](https://cdn.grillitype.com/eula), and [US EULA](https://cdn.grillitype.com/eula-us) govern commercial licensed use and restrict sharing outside licensed uses. A publicly served font file does not establish permission to reuse it for another portfolio.

## Replacement choice and limitations

Bricolage Grotesque is the chosen free heading substitute: a low-contrast display grotesque with rounded bowls and distinctive, warm letterforms. DM Sans provides a quieter geometric grotesque for English body and navigation. The visual choice is a design judgment; neither font is Acorn or GT Planar, and neither promises identical outlines, kerning, or line breaks. Bricolage retains the broad, friendly heading character without using a serif fallback. Visual comparison and final line wrapping belong to the main UI implementation.

Both replacement families are officially distributed by Google Fonts under **SIL Open Font License 1.1**. This permits self-hosting, embedding, and redistribution alongside the website, including commercial use, with the copyright and license notices retained. Do not sell the fonts by themselves; keep the font software under OFL and observe any reserved-name conditions for modifications. The supplied WOFF2 files are unchanged bytes from Google's official font CDN; only their local filenames differ.

| Family | Official specimen | Official metadata | Official license | Downloaded coverage / axes |
| --- | --- | --- | --- | --- |
| Bricolage Grotesque, Mathieu Triay | [Google Fonts](https://fonts.google.com/specimen/Bricolage+Grotesque) | [METADATA.pb](https://raw.githubusercontent.com/google/fonts/main/ofl/bricolagegrotesque/METADATA.pb) | [OFL.txt](https://raw.githubusercontent.com/google/fonts/main/ofl/bricolagegrotesque/OFL.txt) | Latin, normal; `wght` 200–800, `opsz` 12–96, width fixed at 100% in this CSS request; CDN v9 |
| DM Sans, Colophon Foundry | [Google Fonts](https://fonts.google.com/specimen/DM+Sans) | [METADATA.pb](https://raw.githubusercontent.com/google/fonts/main/ofl/dmsans/METADATA.pb) | [OFL.txt](https://raw.githubusercontent.com/google/fonts/main/ofl/dmsans/OFL.txt) | Latin, normal; `wght` 100–1000, `opsz` 9–40; CDN v17 |

Exact official CSS requests used to resolve the WOFF2 sources, with a modern Chrome User-Agent:

- [Bricolage Grotesque CSS](https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,200..800&display=swap)
- [DM Sans CSS](https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,100..1000&display=swap)

Only the Latin subset is needed for the supplied English navigation and hero (`Hi. I’m Jianhang.` / `AI Product Manager.`). It includes the curly apostrophe U+2019 and general punctuation; the exact unicode ranges are retained in `fonts.css`. The optional Latin Extended and Vietnamese subsets were not downloaded. The upstream Bricolage family also has a width axis, but this delivered subset was requested at its default 100% width. Neither font contains Chinese; Chinese falls through the font stack. Italic files were not requested because the measured heading/body styles are upright.

## Files saved

| Local file (relative to portfolio root) | Bytes | SHA-256 | Download URL |
| --- | ---: | --- | --- |
| `assets/fonts/bricolage-grotesque-latin-variable.woff2` | 76,868 | `85f55a58a31e61a2e19e8bb25fed503181bf2a6b4cab76c589992cfaac377447` | [Official source](https://fonts.gstatic.com/s/bricolagegrotesque/v9/3y9K6as8bTXq_nANBjzKo3IeZx8z6up5BeSl9D4dj_x9PpZBMlGIInHWVyNJ.woff2) |
| `assets/fonts/dm-sans-latin-variable.woff2` | 62,556 | `aa530716b0d351866af7dbfa3eee4120fb36f2d071baff8c234185141865c7ff` | [Official source](https://fonts.gstatic.com/s/dmsans/v17/rP2Hp2ywxg089UriCZOIHTWEBlw.woff2) |
| `assets/fonts/BricolageGrotesque-OFL.txt` | 4,403 | `4b5a7d8f37f5602621c8a8d7358a6a2e71317e6c231c661e15aef0275d3e07ba` | [Official source](https://raw.githubusercontent.com/google/fonts/main/ofl/bricolagegrotesque/OFL.txt) |
| `assets/fonts/DMSans-OFL.txt` | 4,482 | `9af36190332437f5ecd09974de43c1f7c77a310a996cdd8ceb25628b458840e1` | [Official source](https://raw.githubusercontent.com/google/fonts/main/ofl/dmsans/OFL.txt) |

Also saved `assets/fonts/fonts.css`, containing only the two local `@font-face` definitions, their actual family names, weight ranges, `font-display: swap`, and the Google-provided unicode ranges. It applies no UI selectors or typography overrides. Total font binary payload: 139,424 bytes. Every asset is below 1 MB.

## Integration handoff for main agent

Load `assets/fonts/fonts.css` from the page head, or import it before other stylesheet rules. Font URLs inside that file are relative to the font stylesheet, so they continue to work on nested page routes when the stylesheet is linked correctly. Keep the actual replacement names in CSS; do not disguise these files as `acorn` or `gt`.

Suggested site-level family mapping (examples only; no source-page UI edits made here):

```css
:root {
  --titleFont: 'Bricolage Grotesque', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  --bodyFont: 'DM Sans', 'PingFang SC', 'Microsoft YaHei', sans-serif;
}
```

Use `font-weight: 700` for the English hero, `font-weight: 400` for ordinary body/navigation, and `font-optical-sizing: auto` for both families. Avoid an explicit `font-variation-settings` weight override, which could prevent normal weight rules from taking effect. Preserve the main agent's source measurements as the initial desktop typography: at a 1280 px viewport the original h1 was measured at **114.554 px font size / 114.554 px line height / −4 px letter spacing**, and body at **16 px**. These values came from the main agent's browser measurement, not from browser automation in this asset task. Keep the hero's intentional two-line content as provided and let the main agent assess width changes for the longer replacement text.

## Validation and boundaries

All four upstream downloads returned HTTP 200. WOFF2 signatures, complete lengths, table-count bounds, and compressed-payload header fields were checked; the license files were checked for their copyright and OFL 1.1 notices. SHA-256 hashes above identify the exact saved bytes. This task performed no browser automation or browser font-load QA. The main agent remains responsible for verifying rendered metrics and local font requests in its UI pass.

Only `assets/fonts/**` and this `content/font-sources.md` were written. No Git mutations, publishing, source UI edits, email access, or private repository access were performed.

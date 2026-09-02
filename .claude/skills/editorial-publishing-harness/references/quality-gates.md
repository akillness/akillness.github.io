# Editorial Quality Gates

A run may advance only with evidence recorded in `run-summary.md`.

| Gate | PASS | Failure |
|---|---|---|
| G1 Novelty | Distinct thesis and no near-duplicate published post | choose another candidate |
| G2 Primary evidence | Direct official/paper/source-code read; code pinned when available | REJECT |
| G3 Claim coverage | 100% of material claims verified or explicitly inferred | FIX, max 2 |
| G4 Persona | English Curiosity → Retrieve → Innovation; honest first person | FIX |
| G5 Non-commodity value | Original source finding, experiment, benchmark, or production decision | REJECT/FIX |
| G5b Authority-led monetization | Valid evidence-bound `research/authority-brief.json`; visible AI-method disclosure; genuine related-article next action; no scaled/transcript pattern or outcome claim; independent authority findings PASS | BLOCK |
| G6 Assets | Every local path exists; asset original or licensed; no orphans | FIX |
| G6b Source images | 4–12 distinct rights-clear source-derived raster images in `references/`, valid `source-image-manifest.json`, each credited in exactly one top-level, visibly rendered `<figure class="source-image">` | BLOCK |
| G7 Date safety | Automated `+0900` timestamp is strictly past at build time | BLOCK |
| G8 Taxonomy | Existing exact category; lowercase reusable tags | FIX |
| G9 Package/render | Front matter, fences, Mermaid, tables, internal links, secrets pass | FIX/BLOCK |
| G10 Independent review | Evidence editor and publication validator both PASS | FIX/REJECT |
| G11 Diff scope | Only one post plus matching assets | BLOCK |
| G12 Deployment | Remote SHA, Pages success, anonymous permalink 200, assets 200 | not published |

## Word count

Google has no preferred word count. The site's 800-word ad threshold is an internal commercial-surface guard, not an SEO target. A long generic list can still fail G5; a shorter original note can remain public with `noindex`/no ads when deliberately classified.

## Authority-led monetization

G5b fails closed for every new package. The director writes the brief before the writer starts; the writer receives only the validated brief and evidence pack; the evidence editor checks it independently. A schedule never converts missing authority, reader value, visible AI disclosure, a related next action, or real measurement evidence into a warning. The publish-time measurement state remains `not-measured`; traffic, ranking, AdSense, and revenue outcomes require a later dated first-party readout.

## Source-derived reference images

G6b fails closed. Only director-downloaded raster images from inspected reference materials count; original/AI diagrams, logos, avatars, decorative placeholders, and duplicate crops/resizes never do, and the original-visual expectation stays separate and uncounted. The required 4–12 images are evidence/context assets, never filler. The shipped-tree gate applies to posts dated 2026-09-01 or later; older posts are migration-exempt. Each must have valid raster structure, EXIF/XMP/text metadata stripped, a short side >=32 px and at least 16,384 pixels; the combined payload must stay <=20 MiB. Fewer than four or more than twelve rights-clear images blocks the run — that is a valid outcome. Deterministic checks: `tools/lib/source-image-manifest.mjs` via `tools/validate-editorial-package.mjs` (metrics `reference_images`, `credited_reference_images`) and the 4–12 count band in `tools/verify-publication-scope.mjs`.

## Visualization and generated imagery

Explanatory visuals are table-first and SVG-first; Mermaid is used only when a generated graph beats an authored SVG. New original SVG diagrams omit an opaque full-canvas background fill so they stay readable on the theme's neutral `.svg` surface in both colour modes; a baked background is an exception that must be justified in `run-summary.md`, and published diagrams are never retrofitted. Cover/hero art and editorial illustrations are generated with `god-tibo-imagen` (`gti`, or `npx god-tibo-imagen`) using local Codex auth, stored outside `references/`, and described honestly in `image.alt`. Generated imagery is uncounted by G6b and never substitutes for downloaded evidence.

## Revision policy

- Maximum two writer revision loops.
- A reviewer may REJECT without offering cosmetic fixes when the thesis lacks evidence or originality.
- No article is preferable to filler created to satisfy a schedule.

## Scheduled date invariant

The schedule begins at 01:00 KST, but the date is emitted after the draft completes. Use `tools/editorial-workspace.mjs safe-date`, which creates a KST timestamp safely in the past. Do not use legacy `+0800` timestamps for automated posts.

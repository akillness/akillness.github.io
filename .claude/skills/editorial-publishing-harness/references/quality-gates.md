# Editorial Quality Gates

A run may advance only with evidence recorded in `run-summary.md`.

| Gate | PASS | Failure |
|---|---|---|
| G1 Novelty | Distinct thesis and no near-duplicate published post | choose another candidate |
| G2 Primary evidence | Direct official/paper/source-code read; code pinned when available | REJECT |
| G3 Claim coverage | 100% of material claims verified or explicitly inferred | FIX, max 2 |
| G4 Persona | English Curiosity → Retrieve → Innovation; honest first person | FIX |
| G5 Non-commodity value | Original source finding, experiment, benchmark, or production decision | REJECT/FIX |
| G6 Assets | Every local path exists; asset original or licensed; no orphans | FIX |
| G7 Date safety | Automated `+0900` timestamp is strictly past at build time | BLOCK |
| G8 Taxonomy | Existing exact category; lowercase reusable tags | FIX |
| G9 Package/render | Front matter, fences, Mermaid, tables, internal links, secrets pass | FIX/BLOCK |
| G10 Independent review | Evidence editor and publication validator both PASS | FIX/REJECT |
| G11 Diff scope | Only one post plus matching assets | BLOCK |
| G12 Deployment | Remote SHA, Pages success, anonymous permalink 200, assets 200 | not published |

## Word count

Google has no preferred word count. The site's 800-word ad threshold is an internal commercial-surface guard, not an SEO target. A long generic list can still fail G5; a shorter original note can remain public with `noindex`/no ads when deliberately classified.

## Revision policy

- Maximum two writer revision loops.
- A reviewer may REJECT without offering cosmetic fixes when the thesis lacks evidence or originality.
- No article is preferable to filler created to satisfy a schedule.

## Scheduled date invariant

The schedule begins at 01:00 KST, but the date is emitted after the draft completes. Use `tools/editorial-workspace.mjs safe-date`, which creates a KST timestamp safely in the past. Do not use legacy `+0800` timestamps for automated posts.

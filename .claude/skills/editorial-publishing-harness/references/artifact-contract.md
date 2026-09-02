# Editorial Artifact Contract

## One live run

`_workspace/current/` is the only writable run. A run id is stored inside artifacts and becomes a directory name only when the next run moves it to `_workspace/archive/<run-id>/`.

## Required tree

```text
_workspace/current/
  manifest.json
  tasks.json
  research/
    candidate-set.json
    existing-coverage.json
    authority-brief.json
  evidence/
    evidence-pack.json
    source-map.md
  draft/
    _posts/YYYY-MM-DD-<slug>.md
    assets/img/posts/YYYY-MM-DD-<slug>/...
    assets/img/posts/YYYY-MM-DD-<slug>/references/...
    claim-map.json
    source-image-manifest.json
  review/
    editorial-review.json
  validation/
    draft-validation.json
    validation.json
    path-scope.txt
  messages/
  run-summary.md
```

## Manifest fields

- `schema_version`
- `run_id`
- `started_at_kst`
- `target_date`
- `mode`: `draft-only` or `publish-on-green`
- `status`: `researching`, `drafting`, `reviewing`, `ready_for_review`, `published`, `rejected`, `blocked`, `superseded`
- `topic`, `slug`, `thesis`
- `article_path`, `asset_dir`
- `revision_loops`
- `publication_requires_confirmation`
- `gates`

## Candidate fields

`research/candidate-set.json` contains a `candidates` array. Every item records:

- `candidate_id`
- `url`
- `source_tier`
- `retrieved_at` (ISO timestamp)
- `why_now`
- `audience_fit`
- `overlap_with_existing`
- `originality_opportunity`
- `selected` (boolean)
- `rejection_reason` for every non-selected candidate

An article package has exactly one selected candidate.

## Authority-led monetization brief

`research/authority-brief.json` is an internal, never-published artifact written by the editorial director before drafting. It must follow `.claude/skills/authority-led-monetization/references/authority-brief-schema.md`: bind the current run and selected candidate, use one declared content pillar, map the authority basis and original contribution to non-`unverified` evidence claim ids, disclose AI research/draft assistance visibly in the article, name one genuine related `/posts/` next action present in the body, and keep all publish-time outcome values explicitly unmeasured. `tools/lib/authority-brief.mjs` validates it fail-closed at draft and final stages.

## Evidence fields

Each material claim records:

- `claim_id`
- `claim`
- `verification`: `verified`, `inferred`, `unverified`
- `source_url`
- `pinned_ref` or `source_version` for verified evidence
- `retrieved_at` (ISO timestamp)
- `quote_or_coordinate`
- `caveat` (use an explicit string such as `none observed` when empty)

Unverified claims cannot appear as assertions. Inferences must be labelled in the prose.

## Independent review fields

`review/editorial-review.json` must include:

- `verdict`: `PASS`, `FIX`, or `REJECT`
- `claim_coverage`: `1.0` for PASS
- `claims` array covering every mapped material claim, each with `claim_id`, boolean `supported`, `evidence_ref`, and `required_fix` when unsupported
- `originality` finding
- `persona_honesty` finding
- `authority_fit`, `reader_value`, `monetization_honesty`, `ai_role_honesty`, and `next_action_verified`: all `true`
- `scaled_content_risk`: `false`
- `authority_rationale`: at least 40 characters of concrete independent reasoning

Final package validation refuses a missing/non-PASS review, coverage below 1.0, or incomplete authority findings.

## Source-image manifest fields

`draft/source-image-manifest.json` is an internal sidecar (never staged or published) written only by the editorial director. Top level: `schema_version` (1), `run_id` (must match `manifest.json`), and `images[]` with 4–12 entries. Every image records:

- `local_path` — unique, under `assets/img/posts/<article-stem>/references/`, extension `.png`/`.jpg`/`.jpeg`/`.webp`; the file must exist, be >0 and <=5 MiB, and match its declared raster structure, have EXIF/XMP/text metadata stripped, have a short side >=32 px and at least 16,384 pixels; all reference images combined must be <=20 MiB
- `source_page_url` — must be an evidence-pack `source_url`
- `download_url` — unique per image; duplicate crops/resizes of one source do not count
- `publisher_or_creator`
- `license_basis` — one of `public-domain`, `cc0`, `cc-by`, `cc-by-sa`, `kogl-type-1`, `repo-license-covers-assets`, `official-press-kit`; anything else fails closed; `repo-license-covers-assets` also requires `pinned_ref`
- `license_url`
- `license_quote` — at least 40 characters quoted from the license/rights statement
- `retrieved_at` (ISO timestamp)
- `sha256` — unique, must match the file on disk
- `transformation` and `transformation_note`
- `alt` and `attribution_text`
- `commercial_use_allowed: true` and `redistribution_allowed: true` (strict booleans)

Generated cover/hero art and editorial illustrations (produced with `god-tibo-imagen`) live in the article asset folder outside `references/`, never appear in this manifest, and never count toward the 4–12 requirement.

Each item appears in exactly one adjacent `<figure class="source-image">` block in the article body with matching `img` `src`/`alt` and a `figcaption` containing the exact `source_page_url`, `license_url`, `publisher_or_creator`, and `attribution_text`. Every file in `references/` has exactly one manifest entry and every manifest item is referenced. Validation lives in `tools/lib/source-image-manifest.mjs` and reports `reference_images` and `credited_reference_images` metrics.

## Draft package

The package mirrors repository-relative paths under `draft/`. Publication copies only the article and its matching asset directory; research and review artifacts never enter the public tree.

## Archive rule

At next run start, move the complete previous `current/` directory to `archive/<run-id>/`. Add `ARCHIVED.md` with archive time/final status and seal every file in `archive-manifest.json` with SHA-256. `start` verifies all existing seals before proceeding. Never edit, replace, or delete an archived run.

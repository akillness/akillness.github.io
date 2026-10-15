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
    image-source-audit.md  # required for source-first fallback
  evidence/
    evidence-pack.json
    source-map.md
  draft/
    _posts/YYYY-MM-DD-<slug>.md
    assets/img/posts/YYYY-MM-DD-<slug>/...
    assets/img/posts/YYYY-MM-DD-<slug>/references/...  # when source images are used
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
- `approval_context` when a manual one-off path is used
- `gates`

## Manual single-article approval record

A one-off manual publication requires a current explicit owner request and a run-scoped record at `messages/manual-single-article-approval.json`. The manifest's `approval_context` must contain `type: manual-single-article-publication`, the exact `owner_request`, `standing_routine_not_used: true`, the fixed `approval_record_path`, `approved_article_path`, and the exact `approved_scope_paths`. The JSON record binds the same `run_id`, request, article, and sorted scope list; it records the user-request text and `recorded_at_kst`. The timestamp must be after `manifest.started_at_kst`, not in the future, and no older than the policy's 24-hour freshness limit at validation time. The lists in the record and manifest must exactly equal the derived `validation/path-scope.txt`, which must contain exactly one `_posts/YYYY-MM-DD-<slug>.md` and only assets under `assets/img/posts/<same-stem>/`. Policy capability is not consent, and the record is never reusable. This JSON is an audit record of a direct owner message, not a cryptographic signature; the validator checks run, freshness, and scope, but cannot independently authenticate the speaker. This path is distinct from `manual-three-article-publication`.

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

`draft/source-image-manifest.json` is an internal sidecar (never staged or published) written only by the editorial director. Top level: `schema_version` (1), `run_id` (must match `manifest.json`), and `images[]` containing the actual source images. Legacy manifests require 4–12 entries; the approved explicit `source-first-fallback` mode permits 0–12, subject to the separate audit and explanatory-asset requirements below. Every source image records:

- `local_path` — unique, under `assets/img/posts/<article-stem>/references/`, extension `.png`/`.jpg`/`.jpeg`/`.webp`; the file must exist, be >0 and <=5 MiB, and match its declared raster structure, have EXIF/XMP/text metadata stripped, have a short side >=32 px and at least 16,384 pixels; all reference images combined must be <=20 MiB
- `source_page_url` — must be an evidence-pack `source_url`
- `publisher_or_creator`
- `license_basis` — licensed downloads use `public-domain`, `cc0`, `cc-by`, `cc-by-sa`, `kogl-type-1`, `repo-license-covers-assets`, or `official-press-kit`; `repo-license-covers-assets` also requires `pinned_ref`. The separate `own-screenshot-of-public-interface` basis is allowed only for the akillness Git blog under explicit scoped owner permission; it is not a third-party license.
- `retrieved_at` (ISO timestamp)
- `sha256` — unique, must match the file on disk
- `transformation` and `transformation_note`
- `alt` and `attribution_text`
- `commercial_use_allowed: true` and `redistribution_allowed: true` (strict booleans)

Generated cover/hero art and editorial illustrations (produced with `god-tibo-imagen`) live in the article asset folder outside `references/`, never appear in source `images[]`, and never count as source/primary evidence. Fallback illustrations are instead recorded in the same sidecar’s separate `explanatory_images[]`.

For approved source-first fallback, add `image_policy: source-first-fallback` to both post front matter and this sidecar. Add `source_first_audit` with `report_path: research/image-source-audit.md`, the actual report `sha256`, and nonempty `candidates[]` of `{source_page_url, decision, reason}`. The report lives at `_workspace/current/research/image-source-audit.md` (run-root-relative path, not under `draft/`), contains at least 80 bytes, and documents actual inspected imagery, relevance and rights. Candidate URLs must occur in the report and evidence-pack claim `source_url` values. Decisions are `used`, `rights-unclear`, `irrelevant`, or `no-usable-image`; reasons contain at least 20 characters of concrete findings. A `used` candidate requires a normal source `images[]` entry.

Add nonempty `explanatory_images[]` of `{local_path, kind, creator, alt, attribution_text, sha256, bytes}`. `kind` is `original` or `generated`; hash and positive byte count must match a local metadata-free raster outside `references/` within the existing per-image limits. Each item appears exactly once in a top-level visible `<figure class="explanatory-image">` with matching `/local_path`, alt and exact attribution. The attribution includes `Original illustration by <creator>` or `AI-generated illustration by <creator>`, plus `not source evidence`. Identify the actual creator/tool honestly. See `image-selection.md` for the full selection procedure. The report and sidecar remain internal; shipped validation requires the explicit post mode and the visible credited local asset, not a self-declared no-image exemption.

Licensed downloads additionally record a unique `download_url`, `license_url`, and verbatim `license_quote` (>=40 characters); duplicate crops/resizes of one download do not count. First-party screenshots instead record the exact `owner_reuse_scope`, `publisher_or_creator`, and `owner_reuse_attestation` values from `.claude/editorial-policy.yml`, plus a unique `capture_state`; both the `articleStem` and HTTPS evidence-pack `source_page_url` must match the explicit policy allowlists. `attribution_text` must visibly identify owner permission, and `download_url`, `license_url`, and `license_quote` must be omitted. Do not fabricate a license citation for an owner screenshot.

Each item appears in exactly one adjacent `<figure class="source-image">` block in the article body with matching `img` `src`/`alt` and a `figcaption` containing the exact `source_page_url`, `publisher_or_creator`, and `attribution_text`; licensed downloads also require the exact `license_url`. Every file in `references/` has exactly one source `images[]` entry and every source item is referenced. Validation lives in `tools/lib/source-image-manifest.mjs` and reports `reference_images` and `credited_reference_images` metrics.

## Draft package

The package mirrors repository-relative paths under `draft/`. Publication copies only the article and its matching asset directory; research and review artifacts never enter the public tree.

## Archive rule

At next run start, move the complete previous `current/` directory to `archive/<run-id>/`. Add `ARCHIVED.md` with archive time/final status and seal every file in `archive-manifest.json` with SHA-256. `start` verifies all existing seals before proceeding. Never edit, replace, or delete an archived run.

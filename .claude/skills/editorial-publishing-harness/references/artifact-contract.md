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
  evidence/
    evidence-pack.json
    source-map.md
  draft/
    _posts/YYYY-MM-DD-<slug>.md
    assets/img/posts/YYYY-MM-DD-<slug>/...
    claim-map.json
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

Final package validation refuses a missing/non-PASS review or coverage below 1.0.

## Draft package

The package mirrors repository-relative paths under `draft/`. Publication copies only the article and its matching asset directory; research and review artifacts never enter the public tree.

## Archive rule

At next run start, move the complete previous `current/` directory to `archive/<run-id>/`. Add `ARCHIVED.md` with archive time/final status and seal every file in `archive-manifest.json` with SHA-256. `start` verifies all existing seals before proceeding. Never edit, replace, or delete an archived run.

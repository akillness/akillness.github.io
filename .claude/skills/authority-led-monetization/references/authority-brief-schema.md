# Authority Brief Schema

`_workspace/current/research/authority-brief.json` is an internal run artifact written only by the editorial director before the writer starts. It is never staged or published. Deterministic validation: `tools/lib/authority-brief.mjs` via `tools/validate-editorial-package.mjs` (draft and final stages, fail closed). Unknown fields at any level fail validation.

## Top level

| Field | Rule |
|---|---|
| `schema_version` | exactly `1` |
| `run_id` | equals `manifest.run_id` |
| `selected_candidate_id` | equals the single selected candidate's `candidate_id` |
| `site_mode` | exactly `expert-source-audit` |
| `operating_mode` | exactly `acquisition-content` |
| `primary_lane` | exactly `seo-and-content` |
| `audience_segment` | string, >=20 chars — who this article serves |
| `reader_job` | string, >=20 chars — what the reader is trying to decide or do |
| `content_pillar` | one of the policy `content_pillars`; must match the selected candidate's `content_pillar` when recorded |
| `revenue_model` | exactly `ads-and-paid-technical-review` |

## `authority_basis`

| Field | Rule |
|---|---|
| `type` | exactly `primary-source-analysis` |
| `summary` | >=40 chars — why this run has standing to publish on the topic |
| `evidence_claim_ids` | non-empty, unique, every id exists in `evidence/evidence-pack.json` and is not `unverified` |

## `original_contribution`

| Field | Rule |
|---|---|
| `kind` | one of `comparative-analysis`, `implementation-audit`, `operational-synthesis`, `decision-framework` |
| `summary` | >=40 chars — what the article adds beyond the announcement |
| `evidence_claim_ids` | same rules as `authority_basis` |

## `ai_role`

| Field | Rule |
|---|---|
| `research_assistance` | exactly `true` |
| `draft_assistance` | exactly `true` |
| `editorial_judgment_owner` | exactly `evidence-gated-editorial-harness` |
| `human_review_status` | `standing-policy-approved` when `manifest.mode` is `publish-on-green`, otherwise `manual-review-pending` |
| `first_hand_experience_claimed` | exactly `false` |
| `disclosure` | one safe line, >=40 chars; the exact text must appear in a visible `> **Editorial method:** ...` blockquote, not a comment, code fence, or hidden container |

## `next_action`

| Field | Rule |
|---|---|
| `type` | exactly `related-article` |
| `path` | matches `^/posts/[a-z0-9][a-z0-9-]*/$` — no query, no hash, no host; must appear as a visible Markdown link in the article body |
| `reader_value` | >=20 chars — why the linked article genuinely helps this reader next |

## `measurement`

| Field | Rule |
|---|---|
| `primary_kpi` | exactly `work-with-me-pageviews` |
| `leading_signal` | exactly `organic-search-clicks` |
| `baseline_status` | exactly `unmeasured` |
| `baseline_value` | exactly `null` |
| `success_threshold_status` | exactly `pending-baseline` |
| `success_threshold` | exactly `null` |
| `readout_after_days` | exactly `28` |
| `result_status` | exactly `not-measured` |

Baselines and thresholds are set only by a later human-visible readout against real Search Console/Analytics data. A publish-time brief that carries numbers is fabrication and fails.

## Independent review findings

`review/editorial-review.json` must additionally record, from the evidence editor's own inspection:

- `authority_fit: true` — the article demonstrates the declared authority basis
- `reader_value: true` — the reader's job is actually served
- `monetization_honesty: true` — no unverified outcome, price, or earnings claim
- `ai_role_honesty: true` — the disclosure is present, accurate, and unembellished
- `next_action_verified: true` — the internal link exists, renders, and is genuinely related
- `scaled_content_risk: false` — the article is not a template/volume/transcript artifact
- `authority_rationale` — >=40 chars of concrete reviewer reasoning

`validateAuthorityReviewFindings` in `tools/lib/authority-brief.mjs` enforces these at final validation.

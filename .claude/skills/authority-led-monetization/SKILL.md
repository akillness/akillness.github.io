---
name: authority-led-monetization
description: >
  Apply the authority-led monetization contract to every Fodev JEO article: one expert
  topic authority basis, one original contribution, an honest visible AI-role disclosure,
  one internal related-article next action, and an unmeasured-baseline measurement plan.
  Use when the editorial-publishing-harness prepares, reviews, or validates an article
  package, or when a user asks how this blog earns, why an article is monetizable, or how
  to align a post with search and AdSense policy. Rejects scaled-content automation,
  transcript rewrites, and unverified traffic or revenue claims. Enforced fail-closed by
  research/authority-brief.json through tools/lib/authority-brief.mjs.
model: opus
allowed-tools: Read, Glob, Grep
---

# Authority-Led Monetization

This skill is REQUIRED for every article produced by `editorial-publishing-harness`. It encodes what can compound for a small expert blog — remembered topic authority, verified evidence, and an honest next action — while banning scaled semi-automated issue-chasing, undisclosed AI assistance, and invented outcomes. Only scaled low-value publishing is a documented search-policy risk; disclosure and measurement rules are this site's stricter trust controls. Evidence basis and policy cross-checks live in `references/video-evidence-and-policy.md`; the machine schema lives in `references/authority-brief-schema.md`.

## When to use this skill

Use it for every Fodev JEO article package and any review of why a post is monetizable under the site's authority-first policy. Do not use it for ad configuration, analytics wiring, or AdSense console actions.

## Instructions

### Operating position

- Site mode is `expert-source-audit`: one pillar-bound Source Audit at a time, never volume posting. A no-article night is a valid outcome.
- Operating mode is `acquisition-content` on the `seo-and-content` lane: articles exist to earn durable organic search trust inside the declared content pillars.
- Revenue model is `ads-and-paid-technical-review`: AdSense surfaces plus the existing `/work-with-me/` paid-review CTA. No affiliate links, sponsorships, backlink sales, or newsletter capture.
- Scheduled automation never pretends a human wrote or reviewed each post. The honest alternative is policy-bound AI assistance with independent evidence review, disclosed in the article body.
- Offer a genuine internal next action for reader utility, not engagement bait: every article links one genuinely related `/posts/<slug>/` article and says why it helps. Do not claim the link improves dwell time or ranking.

### Required authority brief

Before the writer starts, the editorial director serializes `_workspace/current/research/authority-brief.json` (schema_version 1, exact field contract in `references/authority-brief-schema.md`). It must bind:

1. `run_id` and `selected_candidate_id` to the current run and the single selected candidate.
2. `content_pillar` to a declared policy pillar (and the candidate's pillar when recorded).
3. `authority_basis` (`primary-source-analysis`) and `original_contribution` (comparative-analysis, implementation-audit, operational-synthesis, or decision-framework) to verified or inferred evidence-pack claim ids — never `unverified` ones.
4. `ai_role` with `research_assistance: true`, `draft_assistance: true`, judgment owned by `evidence-gated-editorial-harness`, `first_hand_experience_claimed: false`, and a >=40-character disclosure that must appear verbatim in the article body.
5. `next_action` as one `related-article` path matching `/posts/<slug>/` that appears in the article body with a concrete reader value.
6. `measurement` with `primary_kpi: work-with-me-pageviews`, `leading_signal: organic-search-clicks`, an `unmeasured` baseline, `null` numbers, `readout_after_days: 28`, and `result_status: not-measured`. Outcome numbers are written only by a later readout against real Search Console/Analytics data, never at publish time.

### Prohibitions

- No scaled-content automation: no issue-chasing volume posting, no per-keyword page variants, no publishing cadence beyond one validated article per run.
- No transcript rewrites: a video, talk, or thread may only be a candidate lead; the article must stand on independently verified primary sources.
- No unverified outcome claims: traffic, revenue, RPM, ranking, or approval outcomes appear only with dated first-party measurements.
- No fabricated experience: the persona rules in `CLAUDE.md` stay authoritative; the brief cannot claim lived experience.
- No new monetization surfaces: ads config, analytics, CTA templates, privacy pages, and `ads.txt` are outside every article run.

### Enforcement and review

- `tools/lib/authority-brief.mjs` is the deterministic contract; `tools/validate-editorial-package.mjs` fails closed when the brief is missing or drifted, at draft and final stages.
- The evidence editor independently records `authority_fit`, `reader_value`, `monetization_honesty`, `ai_role_honesty`, `next_action_verified` (all `true`), `scaled_content_risk: false`, and a >=40-character `authority_rationale` in `review/editorial-review.json`; final validation refuses anything less.
- The publication validator treats a missing or failing brief exactly like a missing source-image sidecar: BLOCK, never a warning.
- Policy pins live in `.claude/editorial-policy.yml` (`authority_*` keys); `tools/validate-editorial-harness.mjs` fails on drift.

## Examples

Should trigger: preparing or reviewing any article package in this repository; "why is this post monetizable?"; "align tonight's Source Audit with AdSense policy"; "check the authority brief"; "how does this blog earn?".

Should not trigger: editing ads/analytics templates or `ads.txt`; AdSense console operations; writing customer emails; non-article repository work. Full eval set: `references/trigger-evals.json`.

## Best practices

Keep article-level judgment evidence-bound, disclose the actual AI role, prefer a valid no-article result over manufactured compliance, and leave traffic or revenue outcomes unmeasured until a dated first-party readout exists.

## References

- `references/authority-brief-schema.md`
- `references/video-evidence-and-policy.md`
- `references/trigger-evals.json`
- `.claude/editorial-policy.yml`

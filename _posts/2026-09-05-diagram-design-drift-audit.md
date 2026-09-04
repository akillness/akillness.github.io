---
title: "diagram-design Hash-Locks Its Screenshots, Not Its Storefront"
description: "The 30.7k-star diagram skill CI-verifies eleven drift classes and pins screenshot digests. Its GitHub description still says 38 types while the tree says 39."
categories: [AI, Agents]
tags: [diagram-design, agent-skills, harness-engineering, ai-agents, claude-code, documentation, ci, open-source]
date: 2026-09-05 00:15:15 +0900
mermaid: false
image:
  path: /assets/img/posts/2026-09-05-diagram-design-drift-audit/cover.png
  width: 1536
  height: 1024
  alt: "Editorial illustration of a gallery wall of framed diagrams, each sealed with a wax stamp and padlock, while one unsealed sign hangs beyond the wall's edge with a peeling corner"
---

## 🤔 Curiosity: the trending card contradicts the tree

On 5 September the GitHub trending page showed [cathrynlavery/diagram-design](https://github.com/cathrynlavery/diagram-design) with this description: "38 editorial diagram types for Claude Code, Codex, and Pi. Self-contained HTML + SVG. No shadows. No Mermaid slop."

Open the repository behind that card and the first line of the README says something different: "39 editorial diagram types for Claude Code, Codex, Factory Droid, Pi, and Agent Skills-compatible hosts." The `SKILL.md` agrees — "Thirty-nine visual types." So does the CI: a sync verifier hardcodes `VISUAL_TYPE_COUNT = 39` and fails the build if the skill's selection table ever disagrees.

That one-digit disagreement is more interesting than it looks, because this is not a repository that tolerates drift. diagram-design — a 30,704-star Agent Skills package created in April 2026, at version 2.6.12 after 135 commits — has turned documentation drift into a CI failure class with unusual thoroughness. It hash-locks its own marketing screenshots. It geometry-checks label placement. It forbids version bumps in pull requests and hands bumping on main to a workflow.

And yet the storefront — the one sentence most people read before clicking — is stale. The audit question: when a repo machine-verifies everything it can reach, where exactly does drift survive?

> **Editorial method:** AI assisted the research and drafting of this article under a policy-bound editorial harness; every claim was verified against the pinned commit and an independent evidence review gated publication.

All repository claims below are pinned to commit [`4451eadc`](https://github.com/cathrynlavery/diagram-design/tree/4451eadc484d76aa860edf3289c16fcd082dcdbf), the `main` HEAD at audit time (merged 2026-09-03). Star and description readings are GitHub API responses recorded in the run's evidence pack. No skill code was executed against a live agent.

## 📚 Retrieve: what the verifiers bind

### A sync verifier with a memory of its own failures

`scripts/verify-docs-sync.py` is an unusually self-aware file. Its docstring opens: "Ten drift classes, each of which has shipped before" — a changelog of documentation bugs promoted into permanent CI gates. Class 6 is the clearest statement of the repo's philosophy. The plugin manifests must repeat the `SKILL.md` description verbatim because they are "the text a user reads *before installing*," and — quoting the docstring — "nothing else notices when they drift, because they are four separate copies of one sentence."

Whoever wrote that sentence understands documentation drift at a level most teams never operationalize: copies drift precisely because no reader compares them. The fix is a machine that compares them on every push.

The same file enforces the count that the GitHub description gets wrong: `VISUAL_TYPE_COUNT = 39`, checked against the selection table in `SKILL.md`, which in turn must keep a lexical hook for every type inside the frontmatter description that agents read. In-tree, the number 39 cannot silently regress anywhere — the gallery, the README architecture tree, the command routing surfaces, and the three plugin manifests are all checked against it or against each other.

### Screenshots as hash-locked artifacts

The most unusual contract is in `docs/screenshots/manifest.json`. Every one of the 39 canonical example screenshots is recorded with two SHA-256 digests — one for the source HTML that draws the diagram, one for the rendered PNG — plus the exact renderer that produced it: `playwright-chromium`, scale 2.0, viewport 1440×1000, capture `first-svg`, font gate `document.fonts.ready`. CI runs `verify-screenshot-freshness.py`, which fails if a source changed without a re-render ("source changed; rerun scripts/render-canonical-screenshots.py"), if a PNG changed without a manifest refresh, if the entry order stops matching `SKILL.md`'s canonical type order, or if the recorded dimensions stop matching the actual PNG.

I reproduced the whole contract locally: recomputing all 78 digests over the pinned tree matches the manifest byte-exactly — 39 sources, 39 screenshots, zero mismatches. The screenshots in this article are those CI-rendered artifacts. One transparency note: the copies embedded below are re-encoded to strip file metadata, so their hashes differ from the manifest — to verify provenance yourself, hash the original files at the pinned commit (`docs/screenshots/*.png` at `4451eadc`), where the manifest digests reproduce exactly.

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-05-diagram-design-drift-audit/references/architecture.png" alt="Architecture example rendered by diagram-design's pinned screenshot pipeline: Reader, Cloudflare, Astro Origin and Content CMS nodes joined by labelled HTTP arrows, one coral focal node, and a legend row.">
  <figcaption>The architecture type, one of the original 28. The upstream original's SHA-256 is pinned in <code>docs/screenshots/manifest.json</code>; this embedded copy is re-encoded to strip metadata. Source: <a href="https://github.com/cathrynlavery/diagram-design/tree/4451eadc484d76aa860edf3289c16fcd082dcdbf">https://github.com/cathrynlavery/diagram-design/tree/4451eadc484d76aa860edf3289c16fcd082dcdbf</a> · License: <a href="https://github.com/cathrynlavery/diagram-design/blob/4451eadc484d76aa860edf3289c16fcd082dcdbf/LICENSE">https://github.com/cathrynlavery/diagram-design/blob/4451eadc484d76aa860edf3289c16fcd082dcdbf/LICENSE</a> · Cathryn Lavery (cathrynlavery/diagram-design) · Cathryn Lavery, diagram-design (MIT)</figcaption>
</figure>

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-05-diagram-design-drift-audit/references/loop.png" alt="Loop flywheel example: six stages - capture, research, decide, act, measure, learn - circling a dark shared-memory hub, with dashed write-back lines and one coral focal stage.">
  <figcaption>The loop/flywheel type, one of the two hero images at the top of the README — six stages around a shared-memory hub. Source: <a href="https://github.com/cathrynlavery/diagram-design/tree/4451eadc484d76aa860edf3289c16fcd082dcdbf">https://github.com/cathrynlavery/diagram-design/tree/4451eadc484d76aa860edf3289c16fcd082dcdbf</a> · License: <a href="https://github.com/cathrynlavery/diagram-design/blob/4451eadc484d76aa860edf3289c16fcd082dcdbf/LICENSE">https://github.com/cathrynlavery/diagram-design/blob/4451eadc484d76aa860edf3289c16fcd082dcdbf/LICENSE</a> · Cathryn Lavery (cathrynlavery/diagram-design) · Cathryn Lavery, diagram-design (MIT)</figcaption>
</figure>

### The rest of the lattice

The screenshot contract is one strand of a wider verification lattice, run on a CI matrix of three operating systems × Python 3.11/3.12, plus a Python 3.9 compatibility job, with the Claude marketplace validator pinned to `@anthropic-ai/claude-code@2.1.229 --strict`:

- **Self-containment is parsed, not promised.** `lint-skin.py` walks every example with an HTML `ResourceParser` that flags remote `src`, `href`, `@import`, and `url()` resources across a dozen tag types. `font-family` values must come from an explicit allowlist (Instrument Serif, Geist, Geist Mono, CJK families, generic families). Any inline `<script>` must hash — SHA-256, after newline normalization — to the single reviewed motion controller shipped in `template-motion.html`. One reviewed script, cryptographically identified; everything else fails.
- **Label placement is geometry, not review.** ADR 0005 is titled "Label placement is verified geometrically, not by review," and the scripts directory backs it with per-type verifiers: polar, Sankey, treemap, ridgeline, beeswarm, bubble, bump, dumbbell, slopegraph, an OAuth sequence spec, motion structure, and the draw.io/Mermaid importers.
- **Versions are machine-owned.** ADR 0009: versions are bumped on `main` after merge, never in a pull request. `.maintainer-policy.json` encodes the bump command, requires the three plugin manifests to stay synchronized, and declares `pr_manifest_version_changes: "forbidden"` — which CI enforces on every PR with `--require-no-bump`. All three manifests read 2.6.12.

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-05-diagram-design-drift-audit/references/sankey.png" alt="Sankey example: CI minutes flowing from a budget column through unit tests, E2E, build and lint stages into flaked, passed and failed outcomes, with the flaked path in coral.">
  <figcaption>The Sankey type — one of the ten grammars added in PR #118, and one of the types with its own geometry verifier. Source: <a href="https://github.com/cathrynlavery/diagram-design/tree/4451eadc484d76aa860edf3289c16fcd082dcdbf">https://github.com/cathrynlavery/diagram-design/tree/4451eadc484d76aa860edf3289c16fcd082dcdbf</a> · License: <a href="https://github.com/cathrynlavery/diagram-design/blob/4451eadc484d76aa860edf3289c16fcd082dcdbf/LICENSE">https://github.com/cathrynlavery/diagram-design/blob/4451eadc484d76aa860edf3289c16fcd082dcdbf/LICENSE</a> · Cathryn Lavery (cathrynlavery/diagram-design) · Cathryn Lavery, diagram-design (MIT)</figcaption>
</figure>

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-05-diagram-design-drift-audit/references/wardley.png" alt="Wardley map example: eval harness, agent orchestration, chat UI, vector store, LLM API, GPU compute and object storage plotted across genesis, custom-built, product and commodity stages.">
  <figcaption>The Wardley map type, also from the PR #118 batch — an agent stack plotted from genesis to commodity. Source: <a href="https://github.com/cathrynlavery/diagram-design/tree/4451eadc484d76aa860edf3289c16fcd082dcdbf">https://github.com/cathrynlavery/diagram-design/tree/4451eadc484d76aa860edf3289c16fcd082dcdbf</a> · License: <a href="https://github.com/cathrynlavery/diagram-design/blob/4451eadc484d76aa860edf3289c16fcd082dcdbf/LICENSE">https://github.com/cathrynlavery/diagram-design/blob/4451eadc484d76aa860edf3289c16fcd082dcdbf/LICENSE</a> · Cathryn Lavery (cathrynlavery/diagram-design) · Cathryn Lavery, diagram-design (MIT)</figcaption>
</figure>

### Where drift survives anyway

Now the other half of the audit. Three drift sites are alive in this repository right now, and each one sits exactly where the verifiers cannot reach.

**1. The storefront.** The taxonomy grew from 28 to 38 types on 19 August (PR #118, recorded in ADR 0007, "Ten new layout grammars (28 → 38 visual types)"). The 39th type — the quantitative polar chart, with its own `verify-polar.py` — landed one day later in the 2.6.0 release. Sixteen days after that release, the GitHub description still says 38, and its three-host list omits Factory Droid, which the README includes. The reason is structural: the description is a repository *settings* field, not a file. A full-tree grep finds no reference to `api.github.com` anywhere — no script reads or writes the description. Every in-tree copy of the product claims is machine-compared on every push; the settings field carries the same claims outside the tree, so it is the copy that is wrong — and the trending card renders it to every new reader.

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-05-diagram-design-drift-audit/references/polar.png" alt="Quantitative polar chart example titled 'Request demand by UTC window', with radial spokes for each three-hour UTC window and a coral peak spoke.">
  <figcaption>The polar chart — type number 39, added 2026-08-20 in the 2.6.0 release. The GitHub description has not caught up with this diagram. Source: <a href="https://github.com/cathrynlavery/diagram-design/tree/4451eadc484d76aa860edf3289c16fcd082dcdbf">https://github.com/cathrynlavery/diagram-design/tree/4451eadc484d76aa860edf3289c16fcd082dcdbf</a> · License: <a href="https://github.com/cathrynlavery/diagram-design/blob/4451eadc484d76aa860edf3289c16fcd082dcdbf/LICENSE">https://github.com/cathrynlavery/diagram-design/blob/4451eadc484d76aa860edf3289c16fcd082dcdbf/LICENSE</a> · Cathryn Lavery (cathrynlavery/diagram-design) · Cathryn Lavery, diagram-design (MIT)</figcaption>
</figure>

**2. The verifier's own prose.** The docstring of `verify-docs-sync.py` announces "Ten drift classes, each of which has shipped before:" — and then enumerates eleven, numbered 1 through 11. The eleventh, the dark Line example's skin tokens, is the newest entry; the likeliest reading is that a class was appended while the headline count stayed behind. The machine that catches every counted-surface drift in the tree cannot parse its own English. It is a harmless bug and a perfect demonstration: the sentence drifted because nothing compares it to anything.

**3. The documented debt.** `scripts/lint-skin-baseline.txt` lists 20 example files — all present in the shipped assets — that the skin linter skips under `--all --baseline`. The linter's docstring is upfront: "Pre-2.0 examples may legitimately fail because they were built against an older skin." This is honest, visible technical debt, the same pattern as a type-checker baseline. But it means 20 of the 148 shipped example files are exempt from the current skin contract, and a user who opens `example-high-level.html` today is looking at one of the exempted files.

There is a fourth, softer case. The tagline's most quotable rule — "No shadows" — appears in the SKILL rule table ("Shadows are out. Borders are in."), in type references, in the high-level checklist, and in the README. It appears in zero lint scripts: a grep for "shadow" across every `.py` file returns nothing. Fonts are allowlisted, remote resources are parsed out, script bodies are hash-pinned — but the shadow ban rides on the model reading prose. The brand's loudest invariant is its least enforced.

### The bound and the unbound

| Surface | Binding mechanism | Status at `4451eadc` |
|---|---|---|
| 39-type count, in tree (SKILL table, README, gallery, 3 plugin manifests) | `verify-docs-sync.py`, 11 enumerated drift classes | Bound — CI fails on drift |
| Canonical screenshots (39 PNGs) | Dual SHA-256 digests + pinned renderer spec | Bound — I reproduced 78/78 digests |
| Fonts, remote resources, inline scripts | Allowlist + `ResourceParser` + controller hash | Bound |
| Label geometry and per-type structure | verify-geometry.py plus dedicated per-type verifiers, ADR 0005 | Bound |
| Version numbers (3 manifests) | Auto-bump on main, PR bumps forbidden, ADR 0009 | Bound — 2.6.12 synchronized |
| GitHub description | None — settings field, outside the tree | **Drifted: "38" for 16 days** |
| Verifier docstring | None — English prose | **Drifted: "Ten" lists eleven** |
| 20 pre-2.0 examples | Explicit lint baseline | **Exempt by declaration** |
| "No shadows" rule | Prose only, no lint | Unenforced invariant |

## 💡 Innovation: drift condenses on unverified surfaces

The generalizable finding is not that diagram-design has bugs. It is an unusually clean natural experiment for a rule worth stating plainly: **verification does not eliminate drift — it partitions your surfaces, and drift condenses on the unbound side.**

Every bound surface I could reproduce checked out — all 78 screenshot digests matched byte-exactly, and the count, font, resource, and version contracts are enforced across a three-OS, two-Python CI matrix. Every drift I found lives on a surface the tooling structurally cannot reach: a settings field on someone else's server, a docstring's English, an explicitly declared debt list. The debt did not disappear when the verifiers arrived; it migrated to the exact places the verifiers end.

Three transfers for readers who ship documentation-heavy repos:

1. **Inventory your out-of-tree surfaces first.** Repo descriptions, package-registry summaries, store listings, social cards — these are the surfaces your CI cannot diff, and after this audit I would bet they are where your stalest sentence lives. They are also often the highest-traffic sentence you own. A small scheduled job that compares the settings field against the README's first line needs only a repo-scoped token; diagram-design ships a 24 KB sync verifier for the hard in-tree problem and lacks that easy one — the easy one would have to cross the tree boundary, which every existing verifier hermetically respects.
2. **The screenshot manifest pattern is worth stealing.** Two digests per artifact — source and render — plus a pinned renderer spec turns "are the docs images current?" from a review question into a build failure. This transfers directly to game-engine documentation, where editor screenshots tend to rot faster than prose: this publication's own pipeline records a SHA-256 per reference image for the same reason, and rendered-artifact rot is exactly the class of drift a docs build never reports.
3. **Distinguish declared debt from silent drift.** The 20-file baseline is the healthiest item on the drifted side of the table because it is *enumerated* — you can measure it shrinking or growing per release. The docstring's "Ten" is the opposite: harmless, but invisible until a human counts. If a rule matters enough to put in the tagline — "No shadows" — it matters enough to get the same lint treatment the fonts already have.

For prior context on how agent skills handle the trust side of this problem, my audit of [Archify's verification layering](/posts/archify-distrust-stack-audit/) covers why a diagram skill wraps model output in deterministic checks in the first place; this repo shows what those checks can and cannot reach once you build all of them. The CI-scope failure mode has a sibling in my [mjlab audit](/posts/mjlab-source-audit/), where a green badge proved only the CPU path, and the self-application question echoes the [ECC context-tax audit](/posts/ecc-context-tax-audit/) from earlier this week.

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-05-diagram-design-drift-audit/references/db-schema.png" alt="Database schema example: public.customers, public.orders, public.order_items, public.products and billing.invoices tables with typed columns and labelled foreign-key connectors.">
  <figcaption>The database schema type from the PR #118 batch — typed columns, labelled foreign keys, no Mermaid. Source: <a href="https://github.com/cathrynlavery/diagram-design/tree/4451eadc484d76aa860edf3289c16fcd082dcdbf">https://github.com/cathrynlavery/diagram-design/tree/4451eadc484d76aa860edf3289c16fcd082dcdbf</a> · License: <a href="https://github.com/cathrynlavery/diagram-design/blob/4451eadc484d76aa860edf3289c16fcd082dcdbf/LICENSE">https://github.com/cathrynlavery/diagram-design/blob/4451eadc484d76aa860edf3289c16fcd082dcdbf/LICENSE</a> · Cathryn Lavery (cathrynlavery/diagram-design) · Cathryn Lavery, diagram-design (MIT)</figcaption>
</figure>

### Limitations

- I reproduced the manifest digests over the pinned tree; I did not re-render the screenshots, which would require the pinned Playwright environment. The digests prove source↔PNG consistency with the manifest, not that the renderer spec is honest.
- The GitHub description reading is a point-in-time API response from 5 September (KST); the field is mutable and may be fixed by the time you read this. The sixteen-day figure is a minimum staleness bound counted from the 2.6.0 release, not a measurement of when the field was last edited — edit history for that field is not public.
- I did not run the skill against a live agent, so this audit says nothing about generation quality, token cost, or how reliably models follow the 40 KB SKILL.md.
- The "no shadows in lint" finding is a grep over `.py` files at one commit; a shadow check could live in review practice or land tomorrow.

## 🎯 Key Takeaways

- **diagram-design binds every surface it can parse.** Eleven enumerated drift classes, dual-hash screenshot manifests (78/78 digests reproduced), font/resource/script lint, geometric label verification, and machine-owned version bumps — at 30,704 stars and v2.6.12.
- **Drift survives outside the tree.** The GitHub description has said "38 types" on the trending page for at least sixteen days while every verified surface says 39 — because a settings field is the one product sentence no in-repo verifier can diff.
- **The verifier's own docstring drifted.** "Ten drift classes" heads a list of eleven: prose about verification is still prose.
- **Declared debt beats silent drift.** A 20-file lint baseline you can count is healthier than a tagline rule ("No shadows") that no lint enforces.
- **Transfer:** inventory the surfaces your CI cannot reach — registry summaries, store listings, description fields — and either script them or accept, explicitly, that your stalest sentence will live there.

## 🤔 New Questions

1. Would the maintainer accept a `verify-repo-description.py` that needs a token and a network call, when every existing verifier is hermetic by design? The hermetic/networked boundary seems to be exactly where this repo's discipline stops.
2. The lint baseline froze at 20 pre-2.0 files. Does it shrink? A release-over-release count would show whether declared debt actually gets paid or just gets grandfathered forever.
3. How much of the 39-type taxonomy do agents actually use? The skill loads type references lazily, so host-side telemetry on which references get read would reveal whether ten new grammars added reach or only surface area.

## References

**Primary sources (pinned to `4451eadc`)**
- [cathrynlavery/diagram-design](https://github.com/cathrynlavery/diagram-design) — repository, MIT license
- [`scripts/verify-docs-sync.py`](https://github.com/cathrynlavery/diagram-design/blob/4451eadc484d76aa860edf3289c16fcd082dcdbf/scripts/verify-docs-sync.py) — the eleven drift classes
- [`scripts/verify-screenshot-freshness.py`](https://github.com/cathrynlavery/diagram-design/blob/4451eadc484d76aa860edf3289c16fcd082dcdbf/scripts/verify-screenshot-freshness.py) — dual-digest screenshot contract
- [`docs/screenshots/manifest.json`](https://github.com/cathrynlavery/diagram-design/blob/4451eadc484d76aa860edf3289c16fcd082dcdbf/docs/screenshots/manifest.json) — pinned renderer + 78 digests
- [`scripts/lint-skin.py`](https://github.com/cathrynlavery/diagram-design/blob/4451eadc484d76aa860edf3289c16fcd082dcdbf/scripts/lint-skin.py) and [`scripts/lint-skin-baseline.txt`](https://github.com/cathrynlavery/diagram-design/blob/4451eadc484d76aa860edf3289c16fcd082dcdbf/scripts/lint-skin-baseline.txt) — skin lint + 20-file baseline
- [ADR 0005](https://github.com/cathrynlavery/diagram-design/blob/4451eadc484d76aa860edf3289c16fcd082dcdbf/docs/adr/0005-label-geometry-is-verified.md), [ADR 0007](https://github.com/cathrynlavery/diagram-design/blob/4451eadc484d76aa860edf3289c16fcd082dcdbf/docs/adr/0007-new-layout-grammars.md), [ADR 0009](https://github.com/cathrynlavery/diagram-design/blob/4451eadc484d76aa860edf3289c16fcd082dcdbf/docs/adr/0009-versions-are-bumped-on-main-after-merge.md)
- [`.maintainer-policy.json`](https://github.com/cathrynlavery/diagram-design/blob/4451eadc484d76aa860edf3289c16fcd082dcdbf/.maintainer-policy.json) — machine-readable maintainer contract
- [`THIRD_PARTY_LICENSES.md`](https://github.com/cathrynlavery/diagram-design/blob/4451eadc484d76aa860edf3289c16fcd082dcdbf/THIRD_PARTY_LICENSES.md) — Tabler (MIT), Simple Icons (CC0), log-z/logos (MIT), Devicon (MIT)

**API and metadata**
- [GitHub REST API — repos/cathrynlavery/diagram-design](https://api.github.com/repos/cathrynlavery/diagram-design) — stars, license, description field readings
- [GitHub Trending](https://github.com/trending) — 2026-09-05 KST snapshot

**Related on this site**
- [Archify Source Audit: The Viral Diagram Skill Is Really a Distrust Stack](/posts/archify-distrust-stack-audit/)
- [mjlab Source Audit: The Green Badge Proves the CPU Path](/posts/mjlab-source-audit/)
- [ECC Retired Six MCP Servers Over a Tax Its Catalog Still Pays](/posts/ecc-context-tax-audit/)

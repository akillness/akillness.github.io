---
title: "Open Science's Provenance Engine Would Reject Its Own #1 Badge"
description: "A commit-pinned audit of aipoch/open-science: checksum-bound artifact provenance in the code, and a README #1 badge that sheds every hedge the org's blog recorded a day earlier."
categories: [AI, Agents]
tags: [ai-agents, harness-engineering, trust-boundaries, open-source]
date: 2026-09-07 00:14:59 +0900
mermaid: false
math: false
image:
  path: /assets/img/posts/2026-09-07-open-science-provenance-audit/claim-surfaces.svg
  alt: "Diagram of one benchmark number crossing three surfaces in aipoch/open-science — a private workbook, a hedged blog post, and an unhedged README #1 badge — above the product's own checksum-bound provenance subsystem"
---

![Diagram of one benchmark number crossing three surfaces in aipoch/open-science](/assets/img/posts/2026-09-07-open-science-provenance-audit/claim-surfaces.svg)

> **Editorial method:** This Source Audit was researched and drafted with AI assistance inside an evidence-gated harness, then checked against the pinned commit before publication.

## 🤔 Curiosity: What does a provenance-first product owe its own marketing claims?

[AIPOCH Open Science](https://github.com/aipoch/open-science/tree/37a159df669ec84711354c03fa7d5e0fc63c4f76) is an Apache-2.0 desktop research workbench built around one promise: evidence you can trust. Its README promises that immutable artifact versions retain the production evidence Open Science can verify, and explicitly mark evidence it cannot. At commit `37a159df` the repository was created 2026-07-03, carried 3,733 stars at retrieval, and had shipped four releases in five days — v0.23.0 through v0.25.1 between August 30 and September 3, the most recent three days before this audit's retrieval.

The same README opens with a trophy. Since September 1 the header has carried a `#1 BiomniBench-DA Public 50` badge, and a Benchmark Performance section states that Open Science achieved the highest ranking score in the compiled BiomniBench-DA Public 50 comparison, earning **79.05** with **gpt-5.6-sol (xhigh)**, placing Open Science **#1** among the collected Public 50 results.

So the question this audit answers: does the benchmark claim meet the evidence standard the product itself enforces — in shipped TypeScript — for every artifact its users produce?

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-07-open-science-provenance-audit/references/readme-workspace-tour.jpg" alt="Open Science desktop workspace screenshot from the README product tour, showing an agent session beside project files and generated artifacts">
  <figcaption>The product under audit: the Open Science workspace from the README product tour &mdash; Workspace product-tour screenshot from the aipoch/open-science repository, Apache-2.0 licensed, pinned at commit 37a159df. Source: <a href="https://github.com/aipoch/open-science/tree/37a159df669ec84711354c03fa7d5e0fc63c4f76">https://github.com/aipoch/open-science/tree/37a159df669ec84711354c03fa7d5e0fc63c4f76</a>. Publisher: AIPOCH (aipoch/open-science contributors). Licence: <a href="https://github.com/aipoch/open-science/blob/37a159df669ec84711354c03fa7d5e0fc63c4f76/LICENSE">https://github.com/aipoch/open-science/blob/37a159df669ec84711354c03fa7d5e0fc63c4f76/LICENSE</a>.</figcaption>
</figure>

## 📚 Retrieve: Five surfaces of one number

I read the repository at the pinned SHA through the GitHub API and raw file fetches, then put five surfaces of the same claim side by side: the product's provenance code, the README badge, the org's own blog post, the third-party comparison the numbers trace back to, and the benchmark paper's protocol. Every quote below was verified verbatim during this run.

| Surface | Date | What it says about 79.05 | Evidence state it would earn |
|---|---|---|---|
| Provenance code (`src/main/artifacts/`) | in tree at `37a159df` | nothing — no run artifact to bind | `unavailable`, typed reason |
| AIPOCH blog | 2026-08-31 | internal run, unlisted externally, four named limits | `partial`, honestly labelled |
| README badge (PR #2025) | 2026-09-01 | "#1", "achieved the highest ranking score" | no state; hedges absent |
| AI4S controlled comparison | inactive since 2026-07-19 | product excluded as unscorable; OmicOS #1 at 0.769 | n/a — different protocol |
| BiomniBench paper | v2 | single adopted judge; harness shifts scores more than model generations | n/a — different task set |

### Surface 1: the provenance subsystem is real, and strict

The trust language is implemented, not aspirational. `src/main/artifacts/` contains a provenance subsystem that validates every artifact version field-by-field against its database row — producer run identity, execution snapshot checksum, environment manifest checksum, and every input's ordinal, checksum, and storage key. Any mismatch throws `ProvenanceIntegrityError`. Content status is checksum-bound at read time: `resolveArtifactContentStatus` re-hashes the stored bytes (or, on the production path, verifies an unchanged content lease) and returns `available` only when the SHA-256 matches the recorded checksum, otherwise a typed `unavailable` reason of `missing` or `checksum-mismatch`. Evidence that cannot be captured is not silently dropped; it becomes a typed state with an enumerated reason, such as `environment-capture-failed`.

The discipline extends to CI. An e2e certification spec, `artifact-provenance.spec.ts`, creates an artifact, asserts its producer evidence is `available` with a concrete `producer_run_id`, restarts the Electron app, and asserts the provenance is still readable. The committed visual-regression baselines even include the provenance panel itself.

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-07-open-science-provenance-audit/references/provenance-visual-baseline.png" alt="Committed Playwright visual-regression baseline of the artifact provenance panel in light mode, filename suffixed -darwin">
  <figcaption>The provenance panel, pinned as a Playwright baseline in the repository's own e2e suite &mdash; Visual-regression baseline provenance-desktop-light-darwin.png from the aipoch/open-science e2e suite, Apache-2.0 licensed, pinned at commit 37a159df. Source: <a href="https://github.com/aipoch/open-science/tree/37a159df669ec84711354c03fa7d5e0fc63c4f76">https://github.com/aipoch/open-science/tree/37a159df669ec84711354c03fa7d5e0fc63c4f76</a>. Publisher: AIPOCH (aipoch/open-science contributors). Licence: <a href="https://github.com/aipoch/open-science/blob/37a159df669ec84711354c03fa7d5e0fc63c4f76/LICENSE">https://github.com/aipoch/open-science/blob/37a159df669ec84711354c03fa7d5e0fc63c4f76/LICENSE</a>.</figcaption>
</figure>

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-07-open-science-provenance-audit/references/session-recovery-visual-baseline.png" alt="Committed Playwright visual-regression baseline showing the session recovery warning dialog, filename suffixed -darwin">
  <figcaption>The same durability discipline applied to sessions: the recovery warning, also a committed baseline &mdash; Visual-regression baseline session-recovery-warning-darwin.png from the aipoch/open-science e2e suite, Apache-2.0 licensed, pinned at commit 37a159df. Source: <a href="https://github.com/aipoch/open-science/tree/37a159df669ec84711354c03fa7d5e0fc63c4f76">https://github.com/aipoch/open-science/tree/37a159df669ec84711354c03fa7d5e0fc63c4f76</a>. Publisher: AIPOCH (aipoch/open-science contributors). Licence: <a href="https://github.com/aipoch/open-science/blob/37a159df669ec84711354c03fa7d5e0fc63c4f76/LICENSE">https://github.com/aipoch/open-science/blob/37a159df669ec84711354c03fa7d5e0fc63c4f76/LICENSE</a>.</figcaption>
</figure>

### Surface 2: the badge, and what ships behind it

The Benchmark Performance section reports that 79.05 combines a Gemini 3.1 Pro judge score of 81.04 and a DeepSeek v4-pro judge score of 77.06 through an equal-weight mean. The supporting artifact in the tree is a single image: `docs/images/readme/biomnibench-public50-leaderboard.jpg`. I scanned the full recursive tree at the pinned SHA — 3,893 entries, not truncated — for paths matching `biomni`, `bench`, or `leaderboard`, case-insensitive. Beyond that JPEG, the matches are a generic skill helper script and two UI store files whose names happen to contain "bench". Within that scan there is no benchmark harness, no run configuration, no task transcript, no judge prompt, and no scoring artifact.

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-07-open-science-provenance-audit/references/biomnibench-public50-leaderboard.jpg" alt="Leaderboard chart committed in the Open Science README showing AIPOCH Open Science at 79.05 at the top of collected BiomniBench-DA Public 50 values">
  <figcaption>The only benchmark artifact the tree scan found at the pinned SHA &mdash; BiomniBench-DA Public 50 leaderboard image from the aipoch/open-science repository, Apache-2.0 licensed, pinned at commit 37a159df. Source: <a href="https://github.com/aipoch/open-science/tree/37a159df669ec84711354c03fa7d5e0fc63c4f76">https://github.com/aipoch/open-science/tree/37a159df669ec84711354c03fa7d5e0fc63c4f76</a>. Publisher: AIPOCH (aipoch/open-science contributors). Licence: <a href="https://github.com/aipoch/open-science/blob/37a159df669ec84711354c03fa7d5e0fc63c4f76/LICENSE">https://github.com/aipoch/open-science/blob/37a159df669ec84711354c03fa7d5e0fc63c4f76/LICENSE</a>.</figcaption>
</figure>

Hold that against the product's own rule: an artifact version whose producer run cannot be bound gets `producer.state: 'unavailable'` with a reason, and a content read whose bytes do not hash to the recorded checksum comes back `checksum-mismatch`. The README's headline number has no producer run in the tree at all.

### Surface 3: the org's own blog had the hedges — for one day

Here is the part that makes this audit worth writing. AIPOCH's blog post about the result, dated August 31, is genuinely careful. It states, verbatim: "It is not an official first-place listing, and the AIPOCH run is not yet present on an external results page." It calls the accurate description the "highest displayed value in AIPOCH's supplied workbook, from an internal run". It lists four limits by name — no task-level material, no uncertainty analysis, mixed comparison conditions, no feature attribution — and warns the margin "should not be described as a statistically established lead".

The blog even quantifies why that warning matters: "The nearest displayed reference value is 78.80% for OmicOS with gpt-5.5. The workbook marks that value as DeepSeek-only, while Open Science's 79.05% is the mean of two judges." A 0.25-percentage-point lead, comparing a two-judge mean on one model against a one-judge value on a different model.

On September 1 — one day later — PR #2025 merged the README change: champion badge, a benchmark section the PR body describes as localized across all nine README languages, leaderboard image. The section that shipped says "achieved the highest ranking score" and "#1 among the collected Public 50 results". None of the blog's four limits, and neither the "internal run" nor the "not an official first-place listing" hedge, appears in it. The hedges survived exactly one surface and one day.

### Surface 4: the comparison it borrowed had already excluded the product

The collected values the blog retains — Claude/CSSwitch at 68.20, EvoScientist at 65.30, Biomni at 63.05, synthetic-sciences/openscience at 62.50, ai4s-research/open-science at 62.10, Wisp Science at 61.20 — match, to two decimals, the dual-judge means recomputed from the judge columns published by the third-party comparison repository [omicverse/BiomniBench-AI4S](https://github.com/omicverse/BiomniBench-AI4S) (for Biomni the table's rounded mean prints 0.630; 63.05 is the exact mean of its two published judge scores, 0.635 and 0.626). I label the sourcing correspondence an inference; the arithmetic is checkable by anyone.

That comparison was controlled in exactly the way the workbook is not: seven backends, all on `deepseek-v4-pro`, same judge, with a dual-judge robustness pass showing every backend's gap at 0.01 or less. Its winner was OmicOS at 0.769. And its README explicitly explains why aipoch/open-science is absent, in the maintainers' words: "a desktop GUI wrapper around the OpenCode and Claude Code engines (it does not ship an independent agent core), with no headless CLI", so "there is no reproducible way to score it here". AIPOCH's README, for its part, describes Open Science as "an independent product built from scratch" while listing a Claude or Codex subscription among its model providers; I quote both characterizations and adjudicate neither. Either way, the one controlled comparison in this story could not include the product whose README now tops the chart, and the workbook's OmicOS row — 78.80, gpt-5.5, single-judge — matches no value in that comparison's published tables.

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-07-open-science-provenance-audit/references/onboarding-model-provider.jpg" alt="Open Science onboarding screen for choosing a model provider, from the README first-run guide">
  <figcaption>The provider onboarding the engine dispute turns on: built-in cloud, custom gateway, or a Claude/Codex subscription &mdash; Model-provider onboarding screenshot from the aipoch/open-science repository, Apache-2.0 licensed, pinned at commit 37a159df. Source: <a href="https://github.com/aipoch/open-science/tree/37a159df669ec84711354c03fa7d5e0fc63c4f76">https://github.com/aipoch/open-science/tree/37a159df669ec84711354c03fa7d5e0fc63c4f76</a>. Publisher: AIPOCH (aipoch/open-science contributors). Licence: <a href="https://github.com/aipoch/open-science/blob/37a159df669ec84711354c03fa7d5e0fc63c4f76/LICENSE">https://github.com/aipoch/open-science/blob/37a159df669ec84711354c03fa7d5e0fc63c4f76/LICENSE</a>.</figcaption>
</figure>

### Surface 5: the benchmark's own protocol

[BiomniBench](https://www.biorxiv.org/content/10.64898/2026.05.12.724604v2.full) is a serious benchmark — 100 biomedical data-analysis tasks drawn from 21 high-impact publications, expert-designed rubrics, sandboxed Harbor v3 runs. Its paper adopts a single judge, validated against human experts: "We adopt Gemini 3.1 Pro as the judge throughout the paper." The dataset release keeps 50 tasks public and holds 50 private. Two of the paper's findings frame this audit. First: "The agent harness shifts scores by more than the gap between successive model generations" — harness comparison is precisely what this benchmark is sensitive to, which is why mixing base models across rows matters so much. Second: "Even the best configuration scores below 75 of 100 on average" across the configurations the paper evaluated on its full task set. AIPOCH's 79.05 comes from a different task subset, a different judge protocol, and an unpublished run; the numbers are not comparable, in either direction. That incomparability is the point.

## 💡 Innovation: Marketing surfaces need a provenance state too

The finding, stated plainly: this team knows how to mark unverifiable evidence — they shipped a type system for it — and their own benchmark claim never got a state assigned. Every hedge existed in writing on August 31. The README that most people will actually read carries none of them.

Three transferable rules fall out:

1. **Give marketing claims the same states as artifacts.** Open Science's own vocabulary is sufficient: `available`, `partial`, `unavailable` with a typed reason. A README benchmark section that said "internal run, external listing pending" would be a `partial` state and would still be impressive. The provenance model that already exists in `src/main/artifacts/` is the standard the badge should meet.
2. **Hedges are load-bearing; version them.** The blog and the README were written by the same organization one day apart, and the hedges did not survive the copy. If a claim's caveats live on a different surface from the claim, treat that as drift — the same failure class I audited in [diagram-design's validators](/posts/diagram-design-drift-audit/), where the enforced surfaces stayed honest and the unenforced ones aged. The enforcement answer there — make drift a CI failure class — applies to benchmark sections too.
3. **A leaderboard row is an artifact; demand its inputs.** The product's checksum rule generalizes: a score without its run configuration, transcripts, and judge prompts is a content read that cannot be re-hashed. The tree ships the chart and not the run. In a repository this disciplined about its own e2e certification — provenance panels are literally pinned as visual baselines — the absence of benchmark run artifacts is conspicuous — whether by choice or by oversight, the tree cannot say.

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-07-open-science-provenance-audit/references/pr-automatic-environment-check.png" alt="Pull-request evidence screenshot committed under .github/pr-assets showing the app's automatic environment check UI">
  <figcaption>The repository does commit evidence when it wants to: a PR evidence screenshot tracked under .github/pr-assets &mdash; PR evidence screenshot automatic-environment-check.png from the aipoch/open-science repository, Apache-2.0 licensed, pinned at commit 37a159df. Source: <a href="https://github.com/aipoch/open-science/tree/37a159df669ec84711354c03fa7d5e0fc63c4f76">https://github.com/aipoch/open-science/tree/37a159df669ec84711354c03fa7d5e0fc63c4f76</a>. Publisher: AIPOCH (aipoch/open-science contributors). Licence: <a href="https://github.com/aipoch/open-science/blob/37a159df669ec84711354c03fa7d5e0fc63c4f76/LICENSE">https://github.com/aipoch/open-science/blob/37a159df669ec84711354c03fa7d5e0fc63c4f76/LICENSE</a>.</figcaption>
</figure>

This pattern is becoming a genre. The [Maka audit](/posts/maka-working-record-audit/) found one artifact class crossing three policy surfaces with different rules on each; here, one benchmark number crosses three publication surfaces and sheds its evidence status at each hop. If you build or buy agent workbenches, the practical takeaway is a reading protocol: when you meet a `#1` badge, ask which judge, which base model, which task subset, where the run artifacts live, and whether the org's other surfaces say something more careful. In this case all five answers were retrievable in one evening, and they change the claim's meaning entirely.

## Limitations

- I did not run Open Science, its e2e suites, or any BiomniBench task; all code claims come from reading the pinned source, and the run-artifact absence claim is bounded to the tracked tree at `37a159df` and the scan pattern named above. Private run artifacts may exist.
- The AI4S maintainers' "GUI wrapper" characterization and AIPOCH's "independent product built from scratch" statement conflict; I quote both and verify neither against the architecture.
- That the workbook's six retained values were sourced from the AI4S comparison is an inference from exact numeric correspondence; the workbook itself is not public.
- The blog page is unversioned and could change after my retrieval; all its quotes were substring-verified during this run.
- Star counts, release cadence, and README wording are point-in-time observations from this run's retrieval window.

## 🎯 Key Takeaways

- **The provenance engine is real.** Checksum-bound content status, typed evidence states, integrity errors on mismatch, relaunch-certified in e2e — the trust implementation in `src/main/artifacts/` holds up under source reading.
- **The badge does not meet the product's own standard.** The `#1` claim ships with one JPEG in-tree; no harness, transcripts, or judge prompts match the scan at the pinned SHA.
- **Hedges lasted one day and one surface.** The org's August 31 blog called the result internal, unlisted, and statistically unestablished; the September 1 README badge carries none of that.
- **The margin is protocol-shaped.** 79.05 (two judges, gpt-5.6-sol) vs 78.80 (one judge, gpt-5.5) is a 0.25pp lead across incommensurable cells, by the org's own description.
- **The controlled comparison could not include the product.** The third-party same-model, same-judge comparison excluded it as unscorable and crowned a different tool.

## 🤔 New Questions

- Would AIPOCH publish the run package — configs, transcripts, judge prompts — and would the number survive the paper's single-judge protocol on the same tasks?
- What would a machine-readable claim state for README badges look like — a `benchmark.provenance.json` next to the chart that CI checks the way this repo already checks visual baselines?
- BiomniBench holds 50 tasks private; will official leaderboard placement (rather than compiled comparisons) become the only citable form of this claim?
- How many other agent-tool READMEs carry compiled-comparison trophies whose hedges live on an unlinked surface? The reading protocol above generalizes; the audit queue is long.

## References

### Primary sources

- [aipoch/open-science at 37a159df](https://github.com/aipoch/open-science/tree/37a159df669ec84711354c03fa7d5e0fc63c4f76) — pinned tree, README, provenance sources, e2e specs
- [provenance-core-evidence.ts](https://github.com/aipoch/open-science/blob/37a159df669ec84711354c03fa7d5e0fc63c4f76/src/main/artifacts/provenance-core-evidence.ts) / [provenance-content-status.ts](https://github.com/aipoch/open-science/blob/37a159df669ec84711354c03fa7d5e0fc63c4f76/src/main/artifacts/provenance-content-status.ts) / [artifact-provenance.spec.ts](https://github.com/aipoch/open-science/blob/37a159df669ec84711354c03fa7d5e0fc63c4f76/e2e/certification/artifact-provenance.spec.ts)
- [PR #2025 — docs(readme): highlight BiomniBench-DA ranking](https://github.com/aipoch/open-science/pull/2025) — merged 2026-09-01

### First-party write-up

- [AIPOCH blog: Open Science Ranks #1 in BiomniBench-DA Public 50](https://aipoch.com/blog/open-science-biomnibench-da) — the hedged version, 2026-08-31

### Third-party comparison and benchmark

- [omicverse/BiomniBench-AI4S](https://github.com/omicverse/BiomniBench-AI4S) — controlled seven-backend comparison and exclusion note
- [BiomniBench paper (bioRxiv, v2)](https://www.biorxiv.org/content/10.64898/2026.05.12.724604v2.full) — judge protocol and harness-sensitivity findings
- [phylobio/BiomniBench-DA dataset](https://huggingface.co/datasets/phylobio/BiomniBench-DA) — 50 public / 50 private task split, CC-BY-4.0

### Related on this site

- [Apache Maka Tracks Its Agents' Screenshots and Ships None of Them](/posts/maka-working-record-audit/) — one artifact class, three policy surfaces
- [diagram-design drift audit](/posts/diagram-design-drift-audit/) — making claim drift a CI failure class, and where it still escapes

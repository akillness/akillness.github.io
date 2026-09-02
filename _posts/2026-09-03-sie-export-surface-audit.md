---
title: "SIE's Public Repo Is an Export Surface, Not a Workshop"
description: "SIE's changelog cites PR #478 while the public repo's sequence stops at #248. Engine releases arrive as bot-authored squash syncs, and no .github directory exists at v0.7.2."
categories: [AI, Research]
tags: [sie, superlinked, inference, self-hosted, ai-agents, open-source, provenance, mcp]
date: 2026-09-03 00:15:03 +0900
mermaid: false
image:
  path: /assets/img/posts/2026-09-03-sie-export-surface-audit/export-surface-cover.svg
  width: 1200
  height: 630
  alt: "Two-zone diagram of the SIE repository: an examples zone developed through public pull requests, and an engine zone that arrives as a 300-file sync commit, with the changelog citing PR #478 while the public sequence ends at #248 and no .github directory present at v0.7.2"
---

## 🤔 Curiosity: what can you audit in a vendor-run open-source repo?

[SIE](https://github.com/superlinked/sie), the Superlinked Inference Engine, is having a moment. It appeared on GitHub's daily Trending list on 3 September 2026 with 60 stars that day and 2,999 overall, and it makes a pitch squarely aimed at agent builders: "an open-source inference engine that runs the models behind every agent task through one API: search and retrieval, document-to-markdown conversion, structured output, content safety, and the agent loop itself."

I went in to audit the engine. I came out having audited something more interesting: the repository itself. Because the most consequential fact about `superlinked/sie` is not in any file — it is in the shape of the history. The engine's development does not happen in this public repository. Its releases are delivered here.

That distinction matters to anyone deciding whether to build on it, and it is invisible from the README. So this audit reconstructs it from the evidence a repository cannot help but carry.

> **Editorial method:** This Source Audit was researched and drafted with AI assistance inside an evidence-gated editorial harness; every repository claim is pinned to commit 9a7e8d35 or to GitHub API responses recorded in the run's evidence pack, and nothing was executed.
{: .prompt-info }

## 📚 Retrieve: what the pinned tree and the API record show

I read the tree at commit `9a7e8d3599f7f16ee57c5218f2ad3822e45c129f` — the commit the `v0.7.2` tag and the v0.7.2 GitHub release (published 2026-08-27) both point at — plus the GitHub REST API's commit, tree, tag, release and issue records. Nothing was cloned or executed.

### Finding 1 — the changelog cites a PR the public repo cannot contain

Deep in `CHANGELOG.md`, at line 1515, sits this entry:

> fix: address PR #478 review feedback

GitHub issues and pull requests share one monotonically increasing number sequence per repository, and the public `superlinked/sie` sequence has only reached #248 — an issue opened on 2 September 2026. Requesting `pulls/478` from the API returns 404. PR #478 cannot be a pull request of this repository. It identifies a review that happened somewhere else — by every appearance, a private repository where the engine is actually developed.

It is not alone. Further down, the changelog credits "Add PaddleOCR-VL-1.5 adapter (#659)" — another number the public sequence has never reached. One stray number would be a curiosity. Two, plus the rest of the evidence, is a pattern.

### Finding 2 — releases arrive as sealed squash commits; the history stays behind

The tip of `main` at the pinned ref is the release itself: commit `9a7e8d35`, message `sync source: v0.7.2`, authored as `github-actions[bot]`. It is a single-parent commit touching 300 files, +31,173/−2,370 lines, with no constituent history behind it. (Commit author identity is git metadata that any pusher can set, so I describe it as *authored as* the bot rather than proven automation.)

This is not a one-off. Sampling earlier releases shows the same mechanism at smaller scale under a different label: `release: v0.7.1` is a single-parent bot commit touching 34 files, `release: v0.7.0` touches 51 including `sie_sdk` client source and tests, and `release: v0.6.26` touches 64 including the gateway's Rust handlers — engine source riding inside version-bump commits. And the per-change history never lands at all: I searched the last 100 public commits on `main` (reaching back to 22 May 2026) for five entries straight out of the v0.7.1 changelog section — "GLiNER token window", "docling OCR", "stale job result", "Grounding DINO instructions", "audio_ms" — and none of them matches any public commit message. The changelog describes commits you cannot see.

The changelog confirms the one-way flow at the tag itself: at `v0.7.2`, `CHANGELOG.md`'s newest section is **v0.7.1**. The tag exists before the changelog knows about it. Whatever process writes the changelog runs somewhere this repository only receives.

If you ever need to bisect a regression between v0.7.1 and v0.7.2, this is the resolution you get: one squash commit, 300 files.

### Finding 3 — there is no .github directory at all

The complete recursive tree listing at the pinned commit — 2,387 entries, not truncated — contains zero paths beginning with `.github`. No Actions workflow, no issue template, no CODEOWNERS. No GitHub Actions can run in this repository, and nothing publicly declares what a release must pass. (Branch protection and externally attached checks are not visible to this method; the point stands that nothing is publicly declared.)

The governance documents point the same direction. `COMPATIBILITY.md` says all packages share a single version number "managed by [release-please](https://github.com/googleapis/release-please)" — release automation whose configuration appears nowhere in this tree. And that same document is stamped "Last Updated: 2026-03-17" and still describes the project as "currently 0.1.x", dozens of releases behind the v0.7.2 the repository just shipped. A compatibility policy five months stale is exactly what you would expect when the file is an exported artifact rather than a living document.

### Finding 4 — two zones, and only one is developed in the open

Here is the part that makes SIE a genuinely instructive case rather than a simple mirror. The sync commit's footprint is precisely bounded: 231 files under `packages/`, 39 under `integrations/`, 22 under `deploy/`, a handful of root files — and **zero** under `examples/`.

The examples zone behaves like a normal open-source project: PR #239 (an ATT&CK threat-report mapper example) merged directly on `main` on 21 August. And the seam is not a permission wall — community PR #234 (PaddleOCR-VL-1.6, an external contributor) merged on 10 August and modified `sie_server` adapter, core and test source publicly. The seam is a *provenance* boundary: outside code can enter the engine through public review, but the engine's own change history — every changelog entry I sampled — arrives sealed inside bot squashes. One repository, two development models.

And the public zone is good. The `retrieval-ablation` example is the kind of artifact most vendors never publish: "Six bank 10-K filings from SEC EDGAR, 1,854 real queries, 2,942 pages, eight retrieval strategies, ranked by NDCG@10", with the losing configurations listed alongside the winner.

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-03-sie-export-surface-audit/references/retrieval-ablation-pipeline.png" alt="Pipeline diagram from SIE's retrieval-ablation example showing pages and queries encoded by two multi-vector models, candidates merged, then reranked by a cross-encoder into the final NDCG@10 ranking">
  <figcaption>The winning retrieval recipe from the retrieval-ablation example. Source: <a href="https://github.com/superlinked/sie/blob/9a7e8d3599f7f16ee57c5218f2ad3822e45c129f/examples/retrieval-ablation/README.md">https://github.com/superlinked/sie/blob/9a7e8d3599f7f16ee57c5218f2ad3822e45c129f/examples/retrieval-ablation/README.md</a> · License: <a href="https://github.com/superlinked/sie/blob/9a7e8d3599f7f16ee57c5218f2ad3822e45c129f/LICENSE">https://github.com/superlinked/sie/blob/9a7e8d3599f7f16ee57c5218f2ad3822e45c129f/LICENSE</a> · Superlinked (superlinked/sie), Apache-2.0, commit 9a7e8d35</figcaption>
</figure>

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-03-sie-export-surface-audit/references/retrieval-ablation-results.png" alt="Bar chart from the retrieval-ablation example ranking eight retrieval strategies by NDCG@10, with the dual multi-vector plus rerank recipe on top">
  <figcaption>The example's own results chart, ranking every strategy it tried. Source: <a href="https://github.com/superlinked/sie/blob/9a7e8d3599f7f16ee57c5218f2ad3822e45c129f/examples/retrieval-ablation/README.md">https://github.com/superlinked/sie/blob/9a7e8d3599f7f16ee57c5218f2ad3822e45c129f/examples/retrieval-ablation/README.md</a> · License: <a href="https://github.com/superlinked/sie/blob/9a7e8d3599f7f16ee57c5218f2ad3822e45c129f/LICENSE">https://github.com/superlinked/sie/blob/9a7e8d3599f7f16ee57c5218f2ad3822e45c129f/LICENSE</a> · Superlinked (superlinked/sie), Apache-2.0, commit 9a7e8d35</figcaption>
</figure>

The corpus and the scores are the project's own evaluation — I did not re-run it — but publishing the full ablation, losers included, is the opposite of the sealed-release pattern in the engine zone.

The same care shows in the other examples. The `stripe-link-fraud` demo wires an SIE-driven fraud-risk gate into a Stripe Link checkout in one round-trip:

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-03-sie-export-surface-audit/references/stripe-link-fraud-demo.png" alt="Screenshot of the stripe-link-fraud example demo: an order form on the left and an SIE-driven fraud-risk assessment panel with extracted signals annotating a Stripe Link checkout on the right">
  <figcaption>Demo screenshot embedded in the stripe-link-fraud example README. Source: <a href="https://github.com/superlinked/sie/blob/9a7e8d3599f7f16ee57c5218f2ad3822e45c129f/examples/stripe-link-fraud/README.md">https://github.com/superlinked/sie/blob/9a7e8d3599f7f16ee57c5218f2ad3822e45c129f/examples/stripe-link-fraud/README.md</a> · License: <a href="https://github.com/superlinked/sie/blob/9a7e8d3599f7f16ee57c5218f2ad3822e45c129f/LICENSE">https://github.com/superlinked/sie/blob/9a7e8d3599f7f16ee57c5218f2ad3822e45c129f/LICENSE</a> · Superlinked (superlinked/sie), Apache-2.0, commit 9a7e8d35</figcaption>
</figure>

The `document-ocr` example bundles six synthetic sample documents that are "programmatically generated with Pillow; no real customer data", with the regeneration script in the tree:

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-03-sie-export-surface-audit/references/document-ocr-invoice-sample.png" alt="Synthetic invoice sample image bundled with the document-ocr example, generated programmatically with Pillow for OCR demonstration">
  <figcaption>The bundled synthetic invoice sample from the document-ocr example. Source: <a href="https://github.com/superlinked/sie/blob/9a7e8d3599f7f16ee57c5218f2ad3822e45c129f/examples/document-ocr/README.md">https://github.com/superlinked/sie/blob/9a7e8d3599f7f16ee57c5218f2ad3822e45c129f/examples/document-ocr/README.md</a> · License: <a href="https://github.com/superlinked/sie/blob/9a7e8d3599f7f16ee57c5218f2ad3822e45c129f/LICENSE">https://github.com/superlinked/sie/blob/9a7e8d3599f7f16ee57c5218f2ad3822e45c129f/LICENSE</a> · Superlinked (superlinked/sie), Apache-2.0, commit 9a7e8d35</figcaption>
</figure>

Asset provenance is even documented per example: the `retail-shelf-audit` README attributes its input photo to a third-party Kaggle dataset (the Humans in the Loop Supermarket Shelves Dataset) — which is to the project's credit, and is exactly why that photo does not appear in this article. Inside one Apache-2.0 repository, not every asset's rights come from the repository license.

### What the artifact does tell you

None of this means the artifact is thin. The opposite: the tree carries an unusually explicit operational contract. `telemetry/contract.yaml` is declared "the checked-in source of truth" for metrics, managed log records and the remote trace privacy boundary, currently inventorying 122 application metric families. The `sie_mcp` package positions SIE as an MCP edge for agent surfaces — "Run SIE's document jobs as an MCP server **in your own cloud**" — and claims a parsed artifact is "roughly 85% fewer tokens than native document ingestion" (the project's own hedged estimate; no measurement is cited in that README).

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-03-sie-export-surface-audit/references/sie-mcp-architecture.png" alt="Architecture diagram from the sie_mcp package docs showing agent surfaces connecting over MCP to the sie-mcp edge, which offloads document jobs to an SIE cluster in the operator's cloud">
  <figcaption>The sie_mcp architecture diagram from the package docs. Source: <a href="https://github.com/superlinked/sie/blob/9a7e8d3599f7f16ee57c5218f2ad3822e45c129f/packages/sie_mcp/README.md">https://github.com/superlinked/sie/blob/9a7e8d3599f7f16ee57c5218f2ad3822e45c129f/packages/sie_mcp/README.md</a> · License: <a href="https://github.com/superlinked/sie/blob/9a7e8d3599f7f16ee57c5218f2ad3822e45c129f/LICENSE">https://github.com/superlinked/sie/blob/9a7e8d3599f7f16ee57c5218f2ad3822e45c129f/LICENSE</a> · Superlinked (superlinked/sie), Apache-2.0, commit 9a7e8d35</figcaption>
</figure>

## 💡 Innovation: the export-surface test

Put together, the audit yields a reproducible four-check test you can run on any vendor-run repository in a few minutes, with nothing but the API:

| Check | SIE at v0.7.2 | What it reveals |
|---|---|---|
| Cross-reference changelog PR numbers against the public issue sequence | Changelog cites #478; public sequence ends at #248 | Whether review history lives elsewhere |
| Enumerate the full tree for `.github/` | 2,387 entries, zero under `.github` | Whether any release gate is publicly declared |
| Read the release commit's parent count and file footprint | Single parent, 300 files, +31,173 lines | Whether releases are developed or delivered |
| Date-check the governance documents against the tag history | Compatibility policy says 0.1.x; repo tags v0.7.2 | Whether policy files are living documents or exports |

I write from the adopter's side of this boundary, not the vendor's: the daily audits on this site pin every claim to refs precisely because process visibility keeps disappearing from modern repositories. The pattern is familiar from game production, where middleware routinely arrives as versioned SDK drops. Teams learn to treat the drop as the unit of trust: you regression-test the drop, you pin the drop, and you never assume you can bisect inside it. SIE asks for the same posture — a sibling of the conclusion in yesterday's [mjlab audit](/posts/mjlab-source-audit/), where a green badge turned out to verify only the CPU path of a GPU project. That is a workable engineering relationship — it is just not the same relationship the word "open-source" usually advertises, and the README's star plea ("Help us reach more developers and grow the SIE community. Star this repo!") is recruiting for the delivery surface, not the workshop.

To be precise about what this audit does *not* claim: Apache-2.0 is a real grant, the code is really there, community PRs really do merge in the examples zone, and nothing here suggests bad faith. Split-development with a public export is a legitimate, common pattern. The finding is narrower and more useful — the repository's two zones offer two different levels of auditability, the engine zone's process is structurally out of public view, and you can measure that yourself before adopting.

If you are weighing SIE as self-hosted inference for agent workloads, the natural next read is my audit of the competing edge-serving approach in [FreeToken: 284B on a gaming desktop](/posts/freetoken-edge-native-moe-serving/), which examines what that repository could and could not verify about its own performance story.

## 🎯 Key Takeaways

- **The public SIE repo is a delivery surface.** Release engine work arrives inside single-parent squash commits authored as `github-actions[bot]` — 34 to 64 files for sampled earlier releases, 300 files for the `sync source: v0.7.2` commit the tag points at — and the changelog at that tag does not yet contain a v0.7.2 section.
- **The changelog proves the private loop.** It cites PR #478 review feedback and a PR #659 adapter credit while the public repository's issue/PR sequence has only reached #248 and `pulls/478` returns 404.
- **No release gate is publicly declared.** The complete tree at v0.7.2 has no `.github` directory — no workflow, no template, no CODEOWNERS — and the compatibility policy still says "currently 0.1.x", dated 2026-03-17.
- **The seam is provenance, not permission.** The v0.7.2 sync touched 231 files in `packages/` and zero in `examples/`; community PRs merge publicly in both zones — but every sampled changelog entry arrived inside a bot squash, not as reviewable public history.
- **Audit the artifact, price in the process.** Apache-2.0 grants rights to the code; it grants no visibility into how the code was reviewed, tested, or gated.

## 🤔 New Questions This Raises

- The changelog's PR numbers reach at least #659 while the public sequence stops at #248 — what do those hundreds of invisible reviews contain, and would Superlinked publish the private CI definition on request?
- How common is the export-surface pattern among agent-infrastructure vendors, and would the four-check test above cleanly classify, say, the repositories behind other trending inference engines?
- When a regression does ship in a 300-file sync, what does issue triage look like for outside adopters who cannot bisect it?

## References

- [superlinked/sie at 9a7e8d35 (v0.7.2)](https://github.com/superlinked/sie/tree/9a7e8d3599f7f16ee57c5218f2ad3822e45c129f) — audited tree
- [Commit 9a7e8d35 — `sync source: v0.7.2`](https://github.com/superlinked/sie/commit/9a7e8d3599f7f16ee57c5218f2ad3822e45c129f) — 300-file release sync
- [CHANGELOG.md](https://github.com/superlinked/sie/blob/9a7e8d3599f7f16ee57c5218f2ad3822e45c129f/CHANGELOG.md) — PR #478 reference at line 1515
- [COMPATIBILITY.md](https://github.com/superlinked/sie/blob/9a7e8d3599f7f16ee57c5218f2ad3822e45c129f/COMPATIBILITY.md) — stale versioning policy
- [telemetry/README.md](https://github.com/superlinked/sie/blob/9a7e8d3599f7f16ee57c5218f2ad3822e45c129f/telemetry/README.md) — checked-in telemetry contract
- [packages/sie_mcp/README.md](https://github.com/superlinked/sie/blob/9a7e8d3599f7f16ee57c5218f2ad3822e45c129f/packages/sie_mcp/README.md) — MCP edge positioning
- [examples/retrieval-ablation/README.md](https://github.com/superlinked/sie/blob/9a7e8d3599f7f16ee57c5218f2ad3822e45c129f/examples/retrieval-ablation/README.md) — public benchmark ablation
- [v0.7.2 release](https://github.com/superlinked/sie/releases/tag/v0.7.2) — published 2026-08-27

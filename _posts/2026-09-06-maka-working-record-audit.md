---
title: "Apache Maka Tracks Its Agents' Screenshots and Ships None of Them"
description: "A commit-pinned audit of Apache Maka's working-record boundary: agent PR evidence tracked in git, export-ignored from the ASF source archive, bound by tests in two languages."
categories: [AI, Agents]
tags: [ai-agents, harness-engineering, open-source, tooling]
date: 2026-09-06 00:13:09 +0900
mermaid: false
math: false
image:
  path: /assets/img/posts/2026-09-06-maka-working-record-audit/record-boundary.svg
  alt: "Timeline of one artifact class in apache/maka crossing three policy surfaces: a gitignore ban scoped to docs paths, agent screenshots re-entering at a new root path, and the ASF release boundary stripping them from the source archive"
---

![Timeline of one artifact class in apache/maka crossing three policy surfaces](/assets/img/posts/2026-09-06-maka-working-record-audit/record-boundary.svg)

> **Editorial method:** This Source Audit was researched and drafted with AI assistance inside an evidence-gated harness, then checked against the pinned commit before publication.

## 🤔 Curiosity: When agents build software, where does their homework go?

Agent-first development produces a new artifact class that classic repository hygiene never named: the working evidence agents generate while doing the job. Before/after screenshots for a PR. A review copy of a governance document. The harness launch config itself. None of it is source. All of it is record.

[Apache Maka (Incubating)](https://github.com/apache/maka/tree/dd7d1d595b7f9284e01fe76cf547c979a6d84a0a) is the sharpest place I have found to watch a project answer the question, because its entire identity is provenance. The README's one-line description is that Maka is a high-performance agent workspace that keeps a complete record of everything it did. At commit `dd7d1d59` the repository is Apache-2.0, TypeScript and Electron, created 2026-05-27, carrying 4,755 stars and 4,375 commits on `main`.

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-06-maka-working-record-audit/references/readme-hero-runtime-events.png" alt="README hero diagram showing one turn of RuntimeEvents in the Maka log: the model speaks, runs a command, asks permission, the user approves, the tool result returns, a file is edited, and the turn ends">
  <figcaption>The claim, in the project's own artwork: one turn of the append-only event log &mdash; README hero image from the Apache Maka repository, Apache-2.0 licensed, pinned at commit dd7d1d59. Source: <a href="https://github.com/apache/maka/tree/dd7d1d595b7f9284e01fe76cf547c979a6d84a0a">https://github.com/apache/maka/tree/dd7d1d595b7f9284e01fe76cf547c979a6d84a0a</a>. Publisher: Apache Maka (Incubating) contributors (apache/maka). Licence: <a href="https://github.com/apache/maka/blob/dd7d1d595b7f9284e01fe76cf547c979a6d84a0a/LICENSE">https://github.com/apache/maka/blob/dd7d1d595b7f9284e01fe76cf547c979a6d84a0a/LICENSE</a>.</figcaption>
</figure>

So here is the question this audit actually answers: a project whose runtime treats the log as the source of truth also develops itself with agents. What happens when the agents' own working record starts landing in the git tree?

## 📚 Retrieve: The tree already contains the answer, dated

I cloned the repository and checked out `dd7d1d59`, then reconstructed one artifact class's history with per-file `git log` and tree-wide greps. Every claim below is pinned to that commit.

### The runtime half of the claim is real

Before auditing the development side, it is fair to record that the runtime side holds up. The README states that every model message, tool call, permission decision and termination is an append-only RuntimeEvent, and that old tool output can leave the next prompt without leaving the log. The code enforces both halves: `packages/core/src/runtime-event-store.ts` seals a run once a terminal event exists, and appending afterwards raises `RunSealedError`; events carry a `model_visibility` field of `visible` or `hidden`, which is exactly the mechanism that lets content drop out of the prompt while staying in the record.

The eval claims are also unusually honest for this space. `docs/eval/` ships five Terminal-Bench 2.1 reports with per-task CSVs; the four-arm DeepSeek V4 Flash report covers all 89 tasks, reports 353/356 model-scored cells, and labels itself `completed_with_gaps` instead of rounding up. A benchmark page that names its own gaps is rare enough to say so.

### August 7: the rule says attach, do not commit

On 2026-08-07, PR #2376 — titled "chore(docs): drop temporary screenshots and assets" — cleaned temporary evidence out of `docs/` and wrote the policy into `.gitignore`:

```text
# Temporary PR/issue visual evidence — attach on GitHub, do not commit under docs/.
docs/screenshots/
docs/assets/
```

Read that rule carefully. It bans a class of artifact — temporary PR and issue visual evidence — but it enforces the ban on exactly two paths under `docs/`.

### August 20: the same class returns through a new path

Thirteen days later the artifact class came back, at a path the rule never mentioned. PR #2919, a fix keeping MCP config secrets on the main-process side of IPC, landed with eight PNG screenshots under a new root directory: `.maka-shots/`. Two more PRs followed on 2026-08-24 (#3617, #3648) and one on 2026-08-25 (#3674), each carrying its own before/after pair. At the audited commit, fourteen screenshots totalling about 3.0 MiB sit tracked in the tree, authored by three different contributors.

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-06-maka-working-record-audit/references/maka-shot-2920-login-denied.png" alt="Maka desktop screenshot committed as PR evidence at .maka-shots/2920-login-denied.png, showing the MCP connector login flow in its denied state">
  <figcaption>Agent working evidence, tracked in the tree: the MCP login-denied state &mdash; Agent working screenshot 2920-login-denied.png committed in apache/maka PR #2919, Apache-2.0 licensed, pinned at commit dd7d1d59. Source: <a href="https://github.com/apache/maka/tree/dd7d1d595b7f9284e01fe76cf547c979a6d84a0a">https://github.com/apache/maka/tree/dd7d1d595b7f9284e01fe76cf547c979a6d84a0a</a>. Publisher: Apache Maka (Incubating) contributors (apache/maka). Licence: <a href="https://github.com/apache/maka/blob/dd7d1d595b7f9284e01fe76cf547c979a6d84a0a/LICENSE">https://github.com/apache/maka/blob/dd7d1d595b7f9284e01fe76cf547c979a6d84a0a/LICENSE</a>.</figcaption>
</figure>

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-06-maka-working-record-audit/references/maka-shot-2921-editor-live-validation.png" alt="Maka desktop screenshot committed as PR evidence at .maka-shots/2921-editor-live-validation.png, showing the MCP config editor with live validation">
  <figcaption>The same PR's evidence for the config editor's live validation &mdash; Agent working screenshot 2921-editor-live-validation.png committed in apache/maka PR #2919, Apache-2.0 licensed, pinned at commit dd7d1d59. Source: <a href="https://github.com/apache/maka/tree/dd7d1d595b7f9284e01fe76cf547c979a6d84a0a">https://github.com/apache/maka/tree/dd7d1d595b7f9284e01fe76cf547c979a6d84a0a</a>. Publisher: Apache Maka (Incubating) contributors (apache/maka). Licence: <a href="https://github.com/apache/maka/blob/dd7d1d595b7f9284e01fe76cf547c979a6d84a0a/LICENSE">https://github.com/apache/maka/blob/dd7d1d595b7f9284e01fe76cf547c979a6d84a0a/LICENSE</a>.</figcaption>
</figure>

These are not documentation images. At `dd7d1d59`, `git grep maka-shots` across the tracked tree matches exactly four files, and every one of them is boundary machinery: `.gitattributes`, the ASF release script, its JS test, and a Rust admission test. No doc, README, or product code embeds any of the fourteen screenshots. They are working evidence in the purest sense — produced to verify a change, referenced by nothing.

The filenames make the workflow legible: `before-dialog.png` and `after-dialog.png` are the classic PR reviewer convention, and `2920-`/`2921-` prefixes appear to track the issue numbers the evidence belongs to.

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-06-maka-working-record-audit/references/maka-shot-before-dialog.png" alt="Maka desktop screenshot committed as PR evidence at .maka-shots/before-dialog.png, capturing the dialog state before the change under review">
  <figcaption>The before half of the reviewer convention &mdash; Agent working screenshot before-dialog.png committed in apache/maka PR #2919, Apache-2.0 licensed, pinned at commit dd7d1d59. Source: <a href="https://github.com/apache/maka/tree/dd7d1d595b7f9284e01fe76cf547c979a6d84a0a">https://github.com/apache/maka/tree/dd7d1d595b7f9284e01fe76cf547c979a6d84a0a</a>. Publisher: Apache Maka (Incubating) contributors (apache/maka). Licence: <a href="https://github.com/apache/maka/blob/dd7d1d595b7f9284e01fe76cf547c979a6d84a0a/LICENSE">https://github.com/apache/maka/blob/dd7d1d595b7f9284e01fe76cf547c979a6d84a0a/LICENSE</a>.</figcaption>
</figure>

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-06-maka-working-record-audit/references/maka-shot-after-dialog.png" alt="Maka desktop screenshot committed as PR evidence at .maka-shots/after-dialog.png, capturing the dialog state after the change under review">
  <figcaption>And the after half &mdash; Agent working screenshot after-dialog.png committed in apache/maka PR #2919, Apache-2.0 licensed, pinned at commit dd7d1d59. Source: <a href="https://github.com/apache/maka/tree/dd7d1d595b7f9284e01fe76cf547c979a6d84a0a">https://github.com/apache/maka/tree/dd7d1d595b7f9284e01fe76cf547c979a6d84a0a</a>. Publisher: Apache Maka (Incubating) contributors (apache/maka). Licence: <a href="https://github.com/apache/maka/blob/dd7d1d595b7f9284e01fe76cf547c979a6d84a0a/LICENSE">https://github.com/apache/maka/blob/dd7d1d595b7f9284e01fe76cf547c979a6d84a0a/LICENSE</a>.</figcaption>
</figure>

The screenshots are not alone. `maka-proposal-zh-review.txt` — a 22,898-byte Chinese review copy of the project's Incubator proposal, whose own header says the English original is authoritative — has sat at the repository root since 2026-08-03, when it rode in on PR #1972, a Settings refactor. And `.claude/launch.json`, a harness launch config, is tracked too: `.gitignore` ignores `.agents` and `skills-lock.json`, but has no `.claude` entry.

### The same day, the boundary moved to the release

Here is the part that turns a hygiene anecdote into a design decision. On 2026-08-20 — the same day the first screenshots landed — PR #3278 added the ASF source-release workflow, and drew the line somewhere else entirely. `.gitattributes` now reads:

```text
# Repository-local agent configuration, visual review evidence, and incubation
# working notes are not source-release inputs.
/.claude export-ignore
/.maka-shots export-ignore
/maka-proposal-zh-review.txt export-ignore
```

The release script goes further than attributes. `scripts/asf-source-release.mjs` hard-codes `forbiddenSegments` — `.agents`, `.claude`, `.git`, `.maka-shots`, `node_modules` — and `forbiddenRootFiles` containing exactly `maka-proposal-zh-review.txt`. Its JS test asserts the produced archive contains nothing matching `.claude`, `.maka-shots`, or the proposal file, and a Rust admission test in the Gitoxide helper fixtures the same export-ignore lines. The boundary is enforced twice and tested in two languages.

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-06-maka-working-record-audit/references/maka-shot-workhub-reconstruction-before.png" alt="Maka desktop screenshot committed as PR evidence at .maka-shots/workhub-reconstruction-before.png, showing the WorkHub view before Session-transcript reconstruction">
  <figcaption>The August 24 wave: WorkHub before transcript reconstruction &mdash; Agent working screenshot workhub-reconstruction-before.png committed in apache/maka PR #3648, Apache-2.0 licensed, pinned at commit dd7d1d59. Source: <a href="https://github.com/apache/maka/tree/dd7d1d595b7f9284e01fe76cf547c979a6d84a0a">https://github.com/apache/maka/tree/dd7d1d595b7f9284e01fe76cf547c979a6d84a0a</a>. Publisher: Apache Maka (Incubating) contributors (apache/maka). Licence: <a href="https://github.com/apache/maka/blob/dd7d1d595b7f9284e01fe76cf547c979a6d84a0a/LICENSE">https://github.com/apache/maka/blob/dd7d1d595b7f9284e01fe76cf547c979a6d84a0a/LICENSE</a>.</figcaption>
</figure>

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-06-maka-working-record-audit/references/maka-shot-chat-code-measure-after.png" alt="Maka desktop screenshot committed as PR evidence at .maka-shots/chat-code-measure-after.png, showing widened transcript code blocks after the fix">
  <figcaption>Evidence for a transcript-width rendering fix, kept forever &mdash; Agent working screenshot chat-code-measure-after.png committed in apache/maka PR #3617, Apache-2.0 licensed, pinned at commit dd7d1d59. Source: <a href="https://github.com/apache/maka/tree/dd7d1d595b7f9284e01fe76cf547c979a6d84a0a">https://github.com/apache/maka/tree/dd7d1d595b7f9284e01fe76cf547c979a6d84a0a</a>. Publisher: Apache Maka (Incubating) contributors (apache/maka). Licence: <a href="https://github.com/apache/maka/blob/dd7d1d595b7f9284e01fe76cf547c979a6d84a0a/LICENSE">https://github.com/apache/maka/blob/dd7d1d595b7f9284e01fe76cf547c979a6d84a0a/LICENSE</a>.</figcaption>
</figure>

Here is the whole boundary in one table, as it stands at `dd7d1d59`:

| Artifact | Tracked in git tree | In ASF source archive | Enforced by |
|---|---|---|---|
| `.maka-shots/` (14 PNGs, ~3.0 MiB) | yes | no | `.gitattributes` export-ignore + `forbiddenSegments` + JS and Rust tests |
| `maka-proposal-zh-review.txt` (22.9 KB) | yes | no | export-ignore + `forbiddenRootFiles` |
| `.claude/launch.json` | yes | no | export-ignore + `forbiddenSegments` |
| `docs/screenshots/`, `docs/assets/` | no (gitignored since #2376) | no | `.gitignore` |

The result is a two-surface truth model. The git tree is the complete working record, agent homework included: every clone carries the fourteen screenshots, the proposal review copy, and the harness config. The ASF source archive is the product, and ships none of them. One artifact class, two opposite policies, both deliberate enough to be tested.

The incubation context matters for reading this. Maka has not made an Apache release yet, and `DISCLAIMER-WIP` says plainly that the software grant and committer ICLAs are not yet complete and that incubating releases may not be fully ASF-policy compliant. The release boundary machinery exists ahead of the first release it will guard.

## 💡 Innovation: Name the artifact class, then pick its surface

The generic version of what happened here is worth stating, because most teams running agent-first development will hit it within weeks.

**Path-scoped deny rules lose to workflows that mint new paths.** The August 7 rule was written against a real incident and was correct for the paths it named. It was structurally unable to stop the same artifact class arriving at `.maka-shots/`, because agents and contributors under evidence-demanding review conventions — the PR template asks for proof — will always find somewhere to put the proof. This is the same failure class as the one I audited in [OpenHarness's permission checker](/posts/openharness-permission-order-audit/), where the allow list returns before user-configured deny rules ever run: a rule you wrote that another surface silently outranks. If you want to see how drift behaves when it is a *verifier* that cannot reach the surface, the [diagram-design drift audit](/posts/diagram-design-drift-audit/) is the same lesson from a third angle.

**Maka's actual answer is defensible, and it is not the obvious one.** The obvious fix was extending `.gitignore` to `.maka-shots/`. The project instead kept the working record in git and moved enforcement to the surface that legally matters for an ASF podling: the source archive. That choice has real virtues — the evidence stays reviewable forever, the release stays clean, and the boundary is tested rather than aspirational. It also has real costs: every clone hauls ~3.0 MiB of unreferenced PNGs that will only grow, and the tree now runs two contradictory policies for one artifact class, with the August 7 "do not commit" comment still standing for `docs/` while the root path accumulates.

**What I would take into production.** First, name the artifact class explicitly — "agent working evidence" — in the contribution contract, not just in path rules; a class-level rule can be enforced at commit time regardless of path. Second, if you choose the keep-it-tracked model, choose it in writing: nothing in the tracked tree records whether `.maka-shots/` retention was a decision or an accommodation, which is exactly the kind of fact a project whose tagline is a complete record would want in its record. Third, wherever the boundary lives, bind it with tests the way Maka did; an export-ignore line without an archive-content assertion is a wish.

## Limitations

- I did not run Maka, its eval harness, or its release script; runtime and eval claims are verified against source and shipped reports, not re-executed.
- Whether keeping the screenshots tracked in git was a deliberate decision or an after-the-fact accommodation is not stated in any tracked decision record; the inference rests on commit order alone, and I mark it as inference.
- The negative claims — no references to the screenshots, no `.claude` gitignore entry, no retention rationale — are bounded to tracked files at commit `dd7d1d59`; GitHub PR threads and issue comments were not exhaustively searched.
- Star and commit counts are point-in-time API and clone measurements from this run's retrieval window.

## 🎯 Key Takeaways

- **Agent-first development creates a new artifact class** — working evidence — and it will land in your tree unless a class-level rule, not a path rule, says otherwise.
- **Apache Maka runs a two-surface truth model**: the git tree keeps everything (14 PR screenshots, a 22.9 KB proposal review copy, a harness config), while the ASF source archive strips all of it via export-ignore, a forbidden list, and tests in JS and Rust.
- **The boundary landed the same day as the first leak** (2026-08-20), which reads as a deliberate design, but the decision itself is recorded nowhere in the tree.
- **The runtime's provenance claims check out in code** — sealed append-only stores and `model_visibility` match the README — and the eval reports name their own gaps, which deserves credit.

## 🤔 New Questions

- Will `.maka-shots/` get a retention or compaction policy before clone size becomes a contributor complaint, or will the class-level rule eventually be written?
- When Maka cuts its first ASF release, will the Incubator's licensing review accept a source tree whose git history permanently carries unreferenced working artifacts?
- Should agent harnesses write their own working evidence into the runtime event log itself — making PR screenshots RuntimeEvents — instead of scattering them across the filesystem?

## References

**Primary sources**

- [apache/maka at dd7d1d59](https://github.com/apache/maka/tree/dd7d1d595b7f9284e01fe76cf547c979a6d84a0a) — audited tree, clone, and git history
- [README.md](https://github.com/apache/maka/blob/dd7d1d595b7f9284e01fe76cf547c979a6d84a0a/README.md) — complete-record and log-is-the-runtime claims
- [.gitignore](https://github.com/apache/maka/blob/dd7d1d595b7f9284e01fe76cf547c979a6d84a0a/.gitignore) — the August 7 attach-don't-commit rule
- [.gitattributes](https://github.com/apache/maka/blob/dd7d1d595b7f9284e01fe76cf547c979a6d84a0a/.gitattributes) — working-notes export-ignore block
- [scripts/asf-source-release.mjs](https://github.com/apache/maka/blob/dd7d1d595b7f9284e01fe76cf547c979a6d84a0a/scripts/asf-source-release.mjs) — forbiddenSegments and forbiddenRootFiles
- [packages/core/src/runtime-event-store.ts](https://github.com/apache/maka/blob/dd7d1d595b7f9284e01fe76cf547c979a6d84a0a/packages/core/src/runtime-event-store.ts) — sealed append-only event store
- [docs/eval four-arm report](https://github.com/apache/maka/blob/dd7d1d595b7f9284e01fe76cf547c979a6d84a0a/docs/eval/terminal-bench-2.1-deepseek-v4-flash-four-arm.md) — 89-task Terminal-Bench 2.1 comparison
- [DISCLAIMER-WIP](https://github.com/apache/maka/blob/dd7d1d595b7f9284e01fe76cf547c979a6d84a0a/DISCLAIMER-WIP) — incubation status and ICLA caveats
- [GitHub repository API](https://api.github.com/repos/apache/maka) — stars, licence, creation date at retrieval

**Related on this site**

- [OpenHarness Lets Its Allow List Outrank Your Deny Rules](/posts/openharness-permission-order-audit/) — the same outranked-rule failure class inside a permission checker
- [diagram-design drift audit](/posts/diagram-design-drift-audit/) — drift on surfaces a verifier cannot reach

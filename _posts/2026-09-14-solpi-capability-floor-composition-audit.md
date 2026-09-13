---
title: "SoL-Pi's Capability Floor Is Per Mechanism, Not Per Harness"
description: "Source Audit of NVlabs/SoL-Pi at d7ecfc08: a per-mechanism capability gate permits losses that accumulate until the assembled harness retains roughly 94% of Pi's score."
categories: [AI, Agents]
tags: [ai-agents, harness-engineering, benchmarks, open-source, tooling]
date: 2026-09-14 00:41:41 +0900
mermaid: false
math: false
image:
  path: /assets/img/posts/2026-09-14-solpi-capability-floor-composition-audit/capability-floor-composition.svg
  alt: "Diagram of SoL-Pi's capability floor at commit d7ecfc08: each of four mechanisms passes a predeclared tolerance gate on its own, while the assembled harness is reported at roughly 94 percent of Pi's average score across EdgeBench tasks and solves 15 of 63 Terminal-Bench 4 tasks against Pi's 18"
---

![SoL-Pi gates each mechanism against a capability floor one at a time; the assembled harness is reported at roughly 94% of Pi's average score and solves 15 of 63 Terminal-Bench 4 tasks to Pi's 18](/assets/img/posts/2026-09-14-solpi-capability-floor-composition-audit/capability-floor-composition.svg)

> **Editorial method:** This Source Audit was researched and drafted with AI assistance under an evidence-gated editorial harness; every number was read from the pinned commit d7ecfc08 or the project's own published pages before publication.

## 🤔 Curiosity: What does "without getting less done" have to survive?

[NVlabs/SoL-Pi](https://github.com/NVlabs/SoL-Pi/tree/d7ecfc089944f0d04b80122a0a9a6ca0d786f3d0) is eleven days old and already carries 1,608 stars. It is MIT-licensed TypeScript, created on 2026-09-02, and the README frames it as an add-on rather than a replacement: "a standalone extension for [Pi](https://github.com/earendil-works/pi)" and "not an official distribution of Pi." The research page does call SoL-Pi an agent harness in its own right. Four efficiency mechanisms — Action Fusion, ObservationPack, Evidence-Preserving Reducer, and Online Context Compact — install on top of an unmodified Pi release, and every one is disabled by default.

The pitch is a promise about what the savings must not cost. The research page leads with **"Spend less without getting less done."** The README says the same thing in longer form: spend less "without making the agent do less useful work."

That is a falsifiable promise, and the project publishes enough to test it. So I read the tree at `d7ecfc08`, the research page, and the benchmark the numbers rest on.

The promise holds one mechanism at a time. The page says so itself, and in the very next sentence says the gate rules out "getting less done."

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-14-solpi-capability-floor-composition-audit/references/observationpack-research-overview.png" alt="SoL-Pi's seven-panel ObservationPack research overview: an optimization process column, a TB40 trade-off sweep over eight configurations, a quality-change panel with a minus-two-percent gate, a confirmed-frontier scatter, and provider bill, cost-per-response and normalized-score bars comparing baseline against ObservationPack">
  <figcaption>The published ObservationPack result. The footer names the measured artifact: a placeholder variant in <code>neural-harness-pi</code> at a ref that is not publicly available, on Pi 0.80.10, over 11 EdgeBench tasks &mdash; Image from NVlabs/SoL-Pi (MIT), commit d7ecfc08. Source: <a href="https://nvlabs.github.io/SoL-Pi/">https://nvlabs.github.io/SoL-Pi/</a>. Publisher: NVlabs (NVlabs/SoL-Pi). Licence: <a href="https://github.com/NVlabs/SoL-Pi/blob/d7ecfc089944f0d04b80122a0a9a6ca0d786f3d0/LICENSE">MIT</a>.</figcaption>
</figure>

## 📚 Retrieve: Reading the gate, then the totals

### The gate is predeclared, and it is per mechanism

SoL-Pi's search is not "make it cheaper." The page defines constrained efficiency: reductions in cost or token use "subject to a predeclared capability-preservation criterion." A candidate fails "if it saves by stopping early, skipping necessary verification, or removing evidence required to finish the task." Each loop applies two acceptance gates; the first requires every capability metric to stay within its predeclared tolerance.

Then comes the sentence that this audit is built on:

> The gate applies to one mechanism at a time, so the small losses it permits can accumulate once mechanisms combine: the assembled harness retains roughly 94% of Pi's average score. What the gate rules out is savings that come from getting less done.

Both halves are on the same page, in the same paragraph. The first states that composition costs about six percent of average score across EdgeBench tasks, on both model backends. The second states that the gate rules out getting less done. Read together, "getting less done" has quietly been redefined as *getting less done for the wrong reason* — a tolerance question, not an outcome question.

That is a defensible engineering position. It is not what the hero line promises a reader who never scrolls this far.

| Scope | What is measured or promised | Where it is stated |
|---|---|---|
| One mechanism | stays inside a predeclared capability tolerance | research page, *Capability floors constrain efficiency gains* |
| Assembled harness | retains **roughly 94%** of Pi's average score | same paragraph, next sentence |
| Whole product | "Spend less **without getting less done**" | research page hero |
| Shipped artifact | Pi **0.84.2** required by the install instructions | `README.md`, Requirements |
| Measured artifact | placeholder variant on Pi **0.80.10**, 11 EdgeBench tasks | footer of the ObservationPack panel |


### The totals, where the reader can check them

The efficiency side is stated plainly. Against Pi, the page reports 45–49% fewer tokens and about one-third lower cost; against the model-native harnesses, 35–64% fewer tokens at list-price API cost 50–54% lower. The headline converts that to money, scoped by the page to "a professional researcher working on a single problem": SoL-Pi saves "$8.75–$13.50 per hour" against native Codex and Claude Code harnesses and "$4.36–$5.71 per hour" against Pi. A footnote in the same section says the range "reflects the model backend and is calculated using official API-equivalent pricing" — a price model applied to measured token counts, not an invoice.

The capability cost shows up again on a second benchmark, at a different scale and on a different metric. The page reports:

> On 63 CPU-only tasks, Codex solves 18 at $272.35, Pi solves 18 at $286.45, and SoL-Pi solves 15 at $211.12.

Fifteen against eighteen is three tasks, or about 17% fewer solved, for roughly 26% less money than Pi. Whether that trade is good depends entirely on what a task is worth, which is a judgement the reader has to make — and can only make because the project published the losing number beside the winning one. It did not have to.

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-14-solpi-capability-floor-composition-audit/references/edgebench-taxonomy.png" alt="EdgeBench taxonomy poster: 134 real-world day-long tasks across six capability families, with 39 scientific and ML tasks, 36 systems and software engineering, 19 combinatorial optimization, 19 professional knowledge work, 13 formal math and theorem proving, and 8 interactive games and simulators, and a note that agent runtime is at least twelve hours per task">
  <figcaption>EdgeBench, the held-out benchmark behind the headline savings, is a third-party suite from ByteDance Seed: 134 day-long tasks across six families, of which an initial 51 are public &mdash; Image from ByteDance-Seed/EdgeBench (Apache-2.0), commit 668c7d45. Source: <a href="https://github.com/ByteDance-Seed/EdgeBench">https://github.com/ByteDance-Seed/EdgeBench</a>. Publisher: ByteDance Seed (ByteDance-Seed/EdgeBench). Licence: <a href="https://github.com/ByteDance-Seed/EdgeBench/blob/668c7d4564c0f32d126c6c3b0f2828bc24a380ce/LICENSE">Apache-2.0</a>.</figcaption>
</figure>

### What the headline chart was actually measured on

The research overview panel is the most detailed result artifact on the page, and its own footer is the most useful sentence on it:

> ObservationPack (placeholder variant) · neural-harness-pi @ pi/observationpack-placeholder-20260809 · (b)–(c) TB40 sweep over 8 configurations, V7 ran but was never scored; (d) frontier uses the four same-period paired confirmations · (e)–(g) EdgeBench 11 tasks, Pi 0.80.10 + gpt-5.6-sol xhigh, both arms launched concurrently on one cluster

Four facts follow from that line, and each is checkable.

The measured code is labelled a **placeholder variant**, living in `neural-harness-pi` at a ref that is not publicly available. `https://api.github.com/repos/NVlabs/neural-harness-pi` returns **404** unauthenticated. The public repository is a different tree: 23 source files under `src/sol-pi/` and 19 test files, organised as four extension directories.

The measured substrate is **Pi 0.80.10**. The README of the release you can install requires `@earendil-works/pi-coding-agent` **0.84.2**. The numbers on the front page were not produced by the thing the install instructions give you.

The paired experiment used **11 tasks**, not 51 and not 134. EdgeBench is described on SoL-Pi's page as "a 51-task suite… we reserve its tasks, verifiers, and feedback for final held-out evaluation." The benchmark's own site is more specific: it is a ByteDance Seed suite of **134** day-long tasks across six capability families, each with an agent runtime of at least twelve hours, of which "an initial 51 of the 134 tasks" are released. SoL-Pi's 51 is the public subset, correctly cited; the headline paired run is 11 tasks.

And the footer volunteers that **V7 ran but was never scored** — a disclosure result panels often omit.

### The composition boundary in the code

The four mechanisms are independent by construction, and the README states the rules: no Pi patches, explicit opt-in, preserve evidence, and use Pi's runtime choices for authentication, provider URLs, the main model, and shell behaviour. Each lives in its own directory under `src/sol-pi/extensions/` and composes through Pi's public extension APIs.

That independence is exactly why the gate cannot see the sum. A tolerance applied to Action Fusion knows nothing about what ObservationPack already spent from the same budget. The page's own sentence is the honest description of the consequence, and the 94% figure is the measured size of it.

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-14-solpi-capability-floor-composition-audit/references/pi-interactive-mode.png" alt="Pi's interactive mode in a terminal: a keybinding list, a Context section naming two AGENTS.md files, a Skills list, a Prompts list, an Extensions section showing one user extension from npm and two project extensions loaded from a .pi/extensions directory, an agent turn reading a README, and a status line showing token counters, a dollar cost and percentage of a 272k context window">
  <figcaption>The surface SoL-Pi plugs into: Pi loads extensions from npm and from a project <code>.pi/extensions</code> directory, and its status line already reports the token counters, dollar cost and context-window pressure that SoL-Pi sets out to reduce &mdash; Image from earendil-works/pi (MIT), commit 71dca871. Source: <a href="https://github.com/earendil-works/pi">https://github.com/earendil-works/pi</a>. Publisher: Mario Zechner (earendil-works/pi). Licence: <a href="https://github.com/earendil-works/pi/blob/71dca871bc80b6bc97be37f0ca3189399d651fff/LICENSE">MIT</a>.</figcaption>
</figure>

## 💡 Innovation: Per-component tolerances do not compose

The transferable lesson here has nothing to do with agents specifically. It is about where a quality gate is applied.

**A tolerance is a budget, and budgets add.** If each of four mechanisms may cost up to some small amount of capability and each is judged alone, the system has authorised four withdrawals against one account that nobody reconciles. SoL-Pi's page reports the reconciliation as roughly 94% of Pi's average score. The fix is not a stricter per-mechanism gate — that would reject good mechanisms — but a second gate on the assembled harness, which is a different experiment with a different cost.

**The claim and the gate must share a scope.** "Spend less without getting less done" is a claim about the harness. The capability floor is a criterion about a mechanism. Any promise stated at the system level needs a measurement at the system level, or the promise silently becomes a promise about components.

**Publishing the losing number is the thing that makes the rest credible.** Nothing in this audit required inference. The 94% sentence, the 15-of-63 line, the placeholder label, the unscored V7, the Pi version, and the 11-task scope are all printed by the project. That is rarer than it should be, and it is why a reader can form a view at all rather than taking a bar chart on faith.

**Version-pin your evidence to the artifact you ship.** A result measured on Pi 0.80.10 and an install that requires Pi 0.84.2 are two different systems. This is the same failure surface as a published number whose guard never reads the file a reader opens — see [ripwire Guards Its Gate Count in Source, Not in the PDF](/posts/ripwire-claim-guard-artifact-audit/), where the guarded source and the shipped artifact disagreed for the same structural reason.

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-14-solpi-capability-floor-composition-audit/references/pi-tree-view.png" alt="Pi's tree view of a long agent session: nested user and assistant turns interleaved with dozens of bracketed bash, read and edit tool calls including repeated git commands and repeated file reads, ending with a message counter reading 2759 of 2759">
  <figcaption>The redundancy the four mechanisms target, in one screen: a single session tree of 2,759 messages in which reads, greps and validation commands repeat within and across turns &mdash; Image from earendil-works/pi (MIT), commit 71dca871. Source: <a href="https://github.com/earendil-works/pi">https://github.com/earendil-works/pi</a>. Publisher: Mario Zechner (earendil-works/pi). Licence: <a href="https://github.com/earendil-works/pi/blob/71dca871bc80b6bc97be37f0ca3189399d651fff/LICENSE">MIT</a>.</figcaption>
</figure>

## 🎯 Key Takeaways

- SoL-Pi's capability floor is applied to one mechanism at a time. The project states that the permitted losses accumulate and that the assembled harness retains roughly **94%** of Pi's average score across EdgeBench tasks, on both model backends.
- On 63 Terminal-Bench 4 CPU-only tasks the page reports **SoL-Pi 15 solved at $211.12** against **Pi 18 at $286.45** and **Codex 18 at $272.35** — cheaper, and three tasks short.
- The dollar headline (**$8.75–$13.50/hr** vs native harnesses, **$4.36–$5.71/hr** vs Pi) is an API-equivalent price model applied to token counts, not a billed amount; the asterisk says so.
- The flagship ObservationPack panel was measured on a **placeholder variant** in a private `neural-harness-pi` ref, on **Pi 0.80.10**, over **11** EdgeBench tasks — while the public release requires **Pi 0.84.2**.
- EdgeBench is a third-party ByteDance Seed suite of **134** day-long tasks with an initial **51** released; SoL-Pi treats it as held out and says so.
- Generalisable rule: a claim stated about a system needs a gate measured on that system. Per-component tolerances are budgets, and budgets add.

## 🤔 New Questions This Raises

- What would an assembled-harness capability gate cost to run, and is there a cheaper proxy that still catches accumulation across four mechanisms?
- Would the 94% figure move if the mechanisms were enabled in a different order, or is the loss roughly additive regardless of composition order?
- SoL-Pi solves fewer Terminal-Bench 4 tasks but is cheaper per solved task only if the unsolved three are worth less than the saving. Is there a task class where the loss concentrates?
- The public tree is not the measured tree. Would re-running the paired EdgeBench experiment with the released extension on Pi 0.84.2 reproduce −23.58% and +22.92%?

## Limitations

This is a static audit of the pinned tree at `d7ecfc08` and the project's published research page as read on 2026-09-14. I did not install SoL-Pi, run Pi, execute EdgeBench or Terminal-Bench 4, or reproduce any measurement, so I make no claim that any published figure is wrong — only about what is claimed, at what scope, and against which artifact. Every figure quoted here is the project's own, or ByteDance Seed's own for EdgeBench's structure. The 404 statement is scoped to an unauthenticated GitHub API lookup of one exact repository name; private repositories return 404 to anonymous callers, so the correct reading is "not publicly available", not "does not exist". The reading of the 94% sentence is mine: the project may intend "getting less done" narrowly, as a statement about causes rather than outcomes, and the article argues that the hero line does not carry that qualification. Star counts and page wording are retrieval-time observations, and this repository is eleven days old and moving quickly.

## References

### Primary sources (pinned at `d7ecfc08`)

- [NVlabs/SoL-Pi @ d7ecfc08](https://github.com/NVlabs/SoL-Pi/tree/d7ecfc089944f0d04b80122a0a9a6ca0d786f3d0) — audited tree
- [README.md](https://github.com/NVlabs/SoL-Pi/blob/d7ecfc089944f0d04b80122a0a9a6ca0d786f3d0/README.md) — extension note, four mechanisms, shared rules, Pi 0.84.2 requirement
- [src/sol-pi/extensions](https://github.com/NVlabs/SoL-Pi/tree/d7ecfc089944f0d04b80122a0a9a6ca0d786f3d0/src/sol-pi/extensions) — the four mechanism directories
- [LICENSE](https://github.com/NVlabs/SoL-Pi/blob/d7ecfc089944f0d04b80122a0a9a6ca0d786f3d0/LICENSE) — MIT
- [SoL-Pi research page](https://nvlabs.github.io/SoL-Pi/) — capability floor, 94% sentence, Terminal-Bench 4 totals, hourly savings, chart footer
- [GitHub API: NVlabs/SoL-Pi](https://api.github.com/repos/NVlabs/SoL-Pi) — repository metadata at retrieval

### Benchmark and substrate

- [ByteDance-Seed/EdgeBench @ 668c7d45](https://github.com/ByteDance-Seed/EdgeBench) — Apache-2.0; the held-out suite
- [edge-bench.org](https://edge-bench.org/) — 134 tasks across six families, initial 51 released
- [earendil-works/pi @ 71dca871](https://github.com/earendil-works/pi) — MIT; the harness SoL-Pi extends

### Related on this site

- [ripwire Guards Its Gate Count in Source, Not in the PDF](/posts/ripwire-claim-guard-artifact-audit/)
- [Gensee Crate's Defense Rate Is the One Number You Cannot Recount](/posts/gensee-crate-evidence-tier-audit/)
- [MetaHarness Advertises Witness Signing Its Bridges Never Export](/posts/metaharness-witness-reachability-audit/)

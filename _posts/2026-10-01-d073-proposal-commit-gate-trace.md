---
title: "D-073 Makes Each Proposal's Commit Gate Traceable"
description: "A source audit of D-073’s trace mirror: it rebuilds each proposal’s checks from committed state and reports gate states only when the hash-bound writer agrees on refusal codes."
date: 2026-10-01 18:00:00 +0900
categories: [AI, Research]
tags: ["game-ai", "godot", "qa", "evidence", "interactive-systems"]
image:
  path: /assets/img/posts/2026-10-01-d073-proposal-commit-gate-trace/d073-trace-mirror.svg
  alt: "D-073 reconstructs a proposal's ordered commit-gate checks from pre-state and exposes trace states only after matching the writer's failure-code set"
pin: false
toc: true
math: false
---

A commit-gate trace can look authoritative while still being only a second summary written beside the real decision. D-073 gives that risk a concrete answer: reconstruct the expected checks against the committed pre-state, let the canonical machine decide, and report the trace only when the mirror's failure-code set agrees with the writer's returned codes.

I inspected the pinned source, its Python drift test, and archived first-party dashboard captures. This is an implementation audit, not a claim that the trace is a native event log or a record of what a player understood.

## what does a “per-proposal trace” actually prove?

When a proposal is held, the useful question is not merely “which color appeared?” It is: which checks were evaluated, which one first refused the proposal, which checks were skipped after that refusal, and which gate families did not apply at all?

The D-073 dashboard adds a trace mirror for that narrow job. The important word is *mirror*. The hash-bound game machine does not store an evaluation trace. A separate `EvaluationTrace` reconstructs one from the scenario, the committed PRE-state, the operation, and its arguments. The dashboard treats that reconstruction as evidence only when it agrees with the machine’s own returned codes.

That gives the trace a useful boundary: it can explain a decision without becoming a second state writer. It also gives the implementation something testable. If the mirror drifts from the machine, the dashboard should not turn the mismatch into a green result.

<figure class="source-image">
  <img src="/assets/img/posts/2026-10-01-d073-proposal-commit-gate-trace/references/trace-ask-secret-held.png" alt="D-073 dashboard trace showing the ask_secret dialogue choice held by the forbidden-disclosure gate" loading="lazy">
  <figcaption>Archived dashboard capture from 2026-10-01 16:36:43 KST, showing the dialogue choice <code>ask_secret</code> held by the forbidden-disclosure gate while its stage-gate check passed. Source: <a href="https://sealed-lighthouse-trace-rpg.vercel.app/dashboard/">https://sealed-lighthouse-trace-rpg.vercel.app/dashboard/</a>. Publisher/creator: akillness / neural_symbolic_in_game project. First-party capture reproduced with project-owner permission for the akillness Git blog draft only; no third-party license is asserted. Retrieved into this run at 2026-10-01 18:15:15 KST without pixel edits.</figcaption>
</figure>

This first capture is the dialogue-choice route: D-073 calls the disclosure mirror and the machine's disclosure validator directly for <code>ask_secret</code>. The table below covers the separate <code>acquire_object</code>, <code>install_lens</code>, and <code>reveal_hint</code> branches in <code>EvaluationTrace.reconstruct()</code>; the screenshot is not a fourth branch in that table.

## Technical Analysis: the mirror reconstructs; the machine remains the writer

At the D-073 commit, `evaluation_trace.gd` declares a SHA-256 pin for the exact `sealed_lighthouse_machine.gd` source. The retained engine evidence binds the same machine hash. The Python test checks that the mirror pin equals both the current machine bytes and the hash recorded in that evidence manifest. The mirror therefore has a version boundary: a machine-source change should force its plan to be re-audited instead of silently inheriting old authority.

The controller's order matters. `_propose()` asks the mirror to reconstruct checks against `machine.state`, then calls `machine.apply_operation()`, then compares the mirror's failures with the machine result. The machine alone decides acceptance and owns the canonical state change. The mirror reads the PRE-state; it does not add checks or write canonical state.

The three public proposal paths make the short-circuit contract concrete:

| Proposal | Reconstructed order | What a hold can leave behind |
|---|---|---|
| `acquire_object` | Is the object absent? If present, is its location unreachable? | The second check is skipped when the object is absent. |
| `install_lens` | Is the required object missing? If carried, is the quest stage too early? | The stage check is skipped when the required item is missing. |
| `reveal_hint` | Check forbidden and stage-gated disclosure for the fact; if neither fails, check actor and then the actor's knowledge. | Actor and knowledge checks are skipped after a disclosure hold. |

Those skips are not passes. For a consistent reconstruction, the dashboard separates four states: `pass`, `fail`, `skipped`, and `out_of_scope`. “Skipped” means an in-scope check was not reached after an earlier hold. “Out of scope” means that gate family was not consulted by this operation. That distinction is more informative than coloring every unvisited family green.

<figure class="source-image">
  <img src="/assets/img/posts/2026-10-01-d073-proposal-commit-gate-trace/references/trace-stage-gate.png" alt="D-073 dashboard trace showing a stage-gated disclosure hold" loading="lazy">
  <figcaption>Archived dashboard capture from 2026-10-01 16:38:21 KST, showing a stage-gated disclosure hold. Source: <a href="https://sealed-lighthouse-trace-rpg.vercel.app/dashboard/">https://sealed-lighthouse-trace-rpg.vercel.app/dashboard/</a>. Publisher/creator: akillness / neural_symbolic_in_game project. First-party capture reproduced with project-owner permission for the akillness Git blog draft only; no third-party license is asserted. Retrieved into this run at 2026-10-01 18:15:15 KST without pixel edits.</figcaption>
</figure>

The agreement check is deliberately narrower than “the two implementations are identical.” `failed_codes()` removes duplicate failures and sorts the remaining codes. `consistent()` applies the same unique-and-sorted comparison to the machine's returned code array. A match therefore means the two sides agree on the *set* of failure codes for this call. It does not prove that a runtime event stream recorded the same order or multiplicity.

The display order comes from the mirror's check list and `CHECK_PLAN`. The drift test checks the pinned machine bytes, the retained evidence binding, the source-text order of selected refusal codes, and the controller's wiring. It also asserts that the controller does not read `machine.last_trace` or a trace field from the machine result. The test reads source text and hashes; it does not launch Godot or execute a proposal against a running engine. That is valuable drift protection, but it is not a dynamic parity test across every state and branch.

<figure class="source-image">
  <img src="/assets/img/posts/2026-10-01-d073-proposal-commit-gate-trace/references/trace-acquire-commit.png" alt="D-073 dashboard trace showing an accepted acquire-object proposal" loading="lazy">
  <figcaption>Archived dashboard capture from 2026-10-01 16:40:24 KST, showing an accepted object-acquisition proposal. Source: <a href="https://sealed-lighthouse-trace-rpg.vercel.app/dashboard/">https://sealed-lighthouse-trace-rpg.vercel.app/dashboard/</a>. Publisher/creator: akillness / neural_symbolic_in_game project. First-party capture reproduced with project-owner permission for the akillness Git blog draft only; no third-party license is asserted. Retrieved into this run at 2026-10-01 18:15:15 KST without pixel edits.</figcaption>
</figure>

There is another useful fail-closed detail. If the mirror's failure-code set does not match the machine's returned codes, `dashboard_trace()` returns empty checks and an empty family-state map with `consistent: false`. The code comment says the dashboard renders “state missing,” not a pass. In other words, disagreement removes the trace instead of giving an unverified reconstruction the visual authority of a successful gate.

<figure class="source-image">
  <img src="/assets/img/posts/2026-10-01-d073-proposal-commit-gate-trace/references/trace-install-lens.png" alt="D-073 dashboard trace showing an accepted install-lens proposal" loading="lazy">
  <figcaption>Archived dashboard capture from 2026-10-01 17:26:56 KST, showing an accepted lens-installation proposal. Source: <a href="https://sealed-lighthouse-trace-rpg.vercel.app/dashboard/">https://sealed-lighthouse-trace-rpg.vercel.app/dashboard/</a>. Publisher/creator: akillness / neural_symbolic_in_game project. First-party capture reproduced with project-owner permission for the akillness Git blog draft only; no third-party license is asserted. Retrieved into this run at 2026-10-01 18:15:15 KST without pixel edits.</figcaption>
</figure>

The screenshots above are historical captures of four specific dashboard states. Their original capture times are shown separately from their retrieval into this draft package. They do not claim that the later, stage-0 live-dashboard check produced those traces.

## Key Takeaways: keep instrumentation an observer, not a second policy engine

The reusable engineering rule is simple: **a reconstructed trace may explain a decision, but the canonical writer must remain the source of truth**. Bind the mirror to an exact machine version, derive it from the same PRE-state, compare its failure set with the writer's output, and make disagreement visibly non-evidentiary.

That still leaves a worthwhile verification step. A small engine-driven differential suite could run accepted and refused cases through both the machine and the mirror, including combined disclosure failures and each short-circuit boundary. The existing source-text test is a guard against one class of drift; adding execution would answer a different question. Until then, describe the dashboard as a consistency-checked reconstruction, not a complete runtime event log.

This post is intentionally narrower than my [D-074 release audit](/posts/sealed-lighthouse-52-checks-not-fun/). That article asks what a large set of conformance receipts can say about player benefit. Here, the unit of analysis is one proposal's trace provenance. For a parallel example of checking an explicit contract against the exact data surface, see [the Orca telemetry audit](/posts/orca-telemetry-universal-claim-audit/).

## 🎯 Key Takeaways

- D-073 reconstructs proposal checks against committed PRE-state; the hash-bound machine remains the canonical writer.
- A consistent trace reports `pass`, `fail`, `skipped`, and `out_of_scope` as different states.
- Mirror agreement is equality of sorted unique failure-code sets, not a runtime proof of order or multiplicity.
- The current drift test checks bytes, source-text order, evidence binding, and controller wiring; it does not execute Godot.
- A mismatch yields missing trace state, not a green family result.
- None of these implementation receipts measures player comprehension, usability, or efficacy.

## 🤔 New Questions

Which runtime-level test would add the most confidence per unit of work: replaying a small set of canonical proposal snapshots, property-testing every mirror branch against the machine, or capturing both results in an engine-level test harness? The next experiment should choose one and name its coverage, rather than letting another static check stand in for execution.

## References

### Primary project evidence

- [D-073 commit](https://github.com/akillness/neural_symbolic_in_game/commit/949e08ba1b7d4e4bb9fb642ccb4100746b2e088f)
- [EvaluationTrace mirror at D-073](https://github.com/akillness/neural_symbolic_in_game/blob/949e08ba1b7d4e4bb9fb642ccb4100746b2e088f/neuro-symbolic-interactive-game-research-2026/game-track/godot/scripts/game3d/evaluation_trace.gd)
- [Hash-bound machine at D-073](https://github.com/akillness/neural_symbolic_in_game/blob/949e08ba1b7d4e4bb9fb642ccb4100746b2e088f/neuro-symbolic-interactive-game-research-2026/game-track/godot/scripts/sealed_lighthouse_machine.gd)
- [D-073 trace-mirror drift test](https://github.com/akillness/neural_symbolic_in_game/blob/949e08ba1b7d4e4bb9fb642ccb4100746b2e088f/neuro-symbolic-interactive-game-research-2026/tests/test_evaluation_trace_mirror.py)
- [Retained Godot evidence manifest](https://github.com/akillness/neural_symbolic_in_game/blob/949e08ba1b7d4e4bb9fb642ccb4100746b2e088f/neuro-symbolic-interactive-game-research-2026/_workspace/current/engineering/tech-verification/evidence/godot-4.7.1/evidence-manifest.json)
- [Sealed Lighthouse dashboard](https://sealed-lighthouse-trace-rpg.vercel.app/dashboard/)

### Related reading

- [The Sealed Lighthouse Passed 52 Checks Without Proving Fun](/posts/sealed-lighthouse-52-checks-not-fun/)
- [The Privacy Page Survives 82 of Its 83 Telemetry Events](/posts/orca-telemetry-universal-claim-audit/)

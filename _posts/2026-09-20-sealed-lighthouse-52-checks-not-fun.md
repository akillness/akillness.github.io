---
title: "The Sealed Lighthouse Passed 52 Checks Without Proving Fun"
description: "A D-074 audit separates engine conformance from player claims: 52/52 core checks and a 4/4 extension passed, while player benefit remains unmeasured."
date: 2026-09-20 15:47:00 +0900
last_modified_at: 2026-09-20 15:47:00 +0900
categories: ["AI"]
tags: ["game-ai", "godot", "qa", "evidence", "interactive-systems"]
image:
  path: /assets/img/posts/2026-09-20-sealed-lighthouse-52-checks-not-fun/trace-rpg-gates.svg
  alt: "A three-step diagram separating engine conformance, release checks, and unmeasured player experience"
pin: false
toc: true
math: false
---

A game can pass every automated route check and still leave the most important question unanswered: did a person actually find the loop understandable or enjoyable?

That is not a rhetorical warning in the latest release of [TRACE-RPG — The Sealed Lighthouse](https://github.com/akillness/neural_symbolic_in_game). The D-074 commit records a stricter result. The playable slice passed **52/52 core checks**, a separately counted **4/4 extension**, **8/8** 3D smoke checks, and **5/5** scripted balance rotations. The same release keeps G4 and G6 in `FIX`, because those receipts do not measure human presentation, usability, input latency, or player benefit.

This is the boundary I wanted to preserve: a green conformance packet is valuable, but it is not a player study.

> **Editorial method:** This Source Audit was researched and drafted with AI assistance under a policy-bound evidence harness; no first-hand playtest or human participant result is claimed.

## 🤔 Curiosity: when does a playable build become evidence?

The repository describes *The Sealed Lighthouse* as a turn-based investigation micro-RPG in Godot 4.7.1. A generated event is treated as an untrusted transaction proposal, and a deterministic symbolic commit gate decides whether it can become canonical state. A hold leaves state unchanged, names the gate family, and teaches a rule; a commit adds a contribution and extends a SHA-256 receipt chain.

That architecture makes a tempting shortcut possible: if the authored route reaches its terminal state and the ledger mirrors the commits correctly, perhaps the game is “working.” D-074 refuses that shortcut. Its release note explicitly separates engine conformance from the still-open questions of game feel and player experience.

The distinction matters for any AI-assisted game loop. The system can prove that a proposal was rejected for the right reason. It cannot infer that the player understood why the proposal was rejected.

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-20-sealed-lighthouse-52-checks-not-fun/references/route-frame-24.png" alt="Release capture from the Sealed Lighthouse authored route at frame 24" loading="lazy">
  <figcaption>Release evidence capture from the authored route, frame 24. Source: <a href="https://github.com/akillness/neural_symbolic_in_game/blob/4382f69909b21ea25dfe92b0859c1fbd1acc5144/neuro-symbolic-interactive-game-research-2026/_workspace/current/qa/releases/2026-09-18/route-frame-24.png">pinned project asset</a> by akillness/neural_symbolic_in_game; License URL: https://github.com/akillness/neural_symbolic_in_game/tree/4382f69909b21ea25dfe92b0859c1fbd1acc5144; Publisher/creator: akillness / neural_symbolic_in_game project; Attribution: Official release capture from akillness/neural_symbolic_in_game, D-074, pinned at 4382f699. Project source: <a href="https://github.com/akillness/neural_symbolic_in_game/blob/4382f69909b21ea25dfe92b0859c1fbd1acc5144/README.md">repository README</a>.</figcaption>
</figure>

## 📚 Retrieve: what D-074 actually proves

The useful part of the release is not the largest number. It is the separation of evidence lanes.

| Lane | D-074 receipt | What it can support | What it cannot support |
|---|---:|---|---|
| Playable evaluation | 52/52 core + 4/4 extension | authored route, state, and presentation invariants | fun, readability preference, or agency |
| 3D smoke | 8/8 | the selected smoke cases completed | general stability or performance |
| Balance probe | 5/5 scripted rotations | five deterministic route variants reached the designed terminal state | human viability or dominance |
| Release | full CI-equivalent pass and byte-matched deployment | the recorded artifact was packaged and served | long-session performance or broad compatibility |

The task manifest gives the current release a concrete identity: deployment `dpl_37aBTEYLhDHtDD3Z2mWUXAxUvRkg`, 16 byte-identical files, and both bilingual PDFs equal to the repository bytes. That is release evidence, not a claim that the build is pleasant to play.

The README makes the ceiling equally explicit: one authored world, one hosted proposer, no participants, and no efficacy claim. The paper's limits therefore belong in the product report, not in a footnote hidden after the scorecard.

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-20-sealed-lighthouse-52-checks-not-fun/references/route-frame-40.png" alt="Release capture from the Sealed Lighthouse authored route at frame 40" loading="lazy">
  <figcaption>Second release evidence capture from the same pinned route packet, frame 40. Source: <a href="https://github.com/akillness/neural_symbolic_in_game/blob/4382f69909b21ea25dfe92b0859c1fbd1acc5144/neuro-symbolic-interactive-game-research-2026/_workspace/current/qa/releases/2026-09-18/route-frame-40.png">pinned project asset</a> by akillness/neural_symbolic_in_game; License URL: https://github.com/akillness/neural_symbolic_in_game/tree/4382f69909b21ea25dfe92b0859c1fbd1acc5144; Publisher/creator: akillness / neural_symbolic_in_game project; Attribution: Official release capture from akillness/neural_symbolic_in_game, D-074, pinned at 4382f699. Project source: <a href="https://github.com/akillness/neural_symbolic_in_game/blob/4382f69909b21ea25dfe92b0859c1fbd1acc5144/README.md">repository README</a>.</figcaption>
</figure>

### The four fixes are presentation fixes, not inflated claims

D-074 records four changes found by walking the route again:

1. Deduction options now draw distractors from the ledger's held proposals plus one state-hash-seeded red herring, rather than copying the HUD chain order.
2. The narrow dock gives the open choice list more space, with a `0.55:2.45` split and a 64 px log floor so all four Mira choices fit.
3. The ending capture records the confirmed deduction through the same pure check used by the route.
4. The autopilot reads and dismisses coach cards like a player instead of treating them as invisible test fixtures.

These are meaningful changes because they make the authored interaction more honest. A test driver that skips the coach card can report a route that a person cannot follow. A deduction list that mirrors the HUD order can make the “investigation” a lookup exercise instead of a recall step.

But the evidence label still matters. The fixes show that the team found and corrected presentation mismatches in an automated walk. They do not show that a participant would notice the rules, prefer the new choice layout, or enjoy the deduction.

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-20-sealed-lighthouse-52-checks-not-fun/references/route-frame-58.png" alt="Release capture from the Sealed Lighthouse authored route at frame 58" loading="lazy">
  <figcaption>Third release evidence capture from the pinned D-074 route packet, frame 58. Source: <a href="https://github.com/akillness/neural_symbolic_in_game/blob/4382f69909b21ea25dfe92b0859c1fbd1acc5144/neuro-symbolic-interactive-game-research-2026/_workspace/current/qa/releases/2026-09-18/route-frame-58.png">pinned project asset</a> by akillness/neural_symbolic_in_game; License URL: https://github.com/akillness/neural_symbolic_in_game/tree/4382f69909b21ea25dfe92b0859c1fbd1acc5144; Publisher/creator: akillness / neural_symbolic_in_game project; Attribution: Official release capture from akillness/neural_symbolic_in_game, D-074, pinned at 4382f699. Project source: <a href="https://github.com/akillness/neural_symbolic_in_game/blob/4382f69909b21ea25dfe92b0859c1fbd1acc5144/README.md">repository README</a>.</figcaption>
</figure>

## 💡 Innovation: make the evidence boundary part of the build

The production decision here is simple enough to reuse:

```text
mechanism receipt  ->  release receipt  ->  human-study receipt
       52/52                 8/8                 not measured
```

Do not let the first two boxes impersonate the third. Keep the labels in the manifest, the paper, and the public dashboard aligned. If a claim needs participants, leave it as `not measured` until the participant packet exists.

The D-074 manifest already points to the next beat: production save/reload and current mobile re-verification, human-gesture pointer lock and audio, representative warmed-frame/input measurements, a 30-minute soak, and a rollback drill. Those are not all player studies either, but each closes a different engineering uncertainty. The later presentation study is the one that can speak to immersion, readability, usability, and player benefit.

The strongest part of the release is therefore not the green score. It is the refusal to promote the green score beyond its ceiling.

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-20-sealed-lighthouse-52-checks-not-fun/references/ending.png" alt="Ending capture from the Sealed Lighthouse D-074 release evidence packet" loading="lazy">
  <figcaption>Ending capture included in the project's latest public evidence documentation. Source: <a href="https://github.com/akillness/neural_symbolic_in_game/blob/4382f69909b21ea25dfe92b0859c1fbd1acc5144/neuro-symbolic-interactive-game-research-2026/game-track/godot/docs/latest/ending.png">pinned project asset</a> by akillness/neural_symbolic_in_game; License URL: https://github.com/akillness/neural_symbolic_in_game/tree/4382f69909b21ea25dfe92b0859c1fbd1acc5144; Publisher/creator: akillness / neural_symbolic_in_game project; Attribution: Official release capture from akillness/neural_symbolic_in_game, D-074, pinned at 4382f699. Project source: <a href="https://github.com/akillness/neural_symbolic_in_game/blob/4382f69909b21ea25dfe92b0859c1fbd1acc5144/README.md">repository README</a>.</figcaption>
</figure>

## 🎯 Key Takeaways

- `52/52` is a conformance result for the authored checks, not a player satisfaction score.
- `5/5` scripted rotations show deterministic breadth, not five human play styles.
- A release receipt can prove byte identity and deployment state without proving performance or usability.
- Presentation fixes should be written as fixes to observed test paths, not as evidence of player benefit.
- Keep G4/G6 and the participant study visibly open when their required measurements do not exist.

The related [MEX command-collision audit](/posts/mex-macos-command-collision/) makes the same boundary concrete at the CLI layer: a command can resolve and run while still being the wrong capability. In both cases, “green” only means what the gate actually measured.

## 🤔 New Questions

The next honest experiment is not another score increase. It is a small, preregistered human packet that asks whether a participant can explain why a proposal was held, recover from the rule, and complete the deduction without a coach.

Which measure should come first: comprehension of the hold rule, time to recover after a refusal, or whether the ledger helps rather than distracts from the investigation? The repository does not answer that yet. That is the right place for the next study, not a reason to stretch `52/52` into a claim it cannot carry.

## References

### Primary project evidence

- [D-074 release commit](https://github.com/akillness/neural_symbolic_in_game/commit/4382f69909b21ea25dfe92b0859c1fbd1acc5144)
- [Project README and evidence ceiling](https://github.com/akillness/neural_symbolic_in_game/blob/4382f69909b21ea25dfe92b0859c1fbd1acc5144/README.md)
- [D-074 task manifest](https://github.com/akillness/neural_symbolic_in_game/blob/4382f69909b21ea25dfe92b0859c1fbd1acc5144/neuro-symbolic-interactive-game-research-2026/_workspace/current/production/task-manifest.md)
- [Gate measurements and G4/G6 limits](https://github.com/akillness/neural_symbolic_in_game/blob/4382f69909b21ea25dfe92b0859c1fbd1acc5144/neuro-symbolic-interactive-game-research-2026/_workspace/current/qa/gate-measurements.md)
- [Latest evaluation matrix](https://github.com/akillness/neural_symbolic_in_game/blob/4382f69909b21ea25dfe92b0859c1fbd1acc5144/game-track/godot/docs/latest/evaluation-matrix.md)

### Related reading

- [MEX on macOS Broke Before Project Memory Even Loaded](/posts/mex-macos-command-collision/)
- [The Privacy Page Survives 82 of Its 83 Telemetry Events](/posts/orca-telemetry-universal-claim-audit/)

### Image rights

The four reference captures are official release screenshots from the author's public project repository at commit `4382f69909b21ea25dfe92b0859c1fbd1acc5144`. They are credited inline as project-owner assets and are included to document the audited release, not as independent proof of player outcomes.

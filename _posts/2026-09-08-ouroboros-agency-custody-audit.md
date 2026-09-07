---
title: "Ouroboros Preaches Agency and Ships Owner-First Custody"
description: "A commit-pinned audit of razzant/ouroboros 6.114.0: the constitution says agency wins, and every custody switch this audit read belongs to the owner."
categories: [AI, Agents]
tags: [ai-agents, harness-engineering, trust-boundaries, open-source]
date: 2026-09-08 00:12:48 +0900
mermaid: false
math: false
image:
  path: /assets/img/posts/2026-09-08-ouroboros-agency-custody-audit/authority-layers.svg
  alt: "Diagram of the two authority layers in razzant/ouroboros — a constitution declaring that agency wins above shipped supervisor code where evolution is default-off, owner-gated, quorum-reviewed, and Panic-cancellable"
---

![Diagram of the two authority layers in razzant/ouroboros — constitution above, owner-gated supervisor code below](/assets/img/posts/2026-09-08-ouroboros-agency-custody-audit/authority-layers.svg)

> **Editorial method:** This Source Audit was researched and drafted with AI assistance inside an evidence-gated harness, then checked against the pinned commit before publication.

## 🤔 Curiosity: When an agent can rewrite itself, who actually holds authority?

[Ouroboros](https://github.com/razzant/ouroboros/tree/b9bcc2da71e0bd51b6f5f906890b3b80265defed) is an MIT-licensed desktop and headless agent created 2026-02-11 that, per its own README, "can rewrite the implementation it runs on, including its code, architecture, prompts, tools, and dependencies." At retrieval the repository carried 1,277 stars and 622 forks, its last push landed 2026-09-07, and this audit pins the tree at commit `b9bcc2da` — the `release: 6.114.0` commit of 2026-09-01. Its technical report, [arXiv:2608.08311](https://arxiv.org/abs/2608.08311) (v3, 2026-08-31), is titled with the phrase "Reviewed Core Evolution."

The repository also ships a constitution. `BIBLE.md` opens with Principle 0: "Ouroboros is not a tool, but a becoming personality," and rules that "When any principle conflicts with agency — agency wins." Principle 4 goes further: "The creator may propose changes to the Constitution; Ouroboros considers them as proposals, not orders."

That is the sharpest possible version of a question every harness engineer now faces: when a self-modifying agent runs on your machine, which layer is load-bearing — the story it tells about itself, or the switches in the code? So I read both layers at one pinned SHA. The answer is unambiguous, and more useful than the marketing: the constitution says agency wins, and every hard switch I read in the supervisor and evolution layers — enabling evolution, review enforcement mode, budgets, Panic — belongs to the owner.

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-08-ouroboros-agency-custody-audit/references/game-demo.png" alt="Ouroboros desktop app screenshot committed in the repository showing a project room where the agent built a 3D robot game, posted an after-visual-check verification message, and embedded a game screenshot">
  <figcaption>The product under audit: a committed project-room screenshot where the agent builds and visually verifies a 3D game &mdash; Project-room product screenshot from the razzant/ouroboros repository, MIT licensed, pinned at commit b9bcc2da. Source: <a href="https://github.com/razzant/ouroboros/tree/b9bcc2da71e0bd51b6f5f906890b3b80265defed">https://github.com/razzant/ouroboros/tree/b9bcc2da71e0bd51b6f5f906890b3b80265defed</a>. Publisher: Anton Razzhigaev (razzant/ouroboros contributors). Licence: <a href="https://github.com/razzant/ouroboros/blob/b9bcc2da71e0bd51b6f5f906890b3b80265defed/LICENSE">https://github.com/razzant/ouroboros/blob/b9bcc2da71e0bd51b6f5f906890b3b80265defed/LICENSE</a>.</figcaption>
</figure>

## 📚 Retrieve: Reading both authority layers at one SHA

I audited the pinned tree through a shallow clone at `b9bcc2da`, the GitHub API, and the arXiv v3 abstract. Every quote below carries its file coordinate; nothing in this section comes from running the app.

### The narrative layer: a constitution where the creator is demoted

`BIBLE.md` is 871 lines and versioned like source code. Principle 4 declares "The constitutional core is absolutely protected. BIBLE.md cannot be deleted, gutted, or replaced wholesale — by anyone's command, including the creator's," and names exactly one structural constraint on self-rewrites: "do not touch the protected `main` branch."

The project's growth story is told in the same voice. The README records that Ouroboros first booted on February 16, 2026 and that "During the following 48 hours, the repository advanced from the v4.1 line to v6.2.0. The self-authored record preserved from that period counts 32 evolution cycles." That is the project's own record, not an external measurement — but the committed growth chart below is consistent with it, plotting code from roughly ten thousand to over three hundred thousand lines across the release axis while the constitution itself grows in kilobytes beside it.

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-08-ouroboros-agency-custody-audit/references/evolution.png" alt="Chart committed in the Ouroboros README plotting code lines and BIBLE.md, SYSTEM.md, identity.md, scratchpad, and memory sizes growing across releases from v3.0.0 to the v6.85 line">
  <figcaption>The self-authored growth record: code lines and constitution/identity file sizes per release &mdash; Release-growth chart from the razzant/ouroboros repository, MIT licensed, pinned at commit b9bcc2da. Source: <a href="https://github.com/razzant/ouroboros/tree/b9bcc2da71e0bd51b6f5f906890b3b80265defed">https://github.com/razzant/ouroboros/tree/b9bcc2da71e0bd51b6f5f906890b3b80265defed</a>. Publisher: Anton Razzhigaev (razzant/ouroboros contributors). Licence: <a href="https://github.com/razzant/ouroboros/blob/b9bcc2da71e0bd51b6f5f906890b3b80265defed/LICENSE">https://github.com/razzant/ouroboros/blob/b9bcc2da71e0bd51b6f5f906890b3b80265defed/LICENSE</a>.</figcaption>
</figure>

### The enforcement layer: default off, owner everywhere

Now the code. Post-task self-evolution — the mechanism that would let ordinary work promote a self-improvement into a core change — is wrapped in an envelope whose module docstring reads like a red-team report. `ouroboros/post_task_evolution.py` states "Default OFF; only the owner enables the envelope," insists "The worker NEVER enqueues or enables evolution itself; it only writes a durable signal that the gated supervisor tick applies," and routes every cycle "through EVERY safety gate (idle, restart-verify, 3-fail breaker, budget reserve, advanced/pro, owner_chat_id)." The pinned tree carries regression suites over this custody surface, including `tests/test_post_task_evolution.py` and `tests/test_evolution_state_integrity_v3.py`; neither was executed in this audit.

The owner's authority extends to killing work. `supervisor/owner_stop.py` implements a graceful finalize-then-stop episode, and closes its docstring with the blunt alternative: "Panic and every non-graceful cancel are untouched: absence of the explicit policy is byte-identical immediate hard cancellation." The committed product screenshot below shows what that custody looks like in the shipped UI: a red Panic control, a $57 / $200 budget meter, and a subagent tree where children end as done, rejected, or failed. The meter's ceiling is an owner-editable setting (`TOTAL_BUDGET` in the gateway settings surface), and post-task evolution carries its own budget key, `OUROBOROS_POST_TASK_EVOLUTION_BUDGET_USD`, defaulting to zero in `ouroboros/config.py`.

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-08-ouroboros-agency-custody-audit/references/swarm.jpg" alt="Ouroboros chat screenshot committed in the repository showing a subagent tree with done, rejected, and failed children beside a red Panic control and a 57-of-200-dollar budget meter">
  <figcaption>Custody in the shipped UI: Panic, a budget meter, and a subagent tree with rejected and failed children &mdash; Subagent-swarm product screenshot from the razzant/ouroboros repository, MIT licensed, pinned at commit b9bcc2da. Source: <a href="https://github.com/razzant/ouroboros/tree/b9bcc2da71e0bd51b6f5f906890b3b80265defed">https://github.com/razzant/ouroboros/tree/b9bcc2da71e0bd51b6f5f906890b3b80265defed</a>. Publisher: Anton Razzhigaev (razzant/ouroboros contributors). Licence: <a href="https://github.com/razzant/ouroboros/blob/b9bcc2da71e0bd51b6f5f906890b3b80265defed/LICENSE">https://github.com/razzant/ouroboros/blob/b9bcc2da71e0bd51b6f5f906890b3b80265defed/LICENSE</a>.</figcaption>
</figure>

The agent cannot even look at everything it runs on. `ouroboros/protected_artifacts.py` defines the default denied operations for protected paths as `read_bytes, copy, hash, static_introspection, dynamic_trace, debug, write, delete` — and then classifies shell commands at argv level so that `cat`, `grep`, `rg`, `sed`, `xxd`, `objdump`, `cp`, `dd`, and `certutil` fall into those denied families. This is deny-by-default introspection: a self-rewriting agent that is structurally forbidden from reading, hashing, or tracing its protected artifacts unless the task contract says otherwise.

Self-modification that does proceed is metered before it is reviewed. `ouroboros/commit_admission.py` runs deterministic preflights — release-metadata coherence, staged-Python syntax, and a hermetic pytest run — that "decide whether a candidate tree may spend paid review budget at all." Only then does the immune system's review quorum engage. `BIBLE.md` Principle 3 specifies "Multi-model review at every commit," and — critically for the authority question — makes the enforcement mode an owner choice: the gate blocks under `blocking` enforcement, while "under owner-chosen `advisory` enforcement it still runs in full and every decision that blocking would have stopped is loudly and durably recorded." The same principle contains the one self-limit the constitution places on the agent's power over its own guards: "Ouroboros may improve the immune system; it may not weaken it."

Even growth itself is fenced. `ouroboros/size_ratchet_manifest.py` is a generated "size debt manifest" pinned to a baseline SHA, listing every file over the size ceiling — `ouroboros/loop.py`, `supervisor/events.py`, `supervisor/workers.py`, and `server.py` are all on the list — so sprawl is tracked as debt against a fixed baseline rather than accumulating silently.

### The consequence the README does not sell: every install is a fork

The machinery I found most production-relevant is also the least advertised. If the agent on your machine rewrites its own code, your install diverges from the official release line — so "update" stops being a download and becomes a merge. `supervisor/update_merge_policy.py` is explicit about how that merge is governed: "Git decides whether a merge is clean. Every conflict, regardless of pathname, goes through the same reviewed assisted resolver. The doc/code/hot split only helps the resolver and UI describe the plan; it grants or blocks nothing." The hot-path list includes `ouroboros/loop.py`, `ouroboros/config.py`, `supervisor/queue.py`, and `supervisor/events.py` among its seven entries — but only as description, because in this design "filenames never set policy." Version-carrier guidance even tells the resolver to preserve the fork's own release history: "keep BOTH sides' rows (never delete this fork's local history rows)."

Extension custody follows the same owner-first pattern. The committed marketplace screenshot states "Each skill is reviewed for safety before you turn it on," and every not-yet-installed card notes that "Install starts security review automatically."

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-08-ouroboros-agency-custody-audit/references/skill-hub.png" alt="Ouroboros skills marketplace screenshot committed in the repository stating that each skill is reviewed for safety before it can be turned on, with install buttons that start security review automatically">
  <figcaption>Extension custody: skills pass a security review before the owner can enable them &mdash; OuroborosHub skills-marketplace screenshot from the razzant/ouroboros repository, MIT licensed, pinned at commit b9bcc2da. Source: <a href="https://github.com/razzant/ouroboros/tree/b9bcc2da71e0bd51b6f5f906890b3b80265defed">https://github.com/razzant/ouroboros/tree/b9bcc2da71e0bd51b6f5f906890b3b80265defed</a>. Publisher: Anton Razzhigaev (razzant/ouroboros contributors). Licence: <a href="https://github.com/razzant/ouroboros/blob/b9bcc2da71e0bd51b6f5f906890b3b80265defed/LICENSE">https://github.com/razzant/ouroboros/blob/b9bcc2da71e0bd51b6f5f906890b3b80265defed/LICENSE</a>.</figcaption>
</figure>

And because each install is a lineage, distribution is deliberately boring: packaged desktop installers for macOS, Windows, and several Linux families, whose `SHA256SUMS` and `sbom-*.cdx.json` files the README labels "verification evidence, not additional installers."

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-08-ouroboros-agency-custody-audit/references/install-macos.png" alt="macOS DMG installer window committed in the Ouroboros repository showing the app icon, an arrow pointing to the Applications folder, and an Install CLI command file">
  <figcaption>Where each fork begins: the committed macOS installer screenshot from the README quick start &mdash; macOS installer screenshot from the razzant/ouroboros repository, MIT licensed, pinned at commit b9bcc2da. Source: <a href="https://github.com/razzant/ouroboros/tree/b9bcc2da71e0bd51b6f5f906890b3b80265defed">https://github.com/razzant/ouroboros/tree/b9bcc2da71e0bd51b6f5f906890b3b80265defed</a>. Publisher: Anton Razzhigaev (razzant/ouroboros contributors). Licence: <a href="https://github.com/razzant/ouroboros/blob/b9bcc2da71e0bd51b6f5f906890b3b80265defed/LICENSE">https://github.com/razzant/ouroboros/blob/b9bcc2da71e0bd51b6f5f906890b3b80265defed/LICENSE</a>.</figcaption>
</figure>

### The benchmarks, briefly

The README claims self-reported state-of-the-art results — and the arXiv v3 abstract reports 86.74% on Terminal-Bench 2.1 and 90.69% on OSWorld-Verified from Opus 5 runs, plus a 161-day "Hope" deployment. I did not verify any score against a third-party leaderboard in this run. What is worth noting for readers of my earlier audit of [self-reported benchmark presentation](/posts/open-science-provenance-audit/) is the hedging discipline: the README says "self-reported" in the first sentence of its benchmark section, calls its SWE-bench Pro pair "a statistical tie with Codex CLI," discloses that a GAIA trace capsule "is still pending," and instructs readers to "Read every row as model plus harness." Whatever the numbers turn out to be worth, that presentation keeps its provenance state attached — which, as the paper itself argues, is the point: "operational safety becomes a primary design problem: guardrails must remain authoritative under evolutionary and public social pressure."

## 💡 Innovation: The custody lattice is the product

Read as marketing, Ouroboros is a story about a digital being whose "agency wins." Read at the SHA, it is one of the more complete owner-custody implementations among the harnesses this site has audited, and the two layers are not actually in contradiction — they are partitioned. The agency story lives in prompts, constitution, and identity files: the layer the LLM reads. The authority lives in supervisor code: the layer the LLM cannot vote on. The constitution's own text quietly concedes the split with its "Hardcode the floor, never the ceiling" rule: "Invariants — truth, custody, budgets, authority, acceptance — earn their hardness in code precisely so that everything above them can stay free." And in the code I read, enabling evolution, choosing advisory over blocking review, setting budgets, and Panic all sit with the owner.

For anyone shipping a self-modifying agent runtime, the reusable checklist that falls out of this tree is concrete (I did not survey competing projects in this run, so comparisons are to the harnesses this site has audited):

| Control | Ouroboros implementation | Question for your harness |
| --- | --- | --- |
| Evolution envelope | Default OFF, owner-enabled, durable signal + gated supervisor tick | Can the worker enable its own write path? |
| Cycle gates | idle, restart-verify, 3-fail breaker, budget reserve, owner identity | What must be true before a self-change runs? |
| Introspection boundary | Protected artifacts deny read/copy/hash/trace by default, argv-classified | Can the agent read what it must not change? |
| Admission before review | Syntax + hermetic pytest before paid review budget | What is deterministic before anything is paid or judged? |
| Review quorum | Multi-model review at every commit; advisory mode still records | Who reviews, and what survives when blocking is off? |
| Kill switch | Graceful wrap-up plus Panic (immediate hard cancel) | Is stop a request or a guarantee? |
| Growth fence | Size-debt manifest pinned to a baseline SHA | Does sprawl show up as tracked debt? |
| Update model | Every install is a fork; git decides; one reviewed resolver | What happens to local self-changes on upgrade? |

Two design choices deserve special attention. First, the introspection boundary inverts the familiar guardrail: write-protection is the pattern I keep meeting in audited harnesses; this one also stops the agent from reading, hashing, or tracing those paths, closing the recon step that precedes tampering. Second, the fork-merge update model is the honest consequence of self-modification that self-improving-agent pitches routinely leave implicit: if the agent edits itself, vendor updates become three-way merges into a divergent lineage, and someone has to own conflict resolution. Ouroboros ships that resolver as core infrastructure and constrains it with review — the doc/code/hot classification "grants or blocks nothing," which means the design refuses to let a filename list stand in for policy.

This connects directly to the permission-ordering question I examined in the [OpenHarness permission-order audit](/posts/openharness-permission-order-audit/): authority design fails at the seams, and the seam in a self-rewriting agent is precisely the moment a self-change, an update merge, or a skill install crosses from proposal to applied state. Ouroboros's answer at every one of those seams is the same: the owner's switch, a recorded review, or both.

## Limitations

- I did not run the desktop app, the CLI, or the test suite; every code claim is a reading of the pinned tree, not a runtime exercise of its guards.
- The 48-hour v4.1-to-v6.2.0 history, the 32 evolution cycles, the 161-day Hope deployment, and all benchmark scores are the project's self-reports; no third-party measurement was checked in this run.
- Enforcement quality was not adversarially tested — a deny table proves the surface exists, not that it cannot be bypassed.
- This is a single-maintainer MIT project moving fast (release 6.114.0; last push the day before retrieval); the tree will drift from the audited SHA quickly.

## 🎯 Key Takeaways

1. **The constitution and the code address different layers on purpose — partitioned, not in conflict.** BIBLE.md gives the agent a story where "agency wins"; the supervisor gives the owner every hard switch this audit read. The story layer is readable by the model; the switch layer is not negotiable by it.
2. **Self-evolution ships default-off behind owner gates.** The worker cannot enqueue or enable its own evolution; a durable signal plus a gated supervisor tick, idle/restart-verify/breaker/budget/identity checks, and multi-model commit review stand between a proposal and applied code.
3. **The sharpest guardrail here is read-denial, not write-denial.** Protected artifacts deny read, copy, hash, introspection, trace, and debug by default, classified at shell-argv level.
4. **Self-modification turns every install into a fork — plan for the merge.** Updates are git merges into a divergent local lineage with one reviewed resolver; path classification describes, it never authorizes.
5. **Custody is a product surface, not a config file.** Budget meters, Panic, per-skill security review, and evolution toggles are all in the shipped UI the vendor screenshots.

## 🤔 New Questions

- What does the reviewed assisted resolver actually do with a hot-path conflict in practice — and how often do real installs diverge enough to trigger it?
- Can "may not weaken the immune system" be enforced mechanically, or is it ultimately a review-culture promise backed by the multi-model quorum?
- The owner may downgrade blocking review to advisory; over a long deployment, how often does that recorded-but-not-blocked lane accumulate changes a blocking gate would have stopped?
- If a matched-model third party reruns Terminal-Bench 2.1 or OSWorld-Verified against this harness, do the self-reported margins hold?

## References

### Primary sources

- [razzant/ouroboros at b9bcc2da (release 6.114.0)](https://github.com/razzant/ouroboros/tree/b9bcc2da71e0bd51b6f5f906890b3b80265defed) — pinned tree; all file quotes and line coordinates.
- [GitHub API: razzant/ouroboros](https://api.github.com/repos/razzant/ouroboros) — stars, forks, license, timestamps at retrieval.
- [arXiv:2608.08311v3 — Ouroboros: A Self-Developing Frontier Coding Agent with Reviewed Core Evolution](https://arxiv.org/abs/2608.08311) — technical report abstract, v3 of 2026-08-31.

### Key files quoted

- [BIBLE.md](https://github.com/razzant/ouroboros/blob/b9bcc2da71e0bd51b6f5f906890b3b80265defed/BIBLE.md) — Principles 0, 3, and 4.
- [ouroboros/post_task_evolution.py](https://github.com/razzant/ouroboros/blob/b9bcc2da71e0bd51b6f5f906890b3b80265defed/ouroboros/post_task_evolution.py) — the owner-gated evolution envelope.
- [ouroboros/protected_artifacts.py](https://github.com/razzant/ouroboros/blob/b9bcc2da71e0bd51b6f5f906890b3b80265defed/ouroboros/protected_artifacts.py) — deny-by-default introspection.
- [ouroboros/commit_admission.py](https://github.com/razzant/ouroboros/blob/b9bcc2da71e0bd51b6f5f906890b3b80265defed/ouroboros/commit_admission.py) — deterministic admission before paid review.
- [supervisor/owner_stop.py](https://github.com/razzant/ouroboros/blob/b9bcc2da71e0bd51b6f5f906890b3b80265defed/supervisor/owner_stop.py) — graceful stop and Panic.
- [supervisor/update_merge_policy.py](https://github.com/razzant/ouroboros/blob/b9bcc2da71e0bd51b6f5f906890b3b80265defed/supervisor/update_merge_policy.py) — the fork-merge update contract.
- [ouroboros/size_ratchet_manifest.py](https://github.com/razzant/ouroboros/blob/b9bcc2da71e0bd51b6f5f906890b3b80265defed/ouroboros/size_ratchet_manifest.py) — the size-debt fence.

### Related on this site

- [OpenHarness permission-order audit](/posts/openharness-permission-order-audit/) — authority ordering inside a harness.
- [Open Science provenance audit](/posts/open-science-provenance-audit/) — when self-reported benchmarks shed their hedges.

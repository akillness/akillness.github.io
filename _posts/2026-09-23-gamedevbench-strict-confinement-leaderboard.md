---
title: "GameDevBench's 68.8% top score is the only strictly confined row"
description: "A Source Audit of GameDevBench's leaderboard: the new top row ran inside the strict bubblewrap box added on September 1, while the other 17 rows predate that box."
categories: [AI, Agents]
tags: [ai-agents, benchmarks, evaluation, sandboxing, godot, game-development, harness-engineering]
date: 2026-09-23 16:07:38 +0900
mermaid: false
math: false
image:
  path: /assets/img/posts/2026-09-23-gamedevbench-strict-confinement-leaderboard/gamedevbench-isolation-eras.svg
  alt: "Original timeline showing 17 GameDevBench leaderboard rows published before the September 1 strict confinement series and one strict-confined top row"
---

> **Editorial method:** This Source Audit was researched and drafted with AI assistance under a policy-bound evidence harness; I read the pinned repository and paper but did not run GameDevBench or any model myself.

## 🤔 Curiosity: Did GPT 6 Astra win, or did the box change?

On September 9, 2026, the GameDevBench repository added a new first-place row: **GPT 6 Astra (High), 229 of 333 tasks, 68.8%**, run through Codex "with runtime-video and strict confinement." The previous leader, Claude Fable 5 (xhigh), now sits one row below at 67.3%.

GameDevBench is the benchmark from Carnegie Mellon University and Princeton University researchers that the README describes as the first benchmark for evaluating LLM agents on game development tasks in a modern game engine, published at ICML 2026. It asks agents to finish Godot tasks that involve shaders, sprites, animations, user interfaces, and gameplay scripts. For anyone who automates engine work, its leaderboard is a useful public signal about which agents can actually edit a game project.

So a new number one looks like news. But the phrase "strict confinement" made me ask a narrower question:

> **Were the rows on this leaderboard measured inside the same box?**

The pinned history says no. Strict confinement did not exist until a series of commits on September 1. Every other row on the board was published before that date. The ranking is a comparison across two isolation eras, and the leaderboard file itself does not tell you which era a row came from.

That is not a scandal, and the maintainers' own run notes acknowledge the harness change. It is a measurement boundary. Game teams building their own agent benchmarks will hit the same boundary, so it is worth reading closely.

## 📚 Retrieve: What the pinned repository records

I pinned the repository at commit [`a604ca9e`](https://github.com/waynchi/gamedevbench/tree/a604ca9e0d26be2047d56ce3aa8d571d6e12c256) from September 22, 2026, and read the README, the leaderboard CSV, the three result folders, the confinement commits, and the pre-September solver code. I also read the [arXiv v2 paper](https://arxiv.org/abs/2602.11103v2), which is licensed CC BY 4.0.

### What GameDevBench measures

The paper describes **333 tasks derived from web and video tutorials**. The README splits them into four categories: 2D Graphics & Animation (33.3%), 3D Graphics & Animation (26.7%), User Interface (20.1%), and Gameplay Logic (19.8%). On average, a reference solution edits **4.7 files and 114 lines of code across 3.2 distinct filetypes**.

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-23-gamedevbench-strict-confinement-leaderboard/references/gamedevbench-task-taxonomy.png" alt="Three-by-three grid of GameDevBench Godot tasks covering 3D effects, 2D sprite animation, a UI minimap, and gameplay logic examples">
  <figcaption>The GameDevBench overview figure from the pinned repository README. Source: <a href="https://github.com/waynchi/gamedevbench/blob/a604ca9e0d26be2047d56ce3aa8d571d6e12c256/README.md">https://github.com/waynchi/gamedevbench/blob/a604ca9e0d26be2047d56ce3aa8d571d6e12c256/README.md</a>. Publisher/creator: Wayne Chi et al., GameDevBench authors (waynchi/gamedevbench). License: <a href="https://raw.githubusercontent.com/waynchi/gamedevbench/a604ca9e0d26be2047d56ce3aa8d571d6e12c256/LICENSE">https://raw.githubusercontent.com/waynchi/gamedevbench/a604ca9e0d26be2047d56ce3aa8d571d6e12c256/LICENSE</a>. Attribution: Wayne Chi et al., GameDevBench repository README figure, Apache-2.0, pinned at commit a604ca9e.</figcaption>
</figure>

The tasks are multimodal in a concrete way. The paper's example workflow shows a UI minimap task twice: once as a visual Godot scene and once as the scene and script files an agent has to edit.

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-23-gamedevbench-strict-confinement-leaderboard/references/gamedevbench-minimap-task-workflow.png" alt="GameDevBench minimap task shown as a Godot game view with highlighted interface elements above the matching scene tree and GDScript code">
  <figcaption>Example task requesting a UI minimap, shown as a visual scene and as files. Source: <a href="https://github.com/waynchi/gamedevbench/blob/a604ca9e0d26be2047d56ce3aa8d571d6e12c256/README.md">https://github.com/waynchi/gamedevbench/blob/a604ca9e0d26be2047d56ce3aa8d571d6e12c256/README.md</a>. Publisher/creator: Wayne Chi et al., GameDevBench authors (waynchi/gamedevbench). License: <a href="https://raw.githubusercontent.com/waynchi/gamedevbench/a604ca9e0d26be2047d56ce3aa8d571d6e12c256/LICENSE">https://raw.githubusercontent.com/waynchi/gamedevbench/a604ca9e0d26be2047d56ce3aa8d571d6e12c256/LICENSE</a>. Attribution: Wayne Chi et al., GameDevBench example workflow figure, Apache-2.0, pinned at commit a604ca9e.</figcaption>
</figure>

The paper also shows the editor surfaces a Godot developer moves between: scene, script, tilemap, shader, animation, and audio editors. That is the environment the benchmark asks agents to work in. The paper notes that tasks can be solved in the editor or entirely through code, and that either way requires understanding multimodal assets.

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-23-gamedevbench-strict-confinement-leaderboard/references/godot-editor-surfaces.png" alt="Godot editor surfaces from the GameDevBench paper: scene and script editors above tilemap, shader, animation, and audio editors">
  <figcaption>Figure 3 of the paper: the types of editors in Godot. Source: <a href="https://arxiv.org/html/2602.11103v2">https://arxiv.org/html/2602.11103v2</a>. Publisher/creator: Wayne Chi et al., GameDevBench paper (arXiv:2602.11103v2). License: <a href="https://creativecommons.org/licenses/by/4.0/">https://creativecommons.org/licenses/by/4.0/</a>. Attribution: Wayne Chi et al., GameDevBench, arXiv:2602.11103v2, Figure 3, licensed CC BY 4.0.</figcaption>
</figure>

### Three "best scores" in three places

The benchmark's headline number depends on where you read it:

| Surface | "Best" score stated | What it matches |
|---|---|---|
| arXiv v2 abstract (June 30, 2026) | 53.8% | the paper's best agent and method at v2 time |
| README Abstract section, pinned | 63.7% | a later leaderboard row, gpt-5.6-sol (xhigh) |
| README results line and project page | 68.8% | GPT 6 Astra (High), the September 7 run |

The three numbers come from different dates and different sets of runs, and none of them carries the harness version or isolation mode it was measured under. The README's Abstract still says 63.7% while the leaderboard in the same README shows two rows above it. The paper's own feedback finding shows why configuration matters: GPT-5.4 rose **from 41.1% to 52.0% when given visual feedback**. The project page says each row uses the best multimodal feedback configuration per model, in its best harness.

### The September box

Strict confinement arrived through a series of commits on **2026-09-01**: a provider-allowlist egress proxy (`e5446a2`), bubblewrap confinement for solvers and validation (`dad8862`), hardened solver CLIs (`aa92216`), strict mode as the default (`b0c2a30`), and prompt text telling agents that `/workspace` holds all task files (`897e767`). The string `bwrap` first appears in the repository history in `dad8862`.

The README now describes the box precisely. Each solver gets **a private mount, PID, home, temporary, and network namespace**. Only the filtered task workspace is writable. **The repository task sources, ground truth, previous results, host home, and sibling workspaces are not mounted.** HTTPS goes through a host proxy that permits only selected provider endpoints. And `--confinement off` runs are marked unconfined and "should not be used for benchmark scores."

That last sentence is the maintainers setting a standard. The question is how many leaderboard rows were produced under it.

### What the harness did before September

At commit [`3a80dfd`](https://github.com/waynchi/gamedevbench/tree/3a80dfdfd01209485185909cb88ac1687dff925e) from August 13, the last leaderboard update before the box, the runner copied a filtered task directory into the system temp folder, changed into it, and ran the agent there. Its docstring says the copy prevents agents from reading test files and `task_config.json`, running validation, and accessing the original task directory. The solver defaults at that commit were:

| Harness | Default at `3a80dfd` |
|---|---|
| Codex | approval `never`, sandbox `danger-full-access` |
| Claude Code | `permission_mode="bypassPermissions"` |
| Gemini CLI | `--yolo` |
| Muse | `--disable-approval --disable-sandbox` |

The Codex default had also moved over time. At the public release commit `b4989d8` from February 13, it was `workspace-write`.

Meanwhile the setup step, `bash unzip_tasks.sh`, unzips every task archive **and every ground-truth archive** into the checkout. The README says tasks ship as individual zip files "to prevent accidental data leakage," and the filtered copy does keep test files and answers out of the agent's working directory.

My inference from the code is deliberately narrower than an accusation: **before September, the runner itself added a working-directory boundary but no OS boundary, and the four CLIs in the table ran with their approval or sandbox checks turned off.** Any further isolation depended on the harness or on how a lab hosted the run, and the repository records neither. I found nothing suggesting that any agent read outside its copy.

### What the leaderboard file records

`results/leaderboard.csv` has six columns: `rank`, `model`, `harness`, `pass_at_1_percent`, `ci_95_percent`, and `new`. There is no column for harness commit, isolation mode, Godot build, or run date. The README's leaderboard graphic draws the same ranking with interval whiskers and carries no label for harness version, confinement mode, or run date either.

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-23-gamedevbench-strict-confinement-leaderboard/references/gamedevbench-leaderboard.png" alt="GameDevBench leaderboard bar chart ranking 18 agent and harness setups by pass@1 with interval whiskers, led by gpt-6-astra (high) at 68.8%">
  <figcaption>The leaderboard graphic refreshed in the same commit that added the GPT 6 Astra row. Source: <a href="https://github.com/waynchi/gamedevbench/blob/a604ca9e0d26be2047d56ce3aa8d571d6e12c256/README.md">https://github.com/waynchi/gamedevbench/blob/a604ca9e0d26be2047d56ce3aa8d571d6e12c256/README.md</a>. Publisher/creator: Wayne Chi et al., GameDevBench authors (waynchi/gamedevbench). License: <a href="https://raw.githubusercontent.com/waynchi/gamedevbench/a604ca9e0d26be2047d56ce3aa8d571d6e12c256/LICENSE">https://raw.githubusercontent.com/waynchi/gamedevbench/a604ca9e0d26be2047d56ce3aa8d571d6e12c256/LICENSE</a>. Attribution: Wayne Chi et al., GameDevBench leaderboard graphic, Apache-2.0, pinned at commit a604ca9e.</figcaption>
</figure>

The history fills that gap. At `3a80dfd`, the file already held **17 rows with the same model, harness, score, and interval values** it holds today, with Claude Fable 5 (xhigh) at rank 1. Commit [`3a0dd3c`](https://github.com/waynchi/gamedevbench/commit/3a0dd3c4c7aed8414cfb7c895fd2e37cbd45db2d) on September 9 added one row, GPT 6 Astra (High), and refreshed the leaderboard graphic. So **17 of 18 rows were published before strict confinement existed**, and exactly one row, the new leader, was measured inside it.

The result files show the same split. The repository keeps per-run folders for only three entries: GLM-5.2 on OpenCode (June 30), Claude Opus 4.8 on Claude Code (July 1), and GPT 6 Astra on Codex (September 7). The two older configurations record the agent, model, MCP use, runtime-video, display handling, debug flag, run name, and parallelism. The Astra configuration adds `effort: high`, `godot_version: 4.4.1.stable.official.49a5bc7b6`, `confinement: strict`, and `provider_hosts`, and each of its 333 task records carries a confinement field.

The [Astra run notes](https://github.com/waynchi/gamedevbench/blob/a604ca9e0d26be2047d56ce3aa8d571d6e12c256/results/gpt6_astra_codex_runtime_video_high_full_333/README.md) are candid about the consequence: "The latest harness adds strict confinement and prompt restrictions, so earlier leaderboard runs use different harness versions." They also record that **ground-truth validation passed 331/333** on Linux, because tasks 0051 and 0052 have filename-case mismatches, and that Astra passed 0051 and failed 0052.

### How close the top two really are

The run notes say the leaderboard uses a normal-approximation 95% interval. By my arithmetic, 229/333 gives 68.8% ± 5.0, while Fable 5's 67.3% ± 5.0 spans roughly 62.3% to 72.3%. **The two published intervals overlap across most of their width.** That is not a formal test, because a paired per-task comparison would need Fable 5's per-task results and those are not in the repository. It is enough to say these numbers do not settle the order at the top.

### Why engine-level checks still matter

The paper's failure analysis is a good reminder of what the benchmark does catch. In Figure 11, GPT-5.4 places `sub_emitter` inside the `ParticleProcessMaterial` sub-resource instead of on the `GPUParticles2D` node, where the property belongs.

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-23-gamedevbench-strict-confinement-leaderboard/references/gpt54-sub-emitter-failure-case.png" alt="GameDevBench Figure 11 comparing GPT-5.4 placing sub_emitter in ParticleProcessMaterial (red) with the correct GPUParticles2D placement (green)">
  <figcaption>Figure 11 of the paper: a Godot property placed on the wrong object. Source: <a href="https://arxiv.org/html/2602.11103v2">https://arxiv.org/html/2602.11103v2</a>. Publisher/creator: Wayne Chi et al., GameDevBench paper (arXiv:2602.11103v2). License: <a href="https://creativecommons.org/licenses/by/4.0/">https://creativecommons.org/licenses/by/4.0/</a>. Attribution: Wayne Chi et al., GameDevBench, arXiv:2602.11103v2, Figure 11, licensed CC BY 4.0.</figcaption>
</figure>

That is the kind of error an engine-backed validator exists to catch, and it is why an engine-backed benchmark is worth protecting from measurement drift.

## 💡 Innovation: Read the board as two tables

The September changes make GameDevBench more trustworthy going forward. The problem is the table, not the box. Right now one list ranks runs from two isolation eras, and the leaderboard itself does not mark which era a row belongs to.

![Original timeline of GameDevBench's two isolation eras: 17 rows published before the September 1 strict confinement series and one strict-confined top row](/assets/img/posts/2026-09-23-gamedevbench-strict-confinement-leaderboard/gamedevbench-isolation-eras.svg)

For a reader choosing a model, I would treat the current board as two tables:

1. **The strict table**, currently one row: GPT 6 Astra (High), 229/333.
2. **The pre-box table**, 17 rows measured with each CLI's own permission mode.

Within the pre-box table, comparisons are closer to like-for-like, though harness defaults still moved over time. Across the two tables, treat differences smaller than the published intervals as ties until the top rows are re-run in the same box.

### A regime-stamp checklist for studio agent benchmarks

An internal agent benchmark for Unity or Godot can easily start where GameDevBench started: a task copy, a CLI in a permissive mode, and a CSV of pass rates. The upgrade path is cheap if every row carries its regime from day one:

- **Harness commit** for the runner and for each solver adapter.
- **Isolation mode**, whether container, namespace, or CLI permission flag, recorded per task.
- **Engine build**, pinned exactly. GameDevBench now rejects anything but Godot 4.4.1 unless `GODOT_ALLOW_NEWER=1` is set, and says such results are not comparable to the leaderboard.
- **Feedback mode**: screenshots, runtime video, or none. Visual feedback moved GPT-5.4 by 10.9 points in the paper.
- **Ground-truth ceiling** on the platform you score, such as 331/333 on Linux.
- **Interval and denominator**, so a reader can see when first and second place are a tie.

A regime change should start a new table, or at least add a column. The same discipline applies to any benchmark claim; I traced a similar provenance question in the [Moli benchmark provenance audit](/posts/moli-benchmark-provenance-audit/). If your benchmark runs agents in containers, the [AIO Sandbox confinement contract audit](/posts/aio-sandbox-confinement-contract-audit/) looks at what a sandbox README promises versus what it enforces.

## 🎯 Key Takeaways

- GameDevBench's new top row, **GPT 6 Astra (High) at 229/333 (68.8%)**, is the only leaderboard entry run under the strict bubblewrap confinement added on 2026-09-01.
- **17 of 18 rows** were published before that box existed, when the runner used a filtered temp-directory copy and each agent CLI's own permission mode.
- `results/leaderboard.csv` has no column for harness commit, isolation mode, engine build, or run date, and the maintainers' own run notes say earlier runs used different harness versions.
- The top two rows' published intervals overlap, so these numbers do not settle first versus second place.
- For an internal game-development agent benchmark, stamp every row with harness commit, isolation mode, engine build, feedback mode, and ground-truth ceiling.

### Limitations and trade-offs

- I read code, history, and result files. I did not run GameDevBench, any agent, or any escape test.
- The pre-September permission modes are code defaults at `3a80dfd`. The repository does not record which mode each historical run actually used.
- Only three runs have per-run folders in the repository, so most rows could not be checked against run artifacts.
- The interval comparison is arithmetic on published intervals, not a paired significance test.

## 🤔 New Questions

- Will the maintainers re-run the top pre-box rows under strict confinement, and how far would the scores move?
- Should the leaderboard add a regime column, or split into dated tables?
- Does the stricter network boundary change how agents work, not only what they can reach?
- Which studio benchmarks already record isolation mode per task, and which keep only a pass rate?

## References

### Primary repository evidence

- [GameDevBench at pinned commit `a604ca9e`](https://github.com/waynchi/gamedevbench/tree/a604ca9e0d26be2047d56ce3aa8d571d6e12c256)
- [README at the pinned commit](https://github.com/waynchi/gamedevbench/blob/a604ca9e0d26be2047d56ce3aa8d571d6e12c256/README.md)
- [`results/leaderboard.csv`](https://github.com/waynchi/gamedevbench/blob/a604ca9e0d26be2047d56ce3aa8d571d6e12c256/results/leaderboard.csv)
- [`results/` folder with the three per-run directories](https://github.com/waynchi/gamedevbench/tree/a604ca9e0d26be2047d56ce3aa8d571d6e12c256/results)
- [GPT 6 Astra (High) run notes](https://github.com/waynchi/gamedevbench/blob/a604ca9e0d26be2047d56ce3aa8d571d6e12c256/results/gpt6_astra_codex_runtime_video_high_full_333/README.md)
- [`unzip_tasks.sh`](https://github.com/waynchi/gamedevbench/blob/a604ca9e0d26be2047d56ce3aa8d571d6e12c256/unzip_tasks.sh)
- [Commit `b0c2a30`: strict confinement by default](https://github.com/waynchi/gamedevbench/commit/b0c2a30155a2f902ff9497833ba0ec6214b6aaad)
- [Commit `3a0dd3c`: GPT 6 Astra row and leaderboard](https://github.com/waynchi/gamedevbench/commit/3a0dd3c4c7aed8414cfb7c895fd2e37cbd45db2d)
- [Commit `3cf2687`: optional newer Godot version](https://github.com/waynchi/gamedevbench/commit/3cf2687e77a50b12929022a9857b95456cb0a77b)
- [Pre-September harness at commit `3a80dfd`](https://github.com/waynchi/gamedevbench/tree/3a80dfdfd01209485185909cb88ac1687dff925e)
- [Apache License 2.0 at the pinned commit](https://raw.githubusercontent.com/waynchi/gamedevbench/a604ca9e0d26be2047d56ce3aa8d571d6e12c256/LICENSE)

### Paper and project page

- [GameDevBench on arXiv, v2](https://arxiv.org/abs/2602.11103v2)
- [arXiv v2 HTML with figures](https://arxiv.org/html/2602.11103v2)
- [GameDevBench project page and leaderboard](https://waynechi.com/gamedevbench)
- [Creative Commons Attribution 4.0](https://creativecommons.org/licenses/by/4.0/)

### Related reading

- [Moli benchmark provenance audit](/posts/moli-benchmark-provenance-audit/)
- [AIO Sandbox confinement contract audit](/posts/aio-sandbox-confinement-contract-audit/)

---
title: "ECC Retired Six MCP Servers Over a Tax Its Catalog Still Pays"
description: "ECC's connector policy says tool schemas tax every session, and it retired six defaults. Measured at commit 22e8cf01, its 286-skill catalog carries roughly 86 KB of metadata."
categories: [AI, Agents]
tags: [ecc, claude-code, harness-engineering, ai-agents, mcp, skills, hooks, context-window, open-source]
date: 2026-09-04 00:16:41 +0900
mermaid: false
image:
  path: /assets/img/posts/2026-09-04-ecc-context-tax-audit/context-tax-cover.svg
  width: 1200
  height: 630
  alt: "Diagram contrasting ECC's MCP connector audit, which retired six default connectors and left one, with its default install surface of 286 skills, 68 agents, 94 commands, and 23 lifecycle hooks"
---

## 🤔 Curiosity: does the harness layer pay its own tax?

[ECC](https://github.com/affaan-m/ECC) is the kind of repository that bends the axes of a star-history chart. Created on 18 January 2026, it stood at 246,863 stars with 37,198 forks when I pulled the GitHub API on 4 September — and it was on the daily Trending list that morning, described the way it describes itself: "The agent harness performance optimization system."

The origin story is right there in the tree. The shortform guide opens with the author winning the Anthropic x Forum Ventures hackathon and sharing "my complete setup after 10 months of daily use"; the longform guide still points readers at `github.com/affaan-m/everything-claude-code`, a name that now answers HTTP 301 to this repository. A viral tips article became a repo, the repo became a product, and the README's own chart caption claims "first 40,000 stars, January 18 to February 7, 2026" — twenty days.

What made me stop, though, was not the growth. It was a policy document inside the repo. ECC ships a strict MCP connector policy that begins from one premise: "Tool schemas load into every session; each default connector taxes every user's context window whether they use it or not." On that premise its June 2026 audit retired six default MCP connectors, leaving exactly one.

That is a real standard, stated more clearly than most harness projects ever state it. So the audit question asks itself: what happens when you apply ECC's own standard to ECC's own default install?

> **Editorial method:** This Source Audit was researched and drafted with AI assistance inside an evidence-gated editorial harness; every repository claim is pinned to commit 22e8cf01 or to GitHub API responses recorded in the run's evidence pack, and no ECC code was executed.
{: .prompt-info }

## 📚 Retrieve: what the recommended install actually carries

### The catalog is exactly as advertised

The README claims "Access to 68 agents, 286 skills, and 94 legacy command shims, plus hooks, rules, memory, continuous learning, and AgentShield security scanning." I re-counted at commit `22e8cf01`: 68 agent definition files under `agents/`, 286 `SKILL.md` files under `skills/`, 94 command files under `commands/`. Every number matches.

That deserves saying plainly, because a repository this viral is worth re-counting rather than quoting. ECC's self-reported counts are accurate, its LICENSE is clean MIT, and the changelog for release 2.2.0 (25 August 2026) reads like release engineering from a much larger team — registry-byte verification, staged dist-tags, packed-artifact tests across three operating systems. The newest commit at retrieval closes pull request #2942 on a repository that is seven and a half months old.

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-04-ecc-context-tax-audit/references/two-terminal-workflow.png" alt="Screenshot from ECC's longform guide of two side-by-side Claude Code terminals in a directory named everything-claude-code, one renamed ecc-code for coding and one ecc-qs for questions">
  <figcaption>The workflow that started it all, in a directory still named <code>everything-claude-code</code>. Source: <a href="https://github.com/affaan-m/ECC/blob/22e8cf01d0b54719b3a49002fab2ccbda4ff5b9e/the-longform-guide.md">https://github.com/affaan-m/ECC/blob/22e8cf01d0b54719b3a49002fab2ccbda4ff5b9e/the-longform-guide.md</a> · License: <a href="https://github.com/affaan-m/ECC/blob/22e8cf01d0b54719b3a49002fab2ccbda4ff5b9e/LICENSE">https://github.com/affaan-m/ECC/blob/22e8cf01d0b54719b3a49002fab2ccbda4ff5b9e/LICENSE</a> · Affaan Mustafa (affaan-m/ECC), MIT, commit 22e8cf01</figcaption>
</figure>

The guides themselves are disciplined about spend in other dimensions - the longform guide routes tasks to the cheapest capable model and is honest enough to label its example a hypothetical:

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-04-ecc-context-tax-audit/references/subagent-model-routing.png" alt="Table graphic from ECC's longform guide mapping task types to Haiku, Sonnet, or Opus with reasoning, captioned as a hypothetical setup of subagents">
  <figcaption>The longform guide's model-routing table, captioned as a hypothetical subagent setup. Source: <a href="https://github.com/affaan-m/ECC/blob/22e8cf01d0b54719b3a49002fab2ccbda4ff5b9e/the-longform-guide.md">https://github.com/affaan-m/ECC/blob/22e8cf01d0b54719b3a49002fab2ccbda4ff5b9e/the-longform-guide.md</a> · License: <a href="https://github.com/affaan-m/ECC/blob/22e8cf01d0b54719b3a49002fab2ccbda4ff5b9e/LICENSE">https://github.com/affaan-m/ECC/blob/22e8cf01d0b54719b3a49002fab2ccbda4ff5b9e/LICENSE</a> · Affaan Mustafa (affaan-m/ECC), MIT, commit 22e8cf01</figcaption>
</figure>

### Measuring the catalog's metadata

A skill catalog is not free, and ECC's own README states the mechanism in its support matrix: "The plugin advertises the installed catalog to the model; use a selective/manual profile when context footprint matters." What the plugin advertises per skill is its name and description: ECC's own skill guide describes the description field as what is "shown in skill list and used for auto-activation".

So I measured the advertisement. Across all 286 `SKILL.md` frontmatters at commit `22e8cf01`, extracting each `name` and `description` value (multi-line folded scalars joined with single spaces, surrounding quotes stripped, counted as UTF-8 bytes), the names total 4,877 bytes and the descriptions total 81,342 bytes — 86,219 bytes of catalog metadata, roughly 86 KB. At a rough four bytes per token, that is on the order of 21,500 tokens if a harness serializes the full catalog into a session. The exact footprint depends on how each harness renders its catalog, and a selective profile shrinks it; both caveats are real, and neither changes the order of magnitude of what the default full install has to advertise.

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-04-ecc-context-tax-audit/references/context-statusline.jpg" alt="Screenshot from ECC's shortform guide of a custom Claude Code status line showing ctx:65 percent, the Opus model, plan mode, and the time">
  <figcaption>ECC's own guide teaches a status line that watches the context window drain. Source: <a href="https://github.com/affaan-m/ECC/blob/22e8cf01d0b54719b3a49002fab2ccbda4ff5b9e/the-shortform-guide.md">https://github.com/affaan-m/ECC/blob/22e8cf01d0b54719b3a49002fab2ccbda4ff5b9e/the-shortform-guide.md</a> · License: <a href="https://github.com/affaan-m/ECC/blob/22e8cf01d0b54719b3a49002fab2ccbda4ff5b9e/LICENSE">https://github.com/affaan-m/ECC/blob/22e8cf01d0b54719b3a49002fab2ccbda4ff5b9e/LICENSE</a> · Affaan Mustafa (affaan-m/ECC), MIT, commit 22e8cf01</figcaption>
</figure>

### The hook layer runs on every call

`hooks/hooks.json` registers 23 hook entries across 7 lifecycle events: 8 on PreToolUse, 7 on Stop, plus PreCompact, SessionStart, PostToolUse, PostToolUseFailure, and SessionEnd entries. Two PreToolUse entries are registered with a `.*` matcher — continuous-learning observation capture and MCP health checking — so they match every tool call. A single Bash call matches four PreToolUse entries; every one of the 23 commands is a self-contained `node -e` bootstrap that first resolves the plugin root, scanning candidate plugin and cache directories, before requiring its target script.

And every response ends with seven Stop hooks: plan-canvas feedback delivery, batch format and typecheck, a console.log check, session persistence, session evaluation, cost tracking, and a desktop notification.

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-04-ecc-context-tax-audit/references/posttooluse-hook-running.png" alt="Screenshot from ECC's shortform guide of Claude Code reading .claude/hooks/stop-hook.sh with the status line Running PostToolUse hook">
  <figcaption>The guide's own capture of a PostToolUse hook firing mid-session. Source: <a href="https://github.com/affaan-m/ECC/blob/22e8cf01d0b54719b3a49002fab2ccbda4ff5b9e/the-shortform-guide.md">https://github.com/affaan-m/ECC/blob/22e8cf01d0b54719b3a49002fab2ccbda4ff5b9e/the-shortform-guide.md</a> · License: <a href="https://github.com/affaan-m/ECC/blob/22e8cf01d0b54719b3a49002fab2ccbda4ff5b9e/LICENSE">https://github.com/affaan-m/ECC/blob/22e8cf01d0b54719b3a49002fab2ccbda4ff5b9e/LICENSE</a> · Affaan Mustafa (affaan-m/ECC), MIT, commit 22e8cf01</figcaption>
</figure>

None of this is hidden. The guides teach session persistence and hook-driven verification as the point of the product, and the session state it persists is visible on disk.

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-04-ecc-context-tax-audit/references/claude-session-storage.png" alt="File-tree screenshot from ECC's longform guide showing a .claude directory with hooks, plugins, and a sessions folder holding dated .tmp session files">
  <figcaption>Session state on disk, from the longform guide's memory-persistence section. Source: <a href="https://github.com/affaan-m/ECC/blob/22e8cf01d0b54719b3a49002fab2ccbda4ff5b9e/the-longform-guide.md">https://github.com/affaan-m/ECC/blob/22e8cf01d0b54719b3a49002fab2ccbda4ff5b9e/the-longform-guide.md</a> · License: <a href="https://github.com/affaan-m/ECC/blob/22e8cf01d0b54719b3a49002fab2ccbda4ff5b9e/LICENSE">https://github.com/affaan-m/ECC/blob/22e8cf01d0b54719b3a49002fab2ccbda4ff5b9e/LICENSE</a> · Affaan Mustafa (affaan-m/ECC), MIT, commit 22e8cf01</figcaption>
</figure>

### The connector policy that names the tax

Here is the remarkable document. `docs/MCP-CONNECTOR-POLICY.md` ships exactly one default MCP connector and justifies the cut with a two-part rule: a default must be universal, and MCP must genuinely beat a CLI or REST API wrapped in a skill — because "Tool schemas load into every session; each default connector taxes every user's context window whether they use it or not."

The June 2026 audit it records retired six former defaults. The `github` server was dropped for a skill wrapping the `gh` CLI because "The MCP server's ~30 tool schemas taxed every session." `sequential-thinking` was dropped as "a prompting pattern dressed as a connector." `memory`, `playwright`, `exa`, and `context7` each got a reasoned verdict, and the 2.2.0 changelog carries the reduction into the shipped default set.

This is a sharper default-connector cost rule than anything I found while auditing the MCP landscape for [my MCP roadmap audit](/posts/mcp-roadmap-agentic-infrastructure/). Thirty tool schemas per session was enough to disqualify GitHub's connector. The catalog that replaced those connectors advertises 286 skill descriptions totaling roughly 86 KB. The policy document that killed the connectors scopes itself to MCP servers. The tree does carry two skill policies - SKILL-PLACEMENT-POLICY.md and skill-adaptation-policy.md - but they govern where skills live, their provenance, and how outside contributions are renamed, not what a default catalog entry costs a session. The closest the repository comes to a catalog cost rule is the support-matrix advice to "use a selective/manual profile when context footprint matters."

### The security guide's illustrations

ECC ships a long security guide, and its text carries real advice. Its images are another story. The guide embeds `observability.png` under the caption "Hijacked runs usually look weird in the trace before they look obviously malicious" — and the illustration is a rendered monitor whose "Terminal trace logs" panel is filled with strings that are shaped like log fields but are not words, stamped with impossible calendar dates — `2023-13-1T16:33` appears verbatim, one of three timestamps in the panel claiming a thirteenth month. The artifacts are consistent with AI image generation, though the repository does not label the image's origin either way.

Hash the directory and a second pattern appears: `attack-chain.png` and `attack-vectors.png` are byte-identical, as are `sandboxing.png` and `sandboxing-comparison.png`. The English guide references one filename of each pair while the Chinese translation points at the other — the same bytes shipped twice under two names. In a guide whose thesis is that you catch hijacks by reading traces carefully, the illustrations reward the reader who reads them carefully.

### The business around it

The monetization is disclosed and conventional: "OSS stays free. This repo is MIT-licensed forever," with ECC Pro as a hosted GitHub App for private repos from $19 per seat per month, and named sponsors including CodeRabbit, Greptile, Atlas Cloud, and Moonshot AI. The README credits "a single maintainer" shipping "weekly across 7 harnesses." The design docs also carry a browser Plan Canvas for reviewing and annotating agent plans outside the terminal — its design doc marks it "Status: implemented", and the hook inventory above already carries its Stop and SessionStart hooks.

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-04-ecc-context-tax-audit/references/plan-canvas-demo.png" alt="Screenshot from ECC's Plan Canvas design doc showing a browser plan-review canvas beside a terminal where the agent replies to canvas feedback">
  <figcaption>Plan Canvas, from the design doc: plan review moves to the browser while the agent works in the terminal. Source: <a href="https://github.com/affaan-m/ECC/blob/22e8cf01d0b54719b3a49002fab2ccbda4ff5b9e/docs/design/plan-canvas.md">https://github.com/affaan-m/ECC/blob/22e8cf01d0b54719b3a49002fab2ccbda4ff5b9e/docs/design/plan-canvas.md</a> · License: <a href="https://github.com/affaan-m/ECC/blob/22e8cf01d0b54719b3a49002fab2ccbda4ff5b9e/LICENSE">https://github.com/affaan-m/ECC/blob/22e8cf01d0b54719b3a49002fab2ccbda4ff5b9e/LICENSE</a> · Affaan Mustafa (affaan-m/ECC), MIT, commit 22e8cf01</figcaption>
</figure>

## 💡 Innovation: audit a harness by its own governance standard

The generalizable move in this audit is symmetry. A harness layer that writes down what a default costs is rare enough that the document doubles as a ruler. ECC did — and the moment a project states a governance standard, that standard becomes the sharpest available audit instrument for the project itself, because nobody can argue with the ruler.

Applied here, the symmetry looks like this:

| Surface | Per-session load | Governed by | Outcome at 22e8cf01 |
|---|---|---|---|
| Default MCP connectors | Tool schemas per connector ("~30" cited for `github`) | `docs/MCP-CONNECTOR-POLICY.md`, two-part test | six retired → one default after the June 2026 audit |
| Skill catalog (default full profile) | 286 names + descriptions, 86,219 bytes measured | Support-matrix advice: selective profile "when context footprint matters" | 286 advertised; skill policies cover placement/adaptation, not per-session cost |
| Lifecycle hooks | 23 registered entries; 4 PreToolUse matches per Bash call; 7 Stop hooks per response | Hook profiles chosen at install | 23 registrations at the default profile |
| Rules | "Always loaded, so install them selectively" (README) | Installer selection | selective by user discipline |

Three practical takeaways for anyone adopting a harness layer — ECC or otherwise:

1. **Find the project's own cost rule, then apply it everywhere.** ECC's connector test ("does this genuinely need session state, or is it a stateless call dressed as infrastructure?") is excellent. Ask it of every skill, hook, and rule in any catalog you install, not only of MCP servers.
2. **Measure the advertisement, not the archive.** The full 4.2 MB `skills/` tree never enters your context; the ~86 KB of names and descriptions is what the model must carry to know the catalog exists. Frontmatter bytes are a five-minute measurement on any skills repository, and they are the honest unit of the tax.
3. **Count process spawns per lifecycle event before enabling every hook profile.** Twenty-three registered `node -e` bootstraps — four of them fire on a single Bash call, seven on every response — each rescanning for the plugin root, is a measurable runtime overhead for a product whose banner promise is performance optimization; hook profiles exist precisely so you can decline part of it.

I audited what a skill installer writes to disk in [my Archify trust audit](/posts/archify-distrust-stack-audit/); this is the runtime sequel to that install-time question. And if you want the opposite architectural bet examined with the same method, read my audit of [DeepSeek's harness, where the agent loop itself is just another plugin](/posts/deepseek-harness-everything-is-a-plugin/) — a minimal core that makes every capability optional is the cleanest possible answer to the catalog tax, with its own costs.

### Limitations

This audit reads the repository; it does not instrument a live session. The 21,500-token figure is arithmetic on measured bytes, not a serialized-prompt capture, and a selective install profile reduces it. The 86,219-byte figure depends on the documented extraction convention; reasonable alternative treatments of multi-line YAML scalars shift the description total by under one percent. Whether each `.*` hook early-exits cheaply inside its script does not change the process-spawn count but does change its wall-clock cost, which I did not measure. The star-growth caption is the project's own chart. PR #2942 bounds combined issue-and-PR volume, not merged work. And the generative origin of the security illustrations is an inference from visible artifacts — the impossible timestamps are a fact, the generator is not named in the tree.

## 🎯 Key Takeaways

1. **ECC's inventory claims are accurate.** 68 agents, 286 skills, 94 commands — independently re-counted at commit 22e8cf01, every number matches the README.
2. **Its MCP policy is the sharpest default-connector cost rule I found in the MCP landscape, and it cuts inward.** Six default connectors were retired — leaving exactly one — because schemas tax every session; the surviving default install advertises roughly 86 KB of skill metadata and 23 lifecycle hooks that the policy's standard is never formally applied to.
3. **Polish and evidence diverge at the images.** A security guide teaching trace-reading illustrates itself with byte-identical duplicates and a dashboard whose logs contain a thirteenth month.

## 🤔 New Questions This Raises

1. What does a serialized Claude Code system prompt actually measure with the full ECC catalog installed — and how far does the guided selective profile cut it?
2. If ECC wrote a `SKILL-CATALOG-POLICY.md` with the same two-part test as its connector policy, how many of the 286 skills would survive as defaults?
3. What is the wall-clock cost distribution of 23 `node -e` hook bootstraps per session on a cold plugin cache?

## References

**Primary (pinned to commit 22e8cf01 unless noted)**

- [affaan-m/ECC repository](https://github.com/affaan-m/ECC)
- [README.md](https://github.com/affaan-m/ECC/blob/22e8cf01d0b54719b3a49002fab2ccbda4ff5b9e/README.md)
- [docs/MCP-CONNECTOR-POLICY.md](https://github.com/affaan-m/ECC/blob/22e8cf01d0b54719b3a49002fab2ccbda4ff5b9e/docs/MCP-CONNECTOR-POLICY.md)
- [hooks/hooks.json](https://github.com/affaan-m/ECC/blob/22e8cf01d0b54719b3a49002fab2ccbda4ff5b9e/hooks/hooks.json)
- [CHANGELOG.md](https://github.com/affaan-m/ECC/blob/22e8cf01d0b54719b3a49002fab2ccbda4ff5b9e/CHANGELOG.md)
- [the-shortform-guide.md](https://github.com/affaan-m/ECC/blob/22e8cf01d0b54719b3a49002fab2ccbda4ff5b9e/the-shortform-guide.md)
- [the-longform-guide.md](https://github.com/affaan-m/ECC/blob/22e8cf01d0b54719b3a49002fab2ccbda4ff5b9e/the-longform-guide.md)
- [the-security-guide.md](https://github.com/affaan-m/ECC/blob/22e8cf01d0b54719b3a49002fab2ccbda4ff5b9e/the-security-guide.md)
- [GitHub API: repos/affaan-m/ECC](https://api.github.com/repos/affaan-m/ECC) (retrieved 2026-09-04 KST)

**Secondary**

- [GitHub Trending](https://github.com/trending) (retrieved 2026-09-04 KST)
- [ecc.tools](https://ecc.tools)

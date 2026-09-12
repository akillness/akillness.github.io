---
title: "Gensee Crate's Defense Rate Is the One Number You Cannot Recount"
description: "Recount audit of gensee-crate at 0a47b53c: its sealed traces reproduce to the item, while the front-page AgentCanary defense-rate chart ships without N, config, or raw results."
categories: [AI, Agents]
tags: [ai-agents, harness-engineering, trust-boundaries, open-source]
date: 2026-09-13 00:15:41 +0900
mermaid: false
math: false
image:
  path: /assets/img/posts/2026-09-13-gensee-crate-evidence-tier-audit/evidence-tier-ladder.svg
  alt: "Three evidence tiers inside GenseeAI/gensee-crate at commit 0a47b53c: a security-trace corpus that recounts to the item with all checksums passing, a feature-gated latency benchmark that hedges its own snapshot, and a front-page AgentCanary defense-rate chart that exists only as a PNG with no sample size, config, or raw results in the tree"
---

![Three evidence tiers inside gensee-crate at commit 0a47b53c: sealed traces that recount exactly, a self-hedged latency bench, and a defense-rate chart that ships only as a PNG](/assets/img/posts/2026-09-13-gensee-crate-evidence-tier-audit/evidence-tier-ladder.svg)

> **Editorial method:** This Source Audit was researched and drafted with AI assistance under an evidence-gated editorial harness; every claim was verified against the pinned commit 0a47b53c before publication.

## 🤔 Curiosity: Which of a safety vendor's numbers can you actually check?

[Gensee Crate](https://github.com/GenseeAI/gensee-crate/tree/0a47b53c4a05fe8af3fa6ecc8099507093fac973) is an open-source "safety and control layer for autonomous AI" from GenseeAI, a UCSD-research-backed team. It wraps coding-agent harnesses — Codex, Claude Code, Cursor, Copilot, Antigravity, Omnigent — with policy hooks, scope-drift detection, recovery points, and a review queue. The repository is Apache-2.0, created 2026-06-23, badged `status: alpha`, and carried 124 stars with a last push on 2026-09-07 at retrieval.

Its README front page leads with a benchmark: "Preliminary AgentCanary results show Gensee Crate improving defense rate across memory-poisoning, long-horizon, and prompt-injection threat types with low runtime overhead." The same tree also ships something far rarer: two sealed security-trace datasets totaling more than 150,000 events, with per-file checksums, schemas, redaction ledgers, and offline replay tools.

That combination invites a specific question: **for each number this repository presents, can a stranger recompute it from what ships?** I pinned the tree at commit `0a47b53c` and tried. The answer splits the repo into three tiers — and the number on the front page sits alone in the weakest one.

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-13-gensee-crate-evidence-tier-audit/references/personal-overview.png" alt="Gensee Crate Personal overview dashboard in synthetic-demo mode: to-review, scope-drift, blocked-action, and clean-history counters, an activity timeline, alert severity breakdown, and recent security findings under synthetic demo AcmeShop paths">
  <figcaption>Gensee Crate Personal's overview dashboard in its synthetic-demo mode; findings, severities, and recovery points are the product surface whose effectiveness the front-page chart claims to quantify &mdash; Image from GenseeAI/gensee-crate (Apache-2.0), commit 0a47b53c. Source: <a href="https://github.com/GenseeAI/gensee-crate/blob/0a47b53c4a05fe8af3fa6ecc8099507093fac973/README.md">https://github.com/GenseeAI/gensee-crate/blob/0a47b53c4a05fe8af3fa6ecc8099507093fac973/README.md</a>. Publisher: GenseeAI (GenseeAI/gensee-crate). Licence: <a href="https://github.com/GenseeAI/gensee-crate/blob/0a47b53c4a05fe8af3fa6ecc8099507093fac973/LICENSE">Apache-2.0</a>.</figcaption>
</figure>

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-13-gensee-crate-evidence-tier-audit/references/personal-review-queue.png" alt="Gensee Crate Personal Review Queue in synthetic-demo mode: a Claude request flagged for scope drift with tool-call, files-touched, and outside-intent counts, a recovery point, and grouped findings including a release-workflow change outside declared tool intent">
  <figcaption>The Review Queue groups a flagged Claude request with its tool-call, files-touched, and outside-intent counts and a recovery point; scope-drift detection is one of the surfaces the benchmark chart summarizes &mdash; Image from GenseeAI/gensee-crate (Apache-2.0), commit 0a47b53c. Source: <a href="https://github.com/GenseeAI/gensee-crate/blob/0a47b53c4a05fe8af3fa6ecc8099507093fac973/README.md">https://github.com/GenseeAI/gensee-crate/blob/0a47b53c4a05fe8af3fa6ecc8099507093fac973/README.md</a>. Publisher: GenseeAI (GenseeAI/gensee-crate). Licence: <a href="https://github.com/GenseeAI/gensee-crate/blob/0a47b53c4a05fe8af3fa6ecc8099507093fac973/LICENSE">Apache-2.0</a>.</figcaption>
</figure>

## 📚 Retrieve: Recounting every number in the tree

I audited the pinned tree through a shallow clone at `0a47b53c`, the GitHub API, the AgentCanary paper's v1 HTML, and the pinned upstream benchmark repository at `5072b782`. Every quote carries its file coordinate.

### Tier 1: a trace corpus that survives a hostile recount

The `security-traces/` directory publishes two datasets from a controlled experiment in autonomous-agent boundary crossing: eight Codex/GPT-5.6 Sol trials in two four-lane cohorts, one asking whether an agent with a legitimate objective discovers that an allowed inference gateway carries more authority than the task needs, the other doing the same for a deliberately vulnerable package service. The release README claims "**eight GPT-5.6 Sol/Codex trials in two four-lane cohorts**, with **154,475 normalized runtime/service events** and **3,919 retained model-interaction items**".

I recounted all of it:

| Claim | Recount at `0a47b53c` | Result |
|---|---|---|
| 8 trials, 2 cohorts | 4 trial dirs per dataset, 2 datasets | exact |
| 3,919 model-interaction items | `wc` over all 8 `model-interactions.jsonl` = 3,919 | exact |
| dataset-1 manifest counts | counts sum 33,635 = tree line count | exact |
| dataset-2 `runtime_event_count` | 122,337 = tree line count | exact |
| 154,475 runtime/service events | uniform raw-file method gives 154,471 | see below |
| checksums | `shasum -c`: 75/75 OK and 88/88 OK | exact |

The one imperfection is instructive rather than damning: 154,475 is reproducible only as dataset 1's *derived* unified-timeline line count (32,138) plus dataset 2's *raw* runtime count (122,337). Counting both datasets the same way yields 154,471 — a four-event, 0.003% derivation-mixing difference. Every constituent number reproduces exactly.

The corpus is also epistemically disciplined about what it does *not* show. The release README states that "Gensee and Tclone were deliberately **observe-only**: they recorded activity but did not block, warn, ask for approval, fork, lease capabilities, or redirect an action. These traces therefore measure behavior, observability, correlation, and replay—not active-defense effectiveness." And the package-service dataset's Limitations section warns, verbatim: "One positive among four trials is not an attack-rate or defense-rate estimate."

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-13-gensee-crate-evidence-tier-audit/references/trace-model-tool-command-activity.png" alt="Small-multiple charts of reasoning items, tool calls, and commands in five-minute bins for all eight trace trials, Gateway 1-4 and Package 1-4, with boundary-effect markers on Gateway 4 and Package 3">
  <figcaption>Reasoning-item, tool-call, and command activity for all eight trials in five-minute bins &mdash; the analysis charts ship next to the raw JSONL they were derived from &mdash; Image from GenseeAI/gensee-crate (Apache-2.0), commit 0a47b53c. Source: <a href="https://github.com/GenseeAI/gensee-crate/blob/0a47b53c4a05fe8af3fa6ecc8099507093fac973/security-traces/README.md">https://github.com/GenseeAI/gensee-crate/blob/0a47b53c4a05fe8af3fa6ecc8099507093fac973/security-traces/README.md</a>. Publisher: GenseeAI (GenseeAI/gensee-crate). Licence: <a href="https://github.com/GenseeAI/gensee-crate/blob/0a47b53c4a05fe8af3fa6ecc8099507093fac973/LICENSE">Apache-2.0</a>.</figcaption>
</figure>

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-13-gensee-crate-evidence-tier-audit/references/trace-trusted-service-activity.png" alt="Small-multiple charts of inference-service, package-service, origin-service, and provider-effect records per five minutes for all eight trace trials, showing the provider-effect spike at Gateway 4's boundary crossing and the package-service surge in Package 3">
  <figcaption>Trusted-service activity across the same eight trials: the provider-effect spike in Gateway 4 and the package-service surge in Package 3 are the two boundary crossings the ground truth records &mdash; Image from GenseeAI/gensee-crate (Apache-2.0), commit 0a47b53c. Source: <a href="https://github.com/GenseeAI/gensee-crate/blob/0a47b53c4a05fe8af3fa6ecc8099507093fac973/security-traces/README.md">https://github.com/GenseeAI/gensee-crate/blob/0a47b53c4a05fe8af3fa6ecc8099507093fac973/security-traces/README.md</a>. Publisher: GenseeAI (GenseeAI/gensee-crate). Licence: <a href="https://github.com/GenseeAI/gensee-crate/blob/0a47b53c4a05fe8af3fa6ecc8099507093fac973/LICENSE">Apache-2.0</a>.</figcaption>
</figure>

### Tier 2: a latency bench that polices its own quotability

The `bench/` directory measures the in-process latency the `PreToolUse` hook adds per decision. The harness "lives behind the `bench` Cargo feature and is **not compiled** into a default (production) build", the methodology section explains the no-op floor and request-mix weighting, and the snapshot table (p50 10µs with Gensee, 0.9µs without) closes with its own disclaimer: "Run on the target VM before quoting numbers externally; this snapshot is a warm-cache dev-laptop figure."

A reader can rebuild with `--features bench` and rerun everything. Middle tier: shipped code, honest snapshot, self-imposed quoting rule.

### Tier 3: the front-page number

The "Benchmark results" section of the README consists of two sentences and one image, `docs/images/preliminary-agentcanary-benchmark.png`. The chart reports three baseline-versus-with-Gensee pairs — memory poisoning 75%→93.8% (+18.8 pt), long-horizon tasks 65.4%→100% (+34.6 pt), prompt injection 77.8%→93.5% (+15.7 pt) — a runtime-overhead panel of 0.6%–1.2% (10ms–400ms per request), and one footnote: "Results tested on MacOS running Claude Code with Qwen-3.5-397B model."

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-13-gensee-crate-evidence-tier-audit/references/agentcanary-benchmark-chart.png" alt="Gensee Crate's preliminary AgentCanary benchmark chart: three baseline-versus-with-Gensee defense-rate pairs (memory poisoning 75 to 93.8 percent, long-horizon tasks 65.4 to 100 percent, prompt injection 77.8 to 93.5 percent), a 0.6 to 1.2 percent runtime-overhead panel, and a footnote naming macOS, Claude Code, and Qwen-3.5-397B">
  <figcaption>The entire in-repo evidentiary basis of the front-page defense-rate claim: one 1600&#215;862 PNG &mdash; Image from GenseeAI/gensee-crate (Apache-2.0), commit 0a47b53c. Source: <a href="https://github.com/GenseeAI/gensee-crate/blob/0a47b53c4a05fe8af3fa6ecc8099507093fac973/docs/images/preliminary-agentcanary-benchmark.png">https://github.com/GenseeAI/gensee-crate/blob/0a47b53c4a05fe8af3fa6ecc8099507093fac973/docs/images/preliminary-agentcanary-benchmark.png</a>. Publisher: GenseeAI (GenseeAI/gensee-crate). Licence: <a href="https://github.com/GenseeAI/gensee-crate/blob/0a47b53c4a05fe8af3fa6ecc8099507093fac973/LICENSE">Apache-2.0</a>.</figcaption>
</figure>

What else does the tree hold about this experiment? I ran a case-insensitive search for `agentcanary` over the full clone (all file types, `.git/` excluded). It matches exactly three tracked files: the README sentence, one doc comment in `policy_eval.rs`, and one test comment in `tests.rs`. At the pinned commit there is no AgentCanary harness configuration, no task selection, no sample size, no upstream version pin, no judge configuration, and no raw result file. The image is the artifact.

The missing sample size matters most. 93.8% and 18.8-point lifts read as precise, but without N you cannot tell whether "+34.6 pt to 100%" summarizes two hundred trials or thirteen. The repo's own trace release shows the team knows this failure mode — its Limitations line about four trials not being "an attack-rate or defense-rate estimate" articulates exactly the standard the front page skips.

### What AgentCanary actually is — and what its paper says

AgentCanary is not Gensee's benchmark. It is Ant Group's [Agent3σ-Canary](https://github.com/antgroup/Agent3Sigma-Canary) ("abbreviated as AgentCanary"), an Apache-2.0 security-evaluation framework with paper [arXiv 2606.10484](https://arxiv.org/abs/2606.10484). That provenance cuts both ways. Choosing a public third-party benchmark is more credible than inventing one. But it also makes the reporting checkable against the upstream contract, and three mismatches surface:

1. **The evaluation environment is undocumented upstream.** The pinned upstream README builds six Docker evaluation images — vanilla OpenClaw, three OpenClaw-plus-defense-plugin variants, Hermes, and NanoClaw — and contains zero occurrences of "Claude Code"; Claude appears only as a target model id. Gensee's footnoted setup, Claude Code on macOS, is therefore a custom adaptation whose harness wiring is published nowhere I could find. Upstream does invite framework adapters, so the adaptation is legitimate — just unverifiable.
2. **"Defense rate" is not a paper metric.** The v1 full text defines OSS, SAS, and TUS scores and UOR, SAR, and TSR rates; the phrase "defense rate" appears zero times. It plausibly means 1&#8722;(unsafe-outcome rate), but the chart never says, and the choice of aggregation can move results.
3. **The paper's own defense evaluation models the caution the chart omits.** Section 7.11 benchmarks three runtime defenses and reports net regressions — "Shield reduces GLM-5's overall score (61.6 to 60.8)" — concluding that "a runtime defense must be validated on the target model and workload rather than assumed beneficial." One model (the paper's twelve-model roster includes Qwen3.5-397B-A17B, the model family the footnote names) on one harness is a data point, not a threat-type-wide defense rate. The paper also shows defenses often buy safety with task utility — Shield cuts one unsafe-outcome rate from 9.4% to 5.0% while dropping task success from 96.1% to 85.1% — a trade-off dimension the chart does not report at all.

To be fair about the label: every occurrence of the claim says "preliminary" — the README, the launch blog, and the marketing site, which files it under "Early benchmark signal". The public FAQ states the product page "reports the latest tested rates and notes the local test setup used for those results"; that one-line footnote *is* the documented setup. And `CONTRIBUTING.md` bans committing "generated benchmark results", so raw outputs structurally cannot live in this tree — though that rule doesn't explain the absent config, task manifest, or sample size, and the team's own trace datasets demonstrate they know how to publish sealed data releases when they choose to.

### The detector shaped like the benchmark

The tree's most interesting AgentCanary artifact is not a result file. It is the shipped memory-poisoning detector in `policy_eval.rs`. `content_has_poison` lowercases the content and matches a 28-entry literal-substring list — "ignore safety", "reverse shell", "exfiltrat", "backdoor" — plus one structural check, and its doc comment says the quiet part plainly: beyond the literal markers, it "flags the trigger->action structure (\"whenever ... you must/automatically ...\") that the AgentCanary memory-poisoning corpus uses." The unit test annotates the same assertion "Trigger->action structure (the AgentCanary corpus shape)."

Writing detections for known attack shapes is legitimate defense engineering, and substring matching is only one layer of what ships (the same file scans auto-loaded memory files at prompt-submit time precisely because tool-gating cannot see them). But when the front page's memory-poisoning lift is measured on the very corpus whose shape the detector names in its own comment, the number stops measuring generalization. A paraphrased trigger — "each time" instead of "whenever", a marker synonym the list lacks — sits outside the literal patterns by construction. An 18.8-point lift on corpus-shaped inputs is compatible with both a robust semantic defense and a regex fitted to the test. Nothing in the tree lets a reader tell which.

<figure class="source-image">
  <img src="/assets/img/posts/2026-09-13-gensee-crate-evidence-tier-audit/references/personal-config-audit.png" alt="Gensee Crate Personal Codex configuration audit screen: 18 findings with 10 critical-plus-high, configuration-drift banner, and repeated high-severity 'command rule grants a broad approval exception' findings with redacted rule evidence">
  <figcaption>The configuration audit reviews agent config statically &mdash; the same product family whose memory-poison scanner names the AgentCanary corpus shape in its doc comment &mdash; Image from GenseeAI/gensee-crate (Apache-2.0), commit 0a47b53c. Source: <a href="https://github.com/GenseeAI/gensee-crate/blob/0a47b53c4a05fe8af3fa6ecc8099507093fac973/README.md">https://github.com/GenseeAI/gensee-crate/blob/0a47b53c4a05fe8af3fa6ecc8099507093fac973/README.md</a>. Publisher: GenseeAI (GenseeAI/gensee-crate). Licence: <a href="https://github.com/GenseeAI/gensee-crate/blob/0a47b53c4a05fe8af3fa6ecc8099507093fac973/LICENSE">Apache-2.0</a>.</figcaption>
</figure>

## 💡 Innovation: The recount test

The useful output of this audit is not "gensee-crate bad." The trace corpus is among the most verifiable security data releases I have audited in this series, and the same repository demonstrates evidence discipline three separate ways. The useful output is a test you can run against any security vendor's repo in under an hour:

**For each number the project presents, ask: can a stranger recompute it from what ships?**

- **Tier 1 — recountable**: raw data + manifests + checksums. Gensee's traces pass to the item: 3,919 claimed, 3,919 counted, 163/163 checksums OK.
- **Tier 2 — rerunnable**: harness + methodology + self-scoped snapshot. Gensee's latency bench passes: the code ships, and the README refuses its own numbers until you rerun them on target hardware.
- **Tier 3 — asserted**: a chart. No N, no config, no raw output, and a metric name the upstream benchmark's paper never defines.

Three repairs would promote Gensee's chart a full tier without revealing anything sensitive, using machinery the repo already has: publish the harness adaptation and task manifest the way `security-traces/` publishes methodology; state N and the AgentCanary commit the way the trace manifests pin cohorts; and release per-task scored outputs the way the traces release per-trial JSONL under checksums. The asymmetry, not the preliminary label, is the finding: **the least substantiated number in the repository is the one at the top of the README — and the repository's own trace-release standards are the measuring stick that shows it.**

There is also a general lesson about benchmark-coupled defenses. AgentCanary's paper positions itself as infrastructure for exactly this comparison, and its §7.11 shows defenses regressing on some models. When a vendor both tunes a detector to a public corpus's shape (documented in its own code comments) and reports its lift on that corpus, the reported number needs a held-out complement before it means what readers will take it to mean. If you found this failure family familiar: I hit its research-product variant in [Open Science's leaderboard badge](/posts/open-science-provenance-audit/), and its enforcement-wiring variant in [SkillHub's scanner](/posts/skillhub-observer-scanner-audit/).

For a next step on this exact pattern, read my audit of [Open Science's provenance engine rejecting its own #1 badge](/posts/open-science-provenance-audit/) — it audits the same failure family in a research product: a benchmark claim published without runnable artifacts, resolved by tracing the vendor's own blog admission.

## 🎯 Key Takeaways

- **Recount before you trust**: gensee-crate's trace corpus reproduces to the item (3,919 model items exact; every per-dataset count byte-exact; 75/75 and 88/88 checksums OK), which is what a checkable security data release looks like.
- **The front-page defense-rate chart is a Tier-3 artifact at `0a47b53c`**: a case-insensitive tree-wide grep finds no AgentCanary config, task list, sample size, upstream pin, or raw output — the PNG is the entire in-repo basis for 93.8%, 100%, and 93.5%.
- **The reporting doesn't match the upstream contract**: "defense rate", "Claude Code", and "macOS" each appear zero times in the AgentCanary v1 paper text, whose own defense evaluation (§7.11) warns that runtime defenses must be validated per model and workload and sometimes regress.
- **The shipped memory-poison detector names the benchmark corpus in its own comment** — a literal-substring list plus a trigger→action check "that the AgentCanary memory-poisoning corpus uses" — so the chart's memory-poisoning lift cannot be read as generalization evidence.
- **The repo's own standards are the sharpest critique**: its trace dataset warns that "one positive among four trials is not an attack-rate or defense-rate estimate," a sentence the front page has not yet applied to itself.

## 🤔 New Questions This Raises

- What is the minimal disclosure that makes a vendor-run benchmark number auditable — is N + benchmark commit + task manifest + scored outputs enough, and should that quartet become a README convention the way badges are?
- When a defense tunes to a public corpus's shape, what held-out complement would demonstrate generalization — paraphrase-mutated corpora, a second benchmark family, or adversarial rewrites of the same tasks?
- AgentCanary's paper reports safety-utility trade-offs for every defense it evaluated; would Gensee's task-utility delta under the same tasks be as favorable as its defense delta?
- How many other agent-security vendors cite AgentCanary numbers today, and do any publish their harness adaptations?

## Limitations

This is a static audit of the pinned commit `0a47b53c` (retrieved 2026-09-12): I recounted the shipped datasets, verified checksums, and read the detector, bench, and docs, but did not run AgentCanary against Gensee Crate myself, so I make no claim about what a properly disclosed evaluation would show — the chart's numbers may well replicate. Zero-hit statements are scoped: the `agentcanary` grep covers the pinned working tree excluding `.git/`; the "defense rate"/"Claude Code"/"macOS" scans cover the arXiv v1 HTML as fetched; raw results may exist privately, and `CONTRIBUTING.md` explicitly bans committing them. The substring detector is one layer of a multi-surface product whose macOS Endpoint Security, Linux fanotify, and tclone enforcement paths I did not audit here. Gensee labels the benchmark preliminary everywhere it appears, the site files it under "Early benchmark signal", and the README hedges its enforcement claims ("Enforcement depends on the integration and execution environment"). Star counts and live-page wording are retrieval-time observations; a later commit or a methodology post could change the picture, and I would welcome exactly that.

## References

### Primary sources (pinned at `0a47b53c`)

- [GenseeAI/gensee-crate @ 0a47b53c](https://github.com/GenseeAI/gensee-crate/tree/0a47b53c4a05fe8af3fa6ecc8099507093fac973) — audited tree
- [README.md](https://github.com/GenseeAI/gensee-crate/blob/0a47b53c4a05fe8af3fa6ecc8099507093fac973/README.md) — benchmark claim + hedges
- [docs/images/preliminary-agentcanary-benchmark.png](https://github.com/GenseeAI/gensee-crate/blob/0a47b53c4a05fe8af3fa6ecc8099507093fac973/docs/images/preliminary-agentcanary-benchmark.png) — the chart
- [security-traces/README.md](https://github.com/GenseeAI/gensee-crate/blob/0a47b53c4a05fe8af3fa6ecc8099507093fac973/security-traces/README.md) — corpus claims, observe-only scope
- [security-traces (both v1 datasets)](https://github.com/GenseeAI/gensee-crate/tree/0a47b53c4a05fe8af3fa6ecc8099507093fac973/security-traces) — recount + checksum scope
- [package-service v1 README.md](https://github.com/GenseeAI/gensee-crate/blob/0a47b53c4a05fe8af3fa6ecc8099507093fac973/security-traces/autonomous-ai-package-service-boundary-escape/v1/README.md) — the defense-rate limitation line
- [crate/gensee-crate-cli/src/policy_eval.rs](https://github.com/GenseeAI/gensee-crate/blob/0a47b53c4a05fe8af3fa6ecc8099507093fac973/crate/gensee-crate-cli/src/policy_eval.rs) — corpus-shaped detector
- [crate/gensee-crate-cli/src/tests.rs](https://github.com/GenseeAI/gensee-crate/blob/0a47b53c4a05fe8af3fa6ecc8099507093fac973/crate/gensee-crate-cli/src/tests.rs) — corpus-shape test comment
- [bench/README.md](https://github.com/GenseeAI/gensee-crate/blob/0a47b53c4a05fe8af3fa6ecc8099507093fac973/bench/README.md) — latency-bench discipline
- [CONTRIBUTING.md](https://github.com/GenseeAI/gensee-crate/blob/0a47b53c4a05fe8af3fa6ecc8099507093fac973/CONTRIBUTING.md) — benchmark-result commit ban

### Upstream benchmark

- [antgroup/Agent3Sigma-Canary @ 5072b782](https://github.com/antgroup/Agent3Sigma-Canary/blob/5072b78260d6dfe16f28a479ae83db4ef5c86bce/README.md) — supported evaluation images
- [arXiv 2606.10484 (AgentCanary)](https://arxiv.org/abs/2606.10484) — paper; metrics and §7.11 defense evaluation from the [v1 HTML](https://arxiv.org/html/2606.10484v1)

### Vendor pages (live, read 2026-09-12)

- [Gensee Crate FAQ](https://www.gensee.ai/crate-faq.html) — disclosure scope
- [Open-Sourcing Gensee Crate (2026-06-29)](https://www.gensee.ai/blogs/blog-introducing-gensee-crate.html) — chart provenance
- [GitHub API: GenseeAI/gensee-crate](https://api.github.com/repos/GenseeAI/gensee-crate) — repo metadata at retrieval

### Related on this site

- [Open Science's Provenance Engine Would Reject Its Own #1 Badge](/posts/open-science-provenance-audit/)
- [SkillHub's Security Scanner Blocks on Crash, Not on Verdict](/posts/skillhub-observer-scanner-audit/)
- [MetaHarness Advertises Witness Signing Its Bridges Never Export](/posts/metaharness-witness-reachability-audit/)

---
title: "In my rerun, Headroom saved 0 tokens on its GSM8K eval prompts"
description: "A Source Audit of Headroom v0.39.1: its seeded savings table reproduces, but in my rerun its own GSM8K and TruthfulQA eval requests passed through unchanged."
categories: [AI, Agents]
tags: [ai-agents, context-engineering, benchmarks, evaluation, mcp, open-source]
date: 2026-10-03 00:42:50 +0900
mermaid: false
math: false
image:
  path: /assets/img/posts/2026-10-03-headroom-gsm8k-prompts-saved-zero-tokens/headroom-proxy-tokens-forwarded.svg
  alt: "Original bar chart: three benchmark-shaped requests keep the same token count through the default Headroom proxy, while a JSON tool-result control drops from 4,844 to 2,863 tokens"
---

> **Editorial method:** This Source Audit was researched and drafted with AI assistance under a policy-bound evidence harness; the reruns used a local stub instead of OpenAI, and I have not run Headroom on production agent traffic.

## 🤔 Curiosity: What does Headroom's accuracy table actually test?

[Headroom](https://github.com/headroomlabs-ai/headroom) calls itself the context compression layer for AI agents, and it ships as a library, a proxy, and an MCP server. It is an Apache-2.0 repository created on January 7, 2026, and it had **74,273 GitHub stars** when I pulled its metadata for this audit. Its GitHub description promises 20% fewer tokens for coding agents, 60-95% fewer for JSON, and **"same answers."** In my [TypeSafe routing audit](/posts/typesafe-routing-verdict-hinges-on-price-ratio/) Headroom appeared only as an appendix tool, and I wrote that its savings claims had not been rerun. This post does the rerun.

A compressor makes two promises. The first is that it removes tokens. The second, and the one that matters before you put it in front of an agent, is that removing them does not change the answers. The README backs the second promise with an accuracy table headed by one command, `python -m headroom.evals suite --tier 1`, and four rows: GSM8K, TruthfulQA, SQuAD v2, and BFCL.

So my question was narrow:

> **When Headroom reports "no accuracy loss" on GSM8K, how many tokens did it remove from those prompts?**

The answer from my rerun is zero. The token-savings table reproduces to the last token. But when I replayed the GSM8K and TruthfulQA requests that Headroom's own eval command generates, the default proxy forwarded them unchanged.

## 📚 Retrieve: What the pinned repository and three reruns show

I pinned the audit to release tag [`v0.39.1`](https://github.com/headroomlabs-ai/headroom/tree/d13e1966f820220b482a33c30bde1e926743939a), commit `d13e1966`, committed on September 26, 2026. Its `pyproject.toml` declares version 0.39.1, the same version as the `headroom-ai` 0.39.1 wheel I installed from PyPI. I read the README, the evaluation package, the evaluation workflow, the Benchmarks docs page, and the wiki at that tag, then ran three local experiments on macOS (Apple silicon) with Python 3.11.

### Rerun 1: the savings table reproduces exactly

The README's Proof section says four scenarios were built from real MCP server output formats and measured with the provider tokenizer and the shipped `compress()`. It adds that the run is seeded and offline, "so you get the same numbers we did", and gives the command `index_proof_table.py --seed 20260902`.

I ran that script from the tag against the installed wheel. Every number matched the README and the committed results file:

| Scenario | Before | After | Saved |
|---|---:|---:|---:|
| Code search (100 results) | 17,199 | 13,597 | 21% |
| SRE incident debugging | 55,957 | 24,340 | 57% |
| Codebase exploration | 58,801 | 33,895 | 42% |
| GitHub issue triage | 46,067 | 32,429 | 30% |
| **Total** | **178,024** | **104,261** | **41%** |

That is a good result for the project. The scenarios are synthetic generators, so this proves reproducibility of the token arithmetic, not answer quality. The README is also candid about where savings come from: it says **savings scale with how repetitive the payload is**, and that prose and already-dense output compress very little. Keep that sentence in mind, because it explains everything that follows.

<figure class="source-image">
  <img src="/assets/img/posts/2026-10-03-headroom-gsm8k-prompts-saved-zero-tokens/references/headroom-dashboard-compression-quality.png" alt="Headroom v0.3.0 dashboard session showing 143.0k tokens saved, a Compression Quality card reading High, and a What Headroom Removed panel split into JSON Bloat and Repetition">
  <figcaption>The dashboard attributes removed tokens to JSON bloat and repetition, and its Compression Quality card says 100% of removed tokens were identified waste; it is a waste measure, not an answer check. Source: <a href="https://github.com/headroomlabs-ai/headroom/blob/d13e1966f820220b482a33c30bde1e926743939a/wiki/screenshots/cache-ttl-dashboard-live.png">https://github.com/headroomlabs-ai/headroom/blob/d13e1966f820220b482a33c30bde1e926743939a/wiki/screenshots/cache-ttl-dashboard-live.png</a>. Publisher/creator: headroomlabs-ai/headroom contributors. License: <a href="https://raw.githubusercontent.com/headroomlabs-ai/headroom/d13e1966f820220b482a33c30bde1e926743939a/LICENSE">https://raw.githubusercontent.com/headroomlabs-ai/headroom/d13e1966f820220b482a33c30bde1e926743939a/LICENSE</a>. Attribution: headroomlabs-ai/headroom contributors, wiki/screenshots/cache-ttl-dashboard-live.png, Apache License 2.0, pinned at tag v0.39.1 (d13e1966).</figcaption>
</figure>

### The accuracy table has two kinds of rows

The README's accuracy table reads:

| Benchmark | N | Baseline | Headroom | Delta |
|---|---:|---:|---:|---|
| GSM8K | 100 | 0.870 | 0.870 | ±0.000 |
| TruthfulQA | 100 | 0.530 | 0.560 | +0.030 |
| SQuAD v2 | 100 | — | 97% | at 19% compression |
| BFCL | 100 | — | 97% | at 32% compression |

Two rows carry a compression figure. GSM8K and TruthfulQA do not. The evals README goes further and places those two rows under the heading **Standard Benchmarks — "No Accuracy Loss"**, with the model stated as `gpt-4o-mini`. To its credit, the main README says the TruthfulQA delta falls inside the confidence interval at N=100, so it does not claim an improvement.

The code shows why the columns differ. The tier-1 suite in `suite_runner.py` defines **nine benchmarks**: GSM8K, TruthfulQA, MMLU, ARC-Challenge, and HumanEval go through an `lm_eval` runner; SQuAD v2, BFCL, and Tool Outputs go through a `before_after` runner; and CCR Round-trip is compression-only. The README shows four of the nine. The `lm_eval` path returns only a baseline score, a Headroom score, a delta, a pass flag, and a sample count. The `before_after` path also returns `avg_compression_ratio` and tokens saved. In other words, **the suite records no compression measurement for GSM8K or TruthfulQA at all**. Even the evals README's own tier table describes SQuAD v2 as "reading comprehension with compression" and BFCL as "function calling with compressed schemas", while GSM8K is just "math reasoning accuracy".

The pass rule for the `lm_eval` rows is that the Headroom score is within 0.02 of baseline. The Headroom side runs lm-eval with `--apply_chat_template` as a `local-chat-completions` model pointed at the proxy's `/v1/chat/completions`, and when the suite starts its own proxy it launches `python -m headroom.proxy.server --port` with no profile arguments.

That raised a testable question: what does that default proxy do to those requests?

### Rerun 2: lm-eval with Headroom's own flags, through the default proxy

I did not want to spend an API key or guess at prompt shapes, so I put a small recording stub where OpenAI would be. Then I ran lm-eval 0.4.13 twice with Headroom's flags, once straight to the stub and once through a default Headroom 0.39.1 proxy:

```bash
# Same flags Headroom's comprehensive_benchmark.py passes to lm-eval.
# BASE_URL is either the stub directly or the Headroom proxy in front of it.
# Run once with --tasks gsm8k and once with --tasks truthfulqa_gen.
python -m lm_eval --model local-chat-completions --tasks gsm8k \
  --batch_size 1 --apply_chat_template --log_samples --limit 5 \
  --model_args "model=gpt-4o-mini,tokenizer_backend=tiktoken,base_url=$BASE_URL"
```

All **10 of 10 requests** (five GSM8K, five TruthfulQA) reached the upstream with message arrays **byte-identical** to the direct run. The GSM8K requests were 11-message, five-shot, multi-turn chats; the TruthfulQA requests were single user messages. The only change the proxy made to the body was renaming `max_tokens` to `max_completion_tokens`.

### Rerun 3: the proxy's own counters, with a positive control

Identical bytes could also mean my setup was broken, so I replayed real GSM8K rows from Hugging Face as one long user message and as a multi-turn chat, a real TruthfulQA row as one user message, and a control the README says Headroom is good at: a tool result holding a 100-item JSON array. I read the proxy's `x-headroom-*` response headers.

![Original bar chart: three benchmark-shaped requests keep the same token count through the default Headroom proxy, while a JSON tool-result control drops from 4,844 to 2,863 tokens](/assets/img/posts/2026-10-03-headroom-gsm8k-prompts-saved-zero-tokens/headroom-proxy-tokens-forwarded.svg)

The GSM8K requests reported 643 and 679 tokens before and after, with **0 saved**. The TruthfulQA request reported 59 before and after. The control went from **4,844 to 2,863 tokens**, 1,981 saved, through `router:smart_crusher:0.65`. The compressor works. It just had nothing to do on these prompts, which is exactly what "prose compresses very little" predicts.

<figure class="source-image">
  <img src="/assets/img/posts/2026-10-03-headroom-gsm8k-prompts-saved-zero-tokens/references/headroom-dashboard-zero-tokens-saved.png" alt="Headroom v0.6.0 dashboard after 42 processed requests showing 0 tokens saved and Compression Quality reading No compression yet">
  <figcaption>Headroom's own docs screenshot of a proxy that processed 42 requests and saved 0 tokens. Passing traffic through the proxy is not the same as compressing it. Source: <a href="https://github.com/headroomlabs-ai/headroom/blob/d13e1966f820220b482a33c30bde1e926743939a/docs/screenshots/subscription_window_inactive.png">https://github.com/headroomlabs-ai/headroom/blob/d13e1966f820220b482a33c30bde1e926743939a/docs/screenshots/subscription_window_inactive.png</a>. Publisher/creator: headroomlabs-ai/headroom contributors. License: <a href="https://raw.githubusercontent.com/headroomlabs-ai/headroom/d13e1966f820220b482a33c30bde1e926743939a/LICENSE">https://raw.githubusercontent.com/headroomlabs-ai/headroom/d13e1966f820220b482a33c30bde1e926743939a/LICENSE</a>. Attribution: headroomlabs-ai/headroom contributors, docs/screenshots/subscription_window_inactive.png, Apache License 2.0, pinned at tag v0.39.1 (d13e1966).</figcaption>
</figure>

### Headroom already has the right rule; it just is not applied to the README

The most useful line in the repository is in `.github/workflows/eval.yml`. Its HotpotQA recall step warns that when **compression did not engage (about 0%), recall is not a meaningful fidelity signal**. That is precisely the condition my reruns found for GSM8K and TruthfulQA.

The same workflow shows that the public repository's default CI does not regenerate the table while that secret is unset. A comment says `OPENAI_API_KEY` is intentionally not set in the public OSS repo, and the weekly Tier 1 job writes a skipped report and exits when the key is absent. The Benchmarks page that the README links as "Methodology" contains no mention of GSM8K or TruthfulQA, even though it states that every number on it is measured locally and reproducible. It also says plainly that no committed result artifact exists for its LLM-judged QA comparison.

One more drift is worth knowing about. At the same tag, `wiki/index.md` still shows an older table for the same four scenario names with different figures, for example code search at 17,765 to 1,408 tokens (92%) instead of 21%, and it puts "0.000 delta" for GSM8K in a column labelled Compression. If you cite Headroom numbers, cite the README Proof table, which is the one that reproduces.

<figure class="source-image">
  <img src="/assets/img/posts/2026-10-03-headroom-gsm8k-prompts-saved-zero-tokens/references/headroom-dashboard-subscription-window.png" alt="Headroom v0.6.0 dashboard showing 3.6M tokens saved at 41.7 percent and a Compression Quality card reading No waste signals detected">
  <figcaption>In this screenshot, savings are reported in tokens and dollars, and the Compression Quality card reports waste signals, not answers. Source: <a href="https://github.com/headroomlabs-ai/headroom/blob/d13e1966f820220b482a33c30bde1e926743939a/docs/screenshots/subscription_window_active.png">https://github.com/headroomlabs-ai/headroom/blob/d13e1966f820220b482a33c30bde1e926743939a/docs/screenshots/subscription_window_active.png</a>. Publisher/creator: headroomlabs-ai/headroom contributors. License: <a href="https://raw.githubusercontent.com/headroomlabs-ai/headroom/d13e1966f820220b482a33c30bde1e926743939a/LICENSE">https://raw.githubusercontent.com/headroomlabs-ai/headroom/d13e1966f820220b482a33c30bde1e926743939a/LICENSE</a>. Attribution: headroomlabs-ai/headroom contributors, docs/screenshots/subscription_window_active.png, Apache License 2.0, pinned at tag v0.39.1 (d13e1966).</figcaption>
</figure>

## 💡 Innovation: How to read a compression benchmark

My inference from the three reruns is this: in the configuration I reproduced, the GSM8K and TruthfulQA rows compare two runs that send the model the same messages. Their deltas therefore measure the run-to-run variation of the upstream model, not the effect of compression on answers. That is consistent with the README's own reading of the TruthfulQA +0.030 as noise. It does not mean the published run was misreported. I do not know the model version, lm-eval version, proxy profile, or environment behind the published table, and a different setup could compress these prompts.

The practical rule I would take away is Headroom's own, applied everywhere:

| Row type | Example | What it shows | Use it to decide? |
|---|---|---|---|
| Accuracy with a compression ratio | SQuAD v2, BFCL | Answers held while context shrank | Yes, if the payload resembles yours |
| Accuracy without a compression ratio | GSM8K, TruthfulQA | Scores through the proxy, with no record of how much was compressed | No: not evidence of compression fidelity |
| Token savings, seeded | Proof table | Arithmetic on synthetic scenarios | Yes for token math, not for answers |
| Project counters | community savings | Volume of tokens the fleet removed | No, it is unverified |

<figure class="source-image">
  <img src="/assets/img/posts/2026-10-03-headroom-gsm8k-prompts-saved-zero-tokens/references/headroom-community-savings-counter.png" alt="Headroom community savings screenshot reading 59.0B tokens saved, with cost saved, requests optimized, active instances, active days, and a 48-hour tokens-saved chart">
  <figcaption>The project-reported community counter (59.0B tokens saved in this screenshot) measures tokens removed across instances; I did not verify it, and it says nothing about answers. Source: <a href="https://github.com/headroomlabs-ai/headroom/blob/d13e1966f820220b482a33c30bde1e926743939a/headroom-savings.png">https://github.com/headroomlabs-ai/headroom/blob/d13e1966f820220b482a33c30bde1e926743939a/headroom-savings.png</a>. Publisher/creator: headroomlabs-ai/headroom contributors. License: <a href="https://raw.githubusercontent.com/headroomlabs-ai/headroom/d13e1966f820220b482a33c30bde1e926743939a/LICENSE">https://raw.githubusercontent.com/headroomlabs-ai/headroom/d13e1966f820220b482a33c30bde1e926743939a/LICENSE</a>. Attribution: headroomlabs-ai/headroom contributors, headroom-savings.png, Apache License 2.0, pinned at tag v0.39.1 (d13e1966).</figcaption>
</figure>

For a team evaluating Headroom on agent traffic, I would do three things before trusting it:

1. **Measure compression on your own payloads first.** The README points readers to `headroom savings` for their own traffic. If your context is mostly prose, expect little; if it is search results, logs, or JSON tool output, the control above shows real reductions.
2. **Pair every accuracy number with its compression ratio.** A fidelity check where nothing was compressed is not a fidelity result; Headroom's own HotpotQA step says the same about ~0% compression.
3. **Keep the per-request evidence.** The proxy already emits `x-headroom-tokens-before`, `-after`, and `-saved` headers, and the history view exports JSON and CSV. Logging those alongside task outcomes is a lightweight first step.

<figure class="source-image">
  <img src="/assets/img/posts/2026-10-03-headroom-gsm8k-prompts-saved-zero-tokens/references/headroom-dashboard-savings-history.png" alt="Headroom Historical Proxy Compression view with 143.0k lifetime tokens saved, two recorded checkpoints, and Export JSON and Export CSV buttons">
  <figcaption>The history view exports savings as JSON or CSV, which makes it easy to join token data with your own task-success logs. Source: <a href="https://github.com/headroomlabs-ai/headroom/blob/d13e1966f820220b482a33c30bde1e926743939a/wiki/screenshots/cache-ttl-dashboard-history.png">https://github.com/headroomlabs-ai/headroom/blob/d13e1966f820220b482a33c30bde1e926743939a/wiki/screenshots/cache-ttl-dashboard-history.png</a>. Publisher/creator: headroomlabs-ai/headroom contributors. License: <a href="https://raw.githubusercontent.com/headroomlabs-ai/headroom/d13e1966f820220b482a33c30bde1e926743939a/LICENSE">https://raw.githubusercontent.com/headroomlabs-ai/headroom/d13e1966f820220b482a33c30bde1e926743939a/LICENSE</a>. Attribution: headroomlabs-ai/headroom contributors, wiki/screenshots/cache-ttl-dashboard-history.png, Apache License 2.0, pinned at tag v0.39.1 (d13e1966).</figcaption>
</figure>

This is the same lesson I keep finding in agent benchmarks. In the [Moli audit](/posts/moli-benchmark-provenance-audit/) the question was whether one efficiency chart joined two separate runs; in the [GameDevBench audit](/posts/gamedevbench-strict-confinement-leaderboard/) it was which rows ran under the same confinement. Here it is whether a row exercised the thing being sold. For game-production pipelines, where agents read a lot of build logs and asset manifests, my expectation, which I have not measured, is that Headroom's strengths line up with the payload. The answer-quality evidence for that kind of payload is the part still to collect.

### Limitations of this audit

- I ran lm-eval with `--limit 5`, not N=100, against a stub upstream, so I measured what the proxy forwards, not model scores.
- I used the default proxy started the way the suite starts it. Other savings profiles or environment variables may behave differently, and I did not trace which internal gate declined these prompts.
- The published table's environment is undocumented, so I cannot say the same thing happened in that run. The reruns were also taken on one machine, on one day.

## 🎯 Key Takeaways

| Insight | Implication | Next step |
|---|---|---|
| The seeded Proof table reproduced exactly (178,024 to 104,261 tokens) | Headroom's token arithmetic is trustworthy and repeatable | Run `headroom savings` on your own traffic |
| In my default-proxy rerun, GSM8K and TruthfulQA eval requests passed through with 0 tokens saved | The published rows report no compression ratio, so they do not establish compression fidelity | Do not treat them as compression-fidelity evidence unless a ratio is reported |
| The suite records no compression ratio for lm-eval rows | "No Accuracy Loss" there is not evidence about compressed context | Ask for accuracy paired with compression ratio |
| Headroom's CI already flags ~0% compression as meaningless for recall | The right rule exists in the repo | Apply the same guard to the README table |

## 🤔 New Questions

- Which savings profile and proxy environment produced the published GSM8K and TruthfulQA numbers?
- Would MMLU, ARC-Challenge, or HumanEval prompts trigger compression, given that they are also short and mostly prose?
- How do SQuAD v2 and BFCL accuracy hold up at the 41% total reduction the Proof table shows for its agent scenarios, rather than at 19% and 32%?
- What does an accuracy-versus-compression curve look like on real game-build and asset-pipeline logs?

## References

**Code and implementation (pinned to v0.39.1, d13e1966):**
- [headroomlabs-ai/headroom repository at the tag](https://github.com/headroomlabs-ai/headroom/tree/d13e1966f820220b482a33c30bde1e926743939a)
- [README.md: Proof and Accuracy sections](https://github.com/headroomlabs-ai/headroom/blob/d13e1966f820220b482a33c30bde1e926743939a/README.md)
- [headroom/evals/README.md](https://github.com/headroomlabs-ai/headroom/blob/d13e1966f820220b482a33c30bde1e926743939a/headroom/evals/README.md)
- [headroom/evals/suite_runner.py](https://github.com/headroomlabs-ai/headroom/blob/d13e1966f820220b482a33c30bde1e926743939a/headroom/evals/suite_runner.py)
- [headroom/evals/comprehensive_benchmark.py](https://github.com/headroomlabs-ai/headroom/blob/d13e1966f820220b482a33c30bde1e926743939a/headroom/evals/comprehensive_benchmark.py)
- [benchmarks/index_proof_table.py](https://github.com/headroomlabs-ai/headroom/blob/d13e1966f820220b482a33c30bde1e926743939a/benchmarks/index_proof_table.py)
- [.github/workflows/eval.yml](https://github.com/headroomlabs-ai/headroom/blob/d13e1966f820220b482a33c30bde1e926743939a/.github/workflows/eval.yml)

**Documentation:**
- [docs/content/docs/benchmarks.mdx (the Methodology page source)](https://github.com/headroomlabs-ai/headroom/blob/d13e1966f820220b482a33c30bde1e926743939a/docs/content/docs/benchmarks.mdx)
- [wiki/index.md](https://github.com/headroomlabs-ai/headroom/blob/d13e1966f820220b482a33c30bde1e926743939a/wiki/index.md)
- [Apache License 2.0 as shipped in the repository](https://raw.githubusercontent.com/headroomlabs-ai/headroom/d13e1966f820220b482a33c30bde1e926743939a/LICENSE)

**Datasets and tools used in the reruns:**
- [headroom-ai on PyPI](https://pypi.org/project/headroom-ai/)
- [EleutherAI lm-evaluation-harness](https://github.com/EleutherAI/lm-evaluation-harness)
- [GSM8K dataset](https://huggingface.co/datasets/openai/gsm8k)
- [TruthfulQA dataset](https://huggingface.co/datasets/truthfulqa/truthful_qa)

**Related on this blog:**
- [TypeSafe's routing verdict hinges on the price ratio](/posts/typesafe-routing-verdict-hinges-on-price-ratio/)
- [Moli benchmark provenance audit](/posts/moli-benchmark-provenance-audit/)
- [GameDevBench's strictly confined leaderboard row](/posts/gamedevbench-strict-confinement-leaderboard/)

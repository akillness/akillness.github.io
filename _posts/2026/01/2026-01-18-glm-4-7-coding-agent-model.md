---
published: true
title: "GLM-4.7’s scorecard needs its test protocol beside it"
description: "A source-bound reading of GLM-4.7’s reported scores, task-specific decoding settings, τ²-Bench changes, and what the results can establish."
categories: ["AI, Research"]
tags: [glm-4.7, benchmarks, model-evaluation, coding-agents]
date: 2026-01-18 10:00:00 +0900
last_modified_at: "2026-10-14 21:14:33 +0900"
permalink: /posts/glm-4-7-coding-agent-model/
archive_developed: 2026-10-14
archive_development_note: "Rebuilt from the GLM-4.7 model card pinned at 475d85cda16beac79cde7f4cf4cae8d1260566f5 and the official Z.ai guide observed on 2026-10-14. Preserved the original date and permalink; clarified that the NC SOFT/COM2US career framing is not a GLM-4.7 use claim; separated the Hugging Face 33.4 record from the pinned 41.0 table; narrowed unsupported framework, hardware-minimum, blanket-license, and universal-ranking claims. Added an original protocol diagram."
image:
  path: /assets/img/posts/2026-01-18-glm-4-7-coding-agent-model/glm47-protocol-scorecard.png
  alt: "Diagram of GLM-4.7’s task-specific evaluation settings and four vendor-reported scores. It notes τ²-Bench top-p is not listed and Preserved Thinking is recommended for multi-turn τ²-Bench and Terminal Bench 2 tasks; scores were not independently rerun."
image_policy: source-first-fallback
---

GLM-4.7’s scorecard does not answer one question such as “Is this the best coding model?” It contains several narrower results. The pinned [Z.ai model card](https://huggingface.co/zai-org/GLM-4.7/blob/475d85cda16beac79cde7f4cf4cae8d1260566f5/README.md) lists one sampling recipe for most tasks, another for SWE-bench Verified and Terminal Bench 2.0, and a third for τ²-Bench. It also discloses task-specific changes to the τ²-Bench evaluation. A score without that setup is an incomplete comparison.

This rebuild uses the model-card revision dated January 8, 2026, which predates the original January 18 post. The current [Z.ai API guide](https://docs.z.ai/guides/llm/glm-4.7) is used only to distinguish context length from output length. The values below are reported by Z.ai; no model call, benchmark rerun, installation, serving test, or framework integration was performed here.

<figure class="explanatory-image">
  <img src="/assets/img/posts/2026-01-18-glm-4-7-coding-agent-model/glm47-protocol-scorecard.png" alt="Diagram of GLM-4.7’s task-specific evaluation settings and four vendor-reported scores. It notes τ²-Bench top-p is not listed and Preserved Thinking is recommended for multi-turn τ²-Bench and Terminal Bench 2 tasks; scores were not independently rerun." loading="lazy" decoding="async">
  <figcaption>Original illustration by Aside. This source-boundary summary is not source evidence.</figcaption>
</figure>

The [editable SVG source](/assets/img/posts/2026-01-18-glm-4-7-coding-agent-model/glm47-protocol-scorecard.svg) is available separately.

## What does this scorecard actually compare?

Here are four rows from the same first-party table. “Highest other value shown” means the largest non-GLM-4.7 number in that table row, not a result from an independent comparison.

| Benchmark | GLM-4.7 | Highest other value shown | What the row says |
|---|---:|---:|---|
| AIME 2025 | 95.7 | Gemini 3.0 Pro: 95.0 | GLM-4.7 is highest among the values shown for this row. |
| SWE-bench Verified | 73.8 | Claude Sonnet 4.5: 77.2 | GLM-4.7 does not lead this coding row in the table. |
| Terminal Bench 2.0 | 41.0 | Gemini 3.0 Pro: 54.2 | GLM-4.7 does not lead this coding and tool-use row in the table. |
| τ²-Bench | 87.4 | Gemini 3.0 Pro: 90.7 | The score is close to Claude Sonnet 4.5’s 87.2, with evaluation changes disclosed below. |

The table supports a task-specific reading: GLM-4.7 is highest among the listed values on AIME 2025, but not on these selected coding and agent rows. That is enough to retire a blanket “best at coding” summary. It is not enough to declare a universal winner or loser. The card does not give a per-competitor settings table, seeds, or full harness details that would let a reader independently reproduce every comparison from that page alone.

There is another source-surface difference worth keeping visible. The current [Hugging Face GLM-4.7 page](https://huggingface.co/zai-org/GLM-4.7) embeds a separate Terminal Bench 2.0 evaluation record at 33.4. Its metadata points to the external [Terminal-Bench Leaderboard](https://www.tbench.ai/leaderboard/terminal-bench/2.0), names dataset `harborframework/terminal-bench-2.0` and file `.eval_results/terminal_bench.yaml`, notes `agent: Terminus 2`, and marks the record `verified: false` with `pullRequest: 44`. Those fields provide provenance clues, but the page does not provide a complete protocol or explain how this record relates to the pinned Z.ai model-card result of 41.0. I keep them as separate reported records; I do not average or substitute them.

For another example of why benchmark provenance matters, see [Moli’s efficiency-map source audit](/posts/moli-benchmark-provenance-audit/). For the serving-side consequences of parallelism settings, see [LLM inference parallelism as a rank-topology problem](/posts/llm-inference-parallelism-layout/). Those articles answer different questions; neither is a GLM-4.7 benchmark rerun.

## The evaluation recipe changes by task

The same model card lists these settings:

| Task grouping | Temperature | Top-p | Max new tokens |
|---|---:|---:|---:|
| Most tasks | 1.0 | 0.95 | 131,072 |
| SWE-bench Verified and Terminal Bench 2.0 | 0.7 | 1.0 | 16,384 |
| τ²-Bench | 0 | Not listed | 16,384 |

This matters because a benchmark result is not a model-only property. The task version, decoding settings, prompt, agent harness, and budget all shape what is being measured. The model card recommends Preserved Thinking for multi-turn τ²-Bench and Terminal Bench 2 tasks. That is part of the reported setup, not proof that every coding-agent workflow should use the same configuration.

Also keep context and output limits separate. The current Z.ai guide lists a 200K context window and 128K maximum output. The model card’s `131072` is listed as a `max_new_tokens` evaluation setting. It is an output cap, not a claim that the context window is 131,072 tokens.

## τ²-Bench includes disclosed task-specific changes

Z.ai says it added an extra prompt to the Retail and Telecom interactions to avoid failure modes caused by users ending the interaction incorrectly. For the Airline domain, the card says it applied domain fixes proposed in the [Claude Opus 4.5 system card](https://assets.anthropic.com/m/64823ba7485345a7/Claude-Opus-4-5-System-Card.pdf).

That disclosure is useful, but it is not a complete reproduction recipe: the GLM-4.7 card does not reproduce the extra prompt or enumerate the Airline fixes. The careful conclusion is not that the score is invalid. It is that the reported 87.4 belongs to the documented evaluation variant, and the public card leaves details a reproducer would need to inspect. A comparison is easier to trust when the exact prompt and task adjustments travel with the number.

## What changed since the January note

The original note was dated January 18, 2026. This October 14 source check adds current Z.ai documentation listing a 200K context window and 128K maximum output; it does not establish whether those values changed since January. The archived post’s `358B` label matches current Hugging Face metadata, while the pinned official GitHub README uses `355B-A32B`. The inspected sources do not reconcile these labels, so this rebuild attributes each to its source instead of using one unqualified parameter count.

The archived opening reads, “Building AI-powered games at NC SOFT and COM2US, I've always wondered: Can an AI model truly understand…” This is first-person career framing, not a claim that GLM-4.7 was used at either company. The post separately calls GLM-4.7 “state of the art” and says it “works excellently” with several coding-agent frameworks. This run did not independently test those integrations, so the rewrite does not present that claim as measured compatibility. The old “TP=4 minimum” statement is also removed: the [official repository README](https://github.com/zai-org/GLM-4.5/blob/290cb1d8b6e14e20919efc933413528a20dd53f8/README.md) shows example vLLM and SGLang commands with different tensor-parallel settings. An example command is not a tested minimum hardware requirement.

Finally, this rewrite does not call every part of GLM-4.7 “fully open for commercial use.” The current [Hugging Face page](https://huggingface.co/zai-org/GLM-4.7) exposes MIT license metadata; the pinned [GitHub repository root LICENSE](https://github.com/zai-org/GLM-4.5/blob/290cb1d8b6e14e20919efc933413528a20dd53f8/LICENSE) says Apache-2.0; and the pinned model-card revision’s separate [LICENSE path](https://huggingface.co/zai-org/GLM-4.7/blob/475d85cda16beac79cde7f4cf4cae8d1260566f5/LICENSE) returned 404 in this inspection. These are different surfaces; they do not establish one blanket license statement for model weights, code, hosted services, and image assets.

## Use the score as a test plan

If you are choosing a model for a real coding workflow, use these rows to define questions for your own evaluation rather than as a procurement answer:

1. Pin the benchmark and harness versions you actually plan to run.
2. Record the decoding settings, thinking mode, prompt changes, and output budget beside each result.
3. Test representative tasks from your repository, including tool failures and cases where the model should stop and ask for help.
4. Report more than pass rate: include run-to-run variation, intervention rate, latency, and cost where you can measure them.

That plan is a recommendation, not a result from this archive run. The scorecard gives a useful map of reported strengths and limits. Your own task distribution and a reproducible protocol decide whether those results transfer.

## Key Takeaways

- GLM-4.7’s reported score changes meaning with the benchmark and its task-specific evaluation recipe.
- The pinned Z.ai table shows mixed results: GLM-4.7 is highest among listed values on AIME 2025, but not on the selected coding and τ²-Bench rows.
- Z.ai discloses τ²-Bench prompt and domain adjustments; treat the figures as vendor-reported results, not independent reproductions.

## New Questions

1. What were the exact extra Retail/Telecom prompt and Airline-domain changes used for the published τ²-Bench score?
2. What protocol produced the separate 33.4 Terminal Bench 2.0 result shown in the current Hugging Face evaluation panel?
3. How do these results change when a team freezes its own task set, agent harness, decode recipe, and reporting budget?

## References

### First-party model sources

- [GLM-4.7 model card, pinned to the January 8, 2026 revision](https://huggingface.co/zai-org/GLM-4.7/blob/475d85cda16beac79cde7f4cf4cae8d1260566f5/README.md) — benchmark table and task-specific settings. Re-read on 2026-10-14.
- [GLM-4.7 page on Hugging Face](https://huggingface.co/zai-org/GLM-4.7) — current evaluation panel, parameter metadata, and license metadata. Observed 2026-10-14.
- [Official GLM-4.5/4.7 repository README at commit `290cb1d8b6e14e20919efc933413528a20dd53f8`](https://github.com/zai-org/GLM-4.5/blob/290cb1d8b6e14e20919efc933413528a20dd53f8/README.md) — model label and serving examples. Re-read on 2026-10-14.
- [GitHub repository root LICENSE at the same pinned commit](https://github.com/zai-org/GLM-4.5/blob/290cb1d8b6e14e20919efc933413528a20dd53f8/LICENSE) and [the pinned Hugging Face model-card LICENSE path](https://huggingface.co/zai-org/GLM-4.7/blob/475d85cda16beac79cde7f4cf4cae8d1260566f5/LICENSE) — re-read on 2026-10-14.

### Current official documentation

- [Z.ai GLM-4.7 API guide](https://docs.z.ai/guides/llm/glm-4.7) — context and output limits. Re-read on 2026-10-14.
- [Z.ai GLM-4.7 release page](https://z.ai/blog/glm-4.7) — first-party release context. Re-read on 2026-10-14.

### Benchmark adjustment reference

- [Claude Opus 4.5 system card](https://assets.anthropic.com/m/64823ba7485345a7/Claude-Opus-4-5-System-Card.pdf) — cited by Z.ai for the τ²-Bench Airline-domain fixes. Re-read on 2026-10-14.

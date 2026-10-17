---
published: true
title: "SuperGemma4's Perfect Code Score Misses a Syntax Error"
description: "A pinned audit of SuperGemma4's 20-prompt quick bench finds one 10/10 code answer Python cannot parse, while baseline gains remain unreproducible."
categories: [AI, Agents]
tags: [supergemma4, gemma-4, local-llm, mlx, benchmark-audit, code-evaluation, apple-silicon]
date: 2026-04-15 09:00:00 +0900
last_modified_at: "2026-10-17 22:30:48 +0900"
archive_developed: 2026-10-17
archive_development_note: "I re-read the pinned community model card and 20-response quick bench, separated reported comparisons from inspectable outputs, and reproduced a syntax failure in a response scored 10/10."
image:
  path: /assets/img/posts/2026-04-15-supergemma4-local-agent-workloads/supergemma4-benchmark-audit.svg
  alt: "A 10 out of 10 code response from a 20-prompt benchmark fails Python syntax parsing."
---

## What does a 95.8 quick-bench score establish?

The April note treated SuperGemma4's published score and throughput as evidence of a sharper, faster local model for agent work. I re-read the model card and pinned its benchmark files to repository revision `1ecb7582718b813fc4c7b5c3131b2b7053787f00`. The public files support a narrower conclusion: the publisher reports a small quick-bench result, but the visible artifacts do not reproduce the comparison with the stated Gemma 4 baseline. One answer scored 10/10 even though Python cannot parse its code.

This is an answer-level audit finding. A syntax check cannot measure reasoning, and one broken answer cannot predict every response. The score should be read alongside the checks that produced it.

## What changed since the April note?

SuperGemma4 is Jiunsong's community checkpoint, not a model published by Google. Its model card declares Google's `gemma-4-26B-A4B-it` as the base and describes an MLX 4-bit, text-only line. The pinned repository config has `vision_config: null`, and its weight index maps tensors under `language_model`. Those files describe the checkpoint's published configuration; they do not establish how it was trained or what an unlisted runtime might support.

Google's Gemma 4 documentation lists the 26B A4B model as an official variant and describes image input for the family. The derivative's narrower configuration is therefore relevant when choosing it for local work, but it is not evidence that Google released or evaluated SuperGemma4. The community repository's visible files do not include a training recipe, dataset, or training script, so the adaptation method remains unknown.

The Hugging Face API response retrieved on October 17 returned revision `1ecb7582718b813fc4c7b5c3131b2b7053787f00`. Its `createdAt` field reports that the repository was created on April 10; `lastModified` reports April 12. These are repository metadata fields, not dates for creating the pinned revision. This is a point-in-time observation and may change later.

## What the public quick bench records

The model card reports an overall quick-bench score of 95.8 versus 91.4 for its stated Gemma 4 baseline, and average generation speed of 46.2 versus 42.5 tokens per second. The pinned result file contains one `supergemma-fast` run with 20 SuperGemma4 responses: six Code, four Browser, three Logic, four System Design, and three Korean.

| Published claim | What the pinned files contain | What remains unverified |
| --- | --- | --- |
| Overall score: 95.8 vs. 91.4 | One 20-prompt SuperGemma4 result at 95.8 | No paired baseline responses or run record to reproduce 91.4 |
| Speed: 46.2 vs. 42.5 tokens/sec | A candidate average of 46.2 tokens/sec | Hardware, MLX version, generation settings, warm-up, repeats, and baseline measurement |
| Code: 98.6 vs. 92.3 | Six code prompts and recorded rubric fields | No visible scoring script or evidence that generated code was executed |
| Browser: 89.6 vs. 87.5 | Four text responses to browser-task prompts | The public files show no browser execution, page actions, or success trace |

The JSONL makes one scoring boundary visible. For `code_01_algorithm`, it records `score=10.0` and marks length, keyword, completeness, code-presence, and code-quality checks as passed. It does not show an interpreter or test suite running the answer. “Browser” describes the prompts in this artifact; the public files do not show whether a browser was operated outside the recorded run.

## A perfect code score misses a Python syntax error

I extracted the first Python code block from the pinned `code_01_algorithm` response and passed it to Python 3's `ast.parse`. Parsing fails with `SyntaxError: invalid syntax` at generated-code line 92, which contains `assert trie ever_exists := trie.search("app") is False`. The same response is scored 10/10 and receives 3/3 for `code_quality` in the JSONL.

This is a counterexample to reading that rubric as proof of runnable Python. It does not show that every answer fails or that the model is worse than its base. The pinned files define no refusal-evaluation protocol or separate refusal score. The 20-response set cannot independently establish the model card's “uncensored” label. The checks here establish only what they directly test: the reported fields and the syntax of this one answer.

![The pinned response scores 10 out of 10, but Python's syntax parser rejects its first code block.](/assets/img/posts/2026-04-15-supergemma4-local-agent-workloads/supergemma4-benchmark-audit.svg){: .w-100 .shadow .rounded-10 }

_Figure 1. The response artifact reports a perfect rubric score; Python rejects the code at line 92. This is one answer-level check, not a model ranking._

## What a reproducible local comparison would need

A useful A/B test would pin both the Gemma 4 baseline and SuperGemma4 revisions, record the Mac model and memory, macOS and MLX versions, and hold the chat template, prompt set, sampling settings, and token limit constant. It would publish raw outputs for both models and the scoring script. Code prompts should run syntax checks and task tests. Browser prompts should record actual browser actions and their outcomes. Throughput should be repeated after warm-up with prompt and generated-token counts reported.

Those controls would help separate a fast local serving setup from a model improvement, and a plausible answer from one that survives execution. For the serving-side trade-off, see [how oMLX schedules model residency and interactive latency](/posts/omlx-metal-residency/). For a broader map of local inference components, see [the audit of 15 repositories for faster LLM serving](/posts/15-repos-for-faster-llm-serving/).

## Key Takeaways

| Finding | Practical reading |
| --- | --- |
| SuperGemma4 is Jiunsong's text-only MLX adaptation of Google's Gemma 4 26B A4B IT | Treat the publisher and base model as separate identities |
| The public quick bench contains 20 candidate responses, not paired baseline artifacts | Its stated score and speed deltas remain publisher-reported |
| One response scored 10/10 but fails Python syntax parsing | The visible rubric does not establish runnable-code reliability |
| Browser tasks are text outputs in the inspected files | Do not read the category score as an observed browser-success rate |

## New Questions

Will a future revision publish paired baseline outputs, a pinned evaluation script, machine details, and executable task checks? Until then, the careful conclusion is that SuperGemma4 has an interesting publisher-reported quick bench; the public evidence does not establish that it is faster or more reliable for local agents.

## References

### Primary sources

- [The pinned repository file tree](https://huggingface.co/Jiunsong/supergemma4-26b-uncensored-mlx-4bit-v2/tree/1ecb7582718b813fc4c7b5c3131b2b7053787f00), inspected for the published files and training-material limits (read 2026-10-17).
- [Jiunsong's SuperGemma4 model card and serving instructions](https://huggingface.co/Jiunsong/supergemma4-26b-uncensored-mlx-4bit-v2/blob/1ecb7582718b813fc4c7b5c3131b2b7053787f00/README.md), revision `1ecb7582718b813fc4c7b5c3131b2b7053787f00` (read 2026-10-17).
- [The 20-prompt quick-bench result](https://huggingface.co/Jiunsong/supergemma4-26b-uncensored-mlx-4bit-v2/blob/1ecb7582718b813fc4c7b5c3131b2b7053787f00/benchmark_quick_bench_20260412.json), same revision (read 2026-10-17).
- [Raw quick-bench responses](https://huggingface.co/Jiunsong/supergemma4-26b-uncensored-mlx-4bit-v2/blob/1ecb7582718b813fc4c7b5c3131b2b7053787f00/benchmark_quick_bench_20260412_responses.jsonl), same revision (read 2026-10-17).
- [The derivative's pinned config.json](https://huggingface.co/Jiunsong/supergemma4-26b-uncensored-mlx-4bit-v2/blob/1ecb7582718b813fc4c7b5c3131b2b7053787f00/config.json) and [model.safetensors.index.json](https://huggingface.co/Jiunsong/supergemma4-26b-uncensored-mlx-4bit-v2/blob/1ecb7582718b813fc4c7b5c3131b2b7053787f00/model.safetensors.index.json), same revision (read 2026-10-17).
- [Hugging Face model metadata](https://huggingface.co/api/models/Jiunsong/supergemma4-26b-uncensored-mlx-4bit-v2), retrieved 2026-10-17; `createdAt` is repository creation time.
- [Google's Gemma 4 model card](https://ai.google.dev/gemma/docs/core/model_card_4) and [release history](https://ai.google.dev/gemma/docs/releases), read 2026-10-17.

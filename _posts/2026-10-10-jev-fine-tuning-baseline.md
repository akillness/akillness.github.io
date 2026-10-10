---
title: "Before You Fine-Tune a Jev-Style Model, Write Down the Baseline"
description: "Separate local decision-model training results by model and task, check the evaluation split, and keep permissions and completion verification outside model confidence."
categories: [AI, Agents]
tags: [jev, decision-models, fine-tuning, evaluation, agent-harness]
date: 2026-10-10 10:00:00 +0900
toc: true
image:
  path: /assets/img/posts/2026-10-10-jev-fine-tuning-baseline/hero-jev-baseline.svg
  alt: "Decision-model evaluation feeding a deterministic permission gate and independent verifier"
---

## 🤔 Curiosity

A decision model can return a probability distribution over a fixed set of options instead of generating an answer in prose. That makes it useful for routing, classification, and bounded checks. It does not automatically make fine-tuning necessary, and it does not turn a model score into permission to act.

An email titled “Train your own Jev-style decision model locally!” links a hosted video and two implementation articles. It reports a short-run result, but the accessed player page showed only a media player, not a transcript or run configuration. I could not independently reproduce the setup from that page, so I treat the email's 37%→65% headline as a lead, not as a reproduced benchmark. The current Unsloth guide contains several different model and evaluation rows; they should not be stitched together into one result.

## 📚 Retrieve

### Keep the numbers attached to their own rows

The current [Unsloth training guide](https://unsloth.ai/docs/basics/train-your-own-decision-model-with-unsloth) reports multiple results with different model names, tasks, and resource measurements:

| Guide statement | What it says | What not to infer |
|---|---|---|
| Qwen3.5-0.8B benchmark row | typed-decisions: 36% to 73%; BANKING77: 7% to 74%; CLINC150: 19% to 76%; holdout accuracy: 78%. | These are not one task or one interchangeable accuracy figure. |
| Separate model/resource table | Qwen3.5-0.8B: 78% test accuracy, 4GB VRAM, 42 minutes. | This does not establish that every 0.8B model or local GPU will reproduce it. |
| Quick-run recommendation | A separate Qwen3.5-4B run with max_steps = 60 reached 76% in 10 minutes on an L4. | This is not the 0.8B row above, and it does not verify the email's exact video setup. |

Those rows are useful, but they answer different questions. A score without the model, dataset, split, metric, and hardware context is a weak basis for a training decision. The email's quoted 37% to 65% result should remain attributed to the email until its own run configuration and evaluation can be checked; the current documentation does not independently confirm that exact combination.

The guide describes a small decision head and provides sample training configurations. The baseline-first recommendation here is mine: test the untouched model before adding a training pipeline. If it already meets the task’s error and latency limits, training may add maintenance without solving a real problem.

### A small survey of public Jev-style runs

Two public projects put the newsletter headline in context, but neither verifies its run:

| Project | Reported evaluation | Setup and limits |
|---|---|---|
| [Dohnuts 0.1.0](https://huggingface.co/PsiACE/Dohnuts-0.1.0-0.8B), Qwen3.5-0.8B | 152/231 (65.80%) on the 231 public tasks in JevBench v1.2.2. | The model card reports 3,600 update steps with RLCD plus auxiliary cross-entropy, trained on one RX 7900 XTX with 24 GB. The decision weights are CC BY-NC-SA 4.0 for non-commercial research; the code has a separate Apache-2.0 license. |
| [Open-Jev-27B v1.1](https://zefan-cai.github.io/open-jev/), Qwen3.8-27B | 197/231 overall and 80/111 on public Hard; the same page reports Jev at 200/231 and 81/111 Hard. | This uses rank-8 LoRA plus a decision head and a four-rank run. It is a much larger model and a different data/version snapshot, not a 0.8B, 4 GB comparison. |

Dohnuts’ 65.80% is numerically close to the email’s 65%, but that resemblance is not confirmation: the email does not name its evaluation set or split, while Dohnuts names a particular JevBench version and public subset. Open-Jev also distinguishes 231 public tasks from 534 total, and the JevBench project warns that historical releases can use different scoring methods. Keep each score attached to its checkpoint, dataset/split, benchmark version, and hardware; do not rank unlike snapshots as if they were one experiment. This is a small sample of public projects, not a complete census.

### A frozen-model counterpoint: AnyJev

The [AnyJev technical report](https://arxiv.org/html/2610.00831v1) describes a frozen-weight alternative to training a decision model. It reads option probabilities from a pretrained instruction-tuned model's next-token distribution, corrects a label prior estimated from unlabelled inputs, and averages log-probabilities across cyclic option rotations to reduce position bias. The base model's weights stay fixed; reading every rotation costs K prefills, so this is a readout method, not fine-tuning. The report labels itself an early report on work in development.

<figure class="source-image">
  <img src="/assets/img/posts/2026-10-10-jev-fine-tuning-baseline/references/anyjev-figure-1-readout.png" alt="Diagram comparing prose generation, AnyJev's rotation-based readout, and an early-exit readout while keeping base-model weights fixed" width="2880" height="1800" loading="lazy" decoding="async">
  <figcaption>The paper's probabilities are illustrative, not observed scores. Jiamu Zhang et al., “Typed Decisions from One Prefill of Any Open LLM” (arXiv:2610.00831v1), CC BY 4.0; rasterized from the source SVG without cropping. <a href="https://arxiv.org/html/2610.00831v1">Source page</a> · <a href="https://arxiv.org/html/2610.00831v1/teaser.svg">SVG source</a> · <a href="https://creativecommons.org/licenses/by/4.0/legalcode.en">License</a>.</figcaption>
</figure>

On the two 20-option tasks, the report says rotation averaging reduced order-flip rates from 0.328 to 0.138 on banking20 and from 0.334 to 0.183 on 20 Newsgroups; accuracy rose on all 11 tested models on each task. These are the authors' results on their own samples, not a reproduction of the newsletter's 37%→65% result.

<figure class="source-image">
  <img src="/assets/img/posts/2026-10-10-jev-fine-tuning-baseline/references/anyjev-figure-2-rotation-results.png" alt="Plot comparing order-flip rates and accuracy before and after rotation averaging across 11 models on two 20-option tasks" width="2880" height="1248" loading="lazy" decoding="async">
  <figcaption>Figure 2 reports the two 20-option tasks with the label-prior correction off. Jiamu Zhang et al., “Typed Decisions from One Prefill of Any Open LLM” (arXiv:2610.00831v1), CC BY 4.0; rasterized from the source SVG without cropping. <a href="https://arxiv.org/html/2610.00831v1">Source page</a> · <a href="https://arxiv.org/html/2610.00831v1/breadth.svg">SVG source</a> · <a href="https://creativecommons.org/licenses/by/4.0/legalcode.en">License</a>.</figcaption>
</figure>

The JevBench result is a separate snapshot: the authors scored 213 of the 231 public items and skipped 18 whose expected values did not match a listed option. The figure's per-model intervals for the accuracy change include zero; this does not establish a gain on that subset. Do not treat these 213 scored items as identical to the 231-task results above, which use other project/version snapshots.

<figure class="source-image">
  <img src="/assets/img/posts/2026-10-10-jev-fine-tuning-baseline/references/anyjev-figure-3-jevbench.png" alt="Forest plots of accuracy differences and calibration error changes for eight models on the JevBench public subset" width="2880" height="1294" loading="lazy" decoding="async">
  <figcaption>Figure 3 shows paired bootstrap intervals over the paper's 213 scored public items per model. Jiamu Zhang et al., “Typed Decisions from One Prefill of Any Open LLM” (arXiv:2610.00831v1), CC BY 4.0; rasterized from the source SVG without cropping. <a href="https://arxiv.org/html/2610.00831v1">Source page</a> · <a href="https://arxiv.org/html/2610.00831v1/jevbench.svg">SVG source</a> · <a href="https://creativecommons.org/licenses/by/4.0/legalcode.en">License</a>.</figcaption>
</figure>

The report also explores an early-exit path that maps intermediate hidden states into the final-layer space. Figure 5 plots agreement with each model's full-depth decisions as more blocks are executed. Agreement with that model output is not gold-label accuracy, and the paper reports no measured latency result for its separate L2-mono evaluation.

<figure class="source-image">
  <img src="/assets/img/posts/2026-10-10-jev-fine-tuning-baseline/references/anyjev-figure-5-depth-agreement.png" alt="Agreement with each model's full-depth output across selected early-exit depths for eight models, not gold-label accuracy" width="2880" height="1146" loading="lazy" decoding="async">
  <figcaption>Figure 5 measures agreement against full-depth outputs, not task correctness. Jiamu Zhang et al., “Typed Decisions from One Prefill of Any Open LLM” (arXiv:2610.00831v1), CC BY 4.0; rasterized from the source SVG without cropping. <a href="https://arxiv.org/html/2610.00831v1">Source page</a> · <a href="https://arxiv.org/html/2610.00831v1/layerskip.svg">SVG source</a> · <a href="https://creativecommons.org/licenses/by/4.0/legalcode.en">License</a>.</figcaption>
</figure>

### A strong base model changes the fine-tuning question

The [LLM-as-Jev preprint](https://arxiv.org/abs/2610.02076v2) studies a training-free way to read decisions from next-token probabilities, alongside a fine-tuning objective. Its authors report that a capable Qwen3.5-4B model can already make strong Jev-style decisions without training, while fine-tuning gains are targeted rather than universal. The paper and guide use different task, readout, and evaluation configurations, even where their backbone names overlap, so the reported figures are not a direct score comparison.

That shifts the question from “Can I train this?” to “Which failure does training fix?” Write down the task first. If the problem is an unstable label schema, unclear options, a weak prompt, or a threshold chosen on the test set, training may only make the wrong measurement more expensive.



### Make the comparison reproducible

A useful baseline packet is small enough to rerun and explicit enough to catch a misleading gain:

1. **Freeze the task contract.** Record the input fields, question, option labels, gold-answer rule, and the cost of each error. Keep label definitions identical between models.
2. **Run the base decision model first.** Save per-example predictions and probabilities, not only the aggregate score. Include a simple deterministic or majority-class baseline where it is meaningful.
3. **Separate data roles.** Keep training data, validation/model-selection data, any probability-calibration set, and final test data distinct. Do not tune a confidence threshold against the final test set. A table that says “holdout accuracy” does not, by itself, tell us how that holdout was used.
4. **Match the evaluation.** Compare the same examples, preprocessing, prompt, option order policy, decoding settings, and metric. Report per-class results and a confusion matrix when class imbalance matters.
5. **Measure probability quality.** If downstream code uses confidence thresholds, evaluate calibration and coverage at the threshold, alongside accuracy. A concentrated distribution is not proof that the selected option is correct.
6. **Record the machine and cost.** Pin the model revision, training configuration, GPU type, peak VRAM, wall-clock time, and inference latency. “Local” is not a hardware specification.
7. **Inspect the data path.** Unsloth's [pinned dataset code](https://github.com/unslothai/unsloth/blob/d94ca0ee6b54891378c6de65af9eba48f1afae59/unsloth/models/decision_datasets.py) blocks BFCL and When2Call from training mixtures. It separately uses MMLU's `auxiliary_train` split and labels CommonsenseQA and ARC as in-distribution benchmarks. The same file includes a 13-word-shingle decontamination path: a useful lexical guard, not proof that semantic leakage is impossible or that any particular run used the intended split.



This protocol makes the trade-off visible. Fine-tuning is worth keeping when it produces a repeatable improvement on the task that matters, at an acceptable error profile and operating cost. If it only raises one headline metric while weakening calibration, rare classes, or conversational behavior, the result is not automatically a win.

## 💡 Innovation

### A model judgment is not an authorization

A Jev-style result can help choose among bounded next steps, but the surrounding application still owns policy. The [Part 3 agent tutorial](https://www.dailydoseofds.com/ai-agents-with-langgraph-course-part-3-with-implementation) separates middleware decisions from permission checks and approval. [Part 4](https://www.dailydoseofds.com/ai-agents-with-langgraph-course-part-4-with-implementation) adds an explicit plan, an independent verifier, stuck detection, budgets, and named terminal states.

That is the boundary I would preserve in a production harness:

- Let the model estimate or rank a typed choice.
- Let deterministic code check permissions, scope, and required approvals before side effects.
- Verify completion from the tool's result or the external system, not from the model's confidence that it succeeded.
- Stop or escalate when the verifier cannot establish the required outcome.



## 🎯 Key Takeaways

- Compare the base model and the fine-tuned model on the same frozen examples before keeping a training pipeline.
- Keep model, task, split, metric, and hardware attached to every benchmark number; do not merge the email claim with different documentation rows.
- Treat lexical decontamination as one safeguard, not proof that a benchmark is leak-free.
- Use model confidence to inform a bounded decision, never as permission to perform a side effect or as proof that the task finished.

## 🤔 New Questions

- Which real error category would fine-tuning reduce that a prompt or label-contract fix cannot?
- Does the probability threshold remain calibrated on a separate evaluation set and across the rare classes that matter?
- Can an independent verifier confirm completion without trusting the decision model's own report?

> **Editorial method:** AI assisted with research and drafting; the evidence-gated editorial harness owns publication decisions.

If you are adding a decision model to a retrieval pipeline, read [RAG vs. Jev + RAG: Why Ranking Is Not Answerability](/posts/rag-vs-jev-rag-why-ranking-is-not-answerability/) next. It addresses a separate question: whether the retrieved evidence actually supports an answer. For a separate implementation example, see [Jev shrinks the browser-agent decision loop for faster actions](/posts/jev-shrinks-browser-agent-decision-loop/).

## References

- [Unsloth: Train your own Decision Model](https://unsloth.ai/docs/basics/train-your-own-decision-model-with-unsloth)
- [Unsloth: Decision models](https://unsloth.ai/docs/models/decision-laya)
- [Unsloth dataset code at v0.1.905-beta](https://github.com/unslothai/unsloth/blob/d94ca0ee6b54891378c6de65af9eba48f1afae59/unsloth/models/decision_datasets.py)
- [LLM-as-Jev, arXiv:2610.02076v2](https://arxiv.org/abs/2610.02076v2)
- [Agent Harness with LangChain Middleware and Jev, Part 3](https://www.dailydoseofds.com/ai-agents-with-langgraph-course-part-3-with-implementation)
- [Planning and Verification Loops with LangGraph and Jev, Part 4](https://www.dailydoseofds.com/ai-agents-with-langgraph-course-part-4-with-implementation)
- [Dohnuts 0.1.0-0.8B model card](https://huggingface.co/PsiACE/Dohnuts-0.1.0-0.8B)
- [Open-Jev project and benchmark report](https://zefan-cai.github.io/open-jev/)
- [JevBench releases and scoring methods](https://github.com/fstandhartinger/jevbench)
- [AnyJev: Typed Decisions from One Prefill of Any Open LLM, arXiv:2610.00831v1](https://arxiv.org/html/2610.00831v1) (early report on work in development; CC BY 4.0)

Image licenses and author credits are listed with each image above.

---
title: "SageMaker RLVR's Cached Score Does Not Prove Custom-Reward Gains"
description: "A pinned SageMaker audit traces a precomputed tuned-score path, unestablished custom-reward checkpoint lineage, and the limits of a reasoning-presence heuristic."
categories: [AI, Research]
tags: [sagemaker, rlvr, reinforcement-learning, evaluation, source-audit]
image_policy: source-first-fallback
date: 2026-10-12 23:00:00 +0900
image:
  path: /assets/img/posts/2026-10-12-sagemaker-rlvr-score-provenance/concept-illustration.png
  alt: "AI-generated conceptual illustration of a sealed card in an amber case beside a teal measuring mechanism and loose tokens."
---

<figure class="explanatory-image">
  <img src="/assets/img/posts/2026-10-12-sagemaker-rlvr-score-provenance/concept-illustration.png" alt="AI-generated conceptual illustration of a sealed card in an amber case beside a teal measuring mechanism and loose tokens." loading="lazy">
  <figcaption>AI-generated illustration by ChatGPT image generation via Aside. A stored-result metaphor beside an unfilled measurement station, not a SageMaker screenshot or an observed training result. This is not source evidence.</figcaption>
</figure>

## Which training run produced that score?

If a workshop teaches a custom reward function, what evidence would convince me that the custom reward improved its model?

The October 12 Daily Dose of DS issue points to a SageMaker AI RLVR workshop. The useful discovery is not that a Python function can return a reward. It is that the workshop's custom-reward evaluation notebook defaults to a **precomputed tuned result under a `lab3a` prefix**, while an optional import helper targets a `lab3a`-named repository and registers its checkpoint in a custom-reward-labeled group.

Those paths make a workshop easier to explore. They do not establish the benefit of the custom scorer in Lab3b.

**Source Audit scope:** this post is dated to the newsletter's Korea-time issue. I inspected workshop commit `4d56206fc9f10014e81f2640c830565238f127fa`, committed October 12 at 22:21 KST, on October 14. Live AWS documentation is explicitly supplemental. I recalculated saved metric aggregates locally, but did not train a model, invoke the scorer, launch an evaluation, deploy an endpoint, or obtain an AWS bill.

## Follow the result, not the lab label

### The three evaluation paths are different

The [pinned evaluation notebook](https://github.com/aws-samples/generative-ai-on-amazon-sagemaker/blob/4d56206fc9f10014e81f2640c830565238f127fa/workshops/serverless-model-customization-with-sagemaker-ai/lab-3b-custom-reward-function-rlvr/4-evaluation.ipynb) sets `RUN_EVALUATIONS = False`. Its default result-download branch uses a `lab3a/eval_results` precomputed prefix, downloads only `tuned_benchmark_results.json`, and passes `base=None` to the comparison display. The default therefore displays a tuned-only result, not a paired comparison.

If the live branch is enabled, it launches `Benchmark.MATH` for the tuned model with `evaluate_base_model=False`. That is a fresh tuned-model evaluation path, not a newly paired base-versus-custom-reward comparison. It also does not evaluate the GSM8K test split prepared earlier merely because that split was registered.

The [optional import helper](https://github.com/aws-samples/generative-ai-on-amazon-sagemaker/blob/4d56206fc9f10014e81f2640c830565238f127fa/workshops/serverless-model-customization-with-sagemaker-ai/lab-3b-custom-reward-function-rlvr/3b-import-model-from-s3.ipynb) names `nicolasjjj/sagemaker-serverless-customization-lab3a` as its Hugging Face repository. It resolves files from unpinned `main`, so the repository name and a group ending in `custom-rw-rlvr` do not establish the checkpoint's actual training lineage.

| Inspected path | What it establishes | What it does not establish |
|---|---|---|
| Default precomputed download | Code to display a stored tuned-only result | A paired baseline, or a newly completed Lab3b evaluation |
| Live tuned-only MATH evaluation | The notebook can request that evaluation | A fresh paired baseline, or evaluation of the prepared GSM8K test split |
| Optional import from a Lab3a-named repository | Code to register a checkpoint in a custom-labeled group | Its actual training lineage or use of Lab3b's scorer |

![Observed default result path and proposed evidence chain](/assets/img/posts/2026-10-12-sagemaker-rlvr-score-provenance/provenance.svg)
_Original diagram. Solid arrows describe the inspected default path. Dashed arrows are a recommended provenance chain, not a workflow executed in this audit._

The six inspected Lab3b notebooks have no saved code-cell outputs and no non-null execution counts. That is a limitation of the checked-in evidence, not proof that their authors never ran them.

### The recorded headline is a category macro mean

The saved **Lab3a** result files contain seven MATH subject scores. Their `all` exact-match value is the unweighted mean of those subject scores. I independently recalculated that aggregate and a category-count-weighted mean from the saved JSON.

| Saved Lab3a results | Base | Tuned | Interpretation |
|---|---:|---:|---|
| Seven-category macro mean | 0.406449 | 0.507121 | Each subject has equal weight |
| Category-count-weighted mean | 0.444600 | 0.541000 | Weights use the recorded counts, totaling 5,000 examples |

The macro difference is about **10.07 percentage points**. It is a stored Lab3a comparison, not a measured custom-scorer improvement. The weighted figure is arithmetic over category scores and counts, not a new evaluation or a reconstruction of per-example predictions.

The JSON records do not freeze the dataset revision: the task `hf_revision` values are null. Endpoint example settings elsewhere in the workshop are not evidence of the benchmark's decoding configuration. I did not reproduce repeated seeds, paired significance testing, or training-job-to-result linkage.

This is the same baseline discipline discussed in [Before You Fine-Tune a Jev-Style Model, Write Down the Baseline](/posts/jev-fine-tuning-baseline/): identify the experimental unit before interpreting its improvement.

### The reward is more precise than “correct reasoning”

The [custom scorer](https://github.com/aws-samples/generative-ai-on-amazon-sagemaker/blob/4d56206fc9f10014e81f2640c830565238f127fa/workshops/serverless-model-customization-with-sagemaker-ai/lab-3b-custom-reward-function-rlvr/reward_function.py) combines four components:

```text
reward = 0.6 * numeric_correctness
       + 0.2 * parseability
       + 0.1 * delimiter_format
       + 0.1 * reasoning_presence
```

Here, `reasoning_presence` means at least eight whitespace-separated words before the first `####`. It does not verify whether those words form valid mathematical reasoning.

The parser takes the first delimited numeric match, or otherwise the last numeric substring, and compares Decimal values. That is a concrete numeric-answer verifier, not a general symbolic-mathematics verifier.

By inspection and arithmetic, a wrong answer can receive 0.4 when it is parseable, formatted, and wordy enough. A short correct answer without the delimiter can receive 0.8 through correctness and parseability alone. These are static consequences of the scorer, **not executed scorer-test results**.

That does not make reward shaping inherently wrong. It tells us what behavior is being purchased with each part of the reward. A format reward can train a useful output convention; an eight-word check cannot justify a claim that reasoning quality was verified.

### “180 examples” is the input pool, not the final training split

The [data-preparation notebook](https://github.com/aws-samples/generative-ai-on-amazon-sagemaker/blob/4d56206fc9f10014e81f2640c830565238f127fa/workshops/serverless-model-customization-with-sagemaker-ai/lab-3b-custom-reward-function-rlvr/1-prepare-data.ipynb) takes the first 180 streamed GSM8K training records. It does not randomly sample the entire training set.

A 20% validation split, followed by a 10% test split of the remainder, both use `random_state=42`. Under ordinary scikit-learn rounding, that implies **129 training, 36 validation, and 15 test records**. This is a static size derivation; I did not reconstruct the sample membership.

The training notebook does pass a custom reward-function object to `RLVRTrainer`. That verifies the integration path in source. The configured API call and the completed training run remain different claims.

## Make the scorer-to-score chain inspectable

For a follow-up experiment, I would require a compact lineage record before comparing results:

1. **Data:** immutable dataset revision, split IDs, and a hash of the evaluated prompts.
2. **Verifier:** scorer source hash plus tests for conflicting delimiters, absent answers, numeric formats, and intentionally wrong but well-formatted responses.
3. **Training:** base model revision, reward weights, job identifier, and the exact output checkpoint.
4. **Evaluation:** that checkpoint and the base model on the same held-out prompts, with recorded decode settings and an explicitly named aggregation rule.
5. **Operations:** the bill and a resource inventory, rather than an assumption that “serverless” means no persistent cost.

This is a proposed evidence contract, not an experiment completed here. It connects to [RLM-FORGE's evidence-gated recursion](/posts/rlm-forge-evidence-gated-recursion/): a machine-readable result becomes useful evidence only when its inputs, scope, and provenance remain attached.

### Budget and cleanup need their own audit

As a live supplemental observation on October 14, the workshop's [own-account setup table](https://catalog.workshops.aws/workshops/548b5be9-2da8-4c93-82f7-b0b474108ab3/en-US/00-setup/02-own-account) estimates Qwen3 0.6B RLVR at **$80/hour in US East (N. Virginia)**. This is not a measured bill, an immutable October 12 price, or a price for the workshop's default `us-west-2` region.

The observed cleanup instructions cover inference-component, model, endpoint, and endpoint-configuration deletion, plus optional evaluator removal. They are not a verified account-wide cleanup inventory. Dataset artifacts, S3 objects, scorer Lambda/IAM resources, Studio compute, and logs need separate checks where applicable. The scorer's debug logging includes reference answers and response previews, so retention also belongs in that inventory.

The pinned [SageMaker plugin deployment guide](https://github.com/awslabs/agent-plugins/blob/fbefb3764e67558fe10ac834dd85db49734aa9b6/plugins/sagemaker-ai/skills/model-deployment/references/deploy-oss-sagemaker.md) separately warns that deployed endpoints keep billing while idle. That guide is procedural context, not proof that this workshop's different deployment route was tested or cleaned up.

## Key Takeaways

- The custom-reward lab's default path points to a precomputed tuned-only result under a Lab3a prefix. It does not display a paired baseline.
- A custom label on an imported checkpoint is not custom-training lineage.
- Numeric correctness, parseability, format, and an eight-word heuristic are distinct reward components.
- The saved macro scores are not sample-weighted accuracy, and neither aggregate measures a new Lab3b run.
- The useful next step is a versioned, paired experiment with a budget and cleanup ledger, not a larger claim from the existing demonstration.

## New Questions

Would the custom scorer outperform a correctness-only scorer when both are evaluated on the same held-out prompts? Which reward components improve answer accuracy rather than formatting? How often does the numeric parser accept a response whose final intended answer is different?

Those are experiments to run, not results to borrow from a neighboring lab.

## References

**Pinned code and results**
- [AWS workshop tree, commit 4d56206f](https://github.com/aws-samples/generative-ai-on-amazon-sagemaker/tree/4d56206fc9f10014e81f2640c830565238f127fa/workshops/serverless-model-customization-with-sagemaker-ai)
- [Lab3b evaluation notebook](https://github.com/aws-samples/generative-ai-on-amazon-sagemaker/blob/4d56206fc9f10014e81f2640c830565238f127fa/workshops/serverless-model-customization-with-sagemaker-ai/lab-3b-custom-reward-function-rlvr/4-evaluation.ipynb)
- [Lab3a base results](https://github.com/aws-samples/generative-ai-on-amazon-sagemaker/blob/4d56206fc9f10014e81f2640c830565238f127fa/workshops/serverless-model-customization-with-sagemaker-ai/lab-3a-reinforcement-learning-from-verifiable-rewards/eval_results_base/results_2026-06-17T01-31-19.585655%2B00-00.json)
- [Lab3a tuned results](https://github.com/aws-samples/generative-ai-on-amazon-sagemaker/blob/4d56206fc9f10014e81f2640c830565238f127fa/workshops/serverless-model-customization-with-sagemaker-ai/lab-3a-reinforcement-learning-from-verifiable-rewards/eval_results_finetuned/results_2026-06-17T01-24-33.579557%2B00-00.json)

**Supplemental documentation, observed October 14**
- [AWS custom-reward workshop section](https://catalog.workshops.aws/workshops/548b5be9-2da8-4c93-82f7-b0b474108ab3/en-US/04-lab-3-rlvr/02-option-b-custom-reward)
- [SageMaker AI pricing](https://aws.amazon.com/sagemaker/ai/pricing/)

**Research and discovery context**
- [DeepSeekMath, the GRPO paper](https://arxiv.org/abs/2402.03300), background on the optimization method, not evidence of this workshop's gain.
- The October 12 Daily Dose of DS email supplied the discovery links. Its promotional courses are classified in the accompanying research inventory, not used as implementation evidence.

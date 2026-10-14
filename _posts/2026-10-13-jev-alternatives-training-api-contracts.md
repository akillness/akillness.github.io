---
title: "Eight Jev Alternatives Do Not Share One Training or API Contract"
description: "A source audit of eight Jev-style alternatives, separating training, serving, rights and confidence before replacing a hosted decision API."
date: 2026-10-13 19:20:00 +0900
categories: [AI, Agents]
tags: [jev, decision-models, fine-tuning, apple-silicon, api-contracts, source-audit]
math: true
image:
  path: /assets/img/posts/2026-10-13-jev-alternatives-training-api-contracts/decision-adapter.svg
  alt: "Proposed JavaScript decision-backend boundary with contract validation, typed results and provenance, not an implemented integration"
---

## What would replace a hosted Jev call?

What would it take to replace a hosted Jev call with a local decision backend that can later be trained for a specific task?

The first obstacle is not picking the largest benchmark number. It is deciding what the replacement actually is. A paper can describe an inference recipe without releasing a server. A repository can expose a familiar endpoint without providing a training engine. A trained head can exist in code while the HTTP path still uses a different readout.

This audit compares eight public alternatives through that migration problem. The earlier [fine-tuning baseline article](/posts/jev-fine-tuning-baseline/) asks whether training is worth keeping. Here, the question is narrower: **which training and serving boundary would an application need to verify before changing its backend?**

The observation date is **October 13, 2026**. Findings come from public papers, model cards, source code and license texts. No candidate weights were downloaded, no candidate model or training job was run, and no TypeSafe or other paid inference endpoint was called. The recommendations below are conditional investigation priorities, not independently reproduced performance rankings or legal clearance.

## Technical Analysis: Recipes, checkpoints, and servers are different deliverables

### Separate a recipe, a checkpoint and a server

These eight entries are not eight interchangeable model releases.

| Alternative | What the inspected release provides | Training and API boundary to verify |
| --- | --- | --- |
| [LLM-as-Jev](https://arxiv.org/html/2610.02076v2) | A Qwen-based inference and optional fine-tuning recipe in a paper. | The method is published; a reproducible author training CLI or TypeSafe-compatible HTTP server was not established in this audit. |
| [Laya](https://github.com/NandhaKishorM/laya) | Distinct decision checkpoints and a project-specific Python training/runtime package. | The MPS/CPU script calls Laya's training implementation. Generic Hugging Face Trainer/PEFT compatibility and a matching JavaScript/HTTP boundary remain separate questions. |
| [Kev](https://github.com/jaredpalmer/kev) | Small decision models, a training CLI and a documented System One-shaped HTTP endpoint. | Its PyTorch training path is separate from its MLX serving path. The selected checkpoint, head and calibration configuration must stay bound together. |
| [HF OpenJev](https://huggingface.co/openjev/openjev) | Model-weight artifacts with a separate helper. | A helper does not establish a retraining pipeline. Weight rights and helper rights are different contracts. |
| [razorback16/openjev](https://github.com/razorback16/openjev/tree/b4339c640f5331ef75098637d1be2c787715ee88) | A serving framework around selected backends. | It is not a general training engine. Backend constraints and confidence definitions still have to be checked. |
| [OpenDecider](https://huggingface.co/manjunathshiva/opendecider-nano/resolve/1e1f0a7322e446c5ae9bbe840df11680f18a752a/README.md) | Nano/small model artifacts and an inference package. | A public retraining entry point was not established in the inspected release scope. That is not proof that none exists elsewhere. |
| [Bespoke Nimble](https://github.com/bespokelabsai/nimble) | A schema-aware scoring approach and a public LoRA training recipe. | Its custom schema boundary is not an automatic System One replacement. General repository code reuse remains on hold pending a clear license. |
| [daseinlabs/open-jev](https://github.com/daseinlabs/open-jev/blob/4627a04a075bf714f4b60b69de19fa2de0a8a431/docs/decision-head.md) | Continuation scoring plus an MLX-native task-head training architecture. | The public System One HTTP path uses continuation scoring. Serving a learned native head through that boundary remains follow-up work. |

A useful selection starts with the missing boundary, not the brand name. For an initial HTTP contract check, Kev is a reasonable candidate to inspect. For an inspectable MPS training path, Laya is a candidate. For the design of MLX-native head training, daseinlabs is a candidate. None of those priorities means the selected project has already won a shared Korean evaluation or passed a runtime test on this machine.

### LLM-as-Jev reads the complete candidate, not one convenient logit

The [LLM-as-Jev paper](https://arxiv.org/html/2610.02076v2), by Yinheng Li and Justin Wagle, uses bracketed numeric candidate identifiers. Its training-free path sums the log probabilities of the **entire candidate suffix**, then applies a softmax across candidates. The closing bracket makes identifiers such as `[1]` and `[12]` prefix-free as complete answers.

That is different from taking a single letter's logit and calling it the answer probability. The figure also separates the frozen inference recipe from optional fine-tuning; publishing that architecture does not, by itself, establish a released training package.

<figure class="source-image">
  <img src="/assets/img/posts/2026-10-13-jev-alternatives-training-api-contracts/references/llm-as-jev-figure-1.png" alt="Diagram showing numbered candidate suffixes, a prefix trie, training-free scoring, and fine-tuning in LLM-as-Jev." loading="lazy">
  <figcaption>Figure 1 from Yinheng Li and Justin Wagle, LLM-as-Jev (arXiv:2610.02076v2), CC BY 4.0; source SVG rasterized to PNG without cropping or content edits. White-background technical conversion only, with no relabeling. Source: <a href="https://arxiv.org/html/2610.02076v2">https://arxiv.org/html/2610.02076v2</a>. <a href="https://arxiv.org/html/2610.02076v2/framework.svg">Original SVG</a>. License: <a href="https://creativecommons.org/licenses/by/4.0/">https://creativecommons.org/licenses/by/4.0/</a>, including its <a href="https://creativecommons.org/licenses/by/4.0/legalcode.en">warranty disclaimer</a>.</figcaption>
</figure>

The tokenization step is part of the contract too. Figure 5 compares candidate branches across Qwen, Phi and TinyLlama tokenizers. The paper's procedure tokenizes the prompt and each full prompt-plus-candidate string, checks the prompt prefix, and keeps the remaining tokens as the suffix. Tokenizing a suffix on its own can introduce an extra word-start token in the illustrated SentencePiece case.

<figure class="source-image">
  <img src="/assets/img/posts/2026-10-13-jev-alternatives-training-api-contracts/references/llm-as-jev-figure-5.png" alt="Diagram of tokenizer-dependent candidate branches and full-string suffix scoring in LLM-as-Jev." loading="lazy">
  <figcaption>Figure 5 from Yinheng Li and Justin Wagle, LLM-as-Jev (arXiv:2610.02076v2), CC BY 4.0; source SVG rasterized to PNG without cropping or content edits. Source: <a href="https://arxiv.org/html/2610.02076v2">https://arxiv.org/html/2610.02076v2</a>. <a href="https://arxiv.org/html/2610.02076v2/tokenizers.svg">Original SVG</a>. License: <a href="https://creativecommons.org/licenses/by/4.0/">https://creativecommons.org/licenses/by/4.0/</a>, including its <a href="https://creativecommons.org/licenses/by/4.0/legalcode.en">warranty disclaimer</a>.</figcaption>
</figure>

A replacement that changes tokenization, candidate scoring or option IDs can change more than the transport. It may change the resulting distribution or its interpretation, so compatibility needs a matched-contract test rather than an assumption.

### The training objective is a different contract again

LLM-as-Jev fine-tuning uses a tree-factorized listwise loss and multiple KL anchors to a frozen reference model. The listwise objective normalizes over legal children in the candidate trie. The anchors constrain legal mass, illegal-token predictions and predictions at other positions. This is not ordinary next-token fine-tuning with a renamed output field.

<figure class="source-image">
  <img src="/assets/img/posts/2026-10-13-jev-alternatives-training-api-contracts/references/llm-as-jev-figure-2.png" alt="Diagram comparing the tree-factorized candidate-choice loss with KL anchors that preserve other base-model predictions." loading="lazy">
  <figcaption>Figure 2 from Yinheng Li and Justin Wagle, LLM-as-Jev (arXiv:2610.02076v2), CC BY 4.0; source SVG rasterized to PNG without cropping or content edits. Source: <a href="https://arxiv.org/html/2610.02076v2">https://arxiv.org/html/2610.02076v2</a>. <a href="https://arxiv.org/html/2610.02076v2/anchors.svg">Original SVG</a>. License: <a href="https://creativecommons.org/licenses/by/4.0/">https://creativecommons.org/licenses/by/4.0/</a>, including its <a href="https://creativecommons.org/licenses/by/4.0/legalcode.en">warranty disclaimer</a>.</figcaption>
</figure>

The authors report targeted rather than universal training benefits. Their anchor-weight ablation shows why preserving conversational behavior must be evaluated alongside decision scores. Those plots concern the paper's 4B and 0.6B models under its own experiments, not a shared league table of the eight alternatives here.

<figure class="source-image">
  <img src="/assets/img/posts/2026-10-13-jev-alternatives-training-api-contracts/references/llm-as-jev-figure-4.png" alt="Ablation plots of score and behavior measures for the 4B and 0.6B models as the anchor weight changes." loading="lazy">
  <figcaption>Figure 4 from Yinheng Li and Justin Wagle, LLM-as-Jev (arXiv:2610.02076v2), CC BY 4.0; source SVG rasterized to PNG without cropping or content edits. These are author-reported ablation results, not this audit's measurements. Source: <a href="https://arxiv.org/html/2610.02076v2">https://arxiv.org/html/2610.02076v2</a>. <a href="https://arxiv.org/html/2610.02076v2/ablation.svg">Original SVG</a>. License: <a href="https://creativecommons.org/licenses/by/4.0/">https://creativecommons.org/licenses/by/4.0/</a>, including its <a href="https://creativecommons.org/licenses/by/4.0/legalcode.en">warranty disclaimer</a>.</figcaption>
</figure>

The inspected paper does not establish a sub-$100 local training result for the target task or superiority over the official hosted Jev service. Its public diagnostic evaluation must not be treated as the same evaluation as private or differently configured hosted results.

For Laya, the relevant evidence is a [pinned MPS script](https://github.com/NandhaKishorM/laya/blob/c73908d96ff73c0062c340a11bf7c54ec7d8bc4d/notebooks/laya_finetune_typed_decisions_mps.py) importing `TrainConfig` and `finetune` from `laya.train`. That establishes inspectable project-specific training code, not a verified generic HF Trainer/PEFT workflow or a completed Korean training run.

For daseinlabs, the [pinned decision-head guide](https://github.com/daseinlabs/open-jev/blob/4627a04a075bf714f4b60b69de19fa2de0a8a431/docs/decision-head.md) separates head training from continuation scoring. A developer choosing the native-head path still needs to verify or implement its serving boundary. A server returning plausible probabilities from continuation scoring is not evidence that it loaded the trained head.

### A familiar `confidence` field can change the policy

The [official TypeSafe documentation](https://docs.typesafe.ai/confidence) defines Choice confidence as:

$$
C_{\mathrm{choice}} = \frac{p_{\max} - 1/n}{1 - 1/n}.
$$

For three options with probabilities `(0.6, 0.3, 0.1)`, that gives **0.4**. The normalized-entropy definition in the [pinned razorback engine](https://raw.githubusercontent.com/razorback16/openjev/b4339c640f5331ef75098637d1be2c787715ee88/openjev/engine.py) gives approximately **0.183** for the same distribution. This is a calculation from documented/code-defined formulas, not candidate-model inference or a calibration experiment.

The difference is operational. A rule that accepts an answer above an existing confidence threshold can change behavior even if both backends return identical probabilities. Computing the official formula locally would match that arithmetic, but it would still not establish that the alternative model is calibrated on the application's data.

Score has another contract: the official definition uses the **order of the levels** and a mean-absolute-deviation construction. Noul has no separate confidence field in that official contract. Reusing one entropy function for every primitive would need an explicit design decision, not a claim of automatic Jev compatibility.

### Keep code, weights and data rights separate

Two naming collisions matter before deployment:

- **HF OpenJev versus the razorback server.** The HF weight artifact's [pinned NOTICE](https://huggingface.co/openjev/openjev/raw/b4a89f5884f3482a5e894b2e7ff01db8ea033726/NOTICE) separates CC BY-NC 4.0 model weights from Apache-2.0 helper code. The separate razorback serving framework also has its own code license. Neither code license turns non-commercial weight terms into unrestricted commercial rights.
- **Nimble code versus its adapter.** The audit did not establish the general repository code license at the inspected revision. The adapter's separate license does not settle permission to copy and reuse every repository file. Keep code adoption on hold until that boundary is resolved.

For every candidate, review the exact base, adapter/head, code, training data and teacher-output terms independently. A permissive code file or model-card declaration is not a legal clearance of the entire training lineage. The four paper diagrams in this article have their own CC BY 4.0 attribution; that does not license unrelated model weights or repository assets.

## Put the migration boundary in a project-owned adapter

### Put a project-owned adapter at the migration boundary

The proposed architecture is deliberately smaller than a universal decision-model framework. Keep backend-specific calls behind a project-owned `DecisionAdapter`, leaving training and inference in their relevant PyTorch or MLX implementation.

The cover diagram is an original architectural proposal, not an implemented integration. No wrapper, learned-head HTTP bridge or replacement backend was built or tested for this audit.

The adapter should own four records:

1. **Request contract:** stable question and candidate IDs, primitive type, ordered Score levels, input-length and option-count limits, and supported modalities. Reject unsupported fields rather than silently dropping them.
2. **Loaded-artifact contract:** exact base, adapter and head revisions, serving mode and calibration configuration. A checkpoint label alone is not enough to prove which readout answered.
3. **Result contract:** preserve the full distribution and raw backend confidence, together with its formula and calibration provenance. Do not relabel entropy as official confidence without explaining the conversion and its limits.
4. **Action contract:** keep permission, scope and human approval outside the model result. Errors, unsupported inputs and unsafe confidence conditions should reach review or a safe failure path.

These are design requirements proposed by this audit, not features claimed to exist in every listed project. Their value is that a backend swap becomes an explicit contract change instead of a new package hidden behind the old function name.

### Choose the next test by the unresolved boundary

For a JavaScript application, **inspect Kev's HTTP boundary first** if the immediate problem is transport integration. For task-specific MPS training, **inspect Laya's project-specific recipe**, keeping its checkpoints and evaluation evidence separate. For MLX-native head design, **inspect daseinlabs**, while treating head-to-HTTP integration as unfinished work rather than an already verified endpoint.

The next runtime investigation needs separate authorization. Before it starts, establish the intended Mac chip and memory, exact artifacts and rights, and permission to use the data. Use Korean-native task ground truth and distinct training, selection, calibration and test roles. Test candidate ordering, question independence, rejection behavior and matched cold/warm latency rather than transferring unlike published averages.

Laya's multilingual Korean intent result does not establish broad Korean operational decision quality. A backbone's general multilingual coverage does not establish that either. No shared Korean evaluation or Apple-Silicon runtime reproduction was performed here.

## Key Takeaways

- Select a training or serving boundary before selecting a winner. Recipes, checkpoints and servers are different deliverables.
- Preserve candidate scoring, confidence semantics and loaded-artifact identity when replacing an API.
- Keep code rights separate from weights, data and teacher outputs. Unresolved rights stay unresolved.
- Treat published benchmarks as source-attributed evidence under their own conditions. This audit did not run the candidates.

## New Questions

- Does the proposed server actually load the selected checkpoint and learned head, or use another readout?
- Which confidence definition would the application's threshold consume after migration?
- Which Korean failure category justifies training rather than a contract or prompt fix?

For the next step, use the [fine-tuning baseline and evaluation checklist](/posts/jev-fine-tuning-baseline/). It complements this implementation-selection audit by showing how to judge whether a training result is worth keeping without merging unlike benchmark rows.

## References

- [LLM-as-Jev, arXiv:2610.02076v2](https://arxiv.org/html/2610.02076v2), Yinheng Li and Justin Wagle. Paper methodology and author-reported results; revised October 4, 2026.
- [Laya MPS training script at c73908d](https://github.com/NandhaKishorM/laya/blob/c73908d96ff73c0062c340a11bf7c54ec7d8bc4d/notebooks/laya_finetune_typed_decisions_mps.py) and [multilingual checkpoint card](https://huggingface.co/convaiinnovations/laya-multilingual/resolve/1720e3e3357cfe1e281542e223f8273b0890ca34/README.md).
- [Kev README at 85ccf56](https://github.com/jaredpalmer/kev/blob/85ccf56a0afb952323c621055b02876e8498d60c/README.md), with its separate [PyTorch trainer](https://github.com/jaredpalmer/kev/blob/85ccf56a0afb952323c621055b02876e8498d60c/kev/train.py) and [HTTP/MLX serving path](https://github.com/jaredpalmer/kev/blob/85ccf56a0afb952323c621055b02876e8498d60c/kev/serve.py). This is source-code inspection, not a runtime result.
- [HF OpenJev NOTICE](https://huggingface.co/openjev/openjev/raw/b4a89f5884f3482a5e894b2e7ff01db8ea033726/NOTICE), audit weight revision `b4a89f5884f3482a5e894b2e7ff01db8ea033726`.
- [razorback16/openjev at b4339c6](https://github.com/razorback16/openjev/tree/b4339c640f5331ef75098637d1be2c787715ee88) and its [confidence implementation](https://raw.githubusercontent.com/razorback16/openjev/b4339c640f5331ef75098637d1be2c787715ee88/openjev/engine.py).
- [OpenDecider nano card](https://huggingface.co/manjunathshiva/opendecider-nano/resolve/1e1f0a7322e446c5ae9bbe840df11680f18a752a/README.md) and [small card](https://huggingface.co/manjunathshiva/opendecider-small/resolve/38da75cc81cbdf845b1584e6885a8b4b8a308b10/README.md).
- [Bespoke Nimble repository](https://github.com/bespokelabsai/nimble), audit code revision `444f8be0326e58182f4111705a692f079c8ee832`; [adapter license](https://huggingface.co/bespokelabs/Bespoke-Nimble-9B/resolve/bd792f44ec8e265be861bfcdf4e05967ffe0e858/LICENSE).
- [daseinlabs decision-head guide at 4627a04](https://github.com/daseinlabs/open-jev/blob/4627a04a075bf714f4b60b69de19fa2de0a8a431/docs/decision-head.md).
- [Official TypeSafe confidence definitions](https://docs.typesafe.ai/confidence).

Each source-image caption records its author, version, license and technical conversion. No sponsorship, endorsement, benchmark reproduction, training-cost guarantee or measured monetization outcome is implied.

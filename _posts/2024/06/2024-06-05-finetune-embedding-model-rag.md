---
published: true
title: "The Archived Matryoshka Example Omits the Loss Wrapper"
description: "A bounded source audit finds plain-loss examples, post-encoding slicing, and a 384-versus-768 model substitution where the recipe trains nested prefixes."
categories: ["AI, Research"]
tags: [matryoshka, embeddings, rag, sentence-transformers, source-audit]
date: 2024-06-05 12:00:00 +0900
last_modified_at: "2026-10-17 01:27:18 +0900"
archive_developed: 2026-10-17
archive_development_note: "Rebuilt from the preserved archive, the training notebook pinned at 20d7fe8532ebce1f44e023700021c3f705b6d710, MiniLM and BGE model cards pinned at 1110a243fdf4706b3f48f1d95db1a4f5529b4d41 and a5beb1e3e68b9ab74eb54cfd186867f64f240e1a respectively, and loss/test source pinned at 0237a556667a46ccdb36072a7866c5d9be9dc518, reviewed on 2026-10-16. Replaced generic variable-size embedding claims with the omitted-wrapper and 384-versus-768-dimensional sentence-output-contract audit. No training run, benchmark reproduction or quality failure is claimed."
image_policy: source-first-fallback
image:
  path: /assets/img/posts/2024-06-05-finetune-embedding-model-rag/archive-recipe-training-contract.png
  alt: "Original explanatory diagram comparing the archive's shown all-MiniLM-L6-v2 384-dimensional plain MNRL plus post-encoding 128-dimensional slice with the cited BAAI/bge-base-en-v1.5 768-dimensional MatryoshkaLoss wrapper around base MNRL and configured 768, 512, 256, 128 and 64 prefixes; shown configurations, not observed execution."
---

## Does the archived example actually train the prefixes it later slices?

The bounded finding is that the restored article’s shown examples call `MultipleNegativesRankingLoss` directly and then slice encoded vectors, while the directly read recipe uses `MatryoshkaLoss` around that base loss and configures BGE prefixes at 768, 512, 256, 128, and 64 dimensions. This is a comparison of displayed configurations, not a claim that either path was executed or that slicing necessarily fails.

That distinction matters because “make a shorter vector” and “train the shorter vector” describe different contracts. In the archived first example, the code comment says “Matryoshka loss enables variable dimensions,” but the displayed assignment is:

> `train_loss = losses.MultipleNegativesRankingLoss(model)`

The same example later takes prefixes with `[:, :128]` and `[:, :256]`. The second implementation example again names the 384-dimensional MiniLM model and uses the plain multiple-negatives loss before discussing shortened outputs. The reviewed evidence therefore supports a narrower statement: the archive presents post-encoding slicing beside a Matryoshka label, but it does not show the wrapper that supplies the nested-prefix objective in those examples.

The live tutorial is not evidence that the June 2024 bytes looked exactly the same. It is an unversioned page whose reviewed content does include the wrapper, and the pinned notebook is dated November 2024. The useful audit boundary is consequently the one between the frozen restored body and the later, directly inspected recipe—not a claim about an unobserved historical environment.

An ordinary embedding can be sliced and may retain useful information. Nothing in this review demonstrates poor sliced-vector quality, a quality collapse, or a measured retrieval result. The finding is about whether the shown training loss explicitly optimizes the prefixes that a later index might consume.

<figure class="explanatory-image">
  <img src="/assets/img/posts/2024-06-05-finetune-embedding-model-rag/archive-recipe-training-contract.png" alt="Original explanatory diagram comparing the archive's shown all-MiniLM-L6-v2 384-dimensional plain MNRL plus post-encoding 128-dimensional slice with the cited BAAI/bge-base-en-v1.5 768-dimensional MatryoshkaLoss wrapper around base MNRL and configured 768, 512, 256, 128 and 64 prefixes; shown configurations, not observed execution." width="1600" height="1000" loading="lazy" decoding="async">
  <figcaption>Original illustration by jeo using Pillow; not source evidence. Shown archive and recipe configurations only; no training run or sliced-vector quality result is claimed.</figcaption>
</figure>

## Why the encoder width changes the recipe’s meaning

The archive selects `sentence-transformers/all-MiniLM-L6-v2`, whose reviewed model card describes a 384-dimensional dense vector space. The notebook and recipe instead load `BAAI/bge-base-en-v1.5`; the reviewed BGE materials specify a 768-dimensional sentence-vector contract, and its module listing contains Transformer, Pooling, and Normalize modules without a separate Dense projection.

[INFERENCE] That is not a cosmetic model-name substitution. A recipe that names 768 as its largest configured prefix is a contract for a sentence output that can supply that prefix. The archived model’s documented 384-dimensional output cannot inherit the BGE recipe’s 768-dimensional comparison merely because both models are used through Sentence Transformers.

The comparison is easiest to keep bounded:

| Reviewed surface | Archived example | Recipe/notebook surface | What the evidence establishes |
|---|---|---|---|
| Base model | `all-MiniLM-L6-v2` | `BAAI/bge-base-en-v1.5` | Different named model contracts |
| Sentence output width | 384 | 768 | Different documented widths |
| Training loss shown | `MultipleNegativesRankingLoss` | `MatryoshkaLoss` wrapping `MultipleNegativesRankingLoss` | Different displayed loss structures |
| Prefix handling | Post-encoding slices such as 128 and 256 | Configured dimensions 768, 512, 256, 128, 64 | The recipe explicitly enumerates nested objectives |

This table does not compare quality, speed, storage, or benchmark scores. It also does not infer runtime shapes from token hidden size alone. The model-card output-width statement is the relevant evidence for the sentence-vector boundary; no weights or runtime output shapes were measured in this audit.

The practical implication is an audit question, not a universal migration rule: before carrying a short-prefix claim into another encoder, verify both the sentence-output width and the loss configuration. A 384-dimensional model may be perfectly usable for a separate design, but it is not the 768-dimensional model named by the reviewed recipe.

## What does the nested-prefix objective add?

The inspected implementation gives the missing mechanism a precise shape. `MatryoshkaLoss` takes a base objective, shrinks the sentence embeddings to each configured dimension, normalizes each resulting prefix, and accumulates the weighted losses. The inspected source includes the short operations:

> `tensor = tensor[..., :dim]`
> `tensor = F.normalize(tensor, p=2, dim=-1)`

These are quoted from source inspected at the pinned 2026 commit; the code and tests were not executed for this article. The same implementation validates that dimensions are positive, that the number of weights matches the dimensions when weights are supplied, and—when the model’s sentence-output width is known—that requested dimensions do not exceed it. It sorts configured dimensions descending and defaults weights to one when none are supplied.

The base `MultipleNegativesRankingLoss`, by contrast, embeds the supplied sentence features and computes its ranking objective. The inspected loss body has no corresponding loop over prefix dimensions. That does not make the base loss invalid; it identifies what it does not establish. A plain base loss can train the full output while later code slices that output, but the inspected source does not show that plain loss separately applying its objective to each requested prefix.

The paper’s description is consistent with this structure: losses are aggregated after scaling by relative importance, and normalization is handled independently for each nesting dimension for best results. The paper also reports task- and configuration-specific trade-offs. It does not provide a universal monotonic-quality guarantee for every prefix, so the existence of a nested objective must not be presented as proof that every shorter vector will perform well.

The implementation’s positive `n_dims_per_step` option further qualifies a shorthand description. Configured dimensions are the default objective set, but a positive sampling option can select a subset per step. The source therefore supports “the configured prefix objectives, subject to the implementation’s sampling option,” not the stronger claim that every training step always evaluates every dimension.

Most importantly, an objective structure is not a checkpoint report. [INFERENCE] Seeing a displayed or inspected objective establishes what the code is designed to calculate, not that a checkpoint was produced, that training converged, or that an index using a prefix will meet a quality target. Those questions require a run and measurements, neither of which this audit claims.

<figure class="explanatory-image">
  <img src="/assets/img/posts/2024-06-05-finetune-embedding-model-rag/normalized-prefix-objectives.png" alt="Original explanatory flow diagram showing the inspected 2026 default applying L2 normalization and a base MNRL objective to each configured 768, 512, 256, 128 and 64 prefix before a weighted sum, with a note that positive n_dims_per_step may sample a subset and validation concerns sentence-output width, not necessarily token hidden width." width="1600" height="1000" loading="lazy" decoding="async">
  <figcaption>Original illustration by jeo using Pillow; not source evidence. Inspected default objective mechanism; configurable subset sampling and sentence-output-width qualifications remain explicit.</figcaption>
</figure>

## What changed in this 2026 rebuild?

This rebuild changes the article from a broad explanation of variable-size embeddings into a source-specific contract audit. Later notebook and current-implementation inspection supplies the comparison needed to identify the omission and the width substitution, but it does not turn those later materials into a historical 2024 run.

The pinned notebook is a November 2024 artifact. It loads `BAAI/bge-base-en-v1.5`, defines `matryoshka_dimensions = [768, 512, 256, 128, 64]`, creates a `MultipleNegativesRankingLoss(model)`, and passes that through `MatryoshkaLoss` before giving the resulting loss to the trainer. The live tutorial also contains the wrapper, although the reviewed live page and pinned notebook differ in training-column order. Those details are useful for comparing shown contracts; they are not a reconstruction of the June 2024 package or environment.

The current implementation snapshot is likewise a source inspection. Its tests include an assertion comparing the Matryoshka loss with an explicit sum of cosine cross-entropy objectives for dimensions such as 4 and 2 and comparing gradients. The assertions were inspected, not executed. That distinction prevents a common editorial overreach: turning a test’s intended equivalence into a claim about a completed training run or a deployed model.

The rebuild therefore preserves three limits. First, it does not accuse the primary tutorial of being plain-loss-only: the wrapper is present there, while the omission belongs to the restored article examples. Second, it does not claim that ordinary slicing is useless. Third, it does not claim that the model substitution caused a measured failure. The supported contribution is narrower: the archive’s displayed loss and model do not match the nested-prefix, 768-dimensional contract shown by the later recipe materials.

## How should an engineer audit this recipe before reuse?

Start with the sentence-output boundary. Record the exact model identifier and confirm the model card or inspected module configuration for the output consumed by the loss and index. Do not substitute token hidden width for sentence-output width: the current implementation’s validation concerns the latter, and the evidence explicitly warns that the two need not be identical in general.

Next, inspect the loss object rather than relying on a heading or a later slice. Look for the wrapper around the base objective, the configured dimensions, the weight behavior, and any sampling option. A displayed slice such as `[:, :128]` proves only that a prefix is selected in that code path. [INFERENCE] It does not by itself prove that the selected coordinates were optimized as a 128-dimensional representation during training.

Then keep model and objective together when comparing recipes. The archived pair is MiniLM at 384 dimensions with a directly shown multiple-negatives loss and post-encoding slices. The reviewed recipe pair is BGE at 768 dimensions with the Matryoshka wrapper and the listed nested dimensions. Mixing the model from one pair with the prefix claims from the other creates a provenance problem even before any quality question is asked.

Finally, separate contract verification from outcome verification. This audit can establish what the reviewed code is configured to do. It cannot establish a checkpoint’s achieved prefix quality, deployment compatibility, or end-to-end answerability. Those would be additional questions requiring an actual run, an evaluation design, and evidence not supplied here.

For the next conceptual step, read [RAG vs. Jev + RAG: Why Ranking Is Not Answerability](/posts/rag-vs-jev-rag-why-ranking-is-not-answerability/) after reconciling the encoder and prefix objective; it separates vector ranking from evidence sufficiency rather than treating a training contract as proof of answerability. For a second source-boundary example, [SIE’s Public Repo Is an Export Surface, Not a Workshop](/posts/sie-export-surface-audit/) is useful because it asks what a supplied public implementation actually establishes before broader project claims are made.

## Key Takeaways

- The restored examples show `MultipleNegativesRankingLoss` and later prefix slicing, while the reviewed recipe wraps that loss in `MatryoshkaLoss` for configured BGE prefixes at 768, 512, 256, 128, and 64 dimensions.
- The archived model card describes `all-MiniLM-L6-v2` as producing 384-dimensional vectors; the reviewed recipe and notebook use `BAAI/bge-base-en-v1.5` with a 768-dimensional sentence-output contract.
- [INFERENCE] The inspected current implementation normalizes each configured prefix and sums weighted base objectives, but its objective structure does not prove checkpoint quality, a completed historical run, or deployment compatibility.
- The audit identifies a displayed-contract mismatch without claiming that ordinary slicing fails or that the archived path produced measured quality loss.

## New Questions

- Did the archived training examples ever run with a package version that supplied a different loss wrapper or model configuration?
- What prefix-quality results would an independently reproduced run obtain for the specified encoder, dimensions, data, and evaluation task?
- How would the chosen index and retrieval evaluation change when consuming each prefix?
- Does a particular deployment require all configured dimensions or a sampled subset under `n_dims_per_step`?

## References

### Recipe and model contracts

- [Reviewed fine-tuning tutorial](https://www.philschmid.de/fine-tune-embedding-model-for-rag) — Unversioned page; displayed publication and modified dates reviewed as 2024-06-04; live content includes the Matryoshka wrapper. Read on 2026-10-16.
- [Pinned training notebook](https://raw.githubusercontent.com/philschmid/deep-learning-pytorch-huggingface/20d7fe8532ebce1f44e023700021c3f705b6d710/training/fine-tune-embedding-model-for-rag.ipynb) — Git commit 20d7fe8532ebce1f44e023700021c3f705b6d710; commit date 2024-11-27; notebook blob 9d9fbaf5064d0a50c6789b411d2c70ebca7739e1. Read on 2026-10-16.
- [MiniLM model card](https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2/resolve/1110a243fdf4706b3f48f1d95db1a4f5529b4d41/README.md) — Model revision 1110a243fdf4706b3f48f1d95db1a4f5529b4d41; reviewed declaration describes a 384-dimensional dense vector space. Read on 2026-10-16.
- [BGE model card](https://huggingface.co/BAAI/bge-base-en-v1.5/resolve/a5beb1e3e68b9ab74eb54cfd186867f64f240e1a/README.md) — Model revision a5beb1e3e68b9ab74eb54cfd186867f64f240e1a; reviewed BGE table specifies 768 dimensions. Read on 2026-10-16.

### Loss implementation and supporting paper

- [Pinned MatryoshkaLoss implementation](https://raw.githubusercontent.com/huggingface/sentence-transformers/0237a556667a46ccdb36072a7866c5d9be9dc518/sentence_transformers/sentence_transformer/losses/matryoshka.py) — Sentence Transformers commit 0237a556667a46ccdb36072a7866c5d9be9dc518; blob 92dde66afec4901ad2e7451074bc4031dd4f35c8. Read on 2026-10-16.
- [Pinned MultipleNegativesRankingLoss implementation](https://raw.githubusercontent.com/huggingface/sentence-transformers/0237a556667a46ccdb36072a7866c5d9be9dc518/sentence_transformers/sentence_transformer/losses/multiple_negatives_ranking.py) — Sentence Transformers commit 0237a556667a46ccdb36072a7866c5d9be9dc518; blob 06be2be32c5770f226414a01c33199aa2bfc00d5. Read on 2026-10-16.
- [Matryoshka Representations paper](https://arxiv.org/pdf/2205.13147v1) — arXiv:2205.13147v1; version date 2022-05-26; reviewed objective description and Appendix C. Read on 2026-10-16.
- [Pinned Matryoshka tests](https://raw.githubusercontent.com/huggingface/sentence-transformers/0237a556667a46ccdb36072a7866c5d9be9dc518/tests/sentence_transformer/losses/test_matryoshka.py) — Sentence Transformers commit 0237a556667a46ccdb36072a7866c5d9be9dc518; blob 926bbb364c98ad6c8447118fc76b7e728df3ef02; assertions inspected, not executed. Read on 2026-10-16.

### BGE configuration boundary

- [Pinned BGE configuration](https://huggingface.co/BAAI/bge-base-en-v1.5/resolve/a5beb1e3e68b9ab74eb54cfd186867f64f240e1a/config.json) — BAAI/bge-base-en-v1.5 revision a5beb1e3e68b9ab74eb54cfd186867f64f240e1a; configuration explicitly read for hidden_size 768. Read on 2026-10-16.
- [Pinned BGE modules](https://huggingface.co/BAAI/bge-base-en-v1.5/resolve/a5beb1e3e68b9ab74eb54cfd186867f64f240e1a/modules.json) — BAAI/bge-base-en-v1.5 revision a5beb1e3e68b9ab74eb54cfd186867f64f240e1a; module configuration explicitly read for Transformer, Pooling, and Normalize modules. Read on 2026-10-16.

---
title: The weights of our Time Series Foundation Model (TimesFM) on Hugging Face
description: "TimesFM 1.0 weights on Hugging Face, pinned to the paper and repo: patched-decoder zero-shot forecasting, 100B pretraining time-points, and what the announcement omits."
categories: [LLM/Model & Papers]
tags: [llm, model, paper]
date: 2024-05-10 15:41:00 +0800
published: true
ads: false
robots: noindex, follow
sitemap: false
---
# What's New? TimesFM weights on Hugging Face (with what the announcement omits)

The original note was a four-link announcement copy: the TimesFM 1.0 weights (`google/timesfm-1.0-200m`) are on Hugging Face and the code is at <https://github.com/google-research/timesfm>. That is accurate but not sufficient — it states no decision a reader can act on. This rewrite keeps the announcement facts and adds the missing technical substance, pinned to primary sources retrieved 2026-10-14. The post stays out of search and sitemaps under the retired contract (`robots: noindex, follow`, `sitemap: false`, ledger status retired); the remediation for AdSense here is quarantine, not indexation.

## What was released

- Weights: `google/timesfm-1.0-200m` on Hugging Face — the 200M-parameter TimesFM 1.0 checkpoint contemporary with this May 2024 note.
- Code: <https://github.com/google-research/timesfm> (34.5k stars as retrieved; Apache-2.0 code license; note that TimesFM 3.0 weights later moved to a separate non-commercial license — commercial 3.0 use goes through Google Cloud services such as BigQuery ML).
- Paper: Das et al., A decoder-only foundation model for time-series forecasting, arXiv:2310.10688v4 (revised 2024-04-17, ICML 2024) — <https://arxiv.org/abs/2310.10688>.

## What the model actually does

TimesFM is a patched-decoder style attention model pretrained on a large time-series corpus (the announcement cites 100 billion real-world time-points). The paper's verified claim: out-of-the-box zero-shot forecasting across public datasets from different domains comes close to the accuracy of state-of-the-art supervised models trained per dataset, and the same model handles different history lengths, prediction lengths, and temporal granularities. That is the substance behind "impressive zero-shot performance" — one pretrained model, no per-dataset training, near-supervised accuracy.

## What the announcement omits

- The 1.0 release is univariate-first. Native multivariate forecasting with past-only and past-and-future covariates arrived with TimesFM 3.0 (plus fev-bench/TIME/GIFT-Eval top ranks claimed in the repo) — do not read 3.0 capabilities back into the 1.0 weights.
- "100 billion time-points" describes pretraining scale, not a quality guarantee on any single domain. Zero-shot near-parity is dataset-dependent; the paper's own evaluation is per-dataset.
- Serving path matters: the repo now documents PyTorch (`pip install timesfm[torch]`), Apple-silicon MLX, Flax (2.5), LoRA fine-tuning examples, and BigQuery ML / Vertex Model Garden for production. The announcement's two links alone leave a reader with no serving decision.

## Trade-offs

- Use a TimesFM 1.0-class checkpoint when a single zero-shot model must cover many series without per-series training, and the series are univariate with compatible granularity.
- Prefer per-dataset supervised models or the newer multivariate/covariate-capable releases when covariates drive the forecast or when the last accuracy point on one domain matters more than generality.
- License check is part of the decision: 1.0/2.5-era weights are Apache-2.0 while 3.0 self-hosted weights carry the non-commercial license; commercial use of the newest generation belongs on authorized Cloud paths.

## Limitations

- This rewrite did not re-run forecasts; paper and repo numbers are reported as verified source claims as retrieved 2026-10-14.
- The 34.5k-star / 3.3k-fork counts are live repo metadata, not evidence of forecast quality.
- Version details (2.5: 200M params, 16k context, quantile head; 3.0: multivariate) reflect the repo as retrieved; the pinned artifact for this post remains the 1.0 200M weights.

## References

- Das et al., A decoder-only foundation model for time-series forecasting, arXiv:2310.10688v4 — <https://arxiv.org/abs/2310.10688>
- google-research/timesfm repository — <https://github.com/google-research/timesfm>
- TimesFM 1.0 weights, `google/timesfm-1.0-200m` — <https://huggingface.co/google/timesfm-1.0-200m>
- Original announcement post — <https://twitter.com/GoogleAI>

![Times Foundation Model](/assets/img/news/timesFM.jpeg){: .light .w-75 .shadow .rounded-10 w='1212' h='668' }

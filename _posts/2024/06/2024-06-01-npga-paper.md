---
title: "NPGA Audit: Neural Parametric Gaussian Avatars, Two Years On"
description: "A source audit of NPGA against its own tables: the framework is worth 2.01 PSNR at fixed tracking, the expression space 1.44, and the code is still unreleased."
categories: [Multimodal/Computer Vision]
tags: [Multimodal, Vision, Generative Model]
date: 2024-06-01 15:00:00 +0800
image:
  path: /assets/img/posts/2024-06-01-npga-paper/npga-gain-decomposition.svg
  alt: "Bar chart of self-reenactment PSNR on NeRSemble showing NPGA at 30.26, NPGA with BFM at 28.82, GaussianAvatars 27.77, MVP 27.19, GHA 26.81 and GHA with NPHM at 26.60, with brackets marking a 2.01 framework gain and a 1.44 tracking gain"
---

{% include embed/youtube.html id='NGRxAYbIkus' %}

## 🤔 Curiosity: which half of an avatar paper is doing the work?

Every Gaussian-avatar paper ships two things at once: a **driving signal**, the expression space that says what the face is doing, and a **renderer**, the primitives and tricks that make pixels sharp. My prior going in was that announcements mostly sell the renderer while production teams mostly pay for the driving signal. The paper's own numbers turned out to be less tidy than that.

NPGA is a good place to test that, because the authors ran the experiments that separate the two. This post re-reads the paper against its own tables and asks what a game team could adopt today.

*Originally published 2024-06-01. Fully re-audited and rewritten on 2026-09-02 against arXiv:2405.19331v2.*

> **Correction (2026-09-02).** An earlier version of this note credited the wrong authors. The names previously listed here belong to [LangSplat](https://arxiv.org/abs/2312.16084), a different paper. The correct NPGA authors are recorded below.
{: .prompt-warning }

## 📚 Retrieve: what the pinned sources say

**NPGA: Neural Parametric Gaussian Avatars** appeared at **SIGGRAPH Asia 2024** (DOI [10.1145/3680528.3687689](https://doi.org/10.1145/3680528.3687689)), by **Simon Giebenhain**, **Tobias Kirschstein**, **Martin Rünz**, **Lourdes Agapito**, and **Matthias Nießner** (TU Munich, Synthesia, University College London). Every metric below is read from [arXiv:2405.19331v2](https://arxiv.org/abs/2405.19331), the September 2024 revision; repository and project-page facts are dated separately and linked in the References.

The method keeps a canonical 3D Gaussian point cloud and drives it with a **neural** parametric head model instead of a mesh-based 3DMM. The backward deformation field of MonoNPHM is distilled into forward deformations a rasterizer can consume, each Gaussian carries a latent feature conditioning its own dynamics, and Laplacian terms regularize the extra freedom that creates.

### Finding 1 — Two levers, and the paper measures them separately

NPGA reports **30.26 PSNR** on self-reenactment against **27.77** for the strongest baseline. The decomposition is more interesting than the gap.

| Variant | PSNR ↑ | SSIM ↑ | LPIPS ↓ | What it isolates |
|---|---:|---:|---:|---|
| GHA + NPHM | 26.60 | 0.911 | 0.078 | New expression space, old pipeline |
| GHA | 26.81 | 0.914 | 0.077 | Prior high-fidelity Gaussian head |
| MVP | 27.19 | 0.919 | 0.114 | Volumetric primitives baseline |
| GaussianAvatars | 27.77 | 0.926 | 0.104 | FLAME-rigged Gaussians |
| NPGA with BFM | 28.82 | 0.924 | 0.076 | NPGA pipeline, classical 3DMM |
| **NPGA** | **30.26** | **0.934** | **0.055** | Full method |

Two rows in that table hold one variable fixed each, which is what makes them useful.

| Comparison | Held fixed | Delta |
|---|---|---:|
| NPGA with BFM (28.82) vs GHA (26.81) | tracking, both on GHA's BFM codes | **+2.01** |
| NPGA (30.26) vs NPGA with BFM (28.82) | framework, both full NPGA | **+1.44** |
| Full model vs vanilla, three-subject ablation | everything except the add-ons | **+0.49** |

So **neither lever dominates**. At identical BFM tracking the NPGA framework still gains 2.01 PSNR over GHA, which the paper describes as its framework "still slightly outperforms GHA when using the same tracked expression codes." Holding the framework fixed and moving to MonoNPHM tracking is worth a further 1.44. The in-model refinements are the small term: on the three-subject ablation subset the model walks from a vanilla variant at 30.16 through per-Gaussian features and Laplacian smoothing to 30.65 with the CNN, **0.49 PSNR combined**.

Worth noting as an audit observation: the paper calls its 2.6 PSNR margin over baselines "significantly outperforms" while calling its own 2.01 framework margin "slightly outperforms." Read one way that hedging is asymmetric, since the two deltas are comparable. Read another, "slightly" is relative to NPGA's full 3.45 PSNR margin over GHA, which the BFM-tracked variant cuts to 2.01. I record the observation rather than resolve it.

The third row of the main table is the sharpest result. Feeding NPHM codes into the older GHA pipeline made it **worse**, 26.60 against 26.81, and the paper states that "MonoNPHM expression codes alone do not immediately boost performance." It offers a hypothesis: "without NPHM's motion prior as initialization, NPHM's latent expression distribution might provide a more complicated training signal compared to the linear blendshapes of BFM."

One caveat on the 1.44 figure. `Ours_BFM` uses "the BFM tracking from GHA," so the comparison swaps a whole tracking pipeline, not a basis matrix in isolation. In fairness to GHA, it is also the one baseline handled unevenly on resolution: it trains at 1024×1024 and the authors "downsample and crop the generated images accordingly" to score it at 550×802.

### Finding 2 — The headline number and the printed table do not reconcile

The abstract says the method "outperforms the previous state-of-the-art avatars on the self-reenactment task by ≈2.6 PSNR," and the introduction states "2.6 PSNR and 0.021 SSIM."

Against the strongest baseline in Table 1 the gap computes to **2.49 PSNR and 0.008 SSIM**. The 0.021 SSIM figure sits closest to the gap against GHA, 0.020, which is not the strongest baseline on that metric. The paper does not state which pairing produces the headline numbers, so I report the table and flag the mismatch instead of guessing which is authoritative. The direction and rough magnitude survive either way; the figure you quote should come from Table 1.

### Finding 3 — The cost is per identity, and it is not small

| Item | Reported value |
|---|---|
| Training per avatar | ≈30 h on an RTX 3090 (GHA the same; GaussianAvatars ≈7 h and MVP ≈60 h, both on an RTX 2080), plus 5 h of high-resolution fine-tuning for the qualitative results |
| Optimization steps | 800,000 |
| Gaussian budget | capped at 250k primitives |
| Render speed | 31 FPS at 550×802 and 18 FPS at 1100×1604 on an RTX 3080, including deformation, rendering and CNN |
| Render speed without CNN | 43 FPS and 38 FPS respectively |
| GHA baseline, same machine | 22 FPS at 1024×1024, against NPGA's 31 FPS at the smaller 550×802; the paper gives no equal-resolution comparison |
| Evaluation resolution | 550×802, facial region only |

Those figures describe **one head, alone, on a desktop GPU, in an implementation the authors call unoptimized**. Convert them: 31 FPS is about 32 ms per frame, roughly twice the entire 16 ms budget of a 60 Hz frame, and even dropping the CNN (43 FPS, about 23 ms) does not fit. So this is a single-subject, near-real-time technique. It suits a cinematic or a one-on-one dialogue scene, it does not fit inside a 60 Hz frame alongside the rest of a game, and it is nowhere near a crowd.

### Finding 4 — The evaluation masks out exactly what interactive characters need

Metrics are computed on the facial region with neck and torso masked out through segmentation, because those regions "are not accurately explained by NPHM and the underlying 3DMMs" of the baselines. The limitations section is blunter: neck, torso, **tongue, and eyeball rotation** fall outside NPHM's expression codes and "cannot be animated as reliably or might even lead to artifacts due to overfitting."

For film that is a reasonable scope. For an interactive character it is not a cosmetic gap: gaze is how a character signals attention, and the tongue is visible through much of ordinary speech.

### Finding 5 — Reproducibility has not moved in two years

As of **2026-09-02** the project page still shows a **"Code (coming soon)"** button, its GitHub icon points at the author's account rather than a repository, and no NPGA repository exists under that account or in a GitHub repository search. This is not an abandoned-account story: the same author's `NPHM`, `MonoNPHM` and `pixel3dmm` repositories are all public, and `pixel3dmm` was pushed as recently as 2026-01-12.

The data path is gated as well. NeRSemble is public in the sense that anyone may apply, but access runs through a request form and an approval email, and neither of its repositories carries a licence file.

Rights split by venue, and the split matters if you want to reuse anything. The ACM version carries `© rightsretained`, and the project page states no reuse terms for its figures or videos. The arXiv version, however, is published under **CC BY 4.0**, so its figures are reusable with attribution. This post still uses an original diagram, not because the source figures are off limits but because the decomposition it plots is one the paper never draws.

## 💡 Innovation: what I would take into a game pipeline

**Budget the tracker and the consuming architecture together.** Neither lever dominates here: at fixed tracking the framework is worth 2.01 PSNR, and at fixed framework the tracking is worth 1.44. A pipeline stuck at "the face looks slightly wrong" can be failing on either side, so measure both before spending. My earlier comparison of [Gaussian Splatting and NeRF](/posts/nerf-3d-gaussian-splatting/) covers the representation side of that trade-off.

**Do not assume a richer prior drops into an existing pipeline.** GHA plus NPHM going backwards is the cheapest warning in the paper. A better signal needs a consuming architecture, here a distillation step converting backward deformations into rasterizer-compatible forward ones.

**Treat masked metrics as a scope statement.** When a benchmark masks neck and torso, the number describes a face, not a character. Write down which parts your own evaluation excludes, because that list is the honest boundary of the claim.

**Price the cast, not the shot.** At roughly 30 GPU-hours per identity, a twelve-character cast is a scheduling problem before it is a rendering problem. Semantic control of a scene, the direction I looked at in the [LangSplat audit](/posts/llm-3d-gaussian-splatting/), has the same shape: per-scene cost decides whether a technique ships.

**Read the ethics section as a requirements list.** The paper flags identity theft and deepfakes among its concerns. A studio adopting person-specific avatars inherits consent, retention, and revocation questions that no PSNR column measures.

## 🎯 Key Takeaways

- Two levers, both material: at identical BFM tracking the NPGA framework gains **2.01 PSNR** over GHA, and moving that framework to MonoNPHM tracking adds a further **1.44**. The in-model add-ons contribute **0.49** on a three-subject subset.
- The same expression codes fed into the older GHA pipeline **reduced** quality, 26.60 against 26.81, so the distillation step is load-bearing rather than decorative.
- The abstract's "≈2.6 PSNR" does not reconcile with Table 1's 2.49 against the strongest baseline. Quote the table.
- Roughly **30 GPU-hours per identity** and 31 FPS for a single head make this a cinematic or one-on-one technique today, not a crowd technique.
- Neck, torso, tongue and eyeball rotation sit outside the model, and the benchmark masks the first two away.
- **No code, two years on.** Reproduction currently means reimplementation plus a gated dataset request.

## 🤔 New Questions

- Does the 1.44 PSNR expression-space advantage hold on a dataset other than NeRSemble, or is part of it a tracking-quality artifact of the same capture rig?
- What does the gap look like unmasked, with gaze and mouth interior scored?
- Could a lighter distillation target close the 30-hour training gap against FLAME-rigged Gaussians while keeping most of the fidelity?

## References

**Paper and project**
- NPGA paper: <https://arxiv.org/abs/2405.19331> (v2, September 2024)
- ACM entry: <https://doi.org/10.1145/3680528.3687689>
- Project page: <https://simongiebenhain.github.io/NPGA/>

**Underlying models and data**
- NPHM (CVPR 2023): <https://simongiebenhain.github.io/NPHM/>
- MonoNPHM: <https://arxiv.org/abs/2312.06740>
- NeRSemble dataset: <https://tobias-kirschstein.github.io/nersemble/>

**Baselines referenced**
- GaussianAvatars: <https://arxiv.org/abs/2312.02069>
- 3D Gaussian Splatting: <https://repo-sam.inria.fr/fungraph/3d-gaussian-splatting/>

**Licence of the arXiv version**
- CC BY 4.0, stated on <https://arxiv.org/abs/2405.19331>

**Repositories checked for the code-availability finding**
- <https://github.com/SimonGiebenhain/NPHM>
- <https://github.com/SimonGiebenhain/MonoNPHM>
- <https://github.com/SimonGiebenhain/pixel3dmm>
- <https://github.com/tobias-kirschstein/nersemble-data>

> **Editorial method:** this audit was researched and drafted with AI assistance under an evidence-gated editorial process, then revised across three independent review passes. Every metric above is read from arXiv:2405.19331v2 or from the primary pages linked in this section, and the figure is original rather than reproduced, because the decomposition it plots does not appear in the paper.
{: .prompt-info }

<details markdown="1">
<summary style= "font-size:24px; line-height:24px; font-weight:bold; cursor:pointer;" > 한국어 요약 </summary>

NPGA(SIGGRAPH Asia 2024, Giebenhain 외)는 3D 가우시안 스플래팅 아바타를 메시 기반 3DMM 대신 **신경 파라메트릭 헤드 모델(MonoNPHM)**의 표정 공간으로 구동한다.

논문의 표에는 변수를 하나씩 고정한 비교가 두 개 있다. 트래킹을 GHA의 BFM으로 똑같이 맞추면 NPGA 프레임워크가 **+2.01 PSNR**, 프레임워크를 고정하고 트래킹을 MonoNPHM으로 바꾸면 **+1.44 PSNR**이다. 즉 **어느 한쪽이 지배적이지 않다.** 모델 내부 개선(per-Gaussian 특징·Laplacian·CNN)은 3인 부분집합에서 합쳐 **0.49 PSNR**로 가장 작다. 한편 기존 GHA 파이프라인에 NPHM 코드만 넣으면 오히려 **떨어진다**(26.60 대 26.81) — 표정 공간을 받아먹을 구조, 여기서는 증류 단계가 함께 있어야 한다.

실무 제약도 분명하다. 아바타 1인당 학습이 **RTX 3090으로 약 30시간**, 렌더는 550×802에서 31 FPS(단일 두상)이고, 평가는 목·몸통을 마스킹한 얼굴 영역만이며 **혀와 안구 회전은 모델 밖**이다. 코드는 **2026-09-02 현재까지 미공개**이고 NeRSemble은 신청·승인이 필요하다.

</details>

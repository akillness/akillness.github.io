---
title: "LangSplat Two Years On: 3D Language Gaussians, the 199× Claim, and the License"
description: "LangSplat re-read against its pinned repository and the 2025 follow-ups: what the 199× speedup measures, what V2 changed, and the non-commercial license the 2024 note skipped."
categories: [AI, Research]
tags: [gaussian-splatting, 3d-vision, langsplat, open-vocabulary, clip, sam, licensing]
date: 2024-06-01 12:00:00 +0800
last_modified_at: 2026-10-14 12:40:00 +0900
archive_developed: "2026-10-14"
archive_development_note: "Rebuilt from a June 2024 summary of a LinkedIn post. I re-read the arXiv v2 paper, the official repository at commit d70edb8, the LangSplatV2 (NeurIPS 2025) and Occam's LGS (BMVC 2025) papers, and the repository license. Every number below comes from those sources with its scope attached; the old diagrams and the conceptual code sample were removed."
published: true
---

## Can a game team query a splatted scene by name in 2026?

The question that made this note worth keeping is practical. A studio that already captures environments as 3D Gaussian Splatting scenes wants to type "the red chair" or "the broken railing" and get the matching region back, for asset QA, level audits, or an agent that has to reason about a space. [LangSplat](https://arxiv.org/abs/2312.16084v2) (Qin, Li, Zhou, Wang, Pfister; CVPR 2024) was the first widely cited method to attach CLIP language features to Gaussians instead of to a NeRF, and the 2024 version of this note repeated its headline: precise 3D language fields, "199× faster than LERF".

That headline is true, but it answers a narrower question than the one above. This rebuild re-reads the paper at arXiv v2 (31 March 2024), the official repository at commit `d70edb8` (pushed 10 October 2025), and the two follow-ups that changed the picture in 2025, and it adds the one fact a team must know before it clones anything: the code ships under the Inria/MPII Gaussian-Splatting license, which is research and evaluation only.

## What the paper and the pinned repository actually do

LangSplat does not learn language features during scene reconstruction. It is a second training stage bolted onto a finished 3D Gaussian Splatting model, and the repository makes that explicit: you must first produce a standard 3DGS output (`point_cloud/iteration_30000/point_cloud.ply`, `chkpnt30000.pth`, COLMAP `sparse/0`) with the original `gaussian-splatting` code before any LangSplat script runs.

The pipeline, as documented in the paper and the README at `d70edb8`:

| Stage | What runs | Source of the detail |
|---|---|---|
| RGB scene | Standard 3DGS training, 30,000 iterations; paper scenes end with roughly 2.5 million Gaussians | Paper §4, implementation details |
| 2D masks | SAM ViT-H driven by a regular 32×32 grid of point prompts, producing three mask levels per image: whole, part, subpart | Paper §3 (hierarchical semantics with SAM); `preprocess.py` |
| 2D language features | OpenCLIP ViT-B/16 embeddings (512-d) per mask region, saved as `language_feature/*_f.npy` and `*_s.npy` | Paper §4, implementation details; README dataset layout |
| Scene autoencoder | An MLP compresses the 512-d CLIP features to a 3-d scene-specific latent; the README's default is `--encoder_dims 256 128 64 32 3` | Paper §3 (scene-wise language autoencoder); README "train the autoencoder" |
| 3D language Gaussians | Position, scale, opacity are frozen; only a 3-d language feature per Gaussian is trained, 30,000 iterations, once per semantic level (`--feature_level 1/2/3`) | Paper §3; README Step 3 |
| Query | Render the 3-d feature map with the tile-based rasterizer (`langsplat-rasterization`), decode back to 512-d CLIP space, compare with the text embedding | Paper §3 (open-vocabulary querying) |

Two consequences follow directly from that table. First, the "3-d" trick is not cosmetic: the paper reports that storing raw 512-d CLIP features on every Gaussian raises memory "by over 35 times" compared with plain RGB without spherical harmonics, and the ablation row that tries it simply reads `OOM`. Second, a scene costs three language trainings, one per SAM level, on top of the RGB training; the README asks for a CUDA GPU with 24 GB of VRAM "to train to paper evaluation quality", and the paper quotes about 25 minutes per 1440×1080 scene on an RTX 3090 for its own setting.

The accuracy claims are measured on two small benchmarks. On the LERF dataset the paper reports 84.3% overall localization accuracy against 73.6% for LERF, and 51.4% mean IoU for open-vocabulary segmentation against 37.4%. On the 3D-OVS `bench` scene the full model reaches 94.2% mIoU. Those are four indoor scenes plus a handful of tabletop captures; nothing in the paper measures a game-scale environment.

## The 199× number is a per-query ablation, not a frame rate

The figure that travelled furthest is the easiest to misread. In the paper's ablation on the 3D-OVS `bench` scene at 1440×1080, the LERF-equivalent baseline needs 55.7 seconds per text query and the full LangSplat needs 0.28 seconds per query, which is where 199× comes from. On the `ramen` scene at 988×731 the same comparison is 30.93 s versus 0.26 s. "Query" here means rendering the feature map for one view and decoding it; it is a latency per text prompt, not a rendering rate.

The LangSplatV2 paper, written by the same group, measured the original model again in 2025 on an A100 and reported the stage breakdown: 6.0 ms rendering, 83.1 ms decoding, 33.0 ms post-processing, 122.1 ms in total, which is 8.2 FPS. More than two thirds of the time is the MLP decoder that turns the 3-d latent back into 512-d CLIP space. So in 2024 LangSplat was two orders of magnitude faster than LERF and still not interactive; both statements are in the authors' own tables.

## What changed since 2024: V2, 4D, and training-free variants

| Method | Venue | What it changes | Reported cost or speed | Code state when read (2026-10-14) |
|---|---|---|---|---|
| LangSplat | CVPR 2024 | 3-d scene latent, SAM three-level semantics, tile-based feature splatting | 0.26–0.28 s per query (paper); 8.2 FPS on A100 (measured in V2) | `minghanqin/LangSplat`, 1,096 stars, last push 2025-10-10, 46 open issues, README still says "under development" |
| LangSplatV2 | NeurIPS 2025 | Each Gaussian becomes a sparse code over a global codebook; the heavy decoder disappears | 384.6 FPS text querying, 476.2 FPS feature splatting on A100; training 3.0 h and 21.2 GB vs 1.0 h and 6.2 GB for LangSplat | `ZhaoYujie2002/LangSplatV2`, 254 stars, 8 commits, last push 2025-10-17, no license file |
| 4D LangSplat | CVPR 2025 | Time-varying language fields from video using multimodal LLM prompting | Not re-read for this rebuild | Linked from the LangSplat README |
| Occam's LGS | BMVC 2025 | Training-free aggregation of 2D features into Gaussians; keeps full 512-d features | Reports LangSplat's three-level feature training at 67 minutes and claims roughly 100× faster uplifting; +1.6% mIoU over LangSplat on 3D-OVS | `insait-institute/OccamLGS`, 72 stars, last push 2025-11-18 |

Three things in that table matter more than the FPS headline. The V2 training-cost comparison shows the trade: the real-time query speed is bought with three times the training time and three times the memory of the original, and the naive "LangSplat-512D" baseline that skips compression is listed at 45 hours and 47.4 GB, which is the same OOM wall the 2024 paper hit, now with a number on it. Occam's LGS argues the opposite direction, that the per-scene feature training can be skipped entirely by modelling the splatting forward pass, and it reuses LangSplat's own preprocessing and evaluation protocol to say so. And the original repository is maintained in the thinnest sense: the last commit is a README update pointing at V2, the TODO list still carries a "coming soon" item, and the open-issue count has reached 46.

For a team choosing in 2026, the practical reading is that LangSplat is now the reference recipe and the evaluation protocol, while V2 or a training-free method is the thing you would actually deploy for interactive querying. For a reader who wants the representation itself explained first, the site's [3D Gaussian Splatting vs. NeRF note](/posts/nerf-3d-gaussian-splatting/) covers the rendering difference that makes feature splatting cheap in the first place.

## The license is the part the 2024 note skipped

`LICENSE.md` in the LangSplat repository is the Gaussian-Splatting License from Inria and the Max Planck Institut für Informatik. Its rights section grants a non-exclusive licence "for research purposes to research users (both academic and industrial), free of charge, without right to sublicense", and states that the software "may be used 'non-commercially', i.e., for research and/or evaluation purposes only". The custom rasterizer the project depends on, `langsplat-rasterization`, states in its README that it is based on Inria's `diff-gaussian-rasterization` and ships the same Gaussian-Splatting License, so the restriction is not confined to one file.

That changes the engineering question for a studio. Evaluating LangSplat on captured levels is squarely inside the licence; shipping a tool built on this code, or embedding the rasterizer in a product, is a licensing conversation with Inria and MPII before it is an integration task. The V2 repository, read at commit `1667303`, carries no license file at all, which under default copyright means no rights are granted beyond reading the code. The same pattern appears in other projects this site has audited, where a permissive badge and the actual grant disagree; the [OpenOcta license audit](/posts/openocta-license-drift-audit/) is the closest comparison.

## What a game or QA team should do with it now

I did not run the code for this rebuild; the recommendations below are read from the sources above, not from a reproduction.

- **Treat it as an offline annotation pass, not a runtime feature.** Per-scene training of three semantic levels after a full 3DGS reconstruction, with a 24 GB GPU, fits a build-time pipeline that tags captured environments for QA or search. It does not fit an in-game query loop; for that, V2's decoder-free design is the published answer.
- **Benchmark on your own captures with the LERF protocol.** The paper's accuracy comes from four indoor LERF scenes and 3D-OVS tabletop captures. The repository ships the LERF evaluation code, so the honest first experiment is to annotate a handful of your own scenes the same way and measure localization accuracy and IoU before believing any transfer.
- **Decide the licence before the sprint.** Research use is fine; a shippable tool needs a separate agreement or a differently licensed implementation. Put that check next to the GPU requirement in the plan, where this site's [NPGA audit](/posts/npga-paper/) also found that a Gaussian-based method's practical limits were in the surrounding stack rather than the idea.
- **Expect the 3-d latent to be scene-specific.** The autoencoder is trained per scene, so features do not transfer between captures and a text query is compared after decoding. A cross-scene asset search needs either V2's global codebook or a method that keeps full CLIP dimensionality, which is Occam's LGS's whole argument.

## Key Takeaways

- LangSplat is a second training stage on a finished 3DGS scene: SAM masks at three levels, OpenCLIP ViT-B/16 features, a per-scene 512→3 autoencoder, and one language training per level.
- The 199× figure is seconds-per-text-query in an ablation (55.7 s → 0.28 s at 1440×1080); the same authors later measured the full model at 8.2 FPS on an A100, with the decoder taking 83 of 122 ms.
- LangSplatV2 (NeurIPS 2025) removes the decoder and reports 384.6 FPS querying, at three times the training time and memory; Occam's LGS (BMVC 2025) removes the feature training instead.
- The repository is licensed for research and evaluation only under the Inria/MPII Gaussian-Splatting License; the V2 repository carries no license file.
- Accuracy evidence is limited to LERF and 3D-OVS scenes; a game-scale claim requires your own measurement.

## New Questions

- How does localization accuracy degrade on a large game environment where SAM's three levels no longer map cleanly onto whole, part and subpart of an object?
- Can V2's global codebook be shared across captures of the same level over time, turning per-scene fields into a searchable asset index?
- Which of the training-free approaches keeps enough boundary precision for QA use, where a wrong mask is worse than a slow one?
- What would a commercial licence for the rasterizer cost relative to re-implementing feature splatting on a permissively licensed renderer such as gsplat?

## References

Read on 2026-10-14.

**Papers**

- [LangSplat: 3D Language Gaussian Splatting, arXiv:2312.16084v2](https://arxiv.org/abs/2312.16084v2), Qin, Li, Zhou, Wang, Pfister; v2 dated 31 March 2024; CVPR 2024 Highlight. Numbers used: Tables 1–4, the method section (§3), and the implementation details in §4.
- [LangSplatV2: High-dimensional 3D Language Gaussian Splatting with 450+ FPS, arXiv:2507.07136v2](https://arxiv.org/abs/2507.07136v2), Li, Zhao, Qin, Liu, Cai, Gan, Pfister; v2 dated 8 October 2025; NeurIPS 2025. Numbers used: Table 1 (stage timing) and Table 7 (training cost).
- [Occam's LGS: A simple approach for Language Gaussian Splatting, arXiv:2412.01807v1](https://arxiv.org/html/2412.01807v1), BMVC 2025. Numbers used: §4.3 and §4.5.

**Repositories (pinned)**

- [minghanqin/LangSplat at d70edb86](https://github.com/minghanqin/LangSplat/tree/d70edb86df0fcbda19dc0d9739a3e5140a5e65fc): README pipeline, hardware requirements, TODO list; [LICENSE.md](https://github.com/minghanqin/LangSplat/blob/d70edb86df0fcbda19dc0d9739a3e5140a5e65fc/LICENSE.md) (Gaussian-Splatting License). Repository metadata via the GitHub API on 2026-10-14: 1,096 stars, 46 open issues, last push 2025-10-10.
- [minghanqin/langsplat-rasterization](https://github.com/minghanqin/langsplat-rasterization): the modified rasterizer.
- [ZhaoYujie2002/LangSplatV2 at 1667303d](https://github.com/ZhaoYujie2002/LangSplatV2/tree/1667303d5c111a5b62f69b9b8991d80045e92b5f): 254 stars, 8 commits, last push 2025-10-17, no license file at the pinned commit.
- [insait-institute/OccamLGS at eb98bcbe](https://github.com/insait-institute/OccamLGS/tree/eb98bcbedfdeb8770aae51d62c0263bddbc54329): 72 stars, last push 2025-11-18.

**Project pages**

- [LangSplat project page](https://langsplat.github.io/) and [LangSplatV2 project page](https://langsplat-v2.github.io/), including the authors' video results.

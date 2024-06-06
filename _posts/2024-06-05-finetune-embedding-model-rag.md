---
title: Fine-tune Embedding models for Retrieval Augmented Generation (RAG)
description: NVIDIA, Embedding Model, RAG
categories: [Script, RAG]
tags: [NVIDIA, Embedding Model, RAG]
# author: foDev_jeong
date: 2024-06-05 11:00:00 +0800
# pin: true
# mermaid: true
# render_with_liquid: false
# image:
#   path: /assets/img/blog/NLP_Overview.svg
#   lqip: data:image/webp;base64,UklGRpoAAABXRUJQVlA4WAoAAAAQAAAADwAABwAAQUxQSDIAAAARL0AmbZurmr57yyIiqE8oiG0bejIYEQTgqiDA9vqnsUSI6H+oAERp2HZ65qP/VIAWAFZQOCBCAAAA8AEAnQEqEAAIAAVAfCWkAALp8sF8rgRgAP7o9FDvMCkMde9PK7euH5M1m6VWoDXf2FkP3BqV0ZYbO6NA/VFIAAAA
#   alt: [Overview of NLP Course]
---

## Fine-tuning can significantly boost retrieval. 👀

Embedding models are crucial for Retrieval-Augmented Generation (RAG) applications, but general models often fall short of domain-specific tasks. 

Excited to share a new blog on how to fine-tune embedding models for financial RAG applications using NVIDIA's 2023 SEC Filing dataset using latest research, like Matryoshka Representation Learning:

- 🚀 Fine-tuning boosts performance between 7.4% to 22.55% with just 6.3k samples
- ✅ Baseline creation + evaluation during training
- 🧬 Synthetic data generated used for fine-tuning
- ⏱️ Training on ~10,000 only 5 minutes on consumer-grade GPUs
- 🪆 Matryoshka keeps 99% performance at 6x smaller size
- 📈 Fine-tuned 128-dim model outperforms baseline 768-dim by 6.51%
- 🆕 Uses the new Sentence Transformers v3


👉 Original Article : <https://www.philschmid.de/fine-tune-embedding-model-for-rag>

👉 Code : <https://github.com/philschmid/deep-learning-pytorch-huggingface/blob/main/training/fine-tune-embedding-model-for-rag.ipynb>

Go build! 🤗

<details markdown="1">
<summary style= "font-size:24px; line-height:24px; font-weight:bold; cursor:pointer;" > Translate to Korean </summary>

##  미세 조정은 검색 속도를 크게 높일 수 있습니다. 👀

임베딩 모델은 RAG(Retrieval-Augmented Generation) 애플리케이션에 매우 중요하지만 일반 모델은 도메인별 작업에 미치지 못하는 경우가 많습니다. 

Matryoshka Representation Learning과 같은 최신 연구를 사용하여 NVIDIA의 2023 SEC Filing 데이터 세트를 사용하여 금융 RAG 애플리케이션용 임베딩 모델을 미세 조정하는 방법에 대한 새로운 블로그를 공유하게 되어 기쁩니다.

- 🚀 미세 조정으로 단 6.3k 샘플로 7.4%에서 22.55%까지 성능 향상
- ✅ 기준 생성 + 학습 중 평가
- 🧬 미세 조정에 사용되는 생성된 합성 데이터
- ⏱️ ~10,000에 대한 교육, 소비자용 GPU에서 단 5분
- 🪆 Matryoshka는 6배 더 작은 크기로 99%의 성능을 유지합니다.
- 📈 미세 조정된 128-dim 모델은 기준 768-dim보다 6.51% 더 우수합니다.
- 🆕 새로운 문장 변환기 v3 사용

빌드하러 가세요! 🤗

</details>
---
title: 🕹️ NVIDIA introduces RankRAG 8B & 70B
description: NVIDIA, RankRAG
categories: [LLM, RankRAG]
tags: [NVIDIA, RankRAG]
# author: foDev_jeong
date: 2024-07-13 15:00:00 +0800
# pin: true
# math: true
# mermaid: true
# image:
#   path: /assets/img/cover/programming.jpeg
#   lqip: data:image/webp;base64,UklGRpoAAABXRUJQVlA4WAoAAAAQAAAADwAABwAAQUxQSDIAAAARL0AmbZurmr57yyIiqE8oiG0bejIYEQTgqiDA9vqnsUSI6H+oAERp2HZ65qP/VIAWAFZQOCBCAAAA8AEAnQEqEAAIAAVAfCWkAALp8sF8rgRgAP7o9FDvMCkMde9PK7euH5M1m6VWoDXf2FkP3BqV0ZYbO6NA/VFIAAAA
#   alt: [2024 programming curriculum by honglab]
---

![ NVIDIA RankRAG ](/assets/img/llm/NVIDIA-RankRAG.jpeg){: .light .shadow .rounded-10 w='1212' h='668' }

> 👉 Pager : <https://arxiv.org/pdf/2407.02485>
{: .prompt-info}

## Dual-purpose re-ranker/generation models that outperform GPT-4 across 9 RAG benchmarks 👇👇👇

Traditional RAG methods retrieve the top-k contexts from a database in order to generate answers using an LLM, but face challenges when too many contexts exceed the generation context window or poor recall when k is too small. 

The RankRAG framework overcomes these issues by instruction-tuning a single LLM for both context re-ranking and answer generation, enhancing its ability to identify relevant contexts from a larger retrieved k and deliver high-quality answers.

Method:
- 1️⃣ Perform instruction tuning using multiple datasets (e.g., Flan, Dolly, etc.).
- 2️⃣ Merge original instruction data with QA data, RAG QA data, context ranking data, and RAG ranking data.
- 3️⃣ Fine-tune model again on these combined specialized datasets.
- 4️⃣ Evaluate on open QA, fact verification, and conversational QA datasets.
- 5️⃣ Use the Dragon retriever for context retrieval and RankRAG for ranking and answer generation.

Insights:
- 🔸 RankRAG 8B and 70B models surpass GPT-4 across 9 RAG benchmarks.
- 🔸 Average scores: GPT-4 = 43.5, RankRAG 8B = 52.6, RankRAG 70B = 56.1.
- 🔸 RankRAG shows notable performance gains over ChatQA 1.5, particularly on challenging benchmarks due to initial retrieval difficulty.
- 🔸 RankRAG demonstrates strong generalization, matching GPT-4's performance on 5 biomedical RAG benchmarks.
- 🔸 RankRAG also exceeds the performance of specialized re-ranking models trained on larger datasets.
- 🔸 Incorporating just 1% ranking data with instruction data yields significant improvements.

<details markdown="1">
<summary style= "font-size:24px; line-height:24px; font-weight:bold; cursor:pointer;" > Translate to Korean </summary>

* * * 

## 8개의 RAG 벤치마크에서 GPT-4를 능가하는 이중 목적 재랭커/생성 모델 👇👇👇

기존의 RAG 방법은 LLM을 사용하여 답변을 생성하기 위해 데이터베이스에서 top-k 컨텍스트를 검색하지만, 생성 컨텍스트 창을 초과하는 컨텍스트가 너무 많거나 k가 너무 작을 때 재현율이 낮을 때 문제가 발생합니다. 

RankRAG 프레임워크는 컨텍스트 재순위 지정과 답변 생성 모두를 위해 단일 LLM을 명령어 튜닝하여 이러한 문제를 극복하고, 더 큰 검색된 k에서 관련 컨텍스트를 식별하고 고품질 답변을 제공하는 능력을 향상시킵니다.

메서드:
- 1️⃣ 여러 데이터 세트(예: Flan, Dolly 등)를 사용하여 명령어 튜닝을 수행합니다.
- 2️⃣ 원본 지침 데이터를 QA 데이터, RAG QA 데이터, 컨텍스트 순위 데이터 및 RAG 순위 데이터와 병합합니다.
- 3️⃣ 이러한 결합된 특수 데이터 세트에서 모델을 다시 미세 조정합니다.
- 4️⃣ 개방형 QA, 사실 확인 및 대화형 QA 데이터 세트에 대해 평가합니다.
- 5️⃣ 컨텍스트 검색에는 드래곤 리트리버를 사용하고 순위 및 답변 생성에는 RankRAG를 사용합니다.

통찰:
- 🔸 RankRAG 8B 및 70B 모델은 9개의 RAG 벤치마크에서 GPT-4를 능가합니다.
- 🔸 평균 점수: GPT-4 = 43.5, RankRAG 8B = 52.6, RankRAG 70B = 56.1.
- 🔸 RankRAG는 ChatQA 1.5에 비해 특히 초기 검색의 어려움으로 인해 까다로운 벤치마크에서 눈에 띄는 성능 향상을 보여줍니다.
- 🔸 RankRAG는 5개의 생물의학 RAG 벤치마크에서 GPT-4의 성능과 일치하는 강력한 일반화를 보여줍니다.
- 🔸 RankRAG는 또한 더 큰 데이터 세트에서 훈련된 특수 순위 재지정 모델의 성능을 능가합니다.
- 🔸 1%의 순위 데이터만 지침 데이터와 통합하면 상당한 개선이 이루어집니다.

</details>
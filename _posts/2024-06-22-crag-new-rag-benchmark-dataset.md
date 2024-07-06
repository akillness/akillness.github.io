---
title: 💡 CRAG (Comprehensive RAG) is a new RAG benchmark dataset 
description: CRAG, LLM
categories: [LLM, CRAG]
tags: [RAG, CRAG]
# author: foDev_jeong
date: 2024-06-22 19:10:00 +0800
# pin: true
# math: true
# mermaid: true
# image:
#   path: /assets/img/cover/programming.jpeg
#   lqip: data:image/webp;base64,UklGRpoAAABXRUJQVlA4WAoAAAAQAAAADwAABwAAQUxQSDIAAAARL0AmbZurmr57yyIiqE8oiG0bejIYEQTgqiDA9vqnsUSI6H+oAERp2HZ65qP/VIAWAFZQOCBCAAAA8AEAnQEqEAAIAAVAfCWkAALp8sF8rgRgAP7o9FDvMCkMde9PK7euH5M1m6VWoDXf2FkP3BqV0ZYbO6NA/VFIAAAA
#   alt: [2024 programming curriculum by honglab]
---

## 😉 Here's a tough real-world benchmark to put your RAG pipeline to the test! Even LLMs like GPT-4 struggle, achieving less than 34% accuracy.

Existing RAG datasets lack diversity and fail to represent the complexity of real-world QA tasks, leading to suboptimal performance evaluation.

💡 CRAG (Comprehensive RAG) is a new RAG benchmark dataset that provides a robust and challenging test-cases for evaluating RAG and QA systems, encouraging advancements in reliable LLM-based question answering.

- ⛳ CRAG includes 4,409 QA pairs across five domains and eight question categories, covering simple facts to complex queries.
- ⛳ Provides mock APIs for web and Knowledge Graph (KG) search, offering realistic retrieval scenarios.
- ⛳ Introduces a score system that penalizes hallucinated answers more than missing answers, ensuring reliable evaluations.
- ⛳ Offers tasks for web retrieval, structured querying, and summarization, allowing comprehensive evaluation of RAG solutions.

Contribution
- 👉 Most advanced LLMs achieve <34% accuracy on CRAG, highlighting the challenge.
- 👉 Direct application of RAG improves accuracy to only 44%, indicating the need for more advanced solutions.
- 👉 State-of-the-art industry RAG solutions reach 63% accuracy without hallucination.


Link to the paper: <https://arxiv.org/pdf/2406.04744>

![ CRAG abstract ](/assets/img/llm/CRAG_abstract.jpeg){: .light .shadow .rounded-10 w='1212' h='668' }

<details markdown="1">
<summary style= "font-size:24px; line-height:24px; font-weight:bold; cursor:pointer;" > Translate to Korean </summary>

* * * 

## 😉 다음은 RAG 파이프라인을 테스트할 수 있는 어려운 실제 벤치마크입니다! GPT-4와 같은 LLM조차도 34% 미만의 정확도를 달성하는 데 어려움을 겪고 있습니다.

기존 RAG 데이터 세트는 다양성이 부족하고 실제 QA 작업의 복잡성을 나타내지 못하여 성능 평가가 최적화되지 않습니다.

💡 CRAG(Comprehensive RAG)는 RAG 및 QA 시스템을 평가하기 위한 강력하고 도전적인 테스트 케이스를 제공하는 새로운 RAG 벤치마크 데이터 세트로, 신뢰할 수 있는 LLM 기반 질문 답변의 발전을 장려합니다.

- ⛳ CRAG에는 5개 도메인과 8개 질문 범주에 걸쳐 4,409개의 QA 쌍이 포함되어 있으며, 간단한 사실부터 복잡한 쿼리까지 다룹니다.
- ⛳ 웹 및 KG(Knowledge Graph) 검색을 위한 모의 API를 제공하여 현실적인 검색 시나리오를 제공합니다.
- ⛳ 미결 답변보다 환각에 걸린 답변에 더 많은 페널티를 주는 점수 시스템을 도입하여 신뢰할 수 있는 평가를 보장합니다.
- ⛳ 웹 검색, 구조적 쿼리 및 요약을 위한 작업을 제공하여 RAG 솔루션을 종합적으로 평가할 수 있습니다.

기여
- 👉 가장 진보된 LLM은 다음과 같은 성과를 거둡니다. <34% accuracy on CRAG, highlighting the challenge.
- 👉 Direct application of RAG improves accuracy to only 44%, indicating the need for more advanced solutions.
- 👉 State-of-the-art industry RAG solutions reach 63% accuracy without hallucination.


</details>
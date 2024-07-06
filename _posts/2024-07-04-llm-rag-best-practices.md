---
title: 𝐋𝐋𝐌 𝐑𝐀𝐆 𝐁𝐞𝐬𝐭 𝐏𝐫𝐚𝐜𝐭𝐢𝐜𝐞𝐬
description: Rag, Practices
categories: [LLM, RAG]
tags: [RAG, Practices]
# author: foDev_jeong
date: 2024-07-05 22:10:00 +0800
# pin: true
# math: true
# mermaid: true
# image:
#   path: /assets/img/cover/programming.jpeg
#   lqip: data:image/webp;base64,UklGRpoAAABXRUJQVlA4WAoAAAAQAAAADwAABwAAQUxQSDIAAAARL0AmbZurmr57yyIiqE8oiG0bejIYEQTgqiDA9vqnsUSI6H+oAERp2HZ65qP/VIAWAFZQOCBCAAAA8AEAnQEqEAAIAAVAfCWkAALp8sF8rgRgAP7o9FDvMCkMde9PK7euH5M1m6VWoDXf2FkP3BqV0ZYbO6NA/VFIAAAA
#   alt: [2024 programming curriculum by honglab]
---

## Generative large language models are prone to producing outdated information or fabricating facts.

Retrieval-augmented generation (RAG) techniques address the LLM limitations by integrating up-to-date information, mitigating hallucinations, and enhancing response quality, particularly in specialized domains.

### 𝐑𝐀𝐆 𝐖𝐨𝐫𝐤𝐟𝐥𝐨𝐰

A typical RAG workflow usually contains multiple intervening processing steps: 
- 𝒒𝒖𝒆𝒓𝒚 𝒄𝒍𝒂𝒔𝒔𝒊𝒇𝒊𝒄𝒂𝒕𝒊𝒐𝒏 (determining whether retrieval is necessary for a given input query), 
- 𝒓𝒆𝒕𝒓𝒊𝒆𝒗𝒂𝒍 (efficiently obtaining relevant documents for the query), 
- 𝒓𝒆𝒓𝒂𝒏𝒌𝒊𝒏𝒈 (refining theorder of retrieved documents based on their relevance to the query), 
- 𝒓𝒆𝒑𝒂𝒄𝒌𝒊𝒏𝒈 (organizing the retrieved documents into a structured one for better generation), 
- 𝒔𝒖𝒎𝒎𝒂𝒓𝒊𝒛𝒂𝒕𝒊𝒐𝒏 (extracting key information for response generation from the repacked document and eliminating redundancies)

### 𝐑𝐀𝐆 𝐛𝐞𝐬𝐭 𝐩𝐫𝐚𝐜𝐭𝐢𝐜𝐞𝐬

- 𝑩𝒆𝒔𝒕 𝑷𝒆𝒓𝒇𝒐𝒓𝒎𝒂𝒏𝒄𝒆 𝑷𝒓𝒂𝒄𝒕𝒊𝒄𝒆 : To achieve the highest performance, it is recommended to incorporate query classification module, use the “Hybrid with HyDE” method for retrieval, employ monoT5 for reranking, opt for Reverse for repacking, and leverage Recomp for summarization

- 𝑩𝒂𝒍𝒂𝒏𝒄𝒆𝒅 𝑬𝒇𝒇𝒊𝒄𝒊𝒆𝒏𝒄𝒚 𝑷𝒓𝒂𝒄𝒕𝒊𝒄𝒆: In order to achieve a balance between performance and efficiency, it is recommended to incorporate the query classification module, implement the Hybrid method for retrieval, use TILDEv2 for reranking, opt for Reverse for repacking, and employ Recomp for
summarization.

RAG Best Practices paper details (refer to the comments)

![ LLM RAG Best Practices ](/assets/img/llm/LLM_RAG_Best_Practices.jpeg){: .light .shadow .rounded-10 w='1212' h='668' }

<details markdown="1">
<summary style= "font-size:24px; line-height:24px; font-weight:bold; cursor:pointer;" > Translate to Korean </summary>

* * * 

## 생성적 대형 언어 모델은 오래된 정보를 생성하거나 사실을 조작하는 경향이 있습니다.

검색 증강 생성(RAG) 기술은 특히 전문 영역에서 최신 정보를 통합하고, 환각을 완화하고, 응답 품질을 향상시켜 LLM 제한 사항을 해결합니다.

### RAG 작업 흐름

일반적인 RAG 워크플로우에는 일반적으로 여러 개입 처리 단계가 포함됩니다.
- 쿼리 분류(주어진 입력 쿼리에 대해 검색이 필요한지 여부 결정),
- 검색기(쿼리와 관련된 문서를 효율적으로 가져옴),
- 순위 재지정(쿼리와의 관련성에 따라 검색된 문서의 순서를 재정의함)
- 재포장(더 나은 생성을 위해 검색된 문서를 구조화된 문서로 구성),
- 요약(리패킹된 문서에서 응답 생성을 위한 핵심 정보 추출 및 중복 제거)

### 래그 인피 관행

- 모범 사례 : 최고의 성능을 달성하려면 쿼리 분류 모듈을 통합하고, 검색을 위해 "Hybrid with HyDE" 방법을 사용하고, 순위 재지정을 위해 monoT5를 사용하고, 재패킹을 위해 Reverse를 선택하고, 요약을 위해 Recomp를 활용하는 것이 좋습니다.

- 균형 잡힌 효율성 실천: 성능과 효율성 사이의 균형을 이루기 위해 쿼리 분류 모듈을 통합하고, 검색을 위해 Hybrid 방법을 구현하고, reranking을 위해 TILDEv2를 사용하고, repacking을 위해 Reverse를 선택하고, Recomp를 사용하는 것을 권장합니다.
요약.

RAG 모범 사례 문서 세부 정보(설명 참조)

</details>
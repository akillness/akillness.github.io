---
title: 𝐋𝐋𝐌 𝐑𝐀𝐆 𝐁𝐞𝐬𝐭 𝐏𝐫𝐚𝐜𝐭𝐢𝐜𝐞𝐬
description: Rag, Practices
categories: [LLM, RAG]
tags: [RAG, Practices]
# author: foDev_jeong
date: 2024-07-04 22:10:00 +0800
pin: true
# math: true
# mermaid: true
image:
  path: /assets/img/llm/The-Evolution-of-RAG-Models.jpeg
  lqip: data:image/webp;base64,UklGRpoAAABXRUJQVlA4WAoAAAAQAAAADwAABwAAQUxQSDIAAAARL0AmbZurmr57yyIiqE8oiG0bejIYEQTgqiDA9vqnsUSI6H+oAERp2HZ65qP/VIAWAFZQOCBCAAAA8AEAnQEqEAAIAAVAfCWkAALp8sF8rgRgAP7o9FDvMCkMde9PK7euH5M1m6VWoDXf2FkP3BqV0ZYbO6NA/VFIAAAA
  alt: [ The Evolution of RAG Models ]
---

## Generative large language models are prone to producing outdated information or fabricating facts.

Retrieval-augmented generation (RAG) techniques address the LLM limitations by integrating up-to-date information, mitigating hallucinations, and enhancing response quality, particularly in specialized domains.

### 😅 The pace of RAG research is super impressive, but not all of it is practical for real-world use cases. 

Many latest research works seek to improve performance over basic RAG architectures, however, they struggle with complex implementation and long response times.

This new paper investigates existing RAG approaches and their potential combinations to identify optimal practices. Through extensive experiments, the authors suggest several strategies for deploying RAG that balance both performance and efficiency.

The infographic in itself (below) is extremely useful too. It breaks down the pipeline into smaller stages and lists methods for each stage.

> - Github : <https://github.com/FudanDNN-NLP/RAG>
> - Paper : <https://arxiv.org/pdf/2407.01219>
{: .prompt-info}

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


![ LLM RAG Best Practices ](/assets/img/llm/The-Evolution-of-RAG-Models.jpeg){: .light .shadow .rounded-10 w='1212' h='668' }


### Let's understand RAG with a simple workflow.

{% include embed/youtube.html id='TNUbBPdbsLA' %}

RAG can help prevent hallucinations by providing LLMs with the most recent proprietary and contextual data, allowing them to generate a response based on both their inherent external knowledge and up-to-date internal data. 

This approach can improve accuracy and reduce hallucinations.

<details markdown="1">
<summary style= "font-size:24px; line-height:24px; font-weight:bold; cursor:pointer;" > Translate to Korean </summary>

* * * 

📚 'RAG(Retrieval-Augmented Generation) 시스템의 포괄적 연구' - RAG의 총정리

🔍 이 논문의 핵심 포인트:
- RAG 전체 워크플로우를 모듈별로 상세 분석
- 각 모듈(검색, 재순위화, 요약 등)의 최적 구현 방법 제시
- 다양한 NLP 태스크에서 RAG 성능 평가 결과 공개
- 성능과 효율성을 모두 고려한 최적 구현 전략 제안
- 멀티모달 RAG로의 확장 가능성 탐구
- 생성기 미세조정을 위한 최적의 접근법 제시

💡 이런 분들에게 추천합니다:
- AI 개발자: RAG 시스템 구현 시 실질적 가이드라인을 얻고 싶은 분
- 연구자: RAG의 최신 트렌드와 성능 개선 방법을 파악하고 싶은 분
- 기업 의사결정자: RAG 도입을 고려 중이신 분

🤔 RAG에 관심 있는 모든 분들이 좋아할만한 정리가 되어있는데요. 많은 기업에서 관심을 가지고 있는 만큼 좋은 자료라고 생각해서 공유합니다. 

</details>
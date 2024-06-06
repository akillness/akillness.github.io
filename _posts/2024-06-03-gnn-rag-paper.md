---
title: TRAG meets GNNs
description: Paper, GNN-RAG, LLM
categories: [Paper, GNN-RAG]
tags: [AI, LLM, GNN-RAG]
# author: foDev_jeong
date: 2024-06-03 15:00:00 +0800
# pin: true
# mermaid: true
# render_with_liquid: false
# image:
#   path: /assets/img/blog/NLP_Overview.svg
#   lqip: data:image/webp;base64,UklGRpoAAABXRUJQVlA4WAoAAAAQAAAADwAABwAAQUxQSDIAAAARL0AmbZurmr57yyIiqE8oiG0bejIYEQTgqiDA9vqnsUSI6H+oAERp2HZ65qP/VIAWAFZQOCBCAAAA8AEAnQEqEAAIAAVAfCWkAALp8sF8rgRgAP7o9FDvMCkMde9PK7euH5M1m6VWoDXf2FkP3BqV0ZYbO6NA/VFIAAAA
#   alt: [Overview of NLP Course]
---

## TRAG meets GNNs: Integrating graphs into a modern workflow.

Knowledge Graphs (KGs) are a powerful way to represent factual knowledge, but querying them with natural language is challenging. 

And Graph Neural Networks (GNNs) excel at reasoning over KGs, something Large Language Models (LLMs) are still struggling with.

There has been a lot of work in combining these two approaches lately, but it doesn't feel like we've found the right recipe yet. 

By leaning into the popular Retrieval-augmented Generation (RAG) trend, GNN-RAG tries to change this.

> The idea is for the GNN to handle the complex graph structure, while the LLM leverages its language understanding to produce the final answer. 

#### GNN-RAG achieves state-of-the-art performance on two major KGQA benchmarks, even outperforming GPT-4 in some cases. 

It particularly seems to shine on challenging multi-hop and multi-entity questions. 

> 🧙Paper Authors: Costas Mavromatis, George Karypis
1Minnesota University 
- 1️⃣Read the Full Paper here: <https://arxiv.org/abs/2405.20139>
- 2️⃣Project Page: <https://medium.com/@techsachin/gnn-rag-combining-llms-language-abilities-with-gnns-reasoning-in-rag-style-d72200da376c>
- 3️⃣Code: <https://github.com/cmavro/GNN-RAG>
{: .prompt-info }

![ GNN-RAG architecture ](/assets/img/paper/GNN-RAG.png){: .light .shadow .rounded-10 w='1212' h='668' }

<details markdown="1">
<summary style= "font-size:24px; line-height:24px; font-weight:bold; cursor:pointer;" > Translate to Korean </summary>

##  RAG와 GNN의 만남: 그래프를 최신 워크플로우에 통합합니다.

지식 그래프(KG)는 사실에 입각한 지식을 표현하는 강력한 방법이지만 자연어로 쿼리하는 것은 어렵습니다. 

그리고 그래프 신경망(GNN)은 대규모 언어 모델(LLM)이 여전히 어려움을 겪고 있는 KG보다 추론하는 데 탁월합니다.

최근 이 두 가지 접근 방식을 결합하는 데 많은 작업이 있었지만 아직 올바른 레시피를 찾지 못한 것 같습니다. 

GNN-RAG는 인기 있는 RAG(Retrieval-augmented Generation) 추세에 기대어 이를 바꾸려고 합니다.

> 아이디어는 GNN이 복잡한 그래프 구조를 처리하는 반면, LLM은 언어 이해를 활용하여 최종 답변을 생성하는 것입니다. 

#### GNN-RAG는 두 가지 주요 KGQA 벤치마크에서 최첨단 성능을 달성하며 경우에 따라 GPT-4를 능가하기도 합니다. 

특히 도전적인 다중 홉 및 다중 엔터티 질문에 빛을 발하는 것 같습니다. 

</details>
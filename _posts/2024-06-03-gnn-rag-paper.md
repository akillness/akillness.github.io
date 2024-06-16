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


## 🤔 Vanilla-RAG struggles with structured knowledge sources like knowledge graphs. GNN-RAG is a very neat idea to fix this!


### ⛳ Vanilla-RAG struggles with structured inputs like KGs because it relies heavily on LLMs for retrieval, which are not adept at handling the complex graph information inherent in KGs. This leads to suboptimal performance, especially on multi-hop and multi-entity questions that require traversing multiple relationships in the graph.

### ⛳ GNN-RAG integrates the strengths of both LLMs and and Graph Neural Networks (GNNs) to solve this issue:
- 💡 GNN: Excels at processing and reasoning over graph structures. It reasons over a dense KG subgraph to retrieve answer candidates for a given question.
- 💡LLM: Leverages its natural language processing abilities to further reason over the information provided by the GNN.

👉 Here's the workflow:
- 🔺 A GNN processes the KG to identify and retrieve candidate answers.
- 🔺The shortest paths connecting question entities to answer candidates in the KG are extracted to represent reasoning paths.
- 🔺These paths are verbalized and provided as input to the LLM for final reasoning and answer generation.


#### GNN-RAG achieves state-of-the-art performance on two major KGQA benchmarks, even outperforming GPT-4 in some cases. 

> GNN-RAG achieves state-of-the-art results on two widely used KGQA benchmarks, WebQSP and ComplexWebQuestions (CWQ) and outperforms existing methods, including GPT-4, particularly on multi-hop and multi-entity questions.
{: .prompt-tip }

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

## 🤔 Vanilla-RAG는 지식 그래프와 같은 구조화된 지식 소스로 어려움을 겪고 있습니다. GNN-RAG는 이 문제를 해결하기 위한 매우 깔끔한 아이디어입니다!

### ⛳ Vanilla-RAG는 KG에 내재된 복잡한 그래프 정보를 처리하는 데 능숙하지 않은 LLM에 크게 의존하기 때문에 KG와 같은 구조화된 입력에 어려움을 겪습니다. 이로 인해 성능이 최적화되지 않으며, 특히 그래프에서 여러 관계를 순회해야 하는 다중 홉 및 다중 엔터티 질문에서 성능이 저하됩니다.

### ⛳ GNN-RAG는 이 문제를 해결하기 위해 LLM과 그래프 신경망(GNN)의 강점을 통합합니다.
- 💡 GNN: 그래프 구조에 대한 처리 및 추론에 탁월합니다. 조밀한 KG 하위 그래프를 통해 추론하여 주어진 질문에 대한 답변 후보를 검색합니다.
- 💡LLM: 자연어 처리 기능을 활용하여 GNN에서 제공하는 정보를 추가로 추론합니다.

👉 워크플로는 다음과 같습니다.
- 🔺 GNN은 KG를 처리하여 후보 답변을 식별하고 검색합니다.
- 🔺KG의 후보자에게 답변하기 위해 질문 엔터티를 연결하는 최단 경로가 추출되어 추론 경로를 나타냅니다.
- 🔺이러한 경로는 언어화되어 최종 추론 및 답변 생성을 위해 LLM에 입력으로 제공됩니다.

### GNN-RAG는 두 가지 주요 KGQA 벤치마크에서 최첨단 성능을 달성하며 경우에 따라 GPT-4를 능가하기도 합니다. 

> GNN-RAG는 널리 사용되는 두 가지 KGQA 벤치마크인 WebQSP 및 ComplexWebQuestions(CWQ)에서 최첨단 결과를 달성하고 특히 다중 홉 및 다중 엔터티 질문에서 GPT-4를 포함한 기존 방법을 능가합니다.
{: .prompt-tip }

특히 도전적인 다중 홉 및 다중 엔터티 질문에 빛을 발하는 것 같습니다. 

</details>
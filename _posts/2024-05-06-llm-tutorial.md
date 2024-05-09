---
title: Simple LLM app 만들어보기
description: pytorch, LLM, simple, prompt
categories: [LLM, Tutorial]
tags: [study, Simple LLM, Pytorch]
author: foDev_jeong
date: 2024-05-06 18:25:00 +0800
pin: true
mermaid: true
# render_with_liquid: false
image:
  path: /assets/img/llm/LLM_models.png
  lqip: data:image/webp;base64,UklGRpoAAABXRUJQVlA4WAoAAAAQAAAADwAABwAAQUxQSDIAAAARL0AmbZurmr57yyIiqE8oiG0bejIYEQTgqiDA9vqnsUSI6H+oAERp2HZ65qP/VIAWAFZQOCBCAAAA8AEAnQEqEAAIAAVAfCWkAALp8sF8rgRgAP7o9FDvMCkMde9PK7euH5M1m6VWoDXf2FkP3BqV0ZYbO6NA/VFIAAAA
  alt: [LLM Model history since 2019 years]
---

## Step-by-Step Guide to Building LLM Apps Basic to Advanced Components Created

```mermaid
 gantt
  title Gant Chart to represent LLM Study
  Simple LLM App ( Prompt + LLM ) :active, a, 2024-05-08, 2w
  Chaining Prompt ( Prompt Chains + LLM ) :crit, b, after a, 2w
  Adding External Knowledge Base-RAG :c, after b, 2w
  Adding Memory to LLMs :crit, d, after c, 2w
  Using External Tool with LLM : e, after d, 2w
  LLMs Making Decision-Agent :crit, f, after e, 2w
  Fine-Tuning LLM : g, after f, 2w
```


- Step.1
  - Simple LLM App ( Prompt + LLM )
- Step.2
  - Chaining Prompt ( Prompt Chains + LLM )
- Step.3
  - Adding External Knowledge Base : RAG ( Retrieval Augmented Generation)
    - `답변에 필요한 정보를 먼저 찾아서 LLM에게 질문과 함께 넘겨주는 방식`
    - 이를 통해 특정 문서나 서비스의 데이터베이스에 있는 정보에 기반해서 답변을 생성할 수 있다.
![RAG](/assets/img/llm/RAG.png){: .light .w-75 .shadow .rounded-10 w='1212' h='668' }
- Step.4
  - Adding Memory to LLMs
- Step.5
  - Using External Tool with LLM
- Step.6
  - LLMs Making Decision : Agent
- Step.7
  - Fine-Tuning LLM

* * *

LLM(Large Language Model) 공부하기 계획부터 실제 코드까지 작성하는 포스트를 작성한다. 
[당근에서 LLM 사용하기](https://medium.com/daangn/%EB%8B%B9%EA%B7%BC%EC%97%90%EC%84%9C-llm-%ED%99%9C%EC%9A%A9%ED%95%98%EA%B8%B0-76131ecebce1) 내용을 통해 LLM의 잘하는 일을 알아보고, LLM을 활용한 사례를 분석해보자.

## LLM이 잘하는 일

LLM은 수많은 텍스트 데이터를 학습해서 세상에 대한 지식, 언어 이해 능력 그리고 뛰어난 추론 능력을 갖추고 있어, 별도의 학습 없이도 주어진 텍스트를 이해하고 지시한 작업을 수행할 수 있다. 
하지만 딥러닝 모델을 학습해서 해결하던 문제들을 모두 대신할 수 있는 것은 아니기 때문에 LLM이 잘할 수 있는 일들은 크게 다음과 같이 생각해 볼 수 있다.

### 자연어 처리: 텍스트 분석, 추출, 분류

간단한 프롬프트 작성만으로 해당 테스크에 학습된 모델과 비슷하거나 더 뛰어난 성능으로 같은 작업을 수행할 수 있게 되었다.
![Prompt](/assets/img/llm/Prompt.png){: .light .w-75 .shadow .rounded-10 w='1212' h='668' }

### 사람의 질문에 대답하기
### 창의적인 글짓기







<!-- ```liquid
{% if product.title contains 'Pack' %}
  This product's title contains the word Pack.
{% endif %}
  No title
``` -->


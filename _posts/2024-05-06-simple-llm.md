---
title: Simple LLM app 만들어보기
description: pytorch, LLM, simple, prompt
categories: [Blogging, Pytorch]
tags: [study, Simple LLM, Pytorch]
author: foDev_jeong
date: 2024-05-06 18:25:00 +0800
mermaid: true
# render_with_liquid: false
---

LLM(Large Language Model) 공부하기 계획부터 실제 코드까지 작성하는 포스트를 작성한다. 당근에서 LLM 사용하기 


# Step-by-Step Guide to Building LLM Apps Basic to Advanced Components Created

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
  - Adding External Knowledge Base : RAG
- Step.4
  - Adding Memory to LLMs
- Step.5
  - Using External Tool with LLM
- Step.6
  - LLMs Making Decision : Agent
- Step.7
  - Fine-Tuning LLM


<!-- ```liquid
{% if product.title contains 'Pack' %}
  This product's title contains the word Pack.
{% endif %}
  No title
``` -->


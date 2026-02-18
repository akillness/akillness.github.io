---
title: "All about the evaluation for LLMs."
description: "Curiosity: How do we systematically evaluate LLM performance across diverse tasks?"
categories: [LLM/Model & Papers]
tags: [LLM, Model, Paper]
date: 2024-05-17 15:20:00 +0800
mermaid: true
image:
  path: /assets/img/news/Evalverse_2.jpeg
  lqip: data:image/webp;base64,UklGRpoAAABXRUJQVlA4WAoAAAAQAAAADwAABwAAQUxQSDIAAAARL0AmbZurmr57yyIiqE8oiG0bejIYEQTgqiDA9vqnsUSI6H+oAERp2HZ65qP/VIAWAFZQOCBCAAAA8AEAnQEqEAAIAAVAfCWkAALp8sF8rgRgAP7o9FDvMCkMde9PK7euH5M1m6VWoDXf2FkP3BqV0ZYbO6NA/VFIAAAA
  alt: "Evalverse Space"
---
## Evalverse: The Universe of LLM Evaluation

*Curiosity:* How do we systematically evaluate LLM performance across diverse tasks? What benchmarks and metrics provide meaningful insights into model capabilities?

**Evalverse** is a comprehensive evaluation platform that aggregates LLM benchmarks, model comparisons, and performance metrics in one unified space. Updated regularly, it provides the most current view of the LLM landscape.

### Evalverse Overview

```mermaid
graph TB
    A[Evalverse Platform] --> B[Weekly Scores]
    A --> C[Benchmarks]
    A --> D[Models]
    A --> E[Leaderboards]
    
    B --> B1[Arena Elo]
    C --> C1[AlpacaEval 2.0]
    C --> C2[MMLU-Pro]
    D --> D1[GPT-4o]
    D --> D2[Latest Models]
    E --> E1[Full Rankings]
    
    style A fill:#e1f5ff
    style B fill:#fff3cd
    style C fill:#d4edda
    style D fill:#f8d7da
    style E fill:#e7d4f8
```

### Latest Updates (May 17, 2024)

| Category | Updates | Details |
|:---------|:--------|:--------|
| **Weekly Scores** | Arena Elo rankings | 240515, 240508, 240501 |
| **New Benchmarks** | AlpacaEval 2.0, MMLU-Pro | Human preference correlation |
| **New Models** | 6 models added | GPT-4o, Grok-1, OpenELM, etc. |
| **New Features** | Full leaderboard tab | Comprehensive rankings |

### New Benchmarks

*Retrieve:* Benchmarks highly correlated with human preferences provide more meaningful evaluation.

#### 1. LC-AlpacaEval 2.0

| Aspect | Details | Link |
|:-------|:--------|:-----|
| **Release Date** | April 6, 2024 | [arXiv](https://arxiv.org/abs/2404.04475) |
| **Focus** | Long-context evaluation | Extended capabilities |
| **Correlation** | High with human preferences | Reliable metrics |

#### 2. MMLU-Pro

| Aspect | Details | Link |
|:-------|:--------|:-----|
| **Release Date** | May 15, 2024 | [HuggingFace](https://huggingface.co/datasets/TIGER-Lab/MMLU-Pro) |
| **Focus** | Advanced reasoning | Challenging tasks |
| **Correlation** | High with Arena Elo | Human-aligned |

### New Models Added

| Model | Provider | Key Features |
|:------|:---------|:-------------|
| **GPT-4o-0513** | OpenAI | Multimodal, real-time |
| **Grok-1** | xAI | Large-scale reasoning |
| **OpenELM** | Apple | Efficient, open-source |
| **Qwen-Max-0428** | Alibaba | Multilingual, large-scale |
| **Snowflake-Arctic-Instruct** | Snowflake | Enterprise-focused |
| **Yi-Large** | 01.AI | High performance |

### Evaluation Metrics

```mermaid
graph LR
    A[Evaluation Metrics] --> B[Arena Elo]
    A --> C[Task-Specific]
    A --> D[Human Preference]
    
    B --> B1[Head-to-Head]
    C --> C1[MMLU]
    C --> C2[HumanEval]
    D --> D1[AlpacaEval]
    
    style A fill:#e1f5ff
    style B fill:#fff3cd
    style C fill:#d4edda
    style D fill:#f8d7da
```

### Why Evalverse Matters

*Retrieve:* Evalverse provides:
- Centralized evaluation hub
- Regular updates with latest models
- Multiple benchmark perspectives
- Human preference correlation

*Innovate:* By using Evalverse, you can:
- Compare models systematically
- Track performance trends
- Make informed model choices
- Understand evaluation landscape

### Access Evalverse

> **👉 HuggingFace Space**: <https://huggingface.co/spaces/upstage/evalverse-space>
{: .prompt-info }

**Features**:
- Interactive leaderboards
- Model comparisons
- Benchmark details
- Weekly score tracking

### Key Takeaways

*Retrieve:* Evalverse provides a comprehensive, regularly updated view of LLM evaluation, aggregating benchmarks, model scores, and human preference metrics.

*Innovate:* By leveraging Evalverse's centralized evaluation data, you can make informed decisions about model selection and understand the current state of LLM capabilities.

*Curiosity → Retrieve → Innovation:* Start with curiosity about model performance, retrieve insights from Evalverse's comprehensive data, and innovate by selecting the best models for your specific use cases.

![ Evaverse Chart ](/assets/img/news/Evalverse_1.jpeg){: .light .w-75 .shadow .rounded-10 w='1212' h='668' }


<details markdown="1">
<summary style= "font-size:24px; line-height:24px; font-weight:bold; cursor:pointer;" > Translate to Korean </summary>


## The Evaluation Space (Evalverse)

🔥 evalverse-space (Updated: May 17, 2024)

New Features
- • Weekly scores: Arena Elo (240515), Arena Elo (240508), Arena Elo (240501)
- • New benchmarks: AlpacaEval 2.0, MMLU-Pro
- • New models: GPT-4o-0513, Grok-1, OpenELM, Qwen-Max-0428, Snowflake-Arctic-Instruct, Yi-Large
- • New tab: 🏆 Full Leaderboard

New benchmarks highly correlated with human preferences (Arena Elo)
- • LC-AlpacaEval 2.0 (4月 6日) https://lnkd.in/gqmzrjyb
- • MMLU-Pro (May 15) https://lnkd.in/gNeh2RHP

> Check all of this together at Evalverse-space.
- 👉 Hugging Face Space: https://lnkd.in/gR75pHfC
{: .prompt-info }

</details>

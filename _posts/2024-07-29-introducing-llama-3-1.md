---
title: Introducing Llama 3.1 - the most capable LLMs from Meta, free and arguably
  open-source!
description: LLM, Llama3.1
categories:
- LLM & Language Models
tags:
- introducing
- llama31
- llm
- language-model
date: 2024-07-29 12:00:00 +0800
mermaid: true
image:
  path: /assets/img/llm/compare-performance-of-llms.jpeg
  lqip: data:image/webp;base64,UklGRpoAAABXRUJQVlA4WAoAAAAQAAAADwAABwAAQUxQSDIAAAARL0AmbZurmr57yyIiqE8oiG0bejIYEQTgqiDA9vqnsUSI6H+oAERp2HZ65qP/VIAWAFZQOCBCAAAA8AEAnQEqEAAIAAVAfCWkAALp8sF8rgRgAP7o9FDvMCkMde9PK7euH5M1m6VWoDXf2FkP3BqV0ZYbO6NA/VFIAAAA
  alt:
  - Compare Performance of LLMS by KMMLU
---
![ Llama 3.1 MMLU performance ](/assets/img/llm/llama-3-1-mmlu-performance.jpeg){: .light .shadow .rounded-10 w='1212' h='668' }

# Introducing Llama 3.1

Yesterday's Llama 3.1 release marked a big milestone for LLM researchers and practitioners. Llama 3.1 405B is the biggest and most capable LLM with openly available LLMs. And particularly exciting is that the new Llama release comes with a 93-page research paper this time. Below, I want to share a few interesting facts from the paper, and I will likely write a longer analysis this weekend.

> Meta announcement 👉 <https://ai.meta.com/blog/meta-llama-3-1/>
{: .prompt-info}

True to our commitment to open source, starting today, we’re making these models available to the community for download on [llama.meta.com](https://llama.meta.com/) and [HuggingFace](https://huggingface.co/collections/meta-llama/llama-31-669fc079a0c406a149a5738f) and available for immediate development on our broad ecosystem of partner platforms.

<details markdown="1">
<summary style= "font-size:24px; line-height:24px; font-weight:bold; cursor:pointer;" > Introducing Llama 3.1 - details </summary>

### Model Sizes

*Retrieve:* Llama 3.1 comes in 3 sizes with different capabilities.

| Model | Parameters | Context | Use Case |
|:------|:-----------|:--------|:---------|
| **8B** | 8 billion | 128k tokens | Efficient, accessible |
| **70B** | 70 billion | 128k tokens | Balanced performance |
| **405B** | 405 billion | 128k tokens | Maximum capability |

**Key Insight**: The 405B model was used to improve 8B and 70B via synthetic data during fine-tuning stages.

### Pretraining Data

*Retrieve:* The 93-page report offers detailed insights into dataset preparation.

**Training Data**:
- **15.6 trillion tokens** for pretraining
- Primarily "web data" (sources not disclosed)
- Detailed preparation recipes shared

**Dataset Preparation Techniques**:
- Deduplication methods
- Formatting (markdown removal)
- Quality filters
- Unsafe content removal
- Reproducible recipes

**Why Sources Not Shared**:
- Copyright concerns
- Legal protection
- Still provides valuable methodology

### Long-Context Support

*Innovate:* 128k token context achieved through multi-stage training.

**Training Process**:

```mermaid
graph LR
    A[8k Context Pretraining] --> B[Stage 1: 16k]
    B --> C[Stage 2: 32k]
    C --> D[Stage 3: 64k]
    D --> E[Stage 4: 96k]
    E --> F[Stage 5: 112k]
    F --> G[Stage 6: 128k]
    
    style A fill:#e1f5ff
    style G fill:#d4edda
```

**Key Findings**:
- 6-stage context extension
- Requires 0.1% long-context instruction samples in fine-tuning
- Without this, long-context capabilities decline

### Alignment Process

*Retrieve:* Llama 3.1 uses DPO, not PPO for alignment.

**Alignment Pipeline**:

| Stage | Method | Details |
|:------|:-------|:--------|
| **1. SFT** | Supervised Fine-Tuning | Instruction following |
| **2. DPO** | Direct Preference Optimization | Preference learning |
| **3. Rejection Sampling** | Reward Model | During SFT stage |

**Note**: Unlike Llama 2, no PPO was used. Only DPO after SFT.

### Inference Requirements

*Retrieve:* Significant compute resources needed for 405B model.

| Configuration | GPUs Required | Use Case |
|:--------------|:--------------|:---------|
| **Training** | 16,000 H100 | Model training |
| **Inference (bfloat16)** | 16 H100 | Full precision |
| **Inference (FP8)** | 8 H100 | Quantized, single node |

### Performance Comparison

*Retrieve:* Performance is very favorable, on par with GPT-4.

**Benchmark Results**:
- Competitive with GPT-4
- Strong across multiple tasks
- See performance charts for details

</details>

## Summary: Llama 3.1 Technical Achievements

*Retrieve:* Training required 16,000 Nvidia H100 GPUs over months, resulting in a 405B parameter model with 128K token context length.

**Training Scale**:
- **16,000 H100 GPUs**
- **Months of training**
- **405B parameters**
- **128K context length**

**Performance**: According to benchmarks, mostly superior to OpenAI's GPT-4.

**Note**: Benchmarks can be biased; more parameters don't guarantee better performance. Real user feedback over time will determine true capabilities.

### Open-Source Status

*Innovate:* Llama 3.1 is almost open-source with some restrictions.

**What's Open**:

| Component | Status | Details |
|:----------|:-------|:--------|
| **Model Weights** | ✅ Open | Downloadable from Hugging Face |
| **Training Code** | ✅ Open | ~300 lines Python/PyTorch |
| **FairScale Library** | ✅ Open | Distributed GPU training |

**What's Restricted**:

| Aspect | Restriction | Details |
|:-------|:------------|:--------|
| **Commercial Use** | ⚠️ Limited | Allowed unless >700M users |
| **Training Data** | ❌ Not open | Sources not disclosed |
| **Large Scale** | ⚠️ License needed | >700M users requires Meta license |

**Benefits**:
- Self-host instead of API costs
- Full model control
- Custom fine-tuning
- Privacy and security

* * *

![ Llama 3.1 Ultra-Efficiently ](/assets/img/llm/llama-3-1-ultra-efficiently.jpeg){: .light .shadow .rounded-10 w='1212' h='668' }

## Fine-Tune Llama 3.1 Ultra-Efficiently with Unsloth AI

*Retrieve:* Comprehensive guide for supervised fine-tuning on Hugging Face.

**Guide Topics**:
- Efficient fine-tuning in Google Colab
- When to use fine-tuning
- Hyperparameter tuning
- Dataset processing

> **Resources**:
> - **📝 Article**: <https://huggingface.co/blog/mlabonne/sft-llama3>
> - **💻 Colab Notebook**: <https://colab.research.google.com/drive/164cg_O7SV7G8kZr_JXqLd6VC7pd86-1Z>
{: .prompt-info}

* * * 

![ Llama 3.1 Technical Report ](/assets/img/llm/llama-3-1-technical-report.jpeg){: .light .shadow .rounded-10 w='1212' h='668' }

## Llama 3.1 Technical Report: A Treasure Trove for LLM Building

*Retrieve:* The Llama 3.1 technical report is an invaluable resource for building SOTA LLMs from scratch.

**Why It Matters**: Rare to see so much detailed information in a technical report. Essential reference for LLM development.

### Scaling Laws

*Curiosity:* Are scaling laws reliable? Can we predict model performance as compute increases?

**Key Finding**: Scaling laws derived from smaller models hold for much higher compute.

**Scaling Law Formula**:
- Loss decreases **linearly with log(compute)**
- Confirmed up to 10^22 FLOPs (previous research)
- **Validated up to 10^25 FLOPs** (Llama 3.1)
- **4 orders of magnitude** extension!

**Implication**: Can predict performance for multi-trillion parameter models!

**Visualization**:

```mermaid
graph LR
    A[10^22 FLOPs] --> B[Scaling Law]
    B --> C[10^25 FLOPs]
    C --> D[Llama-3.1-405B]
    D --> E[Multi-Trillion Models?]
    
    style A fill:#e1f5ff
    style D fill:#fff3cd
    style E fill:#d4edda
```

### Tool Use (Agentic) Training

*Innovate:* Advanced tool use training for agentic capabilities.

**Training Approach**:

| Type | Description | Purpose |
|:-----|:------------|:--------|
| **Single Tool Call** | One tool per query | Basic tool use |
| **Nested Calls** | Tool output feeds another | Multi-step reasoning |
| **Parallel Calls** | Multiple tools simultaneously | Efficiency |

**Datasets**:
- Single-call dataset
- Multi-step tool call dataset
- Preference versions for DPO

**Tools Trained**:
- 🐍 Python code interpreter
- 🌐 Brave browser
- 🔢 Wolfram API

**Significance**: These tools form a strong basis for many agent problems.

### Other Key Insights

*Retrieve:* Additional technical details from the report.

| Insight | Details | Impact |
|:--------|:--------|:-------|
| **Training Scale** | 16,000 H100 GPUs | Massive compute |
| **4D Parallelism** | Tensor, pipeline, context, FSDP | Efficient training |
| **Alignment** | SFT + DPO (not complex RLHF) | Simplified pipeline |

**4D Parallelism**:
- Tensor parallelism
- Pipeline parallelism
- Context parallelism
- FSDP (Fully Sharded Data Parallel)

**Alignment Pipeline**:
- Multiple rounds of SFT
- DPO for preferences
- No complex RLHF like GPT-4
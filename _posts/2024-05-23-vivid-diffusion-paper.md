---
title: "👚👚 ViViD Diffusion Virtual Try-ON 👚👚"
description: "{% include embed/youtube.html id='r9giQPUp1Gw' %}."
categories: [Multimodal/Computer Vision]
tags: [Multimodal, Vision, Generative Model]
date: 2024-05-23 19:00:00 +0800
mermaid: true
---
{% include embed/youtube.html id='r9giQPUp1Gw' %}

## ViViD Diffusion: Virtual Try-On with Diffusion Models

*Curiosity:* How can we create realistic virtual try-on videos? What makes ViViD's approach to video virtual try-on (VTON) innovative?

**Alibaba** announces **ViViD**, a novel framework employing powerful diffusion models to tackle the virtual try-on task.

> ⚠️ **Note**: Code announced, not released yet 😢
{: .prompt-warning}

### Highlights

*Retrieve:* ViViD's key features.

| Feature | Description | Impact |
|:--------|:------------|:-------|
| **Novel Architecture** | Addresses video VTON | ⬆️ Innovation |
| **Diffusion Models** | Synthesizes HQ try-on videos | ⬆️ Quality |
| **Pose + Temporal** | Modules for temporal consistency | ⬆️ Realism |
| **Attention Fusion** | New mechanism for garments | ⬆️ Accuracy |
| **Dataset** | 9,700 pairs of HQ garment-clips | ⬆️ Training data |

### ViViD Architecture

*Innovate:* Framework overview.

```mermaid
graph TB
    A[Input Video] --> B[Pose Module]
    A --> C[Garment Image]
    B --> D[Temporal Module]
    C --> E[Attention Fusion]
    D --> F[Diffusion Model]
    E --> F
    F --> G[HQ Try-On Video]
    
    style A fill:#e1f5ff
    style F fill:#fff3cd
    style G fill:#d4edda
```

### Key Innovations

*Retrieve:* Technical breakthroughs.

**1. Video VTON Architecture**:
- Novel approach to video virtual try-on
- Handles temporal consistency

**2. Diffusion Models**:
- Synthesizes high-quality try-on videos
- Better than previous methods

**3. Pose + Temporal Modules**:
- Ensures temporal consistency
- Maintains realistic motion

**4. Attention Fusion**:
- New mechanism for garment integration
- Better garment-person alignment

**5. Multi-Category Dataset**:
- 9,700 pairs of high-quality garment-clips
- Comprehensive training data

### Resources

*Retrieve:* Available materials.

> **Resources**:
> - **📄 Paper**: <https://arxiv.org/pdf/2405.11794>
> - **🌐 Project Page**: <https://becauseimbatman0.github.io/ViViD>
> - **💻 Code**: Coming soon (<https://github.com/alibaba-yuanjing-aigclab/ViViD>)
> - **💬 Discussion**: <https://t.me/s/AI_DeepLearning>
{: .prompt-info}

**Paper Authors**: Zixun Fang, Wei Zhai, Aimin Su, Hongliang Song, Kai Zhu, Mao Wang, Yu Chen, Zhiheng Liu, Yang Cao, Zheng-Jun Zha (University of Science and Technology of China, Alibaba Group)

### Key Takeaways

*Retrieve:* ViViD is a novel framework using diffusion models for video virtual try-on, with innovations in architecture, temporal consistency, and garment fusion.

*Innovate:* By combining diffusion models with pose and temporal modules, you can create high-quality virtual try-on videos with realistic temporal consistency and accurate garment integration.

*Curiosity → Retrieve → Innovation:* Start with curiosity about virtual try-on, retrieve insights from ViViD's diffusion-based approach, and innovate by applying similar techniques to your video generation projects.

**Next Steps**:
- Read the full paper
- Check project page
- Wait for code release
- Experiment with diffusion VTON


<details markdown="1">
<summary style= "font-size:24px; line-height:24px; font-weight:bold; cursor:pointer;" > Translate to Korean </summary>

## 👉 Alibaba Introduces ViViD, a New Framework Using Powerful Diffusion Models for Virtual Try-On Tasks 

Code release: not yet publicly available 😢

Highlights:
- ✅ New architecture for video VTON
- ✅ Diffusion model for synthesizing HQ try-on videos
- ✅ Pose + temporal module for temporal consistency
- ✅ New attention feature: fusion mechanism for garments
- ✅ Multi-category dataset: 9,700 pairs of HQ clothing clips

</details>

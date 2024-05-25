---
title: Is this the architecture of OpenAI GPT-4o?
description: LLM, Course
categories: [Script, GPT4o]
tags: [GPT4o, LLM, Architecture]
# author: foDev_jeong
date: 2024-05-25 23:05:00 +0800
# mermaid: true
# render_with_liquid: false
# image:
#   path: /assets/img/llm/LLM_evaluation_rank.jpeg
#   lqip: data:image/webp;base64,UklGRpoAAABXRUJQVlA4WAoAAAAQAAAADwAABwAAQUxQSDIAAAARL0AmbZurmr57yyIiqE8oiG0bejIYEQTgqiDA9vqnsUSI6H+oAERp2HZ65qP/VIAWAFZQOCBCAAAA8AEAnQEqEAAIAAVAfCWkAALp8sF8rgRgAP7o9FDvMCkMde9PK7euH5M1m6VWoDXf2FkP3BqV0ZYbO6NA/VFIAAAA
#   alt: [Rankings of model performance change drastically depending on which LLM is used as the judge on KILT-NQ]
---


## Is this the architecture of OpenAI GPT-4o?

Uni-MoE proposes an MoE-based unified Multimodal Large Language Model (MLLM) that can handle audio, speech, image, text, and video. 👂👄👀💬🎥

Uni-MoE is a native multimodal Mixture of Experts (MoE) architecture with a three-phase training strategy that includes cross-modality alignment, expert activation, and fine-tuning with Low-Rank Adaptation (LoRA). 🤔

TL;DR:
🚀 Uni-MoE uses modality-specific encoders with connectors for a unified multimodal representation.
💡 Utilizes sparse MoE architecture for efficient training and inference
🧑‍🏫 Three-phase training: 1) Train connectors for different modalities 2) Modality-specific expert training with cross-modality instruction data. 3) Fine-tuning with LoRA on mixed multimodal data.
📊 Uni-MoE matches or outperforms other MLLMs on 10 tested vision and audio tasks
🏆 Outperforms existing unified multimodal models on comprehensive benchmarks

>
Paper: <https://huggingface.co/papers/2405.11273>
Github: <https://github.com/HITsz-TMG/UMOE-Scaling-Unified-Multimodal-LLMs/tree/master/Uni_MoE_v2>
{: .prompt-info }

![ GPT4o Architecture ](/assets/img/news/GPT4o-Architecture.jpeg){: .light .w-75 .shadow .rounded-10 w='1212' h='668' }

<details markdown="1">
<summary style= "font-size:24px; line-height:24px; font-weight:bold; cursor:pointer;" > Translate to Korean </summary>

* * * 

## 이것이 OpenAI GPT-4o의 아키텍처입니까?

 Uni-MoE는 오디오, 음성, 이미지, 텍스트 및 비디오를 처리할 수 있는 MoE 기반 통합 MLLM(Multimodal Large Language Model)을 제안합니다. 👂👄👀💬🎥

Uni-MoE는 기본 멀티모달 MoE(Mixture of Experts) 아키텍처로, 교차 모달리티 정렬, 전문가 활성화 및 LoRA(Low-Rank Adaptation)를 통한 미세 조정을 포함하는 3단계 교육 전략을 갖추고 있습니다. 🤔

TL입니다. 박사:
🚀 Uni-MoE는 통합 멀티모달 표현을 위해 커넥터가 있는 모달리티별 엔코더를 사용합니다.
💡 효율적인 학습 및 추론을 위해 희소 MoE 아키텍처 활용
🧑 🏫 3단계 교육: 1) 다양한 양식에 대한 커넥터 학습 2) 교차 양식 지침 데이터를 사용한 양식별 전문가 교육. 3) 혼합 다중 모드 데이터에서 LoRA로 미세 조정.
📊 Uni-MoE는 10개의 테스트된 비전 및 오디오 작업에서 다른 MLLM과 일치하거나 더 나은 성능을 발휘합니다.
🏆 포괄적인 벤치마크에서 기존 통합 멀티모달 모델을 능가합니다.

>
Paper: <https://huggingface.co/papers/2405.11273>
Github: <https://github.com/HITsz-TMG/UMOE-Scaling-Unified-Multimodal-LLMs/tree/master/Uni_MoE_v2>
{: .prompt-info }

</details>
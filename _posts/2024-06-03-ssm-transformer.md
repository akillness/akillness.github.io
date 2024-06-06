---
title: Transformers are SSMs
description: Paper, SSM, Transformer
categories: [Paper, SSM]
tags: [AI, Transformer, SSM]
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

## Generalized Models and Efficient Algorithms Through Structured State Space Duality

While Transformers have been the main architecture behind deep learning's success in language modeling, state-space models (SSMs) such as Mamba have recently been shown to match or outperform Transformers at small to medium scale. We show that these families of models are actually quite closely related, and develop a rich framework of theoretical connections between SSMs and variants of attention, connected through various decompositions of a well-studied class of structured semiseparable matrices. Our state space duality (SSD) framework allows us to design a new architecture (Mamba-2) whose core layer is an a refinement of Mamba's selective SSM that is 2-8X faster, while continuing to be competitive with Transformers on language modeling.

> 🧙Paper Authors: Tri Dao∗1 and Albert Gu∗2
 1Department of Computer Science, Princeton University
 2Machine Learning Department, Carnegie Mellon University
- 1️⃣Read the Full Paper here: <https://arxiv.org/abs/2405.21060>
- 2️⃣Project Page: <https://huggingface.co/papers/2405.21060>
- 3️⃣Code: Coming 🔜
{: .prompt-info }

![ State Space Model are semiseparable matrix transformers ](/assets/img/paper/State_Space_Model_Matrices.png){: .light .shadow .rounded-10 w='1212' h='668' }

<details markdown="1">
<summary style= "font-size:24px; line-height:24px; font-weight:bold; cursor:pointer;" > Translate to Korean </summary>

##  구조화된 상태공간 이중성을 통한 일반화된 모델과 효율적인 알고리즘

트랜스포머는 언어 모델링에서 딥 러닝의 성공을 뒷받침하는 주요 아키텍처였지만, 최근에는 Mamba와 같은 상태 공간 모델(SSM)이 중소 규모에서 트랜스포머와 동등하거나 더 우수한 것으로 나타났습니다. 우리는 이러한 모델 계열이 실제로 매우 밀접하게 관련되어 있음을 보여주며, 잘 연구된 구조화된 반분리 가능한 행렬 클래스의 다양한 분해를 통해 연결된 SSM과 주의 변형 간의 이론적 연결에 대한 풍부한 프레임워크를 개발합니다. 상태 공간 이중성(SSD) 프레임워크를 통해 핵심 계층이 2-8배 더 빠른 Mamba의 선택적 SSM을 개선한 새로운 아키텍처(Mamba-2)를 설계하는 동시에 언어 모델링에서 Transformers와 계속 경쟁할 수 있습니다.

</details>
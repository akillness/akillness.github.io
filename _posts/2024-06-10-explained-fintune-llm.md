---
title: 5 techniques to fine-tune LLMs, explained visually!
description: LLM, Finetuning, Visualization
categories: [LLM, Finetuning]
tags: [LLM, Finetuning]
# author: foDev_jeong
date: 2024-06-10 10:10:00 +0800
# pin: true
# math: true
# mermaid: true
# image:
#   path: /assets/img/cover/programming.jpeg
#   lqip: data:image/webp;base64,UklGRpoAAABXRUJQVlA4WAoAAAAQAAAADwAABwAAQUxQSDIAAAARL0AmbZurmr57yyIiqE8oiG0bejIYEQTgqiDA9vqnsUSI6H+oAERp2HZ65qP/VIAWAFZQOCBCAAAA8AEAnQEqEAAIAAVAfCWkAALp8sF8rgRgAP7o9FDvMCkMde9PK7euH5M1m6VWoDXf2FkP3BqV0ZYbO6NA/VFIAAAA
#   alt: [2024 programming curriculum by honglab]
---

## Fine-tuning large language models traditionally involved adjusting billions of parameters, demanding significant computational power and resources. 

However, the development of some innovative methods have transformed this process. 

Here’s a snapshot of five cutting-edge techniques for finetuning LLMs, each explained visually for easy understanding.

#### LoRA:

- Introduce two low-rank matrices, A and B, to work alongside the weight matrix W.
- Adjust these matrices instead of the behemoth W, making updates manageable.

#### LoRA-FA (Frozen-A):

- Takes LoRA a step further by freezing matrix A.
- Only matrix B is tweaked, reducing the activation memory needed.

#### VeRA:

- All about efficiency: matrices A and B are fixed and shared across all layers.
- Focuses on tiny, trainable scaling vectors in each layer, making it super memory-friendly.

#### Delta-LoRA:

- A twist on LoRA: adds the difference (delta) between products of matrices A and B across training steps to the main weight matrix W.
- Offers a dynamic yet controlled approach to parameter updates.

#### LoRA+:

- An optimized variant of LoRA where matrix B gets a higher learning rate.
This tweak leads to faster and more effective learning.

Credits to Avi Chawla for great visualisation! 👏

![ Visualization 5 fine-tune LLMs  ](/assets/img/llm/LLM_Finetune_visualization.gif){: .light .shadow .rounded-10 w='1212' h='668' }

<details markdown="1">
<summary style= "font-size:24px; line-height:24px; font-weight:bold; cursor:pointer;" > Translate to Korean </summary>

* * * 

## 대규모 언어 모델을 미세 조정하려면 전통적으로 수십억 개의 매개 변수를 조정해야 했기 때문에 상당한 계산 능력과 리소스가 필요했습니다. 

그러나 몇 가지 혁신적인 방법의 개발로 이 프로세스가 바뀌었습니다. 

다음은 LLM을 미세 조정하기 위한 5가지 최첨단 기술을 간략하게 설명한 것으로, 각 기법은 쉽게 이해할 수 있도록 시각적으로 설명되어 있습니다.

#### 로라:

- 가중치 행렬 W와 함께 작동하도록 두 개의 낮은 순위 행렬 A와 B를 도입합니다.
- 거대 W 대신 이 행렬을 조정하여 업데이트를 관리할 수 있습니다.

#### LoRA-FA(냉동-A):

- 행렬 A를 동결하여 LoRA를 한 단계 더 발전시킵니다.
- 매트릭스 B만 조정되어 필요한 활성화 메모리가 줄어듭니다.

#### 베라:

- 효율성에 관한 모든 것: 행렬 A와 B는 고정되어 있고 모든 계층에서 공유됩니다.
- 각 레이어에서 작고 학습 가능한 스케일링 벡터에 중점을 두어 메모리 친화적으로 만듭니다.

#### 델타-로라:

- LoRA의 트위스트: 훈련 단계에서 행렬 A와 B의 곱 간의 차이(델타)를 주 가중치 행렬 W에 추가합니다.
- 파라미터 업데이트에 대한 동적이면서도 제어된 접근 방식을 제공합니다.

#### 로라+:

- 행렬 B가 더 높은 학습률을 얻는 LoRA의 최적화된 변형입니다.
이 조정은 더 빠르고 효과적인 학습으로 이어집니다.

</details>
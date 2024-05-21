---
title: Deep Dive into Transformers by Hand
description: Transformer
categories: [Blogging, Deepdive]
tags: [Deepdive, Transformer]
# author: foDev_jeong
date: 2024-05-14 13:15:00 +0800
# mermaid: true
# render_with_liquid: false
# image:
#   path: /assets/img/llm/LLM_evaluation_rank.jpeg
#   lqip: data:image/webp;base64,UklGRpoAAABXRUJQVlA4WAoAAAAQAAAADwAABwAAQUxQSDIAAAARL0AmbZurmr57yyIiqE8oiG0bejIYEQTgqiDA9vqnsUSI6H+oAERp2HZ65qP/VIAWAFZQOCBCAAAA8AEAnQEqEAAIAAVAfCWkAALp8sF8rgRgAP7o9FDvMCkMde9PK7euH5M1m6VWoDXf2FkP3BqV0ZYbO6NA/VFIAAAA
#   alt: [Rankings of model performance change drastically depending on which LLM is used as the judge on KILT-NQ]
---

### **Original Article** : 👉 <https://towardsdatascience.com/deep-dive-into-transformers-by-hand-%EF%B8%8E-68b8be4bd813>

### **ChatGPT4o**

트랜스포머 모델에 대한 설명을 요약하면 다음과 같습니다:

트랜스포머의 주요 개념
트랜스포머 모델은 두 가지 주요 개념인 어텐션 가중치(Attention Weighting)와 피드포워드 네트워크(FFN, Feed-Forward Network)로 구성됩니다.

#### 1. 어텐션 가중치 (Attention Weighting)

어텐션 가중치 행렬(A)은 입력 특징을 활용하여 가장 관련성이 높은 부분을 찾습니다. 이를 위해 입력 특징을 쿼리-키 (QK) 모듈에 입력합니다. 

이 과정에서 입력 행렬(예: 3×5 매트릭스)의 각 특징들이 가중치 행렬과 곱해져 어텐션 가중치를 반영한 새로운 특징(Z)을 생성합니다.

예를 들어, 행렬 연산을 통해 다음과 같은 새로운 특징을 얻을 수 있습니다:

- Z1 = X1 + X2
- Z2 = X2 + X3
- Z3 = X3 + X4
- Z4 = X4 + X5
- Z5 = X5 + X1


#### 2. 피드포워드 네트워크 (FFN)

어텐션 가중치가 적용된 특징(Z)을 피드포워드 신경망에 입력합니다. 여기서 각 특징의 차원을 따라 값을 결합하여 새로운 행렬을 생성합니다. 이 과정은 기존의 차원에서 새로운 차원으로 데이터를 변환하며, 주로 비선형 활성화 함수(ReLU)를 통해 음수 값을 0으로 변환합니다.

트랜스포머의 동작 방식
- 어텐션 단계: 입력 특징을 위치(수평적으로)를 따라 결합하여 새로운 특징을 생성합니다.
- FFN 단계: 차원(수직적으로)을 따라 값을 결합하여 새로운 행렬을 만듭니다.
이 두 단계의 조합으로 트랜스포머 모델은 데이터를 다양한 방향에서 분석할 수 있게 되며, 이는 모델의 강력한 성능의 비결입니다.

트랜스포머의 영향
- 트랜스포머는 2017년 도입 이후 AI 분야에서 큰 변화를 일으켰습니다. 기존의 CNN 및 RNN 모델을 넘어서는 성능을 보여주었으며, 이후 새로운 모델과 기준이 지속적으로 등장하고 있습니다. 이 모델의 아이디어는 AI 발전에 중요한 역할을 하고 있습니다.


* * *

### **Lilys AI** : 👉 <https://lilys.ai/digest/660043>
> Below Summary Note

Deep Dive into Transformers by Hand ✍︎ | by Srijanie Dey, PhD | Apr, 2024 | Towards Data Science

#### 1.️‍️트랜스포머의 세부사항 탐구
   - 로보트럭과 트랜스포머 영화를 연상케 하는 테슬라 사이버 트럭이 주거지에 등장하면서 인공신경망 트랜스포머에 대한 탐구를 초대하고 있다.
   - 아들이 선호하는 이름 '로보트럭'과 함께 느껴지는 풀 서클 감성 속, 로봇들이 차로 변신하는 트랜스포머가 이 로보트럭들을 움직이게 할 수 있다는 생각이 든다.
   - 저자가 삽화로 그린 '로브티머스 프라임'을 소개하며, 이러한 새로운 기술과 영감에 대한 공감대를 형성하고자 한다.
   - 트랜스포머와 같은 인공신경망 기술은 미래 자동차산업을 견인할 수 있을 것으로 생각한다.
   - 이와 관련한 깊은 이해를 위해 흥미로운 여정을 초대한다.

#### 2.Transformers의 특징과 특별한 메커니즘
   - Transformers는 본질적으로 신경망이다.
   - 데이터로부터 문맥을 학습하는 데 특화된 신경망이다.
   - 그러나 그들을 특별하게 만드는 것은 **라벨이 지정된 데이터셋**과 **합성곱 또는 순환**이 필요 없는 메커니즘을 가지고 있다는 점이다.
   - 이러한 특별한 메커니즘에는 무엇이 있을까?

#### 3.트랜스포머의 원동력: 주의 집중과 피드포워드 네트워크
   - 트랜스포머의 원동력은 *주의 집중*과 *피드포워드 네트워크* 두 메커니즘에 있다.
   - 주의 집중은 모델이 들어오는 시퀀스의 어떤 부분에 집중해야 하는지 학습하는 기술이다.
   - 이는 마치 '사우론의 눈'이 항상 모든 것을 스캔하고 관련된 부분에 빛을 비추는 것으로 생각할 수 있다.
   - 재미있는 사실: 연구자들은 Transformer 모델을 '주의 넷(Attention-Net)'으로 명명할 뻔했다. 주의가 이 모델의 중요한 부분이기 때문이다.

#### 4.머신러닝에서의 FFN이란?
   - 트랜스포머에서 FFN은 결국 독립된 데이터 벡터의 배치를 처리하는 일반적인 다층 퍼셉트론이다.
   - 어텐션과 결합되어 올바른 '위치-차원' 조합을 생성한다.

#### 5.트랜스포머의 핵심기술: Attention과 FFN
   - Attention 가중치와 FFN이 트랜스포머의 강력함을 만드는 방식에 대해 소개합니다.
   - Attention 가중치 획득과 피드포워드 네트워크(FFN)를 설명하고, 순차적 계산과 새로운 특징 조합에 대해 다룹니다.
   - Attention 단계는 위치에 따라 기존 특징을 결합하고, FFN 단계는 특성에 따라 차원을 결합합니다. ReLU를 통해 음수 값은 제거되며, 최종 출력은 다음 블록으로 전달됩니다.
   - 트랜스포머의 강력함을 이루는 두 가지 주요 포인트는: 1. Attention은 위치에 따라 결합, 2. FFN은 차원에 따라 결합하여 데이터를 다양한 방향에서 분석할 수 있다.


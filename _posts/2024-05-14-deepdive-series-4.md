---
title: Deep Dive into Self-Attention by Hand
description: Self-Attention
categories: [Blogging, Deepdive]
tags: [Deepdive, Attention]
# author: foDev_jeong
date: 2024-05-14 13:14:00 +0800
# mermaid: true
# render_with_liquid: false
# image:
#   path: /assets/img/llm/LLM_evaluation_rank.jpeg
#   lqip: data:image/webp;base64,UklGRpoAAABXRUJQVlA4WAoAAAAQAAAADwAABwAAQUxQSDIAAAARL0AmbZurmr57yyIiqE8oiG0bejIYEQTgqiDA9vqnsUSI6H+oAERp2HZ65qP/VIAWAFZQOCBCAAAA8AEAnQEqEAAIAAVAfCWkAALp8sF8rgRgAP7o9FDvMCkMde9PK7euH5M1m6VWoDXf2FkP3BqV0ZYbO6NA/VFIAAAA
#   alt: [Rankings of model performance change drastically depending on which LLM is used as the judge on KILT-NQ]
---

### **Original Article** : 👉 <https://towardsdatascience.com/deep-dive-into-self-attention-by-hand-%EF%B8%8E-f02876e49857>

* * *

### **ChatGPT4o**

#### 셀프 어텐션 메커니즘 요약
셀프 어텐션(Self-Attention)은 입력 시퀀스의 각 단어가 다른 모든 단어들과의 관계를 평가하여 가중치를 부여하는 방법입니다. 이를 통해 문맥을 더 잘 이해하고 긴 종속성을 포착할 수 있습니다.

#### 주요 단계
쿼리(Q), 키(K), 값(V) 생성: 입력 행렬을 선형 변환하여 Q, K, V 행렬을 만듭니다.

- 어텐션 스코어 계산: Q와 K의 행렬 곱을 통해 각 단어의 유사도를 구하고, 소프트맥스 함수로 정규화합니다.
- 어텐션 출력 계산: 정규화된 스코어에 V를 곱하여 최종 출력 값을 얻습니다.

#### 장점
- 병렬 처리 가능
- 긴 종속성 학습에 효과적


* * *

### **Lilys AI** : 👉 <https://lilys.ai/digest/660003>
> Below Summary Note

Deep Dive into Self-Attention by Hand✍︎ | by Srijanie Dey, PhD | Apr, 2024 | Towards Data Science

#### 1.트랜스포머를 가속하는 주의 집중의 본격적 탐구
   - 트랜스포머를 촉진하는 주의 메커니즘을 상세히 살펴본다.
   - 머리글: '주의' 개념에 대한 복잡성을 알아보자.
   - '로빗머스 프라임' 같은 것이 아니라 신경망을 구성하는 트랜스포머의 힘은 '**주의**' 개념 때문이다.
   - 그렇다면, 트랜스포머의 맥락에서 주의란 정확히 무엇을 의미하는 것일까? 여기서 몇 가지 답을 찾아보려고 한다.

#### 2.트랜스포머와 세부 메커니즘 추론
   - **트랜스포머는** 데이터로부터 맥락을 학습하는 신경망으로, '주의와 맥락'의 의미를 찾는 우리와 유사하다.
   - **트랜스포머가 데이터로부터 맥락을 어떻게 학습하는가?** : *주의 메커니즘*을 사용함.
   - **주의 메커니즘**은 모델이 각 단계에서 시퀀스의 모든 부분을 조사하고 중점을 두어야 할 요소를 결정하는 데 도움이 된다.
   - **셀프-주의**는 RNN의 성능을 향상시키는 데 기여하며, 2017년에 소개된 트랜스포머 아키텍처는 RNN 및 CNN의 필요성을 소멸시켰다.
   - 트랜스포머 아키텍처에는 **스케일드 닷-프로덕트** 메커니즘이 있으며, 셀프-주의는 외부같은 셸과 내부같은 셸의 결합으로 볼 수 있다.

#### 3.️Self-Attention 메커니즘과 어텐션 웨이팅 이해
   - 어텐션 웨이트 매트릭스 **A**는 입력 특징을 Query-Key(QK) 모듈에 피드하여 얻게 된다.
   - 셀프 어텐션은 *QK-모듈을 사용하여 어텐션 웨이트 매트릭스 A를 만들 때* 수행된다.
   - 쿼리(Q), 키(K), 밸류(V) 등 여러 구성요소를 살펴보며 **설명적으로 한국영 상상을 이용**하여 Self-Attention의 원리를 이해한다.
   - **행렬 곱셈**의 과정과 **스케일링** 과정에 대한 실제 연산과 벡터 간 *코사인 유사도* 및 *차원과의 관계*를 이해한다.

#### 4.️ 트랜스포머 섹션에서 QK-모듈을 통과한 후 얻은 **어텐션 가중치 행렬**.
   - '스케일링'된 닷-프로덕트 어텐션의 '스케일링' 부분 설명.
   - 소프트맥스 단계의 세 가지 부분: 1. 각 셀의 숫자에 e의 거듭제곱을 취함, 2. 각 열을 따라 이 새로운 값들을 합함, 3. 각 열마다, 해당 합으로 나눠줌.
   - 각 열을 정규화하여 숫자들이 1로 합쳐지도록 함. 결과적으로 각 열은 **어텐션의 확률 분포**로 되며, **어텐션 가중치 행렬 (A)**을 제공.
   - **어텐션 가중치 행렬은** 트랜스포머 섹션에서의 단계 2(QK-모듈을 통과한 후)에서 얻은 것.
   - 소프트맥스 단계는 이전 단계에서 얻은 점수에 확률을 할당하여 모델이 현재 쿼리에 대해 각 단어에 얼마나 중요하다고 결정하는 데 도움을 줌.

#### 5.소프트맥스 스텝의 중요성과 각 단어의 중요도 판단
   - 소프트맥스 스텝은 이전 단계에서 얻은 점수에 확률을 할당하여, 모델이 현재 쿼리에 대해 각 단어에 얼마나 *중요도*를 부여해야 하는지 결정하는 데 중요하다.
   - 높은 주의 가중치가 더 높은 *관련성*을 나타내며, 모델이 의존성을 더 정확하게 파악하도록 돕는다.
   - 이전 단계에서의 스케일링이 여기서 중요해지는데, 스케일링 없이 결과 행렬의 값이 소프트맥스 함수에서 잘 처리되지 못하는 영역으로 밀려 나서, 사라지는 기울기로 이어질 수 있다.
   - 마지막으로 **행렬 곱셈**을 통해 값 벡터(**V**s)를 *주의 가중치 행렬(**A**)과 곱한다. 이 값 벡터는 각 단어에 연관된 정보를 포함하므로 중요하다.

#### 6.자가주의 메커니즘의 최종 해결책: 주의 집중 특징 Zs
   - 이 단계의 최종 곱셈 결과는 **주의 집중 가중 특징 Z**로, 자가 주의 메커니즘의 궁극적인 해결책이다.
   - 이러한 주의 집중 가중 특징은 본질적으로 **특징의 가중 표현**을 담고 있으며, 주변 맥락에 따라 중요도가 높은 특징에 대해 높은 가중치를 할당한다.

#### 7.트랜스포머 아키텍처의 피드 포워드 레이어와 자가 주의 기법의 끝
   - 이 정보를 기반으로 *`트랜스포머 아키텍처`*의 다음 단계로 넘어가게 되는데, 여기서는 *`피드 포워드 레이어`*가 이 정보를 더 처리한다.
   - 이로써 *`자가 주의 기법`*의 뛰어난 기법의 끝을 확인하게 됩니다!
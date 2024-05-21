---
title: Deep Dive into LlaMA 3 by Hand
description: Llama3
categories: [Blogging, Deepdive]
tags: [Deepdive, Llama3]
# author: foDev_jeong
date: 2024-05-14 13:13:00 +0800
# mermaid: true
# render_with_liquid: false
# image:
#   path: /assets/img/llm/LLM_evaluation_rank.jpeg
#   lqip: data:image/webp;base64,UklGRpoAAABXRUJQVlA4WAoAAAAQAAAADwAABwAAQUxQSDIAAAARL0AmbZurmr57yyIiqE8oiG0bejIYEQTgqiDA9vqnsUSI6H+oAERp2HZ65qP/VIAWAFZQOCBCAAAA8AEAnQEqEAAIAAVAfCWkAALp8sF8rgRgAP7o9FDvMCkMde9PK7euH5M1m6VWoDXf2FkP3BqV0ZYbO6NA/VFIAAAA
#   alt: [Rankings of model performance change drastically depending on which LLM is used as the judge on KILT-NQ]
---

### **Original Article** : 👉 <https://towardsdatascience.com/deep-dive-into-llama-3-by-hand-%EF%B8%8F-6c6b23dc92b2>

* * *

### **Lilys AI** : 👉 <https://lilys.ai/digest/659993>
> Below Summary Note

Deep Dive into LlaMA 3 by Hand ✍️ | by Srijanie Dey, PhD | May, 2024 | Towards Data Science

#### 1. 2024년 5월, 할리우드 대학의 LlaMA 3에 대한 심층 탐구
   - 2024년 5월, 할리우드 대학 LlaMA 3를 다룬 Srijanie Dey, PhD의 겉보기와 더 내부구조에 대한 글.
   - Towards Data Science 웹사이트의 [앱에서 열기] 및 [가입하기], [로그인] 링크 제공.
   - [Medium 미디엄]은 회원가입, 로그인, 포스팅을 위한 링크도 제공하며, 글의 상단에 [Top highlight] 이미지 첨부.

#### 2. LlaMA 3의 트랜스포머 아키텍처 탐구
   - 릴마 3 뒤의 트랜스포머 아키텍처의 세세한 부분 및 GenAI 생태계에 대한 전망 탐색
   - 안데스 산맥의 거친 산속에서 사는 Rio, Rocky, Sierra 3마리의 아름다운 존재 이야기
   - 지혜로운 어른을 찾아가 지식을 스폰지처럼 흡수하며 함께 일하고 팀워크가 도임의 열쇠임을 배워가며 성장
   - Rio는 여행자들의 관점을 수용하고 이끄는 역할, Rocky는 신속한 해결책을 제공, Sierra는 힘을 내어주며 함께 성공하고 다른 이들에게 영감을 주는 LlaMA3 슈퍼 라마 삼총사 이야기
   - 지식, 지혜, 협업의 힘을 전하는 이야기로 LlaMA3 그들의 이야기는 있는 것을 증명함

#### 3.Meta의 LlaMA 3 출시 및 특징
   - 2024년 4월 18일, Meta는 LlaMa 3을 8B와 70B 파라미터 사이즈로 출시했다.
   - 이 모델은 LlaMA 2를 뛰어넘는 큰 도약을 이루었으며 가장 우수한 LLM 모델을 지향한다.
   - LlaMA 3을 개발하는 데 중점을 두었던 사항은 모델 아키텍처, 사전 훈련 데이터, 사전 훈련 확장, 그리고 설명 fine-tuning이었다.
   - 이에 대한 탐구를 돕기 위해 AWS의 Generative AI Lead인 Edurado Ordax와 콜로라도 대학교 보울더 캠퍼스의 CS 교수인 Tom Yeh와 협업하여, 기업 및 초급 단계에서 이 모델을 최대한 활용할 수 있는 방법을 모색한다.

#### 4.LlaMA 3의 파워 활용 노하우
   - 최근의 관행에 따르면, LLMs를 사용하고 작업하는 두 가지 주요 방법은 API 및 세세한 조정이 있습니다.
   - 사용자가 LlaMA 3와 상호 작용하는 주요 6단계로는 다음과 같습니다: 넓은 케이스의 사용을 위해 모델을 그대로 사용하거나 사용자 정의 애플리케이션에 따라 모델을 사용하거나 원하는 결과를 생성하도록 모델을 교육하는 프롬프트 엔지니어링 사용 등.
   - 이 모델에서 최대 이득을 얻기 위해 권장되는 방법은 사용자에게 많은 유연성을 제공하는 단계 5로 진입하는 것입니다.
   - 이 모델을 최대한 활용하기 위해 도메인 요구사항에 맞게 모델을 사용자화하는 것이 중요하며, 시스템에 관여하지 않으면 최적의 성과를 얻기 어렵습니다.
   - 사용자와 함께 장치에 대한 높은 수준의 그림을 제공하여 모델의 실제 이점을 얻을 수 있도록 엔터프라이즈 수준의 배포를 실현할 수 있습니다.

#### 5. LlaMa 3 성공의 비결 : 트랜스포머 아키텍처와 자가 주의의 결합
   - LlaMa 3이 유명해진 비결은 *트랜스포머 아키텍처*에 있다. 이는 산업 벤치마크에서 우수한 성능을 달성하기 위해 *고도로 최적화*되어 있음.
   - 또한, LlaMa 3이 Meta의 재량에 의해 오픈 소스로 제공되기 때문에, 강력한 아키텍처가 어떻게 구성되어 있는지를 상세히 알 수 있는 Model Card에 접근할 수 있다.
   - 트랜스포머 아키텍처와 자가 주의가 LlaMa 3에서 어떻게 역할을 하는지에 대한 가장 중요한 질문에 대해 논의함.
   - 트랜스포머 아키텍처에 대한 자세한 내용은 [여기](https://medium.com/towards-data-science/deep-dive-into-transformers-by-hand-%EF%B8%8E-68b8be4bd813), 자가 주의에 대한 내용은 [여기](https://medium.com/towards-data-science/deep-dive-into-self-attention-by-hand-︎-f02876e49857)에서 확인 가능함.

#### 6.LlaMA 3 모델의 기본 구성
   - LlaMa 3 모델의 **8B 변형** 중에서 주요 **매개변수**는 다음과 같다.
   - 주요 매개변수로는 'Layers', 'Attention heads', 'Vocabulary words', 'Feature dimensions', 'Hidden dimensions', 'Context-window size'가 있다.
   - 이러한 값들이 모델에서 어떻게 작용하는지 실제 숫자를 확인하며 각각의 중요성을 알아보자.
   - 맥락-윈도우, 어휘 크기, 주의-레이어, 특성 차원, 숨겨진 차원, 트랜스포머 내합 등이 모델의 핵심적인 부분을 이룬다.

#### 7.어텐션 레이어와 어텐션 레이어 수와 어텐션 레이어 수
   - Transformer 클래스는 **어휘 크기**와 레이어 수를 정의한다.
   - 여기서 **어휘 크기**란 모델이 인식하고 처리할 수 있는 *단어(및 토큰)*의 집합을 말한다.
   - **어텐션 레이어**는 모델에서 사용되는 트랜스포머 블록(어텐션 및 피드-포워드 레이어의 조합)을 가리킨다.
   - LlaMA 3의 어휘 크기는 128K로 매우 크며, 해당 모델에는 트랜스포머 블록의 32개 복사본이 있다.

#### 8.️특징 차원과 어텐션 헤드
   - 특징 차원과 어텐션 헤드는 *셀프 어텐션 모듈*로 진입합니다.
   - *특징 차원*은 임베딩 공간의 토큰 벡터 크기를 가리키며, **어텐션 헤드**는 트랜스포머의 셀프 어텐션 메커니즘을 제어하는 QK 모듈로 이루어져 있습니다.

#### 9.히든 디멘션 및 피드포워드 클래스
   - 히든 디멘션은 **피드포워드 클래스**에 속하며, 모델의 숨겨진 레이어 수를 지정한다.
   - LlaMa 3에서 히든 레이어는 특징 디멘션의 1.3배 크기이다.
   - 많은 수의 히든 레이어는 네트워크가 내부적으로 더 풍부한 표현을 생성하고 다룰 수 있도록 한다.

#### 10.트랜스포머 생성 과정과 파라미터 합치기
   - 첫 번째 행렬은 **어텐션 레이어**를 거쳐 어텐션 가중치 특성을 만든다.
   - 실제 Llama 3 모델에서는 5x3 행렬 크기에서 8K x 4096으로 커지는데, 이는 굉장히 거대하다.
   - 다음은 히든 레이어가 5325로 커지면서 피드 포워드 네트워크로 이뤄지며, 마지막 레이어에서 4096으로 다시 축소된다.

#### 11.트랜스포머 블록의 다층 구조
   - 32개의 트랜스포머 블록이 결합된 LlaMA 3은 각 블록의 출력이 다음 블록으로 전달되며, 마지막 블록에 도달할 때까지 진행된다.
   - 각 트랜스포머 블록은 여러 개의 층으로 이루어져 있으며, 출력은 차례대로 다음 블록으로 전달되는 구조이다.

#### 12.놀라운 LlaMA 3 모델과 그 효과
   - 입력 매트릭스 8K x 128K의 임베딩 처리된 후 4096 차원 이하로 축소됨.
   - 트랜스포머 블록에서 특징이 32층에서 처리되며, 최종 매트릭스 크기는 특징 차원과 동일.
   - LlaMA 3은 8B 및 70B 모델로 출시되어 여러 용도에 적합함.
   - LlaMA 3이 기존 벤치마크에서 압도적 성과를 보이며 메타사는 더 강력한 모델 발표 예정.
   - LlaMA 모델은 안데스 산맥 전설체계의 힘과 지혜에서 영감을 받음.

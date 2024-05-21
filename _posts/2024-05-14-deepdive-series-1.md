---
title: Deep Dive into Vector Databases by Hand 
description: Graph, Analytics
categories: [Blogging, Deepdive]
tags: [Deepdive, Vector Databases]
# author: foDev_jeong
date: 2024-05-14 13:10:00 +0800
# mermaid: true
# render_with_liquid: false
# image:
#   path: /assets/img/llm/LLM_evaluation_rank.jpeg
#   lqip: data:image/webp;base64,UklGRpoAAABXRUJQVlA4WAoAAAAQAAAADwAABwAAQUxQSDIAAAARL0AmbZurmr57yyIiqE8oiG0bejIYEQTgqiDA9vqnsUSI6H+oAERp2HZ65qP/VIAWAFZQOCBCAAAA8AEAnQEqEAAIAAVAfCWkAALp8sF8rgRgAP7o9FDvMCkMde9PK7euH5M1m6VWoDXf2FkP3BqV0ZYbO6NA/VFIAAAA
#   alt: [Rankings of model performance change drastically depending on which LLM is used as the judge on KILT-NQ]
---

### **Original Article** : 👉 <https://medium.com/towards-data-science/deep-dive-into-vector-databases-by-hand-e9ab71f54f80>

* * *

### **Lilys AI** : 👉 <https://lilys.ai/digest/659939>
> Below Summary Note

Deep Dive into Vector Databases by Hand ✍︎ | by Srijanie Dey, PhD | Towards Data Science

#### 1.벡터 데이터베이스에 대한 심층 탐구
   - 벡터 데이터베이스 뒷면에서 무슨 일이 발생하는지 탐구
   - Srijanie Dey, 박사의 글, 데이터 과학을 위해 Towards Data Science에서 발행
   - 8분 소요되는 이 글은 2024년 3월 20일 기준으로 597명이 읽음
   - 벡터 데이터베이스에 대한 글을 읽고 싶다면 공유 또는 청취 링크를 확인

#### 2.️아이 책 제작: LLM이 도와주는 벡터 이야기
   - 최근 즐겨쓰는 *대형 언어 모델(LLL)*에게 4살 막내에게 벡터를 설명할 이야기를 부탁했다.
   - 언어 모델은 신비한 생물과 마법, 벡터로 가득한 이야기를 빠르게 만들어냈고, 'LuminaVec'라는 유니콘의 이야기가 나왔다.
   - 이렇게 나온 새로운 어린이 책 스케치는 인상적했는데, 거의 4살 아이에게 구현된 'LuminaVec'를 포함한 이미지가 있었다.

#### 3.모델이 창조적인 매력을 연결하는 방법
   - 모델은 단어를 정확히 이해하지 못하지만, *숫자적 표현*인 **벡터**를 통해 이해한다.
   - 이러한 벡터는 각 단어 간 유사성을 찾고 각 단어에 대한 의미 있는 정보에 집중하도록 도와준다.
   - **임베딩**을 사용하여 의미론적 및 맥락적 정보를 포착하려는 낮은 차원의 벡터를 사용한다.
   - *LLM*에서 이러한 벡터들을 다룰 때 주의가 필요하며, 수백 개 이상의 차원에 걸쳐 길고 복잡해질 수 있다.
   - 처리 속도와 비용 증가를 신중하게 다뤄야 할 필요가 있다.

#### 4.벡터 데이터베이스: 스케일 및 속도 문제를 해결하는 강력한 솔루션
   - **벡터 데이터베이스**는 벡터 임베딩을 포함하는 특수한 데이터베이스로, 유사한 객체는 벡터 공간에서 서로 가까운 위치에 있고, 다른 객체는 더 멀리 떨어져 있다.
   - 매번 쿼리가 발생할 때 데이터를 구문 분석하고 이러한 벡터 임베딩을 생성하는 대신, 데이터를 한 번 모델을 통과시키고 벡터 데이터베이스에 저장하여 필요할 때 검색하는 것이 훨씬 빠르다.
   - 이로써 벡터 데이터베이스는 **LLM**들의 스케일과 속도 문제에 대한 강력한 해결책 중 하나가 된다.
   - 무지개 유니콘, 반짝이는 마법, 강력한 벡터에 관한 이야기를 되돌아보면, 모델에 그 질문을 한 적이 있다면 아래와 같은 과정을 거칠 수 있었다:
   - 임베딩 모델이 먼저 질문을 벡터 임베딩으로 변환하였다. 해당 벡터 임베딩은 5세용 재미있는 이야기와 벡터에 대한 벡터 데이터베이스와 비교되었다. 이 검색 및 비교에 따라, 가장 유사한 벡터들이 반환되었을 것이다.
   - 결과는 쿼리 벡터와 유사성 순서에 따라 순위가 매겨진 벡터 목록으로 구성되어야 했다.

#### 5.️벡터 데이터베이스 작동 방식
   - 벡터 및 벡터 데이터베이스의 작동 원리를 설명하는 훌륭한 작품이 있어, 이를 통해 마이크로 레벨에서 이러한 단계를 해결해보자.
   - 21단어의 텍스트와 22개의 벡터 테이블을 이용해 단어 임베딩을 생성하는 것부터 시작하여, 매우 작은 수의 feature vectors를 얻기 위해 단어 임베딩을 타임에 따라 인코딩하는 단계까지 진행된다.
   - 이후 단어를 질의해 임베딩, 인코딩, 인덱싱하여 쿼리의 2D-벡터 표현을 얻게 되고, 이후 닷 프로덕트를 수행한 후 가장 유사한 결과를 찾아낸다.
   - 이후 평균 풀링하여 텍스트 임베딩 및 문장 임베딩을 얻고, 마지막으로 인접 이웃 분석을 통해 가장 대표적인 결과를 찾아내 끝이 난다.

#### 6. '대규모' 데이터 처리와 벡터 데이터베이스의 중요성
   - 수십억 개의 문장을 포함할 수 있는 데이터셋, 각 문장의 토큰 수는 수만 개, 단어 임베딩 차원은 수천 개에 달할 수 있다.
   - 이 모든 데이터와 단계를 종합하면, 굉장히 방대한 크기의 차원을 다루게 된다.
   - 이러한 거대한 규모에 대응하기 위해, 벡터 데이터베이스가 필요하며, 이러한 규모 처리 능력으로 RAG모델의 효율적 검색을 가능케 해준다.
   - 따라서 벡터 데이터베이스는 검색 증강 생성(RAG) 모델에 중요한 역할을 한다. 또한, 벡터 데이터베이스의 확장성과 속도는 효율적인 생성 모델을 위한 길을 열어주는 역할을 한다. 이 모든 것을 종합하면 벡터 데이터베이스는 매우 강력하다고 말할 수 있다.

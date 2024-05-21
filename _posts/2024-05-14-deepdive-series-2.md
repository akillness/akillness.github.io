---
title: Deep Dive into Sora’s Diffusion Transformer (DiT) by Hand 
description: Sora, Diffusion,Transformer
categories: [Blogging, Deepdive]
tags: [Deepdive, Sora, Diffusion, Transformer]
# author: foDev_jeong
date: 2024-05-14 13:11:00 +0800
# mermaid: true
# render_with_liquid: false
# image:
#   path: /assets/img/llm/LLM_evaluation_rank.jpeg
#   lqip: data:image/webp;base64,UklGRpoAAABXRUJQVlA4WAoAAAAQAAAADwAABwAAQUxQSDIAAAARL0AmbZurmr57yyIiqE8oiG0bejIYEQTgqiDA9vqnsUSI6H+oAERp2HZ65qP/VIAWAFZQOCBCAAAA8AEAnQEqEAAIAAVAfCWkAALp8sF8rgRgAP7o9FDvMCkMde9PK7euH5M1m6VWoDXf2FkP3BqV0ZYbO6NA/VFIAAAA
#   alt: [Rankings of model performance change drastically depending on which LLM is used as the judge on KILT-NQ]
---

### **Original Article** : 👉 <https://towardsdatascience.com/deep-dive-into-soras-diffusion-transformer-dit-by-hand-%EF%B8%8E-1e4d84ec865d>

* * *

### **Lilys AI** : 👉 <https://lilys.ai/digest/659978>
> Below Summary Note

Deep Dive into Sora’s Diffusion Transformer (DiT) by Hand ✍︎ | by Srijanie Dey, PhD | Apr, 2024 | Towards Data Science

#### 1.️소라의 확산 트랜스포머 (DiT)에 손수 과심
   - 2024년 4월, 티워즈 데이터 사이언스의 Srijanie Dey 석사의 글에 따르면
   - **`소라의 확산 트랜스포머(DiT)`**에 대한 심층적인 연구가 진행되고 있다.
   - 글에서는 DiT를 손으로 살펴보는 내용이 다뤄지고 있으며, 흥미로운 내용이 소개되고 있다.
   - 해당 글은 'Towards Data Science' 앱에서 확인할 수 있으며, DiT에 대한 새로운 통찰을 얻을 수 있는 기회가 제공된다.

#### 2.Sora의 확산 변압기(DiT) 심층 분석
   - Sora의 최첨단 비디오 뒤에 숨겨진 비밀을 탐색한다.
   - Sora의 전설, DiTharos의 고대 땅에서 시작되어 무한한 잠재력을 구현하는 전설로 묘사.
   - Sora가 구름 속에 흩어진 빛의 요소를 활용하고 있는 거대한 마법의 힘과 능력에 대해 다룸.
   - 현재 하늘에 있는 붉은 색의 얼룩을 보면 반석을 날고 있는 전설의 한 부분인 것을 알게 된다.

#### 3.Sora: Open AI의 텍스트-비디오 모델의 탄생과 세계적인 인기
   - Sora는 [William Peebles](https://www.linkedin.com/in/william-peebles-a980a212a/)와 [Saining Xie](https://www.linkedin.com/in/sainxie/)가 2023년에 개발한 확산 트랜스포머(DiT)이다.
   - 확산 아이디어를 이용해 비디오를 예측하고, 트랜스포머의 강점을 활용하여 스케일링한다.
   - Sora가 텍스트 프롬프트를 받았을 때 하는 일과 확산-트랜스포머 아이디어를 어떻게 결합하는지 살펴본다.
   - Sora가 만든 비디오 중에서 가장 좋아하는 것은 이탈리아 거리에서 귀여운 달마시안을 보여주는 것으로, 그 움직임이 얼마나 자연스러운지 놀라운 점이다.

#### 4.Sora의 동작 방식
   - Sora는 텍스트 프롬프트를 기반으로 한 비디오를 생성하는 것이 목표이다.
   - **`Diffusion 단계 *t* = 3`** 을 통해 모델 내에 noise를 추가하여 이미지의 세부 요소를 변화시키며 더 정제된 이미지를 생성한다.
   - Sora는 영상을 작은 요소로 분할하고 시공간 패치로 변환하는 데 사용하는 디멘젼 감소 기법과 인코더를 활용한다.
   - *디멘젼 감소* 과정을 통해 픽셀의 차원을 낮은 차원의 잠재 공간으로 변환함으로써 모델의 크기를 줄인다.
   - 다음으로 모델을 노이즈로 확산시켜 이미지를 생성하고, 텍스트 프롬프트와 함께 사용하여 비디오를 생성하는 것이다.

#### 5.️조건부 적응 정규화 층과 모델 조건부 인코딩
   - 조건부 적응 정규화란 모델의 행위를 추가로 가지고 있는 정보를 사용해 영향을 미치려는 것이다.
   - ‘Sora is sky’와 같은 프롬프트를 통해 모델이 **하늘이나 구름**과 같은 요소에 집중하도록 유도한다.
   - 조건부 적응 정규화층은 **네트워크 내 데이터를 동적으로 스케일링하고 이동**시키는 역할을 한다.
   - 모델에 적용되는 ‘adaptive’ 레이어 정규화는 가중치와 편향을 곱하고 더하여 정확한 데이터 핵심을 포착한다. 이를 위해 모델이 **학습 가능한 매개변수**인 가중치와 편향을 사용한다.

#### 6.프레임 시퀀스로 비디오 생성
   - 시효와 이동을 추정하고, 'X'와 '+'에 각각 저장함.
   - 스케일/이동 적용 시, 결합된 노이즈를 사용하여 '조건화(Conditioned)' 노이즈를 얻는다.
   - 트랜스포머로 노이즈 예측하며, MSE 손실을 이용하여 학습하고 새 비디오를 생성.
   - 영상을 패치로 줄이기 위한 비주얼 인코더, 확산 및 해독기법, 트랜스포머 아키텍처, 노이즈 제거 및 해독 과정 중요함.
   - 디코더를 통해 결과 픽셀을 재배열하며, 원하는 비디오 생성. 축하, 'Sora 비디오'!🌟

#### 7.소라 이야기 비교
   - 기사를 마친 후 처음의 이야기를 다시 읽어보라. 디타로스의 소라와 우리 세계의 소라 사이의 유사점을 발견할 수 있을 것이다.

#### 8. 디퓨전-트랜스포머(DiT) 콤보
   - Sora가 제작한 영상들을 고려할 때, 디퓨전-트랜스포머 디오는 치명적이라 할 수 있다.
   - 이것과 함께 시각적 패치 아이디어는 다양한 이미지 해상도, 화면 비율 및 지속 시간을 조정할 수 있는 요량을 열어줌으로써, 극한 실험을 가능하게 한다.
   - 총론적으로, 이 아이디어는 중요한 것이며 의심할 여지없이 계속되어올 것이다.
   - 뉴욕타임스의 기사에 따르면, Sora는 일본어로 하늘을 뜻하는 단어에서 영감을 받아, 한정된 가능성을 넘어서는 아이디어를 상징한다.
   - 초기의 약속을 경험한 뒤, Sora는 인공지능 분야에서 새로운 지평을 열어놓은 것은 사실이다. 이제 이것이 얼마나 안정성과 시간에 대한 시험에서 잘 견뎌내는지가 남아 있다. '디타로스' 전설에 따르면 - 'Sora는 계속 능력을 향상시키며 강해지고, 황금빛 순간에 비행할 준비를 하는 것이다!'

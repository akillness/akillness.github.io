---
title: Scaling Monosemanticity by Anthropic (블랙박스 이해하기)
description: LLM, Scaling
categories: [LLM, Scaling]
tags: [Scaling, LLM]
# author: foDev_jeong
date: 2024-05-27 09:13:00 +0800
# pin: true
# mermaid: true
# render_with_liquid: false
# image:
#   path: /assets/img/blog/NLP_Overview.svg
#   lqip: data:image/webp;base64,UklGRpoAAABXRUJQVlA4WAoAAAAQAAAADwAABwAAQUxQSDIAAAARL0AmbZurmr57yyIiqE8oiG0bejIYEQTgqiDA9vqnsUSI6H+oAERp2HZ65qP/VIAWAFZQOCBCAAAA8AEAnQEqEAAIAAVAfCWkAALp8sF8rgRgAP7o9FDvMCkMde9PK7euH5M1m6VWoDXf2FkP3BqV0ZYbO6NA/VFIAAAA
#   alt: [Overview of NLP Course]
---

> Origitnal Article : <https://inblog.ai/jasonlee/%EB%B8%94%EB%9E%99%EB%B0%95%EC%8A%A4-%EC%9D%B4%ED%95%B4%ED%95%98%EA%B8%B0-scaling-monosemanticity-by-anthropic-20662>
{: .prompt-info }

## Introduce

트랜스포머 기술을 기반으로 하는 생성형 AI는 비결정적(non-deterministic) 컴퓨터입니다. 이러한 시스템은 개발자가 명확하게 프로그래밍한 명령에 의존하는 기존의 폰 노이만 머신과는 달리 “확률적”으로 작동합니다.

생성형 AI는 확률적 컴퓨터로서, 자연어, 이미지와 같은 다양한 비정형 데이터를 처리하고 이해하는 능력을 갖추고 있습니다. 이를 통해 기존 컴퓨터가 접근할 수 없는 방대한 지식을 습득하고 활용할 수 있습니다. 

확률적 컴퓨터는 학습된 방대한 지식을 바탕으로 연구와 모델링은 물론, 다양한 창의적 작업을 별도 프로그래밍 없이 '제로샷' 방식으로 수행할 수 있습니다. 여기서 '제로샷'은 특정 작업에 대해 사전에 특별히 훈련되지 않은 상태에서도 해당 작업을 수행할 수 있는 AI의 능력을 의미합니다.

그러나 이런 확률적 컴퓨터는 운영 방식이 말 그대로 “확률적”이기 때문에 interpretability가 매우 중요합니다. 예를 들어, 확률적 컴퓨터의 아웃풋에서 위험한 내용(차별, 혐오, 환각증상 등)이 포함되어 있다면 이 오류에 대한 원천을 이해해야 문제를 개선할 수 있습니다.

하지만, 모두 잘 아시다시피 거대언어모델은 거대한 데이터셋을 unsupervised learning (비지도학습) 방식으로 학습되어 이젠 1 trillion이 넘어가는 파라미터에 분산 되어 저장됩니다 (LLM 기초 블로그). 이러한 복잡한 구조로 인해, 실제로는 매우 똑똑한 컴퓨터를 만들었음에도 불구하고, 그 작동 원리를 완전히 이해하지 못하는 '블랙박스' 상태에 빠지게 됩니다.

이러한 '블랙박스'의 성격은 신뢰성 부족, 상업적 도입의 어려움, AI의 편향성 및 공정성 문제, AI에 대한 사회적 두려움으로 인한 규제 증가 등 다양한 downstream 문제를 야기합니다.
그렇기 때문에 interpretability 연구는 매우 중요하고 AI 모델의 성능 개선과 같이 병행되어야 하는 필수적인 연구분야입니다. 

최근 Anthropic이 발표한 “Scaling Monosemanticity: Extracting Interpretable Features from Claude 3 Sonnet”가 화제입니다. Anthropic은 sparse autoencoders라는 모델을 활용하여 거대언어모델 행동을 이해하고 조정할 수 있는 방향성을 제시합니다.


![ Main Idea Anthropic Paper ](/assets/img/blog/Scaling_LLM_by_Anthropic.png){: .light  .shadow .rounded-10 w='1212' h='668' }

## Opinion

생성형 AI는 비결정적(non-deterministic) 컴퓨터입니다. 이러한 시스템은 개발자가 명확하게 프로그래밍한 명령에 의존하는 기존의 폰 노이만 머신과는 달리 “확률적”으로 작동합니다.

생성형 AI는 확률적(probabilistic) 컴퓨터로서, 자연어, 이미지와 같은 다양한 비정형 데이터를 처리하고 이해하는 능력을 갖추고 있습니다. 이를 통해 기존 컴퓨터가 접근할 수 없는 방대한 지식을 습득하고 활용할 수 있습니다. 

그러나 이런 확률적 컴퓨터는 운영 방식이 말 그대로 “확률적”이기 때문에 interpretability(해석력)가 매우 중요합니다. 예를 들어, 모델 아웃풋에서 위험한 내용(차별, 혐오, 환각증상 등)이 포함되어 있다면 이 오류에 대한 원천을 이해해야 문제를 개선할 수 있습니다.

하지만, 모두 잘 아시다시피 거대언어모델은 거대한 데이터셋을 unsupervised learning (비지도학습) 방식으로 학습되어 이젠 1 trillion이 넘어가는 파라미터에 분산 되어 저장됩니다. 이러한 복잡한 구조로 인해, 실제로는 매우 똑똑한 컴퓨터를 만들었음에도 불구하고, 그 작동 원리를 완전히 이해하지 못하는 '블랙박스' 상태에 빠지게 됩니다.

이러한 '블랙박스'의 성격은 신뢰성 부족, 상업적 도입의 어려움, AI의 편향성 및 공정성 문제, AI에 대한 사회적 두려움으로 인한 규제 증가 등 다양한 downstream 문제를 야기합니다.

그렇기 때문에 interpretability 연구는 매우 중요하고 AI 모델의 성능 개선과 같이 병행되어야 하는 필수적인 연구분야입니다. 

최근 Anthropic이 발표한 “Scaling Monosemanticity: Extracting Interpretable Features from Claude 3 Sonnet”가 화제입니다. Anthropic은 sparse autoencoders라는 모델을 활용하여 거대언어모델 행동을 이해하고 조정할 수 있는 방향성을 제시합니다.
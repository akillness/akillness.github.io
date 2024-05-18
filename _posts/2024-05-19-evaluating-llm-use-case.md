---
title: LLM 성능 평가 ( 한국어 ) Use Case 분석해보기
description: LLM, Evaluation
categories: [Script, Evaluation]
tags: [LLM, Evaluation]
# author: foDev_jeong
date: 2024-05-19 01:20:00 +0800
# mermaid: true
# render_with_liquid: false
# image:
#   path: /assets/img/llm/LLM_evaluation_rank.jpeg
#   lqip: data:image/webp;base64,UklGRpoAAABXRUJQVlA4WAoAAAAQAAAADwAABwAAQUxQSDIAAAARL0AmbZurmr57yyIiqE8oiG0bejIYEQTgqiDA9vqnsUSI6H+oAERp2HZ65qP/VIAWAFZQOCBCAAAA8AEAnQEqEAAIAAVAfCWkAALp8sF8rgRgAP7o9FDvMCkMde9PK7euH5M1m6VWoDXf2FkP3BqV0ZYbO6NA/VFIAAAA
#   alt: [Rankings of model performance change drastically depending on which LLM is used as the judge on KILT-NQ]
---


## LLM 성능 평가 ( 한국어 ) Use Case 분석해보기

ㄴ 아래의 한국어 테스트 케이스를 분석해서 코드로 적용해보자

한줄요약 : GPT-4o가 GPT-4-turbo보다 한국어 더 잘합니다!! ( from by [seungyun-baek](https://www.linkedin.com/in/seungyun-baek-aa40a4211/))

팀 내에서 GPT-4o를 적극 도입하고 있는데요. 한국어 벤치마크로는 평가된 결과를 찾지 못해서 GPT-4-turbo보다 잘하는건지 못하는건지 긴가민가하고 있었습니다. 3-4일이 되어도 딱히 올라오는 결과들이 없어서 직접 **정량적으로** 평가를 해보았습니다.

최근에 소개해드렸었던 KAIST Alice Oh 교수님의 랩실에서 제작한 CLIcK 이라는 한국어, 한국문화 데이터셋을 사용해보았는데요.

결론은 GPT-4o가 GPT-4-turbo보다 모든 카테고리에서 좋은 성능을 보여주었습니다! 그래프 첨부해두었으니 확인해보세요 😀 (그래프는 저 대신 gpt-4o 친구가 그려줬어요) 정확한 값이 궁금하다면, 깃헙 레포에 남겨두었으니 참고하세요!

계속해서 코드리뷰하면서 진행했지만 혹여나 평가 중 실수가 있었을까 해서 평가 코드를 그대로 깃헙에 올려두었습니다. 궁금하신 분들은 평가에 사용한 코드도 한번 보시면 좋을 것 같아요!

👉 깃헙 바로가기: <https://github.com/corca-ai/evaluating-gpt-4o-on-CLIcK>

반응이 좋다면 계속해서 한국어 벤치마크에 대한 SOTA LLM들 평가를 해볼까 합니다! 테스트해보면 좋을 모델, 벤치마크 생각나는대로 댓글에 남겨주세요! 😉
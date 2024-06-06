---
title: 🔉 Meta's latest "CoPE" (Contextual Position Encoding)
description: Meta, CoPE
categories: [LLM, CoPE]
tags: [Meta, Positional Encoder, CoPE]
# author: foDev_jeong
date: 2024-06-05 13:00:00 +0800
# pin: true
# mermaid: true
# render_with_liquid: false
# image:
#   path: /assets/img/blog/NLP_Overview.svg
#   lqip: data:image/webp;base64,UklGRpoAAABXRUJQVlA4WAoAAAAQAAAADwAABwAAQUxQSDIAAAARL0AmbZurmr57yyIiqE8oiG0bejIYEQTgqiDA9vqnsUSI6H+oAERp2HZ65qP/VIAWAFZQOCBCAAAA8AEAnQEqEAAIAAVAfCWkAALp8sF8rgRgAP7o9FDvMCkMde9PK7euH5M1m6VWoDXf2FkP3BqV0ZYbO6NA/VFIAAAA
#   alt: [Overview of NLP Course]
---

## Meta's latest "CoPE" paper isn't getting the attention it deserves! 

 The authors introduce a really innovative approach that utilizes context during positional encoding.


Here's a quick summary:
- ⛳ Traditional positional encoding (PE) methods use token counts to derive position, limiting their ability to generalize to higher levels of abstraction, such as sentences.
- ⛳ CoPE overcomes this by integrating context with position addressing, making it possible to represent various levels of position abstraction simultaneously.
- ⛳ CoPE (Contextual Position Encoding) allows positions to be conditioned on context by incrementing position only on certain tokens determined by the model. This enables more general position addressing, such as attending to the i-th particular word, noun, or sentence.
- ⛳ CoPE uses context vectors to determine which tokens to count, computing a gate value for each previous token relative to the current token. These gate values are aggregated to determine the relative position, which can take fractional values. Position embeddings are interpolated for these fractional values and added to key vectors for use in the attention operation.
- ⛳CoPE excels in tasks where popular PE methods fail, such as selective copying, counting, and the Flip-Flop task. It also improves perplexity on language modeling and coding tasks, demonstrating real-world applicability.

I honestly think that this is a very neat and functional research work that could help improve SoTA LLMs!


Link to the paper : <https://arxiv.org/pdf/2405.18719>


![ CoPE over RoPE ](/assets/img/llm/LLM_CoPE.jpeg){: .light .shadow .rounded-10 w='1212' h='668' }


<details markdown="1">
<summary style= "font-size:24px; line-height:24px; font-weight:bold; cursor:pointer;" > Translate to Korean </summary>

## Meta의 최신 "CoPE" 논문은 마땅히 받아야 할 관심을 받지 못하고 있습니다! 저자는 위치 인코딩 중에 컨텍스트를 활용하는 정말 혁신적인 접근 방식을 소개합니다.

다음은 간단한 요약입니다.
- ⛳ 기존의 PE(위치 인코딩) 방법은 토큰 수를 사용하여 위치를 파생하므로 문장과 같은 더 높은 수준의 추상화로 일반화하는 기능을 제한합니다.
- ⛳ CoPE는 컨텍스트를 위치 주소 지정과 통합하여 다양한 수준의 위치 추상화를 동시에 표현할 수 있도록 함으로써 이를 극복합니다.
- ⛳ CoPE(Contextual Position Encoding)를 사용하면 모델에 의해 결정된 특정 토큰에 대해서만 위치를 증가시켜 컨텍스트에 따라 위치를 조건화할 수 있습니다. 이렇게 하면 i번째 특정 단어, 명사 또는 문장에 주의를 기울이는 것과 같은 보다 일반적인 위치 주소 지정이 가능합니다.
- ⛳ CoPE는 컨텍스트 벡터를 사용하여 계산할 토큰을 결정하고 현재 토큰을 기준으로 각 이전 토큰에 대한 게이트 값을 계산합니다. 이러한 게이트 값은 분수 값을 사용할 수 있는 상대적 위치를 결정하기 위해 집계됩니다. 위치 임베딩은 이러한 소수 값에 대해 보간되고 어텐션 작업에 사용하기 위해 키 벡터에 추가됩니다.
- ⛳CoPE는 선택적 복사, 카운팅 및 Flip-Flop 작업과 같이 널리 사용되는 PE 방법이 실패하는 작업에 탁월합니다. 또한 언어 모델링 및 코딩 작업의 복잡성을 개선하여 실제 적용 가능성을 보여줍니다.

솔직히 말해서 이것은 SoTA LLM을 개선하는 데 도움이 될 수 있는 매우 깔끔하고 기능적인 연구 작업이라고 생각합니다!

</details>
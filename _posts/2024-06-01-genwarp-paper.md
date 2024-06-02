---
title: Single Image to Novel Views with Semantic-Preserving Generative Warping ( GenWarp )
description: Paper, GenWarp, Single Image
categories: [Paper, GenWarp]
tags: [AI, Novel Veiw, GenWarp]
# author: foDev_jeong
date: 2024-06-01 11:00:00 +0800
# pin: true
# mermaid: true
# render_with_liquid: false
# image:
#   path: /assets/img/blog/NLP_Overview.svg
#   lqip: data:image/webp;base64,UklGRpoAAABXRUJQVlA4WAoAAAAQAAAADwAABwAAQUxQSDIAAAARL0AmbZurmr57yyIiqE8oiG0bejIYEQTgqiDA9vqnsUSI6H+oAERp2HZ65qP/VIAWAFZQOCBCAAAA8AEAnQEqEAAIAAVAfCWkAALp8sF8rgRgAP7o9FDvMCkMde9PK7euH5M1m6VWoDXf2FkP3BqV0ZYbO6NA/VFIAAAA
#   alt: [Overview of NLP Course]
---

## 🌟Few pointers from the paper

- 🎯Generating novel views from a single image remains a challenging task due to the complexity of 3D scenes and the limited diversity in the existing multi-view datasets to train a model on.

- 🎯 Recent research combining large-scale text-to-image (T2I) models with monocular depth estimation (MDE) has shown promise in handling in-the-wild images.

- 🎯In these methods, an input view is geometrically warped to novel views with estimated depth maps, then the warped image is inpainted by T2I models. However, they struggle with noisy depth maps and loss of semantic details when warping an input view to novel viewpoints.

- 🎯In this paper, authors have proposed a novel approach for single-shot novel view synthesis, a semantic-preserving generative warping framework that enables T2I generative models to learn where to warp and where to generate, through augmenting cross-view attention with self-attention.

- 🎯Their approach addresses the limitations of existing methods by conditioning the generative model on source view images and incorporating geometric warping signals.

🏢Organization: SonyAI, Sony Group Corporation, 고려대학교

> 🧙Paper Authors: Junyoung Seo, Kazumi Fukuda, Takashi Shibuya, Takuya Narihira, Naoki Murata, Shoukang Hu, Chieh-Hsin (Jesse) Lai , Seungryong Kim, Yuki Mitsufuji, PhD 
- 1️⃣Read the Full Paper here: <https://arxiv.org/abs/2405.17251>
- 2️⃣Project Page: <https://genwarp-nvs.github.io/>
- 3️⃣Code: Coming 🔜
{: .prompt-info }


![ GenWarp Novel Views ](/assets/img/paper/GenWarp_novel_veiws.png){: .light  .shadow .rounded-10 w='1212' h='668' }


<details markdown="1">
<summary style= "font-size:24px; line-height:24px; font-weight:bold; cursor:pointer;" > Translate to Korean </summary>

## 🌟논문의 몇 가지 지침

- 🎯단일 이미지에서 새로운 뷰를 생성하는 것은 3D 장면의 복잡성과 모델을 훈련할 기존 다중 뷰 데이터 세트의 제한된 다양성으로 인해 어려운 작업으로 남아 있습니다.

- 🎯 대규모 T2I(Text-to-Image) 모델과 MDE(단안 깊이 추정)를 결합한 최근 연구는 실제 이미지를 처리하는 데 있어 가능성을 보여주었습니다.

- 🎯이러한 방법에서 입력 뷰는 추정된 깊이 맵이 있는 새로운 뷰로 기하학적으로 뒤틀린 다음 T2I 모델에 의해 뒤틀린 이미지를 그립니다. 그러나 시끄러운 깊이 맵과 입력 보기를 새로운 관점으로 왜곡할 때 의미론적 세부 정보가 손실되는 데 어려움을 겪습니다.

- 🎯이 논문에서 저자들은 T2I 생성 모델이 셀프 어텐션을 통해 크로스 뷰 어텐션을 강화하여 워프할 위치와 생성 위치를 학습할 수 있도록 하는 의미론적 보존 생성 워핑 프레임워크인 단일 샷 소설 뷰 합성을 위한 새로운 접근 방식을 제안했습니다.

- 🎯그들의 접근 방식은 소스 뷰 이미지에서 생성 모델을 조정하고 기하학적 뒤틀림 신호를 통합하여 기존 방법의 한계를 해결합니다.

🏢조직: SonyAI, Sony Group Corporation, 고려대학교 

🧙논문 저자: Junyoung Seo, Kazumi Fukuda, Takashi Shibuya, Takuya Narihira, Naoki Murata, Shoukang Hu, Chieh-Hsin (Jesse) Lai, Seungryong Kim, Yuki Mitsufuji, PhD 

</details>
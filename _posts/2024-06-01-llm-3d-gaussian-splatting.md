---
title: 3D Language Gaussian Splatting ( LangSplat )
description: Paper, 3DGS, LLM
categories: [Paper, 3DGS]
tags: [AI, LLM, 3DGS]
# author: foDev_jeong
date: 2024-06-01 12:00:00 +0800
# pin: true
# mermaid: true
# render_with_liquid: false
# image:
#   path: /assets/img/blog/NLP_Overview.svg
#   lqip: data:image/webp;base64,UklGRpoAAABXRUJQVlA4WAoAAAAQAAAADwAABwAAQUxQSDIAAAARL0AmbZurmr57yyIiqE8oiG0bejIYEQTgqiDA9vqnsUSI6H+oAERp2HZ65qP/VIAWAFZQOCBCAAAA8AEAnQEqEAAIAAVAfCWkAALp8sF8rgRgAP7o9FDvMCkMde9PK7euH5M1m6VWoDXf2FkP3BqV0ZYbO6NA/VFIAAAA
#   alt: [Overview of NLP Course]
---

{% include embed/youtube.html id='XMlyjsei-Es' %}

Having semantic in a 3D reconstruction is extremely powerful as it can be used for segmentation or connected to a LLM to retrieve localised information. Could we do that for 3D gaussian splatting?

Take a look at "LangSplat: 3D Language Gaussian Splatting" from Tsinghua University and Harvard University

This method ground CLIP features into a set of 3D language Gaussians, which attains precise 3D language fields while being 199 × faster than LERF.

They propose to learn hierarchical semantics using SAM, thereby eliminating the need for extensively querying the language field across various scales and the regularization of DINO features

I overlooked this method now accepted to CVPR 2024 but I'm glad I found it again. Have a look as well.


> 🧙Paper Authors: Minghan Qin1*, Wanhua Li2*†, Jiawei Zhou1*, Haoqian Wang1†, Hanspeter Pfister2 (* indicates equal contribution, † means Co-corresponding author)
1Tsinghua University, 2Harvard University 
- 1️⃣Read the Full Paper here: <https://arxiv.org/pdf/2312.16084>
- 2️⃣Project Page: <https://langsplat.github.io/>
- 3️⃣Code: <https://github.com/minghanqin/LangSplat>
{: .prompt-info }


<details markdown="1">
<summary style= "font-size:24px; line-height:24px; font-weight:bold; cursor:pointer;" > Translate to Korean </summary>

## 3D 재구성에서 시맨틱을 갖는 것은 세그멘테이션에 사용하거나 LLM에 연결하여 현지화된 정보를 검색할 수 있기 때문에 매우 강력합니다. 3D 가우시안 스플래팅에 대해 그렇게 할 수 있습니까?

Tsinghua University 및 Harvard University 의 "LangSplat: 3D 언어 Gaussian Splatting"을 살펴보십시오.

이 방법은 CLIP 기능을 3D 언어 가우시안 세트로 접지하여 LERF보다 199× 빠르면서 정확한 3D 언어 필드를 얻습니다.

그들은 SAM을 사용하여 계층적 의미론을 학습할 것을 제안하므로 다양한 규모에 걸쳐 언어 필드를 광범위하게 쿼리하고 DINO 기능을 정규화할 필요가 없습니다

현재 CVPR 2024에 승인된 이 방법을 간과했지만 다시 발견하게 되어 기쁩니다. 당신도 보세요.

</details>
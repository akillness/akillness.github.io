---
title: 3D Gaussian Splatting vs. NeRFs. What is the difference? 🤔 
description: Paper, 3DGS, NeRF
categories: [Paper, 3DGS]
tags: [AI, NeRF, 3DGS]
# author: foDev_jeong
date: 2024-05-31 01:00:00 +0800
# pin: true
# mermaid: true
# render_with_liquid: false
# image:
#   path: /assets/img/blog/NLP_Overview.svg
#   lqip: data:image/webp;base64,UklGRpoAAABXRUJQVlA4WAoAAAAQAAAADwAABwAAQUxQSDIAAAARL0AmbZurmr57yyIiqE8oiG0bejIYEQTgqiDA9vqnsUSI6H+oAERp2HZ65qP/VIAWAFZQOCBCAAAA8AEAnQEqEAAIAAVAfCWkAALp8sF8rgRgAP7o9FDvMCkMde9PK7euH5M1m6VWoDXf2FkP3BqV0ZYbO6NA/VFIAAAA
#   alt: [Overview of NLP Course]
---

## In the world of computer vision, 3D Gaussian Splatting and NeRFs are gaining traction. 

But what sets them apart? Here’s a quick breakdown:

### 🔍 3D Space Representation: 
- NeRF: Creates a continuous 3D space by sampling points throughout the scene for each training image.
- Gaussian Splatting: Relies on a sparse set of 3D points, often generated using Structure from Motion.

### 🎨 Points Description: 
- Gaussian Splatting: Uses complex 3D forms called Gaussians with varying shapes, sizes, transparency, and color, described with spherical harmonics.
- NeRF: Assigns each point an RGBA color and a viewing direction, with appearance dependent on location and viewing angle.

### ⚙️ Optimization: 
- NeRF: Uses a neural network to learn a continuous function for color and opacity.
- Gaussian Splatting: Directly optimizes the properties of each 3D ellipsoid without a neural network, resulting in a discrete set of ellipsoids.

In essence, NeRF offers a continuous, neural approach, while Gaussian Splatting provides a simpler, directly optimized discrete structure.

Which approach do you find more intriguing for applications in 3D graphics and AR? Share your thoughts in the comments! 💬


> Information About 3D Gaussian Splatting
- Blog : <https://xoft.tistory.com/74>
{: .prompt-info }

![ 3DGS Overview ](/assets/img/paper/3DGS_overview.png){: .light  .shadow .rounded-10 w='1212' h='668' }


<details markdown="1">
<summary style= "font-size:24px; line-height:24px; font-weight:bold; cursor:pointer;" > Translate to Korean </summary>

## 컴퓨터 비전의 세계에서는 3D Gaussian Splatting 및 NeRF가 주목을 받고 있습니다. 그러나 무엇이 그들을 차별화합니까? 다음은 간단한 분석입니다.

### 🔍 3D 공간 표현: 
- NeRF: 각 학습 이미지에 대해 장면 전체의 지점을 샘플링하여 연속 3D 공간을 만듭니다.
- 가우시안 스플래팅(Gaussian Splatting): 종종 모션의 구조(Structure from Motion)를 사용하여 생성되는 희소 3D 포인트 세트를 사용합니다.

### 🎨 포인트 설명: 
- 가우시안 스플래팅: 구형 고조파로 설명되는 다양한 모양, 크기, 투명도 및 색상을 가진 가우시안이라는 복잡한 3D 형태를 사용합니다.
- NeRF: 각 포인트에 RGBA 색상과 보기 방향을 할당하며, 모양은 위치 및 시야각에 따라 달라집니다.

### ⚙️ 최적화: 
- NeRF: 신경망을 사용하여 색상 및 불투명도에 대한 연속 함수를 학습합니다.
- Gaussian Splatting: 신경망 없이 각 3D 타원체의 속성을 직접 최적화하여 개별 타원체 세트를 생성합니다.

본질적으로 NeRF는 연속적인 신경 접근 방식을 제공하는 반면, Gaussian Splatting은 더 간단하고 직접 최적화된 이산 구조를 제공합니다.

3D 그래픽과 AR 애플리케이션에 어떤 접근 방식이 더 흥미롭다고 생각하십니까? 댓글로 생각을 공유하세요! 💬

</details>
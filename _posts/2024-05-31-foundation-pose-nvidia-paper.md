---
title: Unified 6D Pose Estimation and Tracking of Novel Objects
description: Paper, FoundationPose, NVIDIA
categories: [Paper, FoundationPose]
tags: [AI, NVIDIA, FoundationPose]
# author: foDev_jeong
date: 2024-05-31 15:00:00 +0800
# pin: true
# mermaid: true
# render_with_liquid: false
# image:
#   path: /assets/img/blog/NLP_Overview.svg
#   lqip: data:image/webp;base64,UklGRpoAAABXRUJQVlA4WAoAAAAQAAAADwAABwAAQUxQSDIAAAARL0AmbZurmr57yyIiqE8oiG0bejIYEQTgqiDA9vqnsUSI6H+oAERp2HZ65qP/VIAWAFZQOCBCAAAA8AEAnQEqEAAIAAVAfCWkAALp8sF8rgRgAP7o9FDvMCkMde9PK7euH5M1m6VWoDXf2FkP3BqV0ZYbO6NA/VFIAAAA
#   alt: [Overview of NLP Course]
---

## FoundationPose is a complex solution

Last week at the imec ITF conference, I finished my presentation about AI and robotics with this movie from NVIDIA Robotics... Why? their demo ran real-time on an RTX3090. That's a 4 year old GPU. Today, you get the same AI performance (in TOPS) for ~300€.

Within ~1.5s, it gets a lock on the position and orientation of the object, and then tracks it at 30Hz.

FoundationPose is a complex solution, requires an RGBD camera, and some example images (with ground truth poses!) if no textured CAD file is available. BUT, it nails it, it outperforms any prior work.

With this performance (30Hz on a 'low-end' GPU) it's not going to take long to find efficiencies, smarter solutions, better synergies in the code. Once an architecture is proven to work, incremental improvements happen very fast.

Looking forward to run this on a Jetson soon!

> 🧙Paper Authors: Bowen Wen, Wei Yang, Jan Kautz, Stan Birchfield NVIDIA 
- 1️⃣Read the Full Paper here: <https://arxiv.org/abs/2312.08344>
- 2️⃣Project Page: <https://nvlabs.github.io/FoundationPose/>
- 3️⃣Code: <https://github.com/NVlabs/FoundationPose?tab=readme-ov-file>
{: .prompt-info }

![ FoundationPose Pipeline ](/assets/img/paper/FoundationPose_Pipeline.jpg){: .light .shadow .rounded-10 w='1212' h='668' }

<details markdown="1">
<summary style= "font-size:24px; line-height:24px; font-weight:bold; cursor:pointer;" > Translate to Korean </summary>

##  FoundationPose는 복잡한 솔루션

지난주 imec ITF 컨퍼런스에서 저는 NVIDIA Robotics 이 영화로 AI와 로봇 공학에 대한 프레젠테이션을 마쳤습니다. 왜? 데모는 RTX3090에서 실시간으로 실행되었습니다. 4년 된 GPU입니다. 오늘날에는 ~300€에 동일한 AI 성능(TOPS)을 얻을 수 있습니다.

~1.5초 이내에 물체의 위치와 방향을 잠근 다음 30Hz로 추적합니다.

FoundationPose는 복잡한 솔루션으로, RGBD 카메라가 필요하며, 텍스처 CAD 파일을 사용할 수 없는 경우 몇 가지 예제 이미지(실측 포즈 포함)가 필요합니다. 그러나 그것은 그것을 못 박고 이전의 어떤 작업보다 성능이 뛰어납니다.

이 성능('저가형' GPU에서 30Hz)을 사용하면 코드에서 효율성, 더 스마트한 솔루션, 더 나은 시너지 효과를 찾는 데 오랜 시간이 걸리지 않을 것입니다. 아키텍처가 작동하는 것으로 입증되면 점진적인 개선이 매우 빠르게 이루어집니다.

곧 Jetson에서 이것을 실행하기를 기대합니다!

</details>
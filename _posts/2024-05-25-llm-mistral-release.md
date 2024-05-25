---
title: Release Mistral-finetune Opensource
description: LLM, Course
categories: [Script, Mistral]
tags: [Mistral, LLM]
# author: foDev_jeong
date: 2024-05-25 07:23:00 +0800
# mermaid: true
# render_with_liquid: false
# image:
#   path: /assets/img/llm/LLM_evaluation_rank.jpeg
#   lqip: data:image/webp;base64,UklGRpoAAABXRUJQVlA4WAoAAAAQAAAADwAABwAAQUxQSDIAAAARL0AmbZurmr57yyIiqE8oiG0bejIYEQTgqiDA9vqnsUSI6H+oAERp2HZ65qP/VIAWAFZQOCBCAAAA8AEAnQEqEAAIAAVAfCWkAALp8sF8rgRgAP7o9FDvMCkMde9PK7euH5M1m6VWoDXf2FkP3BqV0ZYbO6NA/VFIAAAA
#   alt: [Rankings of model performance change drastically depending on which LLM is used as the judge on KILT-NQ]
---


## Announcing `Mistral-finetune`

The official repo and guide on how to fine-tune Mistral open-source models.
> Mistral open-source models : <https://github.com/mistralai/mistral-finetune>
{: .prompt-info }

mistral-finetune is a light-weight codebase that enables memory-efficient and performant finetuning of Mistral's models. It is based on LoRA, a training paradigm where most weights are frozen and only 1-2% additional weights in the form of low-rank matrix perturbations are trained.

For maximum efficiency it is recommended to use a A100 or H100 GPU. The codebase is optimized for multi-GPU-single-node training setups, but for smaller models, such as the 7B a single GPU suffices.

> The goal of this repository is to provide a simple, guided entrypoint to finetune Mistral models. As such, it is fairly opinionated (especially around data formatting) and does not aim at being exhaustive across multiple model architecture or hardware types. For more generic approaches, you can check out some other great projects like torchtune.
{: .prompt-tip }


<details markdown="1">
<summary style= "font-size:24px; line-height:24px; font-weight:bold; cursor:pointer;" > Translate to Korean </summary>

* * * 

## Mistral-finetune의 발표

Mistral 오픈 소스 모델을 미세 조정하는 방법에 대한 공식 저장소 및 가이드.
> Mistral open-source models : <https://github.com/mistralai/mistral-finetune>
{: .prompt-info }

mistral-finetune은 Mistral의 모델을 메모리 효율적이고 성능 좋게 미세 조정할 수 있게 해주는 경량 코드베이스입니다. 이 코드베이스는 대부분의 가중치는 고정하고 저랭크 행렬 변형의 형태로 추가 가중치의 1-2%만 훈련하는 LoRA라는 훈련 패러다임을 기반으로 합니다.

최대 효율성을 위해 A100 또는 H100 GPU를 사용하는 것이 권장됩니다. 이 코드베이스는 멀티 GPU-싱글 노드 훈련 설정에 최적화되어 있지만, 7B와 같은 더 작은 모델의 경우 단일 GPU로 충분합니다.

> 참고
이 저장소의 목표는 Mistral 모델을 미세 조정하기 위한 간단하고 가이드된 진입점을 제공하는 것입니다. 따라서 데이터 형식화와 관련하여 상당히 주관적이며 여러 모델 아키텍처나 하드웨어 유형에 대해 포괄적이기를 목표로 하지 않습니다. 보다 일반적인 접근 방식을 원한다면 torchtune과 같은 다른 훌륭한 프로젝트를 확인할 수 있습니다.
{: .prompt-tip }

</details>
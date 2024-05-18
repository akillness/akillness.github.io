---
title: GPT4보다 LoRA를 적용한 결과가 전반적으로 낫더라?
description: LoRA vs GPT4, Performance
categories: [Blogging, LoRA]
tags: [LoRA, GPT4]
# author: foDev_jeong
date: 2024-05-16 15:20:00 +0800
# mermaid: true
# render_with_liquid: false
# image:
#   path: /assets/img/llm/LLM_evaluation_rank.jpeg
#   lqip: data:image/webp;base64,UklGRpoAAABXRUJQVlA4WAoAAAAQAAAADwAABwAAQUxQSDIAAAARL0AmbZurmr57yyIiqE8oiG0bejIYEQTgqiDA9vqnsUSI6H+oAERp2HZ65qP/VIAWAFZQOCBCAAAA8AEAnQEqEAAIAAVAfCWkAALp8sF8rgRgAP7o9FDvMCkMde9PK7euH5M1m6VWoDXf2FkP3BqV0ZYbO6NA/VFIAAAA
#   alt: [Rankings of model performance change drastically depending on which LLM is used as the judge on KILT-NQ]
---


## GPT4보다 Gemma, llama2, mistral 등 10개의 주요 모델에 LoRA를 적용한 결과가 전반적으로 낫더라는 테크니컬리포트가 발표되었습니다. 

Predibase라는 회사에서 10개의 기본모델을 traditional NLP부터 code generation, reasoning까지 31개의 작업에 맞추어 LoRA를 적용시킨 총 310개의 모델을 제작 후 품질을 조사했는데요, GPT4와 성능을 비교했을 때 절반이상의 모델들이 (몇몇 태스크에 대해) 약간의 성능 우위를 보였고, 특히나 zhphyr7b, mistral7b는 전체 31개 태스크 중 10개의 우위를 보였다 합니다. 

Predibase에서는 단일 GPU, Nvidia A100에서 LoRA를 적용한 모델들을 더 쉽게 배포할 수 있게, 오픈소스 도구 LoRAX를 개발하고, LoRA Land라는 웹 어플리케이션까지 제작하여 위의 310개의 모델을 배포하고, 직접 자신들의 실험결과를 테스트 할 수 있게 환경도 제공했습니다!

**이 테크니컬 페이퍼는 회사 홍보라는 비판도 있었지만, 허깅페이스에서 100이 넘는 응원을 받았습니다.** 이정도 숫자는 좀처럼 보기 힘든 높은 수치입니다! 그리고 몇시간 후 gpt4o가 발표된 점까지, 내용이나 외적으로 흥미로웠던 레포트였습니다

> 테크니컬 리포트
- Paper : <https://arxiv.org/abs/2405.00732>
- Project page : <https://predibase.com/lora-land>
{: .prompt-info }



RLHF Workflow

From Reward Modeling to Online RLHF

We present the workflow of Online Iterative Reinforcement Learning from Human Feedback (RLHF) in this technical report, which is widely reported to outperform its offline counterpart by a large margin in the recent large language model (LLM) literature. However, existing open-source RLHF projects are still largely confined to the offline learning setting. In this technical report, we aim to fill in this gap and provide a detailed recipe that is easy to reproduce for online iterative RLHF. In particular, since online human feedback is usually infeasible for open-source communities with limited resources, we start by constructing preference models using a diverse set of open-source datasets and use the constructed proxy preference model to approximate human feedback. Then, we discuss the theoretical insights and algorithmic principles behind online iterative RLHF, followed by a detailed practical implementation. Our trained LLM, SFR-Iterative-DPO-LLaMA-3-8B-R, achieves impressive performance on LLM chatbot benchmarks, including AlpacaEval-2, Arena-Hard, and MT-Bench, as well as other academic benchmarks such as HumanEval and TruthfulQA. We have shown that supervised fine-tuning (SFT) and iterative RLHF can obtain state-of-the-art performance with fully open-source datasets. Further, we have made our models, curated datasets, and comprehensive step-by-step code guidebooks publicly available.


paper : <https://arxiv.org/abs/2405.07863>
blog : <https://huggingface.co/blog/rlhf>

RLHF 워크플로우

보상 모델링에서 온라인 RLHF까지

이 기술 보고서에서는 RLHF(Online Iterative Reinforcement Learning from Human Feedback)의 워크플로우를 제시하며, 이는 최근 대규모 언어 모델(LLM) 문헌에서 오프라인 모델보다 큰 차이로 우수한 것으로 널리 보고되었습니다. 그러나 기존 오픈 소스 RLHF 프로젝트는 여전히 오프라인 학습 환경에 국한되어 있습니다. 이 기술 보고서에서는 이러한 격차를 해소하고 온라인 반복 RLHF를 위해 쉽게 재현할 수 있는 자세한 레시피를 제공하는 것을 목표로 합니다. 특히, 온라인 인적 피드백은 일반적으로 제한된 리소스를 가진 오픈 소스 커뮤니티에서 실현 가능하지 않기 때문에 다양한 오픈 소스 데이터 세트를 사용하여 선호도 모델을 구성하고 구성된 프록시 선호도 모델을 사용하여 인간의 피드백을 근사화합니다. 그런 다음 온라인 반복 RLHF의 이론적 통찰력과 알고리즘 원리에 대해 논의한 후 자세한 실제 구현에 대해 논의합니다. 훈련된 LLM인 SFR-Iterative-DPO-LLaMA-3-8B-R은 AlpacaEval-2, Arena-Hard, MT-Bench를 포함한 LLM 챗봇 벤치마크와 HumanEval 및 TruthfulQA와 같은 기타 학술 벤치마크에서 인상적인 성능을 달성합니다. 우리는 지도 미세 조정(SFT) 및 반복 RLHF가 완전한 오픈 소스 데이터 세트를 통해 최첨단 성능을 얻을 수 있음을 보여주었습니다. 또한 모델, 선별된 데이터 세트 및 포괄적인 단계별 코드 가이드북을 공개적으로 사용할 수 있도록 했습니다.
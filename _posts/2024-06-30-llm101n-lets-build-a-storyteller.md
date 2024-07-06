---
title: ❏ LLM101n, LLM AI 스토리텔러 구축하기 🛠️
description: LLM, AI, Storyteller
categories: [LLM, Course]
tags: [Storyteller, Course]
# author: foDev_jeong
date: 2024-06-30 19:10:00 +0800
# pin: true
# math: true
# mermaid: true
# image:
#   path: /assets/img/cover/programming.jpeg
#   lqip: data:image/webp;base64,UklGRpoAAABXRUJQVlA4WAoAAAAQAAAADwAABwAAQUxQSDIAAAARL0AmbZurmr57yyIiqE8oiG0bejIYEQTgqiDA9vqnsUSI6H+oAERp2HZ65qP/VIAWAFZQOCBCAAAA8AEAnQEqEAAIAAVAfCWkAALp8sF8rgRgAP7o9FDvMCkMde9PK7euH5M1m6VWoDXf2FkP3BqV0ZYbO6NA/VFIAAAA
#   alt: [2024 programming curriculum by honglab]
---

며칠 전 Andrej Karpathy의 흥미로운 Course가 공개되었습니다.
( 아직 내용은 업데이트 중이지만, 목차내용을 참고해볼 수 있을 것 같습니다. )

이번에 공개된 “LLM101n: Let's build a Storyteller” 코스의 특징은 아래와 같습니다.

• 𝗟𝗟𝗠𝟭𝟬𝟭𝗻: 𝗢𝘃𝗲𝗿𝘃𝗶𝗲𝘄
 - 스토리텔러 AI 대규모 언어 모델(LLM)을 직접 구축
 - 직접 구축 AI로 작은 이야기를 만들고, 다듬고, 설명 가능
 - 최소한의 컴퓨터 과학 전제 조건으로 학습 시작
 - 기초부터 ChatGPT와 유사 기능을 갖춘 웹 앱까지 E2E 구축
 - 주요 개발 언어로는 Python, C 및 CUDA로 진행
 - Course를 통해 AI, LLM, 딥러닝 전반에 대해 깊게 이해 가능

특히 이 𝗟𝗟𝗠𝟭𝟬𝟭𝗻 코스는 모든걸 바닥부터 end-to-end로 다 개발해 본다는 특징이 있어, 실습 바탕의 사내 실무 교육 과정으로도 좋아 보입니다. 🤔

• 𝗟𝗟𝗠𝟭𝟬𝟭𝗻: 𝗦𝘆𝗹𝗹𝗮𝗯𝘂𝘀
 - Chapter 01 Bigram Language Model (language modeling)
 - Chapter 02 Micrograd (machine learning, backpropagation)
 - Chapter 03 N-gram model (multi-layer perceptron, matmul, gelu)
 - Chapter 04 Attention (attention, softmax, positional encoder)
 - Chapter 05 Transformer (transformer, residual, layernorm, GPT-2)
 - Chapter 06 Tokenization (minBPE, byte pair encoding)
 - Chapter 07 Optimization (initialization, optimization, AdamW)
 - Chapter 08 Need for Speed I: Device (device, CPU, GPU, ...)
 - Chapter 09 Need for Speed II: Precision (mixed precision training, fp16, bf16, fp8, ...)
 - Chapter 10 Need for Speed III: Distributed (distributed optimization, DDP, ZeRO)
 - Chapter 11 Datasets (datasets, data loading, synthetic data generation)
 - Chapter 12 Inference I: kv-cache (kv-cache)
 - Chapter 13 Inference II: Quantization (quantization)
 - Chapter 14 Finetuning I: SFT (supervised finetuning SFT, PEFT, LoRA, chat)
 - Chapter 15 Finetuning II: RL (reinforcement learning, RLHF, PPO, DPO)
 - Chapter 16 Deployment (API, web app)
 - Chapter 17 Multimodal (VQVAE, diffusion transformer)

• 𝗔𝗽𝗽𝗲𝗻𝗱𝗶𝘅: 아래 주제들이 위 Course에 추가될 예정이라 합니다.
 - Programming languages: Assembly, C, Python
 - Data types: Integer, Float, String (ASCII, Unicode, UTF-8)
 - Tensor: shapes, views, strides, contiguous, ...
 - Deep Learning frameowrks: PyTorch, JAX
 - Neural Net Architecture: GPT (1,2,3,4), Llama (RoPE, RMSNorm, GQA), MoE, ...
 - Multimodal: Images, Audio, Video, VQVAE, VQGAN, diffusion

참고로 Tesla에서 인공 지능 및 Autopilot Vision 부문을 담당했던 Karpathy는 2023년 Tesla를 떠난 이후 OpenAI에 합류, 다시 OpenAI를 떠나 근래에는 대중을 위한 여러 AI 자료들을 만들어 제공해 오고 있습니다.

진정한 "모두의 인공지능"을 실현하고 있는 Andrej Karpathy, 존경스럽네요.

(Source) Andrej Karpathy, Github 👍 
 - LM101n: Let's build a Storyteller : <https://github.com/karpathy/LLM101n>

![ LLM101N storyteller AI ](/assets/img/llm/llm101n_storyteller.jpeg){: .light .shadow .rounded-10 w='1212' h='668' }

---
title: Alibaba presents FunAudioLLM
description: LLM,Voice Understanding
categories:
- LLM & Language Models
tags:
- llm
- foundationmodel
- language-model
date: 2024-07-12 13:00:00 +0800
---
> - 👉 Github : <https://github.com/FunAudioLLM>
> - 👉 HuggingFace : <https://huggingface.co/papers/2407.04051>
{: .prompt-info}

## Voice Understanding and Generation Foundation Models for Natural Interaction Between Humans and LLMs  


![ FunAudioLLM ](/assets/img/llm/FunAudioLLM.jpeg){: .light .shadow .rounded-10 w='1212' h='668' }

This report introduces FunAudioLLM, a model family designed to enhance natural voice interactions between humans and large language models (LLMs).

At its core are two innovative models: SenseVoice, which handles multilingual speech recognition, emotion recognition, and audio event detection; and CosyVoice, which facilitates natural speech generation with control over multiple languages, timbre, speaking style, and speaker identity. 

SenseVoice-Small delivers exceptionally low-latency ASR for 5 languages, and SenseVoice-Large supports high-precision ASR for over 50 languages, while CosyVoice excels in multi-lingual voice generation, zero-shot in-context learning, cross-lingual voice cloning, and instruction-following capabilities. 

The models related to SenseVoice and CosyVoice have been open-sourced on Modelscope and Huggingface, along with the corresponding training, inference, and fine-tuning codes released on GitHub. 

By integrating these models with LLMs, FunAudioLLM enables applications such as speech-to-speech translation, emotional voice chat, interactive podcasts, and expressive audiobook narration, thereby pushing the boundaries of voice interaction technology.

<details markdown="1">
<summary style= "font-size:24px; line-height:24px; font-weight:bold; cursor:pointer;" > Translate to Korean </summary>

* * * 

## 인간과 LLM 간의 자연스러운 상호작용을 위한 Voice Understanding and Generation Foundation 모델 

이 보고서에서는 인간과 대규모 언어 모델(LLM) 간의 자연스러운 음성 상호 작용을 향상시키도록 설계된 모델 제품군인 FunAudioLLM을 소개합니다. 

그 중심에는 두 가지 혁신적인 모델이 있습니다: 다국어 음성 인식, 감정 인식 및 오디오 이벤트 감지를 처리하는 SenseVoice; CosyVoice는 여러 언어, 음색, 말하기 스타일 및 화자 정체성을 제어하여 자연스러운 음성 생성을 용이하게 합니다. 

SenseVoice-Small은 5개 언어에 대해 매우 짧은 대기 시간 ASR을 제공하고, SenseVoice-Large는 50개 이상의 언어에 대해 고정밀 ASR을 지원하며, CosyVoice는 다국어 음성 생성, 제로샷 컨텍스트 내 학습, 다국어 음성 복제 및 명령 추종 기능에 탁월합니다. SenseVoice 및 CosyVoice와 관련된 모델은 GitHub에 릴리스된 해당 학습, 추론 및 미세 조정 코드와 함께 Modelscope 및 Huggingface에서 오픈 소스로 제공되었습니다. 

FunAudioLLM은 이러한 모델을 LLM과 통합하여 음성 변환 번역, 감성 음성 채팅, 대화형 팟캐스트 및 표현력 있는 오디오북 내레이션과 같은 애플리케이션을 가능하게 하여 음성 상호 작용 기술의 경계를 넓힙니다.

</details>
---
title: "Alibaba presents FunAudioLLM"
description: "This report introduces FunAudioLLM, a model family designed to enhance natural voice interactions between humans and large language models (LLMs)."
categories: [LLM/Model & Papers]
tags: [LLM, Model, Paper]
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

## Voice Understanding and Generation Foundation Model for Natural Human-LLM Interaction 

This report introduces FunAudioLLM, a family of models designed to enhance natural voice interaction between humans and large language models (LLMs). 

At its core are two innovative models: SenseVoice, handling multilingual speech recognition, emotion recognition, and audio event detection; and CosyVoice, supporting multiple languages, timbres, and speaking styles while controlling speaker identity to facilitate natural speech generation. 

SenseVoice-Small delivers ultra-low-latency ASR for 5 languages, SenseVoice-Large supports high-accuracy ASR for 50+ languages, and CosyVoice excels at multilingual speech generation, zero-shot in-context learning, cross-lingual voice cloning, and instruction-following. Models related to SenseVoice and CosyVoice have been open-sourced on Modelscope and Huggingface along with their respective training, inference, and fine-tuning code released on GitHub. 

FunAudioLLM integrates these models with LLMs to enable applications such as speech translation, emotional voice chat, interactive podcasts, and expressive audiobook narration, advancing the boundaries of natural voice interaction technology.

</details>

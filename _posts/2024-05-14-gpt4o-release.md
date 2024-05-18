---
title: GPT4o Release !!
description: GPT4o, Release, News
categories: [Script, GPT4o]
tags: [GPT4o, LLM]
# author: foDev_jeong
date: 2024-05-14 10:00:00 +0800
# mermaid: true
# render_with_liquid: false
# image:
#   path: /assets/img/llm/LLM_evaluation_rank.jpeg
#   lqip: data:image/webp;base64,UklGRpoAAABXRUJQVlA4WAoAAAAQAAAADwAABwAAQUxQSDIAAAARL0AmbZurmr57yyIiqE8oiG0bejIYEQTgqiDA9vqnsUSI6H+oAERp2HZ65qP/VIAWAFZQOCBCAAAA8AEAnQEqEAAIAAVAfCWkAALp8sF8rgRgAP7o9FDvMCkMde9PK7euH5M1m6VWoDXf2FkP3BqV0ZYbO6NA/VFIAAAA
#   alt: [Rankings of model performance change drastically depending on which LLM is used as the judge on KILT-NQ]
---

## 🤯 OpenAI's new multimodal LLM can understand and generate across text, audio, and vision in real-time.

### 💬🗣️👀 Here is what we know so far:

#### Details

- OpenAI announced a new GPT-4o model, which performs better than GPT-4, but most importantly, it's going to be free for all users! 🚀
⠀
- Updated interface and PC application with voice control and screen-sharing capabilities have been introduced 🎤
⠀
- Natively multimodal: for now, text, images, and voice generation are done by ONE model 🗣️
⠀
- Developers are not forgotten either, because there will be API support: 2x faster, 50% cheaper, and 5x higher rate limits API vs. GPT4 💰
⠀
- Voice mode has been greatly improved: now you can interrupt the model generation at any time, instead of waiting until the end. OpenAI also managed to bring speech generation to the real-time level, and most importantly, to make ChatGPT voice really alive! 🎶
⠀
- There is also an interactive mode, where you can simultaneously share the image from your camera and communicate with ChatGPT about it! 💬


> Summary
- 📥 Input: Text, Text + Image, Text + Audio, Text + Video, Audio (based on the examples)
- 📤Output: Image, Image + Text, Text, Audio (based on the examples)
- 🌐 88.7% on MMLU; 90.2% on HumanEval
- 🎧 < 5% WER for Western European languages in transcription
- 🖼️ 69.1% on MMU; 92.8% on DocVQA
- ⚡ Up to 50% cheaper (probably due to tokenization improvements) and 2x faster than GPT-4 Turbo
- 🎤 Near real-time audio with 320ms on average, similar to human conversation
- 🔡 New tokenizer with a 200k token vocabulary (previously 100k vocabulary) leading to 1.1x - 4.4x fewer tokens needed across 20 languages
{: .prompt-info }

Blog: <https://openai.com/index/hello-gpt-4o/>

The multimodal achievement and latency are impressive. 🔥 But I'm not worried about open-source AI. Open Source is stronger than ever and equally good for enterprises and companies use cases where you don't need a 200ms latency with voice input. ✅


![ GPT4o Released ](/assets/img/llm/GPT4o.jpeg){: .light .w-75 .shadow .rounded-10 w='1212' h='668' }

* * * 


## 🤯 OpenAI 의 새로운 멀티모달 LLM은 텍스트, 오디오, 비전을 실시간으로 이해하고 생성할 수 있습니다. 

### 💬🗣️👀 지금까지 우리가 알고 있는 것은 다음과 같습니다.


#### 자세히 
- OpenAI는 GPT-4보다 성능이 뛰어난 새로운 GPT-4o 모델을 발표했지만 가장 중요한 것은 모든 사용자에게 무료로 제공된다는 것입니다! 🚀
⠀
- 음성 제어 및 화면 공유 기능이 있는 업데이트된 인터페이스 및 PC 응용 프로그램이 도입🎤되었습니다
⠀
- 기본적으로 멀티모달: 현재 텍스트, 이미지 및 음성 생성은 하나의 모델🗣️로 수행됩니다.
⠀
- GPT4💰에 비해 2배 더 빠르고, 50% 더 저렴하고, 5배 더 높은 속도 제한 API를 지원하기 때문에 개발자도 잊지 않습니다
⠀
- 음성 모드가 크게 개선되어 이제 모델 생성이 끝날 때까지 기다리지 않고 언제든지 모델 생성을 중단할 수 있습니다. OpenAI는 또한 음성 생성을 실시간 수준으로 끌어올렸으며 가장 중요한 것은 ChatGPT 음성을 실제로 생생하게 만드는 것입니다! 🎶
⠀
- 카메라의 이미지를 동시에 공유하고 ChatGPT와 소통할 수 있는 대화형 모드도 있습니다! 💬
⠀

> 요약
- 📥 입력: 텍스트, 텍스트 + 이미지, 텍스트 + 오디오, 텍스트 + 비디오, 오디오(예제 기반)
- 📤출력: 이미지, 이미지 + 텍스트, 텍스트, 오디오(예제 기반)
- 🌐 MMLU에서 88.7%; HumanEval에서 90.2%
- 🎧< 5% WER for Western European languages in transcription
- 🖼️ 69.1% on MMU; 92.8% on DocVQA
- ⚡ Up to 50% cheaper (probably due to tokenization improvements) and 2x faster than GPT-4 Turbo
- 🎤 Near real-time audio with 320ms on average, similar to human conversation
- 🔡 New tokenizer with a 200k token vocabulary (previously 100k vocabulary) leading to 1.1x - 4.4x fewer tokens needed across 20 languages
{: .prompt-info }

Blog: <https://openai.com/index/hello-gpt-4o/>

The multimodal achievement and latency are impressive. 🔥 But I'm not worried about open-source AI. Open Source is stronger than ever and equally good for enterprises and companies use cases where you don't need a 200ms latency with voice input. ✅
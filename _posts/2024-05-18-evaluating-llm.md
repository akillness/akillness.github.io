---
title: How to evaluate LLM Model?
description: LLM, Evaluation, Framework
categories:
  - LLM/Model   - LLM/모델·논문 Papers
tags:
  - LLM
  - Model
  - Paper
date: 2024-05-18 10:20:00 +0800
mermaid: true
---
## LLM evaluation frameworks & tools every AI/ML engineer should know.

*Curiosity:* What insights can we retrieve from this? How does this connect to innovation in the field?

![ LLM evaluation frameworks ](/assets/img/news/Evaluate_llm_guid.png){: .light .w-75 .shadow .rounded-10 w='1212' h='668' }

LLM evaluation frameworks and tools are important because they provide standardized benchmarks to measure and improve the performance, reliability and fairness of language models. 

Also, it is very important to have metrics in place to evaluate LLMs. These metrics act as scoring mechanisms that assess an LLM’s outputs based on the given criteria. 

Here is my article on evaluating large language models. 👉<https://levelup.gitconnected.com/evaluating-large-language-models-a-developers-guide-ffd21a055feb>


## MMLU-Pro released by TIGER-Lab on Hugging Face, continues these vital efforts by offering a more robust and challenging massive multi-task language understanding dataset! 🎉 😍

*Curiosity:* Evaluating LLMs is both crucial and challenging, especially with existing benchmarks like MMLU reaching saturation. 



> TL;DR: 📊
- 📚 12K complex questions across various disciplines with careful human verification
- 🔢 Augmented to 10 options per question (instead of 4) to reduce random guessing
- 📊 56% of questions from MMLU, 34% from STEM websites, and the rest from TheoremQA, and SciBench
- 🔍 Performance drops without chain-of-thought reasoning, indicating a more challenging benchmark!
{: .prompt-tip }


> Results compared to MMLU
- 📉 GPT-4o drops by 17% (from 0.887 to 0.7149)
- 📉 Mixtral 8x7B drops by 31% (from 0.714 to 0.404)
- 📉 Llama-3-70B drops by 27% (from 0.820 to 0.5541)
{: .prompt-tip }



1. Dataset: <https://huggingface.co/datasets/TIGER-Lab/MMLU-Pro>
2. Leaderboard: <https://huggingface.co/datasets/TIGER-Lab/MMLU-Pro#4-leaderboard>


<details markdown="1">
<summary style= "font-size:24px; line-height:24px; font-weight:bold; cursor:pointer;" > Translate to Korean </summary>

* * * 


## 모든 AI/ML 엔지니어가 알아야 할 해시태그#LLM 평가 프레임워크 및 도구.

![ LLM evaluation frameworks ](/assets/img/news/Evaluate_llm_guid.png){: .light .w-75 .shadow .rounded-10 w='1212' h='668' }

LLM 평가 프레임워크와 툴은 언어 모델의 성능, 신뢰성 및 공정성을 측정하고 개선하기 위한 표준화된 벤치마크를 제공하기 때문에 중요합니다. 

또한 LLM을 평가하기 위한 메트릭을 마련하는 것이 매우 중요합니다. 이러한 메트릭은 주어진 기준에 따라 LLM의 출력을 평가하는 스코어링 메커니즘 역할을 합니다. 

다음은 대규모 언어 모델 평가에 대한 기사입니다. 👉<https://levelup.gitconnected.com/evaluating-large-language-models-a-developers-guide-ffd21a055feb>


## Hugging Face TIGER-Lab에서 출시한 MMLU-Pro는 보다 강력하고 도전적인 대규모 다중 작업 언어 이해 데이터 세트를 제공하여 이러한 중요한 노력을 계속합니다! 🎉 😍

LLM을 평가하는 것은 중요하면서도 어려운 일이며, 특히 MMLU와 같은 기존 벤치마크가 포화 상태에 도달한 상황에서는 더욱 그렇습니다.

> TL;DR: 📊
- 📚 신중한 인적 검증을 통해 다양한 분야에 걸친 12K개의 복잡한 질문
- 🔢 무작위 추측을 줄이기 위해 질문당 4개가 아닌 10개의 옵션으로 늘어났습니다.
- 📊 질문의 56%는 MMLU, 34%는 STEM 웹사이트, 나머지는 TheoremQA 및 SciBench에서 나왔습니다.
- 🔍 생각의 연쇄 추론 없이 성능이 떨어지며, 이는 더 어려운 벤치마크를 나타냅니다!
{: .prompt-tip }

> MMLU와 비교한 결과
- 📉 GPT-4o는 17% 하락(0.887에서 0.7149로)
- 📉 Mixtral 8x7B 31% 감소(0.714에서 0.404로)
- 📉 라마-3-70B 27% 하락(0.820에서 0.5541로)
{: .prompt-tip }


1. 데이터 세트: <https://huggingface.co/datasets/TIGER-Lab/MMLU-Pro>
2. 리더보드: <https://huggingface.co/datasets/TIGER-Lab/MMLU-Pro#4-leaderboard>

</details>

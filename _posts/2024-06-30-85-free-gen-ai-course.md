---
title: Now updated with over 85 free Gen AI courses and now we have a dedicated section for Agents!!
description: GenAI, Course
categories: [LLM, Course]
tags: [GenAI, Course]
# author: foDev_jeong
date: 2024-06-30 19:10:00 +0800
pin: true
# math: true
# mermaid: true
# image:
#   path: /assets/img/cover/programming.jpeg
#   lqip: data:image/webp;base64,UklGRpoAAABXRUJQVlA4WAoAAAAQAAAADwAABwAAQUxQSDIAAAARL0AmbZurmr57yyIiqE8oiG0bejIYEQTgqiDA9vqnsUSI6H+oAERp2HZ65qP/VIAWAFZQOCBCAAAA8AEAnQEqEAAIAAVAfCWkAALp8sF8rgRgAP7o9FDvMCkMde9PK7euH5M1m6VWoDXf2FkP3BqV0ZYbO6NA/VFIAAAA
#   alt: [2024 programming curriculum by honglab]
---


{% include embed/youtube.html id='J9VWyxOSJzA?list=PLZoalK-hTD4VBBF03HAifKd6-DF68sYlC&t=6' %}

> Video Channel : <https://www.youtube.com/@aishwaryanr4606>

> 3 Days Course for RAG : <https://akillness.github.io/posts/rag-application-in-just-3-days/>
{: .prompt-info}

Due to character limits, I've included only about 30 courses in this post. You can find all courses and their URLs on GitHub repository: <https://github.com/aishwaryanr/awesome-generative-ai-guide?tab=readme-ov-file#book-list-of-free-genai-courses>


### 😎 This prompting report is your ultimate guide to prompt engineering! 

IMO it's one of the most thorough reports that summarizes all the research so far!

Kudos to Sander Schulhoff from Learn Prompting and other co-authors from OpenAI & Microsoft!

👉 It starts of with clearly explaining the concept and then providing structured understanding by creating a taxonomy of prompting techniques, analyzing their use, and presenting a comprehensive vocabulary of 33 terms. 

👉 It also explores 58 text-only prompting techniques and 40 techniques for other modalities, providing a meta-analysis of the entire literature on natural language prefix-prompting.

I'm also going through it and jotting down notes. It's a fantastic report; definitely a must-read if you want to become proficient in prompt engineering.

Here's the link: <https://arxiv.org/pdf/2406.06608>

### 😨 Finding the perfect RAG setup for your use-case can be a huge pain! Think chunk size, embedding model, retrieval method and many other parameters. 

To add to the issue, it's highly likely that your configuration will require numerous adjustments once it goes live and users begin interacting with it.

This new paper introduces an AutoRAG framework aimed at tackling these challenges. It formulates hyperparameter tuning as search problem and defines a bandit based framework to efficiently explore large search spaces.

❗ Just a heads-up: Honestly, I think It's quite an innovative idea, but implementing it could be expensive and time-consuming! Still, it's good to know about these new things :)

Here are some more details:

- 👉 The AutoRAG framework aligns with principles from AutoML, aiming to automate and improve the efficiency of RAG hyperparameter tuning.

- 👉 Unlike prior works that often manually tune RAG hyperparameters or focus on specific tunable parameters within language model API calls, this framework emphasizes methods applicable in an online setting. It addresses the challenge of dynamically adjusting hyperparameters based on real-time feedback and varying conditions.

- 👉 The paper formulates the hyperparameter selection process in RAG as an online multi-armed bandit problem. This approach allows the system to balance exploration of new hyperparameter configurations with exploitation of known effective settings, adapting to changing conditions over time.

- 👉 To efficiently explore large hyperparameter search spaces in RAG, the study introduces a novel Hierarchical MAB (Hier-MAB) method. This method involves a high-level MAB guiding optimization across modules and several low-level MABs fine-tuning specific hyperparameters within each module. This hierarchical approach enhances the system's ability to find optimal configurations in complex environments.

Link to the paper: <https://arxiv.org/pdf/2406.19251>

![ AutoRAG-HP ](/assets/img/llm/AutoRAG-framework.jpeg){: .light .shadow .rounded-10 w='1212' h='668' }


> AutoRAG 리뷰(야구로 이해해보자) : <https://velog.io/@autorag/AutoRAG-%ED%8C%80%EC%9D%98-AutoRAG-HP-%EB%85%BC%EB%AC%B8-%EB%A6%AC%EB%B7%B0-%EC%95%BC%EA%B5%AC%EB%A1%9C-%EC%9D%B4%ED%95%B4%ED%95%B4%EB%B3%B4%EC%9E%90>
{: .prompt-info}

### ⛳ LLM Basics and Foundations
- Large Language Models by ETH Zurich
- Understanding Large Language Models by Princeton
- Transformers course by Huggingface
- NLP course by Huggingface
- CS324 - Large Language Models by Stanford
- Generative AI with Large Language Models by Coursera
- Introduction to Generative AI by Coursera
- Generative AI Fundamentals by Google Cloud
- Introduction to Large Language Models by Google Cloud
- Introduction to Generative AI by Google Cloud
- Generative AI Concepts by DataCamp (Daniel Tedesco Data Lead @ Google)

### ⛳ Building LLM Applications
- LLMOps: Building Real-World Applications With Large Language Models by Udacity
- Full Stack LLM Bootcamp by FSDL
- Generative AI for beginners by Microsoft
- Large Language Models: Application through Production by Databricks
- Generative AI Foundations by AWS
- Introduction to Generative AI Community Course by ineuron
- LLM University by Cohere
- LLM Learning Lab by Lightning AI
- Functions, Tools and Agents with LangChain by DeeplearningAI
- LangChain for LLM Application Development by DeeplearningAI
- LLMOps by DeepLearning.AI
- Automated Testing for LLMOps by DeepLearningAI

### ⛳Prompt Engineering, RAG and Fine-Tuning
- LangChain & Vector Databases in Production by Activeloop
- Reinforcement Learning from Human Feedback by DeepLearningAI
- Building Applications with Vector Databases by DeepLearningAI
- How Diffusion Models Work by DeepLearningAI
- Finetuning Large Language Models by DeeplearningAI
- LangChain: Chat with Your Data by DeeplearningAI
- Building Systems with the ChatGPT API by DeeplearningAI
- Building Applications with Vector Databases by DeeplearningAI
- ChatGPT Prompt Engineering for Developers by DeeplearningAI

### ⛳ Evaluation
- Building and Evaluating Advanced RAG Applications by DeepLearningAI
- Evaluating and Debugging Generative AI Models Using Weights and Biases by DeeplearningAI

### ⛳Multimodal
How Diffusion Models Work by DeepLearning.AI

![ List of Free GenAI Courses ](/assets/img/llm/Free_GenAI_Courses.jpeg){: .light .shadow .rounded-10 w='1212' h='668' }

<details markdown="1">
<summary style= "font-size:24px; line-height:24px; font-weight:bold; cursor:pointer;" > Translate to Korean </summary>

* * * 

글자 수 제한으로 인해 이 게시물에는 약 30개의 과정만 포함했습니다. GitHub 저장소에서 모든 과정과 해당 URL을 찾을 수 있습니다.

### ⛳ LLM 기초와 기초
- ETH Zurich의 대규모 언어 모델
- Princeton의 대규모 언어 모델 이해
- Huggingface의 트랜스포머 코스
- Huggingface의 NLP 과정
- CS324 - 스탠포드의 대규모 언어 모델
- Coursera의 대규모 언어 모델을 사용한 생성형 AI
- Coursera의 생성형 AI 소개
- Google Cloud의 생성형 AI 기초
- Google Cloud의 대규모 언어 모델 소개
- Google Cloud의 생성형 AI 소개
- DataCamp의 생성형 AI 개념(Daniel Tedesco 데이터 책임자 @ Google)

### ⛳ LLM 애플리케이션 구축하기
- LLMOps: Udacity의 대규모 언어 모델을 사용하여 실제 애플리케이션 구축
- FSDL의 풀스택 LLM 부트캠프
- Microsoft의 초보자를 위한 생성형 AI
- 대규모 언어 모델: Databricks의 프로덕션을 통한 애플리케이션
- AWS의 생성형 AI 기반
- ineuron의 생성형 AI 커뮤니티 강좌 소개
- LLM University by Cohere (코히어)
- Lightning AI의 LLM Learning Lab
- DeeplearningAI의 LangChain을 사용한 기능, 도구 및 에이전트
- DeeplearningAI를 이용한 LLM 애플리케이션 개발을 위한 LangChain
- LLMOps by DeepLearning.AI
- DeepLearningAI를 통한 LLMOps 자동화 테스트

### ⛳프롬프트 엔지니어링, RAG 및 미세 조정
- Activeloop의 생산에 사용되는 LangChain 및 벡터 데이터베이스
- DeepLearningAI의 인간 피드백을 통한 강화 학습
- DeepLearningAI의 벡터 데이터베이스로 애플리케이션 구축
- DeepLearningAI의 확산 모델 작동 방식
- DeeplearningAI를 통한 대규모 언어 모델 미세 조정
- LangChain: DeeplearningAI의 데이터와 채팅하기
- DeeplearningAI의 ChatGPT API로 시스템 구축
- DeeplearningAI의 벡터 데이터베이스를 이용한 애플리케이션 구축
- DeeplearningAI의 개발자를 위한 ChatGPT 프롬프트 엔지니어링

### ⛳ 평가
- DeepLearningAI를 이용한 고급 RAG 애플리케이션 구축 및 평가
- DeeplearningAI의 가중치와 편향을 사용하여 생성형 AI 모델 평가 및 디버깅

### ⛳복합
DeepLearning.AI 별 확산 모델의 작동 방식

</details>
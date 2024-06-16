---
title: Tools for Building LLM Applications
description: Cookbook, Tools, Application
categories: [LLM, Cookbook]
tags: [Tools, Cookbook]
# author: foDev_jeong
date: 2024-06-12 15:10:00 +0800
# pin: true
# math: true
# mermaid: true
# image:
#   path: /assets/img/cover/programming.jpeg
#   lqip: data:image/webp;base64,UklGRpoAAABXRUJQVlA4WAoAAAAQAAAADwAABwAAQUxQSDIAAAARL0AmbZurmr57yyIiqE8oiG0bejIYEQTgqiDA9vqnsUSI6H+oAERp2HZ65qP/VIAWAFZQOCBCAAAA8AEAnQEqEAAIAAVAfCWkAALp8sF8rgRgAP7o9FDvMCkMde9PK7euH5M1m6VWoDXf2FkP3BqV0ZYbO6NA/VFIAAAA
#   alt: [2024 programming curriculum by honglab]
---

## 🥁 Check out my comprehensive guide on the most popular tools and frameworks for building LLM applications.

- 👉 The landscape for building LLM applications is rich with a variety of tools and technologies, each serving different needs and stages of the process. 

- 👉Finding and picking the right tools and frameworks for your LLM app is key and takes time. Even if you're just starting out, knowing what's out there and how it all works together is super important!

⛳ To simplify your decision process, I've compiled a detailed guide to help you navigate the large pool of options available for LLM application development.

> Link to the guide: <https://github.com/aishwaryanr/awesome-generative-ai-guide/blob/main/free_courses/Applied_LLMs_Mastery_2024/week5_tools_for_LLM_apps.md>
{: .prompt-danger }

### 🔰 LLM tools can be broadly classified into four main categories:

- ⛳ Input Processing Tools: These tools are designed to handle data ingestion and prepare various inputs for your application. They include data pipelines and vector databases that are crucial for processing and preparing data for the LLM.

- ⛳ LLM Development Tools: This category encompasses tools that aid in
interacting with Large Language Models. This includes services for calling LLMs, fine-tuning them, conducting experiments, and managing orchestration. Examples include LLM providers, orchestration platforms, and computing and experimentation platforms.

- ⛳ Output Tools: Post-processing tools that manage and refine the output from the LLM application fall into this category. They focus on processes after the LLM has generated its output, such as evaluation frameworks that assess the quality and relevance of the output.

- ⛳ Application Tools: These are tools that manage all aspects of the LLM application, including hosting, monitoring etc.

- 🎯 This guide will provide deeper insights into these types of tools, their various options, along with their advantages and disadvantages, giving you a comprehensive view of what's available for application building and how to best utilize these resources.

🛑 Please note that this guide is not comprehensive by any means, it is only supposed to give you an overview of the popular tools! 

In addition to categorizing these tools, I've differentiated between tools necessary for RAG versus those needed for fine-tuning LLMs.

![ Tools for building LLM Application ](/assets/img/llm/LLM_tools_for_building.jpeg){: .light .shadow .rounded-10 w='1212' h='668' }

<details markdown="1">
<summary style= "font-size:24px; line-height:24px; font-weight:bold; cursor:pointer;" > Translate to Korean </summary>

* * * 

## 🥁 LLM 어플리케이션 구축을 위한 가장 인기 있는 툴과 프레임워크에 대한 포괄적인 가이드를 확인해 보세요.

- 👉 LLM 어플리케이션 구축을 위한 환경은 다양한 툴과 기술로 풍부하며, 각 툴과 기술은 서로 다른 요구와 프로세스 단계를 충족시킵니다. 

- 👉LLM 앱에 적합한 툴과 프레임워크를 찾고 선택하는 것이 핵심이며 시간이 걸립니다. 이제 막 시작하더라도 무엇이 있고 모든 것이 어떻게 함께 작동하는지 아는 것이 매우 중요합니다!

⛳ 의사 결정 과정을 단순화하기 위해, LLM 애플리케이션 개발에 사용할 수 있는 방대한 옵션 풀을 탐색하는 데 도움이 되는 자세한 가이드를 작성했습니다.

### 🔰 LLM 툴은 크게 네 가지 범주로 분류할 수 있습니다.

- ⛳ 입력 처리 도구: 이러한 도구는 데이터 수집을 처리하고 애플리케이션에 대한 다양한 입력을 준비하도록 설계되었습니다. 여기에는 LLM을 위한 데이터를 처리하고 준비하는 데 중요한 데이터 파이프라인과 벡터 데이터베이스가 포함됩니다.

- ⛳ LLM 개발 툴(LLM Development Tools): 이 카테고리에는 다음을 지원하는 툴이 포함됩니다.
대규모 언어 모델과 상호 작용합니다. 여기에는 LLM 호출, 미세 조정, 실험 수행, 오케스트레이션 관리를 위한 서비스가 포함됩니다. 예를 들어 LLM 공급자, 오케스트레이션 플랫폼, 컴퓨팅 및 실험 플랫폼이 있습니다.

- ⛳ 출력 툴(Output Tools): LLM 어플리케이션의 출력을 관리하고 다듬는 포스트 프로세싱 툴이 이 범주에 속합니다. LLM이 결과물을 생성한 후의 프로세스(예: 결과물의 품질과 관련성을 평가하는 평가 프레임워크)에 초점을 맞춥니다.

- ⛳ Application Tools: LLM 어플리케이션의 모든 측면을 관리하는 툴로, 호스팅, 모니터링 등을 포함합니다.

- 🎯 이 가이드에서는 이러한 유형의 도구, 다양한 옵션, 장점 및 단점에 대한 심층적인 통찰력을 제공하여 애플리케이션 빌드에 사용할 수 있는 항목과 이러한 리소스를 가장 잘 활용하는 방법에 대한 포괄적인 보기를 제공합니다.

🛑 이 가이드는 결코 포괄적이지 않으며 인기 있는 도구에 대한 개요만 제공하기 위한 것입니다! 

이러한 툴을 분류하는 것 외에도 RAG에 필요한 툴과 LLM을 미세 조정하는 데 필요한 툴을 구분했습니다.

</details>
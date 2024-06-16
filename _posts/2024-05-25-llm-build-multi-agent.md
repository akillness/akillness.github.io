---
title: Let's build multi-agent system
description: Agent, LLM
categories: [LLM, Agents]
tags: [Agent, LLM]
# author: foDev_jeong
date: 2024-05-25 23:23:00 +0800
# mermaid: true
# render_with_liquid: false
# image:
#   path: /assets/img/llm/LLM_evaluation_rank.jpeg
#   lqip: data:image/webp;base64,UklGRpoAAABXRUJQVlA4WAoAAAAQAAAADwAABwAAQUxQSDIAAAARL0AmbZurmr57yyIiqE8oiG0bejIYEQTgqiDA9vqnsUSI6H+oAERp2HZ65qP/VIAWAFZQOCBCAAAA8AEAnQEqEAAIAAVAfCWkAALp8sF8rgRgAP7o9FDvMCkMde9PK7euH5M1m6VWoDXf2FkP3BqV0ZYbO6NA/VFIAAAA
#   alt: [Rankings of model performance change drastically depending on which LLM is used as the judge on KILT-NQ]
---

## 🎉 Yet another multi-agent framework has arrived!

AgentGym offers a wide range of environments and tasks for broad, real-time, uniform, and concurrent agent exploration! 

Following popular releases like CrewAI and Autogen, here's another new multi-agent framework. Here are some insights:

- ⛳ AgentGym provides diverse environments, tasks, and goals for LLM-based agents with convenient APIs, standardized task specifications, environment settings, and observation/action spaces. This platform supports online evaluation, trajectory sampling, and interactive training.
- ⛳ It offers a database with expanded instructions from various environments and tasks, forming a challenging test set for benchmarking, called AgentEval.
- ⛳ It includes a uniformly formatted trajectory set, AgentTraj, for training base agents, and AgentTraj-L, an extended version for maximum performance through behavioral cloning.
- ⛳The authors also introduce AgentEvol, a method to explore agent self-evolution beyond previously seen data across tasks and environments. AgentEvol allows agents to evolve by adaptively accessing and utilizing context based on specific tasks, achieving results comparable to state-of-the-art models while consuming fewer resources.

The AgentGym suite, including the platform, dataset, benchmark, checkpoints, and algorithm implementations is available for the community to build and evaluate generally-capable LLM-based agents. 

- github : <https://github.com/WooooDyy/AgentGym>

![ AgentGym framework ](/assets/img/llm/LLM_Agentgym.jpeg){: .light .shadow .rounded-10 w='1212' h='668' }

## Let's build a crew of AI Agents

> A multi agent system that scrapes the web & automatically writes a blog post for you!

Here's what I've used:

- [crewAI](https://www.linkedin.com/company/crewai-inc/) for building a multi-agent system
- [Ollama](https://www.linkedin.com/company/ollama/) to serve LLM locally (Llama-3)
- [Lightning AI](https://www.linkedin.com/company/pytorch-lightning/) for development & hosting

I published this work as a Lightning AI⚡️Studio, it's reads like a blog encapsulating all my code & environment!

Take it for a spin now: <https://lightning.ai/lightning-ai/studios/let-s-build-a-crew-of-ai-agents?utm_source=akshay>


<details markdown="1">
<summary style= "font-size:24px; line-height:24px; font-weight:bold; cursor:pointer;" > Translate to Korean </summary>

* * * 

## 🎉 또 다른 다중 에이전트 프레임워크가 도착했습니다! 

AgentGym은 광범위하고 실시간이며 균일하고 동시 에이전트 탐색을 위한 광범위한 환경과 작업을 제공합니다! 

CrewAI 및 Autogen과 같은 인기 있는 릴리스에 이어 또 다른 새로운 다중 에이전트 프레임워크가 있습니다. 다음은 몇 가지 인사이트입니다.

- ⛳ AgentGym은 LLM 기반 에이전트를 위한 다양한 환경, 작업, 목표를 편리한 API, 표준화된 작업 사양, 환경 설정, 관찰/행동 공간 등으로 제공합니다. 이 플랫폼은 온라인 평가, 궤적 샘플링 및 대화형 교육을 지원합니다.
- ⛳ 다양한 환경 및 작업의 확장된 지침이 포함된 데이터베이스를 제공하여 AgentEval이라는 벤치마킹을 위한 도전적인 테스트 세트를 형성합니다.
- ⛳ 여기에는 기본 에이전트 훈련을 위한 균일한 형식의 궤적 세트인 AgentTraj와 동작 복제를 통한 최대 성능을 위한 확장 버전인 AgentTraj-L이 포함됩니다.
- ⛳저자는 또한 작업 및 환경 전반에 걸쳐 이전에 본 데이터를 넘어 에이전트 자체 진화를 탐색하는 방법인 AgentEvol을 소개합니다. AgentEvol을 사용하면 에이전트가 특정 작업을 기반으로 컨텍스트에 적응적으로 액세스하고 활용하여 발전할 수 있으므로 더 적은 리소스를 사용하면서 최신 모델에 필적하는 결과를 얻을 수 있습니다.

플랫폼, 데이터 세트, 벤치마크, 체크포인트 및 알고리즘 구현을 포함한 AgentGym 제품군은 커뮤니티에서 일반적으로 사용할 수 있는 LLM 기반 에이전트를 빌드하고 평가하는 데 사용할 수 있습니다. 

- github : <https://github.com/WooooDyy/AgentGym>

## AI 요원 크루를 구성해 봅시다

웹을 긁어모으고 자동으로 블로그 게시물을 작성하는 다중 에이전트 시스템!

내가 사용한 것은 다음과 같습니다.

- 다중 에이전트 시스템 구축을 위한 [crewAI](https://www.linkedin.com/company/crewai-inc/) 
- 현지에서 LLM을 제공하는 [Ollama](https://www.linkedin.com/company/ollama/) (Llama-3)
- 개발 및 호스팅을 위한 [Lightning AI](https://www.linkedin.com/company/pytorch-lightning/)

나는이 작품을 Lightning AI ⚡️Studio로 출판했는데, 내 모든 코드 및 환경을 캡슐화하는 블로그처럼 읽힌다!

지금 바로 사용해 보세요: <https://lightning.ai/lightning-ai/studios/let-s-build-a-crew-of-ai-agents?utm_source=akshay>

</details>
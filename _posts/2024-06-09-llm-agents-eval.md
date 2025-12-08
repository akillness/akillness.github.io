---
title: Microsoft's AgentEval seems like a promising tool to assist with this!
description: LLM, AgentEval
categories:
- LLM & Language Models
tags:
- microsoft
- agenteval
- llm
- language-model
date: 2024-06-09 12:00:00 +0800
---
🤔 As a generative AI practitioner, I spend a good chunk of time developing task-specific metrics for various tasks/domains and use-cases. Microsoft's AgentEval seems like a promising tool to assist with this!

> ❗ Traditional evaluation methods focus on generic and end-to-end success metrics, which don't always capture the nuanced performance needed for complex or domain specific tasks. This creates a gap in understanding how well these applications meet user needs and developer requirements.
{: .prompt-info }

### 💡 AgentEval provides a structured approach to evaluate the utility of LLM-powered applications through three key agents:

- 🤖 CriticAgent:
Proposes a list of evaluation criteria based on the task description and pairs of successful and failed solutions.
Example: For math problems, criteria might include efficiency and clarity of the solution.

- 🤖 QuantifierAgent:
Quantifies how well a solution meets each criterion and returns a utility score.
Example: For clarity in math problems, the quantification might range from "not clear" to "very clear."

- 🤖 VerifierAgent:
Ensures the quality and robustness of the assessment criteria, verifying that they are essential, informative, and have high discriminative power.

Turns out that AgentEval demonstrates robustness and effectiveness in two applications: math problem-solving and household tasks and it outperforms traditional methods by providing a comprehensive multi-dimensional assessment.

I want to try this out soon, let me know if you've already used it and have some insights!


![ Microsoft's AgentEval ](/assets/img/llm/LLM_AgentEval.jpeg){: .light .shadow .rounded-10 w='1212' h='668' }


<details markdown="1">
<summary style= "font-size:24px; line-height:24px; font-weight:bold; cursor:pointer;" > Translate to Korean </summary>

🤔 생성형 AI 실무자로서 저는 다양한 작업/도메인 및 사용 사례에 대한 작업별 메트릭을 개발하는 데 많은 시간을 할애합니다. Microsoft의 AgentEval은 이를 지원하는 유망한 도구인 것 같습니다!

>❗ 기존의 평가 방법은 일반 및 엔드 투 엔드 성공 지표에 중점을 두며, 복잡하거나 도메인별 작업에 필요한 미묘한 성능을 항상 포착하지는 못합니다. 이로 인해 이러한 애플리케이션이 사용자 요구 사항과 개발자 요구 사항을 얼마나 잘 충족하는지 이해하는 데 격차가 발생합니다.
{: .prompt-info }

### 💡 AgentEval은 세 가지 주요 에이전트를 통해 LLM 기반 애플리케이션의 유용성을 평가하는 구조화된 접근 방식을 제공합니다.

- 🤖 CriticAgent 크랙:
작업 설명과 성공한 솔루션과 실패한 솔루션 쌍을 기반으로 평가 기준 목록을 제안합니다.
예: 수학 문제의 경우 기준에는 솔루션의 효율성과 명확성이 포함될 수 있습니다.

- 🤖 QuantifierAgent를 사용합니다.
솔루션이 각 기준을 얼마나 잘 충족하는지 수량화하고 유틸리티 점수를 반환합니다.
예: 수학 문제의 명확성을 위해 수량화의 범위는 "명확하지 않음"에서 "매우 명확함"까지일 수 있습니다.

- 🤖 VerifierAgent를 사용합니다.
평가 기준의 품질과 견고성을 보장하여 중요하고 유익하며 높은 판별력을 가지고 있는지 확인합니다.

AgentEval은 수학 문제 해결 및 가사 작업의 두 가지 응용 프로그램에서 견고성과 효율성을 입증했으며 포괄적 인 다차원 평가를 제공하여 기존 방법을 능가합니다.

나는 이것을 곧 시도하고 싶고, 이미 그것을 사용하고 통찰력이 있다면 알려주십시오!

</details>
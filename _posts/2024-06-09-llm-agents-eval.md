---
title: "Microsoft's AgentEval seems like a promising tool to assist with this!"
description: "🤔 As a generative AI practitioner, I spend a good chunk of time developing task-specific metrics for various tasks/domains and use-cases."
categories: [Agent/Orchestration]
tags: [Agent, Workflow, Orchestration]
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

🤔 As a generative AI practitioner, I spend a lot of time developing task-specific metrics for various tasks, domains, and use cases. Microsoft's AgentEval seems to be a promising tool to help with this!

>❗ Existing evaluation methods focus on general and end-to-end success metrics and do not always capture the nuanced performance needed for complex or domain-specific tasks. This creates a gap in understanding how well these applications meet user and developer requirements.
{: .prompt-info }

### 💡 AgentEval provides a structured approach to evaluating the utility of LLM-based applications through three key agents.

- 🤖 CriticAgent:
Proposes a list of evaluation criteria based on the task description and pairs of successful and failed solutions.
Example: For a math problem, the criteria might include the efficiency and clarity of the solution.

- 🤖 QuantifierAgent:
Quantifies how well a solution meets each criterion and returns a utility score.
Example: For clarity in a math problem, the quantification range could be from "not clear" to "very clear".

- 🤖 VerifierAgent:
Ensures the quality and robustness of the evaluation criteria, verifying that they are important, informative, and highly discriminative.

AgentEval has demonstrated robustness and efficiency across two applications — math problem solving and household tasks — outperforming existing methods by providing comprehensive, multi-dimensional evaluation.

I would love to try this soon — if you have already used it and have insights, please let me know!

</details>

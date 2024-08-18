---
title: Agents framework for LLM + AgentGen looks like a nice framework
description: Agent, Transformer
categories: [LLM, Agents]
tags: [Agents, Huggingface]
# author: foDev_jeong
date: 2024-08-14 11:20:00 +0800
# mermaid: true
# render_with_liquid: false
# image:
#   path: /assets/img/llm/LLM_evaluation_rank.jpeg
#   lqip: data:image/webp;base64,UklGRpoAAABXRUJQVlA4WAoAAAAQAAAADwAABwAAQUxQSDIAAAARL0AmbZurmr57yyIiqE8oiG0bejIYEQTgqiDA9vqnsUSI6H+oAERp2HZ65qP/VIAWAFZQOCBCAAAA8AEAnQEqEAAIAAVAfCWkAALp8sF8rgRgAP7o9FDvMCkMde9PK7euH5M1m6VWoDXf2FkP3BqV0ZYbO6NA/VFIAAAA
#   alt: [Rankings of model performance change drastically depending on which LLM is used as the judge on KILT-NQ]
---

# 𝗡𝗲𝘄 𝘃𝗲𝗿𝘀𝗶𝗼𝗻 𝗼𝗳 𝗼𝘂𝗿 𝗔𝗴𝗲𝗻𝘁𝘀 𝗳𝗿𝗮𝗺𝗲𝘄𝗼𝗿𝗸 🙌

Agents 2.0 is out, and it's already the best-performing agent framework using an open model! Top 1 of open models on GAIA, top 4 overall. I'm really proud to have worked on this 😃 

### It's also:
- ✨ 𝗦𝗶𝗺𝗽𝗹𝗲𝗿: prompt, tools, and attributes are accessible
- 🧩 𝗠𝗼𝗱𝘂𝗹𝗮𝗿: use any LLM. Llama-3-70B-Instruct is 🔥
- 💪 𝗣𝗲𝗿𝗳𝗼𝗿𝗺𝗮𝗻𝘁 w/ React Agents

You can access it on Hugging Face Transformers 'main' branch (v4.41.0 lands this week)

> Read the announcement blog post here 👉 <https://huggingface.co/blog/agents>
{: .prompt-info}

If you've never played with Agents, the following guide gets you up to speed as to what's possible with them:
👉 <https://huggingface.co/docs/transformers/main/en/agents>

* * *


# 💡 "Planning" is super important in agentic pipelines as it determines the entire trajectory of the agents. 

![ AgentGen ](/assets/img/llm/agent-gen.jpeg){: .light .w-75 .shadow .rounded-10 w='1212' h='668' }

AgentGen looks like a nice framework that can help automate and simplify this.

> Paper 👉 <https://arxiv.org/abs/2408.00764>
{: .prompt-info}

### ⛳ What is AgentGen?
AgentGen is a framework designed to automate and improve the planning capabilities of LLM-based agents, it automates the generation of diverse environments and planning tasks, allowing for more effective agent training. 

It addresses the limitations of manual environment creation by using automated methods to create a wide variety of scenarios and tasks with varying difficulty levels. 

### ⛳ Key Features:
- 👉 AgentGen uses an inspiration corpus (LIMA dataset) composed of domain-specific text segments to generate a wide range of environment specifications. This approach covers numerous scenarios and domains, enhancing the training landscape for agents.
- 👉 The authors propose Bidirectional Evolution (BI-EVOL) which creates planning tasks with a smooth difficulty curve by evolving tasks in both simpler and more complex directions. This helps facilitate the LLMs' gradual acquisition of planning skills.
- 👉 Uses high-quality trajectory data (sequences of action-observation pairs) to instruction-tune LLMs, improving their decision-making and planning capabilities.

AgentGen-tuned models, such as Llama-3 8B, show significant performance improvements, surpassing models like GPT-3.5 and even outperforming GPT-4 in certain tasks!

---
title: Agents framework for LLM + AgentGen looks like a nice framework
description: Agent, Transformer
categories: [LLM, Agents]
tags: [Agents, HuggingFace]
# author: foDev_jeong
date: 2024-08-14 11:20:00 +0800
mermaid: true
# render_with_liquid: false
# image:
#   path: /assets/img/llm/LLM_evaluation_rank.jpeg
#   lqip: data:image/webp;base64,UklGRpoAAABXRUJQVlA4WAoAAAAQAAAADwAABwAAQUxQSDIAAAARL0AmbZurmr57yyIiqE8oiG0bejIYEQTgqiDA9vqnsUSI6H+oAERp2HZ65qP/VIAWAFZQOCBCAAAA8AEAnQEqEAAIAAVAfCWkAALp8sF8rgRgAP7o9FDvMCkMde9PK7euH5M1m6VWoDXf2FkP3BqV0ZYbO6NA/VFIAAAA
#   alt: [Rankings of model performance change drastically depending on which LLM is used as the judge on KILT-NQ]
---

## Agents 2.0: New Version of Hugging Face Agents Framework

*Curiosity:* How can we build better-performing agent frameworks? What makes Agents 2.0 the best-performing open model framework?

**Agents 2.0** is out and is already the best-performing agent framework using an open model! **Top 1 of open models on GAIA, top 4 overall**.

### Key Features

*Retrieve:* What makes Agents 2.0 special.

| Feature | Description | Benefit |
|:--------|:------------|:--------|
| **✨ Simpler** | Prompt, tools, and attributes are accessible | ⬆️ Easy to use |
| **🧩 Modular** | Use any LLM (Llama-3-70B-Instruct is 🔥) | ⬆️ Flexibility |
| **💪 Performant** | React Agents for better performance | ⬆️ High quality |

> **Resources**:
> - **Blog Post**: <https://huggingface.co/blog/agents>
> - **Guide**: <https://huggingface.co/docs/transformers/main/en/agents>
{: .prompt-info}

**Availability**: Hugging Face Transformers 'main' branch (v4.41.0 lands this week)

## AgentGen: Automating Agent Planning

*Curiosity:* How can we automate and improve planning capabilities in agentic pipelines? What makes planning so important?

**Planning** is super important in agentic pipelines as it determines the entire trajectory of the agents.

![ AgentGen ](/assets/img/llm/agent-gen.jpeg){: .light .w-75 .shadow .rounded-10 w='1212' h='668' }

**AgentGen** is a framework that can help automate and simplify planning.

> **Paper**: <https://arxiv.org/abs/2408.00764>
{: .prompt-info}

### What is AgentGen?

*Retrieve:* Understanding AgentGen.

**Definition**: Framework designed to automate and improve planning capabilities of LLM-based agents.

**Approach**: Automates generation of diverse environments and planning tasks for more effective agent training.

**Problem Solved**: Addresses limitations of manual environment creation by using automated methods to create wide variety of scenarios and tasks with varying difficulty levels.

### Key Features

*Innovate:* AgentGen's innovations.

| Feature | Description | Benefit |
|:--------|:------------|:--------|
| **Inspiration Corpus** | Uses LIMA dataset with domain-specific text segments | ⬆️ Diverse scenarios |
| **Bidirectional Evolution** | Creates planning tasks with smooth difficulty curve | ⬆️ Gradual skill acquisition |
| **Trajectory Data** | Uses action-observation pairs for instruction-tuning | ⬆️ Better decision-making |

**1. Inspiration Corpus**:
- Uses LIMA dataset composed of domain-specific text segments
- Generates wide range of environment specifications
- Covers numerous scenarios and domains
- Enhances training landscape for agents

**2. Bidirectional Evolution (BI-EVOL)**:
- Creates planning tasks with smooth difficulty curve
- Evolves tasks in both simpler and more complex directions
- Facilitates LLMs' gradual acquisition of planning skills

**3. Trajectory Data**:
- Uses high-quality trajectory data (action-observation pairs)
- Instruction-tunes LLMs
- Improves decision-making and planning capabilities

### Performance Results

*Retrieve:* AgentGen achievements.

**Results**: AgentGen-tuned models, such as **Llama-3 8B**, show significant performance improvements:
- ✅ Surpassing GPT-3.5
- ✅ Outperforming GPT-4 in certain tasks

### Key Takeaways

*Retrieve:* Agents 2.0 is the best-performing open model agent framework (top 1 on GAIA), with simpler, modular design and React Agents for performance. AgentGen automates planning capabilities through inspiration corpus, bidirectional evolution, and trajectory data.

*Innovate:* By using Agents 2.0 for building agents and AgentGen for automating planning, you can create high-performing agentic systems that surpass GPT-3.5 and even GPT-4 in certain tasks.

*Curiosity → Retrieve → Innovation:* Start with curiosity about agent frameworks, retrieve insights from Agents 2.0 and AgentGen, and innovate by building agentic systems with automated planning and improved performance.

**Next Steps**:
- Explore Agents 2.0
- Read AgentGen paper
- Build your agents
- Automate planning

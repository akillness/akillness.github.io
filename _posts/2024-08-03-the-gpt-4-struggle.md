---
title: 😮😮 GPT-4, despite being one of the leading LLMs, struggles with long-context bilingual reasoning tasks. Even with text lengths shorter than 2K tokens!!
description: LLM, GPT4
categories: [LLM, GPT4]
tags: [GPT4, LongContext]
# author: foDev_jeong
date: 2024-08-03 11:00:00 +0800
# pin: true
# math: true
# mermaid: true
# image:
#   path: /assets/img/cover/programming.jpeg
#   lqip: data:image/webp;base64,UklGRpoAAABXRUJQVlA4WAoAAAAQAAAADwAABwAAQUxQSDIAAAARL0AmbZurmr57yyIiqE8oiG0bejIYEQTgqiDA9vqnsUSI6H+oAERp2HZ65qP/VIAWAFZQOCBCAAAA8AEAnQEqEAAIAAVAfCWkAALp8sF8rgRgAP7o9FDvMCkMde9PK7euH5M1m6VWoDXf2FkP3BqV0ZYbO6NA/VFIAAAA
#   alt: [2024 programming curriculum by honglab]
---

![ NeedleBench ](/assets/img/llm/needlebench-paper.jpeg){: .light .shadow .rounded-10 w='1212' h='668' }

An interesting benchmark paper evaluated the long-context capabilities of standard LLMs in an English-Chinese setting.

> Link 👉 <https://arxiv.org/pdf/2407.11963>
{: .prompt-info}


💡 NeedleBench is a framework designed to evaluate the long-context capabilities of LLMs, particularly in bilingual settings (English-Chinese). It includes a series of tasks that progressively increase in complexity, spanning multiple length intervals (4k, 8k, 32k, 128k, 200k, 1000k, and beyond) and different depth ranges.

Some features
- ⛳ NeedleBench assesses how well leading open-source models can identify key information and apply it to reasoning within long bilingual texts. The framework - allows strategic insertion of critical data points in different text depth zones to rigorously test models' retrieval and reasoning capabilities.
- ⛳ They propose the ATC (Ancestral Trace Challenge) to simulate complex long-context tasks in real-world scenarios, providing a simple method for evaluating LLMs in complicated long-context situations. 
- ⛳ The paper evaluates mainstream models like GPT-4 Turbo, Claude 3, GLM-4, and others in identifying key question-relevant information and reasoning. Despite recent advancements, these models show significant room for improvement in practical long-context applications.
- ⛳ Experimental results highlight that existing LLMs face challenges in handling complex logical relationships in long-context texts.




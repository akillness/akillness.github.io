---
title: 💡 Accelerating LLMs by 2x with Graph-structured Speculative Decoding.
description: LLM, Graph-Structured Decoding
categories: [LLM, Graph-Structured Decoding]
tags: [Accelerating, Graph-Structured Decoding]
# author: foDev_jeong
date: 2024-08-03 12:00:00 +0800
# pin: true
# math: true
# mermaid: true
# image:
#   path: /assets/img/cover/programming.jpeg
#   lqip: data:image/webp;base64,UklGRpoAAABXRUJQVlA4WAoAAAAQAAAADwAABwAAQUxQSDIAAAARL0AmbZurmr57yyIiqE8oiG0bejIYEQTgqiDA9vqnsUSI6H+oAERp2HZ65qP/VIAWAFZQOCBCAAAA8AEAnQEqEAAIAAVAfCWkAALp8sF8rgRgAP7o9FDvMCkMde9PK7euH5M1m6VWoDXf2FkP3BqV0ZYbO6NA/VFIAAAA
#   alt: [2024 programming curriculum by honglab]
---

![ Accelerating LLMs ](/assets/img/llm/accelerating-llms.jpeg){: .light .shadow .rounded-10 w='1212' h='668' }


> Link 👉 <https://www.llmwatch.com/p/a-historic-week-for-open-source-ai>
{: .prompt-info}


## Researchers have found a way to make speculative decoding up to 2x faster by generating multiple hypotheses and merging them into a directed acyclic graph (DAG).

Speculative decoding is a technique where a smaller "draft" model generates a hypothesis sequence that is then validated by the main large language model (LLM). This can significantly speed up inference.

The key insight is that these hypotheses often share common token sequences.

By using a DAG to manage them, the new method (called Graph-structured Speculative Decoding or GSD) can efficiently predict and merge these recurring sequences.

This drastically reduces the computational cost of the draft model.

When applied to a range of LLMs, including a 70B parameter LLaMA-2 model, GSD achieved speedups of 1.73x to 1.96x compared to standard speculative decoding.




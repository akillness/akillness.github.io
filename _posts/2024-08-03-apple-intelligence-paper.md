---
title: 🍎 Post-training in the Apple Intelligence paper
description: LLM, Apple, OnDevice
categories: [LLM, UseCase]
tags: [LLM, Apple, OnDevice]
# author: foDev_jeong
date: 2024-08-03 22:00:00 +0800
# pin: true
# mermaid: true
# render_with_liquid: false
image:
  path: /assets/img/llm/apple-foundation-models.png
  lqip: data:image/webp;base64,UklGRpoAAABXRUJQVlA4WAoAAAAQAAAADwAABwAAQUxQSDIAAAARL0AmbZurmr57yyIiqE8oiG0bejIYEQTgqiDA9vqnsUSI6H+oAERp2HZ65qP/VIAWAFZQOCBCAAAA8AEAnQEqEAAIAAVAfCWkAALp8sF8rgRgAP7o9FDvMCkMde9PK7euH5M1m6VWoDXf2FkP3BqV0ZYbO6NA/VFIAAAA
  alt: [Overview for the Apple Foundation models]
---

![ Architecture of Apple Intelligence with adapters for the language on-device and server models ](/assets/img/llm/architecture-of-apple-intelligence.png){: .light .shadow .rounded-10 w='1212' h='668' }

# Apple Intelligence Foundation Language Models

> 👉 Paper : <https://arxiv.org/pdf/2407.21075>
{: .prompt-info }

## Two models:
 - On-device: ~3B param with task-specific LoRA adapters
 - Server: ~70B (my estimation), almost no details

## Human-annotated and synthetic data:
 - Mathematics: @WizardLM_AI
- like evol strategy to create diverse problems and solutions
 - Tool use: Focuses on single-tool use cases first, then progresses to multi-tool scenarios
 - Coding: Self-instruct method with rejection sampling and execution-based validation

- Mixture ratio optimization: Treats the combination of different data sources as an optimization problem. It doesn't seem super interesting ¯\_(ツ)_/¯

## Two new algorithms:
 - iTeC (Iterative Teaching Committee): An iterative RLHF framework that combines various preference optimization algorithms, uses a diverse "model committee" for data collection, and scales up distillation to improve models across all sizes.
 - MDLOO (Mirror Descent with Leave-One-Out estimation): An online RLHF algorithm that uses a Leave-One-Out estimator for advantage estimation and Mirror Descent Policy Optimization for policy updates, designed to maximize KL-penalized reward functions.

Apple uses a classic post-training pipeline. 

Some details are surprising, like the size of the code instruction dataset (only 12k samples). 

The RLHF side is the most interesting aspect of the pipeline.



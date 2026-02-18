---
title: "Scaling Monosemanticity by Anthropic (Understanding the Black Box)"
description: "Generative AI based on transformer technology is a non-deterministic computer."
categories: [Review/Trends]
tags: [Trend, Review, Case]
date: 2024-05-27 09:13:00 +0800
---
> Origitnal Article : <https://inblog.ai/jasonlee/%EB%B8%94%EB%9E%99%EB%B0%95%EC%8A%A4-%EC%9D%B4%ED%95%B4%ED%95%98%EA%B8%B0-scaling-monosemanticity-by-anthropic-20662>
{: .prompt-info }

## Introduce

Generative AI based on transformer technology is a non-deterministic computer. Unlike traditional von Neumann machines that rely on commands explicitly programmed by developers, these systems operate “probabilistically”.

As a probabilistic computer, generative AI has the ability to process and understand various unstructured data such as natural language and images. This allows it to acquire and utilize vast knowledge that traditional computers cannot access. 

Based on its vast learned knowledge, a probabilistic computer can perform research and modeling as well as various creative tasks in a 'zero-shot' manner without separate programming. Here, 'zero-shot' refers to an AI's ability to perform a task even without being specifically trained for that task in advance.

However, since such probabilistic computers operate in a literally “probabilistic” manner, interpretability is extremely important. For example, if the output of a probabilistic computer contains harmful content (discrimination, hate, hallucinations, etc.), we need to understand the source of this error to be able to improve the problem.

However, as everyone knows, large language models are trained on massive datasets using unsupervised learning and are now distributed across more than 1 trillion parameters (see LLM fundamentals blog). Due to this complex structure, even though we have essentially built a very intelligent computer, we fall into a 'black box' state where we cannot fully understand how it works.

This 'black box' nature causes various downstream problems including lack of trustworthiness, difficulties in commercial adoption, issues of AI bias and fairness, and increasing regulation driven by societal fear of AI.
This is why interpretability research is extremely important and must be pursued in parallel with improving AI model performance. 

Recently, Anthropic's “Scaling Monosemanticity: Extracting Interpretable Features from Claude 3 Sonnet” has been generating buzz. Anthropic presents a direction for understanding and adjusting large language model behavior using a model called sparse autoencoders.


![ Main Idea Anthropic Paper ](/assets/img/blog/Scaling_LLM_by_Anthropic.png){: .light  .shadow .rounded-10 w='1212' h='668' }

## Opinion

Generative AI is a non-deterministic computer. Unlike traditional von Neumann machines that rely on commands explicitly programmed by developers, these systems operate “probabilistically”.

As a probabilistic computer, generative AI has the ability to process and understand various unstructured data such as natural language and images. This allows it to acquire and utilize vast knowledge that traditional computers cannot access. 

However, since such probabilistic computers operate in a literally “probabilistic” manner, interpretability is extremely important. For example, if the model output contains harmful content (discrimination, hate, hallucinations, etc.), we need to understand the source of this error to be able to improve the problem.

However, as everyone knows, large language models are trained on massive datasets using unsupervised learning and are now distributed across more than 1 trillion parameters. Due to this complex structure, even though we have essentially built a very intelligent computer, we fall into a 'black box' state where we cannot fully understand how it works.

This 'black box' nature causes various downstream problems including lack of trustworthiness, difficulties in commercial adoption, issues of AI bias and fairness, and increasing regulation driven by societal fear of AI.

This is why interpretability research is extremely important and must be pursued in parallel with improving AI model performance. 

Recently, Anthropic's “Scaling Monosemanticity: Extracting Interpretable Features from Claude 3 Sonnet” has been generating buzz. Anthropic presents a direction for understanding and adjusting large language model behavior using a model called sparse autoencoders.

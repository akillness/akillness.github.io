---
title: "How to evaluate LLM Model?"
description: "Curiosity: What insights can we retrieve from this? How does this connect to innovation in the field?"
categories: [LLM/Model & Papers]
tags: [LLM, Model, Paper]
date: 2024-05-18 10:20:00 +0800
mermaid: true
---
## LLM evaluation frameworks & tools every AI/ML engineer should know.

*Curiosity:* What insights can we retrieve from this? How does this connect to innovation in the field?

![ LLM evaluation frameworks ](/assets/img/news/Evaluate_llm_guid.png){: .light .w-75 .shadow .rounded-10 w='1212' h='668' }

LLM evaluation frameworks and tools are important because they provide standardized benchmarks to measure and improve the performance, reliability and fairness of language models. 

Also, it is very important to have metrics in place to evaluate LLMs. These metrics act as scoring mechanisms that assess an LLM’s outputs based on the given criteria. 

Here is my article on evaluating large language models. 👉<https://levelup.gitconnected.com/evaluating-large-language-models-a-developers-guide-ffd21a055feb>


## MMLU-Pro released by TIGER-Lab on Hugging Face, continues these vital efforts by offering a more robust and challenging massive multi-task language understanding dataset! 🎉 😍

*Curiosity:* Evaluating LLMs is both crucial and challenging, especially with existing benchmarks like MMLU reaching saturation. 



> TL;DR: 📊
- 📚 12K complex questions across various disciplines with careful human verification
- 🔢 Augmented to 10 options per question (instead of 4) to reduce random guessing
- 📊 56% of questions from MMLU, 34% from STEM websites, and the rest from TheoremQA, and SciBench
- 🔍 Performance drops without chain-of-thought reasoning, indicating a more challenging benchmark!
{: .prompt-tip }


> Results compared to MMLU
- 📉 GPT-4o drops by 17% (from 0.887 to 0.7149)
- 📉 Mixtral 8x7B drops by 31% (from 0.714 to 0.404)
- 📉 Llama-3-70B drops by 27% (from 0.820 to 0.5541)
{: .prompt-tip }



1. Dataset: <https://huggingface.co/datasets/TIGER-Lab/MMLU-Pro>
2. Leaderboard: <https://huggingface.co/datasets/TIGER-Lab/MMLU-Pro#4-leaderboard>


<details markdown="1">
<summary style= "font-size:24px; line-height:24px; font-weight:bold; cursor:pointer;" > Translate to Korean </summary>

* * * 


## #LLM Evaluation Frameworks and Tools That Every AI/ML Engineer Should Know.

![ LLM evaluation frameworks ](/assets/img/news/Evaluate_llm_guid.png){: .light .w-75 .shadow .rounded-10 w='1212' h='668' }

LLM evaluation frameworks and tools are important because they provide standardized benchmarks for measuring and improving the performance, reliability, and fairness of language models. 

It is also very important to establish metrics for evaluating LLMs. These metrics serve as scoring mechanisms that evaluate the output of LLMs based on given criteria. 

Here is an article on evaluating large language models. 👉<https://levelup.gitconnected.com/evaluating-large-language-models-a-developers-guide-ffd21a055feb>


## MMLU-Pro released by Hugging Face TIGER-Lab continues this important effort by providing a more robust and challenging large-scale multi-task language understanding dataset! 🎉 😍

Evaluating LLMs is both important and challenging, especially when traditional benchmarks like MMLU have reached saturation.

> TL;DR: 📊
- 📚 12K complex questions across diverse fields with careful human verification
- 🔢 Increased to 10 options per question instead of 4 to reduce random guessing.
- 📊 56% of questions came from MMLU, 34% from STEM websites, and the rest from TheoremQA and SciBench.
- 🔍 Performance drops without chain-of-thought reasoning, indicating a harder benchmark!
{: .prompt-tip }

> Comparison Results vs. MMLU
- 📉 GPT-4o drops 17% (0.887 to 0.7149)
- 📉 Mixtral 8x7B drops 31% (0.714 to 0.404)
- 📉 Llama-3-70B drops 27% (0.820 to 0.5541)
{: .prompt-tip }


1. Dataset: <https://huggingface.co/datasets/TIGER-Lab/MMLU-Pro>
2. Leaderboard: <https://huggingface.co/datasets/TIGER-Lab/MMLU-Pro#4-leaderboard>

</details>

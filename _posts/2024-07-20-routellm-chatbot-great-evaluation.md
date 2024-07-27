---
title: 𝗥𝗼𝘂𝘁𝗲 𝘆𝗼𝘂𝗿 𝗾𝘂𝗲𝗿𝘆 𝘁𝗼 𝗮 𝘀𝗺𝗮𝗹𝗹𝗲𝗿 𝗟𝗟𝗠 𝘄𝗵𝗲𝗻 𝗽𝗼𝘀𝘀𝗶𝗯𝗹𝗲
description: Chatbot,RouteLLM
categories: [LLM, RouteLLM]
tags: [Evaluation, RouteLLM]
# author: foDev_jeong
date: 2024-07-20 11:30:00 +0800
# pin: true
# math: true
# mermaid: true
# image:
#   path: /assets/img/cover/programming.jpeg
#   lqip: data:image/webp;base64,UklGRpoAAABXRUJQVlA4WAoAAAAQAAAADwAABwAAQUxQSDIAAAARL0AmbZurmr57yyIiqE8oiG0bejIYEQTgqiDA9vqnsUSI6H+oAERp2HZ65qP/VIAWAFZQOCBCAAAA8AEAnQEqEAAIAAVAfCWkAALp8sF8rgRgAP7o9FDvMCkMde9PK7euH5M1m6VWoDXf2FkP3BqV0ZYbO6NA/VFIAAAA
#   alt: [2024 programming curriculum by honglab]
---


### RouteLLM ⇒ 𝗰𝘂𝘁 𝟱𝟬% 𝗼𝗳 𝗰𝗼𝘀𝘁 ✂️

The LMSys team maintains the ChatbotArena, which is a great evaluation system based on thousands of matches: when a user submits a query, they receive the answers from two hidden models A and B, and vote between the two. This preference data allows them to create an ELO ranking, which is a great indicator of model strength.

The team has found another great usage of this preference data they gathered: train a router to route user queries to the most appropriate model.

The main idea is that 𝙢𝙖𝙣𝙮 𝙦𝙪𝙚𝙧𝙞𝙚𝙨 𝙙𝙤 𝙣𝙤𝙩 𝙧𝙚𝙦𝙪𝙞𝙧𝙚 𝙖 𝙨𝙩𝙧𝙤𝙣𝙜 𝙢𝙤𝙙𝙚𝙡: for instance “summarize this paragraph in 1 sentence” can be solved very well by a small model like Llama-3-8B, which is orders of magnitude cheaper to run than the usual behemoths. If you manage to selectively route all easy queries to the smaller LLM, you can save a lot on the costs with minimal performance reduction (a queries will be poorly answered due to mis-routing)

So the team set on to train a router that given a query, chooses the most appropriate LLM to answer it, between a strong/expensive one and a weak/cheap one.

🛠️ Create a router between GPT-4 (strong model) and Mixtral-8x7B (small model)

🔢 Use preference data from 80k labels
- → Augment this with gold preference data for specific benchmarks
- → Define custom metrics to measure perf gain from routing
- → Test on MT-Bench, GSM8k, and MMLU

💥 Achieve 95% of GPT-4 quality on MT-Bench for over 2x cost reduction

✨ Overhead cost are minimal, even the most expensive routing method introduces an overhead under 0.4% of GPT-4 generation

🧂 Grain of salt: MT-Bench is really the benchmark where this method performs best, and introducing “gold data” from the benchmark probably biased results upwards. So the “95% perf for 2x cost reduction” will not be as impressive in a real setting

> - 𝙍𝙚𝙖𝙙 𝙩𝙝𝙚 𝙥𝙖𝙥𝙚𝙧 𝙝𝙚𝙧𝙚 👉 <https://huggingface.co/papers/2406.18665>
> - 𝘾𝙤𝙙𝙚 𝙧𝙚𝙥𝙤 𝙞𝙨 𝙝𝙚𝙧𝙚 (already 1.7k stars) 👉 <https://github.com/lm-sys/RouteLLM>
{: .prompt-info}

![ Router ](/assets/img/llm/routeLLM.png){: .light .shadow .rounded-10 w='1212' h='668' }

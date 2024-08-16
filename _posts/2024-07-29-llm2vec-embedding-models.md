---
title: 𝐋𝐋𝐌2𝐕𝐞𝐜 - 𝐓𝐫𝐚𝐧𝐬𝐟𝐨𝐫𝐦 𝐋𝐋𝐌𝐬 𝐢𝐧𝐭𝐨 𝐄𝐦𝐛𝐞𝐝𝐝𝐢𝐧𝐠 𝐌𝐨𝐝𝐞𝐥𝐬
description: LLM, LLM2Vec
categories: [LLM, LLM2Vec]
tags: [Paper, LLM2Vec]
# author: foDev_jeong
date: 2024-07-29 13:00:00 +0800
# pin: true
# math: true
# mermaid: true
# image:
#   path: /assets/img/cover/programming.jpeg
#   lqip: data:image/webp;base64,UklGRpoAAABXRUJQVlA4WAoAAAAQAAAADwAABwAAQUxQSDIAAAARL0AmbZurmr57yyIiqE8oiG0bejIYEQTgqiDA9vqnsUSI6H+oAERp2HZ65qP/VIAWAFZQOCBCAAAA8AEAnQEqEAAIAAVAfCWkAALp8sF8rgRgAP7o9FDvMCkMde9PK7euH5M1m6VWoDXf2FkP3BqV0ZYbO6NA/VFIAAAA
#   alt: [2024 programming curriculum by honglab]
---

> LLM2Vec paper 👉 <https://mcgill-nlp.github.io/llm2vec/>
{: .prompt-info}


## Intruction

LLM2Vec, a simple unsupervised approach that can transform any decoder-only LLM into a strong text encoder. 

LLM2Vec consists of three simple steps: 
1. enabling bidirectional attention, 
2. masked next token prediction, and 
3. unsupervised contrastive learning. 

LLM2Vec not only outperforms encoder-only models on word-level tasks but also achieves new SOTA results on the MTEB benchmark. 

To summarize, LLM2Vec shows that without expensive adaptation or synthetic GPT-4 data, LLMs can be transformed into embedding models (universal text encoders)




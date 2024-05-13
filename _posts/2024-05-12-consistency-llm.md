---
title: Consistency Large Language Models
description: LLM, Consistency LLM
categories: [News, ChosistencyLLM]
tags: [LLM, Consistency, Efficient Parallel Decoder]
# author: Maryam Miradi, PhD
date: 2024-05-12 13:27:00 +0800
# mermaid: true
# render_with_liquid: false
# image:
#   path: /assets/img/llm/LLM_evaluation_rank.jpeg
#   lqip: data:image/webp;base64,UklGRpoAAABXRUJQVlA4WAoAAAAQAAAADwAABwAAQUxQSDIAAAARL0AmbZurmr57yyIiqE8oiG0bejIYEQTgqiDA9vqnsUSI6H+oAERp2HZ65qP/VIAWAFZQOCBCAAAA8AEAnQEqEAAIAAVAfCWkAALp8sF8rgRgAP7o9FDvMCkMde9PK7euH5M1m6VWoDXf2FkP3BqV0ZYbO6NA/VFIAAAA
#   alt: [Rankings of model performance change drastically depending on which LLM is used as the judge on KILT-NQ]
---


### Consistency Large Language Models: Efficient Parallel Decoders and 3.4 X Faster ( from [Maryam Miradi, PhD](https://www.linkedin.com/in/maryammiradi/))


Researchers from University of California comes with a revolutionary method for LLMs, CLLMs.


## ⚙️Consistency Large Language Models (CLLMs)

LLMs have been traditionally regarded as sequential decoders, decoding one token after another.

CLLMs are a new family of parallel decoders capable of reducing inference latency by efficiently decoding an -token sequence per inference step. 

### 〰️CLLMs Methodology 

1. Their research shows this process – mimicking human cognitive process of forming complete sentences in mind before articulating word by word – can be effectively learned by simply finetuning pretrained LLMs.

2. Specifically, CLLMs are trained to perform parallel decoding by mapping any randomly initialized -token sequence to the same result yielded by autoregressive (AR) decoding in as few steps as possible.

3. Experiment results show CLLMs obtained using our proposed method are highly effective, showing to improvements in generation speed, in par with or even beter than other fast inference techniques like Medusa2 and Eagle, yet require no additional memory cost to accomodate auxiliary model components at inference time.

### 〰️CLLMs Training

In their proposed method, they use Jacobi trajectories collected from a target model to train the model with a loss that encourages single-step convergence during Jacobi iterations.

1. Jacobi trajectory preparation: 
for each prompt, they sequentially perform Jacobi decoding for every truncation of tokens until the entire response sequence has been generated, which amounts to a concatenation of all consecutive fixed points.

2. Consistency and AR Loss

They jointly optimize two losses for tuning CLLMs, the consistency loss guarantees the prediction of multiple tokens at once and the AR loss prevents the CLLM from deviating from the target LLM so as to maintain generation quality.

### 〰️Testing

They tested CLLMs on conversational challenge, text-to-SQL, Python code completion and math.

Training Cost
The fine-tuning cost of CLLMs is moderate, e.g., passing only around 1M tokens for LLaMA-7B to achieve a speedup.

## 💡Collocations

They observe that CLLMs acquire a crucial linguistic concept through training –collocations: a series of words or terms that co-occur more frequently than one would expect by random chance. 

Language is not solely composed of isolated words but also relies heavily on specific word pairings. 

Examples of collocations are abundant in both natural and coding languages. 

✔️verb + preposition combinations (e.g., ‘’talk to’’, ‘‘remind … of …’’), verb + noun structures (e.g., ‘‘make a decision’’, ‘‘catch a cold’’),

✔️syntactical structures (e.g., ‘‘SELECT … FROM …’’, ‘‘if … else’’ for programming).

🔗Sources link in the Comments 

———————————————

⭆ 𝐅𝐨𝐫 𝐀𝐩𝐩𝐥𝐢𝐞𝐝 𝐀𝐈, 𝐋𝐋𝐌𝐬 𝐚𝐧𝐝 𝐏𝐲𝐭𝐡𝐨𝐧 𝐋𝐢𝐛𝐫𝐚𝐫𝐢𝐞𝐬 𝐣𝐨𝐢𝐧 𝐦𝐲 𝐍𝐞𝐰𝐬𝐥𝐞𝐭𝐭𝐞𝐫: <https://lnkd.in/eJM6an-t>


![ Faster Consistency LLM  ](/assets/img/news/Faster-Consistency-LLM.jpeg){: .light .w-75 .shadow .rounded-10 w='1212' h='668' }
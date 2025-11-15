---
title: 𝗠𝗮𝗿𝗸 𝗭𝘂𝗰𝗸𝗲𝗿𝗯𝗲𝗿𝗴 𝗷𝘂𝘀𝘁 𝗮𝗻𝗻𝗼𝘂𝗻𝗰𝗲𝗱 𝘁𝗵𝗲 𝗚𝗣𝗧-𝟰 𝗸𝗶𝗹𝗹𝗲𝗿, 𝗟𝗹𝗮𝗺𝗮-𝟯.𝟭 💥
description: LLM, Llama3.1
categories: [LLM, Llama3.1]
tags: [Meta, Llama3.1]
# author: foDev_jeong
date: 2024-07-26 10:00:00 +0800
# pin: true
# math: true
mermaid: true
# image:
#   path: /assets/img/cover/programming.jpeg
#   lqip: data:image/webp;base64,UklGRpoAAABXRUJQVlA4WAoAAAAQAAAADwAABwAAQUxQSDIAAAARL0AmbZurmr57yyIiqE8oiG0bejIYEQTgqiDA9vqnsUSI6H+oAERp2HZ65qP/VIAWAFZQOCBCAAAA8AEAnQEqEAAIAAVAfCWkAALp8sF8rgRgAP7o9FDvMCkMde9PK7euH5M1m6VWoDXf2FkP3BqV0ZYbO6NA/VFIAAAA
#   alt: [2024 programming curriculum by honglab]
---



![ Overview of Llama 3.1 ](/assets/img/llm/New-King-Llama-31.jpeg){: .light .shadow .rounded-10 w='1212' h='668' }


> - 👉 Read our announcement blog post: <https://huggingface.co/blog/llama31>
> - 🤗 Model card for the 405B on the Hub: <https://huggingface.co/meta-llama/Meta-Llama-3.1-405B-FP8>
{: .prompt-info}

## Meta's Llama-3.1 

*Curiosity:* Meta's Llama-3.1 patches the 8B and 70B Llama-3 models, already top performers in their weight class, to make them even better + gives us the strongest open-source model ever with the 405B.



## Two main points:

### 🫅 𝗧𝗵𝗲 𝗻𝗲𝘄 𝗸𝗶𝗻𝗴 𝗼𝗳 𝗢𝗦 𝗺𝗼𝗱𝗲𝗹𝘀: 𝗟𝗹𝗮𝗺𝗮-𝟯.𝟭-𝟰𝟬𝟱𝗕 on par or above GPT-4o on many benchmarks. 

If confirmed on further testing, it is officially the first time that an OS model becomes the strongest model overall, on top of all models from anthropic and OpenAI! 

Let me repeat this: 𝘁𝗵𝗲 𝘀𝘁𝗿𝗼𝗻𝗴𝗲𝘀𝘁 𝗟𝗟𝗠 𝗲𝘃𝗲𝗿 𝗰𝗮𝗻 𝗯𝗲 𝗱𝗼𝘄𝗻𝗹𝗼𝗮𝗱𝗲𝗱 𝗳𝗿𝗼𝗺 𝘁𝗵𝗲 𝗛𝘂𝗯.

### 📚 𝗧𝗵𝗲 𝟴𝗕 𝗮𝗻𝗱 𝟳𝟬𝗕 𝗺𝗼𝗱𝗲𝗹𝘀 𝗮𝗿𝗲 𝗲𝘅𝘁𝗲𝗻𝗱𝗲𝗱 𝘁𝗼 𝟭𝟮𝟴𝗸 𝘁𝗼𝗸𝗲𝗻𝘀 𝗰𝗼𝗻𝘁𝗲𝘅𝘁 𝗹𝗲𝗻𝗴𝘁𝗵. 

The previous models were limited to 8k tokens, meaning they could process at max as much text as around 15 pages in a Word doc: this was a terrible blocker anytime you need a bit of memory, like for RAG or agent workflows. 

Well, not anymore! ✅ Now we get a much more comfortable 128k context length for all sizes, which is great for most my agentic use-cases.

Both points above are huge and would be newsworthy, dropping these together in a “3.1” version is crazy! 🤯

## 𝗧𝗲𝗰𝗵𝗻𝗶𝗰𝗮𝗹 𝗶𝗻𝘀𝗶𝗴𝗵𝘁𝘀:

### 🫅 𝗔 𝗻𝗲𝘄 𝟰𝟬𝟱𝗕, 𝗽𝗼𝘀𝘀𝗶𝗯𝗹𝘆 𝘁𝗵𝗲 𝘀𝘁𝗿𝗼𝗻𝗴𝗲𝘀𝘁 𝗟𝗟𝗠 𝗲𝘃𝗲𝗿, with 128k context length, 88.6% on MMLU, a crazy 96.8% on GSM8K.

- ➤ The 405B has a FP8 quantized version. FP8 quantization was only applied to the major linear operators of the model, such as the gate and up and down projections for the FFNs (covering 75% of the inference FLOPs).
- ➤ You still need 8xH100 to run it with full context length.


### 🦣 Improved 8B & 70B models, with a 𝗺𝘂𝗰𝗵 𝗹𝗮𝗿𝗴𝗲𝗿 𝗰𝗼𝗻𝘁𝗲𝘅𝘁 𝘀𝗶𝘇𝗲 𝗼𝗳 𝟭𝟮𝟴𝗸 𝘃𝘀 𝟴𝗸 ⇒ 𝘁𝗵𝗶𝘀 𝗶𝘀 𝗮 𝗴𝗮𝗺𝗲-𝗰𝗵𝗮𝗻𝗴𝗲𝗿 𝗳𝗼𝗿 𝗥𝗔𝗚 𝗮𝗻𝗱 𝗔𝗴𝗲𝗻𝘁𝘀.

- 📚 Pretrained on 15T tokens, a more diverse training dataset than Llama-3 to reinforce multilinguality: English, German, French, Italian, Portuguese, Hindi, Spanish, and Thai.
- 🔓 License: same as Llama-3, and on top of that it allows using the output data from Llama-3.1 for training other models (distillation)
- ✨ One new role for the instruct version: on top of System, User, and Assistant, Ipython lets you write the output of a code tool call! This should work really well with Transformers agents 🎉

Thanks a lot to Meta for this release which will make our lives better! 🤗



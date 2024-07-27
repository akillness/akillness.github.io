---
title: 𝐍𝐞𝐰 𝐝𝐞𝐜𝐨𝐝𝐢𝐧𝐠 𝐭𝐞𝐜𝐡𝐧𝐢𝐪𝐮𝐞 𝐢𝐧 𝐭𝐫𝐚𝐧𝐬𝐟𝐨𝐫𝐦𝐞𝐫𝐬 𝐬𝐢𝐠𝐧𝐢𝐟𝐢𝐜𝐚𝐧𝐭𝐥𝐲 𝐫𝐞𝐝𝐮𝐜𝐞𝐬 𝐡𝐚𝐥𝐥𝐮𝐜𝐢𝐧𝐚𝐭𝐢𝐨𝐧𝐬 👏
description: DoLa, Decoding
categories: [LLM, DoLa]
tags: [DoLa, Decoding]
# author: foDev_jeong
date: 2024-07-16 11:30:00 +0800
pin: true
# math: true
# mermaid: true
# image:
#   path: /assets/img/cover/programming.jpeg
#   lqip: data:image/webp;base64,UklGRpoAAABXRUJQVlA4WAoAAAAQAAAADwAABwAAQUxQSDIAAAARL0AmbZurmr57yyIiqE8oiG0bejIYEQTgqiDA9vqnsUSI6H+oAERp2HZ65qP/VIAWAFZQOCBCAAAA8AEAnQEqEAAIAAVAfCWkAALp8sF8rgRgAP7o9FDvMCkMde9PK7euH5M1m6VWoDXf2FkP3BqV0ZYbO6NA/VFIAAAA
#   alt: [2024 programming curriculum by honglab]
---


### DoLa decoding, which made a conference paper at ICLR '24, has just been merged in Transformers by João Gante and Yung-Sung Chuang.
This new decoding method is simple yet extremely impressive!

Reminder: Decoder LLMs (the GPT kind of LLM, the most common one) generate their outputs one token at a time: at each step, given a current text, they compute, for each token in their vocabulary, a "logit" that should represent the probability that this token is coming next.

Then the decoder either picks the highest logit token (greedy decoding) or samples one with a probability defined by the logits (sampling). The token gets appended to the current text, and the decoder compute logits again, and the cycle continues.

The authors of DoLa wanted to improve that simple method. 

They knew this established fact that transformer LMs encode low-level info (like base syntax) in early layers and more high-level info like knowledge in the later layers.

💡 This gave them their key idea: During decoding, rather than picking the token with the highest logit, 𝘄𝗵𝘆 𝗻𝗼𝘁 𝗽𝗶𝗰𝗸 𝘁𝗵𝗲 𝘁𝗼𝗸𝗲𝗻 𝘄𝗶𝘁𝗵 𝘁𝗵𝗲 𝗺𝗼𝘀𝘁 𝗶𝗺𝗽𝗿𝗲𝘀𝘀𝗶𝘃𝗲 𝗶𝗻𝗰𝗿𝗲𝗮𝘀𝗲 𝗶𝗻 𝗹𝗼𝗴𝗶𝘁 𝗮𝗰𝗿𝗼𝘀𝘀 𝗹𝗮𝘆𝗲𝗿𝘀?

Implementation is actually quite simple: at each step, you get the layer for which the logits diverge most from your final layer, and this chosen layer becomes the premature layer. Then you subtract the logits from the premature layer to your final layer, in order to reward tokens for which the logits progressed most. And this lets you pick your next token.

Their test settings:
- ➤ Test 4 sizes of Llama-1 models (7b to 65B)
- ➤ Benchmarks on multiple choice QA (TruthfulQA, FACTOR) and open-ended QA (TruthfulQA-open-ended, GSM8K)

✨ 𝗥𝗲𝘀𝘂𝗹𝘁𝘀 𝗮𝗿𝗲 𝗲𝘅𝘁𝗿𝗲𝗺𝗲𝗹𝘆 𝗶𝗺𝗽𝗿𝗲𝘀𝘀𝗶𝘃𝗲!
- 🚀 𝟱% - 𝟮𝟬% 𝗯𝗮𝘀𝗲 𝗽𝗼𝗶𝗻𝘁𝘀 𝗶𝗻𝗰𝗿𝗲𝗮𝘀𝗲 𝗮𝗰𝗿𝗼𝘀𝘀 𝘁𝗵𝗲 𝗯𝗲𝗻𝗰𝗵𝗺𝗮𝗿𝗸𝘀
- 🚀 For instance on TruthfulQA / Open-ended, across all model sizes the increase in truthfulness is 14 base points, which is 𝗮𝗿𝗼𝘂𝗻𝗱 𝟰𝟬% 𝗶𝗺𝗽𝗿𝗼𝘃𝗲𝗺𝗲𝗻𝘁 𝗰𝗼𝗺𝗽𝗮𝗿𝗲𝗱 𝘁𝗼 𝘀𝘁𝗮𝗻𝗱𝗮𝗿𝗱 𝗱𝗲𝗰𝗼𝗱𝗶𝗻𝗴!

🤔 Wouldn't decoding take longer because of this added contrasting step?
- 👉 𝗧𝗵𝗲 𝗿𝘂𝗻𝘁𝗶𝗺𝗲 𝗶𝗻𝗰𝗿𝗲𝗮𝘀𝗲 𝗶𝘀 𝗻𝗲𝗴𝗹𝗶𝗴𝗶𝗯𝗹𝗲, 𝟭 𝘁𝗼 𝟴% 𝗼𝗻𝗹𝘆.

The paper has additional insights such as how token confidence evolves across layers for different types of tokens: I recommend to read it!

> 𝙍𝙚𝙖𝙙 𝙞𝙩 𝙝𝙚𝙧𝙚 👉 <https://huggingface.co/papers/2309.03883>
{: .prompt-info}

![ DoLa new Decoding Tech ](/assets/img/llm/DoLa-new-decoding-tech.jpeg){: .light .shadow .rounded-10 w='1212' h='668' }

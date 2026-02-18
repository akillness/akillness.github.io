---
title: "The giant leaps of open-source models for Vision Models"
description: "Curiosity: What insights can we retrieve from this? How does this connect to innovation in the field?"
categories: [Multimodal/Computer Vision]
tags: [Multimodal, Vision, Generative Model]
date: 2024-05-18 11:20:00 +0800
mermaid: true
---
## 𝐕𝐢𝐬𝐢𝐨𝐧 𝐥𝐚𝐧𝐠𝐮𝐚𝐠𝐞 𝐦𝐨𝐝𝐞𝐥𝐬

*Curiosity:* What insights can we retrieve from this? How does this connect to innovation in the field?

*Curiosity:* Andrew Reed built a cool space that shows that OS LLMs are catching up with closed source LLMs in ELO ranking in the Arena (link below).


For vision, the same dynamic is happening: the field is still evolving fast, but soon OS models will be able to match GPT-4o’s vision skills.

I witnessed the Idefics team’s work and their many late nights before their publishing of Idefics-2-8b. Now they just published a paper that summarizes their insights!

𝙃𝙚𝙧𝙚’𝙨 𝙖 𝙨𝙪𝙢𝙢𝙖𝙧𝙮 𝙤𝙛 𝙬𝙝𝙖𝙩 𝙩𝙝𝙚𝙮 𝙛𝙤𝙪𝙣𝙙:

➤ 𝗣𝗲𝗿𝗳𝗼𝗿𝗺𝗮𝗻𝗰𝗲 𝗼𝗳 𝗩𝗟𝗠𝘀 𝗶𝘀 𝗹𝗮𝗿𝗴𝗲𝗹𝘆 𝗱𝗿𝗶𝘃𝗲𝗻 𝗯𝘆 𝗽𝗲𝗿𝗳 𝗼𝗳 𝘁𝗵𝗲𝗶𝗿 𝘁𝗲𝘅𝘁-𝗼𝗻𝗹𝘆 𝗯𝗮𝗰𝗸𝗯𝗼𝗻𝗲𝘀. In ablation studies, replacing the llama-1-7b with Mistral-7b directly brings +7% performance 🤯

➤ 𝗧𝗵𝗲𝘆 𝗰𝗼𝗺𝗽𝗮𝗿𝗲𝗱 𝘁𝘄𝗼 𝗰𝗼𝗺𝗽𝗲𝘁𝗶𝗻𝗴 𝗮𝗿𝗰𝗵𝗶𝘁𝗲𝗰𝘁𝘂𝗿𝗲𝘀:
 - 🔀 𝗖𝗿𝗼𝘀𝘀 𝗮𝘁𝘁𝗲𝗻𝘁𝗶𝗼𝗻 𝗮𝗿𝗰𝗵𝗶𝘁𝗲𝗰𝘁𝘂𝗿𝗲: images are encoded through the vision backbone, and their information is inserted within the text processing at various places
 - 🔢 𝗙𝘂𝗹𝗹𝘆 𝗮𝘂𝘁𝗼𝗿𝗲𝗴𝗿𝗲𝘀𝘀𝗶𝘃𝗲 𝗮𝗿𝗰𝗵𝗶𝘁𝗲𝗰𝘁𝘂𝗿𝗲: the output is directly concatenated to the sequence of text embeddings, and entire sequence passed as input to the LM (cf image)
The comparison's outcome is the following ⇒ 𝗙𝘂𝗹𝗹𝘆 𝗮𝘂𝘁𝗼𝗿𝗲𝗴𝗿𝗲𝘀𝘀𝗶𝘃𝗲 𝗮𝗿𝗰𝗵𝗶𝘁𝗲𝗰𝘁𝘂𝗿𝗲 𝗼𝘂𝘁𝗽𝗲𝗿𝗳𝗼𝗿𝗺𝘀 𝗰𝗿𝗼𝘀𝘀-𝗮𝘁𝘁𝗲𝗻𝘁𝗶𝗼𝗻 𝗮𝗿𝗰𝗵𝗶𝘁𝗲𝗰𝘁𝘂𝗿𝗲 when you fine-tune the whole system using LoRA

➡️ 𝗧𝗵𝗲𝘀𝗲 𝗳𝗶𝗻𝗱𝗶𝗻𝗴𝘀 𝗹𝗲𝗱 𝘁𝗼 𝘀𝗲𝘃𝗲𝗿𝗮𝗹 𝗮𝗿𝗰𝗵𝗶𝘁𝗲𝗰𝘁𝘂𝗿𝗮𝗹 𝗶𝗺𝗽𝗿𝗼𝘃𝗲𝗺𝗲𝗻𝘁 𝗶𝗻 𝗜𝗱𝗲𝗳𝗶𝗰𝘀-𝟮:
➤ Replaced cross-attention architecture with fully autoregressive architecture

➤ Enable treating images with varying aspect ratio

➤ Allow to split an image in 4, to be encoded on 320 vision tokens instead of 64, if you want to increase perf at the cost of more compute

✨ As a result, Idefics-2 reaches state-of-the-art performance for this model size! Now just a few more steps to catch up to GPT-4o!

Congrats for this great release Léo Tronchon Hugo Laurençon Victor Sanh! 👏

👉 𝗥𝗲𝗮𝗱 𝘁𝗵𝗲 𝗜𝗱𝗲𝗳𝗶𝗰𝘀-𝟮 𝗽𝗮𝗽𝗲𝗿: <https://huggingface.co/papers/2405.02246>

🚀 𝗔𝗻𝗱𝗿𝗲𝘄’𝘀 𝘀𝗽𝗮𝗰𝗲 𝘁𝗵𝗮𝘁 𝘀𝗵𝗼𝘄𝘀 𝗢𝗦 𝗺𝗼𝗱𝗲𝗹𝘀 𝗰𝗮𝘁𝗰𝗵𝗶𝗻𝗴 𝘂𝗽 (𝗳𝗼𝗿 𝘁𝗲𝘅𝘁 𝗺𝗼𝗱𝗲𝗹𝘀): <https://huggingface.co/spaces/andrewrreed/closed-vs-open-arena-elo>

⚔️ 𝗖𝗼𝗺𝗽𝗮𝗿𝗲 𝘃𝗶𝘀𝗶𝗼𝗻 𝗺𝗼𝗱𝗲𝗹𝘀 𝗶𝗻 𝘁𝗵𝗲 𝗩𝗶𝘀𝗶𝗼𝗻 𝗮𝗿𝗲𝗻𝗮: <https://huggingface.co/spaces/WildVision/vision-arena>


![ 𝐕𝐢𝐬𝐢𝐨𝐧 𝐥𝐚𝐧𝐠𝐮𝐚𝐠𝐞 𝐦𝐨𝐝𝐞𝐥𝐬 ](/assets/img/news/VisionLanguage_model.jpeg){: .light .w-75 .shadow .rounded-10 w='1212' h='668' }

<details markdown="1">
<summary style= "font-size:24px; line-height:24px; font-weight:bold; cursor:pointer;" > Translate to Korean </summary>

* * * 


## A Giant Leap for Open-Source Models

Andrew Reed built a cool space that shows that OS LLMs are catching up with closed-source LLMs in ELO ranking in the Arena (link below).
For vision, the same dynamic is happening: the field is still evolving fast, but soon OS models will be able to match GPT-4o's vision skills.

I witnessed the Idefics team's work and their many late nights before their publishing of Idefics-2-8b. Now they just published a paper that summarizes their insights!

Here's a summary of what they found:

➤ Performance of VLMs is largely driven by the performance of their text-only backbones. In ablation studies, replacing llama-1-7b with Mistral-7b directly brings +7% performance 🤯

➤ They compared two competing architectures:
 - 🔀 Cross-attention architecture: images are encoded through the vision backbone, and their information is inserted within the text processing at various places.
 - 🔢 Fully autoregressive architecture: the output is directly concatenated to the sequence of text embeddings, and the entire sequence is passed as input to the LM (cf image).
The comparison's outcome is the following ⇒ Fully autoregressive architecture outperforms cross-attention architecture when you fine-tune the whole system using LoRA.

➡️ These findings led to several architectural improvements in Idefics-2:
➤ Replaced cross-attention architecture with fully autoregressive architecture.

➤ Enable treating images with varying aspect ratios.

➤ Allow splitting an image into 4, to be encoded on 320 vision tokens instead of 64, if you want to increase performance at the cost of more compute.


✨ As a result, Idefics-2 reaches state-of-the-art performance for this model size! Now just a few more steps to catch up to GPT-4o!

Congrats for this great release Léo Tronchon Hugo Laurençon Victor Sanh! 👏

👉 Read the Idefics-2 paper: <https://huggingface.co/papers/2405.02246>

🚀 Andrew's space that shows OS models catching up (for text models): <https://huggingface.co/spaces/andrewrreed/closed-vs-open-arena-elo>

⚔️ Compare vision models in the Vision arena: <https://huggingface.co/spaces/WildVision/vision-arena>

</details>

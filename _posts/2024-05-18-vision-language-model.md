---
title: The giant leaps of open-source models for Vision Models
description: Vision Models, ELO, Compare
categories: [Script, Vision Models]
tags: [Vision Models, ELO, Compare]
# author: foDev_jeong
date: 2024-05-18 11:20:00 +0800
# mermaid: true
# render_with_liquid: false
# image:
#   path: /assets/img/llm/LLM_evaluation_rank.jpeg
#   lqip: data:image/webp;base64,UklGRpoAAABXRUJQVlA4WAoAAAAQAAAADwAABwAAQUxQSDIAAAARL0AmbZurmr57yyIiqE8oiG0bejIYEQTgqiDA9vqnsUSI6H+oAERp2HZ65qP/VIAWAFZQOCBCAAAA8AEAnQEqEAAIAAVAfCWkAALp8sF8rgRgAP7o9FDvMCkMde9PK7euH5M1m6VWoDXf2FkP3BqV0ZYbO6NA/VFIAAAA
#   alt: [Rankings of model performance change drastically depending on which LLM is used as the judge on KILT-NQ]
---


## 𝐕𝐢𝐬𝐢𝐨𝐧 𝐥𝐚𝐧𝐠𝐮𝐚𝐠𝐞 𝐦𝐨𝐝𝐞𝐥𝐬

Andrew Reed built a cool space that shows that OS LLMs are catching up with closed source LLMs in ELO ranking in the Arena (link below).
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

* * *


## 오픈 소스 모델의 거대한 도약

Andrew Reed 아레나의 ELO 순위에서 OS LLM이 클로즈드 소스 LLM을 따라잡고 있음을 보여주는 멋진 공간을 구축했습니다(아래 링크).
비전의 경우에도 동일한 역학이 일어나고 있습니다: 이 분야는 여전히 빠르게 진화하고 있지만 곧 OS 모델이 GPT-4o의 비전 기술과 일치할 수 있게 될 것입니다.

나는 Idefics 팀의 작업과 Idefics-2-8b를 출판하기 전에 많은 늦은 밤을 목격했습니다. 이제 그들은 그들의 통찰력을 요약한 논문을 발표했습니다!

그들이 발견한 내용을 요약하면 다음과 같습니다.

➤ VLM의 성능은 주로 텍스트 전용 백본의 성능에 의해 좌우됩니다. 절제 연구에서 llama-1-7b를 Mistral-7b로 직접 대체하면 +7%의 성능을 🤯 얻을 수 있습니다.

➤ 두 가지 경쟁 아키텍처를 비교했습니다.
 - 🔀 크로스 어텐션 아키텍처: 이미지는 비전 백본을 통해 인코딩되고 해당 정보는 다양한 위치에서 텍스트 처리 내에 삽입됩니다.
 - 🔢 완전 자동 회귀 아키텍처: 출력은 텍스트 임베딩 시퀀스에 직접 연결되고 전체 시퀀스는 LM에 입력으로 전달됩니다(cf 이미지).
비교 결과는 다음과 같습니다⇒ 완전 자동 회귀 아키텍처는 LoRA를 사용하여 전체 시스템을 미세 조정할 때 교차 주의 아키텍처보다 성능이 뛰어납니다.

➡️ 이러한 발견은 Idefics-2의 몇 가지 아키텍처 개선으로 이어졌습니다.
➤ cross-attention 아키텍처를 완전 자동 회귀 아키텍처로 대체했습니다.

➤ 다양한 종횡비로 이미지 처리 가능

➤ 더 많은 컴퓨팅 비용으로 성능을 높이려면 이미지를 4개로 분할하여 64개 대신 320개의 비전 토큰으로 인코딩할 수 있습니다.


✨ 결과적으로 Idefics-2는 이 모델 크기에 대해 최첨단 성능에 도달했습니다! 이제 GPT-4o를 따라잡기 위한 몇 단계만 더 거치면 됩니다!

이 멋진 릴리스 Léo Tronchon Hugo Laurençon Victor Sanh 축하합니다! 👏

👉 Idefics-2 논문 읽기: <https://huggingface.co/papers/2405.02246>

🚀 OS 모델이 따라잡는 것을 보여주는 Andrew의 공간 (텍스트 모델의 경우) : <https://huggingface.co/spaces/andrewrreed/closed-vs-open-arena-elo>

⚔️ 비전 분야의 비전 모델 비교: <https://huggingface.co/spaces/WildVision/vision-arena>